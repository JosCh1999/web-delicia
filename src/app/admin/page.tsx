import { Suspense } from "react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardStats } from "@/lib/actions";

async function DashboardContent() {
  const result = await getDashboardStats();
  
  if (!result.success || !result.data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No se pudieron cargar los datos del dashboard</p>
      </div>
    );
  }

  const { totalRevenue, totalOrders, pendingOrders, totalProducts, totalCustomers, recentOrders } = result.data;

  // Convert Firestore timestamps to ISO strings for client components
  const convertedOrders = recentOrders.map((order) => ({
    ...order,
    createdAt: order.createdAt?.toDate ? order.createdAt.toDate().toISOString() : new Date().toISOString(),
  }));

  return (
    <>
      <StatsCards
        totalRevenue={totalRevenue || 0}
        totalOrders={totalOrders || 0}
        pendingOrders={pendingOrders || 0}
        totalProducts={totalProducts || 0}
        totalCustomers={totalCustomers || 0}
      />
      <div className="grid gap-4 md:gap-8 grid-cols-1 lg:grid-cols-4">
        <RecentOrders orders={convertedOrders} />
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader 
        title="Dashboard"
        description="Un resumen de la actividad de tu pastelería."
      />
      <div className="grid gap-4 md:gap-8">
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardContent />
        </Suspense>
      </div>
    </>
  );
}

function StatsSkeleton() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-5">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <div className="grid gap-4 md:gap-8 grid-cols-1 lg:grid-cols-4">
        <Skeleton className="h-64 col-span-3" />
      </div>
    </>
  );
}
