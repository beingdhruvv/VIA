import { SkeletonLine, CardSkeleton } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return (
    <div className="md:ml-[260px] pt-14 md:pt-0 min-h-screen bg-via-white p-6">
      <div className="max-w-5xl flex flex-col gap-6">
        <SkeletonLine w="50%" h="2.5rem" />
        <SkeletonLine w="30%" h="1rem" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
