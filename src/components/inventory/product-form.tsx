"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product, ProductSchema } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addProduct, updateProduct } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [previewImage, setPreviewImage] = useState<string | null>(
    (product?.imagen_url as string) || (product?.imageUrl as string) || null
  );
  
  // Map Firestore fields to form fields
  const defaultProduct = product ? {
    id: product.id || "",
    nombre: (product.nombre || product.name || "") as string,
    descripcion: (product.descripcion || product.description || "") as string,
    precio: product.precio || product.price || 0,
    stock: product.stock || 0,
    categoria: product.categoria || "General",
    imagen_url: (product.imagen_url || product.imageUrl || "") as string,
  } : {
    nombre: "",
    descripcion: "",
    precio: 0,
    stock: 0,
    categoria: "",
    imagen_url: "",
  };
  
  const form = useForm<Product>({
    resolver: zodResolver(ProductSchema),
    defaultValues: defaultProduct,
    mode: "onChange", // Validate on change to prevent uncontrolled input warning
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const onSubmit = (data: Product) => {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      const imageFile = (form.control as any)._fields.imagen_url?._f.ref?.files?.[0];
      if (imageFile) {
        formData.append('imagen_file', imageFile);
      }

      const action = product?.id ? updateProduct(product.id, formData) : addProduct(formData);
      const result = await action;

      if (result.success) {
        toast({
          title: `Producto ${product ? "actualizado" : "creado"}`,
          description: `El producto se ha ${product ? "actualizado" : "creado"} correctamente.`,
        });
        onSuccess();
      } else {
        // Handle server-side errors
        if (result.errors && typeof result.errors === 'object' && '_server' in result.errors) {
          const serverErrors = (result.errors as any)._server;
          if (Array.isArray(serverErrors) && serverErrors.length > 0) {
            toast({
              variant: "destructive",
              title: "Error",
              description: serverErrors[0],
            });
          }
        }
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del producto</FormLabel>
              <FormControl>
                <Input placeholder="Pastel de Chocolate" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Delicioso pastel cubierto de chocolate..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="precio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="15.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="categoria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <FormControl>
                <Input placeholder="Pasteles" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imagen_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de la imagen</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
               <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>O subir una imagen</FormLabel>
          <FormControl>
            <Input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="mt-2"
            />
          </FormControl>
        </div>

        {previewImage && (
          <div className="w-full">
            <FormLabel>Previsualización</FormLabel>
            <div className="mt-2 relative aspect-video w-full max-w-sm mx-auto overflow-hidden rounded-md border">
              <Image src={previewImage} alt="Previsualización" layout="fill" objectFit="cover" />
            </div>
          </div>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
           {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? 'Actualizar Producto' : 'Crear Producto'}
        </Button>
      </form>
    </Form>
  );
}
