"use client";

export const getHeader = async () => {
  const token = await (globalThis as any)?.Clerk?.session?.getToken({ template: 'decky-api' });
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

export const getHeaderForFormData = async () => {
  const token = await (globalThis as any)?.Clerk?.session?.getToken({ template: 'decky-api' });
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};
