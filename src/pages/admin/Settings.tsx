import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/admin/Card';
import { Button } from '@/components/admin/Button';
import { Field, Input } from '@/components/admin/Field';
import { useSettings, useUpdateSettings } from '@/hooks/useCatalog';

const optionalUrl = z
  .string()
  .refine((v) => v === '' || /^https?:\/\//i.test(v), 'Enter a full URL starting with http:// or https://');

const settingsFormSchema = z.object({
  storeName: z.string().min(1, 'Required'),
  tagline: z.string().min(1, 'Required'),
  contactEmail: z.string().email('Enter a valid email'),
  contactPhone: z.string().min(1, 'Required'),
  whatsappNumber: z
    .string()
    .min(1, 'Required')
    .regex(/^\d+$/, 'Digits only, with country code — e.g. 250788748921'),
  freeDeliveryThresholdRwf: z.coerce.number().min(0),
  momoCode: z.string(),
  codCommitmentFeeRwf: z.coerce.number().min(0),
  facebookUrl: optionalUrl,
  instagramUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  twitterUrl: optionalUrl,
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export function Settings() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsFormValues>({ resolver: zodResolver(settingsFormSchema) });

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      await updateSettings.mutateAsync(values);
      toast.success('Settings saved');
    } catch {
      toast.error('Something went wrong — please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="font-sans text-2xl font-bold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Store info shown on the site, and the defaults checkout uses.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-ink-faint">Loading…</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Store info</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Store name" error={errors.storeName?.message}>
                <Input {...register('storeName')} />
              </Field>
              <Field label="Tagline" error={errors.tagline?.message}>
                <Input {...register('tagline')} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact email" error={errors.contactEmail?.message}>
                <Input type="email" {...register('contactEmail')} />
              </Field>
              <Field label="Contact phone" error={errors.contactPhone?.message}>
                <Input {...register('contactPhone')} />
              </Field>
              <Field
                label="WhatsApp number"
                error={errors.whatsappNumber?.message}
                hint="Digits only with country code — powers the WhatsApp button on every page"
                className="sm:col-span-2"
              >
                <Input {...register('whatsappNumber')} placeholder="250788748921" />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social media</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Facebook" error={errors.facebookUrl?.message}>
                <Input {...register('facebookUrl')} placeholder="https://facebook.com/yourpage" />
              </Field>
              <Field label="Instagram" error={errors.instagramUrl?.message}>
                <Input {...register('instagramUrl')} placeholder="https://instagram.com/yourpage" />
              </Field>
              <Field label="TikTok" error={errors.tiktokUrl?.message}>
                <Input {...register('tiktokUrl')} placeholder="https://tiktok.com/@yourpage" />
              </Field>
              <Field label="X (Twitter)" error={errors.twitterUrl?.message}>
                <Input {...register('twitterUrl')} placeholder="https://x.com/yourpage" />
              </Field>
              <p className="text-xs text-ink-faint sm:col-span-2">
                Leave blank to hide that icon from the storefront footer.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <Field
                label="Free delivery threshold (RWF)"
                error={errors.freeDeliveryThresholdRwf?.message}
                hint="Basket total at which delivery becomes free — shown in the cart drawer"
              >
                <Input type="number" min={0} {...register('freeDeliveryThresholdRwf')} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field
                label="MoMo merchant code"
                error={errors.momoCode?.message}
                hint="USSD code shown at checkout for customers to dial and pay manually — registered under Hill Store Ltd. Leave blank to hide the MoMo option's code and show a fallback message instead."
                className="sm:col-span-2"
              >
                <Input {...register('momoCode')} placeholder="*182*8*1*37306#" />
              </Field>
              <Field
                label="Pay-on-delivery commitment fee (RWF)"
                error={errors.codCommitmentFeeRwf?.message}
                hint="Paid via MoMo upfront before a pay-on-delivery order is accepted — deducted from the total, the rest is cash on arrival."
                className="sm:col-span-2"
              >
                <Input type="number" min={0} {...register('codCommitmentFeeRwf')} />
              </Field>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              Save settings
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
