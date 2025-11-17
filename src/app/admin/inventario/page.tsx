"use client";

import { useEffect, useState, useTransition } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import Image from "next/image";
import { MoreHorizontal, PlusCircle, Loader2, PackageOpen } from "lucide-react";

import { db } from "@/lib/firebase";
import type { Product } from "@/lib/definitions";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/inventory/product-form";
import { deleteProduct } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

export default function InventarioPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "products"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData: Product[] = [];
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(productsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormOpen(true);
  };
  
  const handleAdd = () => {
    setSelectedProduct(null);
    setFormOpen(true);
  }

  const handleDelete = (productId: string) => {
    startDeleteTransition(async () => {
      const result = await deleteProduct(productId);
      if (result.success) {
        toast({ title: "Producto eliminado", description: "El producto se ha eliminado correctamente." });
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    });
  }

  return (
    <>
      <PageHeader
        title="Inventario"
        description="Gestiona los productos de tu pastelería."
        action={
          <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1" onClick={handleAdd}>
                <PlusCircle className="h-4 w-4" />
                Añadir Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{selectedProduct ? "Editar" : "Añadir"} Producto</DialogTitle>
              </DialogHeader>
              <ProductForm product={selectedProduct} onSuccess={() => setFormOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
          <CardDescription>
            Una lista de todos los productos en tu inventario.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Imagen</span>
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="hidden md:table-cell">Precio</TableHead>
                <TableHead className="hidden md:table-cell">Stock</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  </TableCell>
                </TableRow>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt={product.nombre || product.name || "Producto"}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={product.imagen_url || product.imageUrl || "https://picsum.photos/seed/placeholder/64/64"}
                        width="64"
                        data-ai-hint="cake pastry"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.nombre || product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.categoria || "General"}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">${(product.precio || product.price || 0).toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell">{product.stock || 0}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => handleEdit(product)} className="cursor-pointer">Editar</DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer text-red-600 focus:text-red-600">Eliminar</DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Esto eliminará permanentemente el producto.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(product.id!)} disabled={isDeleting}>
                                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Eliminar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <PackageOpen className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No hay productos. Empieza añadiendo uno.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
