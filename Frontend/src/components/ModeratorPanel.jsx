import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { setAuthFromLocalStorage } from '../lib/api';

export default function ModeratorPanel() {
	const [users, setUsers] = useState([]);
	const [error, setError] = useState('');

	const fetchUsers = async () => {
		try {
			setAuthFromLocalStorage();
			const res = await axios.get('/users');
			setUsers(res.data || []);
		} catch (err) {
			setError(err.response?.data?.message || err.message || 'Không thể tải users');
		}
	};

	useEffect(() => { fetchUsers(); }, []);

	return (
		<div className="p-6">
			<h2 className="text-2xl font-bold mb-4">Moderator Panel</h2>
			{error && <div className="text-red-600 mb-4">{error}</div>}
			<div className="bg-white rounded-xl shadow p-4">
				<table className="w-full table-auto">
					<thead>
						<tr className="text-left text-sm text-gray-600 border-b">
							<th className="py-2">Name</th>
							<th>Email</th>
							<th>Role</th>
						</tr>
					</thead>
					<tbody>
						{users.map(u => (
							<tr key={u._id} className="border-b">
								<td className="py-2">{u.name}</td>
								<td>{u.email}</td>
								<td>{u.role}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
