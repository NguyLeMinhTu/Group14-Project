import React, { useEffect, useState, useMemo } from 'react';
import api, { setAuthFromLocalStorage } from '../lib/api';
import { Search, Eye } from 'lucide-react';

export default function ModeratorPanel() {
	const [users, setUsers] = useState([]);
	const [error, setError] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(10);
	const [loading, setLoading] = useState(false);
	const [viewUser, setViewUser] = useState(null);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			setAuthFromLocalStorage();
			const res = await api.get('/users');
			// backend returns an array of users; be defensive in case of different shape
			const data = res.data;
			if (Array.isArray(data)) {
				setUsers(data);
			} else if (data && Array.isArray(data.users)) {
				setUsers(data.users);
			} else {
				// fallback: if data is single object or unexpected, wrap or empty
				setUsers([]);
			}
		} catch (err) {
			setError(err.response?.data?.message || err.message || 'Không thể tải users');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { fetchUsers(); }, []);

	// filtered + pagination
	const filtered = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		if (!term) return users;
		return users.filter(u => (u.name || '').toLowerCase().includes(term) || (u.email || '').toLowerCase().includes(term) || (u.role || '').toLowerCase().includes(term));
	}, [users, searchTerm]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

	return (
		<div className="min-h-screen p-6 bg-white">
			<div className="max-w-6xl mx-auto">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h2 className="text-2xl font-semibold text-gray-900">Moderator Panel</h2>
						<p className="text-sm text-gray-600">Quản lý nhanh người dùng — chế độ moderator</p>
					</div>
					<div className="w-80">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
							<input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Tìm theo tên hoặc email..." className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:border-gray-400" />
						</div>
					</div>
				</div>

				{error && <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4 text-red-700">{error}</div>}

				<div className="bg-white rounded-2xl shadow overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-100">
								{loading ? (
									<tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Đang tải...</td></tr>
								) : paginated.length === 0 ? (
									<tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Không tìm thấy người dùng.</td></tr>
								) : (
									paginated.map(u => (
										<tr key={u._id || u.id} className="hover:bg-gray-50">
											<td className="px-6 py-4 text-sm text-gray-900">{u.name}</td>
											<td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
											<td className="px-6 py-4 text-sm text-gray-700">{u.role || 'user'}</td>
											<td className="px-6 py-4 text-right text-sm font-medium">
												<button onClick={() => setViewUser(u)} className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-md"> <Eye className="w-4 h-4" /> View</button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* pagination */}
				<div className="flex items-center justify-between mt-4">
					<div className="text-sm text-gray-600">Hiển thị {Math.min((currentPage - 1) * pageSize + 1, filtered.length)} - {Math.min(currentPage * pageSize, filtered.length)} của {filtered.length}</div>
					<div className="flex items-center gap-2">
						<button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50">First</button>
						<button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50">Prev</button>
						<div className="px-3 py-1 text-sm border border-gray-200 rounded">{currentPage} / {totalPages}</div>
						<button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50">Next</button>
						<button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 rounded border border-gray-200 disabled:opacity-50">Last</button>
					</div>
				</div>

				{/* View modal */}
				{viewUser && (
					<div className="fixed inset-0 z-50 flex items-center justify-center">
						<div className="fixed inset-0 bg-black opacity-40" onClick={() => setViewUser(null)} />
						<div className="bg-white rounded-lg p-6 z-10 w-full max-w-lg shadow-lg">
							<div className="flex items-start justify-between">
								<h3 className="text-lg font-medium text-gray-900">User details</h3>
								<button onClick={() => setViewUser(null)} className="text-gray-500">Close</button>
							</div>
							<div className="mt-4 space-y-3 text-sm text-gray-700">
								<div><strong>Name:</strong> {viewUser.name}</div>
								<div><strong>Email:</strong> {viewUser.email}</div>
								<div><strong>Role:</strong> {viewUser.role}</div>
								<div><strong>ID:</strong> {viewUser._id || viewUser.id}</div>
								<div><strong>Created:</strong> {viewUser.createdAt ? new Date(viewUser.createdAt).toLocaleString() : 'N/A'}</div>
							</div>
							<div className="mt-6 text-right">
								<button onClick={() => setViewUser(null)} className="px-4 py-2 bg-gray-900 text-white rounded">Close</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
