import React, { useEffect, useState } from 'react';
import api, { getAccessToken, removeAccessToken, getRefreshToken, setAccessToken as setAccessTokenLocal } from '../lib/api';

export default function DemoRefresh() {
  const [log, setLog] = useState([]);
  const [accessToken, setAccessToken] = useState(getAccessToken());
  const [refreshToken, setRefreshTokenState] = useState(getRefreshToken());
  const [loading, setLoading] = useState(false);

  const append = (text) => setLog(l => [
    `${new Date().toLocaleTimeString()} — ${text}`,
    ...l
  ].slice(0, 50));

  useEffect(() => {
    const onStart = () => append('[auth] refresh:start');
    const onSuccess = (e) => {
      append('[auth] refresh:success');
      setAccessToken(getAccessToken());
    };
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

  useEffect(() => {
    setRefreshTokenState(getRefreshToken());
  }, []);

  const callProtected = async () => {
    append('Calling GET /profile (protected)...');
    setLoading(true);
    try {
      const res = await api.get('/profile');
      append(`Profile fetched: ${res.data.name} <${res.data.email}>`);
    } catch (err) {
      append('Protected call failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const simulateExpiry = () => {
    const t = getAccessToken();
    if (!t) return append('No access token in localStorage');
    removeAccessToken();
    setAccessToken(null);
    append('Access token removed from localStorage (simulate expiry)');
  };

  const forceRefresh = async () => {
    append('Forcing refresh (POST /auth/refresh)...');
    setLoading(true);
    try {
      const res = await api.post('/auth/refresh', {});
      append('Refresh response: ' + (res.data?.message || JSON.stringify(res.data)));
      const newToken = res.data?.token || null;
      if (newToken) {
        // persist token and set default Authorization header for api instance
        setAccessTokenLocal(newToken);
        // update local display state
        setAccessToken(getAccessToken());
        append('Access token stored to localStorage and Authorization header set.');
      } else {
        append('No token returned by refresh endpoint.');
      }
    } catch (err) {
      append('Refresh failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const clearLog = () => setLog([]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
      <h3 className="text-xl font-semibold mb-3 text-gray-900">Demo: Refresh Token (nâng cao)</h3>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Hướng dẫn thao tác</h4>
        <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1">
          <li>Đăng nhập bằng tài khoản (nên dùng account admin để thử các endpoint cần quyền).</li>
          <li>Bấm <strong>Call protected</strong> để gọi GET /profile — nếu token hợp lệ, server trả thông tin profile.</li>
          <li>Bấm <strong>Simulate expiry</strong> để xóa access token ở localStorage (mô phỏng token hết hạn).</li>
          <li>Bấm <strong>Force refresh now</strong> để gọi POST /auth/refresh và lấy access token mới (nếu refresh token hợp lệ).</li>
          <li>Quan sát <em>Event log</em> để xem các sự kiện refresh:start, refresh:success hoặc refresh:fail và kết quả các cuộc gọi.</li>
        </ol>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="col-span-1 p-4 rounded-lg bg-white border border-gray-100">
          <div className="text-sm text-gray-500">Access Token</div>
          <div className="mt-2 text-xs break-words text-gray-800 h-20 overflow-auto bg-gray-50 p-2 rounded">{accessToken || <span className="text-gray-400">(none)</span>}</div>
        </div>

        <div className="col-span-1 p-4 rounded-lg bg-white border border-gray-100">
          <div className="text-sm text-gray-500">Refresh Token (client copy)</div>
          <div className="mt-2 text-xs break-words text-gray-800 h-20 overflow-auto bg-gray-50 p-2 rounded">{refreshToken || <span className="text-gray-400">(not saved)</span>}</div>
        </div>

        <div className="col-span-1 p-4 rounded-lg bg-white border border-gray-100 flex flex-col gap-3">
          <button onClick={callProtected} disabled={loading} className="w-full bg-gray-900 text-white py-2 rounded">Call protected</button>
          <button onClick={simulateExpiry} className="w-full bg-gray-500 text-white py-2 rounded">Simulate expiry (remove local access)</button>
          <button onClick={forceRefresh} disabled={loading} className="w-full bg-gray-700 text-white py-2 rounded">Force refresh now</button>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-gray-500">Event log</div>
        <div>
          <button onClick={clearLog} className="text-xs text-gray-600 hover:text-gray-800">Clear</button>
        </div>
      </div>

      <div className="h-48 overflow-auto bg-gray-50 p-3 rounded border border-gray-100">
        {log.length === 0 ? (
          <div className="text-sm text-gray-400">No events yet. Try calling protected endpoint or simulate expiry.</div>
        ) : (
          log.map((l, i) => <div key={i} className="text-xs py-1 border-b border-gray-100 text-gray-800">{l}</div>)
        )}
      </div>
    </div>
  );
}
