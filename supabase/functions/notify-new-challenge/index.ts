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

    console.log(`Notifying ${userIds.length} users about new challenge: ${title}`);

    if (userIds.length === 0) {
      return new Response(JSON.stringify({ success: true, notified: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create notifications in batch
    const notifications = userIds.map(userId => ({
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
