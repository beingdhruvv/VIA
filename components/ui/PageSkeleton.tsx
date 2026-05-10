"use client";

export function SkeletonLine({ w = "100%", h = "1rem" }: { w?: string; h?: string }) {
  return (
    <div
      className="animate-pulse rounded bg-via-grey-light"
      style={{ width: w, height: h }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="border border-via-grey-light p-4 flex flex-col gap-3">
      <SkeletonLine w="60%" h="1.25rem" />
      <SkeletonLine w="40%" h="0.875rem" />
      <SkeletonLine w="80%" h="0.875rem" />
    </div>
  );
}

export function PageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="p-6 flex flex-col gap-6 max-w-4xl">
      <SkeletonLine w="40%" h="2rem" />
      <SkeletonLine w="25%" h="1rem" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {Array.from({ length: cards }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
