import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/admin/Card';
import { Button } from '@/components/admin/Button';
import { Drawer } from '@/components/admin/Drawer';
import { Field, Input, Select } from '@/components/admin/Field';
import { useCategories, useCreateCategory, useUpdateCategory } from '@/hooks/useCatalog';
import { resolveIcon, ICON_KEYS } from '@/lib/icons';
import { ACCENTS, COLOR_KEYS } from '@/lib/theme';
import type { Category } from '@/lib/services/types';

const subcategorySchema = z.object({ slug: z.string().min(1, 'Required'), name: z.string().min(1, 'Required') });

const categoryFormSchema = z.object({
  slug: z.string().min(1, 'Required').regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only'),
  name: z.string().min(1, 'Required'),
  tagline: z.string().min(1, 'Required'),
  colorKey: z.enum(['pink', 'mint', 'sky', 'sunny', 'lavender', 'coral', 'teal', 'indigo', 'orchid', 'moss']),
  icon: z.string().min(1),
  sortOrder: z.coerce.number(),
  subcategories: z.array(subcategorySchema),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const EMPTY_VALUES: CategoryFormValues = {
  slug: '',
  name: '',
  tagline: '',
  colorKey: 'pink',
  icon: ICON_KEYS[0],
  sortOrder: 1,
  subcategories: [],
};

function toFormValues(category: Category): CategoryFormValues {
  return {
    slug: category.slug,
    name: category.name,
    tagline: category.tagline,
    colorKey: category.colorKey,
    icon: category.icon,
    sortOrder: category.sortOrder,
    subcategories: category.subcategories,
  };
}

export function Categories() {
  const { data: categories } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const [editing, setEditing] = useState<Category | 'new' | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  const subcats = useFieldArray({ control, name: 'subcategories' });

  useEffect(() => {
    if (editing === 'new') reset(EMPTY_VALUES);
    else if (editing) reset(toFormValues(editing));
  }, [editing, reset]);

  const isEditingExisting = editing !== null && editing !== 'new';

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (isEditingExisting && editing) {
        await updateCategory.mutateAsync({ id: editing.id, patch: values });
        toast.success('Category updated');
      } else {
        await createCategory.mutateAsync(values);
        toast.success('Category created');
      }
      setEditing(null);
    } catch {
      toast.error('Something went wrong — please try again.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-sans text-2xl font-bold text-ink">Categories</h1>
          <p className="mt-1 text-sm text-ink-soft">{categories?.length ?? 0} categories</p>
        </div>
        <Button onClick={() => setEditing('new')}>
          <Plus className="h-4 w-4" aria-hidden />
          Add category
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories?.map((c) => {
          const Icon = resolveIcon(c.icon);
          const accent = ACCENTS[c.colorKey];
          return (
            <Card key={c.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setEditing(c)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <span
                    className="grid h-10 w-10 place-items-center rounded-lg"
                    style={{ backgroundColor: `hsl(${accent.soft})`, color: `hsl(${accent.ink})` }}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="text-xs font-semibold text-ink-faint">#{c.sortOrder}</span>
                </div>
                <p className="mt-3 font-sans text-sm font-bold text-ink">{c.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{c.tagline}</p>
                <p className="mt-3 text-xs font-semibold text-ink-faint">
                  {c.subcategories.length} subcategories
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Drawer
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        title={isEditingExisting ? 'Edit category' : 'Add category'}
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
          <Field label="Tagline" error={errors.tagline?.message}>
            <Input {...register('tagline')} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
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
            <Field label="Sort order">
              <Input type="number" {...register('sortOrder')} />
            </Field>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-ink-faint">Subcategories</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => subcats.append({ slug: '', name: '' })}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden /> Add
              </Button>
            </div>
            <div className="mt-2 space-y-2">
              {subcats.fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                  <Field label="Name">
                    <Input {...register(`subcategories.${index}.name`)} />
                  </Field>
                  <Field label="Slug">
                    <Input {...register(`subcategories.${index}.slug`)} />
                  </Field>
                  <Button
                    type="button"
                    variant="danger"
                    size="icon"
                    onClick={() => subcats.remove(index)}
                    aria-label="Remove subcategory"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEditingExisting ? 'Save changes' : 'Create category'}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
