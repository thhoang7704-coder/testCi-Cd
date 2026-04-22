import React from "react";
import Card from "@/components/ui/Card";

const CandidateReviews: React.FC = () => {
  const reviews = [
    { id: 1, candidate: "Alice", score: 4.0, comment: "Good fit" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Candidate Reviews</h1>
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2">Candidate</th>
                <th className="py-2">Score</th>
                <th className="py-2">Comment</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-3">{r.candidate}</td>
                  <td className="py-3">{r.score}</td>
                  <td className="py-3">{r.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default CandidateReviews;
