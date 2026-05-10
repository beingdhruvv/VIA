import { SkeletonLine } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return (
    <div className="md:ml-[260px] pt-14 md:pt-0 min-h-screen bg-via-white">
      <div className="flex h-full">
        {/* stops panel */}
        <div className="w-72 border-r border-via-grey-light p-4 flex flex-col gap-4">
          <SkeletonLine w="60%" h="1.5rem" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border border-via-grey-light p-3 flex flex-col gap-2">
              <SkeletonLine w="70%" h="1rem" />
              <SkeletonLine w="40%" h="0.75rem" />
            </div>
          ))}
        </div>
        {/* main content */}
        <div className="flex-1 p-6 flex flex-col gap-4">
          <SkeletonLine w="40%" h="2rem" />
          <SkeletonLine w="25%" h="1rem" />
          <div className="animate-pulse bg-via-grey-light h-64 mt-4 rounded" />
        </div>
      </div>
    </div>
  );
}
