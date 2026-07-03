import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { logout, updateUser } from '../../store/slices/authSlice';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';

export default function Profile() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '' });
  const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);

  const { data: addresses, refetch } = useQuery({
    queryKey: ['my-addresses'],
    queryFn: () => userService.getAddresses().then((r) => r.data),
  });

  const handleUpdateProfile = async () => {
    try {
      const { data } = await userService.updateProfile(formData);
      dispatch(updateUser(data));
      setEditing(false);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await authService.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setShowPassword(false);
      setPasswordData({ current_password: '', new_password: '', confirm: '' });
      toast.success('Password changed');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || 'Failed to change password');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await userService.deleteAddress(id);
      refetch();
      toast.success('Address deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="container-custom py-8 md:py-16 max-w-3xl mx-auto">
      <h1 className="section-title mb-8">My Profile</h1>

      {/* Profile info */}
      <div className="border border-secondary-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm tracking-widest uppercase">Personal Information</h3>
          <button onClick={() => setEditing(!editing)} className="text-sm text-primary-800 underline">
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="input-field" placeholder="First Name" />
              <input value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="input-field" placeholder="Last Name" />
            </div>
            <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-field" placeholder="Phone" />
            <button onClick={handleUpdateProfile} className="btn-primary">Save Changes</button>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <p><span className="text-secondary-500">Name:</span> {user?.first_name} {user?.last_name}</p>
            <p><span className="text-secondary-500">Email:</span> {user?.email}</p>
            <p><span className="text-secondary-500">Phone:</span> {user?.phone || '-'}</p>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="border border-secondary-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm tracking-widest uppercase">Password</h3>
          <button onClick={() => setShowPassword(!showPassword)} className="text-sm text-primary-800 underline">
            {showPassword ? 'Cancel' : 'Change Password'}
          </button>
        </div>
        {showPassword && (
          <div className="space-y-3">
            <input type="password" value={passwordData.current_password} onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })} className="input-field" placeholder="Current Password" />
            <input type="password" value={passwordData.new_password} onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })} className="input-field" placeholder="New Password" />
            <input type="password" value={passwordData.confirm} onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })} className="input-field" placeholder="Confirm New Password" />
            <button onClick={handleChangePassword} className="btn-primary">Update Password</button>
          </div>
        )}
      </div>

      {/* Addresses */}
      <div className="border border-secondary-100 p-6 mb-6">
        <h3 className="text-sm tracking-widest uppercase mb-4">Saved Addresses</h3>
        {addresses?.length === 0 ? (
          <p className="text-sm text-secondary-500">No addresses saved</p>
        ) : (
          <div className="space-y-3">
            {addresses?.map((addr) => (
              <div key={addr.id} className="flex justify-between items-start border-b border-secondary-50 pb-3">
                <div className="text-sm">
                  <p className="font-medium">{addr.full_name} <span className="text-xs text-secondary-400">({addr.label})</span></p>
                  <p className="text-secondary-500">{addr.address_line1}, {addr.city}, {addr.state} - {addr.postal_code}</p>
                </div>
                <button onClick={() => handleDeleteAddress(addr.id)} className="text-xs text-error underline">Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={handleLogout} className="btn-secondary w-full">Sign Out</button>
    </div>
  );
}
