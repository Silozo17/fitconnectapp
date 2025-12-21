import { useState } from 'react';
import { ChevronDown, ChevronUp, Bug } from 'lucide-react';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useUserLocalePreference } from '@/hooks/useUserLocalePreference';
import { useOptionalLocaleRouting } from '@/contexts/LocaleRoutingContext';
import { useMarketplaceLocationFilter } from '@/hooks/useMarketplaceLocationFilter';
import { getStoredLocalePreference } from '@/lib/locale-routing';
import { useAuth } from '@/contexts/AuthContext';

// This component should only be used in development mode
// The parent component handles the DEV check

interface DebugRowProps {
  label: string;
  value: string | null | undefined;
  source?: 'geo' | 'manual' | 'stored' | 'db' | 'url' | 'computed';
}

const sourceColors: Record<string, string> = {
  geo: 'text-blue-400',
  manual: 'text-green-400',
  stored: 'text-yellow-400',
  db: 'text-purple-400',
  url: 'text-orange-400',
  computed: 'text-pink-400',
};

function DebugRow({ label, value, source }: DebugRowProps) {
  const colorClass = source ? sourceColors[source] : 'text-foreground/80';
  return (
    <div className="flex justify-between gap-4 text-xs py-0.5">
      <span className="text-foreground/60 whitespace-nowrap">{label}</span>
      <span className={`font-mono ${colorClass}`}>
        {value ?? <span className="text-foreground/30 italic">null</span>}
      </span>
    </div>
  );
}

export function LocaleDebugPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Auth state
  const { user } = useAuth();
  
  // Geo detection
  const { location: geoLocation, isLoading: geoLoading } = useUserLocation();
  const geoCountry = geoLocation?.countryCode?.toLowerCase() ?? null;
  const geoCity = geoLocation?.city ?? null;
  
  // User locale preferences (DB-backed)
  const { 
    countryPreference: dbCountry, 
    languagePreference: dbLanguage, 
    isLoading: dbLoading,
    isInitialized: dbInitialized
  } = useUserLocalePreference();
  
  // Website context (URL-based)
  const localeRouting = useOptionalLocaleRouting();
  
  // Marketplace filter (session-level manual selection)
  const { manualCountryCode: manualCountry } = useMarketplaceLocationFilter();
  
  // Stored localStorage preference
  const storedPref = getStoredLocalePreference();
  
  // Compute effective values
  const effectiveCountry = manualCountry || dbCountry || storedPref?.location || geoCountry || 'gb';
  const effectiveLanguage = dbLanguage || storedPref?.language || localeRouting?.language || 'en';
  
  const isWebsiteRoute = !!localeRouting?.isLocaleRoute;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-xs">
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -top-2 -right-2 bg-amber-600 hover:bg-amber-500 text-white rounded-full p-1.5 shadow-lg transition-colors"
        title="Locale Debug Panel"
      >
        <Bug className="h-4 w-4" />
      </button>
      
      {isExpanded && (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div 
            className="flex items-center justify-between px-3 py-2 bg-amber-600/20 border-b border-border cursor-pointer"
            onClick={() => setIsExpanded(false)}
          >
            <span className="text-xs font-semibold text-amber-400">🐛 Locale Debug</span>
            <ChevronDown className="h-3 w-3 text-amber-400" />
          </div>
          
          <div className="p-3 space-y-3 max-h-[60vh] overflow-y-auto">
            {/* Auth Status */}
            <div className="border-b border-border/50 pb-2">
              <div className="text-[10px] uppercase text-foreground/40 mb-1">Auth</div>
              <DebugRow label="User ID" value={user?.id?.slice(0, 8) + '...'} />
              <DebugRow label="Authenticated" value={user ? 'Yes' : 'No'} />
            </div>
            
            {/* Geo Detection */}
            <div className="border-b border-border/50 pb-2">
              <div className="text-[10px] uppercase text-foreground/40 mb-1">Geo Detection</div>
              <DebugRow label="geoDetectedCountry" value={geoCountry} source="geo" />
              <DebugRow label="geoCity" value={geoCity} source="geo" />
              <DebugRow label="geoLoading" value={geoLoading ? 'true' : 'false'} />
            </div>
            
            {/* Manual Selection (Session) */}
            <div className="border-b border-border/50 pb-2">
              <div className="text-[10px] uppercase text-foreground/40 mb-1">Session Filter</div>
              <DebugRow label="manualSelectedCountry" value={manualCountry} source="manual" />
            </div>
            
            {/* Stored Preference (localStorage) */}
            <div className="border-b border-border/50 pb-2">
              <div className="text-[10px] uppercase text-foreground/40 mb-1">localStorage</div>
              <DebugRow label="storedCountry" value={storedPref?.location} source="stored" />
              <DebugRow label="storedLanguage" value={storedPref?.language} source="stored" />
              <DebugRow label="storedSource" value={storedPref?.source} />
            </div>
            
            {/* DB Preferences */}
            <div className="border-b border-border/50 pb-2">
              <div className="text-[10px] uppercase text-foreground/40 mb-1">DB Preferences</div>
              <DebugRow label="user.countryPreference" value={dbCountry} source="db" />
              <DebugRow label="user.languagePreference" value={dbLanguage} source="db" />
              <DebugRow label="dbInitialized" value={dbInitialized ? 'true' : 'false'} />
              <DebugRow label="dbLoading" value={dbLoading ? 'true' : 'false'} />
            </div>
            
            {/* Website Context (URL-based) */}
            {localeRouting && (
              <div className="border-b border-border/50 pb-2">
                <div className="text-[10px] uppercase text-foreground/40 mb-1">Website (URL)</div>
                <DebugRow label="websiteLanguage" value={localeRouting.language} source="url" />
                <DebugRow label="websiteCountry" value={localeRouting.location} source="url" />
                <DebugRow label="isLocaleRoute" value={localeRouting.isLocaleRoute ? 'true' : 'false'} />
              </div>
            )}
            
            {/* Effective Values */}
            <div>
              <div className="text-[10px] uppercase text-foreground/40 mb-1">Effective (Computed)</div>
              <DebugRow label="EffectiveCountry" value={effectiveCountry} source="computed" />
              <DebugRow label="EffectiveLanguage" value={effectiveLanguage} source="computed" />
              <DebugRow label="Context" value={isWebsiteRoute ? 'Website' : 'Dashboard'} />
            </div>
            
            {/* Legend */}
            <div className="pt-2 border-t border-border/50">
              <div className="text-[10px] uppercase text-foreground/40 mb-1">Legend</div>
              <div className="flex flex-wrap gap-2 text-[10px]">
                <span className="text-blue-400">● geo</span>
                <span className="text-green-400">● manual</span>
                <span className="text-yellow-400">● stored</span>
                <span className="text-purple-400">● db</span>
                <span className="text-orange-400">● url</span>
                <span className="text-pink-400">● computed</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!isExpanded && (
        <div 
          onClick={() => setIsExpanded(true)}
          className="bg-background/80 backdrop-blur-sm border border-amber-600/50 rounded-lg px-2 py-1 cursor-pointer hover:bg-background/90 transition-colors"
        >
          <span className="text-[10px] text-amber-400">🐛 {effectiveCountry.toUpperCase()}/{effectiveLanguage}</span>
        </div>
      )}
    </div>
  );
}
