import { useEffect, useState } from 'react';
import { Bike, Truck } from 'lucide-react';
import { RingDivider } from '@/components/brand/ComfortRing';
import { useDeliveryZones } from '@/hooks/useCatalog';
import { useUI } from '@/store/ui';
import { rwfFull } from '@/lib/format';

export function Delivery() {
  const { data: zones } = useDeliveryZones();
  const setAccent = useUI((s) => s.setAccent);
  const [selectedZoneId, setSelectedZoneId] = useState('');

  useEffect(() => {
    setAccent('sky');
  }, [setAccent]);

  const selectedZone = zones?.find((z) => z.id === selectedZoneId);

  return (
    <>
      <section className="relative overflow-hidden border-b border-hairline bg-[hsl(var(--accent)/0.14)]">
        <div className="relative mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
          <p className="text-eyebrow font-bold uppercase text-[hsl(var(--accent-ink))]">
            Delivery
          </p>
          <h1 className="mt-2 font-display text-display-lg font-bold">Delivery &amp; zones</h1>
          <RingDivider className="mx-auto mt-4" />
          <p className="mt-4 text-ink-soft">
            Same-day across Kigali, seven days a week — fees and timing depend on where
            you are and how big the order is.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        {/* --------------------------------------------------------- estimator */}
        <div className="rounded-3xl bg-surface p-6 shadow-plush sm:p-8">
          <h2 className="font-display text-xl font-bold">Estimate your delivery fee</h2>
          <label className="mt-4 block">
            <span className="text-sm font-semibold text-ink">Your area</span>
            <select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-hairline bg-cream px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--accent))]"
            >
              <option value="">Choose your area</option>
              {zones?.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </label>

          {selectedZone && (
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-surface-sunk p-4">
              <div>
                <p className="font-semibold text-ink">{selectedZone.name}</p>
                <p className="text-sm text-ink-soft">{selectedZone.etaHours}</p>
              </div>
              <p className="font-display text-xl font-bold text-[hsl(var(--accent-ink))]">
                {rwfFull(selectedZone.feeRwf)}
              </p>
            </div>
          )}
        </div>

        {/* -------------------------------------------------------------- zones */}
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold">All zones</h2>
          <RingDivider className="mt-3" />
          <div className="mt-4 overflow-hidden rounded-3xl bg-surface shadow-plush-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-5 py-3 font-semibold">Zone</th>
                  <th className="px-5 py-3 font-semibold">Fee</th>
                  <th className="px-5 py-3 font-semibold">Delivery time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {zones?.map((z) => (
                  <tr key={z.id}>
                    <td className="px-5 py-3 font-medium text-ink">{z.name}</td>
                    <td className="px-5 py-3 text-ink-soft">{rwfFull(z.feeRwf)}</td>
                    <td className="px-5 py-3 text-ink-soft">{z.etaHours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ------------------------------------------------------------- tiers */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl bg-mint/15 p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint/30">
              <Bike className="h-5 w-5 text-mint-deep" aria-hidden />
            </span>
            <div>
              <p className="font-display font-bold">Most orders — by motorbike</p>
              <p className="mt-1 text-sm text-ink-soft">
                Bottles, clothing, nappies and the rest of the everyday range travel by bike,
                which is why they can move same-day.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-sunny/15 p-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sunny/30">
              <Truck className="h-5 w-5 text-sunny-deep" aria-hidden />
            </span>
            <div>
              <p className="font-display font-bold">Large items — by car or van</p>
              <p className="mt-1 text-sm text-ink-soft">
                Cots, strollers, car seats and anything else too big or heavy for a bike are
                flagged automatically on the product page, with delivery arranged accordingly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
