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
    const { participant_id, challenge_id, client_id } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Notifying challenge completion: participant=${participant_id}, challenge=${challenge_id}`);

    // Get challenge details
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('title, xp_reward, badge_reward_id, avatar_reward_id')
      .eq('id', challenge_id)
      .single();

    if (challengeError || !challenge) {
      throw new Error('Challenge not found');
    }

    // Get client user_id
    const { data: client, error: clientError } = await supabase
      .from('client_profiles')
      .select('user_id')
      .eq('id', client_id)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    // Build reward message
    let rewardText = `You earned ${challenge.xp_reward} XP`;
    if (challenge.badge_reward_id) {
      rewardText += ' and unlocked a new badge';
    }
    if (challenge.avatar_reward_id) {
      rewardText += ' and a new avatar';
    }
    rewardText += '!';

    // Create in-app notification
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: client.user_id,
        type: 'challenge_completed',
        title: 'Challenge Completed!',
        message: `Congratulations! You completed "${challenge.title}". ${rewardText}`,
        data: { 
          challenge_id, 
          participant_id,
          xp_earned: challenge.xp_reward 
        },
        read: false,
      });

    if (notifError) {
      console.error('Error creating notification:', notifError);
    }

    // Send push notification
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: [client.user_id],
          title: 'Challenge Completed',
          subtitle: challenge.title,
          message: rewardText,
          preferenceKey: 'push_challenges',
          data: { type: 'challenge_completed', challengeId: challenge_id },
        }),
      });
      
      console.log('Push notification sent');
    } catch (pushError) {
      console.error('Push notification failed:', pushError);
    }

    console.log('Challenge completion notification sent successfully');

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in notify-challenge-completed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
