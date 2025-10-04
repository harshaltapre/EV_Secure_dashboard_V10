import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MapLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-green-50">
      <div className="lg:ml-64 p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-56 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Container Skeleton */}
          <div className="lg:col-span-3">
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg h-[600px]">
              <CardContent className="p-0 h-full">
                <Skeleton className="w-full h-full rounded-lg" />
              </CardContent>
            </Card>
          </div>

          {/* Station List Sidebar Skeleton */}
          <div className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-24" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-white/50">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="w-4 h-4 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-16 mb-2" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Selected Station Details Skeleton */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Skeleton className="h-5 w-40 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-36" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <div className="pt-2 space-y-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
