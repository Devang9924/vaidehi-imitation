import React, { useState, useEffect } from 'react';
import {
  ListOrdered,
  Plus,
  Tags,
  MessageSquare,
  Database,
  LogOut,
  ArrowLeft,
  Copy,
  Settings,
  PackageCheck,
} from 'lucide-react';
import type { Product, StoreSettings } from '../../types';
import { isSupabaseConfigured, signOutAdmin, getCurrentAdminUser } from '../../lib/supabase';
import { addProductToStore, updateProductInStore, deleteProductFromStore } from '../../lib/productStore';
import { AdminLogin } from './AdminLogin';
import { AdminProductList } from './AdminProductList';
import { AdminProductForm } from './AdminProductForm';
import { AdminCategoryManager } from './AdminCategoryManager';
import { AdminReviewsList } from './AdminReviewsList';
import { AdminOrderSettings } from './AdminOrderSettings';
import { AdminOrdersList } from './AdminOrdersList';

export type AdminTab = 'list' | 'form' | 'orders' | 'settings' | 'categories' | 'reviews' | 'guide';

interface AdminPageProps {
  products: Product[];
  onRefreshProducts: () => Promise<void>;
  onNavigateHome: () => void;
  showSampleProducts?: boolean;
  onToggleSampleProducts?: () => void;
  storeSettings?: StoreSettings;
  onSettingsUpdated?: (newSettings: StoreSettings) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  products,
  onRefreshProducts,
  onNavigateHome,
  showSampleProducts,
  onToggleSampleProducts,
  storeSettings,
  onSettingsUpdated,
}) => {
  const isSupabase = isSupabaseConfigured();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentTab, setCurrentTab] = useState<AdminTab>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check Supabase session on mount
  useEffect(() => {
    if (isSupabase) {
      getCurrentAdminUser()
        .then((user) => {
          if (user) setIsAuthenticated(true);
        })
        .finally(() => {
          setCheckingSession(false);
        });
    } else {
      setCheckingSession(false);
    }
  }, [isSupabase]);

  const handleSignOut = async () => {
    if (isSupabase) {
      await signOutAdmin();
    }
    setIsAuthenticated(false);
    setCurrentTab('list');
    setEditingProduct(null);
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id'>) => {
    setIsSaving(true);
    try {
      if (editingProduct) {
        const { error } = await updateProductInStore(editingProduct.id, productData);
        if (error) throw new Error(error);
      } else {
        const { error } = await addProductToStore(productData);
        if (error) throw new Error(error);
      }
      await onRefreshProducts();
      setEditingProduct(null);
      setCurrentTab('list');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setIsDeletingId(id);
    try {
      const { error } = await deleteProductFromStore(id);
      if (error) throw new Error(error);
      await onRefreshProducts();
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleCopyEnv = () => {
    const snippet = `VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-public-key`;
    navigator.clipboard.writeText(snippet).then(() => {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    });
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#FFF8F9] flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-3 border-[#8B4F58] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-[#8B4F58] font-medium">Verifying admin session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF9FA] text-[#1F1A1C] flex flex-col antialiased">
      {/* Top Admin Header Bar */}
      <header className="bg-white border-b border-[#F5D8E0] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onNavigateHome}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-[#FFF0F3] transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Return to Customer Storefront"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Store</span>
            </button>

            <div className="h-5 w-px bg-gray-200 hidden sm:block"></div>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFF0F3] to-[#FCE4E9] border border-[#D4A373] flex items-center justify-center font-brand font-bold text-xs text-[#8B4F58]">
                VI
              </div>
              <div>
                <h1 className="font-heading text-sm sm:text-base font-bold text-[#1F1A1C] leading-tight">
                  Vaidehi Imitation • Admin Portal
                </h1>
                <span className="text-[10px] text-[#8B4F58] font-medium block">
                  Dedicated Management Route (/admin)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isSupabase ? (
              <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="hidden sm:inline">Supabase Live</span>
              </span>
            ) : (
              <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span className="hidden sm:inline">Backend Unconnected</span>
              </span>
            )}

            {isAuthenticated && (
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation when Authenticated */}
        {isAuthenticated && (
          <div className="bg-[#FFFDFD] border-t border-gray-100 px-4 sm:px-8 flex overflow-x-auto gap-2 py-2 text-xs sm:text-sm">
            <button
              onClick={() => {
                setEditingProduct(null);
                setCurrentTab('list');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'list'
                  ? 'bg-[#FFF0F3] text-[#8B4F58] border border-[#F5B8C7]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Products ({products.length})</span>
            </button>

            <button
              onClick={() => {
                setEditingProduct(null);
                setCurrentTab('form');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'form'
                  ? 'bg-[#FFF0F3] text-[#8B4F58] border border-[#F5B8C7]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>

            <button
              onClick={() => {
                setEditingProduct(null);
                setCurrentTab('orders');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'orders'
                  ? 'bg-[#FFF0F3] text-[#8B4F58] border border-[#F5B8C7]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              <span>Customer Orders</span>
            </button>

            <button
              onClick={() => {
                setEditingProduct(null);
                setCurrentTab('settings');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'settings'
                  ? 'bg-[#FFF0F3] text-[#8B4F58] border border-[#F5B8C7]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Order & Payment Settings</span>
            </button>

            <button
              onClick={() => {
                setEditingProduct(null);
                setCurrentTab('categories');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'categories'
                  ? 'bg-[#FFF0F3] text-[#8B4F58] border border-[#F5B8C7]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Tags className="w-4 h-4" />
              <span>Manage Categories</span>
            </button>

            <button
              onClick={() => setCurrentTab('reviews')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'reviews'
                  ? 'bg-[#FFF0F3] text-[#8B4F58] border border-[#F5B8C7]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Customer Reviews Moderation</span>
            </button>

            <button
              onClick={() => setCurrentTab('guide')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                currentTab === 'guide'
                  ? 'bg-[#FFF0F3] text-[#8B4F58] border border-[#F5B8C7]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Supabase Guide</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto pt-8">
            <div className="bg-white rounded-3xl border border-[#F5D8E0] shadow-sm p-6 sm:p-8">
              <AdminLogin
                isSupabase={isSupabase}
                onLoginSuccess={() => setIsAuthenticated(true)}
                onViewSetupGuide={() => {
                  setCurrentTab('guide');
                }}
              />

              {currentTab === 'guide' && (
                <div className="p-4 border-t border-gray-100 text-left space-y-3">
                  <h4 className="font-heading font-bold text-sm text-[#8B4F58] flex items-center gap-1.5">
                    <Database className="w-4 h-4" />
                    <span>Supabase Setup Summary</span>
                  </h4>
                  <ol className="text-xs text-gray-600 space-y-1.5 list-decimal pl-4 leading-relaxed">
                    <li>Create free project at <strong>supabase.com</strong>.</li>
                    <li>Run <code>supabase-schema.sql</code> in SQL Editor.</li>
                    <li>Create admin user in <strong>Authentication &gt; Users</strong>.</li>
                    <li>Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env</code>.</li>
                  </ol>
                  <button
                    onClick={handleCopyEnv}
                    className="text-xs font-semibold text-[#8B4F58] flex items-center gap-1 hover:underline pt-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedSnippet ? 'Copied template!' : 'Copy .env snippet'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : currentTab === 'orders' ? (
          <div className="bg-white rounded-3xl border border-[#F5D8E0] shadow-2xs max-w-6xl mx-auto overflow-hidden">
            <AdminOrdersList />
          </div>
        ) : currentTab === 'settings' ? (
          <div className="bg-white rounded-3xl border border-[#F5D8E0] shadow-2xs max-w-4xl mx-auto p-4 sm:p-6">
            <AdminOrderSettings
              initialSettings={storeSettings}
              onSettingsSaved={onSettingsUpdated}
            />
          </div>
        ) : currentTab === 'form' ? (
          <div className="bg-white rounded-3xl border border-[#F5D8E0] shadow-2xs p-4 sm:p-6 max-w-4xl mx-auto">
            <AdminProductForm
              initialProduct={editingProduct}
              onSave={handleSaveProduct}
              onCancel={() => {
                setEditingProduct(null);
                setCurrentTab('list');
              }}
              isSaving={isSaving}
            />
          </div>
        ) : currentTab === 'categories' ? (
          <div className="bg-white rounded-3xl border border-[#F5D8E0] shadow-2xs max-w-5xl mx-auto overflow-hidden">
            <AdminCategoryManager
              products={products}
              onCategoriesChanged={onRefreshProducts}
            />
          </div>
        ) : currentTab === 'reviews' ? (
          <div className="bg-white rounded-3xl border border-[#F5D8E0] shadow-2xs max-w-5xl mx-auto overflow-hidden">
            <AdminReviewsList />
          </div>
        ) : currentTab === 'guide' ? (
          <div className="bg-white rounded-3xl border border-[#F5D8E0] shadow-2xs p-6 sm:p-8 max-w-3xl mx-auto text-left space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B4F58] block">
                Backend Configuration
              </span>
              <h2 className="font-heading text-2xl font-bold text-[#1F1A1C] mt-1">
                Supabase Database & Authentication Setup
              </h2>
              <p className="text-xs sm:text-sm text-[#5A4E53] mt-1 leading-relaxed">
                Connect your Supabase project to enable cloud storage, persistent catalogue syncing, and customer review moderation.
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#3E3539]">
              <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#F5D8E0] space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#8B4F58]">
                  <span className="w-5 h-5 rounded-full bg-[#8B4F58] text-white flex items-center justify-center text-xs">1</span>
                  <span>Create Supabase Project</span>
                </div>
                <p className="pl-7 text-xs text-[#6E6267]">
                  Register on <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#8B4F58] underline font-semibold">supabase.com</a> and create a new project.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#F5D8E0] space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#8B4F58]">
                  <span className="w-5 h-5 rounded-full bg-[#8B4F58] text-white flex items-center justify-center text-xs">2</span>
                  <span>Execute SQL Migration</span>
                </div>
                <p className="pl-7 text-xs text-[#6E6267]">
                  Open <strong>SQL Editor</strong> in Supabase, paste all statements from <code>supabase-schema.sql</code>, and click <strong>Run</strong>. This creates the <code>products</code>, <code>reviews</code>, <code>store_settings</code>, and <code>orders</code> tables with Row Level Security (RLS) policies.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#F5D8E0] space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#8B4F58]">
                  <span className="w-5 h-5 rounded-full bg-[#8B4F58] text-white flex items-center justify-center text-xs">3</span>
                  <span>Create & Authorize Admin User</span>
                </div>
                <p className="pl-7 text-xs text-[#6E6267] leading-relaxed">
                  Go to <strong>Authentication &gt; Users</strong> and click <strong>Add User</strong>. Then in <strong>SQL Editor</strong>, run:
                  <code className="block mt-1.5 p-2 bg-white rounded border border-[#F0C9D3] font-mono text-[11px] text-[#8B4F58]">
                    INSERT INTO public.admin_users (user_id, email, role) SELECT id, email, 'admin' FROM auth.users WHERE email = 'your-email@example.com';
                  </code>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#F5D8E0] space-y-2">
                <div className="flex items-center justify-between font-bold text-[#8B4F58]">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#8B4F58] text-white flex items-center justify-center text-xs">4</span>
                    <span>Set Environment Variables</span>
                  </div>
                  <button
                    onClick={handleCopyEnv}
                    className="text-xs font-semibold text-[#8B4F58] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedSnippet ? 'Copied!' : 'Copy Template'}</span>
                  </button>
                </div>
                <p className="pl-7 text-xs text-[#6E6267]">
                  Copy your Project URL and anon public key from <strong>Project Settings &gt; API</strong> and place them into <code>.env</code>.
                </p>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setCurrentTab('list')}
                className="px-6 py-2.5 rounded-full bg-[#8B4F58] text-white text-xs sm:text-sm font-semibold hover:bg-[#9E5863] transition-colors cursor-pointer"
              >
                Return to Product List
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#F5D8E0] shadow-2xs max-w-5xl mx-auto overflow-hidden">
            <AdminProductList
              products={products}
              onAddNew={() => {
                setEditingProduct(null);
                setCurrentTab('form');
              }}
              onEdit={(prod) => {
                setEditingProduct(prod);
                setCurrentTab('form');
              }}
              onDelete={handleDeleteProduct}
              isDeletingId={isDeletingId}
              showSampleProducts={showSampleProducts}
              onToggleSampleProducts={onToggleSampleProducts}
            />
          </div>
        )}
      </main>

      {/* Admin Footer */}
      <footer className="bg-white border-t border-gray-100 py-4 px-4 text-center text-xs text-gray-400">
        Vaidehi Imitation Administrative System • Authenticated Session Protected
      </footer>
    </div>
  );
};
