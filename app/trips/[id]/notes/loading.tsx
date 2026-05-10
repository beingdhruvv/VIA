import { SkeletonLine } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return (
    <div className="md:ml-[260px] pt-14 md:pt-0 min-h-screen bg-via-white p-6">
      <div className="max-w-2xl flex flex-col gap-6">
        <SkeletonLine w="35%" h="2rem" />
        <div className="animate-pulse bg-via-grey-light h-24 rounded" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-via-grey-light p-4 flex flex-col gap-2">
              <SkeletonLine w="80%" h="1rem" />
              <SkeletonLine w="50%" h="0.75rem" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
