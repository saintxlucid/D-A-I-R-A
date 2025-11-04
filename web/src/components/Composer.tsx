import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usePresign } from '@/hooks/useUpload'
import { gql } from '@/lib/api'
import { useAuthStore } from '@/state/auth'

const CREATE_POST = `
  mutation CreatePost($authorId: Int!, $type: String!, $caption: String, $mediaRefs: String) {
    createPost(authorId: $authorId, type: $type, caption: $caption, mediaRefs: $mediaRefs) {
      id
      author_id
      type
      caption
      media_refs
      created_at
    }
  }
`

export default function Composer() {
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const { user, token } = useAuthStore()
  const qc = useQueryClient()
  
  const presign = usePresign()
  const create = useMutation({
    mutationFn: async (mediaUrl: string | null) => {
      const mediaRefs = mediaUrl ? JSON.stringify([mediaUrl]) : '[]'
      return gql(
        CREATE_POST,
        {
          authorId: user?.id,
          type: file ? (file.type.startsWith('video') ? 'video' : 'image') : 'text',
          caption,
          mediaRefs,
        },
        token || undefined
      )
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] })
      setCaption('')
      setFile(null)
    },
  })
  
  async function handlePublish() {
    if (!user) return
    
    try {
      const url = file ? await presign.mutateAsync(file) : null
      await create.mutateAsync(url)
    } catch (err) {
      console.error('Publish failed:', err)
    }
  }
  
  const isLoading = presign.isPending || create.isPending
  
  return (
    <div className="glass rounded-2xl p-4">
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Say something…"
        className="w-full bg-neutral-800 p-3 rounded-xl resize-none"
        rows={3}
        disabled={isLoading}
      />
      
      {file && (
        <div className="mt-3 relative">
          <div className="text-sm text-neutral-400">{file.name}</div>
          <button
            onClick={() => setFile(null)}
            className="absolute top-0 right-0 text-xs text-red-400"
          >
            Remove
          </button>
        </div>
      )}
      
      <div className="mt-3 flex items-center gap-3">
        <label className="cursor-pointer text-sm text-neutral-400 hover:text-white">
          <input
            type="file"
            accept="video/*,image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            disabled={isLoading}
          />
          📎 Attach media
        </label>
        
        <button
          onClick={handlePublish}
          disabled={isLoading || (!caption.trim() && !file)}
          className="ml-auto gradient-brand rounded-xl px-6 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Publishing…' : 'Publish'}
        </button>
      </div>
    </div>
  )
}