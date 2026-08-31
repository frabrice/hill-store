import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/Card';
import { Button } from '@/components/admin/Button';
import { Field, Input, Textarea, Select, Checkbox } from '@/components/admin/Field';
import { CloudinaryUploader } from '@/components/admin/CloudinaryUploader';
import {
  useCategories,
  useCreateProduct,
  useDeleteProduct,
  useProduct,
  useStages,
  useUpdateProduct,
} from '@/hooks/useCatalog';
import { ART_KEYS } from '@/components/brand/ProductArt';
import { deliveryMethodFor, deliveryMethodNote } from '@/lib/delivery';
import type { ColorOption, Product, ProductVariant } from '@/lib/services/types';

const variantSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Required'),
  priceDelta: z.coerce.number(),
  stock: z.coerce.number().min(0),
  sku: z.string().min(1, 'Required'),
});

const colorOptionSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Required'),
  hex: z.string().min(1, 'Required'),
  stock: z.coerce.number().min(0),
});

const productFormSchema = z.object({
  slug: z
    .string()
    .min(1, 'Required')
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only'),
  name: z.string().min(1, 'Required'),
  subtitle: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  categorySlug: z.string().min(1, 'Choose a category'),
  subcategorySlug: z.string(),
  brand: z.string().min(1, 'Required'),
  priceRwf: z.coerce.number().min(0, 'Must be 0 or more'),
  compareAtRwf: z.coerce.number().min(0).optional(),
  art: z.string().min(1, 'Choose an illustration'),
  images: z.array(z.string()),
  tagsText: z.string(),
  stageSlugs: z.array(z.string()),
  stock: z.coerce.number().min(0),
  rating: z.coerce.number().min(0).max(5),
  reviewCount: z.coerce.number().min(0),
  isFeatured: z.boolean(),
  isBestseller: z.boolean(),
  careNotesText: z.string(),
  lengthCm: z.coerce.number().min(0),
  widthCm: z.coerce.number().min(0),
  heightCm: z.coerce.number().min(0),
  weightKg: z.coerce.number().min(0),
  variants: z.array(variantSchema),
  colorOptions: z.array(colorOptionSchema),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const newId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function toFormValues(product: Product): ProductFormValues {
  return {
    slug: product.slug,
    name: product.name,
    subtitle: product.subtitle,
    description: product.description,
    categorySlug: product.categorySlug,
    subcategorySlug: product.subcategorySlug ?? '',
    brand: product.brand,
    priceRwf: product.priceRwf,
    compareAtRwf: product.compareAtRwf ?? undefined,
    art: product.art,
    images: product.images,
    tagsText: product.tags.join(', '),
    stageSlugs: product.stageSlugs,
    stock: product.stock,
    rating: product.rating,
    reviewCount: product.reviewCount,
    isFeatured: product.isFeatured,
    isBestseller: product.isBestseller,
    careNotesText: product.careNotes.join('\n'),
    lengthCm: product.dimensions.lengthCm,
    widthCm: product.dimensions.widthCm,
    heightCm: product.dimensions.heightCm,
    weightKg: product.dimensions.weightKg,
    variants: product.variants,
    colorOptions: product.colorOptions,
  };
}

const EMPTY_VALUES: ProductFormValues = {
  slug: '',
  name: '',
  subtitle: '',
  description: '',
  categorySlug: '',
  subcategorySlug: '',
  brand: 'Hill Store',
  priceRwf: 0,
  compareAtRwf: undefined,
  art: ART_KEYS[0],
  images: [],
  tagsText: '',
  stageSlugs: [],
  stock: 0,
  rating: 4.5,
  reviewCount: 0,
  isFeatured: false,
  isBestseller: false,
  careNotesText: '',
  lengthCm: 15,
  widthCm: 12,
  heightCm: 10,
  weightKg: 0.3,
  variants: [],
  colorOptions: [],
};

function splitList(text: string) {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function toProductInput(values: ProductFormValues): Omit<Product, 'id' | 'createdAt'> {
  return {
    slug: values.slug,
    name: values.name,
    subtitle: values.subtitle,
    description: values.description,
    categorySlug: values.categorySlug,
    subcategorySlug: values.subcategorySlug || null,
    brand: values.brand,
    priceRwf: values.priceRwf,
    compareAtRwf: values.compareAtRwf || null,
    images: values.images,
    art: values.art,
    stageSlugs: values.stageSlugs,
    tags: splitList(values.tagsText),
    rating: values.rating,
    reviewCount: values.reviewCount,
    stock: values.stock,
    isFeatured: values.isFeatured,
    isBestseller: values.isBestseller,
    careNotes: values.careNotesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    variants: values.variants as ProductVariant[],
    colorOptions: values.colorOptions as ColorOption[],
    dimensions: {
      lengthCm: values.lengthCm,
      widthCm: values.widthCm,
      heightCm: values.heightCm,
      weightKg: values.weightKg,
    },
  };
}

export function ProductForm() {
  const { slug } = useParams();
  const isEditing = Boolean(slug);
  const navigate = useNavigate();

  const { data: existing, isLoading: loadingExisting } = useProduct(slug);
  const { data: categories } = useCategories();
  const { data: stages } = useStages();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (existing) reset(toFormValues(existing));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

  const variantsArray = useFieldArray({ control, name: 'variants' });
  const colorsArray = useFieldArray({ control, name: 'colorOptions' });

  const categorySlug = watch('categorySlug');
  const stageSlugs = watch('stageSlugs');
  const name = watch('name');
  const dims = watch(['lengthCm', 'widthCm', 'heightCm', 'weightKg']);

  const category = categories?.find((c) => c.slug === categorySlug);
  const method = deliveryMethodFor({
    lengthCm: dims[0] || 0,
    widthCm: dims[1] || 0,
    heightCm: dims[2] || 0,
    weightKg: dims[3] || 0,
  });

  const onSubmit = async (values: ProductFormValues) => {
    try {
      if (isEditing && existing) {
        await updateProduct.mutateAsync({ id: existing.id, patch: toProductInput(values) });
        toast.success('Product updated');
      } else {
        await createProduct.mutateAsync(toProductInput(values));
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch {
      toast.error('Something went wrong — please try again.');
    }
  };

  const onDelete = async () => {
    if (!isEditing || !existing) return;
    const confirmed = window.confirm(`Delete "${existing.name}"? This can't be undone.`);
    if (!confirmed) return;
    try {
      await deleteProduct.mutateAsync(existing.id);
      toast.success('Product deleted');
      navigate('/admin/products');
    } catch {
      toast.error('Something went wrong — please try again.');
    }
  };

  const toggleStage = (stageSlug: string) => {
    setValue(
      'stageSlugs',
      stageSlugs.includes(stageSlug)
        ? stageSlugs.filter((s) => s !== stageSlug)
        : [...stageSlugs, stageSlug],
      { shouldDirty: true },
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/products')}
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft hover:bg-surface-sunk"
            aria-label="Back to products"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </button>
          <div>
            <h1 className="font-sans text-2xl font-bold text-ink">
              {isEditing ? 'Edit product' : 'Add product'}
            </h1>
            {isEditing && <p className="mt-0.5 text-sm text-ink-soft">{name}</p>}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Identity</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" error={errors.name?.message}>
                <Input
                  {...register('name', {
                    onChange: (e) => {
                      if (!isEditing) setValue('slug', slugify(e.target.value));
                    },
                  })}
                />
              </Field>
              <Field label="Slug" error={errors.slug?.message} hint="Used in the product URL">
                <Input {...register('slug')} />
              </Field>
              <Field label="Subtitle" error={errors.subtitle?.message} className="sm:col-span-2">
                <Input {...register('subtitle')} />
              </Field>
              <Field label="Description" error={errors.description?.message} className="sm:col-span-2">
                <Textarea rows={4} {...register('description')} />
              </Field>
              <Field label="Brand" error={errors.brand?.message}>
                <Input {...register('brand')} />
              </Field>
              <Field label="Illustration" error={errors.art?.message} hint="Shown until a real photo is added">
                <Select {...register('art')}>
                  {ART_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </Select>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" error={errors.categorySlug?.message}>
                <Select
                  {...register('categorySlug', {
                    onChange: () => setValue('subcategorySlug', ''),
                  })}
                >
                  <option value="">Choose a category</option>
                  {categories?.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Subcategory" hint="Optional">
                <Select {...register('subcategorySlug')} disabled={!category}>
                  <option value="">None</option>
                  {category?.subcategories.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing &amp; stock</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Price (RWF)" error={errors.priceRwf?.message}>
                <Input type="number" min={0} {...register('priceRwf')} />
              </Field>
              <Field label="Compare-at price (RWF)" hint="Leave blank if not on offer">
                <Input type="number" min={0} {...register('compareAtRwf')} />
              </Field>
              <Field label="Stock" error={errors.stock?.message}>
                <Input type="number" min={0} {...register('stock')} />
              </Field>
              <Field label="Rating">
                <Input type="number" min={0} max={5} step="any" {...register('rating')} />
              </Field>
              <Field label="Review count">
                <Input type="number" min={0} {...register('reviewCount')} />
              </Field>
              <div className="flex flex-col justify-center gap-2 pt-5">
                <Checkbox label="Featured" {...register('isFeatured')} />
                <Checkbox label="Bestseller" {...register('isBestseller')} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Presentation</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Field label="Images" hint="Leave empty to show the illustration instead.">
                <CloudinaryUploader
                  value={watch('images')}
                  onChange={(next) => setValue('images', next, { shouldDirty: true })}
                />
              </Field>
              <Field label="Tags" hint="Comma-separated, e.g. preemie, organic, set-of-3">
                <Input {...register('tagsText')} />
              </Field>
              <Field label="Care notes" hint="One per line">
                <Textarea rows={3} {...register('careNotesText')} />
              </Field>
              <div>
                <span className="text-xs font-bold uppercase tracking-wide text-ink-faint">
                  Suitable stages
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {stages?.map((s) => (
                    <button
                      key={s.slug}
                      type="button"
                      onClick={() => toggleStage(s.slug)}
                      className={
                        stageSlugs.includes(s.slug)
                          ? 'rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-cream'
                          : 'rounded-full border border-hairline px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-surface-sunk'
                      }
                    >
                      {s.shortLabel}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Size &amp; weight</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-4 sm:grid-cols-4">
                <Field label="Length (cm)">
                  <Input type="number" min={0} step="any" {...register('lengthCm')} />
                </Field>
                <Field label="Width (cm)">
                  <Input type="number" min={0} step="any" {...register('widthCm')} />
                </Field>
                <Field label="Height (cm)">
                  <Input type="number" min={0} step="any" {...register('heightCm')} />
                </Field>
                <Field label="Weight (kg)">
                  <Input type="number" min={0} step="any" {...register('weightKg')} />
                </Field>
              </div>
              <p className="text-xs text-ink-soft">
                <span className="font-semibold text-ink">
                  {method === 'van' ? 'Car/van delivery.' : 'Motorbike delivery.'}
                </span>{' '}
                {deliveryMethodNote(method)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  variantsArray.append({ id: newId('v'), label: '', priceDelta: 0, stock: 0, sku: '' })
                }
              >
                <Plus className="h-3.5 w-3.5" aria-hidden /> Add variant
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {variantsArray.fields.length === 0 && (
                <p className="text-sm text-ink-faint">No size/volume variants — this product sells as one option.</p>
              )}
              {variantsArray.fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-end gap-2 rounded-lg border border-hairline p-3">
                  <Field label="Label">
                    <Input {...register(`variants.${index}.label`)} />
                  </Field>
                  <Field label="Price delta">
                    <Input type="number" {...register(`variants.${index}.priceDelta`)} />
                  </Field>
                  <Field label="Stock">
                    <Input type="number" min={0} {...register(`variants.${index}.stock`)} />
                  </Field>
                  <Field label="SKU">
                    <Input {...register(`variants.${index}.sku`)} />
                  </Field>
                  <Button
                    type="button"
                    variant="danger"
                    size="icon"
                    onClick={() => variantsArray.remove(index)}
                    aria-label="Remove variant"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Colour options</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => colorsArray.append({ id: newId('col'), label: '', hex: '#f3ebdd', stock: 0 })}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden /> Add colour
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {colorsArray.fields.length === 0 && (
                <p className="text-sm text-ink-faint">No colour choices for this product.</p>
              )}
              {colorsArray.fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[auto_1fr_1fr_auto] items-end gap-2 rounded-lg border border-hairline p-3">
                  <Controller
                    control={control}
                    name={`colorOptions.${index}.hex`}
                    render={({ field: hexField }) => (
                      <Field label="Swatch">
                        <input
                          type="color"
                          value={hexField.value}
                          onChange={hexField.onChange}
                          className="h-9 w-14 cursor-pointer rounded-lg border border-hairline"
                        />
                      </Field>
                    )}
                  />
                  <Field label="Label">
                    <Input {...register(`colorOptions.${index}.label`)} />
                  </Field>
                  <Field label="Stock">
                    <Input type="number" min={0} {...register(`colorOptions.${index}.stock`)} />
                  </Field>
                  <Button
                    type="button"
                    variant="danger"
                    size="icon"
                    onClick={() => colorsArray.remove(index)}
                    aria-label="Remove colour"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-3 pb-8">
            {isEditing ? (
              <Button type="button" variant="danger" onClick={onDelete} disabled={deleteProduct.isPending}>
                <Trash2 className="h-4 w-4" aria-hidden />
                Delete product
              </Button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || loadingExisting}>
                {isEditing ? 'Save changes' : 'Create product'}
              </Button>
            </div>
          </div>
        </form>
      </div>
  );
}

