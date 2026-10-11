import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Database, ListOrdered, Plus, LogOut, Copy, MessageSquare } from 'lucide-react';
import type { Product } from '../../types';
import { isSupabaseConfigured, signOutAdmin, getCurrentAdminUser } from '../../lib/supabase';
import { addProductToStore, updateProductInStore, deleteProductFromStore } from '../../lib/productStore';
import { AdminLogin } from './AdminLogin';
import { AdminProductList } from './AdminProductList';
import { AdminProductForm } from './AdminProductForm';
import { AdminReviewsList } from './AdminReviewsList';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRefreshProducts: () => Promise<void>;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  products,
  onRefreshProducts,
}) => {
  const isSupabase = isSupabaseConfigured();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentTab, setCurrentTab] = useState<'list' | 'form' | 'reviews' | 'guide'>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Check Supabase session on open
  useEffect(() => {
    if (isSupabase && isOpen) {
      getCurrentAdminUser().then((user) => {
        if (user) setIsAuthenticated(true);
      });
    }
  }, [isSupabase, isOpen]);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div
        className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-[#F5D8E0] overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="bg-[#FFF5F8] border-b border-[#F5D8E0] px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#F0C9D3] text-[#8B4F58] flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-lg sm:text-xl font-bold text-[#1F1A1C]">
                  Vaidehi Imitation Admin Portal
                </h2>
                {isSupabase ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                    Supabase Live
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                    Local Demo Mode
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#6E6267]">
                Manage catalogue products without redeploying frontend
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isAuthenticated && (
              <button
                onClick={handleSignOut}
                className="p-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-white flex items-center gap-1 transition-colors"
                title="Sign out of Admin"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-white transition-colors"
              aria-label="Close admin modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation when Authenticated */}
        {isAuthenticated && (
          <div className="bg-white border-b border-[#F5D8E0] px-4 sm:px-6 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex space-x-2 py-2">
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setCurrentTab('list');
                }}
                className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-colors ${
                  currentTab === 'list'
                    ? 'bg-[#FFF0F3] text-[#8B4F58]'
                    : 'text-[#5A4E53] hover:bg-gray-50'
                }`}
              >
                <ListOrdered className="w-4 h-4" />
                <span>Product List ({products.length})</span>
              </button>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setCurrentTab('form');
                }}
                className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-colors ${
                  currentTab === 'form'
                    ? 'bg-[#FFF0F3] text-[#8B4F58]'
                    : 'text-[#5A4E53] hover:bg-gray-50'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setCurrentTab('reviews');
                }}
                className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  currentTab === 'reviews'
                    ? 'bg-[#FFF0F3] text-[#8B4F58]'
                    : 'text-[#5A4E53] hover:bg-gray-50'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Reviews</span>
              </button>

              <button
                onClick={() => setCurrentTab('guide')}
                className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  currentTab === 'guide'
                    ? 'bg-[#FFF0F3] text-[#8B4F58]'
                    : 'text-[#5A4E53] hover:bg-gray-50'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Supabase Setup Guide</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1">
          {!isAuthenticated ? (
            <AdminLogin
              isSupabase={isSupabase}
              onLoginSuccess={() => setIsAuthenticated(true)}
              onViewSetupGuide={() => {
                setIsAuthenticated(true);
                setCurrentTab('guide');
              }}
            />
          ) : currentTab === 'form' ? (
            <AdminProductForm
              initialProduct={editingProduct}
              onSave={handleSaveProduct}
              onCancel={() => {
                setEditingProduct(null);
                setCurrentTab('list');
              }}
              isSaving={isSaving}
            />
          ) : currentTab === 'reviews' ? (
            <AdminReviewsList />
          ) : currentTab === 'guide' ? (
            /* Step-by-Step Supabase Setup Checklist */
            <div className="p-6 sm:p-8 text-left space-y-6 max-w-2xl mx-auto">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#8B4F58] block">
                  Backend Integration
                </span>
                <h3 className="font-heading text-2xl font-bold text-[#1F1A1C] mt-1">
                  Connect Supabase to Enable Multi-device Admin
                </h3>
                <p className="text-xs sm:text-sm text-[#5A4E53] mt-1 leading-relaxed">
                  Everything in the frontend is fully prepared for Supabase. Follow these 4 simple steps to connect your free Supabase database and image storage:
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-[#3E3539]">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#F5D8E0] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#8B4F58]">
                    <span className="w-5 h-5 rounded-full bg-[#8B4F58] text-white flex items-center justify-center text-xs">1</span>
                    <span>Create a Free Supabase Project</span>
                  </div>
                  <p className="pl-7 text-xs text-[#6E6267]">
                    Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#8B4F58] underline font-semibold">supabase.com</a> and sign up for a free account. Create a new project (e.g. named <code>vaidehi-imitation</code>).
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#F5D8E0] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#8B4F58]">
                    <span className="w-5 h-5 rounded-full bg-[#8B4F58] text-white flex items-center justify-center text-xs">2</span>
                    <span>Run the SQL Migration File</span>
                  </div>
                  <p className="pl-7 text-xs text-[#6E6267]">
                    In your Supabase dashboard, click <strong>SQL Editor</strong>, open the <code>supabase-schema.sql</code> file provided in this repository, paste its contents and click <strong>Run</strong>. This creates the <code>products</code> table, Row Level Security policies, and the <code>product-images</code> storage bucket.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#F5D8E0] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#8B4F58]">
                    <span className="w-5 h-5 rounded-full bg-[#8B4F58] text-white flex items-center justify-center text-xs">3</span>
                    <span>Create & Authorize Admin User</span>
                  </div>
                  <p className="pl-7 text-xs text-[#6E6267] leading-relaxed">
                    In Supabase, go to <strong>Authentication &gt; Users</strong> and click <strong>Add User</strong>. Then in <strong>SQL Editor</strong>, authorize the user in <code>admin_users</code>:
                    <code className="block mt-1.5 p-2 bg-white rounded border border-[#F0C9D3] font-mono text-[11px] text-[#8B4F58]">
                      INSERT INTO public.admin_users (user_id, email, role) SELECT id, email, 'admin' FROM auth.users WHERE email = 'your-email@example.com';
                    </code>
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#F5D8E0] space-y-2">
                  <div className="flex items-center justify-between font-bold text-[#8B4F58]">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#8B4F58] text-white flex items-center justify-center text-xs">4</span>
                      <span>Add Environment Variables (.env)</span>
                    </div>
                    <button
                      onClick={handleCopyEnv}
                      className="text-xs font-semibold text-[#8B4F58] flex items-center gap-1 hover:underline"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedSnippet ? 'Copied!' : 'Copy Template'}</span>
                    </button>
                  </div>
                  <p className="pl-7 text-xs text-[#6E6267]">
                    Copy your <strong>Project URL</strong> and <strong>anon public key</strong> from <strong>Project Settings &gt; API</strong> and add them to your <code>.env</code> file (or Vercel project environment variables).
                  </p>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setCurrentTab('list')}
                  className="px-6 py-2.5 rounded-full bg-[#8B4F58] text-white text-xs sm:text-sm font-semibold hover:bg-[#9E5863] transition-colors"
                >
                  Return to Product List
                </button>
              </div>
            </div>
          ) : (
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
            />
          )}
        </div>

      </div>
    </div>
  );
};
