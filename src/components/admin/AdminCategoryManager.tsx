import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Check,
  X,
  ShieldAlert,
} from 'lucide-react';
import type { JewelleryCategory, CategoryGender, Product } from '../../types';
import {
  loadAllCategories,
  addCategoryToStore,
  updateCategoryInStore,
  deleteCategoryFromStore,
} from '../../lib/categoryStore';

interface AdminCategoryManagerProps {
  products: Product[];
  onCategoriesChanged?: () => void;
}

export const AdminCategoryManager: React.FC<AdminCategoryManagerProps> = ({
  products,
  onCategoriesChanged,
}) => {
  const [categories, setCategories] = useState<JewelleryCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<JewelleryCategory | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formGender, setFormGender] = useState<CategoryGender>('All');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterGender, setFilterGender] = useState<'All' | CategoryGender>('All');

  // Conflict confirmation modal (when changing gender of category with existing products)
  const [conflictWarning, setConflictWarning] = useState<{
    isOpen: boolean;
    category: JewelleryCategory;
    newGender: CategoryGender;
    affectedProducts: Product[];
  } | null>(null);

  // Delete prevention / confirmation modal
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    category: JewelleryCategory;
    assignedProducts: Product[];
  } | null>(null);

  // Load categories
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { categories: fetched, error: fetchErr } = await loadAllCategories();
      if (fetchErr) {
        setError(fetchErr);
      } else {
        setCategories(fetched);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  // Open Add form
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormName('');
    setFormGender('Female');
    setFormIsActive(true);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Open Edit form
  const handleOpenEdit = (category: JewelleryCategory) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormGender(category.gender);
    setFormIsActive(category.is_active);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Close form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setFormName('');
    setFormError(null);
  };

  // Find products assigned to a category
  const getAssignedProducts = useCallback(
    (categoryName: string): Product[] => {
      const lower = categoryName.trim().toLowerCase();
      return products.filter((p) => p.category && p.category.toLowerCase() === lower);
    },
    [products]
  );

  // Form submit
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = formName.trim();
    if (!cleanName) {
      setFormError('Please provide a category name.');
      return;
    }

    // Check duplicate name
    const isDup = categories.some(
      (c) =>
        c.name.toLowerCase() === cleanName.toLowerCase() &&
        (!editingCategory || c.id !== editingCategory.id)
    );
    if (isDup) {
      setFormError(`A category named "${cleanName}" already exists.`);
      return;
    }

    // If editing and changing category gender: check for product incompatibility
    if (editingCategory && editingCategory.gender !== formGender) {
      const assigned = getAssignedProducts(editingCategory.name);
      // Check which products become incompatible
      const incompatible = assigned.filter((prod) => {
        if (formGender === 'All') return false; // All is compatible with all products
        if (formGender === 'Male') return prod.gender === 'Female';
        if (formGender === 'Female') return prod.gender === 'Male';
        return false;
      });

      if (incompatible.length > 0) {
        // Trigger conflict warning dialog
        setConflictWarning({
          isOpen: true,
          category: editingCategory,
          newGender: formGender,
          affectedProducts: incompatible,
        });
        return;
      }
    }

    await executeSaveCategory(cleanName, formGender, formIsActive);
  };

  const executeSaveCategory = async (
    name: string,
    gender: CategoryGender,
    is_active: boolean
  ) => {
    setIsSaving(true);
    setFormError(null);
    try {
      if (editingCategory) {
        const { error: updateErr } = await updateCategoryInStore(editingCategory.id, {
          name,
          gender,
          is_active,
        });
        if (updateErr) throw new Error(updateErr);
        setSuccessMsg(`Category "${name}" updated successfully.`);
      } else {
        const { error: addErr } = await addCategoryToStore({
          name,
          gender,
          is_active,
        });
        if (addErr) throw new Error(addErr);
        setSuccessMsg(`Category "${name}" added successfully.`);
      }

      setTimeout(() => setSuccessMsg(null), 3000);
      handleCloseForm();
      await fetchCategories();
      onCategoriesChanged?.();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
      setConflictWarning(null);
    }
  };

  // Toggle active status
  const handleToggleActive = async (category: JewelleryCategory) => {
    try {
      const { error: updateErr } = await updateCategoryInStore(category.id, {
        is_active: !category.is_active,
      });
      if (updateErr) throw new Error(updateErr);
      setSuccessMsg(
        `Category "${category.name}" is now ${!category.is_active ? 'Active' : 'Inactive'}.`
      );
      setTimeout(() => setSuccessMsg(null), 3000);
      await fetchCategories();
      onCategoriesChanged?.();
    } catch (err: any) {
      setError(err.message || 'Failed to update category status');
    }
  };

  // Click Delete button
  const handleDeleteClick = (category: JewelleryCategory) => {
    const assigned = getAssignedProducts(category.name);
    setDeleteDialog({
      isOpen: true,
      category,
      assignedProducts: assigned,
    });
  };

  // Execute deletion
  const executeDelete = async (categoryId: string) => {
    try {
      const { error: delErr } = await deleteCategoryFromStore(categoryId);
      if (delErr) throw new Error(delErr);
      setSuccessMsg('Category deleted successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
      setDeleteDialog(null);
      await fetchCategories();
      onCategoriesChanged?.();
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    }
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (filterGender !== 'All' && cat.gender !== filterGender) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return cat.name.toLowerCase().includes(q) || cat.gender.toLowerCase().includes(q);
      }
      return true;
    });
  }, [categories, filterGender, searchQuery]);

  return (
    <div className="p-4 sm:p-6 space-y-5 text-left">
      {/* 1. Top Section Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F5D8E0]">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#8B4F58]" />
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#1F1A1C]">
              Manage Jewellery Categories
            </h3>
          </div>
          <p className="text-xs text-[#6E6267] mt-0.5">
            Create, edit, activate/deactivate, and assign Category Gender (Female, Male, or All) to customize catalogue dropdowns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCategories}
            disabled={isLoading}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh categories"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4A373] via-[#B76E79] to-[#9E5863] text-white text-xs sm:text-sm font-semibold shadow-xs hover:brightness-105 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2 animate-fadeIn">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Add / Edit Category Form Modal / Card */}
      {isFormOpen && (
        <div className="bg-[#FFF9FA] border border-[#F5D8E0] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-[#F0C9D3]">
            <h4 className="font-heading font-bold text-sm sm:text-base text-[#1F1A1C] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8B4F58]" />
              <span>{editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}</span>
            </h4>
            <button
              onClick={handleCloseForm}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {formError}
            </div>
          )}

          <form onSubmit={handleSaveForm} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Category Name */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-[#4A3F44] mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anklets, Mangalsutra"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#F0C9D3] bg-white text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-[#B76E79]"
                />
              </div>

              {/* Category Gender (Category For) */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-[#4A3F44] mb-1">
                  Category For (Target Gender) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formGender}
                  onChange={(e) => setFormGender(e.target.value as CategoryGender)}
                  className="w-full px-3 py-2 rounded-xl border border-[#F0C9D3] bg-white text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-[#B76E79]"
                >
                  <option value="Female">Female (Women's Jewellery)</option>
                  <option value="Male">Male (Men's Jewellery)</option>
                  <option value="All">All (Both Men & Women / Unisex)</option>
                </select>
                <p className="text-[10px] text-[#8B4F58] mt-1">
                  Determines which products can select this category.
                </p>
              </div>

              {/* Active Status */}
              <div className="sm:col-span-1 flex flex-col justify-center pt-2 sm:pt-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#8B4F58] rounded-sm border-gray-300 focus:ring-[#B76E79]"
                  />
                  <span className="text-xs font-semibold text-[#4A3F44]">
                    Active (Visible in Product Forms)
                  </span>
                </label>
                <span className="text-[10px] text-gray-500 pl-6">
                  {formIsActive ? 'Can be selected when adding products.' : 'Hidden from product forms.'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0C9D3]">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-[#8B4F58] hover:bg-[#9E5863] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : editingCategory ? 'Update Category' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-[#F5D8E0]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-[#6E6267] pr-1">Filter Gender:</span>
          {(['All', 'Female', 'Male'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setFilterGender(g as any)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterGender === g
                  ? 'bg-[#8B4F58] text-white shadow-xs'
                  : 'bg-[#FFF8F9] text-[#5A4E53] hover:bg-[#FCECEF]'
              }`}
            >
              {g === 'All' ? 'All Genders' : g}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#F0C9D3] bg-[#FFFDFC] text-xs focus:outline-hidden focus:ring-1 focus:ring-[#B76E79]"
          />
        </div>
      </div>

      {/* 4. Categories Table / Cards List */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-[#8B4F58]">
          Loading jewellery categories...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-8 text-center bg-[#FFF8F9] rounded-2xl border border-[#F5D8E0]">
          <p className="text-xs sm:text-sm text-[#6E6267]">No categories match your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#F5D8E0] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF5F8] text-[#8B4F58] border-b border-[#F5D8E0] font-semibold">
                <tr>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Category Gender</th>
                  <th className="py-3 px-4">Assigned Products</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((cat) => {
                  const assigned = getAssignedProducts(cat.name);
                  return (
                    <tr key={cat.id} className="hover:bg-[#FFFDFD] transition-colors">
                      {/* Name */}
                      <td className="py-3.5 px-4 font-semibold text-[#1F1A1C]">
                        {cat.name}
                      </td>

                      {/* Gender Badge */}
                      <td className="py-3.5 px-4">
                        {cat.gender === 'Female' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-pink-50 text-pink-700 border border-pink-200">
                            Female (Women)
                          </span>
                        )}
                        {cat.gender === 'Male' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Male (Men)
                          </span>
                        )}
                        {cat.gender === 'All' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            All (Unisex)
                          </span>
                        )}
                      </td>

                      {/* Assigned Products Count */}
                      <td className="py-3.5 px-4">
                        {assigned.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8B4F58]">
                            <strong>{assigned.length}</strong> {assigned.length === 1 ? 'product' : 'products'}
                            <span className="text-[10px] text-gray-400">
                              ({assigned.map((p) => p.code).slice(0, 2).join(', ')}
                              {assigned.length > 2 ? '...' : ''})
                            </span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400">0 products</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {cat.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3 text-gray-500" />
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleActive(cat)}
                            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                              cat.is_active
                                ? 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800'
                                : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                            }`}
                            title={cat.is_active ? 'Deactivate category' : 'Activate category'}
                          >
                            {cat.is_active ? 'Deactivate' : 'Activate'}
                          </button>

                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="p-1.5 rounded-lg border border-[#F0C9D3] bg-[#FFF8F9] hover:bg-[#FCECEF] text-[#8B4F58] transition-colors cursor-pointer"
                            title="Edit category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteClick(cat)}
                            className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                            title="Delete category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Conflict Warning Modal (When changing gender with existing products) */}
      {conflictWarning && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-amber-300 shadow-2xl p-6 max-w-lg w-full space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-base text-gray-900">
                  Category Gender Conflict Warning
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  You are changing the Category Gender of <strong>"{conflictWarning.category.name}"</strong> to{' '}
                  <span className="font-semibold text-amber-800">{conflictWarning.newGender}</span>.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
              <p>
                <strong>{conflictWarning.affectedProducts.length}</strong> existing product(s) currently use this category with an incompatible Product Gender:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[11px]">
                {conflictWarning.affectedProducts.map((p) => (
                  <li key={p.id}>
                    <strong>{p.code}</strong>: {p.name} (Product Gender: <em>{p.gender}</em>)
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-amber-800 pt-1">
                <strong>Important:</strong> Existing products will NOT be deleted, detached, or have their Product Gender automatically changed. They will retain their category name.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConflictWarning(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  executeSaveCategory(formName, formGender, formIsActive)
                }
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Proceed with Gender Change'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Delete Dialog (Safe Deletion Check) */}
      {deleteDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 max-w-md w-full space-y-4 text-left">
            {deleteDialog.assignedProducts.length > 0 ? (
              // Unsafe Deletion Blocked
              <>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-base text-gray-900">
                      Cannot Delete Category
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Category <strong>"{deleteDialog.category.name}"</strong> cannot be deleted because it is currently assigned to{' '}
                      <strong>{deleteDialog.assignedProducts.length}</strong> product(s):
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 max-h-36 overflow-y-auto space-y-1">
                  {deleteDialog.assignedProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#8B4F58]">{p.code}</span>
                      <span className="truncate max-w-[180px]">{p.name}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  To protect your catalogue integrity, please reassign or remove these products first, or mark this category as <strong>Inactive</strong> to hide it from new products.
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setDeleteDialog(null)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      void handleToggleActive(deleteDialog.category);
                      setDeleteDialog(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#8B4F58] hover:bg-[#9E5863] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Deactivate Instead
                  </button>
                </div>
              </>
            ) : (
              // Safe Deletion Confirmation
              <>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-base text-gray-900">
                      Confirm Category Deletion
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Are you sure you want to permanently delete category <strong>"{deleteDialog.category.name}"</strong>?
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  No products are currently using this category. This action cannot be undone.
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setDeleteDialog(null)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => executeDelete(deleteDialog.category.id)}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Delete Category
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
