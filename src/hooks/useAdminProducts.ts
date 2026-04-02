import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  stock: number;
  show_stock: boolean;
  images: string[];
  tags: string[];
  featured: boolean;
  active: boolean;
  pdf_url: string | null;
  page_count: number | null;
  file_format: string | null;
  file_size_mb: number | null;
  paper_format: string | null;
  show_technical_info: boolean;
  age_range: string | null;
  is_accessible: boolean;
  show_accessibility: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  title: string;
  description?: string | null;
  price?: number;
  stock?: number;
  show_stock?: boolean;
  images?: string[];
  tags?: string[];
  featured?: boolean;
  active?: boolean;
  pdf_url?: string | null;
  page_count?: number | null;
  file_format?: string | null;
  file_size_mb?: number | null;
  paper_format?: string | null;
  show_technical_info?: boolean;
  age_range?: string | null;
  is_accessible?: boolean;
  show_accessibility?: boolean;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token || ''}`,
    'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
}

async function edgeFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = `${SUPABASE_URL}/functions/v1/${path}`;
  const headers = await getAuthHeaders();
  return fetch(url, { ...options, headers: { ...headers, ...options.headers } });
}

export function useAdminProducts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAuthStore();

  const fetchProducts = useCallback(async (): Promise<Product[]> => {
    if (!isAdmin) return [];
    setLoading(true);
    setError(null);
    try {
      const response = await edgeFetch('admin-products', { method: 'GET' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to fetch products');
      }
      const data = await response.json();
      return data?.products || [];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const createProduct = useCallback(async (product: ProductInput): Promise<Product | null> => {
    if (!isAdmin) return null;
    setLoading(true);
    setError(null);
    try {
      const response = await edgeFetch('admin-products', { method: 'POST', body: JSON.stringify(product) });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to create product');
      }
      const data = await response.json();
      return data?.product || null;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const updateProduct = useCallback(async (id: string, product: Partial<ProductInput>): Promise<Product | null> => {
    if (!isAdmin) return null;
    setLoading(true);
    setError(null);
    try {
      const response = await edgeFetch(`admin-products?id=${id}`, { method: 'PUT', body: JSON.stringify(product) });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to update product');
      }
      const data = await response.json();
      return data?.product || null;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    if (!isAdmin) return false;
    setLoading(true);
    setError(null);
    try {
      const response = await edgeFetch(`admin-products?id=${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to delete product');
      }
      const data = await response.json();
      return data?.success === true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
      return publicUrl;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    }
  }, []);

  const deleteImage = useCallback(async (imageUrl: string): Promise<boolean> => {
    try {
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/product-images/');
      if (pathParts.length < 2) return true;
      const filePath = pathParts[1];
      const { error } = await supabase.storage.from('product-images').remove([filePath]);
      if (error) throw error;
      return true;
    } catch (err: unknown) {
      console.error('Error deleting image:', err);
      return false;
    }
  }, []);

  return { loading, error, fetchProducts, createProduct, updateProduct, deleteProduct, uploadImage, deleteImage };
}
