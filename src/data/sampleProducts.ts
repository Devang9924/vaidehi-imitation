import type { Product } from '../types';

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'sample-01',
    code: 'SAMPLE-VI-NK-01',
    name: '[DEMO SAMPLE] Royal Kundan Choker Necklace Set',
    gender: 'Female',
    category: 'Sets',
    description: 'DEMO SAMPLE PRODUCT (NOT FOR SALE): A regal bridal Kundan choker necklace with emerald green drops and pearl clusters, crafted with high-grade micro-gold plating and accompanied by matching jhumka earrings. Uploaded to demonstrate catalogue styling; real inventory will be added by the shop owner.',
    original_price: 3499,
    selling_price: 2499,
    images: [
      '/images/sample-necklace-1.jpg',
      '/images/sample-necklace-2.jpg',
    ],
    in_stock: true,
    is_sample: true,
    created_at: '2026-10-11T10:00:00.000Z',
  },
  {
    id: 'sample-02',
    code: 'SAMPLE-VI-KD-02',
    name: '[DEMO SAMPLE] Traditional Rajputi Lion Kada Bracelet',
    gender: 'Male',
    category: 'Bracelets',
    description: 'DEMO SAMPLE PRODUCT (NOT FOR SALE): Hand-carved antique gold-finish men\'s Kada featuring iconic Rajputana lion head terminals, intricate filigree detailing, and a robust locking hinge. Uploaded to demonstrate catalogue styling; real inventory will be added by the shop owner.',
    original_price: 1999,
    selling_price: 1399,
    images: [
      '/images/sample-kada-1.jpg',
      '/images/sample-kada-2.jpg',
    ],
    in_stock: true,
    is_sample: true,
    created_at: '2026-10-11T10:30:00.000Z',
  },
];
