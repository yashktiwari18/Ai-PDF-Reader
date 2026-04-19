import { cn } from '../utils/cn';

/**
 * Loader / Spinner — reusable across the whole app.
 *
 * Props:
 *  size    — 'xs' | 'sm' | 'md' | 'lg'  (default: 'md')
 *  color   — any Tailwind text-* class    (default: 'text-brand-500')
 *  label   — accessible screen-reader text
 *  full    — if true, centers in parent with flex
 */

const sizeMap = {
  xs: 'w-3 h-3 border-[2px]',
  sm: 'w-4 h-4 border-[2px]',
  md: 'w-6 h-6 border-2',
  lg: 'w-9 h-9 border-[3px]',
};

export default function Loader({
  size = 'md',
  color = 'text-brand-500',
  label = 'Loading…',
  full = false,
}) {
  const spinner = (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block rounded-full border-current border-t-transparent animate-spin',
        sizeMap[size],
        color
      )}
    />
  );

  if (full) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8">
        {spinner}
        {label && (
          <span className="text-xs text-slate-400 animate-pulse-soft">{label}</span>
        )}
      </div>
    );
  }

  return spinner;
}
