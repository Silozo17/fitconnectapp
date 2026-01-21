import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Variable, Search, User, UserCheck, Calendar, Trophy, Heart } from "lucide-react";
import { useMessageVariables, CATEGORY_LABELS, VariableOption } from "@/hooks/useMessageVariables";
import { cn } from "@/lib/utils";

interface VariableInserterProps {
  onInsert: (variable: string) => void;
  excludeCategories?: string[];
  className?: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  client: <User className="h-3.5 w-3.5" />,
  coach: <UserCheck className="h-3.5 w-3.5" />,
  context: <Calendar className="h-3.5 w-3.5" />,
  milestone: <Trophy className="h-3.5 w-3.5" />,
  relationship: <Heart className="h-3.5 w-3.5" />,
  custom: <Variable className="h-3.5 w-3.5" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  client: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  coach: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  context: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  milestone: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  relationship: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  custom: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
};

export function VariableInserter({
  onInsert,
  excludeCategories = [],
  className,
}: VariableInserterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { variablesByCategory, isLoading } = useMessageVariables();

  const handleInsert = (variable: VariableOption) => {
    onInsert(`{${variable.name}}`);
    setOpen(false);
    setSearch("");
  };

  // Filter variables based on search and excluded categories
  const filteredCategories = Object.entries(variablesByCategory)
    .filter(([category]) => !excludeCategories.includes(category))
    .map(([category, variables]) => {
      const filtered = variables.filter(
        (v) =>
          v.name.toLowerCase().includes(search.toLowerCase()) ||
          v.description.toLowerCase().includes(search.toLowerCase())
      );
      return [category, filtered] as [string, VariableOption[]];
    })
    .filter(([, variables]) => variables.length > 0);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("gap-1.5", className)}
        >
          <Variable className="h-3.5 w-3.5" />
          Insert Variable
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={8} collisionPadding={16}>
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search variables..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        <div
          className="max-h-[320px] overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: "touch" }}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No variables found
            </div>
          ) : (
            <div className="p-3 space-y-4">
              {filteredCategories.map(([category, variables]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 px-2 mb-2">
                    <span className={cn(
                      "p-1 rounded",
                      CATEGORY_COLORS[category]?.split(" ")[0] || "bg-muted"
                    )}>
                      {CATEGORY_ICONS[category]}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {CATEGORY_LABELS[category] || category}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {variables.map((variable) => (
                      <button
                        key={variable.name}
                        type="button"
                        onClick={() => handleInsert(variable)}
                        className="w-full flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 text-left transition-colors"
                      >
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-mono text-xs shrink-0 mt-0.5",
                            CATEGORY_COLORS[category]
                          )}
                        >
                          {`{${variable.name}}`}
                        </Badge>
                        <span className="text-xs text-muted-foreground leading-relaxed">
                          {variable.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-2 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            Click a variable to insert it into your message
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
