import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { products as staticProducts, categories as staticCategories } from "@/config/products";
import { business } from "@/config/business";

// ================= TYPES =================

export type OrderStatus =
  | "new"
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out-for-delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

export interface Category {
  id: string;
  name: string;
  blurb?: string | undefined;
  image: string;
}

export interface StoreProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  weight: string;
  price: number;
  discountPrice?: number | undefined;
  image: string;
  tag?: string | undefined;
  availableSizes?: string[] | undefined;
  flavours?: string[] | undefined;
  isEggless?: boolean | undefined;
  isFeatured?: boolean | undefined;
  isAvailable: boolean;
  stock: number;
}

export interface OrderItem {
  id: string;
  productId?: string | undefined;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail?: string | undefined;
  customerPhone: string;
  deliveryAddress?: string | undefined;
  deliveryDate?: string | undefined;
  cakeMessage?: string | undefined;
  notes?: string | undefined;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string | undefined;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string | undefined;
  phone: string;
  address?: string | undefined;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string;
  notes?: string | undefined;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  costPerUnit: number;
  lastRestocked: string;
  supplier?: string | undefined;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  status: PaymentStatus;
  method: string;
  transactionRef?: string | undefined;
  date: string;
}

export interface Offer {
  id: string;
  title: string;
  code?: string | undefined;
  discountType: "percentage" | "fixed";
  discountPercentage: number;
  discountAmount?: number | undefined;
  bannerText: string;
  startDate?: string | undefined;
  endDate?: string | undefined;
  isActive: boolean;
}

export interface CustomerReview {
  id: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  cakeName: string;
  date: string;
  status: "approved" | "pending" | "hidden";
  reply?: string | undefined;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: "order" | "inventory" | "review" | "system";
  timestamp: string;
  read: boolean;
  link?: string | undefined;
}

export interface ShopSettings {
  shopName: string;
  logoUrl: string;
  phone: string;
  email: string;
  address: string;
  openingHours: string;
  deliveryInfo: string;
  instagram: string;
  facebook: string;
  youtube: string;
}

// ================= CONTEXT INTERFACE =================

interface BakeryStoreContextType {
  products: StoreProduct[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
  inventory: InventoryItem[];
  payments: PaymentRecord[];
  offers: Offer[];
  reviews: CustomerReview[];
  notifications: DashboardNotification[];
  settings: ShopSettings;
  loading: boolean;
  syncingFirestore: boolean;

  // Product Actions
  addProduct: (product: Omit<StoreProduct, "id">) => Promise<StoreProduct>;
  updateProduct: (id: string, updates: Partial<StoreProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductAvailability: (id: string) => Promise<void>;
  uploadProductImage: (file: File) => Promise<string>;

  // Category Actions
  addCategory: (category: Category) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Order Actions
  createOrder: (orderData: {
    customerName: string;
    customerEmail?: string | undefined;
    customerPhone: string;
    deliveryAddress?: string | undefined;
    deliveryDate?: string | undefined;
    cakeMessage?: string | undefined;
    notes?: string | undefined;
    items: OrderItem[];
    totalAmount: number;
    paymentMethod?: string | undefined;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateOrderPaymentStatus: (orderId: string, paymentStatus: PaymentStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;

  // Inventory Actions
  addInventoryItem: (item: Omit<InventoryItem, "id">) => Promise<InventoryItem>;
  updateInventoryStock: (id: string, newQuantity: number) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;

  // Payment Actions
  recordPayment: (payment: Omit<PaymentRecord, "id">) => Promise<PaymentRecord>;
  updatePaymentStatus: (id: string, status: PaymentStatus) => Promise<void>;

  // Offer Actions
  addOffer: (offer: Omit<Offer, "id">) => Promise<Offer>;
  updateOffer: (id: string, updates: Partial<Offer>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  toggleOfferActive: (id: string) => Promise<void>;

  // Review Actions
  updateReviewStatus: (id: string, status: "approved" | "pending" | "hidden") => Promise<void>;
  replyToReview: (id: string, reply: string) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;

  // Notification Actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  // Settings Actions
  updateSettings: (updates: Partial<ShopSettings>) => Promise<void>;
}

const BakeryStoreContext = createContext<BakeryStoreContextType | undefined>(undefined);

// ================= STORAGE KEYS =================
const STORAGE_PREFIX = "sweet_crumbs_fs_v3_";
const KEY_PRODUCTS = STORAGE_PREFIX + "products";
const KEY_CATEGORIES = STORAGE_PREFIX + "categories";
const KEY_ORDERS = STORAGE_PREFIX + "orders";
const KEY_CUSTOMERS = STORAGE_PREFIX + "customers";
const KEY_INVENTORY = STORAGE_PREFIX + "inventory";
const KEY_PAYMENTS = STORAGE_PREFIX + "payments";
const KEY_OFFERS = STORAGE_PREFIX + "offers";
const KEY_REVIEWS = STORAGE_PREFIX + "reviews";
const KEY_NOTIFICATIONS = STORAGE_PREFIX + "notifications";
const KEY_SETTINGS = STORAGE_PREFIX + "settings";

// ================= INITIAL DATA =================

const INITIAL_CATEGORIES: Category[] = [
  {
    id: "birthday",
    name: "Birthday Cakes",
    blurb: "Festive celebration cakes with handcrafted candles, macarons and sprinkles.",
    image: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "wedding",
    name: "Wedding Cakes",
    blurb: "Grand multi-tier masterpieces with delicate sugar florals.",
    image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "anniversary",
    name: "Anniversary Cakes",
    blurb: "Romantic heart shapes and vintage Lambeth piped designs.",
    image: "https://images.unsplash.com/photo-1518047601542-4505c4434222?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "chocolate",
    name: "Chocolate Cakes",
    blurb: "Decadent Belgian dark chocolate ganache, truffles and silky glaze.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "customised",
    name: "Custom Cakes",
    blurb: "Bespoke themed designs crafted to your dream celebration concept.",
    image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "cupcakes",
    name: "Cupcakes",
    blurb: "Assorted gourmet buttercream cupcakes in artisan gift boxes.",
    image: "https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "pastries",
    name: "Pastries & Slices",
    blurb: "Individual dessert pastries, tarts, eclairs and chocolate brownies.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "special-occasion",
    name: "Special Occasion Cakes",
    blurb: "Milestone events, baby showers, graduations and festive reunions.",
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80",
  },
];

const INITIAL_PRODUCTS: StoreProduct[] = staticProducts.map((p, idx) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  description: p.description,
  weight: p.weight,
  price: p.price,
  discountPrice: p.price > 900 ? Math.round(p.price * 0.9) : undefined,
  image: p.image,
  tag: p.tag,
  availableSizes: ["0.5 kg", "1 kg", "2 kg", "3 kg"],
  flavours: ["Belgian Chocolate", "Vanilla Bean", "Red Velvet", "Fresh Berry"],
  isEggless: idx % 2 === 0,
  isFeatured: idx < 4,
  isAvailable: true,
  stock: 8 + (idx % 12),
}));

const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-2045",
    customerName: "Kavitha Rajan",
    customerEmail: "kavitha.rajan@gmail.com",
    customerPhone: "9841234567",
    deliveryAddress: "42 Beach Road, Punnaikayal, Thoothukudi",
    deliveryDate: "2026-11-18",
    cakeMessage: "Happy 5th Birthday Aarav!",
    notes: "Eggless vanilla cake with extra strawberry topping and blue candles.",
    totalAmount: 1450,
    status: "new",
    paymentStatus: "paid",
    paymentMethod: "Google Pay",
    items: [
      {
        id: "item-1",
        productId: "confetti-birthday",
        productName: "Confetti Celebration Cake",
        price: 650,
        quantity: 1,
        total: 650,
      },
      {
        id: "item-2",
        productId: "berry-cupcake-box",
        productName: "Gourmet Cupcake Box (Pack of 6)",
        price: 800,
        quantity: 1,
        total: 800,
      },
    ],
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: "ORD-2044",
    customerName: "Michael Selvan",
    customerEmail: "michael.selvan@outlook.com",
    customerPhone: "9443219876",
    deliveryAddress: "12 Church Street, Punnaikayal, Thoothukudi",
    deliveryDate: "2026-11-17",
    cakeMessage: "Happy 25th Silver Jubilee Mom & Dad",
    notes: "Please write in elegant gold script.",
    totalAmount: 2200,
    status: "preparing",
    paymentStatus: "paid",
    paymentMethod: "UPI",
    items: [
      {
        id: "item-3",
        productId: "royal-pearl-wedding",
        productName: "Royal Pearl Tiered Cake (2 kg)",
        price: 2200,
        quantity: 1,
        total: 2200,
      },
    ],
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
  {
    id: "ORD-2043",
    customerName: "Deepa Natarajan",
    customerEmail: "deepa.n@gmail.com",
    customerPhone: "9789012345",
    deliveryAddress: "88 Harbor View Lane, Thoothukudi",
    deliveryDate: "2026-11-16",
    cakeMessage: "Best Wishes on Graduation!",
    notes: "Leave with security at main gate if unavailable.",
    totalAmount: 950,
    status: "out-for-delivery",
    paymentStatus: "paid",
    paymentMethod: "PhonePe",
    items: [
      {
        id: "item-4",
        productId: "dark-truffle-indulgence",
        productName: "Belgian Dark Truffle Indulgence",
        price: 950,
        quantity: 1,
        total: 950,
      },
    ],
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "ORD-2042",
    customerName: "Arun Kumar",
    customerEmail: "arun.k@yahoo.com",
    customerPhone: "9840192837",
    deliveryAddress: "Shop Pickup at Punnaikayal Bakery Counter",
    deliveryDate: "2026-11-15",
    cakeMessage: "Happy Birthday Tharun",
    notes: "Customer will collect in person at 6:00 PM.",
    totalAmount: 750,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Cash on Delivery",
    items: [
      {
        id: "item-5",
        productId: "golden-drip-birthday",
        productName: "Golden Macaron Birthday Cake",
        price: 750,
        quantity: 1,
        total: 750,
      },
    ],
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
  {
    id: "ORD-2041",
    customerName: "Priya Vasanth",
    customerEmail: "priya.vasanth@gmail.com",
    customerPhone: "9842109876",
    deliveryAddress: "1/589F Punnaikayal Main Road",
    deliveryDate: "2026-11-19",
    cakeMessage: "Welcome Home Sweetheart",
    notes: "Eggless red velvet with extra cream cheese swirl.",
    totalAmount: 1100,
    status: "confirmed",
    paymentStatus: "pending",
    paymentMethod: "Cash on Delivery",
    items: [
      {
        id: "item-6",
        productId: "velvet-romance",
        productName: "Crimson Red Velvet Cake",
        price: 1100,
        quantity: 1,
        total: 1100,
      },
    ],
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust-101",
    name: "Kavitha Rajan",
    email: "kavitha.rajan@gmail.com",
    phone: "9841234567",
    address: "42 Beach Road, Punnaikayal, Thoothukudi",
    totalOrders: 4,
    totalSpent: 4850,
    lastOrderAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    notes: "Prefers eggless cakes; regular customer for family celebrations.",
  },
  {
    id: "cust-102",
    name: "Michael Selvan",
    email: "michael.selvan@outlook.com",
    phone: "9443219876",
    address: "12 Church Street, Punnaikayal, Thoothukudi",
    totalOrders: 3,
    totalSpent: 5200,
    lastOrderAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    notes: "Orders tiered celebration cakes.",
  },
  {
    id: "cust-103",
    name: "Deepa Natarajan",
    email: "deepa.n@gmail.com",
    phone: "9789012345",
    address: "88 Harbor View Lane, Thoothukudi",
    totalOrders: 2,
    totalSpent: 1900,
    lastOrderAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
  },
  {
    id: "cust-104",
    name: "Arun Kumar",
    email: "arun.k@yahoo.com",
    phone: "9840192837",
    address: "Shop Pickup at Punnaikayal",
    totalOrders: 5,
    totalSpent: 4250,
    lastOrderAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: "inv-1",
    name: "Refined Wheat Flour (Maida)",
    category: "Baking Essentials",
    quantity: 45,
    unit: "kg",
    minThreshold: 15,
    costPerUnit: 48,
    lastRestocked: "2026-11-12",
    supplier: "Southern Mills Pvt Ltd",
  },
  {
    id: "inv-2",
    name: "Granulated White Sugar",
    category: "Baking Essentials",
    quantity: 35,
    unit: "kg",
    minThreshold: 12,
    costPerUnit: 44,
    lastRestocked: "2026-11-10",
    supplier: "Tamil Nadu Sugar Corp",
  },
  {
    id: "inv-3",
    name: "Amul Unsalted Butter",
    category: "Dairy",
    quantity: 18,
    unit: "kg",
    minThreshold: 8,
    costPerUnit: 480,
    lastRestocked: "2026-11-14",
    supplier: "Amul Dairy Distr. Thoothukudi",
  },
  {
    id: "inv-4",
    name: "Whipping Heavy Cream",
    category: "Dairy",
    quantity: 22,
    unit: "liters",
    minThreshold: 10,
    costPerUnit: 290,
    lastRestocked: "2026-11-14",
    supplier: "Rich's Whipped Toppings",
  },
  {
    id: "inv-5",
    name: "Belgian Dark Chocolate 54%",
    category: "Chocolates",
    quantity: 4.5, // Below threshold -> triggers low stock alert!
    unit: "kg",
    minThreshold: 6,
    costPerUnit: 850,
    lastRestocked: "2026-11-05",
    supplier: "Callebaut Importers",
  },
  {
    id: "inv-6",
    name: "Farm Fresh Eggs",
    category: "Dairy",
    quantity: 140,
    unit: "pieces",
    minThreshold: 50,
    costPerUnit: 6.5,
    lastRestocked: "2026-11-15",
    supplier: "Punnaikayal Organic Farm",
  },
  {
    id: "inv-7",
    name: "Madagascar Vanilla Extract",
    category: "Flavors & Additives",
    quantity: 3.5,
    unit: "liters",
    minThreshold: 1.5,
    costPerUnit: 1200,
    lastRestocked: "2026-11-08",
    supplier: "Bakers Gourmet Hub",
  },
  {
    id: "inv-8",
    name: "Sugar Pearls & Edible Sprinkles",
    category: "Decorations",
    quantity: 12,
    unit: "boxes",
    minThreshold: 4,
    costPerUnit: 180,
    lastRestocked: "2026-11-01",
    supplier: "Decor Bake Co.",
  },
];

const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: "pay-1",
    orderId: "ORD-2045",
    customerName: "Kavitha Rajan",
    customerPhone: "9841234567",
    amount: 1450,
    status: "paid",
    method: "Google Pay",
    transactionRef: "UPI-481920491823",
    date: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: "pay-2",
    orderId: "ORD-2044",
    customerName: "Michael Selvan",
    customerPhone: "9443219876",
    amount: 2200,
    status: "paid",
    method: "UPI",
    transactionRef: "UPI-481912984712",
    date: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: "pay-3",
    orderId: "ORD-2043",
    customerName: "Deepa Natarajan",
    customerPhone: "9789012345",
    amount: 950,
    status: "paid",
    method: "PhonePe",
    transactionRef: "UPI-481829301928",
    date: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
  },
  {
    id: "pay-4",
    orderId: "ORD-2042",
    customerName: "Arun Kumar",
    customerPhone: "9840192837",
    amount: 750,
    status: "paid",
    method: "Cash on Delivery",
    transactionRef: "COD-VERIFIED-COUNTER",
    date: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
  {
    id: "pay-5",
    orderId: "ORD-2041",
    customerName: "Priya Vasanth",
    customerPhone: "9842109876",
    amount: 1100,
    status: "pending",
    method: "Cash on Delivery",
    transactionRef: "PENDING-DELIVERY",
    date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_OFFERS: Offer[] = [
  {
    id: "off-1",
    title: "Weekend Celebration Special",
    code: "WEEKEND15",
    discountType: "percentage",
    discountPercentage: 15,
    bannerText: "Enjoy 15% OFF on all 2kg+ Birthday and Anniversary cakes this weekend! Use code WEEKEND15.",
    startDate: "2026-11-01",
    endDate: "2026-11-30",
    isActive: true,
  },
  {
    id: "off-2",
    title: "First Order Welcome Discount",
    code: "SWEETWELCOME10",
    discountType: "percentage",
    discountPercentage: 10,
    bannerText: "Welcome to Sweet Crumbs Bakery! Get 10% discount on your first online cake order.",
    startDate: "2026-11-01",
    endDate: "2026-12-31",
    isActive: true,
  },
  {
    id: "off-3",
    title: "Flat ₹200 Festive Celebration",
    code: "FESTIVE200",
    discountType: "fixed",
    discountPercentage: 0,
    discountAmount: 200,
    bannerText: "Flat ₹200 off on multi-tier wedding and custom designer cakes above ₹2000.",
    startDate: "2026-11-10",
    endDate: "2026-11-25",
    isActive: false,
  },
];

const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: "rev-1",
    customerName: "Anita Selvan",
    rating: 5,
    comment:
      "The Belgian chocolate cake we ordered for my husband's 30th birthday was absolutely heavenly! Super moist and the chocolate ganache tasted luxurious. Thank you Tharshini!",
    cakeName: "Belgian Dark Truffle Indulgence",
    date: "2026-11-14",
    status: "approved",
    reply: "Thank you so much Anita! We are delighted your family enjoyed the chocolate indulgence!",
  },
  {
    id: "rev-2",
    customerName: "Karthik Subramanian",
    rating: 5,
    comment:
      "Prompt delivery right on time in Punnaikayal. Fresh cream strawberry was light, sweet and not overwhelming. 10/10 bakery!",
    cakeName: "Fresh Garden Strawberry Bliss",
    date: "2026-11-12",
    status: "approved",
    reply: "So glad we could make the moment sweet Karthik! Warm regards from Sweet Crumbs.",
  },
  {
    id: "rev-3",
    customerName: "Meenakshi Sundaram",
    rating: 5,
    comment:
      "Ordered a 2-tier wedding cake. The delicate sugar flowers and rose piping were breathtaking. All our guests complimented the flavor.",
    cakeName: "Royal Pearl Tiered Cake",
    date: "2026-11-08",
    status: "approved",
    reply: "It was an absolute pleasure crafting your wedding centerpiece Meenakshi. Wishing you both a lifetime of happiness!",
  },
  {
    id: "rev-4",
    customerName: "Sanjay Kumar",
    rating: 4,
    comment: "The red velvet was delicious. A little extra frosting would be great, but overall high quality.",
    cakeName: "Crimson Red Velvet Cake",
    date: "2026-11-15",
    status: "pending",
  },
];

const INITIAL_NOTIFICATIONS: DashboardNotification[] = [
  {
    id: "notif-1",
    title: "New Customer Order",
    message: "Order #ORD-2045 placed by Kavitha Rajan (₹1,450).",
    type: "order",
    timestamp: "10 mins ago",
    read: false,
    link: "orders",
  },
  {
    id: "notif-2",
    title: "Low Inventory Alert",
    message: "Belgian Dark Chocolate 54% is at 4.5 kg (below minimum threshold of 6 kg).",
    type: "inventory",
    timestamp: "1 hour ago",
    read: false,
    link: "inventory",
  },
  {
    id: "notif-3",
    title: "New Customer Review",
    message: "Sanjay Kumar left a 4-star rating for Crimson Red Velvet Cake.",
    type: "review",
    timestamp: "3 hours ago",
    read: false,
    link: "reviews",
  },
  {
    id: "notif-4",
    title: "Order Dispatched",
    message: "Order #ORD-2043 is out for delivery to Harbor View Lane, Thoothukudi.",
    type: "order",
    timestamp: "5 hours ago",
    read: true,
    link: "orders",
  },
];

const INITIAL_SETTINGS: ShopSettings = {
  shopName: "Sweet Crumbs – Artisan Bakery",
  logoUrl: "/logo.svg",
  phone: "7550362608",
  email: "tharshini1773@gmail.com",
  address: "1/589F, 100 House, Punnaikayal, Thoothukudi, Tamil Nadu, India.",
  openingHours: "Monday – Sunday: 9:00 AM – 9:30 PM",
  deliveryInfo: "Fresh, refrigerated bakery delivery across Punnaikayal & Thoothukudi district.",
  instagram: "https://instagram.com/sweetcrumbsbakery",
  facebook: "https://facebook.com/sweetcrumbsbakery",
  youtube: "https://youtube.com/@sweetcrumbsbakery",
};

// ================= PROVIDER COMPONENT =================

export function BakeryStoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<StoreProduct[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS);
  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);
  const [notifications, setNotifications] = useState<DashboardNotification[]>(INITIAL_NOTIFICATIONS);
  const [settings, setSettings] = useState<ShopSettings>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [syncingFirestore, setSyncingFirestore] = useState(false);

  // Load cached data & sync with Cloud Firestore
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // 1. Instant load from localStorage cache
      try {
        const cProd = localStorage.getItem(KEY_PRODUCTS);
        if (cProd) setProducts(JSON.parse(cProd));

        const cCat = localStorage.getItem(KEY_CATEGORIES);
        if (cCat) setCategories(JSON.parse(cCat));

        const cOrd = localStorage.getItem(KEY_ORDERS);
        if (cOrd) setOrders(JSON.parse(cOrd));

        const cCust = localStorage.getItem(KEY_CUSTOMERS);
        if (cCust) setCustomers(JSON.parse(cCust));

        const cInv = localStorage.getItem(KEY_INVENTORY);
        if (cInv) setInventory(JSON.parse(cInv));

        const cPay = localStorage.getItem(KEY_PAYMENTS);
        if (cPay) setPayments(JSON.parse(cPay));

        const cOff = localStorage.getItem(KEY_OFFERS);
        if (cOff) setOffers(JSON.parse(cOff));

        const cRev = localStorage.getItem(KEY_REVIEWS);
        if (cRev) setReviews(JSON.parse(cRev));

        const cNotif = localStorage.getItem(KEY_NOTIFICATIONS);
        if (cNotif) setNotifications(JSON.parse(cNotif));

        const cSet = localStorage.getItem(KEY_SETTINGS);
        if (cSet) setSettings({ ...INITIAL_SETTINGS, ...JSON.parse(cSet) });
      } catch (err) {
        console.warn("Local cache read error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }

      // 2. Cloud Firestore Background Synchronization
      try {
        setSyncingFirestore(true);

        // Fetch products
        const prodSnap = await getDocs(collection(db, "products"));
        if (!prodSnap.empty) {
          const fsProducts = prodSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as StoreProduct[];
          if (isMounted && fsProducts.length > 0) {
            setProducts(fsProducts);
            localStorage.setItem(KEY_PRODUCTS, JSON.stringify(fsProducts));
          }
        }

        // Fetch orders
        const ordSnap = await getDocs(collection(db, "orders"));
        if (!ordSnap.empty) {
          const fsOrders = ordSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Order[];
          if (isMounted && fsOrders.length > 0) {
            setOrders(fsOrders);
            localStorage.setItem(KEY_ORDERS, JSON.stringify(fsOrders));
          }
        }

        // Fetch categories
        const catSnap = await getDocs(collection(db, "categories"));
        if (!catSnap.empty) {
          const fsCategories = catSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Category[];
          if (isMounted && fsCategories.length > 0) {
            setCategories(fsCategories);
            localStorage.setItem(KEY_CATEGORIES, JSON.stringify(fsCategories));
          }
        }

        // Fetch inventory
        const invSnap = await getDocs(collection(db, "inventory"));
        if (!invSnap.empty) {
          const fsInv = invSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as InventoryItem[];
          if (isMounted && fsInv.length > 0) {
            setInventory(fsInv);
            localStorage.setItem(KEY_INVENTORY, JSON.stringify(fsInv));
          }
        }

        // Fetch payments
        const paySnap = await getDocs(collection(db, "payments"));
        if (!paySnap.empty) {
          const fsPay = paySnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as PaymentRecord[];
          if (isMounted && fsPay.length > 0) {
            setPayments(fsPay);
            localStorage.setItem(KEY_PAYMENTS, JSON.stringify(fsPay));
          }
        }

        // Fetch offers
        const offSnap = await getDocs(collection(db, "offers"));
        if (!offSnap.empty) {
          const fsOffers = offSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Offer[];
          if (isMounted && fsOffers.length > 0) {
            setOffers(fsOffers);
            localStorage.setItem(KEY_OFFERS, JSON.stringify(fsOffers));
          }
        }

        // Fetch reviews
        const revSnap = await getDocs(collection(db, "reviews"));
        if (!revSnap.empty) {
          const fsReviews = revSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as CustomerReview[];
          if (isMounted && fsReviews.length > 0) {
            setReviews(fsReviews);
            localStorage.setItem(KEY_REVIEWS, JSON.stringify(fsReviews));
          }
        }
      } catch (err) {
        console.info("Firestore background sync:", err);
      } finally {
        if (isMounted) setSyncingFirestore(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // ================= CRUD: PRODUCTS =================

  const addProduct = async (productData: Omit<StoreProduct, "id">): Promise<StoreProduct> => {
    const id = `cake-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
    const newProduct: StoreProduct = { id, ...productData };

    const updated = [newProduct, ...products];
    setProducts(updated);
    localStorage.setItem(KEY_PRODUCTS, JSON.stringify(updated));

    // Async sync to Firestore
    try {
      await setDoc(doc(db, "products", id), newProduct);
    } catch (e) {
      console.warn("Firestore addProduct offline fallback:", e);
    }

    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<StoreProduct>): Promise<void> => {
    const updated = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setProducts(updated);
    localStorage.setItem(KEY_PRODUCTS, JSON.stringify(updated));

    try {
      await updateDoc(doc(db, "products", id), updates as any);
    } catch (e) {
      console.warn("Firestore updateProduct fallback:", e);
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    localStorage.setItem(KEY_PRODUCTS, JSON.stringify(updated));

    try {
      await deleteDoc(doc(db, "products", id));
    } catch (e) {
      console.warn("Firestore deleteProduct fallback:", e);
    }
  };

  const toggleProductAvailability = async (id: string): Promise<void> => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    await updateProduct(id, { isAvailable: !target.isAvailable });
  };

  const uploadProductImage = async (file: File): Promise<string> => {
    try {
      const storageRef = ref(storage, `cakes/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err) {
      console.warn("Firebase Storage upload failed, using Data URL fallback:", err);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || "");
        reader.readAsDataURL(file);
      });
    }
  };

  // ================= CRUD: CATEGORIES =================

  const addCategory = async (cat: Category): Promise<Category> => {
    const updated = [...categories, cat];
    setCategories(updated);
    localStorage.setItem(KEY_CATEGORIES, JSON.stringify(updated));

    try {
      await setDoc(doc(db, "categories", cat.id), cat);
    } catch (e) {
      console.warn("Firestore addCategory fallback:", e);
    }
    return cat;
  };

  const updateCategory = async (id: string, updates: Partial<Category>): Promise<void> => {
    const updated = categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setCategories(updated);
    localStorage.setItem(KEY_CATEGORIES, JSON.stringify(updated));

    try {
      await updateDoc(doc(db, "categories", id), updates as any);
    } catch (e) {
      console.warn("Firestore updateCategory fallback:", e);
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    localStorage.setItem(KEY_CATEGORIES, JSON.stringify(updated));

    try {
      await deleteDoc(doc(db, "categories", id));
    } catch (e) {
      console.warn("Firestore deleteCategory fallback:", e);
    }
  };

  // ================= CRUD: ORDERS =================

  const createOrder = async (orderData: {
    customerName: string;
    customerEmail?: string | undefined;
    customerPhone: string;
    deliveryAddress?: string | undefined;
    deliveryDate?: string | undefined;
    cakeMessage?: string | undefined;
    notes?: string | undefined;
    items: OrderItem[];
    totalAmount: number;
    paymentMethod?: string | undefined;
  }): Promise<Order> => {
    const id = `ORD-${Math.floor(2000 + Math.random() * 8000)}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      id,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      deliveryAddress: orderData.deliveryAddress || business.address,
      deliveryDate: orderData.deliveryDate || new Date(Date.now() + 24 * 3600 * 1000).toISOString().split("T")[0],
      cakeMessage: orderData.cakeMessage,
      notes: orderData.notes,
      totalAmount: orderData.totalAmount,
      status: "new",
      paymentStatus: "paid",
      paymentMethod: orderData.paymentMethod || "UPI / Online",
      items: orderData.items,
      createdAt: now,
      updatedAt: now,
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem(KEY_ORDERS, JSON.stringify(updatedOrders));

    // Update customer history
    const existingIndex = customers.findIndex((c) => c.phone === orderData.customerPhone);
    let updatedCust = [...customers];
    if (existingIndex >= 0) {
      const ex = updatedCust[existingIndex];
      if (ex) {
        updatedCust[existingIndex] = {
          ...ex,
          name: orderData.customerName || ex.name,
          email: orderData.customerEmail ?? ex.email,
          address: orderData.deliveryAddress || ex.address,
          totalOrders: ex.totalOrders + 1,
          totalSpent: ex.totalSpent + orderData.totalAmount,
          lastOrderAt: now,
        };
      }
    } else {
      updatedCust = [
        {
          id: `cust-${Date.now().toString().slice(-4)}`,
          name: orderData.customerName,
          email: orderData.customerEmail,
          phone: orderData.customerPhone,
          address: orderData.deliveryAddress || business.address,
          totalOrders: 1,
          totalSpent: orderData.totalAmount,
          lastOrderAt: now,
        },
        ...updatedCust,
      ];
    }
    setCustomers(updatedCust);
    localStorage.setItem(KEY_CUSTOMERS, JSON.stringify(updatedCust));

    // Record notification
    const newNotif: DashboardNotification = {
      id: `notif-${Date.now()}`,
      title: "New Cake Order",
      message: `Order #${id} received from ${orderData.customerName} (₹${orderData.totalAmount}).`,
      type: "order",
      timestamp: "Just now",
      read: false,
      link: "orders",
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem(KEY_NOTIFICATIONS, JSON.stringify(updatedNotifs));

    // Sync to Firestore
    try {
      await setDoc(doc(db, "orders", id), newOrder);
    } catch (e) {
      console.warn("Firestore createOrder fallback:", e);
    }

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o));
    setOrders(updated);
    localStorage.setItem(KEY_ORDERS, JSON.stringify(updated));

    try {
      await updateDoc(doc(db, "orders", orderId), { status, updatedAt: new Date().toISOString() });
    } catch (e) {
      console.warn("Firestore updateOrderStatus fallback:", e);
    }
  };

  const updateOrderPaymentStatus = async (orderId: string, paymentStatus: PaymentStatus): Promise<void> => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, paymentStatus, updatedAt: new Date().toISOString() } : o));
    setOrders(updated);
    localStorage.setItem(KEY_ORDERS, JSON.stringify(updated));

    try {
      await updateDoc(doc(db, "orders", orderId), { paymentStatus, updatedAt: new Date().toISOString() });
    } catch (e) {
      console.warn("Firestore updateOrderPaymentStatus fallback:", e);
    }
  };

  const deleteOrder = async (orderId: string): Promise<void> => {
    const updated = orders.filter((o) => o.id !== orderId);
    setOrders(updated);
    localStorage.setItem(KEY_ORDERS, JSON.stringify(updated));

    try {
      await deleteDoc(doc(db, "orders", orderId));
    } catch (e) {
      console.warn("Firestore deleteOrder fallback:", e);
    }
  };

  // ================= CRUD: INVENTORY =================

  const addInventoryItem = async (itemData: Omit<InventoryItem, "id">): Promise<InventoryItem> => {
    const id = `inv-${Date.now().toString(36)}`;
    const newItem: InventoryItem = { id, ...itemData };

    const updated = [...inventory, newItem];
    setInventory(updated);
    localStorage.setItem(KEY_INVENTORY, JSON.stringify(updated));

    try {
      await setDoc(doc(db, "inventory", id), newItem);
    } catch (e) {
      console.warn("Firestore addInventoryItem fallback:", e);
    }
    return newItem;
  };

  const updateInventoryStock = async (id: string, newQuantity: number): Promise<void> => {
    const now = new Date().toISOString().split("T")[0]!;
    const updated = inventory.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity, lastRestocked: now } : item
    );
    setInventory(updated);
    localStorage.setItem(KEY_INVENTORY, JSON.stringify(updated));

    try {
      await updateDoc(doc(db, "inventory", id), { quantity: newQuantity, lastRestocked: now });
    } catch (e) {
      console.warn("Firestore updateInventoryStock fallback:", e);
    }
  };

  const deleteInventoryItem = async (id: string): Promise<void> => {
    const updated = inventory.filter((i) => i.id !== id);
    setInventory(updated);
    localStorage.setItem(KEY_INVENTORY, JSON.stringify(updated));

    try {
      await deleteDoc(doc(db, "inventory", id));
    } catch (e) {
      console.warn("Firestore deleteInventoryItem fallback:", e);
    }
  };

  // ================= CRUD: PAYMENTS =================

  const recordPayment = async (paymentData: Omit<PaymentRecord, "id">): Promise<PaymentRecord> => {
    const id = `pay-${Date.now().toString(36)}`;
    const newPayment: PaymentRecord = { id, ...paymentData };

    const updated = [newPayment, ...payments];
    setPayments(updated);
    localStorage.setItem(KEY_PAYMENTS, JSON.stringify(updated));

    try {
      await setDoc(doc(db, "payments", id), newPayment);
    } catch (e) {
      console.warn("Firestore recordPayment fallback:", e);
    }
    return newPayment;
  };

  const updatePaymentStatus = async (id: string, status: PaymentStatus): Promise<void> => {
    const updated = payments.map((p) => (p.id === id ? { ...p, status } : p));
    setPayments(updated);
    localStorage.setItem(KEY_PAYMENTS, JSON.stringify(updated));

    try {
      await updateDoc(doc(db, "payments", id), { status });
    } catch (e) {
      console.warn("Firestore updatePaymentStatus fallback:", e);
    }
  };

  // ================= CRUD: OFFERS =================

  const addOffer = async (offerData: Omit<Offer, "id">): Promise<Offer> => {
    const id = `off-${Date.now().toString(36)}`;
    const newOffer: Offer = { id, ...offerData };

    const updated = [newOffer, ...offers];
    setOffers(updated);
    localStorage.setItem(KEY_OFFERS, JSON.stringify(updated));

    try {
      await setDoc(doc(db, "offers", id), newOffer);
    } catch (e) {
      console.warn("Firestore addOffer fallback:", e);
    }
    return newOffer;
  };

  const updateOffer = async (id: string, updates: Partial<Offer>): Promise<void> => {
    const updated = offers.map((o) => (o.id === id ? { ...o, ...updates } : o));
    setOffers(updated);
    localStorage.setItem(KEY_OFFERS, JSON.stringify(updated));

    try {
      await updateDoc(doc(db, "offers", id), updates as any);
    } catch (e) {
      console.warn("Firestore updateOffer fallback:", e);
    }
  };

  const deleteOffer = async (id: string): Promise<void> => {
    const updated = offers.filter((o) => o.id !== id);
    setOffers(updated);
    localStorage.setItem(KEY_OFFERS, JSON.stringify(updated));

    try {
      await deleteDoc(doc(db, "offers", id));
    } catch (e) {
      console.warn("Firestore deleteOffer fallback:", e);
    }
  };

  const toggleOfferActive = async (id: string): Promise<void> => {
    const target = offers.find((o) => o.id === id);
    if (!target) return;
    await updateOffer(id, { isActive: !target.isActive });
  };

  // ================= CRUD: REVIEWS =================

  const updateReviewStatus = async (id: string, status: "approved" | "pending" | "hidden"): Promise<void> => {
    const updated = reviews.map((r) => (r.id === id ? { ...r, status } : r));
    setReviews(updated);
    localStorage.setItem(KEY_REVIEWS, JSON.stringify(updated));

    try {
      await updateDoc(doc(db, "reviews", id), { status });
    } catch (e) {
      console.warn("Firestore updateReviewStatus fallback:", e);
    }
  };

  const replyToReview = async (id: string, reply: string): Promise<void> => {
    const updated = reviews.map((r) => (r.id === id ? { ...r, reply } : r));
    setReviews(updated);
    localStorage.setItem(KEY_REVIEWS, JSON.stringify(updated));

    try {
      await updateDoc(doc(db, "reviews", id), { reply });
    } catch (e) {
      console.warn("Firestore replyToReview fallback:", e);
    }
  };

  const deleteReview = async (id: string): Promise<void> => {
    const updated = reviews.filter((r) => r.id !== id);
    setReviews(updated);
    localStorage.setItem(KEY_REVIEWS, JSON.stringify(updated));

    try {
      await deleteDoc(doc(db, "reviews", id));
    } catch (e) {
      console.warn("Firestore deleteReview fallback:", e);
    }
  };

  // ================= NOTIFICATIONS =================

  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    localStorage.setItem(KEY_NOTIFICATIONS, JSON.stringify(updated));
  };

  const markAllNotificationsAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(KEY_NOTIFICATIONS, JSON.stringify(updated));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem(KEY_NOTIFICATIONS, JSON.stringify([]));
  };

  // ================= SETTINGS =================

  const updateSettings = async (updates: Partial<ShopSettings>): Promise<void> => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(updated));

    try {
      await setDoc(doc(db, "settings", "general"), updated);
    } catch (e) {
      console.warn("Firestore updateSettings fallback:", e);
    }
  };

  return (
    <BakeryStoreContext.Provider
      value={{
        products,
        categories,
        orders,
        customers,
        inventory,
        payments,
        offers,
        reviews,
        notifications,
        settings,
        loading,
        syncingFirestore,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductAvailability,
        uploadProductImage,
        addCategory,
        updateCategory,
        deleteCategory,
        createOrder,
        updateOrderStatus,
        updateOrderPaymentStatus,
        deleteOrder,
        addInventoryItem,
        updateInventoryStock,
        deleteInventoryItem,
        recordPayment,
        updatePaymentStatus,
        addOffer,
        updateOffer,
        deleteOffer,
        toggleOfferActive,
        updateReviewStatus,
        replyToReview,
        deleteReview,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        updateSettings,
      }}
    >
      {children}
    </BakeryStoreContext.Provider>
  );
}

export function useBakeryStore() {
  const context = useContext(BakeryStoreContext);
  if (!context) {
    throw new Error("useBakeryStore must be used within a BakeryStoreProvider");
  }
  return context;
}
