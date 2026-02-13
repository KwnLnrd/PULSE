import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// We need a Supabase Admin client here to bypass RLS for webhook updates
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    const body = await request.text()
    const headerList = await headers()
    const signature = headerList.get('Stripe-Signature') as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error: any) {
        return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 })
    }

    const session = event.data.object as Stripe.Checkout.Session

    if (event.type === 'checkout.session.completed') {
        // Retrieve the subscription details from Stripe.
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        ) as any

        const userId = session.metadata?.userId
        const creatorId = session.metadata?.creatorId

        if (userId && creatorId) {
            // Upsert subscription in DB
            const { error } = await supabaseAdmin
                .from('subscriptions')
                .upsert({
                    subscriber_id: userId,
                    creator_id: creatorId,
                    status: 'active',
                    current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
                }, {
                    onConflict: 'subscriber_id, creator_id'
                })

            if (error) {
                console.error('Error updating subscription:', error)
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
            }

            // Also record earnings
            await supabaseAdmin.from('earnings').insert({
                user_id: creatorId,
                amount: session.amount_total || 0,
                source_type: 'subscription',
                source_id: subscription.id
            })
        }
    }

    return NextResponse.json({ received: true })
}
