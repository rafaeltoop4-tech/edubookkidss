import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { z } from 'https://esm.sh/zod@3.23.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

const productSchema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(200, 'Título muito longo'),
  description: z.string().max(5000).nullable().optional(),
  price: z.number().min(0, 'Preço não pode ser negativo').max(999999).default(0),
  stock: z.number().int().min(0).default(9999),
  show_stock: z.boolean().default(true),
  images: z.array(z.string().url()).max(10).default([]),
  tags: z.array(z.string().max(50)).max(20).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  pdf_url: z.string().max(500).nullable().optional(),
  page_count: z.number().int().min(0).nullable().optional(),
  file_format: z.string().max(20).default('PDF'),
  file_size_mb: z.number().min(0).nullable().optional(),
  paper_format: z.string().max(20).default('A4'),
  show_technical_info: z.boolean().default(false),
  age_range: z.string().max(50).nullable().optional(),
  is_accessible: z.boolean().default(false),
  show_accessibility: z.boolean().default(false),
})

const updateSchema = productSchema.partial()

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function validateAdminJWT(authHeader: string | null, supabaseUrl: string, supabaseAnonKey: string): Promise<boolean> {
  if (!authHeader) return false
  
  try {
    const token = authHeader.replace('Bearer ', '')
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    })
    
    const { data: { user }, error } = await userClient.auth.getUser()
    if (error || !user) return false
    
    const serviceClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: roleData } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()
    
    return !!roleData
  } catch {
    return false
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const authHeader = req.headers.get('authorization')
    const isAdmin = await validateAdminJWT(authHeader, supabaseUrl, supabaseAnonKey)
    
    if (!isAdmin) {
      return jsonResponse({ error: 'Unauthorized - Admin access required' }, 401)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const url = new URL(req.url)
    const method = req.method

    // GET - List all products (exclude pdf_url for security)
    if (method === 'GET') {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return jsonResponse({ products: data })
    }

    // POST - Create product with validation
    if (method === 'POST') {
      const body = await req.json()
      const parsed = productSchema.safeParse(body)
      
      if (!parsed.success) {
        return jsonResponse({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, 400)
      }

      const { data, error } = await supabase
        .from('products')
        .insert(parsed.data)
        .select()
        .single()

      if (error) throw error
      return jsonResponse({ product: data }, 201)
    }

    // PUT - Update product with validation
    if (method === 'PUT') {
      const productId = url.searchParams.get('id')
      if (!productId) return jsonResponse({ error: 'Product ID required' }, 400)

      // Validate UUID format
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)) {
        return jsonResponse({ error: 'Invalid product ID format' }, 400)
      }

      const body = await req.json()
      const parsed = updateSchema.safeParse(body)
      
      if (!parsed.success) {
        return jsonResponse({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }, 400)
      }

      const { data, error } = await supabase
        .from('products')
        .update(parsed.data)
        .eq('id', productId)
        .select()
        .single()

      if (error) throw error
      return jsonResponse({ product: data })
    }

    // DELETE - Delete product
    if (method === 'DELETE') {
      const productId = url.searchParams.get('id')
      if (!productId) return jsonResponse({ error: 'Product ID required' }, 400)

      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)) {
        return jsonResponse({ error: 'Invalid product ID format' }, 400)
      }

      await supabase.from('product_metrics').delete().eq('product_id', productId)
      await supabase.from('product_reviews').delete().eq('product_id', productId)
      
      const { error } = await supabase.from('products').delete().eq('id', productId)
      if (error) throw error

      return jsonResponse({ success: true })
    }

    return jsonResponse({ error: 'Method not allowed' }, 405)

  } catch (error: unknown) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return jsonResponse({ error: errorMessage }, 500)
  }
})
