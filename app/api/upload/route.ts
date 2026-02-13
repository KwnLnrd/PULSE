import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const { name, size } = await request.json()

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = process.env.CLOUDFLARE_API_TOKEN

    if (!accountId || !apiToken) {
        return NextResponse.json({ error: 'Missing Cloudflare credentials' }, { status: 500 })
    }

    // Request Direct Upload URL for TUS
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream?direct_user=true`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Tus-Resumable': '1.0.0',
            'Upload-Length': size.toString(),
            'Upload-Metadata': `filename ${btoa(name)},filetype ${btoa('video/mp4')}`
        }
    })

    // Cloudflare Stream returns the Location header as the TUS endpoint
    // But wait, the standard TUS flow usually requires the client to start the upload to the Location
    // For 'Direct Creator Uploads' via TUS, we return the Location header value to the client

    if (!response.ok) {
        const text = await response.text()
        console.error("Cloudflare Error:", text)
        return NextResponse.json({ error: 'Failed to initiate upload' }, { status: 500 })
    }

    const uploadUrl = response.headers.get('Location')

    if (!uploadUrl) {
        return NextResponse.json({ error: 'No upload URL returned' }, { status: 500 })
    }

    return NextResponse.json({ uploadUrl })
}
