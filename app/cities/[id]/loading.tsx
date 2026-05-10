import { SkeletonLine, CardSkeleton } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return (
    <div className="md:ml-[260px] pt-14 md:pt-0 min-h-screen bg-via-white">
      <div className="animate-pulse bg-via-grey-light h-64 w-full" />
      <div className="p-6 flex flex-col gap-6 max-w-4xl">
        <SkeletonLine w="50%" h="2rem" />
        <SkeletonLine w="30%" h="1rem" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}
