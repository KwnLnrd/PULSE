"use client"

import { useEffect } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'

export default function LoginPage() {
    const { user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (user) {
            router.push('/')
        }
    }, [user, router])

    return (
        <div className="flex min-h-screen items-center justify-center bg-black px-4">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-zinc-900 p-8 border border-zinc-800">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        Sign in to your PULSE account
                    </p>
                </div>

                <Auth
                    supabaseClient={supabase}
                    appearance={{
                        theme: ThemeSupa,
                        variables: {
                            default: {
                                colors: {
                                    brand: '#E0FF22',
                                    brandAccent: '#d2f01f',
                                    inputText: 'white',
                                    inputBackground: '#18181b',
                                    inputBorder: '#27272a',
                                },
                            },
                        },
                        className: {
                            button: 'text-black font-bold uppercase tracking-wider',
                        }
                    }}
                    providers={['google', 'github']}
                    theme="dark"
                    redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`}
                />
            </div>
        </div>
    )
}
