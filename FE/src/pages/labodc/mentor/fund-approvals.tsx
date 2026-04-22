import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const FundApprovals: React.FC = () => {
	const approvals = [
		{ id: 1, project: 'Project Alpha', amount: 5000, status: 'Pending' },
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-900">Fund Approvals</h1>
			</div>
			<Card>
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead>
							<tr className="text-left text-gray-600"><th className="py-2">Project</th><th className="py-2">Amount</th><th className="py-2">Status</th><th className="py-2">Actions</th></tr>
						</thead>
						<tbody>
							{approvals.map(a => (
								<tr key={a.id} className="border-t"><td className="py-3">{a.project}</td><td className="py-3">${a.amount}</td><td className="py-3">{a.status}</td><td className="py-3"><Button text="Approve" className="mr-2"/><Button text="Reject" className="bg-red-500 text-white"/></td></tr>
							))}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	);
};

export default FundApprovals;
