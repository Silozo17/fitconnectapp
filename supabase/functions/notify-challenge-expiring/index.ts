import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find challenges ending in the next 24 hours
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    console.log(`Checking for challenges expiring between now and ${in24Hours.toISOString()}`);

    // Get active challenge participants for challenges ending soon
    const { data: expiringChallenges, error } = await supabase
      .from('challenges')
      .select(`
        id,
        title,
        end_date,
        xp_reward,
        challenge_participants!inner(
          id,
          client_id,
          status,
          current_progress
        )
      `)
      .eq('is_active', true)
      .gte('end_date', now.toISOString())
      .lte('end_date', in24Hours.toISOString());

    if (error) {
      console.error('Error fetching expiring challenges:', error);
      throw error;
    }

    if (!expiringChallenges || expiringChallenges.length === 0) {
      console.log('No challenges expiring soon');
      return new Response(JSON.stringify({ success: true, notified: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let totalNotified = 0;

    for (const challenge of expiringChallenges) {
      const activeParticipants = challenge.challenge_participants.filter(
        (p: any) => p.status === 'active'
      );

      if (activeParticipants.length === 0) continue;

      // Get user_ids from client profiles
      const clientIds = activeParticipants.map((p: any) => p.client_id);
      
      const { data: clients } = await supabase
        .from('client_profiles')
        .select('user_id')
        .in('id', clientIds);

      if (!clients || clients.length === 0) continue;

      const userIds = clients.map((c: any) => c.user_id);

      // Create in-app notifications
      const notifications = userIds.map((userId: string) => ({
        user_id: userId,
        type: 'challenge_expiring',
        title: 'Challenge Ending Soon!',
        message: `"${challenge.title}" ends in less than 24 hours! Complete it to earn ${challenge.xp_reward} XP.`,
        data: { challenge_id: challenge.id },
        read: false,
      }));

      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) {
        console.error('Error inserting notifications:', insertError);
        continue;
      }

      // Send push notifications
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userIds,
            title: 'Challenge Ending Soon',
            subtitle: challenge.title,
            message: `Complete it to earn ${challenge.xp_reward} XP!`,
            preferenceKey: 'push_challenges',
            data: { type: 'challenge_expiring', challengeId: challenge.id },
          }),
        });
      } catch (pushError) {
        console.error('Push notification failed:', pushError);
      }

      totalNotified += userIds.length;
    }

    console.log(`Notified ${totalNotified} users about expiring challenges`);

    return new Response(JSON.stringify({ success: true, notified: totalNotified }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in notify-challenge-expiring:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
