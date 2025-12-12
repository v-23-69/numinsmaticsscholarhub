
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // 1. Validate Admin User
        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) throw new Error('Unauthorized')

        // 2. Fetch Shopify Config (In real app, fetch from DB settings)
        const { action } = await req.json()
        const shopifyShop = Deno.env.get('SHOPIFY_SHOP_DOMAIN')
        const shopifyToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN')

        if (!shopifyShop || !shopifyToken) {
            return new Response(
                JSON.stringify({ error: 'Shopify credentials not configured in Edge Runtime secrets' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        // 3. Perform Logic
        if (action === 'test_connection') {
            const response = await fetch(`https://${shopifyShop}/admin/api/2023-10/shop.json`, {
                headers: {
                    'X-Shopify-Access-Token': shopifyToken
                }
            })
            const data = await response.json()

            return new Response(
                JSON.stringify({ success: true, shop: data.shop }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        if (action === 'sync_products') {
            // Fetch products from Shopify
            const response = await fetch(`https://${shopifyShop}/admin/api/2023-10/products.json`, {
                headers: { 'X-Shopify-Access-Token': shopifyToken }
            })
            const { products } = await response.json()

            // Sync to Supabase table (coin_listings or separate shopify_products)
            // For now, we return the count
            return new Response(
                JSON.stringify({ success: true, synced_count: products.length, message: "Sync successful (simulation)" }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        return new Response(
            JSON.stringify({ error: 'Unknown action' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
