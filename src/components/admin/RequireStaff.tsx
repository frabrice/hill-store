import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '@/lib/supabase/auth';

/**
 * Gates the whole `/admin/*` tree. Three states, deliberately handled
 * differently:
 *  - no session at all → bounce to /admin/login
 *  - a real session, but not in the `staff` table → explain why, don't just
 *    bounce back to a login form that will "work" again and loop
 *  - session + staff → render the dashboard
 */
export function RequireStaff({ children }: { children: React.ReactNode }) {
  const { session, isStaff, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="grid h-screen place-items-center bg-cream text-sm text-ink-faint">Loading…</div>;
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (!isStaff) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream px-4 font-sans text-center">
        <div>
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-600">
            <ShieldAlert className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-4 text-lg font-bold text-ink">This account doesn&rsquo;t have dashboard access</h1>
          <p className="mt-1.5 max-w-sm text-sm text-ink-soft">
            {session.user.email} is signed in but isn&rsquo;t listed as staff. Ask an existing admin to add
            you, or sign in with a different account.
          </p>
          <Button variant="outline" className="mt-5" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
