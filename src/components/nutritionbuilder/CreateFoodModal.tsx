import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFoodCategories, useCreateFood, FoodInsert } from '@/hooks/useFoods';
import { toast } from 'sonner';

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
      toast.success('Custom food created!');
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to create food');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create Custom Food</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Food Name *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="e.g., Grilled Chicken Thigh"
              className="bg-background border-border"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select onValueChange={(value) => setValue('category_id', value)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select category" />
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
            <Label htmlFor="calories">Calories (per 100g) *</Label>
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
              <Label htmlFor="protein" className="text-red-400">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                {...register('protein_g', { valueAsNumber: true })}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs" className="text-yellow-400">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                {...register('carbs_g', { valueAsNumber: true })}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat" className="text-blue-400">Fat (g)</Label>
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
            <Label htmlFor="fiber">Fiber (g)</Label>
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
              <Label htmlFor="serving_size">Serving Size (g)</Label>
              <Input
                id="serving_size"
                type="number"
                {...register('serving_size_g', { valueAsNumber: true })}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serving_desc">Serving Description</Label>
              <Input
                id="serving_desc"
                {...register('serving_description')}
                placeholder="e.g., 1 cup, 1 medium"
                className="bg-background border-border"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createFood.isPending}>
              {createFood.isPending ? 'Creating...' : 'Create Food'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
