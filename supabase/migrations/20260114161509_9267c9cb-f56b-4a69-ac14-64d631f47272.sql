-- Phase 7: POS & Inventory Tables

-- Products/Inventory table
CREATE TABLE IF NOT EXISTS public.gym_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES public.gym_profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  sku text,
  category text DEFAULT 'general',
  price numeric(10,2) NOT NULL,
  cost_price numeric(10,2),
  stock_quantity integer DEFAULT 0,
  low_stock_threshold integer DEFAULT 5,
  image_url text,
  is_active boolean DEFAULT true,
  track_inventory boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product sales/transactions table
CREATE TABLE IF NOT EXISTS public.gym_product_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES public.gym_profiles(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES public.gym_members(id) ON DELETE SET NULL,
  staff_id uuid REFERENCES public.gym_staff(id) ON DELETE SET NULL,
  location_id uuid REFERENCES public.gym_locations(id) ON DELETE SET NULL,
  subtotal numeric(10,2) NOT NULL,
  discount_amount numeric(10,2) DEFAULT 0,
  tax_amount numeric(10,2) DEFAULT 0,
  total_amount numeric(10,2) NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card', 'member_credit', 'other')),
  payment_reference text,
  notes text,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded', 'cancelled')),
  refunded_at timestamptz,
  refund_amount numeric(10,2),
  created_at timestamptz DEFAULT now()
);

-- Sale line items
CREATE TABLE IF NOT EXISTS public.gym_product_sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES public.gym_product_sales(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.gym_products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  discount_percent numeric(5,2) DEFAULT 0,
  line_total numeric(10,2) NOT NULL
);

-- Enable RLS
ALTER TABLE public.gym_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_product_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_product_sale_items ENABLE ROW LEVEL SECURITY;

-- RLS for gym_products
CREATE POLICY "Public can view active products"
  ON public.gym_products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage products"
  ON public.gym_products FOR ALL
  USING (gym_id IN (SELECT gym_id FROM gym_staff WHERE user_id = auth.uid() AND status = 'active'));

-- RLS for gym_product_sales
CREATE POLICY "Staff can view gym sales"
  ON public.gym_product_sales FOR SELECT
  USING (gym_id IN (SELECT gym_id FROM gym_staff WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "Staff can create sales"
  ON public.gym_product_sales FOR INSERT
  WITH CHECK (gym_id IN (SELECT gym_id FROM gym_staff WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "Staff can update sales"
  ON public.gym_product_sales FOR UPDATE
  USING (gym_id IN (SELECT gym_id FROM gym_staff WHERE user_id = auth.uid() AND status = 'active'));

-- RLS for sale items
CREATE POLICY "Staff can view sale items"
  ON public.gym_product_sale_items FOR SELECT
  USING (sale_id IN (SELECT id FROM gym_product_sales WHERE gym_id IN (SELECT gym_id FROM gym_staff WHERE user_id = auth.uid() AND status = 'active')));

CREATE POLICY "Staff can manage sale items"
  ON public.gym_product_sale_items FOR ALL
  USING (sale_id IN (SELECT id FROM gym_product_sales WHERE gym_id IN (SELECT gym_id FROM gym_staff WHERE user_id = auth.uid() AND status = 'active')));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gym_products_gym ON public.gym_products(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_products_category ON public.gym_products(category);
CREATE INDEX IF NOT EXISTS idx_gym_product_sales_gym ON public.gym_product_sales(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_product_sales_member ON public.gym_product_sales(member_id);
CREATE INDEX IF NOT EXISTS idx_gym_product_sale_items_sale ON public.gym_product_sale_items(sale_id);