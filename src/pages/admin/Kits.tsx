import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Search, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/admin/Card';
import { Button } from '@/components/admin/Button';
import { Drawer } from '@/components/admin/Drawer';
import { Field, Input, Select } from '@/components/admin/Field';
import { useCreateKit, useDeleteKit, useKits, useProducts, useUpdateKit } from '@/hooks/useCatalog';
import { resolveIcon, ICON_KEYS } from '@/lib/icons';
import { ACCENTS, COLOR_KEYS } from '@/lib/theme';
import { rwfFull } from '@/lib/format';
import type { Kit } from '@/lib/services/types';

const kitFormSchema = z.object({
  slug: z.string().min(1, 'Required').regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only'),
  name: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  priceRwf: z.coerce.number().min(0),
  colorKey: z.enum(['pink', 'mint', 'sky', 'sunny', 'lavender', 'coral', 'teal', 'indigo', 'orchid', 'moss']),
  icon: z.string().min(1),
  productIds: z.array(z.string()).min(1, 'Choose at least one product'),
});

type KitFormValues = z.infer<typeof kitFormSchema>;

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const EMPTY_VALUES: KitFormValues = {
  slug: '',
  name: '',
  description: '',
  priceRwf: 0,
  colorKey: 'lavender',
  icon: ICON_KEYS[0],
  productIds: [],
};

function toFormValues(kit: Kit): KitFormValues {
  return {
    slug: kit.slug,
    name: kit.name,
    description: kit.description,
    priceRwf: kit.priceRwf,
    colorKey: kit.colorKey,
    icon: kit.icon,
    productIds: kit.productIds,
  };
}

export function Kits() {
  const { data: kits } = useKits();
  const { data: productsData } = useProducts({});
  const products = productsData?.items ?? [];
  const createKit = useCreateKit();
  const updateKit = useUpdateKit();
  const deleteKit = useDeleteKit();

  const [editing, setEditing] = useState<Kit | 'new' | null>(null);
  const [productSearch, setProductSearch] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<KitFormValues>({
    resolver: zodResolver(kitFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  const isEditingExisting = editing !== null && editing !== 'new';
  const productIds = watch('productIds');

  useEffect(() => {
    if (editing === 'new') reset(EMPTY_VALUES);
    else if (editing) reset(toFormValues(editing));
    setProductSearch('');
  }, [editing, reset]);

  const filteredProducts = useMemo(
    () =>
      products.filter((p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()),
      ),
    [products, productSearch],
  );

  const toggleProduct = (id: string) => {
    setValue(
      'productIds',
      productIds.includes(id) ? productIds.filter((p) => p !== id) : [...productIds, id],
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const onSubmit = async (values: KitFormValues) => {
    try {
      if (isEditingExisting && editing) {
        await updateKit.mutateAsync({ id: editing.id, patch: values });
        toast.success('Kit updated');
      } else {
        await createKit.mutateAsync(values);
        toast.success('Kit created');
      }
      setEditing(null);
    } catch {
      toast.error('Something went wrong — please try again.');
    }
  };

  const onDelete = async () => {
    if (!isEditingExisting || !editing) return;
    const confirmed = window.confirm(`Delete "${editing.name}"? This can't be undone.`);
    if (!confirmed) return;
    try {
      await deleteKit.mutateAsync(editing.id);
      toast.success('Kit deleted');
      setEditing(null);
    } catch {
      toast.error('Something went wrong — please try again.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-sans text-2xl font-bold text-ink">Kits</h1>
          <p className="mt-1 text-sm text-ink-soft">{kits?.length ?? 0} curated kits</p>
        </div>
        <Button onClick={() => setEditing('new')}>
          <Plus className="h-4 w-4" aria-hidden />
          Add kit
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kits?.map((k) => {
          const Icon = resolveIcon(k.icon);
          const accent = ACCENTS[k.colorKey];
          return (
            <Card key={k.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setEditing(k)}>
              <CardContent className="p-5">
                <span
                  className="grid h-10 w-10 place-items-center rounded-lg"
                  style={{ backgroundColor: `hsl(${accent.soft})`, color: `hsl(${accent.ink})` }}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="mt-3 font-sans text-sm font-bold text-ink">{k.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{k.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-faint">
                    {k.productIds.length} items
                  </span>
                  <span className="text-sm font-bold text-ink">{rwfFull(k.priceRwf)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Drawer
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        title={isEditingExisting ? 'Edit kit' : 'Add kit'}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" error={errors.name?.message}>
              <Input
                {...register('name', {
                  onChange: (e) => {
                    if (!isEditingExisting) setValue('slug', slugify(e.target.value));
                  },
                })}
              />
            </Field>
            <Field label="Slug" error={errors.slug?.message}>
              <Input {...register('slug')} />
            </Field>
          </div>
          <Field label="Description" error={errors.description?.message}>
            <Input {...register('description')} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price (RWF)" error={errors.priceRwf?.message}>
              <Input type="number" min={0} {...register('priceRwf')} />
            </Field>
            <Field label="Colour">
              <Select {...register('colorKey')}>
                {COLOR_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Icon">
              <Select {...register('icon')}>
                {ICON_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wide text-ink-faint">
              Products in this kit ({productIds.length} selected)
            </span>
            {errors.productIds && (
              <span className="mt-1 block text-xs text-red-600">{errors.productIds.message}</span>
            )}
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full rounded-lg border border-hairline bg-cream py-2 pl-9 pr-3 text-sm outline-none focus:border-[hsl(var(--accent-ink))]"
              />
            </div>
            <div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-lg border border-hairline p-2">
              {filteredProducts.map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-sunk"
                >
                  <input
                    type="checkbox"
                    checked={productIds.includes(p.id)}
                    onChange={() => toggleProduct(p.id)}
                    className="h-4 w-4 rounded border-hairline text-[hsl(var(--accent-ink))] focus:ring-[hsl(var(--accent-ink))]"
                  />
                  <span className="flex-1 truncate text-ink">{p.name}</span>
                  <span className="shrink-0 text-xs text-ink-faint">{rwfFull(p.priceRwf)}</span>
                </label>
              ))}
              {filteredProducts.length === 0 && (
                <p className="px-2 py-3 text-center text-xs text-ink-faint">No products match.</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            {isEditingExisting ? (
              <Button type="button" variant="danger" onClick={onDelete} disabled={deleteKit.isPending}>
                <Trash2 className="h-4 w-4" aria-hidden />
                Delete kit
              </Button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isEditingExisting ? 'Save changes' : 'Create kit'}
              </Button>
            </div>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
