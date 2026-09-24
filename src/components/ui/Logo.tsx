import { cn } from "@/lib/cn";
import { site } from "@/lib/content";

type LogoProps = {
  variant?: "light" | "dark";
  compact?: boolean;
};

export function Logo({ variant = "dark", compact = false }: LogoProps) {
  const isLight = variant === "light";

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        isLight && "drop-shadow-[0_12px_30px_rgba(0,0,0,0.2)]",
      )}
    >
      <img
        src={site.logo}
        alt={`${site.name} logo`}
        className={cn("w-auto object-contain", compact ? "h-24" : "h-[239px]")}
      />
    </div>
  );
}
