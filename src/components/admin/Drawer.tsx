import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

/** A right-hand side panel for admin create/edit forms — Categories and
 * Kits are simple enough not to need their own route, unlike Products, but
 * still get room to breathe rather than a cramped centred popup. */
export function Drawer({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-ink/25 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out data-[state=open]:fade-in" />
        <Dialog.Content
          className="fixed inset-y-0 right-0 z-[80] flex w-full flex-col bg-surface shadow-plush-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:w-1/2 sm:min-w-[480px]"
          aria-describedby={undefined}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-hairline px-5 py-4">
            <Dialog.Title className="font-sans text-base font-bold text-ink">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-surface-sunk"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
