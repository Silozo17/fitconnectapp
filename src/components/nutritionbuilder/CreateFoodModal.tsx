import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFoodCategories, useCreateFood, FoodInsert } from '@/hooks/useFoods';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

interface CreateFoodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachId: string;
}

interface FoodFormData {
  name: string;
  category_id: string;
  calories_per_100g: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  serving_size_g: number;
  serving_description: string;
}

export const CreateFoodModal = ({ open, onOpenChange, coachId }: CreateFoodModalProps) => {
  const { t } = useTranslation('coach');
  const { data: categories } = useFoodCategories();
  const createFood = useCreateFood();
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FoodFormData>({
    defaultValues: {
      name: '',
      category_id: '',
      calories_per_100g: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      serving_size_g: 100,
      serving_description: '100g',
    },
  });

  const onSubmit = async (data: FoodFormData) => {
    try {
      const foodData: FoodInsert = {
        ...data,
        coach_id: coachId,
        is_custom: true,
      };
      
      await createFood.mutateAsync(foodData);
      toast.success(t('nutritionBuilder.createFood.successMessage'));
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(t('nutritionBuilder.createFood.errorMessage'));
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{t('nutritionBuilder.createFood.title')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('nutritionBuilder.createFood.foodName')} *</Label>
            <Input
              id="name"
              {...register('name', { required: t('nutritionBuilder.createFood.nameRequired') })}
              placeholder={t('nutritionBuilder.createFood.foodNamePlaceholder')}
              className="bg-background border-border"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>{t('nutritionBuilder.createFood.category')}</Label>
            <Select onValueChange={(value) => setValue('category_id', value)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder={t('nutritionBuilder.createFood.selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Calories */}
          <div className="space-y-2">
            <Label htmlFor="calories">{t('nutritionBuilder.createFood.caloriesPer100g')} *</Label>
            <Input
              id="calories"
              type="number"
              step="0.1"
              {...register('calories_per_100g', { required: true, valueAsNumber: true })}
              className="bg-background border-border"
            />
          </div>

          {/* Macros Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="protein" className="text-red-400">{t('nutritionBuilder.createFood.protein')}</Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                {...register('protein_g', { valueAsNumber: true })}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs" className="text-yellow-400">{t('nutritionBuilder.createFood.carbs')}</Label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                {...register('carbs_g', { valueAsNumber: true })}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat" className="text-blue-400">{t('nutritionBuilder.createFood.fat')}</Label>
              <Input
                id="fat"
                type="number"
                step="0.1"
                {...register('fat_g', { valueAsNumber: true })}
                className="bg-background border-border"
              />
            </div>
          </div>

          {/* Fiber */}
          <div className="space-y-2">
            <Label htmlFor="fiber">{t('nutritionBuilder.createFood.fiber')}</Label>
            <Input
              id="fiber"
              type="number"
              step="0.1"
              {...register('fiber_g', { valueAsNumber: true })}
              className="bg-background border-border"
            />
          </div>

          {/* Serving Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="serving_size">{t('nutritionBuilder.createFood.servingSize')}</Label>
              <Input
                id="serving_size"
                type="number"
                {...register('serving_size_g', { valueAsNumber: true })}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serving_desc">{t('nutritionBuilder.createFood.servingDesc')}</Label>
              <Input
                id="serving_desc"
                {...register('serving_description')}
                placeholder={t('nutritionBuilder.createFood.servingDescPlaceholder')}
                className="bg-background border-border"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('nutritionBuilder.createFood.cancel')}
            </Button>
            <Button type="submit" disabled={createFood.isPending}>
              {createFood.isPending ? t('nutritionBuilder.createFood.creating') : t('nutritionBuilder.createFood.createFood')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
