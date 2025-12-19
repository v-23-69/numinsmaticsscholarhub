
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
            // Use Storefront API for consistency
            const storefrontToken = Deno.env.get('SHOPIFY_STOREFRONT_TOKEN') || shopifyToken
            const storefrontUrl = `https://${shopifyShop}/api/2024-01/graphql.json`
            
            const testQuery = `
                query {
                    shop {
                        name
                        primaryDomain {
                            url
                        }
                    }
                }
            `

            const response = await fetch(storefrontUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token': storefrontToken
                },
                body: JSON.stringify({ query: testQuery })
            })

            const data = await response.json()

            if (data.errors) {
                throw new Error(`Shopify API error: ${data.errors.map((e: any) => e.message).join(', ')}`)
            }

            return new Response(
                JSON.stringify({ success: true, shop: data.data?.shop }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        if (action === 'sync_products') {
            // Fetch products from Shopify using Storefront API (or Admin API)
            // Using Storefront API for now - you may need Admin API for full product details
            const storefrontToken = Deno.env.get('SHOPIFY_STOREFRONT_TOKEN')
            const storefrontUrl = `https://${shopifyShop}/api/2024-01/graphql.json`
            
            const query = `
                query {
                    products(first: 250) {
                        edges {
                            node {
                                id
                                title
                                description
                                handle
                                priceRange {
                                    minVariantPrice {
                                        amount
                                        currencyCode
                                    }
                                }
                                images(first: 5) {
                                    edges {
                                        node {
                                            url
                                            altText
                                        }
                                    }
                                }
                                variants(first: 10) {
                                    edges {
                                        node {
                                            id
                                            title
                                            price {
                                                amount
                                                currencyCode
                                            }
                                            availableForSale
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `

            const response = await fetch(storefrontUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token': storefrontToken || shopifyToken
                },
                body: JSON.stringify({ query })
            })

            const graphqlData = await response.json()
            
            if (graphqlData.errors) {
                throw new Error(`Shopify API error: ${graphqlData.errors.map((e: any) => e.message).join(', ')}`)
            }

            const products = graphqlData.data?.products?.edges || []
            
            // Get admin user ID for seller_id
            const adminUserId = user.id

            let syncedCount = 0
            let updatedCount = 0
            let errorCount = 0
            const errors: string[] = []

            // Sync each product to coin_listings
            for (const productEdge of products) {
                const product = productEdge.node
                const firstVariant = product.variants.edges[0]?.node
                
                if (!firstVariant) continue

                try {
                    // Extract numeric ID from Shopify GID (gid://shopify/Product/123456)
                    const shopifyProductId = product.id
                    const shopifyVariantId = firstVariant.id
                    const price = parseFloat(firstVariant.price.amount)
                    const imageUrl = product.images.edges[0]?.node?.url || null

                    // Check if product already exists
                    const { data: existing } = await supabaseClient
                        .from('coin_listings')
                        .select('id')
                        .eq('shopify_product_id', shopifyProductId)
                        .maybeSingle()

                    const listingData = {
                        seller_id: adminUserId,
                        title: product.title,
                        description: product.description || '',
                        price: price,
                        shopify_product_id: shopifyProductId,
                        shopify_variant_id: shopifyVariantId,
                        shopify_handle: product.handle,
                        is_shopify_product: true,
                        status: firstVariant.availableForSale ? 'active' : 'draft',
                        stock_count: 1, // Default, can be updated from Shopify inventory
                        updated_at: new Date().toISOString()
                    }

                    if (existing) {
                        // Update existing
                        const { error: updateError } = await supabaseClient
                            .from('coin_listings')
                            .update(listingData)
                            .eq('id', existing.id)

                        if (updateError) throw updateError
                        updatedCount++

                        // Update images
                        if (imageUrl) {
                            // Delete old images
                            await supabaseClient
                                .from('coin_images')
                                .delete()
                                .eq('coin_id', existing.id)

                            // Insert new image
                            await supabaseClient
                                .from('coin_images')
                                .insert({
                                    coin_id: existing.id,
                                    url: imageUrl,
                                    side: 'front',
                                    display_order: 0
                                })
                        }
                    } else {
                        // Insert new
                        const { data: newListing, error: insertError } = await supabaseClient
                            .from('coin_listings')
                            .insert(listingData)
                            .select('id')
                            .single()

                        if (insertError) throw insertError
                        syncedCount++

                        // Insert image
                        if (imageUrl && newListing) {
                            await supabaseClient
                                .from('coin_images')
                                .insert({
                                    coin_id: newListing.id,
                                    url: imageUrl,
                                    side: 'front',
                                    display_order: 0
                                })
                        }
                    }
                } catch (err) {
                    errorCount++
                    errors.push(`${product.title}: ${err.message}`)
                    console.error(`Error syncing product ${product.title}:`, err)
                }
            }

            return new Response(
                JSON.stringify({ 
                    success: true, 
                    synced_count: syncedCount,
                    updated_count: updatedCount,
                    error_count: errorCount,
                    total_products: products.length,
                    errors: errors.slice(0, 10), // Limit errors
                    message: `Synced ${syncedCount} new, updated ${updatedCount} existing products`
                }),
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
