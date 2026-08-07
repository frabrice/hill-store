import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { LogOut, Mail, User } from 'lucide-react';
import { RingDivider } from '@/components/brand/ComfortRing';
import { PlushButton } from '@/components/ui/PlushButton';
import { useAuth } from '@/lib/supabase/auth';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useOrders } from '@/hooks/useCatalog';
import { rwfFull, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/lib/services/types';

const authFormSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});
type AuthFormValues = z.infer<typeof authFormSchema>;

const inputClass =
  'mt-1.5 w-full rounded-xl border border-hairline bg-cream px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--accent))]';

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_TONE: Record<OrderStatus, string> = {
  pending: 'bg-surface-sunk text-ink-soft',
  paid: 'bg-sky/25 text-sky-deep',
  processing: 'bg-lavender/25 text-lavender-deep',
  shipped: 'bg-indigo/25 text-indigo-deep',
  delivered: 'bg-mint/30 text-mint-deep',
  cancelled: 'bg-pink/25 text-pink-deep',
};

/**
 * Sign in / create an account, or — once signed in — order history and a
 * small profile. Never on the critical path to buying anything: guest
 * checkout works exactly the same with or without this page existing.
 */
function AuthForms() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({ resolver: zodResolver(authFormSchema) });

  const onSubmit = async (values: AuthFormValues) => {
    setFormError(null);
    if (mode === 'signin') {
      const { error } = await signIn(values.email, values.password);
      if (error) setFormError(error);
    } else {
      const { error, needsConfirmation } = await signUp(values.email, values.password);
      if (error) setFormError(error);
      else if (needsConfirmation) setConfirmationSent(true);
    }
  };

  if (confirmationSent) {
    return (
      <div className="mx-auto max-w-sm rounded-3xl bg-surface p-8 text-center shadow-plush">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-mint/30">
          <Mail className="h-6 w-6 text-mint-deep" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-xl font-bold">Check your email</h1>
        <p className="mt-2 text-sm text-ink-soft">
          We&rsquo;ve sent a confirmation link — click it to finish creating your account, then come
          back and sign in.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm rounded-3xl bg-surface p-8 shadow-plush">
      <h1 className="text-center font-display text-xl font-bold">
        {mode === 'signin' ? 'Sign in' : 'Create an account'}
      </h1>
      <p className="mt-1.5 text-center text-sm text-ink-soft">
        {mode === 'signin'
          ? 'For your order history — you never need this to buy something.'
          : 'Save your details so checkout remembers you next time.'}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-ink">Email</span>
          <input type="email" autoComplete="email" className={inputClass} {...register('email')} />
          {errors.email && <span className="mt-1 block text-xs text-pink-deep">{errors.email.message}</span>}
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-ink">Password</span>
          <input
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            className={inputClass}
            {...register('password')}
          />
          {errors.password && (
            <span className="mt-1 block text-xs text-pink-deep">{errors.password.message}</span>
          )}
        </label>

        {formError && <p className="text-sm text-pink-deep">{formError}</p>}

        <PlushButton type="submit" disabled={isSubmitting} size="lg" className="w-full">
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </PlushButton>
      </form>

      <p className="mt-5 text-center text-sm text-ink-soft">
        {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setFormError(null);
          }}
          className="font-semibold text-[hsl(var(--accent-ink))] hover:underline"
        >
          {mode === 'signin' ? 'Create one' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}

const profileFormSchema = z.object({
  fullName: z.string(),
  phone: z.string(),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

function ProfileCard() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const { register, handleSubmit, reset, formState: { isSubmitting, isDirty } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { fullName: '', phone: '' },
  });

  useEffect(() => {
    if (profile) reset({ fullName: profile.fullName ?? '', phone: profile.phone ?? '' });
  }, [profile, reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await updateProfile.mutateAsync(values);
      toast.success('Saved');
    } catch {
      toast.error('Could not save — please try again.');
    }
  };

  return (
    <div className="rounded-3xl bg-surface p-6 shadow-plush sm:p-8">
      <h2 className="font-display text-lg font-bold">Your details</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-ink">Full name</span>
          <input className={inputClass} {...register('fullName')} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-ink">Phone</span>
          <input className={inputClass} {...register('phone')} />
        </label>
        <div className="sm:col-span-2">
          <PlushButton type="submit" disabled={isSubmitting || !isDirty}>
            Save
          </PlushButton>
        </div>
      </form>
    </div>
  );
}

function OrderHistory() {
  const { data: orders, isPending } = useOrders();

  return (
    <div className="rounded-3xl bg-surface p-6 shadow-plush sm:p-8">
      <h2 className="font-display text-lg font-bold">Your orders</h2>

      {isPending ? (
        <p className="mt-4 text-sm text-ink-faint">Loading…</p>
      ) : !orders || orders.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">
          No orders yet — orders placed while signed in will show up here.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-hairline">
          {orders.map((order) => (
            <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="text-sm font-semibold text-ink">{order.reference}</p>
                <p className="text-xs text-ink-faint">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-semibold',
                    STATUS_TONE[order.status],
                  )}
                >
                  {STATUS_LABEL[order.status]}
                </span>
                <span className="text-sm font-bold text-ink">{rwfFull(order.totalRwf)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Account() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <div className="mx-auto max-w-lg px-4 py-20 text-center text-sm text-ink-faint">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <AuthForms />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[hsl(var(--accent)/0.22)]">
            <User className="h-5 w-5 text-[hsl(var(--accent-ink))]" aria-hidden />
          </span>
          <div>
            <p className="font-display text-lg font-bold leading-tight">Your account</p>
            <p className="text-sm text-ink-faint">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-surface-sunk hover:text-ink"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sign out
        </button>
      </div>
      <RingDivider />

      <ProfileCard />
      <OrderHistory />
    </div>
  );
}
