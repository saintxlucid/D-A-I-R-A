import { useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'

interface ReelVideoProps {
  src: string
  muted?: boolean
}

export function ReelVideo({ src, muted = true }: ReelVideoProps) {
  const vid = useRef<HTMLVideoElement>(null)
  const { ref, inView } = useInView({ threshold: 0.7 })
  
  useEffect(() => {
    const v = vid.current
    if (!v) return
    
    if (inView) {
      v.play().catch(() => {})
    } else {
      v.pause()
    }
  }, [inView])
  
  return (
    <div ref={ref} className="relative h-[calc(100dvh-64px)] overflow-hidden rounded-2xl">
      <video
        ref={vid}
        src={src}
        muted={muted}
        playsInline
        loop
        className="h-full w-full object-cover"
      />
      
      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
      
      {/* Action buttons stack here */}
      <div className="absolute bottom-20 right-4 flex flex-col gap-4">
        {/* Placeholder for like/comment/share buttons */}
      </div>
    </div>
  )
}