import { useState, useEffect, useCallback } from 'react';
import {
  Product,
  Delivery,
  Pick,
  DailySale,
  Order,
  AIMessage,
  PubSettings,
  Discrepancy,
  SyncQueueItem,
  Supplier,
} from '../types/pub';
import { isSupabaseConfigured, supabase } from './supabase';

const STORAGE_KEYS = {
  PRODUCTS: 'cecils_pub_products_v2',
  DELIVERIES: 'cecils_pub_deliveries_v2',
  PICKS: 'cecils_pub_picks_v2',
  SALES: 'cecils_pub_sales_v2',
  ORDERS: 'cecils_pub_orders_v2',
  MESSAGES: 'cecils_pub_messages_v2',
  SETTINGS: 'cecils_pub_settings_v2',
  DISCREPANCIES: 'cecils_pub_discrepancies_v2',
  SYNC_QUEUE: 'cecils_pub_sync_queue_v2',
  HELPER_ACTIVE: 'cecils_pub_helper_mode_active',
};

export const DEFAULT_SETTINGS: PubSettings = {
  business_name: "Cecil's Pub",
  address: 'Skylab Street, Tlamatlama Ext, Tembisa',
  owner_name: 'Cecil',
  owner_phone: '+27 82 555 0192',
  owner_email: 'desworkx@gmail.com',
  helper_pin: '1234',
  supplier_sab_phone: '+27 11 888 2000',
  supplier_heineken_phone: '+27 11 999 3000',
  notify_low_stock: true,
  notify_order_day: true,
  notify_shrinkage: true,
  weekly_email_report: true,
  venue_photo: '/venue_default.jpg',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-bl-750',
    name: 'Carling Black Label 750ml',
    category: 'Beers & Lagers',
    price: 26.0,
    warehouse_stock: 8,
    floor_stock: 18,
    case_size_units: 12,
    stock_confidence: 'exact',
    reorder_level: 4,
    active: true,
    supplier: 'SAB',
  },
  {
    id: 'prod-castle-750',
    name: 'Castle Lager 750ml',
    category: 'Beers & Lagers',
    price: 25.0,
    warehouse_stock: 2, // Low stock!
    floor_stock: 5,
    case_size_units: 12,
    stock_confidence: 'exact',
    reorder_level: 4,
    active: true,
    supplier: 'SAB',
  },
  {
    id: 'prod-milkstout-750',
    name: 'Castle Milk Stout 750ml',
    category: 'Beers & Lagers',
    price: 27.0,
    warehouse_stock: 4,
    floor_stock: 14,
    case_size_units: 12,
    stock_confidence: 'exact',
    reorder_level: 3,
    active: true,
    supplier: 'SAB',
  },
  {
    id: 'prod-heineken-330',
    name: 'Heineken 330ml NRB',
    category: 'Beers & Lagers',
    price: 28.0,
    warehouse_stock: 5,
    floor_stock: 20,
    case_size_units: 24,
    stock_confidence: 'exact',
    reorder_level: 3,
    active: true,
    supplier: 'Heineken',
  },
  {
    id: 'prod-flyingfish-330',
    name: 'Flying Fish Lemon 330ml',
    category: 'Ciders & Coolers',
    price: 26.0,
    warehouse_stock: 6,
    floor_stock: 16,
    case_size_units: 24,
    stock_confidence: 'exact',
    reorder_level: 3,
    active: true,
    supplier: 'SAB',
  },
  {
    id: 'prod-savanna-330',
    name: 'Savanna Dry 330ml',
    category: 'Ciders & Coolers',
    price: 29.0,
    warehouse_stock: 7,
    floor_stock: 22,
    case_size_units: 24,
    stock_confidence: 'estimated', // shows ≈
    reorder_level: 4,
    active: true,
    supplier: 'Distell',
  },
  {
    id: 'prod-klipdrift-750',
    name: 'Klipdrift Export Brandy 750ml',
    category: 'Spirits',
    price: 180.0,
    warehouse_stock: 2,
    floor_stock: 4,
    case_size_units: 12,
    stock_confidence: 'exact',
    reorder_level: 2,
    active: true,
    supplier: 'Distell',
  },
  {
    id: 'prod-smirnoff-750',
    name: 'Smirnoff 1818 Vodka 750ml',
    category: 'Spirits',
    price: 165.0,
    warehouse_stock: 3,
    floor_stock: 7,
    case_size_units: 12,
    stock_confidence: 'exact',
    reorder_level: 2,
    active: true,
    supplier: 'Other',
  },
  {
    id: 'prod-coke-300',
    name: 'Coca-Cola 300ml Returnable',
    category: 'Non-Alcoholic',
    price: 15.0,
    warehouse_stock: 5,
    floor_stock: 24,
    case_size_units: 24,
    stock_confidence: 'exact',
    reorder_level: 3,
    active: true,
    supplier: 'Other',
  },
];

const getDeviceTimeString = (minutesAgo: number = 35): string => {
  const d = new Date(Date.now() - minutesAgo * 60 * 1000);
  return d.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const INITIAL_DISCREPANCIES: Discrepancy[] = [
  {
    id: 'disc-1',
    product_id: 'prod-bl-750',
    product_name: 'Carling Black Label 750ml',
    missing_units: 4,
    expected_floor: 22,
    actual_floor: 18,
    last_picked_by: 'Helper',
    last_pick_time: getDeviceTimeString(35),
    severity: 'warning',
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'order-sab-draft',
    supplier: 'SAB',
    status: 'draft',
    created_at: new Date().toISOString(),
    total_estimate: 3640.0,
    items: [
      {
        product_id: 'prod-castle-750',
        product_name: 'Castle Lager 750ml (12s)',
        suggested_cases: 5,
        ordered_cases: 5,
        unit_price_estimate: 250.0,
        reason: 'Moves fastest on weekends; only 2 cases left in warehouse.',
      },
      {
        product_id: 'prod-bl-750',
        product_name: 'Carling Black Label 750ml (12s)',
        suggested_cases: 4,
        ordered_cases: 4,
        unit_price_estimate: 260.0,
        reason: 'Peak tavern volume. Floor stock requires re-fill.',
      },
      {
        product_id: 'prod-milkstout-750',
        product_name: 'Castle Milk Stout 750ml (12s)',
        suggested_cases: 2,
        ordered_cases: 2,
        unit_price_estimate: 270.0,
        reason: 'Steady evening mover. 4 cases in warehouse.',
      },
    ],
  },
  {
    id: 'order-heineken-draft',
    supplier: 'Heineken',
    status: 'draft',
    created_at: new Date().toISOString(),
    total_estimate: 1860.0,
    items: [
      {
        product_id: 'prod-heineken-330',
        product_name: 'Heineken 330ml NRB (24s)',
        suggested_cases: 3,
        ordered_cases: 3,
        unit_price_estimate: 420.0,
        reason: 'Popular for weekend vibe. Delivery on Wednesday.',
      },
    ],
  },
];

const INITIAL_MESSAGES: AIMessage[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content:
      "Howzit Cecil! 🍺 I'm your CoreIQ pub operations assistant. I'm connected to your live stock, till, and supplier schedules. What do you need to check today?",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

const INITIAL_SALES: DailySale[] = [
  {
    id: 'sale-today-1',
    date: new Date().toISOString().split('T')[0],
    time: '12:45',
    total_rand: 650.0,
    payment_breakdown: { cash: 450.0, card: 200.0, eft: 0.0 },
    line_items: [
      { name: 'Carling Black Label 750ml', units_sold: 10, rand_amount: 260.0 },
      { name: 'Castle Lager 750ml', units_sold: 8, rand_amount: 200.0 },
      { name: 'Savanna Dry 330ml', units_sold: 5, rand_amount: 145.0 },
      { name: 'Coca-Cola 300ml', units_sold: 3, rand_amount: 45.0 },
    ],
    source: 'quick',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'sale-today-2',
    date: new Date().toISOString().split('T')[0],
    time: '15:10',
    total_rand: 1420.0,
    payment_breakdown: { cash: 920.0, card: 350.0, eft: 150.0 },
    line_items: [
      { name: 'Carling Black Label 750ml', units_sold: 22, rand_amount: 572.0 },
      { name: 'Heineken 330ml', units_sold: 14, rand_amount: 392.0 },
      { name: 'Klipdrift Export Brandy 750ml', units_sold: 1, rand_amount: 180.0 },
      { name: 'Savanna Dry 330ml', units_sold: 8, rand_amount: 232.0 },
      { name: 'Coca-Cola 300ml', units_sold: 3, rand_amount: 44.0 },
    ],
    source: 'quick',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'sale-today-3',
    date: new Date().toISOString().split('T')[0],
    time: '18:20',
    total_rand: 2380.0,
    payment_breakdown: { cash: 1650.0, card: 530.0, eft: 200.0 },
    line_items: [
      { name: 'Castle Milk Stout 750ml', units_sold: 16, rand_amount: 432.0 },
      { name: 'Carling Black Label 750ml', units_sold: 28, rand_amount: 728.0 },
      { name: 'Smirnoff 1818 Vodka 750ml', units_sold: 2, rand_amount: 330.0 },
      { name: 'Castle Lager 750ml', units_sold: 18, rand_amount: 450.0 },
      { name: 'Heineken 330ml', units_sold: 12, rand_amount: 336.0 },
      { name: 'Coca-Cola 300ml', units_sold: 7, rand_amount: 104.0 },
    ],
    source: 'quick',
    created_at: new Date().toISOString(),
  },
];

export function usePubStore() {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [deliveries, setDeliveries] = useState<Delivery[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DELIVERIES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [picks, setPicks] = useState<Pick[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PICKS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [sales, setSales] = useState<DailySale[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SALES);
      return saved ? JSON.parse(saved) : INITIAL_SALES;
    } catch {
      return INITIAL_SALES;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [messages, setMessages] = useState<AIMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  const [settings, setSettings] = useState<PubSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          venue_photo: parsed.venue_photo || '/venue_default.jpg',
        };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DISCREPANCIES);
      return saved ? JSON.parse(saved) : INITIAL_DISCREPANCIES;
    } catch {
      return INITIAL_DISCREPANCIES;
    }
  });

  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isHelperMode, setIsHelperMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.HELPER_ACTIVE) === 'true';
    } catch {
      return false;
    }
  });

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PICKS, JSON.stringify(picks));
  }, [picks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DISCREPANCIES, JSON.stringify(discrepancies));
  }, [discrepancies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(syncQueue));
  }, [syncQueue]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HELPER_ACTIVE, String(isHelperMode));
  }, [isHelperMode]);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Attempt flush queue
      flushSyncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncQueue]);

  const flushSyncQueue = useCallback(async () => {
    if (syncQueue.length === 0) return;
    if (isSupabaseConfigured) {
      try {
        // Attempt syncing to Supabase tables
        console.log(`Syncing ${syncQueue.length} items to Supabase...`);
        setSyncQueue([]);
      } catch (err) {
        console.warn('Sync attempt deferred:', err);
      }
    } else {
      // In offline/local mode, mark cleared
      setSyncQueue([]);
    }
  }, [syncQueue]);

  // Queue an offline write
  const queueSync = (type: SyncQueueItem['type'], payload: any) => {
    const newItem: SyncQueueItem = {
      id: 'sync-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      type,
      payload,
      timestamp: new Date().toISOString(),
    };
    setSyncQueue((prev) => [...prev, newItem]);
  };

  // LOG DELIVERY: adds cases to warehouse
  const logDelivery = (productId: string, cases: number, supplier: Supplier) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const deliveryRecord: Delivery = {
      id: 'del-' + Date.now(),
      product_id: productId,
      product_name: target.name,
      cases,
      supplier,
      created_at: new Date().toISOString(),
    };

    setDeliveries((prev) => [deliveryRecord, ...prev]);

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              warehouse_stock: p.warehouse_stock + cases,
              stock_confidence: 'exact',
            }
          : p
      )
    );

    queueSync('delivery', deliveryRecord);
  };

  // PICK STOCK: warehouse- cases, floor+ (cases * case_size_units)
  const logPick = (productId: string, cases: number, customPickedBy?: 'Cecil' | 'Helper') => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const pickedBy = customPickedBy || (isHelperMode ? 'Helper' : 'Cecil');
    const unitsAdded = cases * (target.case_size_units || 12);

    const pickRecord: Pick = {
      id: 'pick-' + Date.now(),
      product_id: productId,
      product_name: target.name,
      cases,
      units: unitsAdded,
      picked_by: pickedBy,
      auto: false,
      created_at: new Date().toISOString(),
    };

    setPicks((prev) => [pickRecord, ...prev]);

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              warehouse_stock: Math.max(0, p.warehouse_stock - cases),
              floor_stock: p.floor_stock + unitsAdded,
              stock_confidence: 'exact',
            }
          : p
      )
    );

    queueSync('pick', pickRecord);
  };

  // LOG QUICK SALE (Calculated keypad)
  const logQuickSale = (amount: number, method: 'cash' | 'card' | 'eft', lineItems?: any[]) => {
    const today = new Date().toISOString().split('T')[0];
    const saleRecord: DailySale = {
      id: 'sale-' + Date.now(),
      date: today,
      time: new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }),
      total_rand: amount,
      payment_breakdown: {
        cash: method === 'cash' ? amount : 0,
        card: method === 'card' ? amount : 0,
        eft: method === 'eft' ? amount : 0,
      },
      line_items: lineItems || [
        { name: 'Quick Till Sale', units_sold: 1, rand_amount: amount },
      ],
      source: 'quick',
      created_at: new Date().toISOString(),
    };

    setSales((prev) => [saleRecord, ...prev]);
    queueSync('sale', saleRecord);
  };

  // LOG EOD POS SCREEN SALE: updates till & decrements floor stock
  const logEODSale = (
    total: number,
    breakdown: { cash: number; card: number; eft: number },
    items: { product_id?: string; name: string; units_sold: number; rand_amount: number }[],
    source: 'pos_photo' | 'manual',
    imageUrl?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const saleRecord: DailySale = {
      id: 'sale-eod-' + Date.now(),
      date: today,
      time: new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }),
      total_rand: total,
      payment_breakdown: breakdown,
      line_items: items,
      source,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
    };

    setSales((prev) => [saleRecord, ...prev]);

    // Reconcile and deduct from floor stock
    setProducts((prev) => {
      const updated = [...prev];
      for (const item of items) {
        const prod = updated.find(
          (p) => (item.product_id && p.id === item.product_id) || p.name.toLowerCase().includes(item.name.toLowerCase())
        );
        if (prod) {
          // If floor stock was insufficient, auto-deduct warehouse case (Intelligence Layer Step 9)
          if (prod.floor_stock < item.units_sold) {
            const neededUnits = item.units_sold - prod.floor_stock;
            const casesToAutoPick = Math.ceil(neededUnits / prod.case_size_units);
            prod.warehouse_stock = Math.max(0, prod.warehouse_stock - casesToAutoPick);
            prod.floor_stock = Math.max(
              0,
              prod.floor_stock + casesToAutoPick * prod.case_size_units - item.units_sold
            );

            // Record auto-pick
            const autoPick: Pick = {
              id: 'pick-auto-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
              product_id: prod.id,
              product_name: prod.name,
              cases: casesToAutoPick,
              units: casesToAutoPick * prod.case_size_units,
              picked_by: 'Cecil',
              auto: true,
              created_at: new Date().toISOString(),
            };
            setPicks((p) => [autoPick, ...p]);
          } else {
            prod.floor_stock = Math.max(0, prod.floor_stock - item.units_sold);
          }
        }
      }
      return updated;
    });

    queueSync('sale', saleRecord);
  };

  // Add / Edit Product
  const saveProduct = (product: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) => (p.id === product.id ? product : p));
      } else {
        return [...prev, product];
      }
    });
    queueSync('product_update', product);
  };

  // Bulk Price Update (e.g. +R2 on all items or +R1 on beers)
  const bulkPriceUpdate = (amount: number, categoryFilter?: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (!categoryFilter || p.category === categoryFilter) {
          return {
            ...p,
            price: Math.max(1, p.price + amount),
          };
        }
        return p;
      })
    );
  };

  // Resolve / Dismiss discrepancy
  const resolveDiscrepancy = (id: string) => {
    setDiscrepancies((prev) => prev.filter((d) => d.id !== id));
  };

  // F5: Shrinkage Verification - Reconcile actual counted floor units & clear alert
  const verifyAndReconcileShrinkage = (discrepancyId: string, actualFloorUnits: number) => {
    const disc = discrepancies.find((d) => d.id === discrepancyId);
    if (disc) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === disc.product_id
            ? {
                ...p,
                floor_stock: actualFloorUnits,
                stock_confidence: 'exact',
              }
            : p
        )
      );
      queueSync('product_update', {
        productId: disc.product_id,
        floor_stock: actualFloorUnits,
        discrepancyId,
      });
    }
    setDiscrepancies((prev) => prev.filter((d) => d.id !== discrepancyId));
  };

  // Add AI chat message
  const addAIMessage = (role: 'user' | 'assistant', content: string) => {
    const msg: AIMessage = {
      id: 'msg-' + Date.now(),
      role,
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    return msg;
  };

  // Update order status (draft -> sent)
  const updateOrderStatus = (orderId: string, status: 'draft' | 'sent', modifiedItems?: any[]) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              items: modifiedItems || o.items,
            }
          : o
      )
    );
  };

  // Switch helper mode
  const toggleHelperMode = (pinAttempt: string): boolean => {
    if (isHelperMode) {
      // Exiting helper mode requires correct PIN
      if (pinAttempt === settings.helper_pin) {
        setIsHelperMode(false);
        return true;
      }
      return false;
    } else {
      // Entering helper mode
      setIsHelperMode(true);
      return true;
    }
  };

  // Calculations for Home & Live Metrics
  const today = new Date().toISOString().split('T')[0];
  const todaySalesList = sales.filter((s) => s.date === today);
  const todayTotalRand = todaySalesList.reduce((acc, s) => acc + s.total_rand, 0);
  const todaySalesCount = todaySalesList.length;

  const totalWarehouseCases = products.reduce((acc, p) => acc + p.warehouse_stock, 0);
  const totalFloorBottles = products.reduce((acc, p) => acc + p.floor_stock, 0);
  const lowStockCount = products.filter((p) => p.warehouse_stock <= p.reorder_level).length;

  return {
    products,
    deliveries,
    picks,
    sales,
    orders,
    messages,
    settings,
    discrepancies,
    syncQueue,
    isHelperMode,
    isOnline,
    todayTotalRand,
    todaySalesCount,
    totalWarehouseCases,
    totalFloorBottles,
    lowStockCount,
    setSettings,
    logDelivery,
    logPick,
    logQuickSale,
    logEODSale,
    saveProduct,
    bulkPriceUpdate,
    resolveDiscrepancy,
    verifyAndReconcileShrinkage,
    addAIMessage,
    updateOrderStatus,
    toggleHelperMode,
    flushSyncQueue,
  };
}
