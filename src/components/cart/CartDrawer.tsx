import React, { useEffect, useState, useMemo } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck,
  CheckSquare,
  Square
} from 'lucide-react';
import type { CartItem } from '../../types';
import { 
  getCartItems, 
  removeFromCart, 
  updateCartQuantity, 
  subscribeToCart, 
  getSelectedCartTotals,
  toggleCartItemSelection,
  selectAllCartItems
} from '../../lib/cartStore';
import { formatINR } from '../../lib/whatsapp';

interface CartDrawerProps {
  isOpen: boolean;
  items?: CartItem[];
  onClose: () => void;
  onProceedToCheckout: () => void;
  onContinueShopping?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  items: propsItems,
  onClose,
  onProceedToCheckout,
  onContinueShopping,
}) => {
  const [internalItems, setInternalItems] = useState<CartItem[]>(() => propsItems || getCartItems());

  useEffect(() => {
    if (propsItems) {
      setInternalItems(propsItems);
    }
  }, [propsItems]);

  useEffect(() => {
    const unsubscribe = subscribeToCart((updated) => {
      setInternalItems(updated);
    });
    return unsubscribe;
  }, []);

  const currentItems = propsItems || internalItems;
  const selectionMetrics = useMemo(() => getSelectedCartTotals(currentItems), [currentItems]);

  const handleCheckoutClick = () => {
    if (selectionMetrics.noneSelected) return;
    onProceedToCheckout();
  };

  const handleContinue = () => {
    if (onContinueShopping) onContinueShopping();
    else onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#F5D8E0] animate-slide-in-right">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#F5D8E0] flex items-center justify-between bg-[#FFF8F9]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FFF0F3] border border-[#F5B8C7] flex items-center justify-center text-[#8B4F58]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-[#1F1A1C]">
                  Your Shopping Bag
                </h3>
                <span className="text-[11px] text-[#8B4F58] font-medium">
                  {selectionMetrics.totalItemsCount} {selectionMetrics.totalItemsCount === 1 ? 'item' : 'items'} in bag
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-[#FFF0F3] transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Selection Controls Bar (Visible when bag has items) */}
          {currentItems.length > 0 && (
            <div className="px-4 sm:px-5 py-2.5 bg-[#FFF5F7] border-b border-[#F5D8E0] flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => selectAllCartItems(!selectionMetrics.allSelected)}
                className="flex items-center gap-2 text-[#4A3F44] font-medium hover:text-[#8B4F58] cursor-pointer transition-colors"
              >
                {selectionMetrics.allSelected ? (
                  <CheckSquare className="w-4 h-4 text-[#8B4F58]" />
                ) : (
                  <Square className="w-4 h-4 text-gray-400" />
                )}
                <span>{selectionMetrics.allSelected ? 'Deselect All' : 'Select All'}</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#8B4F58] font-semibold bg-white px-2 py-0.5 rounded-full border border-[#F5D8E0]">
                  {selectionMetrics.selectedCount} of {selectionMetrics.totalItemsCount} selected
                </span>
                {selectionMetrics.selectedCount > 0 && !selectionMetrics.allSelected && (
                  <button
                    type="button"
                    onClick={() => selectAllCartItems(false)}
                    className="text-[10px] text-gray-500 hover:text-red-600 underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {currentItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#FFF0F3] flex items-center justify-center text-[#8B4F58]">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h4 className="font-heading text-lg font-bold text-[#1F1A1C]">
                  Your Shopping Bag is Empty
                </h4>
                <p className="text-xs text-[#6E6267] max-w-xs leading-relaxed">
                  Browse our handcrafted imitation necklaces, bridal sets, and bangles to add items to your bag.
                </p>
                <button
                  onClick={handleContinue}
                  className="mt-3 px-6 py-2.5 rounded-full bg-[#8B4F58] text-white text-xs font-semibold hover:bg-[#9E5863] transition-colors shadow-2xs cursor-pointer"
                >
                  Explore Jewellery
                </button>
              </div>
            ) : (
              currentItems.map((item) => {
                const isSelected = item.selected !== false;
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center gap-3 shadow-2xs ${
                      isSelected
                        ? 'border-[#F5D8E0] bg-[#FFFDFC] hover:border-[#E8A5B8]'
                        : 'border-gray-200 bg-gray-50/70 opacity-60'
                    }`}
                  >
                    {/* Item Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleCartItemSelection(item.id)}
                      className="cursor-pointer text-[#8B4F58] hover:scale-110 transition-transform shrink-0 p-0.5"
                      aria-label={isSelected ? `Deselect ${item.product.name}` : `Select ${item.product.name}`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#8B4F58]" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {/* Item Image */}
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-[#FFF5F8] border border-[#F0C9D3] shrink-0 p-1 flex items-center justify-center">
                      <img
                        src={item.selectedImageUrl || (item.product.images && item.product.images[0]) || '/images/sample-necklace-1.jpg'}
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/sample-necklace-1.jpg';
                        }}
                      />
                    </div>

                    {/* Item Info & Quantity Stepper */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono text-[#8B4F58] font-bold block truncate">
                            {item.product.code}
                          </span>
                          <h4 className="font-heading text-xs sm:text-sm font-semibold text-[#1F1A1C] truncate leading-tight">
                            {item.product.name}
                          </h4>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-600 p-1 transition-colors cursor-pointer shrink-0"
                          title="Remove piece"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100">
                        <span className="text-xs sm:text-sm font-bold text-[#1F1A1C]">
                          {formatINR(item.unit_price * item.quantity)}
                        </span>

                        {/* Stepper */}
                        <div className="flex items-center gap-1.5 bg-[#FFF0F3] border border-[#F5B8C7] rounded-lg px-1.5 py-0.5">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-[#8B4F58] hover:bg-white transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-[#8B4F58] w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-[#8B4F58] hover:bg-white transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Totals and Checkout CTA */}
          {currentItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#F5D8E0] bg-[#FFF8F9] space-y-3">
              <div className="space-y-1.5 text-xs text-[#5A4E53]">
                <div className="flex justify-between">
                  <span>Selected Pieces</span>
                  <span className="font-semibold text-[#1F1A1C]">
                    {selectionMetrics.selectedQuantity} {selectionMetrics.selectedQuantity === 1 ? 'piece' : 'pieces'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Selected Subtotal</span>
                  <span className="font-semibold text-[#1F1A1C]">
                    {formatINR(selectionMetrics.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Courier Shipping</span>
                  <span className="text-emerald-700 font-semibold">Free Delivery</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#F0C9D3] text-sm sm:text-base font-bold text-[#1F1A1C]">
                  <span>Total Payable</span>
                  <span className="text-[#8B4F58]">{formatINR(selectionMetrics.total)}</span>
                </div>
              </div>

              {selectionMetrics.noneSelected ? (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center text-xs text-amber-800">
                  Please select at least one item above to proceed with checkout.
                </div>
              ) : null}

              <button
                onClick={handleCheckoutClick}
                disabled={selectionMetrics.noneSelected}
                className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-[#D4A373] via-[#B76E79] to-[#9E5863] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-105 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed pressable"
              >
                <span>
                  {selectionMetrics.noneSelected
                    ? 'Select Items to Checkout'
                    : `Checkout Selected Items (${selectionMetrics.selectedQuantity})`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unselected pieces will remain safe in your cart</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
