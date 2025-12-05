-- Users profile with extended fields for NSH
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  is_verified BOOLEAN DEFAULT false,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'verified', 'rejected')),
  gst_number TEXT,
  pan_number TEXT,
  trust_score DECIMAL(3,1) DEFAULT 0.0,
  badges JSONB DEFAULT '[]',
  auth_images_used INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User roles table (separate from profiles for security)
CREATE TYPE public.app_role AS ENUM ('buyer', 'seller', 'expert', 'admin_market', 'master_admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Coin categories
CREATE TABLE public.coin_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Coin tags
CREATE TABLE public.coin_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Coin listings
CREATE TABLE public.coin_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  era TEXT,
  metal TEXT,
  weight DECIMAL(10,2),
  diameter DECIMAL(10,2),
  mint TEXT,
  year_estimated TEXT,
  condition TEXT,
  price DECIMAL(12,2) NOT NULL,
  stock_count INTEGER DEFAULT 1,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  provenance JSONB DEFAULT '[]',
  category_id UUID REFERENCES public.coin_categories(id),
  views INTEGER DEFAULT 0,
  wishlist_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'sold', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Coin images
CREATE TABLE public.coin_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coin_id UUID NOT NULL REFERENCES public.coin_listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  side TEXT DEFAULT 'front' CHECK (side IN ('front', 'back', 'other')),
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Coin tags junction
CREATE TABLE public.coin_tags_join (
  coin_id UUID NOT NULL REFERENCES public.coin_listings(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.coin_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (coin_id, tag_id)
);

-- Wishlist
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id UUID NOT NULL REFERENCES public.coin_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, coin_id)
);

-- Cart items
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id UUID NOT NULL REFERENCES public.coin_listings(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, coin_id)
);

-- Shipping addresses
CREATE TABLE public.shipping_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'disputed')),
  shipping_address_id UUID REFERENCES public.shipping_addresses(id),
  subtotal DECIMAL(12,2) NOT NULL,
  platform_fee DECIMAL(12,2) DEFAULT 0,
  agent_fee DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  requires_escrow BOOLEAN DEFAULT false,
  escrow_status TEXT CHECK (escrow_status IN ('pending', 'held', 'released', 'refunded')),
  tracking_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  coin_id UUID NOT NULL REFERENCES public.coin_listings(id),
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  quantity INTEGER DEFAULT 1,
  price_at_purchase DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coin_id UUID REFERENCES public.coin_listings(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Authentication requests (expert verification)
CREATE TABLE public.auth_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  images JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'assigned', 'in_review', 'completed', 'rejected')),
  paid BOOLEAN DEFAULT false,
  paid_amount DECIMAL(10,2),
  assigned_expert_id UUID REFERENCES auth.users(id),
  expert_notes TEXT,
  authenticity_verdict TEXT CHECK (authenticity_verdict IN ('authentic', 'fake', 'uncertain')),
  estimated_value DECIMAL(12,2),
  period_assessment TEXT,
  rarity_assessment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Chat threads
CREATE TABLE public.threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT DEFAULT 'dm' CHECK (type IN ('dm', 'expert', 'support')),
  participant_ids UUID[] NOT NULL,
  auth_request_id UUID REFERENCES public.auth_requests(id),
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  attachments JSONB DEFAULT '[]',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Social posts
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  images JSONB DEFAULT '[]',
  coin_id UUID REFERENCES public.coin_listings(id),
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Post likes
CREATE TABLE public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Post comments
CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Stories
CREATE TABLE public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  is_live BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Story views
CREATE TABLE public.story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(story_id, viewer_id)
);

-- Followers
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Collections (user curated)
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Collection items
CREATE TABLE public.collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  coin_id UUID NOT NULL REFERENCES public.coin_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(collection_id, coin_id)
);

-- Webinars/Events
CREATE TABLE public.webinars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  host_id UUID REFERENCES auth.users(id),
  date TIMESTAMPTZ NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  seats INTEGER,
  enrolled_count INTEGER DEFAULT 0,
  replay_url TEXT,
  thumbnail_url TEXT,
  is_live BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Webinar enrollments
CREATE TABLE public.webinar_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id UUID NOT NULL REFERENCES public.webinars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(webinar_id, user_id)
);

-- Transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  auth_request_id UUID REFERENCES public.auth_requests(id),
  webinar_id UUID REFERENCES public.webinars(id),
  type TEXT NOT NULL CHECK (type IN ('purchase', 'authentication', 'webinar', 'payout', 'refund')),
  amount DECIMAL(12,2) NOT NULL,
  provider TEXT,
  provider_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  payload JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_tags_join ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webinar_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Categories viewable by all" ON public.coin_categories FOR SELECT USING (true);
CREATE POLICY "Tags viewable by all" ON public.coin_tags FOR SELECT USING (true);
CREATE POLICY "Active listings viewable by all" ON public.coin_listings FOR SELECT USING (status = 'active');
CREATE POLICY "Coin images viewable by all" ON public.coin_images FOR SELECT USING (true);
CREATE POLICY "Coin tags join viewable by all" ON public.coin_tags_join FOR SELECT USING (true);
CREATE POLICY "Profiles viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Posts viewable by all" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Comments viewable by all" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Active stories viewable" ON public.stories FOR SELECT USING (expires_at > now());
CREATE POLICY "Webinars viewable by all" ON public.webinars FOR SELECT USING (true);
CREATE POLICY "Public collections viewable" ON public.collections FOR SELECT USING (is_public = true);
CREATE POLICY "Reviews viewable by all" ON public.reviews FOR SELECT USING (true);

-- User-specific policies
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage wishlists" ON public.wishlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage addresses" ON public.shipping_addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid()) OR auth.uid() = seller_id
);
CREATE POLICY "Users create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view auth requests" ON public.auth_requests FOR SELECT USING (auth.uid() = user_id OR auth.uid() = assigned_expert_id);
CREATE POLICY "Users create auth requests" ON public.auth_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update auth requests" ON public.auth_requests FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = assigned_expert_id);

CREATE POLICY "Users view threads" ON public.threads FOR SELECT USING (auth.uid() = ANY(participant_ids));
CREATE POLICY "Users create threads" ON public.threads FOR INSERT WITH CHECK (auth.uid() = ANY(participant_ids));
CREATE POLICY "Users view messages" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.threads WHERE id = thread_id AND auth.uid() = ANY(participant_ids))
);
CREATE POLICY "Users send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users manage posts" ON public.posts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users like posts" ON public.post_likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users comment" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete comments" ON public.post_comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users manage stories" ON public.stories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view story" ON public.story_views FOR ALL USING (auth.uid() = viewer_id);

CREATE POLICY "Users manage follows" ON public.follows FOR ALL USING (auth.uid() = follower_id);
CREATE POLICY "Users manage collections" ON public.collections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage collection items" ON public.collection_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND user_id = auth.uid())
);

CREATE POLICY "Users enroll webinars" ON public.webinar_enrollments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Seller policies
CREATE POLICY "Sellers manage listings" ON public.coin_listings FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "Sellers manage images" ON public.coin_images FOR ALL USING (
  EXISTS (SELECT 1 FROM public.coin_listings WHERE id = coin_id AND seller_id = auth.uid())
);

-- Role check function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', 'Collector'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'buyer');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_coin_listings_updated_at BEFORE UPDATE ON public.coin_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_auth_requests_updated_at BEFORE UPDATE ON public.auth_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();