import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GymOnboardingData {
  // Step 1: Account
  ownerName: string;
  email: string;
  phone: string;
  password: string;
  
  // Step 2: Gym Basics
  gymName: string;
  website: string;
  businessTypes: string[];
  country: string;
  currency: string;
  description: string;
  
  // Step 3: Locations
  locationType: 'single' | 'multiple';
  locations: GymLocationData[];
  
  // Step 4: Services
  services: string[];
  serviceSettings: {
    averageClassSize?: number;
    weeklyRepeat?: boolean;
    trainerCount?: number;
  };
  
  // Step 5: Team
  addStaffNow: boolean;
  staffInvites: StaffInvite[];
  
  // Step 6: Memberships
  membershipTypes: string[];
  
  // Step 7: Payments
  stripeConnected: boolean;
  stripeAccountId: string;
  vatRegistered: boolean;
  vatNumber: string;
  
  // Step 8: Branding
  logoUrl: string;
  brandColor: string;
  coverImageUrl: string;
}

export interface GymLocationData {
  id?: string;
  name: string;
  address: string;
  postcode: string;
  phone: string;
  email: string;
  accessType: 'members_only' | 'public';
  timezone: string;
  isPrimary: boolean;
  lat?: number;
  lng?: number;
  city?: string;
  country?: string;
}

export interface StaffInvite {
  name: string;
  email: string;
  role: string;
  locationIds: string[];
}

const TOTAL_STEPS = 8;

const initialData: GymOnboardingData = {
  ownerName: '',
  email: '',
  phone: '',
  password: '',
  gymName: '',
  website: '',
  businessTypes: [],
  country: 'United Kingdom',
  currency: 'GBP',
  description: '',
  locationType: 'single',
  locations: [{
    name: '',
    address: '',
    postcode: '',
    phone: '',
    email: '',
    accessType: 'members_only',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    isPrimary: true,
  }],
  services: [],
  serviceSettings: {},
  addStaffNow: false,
  staffInvites: [],
  membershipTypes: [],
  stripeConnected: false,
  stripeAccountId: '',
  vatRegistered: false,
  vatNumber: '',
  logoUrl: '',
  brandColor: '',
  coverImageUrl: '',
};

export function useGymOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<GymOnboardingData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [gymId, setGymId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Load saved progress on mount - skip to step 2 if user is already logged in
  useEffect(() => {
    const loadProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Pre-fill data from user info
        const phone = sessionStorage.getItem('gym_onboarding_phone');
        if (phone) {
          setData(prev => ({ ...prev, phone }));
          sessionStorage.removeItem('gym_onboarding_phone');
        }
        
        // Check if they have an existing gym profile with onboarding in progress
        const { data: gym } = await supabase
          .from('gym_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (gym) {
          const gymData = gym as any;
          if (!gymData.onboarding_completed && gymData.onboarding_progress) {
            const progress = gymData.onboarding_progress as { step?: number; data?: Partial<GymOnboardingData> };
            setGymId(gym.id);
            if (progress.step !== undefined) setCurrentStep(progress.step);
            if (progress.data) setData(prev => ({ ...prev, ...progress.data }));
          }
        } else {
          // User is logged in but has no gym - fetch user info for the owner name
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('first_name, last_name')
            .eq('user_id', user.id)
            .single();
          
          if (userProfile) {
            const ownerName = [userProfile.first_name, userProfile.last_name].filter(Boolean).join(' ');
            setData(prev => ({ 
              ...prev, 
              ownerName: ownerName || prev.ownerName,
              email: user.email || prev.email,
            }));
          }
          // Stay at step 0 (Gym Basics) - no need to skip since Step 1 is removed
        }
      }
    };
    loadProgress();
  }, []);

  // Autosave progress
  const saveProgress = useCallback(async (step: number, newData: Partial<GymOnboardingData>) => {
    if (!gymId) return;
    
    try {
      await (supabase as any)
        .from('gym_profiles')
        .update({
          onboarding_progress: { step, data: { ...data, ...newData } } as unknown,
          updated_at: new Date().toISOString(),
        })
        .eq('id', gymId);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [gymId, data]);

  const updateData = useCallback((updates: Partial<GymOnboardingData>) => {
    setData(prev => {
      const newData = { ...prev, ...updates };
      // Debounced autosave
      if (gymId) {
        saveProgress(currentStep, newData);
      }
      return newData;
    });
  }, [gymId, currentStep, saveProgress]);

  const nextStep = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      saveProgress(next, data);
    }
  }, [currentStep, data, saveProgress]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < TOTAL_STEPS) {
      setCurrentStep(step);
    }
  }, []);

  // Step 1: Create account
  const createAccount = useCallback(async () => {
    setIsLoading(true);
    try {
      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: data.ownerName,
            phone: data.phone,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create account');

      setUserId(authData.user.id);

      // Create minimal gym profile
      const { data: gymData, error: gymError } = await (supabase as any)
        .from('gym_profiles')
        .insert({
          user_id: authData.user.id,
          name: 'My Gym', // Temporary, updated in step 2
          slug: `gym-${Date.now()}`, // Temporary slug
          owner_name: data.ownerName,
          owner_phone: data.phone,
          onboarding_completed: false,
          onboarding_progress: { step: 1, data } as unknown,
        })
        .select('id')
        .single();

      if (gymError) throw gymError;
      setGymId(gymData.id);
      
      toast.success('Account created successfully!');
      nextStep();
    } catch (error: any) {
      console.error('Account creation error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  }, [data, nextStep]);

  // Normalize website URL - add https:// if missing
  const normalizeWebsite = (url: string): string => {
    if (!url.trim()) return '';
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  };

  // Step 1: Save gym basics (now the first step)
  const saveGymBasics = useCallback(async () => {
    setIsLoading(true);
    try {
      // Generate unique slug from gym name
      const baseSlug = data.gymName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const slug = `${baseSlug}-${Date.now().toString(36)}`;
      const normalizedWebsite = normalizeWebsite(data.website);

      let currentGymId = gymId;

      // Create gym profile if it doesn't exist
      if (!currentGymId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('Please log in to continue');
          setIsLoading(false);
          return;
        }

        const { data: gymData, error: createError } = await (supabase as any)
          .from('gym_profiles')
          .insert({
            user_id: user.id,
            name: data.gymName,
            slug,
            website: normalizedWebsite || null,
            business_types: data.businessTypes,
            country: data.country,
            currency: data.currency,
            description: data.description || null,
            owner_name: data.ownerName,
            owner_phone: data.phone,
            onboarding_completed: false,
            onboarding_progress: { step: 1, data } as unknown,
          })
          .select('id')
          .single();

        if (createError) throw createError;
        currentGymId = gymData.id;
        setGymId(currentGymId);
      } else {
        // Update existing gym
        const { error } = await (supabase as any)
          .from('gym_profiles')
          .update({
            name: data.gymName,
            slug,
            website: normalizedWebsite || null,
            business_types: data.businessTypes,
            country: data.country,
            currency: data.currency,
            description: data.description || null,
            onboarding_progress: { step: 1, data } as unknown,
          })
          .eq('id', currentGymId);

        if (error) throw error;
      }

      nextStep();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save gym details');
    } finally {
      setIsLoading(false);
    }
  }, [gymId, data, nextStep]);

  // Step 3: Save locations
  const saveLocations = useCallback(async () => {
    if (!gymId) return;
    setIsLoading(true);
    try {
      // Delete existing locations first
      await supabase.from('gym_locations').delete().eq('gym_id', gymId);

      // Insert new locations
      const locationsToInsert = data.locations.map((loc, index) => ({
        gym_id: gymId,
        name: loc.name,
        address: loc.address,
        postcode: loc.postcode,
        phone: loc.phone,
        email: loc.email,
        access_type: loc.accessType,
        timezone: loc.timezone,
        is_primary: index === 0,
        lat: loc.lat,
        lng: loc.lng,
        city: loc.city,
        country: loc.country,
      }));

      const { error } = await supabase
        .from('gym_locations')
        .insert(locationsToInsert);

      if (error) throw error;

      await saveProgress(3, data);
      nextStep();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save locations');
    } finally {
      setIsLoading(false);
    }
  }, [gymId, data, nextStep, saveProgress]);

  // Step 4: Save services
  const saveServices = useCallback(async () => {
    if (!gymId) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('gym_profiles')
        .update({
          service_settings: data.serviceSettings,
        } as any)
        .eq('id', gymId);

      if (error) throw error;
      nextStep();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save services');
    } finally {
      setIsLoading(false);
    }
  }, [gymId, data, nextStep]);

  // Step 5: Save staff invites
  const saveStaffInvites = useCallback(async () => {
    if (!gymId) return;
    setIsLoading(true);
    try {
      if (data.addStaffNow && data.staffInvites.length > 0) {
        const invitesToInsert = data.staffInvites.map(invite => ({
          gym_id: gymId,
          name: invite.name,
          email: invite.email,
          role: invite.role,
          location_ids: invite.locationIds,
          status: 'pending',
        }));

        const { error } = await supabase
          .from('gym_onboarding_staff_invites')
          .insert(invitesToInsert);

        if (error) throw error;
      }

      await saveProgress(5, data);
      nextStep();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save staff invites');
    } finally {
      setIsLoading(false);
    }
  }, [gymId, data, nextStep, saveProgress]);

  // Step 6: Save membership types
  const saveMembershipTypes = useCallback(async () => {
    if (!gymId) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('gym_profiles')
        .update({
          service_settings: { ...data.serviceSettings, membershipTypes: data.membershipTypes },
        } as any)
        .eq('id', gymId);

      if (error) throw error;
      nextStep();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save membership types');
    } finally {
      setIsLoading(false);
    }
  }, [gymId, data, nextStep]);

  // Step 7: Save payment settings
  const savePaymentSettings = useCallback(async () => {
    if (!gymId) return;
    setIsLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('gym_profiles')
        .update({
          stripe_account_id: data.stripeAccountId || null,
          vat_registered: data.vatRegistered,
          vat_number: data.vatNumber || null,
          onboarding_progress: { step: 7, data } as unknown,
        })
        .eq('id', gymId);

      if (error) throw error;
      nextStep();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save payment settings');
    } finally {
      setIsLoading(false);
    }
  }, [gymId, data, nextStep]);

  // Step 8: Save branding
  const saveBranding = useCallback(async () => {
    if (!gymId) return;
    setIsLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('gym_profiles')
        .update({
          logo_url: data.logoUrl || null,
          brand_color: data.brandColor || null,
          cover_image_url: data.coverImageUrl || null,
          onboarding_progress: { step: 8, data } as unknown,
        })
        .eq('id', gymId);

      if (error) throw error;
      nextStep();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save branding');
    } finally {
      setIsLoading(false);
    }
  }, [gymId, data, nextStep]);

  // Final step: Complete onboarding
  const completeOnboarding = useCallback(async () => {
    if (!gymId) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('gym_profiles')
        .update({
          status: 'active',
        } as any)
        .eq('id', gymId);

      if (error) throw error;
      
      toast.success('Welcome to your gym dashboard!');
      navigate(`/gym-admin/${gymId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  }, [gymId, navigate]);

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    data,
    updateData,
    nextStep,
    prevStep,
    goToStep,
    isLoading,
    gymId,
    userId,
    // Step-specific actions
    createAccount,
    saveGymBasics,
    saveLocations,
    saveServices,
    saveStaffInvites,
    saveMembershipTypes,
    savePaymentSettings,
    saveBranding,
    completeOnboarding,
  };
}
