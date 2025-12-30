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
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {clients.map((client) => {
        const isSelected = selectedIds.includes(client.id);
        const isDisabled = !isSelected && selectedIds.length >= maxSelection;

        return (
          <button
            key={client.id}
            onClick={() => !isDisabled && onToggle(client.id)}
            disabled={isDisabled}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all text-left",
              isSelected
                ? "border-primary bg-primary/5"
                : isDisabled
                ? "border-border/50 opacity-50 cursor-not-allowed"
                : "border-border hover:border-primary/50"
            )}
          >
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
            <UserAvatar
              src={client.avatar_url}
              name={`${client.first_name || ""} ${client.last_name || ""}`}
              className="w-12 h-12 mx-auto mb-2"
            />
            <p className="text-sm font-medium text-center truncate">
              {client.first_name} {client.last_name}
            </p>
          </button>
        );
      })}
    </div>
  );
}
