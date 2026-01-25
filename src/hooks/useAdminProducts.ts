import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

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

// Get credentials from a function to avoid storing in global scope
function getAdminCredentials(): string {
  // These are validated server-side in the edge function
  const credentials = btoa('Prooadmin:Rafa31200');
  return `Admin ${credentials}`;
}

export function useAdminProducts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAuthStore();

  const getAuthHeader = useCallback(() => {
    return getAdminCredentials();
  }, []);

  const fetchProducts = useCallback(async (): Promise<Product[]> => {
    if (!isAdmin) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await supabase.functions.invoke('admin-products', {
        method: 'GET',
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      if (response.error) {
        console.error('Fetch error:', response.error);
        throw new Error(response.error.message);
      }
      
      return response.data?.products || [];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('fetchProducts error:', message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAdmin, getAuthHeader]);

  const createProduct = useCallback(async (product: ProductInput): Promise<Product | null> => {
    if (!isAdmin) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await supabase.functions.invoke('admin-products', {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
        },
        body: product,
      });

      if (response.error) {
        console.error('Create error:', response.error);
        throw new Error(response.error.message);
      }
      
      return response.data?.product || null;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('createProduct error:', message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAdmin, getAuthHeader]);

  const updateProduct = useCallback(async (id: string, product: Partial<ProductInput>): Promise<Product | null> => {
    if (!isAdmin) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await supabase.functions.invoke(`admin-products?id=${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': getAuthHeader(),
        },
        body: product,
      });

      if (response.error) {
        console.error('Update error:', response.error);
        throw new Error(response.error.message);
      }
      
      return response.data?.product || null;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('updateProduct error:', message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAdmin, getAuthHeader]);

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    if (!isAdmin) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await supabase.functions.invoke(`admin-products?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      if (response.error) {
        console.error('Delete error:', response.error);
        throw new Error(response.error.message);
      }
      
      return response.data?.success === true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('deleteProduct error:', message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAdmin, getAuthHeader]);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('uploadImage error:', message);
      return null;
    }
  }, []);

  const deleteImage = useCallback(async (imageUrl: string): Promise<boolean> => {
    try {
      // Extract file path from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/product-images/');
      if (pathParts.length < 2) return true; // Not a storage URL

      const filePath = pathParts[1];

      const { error } = await supabase.storage
        .from('product-images')
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (err: unknown) {
      console.error('Error deleting image:', err);
      return false;
    }
  }, []);

  return {
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    deleteImage,
  };
}