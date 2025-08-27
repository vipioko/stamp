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