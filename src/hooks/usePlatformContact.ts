import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PlatformSocials {
  facebook: string;
  instagram: string;
  tiktok: string;
  x: string;
  youtube: string;
  linkedin: string;
  threads: string;
}

interface PlatformContact {
  email: string;
  phone: string;
  address: string;
  legalEmail: string;
  privacyEmail: string;
}

interface PlatformContactData {
  socials: PlatformSocials;
  contact: PlatformContact;
  isLoading: boolean;
}

export const usePlatformContact = (): PlatformContactData => {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["platform-contact-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", [
          "social_facebook",
          "social_instagram",
          "social_tiktok",
          "social_x",
          "social_youtube",
          "social_linkedin",
          "social_threads",
          "contact_email",
          "contact_phone",
          "contact_address",
          "legal_email",
          "privacy_email",
        ]);

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach((item) => {
        settingsMap[item.key] = String(item.value ?? "");
      });

      return settingsMap;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    socials: {
      facebook: settings?.social_facebook || "",
      instagram: settings?.social_instagram || "",
      tiktok: settings?.social_tiktok || "",
      x: settings?.social_x || "",
      youtube: settings?.social_youtube || "",
      linkedin: settings?.social_linkedin || "",
      threads: settings?.social_threads || "",
    },
    contact: {
      email: settings?.contact_email || "support@fitconnect.com",
      phone: settings?.contact_phone || "",
      address: settings?.contact_address || "",
      legalEmail: settings?.legal_email || "legal@fitconnect.com",
      privacyEmail: settings?.privacy_email || "privacy@fitconnect.com",
    },
    isLoading,
  };
};
