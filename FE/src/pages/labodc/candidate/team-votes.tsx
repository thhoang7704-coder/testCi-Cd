import React, { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getMyCandidateProfile } from "@/services";
import { teamVoteService, type BackendTeamVoteResponse } from "@/services/teamVote.service";

const TeamVotes: React.FC = () => {
  const [votes, setVotes] = useState<BackendTeamVoteResponse[]>([]);
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
        if (!talentId) throw new Error("Missing talentId. Please re-login.");

        const list = await teamVoteService.listByTalent(talentId);
        if (!alive) return;
        setVotes(list);
      } catch (e: any) {
        if (!alive) return;
        const apiData = e?.response?.data;
        setError(apiData?.message || apiData?.errors?.[0] || e?.message || "Failed to load team votes");
        setVotes([]);
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
    return votes.map((v) => ({
      id: String(v.id || ""),
      projectId: v.projectId || "—",
      proposalType: String(v.proposalType || "—"),
      proposalId: v.proposalId || "—",
      vote: String(v.vote || "—"),
      votedAt: v.votedAt ? String(v.votedAt).replace('T', ' ').slice(0, 19) : "—",
    }));
  }, [votes]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Team Votes</h1>
        <Button text="Refresh" className="bg-primary-500 text-white" onClick={() => window.location.reload()} />
      </div>

      <Card>
        {error ? <div className="p-4 text-sm text-red-600">{error}</div> : null}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2">#</th>
                <th className="py-2">Project</th>
                <th className="py-2">Proposal Type</th>
                <th className="py-2">Proposal ID</th>
                <th className="py-2">Vote</th>
                <th className="py-2">Voted At</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="border-t">
                  <td className="py-3" colSpan={7}>Loading...</td>
                </tr>
              ) : rows.length ? (
                rows.map((v) => (
                  <tr key={v.id} className="border-t">
                    <td className="py-3">{v.id}</td>
                    <td className="py-3">{v.projectId}</td>
                    <td className="py-3">{v.proposalType}</td>
                    <td className="py-3">{v.proposalId}</td>
                    <td className="py-3">{v.vote}</td>
                    <td className="py-3">{v.votedAt}</td>
                    <td className="py-3">
                      <Button text="View" className="btn-outline-dark" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t">
                  <td className="py-3 text-gray-500" colSpan={7}>No votes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default TeamVotes;
