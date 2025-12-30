/**
 * Metric explanations library for Progress Explanation Tooltips.
 * Provides user-friendly explanations for various health and fitness metrics.
 */

export interface MetricExplanation {
  title: string;
  description: string;
  goodRange?: string;
  howToImprove?: string;
}

export const metricExplanations = {
  bmi: {
    title: 'Body Mass Index (BMI)',
    description: 'A measure of body fat based on your weight relative to your height. While useful as a general guide, it doesn\'t account for muscle mass.',
    goodRange: '18.5–24.9 is considered a healthy range',
    howToImprove: 'Combine regular exercise with balanced nutrition to maintain a healthy weight.',
  },
  xpLevel: {
    title: 'Experience Level',
    description: 'Your level reflects your consistency and engagement. Every workout, habit, and challenge completed earns XP.',
    howToImprove: 'Log workouts, complete habits daily, and join challenges to level up faster.',
  },
  totalXP: {
    title: 'Total XP',
    description: 'Experience points earned from all your activities. Higher XP means more progress on your fitness journey.',
    howToImprove: 'Stay consistent—daily habits and completed challenges give the most XP.',
  },
  streak: {
    title: 'Habit Streak',
    description: 'The number of consecutive days you\'ve completed this habit. Streaks help build lasting habits.',
    howToImprove: 'Set a daily reminder and complete your habit at the same time each day.',
  },
  leaderboardRank: {
    title: 'Leaderboard Rank',
    description: 'Your position compared to other users in your area. Rankings are based on total XP earned.',
    howToImprove: 'Earn more XP through consistent workouts, habits, and challenges.',
  },
  dailyCalories: {
    title: 'Daily Calories',
    description: 'The total energy from food consumed today. Your target is personalized based on your goals.',
    goodRange: 'Varies based on your goals and activity level',
    howToImprove: 'Track all meals and snacks to stay within your target range.',
  },
  protein: {
    title: 'Protein',
    description: 'Essential for muscle repair and growth. Aim to spread intake across meals for best results.',
    goodRange: '0.8–1g per pound of body weight for active people',
    howToImprove: 'Include a protein source with each meal—meat, fish, eggs, dairy, or legumes.',
  },
  carbs: {
    title: 'Carbohydrates',
    description: 'Your body\'s primary energy source. Choose complex carbs for sustained energy.',
    howToImprove: 'Focus on whole grains, fruits, and vegetables over refined carbs.',
  },
  fat: {
    title: 'Dietary Fat',
    description: 'Important for hormone production and nutrient absorption. Quality matters more than quantity.',
    howToImprove: 'Choose healthy fats from nuts, avocados, olive oil, and fatty fish.',
  },
  steps: {
    title: 'Daily Steps',
    description: 'A simple measure of daily activity. More steps generally means better cardiovascular health.',
    goodRange: '7,000–10,000 steps per day is a good target',
    howToImprove: 'Take short walks throughout the day, use stairs, and park further away.',
  },
  activeMinutes: {
    title: 'Active Minutes',
    description: 'Time spent in moderate to vigorous physical activity. This counts toward your weekly exercise goals.',
    goodRange: '150+ minutes per week of moderate activity recommended',
    howToImprove: 'Add brisk walking, cycling, or any activity that raises your heart rate.',
  },
  sleepHours: {
    title: 'Sleep Duration',
    description: 'Total hours of sleep. Quality sleep is crucial for recovery, muscle growth, and mental clarity.',
    goodRange: '7–9 hours per night for adults',
    howToImprove: 'Keep a consistent sleep schedule and limit screens before bed.',
  },
  heartRate: {
    title: 'Resting Heart Rate',
    description: 'Your heart rate at rest. A lower resting heart rate often indicates better cardiovascular fitness.',
    goodRange: '60–100 bpm is normal, athletes may be lower',
    howToImprove: 'Regular cardio exercise over time will naturally lower your resting heart rate.',
  },
  weight: {
    title: 'Body Weight',
    description: 'Your current weight. Track trends over weeks rather than daily fluctuations.',
    howToImprove: 'Focus on consistent habits—small daily choices add up over time.',
  },
  bodyFat: {
    title: 'Body Fat Percentage',
    description: 'The proportion of your weight that is fat. More useful than weight alone for tracking progress.',
    goodRange: 'Varies by age and sex—typically 10-20% for men, 18-28% for women',
    howToImprove: 'Combine strength training with a moderate calorie deficit for fat loss.',
  },
} as const;

export type MetricKey = keyof typeof metricExplanations;

export function getMetricExplanation(key: MetricKey): MetricExplanation {
  return metricExplanations[key];
}
