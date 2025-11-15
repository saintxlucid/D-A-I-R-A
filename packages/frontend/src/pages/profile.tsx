import { useState } from 'react';
const maskOptions = ['PUBLIC', 'CREATOR', 'PRIVATE'];
export default function Profile() {
  const [masks, setMasks] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState('');
  function addMask(mask: string) {
    if (!masks.includes(mask)) setMasks([...masks, mask]);
  }
  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Create Profile Masks</h2>
      <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Display Name" className="border p-2 mb-2 w-full" />
      <div className="flex gap-2 mb-4">
        {maskOptions.map(mask => (
          <button key={mask} onClick={() => addMask(mask)} className="px-2 py-1 border rounded">{mask}</button>
        ))}
      </div>
      <div>
        <strong>Masks:</strong> {masks.join(', ')}
      </div>
    </div>
  );
}
