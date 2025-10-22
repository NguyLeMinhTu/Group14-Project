import React, { useState } from 'react';
import api, { removeAccessToken, getAccessToken } from '../lib/api';

// Demo component to show automatic refresh flow
export default function DemoRefresh() {
  const [log, setLog] = useState([]);
  const append = (text) => setLog(l => [text, ...l].slice(0, 20));

  // Listen for global auth refresh events so we can show them in the demo log
  React.useEffect(() => {
    const onStart = () => append('[auth] refresh:start');
    const onSuccess = (e) => append('[auth] refresh:success');
    const onFail = (e) => append(`[auth] refresh:fail: ${e?.detail?.message || ''}`);
    window.addEventListener('auth:refresh:start', onStart);
    window.addEventListener('auth:refresh:success', onSuccess);
    window.addEventListener('auth:refresh:fail', onFail);
    return () => {
      window.removeEventListener('auth:refresh:start', onStart);
      window.removeEventListener('auth:refresh:success', onSuccess);
      window.removeEventListener('auth:refresh:fail', onFail);
    };
  }, []);

  const callProtected = async () => {
    append('Calling /profile (protected)...');
    try {
      const res = await api.get('/profile');
      append('Profile fetched: ' + JSON.stringify({ name: res.data.name, email: res.data.email }));
    } catch (err) {
      append('Failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const simulateExpiry = () => {
    // Remove local access token to simulate expiry while keeping refresh token cookie
    const t = getAccessToken();
    if (!t) return append('No access token to remove');
    removeAccessToken();
    append('Access token removed from localStorage (simulate expiry). Refresh cookie still present if server set it).');
  };

  return (
    <div className="bg-white/80 p-4 rounded-xl shadow-md">
      <h3 className="text-lg font-bold mb-2">Demo: Auto refresh</h3>
      <div className="flex gap-3 mb-3">
        <button onClick={callProtected} className="px-3 py-2 bg-blue-600 text-white rounded">Call protected</button>
        <button onClick={simulateExpiry} className="px-3 py-2 bg-yellow-500 text-white rounded">Simulate token expiry</button>
      </div>
      <div className="text-sm text-gray-700">
        <div className="font-medium mb-1">Log:</div>
        <div className="max-h-48 overflow-auto bg-gray-50 p-2 rounded">
          {log.length === 0 && <div className="text-gray-400">No entries yet.</div>}
          {log.map((l, i) => <div key={i} className="py-1 border-b border-gray-100">{l}</div>)}
        </div>
      </div>
    </div>
  );
}
