-- ==============================================================================
-- VAIDEHI IMITATION - ORDERS & SETTINGS MIGRATION SCRIPT
-- ==============================================================================
-- Run this in your Supabase Dashboard -> SQL Editor -> New Query -> Run
-- This script creates the missing public.orders and public.store_settings tables,
-- columns, indexes, and Row Level Security (RLS) policies.
-- Safe to run on existing databases (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
-- ==============================================================================

-- 1. Ensure updated_at trigger function exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create public.orders table
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

-- Safe column additions if table already partially existed
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_env TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status, payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_env ON public.orders(payment_env);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- 4. Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Ensure is_admin() function exists
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

-- 5. Row Level Security (RLS) for public.orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 5a. Public customers can insert orders during website checkout
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
CREATE POLICY "Public insert orders"
    ON public.orders
    FOR INSERT
    TO public
    WITH CHECK (true);

-- 5b. Authenticated admins can view all orders
DROP POLICY IF EXISTS "Admin view all orders" ON public.orders;
CREATE POLICY "Admin view all orders"
    ON public.orders
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- 5c. Authenticated admins can update customer order fulfillment & tracking
DROP POLICY IF EXISTS "Admin update orders" ON public.orders;
CREATE POLICY "Admin update orders"
    ON public.orders
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6. Store Settings Table (also missing in schema cache)
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    order_mode TEXT NOT NULL DEFAULT 'whatsapp' CHECK (order_mode IN ('whatsapp', 'online_checkout')),
    razorpay_enabled BOOLEAN NOT NULL DEFAULT false,
    cod_enabled BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read store settings" ON public.store_settings;
CREATE POLICY "Public read store settings"
    ON public.store_settings
    FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Admin update store settings" ON public.store_settings;
CREATE POLICY "Admin update store settings"
    ON public.store_settings
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Seed default settings
INSERT INTO public.store_settings (id, order_mode, razorpay_enabled, cod_enabled)
VALUES ('default', 'whatsapp', false, false)
ON CONFLICT (id) DO NOTHING;

-- 7. Notify PostgREST to reload schema cache immediately
NOTIFY pgrst, 'reload schema';
