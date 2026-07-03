import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { TableSkeleton } from '../../components/common/Skeleton';

export default function AdminProducts() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
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
    setEditId(productId);
    setShowForm(true);
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

          {/* Variants (only for new products) */}
          {!editId && (
            <div>
              <h4 className="text-sm font-medium mb-2">Variants</h4>
              {form.variants.map((v, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                  <input value={v.size} onChange={(e) => { const vs = [...form.variants]; vs[i] = { ...vs[i], size: e.target.value }; setForm({ ...form, variants: vs }); }} placeholder="Size" className="input-field text-sm" />
                  <input value={v.color} onChange={(e) => { const vs = [...form.variants]; vs[i] = { ...vs[i], color: e.target.value }; setForm({ ...form, variants: vs }); }} placeholder="Color" className="input-field text-sm" />
                  <input value={v.color_hex} onChange={(e) => { const vs = [...form.variants]; vs[i] = { ...vs[i], color_hex: e.target.value }; setForm({ ...form, variants: vs }); }} placeholder="#hex" className="input-field text-sm" />
                  <input value={v.stock} onChange={(e) => { const vs = [...form.variants]; vs[i] = { ...vs[i], stock: parseInt(e.target.value) || 0 }; setForm({ ...form, variants: vs }); }} placeholder="Stock" type="number" className="input-field text-sm" />
                </div>
              ))}
              <button type="button" onClick={() => setForm({ ...form, variants: [...form.variants, { size: '', color: '', color_hex: '', stock: 0, additional_price: 0, is_active: true }] })} className="text-sm text-primary-600 underline">
                + Add Variant
              </button>
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
                      {product.images[0] && <img src={product.images[0].image_url} className="w-10 h-10 object-cover rounded" alt="" />}
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
