import type { CartItem, Product } from '../types';

const LOCAL_CART_KEY = 'vaidehi_cart_items_v1';
export const CART_UPDATED_EVENT = 'vaidehi_cart_updated';

/**
 * Get all current cart items from local storage
 * Normalizes item.selected to true if undefined.
 */
export const getCartItems = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    if (!raw) return [];
    const parsed: CartItem[] = JSON.parse(raw);
    return parsed.map((item) => ({
      ...item,
      selected: item.selected !== false,
    }));
  } catch {
    return [];
  }
};

/**
 * Save cart items to local storage and notify listeners
 */
export const saveCartItems = (items: CartItem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: items }));
  } catch {
    // Ignore storage quota
  }
};

/**
 * Subscribe to cart changes across components
 */
export const subscribeToCart = (listener: (items: CartItem[]) => void): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }
  const handler = (e: Event) => {
    const custom = e as CustomEvent<CartItem[]>;
    listener(custom.detail || getCartItems());
  };
  window.addEventListener(CART_UPDATED_EVENT, handler);
  return () => {
    window.removeEventListener(CART_UPDATED_EVENT, handler);
  };
};

/**
 * Add a product to the cart with selected image and quantity.
 * Automatically marks newly added items as selected for checkout.
 */
export const addToCart = (
  product: Product,
  selectedImageIndex: number = 0,
  quantity: number = 1,
  fallbackImageUrl?: string
): { items: CartItem[]; addedItem: CartItem } => {
  const current = getCartItems();
  const safeImgIdx = Math.max(0, Math.min(selectedImageIndex, (product.images?.length || 1) - 1));
  const selectedImageUrl = fallbackImageUrl || (product.images && product.images[safeImgIdx]) || '';
  const itemId = `${product.id}_${safeImgIdx}`;

  const existingIndex = current.findIndex((item) => item.id === itemId);
  let updated: CartItem[];
  let targetItem: CartItem;

  if (existingIndex > -1) {
    const existing = current[existingIndex];
    const newQty = Math.min(existing.quantity + quantity, 10);
    targetItem = {
      ...existing,
      quantity: newQty,
      unit_price: product.selling_price, // Refresh price
      selected: true, // Ensure selected when customer adds more
    };
    updated = [...current];
    updated[existingIndex] = targetItem;
  } else {
    targetItem = {
      id: itemId,
      product,
      selectedImageIndex: safeImgIdx,
      selectedImageUrl,
      quantity: Math.max(1, Math.min(quantity, 10)),
      unit_price: product.selling_price,
      selected: true,
    };
    updated = [targetItem, ...current];
  }

  saveCartItems(updated);
  return { items: updated, addedItem: targetItem };
};

/**
 * Update quantity of a cart item
 */
export const updateCartQuantity = (itemId: string, quantity: number): CartItem[] => {
  const current = getCartItems();
  if (quantity <= 0) {
    return removeFromCart(itemId);
  }

  const updated = current.map((item) => {
    if (item.id === itemId) {
      return { ...item, quantity: Math.min(quantity, 10) };
    }
    return item;
  });

  saveCartItems(updated);
  return updated;
};

/**
 * Toggle selection state of an individual cart item
 */
export const toggleCartItemSelection = (itemId: string, selected?: boolean): CartItem[] => {
  const current = getCartItems();
  const updated = current.map((item) => {
    if (item.id === itemId) {
      return {
        ...item,
        selected: selected !== undefined ? selected : !item.selected,
      };
    }
    return item;
  });
  saveCartItems(updated);
  return updated;
};

/**
 * Select or deselect all items in the cart
 */
export const selectAllCartItems = (selected: boolean): CartItem[] => {
  const current = getCartItems();
  const updated = current.map((item) => ({
    ...item,
    selected,
  }));
  saveCartItems(updated);
  return updated;
};

/**
 * Get only items that are currently selected for checkout
 */
export const getSelectedCartItems = (items?: CartItem[]): CartItem[] => {
  const target = items || getCartItems();
  return target.filter((item) => item.selected !== false);
};

/**
 * Remove an item from the cart
 */
export const removeFromCart = (itemId: string): CartItem[] => {
  const current = getCartItems();
  const updated = current.filter((item) => item.id !== itemId);
  saveCartItems(updated);
  return updated;
};

/**
 * Remove only specific purchased items from the cart after order completion.
 * Unselected items stay safely in the cart.
 */
export const removePurchasedItems = (purchasedItemIds: string[]): CartItem[] => {
  const idSet = new Set(purchasedItemIds);
  const current = getCartItems();
  const remaining = current.filter((item) => !idSet.has(item.id));
  saveCartItems(remaining);
  return remaining;
};

/**
 * Clear the entire cart
 */
export const clearCart = (): void => {
  saveCartItems([]);
};

/**
 * Calculate totals for a given array of cart items
 */
export const getCartTotals = (items: CartItem[]): {
  subtotal: number;
  itemCount: number;
  totalQuantity: number;
  shippingFee: number;
  total: number;
} => {
  let subtotal = 0;
  let totalQuantity = 0;

  for (const item of items) {
    subtotal += item.unit_price * item.quantity;
    totalQuantity += item.quantity;
  }

  const shippingFee = 0;
  const total = subtotal + shippingFee;

  return {
    subtotal,
    itemCount: items.length,
    totalQuantity,
    shippingFee,
    total,
  };
};

/**
 * Calculate comprehensive selection metrics for the cart
 */
export const getSelectedCartTotals = (items: CartItem[]): {
  subtotal: number;
  selectedCount: number;
  selectedQuantity: number;
  totalItemsCount: number;
  totalQuantity: number;
  shippingFee: number;
  total: number;
  allSelected: boolean;
  noneSelected: boolean;
  selectedItems: CartItem[];
} => {
  const selectedItems = items.filter((i) => i.selected !== false);
  let subtotal = 0;
  let selectedQuantity = 0;
  let totalQuantity = 0;

  for (const item of items) {
    totalQuantity += item.quantity;
  }

  for (const item of selectedItems) {
    subtotal += item.unit_price * item.quantity;
    selectedQuantity += item.quantity;
  }

  const shippingFee = 0;
  const total = subtotal + shippingFee;

  return {
    subtotal,
    selectedCount: selectedItems.length,
    selectedQuantity,
    totalItemsCount: items.length,
    totalQuantity,
    shippingFee,
    total,
    allSelected: items.length > 0 && selectedItems.length === items.length,
    noneSelected: selectedItems.length === 0,
    selectedItems,
  };
};

/**
 * Validate cart items against live loaded products to ensure fresh prices and stock
 */
export const validateCartAgainstProducts = (
  arg1: Product[] | CartItem[],
  arg2?: Product[]
): { updatedItems: CartItem[]; hasChanged: boolean } => {
  let cartItems: CartItem[];
  let productsPool: Product[];

  if (Array.isArray(arg2)) {
    cartItems = arg1 as CartItem[];
    productsPool = arg2;
  } else {
    productsPool = arg1 as Product[];
    cartItems = getCartItems();
  }

  if (productsPool.length === 0) return { updatedItems: cartItems, hasChanged: false };

  let hasChanged = false;
  const poolMap = new Map<string, Product>();
  for (const p of productsPool) {
    poolMap.set(p.id, p);
    poolMap.set(p.code.toLowerCase(), p);
  }

  const updatedItems = cartItems.map((item) => {
    const live = poolMap.get(item.product.id) || poolMap.get(item.product.code.toLowerCase());
    if (live && live.selling_price !== item.unit_price) {
      hasChanged = true;
      return {
        ...item,
        unit_price: live.selling_price,
        product: live,
      };
    }
    return item;
  });

  if (hasChanged) {
    saveCartItems(updatedItems);
  }

  return { updatedItems, hasChanged };
};
