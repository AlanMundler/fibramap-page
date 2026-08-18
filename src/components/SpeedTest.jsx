import { useState } from 'react';

export default function SpeedTest() {
  const [speeds, setSpeeds] = useState({ download: 0, upload: 0, ping: 0 });
  const [testing, setTesting] = useState(false);

  const runSpeedTest = async () => {
    setTesting(true);
    try {
      const response = await fetch('https://api-fast.com/api/speed-test?token=YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm');
      const data = await response.json();
      setSpeeds({ download: data.download || 0, upload: data.upload || 0, ping: data.ping || 0 });
    } catch {
      setSpeeds({ download: '--', upload: '--', ping: '--' });
    }
    setTesting(false);
  };

  return (
    <div className="relative overflow-x-auto h-full sm:ml-64 sm:mr-36">
      <h1 className="mb-4 ml-4 mr-4 relative overflow-x-auto text-xl font-semibold dark:text-white h-full px-3 py-4 bg-gray-50 dark:bg-gray-800">Test de Velocidad</h1>
      <p className="ml-4 mr-4 relative overflow-x-auto text-xl font-semibold dark:text-white h-full px-3 py-4 bg-gray-50 dark:bg-gray-800">Download Speed: {speeds.download} Mbps</p>
      <p className="ml-4 mr-4 relative overflow-x-auto text-xl font-semibold dark:text-white h-full px-3 py-4 bg-gray-50 dark:bg-gray-800">Upload Speed: {speeds.upload} Mbps</p>
      <p className="ml-4 mr-4 relative overflow-x-auto text-xl font-semibold dark:text-white h-full px-3 py-4 bg-gray-50 dark:bg-gray-800">Ping: {speeds.ping} ms</p>
      <button className="mt-2 mb-2 ml-4 mr-4 px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-red-700 focus:z-10 focus:ring-2 focus:ring-red-700 focus:text-red-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-red-700 dark:hover:bg-gray-700 dark:focus:ring-red-500 dark:focus:text-white" onClick={runSpeedTest} disabled={testing}>
        {testing ? 'Testing...' : 'Run'}
      </button>
    </div>
  );
}
