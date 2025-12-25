import { useState } from 'react';
import { Search, Plus, Drumstick, Wheat, Salad, Apple, Milk, Droplet, Cookie, Coffee } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFoods, useFoodCategories, Food, FoodCategory } from '@/hooks/useFoods';
import { useTranslation } from '@/hooks/useTranslation';

const iconMap: Record<string, React.ElementType> = {
  Drumstick,
  Wheat,
  Salad,
  Apple,
  Milk,
  Droplet,
  Cookie,
  Coffee,
};

interface FoodLibraryProps {
  onAddFood: (food: Food) => void;
}

export const FoodLibrary = ({ onAddFood }: FoodLibraryProps) => {
  const { t } = useTranslation('coach');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  
  const { data: categories } = useFoodCategories();
  const { data: foods, isLoading } = useFoods(selectedCategory, searchQuery);

  const getIcon = (iconName: string | null) => {
    if (!iconName) return Drumstick;
    return iconMap[iconName] || Drumstick;
  };

  return (
    <div className="glass-card rounded-xl p-4 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {t('nutritionBuilder.foodLibrary.title')}
      </h3>
      
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('nutritionBuilder.foodLibrary.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-background border-border"
        />
      </div>
      
      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge
          variant={!selectedCategory ? "default" : "outline"}
          className={`cursor-pointer ${!selectedCategory ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'}`}
          onClick={() => setSelectedCategory(undefined)}
        >
          {t('nutritionBuilder.foodLibrary.all')}
        </Badge>
        {categories?.map((category) => {
          const Icon = getIcon(category.icon);
          return (
            <Badge
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className={`cursor-pointer ${selectedCategory === category.id ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <Icon className="h-3 w-3 mr-1" />
              {category.name}
            </Badge>
          );
        })}
      </div>
      
      {/* Foods List */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              {t('nutritionBuilder.foodLibrary.loading')}
            </div>
          ) : foods?.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {t('nutritionBuilder.foodLibrary.noFoods')}
            </div>
          ) : (
            foods?.map((food) => {
              const Icon = getIcon(food.food_categories?.icon || null);
              return (
                <div
                  key={food.id}
                  className="group bg-background border border-border rounded-lg p-3 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium text-foreground truncate">{food.name}</span>
                        {food.is_custom && (
                          <Badge variant="outline" className="text-xs shrink-0">
                            {t('nutritionBuilder.foodLibrary.custom')}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {food.serving_description} · {food.calories_per_100g} {t('nutritionBuilder.foodLibrary.calPer100g')}
                      </div>
                      <div className="flex gap-3 mt-1 text-xs">
                        <span className="text-red-400">P: {food.protein_g}g</span>
                        <span className="text-yellow-400">C: {food.carbs_g}g</span>
                        <span className="text-blue-400">F: {food.fat_g}g</span>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onAddFood(food)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
