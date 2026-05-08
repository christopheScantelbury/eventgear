import { Skeleton } from './skeleton';

interface ListSkeletonProps {
  linhas?: number;
  altura?: number;
}

export function ListSkeleton({ linhas = 4, altura = 20 }: ListSkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: linhas }).map((_, i) => (
        <Skeleton key={i} className={`h-${altura} rounded-xl`} />
      ))}
    </div>
  );
}
