        -- ==============================================================================
        -- VAIDEHI IMITATION - HARDENED SUPABASE DATABASE & STORAGE SCHEMA
        -- Location: Dhasa Junction, Gujarat | Owner: Akshaysinh Kher
        --
        -- Security features:
        --   - Role-Based Access Control (RBAC) via public.admin_users & is_admin() function
        --   - public.is_admin() hardened with explicit SET search_path = '' to prevent hijacking
        --   - public.handle_updated_at() hardened with explicit SET search_path = ''
        --   - Ordinary authenticated users CANNOT perform admin actions or self-promote
        --   - Row Level Security (RLS) on products, reviews, admin_users, and storage
        --   - Public submissions strictly restricted to status = 'pending'
        --   - Safe, idempotent migration (can be re-run safely without deleting data)
        -- ==============================================================================

        -- ==============================================================================
        -- 1. Admin Authorization Table & Role Verification Function
        -- ==============================================================================

        CREATE TABLE IF NOT EXISTS public.admin_users (
            user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
            created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
        );

        -- Enable RLS on admin_users
        ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

        -- Policy: Authenticated users can only read their own admin status
        DROP POLICY IF EXISTS "Admin users can view own admin row" ON public.admin_users;
        CREATE POLICY "Admin users can view own admin row"
            ON public.admin_users
            FOR SELECT
            TO authenticated
            USING (user_id = (SELECT auth.uid()));

        -- NOTE: No client INSERT, UPDATE, or DELETE policies are granted on public.admin_users.
        -- Only superusers (postgres) via the Supabase Dashboard SQL Editor can grant or revoke admin roles.
        -- This prevents ordinary users from granting themselves admin privileges.

        -- Hardened Security Definer function to check if the current user is an authorized admin.
        -- Explicitly sets search_path = '' and fully qualifies all object references to eliminate
        -- search-path injection/hijacking vulnerabilities.
        CREATE OR REPLACE FUNCTION public.is_admin()
        RETURNS BOOLEAN
        LANGUAGE plpgsql
        SECURITY DEFINER
        STABLE
        SET search_path = ''
        AS $$
        BEGIN
            RETURN EXISTS (
                SELECT 1
                FROM public.admin_users
                WHERE user_id = (SELECT auth.uid())
            );
        END;
        $$;

        -- Secure function permissions: revoke default public access, grant explicitly to client roles
        REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
        GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;


        -- ==============================================================================
        -- 2. Products Table with Hardened RLS
        -- ==============================================================================

        CREATE TABLE IF NOT EXISTS public.products (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            code TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            gender TEXT NOT NULL CHECK (gender IN ('Female', 'Male', 'Unisex')),
            category TEXT NOT NULL,
            description TEXT DEFAULT '',
            original_price NUMERIC(10, 2) NOT NULL CHECK (original_price >= 0),
            selling_price NUMERIC(10, 2) NOT NULL CHECK (selling_price >= 0),
            images JSONB NOT NULL DEFAULT '[]'::jsonb,
            in_stock BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
        );

        -- Drop hardcoded category check constraint from previous migrations to enable dynamic categories
        ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;

        -- Indexes for performance
        CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
        CREATE INDEX IF NOT EXISTS idx_products_gender ON public.products(gender);
        CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

        -- Hardened automatic updated_at trigger function
        CREATE OR REPLACE FUNCTION public.handle_updated_at()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = ''
        AS $$
        BEGIN
            NEW.updated_at = pg_catalog.timezone('utc'::text, pg_catalog.now());
            RETURN NEW;
        END;
        $$;

        DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
        CREATE TRIGGER trigger_products_updated_at
            BEFORE UPDATE ON public.products
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();

        -- Enable RLS on products
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

        -- 1. Anyone (public visitors) can read products
        DROP POLICY IF EXISTS "Public catalogue read access" ON public.products;
        CREATE POLICY "Public catalogue read access"
            ON public.products
            FOR SELECT
            TO public
            USING (true);

        -- 2. ONLY verified admins can insert products
        DROP POLICY IF EXISTS "Admin insert products" ON public.products;
        CREATE POLICY "Admin insert products"
            ON public.products
            FOR INSERT
            TO authenticated
            WITH CHECK (public.is_admin());

        -- 3. ONLY verified admins can update products
        DROP POLICY IF EXISTS "Admin update products" ON public.products;
        CREATE POLICY "Admin update products"
            ON public.products
            FOR UPDATE
            TO authenticated
            USING (public.is_admin())
            WITH CHECK (public.is_admin());

        -- 4. ONLY verified admins can delete products
        DROP POLICY IF EXISTS "Admin delete products" ON public.products;
        CREATE POLICY "Admin delete products"
            ON public.products
            FOR DELETE
            TO authenticated
            USING (public.is_admin());


        -- ==============================================================================
        -- 3. Dynamic Jewellery Categories Table with RLS & Gender Assignment
        -- ==============================================================================

        CREATE TABLE IF NOT EXISTS public.categories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL UNIQUE,
            gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'All')),
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
        );

        CREATE INDEX IF NOT EXISTS idx_categories_gender ON public.categories(gender);
        CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);
        CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);

        -- Automatic updated_at trigger for categories
        DROP TRIGGER IF EXISTS trigger_categories_updated_at ON public.categories;
        CREATE TRIGGER trigger_categories_updated_at
            BEFORE UPDATE ON public.categories
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();

        -- Enable RLS on categories
        ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

        -- 1. Anyone (public visitors and customers) can read categories
        DROP POLICY IF EXISTS "Public categories read access" ON public.categories;
        CREATE POLICY "Public categories read access"
            ON public.categories
            FOR SELECT
            TO public
            USING (true);

        -- 2. ONLY verified admins can insert categories
        DROP POLICY IF EXISTS "Admin insert categories" ON public.categories;
        CREATE POLICY "Admin insert categories"
            ON public.categories
            FOR INSERT
            TO authenticated
            WITH CHECK (public.is_admin());

        -- 3. ONLY verified admins can update categories
        DROP POLICY IF EXISTS "Admin update categories" ON public.categories;
        CREATE POLICY "Admin update categories"
            ON public.categories
            FOR UPDATE
            TO authenticated
            USING (public.is_admin())
            WITH CHECK (public.is_admin());

        -- 4. ONLY verified admins can delete categories
        DROP POLICY IF EXISTS "Admin delete categories" ON public.categories;
        CREATE POLICY "Admin delete categories"
            ON public.categories
            FOR DELETE
            TO authenticated
            USING (public.is_admin());

        -- Seed standard jewellery categories with assigned Category Gender
        INSERT INTO public.categories (name, gender, is_active)
        VALUES
            ('Necklace', 'Female', true),
            ('Earrings', 'Female', true),
            ('Bangles', 'Female', true),
            ('Rings', 'All', true),
            ('Bracelets', 'All', true),
            ('Sets', 'Female', true),
            ('Juda', 'Female', true),
            ('Pendant', 'All', true),
            ('Watches', 'All', true),
            ('Other Jewellery', 'All', true)
        ON CONFLICT (name) DO UPDATE
        SET is_active = EXCLUDED.is_active;


        -- ==============================================================================
        -- 4. Storage Bucket for Jewellery Photos with Hardened RLS
        -- ==============================================================================

        -- Create public bucket 'product-images' if not already created
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('product-images', 'product-images', true)
        ON CONFLICT (id) DO NOTHING;

        -- Storage RLS: Public can view photos
        DROP POLICY IF EXISTS "Public view product images" ON storage.objects;
        CREATE POLICY "Public view product images"
            ON storage.objects
            FOR SELECT
            TO public
            USING (bucket_id = 'product-images');

        -- Storage RLS: ONLY verified admins can upload photos
        DROP POLICY IF EXISTS "Admin upload product images" ON storage.objects;
        CREATE POLICY "Admin upload product images"
            ON storage.objects
            FOR INSERT
            TO authenticated
            WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

        -- Storage RLS: ONLY verified admins can update photos
        DROP POLICY IF EXISTS "Admin update product images" ON storage.objects;
        CREATE POLICY "Admin update product images"
            ON storage.objects
            FOR UPDATE
            TO authenticated
            USING (bucket_id = 'product-images' AND public.is_admin())
            WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

        -- Storage RLS: ONLY verified admins can delete photos
        DROP POLICY IF EXISTS "Admin delete product images" ON storage.objects;
        CREATE POLICY "Admin delete product images"
            ON storage.objects
            FOR DELETE
            TO authenticated
            USING (bucket_id = 'product-images' AND public.is_admin());


        -- ==============================================================================
        -- 5. Customer Reviews Table with Hardened Moderation RLS
        -- ==============================================================================

        CREATE TABLE IF NOT EXISTS public.reviews (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_name TEXT NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            title TEXT DEFAULT '',
            message TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
            product_code TEXT,
            product_name TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
        );

        -- Safe column additions for existing installations
        ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;
        ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS product_code TEXT;
        ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS product_name TEXT;

        -- Index for speedy querying
        CREATE INDEX IF NOT EXISTS idx_reviews_status_created ON public.reviews(status, created_at DESC);

        -- Enable RLS
        ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

        -- 1. Public visitors & non-admin users can ONLY read approved reviews
        DROP POLICY IF EXISTS "Public view approved reviews" ON public.reviews;
        CREATE POLICY "Public view approved reviews"
            ON public.reviews
            FOR SELECT
            TO public
            USING (status = 'approved');

        -- 2. Verified admins can view ALL reviews (pending, approved, rejected)
        DROP POLICY IF EXISTS "Admin view all reviews" ON public.reviews;
        CREATE POLICY "Admin view all reviews"
            ON public.reviews
            FOR SELECT
            TO authenticated
            USING (public.is_admin());

        -- 3. Public visitors can submit reviews, but ONLY with status = 'pending'
        DROP POLICY IF EXISTS "Public submit pending reviews" ON public.reviews;
        CREATE POLICY "Public submit pending reviews"
            ON public.reviews
            FOR INSERT
            TO public
            WITH CHECK (status = 'pending');

        -- 4. ONLY verified admins can update review status (moderate reviews)
        DROP POLICY IF EXISTS "Admin update reviews" ON public.reviews;
        CREATE POLICY "Admin update reviews"
            ON public.reviews
            FOR UPDATE
            TO authenticated
            USING (public.is_admin())
            WITH CHECK (public.is_admin());

        -- 5. ONLY verified admins can delete reviews
        DROP POLICY IF EXISTS "Admin delete reviews" ON public.reviews;
        CREATE POLICY "Admin delete reviews"
            ON public.reviews
            FOR DELETE
            TO authenticated
            USING (public.is_admin());


        -- ==============================================================================
        -- 6. Helper Snippets for Authorizing Store Administrators
        -- ==============================================================================
        -- After creating your admin user in Supabase Dashboard (Authentication -> Users),
        -- copy the SQL below, replace with your admin's email, and execute in the SQL Editor:
        --
        -- INSERT INTO public.admin_users (user_id, email, role)
        -- SELECT id, email, 'admin'
        -- FROM auth.users
    -- WHERE email = 'akshaysinh@vaidehi-imitation.com'
    -- ON CONFLICT (user_id) DO NOTHING;
    --
    -- To view currently authorized admins:
    -- SELECT * FROM public.admin_users;
    --
    -- To revoke admin privileges:
    -- DELETE FROM public.admin_users WHERE email = 'former-admin@example.com';


        -- ==============================================================================
        -- 7. Store Settings Table with Hardened RLS (Order Mode & Payment Configuration)
        -- ==============================================================================

        CREATE TABLE IF NOT EXISTS public.store_settings (
            id TEXT PRIMARY KEY DEFAULT 'default',
            order_mode TEXT NOT NULL DEFAULT 'whatsapp' CHECK (order_mode IN ('whatsapp', 'online_checkout')),
            razorpay_enabled BOOLEAN NOT NULL DEFAULT false,
            cod_enabled BOOLEAN NOT NULL DEFAULT false,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
        );

        -- Safe column additions for existing installations
        ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS order_mode TEXT NOT NULL DEFAULT 'whatsapp';
        ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS razorpay_enabled BOOLEAN NOT NULL DEFAULT false;
        ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS cod_enabled BOOLEAN NOT NULL DEFAULT false;
        ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

        -- Enable RLS on store_settings
        ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

        -- 1. Anyone (public visitors & customers) can read active store settings
        DROP POLICY IF EXISTS "Public read store settings" ON public.store_settings;
        CREATE POLICY "Public read store settings"
            ON public.store_settings
            FOR SELECT
            TO public
            USING (true);

        -- 2. ONLY verified admins can modify store settings
        DROP POLICY IF EXISTS "Admin update store settings" ON public.store_settings;
        CREATE POLICY "Admin update store settings"
            ON public.store_settings
            FOR ALL
            TO authenticated
            USING (public.is_admin())
            WITH CHECK (public.is_admin());

        -- Seed initial default settings (WhatsApp mode default, payments disabled until configured)
        INSERT INTO public.store_settings (id, order_mode, razorpay_enabled, cod_enabled)
        VALUES ('default', 'whatsapp', false, false)
        ON CONFLICT (id) DO NOTHING;


        -- ==============================================================================
        -- 8. Customer Orders Table with Hardened RLS
        -- ==============================================================================

        CREATE TABLE IF NOT EXISTS public.orders (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            order_number TEXT NOT NULL UNIQUE,
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            shipping_address TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL DEFAULT 'Gujarat',
            pincode TEXT NOT NULL,
            notes TEXT DEFAULT '',
            items JSONB NOT NULL DEFAULT '[]'::jsonb,
            subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
            shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
            total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
            payment_method TEXT NOT NULL CHECK (payment_method IN ('razorpay', 'cod', 'whatsapp')),
            payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'failed', 'cod_pending', 'refunded')),
            payment_env TEXT NOT NULL DEFAULT 'unknown' CHECK (payment_env IN ('test', 'live', 'cod', 'whatsapp', 'unknown')),
            order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
            razorpay_order_id TEXT,
            razorpay_payment_id TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
        );

        -- Performance indexes for querying orders
        CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status, payment_status);
        CREATE INDEX IF NOT EXISTS idx_orders_payment_env ON public.orders(payment_env);
        CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(customer_phone);

        -- Trigger for updated_at
        DROP TRIGGER IF EXISTS trigger_orders_updated_at ON public.orders;
        CREATE TRIGGER trigger_orders_updated_at
            BEFORE UPDATE ON public.orders
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();

        -- Enable RLS on orders
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

        -- 1. Public can insert new orders during website checkout, strictly in pending / cod_pending status
        DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
        CREATE POLICY "Public insert orders"
            ON public.orders
            FOR INSERT
            TO public
            WITH CHECK (
                order_status = 'pending'
                AND payment_status IN ('pending', 'cod_pending')
                AND (
                    (payment_method = 'cod' AND payment_status = 'cod_pending')
                    OR (payment_method IN ('razorpay', 'whatsapp') AND payment_status = 'pending')
                )
            );

        -- Unique index prevents duplicate payments across different orders at the database level
        CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id
        ON public.orders(razorpay_payment_id)
        WHERE razorpay_payment_id IS NOT NULL;

        -- 2. ONLY verified admins can view all customer orders
        DROP POLICY IF EXISTS "Admin view all orders" ON public.orders;
        CREATE POLICY "Admin view all orders"
            ON public.orders
            FOR SELECT
            TO authenticated
            USING (public.is_admin());

        -- 3. ONLY verified admins can update customer orders (update tracking, mark delivered, etc.)
        DROP POLICY IF EXISTS "Admin update orders" ON public.orders;
        CREATE POLICY "Admin update orders"
            ON public.orders
            FOR UPDATE
            TO authenticated
            USING (public.is_admin())
            WITH CHECK (public.is_admin());
        -- 4. Secure server-side confirmation RPC (Restricted to service_role)
        CREATE OR REPLACE FUNCTION public.confirm_verified_order(
            p_order_number TEXT,
            p_razorpay_order_id TEXT,
            p_razorpay_payment_id TEXT,
            p_payment_env TEXT
        )
        RETURNS JSONB
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = ''
        AS $$
        DECLARE
            v_order public.orders%ROWTYPE;
        BEGIN
            UPDATE public.orders
            SET
                payment_status = 'verified',
                order_status = 'confirmed',
                razorpay_payment_id = p_razorpay_payment_id,
                payment_env = p_payment_env,
                updated_at = timezone('utc'::text, now())
            WHERE order_number = p_order_number
              AND razorpay_order_id = p_razorpay_order_id
              AND (payment_status = 'pending' OR razorpay_payment_id = p_razorpay_payment_id)
            RETURNING * INTO v_order;

            IF NOT FOUND THEN
                RETURN jsonb_build_object('success', false, 'error', 'No matching pending order found');
            END IF;

            RETURN jsonb_build_object(
                'success', true,
                'order_number', v_order.order_number,
                'order_status', v_order.order_status,
                'payment_status', v_order.payment_status
            );
        END;
        $$;

        -- Revoke execute from public/anon/authenticated; grant only to service_role
        REVOKE EXECUTE ON FUNCTION public.confirm_verified_order FROM PUBLIC;
        REVOKE EXECUTE ON FUNCTION public.confirm_verified_order FROM anon;
        REVOKE EXECUTE ON FUNCTION public.confirm_verified_order FROM authenticated;
        GRANT EXECUTE ON FUNCTION public.confirm_verified_order TO service_role;
