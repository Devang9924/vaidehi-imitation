import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Search, Sparkles, Eye, EyeOff } from 'lucide-react';
import type { Product } from '../../types';
import { formatINR } from '../../lib/whatsapp';

interface AdminProductListProps {
  products: Product[];
  onAddNew: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => Promise<void>;
  isDeletingId: string | null;
  showSampleProducts?: boolean;
  onToggleSampleProducts?: () => void;
}

export const AdminProductList: React.FC<AdminProductListProps> = ({
  products,
  onAddNew,
  onEdit,
  onDelete,
  isDeletingId,
  showSampleProducts,
  onToggleSampleProducts,
}) => {
  const [filterText, setFilterText] = useState('');

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(filterText.toLowerCase()) ||
      p.code.toLowerCase().includes(filterText.toLowerCase()) ||
      p.category.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-4 text-left">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[#F5D8E0]">
        <div>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#1F1A1C]">
            Catalogue Management ({products.length})
          </h3>
          <p className="text-xs text-[#6E6267]">
            Add, update, or remove jewellery items from the public website.
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D4A373] via-[#B76E79] to-[#9E5863] text-white text-xs sm:text-sm font-semibold shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer pressable"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Demo / Sample Preview Mode Control for Admin */}
      {onToggleSampleProducts && (
        <div className="bg-[#FFF9FA] border border-[#F5D8E0] rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-[#1F1A1C]">
              <Sparkles className="w-3.5 h-3.5 text-[#B76E79]" />
              <span>Public Demonstration & Sample Preview Mode</span>
            </div>
            <p className="text-[11px] text-[#6E6267] mt-0.5">
              {showSampleProducts
                ? 'Sample preview items are currently ENABLED on the public catalogue for testing layout.'
                : 'Sample items are HIDDEN. The public catalogue displays only genuine showroom inventory.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleSampleProducts}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 pressable ${
              showSampleProducts
                ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                : 'bg-white border-[#F0C9D3] text-[#8B4F58] hover:bg-[#FFF0F3]'
            }`}
          >
            {showSampleProducts ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Disable Sample Preview</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-[#B76E79]" />
                <span>Enable Sample Preview (2 items)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Filter products by code, name, or category..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#F0C9D3] text-xs sm:text-sm bg-[#FFFDFE] focus:outline-hidden focus:ring-1 focus:ring-[#B76E79]"
        />
      </div>

      {/* Products Table / Cards List */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-[#FFF8F9] rounded-2xl border border-[#F5D8E0]">
            <p className="text-xs sm:text-sm text-[#6E6267]">No products match your search.</p>
          </div>
        ) : (
          filtered.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-[#F5D8E0] p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 rounded-xl bg-white border border-[#F0C9D3] shrink-0 p-0.5 flex items-center justify-center overflow-hidden">
                  <img
                    src={product.images[0] || '/images/sample-necklace-1.jpg'}
                    alt={product.name}
                    className="w-full h-full object-contain object-center"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/sample-necklace-1.jpg';
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] font-bold text-[#8B4F58]">
                      {product.code}
                    </span>
                    <span className="text-[10px] bg-[#FFF0F3] text-[#8B4F58] px-2 py-0.5 rounded-full font-medium">
                      {product.gender} • {product.category}
                    </span>
                    {product.is_sample && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                        Sample
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-[#1F1A1C] truncate mt-0.5">
                    {product.name}
                  </h4>
                  <div className="flex items-baseline gap-2 text-xs text-[#5A4E53] mt-0.5">
                    <span className="font-bold text-[#8B4F58]">
                      {formatINR(product.selling_price)}
                    </span>
                    {product.original_price > product.selling_price && (
                      <span className="line-through text-gray-400 text-[11px]">
                        {formatINR(product.original_price)}
                      </span>
                    )}
                    <span className="text-[11px] text-gray-400">
                      • {product.images.length} {product.images.length === 1 ? 'photo' : 'photos'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Right */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => onEdit(product)}
                  className="p-2 rounded-xl border border-[#F0C9D3] bg-[#FFF8F9] hover:bg-[#FCECEF] text-[#8B4F58] text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Edit product"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to remove "${product.name}" (${product.code}) from the catalogue?`)) {
                      onDelete(product.id);
                    }
                  }}
                  disabled={isDeletingId === product.id}
                  className="p-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Delete product"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeletingId === product.id ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
