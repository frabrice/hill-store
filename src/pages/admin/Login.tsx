import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate, useLocation } from 'react-router-dom';
import { Store } from 'lucide-react';
import { Card, CardContent } from '@/components/admin/Card';
import { Button } from '@/components/admin/Button';
import { Field, Input } from '@/components/admin/Field';
import { useAuth } from '@/lib/supabase/auth';

const loginFormSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Required'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function Login() {
  const { session, isStaff, loading, signIn } = useAuth();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  // Already signed in and confirmed staff — no reason to see the login form.
  if (!loading && session && isStaff) {
    const from = (location.state as { from?: string } | null)?.from ?? '/admin';
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    const { error } = await signIn(values.email, values.password);
    if (error) setFormError(error);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-cream px-4 font-sans">
      <Card className="w-full max-w-sm">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-cream">
              <Store className="h-5 w-5" aria-hidden />
            </span>
            <h1 className="mt-4 text-xl font-bold text-ink">Ibibondo Management</h1>
            <p className="mt-1 text-sm text-ink-soft">Sign in to the dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" autoComplete="email" {...register('email')} />
            </Field>
            <Field label="Password" error={errors.password?.message}>
              <Input type="password" autoComplete="current-password" {...register('password')} />
            </Field>

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <Button type="submit" disabled={isSubmitting} className="w-full justify-center">
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
