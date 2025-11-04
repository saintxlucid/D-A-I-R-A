import { useParams } from 'react-router-dom'

export default function Profile() {
  const { handle } = useParams()
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">@{handle}</h1>
      <div className="text-neutral-400">Profile page coming soon</div>
    </div>
  )
}