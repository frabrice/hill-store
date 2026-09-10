import { useMutation, useQuery } from '@tanstack/react-query';
import { catalogService } from '@/lib/services';
import type {
  Article,
  Category,
  DeliveryZone,
  Kit,
  Order,
  OrderStatus,
  Policy,
  Product,
  ProductQuery,
  StoreSettings,
} from '@/lib/services/types';

/**
 * Every read goes through TanStack Query so that when Supabase replaces the
 * mock service, caching, retries and background refetching already work.
 */

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: () => catalogService.listCategories() });

export const useCategory = (slug: string | undefined) =>
  useQuery({
    queryKey: ['category', slug],
    queryFn: () => catalogService.getCategory(slug!),
    enabled: !!slug,
  });

export const useStages = () =>
  useQuery({ queryKey: ['stages'], queryFn: () => catalogService.listStages() });

export const useProducts = (query: ProductQuery = {}) =>
  useQuery({
    queryKey: ['products', query],
    queryFn: () => catalogService.listProducts(query),
  });

export const useProduct = (slug: string | undefined) =>
  useQuery({
    queryKey: ['product', slug],
    queryFn: () => catalogService.getProduct(slug!),
    enabled: !!slug,
  });

export const useKits = () =>
  useQuery({ queryKey: ['kits'], queryFn: () => catalogService.listKits() });

export const useProductsByIds = (ids: string[]) =>
  useQuery({
    queryKey: ['products-by-ids', ids],
    queryFn: () => catalogService.getProductsByIds(ids),
    enabled: ids.length > 0,
  });

export const useArticles = () =>
  useQuery({ queryKey: ['articles'], queryFn: () => catalogService.listArticles() });

export const useArticle = (slug: string | undefined) =>
  useQuery({
    queryKey: ['article', slug],
    queryFn: () => catalogService.getArticle(slug!),
    enabled: !!slug,
  });

export const useDeliveryZones = () =>
  useQuery({
    queryKey: ['delivery-zones'],
    queryFn: () => catalogService.listDeliveryZones(),
  });

export const useOrders = () =>
  useQuery({ queryKey: ['orders'], queryFn: () => catalogService.listOrders() });

export const useOrder = (id: string | undefined) =>
  useQuery({
    queryKey: ['order', id],
    queryFn: () => catalogService.getOrder(id!),
    enabled: !!id,
  });

export const usePolicies = () =>
  useQuery({ queryKey: ['policies'], queryFn: () => catalogService.listPolicies() });

export const usePolicy = (key: string | undefined) =>
  useQuery({
    queryKey: ['policy', key],
    queryFn: () => catalogService.getPolicy(key!),
    enabled: !!key,
  });

export const useSettings = () =>
  useQuery({ queryKey: ['settings'], queryFn: () => catalogService.getSettings() });

/**
 * Admin writes — each just calls the matching service method. The service
 * itself invalidates every query after a write, so callers don't need to.
 */

export const useCreateProduct = () =>
  useMutation({
    mutationFn: (input: Omit<Product, 'id' | 'createdAt'>) => catalogService.createProduct(input),
  });

export const useUpdateProduct = () =>
  useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Omit<Product, 'id'>> }) =>
      catalogService.updateProduct(id, patch),
  });

export const useAdjustStock = () =>
  useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) =>
      catalogService.adjustStock(id, stock),
  });

export const useDeleteProduct = () =>
  useMutation({
    mutationFn: (id: string) => catalogService.deleteProduct(id),
  });

export const useCreateCategory = () =>
  useMutation({
    mutationFn: (input: Omit<Category, 'id'>) => catalogService.createCategory(input),
  });

export const useUpdateCategory = () =>
  useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Omit<Category, 'id'>> }) =>
      catalogService.updateCategory(id, patch),
  });

export const useDeleteCategory = () =>
  useMutation({
    mutationFn: (id: string) => catalogService.deleteCategory(id),
  });

export const useCreateKit = () =>
  useMutation({
    mutationFn: (input: Omit<Kit, 'id'>) => catalogService.createKit(input),
  });

export const useUpdateKit = () =>
  useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Omit<Kit, 'id'>> }) =>
      catalogService.updateKit(id, patch),
  });

export const useDeleteKit = () =>
  useMutation({
    mutationFn: (id: string) => catalogService.deleteKit(id),
  });

export const useCreateOrder = () =>
  useMutation({
    mutationFn: (input: Omit<Order, 'id' | 'reference' | 'createdAt'>) =>
      catalogService.createOrder(input),
  });

export const useUpdateOrderStatus = () =>
  useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      catalogService.updateOrderStatus(id, status),
  });

export const useUpdateDeliveryZone = () =>
  useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Omit<DeliveryZone, 'id'>> }) =>
      catalogService.updateDeliveryZone(id, patch),
  });

export const useCreateArticle = () =>
  useMutation({
    mutationFn: (input: Omit<Article, 'id'>) => catalogService.createArticle(input),
  });

export const useUpdateArticle = () =>
  useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Omit<Article, 'id'>> }) =>
      catalogService.updateArticle(id, patch),
  });

export const useDeleteArticle = () =>
  useMutation({
    mutationFn: (id: string) => catalogService.deleteArticle(id),
  });

export const useUpdatePolicy = () =>
  useMutation({
    mutationFn: ({ key, patch }: { key: string; patch: Partial<Omit<Policy, 'key'>> }) =>
      catalogService.updatePolicy(key, patch),
  });

export const useUpdateSettings = () =>
  useMutation({
    mutationFn: (patch: Partial<StoreSettings>) => catalogService.updateSettings(patch),
  });
