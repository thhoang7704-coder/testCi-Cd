import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface ExcelTemplate {
  id: string;
  templateName: string;
  description?: string;
  fileUrl: string;
  templateType: string;
  version?: string;
  isActive?: boolean;
  downloadCount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

const ExcelTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<ExcelTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========================
  // FETCH TEMPLATES
  // ========================
  const fetchTemplates = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8082/api/excel-templates/active"
      );
      setTemplates(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (err) {
      console.error("Get templates error:", err);
      setError("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // ========================
  // DOWNLOAD
  // ========================
  const handleDownload = (id: string) => {
    window.open(
      `http://localhost:8082/api/excel-templates/${id}/download`,
      "_blank"
    );
  };

  if (loading) return <div>Loading templates...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Excel Templates</h1>
        </div>

        {/* ===== TABLE ===== */}
        <Card>
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Type</th>
                <th>Version</th>
                <th>Downloads</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id}>
                  <td>{t.templateName}</td>
                  <td>{t.description || "-"}</td>
                  <td>{t.templateType}</td>
                  <td>{t.version || "-"}</td>
                  <td>{t.downloadCount}</td>
                  <td>
                    <button
                      className="text-blue-600"
                      onClick={() => handleDownload(t.id)}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
};

export default ExcelTemplates;
