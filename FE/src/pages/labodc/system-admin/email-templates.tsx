import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const EmailTemplates: React.FC = () => {
	const samples = [
		{ id: 1, name: 'Welcome Email', subject: 'Welcome to LabOdc' },
		{ id: 2, name: 'Project Assigned', subject: 'You have been assigned a project' },
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
				<Button text="Create Template" className="bg-primary-500 text-white" />
			</div>

			<Card>
				<p className="text-gray-600">Manage system email templates used for notifications and workflows.</p>
				<div className="overflow-x-auto mt-4">
					<table className="min-w-full text-sm">
						<thead>
							<tr className="text-left text-gray-600">
								<th className="py-2">Name</th>
								<th className="py-2">Subject</th>
								<th className="py-2">Actions</th>
							</tr>
						</thead>
						<tbody>
							{samples.map(s => (
								<tr key={s.id} className="border-t">
									<td className="py-3">{s.name}</td>
									<td className="py-3">{s.subject}</td>
									<td className="py-3">
										<Button text="Edit" className="mr-2" />
										<Button text="Delete" className="bg-red-500 text-white" />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	);
};

export default EmailTemplates;
