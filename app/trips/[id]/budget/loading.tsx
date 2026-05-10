import { SkeletonLine, CardSkeleton } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return (
    <div className="md:ml-[260px] pt-14 md:pt-0 min-h-screen bg-via-white p-6">
      <div className="max-w-3xl flex flex-col gap-6">
        <SkeletonLine w="40%" h="2rem" />
        <div className="animate-pulse bg-via-grey-light h-48 rounded" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
