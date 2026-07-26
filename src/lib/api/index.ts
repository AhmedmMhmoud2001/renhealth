export * from "./client";
export * from "./types";

import {
  apiFetch,
  toQuery,
  unwrapData,
  unwrapList,
  unwrapPaginated,
} from "./client";
import type {
  Address,
  AuthPayload,
  Brand,
  Cart,
  Category,
  CheckoutPayload,
  CmsPage,
  Goal,
  JournalArticle,
  Offer,
  Order,
  Product,
  ProductsQuery,
  Slider,
  StoreConfig,
  User,
  Notification,
  TicketMessage,
  SupportChat,
  SupportChatMessage,
  RefundRequest,
  Coupon,
  WalletTransaction,
} from "./types";

export const api = {
  // Auth
  login: (body: { login: string; password: string }) =>
    apiFetch("/api/v1/auth/login", { method: "POST", json: body, revalidate: false }),
  register: (body: {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
  }) =>
    apiFetch("/api/v1/auth/register", { method: "POST", json: body, revalidate: false }),
  logout: () =>
    apiFetch("/api/v1/auth/logout", { method: "POST", revalidate: false }),
  me: () => apiFetch("/api/v1/auth/user", { revalidate: false }),
  verifyEmail: (body: { email: string; code: string }) =>
    apiFetch("/api/v1/auth/verify-email", { method: "POST", json: body, revalidate: false }),
  verifyPhone: (body: { phone: string; code: string }) =>
    apiFetch("/api/v1/auth/verify-phone", { method: "POST", json: body, revalidate: false }),
  resendVerification: (body: Record<string, string>) =>
    apiFetch("/api/v1/auth/resend-verification-code", {
      method: "POST",
      json: body,
      revalidate: false,
    }),
  resetSendCode: (body: { email: string }) =>
    apiFetch("/api/v1/auth/reset-password/send-code", {
      method: "POST",
      json: body,
      revalidate: false,
    }),
  resetVerifyCode: (body: { email: string; code: string }) =>
    apiFetch("/api/v1/auth/reset-password/verify-code", {
      method: "POST",
      json: body,
      revalidate: false,
    }),
  resetSetPassword: (body: {
    reset_token: string;
    password: string;
    password_confirmation: string;
  }) =>
    apiFetch("/api/v1/auth/reset-password/set-new-password", {
      method: "POST",
      json: body,
      revalidate: false,
    }),
  updateFcmToken: (body: { fcm_token: string }) =>
    apiFetch("/api/v1/update-fcm-token", { method: "POST", json: body, revalidate: false }),

  // Profile
  profile: () => apiFetch("/api/v1/profile", { revalidate: false }),
  updateProfile: (body: FormData | Record<string, unknown>) =>
    body instanceof FormData
      ? apiFetch("/api/v1/profile", { method: "POST", formData: body, revalidate: false })
      : apiFetch("/api/v1/profile", { method: "POST", json: body, revalidate: false }),

  // Catalog
  storeConfig: () => apiFetch("/api/v1/store/config"),
  categories: () => apiFetch("/api/v1/categories"),
  category: (id: string | number) => apiFetch(`/api/v1/categories/${id}`),
  categoryTree: () => apiFetch("/api/v1/categories/tree"),
  brands: () => apiFetch("/api/v1/brands"),
  brand: (id: string | number) => apiFetch(`/api/v1/brands/${id}`),
  sliders: (type = "home") => apiFetch(`/api/v1/sliders${toQuery({ type })}`),
  products: (query: ProductsQuery = {}) =>
    apiFetch(`/api/v1/products${toQuery(query)}`),
  product: (id: string | number) => apiFetch(`/api/v1/products/${id}`),
  productBySlug: (slug: string) =>
    apiFetch(`/api/v1/products/slug/${encodeURIComponent(slug)}`),
  rateProduct: (productId: string | number, body: { rating: number; comment?: string }) =>
    apiFetch(`/api/v1/products/${productId}/rate`, {
      method: "POST",
      json: body,
      revalidate: false,
    }),
  reportProduct: (productId: string | number, body: Record<string, unknown>) =>
    apiFetch(`/api/v1/products/${productId}/report`, {
      method: "POST",
      json: body,
      revalidate: false,
    }),
  offers: () => apiFetch("/api/v1/offers"),
  offer: (id: string | number) => apiFetch(`/api/v1/offers/${id}`),
  coupons: () => apiFetch("/api/v1/coupons"),
  zones: () => apiFetch("/api/v1/zones"),
  goals: () => apiFetch("/api/v1/goals"),
  branches: () => apiFetch("/api/v1/branches"),
  branch: (id: string | number) => apiFetch(`/api/v1/branches/${id}`),

  // Wishlist
  wishlist: () => apiFetch("/api/v1/wishlist", { revalidate: false }),
  toggleWishlist: (productId: string | number) =>
    apiFetch(`/api/v1/wishlist/${productId}`, { method: "POST", revalidate: false }),
  toggleOfferWishlist: (offerId: string | number) =>
    apiFetch(`/api/v1/wishlist/offers/${offerId}`, {
      method: "POST",
      revalidate: false,
    }),

  // Addresses
  addresses: () => apiFetch("/api/v1/addresses", { revalidate: false }),
  address: (id: string | number) =>
    apiFetch(`/api/v1/addresses/${id}`, { revalidate: false }),
  createAddress: (body: Omit<Address, "id"> | Record<string, unknown>) =>
    apiFetch("/api/v1/addresses", { method: "POST", json: body, revalidate: false }),
  updateAddress: (id: string | number, body: Record<string, unknown>) =>
    apiFetch(`/api/v1/addresses/${id}`, { method: "PUT", json: body, revalidate: false }),
  deleteAddress: (id: string | number) =>
    apiFetch(`/api/v1/addresses/${id}`, { method: "DELETE", revalidate: false }),

  // Cart
  cart: () => apiFetch("/api/v1/cart", { revalidate: false }),
  addToCart: (
    productId: string | number,
    body: {
      quantity: number;
      variant_id?: number | string | null;
      unit_id?: number | string | null;
    } = { quantity: 1 },
  ) =>
    apiFetch(`/api/v1/cart/${productId}`, {
      method: "POST",
      json: body,
      revalidate: false,
    }),
  updateCartItem: (
    productId: string | number,
    body: { quantity: number; variant_id?: number | string | null },
  ) =>
    apiFetch(`/api/v1/cart/${productId}`, {
      method: "PUT",
      json: body,
      revalidate: false,
    }),
  updateCartItemById: (
    cartItemId: string | number,
    body: { quantity: number; variant_id?: number | string | null },
  ) =>
    apiFetch(`/api/v1/cart/items/${cartItemId}`, {
      method: "PUT",
      json: body,
      revalidate: false,
    }),
  removeFromCart: (productId: string | number) =>
    apiFetch(`/api/v1/cart/${productId}`, { method: "DELETE", revalidate: false }),
  clearCart: () =>
    apiFetch("/api/v1/cart", { method: "DELETE", revalidate: false }),
  applyCoupon: (code: string) =>
    apiFetch("/api/v1/cart/apply-coupon", {
      method: "POST",
      json: { code },
      revalidate: false,
    }),
  checkoutPreview: () =>
    apiFetch("/api/v1/cart/checkout-preview", { revalidate: false }),

  // Orders — JSON so item_notes is a real array (FormData was sending a string)
  checkout: (payload: CheckoutPayload) => {
    const body: Record<string, unknown> = {
      address_id: Number(payload.address_id) || payload.address_id,
      shipping_day: payload.shipping_day,
      is_fast_shipping: Boolean(
        payload.is_fast_shipping === true ||
          payload.is_fast_shipping === "true" ||
          payload.is_fast_shipping === 1 ||
          payload.is_fast_shipping === "1",
      ),
      payment_method: payload.payment_method,
      use_wallet: Boolean(
        payload.use_wallet === true ||
          payload.use_wallet === "true" ||
          payload.use_wallet === 1 ||
          payload.use_wallet === "1",
      ),
      notes: payload.notes ?? "",
      item_notes: Array.isArray(payload.item_notes) ? payload.item_notes : [],
    };
    if (payload.coupon_code) body.coupon_code = payload.coupon_code;
    if (payload.offer_code) body.offer_code = payload.offer_code;
    if (payload.gift_offer_id) body.gift_offer_id = payload.gift_offer_id;
    if (payload.gift_product_id) body.gift_product_id = payload.gift_product_id;

    return apiFetch("/api/v1/orders", {
      method: "POST",
      json: body,
      revalidate: false,
    });
  },
  orders: () => apiFetch("/api/v1/orders", { revalidate: false }),
  order: (id: string | number) =>
    apiFetch(`/api/v1/orders/${id}`, { revalidate: false }),
  payOrder: (id: string | number, body?: { payment_method?: string; payment_proof?: File }) => {
    if (body?.payment_proof) {
      const fd = new FormData();
      fd.append("payment_method", body.payment_method || "online");
      fd.append("payment_proof", body.payment_proof);
      return apiFetch(`/api/v1/orders/${id}/pay`, { method: "POST", formData: fd, revalidate: false });
    }
    return apiFetch(`/api/v1/orders/${id}/pay`, {
      method: "POST",
      json: body ? { payment_method: body.payment_method } : {},
      revalidate: false,
    });
  },
  cancelOrder: (id: string | number) =>
    apiFetch(`/api/v1/orders/${id}/cancel`, { method: "POST", revalidate: false }),
  reorder: (id: string | number) =>
    apiFetch(`/api/v1/orders/${id}/reorder`, { method: "POST", revalidate: false }),
  refundRequest: (id: string | number, body?: Record<string, unknown>) =>
    apiFetch(`/api/v1/orders/${id}/refund-request`, {
      method: "POST",
      json: body ?? {},
      revalidate: false,
    }),
  rateOrder: (id: string | number, body: { rating: number; comment?: string }) =>
    apiFetch(`/api/v1/orders/${id}/rate`, {
      method: "POST",
      json: body,
      revalidate: false,
    }),
  refundRequests: () => apiFetch("/api/v1/refund-requests", { revalidate: false }),

  // Wallet / support / notifications
  walletHistory: () => apiFetch("/api/v1/wallet/history", { revalidate: false }),
  tickets: () => apiFetch("/api/v1/tickets", { revalidate: false }),
  createTicket: (body: FormData | Record<string, unknown>) => {
    if (body instanceof FormData) {
      return apiFetch("/api/v1/tickets", { method: "POST", formData: body, revalidate: false });
    }
    const fd = new FormData();
    if (body.subject) fd.append("subject", String(body.subject));
    if (body.description) fd.append("description", String(body.description));
    if (body.type) fd.append("type", String(body.type));
    if (Array.isArray(body.attachments)) {
      (body.attachments as File[]).forEach((file, i) => {
        fd.append(`attachment[${i}]`, file);
      });
    }
    return apiFetch("/api/v1/tickets", { method: "POST", formData: fd, revalidate: false });
  },
  ticket: (id: string | number) =>
    apiFetch(`/api/v1/tickets/${id}`, { revalidate: false }),
  notifications: () => apiFetch("/api/v1/notifications", { revalidate: false }),
  markAllNotificationsRead: () =>
    apiFetch("/api/v1/notifications/mark-all-read", {
      method: "POST",
      revalidate: false,
    }),
  markNotificationRead: (id: string | number) =>
    apiFetch(`/api/v1/notifications/${id}/read`, { method: "POST", revalidate: false }),

  // Tickets - messaging
  updateTicket: (id: string | number, body: Record<string, unknown>) =>
    apiFetch(`/api/v1/tickets/${id}`, { method: "PUT", json: body, revalidate: false }),
  ticketMessages: (id: string | number) =>
    apiFetch(`/api/v1/tickets/${id}/messages`, { revalidate: false }),
  createTicketMessage: (id: string | number, body: { message: string }) =>
    apiFetch(`/api/v1/tickets/${id}/messages`, { method: "POST", json: body, revalidate: false }),

  // Support Chat
  supportChats: () => apiFetch("/api/v1/support-chats", { revalidate: false }),
  supportChat: (id: string | number) =>
    apiFetch(`/api/v1/support-chats/${id}`, { revalidate: false }),
  createSupportChat: (body: { subject: string; message: string }) =>
    apiFetch("/api/v1/support-chats", { method: "POST", json: body, revalidate: false }),
  supportChatMessages: (id: string | number) =>
    apiFetch(`/api/v1/support-chats/${id}/messages`, { revalidate: false }),
  createSupportChatMessage: (id: string | number, body: { message: string }) =>
    apiFetch(`/api/v1/support-chats/${id}/messages`, { method: "POST", json: body, revalidate: false }),

  // Broadcasting
  broadcastingAuth: (body: { channel_name: string; socket_id: string }) =>
    apiFetch("/api/v1/broadcasting/auth", { method: "POST", json: body, revalidate: false }),

  // CMS Pages
  cmsPage: (slug: string) =>
    apiFetch(`/api/v1/pages/${encodeURIComponent(slug)}`),
  journal: (query?: { per_page?: number; page?: number }) =>
    apiFetch(`/api/v1/journal${toQuery(query ?? {})}`),
  journalArticle: (slug: string) =>
    apiFetch(`/api/v1/journal/${encodeURIComponent(slug)}`),
};

export async function fetchProducts(query: ProductsQuery = {}) {
  const res = await api.products(query);
  if (!res.ok) return { ok: false as const, error: res.error, items: [] as Product[], meta: undefined };
  const page = unwrapPaginated<Product>(res.data);
  return { ok: true as const, items: page.data, meta: page.meta, raw: res.data };
}

export async function fetchProductBySlugOrId(slugOrId: string) {
  const bySlug = await api.productBySlug(slugOrId);
  if (bySlug.ok) {
    return { ok: true as const, product: unwrapData<Product>(bySlug.data) };
  }
  const byId = await api.product(slugOrId);
  if (byId.ok) {
    return { ok: true as const, product: unwrapData<Product>(byId.data) };
  }
  return { ok: false as const, error: bySlug.error || byId.error };
}

export async function fetchBrands() {
  const res = await api.brands();
  if (!res.ok) return { ok: false as const, error: res.error, items: [] as Brand[] };
  return { ok: true as const, items: unwrapList<Brand>(res.data) };
}

export async function fetchGoals() {
  const res = await api.goals();
  if (!res.ok) return { ok: false as const, error: res.error, items: [] as Goal[] };
  return { ok: true as const, items: unwrapList<Goal>(res.data) };
}

export async function fetchCategories() {
  const res = await api.categories();
  if (!res.ok) return { ok: false as const, error: res.error, items: [] as Category[] };
  return { ok: true as const, items: unwrapList<Category>(res.data) };
}

export async function fetchSliders(type = "home") {
  const res = await api.sliders(type);
  if (!res.ok) return { ok: false as const, error: res.error, items: [] as Slider[] };
  return { ok: true as const, items: unwrapList<Slider>(res.data) };
}

export async function fetchCart() {
  const res = await api.cart();
  if (!res.ok) return { ok: false as const, error: res.error, cart: null as Cart | null };
  return { ok: true as const, cart: unwrapData<Cart>(res.data) };
}

export function extractAuthToken(payload: unknown): string | null {
  const data = unwrapData<AuthPayload>(payload);
  if (!data || typeof data !== "object") return null;
  return data.token || data.access_token || null;
}

export function extractUser(payload: unknown): User | null {
  const data = unwrapData<AuthPayload | User>(payload);
  if (!data || typeof data !== "object") return null;
  if ("user" in data && data.user) return data.user as User;
  if ("id" in data && ("email" in data || "name" in data)) return data as User;
  return null;
}

export async function fetchCmsPage(slug: string) {
  const res = await api.cmsPage(slug);
  if (!res.ok) return { ok: false as const, error: res.error, page: null as CmsPage | null };
  return { ok: true as const, page: unwrapData<CmsPage>(res.data) };
}

export async function fetchJournalArticles(query?: { per_page?: number; page?: number }) {
  const res = await api.journal(query);
  if (!res.ok) return { ok: false as const, error: res.error, items: [] as JournalArticle[], meta: undefined };
  const page = unwrapPaginated<JournalArticle>(res.data);
  return { ok: true as const, items: page.data, meta: page.meta };
}

export async function fetchJournalArticle(slug: string) {
  const res = await api.journalArticle(slug);
  if (!res.ok) return { ok: false as const, error: res.error, article: null as JournalArticle | null };
  return { ok: true as const, article: unwrapData<JournalArticle>(res.data) };
}
