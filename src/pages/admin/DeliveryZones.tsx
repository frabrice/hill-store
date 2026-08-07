import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/admin/Card';
import { Button } from '@/components/admin/Button';
import { Drawer } from '@/components/admin/Drawer';
import { Field, Input } from '@/components/admin/Field';
import { useDeliveryZones, useUpdateDeliveryZone } from '@/hooks/useCatalog';
import { rwfFull } from '@/lib/format';
import type { DeliveryZone } from '@/lib/services/types';

const zoneFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  feeRwf: z.coerce.number().min(0, 'Must be 0 or more'),
  etaHours: z.string().min(1, 'Required'),
});

type ZoneFormValues = z.infer<typeof zoneFormSchema>;

export function DeliveryZones() {
  const { data: zones } = useDeliveryZones();
  const updateZone = useUpdateDeliveryZone();

  const [editing, setEditing] = useState<DeliveryZone | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ZoneFormValues>({ resolver: zodResolver(zoneFormSchema) });

  useEffect(() => {
    if (editing) reset({ name: editing.name, feeRwf: editing.feeRwf, etaHours: editing.etaHours });
  }, [editing, reset]);

  const onSubmit = async (values: ZoneFormValues) => {
    if (!editing) return;
    try {
      await updateZone.mutateAsync({ id: editing.id, patch: values });
      toast.success('Delivery zone updated');
      setEditing(null);
    } catch {
      toast.error('Something went wrong — please try again.');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-sans text-2xl font-bold text-ink">Delivery zones</h1>
        <p className="mt-1 text-sm text-ink-soft">{zones?.length ?? 0} zones across Kigali</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {zones?.map((z) => (
          <Card key={z.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setEditing(z)}>
            <CardContent className="p-5">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-surface-sunk text-ink-soft">
                <Truck className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-3 font-sans text-sm font-bold text-ink">{z.name}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-faint">{z.etaHours}</span>
                <span className="text-sm font-bold text-ink">{rwfFull(z.feeRwf)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Drawer open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} title="Edit delivery zone">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field label="Zone name" error={errors.name?.message}>
            <Input {...register('name')} />
          </Field>
          <Field label="Delivery fee (RWF)" error={errors.feeRwf?.message}>
            <Input type="number" min={0} {...register('feeRwf')} />
          </Field>
          <Field label="Estimated time" error={errors.etaHours?.message} hint="e.g. Same day, Within 24 hours">
            <Input {...register('etaHours')} />
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
