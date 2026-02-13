import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    const { priceId, creatorId } = await request.json()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId, // Ensure this price exists in StripeDashboard
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/feed?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/feed?canceled=true`,
            metadata: {
                userId: user.id,
                creatorId: creatorId,
                type: 'subscription'
            }
        })

        return NextResponse.json({ url: session.url })
    } catch (err: any) {
        console.error(err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
