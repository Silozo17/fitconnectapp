import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Motivational messages pool
const MOTIVATIONAL_MESSAGES = [
  { title: "🌅 Rise and Shine!", message: "Every champion was once a beginner. Let's crush today's workout!" },
  { title: "💪 You've Got This!", message: "Success is the sum of small efforts repeated daily. Keep pushing!" },
  { title: "🔥 Stay Focused!", message: "The only bad workout is the one that didn't happen. Make it count!" },
  { title: "⚡ Energy Boost!", message: "Your body can stand almost anything. It's your mind you have to convince." },
  { title: "🎯 Stay on Track!", message: "Discipline is doing what needs to be done, even when you don't want to." },
  { title: "🏆 Champion Mindset!", message: "Winners are not people who never fail, but people who never quit." },
  { title: "🌟 Believe in Yourself!", message: "You are stronger than you think. Every rep brings you closer to your goals." },
  { title: "🚀 Push Your Limits!", message: "Comfort zones are where dreams go to die. Challenge yourself today!" },
  { title: "💯 Give It Your All!", message: "Don't count the days, make the days count. Today is your day!" },
  { title: "🎉 Celebrate Progress!", message: "Every step forward is a step toward your goals. You're doing amazing!" },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Sending daily motivation notifications');

    // Get all active clients who have motivation notifications enabled
    const { data: clients, error: clientsError } = await supabase
      .from('client_profiles')
      .select('user_id')
      .or('status.is.null,status.eq.active');

    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
      throw clientsError;
    }

    if (!clients || clients.length === 0) {
      console.log('No active clients found');
      return new Response(JSON.stringify({ success: true, notified: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userIds = clients.map((c: any) => c.user_id);

    // Pick a random motivational message
    const randomMessage = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];

    // Create in-app notifications
    const notifications = userIds.map((userId: string) => ({
      user_id: userId,
      type: 'daily_motivation',
      title: randomMessage.title,
      message: randomMessage.message,
      data: { date: new Date().toISOString().split('T')[0] },
      read: false,
    }));

    // Insert in batches
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
          title: randomMessage.title,
          message: randomMessage.message,
          preferenceKey: 'push_motivation',
          data: { type: 'daily_motivation' },
        }),
      });
      
      console.log('Push notifications sent for daily motivation');
    } catch (pushError) {
      console.error('Push notification failed:', pushError);
    }

    console.log(`Sent daily motivation to ${totalInserted} users`);

    return new Response(JSON.stringify({ success: true, notified: totalInserted }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-daily-motivation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
