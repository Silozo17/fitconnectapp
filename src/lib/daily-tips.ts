/**
 * Smart Daily Tip Library
 * Rule-based tips personalized by user profile and activity patterns.
 * Tracks shown tips to avoid repetition.
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

// Storage key for tracking shown tips
const SHOWN_TIPS_KEY = 'shown-daily-tips';
const MAX_SHOWN_TIPS = 30; // Remember last 30 tips

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
    {
      id: 'post-workout-protein',
      category: 'nutrition',
      title: 'Post-Workout Protein',
      body: 'Consume 20-40g of protein within 2 hours after training.',
      whyMatters: 'This window is when your muscles are most receptive to protein for repair and growth.',
      icon: 'utensils',
    },
    {
      id: 'creatine-daily',
      category: 'nutrition',
      title: 'Creatine Consistency',
      body: 'Take creatine daily at any time. Loading phases are optional.',
      whyMatters: '3-5g daily saturates muscles within 3-4 weeks. Timing matters less than consistency.',
      icon: 'utensils',
    },
    {
      id: 'caffeine-timing',
      category: 'nutrition',
      title: 'Caffeine Strategy',
      body: 'Have coffee 30-60 minutes before your workout, not immediately before.',
      whyMatters: 'Caffeine peaks in your blood after 30-60 minutes, maximizing performance benefits.',
      icon: 'utensils',
    },
    {
      id: 'electrolytes',
      category: 'nutrition',
      title: 'Electrolyte Balance',
      body: 'Add salt to your pre-workout meal on heavy training days.',
      whyMatters: 'Sodium helps maintain hydration and muscle function during intense exercise.',
      icon: 'utensils',
    },
    {
      id: 'meal-prep',
      category: 'nutrition',
      title: 'Prep for Success',
      body: 'Spend 1-2 hours on Sunday preparing meals for the week.',
      whyMatters: 'Having healthy meals ready reduces the temptation to eat out or skip meals.',
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
    {
      id: 'mind-muscle',
      category: 'training',
      title: 'Mind-Muscle Connection',
      body: 'Focus on feeling the target muscle work during each rep.',
      whyMatters: 'Conscious muscle engagement increases activation and accelerates growth.',
      icon: 'dumbbell',
    },
    {
      id: 'tempo-control',
      category: 'training',
      title: 'Control the Tempo',
      body: 'Lower the weight slowly (3 seconds) and lift explosively.',
      whyMatters: 'Time under tension during the eccentric phase stimulates more muscle growth.',
      icon: 'dumbbell',
    },
    {
      id: 'train-weaknesses',
      category: 'training',
      title: 'Train Your Weaknesses',
      body: 'Prioritize exercises you like least at the start of your workout.',
      whyMatters: 'Weak points often become strong once you give them proper attention.',
      icon: 'dumbbell',
    },
    {
      id: 'full-rom',
      category: 'training',
      title: 'Full Range of Motion',
      body: 'Use the complete range of motion for each exercise.',
      whyMatters: 'Full ROM builds more muscle and maintains flexibility.',
      icon: 'dumbbell',
    },
    {
      id: 'track-workouts',
      category: 'training',
      title: 'Log Your Lifts',
      body: 'Record every set, rep, and weight in your training log.',
      whyMatters: 'What gets measured gets managed. Tracking ensures progressive overload.',
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
    {
      id: 'cold-exposure',
      category: 'recovery',
      title: 'Cold Water Benefits',
      body: 'End your shower with 30 seconds of cold water.',
      whyMatters: 'Cold exposure reduces inflammation and may improve recovery speed.',
      icon: 'moon',
    },
    {
      id: 'foam-rolling',
      category: 'recovery',
      title: 'Roll It Out',
      body: 'Spend 5 minutes foam rolling tight muscles before bed.',
      whyMatters: 'Foam rolling releases muscle tension and improves blood flow for recovery.',
      icon: 'moon',
    },
    {
      id: 'sleep-environment',
      category: 'recovery',
      title: 'Optimize Your Bedroom',
      body: 'Keep your room cool (18-20°C), dark, and phone-free.',
      whyMatters: 'Sleep environment dramatically impacts sleep quality and recovery.',
      icon: 'moon',
    },
    {
      id: 'protein-before-bed',
      category: 'recovery',
      title: 'Casein Before Bed',
      body: 'Have cottage cheese or casein protein before sleep.',
      whyMatters: 'Slow-digesting protein feeds muscles throughout the night.',
      icon: 'moon',
    },
    {
      id: 'rest-day-nutrition',
      category: 'recovery',
      title: 'Eat on Rest Days Too',
      body: "Don't cut calories dramatically on rest days.",
      whyMatters: 'Your body repairs and builds muscle on rest days—it needs fuel.',
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
    {
      id: 'gym-playlist',
      category: 'motivation',
      title: 'Update Your Playlist',
      body: 'Add new songs that pump you up for training.',
      whyMatters: 'Music can boost performance by 15% and make tough workouts feel easier.',
      icon: 'sparkles',
    },
    {
      id: 'workout-buddy',
      category: 'motivation',
      title: 'Find a Training Partner',
      body: 'Schedule a workout with a friend this week.',
      whyMatters: 'Accountability partners increase workout consistency by up to 95%.',
      icon: 'sparkles',
    },
    {
      id: 'no-zero-days',
      category: 'motivation',
      title: 'No Zero Days',
      body: 'Do something active every single day, even if tiny.',
      whyMatters: 'Consistency beats intensity. Small actions maintain momentum.',
      icon: 'sparkles',
    },
    {
      id: 'embrace-hard',
      category: 'motivation',
      title: 'Embrace the Hard',
      body: 'The workout you dread most is probably the one you need most.',
      whyMatters: 'Growth happens at the edge of your comfort zone.',
      icon: 'sparkles',
    },
    {
      id: 'long-game',
      category: 'motivation',
      title: 'Play the Long Game',
      body: 'Think in months and years, not days and weeks.',
      whyMatters: 'Sustainable progress requires patience. Trust the process.',
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
    {
      id: 'pack-bag-night',
      category: 'habit',
      title: 'Pack Your Bag Tonight',
      body: 'Prepare your gym bag the night before.',
      whyMatters: 'Removing morning friction increases the chance you\'ll actually go.',
      icon: 'target',
    },
    {
      id: 'morning-workout',
      category: 'habit',
      title: 'Train in the Morning',
      body: 'Consider shifting your workout to before work or school.',
      whyMatters: 'Morning exercisers are more consistent—fewer excuses accumulate.',
      icon: 'target',
    },
    {
      id: 'habit-tracking',
      category: 'habit',
      title: 'Check the Box',
      body: 'Use your habit tracker daily—don\'t let it slip.',
      whyMatters: 'The act of tracking reinforces the behavior you want to build.',
      icon: 'target',
    },
    {
      id: 'social-commitment',
      category: 'habit',
      title: 'Tell Someone',
      body: 'Share your fitness goal with a friend or family member.',
      whyMatters: 'Public commitment increases follow-through and accountability.',
      icon: 'target',
    },
    {
      id: 'implementation-intention',
      category: 'habit',
      title: 'Be Specific',
      body: 'Plan exactly when, where, and what you\'ll do for exercise.',
      whyMatters: '"I\'ll work out at 7am at the gym" beats "I\'ll exercise more."',
      icon: 'target',
    },
  ],
};

/**
 * Get previously shown tip IDs from localStorage
 */
function getShownTips(): string[] {
  try {
    const stored = localStorage.getItem(SHOWN_TIPS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Mark a tip as shown
 */
function markTipAsShown(tipId: string): void {
  try {
    const shown = getShownTips();
    if (!shown.includes(tipId)) {
      const updated = [tipId, ...shown].slice(0, MAX_SHOWN_TIPS);
      localStorage.setItem(SHOWN_TIPS_KEY, JSON.stringify(updated));
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get a personalized daily tip based on user context.
 * Uses a deterministic seed based on the date to show the same tip throughout the day.
 * Tracks shown tips to avoid repetition within the last 30 tips.
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
  
  // Get all tips from preferred categories
  const allTips: DailyTip[] = [];
  for (const cat of categories) {
    const categoryTips = tipLibrary[cat] || [];
    allTips.push(...categoryTips);
  }
  
  // Get shown tips to filter out
  const shownTips = getShownTips();
  
  // Filter out recently shown tips
  const availableTips = allTips.filter(t => !shownTips.includes(t.id));
  
  // If all tips have been shown, reset and use all
  const tipsToChooseFrom = availableTips.length > 0 ? availableTips : allTips;
  
  // Select tip based on seed
  const tipIndex = seed % tipsToChooseFrom.length;
  const selectedTip = tipsToChooseFrom[tipIndex];
  
  // Mark as shown
  markTipAsShown(selectedTip.id);
  
  return selectedTip;
}

/**
 * Get all tips (for testing/preview)
 */
export function getAllTips(): DailyTip[] {
  return Object.values(tipLibrary).flat();
}

/**
 * Clear shown tips history (for testing)
 */
export function clearShownTips(): void {
  try {
    localStorage.removeItem(SHOWN_TIPS_KEY);
  } catch {
    // Ignore
  }
}
