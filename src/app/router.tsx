import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { Home } from '@/pages/Home';
import { Shop } from '@/pages/Shop';
import { ProductDetail } from '@/pages/ProductDetail';
import { Kits } from '@/pages/Kits';
import { Checkout } from '@/pages/Checkout';
import { About } from '@/pages/About';
import { Contact } from '@/pages/Contact';
import { Faq } from '@/pages/Faq';
import { Delivery } from '@/pages/Delivery';
import { Policies } from '@/pages/Policies';
import { Wishlist } from '@/pages/Wishlist';
import { Account } from '@/pages/Account';
import { NotFoundPage } from '@/pages/Placeholder';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { RequireStaff } from '@/components/admin/RequireStaff';
import { Login as AdminLogin } from '@/pages/admin/Login';
import { Overview } from '@/pages/admin/Overview';
import { Products } from '@/pages/admin/Products';
import { ProductForm } from '@/pages/admin/ProductForm';
import { Categories } from '@/pages/admin/Categories';
import { Kits as AdminKits } from '@/pages/admin/Kits';
import { Inventory } from '@/pages/admin/Inventory';
import { Orders } from '@/pages/admin/Orders';
import { OrderDetail } from '@/pages/admin/OrderDetail';
import { DeliveryZones } from '@/pages/admin/DeliveryZones';
import { Analytics } from '@/pages/admin/Analytics';
import { Articles } from '@/pages/admin/Articles';
import { Policies as AdminPolicies } from '@/pages/admin/Policies';
import { Settings } from '@/pages/admin/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <Home /> },

      { path: 'shop', element: <Shop /> },
      { path: 'shop/:categorySlug', element: <Shop /> },
      { path: 'product/:slug', element: <ProductDetail /> },
      { path: 'kits', element: <Kits /> },

      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
      { path: 'faq', element: <Faq /> },
      { path: 'delivery', element: <Delivery /> },
      { path: 'policies/:policy', element: <Policies /> },

      { path: 'wishlist', element: <Wishlist /> },
      { path: 'account', element: <Account /> },
      { path: 'checkout', element: <Checkout /> },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin',
    element: (
      <RequireStaff>
        <AdminLayout />
      </RequireStaff>
    ),
    children: [
      { index: true, element: <Overview /> },
      { path: 'products', element: <Products /> },
      { path: 'products/new', element: <ProductForm /> },
      { path: 'products/:slug/edit', element: <ProductForm /> },
      { path: 'categories', element: <Categories /> },
      { path: 'kits', element: <AdminKits /> },
      { path: 'inventory', element: <Inventory /> },
      { path: 'orders', element: <Orders /> },
      { path: 'orders/:id', element: <OrderDetail /> },
      { path: 'delivery-zones', element: <DeliveryZones /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'articles', element: <Articles /> },
      { path: 'policies', element: <AdminPolicies /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);
