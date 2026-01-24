-- Add technical fields to products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS page_count INTEGER,
ADD COLUMN IF NOT EXISTS file_format TEXT DEFAULT 'PDF',
ADD COLUMN IF NOT EXISTS file_size_mb DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS paper_format TEXT DEFAULT 'A4',
ADD COLUMN IF NOT EXISTS show_technical_info BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS age_range TEXT;

-- Create product reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 4 AND rating <= 5),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view active reviews
CREATE POLICY "Anyone can view active reviews" ON public.product_reviews
FOR SELECT USING (active = true);

-- Anyone can insert reviews
CREATE POLICY "Anyone can insert reviews" ON public.product_reviews
FOR INSERT WITH CHECK (true);

-- Create sales table with unique codes
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_code TEXT NOT NULL UNIQUE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  session_id TEXT,
  customer_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for sales
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Public can insert sales (when clicking WhatsApp)
CREATE POLICY "Anyone can create sales" ON public.sales
FOR INSERT WITH CHECK (true);

-- Admins can view and manage all sales
CREATE POLICY "Admins can manage sales" ON public.sales
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_sales_updated_at
BEFORE UPDATE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add whatsapp_clicks event type to metrics if not using purchases
-- (We'll track specific whatsapp clicks as a new event type)

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON public.sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON public.sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at DESC);