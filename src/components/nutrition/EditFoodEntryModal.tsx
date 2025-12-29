import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2 } from "lucide-react";
import { FoodDiaryEntry } from "@/hooks/useFoodDiary";

interface EditFoodEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: FoodDiaryEntry;
  onSave: (updates: { serving_size_g: number; calories: number; protein_g: number; carbs_g: number; fat_g: number }) => void;
  onDelete: () => void;
}

export const EditFoodEntryModal = ({
  open,
  onOpenChange,
  entry,
  onSave,
  onDelete,
}: EditFoodEntryModalProps) => {
  const [quantity, setQuantity] = useState(entry.serving_size_g || 100);

  // Reset quantity when entry changes
  useEffect(() => {
    if (open) {
      setQuantity(entry.serving_size_g || 100);
    }
  }, [open, entry]);

  const handleQuantityChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setQuantity(num);
    } else if (value === "") {
      setQuantity(0);
    }
  };

  const adjustQuantity = (delta: number) => {
    setQuantity(prev => Math.max(0, Math.round((prev + delta) * 10) / 10));
  };

  // Calculate macros based on original per-100g values
  const getScaledMacros = () => {
    const originalServing = entry.serving_size_g || 100;
    const originalMultiplier = originalServing / 100;
    
    // Reverse calculate per-100g values from stored entry
    const per100g = {
      calories: (entry.calories || 0) / originalMultiplier,
      protein: (entry.protein_g || 0) / originalMultiplier,
      carbs: (entry.carbs_g || 0) / originalMultiplier,
      fat: (entry.fat_g || 0) / originalMultiplier,
    };

    const newMultiplier = quantity / 100;
    return {
      calories: Math.round(per100g.calories * newMultiplier),
      protein: Math.round(per100g.protein * newMultiplier * 10) / 10,
      carbs: Math.round(per100g.carbs * newMultiplier * 10) / 10,
      fat: Math.round(per100g.fat * newMultiplier * 10) / 10,
    };
  };

  const scaledMacros = getScaledMacros();

  const handleSave = () => {
    onSave({
      serving_size_g: quantity,
      calories: scaledMacros.calories,
      protein_g: scaledMacros.protein,
      carbs_g: scaledMacros.carbs,
      fat_g: scaledMacros.fat,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[calc(100%-2rem)] max-w-lg max-h-[85dvh] flex flex-col p-0 gap-0 overflow-hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <DialogHeader className="px-4 pt-4 pb-3 shrink-0 border-b border-border/50">
          <DialogTitle className="text-base">Edit Entry</DialogTitle>
          <DialogDescription className="sr-only">
            Edit the quantity of this food entry
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
          {/* Food Info */}
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="font-medium text-sm break-words" style={{ overflowWrap: 'anywhere' }}>
              {entry.food_name}
            </p>
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity (grams)</label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => adjustQuantity(-10)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                inputMode="decimal"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="text-center text-lg font-medium h-10"
                min={0}
                step={0.1}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                onClick={() => adjustQuantity(10)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {/* Quick quantity buttons */}
            <div className="flex gap-2 flex-wrap">
              {[50, 100, 150, 200].map((q) => (
                <Button
                  key={q}
                  type="button"
                  variant={quantity === q ? "default" : "outline"}
                  size="sm"
                  className="flex-1 min-w-[60px]"
                  onClick={() => setQuantity(q)}
                >
                  {q}g
                </Button>
              ))}
            </div>
          </div>

          {/* Live Macro Preview */}
          <div className="bg-primary/5 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-center">
              Nutrition for {quantity}g
            </p>
            <div className="text-center">
              <span className="text-2xl font-bold">{scaledMacros.calories}</span>
              <span className="text-muted-foreground ml-1">kcal</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="bg-background rounded-lg p-2">
                <p className="text-blue-500 font-semibold">{scaledMacros.protein}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div className="bg-background rounded-lg p-2">
                <p className="text-amber-500 font-semibold">{scaledMacros.carbs}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
              </div>
              <div className="bg-background rounded-lg p-2">
                <p className="text-rose-500 font-semibold">{scaledMacros.fat}g</p>
                <p className="text-xs text-muted-foreground">Fat</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto pt-2">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="shrink-0"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleSave}
              disabled={quantity <= 0}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditFoodEntryModal;
