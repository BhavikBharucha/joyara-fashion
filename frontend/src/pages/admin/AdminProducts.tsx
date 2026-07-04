import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { TableSkeleton } from '../../components/common/Skeleton';
import type { ProductImage } from '../../types';

export default function AdminProducts() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: '', description: '', short_description: '', original_price: '', sale_price: '', discount_percent: '0',
    category_id: '', tags: '', is_active: true, is_featured: false, is_trending: false, is_new_arrival: true,
    variants: [{ size: 'M', color: 'Black', color_hex: '#000000', stock: 10, additional_price: 0, is_active: true }],
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page],
    queryFn: () => productService.getAll(page, 20).then((r) => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories-list'],
    queryFn: () => categoryService.getAll(1, 100).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => productService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); resetForm(); toast.success('Product created'); },
    onError: () => toast.error('Failed to create product'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => productService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); resetForm(); toast.success('Product updated'); },
    onError: () => toast.error('Failed to update product'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product deleted'); },
    onError: () => toast.error('Failed to delete product'),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setProductImages([]);
    setForm({
      name: '', description: '', short_description: '', original_price: '', sale_price: '', discount_percent: '0',
      category_id: '', tags: '', is_active: true, is_featured: false, is_trending: false, is_new_arrival: true,
      variants: [{ size: 'M', color: 'Black', color_hex: '#000000', stock: 10, additional_price: 0, is_active: true }],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      original_price: parseFloat(form.original_price),
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      discount_percent: parseInt(form.discount_percent) || 0,
      category_id: form.category_id || null,
    };
    if (editId) {
      const { variants: _variants, ...rest } = payload;
      void _variants;
      updateMutation.mutate({ id: editId, data: rest });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = async (productId: string) => {
    const { data: product } = await productService.getById(productId);
    setForm({
      name: product.name,
      description: product.description || '',
      short_description: product.short_description || '',
      original_price: String(product.original_price),
      sale_price: product.sale_price ? String(product.sale_price) : '',
      discount_percent: String(product.discount_percent),
      category_id: product.category_id || '',
      tags: product.tags || '',
      is_active: product.is_active,
      is_featured: product.is_featured,
      is_trending: product.is_trending,
      is_new_arrival: product.is_new_arrival,
      variants: product.variants.length > 0 ? product.variants.map((v) => ({ ...v, color_hex: v.color_hex || '' })) : [{ size: 'M', color: 'Black', color_hex: '#000000', stock: 10, additional_price: 0, is_active: true }],
    });
    setProductImages(product.images || []);
    setEditId(productId);
    setShowForm(true);
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !editId) return;
    setUploadingImages(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const isPrimary = productImages.length === 0 && i === 0;
        await productService.uploadImage(editId, files[i], isPrimary);
      }
      const { data: product } = await productService.getById(editId);
      setProductImages(product.images || []);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(`${files.length} image(s) uploaded`);
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Delete this image?')) return;
    try {
      await productService.deleteImage(imageId);
      setProductImages((prev) => prev.filter((img) => img.id !== imageId));
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Image deleted');
    } catch {
      toast.error('Failed to delete image');
    }
  };

  const removeVariant = (index: number) => {
    if (form.variants.length <= 1) {
      toast.error('At least one variant is required');
      return;
    }
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== index) });
  };

  const updateVariant = (index: number, field: string, value: string | number) => {
    const vs = [...form.variants];
    vs[index] = { ...vs[index], [field]: value };
    setForm({ ...form, variants: vs });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Products</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary flex items-center gap-2 text-sm">
          <PlusIcon className="w-4 h-4" /> Add Product
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product Name *" className="input-field" required />
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input-field">
              <option value="">Select Category</option>
              {categories?.items.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="input-field" />
          <input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} placeholder="Short Description" className="input-field" />
          <div className="grid grid-cols-3 gap-4">
            <input value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} placeholder="Original Price *" type="number" step="0.01" className="input-field" required />
            <input value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} placeholder="Sale Price" type="number" step="0.01" className="input-field" />
            <input value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} placeholder="Discount %" type="number" className="input-field" />
          </div>
          <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma separated)" className="input-field" />
          <div className="flex flex-wrap gap-4">
            {(['is_active', 'is_featured', 'is_trending', 'is_new_arrival'] as const).map((field) => (
              <label key={field} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.checked })} />
                {field.replace('is_', '').replace('_', ' ')}
              </label>
            ))}
          </div>

          {/* Variants */}
          {!editId && (
            <div>
              <h4 className="text-sm font-medium mb-2">Variants</h4>
              {form.variants.map((v, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input value={v.size} onChange={(e) => updateVariant(i, 'size', e.target.value)} placeholder="Size" className="input-field text-sm flex-1" />
                  <input value={v.color} onChange={(e) => updateVariant(i, 'color', e.target.value)} placeholder="Color" className="input-field text-sm flex-1" />
                  <input value={v.color_hex} onChange={(e) => updateVariant(i, 'color_hex', e.target.value)} placeholder="#hex" className="input-field text-sm flex-1" />
                  <input value={v.stock} onChange={(e) => updateVariant(i, 'stock', parseInt(e.target.value) || 0)} placeholder="Stock" type="number" className="input-field text-sm flex-1" />
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Remove variant"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setForm({ ...form, variants: [...form.variants, { size: '', color: '', color_hex: '', stock: 0, additional_price: 0, is_active: true }] })} className="text-sm text-primary-800 underline">
                + Add Variant
              </button>
            </div>
          )}

          {/* Image Upload (only when editing an existing product) */}
          {editId && (
            <div>
              <h4 className="text-sm font-medium mb-3">Product Images</h4>

              {/* Existing images */}
              {productImages.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {productImages.map((img) => (
                    <div key={img.id} className="relative group w-24 h-24 border border-gray-200 rounded-lg overflow-hidden">
                      <img src={img.image_url} alt={img.alt_text || ''} className="w-full h-full object-cover" />
                      {img.is_primary && (
                        <span className="absolute top-1 left-1 bg-primary-800 text-white text-[9px] px-1.5 py-0.5 rounded">Primary</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload area */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
                id="product-image-upload"
              />
              <label
                htmlFor="product-image-upload"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-800 hover:bg-primary-50/30 transition-colors ${uploadingImages ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <PhotoIcon className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">
                  {uploadingImages ? 'Uploading...' : 'Click to upload images'}
                </span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each</span>
              </label>

              {!editId && (
                <p className="text-xs text-gray-400 mt-2">Save the product first, then you can upload images.</p>
              )}
            </div>
          )}

          {/* Note for new products about image upload */}
          {!editId && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <PhotoIcon className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700">Create the product first, then click the edit button to upload images.</p>
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" className="btn-primary">{editId ? 'Update' : 'Create'} Product</button>
            <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? <TableSkeleton /> : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">SKU</th>
                <th className="text-left px-4 py-3 font-medium">Price</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Stock</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((product) => (
                <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.images[0] ? (
                        <img src={product.images[0].image_url} className="w-10 h-10 object-cover rounded" alt="" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                          <PhotoIcon className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <span className="font-medium truncate max-w-[200px]">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{product.slug.slice(0, 12)}</td>
                  <td className="px-4 py-3">
                    ₹{Number(product.sale_price || product.original_price).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">-</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${product.is_featured ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {product.is_featured ? 'Featured' : 'Standard'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(product.id)} className="p-1.5 text-gray-400 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>
                      <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(product.id); }} className="p-1.5 text-gray-400 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data && data.total_pages > 1 && (
            <div className="flex justify-center gap-2 p-4">
              {Array.from({ length: data.total_pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 text-xs rounded ${p === page ? 'bg-secondary-900 text-white' : 'bg-gray-100'}`}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
