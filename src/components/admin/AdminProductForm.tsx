import React, { useState, useEffect } from 'react';
import { X, Upload, Check, Tag, Image as ImageIcon, AlertTriangle, Info } from 'lucide-react';
import type { Product, SpecificCategory, JewelleryCategory } from '../../types';
import { uploadProductImage, isSupabaseConfigured } from '../../lib/supabase';
import { getDiscountPercentage } from '../../lib/whatsapp';
import {
  loadAllCategories,
  filterCategoriesForProductGender,
  DEFAULT_CATEGORIES,
} from '../../lib/categoryStore';

interface AdminProductFormProps {
  initialProduct?: Product | null;
  onSave: (productData: Omit<Product, 'id'>) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export const AdminProductForm: React.FC<AdminProductFormProps> = ({
  initialProduct,
  onSave,
  onCancel,
  isSaving,
}) => {
  const [code, setCode] = useState(initialProduct?.code || '');
  const [name, setName] = useState(initialProduct?.name || '');
  const [gender, setGender] = useState<'Female' | 'Male' | 'Unisex'>(initialProduct?.gender || 'Female');
  const [category, setCategory] = useState<SpecificCategory>(initialProduct?.category || 'Necklace');
  const [categories, setCategories] = useState<JewelleryCategory[]>(DEFAULT_CATEGORIES);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [originalPrice, setOriginalPrice] = useState<string>(initialProduct ? String(initialProduct.original_price) : '');
  const [sellingPrice, setSellingPrice] = useState<string>(initialProduct ? String(initialProduct.selling_price) : '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [inStock, setInStock] = useState(initialProduct?.in_stock ?? true);

  // Load dynamic categories
  useEffect(() => {
    let mounted = true;
    const fetchCats = async () => {
      try {
        const { categories: loaded } = await loadAllCategories();
        if (mounted) {
          setCategories(loaded);
        }
      } catch (err) {
        console.error('Failed to load dynamic categories:', err);
      } finally {
        if (mounted) setIsLoadingCategories(false);
      }
    };
    fetchCats();

    const handleUpdated = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setCategories(e.detail);
      } else {
        fetchCats();
      }
    };
    window.addEventListener('vaidehi-categories-updated', handleUpdated);
    return () => {
      mounted = false;
      window.removeEventListener('vaidehi-categories-updated', handleUpdated);
    };
  }, []);
  
  // Images array (no hardcoded limit!)
  const [images, setImages] = useState<string[]>(initialProduct?.images || []);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const origNum = Number(originalPrice) || 0;
  const sellNum = Number(sellingPrice) || 0;
  const discount = getDiscountPercentage(origNum, sellNum);

  // Handle adding image via URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages([...images, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  // Handle mobile gallery / file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    setIsUploadingImage(true);

    try {
      const isConnected = isSupabaseConfigured();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (isConnected) {
          // Upload to Supabase Storage bucket 'product-images'
          const { url, error } = await uploadProductImage(file);
          if (error) {
            setUploadError(`Failed to upload ${file.name}: ${error}`);
          } else if (url) {
            setImages((prev) => [...prev, url]);
          }
        } else {
          // In local preview mode: read as Data URL
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setImages((prev) => [...prev, event.target!.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    } catch (err: any) {
      setUploadError(err.message || 'Image processing failed');
    } finally {
      setIsUploadingImage(false);
      // Reset input value
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!code.trim()) {
      setFormError('Please provide a unique product code (e.g. VI-NK-101)');
      return;
    }
    if (!name.trim()) {
      setFormError('Please enter the product name');
      return;
    }
    if (sellNum <= 0) {
      setFormError('Please provide a valid selling price');
      return;
    }
    if (origNum < sellNum) {
      setFormError('Original price (MRP) should be equal to or higher than selling price');
      return;
    }
    if (images.length === 0) {
      setFormError('Please add at least one product photo');
      return;
    }

    try {
      await onSave({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        gender,
        category,
        original_price: origNum,
        selling_price: sellNum,
        description: description.trim(),
        in_stock: inStock,
        images,
      });
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left p-4 sm:p-6 bg-white">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F5D8E0]">
        <div>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#1F1A1C]">
            {initialProduct ? 'Edit Jewellery Product' : 'Add New Jewellery Product'}
          </h3>
          <p className="text-xs text-[#6E6267] mt-0.5">
            Fill in the details below. Changes appear immediately on the public catalogue.
          </p>
        </div>
      </div>

      {formError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {formError}
        </div>
      )}

      {/* Grid: Code, Name, Gender, Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Product Code */}
        <div>
          <label className="block text-xs font-semibold text-[#4A3F44] mb-1">
            Product Code (Unique) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. VI-NK-101, VI-KD-201"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0C9D3] text-xs sm:text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-[#B76E79]"
          />
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-xs font-semibold text-[#4A3F44] mb-1">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Royal Kundan Choker Necklace Set"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0C9D3] text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B76E79]"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs font-semibold text-[#4A3F44] mb-1">
            Target Gender <span className="text-red-500">*</span>
          </label>
          <select
            value={gender}
            onChange={(e) => {
              const newGender = e.target.value as 'Female' | 'Male' | 'Unisex';
              setGender(newGender);
              if (!initialProduct) {
                const compatible = filterCategoriesForProductGender(categories, newGender);
                const isCurrentCompatible = compatible.some(
                  (c) => c.name.toLowerCase() === category.toLowerCase()
                );
                if (!isCurrentCompatible && compatible.length > 0) {
                  setCategory(compatible[0].name);
                }
              }
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0C9D3] bg-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B76E79]"
          >
            <option value="Female">Female (Women's Jewellery)</option>
            <option value="Male">Male (Men's Jewellery)</option>
            <option value="Unisex">Unisex (All Collections)</option>
          </select>
          <span className="text-[11px] text-[#8B4F58] mt-1 block">
            Filters available jewellery categories below automatically.
          </span>
        </div>

        {/* Category */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-[#4A3F44]">
              Jewellery Category <span className="text-red-500">*</span>
            </label>
            {isLoadingCategories && (
              <span className="text-[10px] text-gray-400">Loading categories...</span>
            )}
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0C9D3] bg-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B76E79]"
          >
            {(() => {
              const activeCats = categories.filter((c) => c.is_active);
              const isCurrentInActive = activeCats.some(
                (c) => c.name.toLowerCase() === category.toLowerCase()
              );
              const currentObj = categories.find(
                (c) => c.name.toLowerCase() === category.toLowerCase()
              );

              // Preserve current category if inactive or unlisted
              const preserveOption = !isCurrentInActive && category ? (
                <option key={`current-${category}`} value={category}>
                  {category} ({currentObj ? (currentObj.is_active ? 'Assigned' : 'Currently Assigned - Inactive') : 'Custom / Legacy'})
                </option>
              ) : null;

              if (gender === 'Female') {
                const femaleCats = activeCats.filter((c) => c.gender === 'Female' || c.gender === 'All');
                return (
                  <>
                    {preserveOption}
                    {femaleCats.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name} ({cat.gender})
                      </option>
                    ))}
                  </>
                );
              }

              if (gender === 'Male') {
                const maleCats = activeCats.filter((c) => c.gender === 'Male' || c.gender === 'All');
                return (
                  <>
                    {preserveOption}
                    {maleCats.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name} ({cat.gender})
                      </option>
                    ))}
                  </>
                );
              }

              // Unisex / All product: show active 'All' by default, allow deliberate selection of Male/Female
              const universalCats = activeCats.filter((c) => c.gender === 'All');
              const specificCats = activeCats.filter((c) => c.gender !== 'All');

              return (
                <>
                  {preserveOption}
                  <optgroup label="Default (All / Unisex Categories)">
                    {universalCats.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name} (All)
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Gender-Specific Categories (Compatibility Note)">
                    {specificCats.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name} ({cat.gender})
                      </option>
                    ))}
                  </optgroup>
                </>
              );
            })()}
          </select>

          {/* Compatibility and Deactivated Warnings */}
          {(() => {
            const currentObj = categories.find(
              (c) => c.name.toLowerCase() === category.toLowerCase()
            );

            if (currentObj && !currentObj.is_active) {
              return (
                <div className="mt-1.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    Category <strong>"{category}"</strong> is currently deactivated. Customers won't see it in public filters until reactivated.
                  </span>
                </div>
              );
            }

            if (gender === 'Unisex' && currentObj && currentObj.gender !== 'All') {
              return (
                <div className="mt-1.5 p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-[11px] flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 text-blue-600 mt-0.5" />
                  <span>
                    <strong>Compatibility Notice:</strong> "{category}" is categorized as <strong>{currentObj.gender}</strong>, but is being assigned to a Unisex product.
                  </span>
                </div>
              );
            }

            if (gender === 'Female' && currentObj && currentObj.gender === 'Male') {
              return (
                <div className="mt-1.5 p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-500 mt-0.5" />
                  <span>
                    <strong>Gender Mismatch:</strong> "{category}" is assigned for Male jewellery only, but this product is marked Female.
                  </span>
                </div>
              );
            }

            if (gender === 'Male' && currentObj && currentObj.gender === 'Female') {
              return (
                <div className="mt-1.5 p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-500 mt-0.5" />
                  <span>
                    <strong>Gender Mismatch:</strong> "{category}" is assigned for Female jewellery only, but this product is marked Male.
                  </span>
                </div>
              );
            }

            return null;
          })()}
        </div>

      </div>

      {/* Pricing: MRP & Selling Price */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#FFF9FA] border border-[#F5D8E0]">
        
        <div>
          <label className="block text-xs font-semibold text-[#4A3F44] mb-1">
            Original Price / MRP (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            min="0"
            placeholder="e.g. 2999"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0C9D3] bg-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B76E79]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#4A3F44] mb-1">
            Selling Price (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            min="0"
            placeholder="e.g. 1999"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0C9D3] bg-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B76E79]"
          />
        </div>

        {/* Calculated Discount Pill */}
        <div className="flex flex-col justify-end">
          <div className="p-2.5 rounded-xl bg-white border border-[#F0C9D3] text-center">
            <span className="text-[10px] uppercase font-bold text-[#6E6267] block">
              Calculated Discount
            </span>
            <span className="text-sm font-bold text-[#8B4F58] flex items-center justify-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              <span>{discount > 0 ? `${discount}% OFF` : '0% (No discount)'}</span>
            </span>
          </div>
        </div>

      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-[#4A3F44] mb-1">
          Product Description
        </label>
        <textarea
          rows={3}
          placeholder="Details about craftsmanship, stones (Kundan, pearls), polish type, closure style, occasion, etc."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#F0C9D3] text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B76E79]"
        />
      </div>

      {/* Multiple Images Upload & Gallery (NO limit of 3!) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-[#4A3F44]">
            Product Photos ({images.length} added - no limit) <span className="text-red-500">*</span>
          </label>
          <span className="text-[11px] text-[#8B4F58]">
            Supports camera capture & mobile photo library
          </span>
        </div>

        {/* Upload Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* File input (Camera or Gallery) */}
          <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-[#B76E79]/50 hover:border-[#B76E79] bg-[#FFF8F9] hover:bg-[#FFF0F3] text-[#8B4F58] text-xs font-semibold cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span>{isUploadingImage ? 'Uploading Photos...' : 'Upload Photos from Device'}</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploadingImage}
              className="hidden"
            />
          </label>

          {/* Paste Image URL */}
          <div className="flex items-center gap-2">
            <input
              type="url"
              placeholder="Or paste image URL..."
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-[#F0C9D3] text-xs focus:outline-hidden focus:ring-1 focus:ring-[#B76E79]"
            />
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="px-3 py-2 bg-[#8B4F58] text-white rounded-xl text-xs font-semibold hover:bg-[#9E5863]"
            >
              Add URL
            </button>
          </div>

        </div>

        {uploadError && (
          <p className="text-[11px] text-red-600">{uploadError}</p>
        )}

        {/* Thumbnail Preview Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
            {images.map((imgUrl, idx) => (
              <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-[#F0C9D3] bg-white flex items-center justify-center p-1">
                <img
                  src={imgUrl}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/sample-necklace-1.jpg';
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 shadow-sm"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-sm">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 border border-[#F5D8E0] rounded-xl text-center bg-[#FFFDFC]">
            <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-1" />
            <p className="text-xs text-gray-500">No photos added yet. Add at least one photo above.</p>
          </div>
        )}
      </div>

      {/* In Stock toggle */}
      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="in_stock_checkbox"
          checked={inStock}
          onChange={(e) => setInStock(e.target.checked)}
          className="w-4 h-4 text-[#8B4F58] rounded-sm focus:ring-[#B76E79]"
        />
        <label htmlFor="in_stock_checkbox" className="text-xs font-semibold text-[#4A3F44] cursor-pointer">
          In Stock (Ready for immediate showroom pickup or WhatsApp dispatch)
        </label>
      </div>

      {/* Form Action Buttons */}
      <div className="pt-4 border-t border-[#F5D8E0] flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSaving || isUploadingImage}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4A373] via-[#B76E79] to-[#9E5863] text-white text-xs sm:text-sm font-semibold shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center gap-1.5"
        >
          {isSaving ? (
            <span>Saving Product...</span>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{initialProduct ? 'Update Product' : 'Publish Product to Catalogue'}</span>
            </>
          )}
        </button>
      </div>

    </form>
  );
};
