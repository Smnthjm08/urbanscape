import type { ReactNode } from "react";
import { AlertCircleIcon, InboxIcon, WifiOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiError } from "@/types/api";

/**
 * Error view with a recovery action. Network failures get different copy from
 * server failures, because "retry" means something different for each.
 */
export function ErrorState({
  error,
  onRetry,
}: {
  error: ApiError;
  onRetry?: () => void;
}) {
  const Icon = error.isNetworkError ? WifiOffIcon : AlertCircleIcon;

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <Icon className="size-6 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-medium">
          {error.isNetworkError ? "Can't reach the server" : "Something broke"}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">{error.message}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <InboxIcon className="size-6 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

/** Matches PostCard's layout so the page doesn't reflow when data lands. */
export function PostCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
}

export function PostGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
