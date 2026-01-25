import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Admin credentials validation via environment variables (server-side only)
const ADMIN_USERNAME = Deno.env.get('ADMIN_USERNAME') || 'Prooadmin'
const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD') || 'ACESSORESTRITO'

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
      console.log('Unauthorized access attempt')
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

    console.log(`Admin products request: ${method}`)

    // GET - List all products (including inactive)
    if (method === 'GET') {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('GET error:', error)
        throw error
      }

      console.log(`Fetched ${data?.length || 0} products`)
      return new Response(
        JSON.stringify({ products: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST - Create new product
    if (method === 'POST') {
      const body = await req.json()
      console.log('Creating product:', body.title)
      
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

      if (error) {
        console.error('POST error:', error)
        throw error
      }

      console.log('Product created:', data.id)
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

      console.log('Updating product:', productId)

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
      if (body.page_count !== undefined) updateData.page_count = body.page_count
      if (body.file_format !== undefined) updateData.file_format = body.file_format
      if (body.file_size_mb !== undefined) updateData.file_size_mb = body.file_size_mb
      if (body.paper_format !== undefined) updateData.paper_format = body.paper_format
      if (body.show_technical_info !== undefined) updateData.show_technical_info = body.show_technical_info
      if (body.age_range !== undefined) updateData.age_range = body.age_range
      if (body.is_accessible !== undefined) updateData.is_accessible = body.is_accessible
      if (body.show_accessibility !== undefined) updateData.show_accessibility = body.show_accessibility

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)
        .select()
        .single()

      if (error) {
        console.error('PUT error:', error)
        throw error
      }

      console.log('Product updated:', data.id)
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

      console.log('Deleting product:', productId)

      // First delete related records
      await supabase.from('product_metrics').delete().eq('product_id', productId)
      await supabase.from('product_reviews').delete().eq('product_id', productId)
      
      // Now delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) {
        console.error('DELETE error:', error)
        throw error
      }

      console.log('Product deleted:', productId)
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
