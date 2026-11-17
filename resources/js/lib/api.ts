/**
 * Customer SPA API Client for MediStock /api/v1
 *
 * Utilizes same-domain Sanctum session cookies (CSRF + session).
 * No tokens stored in localStorage.
 */

function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return decodeURIComponent(parts.pop()!.split(';').shift()!);
    }
    return null;
}

let csrfFetched = false;

async function ensureCsrf(): Promise<void> {
    if (!csrfFetched) {
        await fetch('/sanctum/csrf-cookie', { credentials: 'include' });
        csrfFetched = true;
    }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const method = (options.method || 'GET').toUpperCase();

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        await ensureCsrf();
    }

    const xsrfToken = getCookie('XSRF-TOKEN');

    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (xsrfToken) {
        headers['X-XSRF-TOKEN'] = xsrfToken;
    }

    const response = await fetch(endpoint, {
        ...options,
        credentials: 'include',
        headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const error = new Error(data?.message || `Request failed with status ${response.status}`);
        (error as any).status = response.status;
        (error as any).errors = data?.errors;
        throw error;
    }

    return data as T;
}

export interface CustomerUser {
    id: number;
    name: string;
    email: string;
    phone?: string;
    email_verified: boolean;
    email_verified_at?: string;
    created_at?: string;
}

export interface ApiCategory {
    id: number;
    name: string;
}

export interface ApiMedicine {
    id: number;
    name: string;
    description: string;
    selling_price: number;
    available_qty: number;
    stock_limit: number;
    medicine_barcode: string;
    category_id: number;
    category_name?: string;
    image_url?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ApiOrderItem {
    id: number;
    medicine_id: number;
    medicine_name?: string;
    qty: number;
    price: number;
    subtotal: number;
}

export interface ApiOrder {
    id: number;
    order_no: string;
    total: number;
    status: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    payment_method: string;
    transaction_id?: string;
    reserved_at?: string;
    reservation_expires_at?: string;
    cancelled_at?: string;
    cancellation_reason?: string;
    created_at?: string;
    items?: ApiOrderItem[];
}

export interface PaginatedResponse<T> {
    data: T[];
    links: {
        first: string;
        last: string;
        prev?: string;
        next?: string;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        per_page: number;
        to: number;
        total: number;
    };
}

export const api = {
    auth: {
        async register(data: { name: string; email: string; password: string; password_confirmation: string; phone?: string }) {
            return request<{ message: string; customer: CustomerUser }>('/api/v1/auth/register', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },

        async login(data: { email: string; password: string; remember?: boolean }) {
            return request<{ message: string; customer: CustomerUser }>('/api/v1/auth/login', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },

        async logout() {
            return request<{ message: string }>('/api/v1/auth/logout', {
                method: 'POST',
            });
        },

        async me() {
            return request<{ customer: CustomerUser }>('/api/v1/auth/me');
        },

        async forgotPassword(email: string) {
            return request<{ message: string }>('/api/v1/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email }),
            });
        },

        async resetPassword(data: { token: string; email: string; password: string; password_confirmation: string }) {
            return request<{ message: string }>('/api/v1/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },
    },

    catalog: {
        async getProducts(params: { page?: number; per_page?: number; search?: string; category_id?: number; sort?: string } = {}) {
            const query = new URLSearchParams();
            if (params.page) query.set('page', params.page.toString());
            if (params.per_page) query.set('per_page', params.per_page.toString());
            if (params.search) query.set('search', params.search);
            if (params.category_id) query.set('category_id', params.category_id.toString());
            if (params.sort) query.set('sort', params.sort);

            const queryString = query.toString();
            const url = `/api/v1/products${queryString ? `?${queryString}` : ''}`;
            return request<PaginatedResponse<ApiMedicine>>(url);
        },

        async getProduct(id: number) {
            return request<{ data: ApiMedicine }>(`/api/v1/products/${id}`);
        },

        async getCategories() {
            return request<{ data: ApiCategory[] }>('/api/v1/categories');
        },
    },

    orders: {
        async getOrders() {
            return request<{ data: ApiOrder[] }>('/api/v1/orders');
        },

        async getOrder(id: number) {
            return request<{ data: ApiOrder }>(`/api/v1/orders/${id}`);
        },

        async placeOrder(payload: {
            items: { id: number; qty: number }[];
            name: string;
            email: string;
            phone: string;
            address: string;
            payment_method: string;
            transaction_id?: string;
        }) {
            return request<{ message: string; data: ApiOrder }>('/api/v1/orders', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
        },
    },
};

