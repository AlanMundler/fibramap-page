import { useState } from 'react';

export default function SpeedTest() {
  const [speeds, setSpeeds] = useState({ download: '--', upload: '--', ping: '--' });
  const [testing, setTesting] = useState(false);

  const run = async () => {
    setTesting(true);
    try {
      const r = await fetch('https://api-fast.com/api/speed-test?token=YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm');
      const d = await r.json();
      setSpeeds({ download: d.download || '--', upload: d.upload || '--', ping: d.ping || '--' });
    } catch {
      setSpeeds({ download: '--', upload: '--', ping: '--' });
    }
    setTesting(false);
  };

  const items = [
    { label: 'Descarga', value: speeds.download, unit: 'Mbps' },
    { label: 'Subida', value: speeds.upload, unit: 'Mbps' },
    { label: 'Ping', value: speeds.ping, unit: 'ms' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        {items.map(({ label, value, unit }) => (
          <div key={label}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label} ({unit})</p>
          </div>
        ))}
      </div>
      <button onClick={run} disabled={testing} className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
        {testing ? 'Midiendo...' : 'Medir velocidad'}
      </button>
    </div>
  );
}
