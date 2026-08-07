import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Clock, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/admin/Card';
import { Button } from '@/components/admin/Button';
import { Drawer } from '@/components/admin/Drawer';
import { Field, Input, Select, Textarea } from '@/components/admin/Field';
import { useArticles, useCreateArticle, useUpdateArticle } from '@/hooks/useCatalog';
import { ACCENTS, COLOR_KEYS } from '@/lib/theme';
import { formatDate } from '@/lib/format';
import type { Article } from '@/lib/services/types';

const articleFormSchema = z.object({
  slug: z.string().min(1, 'Required').regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only'),
  title: z.string().min(1, 'Required'),
  excerpt: z.string().min(1, 'Required'),
  body: z.string().min(1, 'Required'),
  topic: z.string().min(1, 'Required'),
  readMinutes: z.coerce.number().min(1),
  author: z.string().min(1, 'Required'),
  publishedAt: z.string().min(1, 'Required'),
  colorKey: z.enum(['pink', 'mint', 'sky', 'sunny', 'lavender', 'coral', 'teal', 'indigo', 'orchid', 'moss']),
});

type ArticleFormValues = z.infer<typeof articleFormSchema>;

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const EMPTY_VALUES: ArticleFormValues = {
  slug: '',
  title: '',
  excerpt: '',
  body: '',
  topic: '',
  readMinutes: 3,
  author: 'Ibibondo',
  publishedAt: new Date().toISOString().slice(0, 10),
  colorKey: 'lavender',
};

function toFormValues(article: Article): ArticleFormValues {
  return {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    body: article.body,
    topic: article.topic,
    readMinutes: article.readMinutes,
    author: article.author,
    publishedAt: article.publishedAt,
    colorKey: article.colorKey,
  };
}

export function Articles() {
  const { data: articles } = useArticles();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();

  const [editing, setEditing] = useState<Article | 'new' | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  const isEditingExisting = editing !== null && editing !== 'new';

  useEffect(() => {
    if (editing === 'new') reset(EMPTY_VALUES);
    else if (editing) reset(toFormValues(editing));
  }, [editing, reset]);

  const onSubmit = async (values: ArticleFormValues) => {
    try {
      if (isEditingExisting && editing) {
        await updateArticle.mutateAsync({ id: editing.id, patch: values });
        toast.success('Article updated');
      } else {
        await createArticle.mutateAsync(values);
        toast.success('Article created');
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
          <h1 className="font-sans text-2xl font-bold text-ink">Learn articles</h1>
          <p className="mt-1 text-sm text-ink-soft">{articles?.length ?? 0} guides published</p>
        </div>
        <Button onClick={() => setEditing('new')}>
          <Plus className="h-4 w-4" aria-hidden />
          Add article
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles?.map((a) => {
          const accent = ACCENTS[a.colorKey];
          return (
            <Card key={a.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setEditing(a)}>
              <CardContent className="p-5">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{ backgroundColor: `hsl(${accent.soft})`, color: `hsl(${accent.ink})` }}
                >
                  {a.topic}
                </span>
                <p className="mt-3 font-sans text-sm font-bold text-ink">{a.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{a.excerpt}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-ink-faint">
                  <span>{a.author} · {formatDate(a.publishedAt)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden /> {a.readMinutes} min
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Drawer
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        title={isEditingExisting ? 'Edit article' : 'Add article'}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" error={errors.title?.message}>
              <Input
                {...register('title', {
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
          <Field label="Excerpt" error={errors.excerpt?.message}>
            <Textarea rows={2} {...register('excerpt')} />
          </Field>
          <Field label="Body" error={errors.body?.message} hint="Separate paragraphs with a blank line">
            <Textarea rows={8} {...register('body')} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Topic" error={errors.topic?.message} hint="e.g. Feeding, Sleep, Bonding">
              <Input {...register('topic')} />
            </Field>
            <Field label="Author" error={errors.author?.message}>
              <Input {...register('author')} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Read minutes" error={errors.readMinutes?.message}>
              <Input type="number" min={1} {...register('readMinutes')} />
            </Field>
            <Field label="Published" error={errors.publishedAt?.message}>
              <Input type="date" {...register('publishedAt')} />
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
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEditingExisting ? 'Save changes' : 'Create article'}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
