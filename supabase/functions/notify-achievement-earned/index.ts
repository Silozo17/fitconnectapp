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
    const { client_badge_id, client_id, badge_id } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Notifying achievement earned: client=${client_id}, badge=${badge_id}`);

    // Get badge details
    const { data: badge, error: badgeError } = await supabase
      .from('badges')
      .select('name, description, xp_reward, rarity, icon')
      .eq('id', badge_id)
      .single();

    if (badgeError || !badge) {
      throw new Error('Badge not found');
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

    // Create in-app notification
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: client.user_id,
        type: 'achievement_earned',
        title: 'Achievement Unlocked!',
        message: `You earned the "${badge.name}" badge! ${badge.description}`,
        data: { 
          badge_id,
          client_badge_id,
          xp_earned: badge.xp_reward,
          rarity: badge.rarity,
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
          title: 'Achievement Unlocked',
          subtitle: badge.name,
          message: `${badge.description}. +${badge.xp_reward} XP`,
          preferenceKey: 'push_achievements',
          data: { type: 'achievement_earned', badgeId: badge_id },
        }),
      });
      
      console.log('Push notification sent');
    } catch (pushError) {
      console.error('Push notification failed:', pushError);
    }

    console.log('Achievement notification sent successfully');

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in notify-achievement-earned:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
