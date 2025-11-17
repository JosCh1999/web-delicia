"use server";

import { revalidatePath } from "next/cache";
import { addDoc, collection, deleteDoc, doc, updateDoc, getDocs, query, orderBy, limit, Timestamp, getDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "./firebase";
import { ProductSchema } from "./definitions";
import { Order, Product } from "./definitions";

// Helper function for safe parsing
const parseProduct = (formData: FormData) => {
  const data = Object.fromEntries(formData.entries());
  return ProductSchema.safeParse(data);
};

export async function addProduct(formData: FormData) {
  const result = parseProduct(formData);

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const { imagen_url, ...productData } = result.data;
  const file = formData.get('imagen_file') as File;
  let imageUrl = imagen_url ?? '';

  try {
    if (file && file.size > 0) {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(storageRef);
    }

    await addDoc(collection(db, "products"), { ...productData, imagen_url: imageUrl });
    revalidatePath("/admin/inventario");
    return { success: true };
  } catch (error) {
    return { success: false, errors: { _server: ["No se pudo crear el producto."] } };
  }
}

export async function updateProduct(productId: string, formData: FormData) {
  if (!productId) {
    return { success: false, errors: { _server: ["ID de producto no válido."] } };
  }
  const result = parseProduct(formData);

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const { imagen_url, ...productData } = result.data;
  const file = formData.get('imagen_file') as File;
  let imageUrl = imagen_url ?? '';
  
  try {
     if (file && file.size > 0) {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(storageRef);
    }

    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, { ...productData, imagen_url: imageUrl });
    revalidatePath("/admin/inventario");
    return { success: true };
  } catch (error) {
    return { success: false, errors: { _server: ["No se pudo actualizar el producto."] } };
  }
}

export async function deleteProduct(productId: string) {
  if (!productId) {
    return { success: false, error: "ID de producto no válido." };
  }
  try {
    await deleteDoc(doc(db, "products", productId));
    revalidatePath("/admin/inventario");
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se pudo eliminar el producto." };
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  if (!orderId) {
    return { success: false, error: "ID de pedido no válido." };
  }
  try {
    // Normalize status to lowercase for Firestore compatibility
    const normalizedStatus = status.toLowerCase();
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { status });
    revalidatePath("/admin/pedidos");
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se pudo actualizar el estado del pedido." };
  }
}

// Dashboard functions
export async function getOrders(limitCount: number = 10) {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    
    const orders: (Order & { id: string; userEmail?: string })[] = [];
    
    for (const orderDoc of snapshot.docs) {
      const orderData = orderDoc.data();
      let userEmail = '';
      
      // Fetch user email from users collection
      try {
        const userDocRef = doc(db, 'users', orderData.userId);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data() as any;
          userEmail = userData?.email || userData?.correo || '';
        }
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
      
      orders.push({
        id: orderDoc.id,
        ...orderData,
        userEmail,
      } as Order & { id: string; userEmail?: string });
    }
    
    return { success: true, data: orders };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { success: false, error: 'Failed to fetch orders' };
  }
}

export async function getProducts(limitCount: number = 100) {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, limit(limitCount));
    const snapshot = await getDocs(q);
    
    const products: (Product & { id: string })[] = [];
    snapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      } as Product & { id: string });
    });
    
    return { success: true, data: products };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, error: 'Failed to fetch products' };
  }
}

export async function getUsers(limitCount: number = 100) {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, limit(limitCount));
    const snapshot = await getDocs(q);
    
    const users: any[] = [];
    snapshot.forEach((doc) => {
      users.push({
        uid: doc.id,
        ...doc.data(),
      });
    });
    
    return { success: true, data: users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
}

export async function getDashboardStats() {
  try {
    const [ordersResult, productsResult, usersResult] = await Promise.all([
      getOrders(1000),
      getProducts(1000),
      getUsers(1000),
    ]);

    if (!ordersResult.success || !productsResult.success || !usersResult.success) {
      throw new Error('Failed to fetch data');
    }

    const orders = ordersResult.data || [];
    const products = productsResult.data || [];
    const users = usersResult.data || [];

    // Calculate stats
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'Pendiente').length;
    const totalProducts = products.length;
    const totalCustomers = users.filter((u) => u.role === 'cliente' || u.rol === 'cliente').length;

    return {
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        totalProducts,
        totalCustomers,
        recentOrders: orders.slice(0, 5),
      },
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { success: false, error: 'Failed to fetch dashboard stats' };
  }
}
