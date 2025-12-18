import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getPasswordHashPrefix } from '@/utils/passwordValidation';

export function usePasswordBreachCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [isBreached, setIsBreached] = useState<boolean | null>(null);

  const checkPassword = useCallback(async (password: string): Promise<boolean> => {
    if (!password || password.length < 8) {
      setIsBreached(null);
      return false;
    }

    setIsChecking(true);
    try {
      const { prefix, suffix } = await getPasswordHashPrefix(password);
      
      const { data, error } = await supabase.functions.invoke('check-password-breach', {
        body: { hashPrefix: prefix, hashSuffix: suffix }
      });

      if (error) {
        console.error('Breach check error:', error);
        setIsBreached(false);
        return false;
      }

      const breached = data?.breached || false;
      setIsBreached(breached);
      return breached;
    } catch (error) {
      console.error('Failed to check password breach:', error);
      setIsBreached(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsBreached(null);
    setIsChecking(false);
  }, []);

  return { checkPassword, isChecking, isBreached, reset };
}
