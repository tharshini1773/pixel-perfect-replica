import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { products as initialProducts, categories as initialCategories, type Product, type CategoryId } from "@/config/products";

export interface Category {
  id: string;
  name: string;
  blurb?: string;
  image: string;
}

export interface StoreProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  weight: string;
  price: number;
  discountPrice?: number;
  image: string;
  tag?: "Bestseller" | "New" | "Chef's Pick" | string;
  isAvailable: boolean;
  stock: number;
}

export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";

export interface OrderItem {
  id: string;
  productId?: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  deliveryDate?: string;
  cakeMessage?: string;
  notes?: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string;
}

export interface Offer {
  id: string;
  title: string;
  code?: string;
  discountPercentage: number;
  bannerText: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export interface ShopSettings {
  shopName: string;
  logoUrl: string;
  phone: string;
  email: string;
  address: string;
  openingHours: string;
}

interface BakeryStoreContextType {
  products: StoreProduct[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
  offers: Offer[];
  settings: ShopSettings;
  loading: boolean;
  // Product Actions
  addProduct: (product: Omit<StoreProduct, "id">) => Promise<StoreProduct>;
  updateProduct: (id: string, updates: Partial<StoreProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductAvailability: (id: string) => Promise<void>;
  // Category Actions
  addCategory: (category: Category) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  // Order Actions
  createOrder: (orderData: {
    customerName: string;
    customerEmail?: string;
    customerPhone: string;
    deliveryDate?: string;
    cakeMessage?: string;
    notes?: string;
    items: OrderItem[];
    totalAmount: number;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  // Offer Actions
  addOffer: (offer: Omit<Offer, "id">) => Promise<Offer>;
  updateOffer: (id: string, updates: Partial<Offer>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  toggleOfferActive: (id: string) => Promise<void>;
  // Settings Actions
  updateSettings: (updates: Partial<ShopSettings>) => Promise<void>;
}

const BakeryStoreContext = createContext<BakeryStoreContextType | undefined>(undefined);

// Local storage cache keys
const STORAGE_PRODUCTS = "sweet_crumbs_products_v2";
const STORAGE_CATEGORIES = "sweet_crumbs_categories_v2";
const STORAGE_ORDERS = "sweet_crumbs_orders_v2";
const STORAGE_CUSTOMERS = "sweet_crumbs_customers_v2";
const STORAGE_OFFERS = "sweet_crumbs_offers_v2";
const STORAGE_SETTINGS = "sweet_crumbs_settings_v2";

// Default Shop Settings
const DEFAULT_SETTINGS: ShopSettings = {
  shopName: "Sweet Crumbs Bakery",
  logoUrl: "/logo.svg",
  phone: "7550362608",
  email: "tharshini1773@gmail.com",
  address: "1/589F, 100 House, Punnaikayal, Thoothukudi, Tamil Nadu, India",
  openingHours: "Mon - Sun: 9:00 AM - 9:00 PM",
};

// Seed realistic initial orders for instant dashboard demonstration
const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-9421",
    customerName: "Priya Sundaram",
    customerEmail: "priya.sundaram@gmail.com",
    customerPhone: "9842101234",
    deliveryDate: "2026-11-16",
    cakeMessage: "Happy 5th Birthday Ananya!",
    notes: "Please add extra colorful sprinkles and 5 candles.",
    totalAmount: 1300,
    status: "preparing",
    items: [
      {
        id: "item-1",
        productId: "confetti-birthday",
        productName: "Confetti Celebration Cake",
        price: 650,
        quantity: 2,
        total: 1300,
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "ORD-9420",
    customerName: "Arjun Natarajan",
    customerEmail: "arjun.natarajan@outlook.com",
    customerPhone: "9443215678",
    deliveryDate: "2026-11-18",
    cakeMessage: "Forever & Always — Arjun & Meera",
    notes: "Two tier pearl wedding cake. Deliver to Punnaikayal wedding hall.",
    totalAmount: 2400,
    status: "confirmed",
    items: [
      {
        id: "item-2",
        productId: "royal-pearl-wedding",
        productName: "Royal Pearl Tier Wedding Cake",
        price: 2400,
        quantity: 1,
        total: 2400,
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "ORD-9419",
    customerName: "Karthik Raja",
    customerEmail: "karthik.raja@techcorp.in",
    customerPhone: "9789012345",
    deliveryDate: "2026-11-14",
    cakeMessage: "Karthik Rocks!",
    notes: "Eggless Belgian chocolate truffle. Deliver by 4 PM.",
    totalAmount: 750,
    status: "ready",
    items: [
      {
        id: "item-3",
        productId: "belgian-truffle-choc",
        productName: "Belgian Chocolate Truffle Cake",
        price: 750,
        quantity: 1,
        total: 750,
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "ORD-9418",
    customerName: "Ananya Venkatesh",
    customerEmail: "ananya.v@gmail.com",
    customerPhone: "9884567890",
    deliveryDate: "2026-11-13",
    cakeMessage: "Happy 1st Anniversary Dear",
    notes: "Vintage Lambeth heart cake with fresh cream.",
    totalAmount: 950,
    status: "delivered",
    items: [
      {
        id: "item-4",
        productId: "vintage-lambeth-heart",
        productName: "Vintage Lambeth Heart Anniversary Cake",
        price: 950,
        quantity: 1,
        total: 950,
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "ORD-9417",
    customerName: "Rahul Menon",
    customerEmail: "rahul.m@yahoo.com",
    customerPhone: "9940123456",
    deliveryDate: "2026-11-12",
    cakeMessage: "Happy 60th Birthday Amma",
    notes: "Sugar sheet photo print uploaded via WhatsApp.",
    totalAmount: 850,
    status: "delivered",
    items: [
      {
        id: "item-5",
        productId: "custom-sugar-photo",
        productName: "Personalized Sugar Sheet Photo Cake",
        price: 850,
        quantity: 1,
        total: 850,
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const INITIAL_OFFERS: Offer[] = [
  {
    id: "welcome15",
    title: "Festive Season Celebration",
    code: "SWEET15",
    discountPercentage: 15,
    bannerText: "🎉 Festive Special: Enjoy 15% OFF on all Handcrafted Wedding & Custom Cakes! Use Code: SWEET15",
    startDate: "2026-11-01",
    endDate: "2026-12-31",
    isActive: true,
  },
];

export function BakeryStoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load store data
  useEffect(() => {
    let mounted = true;

    async function loadInitialData() {
      try {
        // 1. Categories
        let loadedCategories: Category[] = [];
        const savedCat = localStorage.getItem(STORAGE_CATEGORIES);
        if (savedCat) {
          try {
            loadedCategories = JSON.parse(savedCat);
          } catch {}
        }
        if (!loadedCategories.length) {
          loadedCategories = initialCategories.map((c) => ({
            id: c.id,
            name: c.name,
            blurb: c.blurb,
            image: c.image,
          }));
          localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(loadedCategories));
        }

        // 2. Products
        let loadedProducts: StoreProduct[] = [];
        const savedProd = localStorage.getItem(STORAGE_PRODUCTS);
        if (savedProd) {
          try {
            loadedProducts = JSON.parse(savedProd);
          } catch {}
        }
        if (!loadedProducts.length) {
          loadedProducts = initialProducts.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            description: p.description,
            weight: p.weight,
            price: p.price,
            discountPrice: p.price > 1000 ? Math.round(p.price * 0.9) : undefined,
            image: p.image,
            tag: p.tag,
            isAvailable: true,
            stock: 12,
          }));
          localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(loadedProducts));
        }

        // 3. Orders
        let loadedOrders: Order[] = [];
        const savedOrd = localStorage.getItem(STORAGE_ORDERS);
        if (savedOrd) {
          try {
            loadedOrders = JSON.parse(savedOrd);
          } catch {}
        }
        if (!loadedOrders.length) {
          loadedOrders = INITIAL_ORDERS;
          localStorage.setItem(STORAGE_ORDERS, JSON.stringify(loadedOrders));
        }

        // 4. Customers (derived or cached)
        let loadedCustomers: Customer[] = [];
        const savedCust = localStorage.getItem(STORAGE_CUSTOMERS);
        if (savedCust) {
          try {
            loadedCustomers = JSON.parse(savedCust);
          } catch {}
        }
        if (!loadedCustomers.length) {
          // Derive initial customer metrics from orders
          const map = new Map<string, Customer>();
          loadedOrders.forEach((o) => {
            const key = o.customerPhone;
            const existing = map.get(key);
            if (existing) {
              existing.totalOrders += 1;
              existing.totalSpent += o.totalAmount;
              if (new Date(o.createdAt) > new Date(existing.lastOrderAt)) {
                existing.lastOrderAt = o.createdAt;
              }
            } else {
              map.set(key, {
                id: `cust-${key.slice(-4)}`,
                name: o.customerName,
                email: o.customerEmail,
                phone: o.customerPhone,
                totalOrders: 1,
                totalSpent: o.totalAmount,
                lastOrderAt: o.createdAt,
              });
            }
          });
          loadedCustomers = Array.from(map.values());
          localStorage.setItem(STORAGE_CUSTOMERS, JSON.stringify(loadedCustomers));
        }

        // 5. Offers
        let loadedOffers: Offer[] = [];
        const savedOff = localStorage.getItem(STORAGE_OFFERS);
        if (savedOff) {
          try {
            loadedOffers = JSON.parse(savedOff);
          } catch {}
        }
        if (!loadedOffers.length) {
          loadedOffers = INITIAL_OFFERS;
          localStorage.setItem(STORAGE_OFFERS, JSON.stringify(loadedOffers));
        }

        // 6. Settings
        let loadedSettings: ShopSettings = DEFAULT_SETTINGS;
        const savedSet = localStorage.getItem(STORAGE_SETTINGS);
        if (savedSet) {
          try {
            loadedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSet) };
          } catch {}
        }

        // 7. Supabase DB Sync if connected
        if (isSupabaseConfigured) {
          try {
            const { data: dbProducts } = await supabase.from("products").select("*");
            if (dbProducts && dbProducts.length > 0) {
              loadedProducts = dbProducts.map((p) => ({
                id: p.id,
                name: p.name,
                category: p.category_id,
                description: p.description,
                weight: p.weight,
                price: Number(p.price),
                discountPrice: p.discount_price ? Number(p.discount_price) : undefined,
                image: p.image,
                tag: p.tag,
                isAvailable: p.is_available,
                stock: p.stock_quantity ?? 10,
              }));
            }

            const { data: dbCategories } = await supabase.from("categories").select("*").order("sort_order");
            if (dbCategories && dbCategories.length > 0) {
              loadedCategories = dbCategories.map((c) => ({
                id: c.id,
                name: c.name,
                blurb: c.blurb,
                image: c.image,
              }));
            }

            const { data: dbOrders } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
            if (dbOrders && dbOrders.length > 0) {
              loadedOrders = dbOrders.map((o) => ({
                id: o.id,
                customerName: o.customer_name,
                customerEmail: o.customer_email,
                customerPhone: o.customer_phone,
                deliveryDate: o.delivery_date,
                cakeMessage: o.cake_message,
                notes: o.notes,
                totalAmount: Number(o.total_amount),
                status: o.status,
                createdAt: o.created_at,
                updatedAt: o.updated_at,
                items: (o.order_items || []).map((it: any) => ({
                  id: it.id,
                  productId: it.product_id,
                  productName: it.product_name,
                  price: Number(it.price),
                  quantity: it.quantity,
                  total: Number(it.total),
                })),
              }));
            }
          } catch (syncErr) {
            console.warn("Supabase fetch failed, continuing with active catalog:", syncErr);
          }
        }

        if (mounted) {
          setCategories(loadedCategories);
          setProducts(loadedProducts);
          setOrders(loadedOrders);
          setCustomers(loadedCustomers);
          setOffers(loadedOffers);
          setSettings(loadedSettings);
        }
      } catch (err) {
        console.error("BakeryStore initialization error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, []);

  // PRODUCT ACTIONS
  const addProduct = async (productData: Omit<StoreProduct, "id">): Promise<StoreProduct> => {
    const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const id = `${slug}-${Date.now().toString().slice(-4)}`;
    const newProduct: StoreProduct = { ...productData, id };

    const updated = [newProduct, ...products];
    setProducts(updated);
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase.from("products").insert({
          id,
          name: newProduct.name,
          category_id: newProduct.category,
          description: newProduct.description,
          price: newProduct.price,
          discount_price: newProduct.discountPrice || null,
          weight: newProduct.weight,
          image: newProduct.image,
          tag: newProduct.tag || null,
          is_available: newProduct.isAvailable,
          stock_quantity: newProduct.stock,
        });
      } catch (e) {
        console.error("Supabase insert product error:", e);
      }
    }

    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<StoreProduct>) => {
    const updated = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setProducts(updated);
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        const payload: any = { updated_at: new Date().toISOString() };
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.category !== undefined) payload.category_id = updates.category;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.price !== undefined) payload.price = updates.price;
        if (updates.discountPrice !== undefined) payload.discount_price = updates.discountPrice;
        if (updates.weight !== undefined) payload.weight = updates.weight;
        if (updates.image !== undefined) payload.image = updates.image;
        if (updates.tag !== undefined) payload.tag = updates.tag;
        if (updates.isAvailable !== undefined) payload.is_available = updates.isAvailable;
        if (updates.stock !== undefined) payload.stock_quantity = updates.stock;

        await supabase.from("products").update(payload).eq("id", id);
      } catch (e) {
        console.error("Supabase update product error:", e);
      }
    }
  };

  const deleteProduct = async (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase.from("products").delete().eq("id", id);
      } catch (e) {
        console.error("Supabase delete product error:", e);
      }
    }
  };

  const toggleProductAvailability = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    await updateProduct(id, { isAvailable: !target.isAvailable });
  };

  // CATEGORY ACTIONS
  const addCategory = async (catData: Category): Promise<Category> => {
    const updated = [...categories, catData];
    setCategories(updated);
    localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase.from("categories").insert({
          id: catData.id,
          name: catData.name,
          blurb: catData.blurb || null,
          image: catData.image,
          sort_order: updated.length,
        });
      } catch (e) {
        console.error("Supabase category insert error:", e);
      }
    }

    return catData;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const updated = categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setCategories(updated);
    localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase.from("categories").update(updates).eq("id", id);
      } catch (e) {
        console.error("Supabase category update error:", e);
      }
    }
  };

  const deleteCategory = async (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    localStorage.setItem(STORAGE_CATEGORIES, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase.from("categories").delete().eq("id", id);
      } catch (e) {
        console.error("Supabase category delete error:", e);
      }
    }
  };

  // ORDER ACTIONS
  const createOrder = async (orderData: {
    customerName: string;
    customerEmail?: string;
    customerPhone: string;
    deliveryDate?: string;
    cakeMessage?: string;
    notes?: string;
    items: OrderItem[];
    totalAmount: number;
  }): Promise<Order> => {
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      id: orderId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      deliveryDate: orderData.deliveryDate,
      cakeMessage: orderData.cakeMessage,
      notes: orderData.notes,
      totalAmount: orderData.totalAmount,
      status: "pending",
      items: orderData.items,
      createdAt: now,
      updatedAt: now,
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem(STORAGE_ORDERS, JSON.stringify(updatedOrders));

    // Update customer registry
    const customerPhone = orderData.customerPhone;
    const existingIndex = customers.findIndex((c) => c.phone === customerPhone);
    let updatedCustomers = [...customers];
    if (existingIndex >= 0) {
      const existing = updatedCustomers[existingIndex];
      updatedCustomers[existingIndex] = {
        ...existing,
        name: orderData.customerName || existing.name,
        email: orderData.customerEmail || existing.email,
        totalOrders: existing.totalOrders + 1,
        totalSpent: existing.totalSpent + orderData.totalAmount,
        lastOrderAt: now,
      };
    } else {
      updatedCustomers = [
        {
          id: `cust-${Date.now().toString().slice(-4)}`,
          name: orderData.customerName,
          email: orderData.customerEmail,
          phone: orderData.customerPhone,
          totalOrders: 1,
          totalSpent: orderData.totalAmount,
          lastOrderAt: now,
        },
        ...updatedCustomers,
      ];
    }
    setCustomers(updatedCustomers);
    localStorage.setItem(STORAGE_CUSTOMERS, JSON.stringify(updatedCustomers));

    // Supabase persistence
    if (isSupabaseConfigured) {
      try {
        await supabase.from("orders").insert({
          id: orderId,
          customer_name: newOrder.customerName,
          customer_email: newOrder.customerEmail,
          customer_phone: newOrder.customerPhone,
          delivery_date: newOrder.deliveryDate,
          cake_message: newOrder.cakeMessage,
          notes: newOrder.notes,
          total_amount: newOrder.totalAmount,
          status: newOrder.status,
          created_at: now,
          updated_at: now,
        });

        if (newOrder.items.length) {
          await supabase.from("order_items").insert(
            newOrder.items.map((it) => ({
              id: `${orderId}-${it.id}`,
              order_id: orderId,
              product_id: it.productId || null,
              product_name: it.productName,
              price: it.price,
              quantity: it.quantity,
              total: it.total,
            })),
          );
        }

        await supabase.from("customers").upsert({
          id: `cust-${customerPhone.slice(-6)}`,
          name: newOrder.customerName,
          email: newOrder.customerEmail,
          phone: customerPhone,
          last_order_at: now,
        });
      } catch (e) {
        console.error("Supabase order insert error:", e);
      }
    }

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o,
    );
    setOrders(updated);
    localStorage.setItem(STORAGE_ORDERS, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", orderId);
      } catch (e) {
        console.error("Supabase order status update error:", e);
      }
    }
  };

  const deleteOrder = async (orderId: string) => {
    const updated = orders.filter((o) => o.id !== orderId);
    setOrders(updated);
    localStorage.setItem(STORAGE_ORDERS, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase.from("orders").delete().eq("id", orderId);
      } catch (e) {
        console.error("Supabase order delete error:", e);
      }
    }
  };

  // OFFERS ACTIONS
  const addOffer = async (offerData: Omit<Offer, "id">): Promise<Offer> => {
    const id = `offer-${Date.now().toString().slice(-4)}`;
    const newOffer: Offer = { ...offerData, id };
    const updated = [newOffer, ...offers];
    setOffers(updated);
    localStorage.setItem(STORAGE_OFFERS, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase.from("offers").insert({
          id,
          title: newOffer.title,
          code: newOffer.code,
          discount_percentage: newOffer.discountPercentage,
          banner_text: newOffer.bannerText,
          start_date: newOffer.startDate,
          end_date: newOffer.endDate,
          is_active: newOffer.isActive,
        });
      } catch (e) {
        console.error("Supabase offer insert error:", e);
      }
    }

    return newOffer;
  };

  const updateOffer = async (id: string, updates: Partial<Offer>) => {
    const updated = offers.map((o) => (o.id === id ? { ...o, ...updates } : o));
    setOffers(updated);
    localStorage.setItem(STORAGE_OFFERS, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        const payload: any = {};
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.code !== undefined) payload.code = updates.code;
        if (updates.discountPercentage !== undefined) payload.discount_percentage = updates.discountPercentage;
        if (updates.bannerText !== undefined) payload.banner_text = updates.bannerText;
        if (updates.startDate !== undefined) payload.start_date = updates.startDate;
        if (updates.endDate !== undefined) payload.end_date = updates.endDate;
        if (updates.isActive !== undefined) payload.is_active = updates.isActive;

        await supabase.from("offers").update(payload).eq("id", id);
      } catch (e) {
        console.error("Supabase offer update error:", e);
      }
    }
  };

  const deleteOffer = async (id: string) => {
    const updated = offers.filter((o) => o.id !== id);
    setOffers(updated);
    localStorage.setItem(STORAGE_OFFERS, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase.from("offers").delete().eq("id", id);
      } catch (e) {
        console.error("Supabase offer delete error:", e);
      }
    }
  };

  const toggleOfferActive = async (id: string) => {
    const target = offers.find((o) => o.id === id);
    if (!target) return;
    await updateOffer(id, { isActive: !target.isActive });
  };

  // SETTINGS ACTIONS
  const updateSettings = async (updates: Partial<ShopSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(updated));

    if (isSupabaseConfigured) {
      try {
        await supabase.from("shop_settings").upsert({
          id: "default",
          shop_name: updated.shopName,
          logo_url: updated.logoUrl,
          phone: updated.phone,
          email: updated.email,
          address: updated.address,
          opening_hours: updated.openingHours,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.error("Supabase settings update error:", e);
      }
    }
  };

  return (
    <BakeryStoreContext.Provider
      value={{
        products,
        categories,
        orders,
        customers,
        offers,
        settings,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductAvailability,
        addCategory,
        updateCategory,
        deleteCategory,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        addOffer,
        updateOffer,
        deleteOffer,
        toggleOfferActive,
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

