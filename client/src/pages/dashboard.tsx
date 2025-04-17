import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { PopularCatalogues } from "@/components/dashboard/popular-catalogues";
import { Skeleton } from "@/components/ui/skeleton";
import { StoreStats } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<StoreStats>({
    queryKey: ['/api/stats'],
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your store performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          // Skeleton loaders for stats
          Array(4).fill(null).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
              <Skeleton className="h-7 w-24 mb-2" />
              <Skeleton className="h-4 w-36" />
            </div>
          ))
        ) : (
          // Actual stats cards
          <>
            <StatCard
              title="Total Revenue"
              value={`₹${stats?.totalRevenue?.toLocaleString() || '0'}`}
              icon="ri-money-dollar-circle-line"
              iconBgColor="bg-primary-100"
              iconColor="text-primary-700"
              change={stats?.revenueChange || 0}
              changeType="increase"
            />
            <StatCard
              title="Total Orders"
              value={stats?.totalOrders || 0}
              icon="ri-shopping-cart-2-line"
              iconBgColor="bg-accent-100"
              iconColor="text-accent-500"
              change={stats?.ordersChange || 0}
              changeType="increase"
            />
            <StatCard
              title="Catalogues Shared"
              value={stats?.cataloguesShared || 0}
              icon="ri-share-forward-line"
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
              change={stats?.sharesChange || 0}
              changeType="increase"
            />
            <StatCard
              title="Total Products"
              value={stats?.totalProducts || 0}
              icon="ri-stack-line"
              iconBgColor="bg-purple-100"
              iconColor="text-purple-600"
              change={stats?.productsChange || 0}
              changeType="increase"
              changeSuffix="new this month"
            />
          </>
        )}
      </div>

      {/* Recent Orders */}
      <div className="mb-8">
        <RecentOrders />
      </div>

      {/* Popular Catalogues */}
      <div>
        <PopularCatalogues />
      </div>
    </div>
  );
}
