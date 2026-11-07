// Computer Galaxy API Client for Storefront and Admin Panel

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('cg_admin_token');
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('cg_admin_token', token);
  } else {
    localStorage.removeItem('cg_admin_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async loginAdmin(email: string, password: string) {
    const res = await request<{ success: boolean; token: string; user: any }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  async getAdminMe() {
    return request<{ success: boolean; user: any }>('/admin/me');
  },

  async logoutAdmin() {
    try {
      await request('/admin/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
    }
  },

  async updateAdminProfile(payload: { name?: string; currentPassword?: string; newPassword?: string }) {
    return request('/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // Dashboard Stats
  async getDashboardStats() {
    return request<{ success: boolean; stats: any; recentOrders: any[]; recentProducts: any[] }>('/admin/dashboard');
  },

  // Products
  async getProducts(category?: string, admin = false) {
    const query = new URLSearchParams();
    if (category && category !== 'all') query.append('category', category);
    if (admin) query.append('admin', 'true');
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ success: boolean; products: any[] }>(`/products${qs}`);
  },

  async getProductById(id: string) {
    return request<{ success: boolean; product: any }>(`/products/${id}`);
  },

  async createProduct(product: any) {
    return request<{ success: boolean; product: any; message: string }>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async updateProduct(id: string, product: any) {
    return request<{ success: boolean; product: any; message: string }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  async deleteProduct(id: string) {
    return request<{ success: boolean; message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Categories
  async getCategories(admin = false) {
    const qs = admin ? '?admin=true' : '';
    return request<{ success: boolean; categories: any[] }>(`/categories${qs}`);
  },

  async createCategory(cat: any) {
    return request<{ success: boolean; category: any; message: string }>('/categories', {
      method: 'POST',
      body: JSON.stringify(cat),
    });
  },

  async updateCategory(id: string, cat: any) {
    return request<{ success: boolean; category: any; message: string }>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cat),
    });
  },

  async deleteCategory(id: string) {
    return request<{ success: boolean; message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Banners
  async getBanners(admin = false) {
    const qs = admin ? '?admin=true' : '';
    return request<{ success: boolean; banners: any[] }>(`/banners${qs}`);
  },

  async createBanner(banner: any) {
    return request<{ success: boolean; banner: any; message: string }>('/banners', {
      method: 'POST',
      body: JSON.stringify(banner),
    });
  },

  async updateBanner(id: string, banner: any) {
    return request<{ success: boolean; banner: any; message: string }>(`/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(banner),
    });
  },

  async deleteBanner(id: string) {
    return request<{ success: boolean; message: string }>(`/banners/${id}`, {
      method: 'DELETE',
    });
  },

  // Sales
  async getSales(admin = false) {
    const qs = admin ? '?admin=true' : '';
    return request<{ success: boolean; sales: any[] }>(`/sales${qs}`);
  },

  async createSale(sale: any) {
    return request<{ success: boolean; sale: any; message: string }>('/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    });
  },

  async updateSale(id: string, sale: any) {
    return request<{ success: boolean; sale: any; message: string }>(`/sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sale),
    });
  },

  async deleteSale(id: string) {
    return request<{ success: boolean; message: string }>(`/sales/${id}`, {
      method: 'DELETE',
    });
  },

  // Orders
  async getOrders(params?: { status?: string; paymentStatus?: string; search?: string }) {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<{ success: boolean; orders: any[]; total: number }>(`/orders${qs}`);
  },

  async createOrder(orderData: any) {
    return request<{ success: boolean; order: any; message: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async trackOrder(query: string) {
    return request<{ success: boolean; orders: any[] }>(`/orders/track/${encodeURIComponent(query)}`);
  },

  async updateOrder(id: string, updates: any) {
    return request<{ success: boolean; order: any; message: string }>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Customers
  async getCustomers() {
    return request<{ success: boolean; customers: any[] }>('/customers');
  },

  // Content
  async getContent(admin = false) {
    const qs = admin ? '?admin=true' : '';
    return request<{ success: boolean; content: any }>(`/content${qs}`);
  },

  async updateContentSection(section: string, payload: any) {
    return request<{ success: boolean; content: any; message: string }>(`/content/${section}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // Settings
  async getSettings(admin = false) {
    const qs = admin ? '?admin=true' : '';
    return request<{ success: boolean; settings: any }>(`/settings${qs}`);
  },

  async updateSettings(payload: any) {
    return request<{ success: boolean; settings: any; message: string }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // Publish to Public Website (Staging & Live Release)
  async getPublishStatus() {
    return request<{
      success: boolean;
      hasUnpublishedChanges: boolean;
      pendingChangesCount: number;
      lastPublishedAt: string | null;
      publishedBy: string | null;
    }>('/admin/publish-status');
  },

  async publishChanges() {
    return request<{ success: boolean; message: string; publishedAt: string }>('/admin/publish', {
      method: 'POST',
    });
  },

  async discardDraftChanges() {
    return request<{ success: boolean; message: string }>('/admin/discard-draft', {
      method: 'POST',
    });
  },

  // Media Library
  async getMedia() {
    return request<{ success: boolean; media: any[] }>('/media');
  },

  async uploadMedia(base64Data: string, filename: string, mimeType?: string) {
    return request<{ success: boolean; url: string; media: any; message: string }>('/media/upload', {
      method: 'POST',
      body: JSON.stringify({ base64Data, filename, mimeType }),
    });
  },

  async deleteMedia(id: string) {
    return request<{ success: boolean; message: string }>(`/media/${id}`, {
      method: 'DELETE',
    });
  },
};
