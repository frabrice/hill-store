import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Boxes,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Gift,
  LayoutDashboard,
  LogOut,
  Package,
  ScrollText,
  Settings,
  ShoppingCart,
  Store,
  Tags,
  Truck,
} from 'lucide-react';
import { useAdminUI } from '@/store/adminUI';
import { useAuth } from '@/lib/supabase/auth';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'Catalogue',
    items: [
      { to: '/admin/products', label: 'Products', icon: Package },
      { to: '/admin/categories', label: 'Categories', icon: Tags },
      { to: '/admin/kits', label: 'Kits', icon: Gift },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
      { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
      { to: '/admin/delivery-zones', label: 'Delivery zones', icon: Truck },
    ],
  },
  {
    title: 'Insights',
    items: [{ to: '/admin/analytics', label: 'Analytics', icon: BarChart3 }],
  },
  {
    title: 'Content',
    items: [
      { to: '/admin/articles', label: 'Learn articles', icon: FileText },
      { to: '/admin/policies', label: 'Policies', icon: ScrollText },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

interface SidebarProps {
  className?: string;
  /** The mobile drawer always shows the full nav — only the desktop rail
   * can be collapsed. */
  collapsible?: boolean;
}

export function Sidebar({ className, collapsible = true }: SidebarProps) {
  const sidebarCollapsed = useAdminUI((s) => s.sidebarCollapsed);
  const toggleSidebar = useAdminUI((s) => s.toggleSidebar);
  const { signOut } = useAuth();
  const collapsed = collapsible && sidebarCollapsed;

  return (
    <aside
      className={cn(
        'hidden shrink-0 flex-col border-r border-hairline bg-surface transition-[width] duration-200 lg:flex',
        collapsed ? 'w-[68px]' : 'w-64',
        className,
      )}
    >
      <div className={cn('flex h-16 items-center gap-2.5 border-b border-hairline', collapsed ? 'justify-center px-2' : 'px-5')}>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink text-cream">
          <Store className="h-4 w-4" aria-hidden />
        </span>
        {!collapsed && (
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate font-sans text-sm font-bold text-ink">Hill Store</p>
            <p className="truncate text-[0.65rem] font-semibold uppercase tracking-wide text-ink-faint">
              Management
            </p>
          </div>
        )}
      </div>

      <nav className={cn('no-scrollbar flex-1 space-y-6 overflow-y-auto py-5', collapsed ? 'px-2' : 'px-3')}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="px-2.5 pb-2 text-[0.65rem] font-bold uppercase tracking-wider text-ink-faint">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 rounded-lg py-2 text-sm font-semibold font-sans transition-colors duration-150',
                      collapsed ? 'justify-center px-0' : 'px-2.5',
                      isActive
                        ? 'bg-surface-sunk text-ink'
                        : 'text-ink-soft hover:bg-surface-sunk/60 hover:text-ink',
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                  {!collapsed && item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className={cn('border-t border-hairline p-3', collapsed && 'px-2')}>
        <NavLink
          to="/"
          title={collapsed ? 'View storefront' : undefined}
          className={cn(
            'flex items-center gap-2.5 rounded-lg py-2 text-sm font-semibold font-sans text-ink-soft transition-colors duration-150 hover:bg-surface-sunk/60 hover:text-ink',
            collapsed ? 'justify-center px-0' : 'px-2.5',
          )}
        >
          <Store className="h-4 w-4 shrink-0" aria-hidden />
          {!collapsed && 'View storefront'}
        </NavLink>

        <button
          onClick={() => signOut()}
          title={collapsed ? 'Sign out' : undefined}
          className={cn(
            'flex items-center gap-2.5 rounded-lg py-2 text-sm font-semibold font-sans text-ink-soft transition-colors duration-150 hover:bg-surface-sunk/60 hover:text-ink',
            collapsed ? 'w-full justify-center px-0' : 'w-full px-2.5',
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden />
          {!collapsed && 'Sign out'}
        </button>

        {collapsible && (
          <button
            onClick={toggleSidebar}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'mt-1 flex items-center gap-2.5 rounded-lg py-2 text-sm font-semibold font-sans text-ink-soft transition-colors duration-150 hover:bg-surface-sunk/60 hover:text-ink',
              collapsed ? 'w-full justify-center px-0' : 'w-full px-2.5',
            )}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <>
                <ChevronsLeft className="h-4 w-4 shrink-0" aria-hidden />
                Collapse
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  );
}
