"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/lib/definitions";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface RecentOrdersProps {
  orders: (Order & { id: string; userEmail?: string })[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "En preparación":
        return "bg-blue-100 text-blue-800";
      case "Entregado":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (timestamp: any) => {
    try {
      let date: Date;
      
      if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else if (timestamp?.toDate) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        return "Fecha no disponible";
      }
      
      return format(date, "dd MMM yyyy, HH:mm", { locale: es });
    } catch (error) {
      return "Fecha no disponible";
    }
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Órdenes Recientes</CardTitle>
        <CardDescription>Tus últimas órdenes del sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No hay órdenes disponibles
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.shippingAddress?.name || "Usuario"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {order.userEmail || order.userId}
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${order.totalAmount?.toFixed(2) || "0.00"}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status || "Pendiente")}>
                      {order.status || "Pendiente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
