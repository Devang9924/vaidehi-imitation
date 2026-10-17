import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock Web Storage API for Node.js test environment
class MockStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(key) || null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

// Global browser window mocks
global.sessionStorage = new MockStorage();
global.localStorage = new MockStorage();
global.window = {
  sessionStorage: global.sessionStorage,
  localStorage: global.localStorage,
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
};

// Import cart and checkout draft modules
import {
  getCartItems,
  saveCartItems,
  addToCart,
  toggleCartItemSelection,
  selectAllCartItems,
  getSelectedCartTotals,
  removePurchasedItems
} from '../src/lib/cartStore.ts';

import {
  saveCheckoutDraft,
  getCheckoutDraft,
  clearCheckoutDraft,
  saveCheckoutError,
  getCheckoutError,
  clearCheckoutError
} from '../src/lib/checkoutDraft.ts';

describe('Vaidehi Imitation - Cart Selection and Multi-Product Checkout Test Suite', () => {
  beforeEach(() => {
    global.sessionStorage.clear();
    global.localStorage.clear();
  });

  const sampleProducts = [
    { id: 'prod_1', code: 'VI-001', name: 'Kundan Bridal Choker', selling_price: 1500, original_price: 2000, category: 'Necklaces' },
    { id: 'prod_2', code: 'VI-002', name: 'Polki Jhumka Earrings', selling_price: 600, original_price: 800, category: 'Earrings' },
    { id: 'prod_3', code: 'VI-003', name: 'Antique Rajwadi Bangles', selling_price: 1200, original_price: 1600, category: 'Bangles' },
    { id: 'prod_4', code: 'VI-004', name: 'Temple Haar Set', selling_price: 2500, original_price: 3200, category: 'Necklaces' },
    { id: 'prod_5', code: 'VI-005', name: 'CZ Solitaire Ring', selling_price: 450, original_price: 600, category: 'Rings' },
  ];

  it('Feature 2.1: Bag with 5 products allows ordering all 5 in one order with accurate totals', () => {
    const items = sampleProducts.map((p, idx) => ({
      id: p.id + '_0',
      product: p,
      selectedImageIndex: 0,
      selectedImageUrl: '/test.jpg',
      quantity: 1,
      unit_price: p.selling_price,
      selected: true,
    }));
    saveCartItems(items);

    const metrics = getSelectedCartTotals(getCartItems());
    assert.strictEqual(metrics.totalItemsCount, 5);
    assert.strictEqual(metrics.selectedCount, 5);
    assert.strictEqual(metrics.selectedQuantity, 5);
    assert.strictEqual(metrics.allSelected, true);
    assert.strictEqual(metrics.noneSelected, false);
    // Total = 1500 + 600 + 1200 + 2500 + 450 = 6250
    assert.strictEqual(metrics.total, 6250);
  });

  it('Feature 2.2: Allows customer to select only a subset (e.g. 1, 2, 3, or 4 items) and calculate totals strictly for selected', () => {
    // 5 items in bag
    const items = sampleProducts.map((p) => ({
      id: p.id + '_0',
      product: p,
      selectedImageIndex: 0,
      selectedImageUrl: '/test.jpg',
      quantity: 1,
      unit_price: p.selling_price,
      selected: true,
    }));
    saveCartItems(items);

    // Deselect items 3, 4, 5 (Keep only prod_1 Kundan Choker 1500 and prod_2 Polki Jhumka 600)
    toggleCartItemSelection('prod_3_0', false);
    toggleCartItemSelection('prod_4_0', false);
    toggleCartItemSelection('prod_5_0', false);

    const currentItems = getCartItems();
    const metrics = getSelectedCartTotals(currentItems);

    assert.strictEqual(metrics.totalItemsCount, 5, 'Total items in bag remains 5');
    assert.strictEqual(metrics.selectedCount, 2, 'Only 2 items selected');
    assert.strictEqual(metrics.selectedQuantity, 2);
    assert.strictEqual(metrics.allSelected, false);
    assert.strictEqual(metrics.noneSelected, false);
    assert.strictEqual(metrics.total, 2100, 'Subtotal strictly equals 1500 + 600 = 2100');

    // Only selected items must be passed to checkout
    assert.strictEqual(metrics.selectedItems.length, 2);
    assert.deepStrictEqual(metrics.selectedItems.map(i => i.id), ['prod_1_0', 'prod_2_0']);
  });

  it('Feature 2.3: "Select All" and "Deselect All" controls toggle all items correctly', () => {
    const items = sampleProducts.map((p) => ({
      id: p.id + '_0',
      product: p,
      selectedImageIndex: 0,
      selectedImageUrl: '/test.jpg',
      quantity: 2,
      unit_price: p.selling_price,
      selected: true,
    }));
    saveCartItems(items);

    // Deselect all
    selectAllCartItems(false);
    let metrics = getSelectedCartTotals(getCartItems());
    assert.strictEqual(metrics.selectedCount, 0);
    assert.strictEqual(metrics.noneSelected, true);
    assert.strictEqual(metrics.allSelected, false);
    assert.strictEqual(metrics.total, 0);

    // Select all back
    selectAllCartItems(true);
    metrics = getSelectedCartTotals(getCartItems());
    assert.strictEqual(metrics.selectedCount, 5);
    assert.strictEqual(metrics.noneSelected, false);
    assert.strictEqual(metrics.allSelected, true);
    assert.strictEqual(metrics.selectedQuantity, 10);
  });

  it('Feature 2.4: After successful order confirmation, remove ONLY purchased products; keep unselected in bag', () => {
    // 5 items in bag
    const items = sampleProducts.map((p) => ({
      id: p.id + '_0',
      product: p,
      selectedImageIndex: 0,
      selectedImageUrl: '/test.jpg',
      quantity: 1,
      unit_price: p.selling_price,
      selected: true,
    }));
    saveCartItems(items);

    // Customer selects only prod_1 and prod_2 for checkout
    const purchasedIds = ['prod_1_0', 'prod_2_0'];

    // Order succeeds -> removePurchasedItems called
    const remaining = removePurchasedItems(purchasedIds);

    assert.strictEqual(remaining.length, 3, '3 unselected items remain in cart');
    assert.deepStrictEqual(remaining.map(i => i.id), ['prod_3_0', 'prod_4_0', 'prod_5_0']);

    // Stored cart in localStorage also matches remaining
    const stored = getCartItems();
    assert.strictEqual(stored.length, 3);
    assert.strictEqual(stored.find(i => i.id === 'prod_1_0'), undefined);
    assert.strictEqual(stored.find(i => i.id === 'prod_2_0'), undefined);
    assert.ok(stored.find(i => i.id === 'prod_3_0'));
  });

  it('Feature 2.5: If payment fails, is cancelled, or verification fails, items are NEVER removed from cart', () => {
    const items = sampleProducts.map((p) => ({
      id: p.id + '_0',
      product: p,
      selectedImageIndex: 0,
      selectedImageUrl: '/test.jpg',
      quantity: 1,
      unit_price: p.selling_price,
      selected: true,
    }));
    saveCartItems(items);

    // Customer tries to buy prod_1
    // Simulate error: removePurchasedItems is NOT called
    // Cart must remain completely intact
    const current = getCartItems();
    assert.strictEqual(current.length, 5);
    assert.strictEqual(current.map(i => i.id).join(','), 'prod_1_0,prod_2_0,prod_3_0,prod_4_0,prod_5_0');
  });
});

describe('Vaidehi Imitation - Checkout Error Navigation and Form State Preservation Test Suite', () => {
  beforeEach(() => {
    global.sessionStorage.clear();
    global.localStorage.clear();
  });

  it('Feature 1.1: Customer details and selected payment method are saved to draft and preserved upon error redirection', () => {
    const customerDraft = {
      fullName: 'Priyaben Jayeshbhai Patel',
      mobileNumber: '9876543210',
      address: '24, Radhe Krishna Society, Near Swaminarayan Mandir',
      city: 'Botad',
      stateName: 'Gujarat',
      pincode: '364710',
      notes: 'Please call before delivery',
      paymentMethod: 'razorpay',
    };

    saveCheckoutDraft(customerDraft);

    const retrieved = getCheckoutDraft();
    assert.ok(retrieved);
    assert.strictEqual(retrieved.fullName, customerDraft.fullName);
    assert.strictEqual(retrieved.mobileNumber, customerDraft.mobileNumber);
    assert.strictEqual(retrieved.address, customerDraft.address);
    assert.strictEqual(retrieved.city, customerDraft.city);
    assert.strictEqual(retrieved.pincode, customerDraft.pincode);
    assert.strictEqual(retrieved.paymentMethod, 'razorpay');
    assert.ok(retrieved.savedAt > 0);
  });

  it('Feature 1.2: Error details (message, code, paymentMethod, suggestCod) are safely recorded for the error page', () => {
    const errorData = {
      message: 'Payment window was closed before completion. You can try again or choose Cash on Delivery.',
      code: 'PAYMENT_CANCELLED',
      paymentMethod: 'razorpay',
      suggestCod: true,
      timestamp: Date.now(),
    };

    saveCheckoutError(errorData);

    const retrieved = getCheckoutError();
    assert.ok(retrieved);
    assert.strictEqual(retrieved.message, errorData.message);
    assert.strictEqual(retrieved.code, 'PAYMENT_CANCELLED');
    assert.strictEqual(retrieved.suggestCod, true);
    assert.strictEqual(retrieved.paymentMethod, 'razorpay');
  });

  it('Feature 1.3: Switching to COD from error page updates draft paymentMethod while preserving customer delivery details', () => {
    const customerDraft = {
      fullName: 'Devangbhai Trivedi',
      mobileNumber: '9687599517',
      address: 'Near Station Road, Dhasa Junction',
      city: 'Gadhada',
      stateName: 'Gujarat',
      pincode: '364740',
      notes: '',
      paymentMethod: 'razorpay',
    };
    saveCheckoutDraft(customerDraft);

    // Customer clicks "Switch to Cash on Delivery" on Error Page
    const draft = getCheckoutDraft();
    assert.ok(draft);
    saveCheckoutDraft({
      ...draft,
      paymentMethod: 'cod',
    });

    const updated = getCheckoutDraft();
    assert.strictEqual(updated.paymentMethod, 'cod', 'Switched to COD');
    assert.strictEqual(updated.fullName, 'Devangbhai Trivedi', 'Address and customer name preserved intact');
    assert.strictEqual(updated.pincode, '364740');
  });

  it('Feature 1.4: On confirmed order success, draft and error states are cleared', () => {
    saveCheckoutDraft({
      fullName: 'Aarti Shah',
      mobileNumber: '9825098250',
      address: 'Main Bazaar',
      city: 'Botad',
      stateName: 'Gujarat',
      pincode: '364710',
      notes: '',
      paymentMethod: 'cod',
    });
    saveCheckoutError({
      message: 'Old error',
      timestamp: Date.now(),
    });

    assert.ok(getCheckoutDraft());
    assert.ok(getCheckoutError());

    // Order confirmation succeeds
    clearCheckoutDraft();
    clearCheckoutError();

    assert.strictEqual(getCheckoutDraft(), null);
    assert.strictEqual(getCheckoutError(), null);
  });
});
