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
