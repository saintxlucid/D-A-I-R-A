import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/state/auth'
import { API_URL } from '@/lib/api'

interface PresignResponse {
  url: string
  fields?: Record<string, string>
  putUrl?: string
  objectUrl: string
}

export function usePresign() {
  const token = useAuthStore((s) => s.token)
  
  return useMutation({
    mutationFn: async (file: File) => {
      // 1) Request presigned URL
      const res = await fetch(`${API_URL}/upload/presign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      })
      
      if (!res.ok) {
        throw new Error(`Presign failed: ${res.status}`)
      }
      
      const data: PresignResponse = await res.json()
      
      // 2) Upload to storage (supports both POST multipart and PUT)
      if (data.url && data.fields) {
        // S3-style multipart form
        const form = new FormData()
        Object.entries(data.fields).forEach(([k, v]) => form.append(k, v))
        form.append('file', file)
        
        const uploadRes = await fetch(data.url, {
          method: 'POST',
          body: form,
        })
        
        if (!uploadRes.ok) {
          throw new Error(`Upload failed: ${uploadRes.status}`)
        }
      } else if (data.putUrl) {
        // Direct PUT
        const uploadRes = await fetch(data.putUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        })
        
        if (!uploadRes.ok) {
          throw new Error(`Upload failed: ${uploadRes.status}`)
        }
      }
      
      return data.objectUrl
    },
  })
}