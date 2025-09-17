import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";

export default function Customers() {
  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
  });

  // Get unique customers from orders
  const customers = orders ? [...new Map(orders.map(order => [
    order.customerEmail,
    {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      orders: orders.filter(o => o.customerEmail === order.customerEmail).length,
      totalSpent: orders
        .filter(o => o.customerEmail === order.customerEmail)
        .reduce((sum, o) => sum + o.totalAmount, 0)
    }
  ])).values()] : [];

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "orders", header: "Total Orders" },
    { 
      accessorKey: "totalSpent", 
      header: "Total Spent",
      cell: ({ row }) => `$${row.getValue("totalSpent").toFixed(2)}`
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Customers</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage your customer base</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={customers} />
        </CardContent>
      </Card>
    </div>
  );
}
