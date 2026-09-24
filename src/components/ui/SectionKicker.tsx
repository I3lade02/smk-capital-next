import { cn } from "@/lib/cn";

type SectionKickerProps = {
  children: string;
  className?: string;
};

export function SectionKicker({ children, className }: SectionKickerProps) {
  return (
    <p
      className={cn(
        "mb-4 text-xs font-bold uppercase tracking-[0.32em] text-[#c89750]",
        className,
      )}
    >
      {children}
    </p>
  );
}
