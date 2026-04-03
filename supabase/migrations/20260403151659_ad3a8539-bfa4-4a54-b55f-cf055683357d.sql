
-- Fix storage policy: restrict UPDATE to admin only
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;

CREATE POLICY "Only admins can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Add database constraints for input validation
ALTER TABLE public.products ADD CONSTRAINT products_price_positive CHECK (price >= 0);
ALTER TABLE public.products ADD CONSTRAINT products_title_length CHECK (length(title) <= 200);
ALTER TABLE public.products ADD CONSTRAINT products_stock_positive CHECK (stock >= 0);
ALTER TABLE public.testimonials ADD CONSTRAINT testimonials_rating_range CHECK (rating BETWEEN 1 AND 5);

-- Exclude pdf_url from public view by creating a security barrier view
-- Instead, we'll handle this in RLS: create a separate policy that hides pdf_url
-- Actually, RLS can't filter columns. Best approach: remove pdf_url from public products query in code.
-- For now, add constraint to ensure pdf_url is only a path, not a full signed URL
