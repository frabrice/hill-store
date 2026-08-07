import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Admin's own button — deliberately not `PlushButton`. No squish, no spring;
 * a fast, flat 150ms fade is the whole motion vocabulary here.
 */
const buttonStyles = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold font-sans transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-ink text-cream hover:bg-ink/90',
        outline: 'border border-hairline bg-surface text-ink hover:bg-surface-sunk',
        ghost: 'text-ink-soft hover:bg-surface-sunk hover:text-ink',
        danger: 'bg-red-50 text-red-600 hover:bg-red-100',
        accent:
          'bg-[hsl(var(--accent-ink))] text-cream hover:bg-[hsl(var(--accent-ink))]/90',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-5 text-sm',
        icon: 'h-9 w-9 shrink-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonStyles({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = 'Button';
