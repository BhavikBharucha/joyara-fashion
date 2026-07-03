import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { setCredentials } from '../../store/slices/authSlice';
import { authService } from '../../services/authService';

const schema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authService.register({
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
      });
      dispatch(setCredentials(res.data));
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="font-heading text-3xl text-center mb-2">Create Account</h1>
        <p className="text-center text-secondary-500 text-sm mb-8">Join Joyara Fashion</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input {...register('first_name')} placeholder="First Name" className="input-field" />
              {errors.first_name && <p className="text-error text-xs mt-1">{errors.first_name.message}</p>}
            </div>
            <div>
              <input {...register('last_name')} placeholder="Last Name" className="input-field" />
              {errors.last_name && <p className="text-error text-xs mt-1">{errors.last_name.message}</p>}
            </div>
          </div>
          <div>
            <input {...register('email')} type="email" placeholder="Email" className="input-field" />
            {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <input {...register('phone')} placeholder="Phone (optional)" className="input-field" />
          </div>
          <div>
            <input {...register('password')} type="password" placeholder="Password" className="input-field" />
            {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <input {...register('confirm_password')} type="password" placeholder="Confirm Password" className="input-field" />
            {errors.confirm_password && <p className="text-error text-xs mt-1">{errors.confirm_password.message}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-secondary-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-secondary-900 underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
