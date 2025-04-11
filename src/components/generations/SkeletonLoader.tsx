import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SkeletonLoader() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 