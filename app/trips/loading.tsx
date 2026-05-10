import { PageSkeleton } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return (
    <div className="md:ml-[260px] pt-14 md:pt-0 min-h-screen bg-via-white">
      <PageSkeleton cards={6} />
    </div>
  );
}
