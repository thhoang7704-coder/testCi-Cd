import React, { useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import apiClient from '@/services/apiClient';

type BackendApiResponse<T> = {
	success: boolean;
	message?: string;
	data?: T;
	errors?: string[];
};

type AuditLogRow = {
	id: string;
	action: string;
	user: string;
	date: string;
};

const AuditLogs: React.FC = () => {
	const [rawLogs, setRawLogs] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let alive = true;
		setLoading(true);
		setError(null);

		apiClient
			.get<BackendApiResponse<string[]>>('/api/audit-logs')
			.then((res) => {
				if (!alive) return;
				const payload = res?.data;
				if (payload?.success && Array.isArray(payload.data)) {
					setRawLogs(payload.data);
					return;
				}
				const fallback = (res as any)?.data?.data || (res as any)?.data;
				setRawLogs(Array.isArray(fallback) ? fallback : []);
			})
			.catch((e: any) => {
				if (!alive) return;
				const apiData = e?.response?.data;
				setError(apiData?.message || apiData?.errors?.[0] || e?.message || 'Failed to load audit logs');
				setRawLogs([]);
			})
			.finally(() => {
				if (!alive) return;
				setLoading(false);
			});

		return () => {
			alive = false;
		};
	}, []);

	const rows = useMemo<AuditLogRow[]>(() => {
		return (rawLogs || []).map((line, idx) => {
			const text = String(line || '').trim();
			return {
				id: String(idx + 1),
				action: text || '—',
				user: '—',
				date: '—',
			};
		});
	}, [rawLogs]);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
			<Card>
				{error ? <div className="p-4 text-sm text-red-600">{error}</div> : null}
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead>
							<tr className="text-left text-gray-600">
								<th className="py-2">Action</th>
								<th className="py-2">User</th>
								<th className="py-2">Date</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr className="border-t">
									<td className="py-3" colSpan={3}>
										Loading...
									</td>
								</tr>
							) : rows.length ? (
								rows.map((l) => (
									<tr key={l.id} className="border-t">
										<td className="py-3">{l.action}</td>
										<td className="py-3">{l.user}</td>
										<td className="py-3">{l.date}</td>
									</tr>
								))
							) : (
								<tr className="border-t">
									<td className="py-3 text-gray-500" colSpan={3}>
										No audit logs.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	);
};

export default AuditLogs;
