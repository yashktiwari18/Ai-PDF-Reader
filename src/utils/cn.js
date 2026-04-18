/**
 * Tiny className merge utility — joins truthy class strings.
 * Avoids pulling in clsx/tailwind-merge as a dependency.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
