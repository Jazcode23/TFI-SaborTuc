import { RESTAURANTS_DATA } from '../data/restaurantsData';
import {
  Restaurant,
  Product,
  Order,
  OrderStatus,
  FilterParams,
  OrderStatusHistoryItem,
} from '../types';

const STORAGE_KEY_ORDERS = 'sabortuc_orders_v1';

// Seed demo orders for San Miguel de Tucumán
const SEED_ORDERS: Order[] = [
  {
    id: 'SMT-2026-8812',
    customer: {
      name: 'Jazmín Berdú',
      phone: '+54 381 482-9910',
      email: 'jazmin.berdu20@gmail.com',
    },
    deliveryAddress: {
      id: 'addr-1',
      alias: 'Departamento',
      street: 'Virgen de la Merced',
      number: '420',
      apartment: '4B',
      neighborhood: 'Barrio Norte',
      city: 'San Miguel de Tucumán',
      isDefault: true,
      instructions: 'Tocar timbre 4B. Dejar en guardia si no atiendo.',
    },
    restaurantId: 'el-portal-regionales',
    restaurantName: 'El Portal – Comidas Regionales',
    items: [
      {
        productId: 'ep-1',
        name: 'Docena de Empanadas Tucumanas a Cuchillo',
        price: 9600,
        quantity: 1,
        notes: 'Bien jugosas, limón cortado al medio por favor',
      },
      {
        productId: 'ep-3',
        name: 'Humita en Chala con Queso Criollo de Tafí',
        price: 5400,
        quantity: 1,
      },
    ],
    subtotal: 15000,
    deliveryFee: 1200,
    serviceFee: 500,
    discount: 0,
    total: 16700,
    paymentMethod: 'mercadopago',
    paymentStatus: 'aprobado',
    status: 'en_camino',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    statusHistory: [
      {
        status: 'recibido',
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        description: 'Pedido recibido por la plataforma SaborTUC',
      },
      {
        status: 'confirmado',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        description: 'El Portal confirmó la comanda en cocina',
      },
      {
        status: 'en_preparacion',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        description: 'Empanadas en horno de barro y humita al vapor',
      },
      {
        status: 'en_camino',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        description: 'Cadete en camino por 24 de Septiembre hacia Barrio Norte',
      },
    ],
    estimatedDeliveryTime: '10-15 min',
    isDemoOrder: true,
  },
  {
    id: 'SMT-2026-7530',
    customer: {
      name: 'Jazmín Berdú',
      phone: '+54 381 482-9910',
      email: 'jazmin.berdu20@gmail.com',
    },
    deliveryAddress: {
      id: 'addr-1',
      alias: 'Departamento',
      street: 'Virgen de la Merced',
      number: '420',
      apartment: '4B',
      neighborhood: 'Barrio Norte',
      city: 'San Miguel de Tucumán',
      isDefault: true,
    },
    restaurantId: 'il-postino',
    restaurantName: 'Il Postino',
    items: [
      {
        productId: 'ilp-1',
        name: 'Pizza Especial Il Postino',
        price: 8900,
        quantity: 1,
      },
    ],
    subtotal: 8900,
    deliveryFee: 1400,
    serviceFee: 400,
    discount: 800,
    total: 9900,
    paymentMethod: 'tarjeta_online',
    paymentStatus: 'aprobado',
    status: 'entregado',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    statusHistory: [
      {
        status: 'recibido',
        timestamp: '20:15',
        description: 'Pedido recibido',
      },
      {
        status: 'confirmado',
        timestamp: '20:18',
        description: 'Il Postino confirmó la pizza',
      },
      {
        status: 'en_preparacion',
        timestamp: '20:25',
        description: 'En horno a la piedra',
      },
      {
        status: 'en_camino',
        timestamp: '20:45',
        description: 'Cadete despachado',
      },
      {
        status: 'entregado',
        timestamp: '20:58',
        description: 'Entregado en recepción del edificio',
      },
    ],
    estimatedDeliveryTime: 'Completado',
    isDemoOrder: true,
  },
];

const loadStoredOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(SEED_ORDERS));
      return SEED_ORDERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return SEED_ORDERS;
  }
};

const saveStoredOrders = (orders: Order[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  } catch (err) {
    console.error('Error saving orders to localStorage', err);
  }
};

/**
 * REST API Client Simulation for SaborTUC
 * Designed around:
 * - Consultar restaurantes y productos
 * - Consultar precios y disponibilidad
 * - Crear pedidos
 * - Consultar pedidos
 * - Consultar el estado de un pedido
 */
export const SaborTucApi = {
  /**
   * Operación 1: Consultar restaurantes con filtros
   */
  async getRestaurants(filters?: Partial<FilterParams>): Promise<Restaurant[]> {
    await new Promise((res) => setTimeout(res, 120)); // Small simulated async latency

    let result = [...RESTAURANTS_DATA];

    if (!filters) return result;

    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.neighborhood.toLowerCase().includes(q) ||
          r.address.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)) ||
          r.products.some((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      );
    }

    if (filters.category && filters.category !== 'Todas') {
      result = result.filter((r) => r.category === filters.category);
    }

    if (filters.neighborhood && filters.neighborhood !== 'Todos') {
      result = result.filter((r) => r.neighborhood === filters.neighborhood);
    }

    if (filters.onlyOpen) {
      result = result.filter((r) => r.isOpen);
    }

    if (filters.maxDeliveryFee) {
      result = result.filter((r) => r.deliveryFee <= filters.maxDeliveryFee!);
    }

    if (filters.priceRange && filters.priceRange.length > 0) {
      result = result.filter((r) => filters.priceRange!.includes(r.priceRange));
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'deliveryFee':
          result.sort((a, b) => a.deliveryFee - b.deliveryFee);
          break;
        case 'deliveryTime':
          result.sort(
            (a, b) =>
              parseInt(a.estimatedDeliveryTime) - parseInt(b.estimatedDeliveryTime)
          );
          break;
        case 'recommended':
        default:
          result.sort((a, b) => b.reviewsCount - a.reviewsCount);
          break;
      }
    }

    return result;
  },

  /**
   * Consultar restaurante individual por ID
   */
  async getRestaurantById(id: string): Promise<Restaurant | null> {
    await new Promise((res) => setTimeout(res, 80));
    const restaurant = RESTAURANTS_DATA.find((r) => r.id === id);
    return restaurant || null;
  },

  /**
   * Operación 2: Consultar productos y carta de un restaurante
   */
  async getProducts(restaurantId: string): Promise<Product[]> {
    await new Promise((res) => setTimeout(res, 80));
    const restaurant = RESTAURANTS_DATA.find((r) => r.id === restaurantId);
    return restaurant ? restaurant.products : [];
  },

  /**
   * Operación 3: Consultar precios y disponibilidad en tiempo real
   */
  async checkAvailability(
    restaurantId: string,
    productIds: string[]
  ): Promise<{
    available: boolean;
    restaurantOpen: boolean;
    unavailableProducts: string[];
    verifiedPrices: Record<string, number>;
  }> {
    await new Promise((res) => setTimeout(res, 100));
    const restaurant = RESTAURANTS_DATA.find((r) => r.id === restaurantId);

    if (!restaurant) {
      return {
        available: false,
        restaurantOpen: false,
        unavailableProducts: productIds,
        verifiedPrices: {},
      };
    }

    const unavailable: string[] = [];
    const verifiedPrices: Record<string, number> = {};

    productIds.forEach((pid) => {
      const p = restaurant.products.find((prod) => prod.id === pid);
      if (!p || !p.available) {
        unavailable.push(pid);
      } else {
        verifiedPrices[pid] = p.price;
      }
    });

    return {
      available: restaurant.isOpen && unavailable.length === 0,
      restaurantOpen: restaurant.isOpen,
      unavailableProducts: unavailable,
      verifiedPrices,
    };
  },

  /**
   * Operación 4: Crear pedido
   */
  async createOrder(
    orderPayload: Omit<Order, 'id' | 'createdAt' | 'status' | 'statusHistory'>
  ): Promise<Order> {
    await new Promise((res) => setTimeout(res, 250)); // Simulated processing time

    const newId = `SMT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrder: Order = {
      ...orderPayload,
      id: newId,
      createdAt: now.toISOString(),
      status: 'recibido',
      statusHistory: [
        {
          status: 'recibido',
          timestamp: timeStr,
          description: `Pedido ingresado con éxito en el sistema de ${orderPayload.restaurantName}`,
        },
      ],
      isDemoOrder: false,
    };

    const currentOrders = loadStoredOrders();
    const updated = [newOrder, ...currentOrders];
    saveStoredOrders(updated);

    return newOrder;
  },

  /**
   * Operación 5: Consultar pedidos
   */
  async getOrders(): Promise<Order[]> {
    await new Promise((res) => setTimeout(res, 100));
    return loadStoredOrders();
  },

  /**
   * Operación 6: Consultar el estado de un pedido
   */
  async getOrderStatus(orderId: string): Promise<Order | null> {
    await new Promise((res) => setTimeout(res, 80));
    const orders = loadStoredOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    // Simulation: if it's recently created and still in 'recibido', allow dynamic step progress
    const elapsedMinutes = (Date.now() - new Date(order.createdAt).getTime()) / 60000;
    if (!order.isDemoOrder && order.status !== 'entregado' && order.status !== 'cancelado') {
      let currentStatus: OrderStatus = order.status;
      const history = [...order.statusHistory];
      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (elapsedMinutes >= 1 && order.status === 'recibido') {
        currentStatus = 'confirmado';
        history.push({
          status: 'confirmado',
          timestamp: timeNow,
          description: 'Restaurante aceptó la comanda y asignó cadete',
        });
      } else if (elapsedMinutes >= 3 && order.status === 'confirmado') {
        currentStatus = 'en_preparacion';
        history.push({
          status: 'en_preparacion',
          timestamp: timeNow,
          description: 'Elaborando productos en cocina',
        });
      } else if (elapsedMinutes >= 6 && order.status === 'en_preparacion') {
        currentStatus = 'en_camino';
        history.push({
          status: 'en_camino',
          timestamp: timeNow,
          description: 'Cadete retiró el pedido y está en viaje hacia tu dirección',
        });
      }

      if (currentStatus !== order.status) {
        order.status = currentStatus;
        order.statusHistory = history;
        saveStoredOrders(orders);
      }
    }

    return order;
  },

  /**
   * Advance order status manually (helper for testing API states)
   */
  async advanceOrderStatus(orderId: string): Promise<Order | null> {
    const orders = loadStoredOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    const sequence: OrderStatus[] = [
      'recibido',
      'confirmado',
      'en_preparacion',
      'en_camino',
      'entregado',
    ];
    const currentIndex = sequence.indexOf(order.status);
    if (currentIndex >= 0 && currentIndex < sequence.length - 1) {
      const nextStatus = sequence[currentIndex + 1];
      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      order.status = nextStatus;

      const descriptions: Record<OrderStatus, string> = {
        recibido: 'Pedido registrado en SaborTUC',
        confirmado: 'Cocina confirmó la comanda',
        en_preparacion: 'Cocinando y empaquetando',
        en_camino: 'Cadete en moto en trayecto por San Miguel de Tucumán',
        entregado: 'Entregado en mano en el domicilio',
        cancelado: 'Cancelado',
      };

      order.statusHistory.push({
        status: nextStatus,
        timestamp: timeNow,
        description: descriptions[nextStatus],
      });
      saveStoredOrders(orders);
    }

    return order;
  },
};
