import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

async function validateAdminJWT(authHeader: string | null, supabaseUrl: string, supabaseAnonKey: string): Promise<boolean> {
  if (!authHeader) return false
  
  try {
    const token = authHeader.replace('Bearer ', '')
    // Create a client with the user's token to check their identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    })
    
    const { data: { user }, error } = await userClient.auth.getUser()
    if (error || !user) return false
    
    // Check admin role using service role client
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

    // Validate admin via JWT
    const authHeader = req.headers.get('authorization')
    const isAdmin = await validateAdminJWT(authHeader, supabaseUrl, supabaseAnonKey)
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const url = new URL(req.url)
    const method = req.method

    // GET - List all products
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

    // POST - Create product
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
          page_count: body.page_count || null,
          file_format: body.file_format || 'PDF',
          file_size_mb: body.file_size_mb || null,
          paper_format: body.paper_format || 'A4',
          show_technical_info: body.show_technical_info ?? false,
          age_range: body.age_range || null,
          is_accessible: body.is_accessible ?? false,
          show_accessibility: body.show_accessibility ?? false,
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
      const fields = ['title','description','price','stock','show_stock','images','tags','featured','active','pdf_url','page_count','file_format','file_size_mb','paper_format','show_technical_info','age_range','is_accessible','show_accessibility']
      for (const field of fields) {
        if (body[field] !== undefined) updateData[field] = body[field]
      }

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

      // Delete related records first
      await supabase.from('product_metrics').delete().eq('product_id', productId)
      await supabase.from('product_reviews').delete().eq('product_id', productId)
      
      const { error } = await supabase.from('products').delete().eq('id', productId)
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
