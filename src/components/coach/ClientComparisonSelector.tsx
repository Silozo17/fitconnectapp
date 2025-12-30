import { UserAvatar } from "@/components/shared/UserAvatar";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  clients: any[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  maxSelection: number;
}

export function ClientComparisonSelector({ clients, selectedIds, onToggle, maxSelection }: Props) {
  const { t } = useTranslation("coach");

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
      {clients.map((client) => {
        const isSelected = selectedIds.includes(client.id);
        const isDisabled = !isSelected && selectedIds.length >= maxSelection;

        return (
          <button
            key={client.id}
            onClick={() => !isDisabled && onToggle(client.id)}
            disabled={isDisabled}
            className={cn(
              "relative p-2 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all text-left min-h-[80px] sm:min-h-[100px]",
              isSelected
                ? "border-primary bg-primary/5"
                : isDisabled
                ? "border-border/50 opacity-50 cursor-not-allowed"
                : "border-border hover:border-primary/50"
            )}
          >
            {isSelected && (
              <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
              </div>
            )}
            <UserAvatar
              src={client.avatar_url}
              name={`${client.first_name || ""} ${client.last_name || ""}`}
              className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-1 sm:mb-2"
            />
            <p className="text-xs sm:text-sm font-medium text-center truncate">
              {client.first_name} {client.last_name?.charAt(0)}.
            </p>
          </button>
        );
      })}
    </div>
  );
}
