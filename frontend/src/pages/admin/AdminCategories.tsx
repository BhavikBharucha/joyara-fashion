import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { categoryService } from '../../services/categoryService';
import { TableSkeleton } from '../../components/common/Skeleton';

export default function AdminCategories() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', parent_id: '', sort_order: 0, is_active: true, is_featured: false });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => categoryService.getAll(1, 100).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => categoryService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); resetForm(); toast.success('Category created'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => categoryService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); resetForm(); toast.success('Category updated'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); toast.success('Category deleted'); },
  });

  const resetForm = () => { setShowForm(false); setEditId(null); setForm({ name: '', description: '', parent_id: '', sort_order: 0, is_active: true, is_featured: false }); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, parent_id: form.parent_id || null };
    if (editId) updateMutation.mutate({ id: editId, data: payload });
    else createMutation.mutate(payload);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Categories</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary flex items-center gap-2 text-sm">
          <PlusIcon className="w-4 h-4" /> Add Category
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-4">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category Name *" className="input-field" required />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="input-field" rows={2} />
          <div className="grid grid-cols-2 gap-4">
            <select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })} className="input-field">
              <option value="">No Parent (Top Level)</option>
              {data?.items.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} type="number" placeholder="Sort Order" className="input-field" />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Featured</label>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">{editId ? 'Update' : 'Create'}</button>
            <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? <TableSkeleton /> : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Slug</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((cat) => (
                <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{cat.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${cat.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setForm({ name: cat.name, description: cat.description || '', parent_id: cat.parent_id || '', sort_order: cat.sort_order, is_active: cat.is_active, is_featured: cat.is_featured }); setEditId(cat.id); setShowForm(true); }} className="p-1.5 text-gray-400 hover:text-blue-600"><PencilIcon className="w-4 h-4" /></button>
                      <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(cat.id); }} className="p-1.5 text-gray-400 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
