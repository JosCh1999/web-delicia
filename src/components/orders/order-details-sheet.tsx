import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
  } from "@/components/ui/sheet"
import { Order } from "@/lib/definitions"
import { Separator } from "../ui/separator";
  
interface OrderDetailsSheetProps {
    order: (Order & { id?: string }) | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function OrderDetailsSheet({ order, isOpen, onOpenChange }: OrderDetailsSheetProps) {
    if (!order) return null;

    const getFormattedDate = () => {
        try {
            let date: Date;
            if (typeof order.createdAt === 'string') {
                date = new Date(order.createdAt);
            } else if (order.createdAt?.toDate) {
                date = order.createdAt.toDate();
            } else if (order.createdAt instanceof Date) {
                date = order.createdAt;
            } else {
                return "Fecha no disponible";
            }
            return date.toLocaleDateString("es-ES", {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch {
            return "Fecha no disponible";
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                <SheetTitle>Detalle del Pedido #{(order.id || "").slice(0, 7)}</SheetTitle>
                <SheetDescription>
                    Realizado por {order.shippingAddress?.name || "Usuario"} el {getFormattedDate()}.
                </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <h4 className="font-semibold">Productos</h4>
                        <Separator />
                        <ul className="grid gap-3">
                            {order.items?.map((item, index) => (
                                <li key={index} className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        {item.productName} x <span>{item.quantity}</span>
                                    </span>
                                    <span>${(item.productPrice * item.quantity).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${(order.totalAmount || 0).toFixed(2)}</span>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
