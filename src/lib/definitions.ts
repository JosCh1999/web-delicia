import { z } from 'zod';

export const UserSchema = z.object({
  uid: z.string(),
  nombre: z.string().optional(),
  name: z.string().optional(),
  correo: z.string().email().optional(),
  email: z.string().email().optional(),
  rol: z.enum(['admin', 'cliente']).optional(),
  role: z.string().optional(),
  imagen_perfil: z.string().url().optional(),
  profileImageUrl: z.string().url().optional(),
  phoneNumber: z.string().optional(),
  shippingAddress: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
});

export type UserProfile = z.infer<typeof UserSchema>;

export const ProductSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }).optional(),
  name: z.string().optional(),
  descripcion: z.string().min(10, { message: 'La descripción debe tener al menos 10 caracteres.' }).optional(),
  description: z.string().optional(),
  precio: z.coerce.number().min(0, { message: 'El precio debe ser un número positivo.' }).optional(),
  price: z.coerce.number().optional(),
  stock: z.coerce.number().int({ message: 'El stock debe ser un número entero.' }).min(0, { message: 'El stock no puede ser negativo.' }).optional(),
  categoria: z.string().min(3, { message: 'La categoría es obligatoria.' }).optional(),
  imagen_url: z.string().url({ message: 'Por favor, introduce una URL de imagen válida.' }).optional().or(z.literal('')),
  imageUrl: z.string().url().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

export const OrderItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  productDescription: z.string().optional(),
  productPrice: z.number(),
  productImageUrl: z.string().optional(),
  quantity: z.number(),
});

export const OrderSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  createdAt: z.any(), // Firestore Timestamp
  items: z.array(OrderItemSchema),
  totalAmount: z.number(),
  status: z.enum(['Pendiente', 'En preparación', 'Entregado']).optional(),
  shippingAddress: z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
});

export type Order = z.infer<typeof OrderSchema>;
