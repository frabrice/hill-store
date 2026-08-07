import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/admin/Card';
import { Button } from '@/components/admin/Button';
import { Drawer } from '@/components/admin/Drawer';
import { Field, Input, Textarea } from '@/components/admin/Field';
import { usePolicies, useUpdatePolicy } from '@/hooks/useCatalog';
import type { Policy } from '@/lib/services/types';

const policyFormSchema = z.object({
  title: z.string().min(1, 'Required'),
  body: z.string().min(1, 'Required'),
});

type PolicyFormValues = z.infer<typeof policyFormSchema>;

function today() {
  return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function Policies() {
  const { data: policies } = usePolicies();
  const updatePolicy = useUpdatePolicy();

  const [editing, setEditing] = useState<Policy | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PolicyFormValues>({ resolver: zodResolver(policyFormSchema) });

  useEffect(() => {
    if (editing) reset({ title: editing.title, body: editing.body });
  }, [editing, reset]);

  const onSubmit = async (values: PolicyFormValues) => {
    if (!editing) return;
    try {
      await updatePolicy.mutateAsync({
        key: editing.key,
        patch: { ...values, updated: today() },
      });
      toast.success('Policy updated');
      setEditing(null);
    } catch {
      toast.error('Something went wrong — please try again.');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-sans text-2xl font-bold text-ink">Policies</h1>
        <p className="mt-1 text-sm text-ink-soft">
          The legal pages shown on the storefront — privacy, terms and returns.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {policies?.map((p) => (
          <Card key={p.key} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setEditing(p)}>
            <CardContent className="p-5">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-surface-sunk text-ink-soft">
                <FileText className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-3 font-sans text-sm font-bold text-ink">{p.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{p.body}</p>
              <p className="mt-3 text-xs font-semibold text-ink-faint">Updated {p.updated}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Drawer open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} title="Edit policy">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field label="Title" error={errors.title?.message}>
            <Input {...register('title')} />
          </Field>
          <Field label="Body" error={errors.body?.message} hint="Separate paragraphs with a blank line">
            <Textarea rows={14} {...register('body')} />
          </Field>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Save changes
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
