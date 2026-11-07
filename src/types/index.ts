export type ProductCategory =
  | 'processors'
  | 'graphics-cards'
  | 'motherboards'
  | 'ram-memory'
  | 'storage-ssd'
  | 'gaming-pcs'
  | 'basic-pcs'
  | 'monitors'
  | 'cabinets'
  | 'power-cooling'
  | 'peripherals';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  categoryLabel: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  image: string;
  inStock: boolean;
  stockCount: number;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  isGamingPC?: boolean;
  specs: { [key: string]: string };
  description: string;
  warranty: string;
  modelNumber: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface GuestDeliveryDetails {
  fullName: string;
  phone: string;
  email: string;
  addressLine: string;
  city: string;
  state: string;
  pinCode: string;
  notes?: string;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'cod';
}

export interface GuestOrder {
  id: string;
  createdAt: string;
  customer: GuestDeliveryDetails;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  status: 'Confirmed' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered';
  trackingNumber: string;
  gstInvoiceNumber: string;
}

export type PCPartType = 'cpu' | 'motherboard' | 'gpu' | 'ram' | 'storage' | 'psu' | 'cabinet' | 'cooler';

export interface PCPart {
  id: string;
  type: PCPartType;
  typeLabel: string;
  name: string;
  brand: string;
  price: number;
  wattage: number;
  socket?: 'LGA1700' | 'AM5';
  ramType?: 'DDR5' | 'DDR4';
  formFactor?: 'ATX' | 'mATX';
  specs: string;
  image: string;
}

export interface ReviewItem {
  id: string;
  name: string;
  city: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  purchasedItem: string;
}
