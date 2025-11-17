import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Package, DollarSign, Activity, Users, AlertCircle } from "lucide-react";

interface StatsCardsProps {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalCustomers: number;
}

export function StatsCards({
  totalRevenue,
  totalOrders,
  pendingOrders,
  totalProducts,
  totalCustomers,
}: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Calculado de todos los pedidos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{totalOrders}</div>
          <p className="text-xs text-muted-foreground">Total de pedidos históricos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Productos en Inventario</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
          <p className="text-xs text-muted-foreground">Productos únicos disponibles</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{pendingOrders}</div>
          <p className="text-xs text-muted-foreground">Pedidos que requieren atención</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{totalCustomers}</div>
          <p className="text-xs text-muted-foreground">Clientes registrados</p>
        </CardContent>
      </Card>
    </div>
  );
}
