import { ReelVideo } from '@/components/ReelVideo'

export default function Reels() {
  // TODO: Replace with real data from API
  const mockReels = [
    { id: 1, src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
  ]
  
  return (
    <div className="max-w-lg mx-auto space-y-4 pb-4">
      {mockReels.map((reel) => (
        <ReelVideo key={reel.id} src={reel.src} />
      ))}
    </div>
  )
}