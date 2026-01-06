import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel3D, Carousel3DItem } from "@/components/ui/carousel-3d";
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
    <div className={cn("", className)}>
      <Carousel3D showPagination={clients.length > 3} gap={12}>
        {clients.map((client) => {
          const profile = client.client_profile;
          const firstName = profile?.first_name || "";
          const lastName = profile?.last_name || "";
          const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";
          const displayName = firstName || "Client";

          return (
            <Carousel3DItem key={client.client_id}>
              <button
                onClick={() => onClientClick(client.client_id)}
                className="group flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 hover:bg-accent/50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
              >
                {/* Avatar with ring on hover */}
                <div className="relative">
                  <Avatar className="h-16 w-16 ring-2 ring-border/50 group-hover:ring-primary/50 transition-all duration-200">
                    <AvatarImage
                      src={profile?.avatar_url || undefined}
                      alt={displayName}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-semibold text-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {/* Subtle glow effect on hover */}
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
                </div>

                {/* Name */}
                <span className="text-sm font-medium text-foreground text-center max-w-[80px] truncate">
                  {firstName || t("clients.unknownClient", "Client")}
                </span>
              </button>
            </Carousel3DItem>
          );
        })}
      </Carousel3D>
    </div>
  );
});

ClientQuickViewCarousel.displayName = "ClientQuickViewCarousel";
