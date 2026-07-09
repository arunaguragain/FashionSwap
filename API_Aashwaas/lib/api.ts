"use client";

export async function fetchJSON(path: string, opts: RequestInit = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });

  const text = await res.text();
  let data: any = undefined;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch (e) {
    // not JSON
  }

  if (!res.ok) {
    // Normalize common validation error shapes into an object map { field: message }
    let normalized = data;
    try {
      if (data && data.errors) {
        const errs = data.errors;
        if (Array.isArray(errs)) {
          const obj: Record<string, string> = {};
          errs.forEach((it: any) => {
            if (!it) return;
            // common shapes: { field, message } or { param, msg } or string
            if (typeof it === 'string') {
              obj._error = obj._error ? obj._error + '; ' + it : it;
            } else if (typeof it === 'object') {
              const key = it.field || it.param || it.path || '_error';
              const msg = it.message || it.msg || it.detail || JSON.stringify(it);
              obj[key] = obj[key] ? obj[key] + '; ' + msg : msg;
            }
          });
          normalized = { ...data, errors: obj };
        } else if (typeof errs === 'string') {
          normalized = { ...data, errors: { _error: errs } };
        } else if (typeof errs === 'object') {
          // assume already map
          normalized = data;
        }
      }
    } catch (e) {
      normalized = data;
    }

    const err = new Error((normalized && (normalized.message || normalized.error)) || res.statusText);
    (err as any).status = res.status;
    (err as any).data = normalized;
    throw err;
  }

  return data;
}

// Listings
export function getListings(query = '', filters: Record<string, unknown> = {}) {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.set(key, String(value));
  });
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return fetchJSON(`/api/listings${suffix}`);
}

export function getListing(id: string) {
  return fetchJSON(`/api/listings/${id}`);
}

export function createListing(payload: any) {
  return fetchJSON('/api/listings', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });
}

export function createOrder(payload: any) {
  return fetchJSON('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });
}

export function getOrders() {
  return fetchJSON('/api/orders');
}

export function getMyListings() {
  return fetchJSON('/api/listings/user/my-listings');
}

export function getTransactionByOrderId(orderId: string) {
  return fetchJSON(`/api/transactions/order/${orderId}`);
}

export function confirmDelivery(transactionId: string) {
  return fetchJSON(`/api/transactions/${transactionId}/confirm-delivery`, { method: 'PUT' });
}

export function confirmHandover(transactionId: string) {
  return fetchJSON(`/api/transactions/${transactionId}/confirm-handover`, { method: 'PUT' });
}

// Auth
export function login(email: string, password: string) {
  return fetchJSON('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export function register(name: string, email: string, password: string) {
  return fetchJSON('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
}

export function verifyOtp(code: string) {
  return fetchJSON('/api/auth/mfa/verify', { method: 'POST', body: JSON.stringify({ code }) });
}
