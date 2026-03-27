import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  const cardStyle = {
    background: 'rgba(139, 43, 226, 0.03)',
    border: '1px solid rgba(139, 43, 226, 0.1)',
  }

  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <Skeleton className="h-9 w-48 mb-2 bg-white/5" />
        <Skeleton className="h-5 w-64 bg-white/5" />
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} style={cardStyle} className="h-full rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24 bg-white/10" />
              <div className="h-8 w-8 rounded-lg bg-white/5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2 bg-white/10" />
              <Skeleton className="h-3 w-20 bg-white/5" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Gráfico Diário */}
        <Card style={cardStyle} className="col-span-1 lg:col-span-2 rounded-2xl hidden md:block">
          <CardHeader>
            <Skeleton className="h-6 w-48 bg-white/5" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-xl bg-white/5" />
          </CardContent>
        </Card>
        
        {/* Gráfico de Categoria */}
        <Card style={cardStyle} className="col-span-1 rounded-2xl hidden md:block">
          <CardHeader>
            <Skeleton className="h-6 w-40 bg-white/5" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              <Skeleton className="h-[200px] w-[200px] rounded-full bg-white/5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Skeleton */}
      <Card style={cardStyle} className="rounded-2xl hidden md:block mt-4">
        <CardHeader>
          <Skeleton className="h-6 w-32 bg-white/5" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full bg-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
