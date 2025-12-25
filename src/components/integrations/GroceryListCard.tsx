import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ShoppingCart, 
  Copy, 
  ExternalLink, 
  Trash2,
  Plus,
  Check,
  Store
} from "lucide-react";
import { toast } from "sonner";

interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: string;
  checked: boolean;
}

interface GroceryListCardProps {
  listId: string;
  name: string;
  items: GroceryItem[];
  isCompleted?: boolean;
  onUpdateItems: (items: GroceryItem[]) => void;
  onComplete: () => void;
  onDelete: () => void;
}

const supermarkets = [
  { name: "Tesco", url: "https://www.tesco.com/groceries/en-GB/search?query=", color: "bg-blue-600" },
  { name: "Sainsbury's", url: "https://www.sainsburys.co.uk/gol-ui/SearchResults/", color: "bg-orange-500" },
  { name: "Asda", url: "https://groceries.asda.com/search/", color: "bg-green-600" },
];

const GroceryListCard = ({
  listId,
  name,
  items,
  isCompleted,
  onUpdateItems,
  onComplete,
  onDelete,
}: GroceryListCardProps) => {
  const [newItem, setNewItem] = useState("");

  const toggleItem = (itemId: string) => {
    const updated = items.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    onUpdateItems(updated);
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    const updated = [
      ...items,
      {
        id: crypto.randomUUID(),
        name: newItem.trim(),
        quantity: "1",
        unit: "",
        category: "Other",
        checked: false,
      },
    ];
    onUpdateItems(updated);
    setNewItem("");
  };

  const removeItem = (itemId: string) => {
    onUpdateItems(items.filter((item) => item.id !== itemId));
  };

  const copyToClipboard = () => {
    const text = items
      .map((item) => `${item.checked ? "✓" : "○"} ${item.quantity} ${item.unit} ${item.name}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    toast.success("List copied to clipboard");
  };

  const openInSupermarket = (baseUrl: string) => {
    const uncheckedItems = items.filter((item) => !item.checked);
    if (uncheckedItems.length === 0) {
      toast.info("All items are checked off!");
      return;
    }
    // Open first unchecked item in supermarket search
    const searchTerm = encodeURIComponent(uncheckedItems[0].name);
    window.open(`${baseUrl}${searchTerm}`, "_blank");
  };

  const checkedCount = items.filter((item) => item.checked).length;
  const progress = items.length > 0 ? (checkedCount / items.length) * 100 : 0;

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  return (
    <Card variant="glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {checkedCount} of {items.length} items
              </p>
            </div>
          </div>
          {isCompleted && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Check className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-muted/50 rounded-full mt-3 overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add item input */}
        <div className="flex gap-2">
          <Input
            placeholder="Add item..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            className="flex-1"
          />
          <Button size="icon" onClick={addItem} disabled={!newItem.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Grouped items */}
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {category}
              </p>
              <div className="space-y-1">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors group ${
                      item.checked ? "opacity-60" : ""
                    }`}
                  >
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    <span className={`flex-1 text-sm ${item.checked ? "line-through" : ""}`}>
                      {item.quantity} {item.unit} {item.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No items yet. Add some items or generate from a meal plan.
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="w-4 h-4 mr-2" />
            Copy List
          </Button>
          
          {/* Supermarket links dropdown */}
          <div className="flex gap-1">
            {supermarkets.map((store) => (
              <Button
                key={store.name}
                variant="outline"
                size="sm"
                onClick={() => openInSupermarket(store.url)}
                title={`Shop at ${store.name}`}
              >
                <Store className="w-4 h-4 mr-1" />
                {store.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          {!isCompleted && (
            <Button
              variant="default"
              size="sm"
              onClick={onComplete}
              disabled={checkedCount !== items.length || items.length === 0}
            >
              <Check className="w-4 h-4 mr-2" />
              Mark Complete
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete List
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroceryListCard;
