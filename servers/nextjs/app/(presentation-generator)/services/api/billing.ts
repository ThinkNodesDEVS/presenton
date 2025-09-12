export const BillingApi = {
  async startCheckout(plan: 'starter' | 'pro', interval: 'month' | 'year') {
    const headers = await (await import('./header')).getHeader();
    const base = (process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '')) || (typeof window !== 'undefined' ? window.location.origin : '');
    const res = await fetch(`${base}/api/v1/ppt/billing/checkout-session`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ plan, interval })
    });
    if (!res.ok) throw new Error('Failed to create checkout session');
    const data = await res.json();
    return data.url as string;
  },
  async openPortal() {
    const headers = await (await import('./header')).getHeader();
    const base = (process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '')) || (typeof window !== 'undefined' ? window.location.origin : '');
    const res = await fetch(`${base}/api/v1/ppt/billing/portal-session`, {
      method: 'POST',
      headers
    });
    if (!res.ok) throw new Error('Failed to create portal session');
    const data = await res.json();
    return data.url as string;
  }
};

