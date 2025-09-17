import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Order, StoreStats } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StatCard } from "@/components/dashboard/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Eye, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch orders
  const { data: orders, isLoading: isLoadingOrders, isError: isOrdersError } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    queryFn: () => apiRequest("GET", "/api/orders"),
  });

  // Fetch stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<StoreStats>({
    queryKey: ["/api/stats"],
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PUT", `/api/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Order updated",
        description: "The order status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update order status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Format date
  const formatDate = (dateString: Date | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400";
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400";
      case "pending":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-400";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  // Format status
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Table columns
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order ID",
      cell: ({ row }) => (
        <div className="font-medium">#{row.getValue("orderNumber")}</div>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <div className="dark:text-white">{row.getValue("customerName")}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{row.original.customerEmail || "No email"}</div>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="font-medium">₹{(row.getValue("totalAmount") as number).toLocaleString()}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge className={getStatusBadgeClass(status)}>
            {formatStatus(status)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original;
        
        return (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setSelectedOrder(order);
                setIsDetailsOpen(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate({ id: order.id, status: "pending" })}
                  disabled={order.status === "pending"}
                >
                  Mark as Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate({ id: order.id, status: "processing" })}
                  disabled={order.status === "processing"}
                >
                  Mark as Processing
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate({ id: order.id, status: "shipped" })}
                  disabled={order.status === "shipped"}
                >
                  Mark as Shipped
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate({ id: order.id, status: "delivered" })}
                  disabled={order.status === "delivered"}
                >
                  Mark as Delivered
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate({ id: order.id, status: "cancelled" })}
                  disabled={order.status === "cancelled"}
                  className="text-red-600"
                >
                  Cancel Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Orders</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage customer orders and track revenue</p>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {isLoadingStats ? (
          // Skeleton loaders for stats
          Array(4).fill(null).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-32 dark:bg-gray-700" />
                <Skeleton className="h-10 w-10 rounded-full dark:bg-gray-700" />
              </div>
              <Skeleton className="h-7 w-16 mb-2 dark:bg-gray-700" />
              <Skeleton className="h-4 w-24 dark:bg-gray-700" />
            </div>
          ))
        ) : (
          // Actual stats cards
          <>
            <StatCard
              title="Pending Orders"
              value={stats?.pendingOrders || 0}
              icon="ri-time-line"
              iconBgColor="bg-yellow-100 dark:bg-yellow-900"
              iconColor="text-yellow-600 dark:text-yellow-400"
              changeSuffix="Need attention"
            />
            <StatCard
              title="Processing Orders"
              value={stats?.processingOrders || 0}
              icon="ri-loader-4-line"
              iconBgColor="bg-blue-100 dark:bg-blue-900"
              iconColor="text-blue-600 dark:text-blue-400"
              changeSuffix="Being prepared"
            />
            <StatCard
              title="Completed Orders"
              value={stats?.completedOrders || 0}
              icon="ri-check-double-line"
              iconBgColor="bg-green-100 dark:bg-green-900"
              iconColor="text-green-600 dark:text-green-400"
              changeSuffix="This month"
            />
            <StatCard
              title="Cancelled Orders"
              value={stats?.cancelledOrders || 0}
              icon="ri-close-circle-line"
              iconBgColor="bg-red-100 dark:bg-red-900"
              iconColor="text-red-600 dark:text-red-400"
              changeSuffix="This month"
            />
          </>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
        {isOrdersError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load orders. Please try again later.
            </AlertDescription>
          </Alert>
        ) : (
          <DataTable
            columns={columns}
            data={isLoadingOrders ? [] : orders || []}
            searchColumn="orderNumber"
            searchPlaceholder="Search orders..."
            filterColumn={{
              name: "status",
              options: [
                { label: "All", value: "" },
                { label: "Pending", value: "pending" },
                { label: "Processing", value: "processing" },
                { label: "Shipped", value: "shipped" },
                { label: "Delivered", value: "delivered" },
                { label: "Cancelled", value: "cancelled" },
              ],
            }}
          />
        )}
      </div>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[600px] dark:bg-gray-800 dark:border-gray-700">
            <div className="grid gap-4">
              <div>
                <h2 className="text-xl font-semibold dark:text-white">Order #{selectedOrder.orderNumber}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer Information</h3>
                  <p className="mt-1 font-medium dark:text-white">{selectedOrder.customerName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedOrder.customerEmail || "No email provided"}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedOrder.customerPhone || "No phone provided"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Order Status</h3>
                  <div className="mt-1">
                    <Badge className={getStatusBadgeClass(selectedOrder.status)}>
                      {formatStatus(selectedOrder.status)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm font-medium dark:text-white">Total Amount: ₹{selectedOrder.totalAmount.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Update Status</h3>
                <Select 
                  value={selectedOrder.status || "pending"} 
                  onValueChange={(value) => {
                    updateStatusMutation.mutate({ 
                      id: selectedOrder.id, 
                      status: value 
                    });
                    setSelectedOrder({
                      ...selectedOrder,
                      status: value as any
                    });
                  }}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-right mt-2">
                <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
