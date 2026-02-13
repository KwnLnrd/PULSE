"use client"

import { useState } from "react"

export type KycStatus = 'idle' | 'pending' | 'verified' | 'rejected'

export function useKYC() {
    const [status, setStatus] = useState<KycStatus>('idle')

    const startVerification = async () => {
        setStatus('pending')
        // Simulate external KYC provider popup (Sumsub)
        console.log("Opening KYC provider modal...")

        return new Promise<KycStatus>((resolve) => {
            setTimeout(() => {
                const result = 'verified'
                setStatus(result)
                resolve(result)
            }, 3000)
        })
    }

    return {
        status,
        startVerification,
        isVerified: status === 'verified'
    }
}
