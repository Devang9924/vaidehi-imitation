# Vaidehi Imitation (વૈદેહી ઇમિટેશન) — Premium Jewellery Catalogue

> **Exclusive Bridal, Traditional & Fashion Imitation Jewellery**  
> **Location:** Near Bank of Baroda, Dhasa Railway Station Road, Dhasa Junction, Taluka Gadhada, District Botad, Gujarat, PIN 364740  
> **Proprietor:** Akshaysinh Kher  
> **WhatsApp / Phone:** +91 96875 99517  
> **Instagram:** [@vaidehi_imitation_dhasa](https://www.instagram.com/vaidehi_imitation_dhasa?rpxt=MXBxd244b3pocWV6eg==) (10K+ Followers)

---

## 💎 About the Project

**Vaidehi Imitation** is an elegant, mobile-first e-commerce catalogue web application designed for a premier imitation jewellery business situated in **Dhasa Junction, Gujarat**.

The platform is designed to offer a luxury shopping experience reflecting royal Indian heritage with a color palette of light blush pink, warm white, and radiant soft rose gold. It enables customers across Saurashtra, Gujarat, and India to browse authentic jewellery designs and place orders or inquiries directly with the owner on WhatsApp — eliminating payment gateway complications and fake stock claims.

---

## ✨ Key Features

1. **Brand Aesthetic & Design System:**
   - Soft blush pink (`#FFF8F9`, `#FFF0F3`), crisp white, and rose gold gradients (`#ECC8AF` to `#B76E79`).
   - Editorial serif typography (**Cormorant Garamond** and **Cinzel**) combined with **Plus Jakarta Sans** for maximum readability.
   - Rounded-3xl luxury product cards with subtle rose-gold shadows, multi-image indicators, and smooth hover interactions.
   - Fully responsive across mobile smartphones, tablets, and desktop displays.

2. **Dual-Action Filtering & Search:**
   - **Gender Collections:** Filter by *Women's Collection (Female)*, *Men's Collection (Male)*, or *All Collections*.
   - **Category Pills:** *Necklace*, *Earrings*, *Bangles*, *Rings*, *Bracelets*, *Sets*, *Juda*, *Pendant*, *Watches*, and *Other Jewellery*.
   - **Coordinated Filters:** Category and gender filters operate simultaneously with real-time text search and price/discount sorting.

3. **Product Detail View & Unlimited Image Gallery:**
   - High-resolution modal with thumbnail navigation supporting multiple photos without a hardcoded limit of three.
   - Accurate dynamic discount calculation (`Save X%`).
   - Instant shareable link for each product.

4. **Direct WhatsApp Inquiry & Validated Ordering:**
   - **Quick Inquiry:** Opens WhatsApp with a prefilled message containing the product name, unique code, selling price, and catalogue URL.
   - **Buy Now Order Form:** Captures Customer Name, 10-digit Indian Mobile Number (validated), Full Delivery Address, and 6-digit Postal PIN Code (validated).
   - Generates a prefilled WhatsApp order dispatch draft sent directly to **Akshaysinh Kher (+91 96875 99517)**.
   - Transparent policy: No payment gateway required upfront; orders and availability are confirmed personally.

5. **Transparency & Real Customer Reviews:**
   - No fabricated star ratings, artificial reviews, or unverified claims.
   - Interactive **Customer Review Submission Form** with 1–5 star rating, name, optional title, and message.
   - Reviews are submitted to Supabase as `pending` status and only appear publicly once approved by an authorized administrator.
   - Input sanitization, client-side validation, and client rate-limiting prevent duplicate spam.
   - Demo products are explicitly labelled with a `[DEMO SAMPLE]` badge and can be toggled on/off to preview a clean catalogue state.
   - Instagram follower count highlight accurately references the official `@vaidehi_imitation_dhasa` profile (10K+ Followers).

6. **Dedicated `/admin` Route & Review Moderation:**
   - Dedicated route at `/admin` (and `#/admin`) with zero visible links on public headers or footers.
   - Secure login page protected by Supabase Auth — no hardcoded credentials or bypasses.
   - Owner dashboard with two core tabs: **Products Management** and **Customer Reviews Moderation** (Approve, Reject, or Delete submissions).
   - Supabase Row Level Security (RLS) policies enforce that only authenticated admins can moderate reviews or manage products.

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18 or higher recommended; v25 tested)
- npm (v9 or higher)

### Installation & Startup
```bash
# 1. Clone the repository (if not already done)
git clone https://github.com/Devang9924/vaidehi-imitation.git
cd vaidehi-imitation

# 2. Install dependencies
npm install

# 3. Start the Vite local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Verification Commands
```bash
# Run TypeScript compilation and production build
npm run build

# Run code linter
npm run lint
```

---

## 🗄️ Setting Up the Online Admin Panel with Supabase (Free Tier)

The application code is already structured to switch automatically to Supabase the moment environment variables are supplied. Follow these steps:

### Step 1: Create a Free Supabase Project
1. Visit [supabase.com](https://supabase.com) and create a free account.
2. Click **New Project** and name it `vaidehi-imitation`. Select the nearest region (e.g., *South Asia - Mumbai*).

### Step 2: Run the Database Schema Migration
1. In your Supabase Dashboard, open the **SQL Editor** from the left navigation.
2. Open the file `supabase-schema.sql` located in this project's root folder.
3. Paste the entire SQL content into the SQL Editor and click **Run**.
4. This creates:
   - The `products` table with all fields (`code`, `name`, `gender`, `category`, `description`, `original_price`, `selling_price`, `images`, `in_stock`).
   - The `reviews` table (`id`, `customer_name`, `rating`, `title`, `message`, `status`, `created_at`).
   - Row Level Security (RLS) policies allowing public read of products and approved reviews, public submission of pending reviews, and authenticated admin management of both.
   - The public storage bucket `product-images` for photos.

### Step 3: Create and Authorize the Admin Account
1. In your Supabase Dashboard, go to **Authentication > Users**.
2. Click **Add User > Create User**.
3. Enter an email (e.g., `akshaysinh@vaidehi-imitation.com`) and a strong password.
4. Go to **SQL Editor** and run the helper query to grant this account the admin role in `admin_users`:
```sql
INSERT INTO public.admin_users (user_id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'akshaysinh@vaidehi-imitation.com'
ON CONFLICT (user_id) DO NOTHING;
```
*(Only users listed in `public.admin_users` can perform product and review management).*

### Step 4: Configure Environment Variables
1. In your project root, create a file named `.env` based on `.env.example`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
*(Find these keys under **Project Settings > API** in Supabase).*

2. Restart your local server (`npm run dev`).
3. Access the administrative portal directly at **`/admin`** (or `#/admin`): `http://localhost:5173/admin`
4. Sign in with the credentials created in Step 3.
5. You can now manage jewellery products and approve/reject customer reviews!

---

## 🌐 Deploying to Vercel (Free)

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Initial release of Vaidehi Imitation catalogue"
   git push origin main
   ```
2. Log in to [vercel.com](https://vercel.com) and click **Add New > Project**.
3. Import your `vaidehi-imitation` repository.
4. Framework Preset will automatically detect **Vite**.
5. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy**. Your website will be live in under a minute with free SSL!

---

## 📁 Project Architecture

```
vaidehi-imitation/
├── public/
│   ├── favicon.svg              # Brand monogram crest favicon
│   └── images/
│       ├── hero-jewellery.jpg    # Bridal jewellery showcase image
│       ├── sample-necklace-1.jpg # Demo Kundan choker necklace (angle 1)
│       ├── sample-necklace-2.jpg # Matching jhumka earrings (angle 2)
│       ├── sample-kada-1.jpg     # Demo men's royal lion kada (angle 1)
│       └── sample-kada-2.jpg     # Men's kada side profile (angle 2)
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminLogin.tsx       # Supabase auth login & demo mode switcher
│   │   │   ├── AdminModal.tsx       # Main admin container & setup checklist
│   │   │   ├── AdminProductForm.tsx # Add/edit product with multi-photo upload
│   │   │   └── AdminProductList.tsx # Product inventory list with edit/delete
│   │   ├── icons/
│   │   │   └── InstagramIcon.tsx    # Clean SVG Instagram icon
│   │   ├── AboutSection.tsx         # Business story, proprietor Akshaysinh Kher
│   │   ├── BuyOrderModal.tsx        # WhatsApp order form with input validation
│   │   ├── CategoryNav.tsx          # Dual gender & category pill filtering
│   │   ├── ContactSection.tsx       # Showroom address, hours, and directions
│   │   ├── Footer.tsx               # Footer with links & owner portal access
│   │   ├── Header.tsx               # Announcement bar, logo, search, and call
│   │   ├── Hero.tsx                 # Hero section with jewellery visual & CTAs
│   │   ├── InstagramBanner.tsx      # Editable 10K+ followers social highlight
│   │   ├── MobileBottomBar.tsx      # Sticky mobile bottom action bar
│   │   ├── ProductCard.tsx          # Card with price, discount, and gallery
│   │   ├── ProductDetailModal.tsx   # Detailed modal with multi-image gallery
│   │   ├── ProductGrid.tsx          # Catalogue grid with loading & empty states
│   │   └── ReviewsSection.tsx       # Transparent genuine customer review section
│   ├── data/
│   │   ├── business.ts              # Business details, address, phone & categories
│   │   ├── sampleProducts.ts        # Clearly labelled demo products
│   │   └── reviews.ts               # Verified reviews repository
│   ├── lib/
│   │   ├── productStore.ts          # Unified repository (Supabase + local demo)
│   │   ├── supabase.ts              # Supabase client, auth, CRUD & image storage
│   │   └── whatsapp.ts              # Formatted WhatsApp message link builders
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces and types
│   ├── App.tsx                      # Root application component
│   ├── index.css                    # Tailwind CSS tokens & luxury styling
│   └── main.tsx                     # Vite React entrypoint
├── .env.example                     # Environment variables template
├── supabase-schema.sql              # Supabase database & storage SQL migration
├── package.json                     # Dependencies and scripts
└── vite.config.ts                   # Vite + Tailwind configuration
```

---

## 📞 Business Contact

- **Proprietor:** Akshaysinh Kher
- **Showroom:** Vaidehi Imitation, Near Bank of Baroda, Dhasa Railway Station Road, Dhasa Junction, Taluka Gadhada, District Botad, Gujarat, PIN 364740
- **Phone & WhatsApp:** +91 96875 99517
- **Instagram:** [@vaidehi_imitation_dhasa](https://www.instagram.com/vaidehi_imitation_dhasa?rpxt=MXBxd244b3pocWV6eg==)
