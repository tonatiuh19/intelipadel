import { Crown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SubscriptionBadgeProps {
  subscriptionName: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function SubscriptionBadge({
  subscriptionName,
  className,
  size = "md",
}: SubscriptionBadgeProps) {
  const sizeClasses = {
    sm: "text-xs py-0.5 px-2",
    md: "text-sm py-1 px-3",
    lg: "text-base py-1.5 px-4",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <Badge
      className={cn(
        "bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold",
        "hover:from-amber-600 hover:to-orange-600",
        "flex items-center gap-1.5",
        sizeClasses[size],
        className,
      )}
    >
      <Crown className={iconSizes[size]} />
      {subscriptionName}
      <Sparkles className={iconSizes[size]} />
    </Badge>
  );
}
