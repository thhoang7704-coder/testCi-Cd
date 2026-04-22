import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const SystemAdminSettings: React.FC = () => {
	return (
		<div className="space-y-6">
			<div className="bg-white rounded-lg border border-gray-200 p-6">
				<h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
				<p className="text-gray-600 mt-1">
					Configure system-wide rules, roles, and templates for LabOdc.
				</p>
			</div>

			<Card title="Configuration">
				<div className="space-y-4 text-sm text-slate-600">
					<div className="flex items-start justify-between gap-4">
						<div>
							<div className="font-medium text-slate-900">Fund distribution rule</div>
							<div className="text-slate-600">Default split: 70/20/10 (Team/Mentor/Lab).</div>
						</div>
						<Button text="Edit" className="btn-outline-primary btn-sm" />
					</div>

					<div className="flex items-start justify-between gap-4">
						<div>
							<div className="font-medium text-slate-900">Roles & permissions</div>
							<div className="text-slate-600">Manage role capabilities and access control.</div>
						</div>
						<Button text="Manage" className="btn-outline-primary btn-sm" />
					</div>

					<div className="flex items-start justify-between gap-4">
						<div>
							<div className="font-medium text-slate-900">Excel templates</div>
							<div className="text-slate-600">Upload and maintain official task/report templates.</div>
						</div>
						<Button text="Open" className="btn-outline-primary btn-sm" />
					</div>
				</div>
			</Card>
		</div>
	);
};

export default SystemAdminSettings;
