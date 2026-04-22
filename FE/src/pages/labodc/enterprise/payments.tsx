import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { companyService } from '@/services/company.service';
import { paymentService, type BackendPaymentResponse } from '@/services/payment.service';

const Payments: React.FC = () => {
	const [loading, setLoading] = useState(true);
	const [payments, setPayments] = useState<BackendPaymentResponse[]>([]);

	useEffect(() => {
		load();
		const onPaymentsChanged = () => {
			void load();
		};
		window.addEventListener('payments:changed', onPaymentsChanged);
		return () => {
			window.removeEventListener('payments:changed', onPaymentsChanged);
		};
	}, []);

	const load = async () => {
		try {
			setLoading(true);
			const myCompany = await companyService.getMyCompany();
			const list = await paymentService.listPaymentsByCompany(String(myCompany.id));
			setPayments(list);
		} catch (e: any) {
			console.error('Error loading payments:', e);
			setPayments([]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold text-gray-900">Payments</h1>
			<Card>
				{loading ? (
					<div className="p-4 text-sm text-gray-600">Loading...</div>
				) : (
				<div className="overflow-x-auto">
					{payments.length === 0 ? (
						<div className="p-4 text-sm text-gray-600">No payments.</div>
					) : (
						<table className="min-w-full text-sm">
							<thead>
								<tr className="text-left text-gray-600">
									<th className="py-2">Project</th>
									<th className="py-2">Amount</th>
									<th className="py-2">Status</th>
									<th className="py-2">Transaction</th>
									<th className="py-2">Date</th>
								</tr>
							</thead>
							<tbody>
								{payments.map((p) => (
									<tr key={p.id} className="border-t">
										<td className="py-3">{p.projectName || '-'}</td>
										<td className="py-3">{p.amount ?? '-'}</td>
										<td className="py-3">{p.status || '-'}</td>
										<td className="py-3">{p.transactionId || '-'}</td>
										<td className="py-3">{p.paymentDate || p.createdAt || '-'}</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
				)}
			</Card>
		</div>
	);
};

export default Payments;
