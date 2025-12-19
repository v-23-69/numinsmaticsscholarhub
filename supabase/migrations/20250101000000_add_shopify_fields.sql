-- Add Shopify integration fields to coin_listings
ALTER TABLE public.coin_listings 
ADD COLUMN IF NOT EXISTS shopify_product_id TEXT,
ADD COLUMN IF NOT EXISTS shopify_variant_id TEXT,
ADD COLUMN IF NOT EXISTS shopify_handle TEXT,
ADD COLUMN IF NOT EXISTS is_shopify_product BOOLEAN DEFAULT false;

-- Create index for faster Shopify product lookups
CREATE INDEX IF NOT EXISTS idx_coin_listings_shopify_product_id ON public.coin_listings(shopify_product_id);
CREATE INDEX IF NOT EXISTS idx_coin_listings_is_shopify_product ON public.coin_listings(is_shopify_product);

-- Add comment
COMMENT ON COLUMN public.coin_listings.shopify_product_id IS 'Shopify product ID (gid://shopify/Product/...)';
COMMENT ON COLUMN public.coin_listings.shopify_variant_id IS 'Shopify variant ID (gid://shopify/ProductVariant/...)';
COMMENT ON COLUMN public.coin_listings.shopify_handle IS 'Shopify product handle for URL generation';
COMMENT ON COLUMN public.coin_listings.is_shopify_product IS 'Whether this listing is synced from Shopify';



