"use client";

import { useEffect, useState, useTransition } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { MoreHorizontal, Loader2, PackageOpen, Eye } from "lucide-react";

import { db } from "@/lib/firebase";
import type { Order } from "@/lib/definitions";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateOrderStatus } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { OrderDetailsSheet } from "@/components/orders/order-details-sheet";

type OrderStatus = 'Pendiente' | 'En preparación' | 'Entregado';

const statusColors: Record<OrderStatus, string> = {
  'Pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'En preparación': 'bg-blue-100 text-blue-800 border-blue-200',
  'Entregado': 'bg-green-100 text-green-800 border-green-200',
};

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'todos'>('todos');
  const [isUpdating, startUpdateTransition] = useTransition();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    let q;
    if (statusFilter === 'todos') {
      q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    } else {
      q = query(
        collection(db, "orders"), 
        where("status", "==", statusFilter), 
        orderBy("createdAt", "desc")
      );
    }
    
    setLoading(true);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData: Order[] = [];
      querySnapshot.forEach((doc) => {
        ordersData.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [statusFilter]);
  
  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    startUpdateTransition(async () => {
      const result = await updateOrderStatus(orderId, status);
      if(result.success) {
        toast({ title: "Estado actualizado", description: "El estado del pedido ha sido actualizado." });
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    });
  }

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setSheetOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Pedidos"
        description="Revisa y gestiona los pedidos de tus clientes."
      />
      <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
        <div className="flex items-center">
            <TabsList>
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="pendiente">Pendientes</TabsTrigger>
                <TabsTrigger value="en preparación">En Preparación</TabsTrigger>
                <TabsTrigger value="entregado">Entregados</TabsTrigger>
            </TabsList>
        </div>
        <Card className="mt-4">
            <CardContent className="pt-6">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="hidden sm:table-cell">Estado</TableHead>
                        <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[80px]">Acciones</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">
                                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                            </TableCell>
                        </TableRow>
                    ) : orders.length > 0 ? (
                        orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>
                            <div className="font-medium">{order.shippingAddress?.name || "Usuario"}</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                                {order.userId?.slice(0, 10)}...
                            </div>
                            </TableCell>
                             <TableCell className="hidden sm:table-cell">
                              <Badge className={statusColors[order.status || "Pendiente"]}>{order.status || "Pendiente"}</Badge>
                            </TableCell>
                             <TableCell className="hidden sm:table-cell">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                            </TableCell>
                            <TableCell className="text-right">${(order.totalAmount || 0).toFixed(2)}</TableCell>
                            <TableCell>
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => viewOrderDetails(order)}>
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">Ver detalles</span>
                                </Button>
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Cambiar Estado</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuRadioGroup value={order.status || "Pendiente"} onValueChange={(newStatus) => handleStatusChange(order.id || "", newStatus as OrderStatus)}>
                                    <DropdownMenuRadioItem value="Pendiente" disabled={isUpdating}>Pendiente</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="En preparación" disabled={isUpdating}>En Preparación</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Entregado" disabled={isUpdating}>Entregado</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            <div className="flex flex-col items-center gap-2">
                                <PackageOpen className="h-8 w-8 text-muted-foreground" />
                                <p className="text-muted-foreground">No se encontraron pedidos con este estado.</p>
                            </div>
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </Tabs>
      <OrderDetailsSheet order={selectedOrder} isOpen={isSheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
