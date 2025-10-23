import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { setAuthFromLocalStorage } from '../lib/api';
import {
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  User,
} from 'lucide-react';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchLogs = async () => {
    try {
      setAuthFromLocalStorage();
      const params = { limit: 1000 };
      if (typeFilter) params.type = typeFilter;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      const res = await axios.get('/logs', { params });
      const items = res.data?.items || [];
      setLogs(items);
      setFiltered(items);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải logs');
    }
  };

  useEffect(() => { fetchLogs(); }, [typeFilter, fromDate, toDate]);

  useEffect(() => {
    const filteredList = logs.filter(l => {
      const term = searchTerm.trim().toLowerCase();
      if (!term) return true;
      return (
        (l.message || '').toLowerCase().includes(term) ||
        (l.type || '').toLowerCase().includes(term) ||
        (l.ip || '').toLowerCase().includes(term) ||
        (l.userAgent || '').toLowerCase().includes(term) ||
        (l.userId || '').toString().toLowerCase().includes(term)
      );
    });
    setFiltered(filteredList);
    setCurrentPage(1);
  }, [searchTerm, logs]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = useMemo(() => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filtered, currentPage, pageSize]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Activity Logs</h2>
              <p className="text-gray-600">Xem hoạt động hệ thống (dành cho admin)</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-sm text-gray-600">Tìm nhanh</label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm theo message, ip, userId..." className="w-full pl-10 pr-3 py-2 border rounded-lg" />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Type</label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full mt-2 p-2 border rounded-lg">
                <option value="">Tất cả</option>
                <option value="login_attempt">login_attempt</option>
                <option value="login_success">login_success</option>
                <option value="request">request</option>
              </select>
            </div>

            <div className="flex gap-2">
              <div>
                <label className="text-sm text-gray-600">Từ</label>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full mt-2 p-2 border rounded-lg" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Đến</label>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full mt-2 p-2 border rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {error && <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 rounded-r-xl text-red-700">{error}</div>}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">IP</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Message / Meta</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginated.map((l) => (
                  <tr key={l._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" />{new Date(l.createdAt).toLocaleString('vi-VN')}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" />{l.userId || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{l.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{l.ip || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="text-sm font-medium">{l.message || ''}</div>
                      <div className="text-xs text-gray-500 mt-1">{l.userAgent || JSON.stringify(l.meta || {})}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Không có logs</h3>
              <p className="text-gray-500">Không tìm thấy logs phù hợp với bộ lọc.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filtered.length)} của {filtered.length}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"> <ChevronsLeft className="w-4 h-4" /> </button>
                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"> <ChevronLeft className="w-4 h-4" /> </button>
                <div className="text-sm">{currentPage} / {totalPages}</div>
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"> <ChevronRight className="w-4 h-4" /> </button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"> <ChevronsRight className="w-4 h-4" /> </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;
