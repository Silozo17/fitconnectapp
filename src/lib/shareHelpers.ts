import type { ShareOptions } from './share.web';
import type { ShareableAchievement } from '@/components/gamification/ShareAchievementButton';
import type { Challenge } from '@/hooks/useChallenges';

/**
 * Generate share options for sharing the app
 */
export const getAppShareOptions = (): ShareOptions => ({
  title: 'FitConnect - Find Your Perfect Coach',
  text: "I'm using FitConnect to reach my fitness goals! Join me and find your perfect coach.",
  url: window.location.origin,
});

/**
 * Generate share options for sharing a coach profile
 */
export const getCoachShareOptions = (coach: { 
  display_name?: string | null; 
  bio?: string | null; 
  id: string;
}): ShareOptions => {
  const name = coach.display_name || 'Coach';
  return {
    title: `${name} - Coach on FitConnect`,
    text: coach.bio || `Check out ${name}'s coaching profile on FitConnect!`,
    url: `${window.location.origin}/coach/${coach.id}`,
  };
};

/**
 * Generate share options for sharing a challenge
 */
export const getChallengeShareOptions = (challenge: Pick<Challenge, 'id' | 'title' | 'description'>): ShareOptions => ({
  title: `FitConnect Challenge: ${challenge.title}`,
  text: challenge.description || `Join me in the "${challenge.title}" challenge on FitConnect!`,
  url: `${window.location.origin}/challenges/${challenge.id}`,
});

/**
 * Generate share text for achievements based on type
 */
const getAchievementShareText = (achievement: ShareableAchievement): string => {
  switch (achievement.type) {
    case 'badge':
      return `🏆 I just earned the "${achievement.title}" badge on FitConnect! ${achievement.description}`;
    case 'level':
      return `🎯 I reached Level ${achievement.value} on FitConnect! ${achievement.description}`;
    case 'challenge':
      return `💪 I completed the "${achievement.title}" challenge on FitConnect! ${achievement.description}`;
    case 'rank':
      return `🥇 I'm now ranked #${achievement.value} on FitConnect! ${achievement.description}`;
    default:
      return `🎉 Achievement unlocked on FitConnect: ${achievement.title}! ${achievement.description}`;
  }
};

/**
 * Generate share options for sharing an achievement
 */
export const getAchievementShareOptions = (achievement: ShareableAchievement): ShareOptions => ({
  title: `FitConnect Achievement: ${achievement.title}`,
  text: getAchievementShareText(achievement),
  url: window.location.origin,
});
