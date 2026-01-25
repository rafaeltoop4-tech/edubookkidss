-- Add accessibility fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_accessible boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_accessibility boolean DEFAULT false;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_accessibility ON public.products(is_accessible) WHERE is_accessible = true;