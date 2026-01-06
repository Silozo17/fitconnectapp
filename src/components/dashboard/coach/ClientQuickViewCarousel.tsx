import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel3D, Carousel3DItem } from "@/components/ui/carousel-3d";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  client_id: string;
  client_profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url?: string | null;
  } | null;
}

interface ClientQuickViewCarouselProps {
  clients: Client[];
  onClientClick: (clientId: string) => void;
  className?: string;
}

export const ClientQuickViewCarousel = memo(({
  clients,
  onClientClick,
  className,
}: ClientQuickViewCarouselProps) => {
  const { t } = useTranslation("coach");

  if (!clients || clients.length === 0) {
    return null;
  }

  return (
    <div className={cn("-mx-5 md:mx-0", className)}>
      {/* Mobile: 3D Carousel */}
      <div className="md:hidden">
        <Carousel3D showPagination={clients.length > 3} gap={12}>
          {clients.map((client) => {
            const profile = client.client_profile;
            const firstName = profile?.first_name || "";
            const lastName = profile?.last_name || "";
            const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";
            const displayName = firstName || t("clients.unknownClient", "Client");

            return (
              <Carousel3DItem key={client.client_id} className="w-[140px]">
                <button
                  onClick={() => onClientClick(client.client_id)}
                  className="w-full h-full group"
                >
                  <Card variant="elevated" className="h-full rounded-3xl group-hover:shadow-lg transition-all">
                    <CardContent className="p-4 flex flex-col items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-14 w-14 ring-2 ring-border/30 group-hover:ring-primary/50 transition-all">
                          <AvatarImage
                            src={profile?.avatar_url || undefined}
                            alt={displayName}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
                      </div>
                      <span className="text-sm font-medium text-foreground text-center truncate max-w-full">
                        {displayName}
                      </span>
                    </CardContent>
                  </Card>
                </button>
              </Carousel3DItem>
            );
          })}
        </Carousel3D>
      </div>

      {/* Desktop: Grid */}
      <div className="hidden md:grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {clients.map((client) => {
          const profile = client.client_profile;
          const firstName = profile?.first_name || "";
          const lastName = profile?.last_name || "";
          const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";
          const displayName = firstName || t("clients.unknownClient", "Client");

          return (
            <button
              key={client.client_id}
              onClick={() => onClientClick(client.client_id)}
              className="group"
            >
              <Card variant="elevated" className="h-full rounded-3xl group-hover:shadow-lg transition-all">
                <CardContent className="p-4 flex flex-col items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-14 w-14 ring-2 ring-border/30 group-hover:ring-primary/50 transition-all">
                      <AvatarImage
                        src={profile?.avatar_url || undefined}
                        alt={displayName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
                  </div>
                  <span className="text-sm font-medium text-foreground text-center truncate max-w-full">
                    {displayName}
                  </span>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
});

ClientQuickViewCarousel.displayName = "ClientQuickViewCarousel";
