import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const fieldStyles =
  'w-full rounded-lg border border-hairline bg-cream px-3 py-2 text-sm text-ink outline-none transition-colors duration-150 focus:border-[hsl(var(--accent-ink))] disabled:opacity-50';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldStyles, className)} {...props} />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldStyles, 'resize-y', className)} {...props} />
  ),
);
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(fieldStyles, className)} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

interface FieldProps extends LabelHTMLAttributes<HTMLLabelElement> {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

/** Label + control + error, the one wrapper every form field uses. */
export function Field({ label, error, hint, children, className, ...props }: FieldProps) {
  return (
    <label className={cn('block', className)} {...props}>
      <span className="text-xs font-bold uppercase tracking-wide text-ink-faint">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && !error && <span className="mt-1 block text-xs text-ink-faint">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export function Checkbox({ className, label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={cn('flex items-center gap-2 text-sm font-semibold text-ink', className)}>
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-hairline text-[hsl(var(--accent-ink))] focus:ring-[hsl(var(--accent-ink))]"
        {...props}
      />
      {label}
    </label>
  );
}
