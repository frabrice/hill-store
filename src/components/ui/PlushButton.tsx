import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * The plush press.
 *
 * Everything pressable squishes slightly and springs back. Done in CSS rather
 * than JS so it costs nothing, works on links and buttons alike, and is
 * disabled automatically by the reduced-motion rule in index.css.
 */
const button = cva(
  [
    'inline-flex items-center justify-center gap-2 font-semibold',
    'rounded-full whitespace-nowrap select-none',
    'transition-[transform,box-shadow,background-color,color] duration-200 ease-plush',
    'active:scale-[0.97]',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        /* Solid accent — the primary action. Ink text on the pastel. */
        primary:
          'bg-[hsl(var(--accent))] text-ink shadow-plush hover:shadow-plush-lg hover:brightness-105',
        /* Strong ink fill, for checkout-grade commitment. */
        ink: 'bg-ink text-cream shadow-plush hover:shadow-plush-lg hover:brightness-110',
        /* Tinted, low-commitment. */
        soft: 'bg-[hsl(var(--accent)/0.18)] text-[hsl(var(--accent-ink))] hover:bg-[hsl(var(--accent)/0.28)]',
        outline:
          'bg-surface text-ink shadow-plush-sm ring-1 ring-hairline hover:ring-[hsl(var(--accent))] hover:shadow-plush',
        ghost: 'text-ink-soft hover:bg-surface-sunk hover:text-ink',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-[0.95rem]',
        lg: 'h-14 px-8 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

type BaseProps = VariantProps<typeof button> & { className?: string };

export interface PlushButtonProps
  extends BaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  /** Render as a router link instead of a button. */
  to?: string;
}

export const PlushButton = forwardRef<HTMLButtonElement, PlushButtonProps>(
  ({ className, variant, size, to, children, ...props }, ref) => {
    const classes = cn(button({ variant, size }), className);

    if (to) {
      return (
        <Link to={to} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  },
);

PlushButton.displayName = 'PlushButton';
