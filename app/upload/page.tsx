"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, CheckCircle, AlertCircle } from "lucide-react"
import * as tus from "tus-js-client"
import { useRouter } from "next/navigation"

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setUploading(true)
        setProgress(0)

        // 1. Get TUS endpoint from our server
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: JSON.stringify({
                    name: file.name,
                    size: file.size
                })
            })

            if (!response.ok) throw new Error("Failed to get upload URL")

            const { uploadUrl } = await response.json()

            // 2. Start TUS upload to Cloudflare
            const upload = new tus.Upload(file, {
                endpoint: uploadUrl, // TUS endpoint is usually handled by the direct URL or via proxy if needed
                uploadUrl: uploadUrl, // Cloudflare Stream returns a direct one-time upload URL
                retryDelays: [0, 3000, 5000, 10000, 20000],
                metadata: {
                    filename: file.name,
                    filetype: file.type
                },
                onError: function (error) {
                    console.log("Failed because: " + error)
                    setUploading(false)
                },
                onProgress: function (bytesUploaded, bytesTotal) {
                    const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2)
                    setProgress(Number(percentage))
                },
                onSuccess: function () {
                    console.log("Download %s from %s", (upload.file as File).name, upload.url)
                    setSuccess(true)
                    setUploading(false)
                    setTimeout(() => router.push('/'), 2000)
                }
            })

            // Check if previous uploads
            upload.findPreviousUploads().then(function (previousUploads) {
                // Found previous uploads so we select the first one. 
                if (previousUploads.length) {
                    upload.resumeFromPreviousUpload(previousUploads[0])
                }
                // Start the upload
                upload.start()
            })

        } catch (e) {
            console.error(e)
            setUploading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Upload Video</h1>
                <p className="text-zinc-400 mb-8">Share your content with the world.</p>

                {!success ? (
                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-zinc-700 rounded-lg p-12 flex flex-col items-center justify-center hover:border-[var(--accent)] transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <Upload className="w-12 h-12 text-zinc-500 mb-4" />
                            {file ? (
                                <p className="text-white font-medium break-all">{file.name}</p>
                            ) : (
                                <p className="text-zinc-500">Drag & drop or click to select</p>
                            )}
                        </div>

                        {uploading && (
                            <div className="w-full bg-zinc-800 rounded-full h-2.5">
                                <div className="bg-[var(--accent)] h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                <p className="text-xs text-right mt-1 text-zinc-400">{progress}%</p>
                            </div>
                        )}

                        <Button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="w-full font-bold"
                        >
                            {uploading ? 'Uploading...' : 'Start Upload'}
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Upload Complete!</h3>
                        <p className="text-zinc-400 mt-2">Your video is processing.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
