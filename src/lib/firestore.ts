// Firestore database service
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";

// Types for database collections
export interface State {
  id: string;
  name: string;
  code: string;
}

export interface District {
  id: string;
  stateId: string;
  name: string;
}

export interface Tehsil {
  id: string;
  districtId: string;
  name: string;
}

export interface StampCategory {
  id: string;
  name: string;
  description: string;
}

export interface StampProduct {
  id: string;
  categoryId: string;
  stateId: string;
  name: string;
  amount: number;
  platformFee: number;
  expressFee: number;
  deliveryFee: number;
  deliveryTime: string;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  stateId: string;
  districtId: string;
  tehsilId: string;
  party1Name: string;
  party2Name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  deliveryType: 'digital' | 'door';
  address?: string;
  pincode?: string;
  landmark?: string;
  stampAmount: number;
  platformFee: number;
  expressFee?: number;
  deliveryFee?: number;
  totalPaid: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  pdfUrl?: string;
  courierTrackingId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// States
export const createState = async (stateData: Omit<State, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'states'), stateData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating state:', error);
    throw error;
  }
};

export const updateState = async (stateId: string, updates: Partial<State>): Promise<void> => {
  try {
    const stateRef = doc(db, 'states', stateId);
    await updateDoc(stateRef, updates);
  } catch (error) {
    console.error('Error updating state:', error);
    throw error;
  }
};

export const deleteState = async (stateId: string): Promise<void> => {
  try {
    const stateRef = doc(db, 'states', stateId);
    await deleteDoc(stateRef);
  } catch (error) {
    console.error('Error deleting state:', error);
    throw error;
  }
};

export const getStates = async (): Promise<State[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'states'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as State));
  } catch (error) {
    console.error('Error fetching states:', error);
    throw error;
  }
};

// Districts
export const createDistrict = async (districtData: Omit<District, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'districts'), districtData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating district:', error);
    throw error;
  }
};

export const updateDistrict = async (districtId: string, updates: Partial<District>): Promise<void> => {
  try {
    const districtRef = doc(db, 'districts', districtId);
    await updateDoc(districtRef, updates);
  } catch (error) {
    console.error('Error updating district:', error);
    throw error;
  }
};

export const deleteDistrict = async (districtId: string): Promise<void> => {
  try {
    const districtRef = doc(db, 'districts', districtId);
    await deleteDoc(districtRef);
  } catch (error) {
    console.error('Error deleting district:', error);
    throw error;
  }
};

export const getAllDistricts = async (): Promise<District[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'districts'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as District));
  } catch (error) {
    console.error('Error fetching all districts:', error);
    throw error;
  }
};

export const getDistricts = async (stateId: string): Promise<District[]> => {
  try {
    const q = query(collection(db, 'districts'), where('stateId', '==', stateId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as District));
  } catch (error) {
    console.error('Error fetching districts:', error);
    throw error;
  }
};

// Tehsils
export const createTehsil = async (tehsilData: Omit<Tehsil, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'tehsils'), tehsilData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating tehsil:', error);
    throw error;
  }
};

export const updateTehsil = async (tehsilId: string, updates: Partial<Tehsil>): Promise<void> => {
  try {
    const tehsilRef = doc(db, 'tehsils', tehsilId);
    await updateDoc(tehsilRef, updates);
  } catch (error) {
    console.error('Error updating tehsil:', error);
    throw error;
  }
};

export const deleteTehsil = async (tehsilId: string): Promise<void> => {
  try {
    const tehsilRef = doc(db, 'tehsils', tehsilId);
    await deleteDoc(tehsilRef);
  } catch (error) {
    console.error('Error deleting tehsil:', error);
    throw error;
  }
};

export const getAllTehsils = async (): Promise<Tehsil[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'tehsils'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tehsil));
  } catch (error) {
    console.error('Error fetching all tehsils:', error);
    throw error;
  }
};

export const getTehsils = async (districtId: string): Promise<Tehsil[]> => {
  try {
    const q = query(collection(db, 'tehsils'), where('districtId', '==', districtId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tehsil));
  } catch (error) {
    console.error('Error fetching tehsils:', error);
    throw error;
  }
};

// Stamp Categories
export const createStampCategory = async (categoryData: Omit<StampCategory, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'stampCategories'), categoryData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating stamp category:', error);
    throw error;
  }
};

export const updateStampCategory = async (categoryId: string, updates: Partial<StampCategory>): Promise<void> => {
  try {
    const categoryRef = doc(db, 'stampCategories', categoryId);
    await updateDoc(categoryRef, updates);
  } catch (error) {
    console.error('Error updating stamp category:', error);
    throw error;
  }
};

export const deleteStampCategory = async (categoryId: string): Promise<void> => {
  try {
    const categoryRef = doc(db, 'stampCategories', categoryId);
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error('Error deleting stamp category:', error);
    throw error;
  }
};

export const getStampCategories = async (): Promise<StampCategory[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'stampCategories'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StampCategory));
  } catch (error) {
    console.error('Error fetching stamp categories:', error);
    throw error;
  }
};

// Stamp Products
export const getStampProducts = async (stateId: string): Promise<StampProduct[]> => {
  try {
    const q = query(collection(db, 'stampProducts'), where('stateId', '==', stateId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StampProduct));
  } catch (error) {
    console.error('Error fetching stamp products:', error);
    throw error;
  }
};

// Orders
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrder = async (orderId: string, updates: Partial<Order>) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, 'orders'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

// Admin-specific functions
export const getAllOrders = async (filters?: any): Promise<Order[]> => {
  try {
    let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Order;
    }
    return null;
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    throw error;
  }
};

export const updateOrderAdmin = async (orderId: string, updates: Partial<Order>) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating order (admin):', error);
    throw error;
  }
};

export const getOrdersCountByStatus = async (): Promise<{
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}> => {
  try {
    const ordersRef = collection(db, 'orders');
    const snapshot = await getDocs(ordersRef);
    
    const counts = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    };
    
    snapshot.docs.forEach(doc => {
      const order = doc.data() as Order;
      if (counts.hasOwnProperty(order.status)) {
        counts[order.status as keyof typeof counts]++;
      }
    });
    
    return counts;
  } catch (error) {
    console.error('Error getting orders count by status:', error);
    throw error;
  }
};

export const getTotalRevenue = async (): Promise<number> => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('status', '==', 'completed'));
    const snapshot = await getDocs(q);
    
    let totalRevenue = 0;
    snapshot.docs.forEach(doc => {
      const order = doc.data() as Order;
      totalRevenue += order.totalPaid;
    });
    
    return totalRevenue;
  } catch (error) {
    console.error('Error calculating total revenue:', error);
    throw error;
  }
};

export const getRecentOrders = async (limit: number = 10): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      // Note: Firestore limit function would be imported if available
    );
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    return orders.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
};

// Stamp Products Admin Functions
export const getAllStampProducts = async (): Promise<StampProduct[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'stampProducts'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StampProduct));
  } catch (error) {
    console.error('Error fetching all stamp products:', error);
    throw error;
  }
};

export const getStampProductById = async (productId: string): Promise<StampProduct | null> => {
  try {
    const docRef = doc(db, 'stampProducts', productId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as StampProduct;
    }
    return null;
  } catch (error) {
    console.error('Error fetching stamp product by ID:', error);
    throw error;
  }
};

export const createStampProduct = async (productData: Omit<StampProduct, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'stampProducts'), productData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating stamp product:', error);
    throw error;
  }
};

export const updateStampProduct = async (productId: string, updates: Partial<StampProduct>): Promise<void> => {
  try {
    const productRef = doc(db, 'stampProducts', productId);
    await updateDoc(productRef, updates);
  } catch (error) {
    console.error('Error updating stamp product:', error);
    throw error;
  }
};

export const deleteStampProduct = async (productId: string): Promise<void> => {
  try {
    const productRef = doc(db, 'stampProducts', productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting stamp product:', error);
    throw error;
  }
};