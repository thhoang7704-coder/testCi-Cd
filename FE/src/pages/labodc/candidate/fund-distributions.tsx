import React, { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import { getMyCandidateProfile } from "@/services";
import { paymentService, type BackendFundDistributionResponse } from "@/services/payment.service";

const FundDistributions: React.FC = () => {
  const [items, setItems] = useState<BackendFundDistributionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const me = await getMyCandidateProfile();
        const talent = me?.data?.data || me?.data;
        const talentId = String(talent?.id || "").trim();
        if (!talentId) {
          throw new Error("Missing talentId. Please re-login.");
        }

        const list = await paymentService.listFundDistributionsByTalent(talentId);
        if (!alive) return;
        setItems(list);
      } catch (e: any) {
        if (!alive) return;
        const apiData = e?.response?.data;
        setError(apiData?.message || apiData?.errors?.[0] || e?.message || "Failed to load fund distributions");
        setItems([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    void load();
    return () => {
      alive = false;
    };
  }, []);

  const rows = useMemo(() => {
    return items.map((i) => ({
      id: String(i.id || ""),
      project: i.projectName || i.projectCode || i.projectId || "—",
      amount: typeof i.amount === 'number' ? i.amount : Number(String(i.amount || 0)),
      date: i.paidDate || (i.createdAt ? String(i.createdAt).slice(0, 10) : "—"),
      status: String(i.status || "—"),
      recipient: i.talentName || i.talentStudentCode || i.talentId || "—",
    }));
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Fund Distributions</h1>
      </div>

      <Card title="Recent Distributions">
        {error ? <div className="p-4 text-sm text-red-600">{error}</div> : null}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2">ID</th>
                <th className="py-2">Project</th>
                <th className="py-2">Recipient</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Date</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="border-t">
                  <td className="py-3" colSpan={6}>Loading...</td>
                </tr>
              ) : rows.length ? (
                rows.map((i) => (
                  <tr key={i.id} className="border-t">
                    <td className="py-3">{i.id}</td>
                    <td className="py-3">{i.project}</td>
                    <td className="py-3">{i.recipient}</td>
                    <td className="py-3">${Number.isFinite(i.amount) ? i.amount.toLocaleString() : "0"}</td>
                    <td className="py-3">{i.date}</td>
                    <td className="py-3">{i.status}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-t">
                  <td className="py-3 text-gray-500" colSpan={6}>No fund distributions.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default FundDistributions;
