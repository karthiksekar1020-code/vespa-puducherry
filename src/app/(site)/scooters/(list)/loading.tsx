import { ScooterCardSkeleton } from "@/components/shop/scooter-card";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-20 pt-44 lg:px-8" aria-busy="true" aria-label="Loading scooters">
      <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <ScooterCardSkeleton key={i} />)}</div>
    </div>
  );
}
