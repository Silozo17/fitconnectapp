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
    const { challenge_id, title, description, target_audience, xp_reward, visibility } = await req.json();

    // Only notify for public, active challenges
    if (visibility !== 'public') {
      console.log('Skipping notifications for non-public challenge');
      return new Response(JSON.stringify({ success: true, notified: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get users to notify based on target audience
    let userIds: string[] = [];

    if (target_audience === 'clients' || target_audience === 'all') {
      const { data: clients } = await supabase
        .from('client_profiles')
        .select('user_id')
        .eq('status', 'active');
      
      if (clients) {
        userIds.push(...clients.map(c => c.user_id));
      }
    }

    if (target_audience === 'coaches' || target_audience === 'all') {
      const { data: coaches } = await supabase
        .from('coach_profiles')
        .select('user_id')
        .eq('status', 'active');
      
      if (coaches) {
        userIds.push(...coaches.map(c => c.user_id));
      }
    }

    // Remove duplicates
    userIds = [...new Set(userIds)];

    console.log(`Checking preferences for ${userIds.length} users about new challenge: ${title}`);

    if (userIds.length === 0) {
      return new Response(JSON.stringify({ success: true, notified: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get notification preferences for all users
    const { data: prefsData } = await supabase
      .from('notification_preferences')
      .select('user_id, push_challenges')
      .in('user_id', userIds);

    // Filter to only users who have push notifications enabled (default is enabled if no pref record)
    const userPrefsMap = new Map(prefsData?.map(p => [p.user_id, p.push_challenges]) || []);
    const enabledUserIds = userIds.filter(userId => {
      const pref = userPrefsMap.get(userId);
      // Default to enabled if no preference exists or if explicitly true
      return pref !== false;
    });

    console.log(`Notifying ${enabledUserIds.length} users (${userIds.length - enabledUserIds.length} disabled) about new challenge: ${title}`);

    if (enabledUserIds.length === 0) {
      return new Response(JSON.stringify({ success: true, notified: 0, skippedDueToPrefs: userIds.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create notifications in batch
    const notifications = enabledUserIds.map(userId => ({
      user_id: userId,
      type: 'new_challenge',
      title: 'New Challenge Available!',
      message: `"${title}" - Earn ${xp_reward} XP! ${description ? description.substring(0, 100) : ''}`,
      data: { challenge_id },
      read: false,
    }));

    // Insert in batches of 100 to avoid payload limits
    const batchSize = 100;
    let totalInserted = 0;

    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      const { error } = await supabase.from('notifications').insert(batch);
      
      if (error) {
        console.error('Error inserting notifications batch:', error);
      } else {
        totalInserted += batch.length;
      }
    }

    console.log(`Successfully created ${totalInserted} notifications`);

    // Send push notifications to all enabled users
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: enabledUserIds,
          title: "New Challenge",
          subtitle: title,
          message: `Earn ${xp_reward} XP!`,
          preferenceKey: "push_challenges",
          data: { type: "new_challenge", challengeId: challenge_id },
        }),
      });
      
      console.log("Push notifications sent for new challenge");
    } catch (pushError) {
      console.error("Push notification failed (non-blocking):", pushError);
    }

    return new Response(JSON.stringify({ success: true, notified: totalInserted }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in notify-new-challenge:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
