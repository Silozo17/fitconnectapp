/**
 * Smart Daily Tip Library
 * Rule-based tips personalized by user profile and activity patterns.
 */

export interface DailyTip {
  id: string;
  category: 'nutrition' | 'training' | 'recovery' | 'motivation' | 'habit';
  title: string;
  body: string;
  whyMatters: string;
  icon: 'utensils' | 'dumbbell' | 'moon' | 'sparkles' | 'target';
}

interface UserContext {
  goals?: string[];
  activityLevel?: string;
  hasActiveStreak?: boolean;
  streakCount?: number;
  hourOfDay?: number;
  dayOfWeek?: number;
  hasWearable?: boolean;
  hasMissedHabitRecently?: boolean;
}

// Tip library organized by category
const tipLibrary: Record<string, DailyTip[]> = {
  nutrition: [
    {
      id: 'protein-timing',
      category: 'nutrition',
      title: 'Protein Timing Matters',
      body: 'Spread your protein across meals rather than loading it all at dinner.',
      whyMatters: 'Your body can only use 25-40g of protein per meal for muscle building. Spacing it out maximizes absorption.',
      icon: 'utensils',
    },
    {
      id: 'hydration-morning',
      category: 'nutrition',
      title: 'Hydrate First Thing',
      body: 'Drink a glass of water within 15 minutes of waking up.',
      whyMatters: 'After 6-8 hours of sleep, your body is dehydrated. Morning hydration boosts energy and metabolism.',
      icon: 'utensils',
    },
    {
      id: 'fiber-fullness',
      category: 'nutrition',
      title: 'Add Fiber to Feel Full',
      body: 'Include vegetables or whole grains with every meal.',
      whyMatters: 'Fiber slows digestion, keeping you satisfied longer and preventing energy crashes.',
      icon: 'utensils',
    },
    {
      id: 'pre-workout-fuel',
      category: 'nutrition',
      title: 'Fuel Your Workout',
      body: 'Eat a light carb-rich snack 30-60 minutes before training.',
      whyMatters: 'Carbs provide immediate energy for better performance and endurance.',
      icon: 'utensils',
    },
    {
      id: 'mindful-eating',
      category: 'nutrition',
      title: 'Slow Down',
      body: 'Take 20 minutes to finish your meal. Put your fork down between bites.',
      whyMatters: 'It takes time for your brain to register fullness. Eating slowly prevents overeating.',
      icon: 'utensils',
    },
  ],
  training: [
    {
      id: 'progressive-overload',
      category: 'training',
      title: 'Add a Little More',
      body: 'Try adding one more rep or small weight increase to your main lifts today.',
      whyMatters: 'Progressive overload is the key to strength gains. Small increments compound over time.',
      icon: 'dumbbell',
    },
    {
      id: 'warmup-importance',
      category: 'training',
      title: "Don't Skip the Warm-Up",
      body: 'Spend 5-10 minutes warming up before your workout.',
      whyMatters: 'A proper warm-up increases blood flow, reduces injury risk, and improves performance.',
      icon: 'dumbbell',
    },
    {
      id: 'compound-focus',
      category: 'training',
      title: 'Prioritize Compound Moves',
      body: 'Start with exercises that work multiple muscle groups.',
      whyMatters: 'Compound exercises burn more calories and build functional strength efficiently.',
      icon: 'dumbbell',
    },
    {
      id: 'rest-between-sets',
      category: 'training',
      title: 'Rest for Results',
      body: 'Take 2-3 minute rests between heavy strength sets.',
      whyMatters: 'Adequate rest lets you maintain intensity. Short rests limit your strength potential.',
      icon: 'dumbbell',
    },
    {
      id: 'form-over-weight',
      category: 'training',
      title: 'Form First',
      body: 'If your form breaks down, lower the weight.',
      whyMatters: 'Perfect form prevents injuries and ensures the target muscles do the work.',
      icon: 'dumbbell',
    },
  ],
  recovery: [
    {
      id: 'sleep-consistency',
      category: 'recovery',
      title: 'Keep a Sleep Schedule',
      body: 'Go to bed and wake up at the same time, even on weekends.',
      whyMatters: 'Consistent sleep timing improves sleep quality more than sleeping longer.',
      icon: 'moon',
    },
    {
      id: 'active-recovery',
      category: 'recovery',
      title: 'Move on Rest Days',
      body: 'Take a light walk or do gentle stretching on your rest days.',
      whyMatters: 'Light movement increases blood flow, speeding up muscle recovery.',
      icon: 'moon',
    },
    {
      id: 'post-workout-window',
      category: 'recovery',
      title: 'Refuel After Training',
      body: 'Eat protein and carbs within 2 hours of your workout.',
      whyMatters: 'This window is when your muscles are primed to absorb nutrients for repair.',
      icon: 'moon',
    },
    {
      id: 'deload-week',
      category: 'recovery',
      title: 'Listen to Your Body',
      body: 'Feeling run down? Consider a lighter training week.',
      whyMatters: 'Planned deload weeks prevent burnout and allow your body to fully adapt.',
      icon: 'moon',
    },
    {
      id: 'stress-recovery',
      category: 'recovery',
      title: 'Stress Affects Recovery',
      body: 'Take 5 minutes today for deep breathing or meditation.',
      whyMatters: 'High stress raises cortisol, which impairs muscle recovery and sleep.',
      icon: 'moon',
    },
  ],
  motivation: [
    {
      id: 'small-wins',
      category: 'motivation',
      title: 'Celebrate Small Wins',
      body: 'Acknowledge every workout completed, no matter how short.',
      whyMatters: 'Recognizing progress builds momentum and reinforces the habit of showing up.',
      icon: 'sparkles',
    },
    {
      id: 'comparison-trap',
      category: 'motivation',
      title: 'Compare to Yesterday',
      body: "Your only competition is who you were last week.",
      whyMatters: 'Comparing to others can demotivate. Focus on your personal progress instead.',
      icon: 'sparkles',
    },
    {
      id: 'visualize-success',
      category: 'motivation',
      title: 'See Yourself Succeeding',
      body: 'Before your workout, visualize completing it successfully.',
      whyMatters: 'Visualization primes your brain for action and boosts confidence.',
      icon: 'sparkles',
    },
    {
      id: 'reward-yourself',
      category: 'motivation',
      title: 'Plan a Reward',
      body: 'Set a small reward for hitting your weekly goals.',
      whyMatters: 'External rewards help build habits until the intrinsic motivation kicks in.',
      icon: 'sparkles',
    },
    {
      id: 'progress-photos',
      category: 'motivation',
      title: 'Take a Progress Photo',
      body: 'The scale lies. Photos show real changes over time.',
      whyMatters: 'Visual progress is often more motivating than numbers on a scale.',
      icon: 'sparkles',
    },
  ],
  habit: [
    {
      id: 'habit-stacking',
      category: 'habit',
      title: 'Stack Your Habits',
      body: 'Attach a new habit to an existing routine.',
      whyMatters: 'Linking habits to established cues makes them automatic faster.',
      icon: 'target',
    },
    {
      id: 'two-minute-rule',
      category: 'habit',
      title: 'Start with Two Minutes',
      body: 'If motivation is low, commit to just 2 minutes.',
      whyMatters: 'Starting is the hardest part. Often, 2 minutes becomes much longer.',
      icon: 'target',
    },
    {
      id: 'environment-design',
      category: 'habit',
      title: 'Design Your Space',
      body: 'Make healthy choices the easy choice. Leave gym clothes visible.',
      whyMatters: 'Environment shapes behavior more than willpower.',
      icon: 'target',
    },
    {
      id: 'streak-power',
      category: 'habit',
      title: 'Protect Your Streak',
      body: "Don't break the chain. Even a minimal effort counts.",
      whyMatters: 'Streaks create momentum. One day off is fine; two starts a new pattern.',
      icon: 'target',
    },
    {
      id: 'identity-shift',
      category: 'habit',
      title: 'Be the Person',
      body: 'Instead of "I want to exercise," try "I am someone who works out."',
      whyMatters: 'Identity-based habits are more resilient than goal-based ones.',
      icon: 'target',
    },
  ],
};

/**
 * Get a personalized daily tip based on user context.
 * Uses a deterministic seed based on the date to show the same tip throughout the day.
 */
export function getDailyTip(context: UserContext = {}): DailyTip {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  // Select category based on context and day
  let preferredCategories: string[] = [];
  
  const hour = context.hourOfDay ?? today.getHours();
  const dayOfWeek = context.dayOfWeek ?? today.getDay();
  
  // Morning: nutrition and motivation
  if (hour >= 5 && hour < 12) {
    preferredCategories = ['nutrition', 'motivation', 'habit'];
  }
  // Afternoon: training focus
  else if (hour >= 12 && hour < 18) {
    preferredCategories = ['training', 'nutrition', 'motivation'];
  }
  // Evening: recovery and habit
  else {
    preferredCategories = ['recovery', 'habit', 'motivation'];
  }
  
  // Weekend: more recovery tips
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    preferredCategories = ['recovery', 'motivation', ...preferredCategories];
  }
  
  // If user has a streak, occasionally reinforce it
  if (context.hasActiveStreak && context.streakCount && context.streakCount > 3) {
    if (seed % 3 === 0) {
      preferredCategories.unshift('habit');
    }
  }
  
  // If user missed a habit recently, motivation boost
  if (context.hasMissedHabitRecently) {
    preferredCategories.unshift('motivation');
  }
  
  // Get unique categories (remove duplicates)
  const categories = [...new Set(preferredCategories)];
  
  // Select category based on seed
  const categoryIndex = seed % categories.length;
  const selectedCategory = categories[categoryIndex];
  
  // Get tips from selected category
  const tips = tipLibrary[selectedCategory] || tipLibrary.motivation;
  
  // Select tip based on seed
  const tipIndex = Math.floor(seed / 10) % tips.length;
  
  return tips[tipIndex];
}

/**
 * Get all tips (for testing/preview)
 */
export function getAllTips(): DailyTip[] {
  return Object.values(tipLibrary).flat();
}
