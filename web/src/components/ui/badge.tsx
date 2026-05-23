import { cn } from "@/lib/utils";

/**
 * Layer badge — each capability layer maps to one Anthropic-flavor
 * swatch. Backgrounds use the swatch at low opacity so the chip
 * tints rather than shouts; text is ink so it stays legible at
 * 11px on cream.
 */
const LAYER_COLORS = {
  tools: "bg-cloud/30 text-ink",
  planning: "bg-cactus/40 text-ink",
  memory: "bg-heather/40 text-ink",
  concurrency: "bg-coral/55 text-ink",
  collaboration: "bg-fig/25 text-ink",
} as const;

interface BadgeProps {
  layer: keyof typeof LAYER_COLORS;
  children: React.ReactNode;
  className?: string;
}

export function LayerBadge({ layer, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium tracking-[0.01em]",
        LAYER_COLORS[layer],
        className,
      )}
    >
      {children}
    </span>
  );
}
