import { useState } from "react";
import { User, Target, ChevronDown, ChevronUp } from "lucide-react";
import { ContentSection, ContentSectionHeader } from "@/components/shared/ContentSection";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/useTranslation";

interface CoachAboutSectionProps {
  bio: string | null;
  whoIWorkWith: string | null;
}

const MAX_CHARS = 300;

export function CoachAboutSection({ bio, whoIWorkWith }: CoachAboutSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation('coaches');
  
  const hasBio = bio && bio.trim().length > 0;
  const hasWhoIWorkWith = whoIWorkWith && whoIWorkWith.trim().length > 0;
  
  // If neither section has content, don't render
  if (!hasBio && !hasWhoIWorkWith) {
    return null;
  }

  const bioNeedsTruncation = hasBio && bio.length > MAX_CHARS;
  const displayBio = bioNeedsTruncation && !expanded 
    ? bio.slice(0, MAX_CHARS) + "..." 
    : bio;

  // If only one section has content, show simple layout
  if (!hasWhoIWorkWith && hasBio) {
    return (
      <ContentSection colorTheme="primary">
        <ContentSectionHeader
          icon={User}
          title={t('profile.aboutMe')}
        />
        <div className="pt-4">
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {displayBio}
          </p>
          {bioNeedsTruncation && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-primary hover:text-primary/80"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  {t('profile.showLess')}
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  {t('profile.readMore')}
                </>
              )}
            </Button>
          )}
        </div>
      </ContentSection>
    );
  }

  if (!hasBio && hasWhoIWorkWith) {
    return (
      <ContentSection colorTheme="blue">
        <ContentSectionHeader
          icon={Target}
          title={t('profile.whoIWorkWith')}
        />
        <div className="pt-4">
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {whoIWorkWith}
          </p>
        </div>
      </ContentSection>
    );
  }

  // Both sections have content - use tabs
  return (
    <ContentSection colorTheme="primary">
      <div className="pt-2">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="about" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('profile.aboutMe')}
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              {t('profile.whoIWorkWith')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="about" className="mt-0">
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {displayBio}
            </p>
            {bioNeedsTruncation && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-primary hover:text-primary/80"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    {t('profile.showLess')}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    {t('profile.readMore')}
                  </>
                )}
              </Button>
            )}
          </TabsContent>
          
          <TabsContent value="clients" className="mt-0">
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {whoIWorkWith}
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </ContentSection>
  );
}
