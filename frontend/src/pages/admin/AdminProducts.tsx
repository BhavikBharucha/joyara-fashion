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
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [selectedImageColor, setSelectedImageColor] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: '', description: '', short_description: '', original_price: '', sale_price: '', discount_percent: '0',
    category_id: '', tags: '', is_active: true, is_featured: false, is_trending: false, is_new_arrival: true,
    variants: [{ id: '', size: 'M', color: 'Black', color_hex: '#000000', stock: 10, additional_price: '0', is_active: true }] as { id?: string; size: string; color: string; color_hex: string; stock: number; additional_price: string; is_active: boolean }[],
  });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page],
    queryFn: () => productService.getAll(page, 20).then((r) => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories-list'],
    queryFn: () => categoryService.getAll(1, 100).then((r) => r.data),
    staleTime: 0,
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => productService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); queryClient.invalidateQueries({ queryKey: ['product'] }); queryClient.invalidateQueries({ queryKey: ['featured-products'] }); queryClient.invalidateQueries({ queryKey: ['new-arrivals'] }); queryClient.invalidateQueries({ queryKey: ['trending-products'] }); queryClient.invalidateQueries({ queryKey: ['search'] }); resetForm(); toast.success('Product created'); },
    onError: () => toast.error('Failed to create product'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => productService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); queryClient.invalidateQueries({ queryKey: ['product'] }); queryClient.invalidateQueries({ queryKey: ['featured-products'] }); queryClient.invalidateQueries({ queryKey: ['new-arrivals'] }); queryClient.invalidateQueries({ queryKey: ['trending-products'] }); queryClient.invalidateQueries({ queryKey: ['search'] }); resetForm(); toast.success('Product updated'); },
    onError: () => toast.error('Failed to update product'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); queryClient.invalidateQueries({ queryKey: ['product'] }); queryClient.invalidateQueries({ queryKey: ['featured-products'] }); queryClient.invalidateQueries({ queryKey: ['new-arrivals'] }); queryClient.invalidateQueries({ queryKey: ['trending-products'] }); queryClient.invalidateQueries({ queryKey: ['search'] }); toast.success('Product deleted'); },
    onError: () => toast.error('Failed to delete product'),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setProductImages([]);
    setForm({
      name: '', description: '', short_description: '', original_price: '', sale_price: '', discount_percent: '0',
      category_id: '', tags: '', is_active: true, is_featured: false, is_trending: false, is_new_arrival: true,
      variants: [{ id: '', size: 'M', color: 'Black', color_hex: '#000000', stock: 10, additional_price: '0', is_active: true }],
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
      variants: form.variants.map((v) => ({
        ...(v.id ? { id: v.id } : {}),
        size: v.size,
        color: v.color,
        color_hex: v.color_hex || null,
        stock: v.stock,
        additional_price: parseFloat(v.additional_price) || 0,
        is_active: v.is_active,
      })),
    };
    if (editId) {
      updateMutation.mutate({ id: editId, data: payload });
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
      variants: product.variants.length > 0 ? product.variants.map((v) => ({ id: v.id, size: v.size, color: v.color, color_hex: v.color_hex || '', stock: v.stock, additional_price: String(v.additional_price), is_active: v.is_active })) : [{ id: '', size: 'M', color: 'Black', color_hex: '#000000', stock: 10, additional_price: '0', is_active: true }],
    });
    setProductImages(product.images || []);
    setEditId(productId);
    setShowForm(true);
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !editId) return;
    setUploadingImages(true);
    const color = selectedImageColor || undefined;
    try {
      for (let i = 0; i < files.length; i++) {
        const colorImages = productImages.filter((img) => (img.color || '') === (color || ''));
        const isPrimary = colorImages.length === 0 && i === 0;
        await productService.uploadImage(editId, files[i], isPrimary, color);
      }
      const { data: product } = await productService.getById(editId);
      setProductImages(product.images || []);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(`${files.length} image(s) uploaded for ${color || 'general'}`);
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

  const COLOR_NAMES: Record<string, string> = {
    '#000000': 'Black', '#ffffff': 'White', '#ff0000': 'Red', '#00ff00': 'Green',
    '#0000ff': 'Blue', '#ffff00': 'Yellow', '#ff00ff': 'Magenta', '#00ffff': 'Cyan',
    '#800000': 'Maroon', '#808000': 'Olive', '#008000': 'Dark Green', '#800080': 'Purple',
    '#008080': 'Teal', '#000080': 'Navy', '#c0c0c0': 'Silver', '#808080': 'Gray',
    '#ffa500': 'Orange', '#ffc0cb': 'Pink', '#a52a2a': 'Brown', '#f5f5dc': 'Beige',
    '#ffe4c4': 'Bisque', '#d2691e': 'Chocolate', '#dc143c': 'Crimson', '#b8860b': 'Dark Gold',
    '#ff6347': 'Tomato', '#4b0082': 'Indigo', '#ee82ee': 'Violet', '#f0e68c': 'Khaki',
    '#e6e6fa': 'Lavender', '#fffff0': 'Ivory', '#faf0e6': 'Linen', '#fffacd': 'Lemon',
  };

  const getClosestColorName = (hex: string): string => {
    const lower = hex.toLowerCase();
    if (COLOR_NAMES[lower]) return COLOR_NAMES[lower];
    const r = parseInt(lower.slice(1, 3), 16);
    const g = parseInt(lower.slice(3, 5), 16);
    const b = parseInt(lower.slice(5, 7), 16);
    let closest = 'Custom';
    let minDist = Infinity;
    for (const [key, name] of Object.entries(COLOR_NAMES)) {
      const cr = parseInt(key.slice(1, 3), 16);
      const cg = parseInt(key.slice(3, 5), 16);
      const cb = parseInt(key.slice(5, 7), 16);
      const dist = Math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2);
      if (dist < minDist) { minDist = dist; closest = name; }
    }
    return closest;
  };

  const updateVariant = (index: number, field: string, value: string | number) => {
    const vs = [...form.variants];
    vs[index] = { ...vs[index], [field]: value };
    setForm({ ...form, variants: vs });
  };

  const handleColorPickerChange = (index: number, hex: string) => {
    const vs = [...form.variants];
    vs[index] = { ...vs[index], color_hex: hex, color: getClosestColorName(hex) };
    setForm({ ...form, variants: vs });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Products</h2>
          <select
            value={stockFilter}
            onChange={(e) => { setStockFilter(e.target.value as 'all' | 'in_stock' | 'out_of_stock'); setPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-primary-800"
          >
            <option value="all">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
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
            <input value={form.original_price} onChange={(e) => {
              const op = e.target.value;
              const sp = form.sale_price;
              const disc = op && sp && parseFloat(op) > 0 ? Math.round(((parseFloat(op) - parseFloat(sp)) / parseFloat(op)) * 100) : 0;
              setForm({ ...form, original_price: op, discount_percent: String(disc >= 0 ? disc : 0) });
            }} placeholder="Original Price *" type="number" step="0.01" className="input-field" required />
            <input value={form.sale_price} onChange={(e) => {
              const sp = e.target.value;
              const op = form.original_price;
              const disc = op && sp && parseFloat(op) > 0 ? Math.round(((parseFloat(op) - parseFloat(sp)) / parseFloat(op)) * 100) : 0;
              setForm({ ...form, sale_price: sp, discount_percent: String(disc >= 0 ? disc : 0) });
            }} placeholder="Sale Price" type="number" step="0.01" className="input-field" />
            <div className="relative">
              <input value={form.discount_percent} readOnly placeholder="Discount %" type="number" className="input-field bg-gray-50 cursor-not-allowed" tabIndex={-1} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Auto</span>
            </div>
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
          <div>
              <h4 className="text-sm font-medium mb-2">Variants</h4>
              {form.variants.map((v, i) => (
                <div key={i} className="relative mb-3 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove variant"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Size</label>
                      <input value={v.size} onChange={(e) => updateVariant(i, 'size', e.target.value)} placeholder="S, M, L..." className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={v.color_hex || '#000000'}
                          onChange={(e) => handleColorPickerChange(i, e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border border-gray-200 shrink-0 p-0.5"
                          title="Pick color"
                        />
                        <input value={v.color} onChange={(e) => updateVariant(i, 'color', e.target.value)} placeholder="Color Name" className="input-field text-sm w-full" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Color Hex</label>
                      <input value={v.color_hex} onChange={(e) => updateVariant(i, 'color_hex', e.target.value)} placeholder="#000000" className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Stock</label>
                      <input value={v.stock} onChange={(e) => updateVariant(i, 'stock', parseInt(e.target.value) || 0)} placeholder="0" type="number" className="input-field text-sm" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs text-gray-500 mb-1">Extra Price (₹) — added on top of base sale price</label>
                    <input value={v.additional_price} onChange={(e) => updateVariant(i, 'additional_price', e.target.value)} placeholder="0.00" type="number" step="0.01" className="input-field text-sm md:w-1/4" />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setForm({ ...form, variants: [...form.variants, { id: '', size: '', color: '', color_hex: '', stock: 0, additional_price: '0', is_active: true }] })} className="text-sm text-primary-800 underline">
                + Add Variant
              </button>
            </div>

          {/* Image Upload (only when editing an existing product) */}
          {editId && (
            <div>
              <h4 className="text-sm font-medium mb-3">Product Images</h4>

              {/* Color selector for image upload */}
              {(() => {
                const variantColors = [...new Set(form.variants.map((v) => v.color).filter(Boolean))];
                return variantColors.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Select color to upload images for:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedImageColor('')}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                          selectedImageColor === '' ? 'bg-primary-800 text-white border-primary-800' : 'border-gray-300 hover:border-primary-800'
                        }`}
                      >
                        General
                      </button>
                      {variantColors.map((color) => {
                        const variant = form.variants.find((v) => v.color === color);
                        const imgCount = productImages.filter((img) => img.color === color).length;
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedImageColor(color)}
                            className={`px-3 py-1.5 text-xs rounded-full border transition-colors flex items-center gap-1.5 ${
                              selectedImageColor === color ? 'bg-primary-800 text-white border-primary-800' : 'border-gray-300 hover:border-primary-800'
                            }`}
                          >
                            {variant?.color_hex && (
                              <span className="w-3 h-3 rounded-full inline-block border border-white/30" style={{ backgroundColor: variant.color_hex }} />
                            )}
                            {color}
                            {imgCount > 0 && <span className="opacity-70">({imgCount})</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Existing images filtered by selected color */}
              {(() => {
                const filteredImages = productImages.filter((img) => (img.color || '') === selectedImageColor);
                return filteredImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">
                      {selectedImageColor ? `Images for ${selectedImageColor}` : 'General images'} ({filteredImages.length})
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {filteredImages.map((img) => (
                        <div key={img.id} className="relative group w-24 h-24 border border-gray-200 rounded-lg overflow-hidden">
                          <img src={img.image_url} alt={img.alt_text || ''} className="w-full h-full object-cover" />
                          {img.is_primary && (
                            <span className="absolute top-1 left-1 bg-primary-800 text-white text-[9px] px-1.5 py-0.5 rounded">Primary</span>
                          )}
                          {img.color && (
                            <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1 py-0.5 rounded">{img.color}</span>
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
                  </div>
                );
              })()}

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
                  {uploadingImages ? 'Uploading...' : `Upload images for ${selectedImageColor || 'General'}`}
                </span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each</span>
              </label>
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
              {data?.items.filter((p) => stockFilter === 'all' ? true : stockFilter === 'in_stock' ? p.total_stock > 0 : p.total_stock === 0).map((product) => (
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
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="relative group">
                      <span className={`font-medium ${product.total_stock === 0 ? 'text-red-600' : product.total_stock < 10 ? 'text-amber-600' : 'text-green-600'}`}>
                        {product.total_stock}
                      </span>
                      {product.variants && product.variants.length > 0 && (
                        <div className="absolute left-0 top-full mt-1 z-50 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[180px]">
                          <p className="text-xs font-medium text-gray-700 mb-2 border-b pb-1">Stock by Color</p>
                          {(() => {
                            const colorStocks: Record<string, { stock: number; hex: string }> = {};
                            product.variants.forEach((v) => {
                              if (colorStocks[v.color]) {
                                colorStocks[v.color].stock += v.stock;
                              } else {
                                colorStocks[v.color] = { stock: v.stock, hex: v.color_hex || '#888' };
                              }
                            });
                            return Object.entries(colorStocks).map(([color, info]) => (
                              <div key={color} className="flex items-center justify-between gap-3 py-1 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: info.hex }} />
                                  <span className="text-gray-700">{color}</span>
                                </div>
                                <span className={`font-medium ${info.stock === 0 ? 'text-red-600' : 'text-gray-900'}`}>{info.stock}</span>
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                    </div>
                  </td>
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
