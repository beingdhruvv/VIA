import { SkeletonLine } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return (
    <div className="md:ml-[260px] pt-14 md:pt-0 min-h-screen bg-via-white p-6">
      <div className="max-w-xl flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <div className="animate-pulse bg-via-grey-light w-16 h-16 rounded-full" />
          <div className="flex flex-col gap-2 flex-1">
            <SkeletonLine w="40%" h="1.25rem" />
            <SkeletonLine w="60%" h="0.875rem" />
          </div>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <SkeletonLine w="30%" h="1rem" />
            <div className="animate-pulse bg-via-grey-light h-10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
