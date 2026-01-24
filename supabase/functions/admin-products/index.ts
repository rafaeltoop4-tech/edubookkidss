import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Admin credentials (should match authStore)
const ADMIN_USERNAME = 'Prooadmin'
const ADMIN_PASSWORD = 'Rafa31200'

function validateAdmin(authHeader: string | null): boolean {
  if (!authHeader) return false
  
  try {
    // Expected format: "Admin base64(username:password)"
    const [type, credentials] = authHeader.split(' ')
    if (type !== 'Admin') return false
    
    const decoded = atob(credentials)
    const [username, password] = decoded.split(':')
    
    return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
  } catch {
    return false
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate admin authentication
    const authHeader = req.headers.get('authorization')
    if (!validateAdmin(authHeader)) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const url = new URL(req.url)
    const method = req.method

    // GET - List all products (including inactive)
    if (method === 'GET') {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return new Response(
        JSON.stringify({ products: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST - Create new product
    if (method === 'POST') {
      const body = await req.json()
      
      const { data, error } = await supabase
        .from('products')
        .insert({
          title: body.title,
          description: body.description,
          price: body.price || 0,
          stock: body.stock ?? 9999,
          show_stock: body.show_stock ?? true,
          images: body.images || [],
          tags: body.tags || [],
          featured: body.featured || false,
          active: body.active ?? true,
          pdf_url: body.pdf_url || null,
        })
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ product: data }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PUT - Update product
    if (method === 'PUT') {
      const body = await req.json()
      const productId = url.searchParams.get('id')

      if (!productId) {
        return new Response(
          JSON.stringify({ error: 'Product ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const updateData: Record<string, unknown> = {}
      if (body.title !== undefined) updateData.title = body.title
      if (body.description !== undefined) updateData.description = body.description
      if (body.price !== undefined) updateData.price = body.price
      if (body.stock !== undefined) updateData.stock = body.stock
      if (body.show_stock !== undefined) updateData.show_stock = body.show_stock
      if (body.images !== undefined) updateData.images = body.images
      if (body.tags !== undefined) updateData.tags = body.tags
      if (body.featured !== undefined) updateData.featured = body.featured
      if (body.active !== undefined) updateData.active = body.active
      if (body.pdf_url !== undefined) updateData.pdf_url = body.pdf_url

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ product: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE - Delete product
    if (method === 'DELETE') {
      const productId = url.searchParams.get('id')

      if (!productId) {
        return new Response(
          JSON.stringify({ error: 'Product ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})