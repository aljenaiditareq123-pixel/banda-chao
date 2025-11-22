export function clsx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

// cn is a common alias for clsx (combine classes)
export const cn = clsx;
