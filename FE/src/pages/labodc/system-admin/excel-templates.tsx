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
  // ========================
  // STATE TEMPLATE
  // ========================
  const [templates, setTemplates] = useState<ExcelTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    templateName: "",
    description: "",
    fileUrl: "",
    templateType: "TASK_BREAKDOWN",
    version: "",
  });

  // ========================
  // STATE IMPORT
  // ========================
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [importLoading, setImportLoading] = useState(false);

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
  // CREATE TEMPLATE
  // ========================
  const handleCreateTemplate = async () => {
    try {
      const adminId = "03bd788a-8b3e-4f08-b522-4cbc2ee2149c";

      await axios.post(
        "http://localhost:8082/api/excel-templates",
        form,
        { params: { adminId } }
      );

      setShowCreate(false);
      setForm({
        templateName: "",
        description: "",
        fileUrl: "",
        templateType: "TASK_BREAKDOWN",
        version: "",
      });

      fetchTemplates();
    } catch (err: any) {
      console.error("Create template error:", err.response?.data || err);
      alert("Tạo template thất bại");
    }
  };

  // ========================
  // DOWNLOAD
  // ========================
  const handleDownload = (id: string) => {
    window.open(
      `http://localhost:8082/api/excel-templates/${id}/download`,
      "_blank"
    );
  };

  // ========================
  // IMPORT EXCEL
  // ========================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleImport = async (type: "mentor" | "talent") => {
    if (!file) {
      alert("Vui lòng chọn file Excel!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setImportLoading(true);
      const res = await axios.post(
        `http://localhost:8082/api/import/${type}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setImportResult(res.data);
      alert("Import thành công!");
    } catch (err) {
      console.error("Import error:", err);
      alert("Import thất bại!");
    } finally {
      setImportLoading(false);
    }
  };

  if (loading) return <div>Loading templates...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Excel Templates</h1>
          <Button
            text="Create Template"
            className="bg-primary-500 text-white"
            onClick={() => setShowCreate(true)}
          />
        </div>

        {/* ===== IMPORT EXCEL ===== */}
        <Card>
          <h3 className="font-semibold mb-2">Import Excel</h3>
          <input type="file" accept=".xls,.xlsx" onChange={handleFileChange} />

          <div className="mt-2 space-x-2">
            <button
              className="px-3 py-1 bg-green-500 text-white rounded"
              onClick={() => handleImport("mentor")}
              disabled={importLoading}
            >
              Import Mentor
            </button>

            <button
              className="px-3 py-1 bg-blue-500 text-white rounded"
              onClick={() => handleImport("talent")}
              disabled={importLoading}
            >
              Import Talent
            </button>
          </div>

          {importResult && (
            <div className="mt-3 text-sm">
              <p>Total: {importResult.total}</p>
              <p>Success: {importResult.success}</p>
              <p>Failed: {importResult.failed}</p>
              {importResult.errors?.length > 0 && (
                <ul className="text-red-500">
                  {importResult.errors.map((e: string, i: number) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Card>

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

      {/* ===== CREATE MODAL ===== */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-[500px] space-y-3">
            <h2>Create Excel Template</h2>

            <input
              className="w-full border p-2"
              placeholder="Template name"
              value={form.templateName}
              onChange={(e) =>
                setForm({ ...form, templateName: e.target.value })
              }
            />

            <textarea
              className="w-full border p-2"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <input
              className="w-full border p-2"
              placeholder="File URL"
              value={form.fileUrl}
              onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
            />

            <select
              className="w-full border p-2"
              value={form.templateType}
              onChange={(e) =>
                setForm({ ...form, templateType: e.target.value })
              }
            >
              <option value="PROGRESS_TRACKING">PROGRESS_TRACKING</option>
              <option value="EVALUATION">EVALUATION</option>
              <option value="TASK_BREAKDOWN">TASK_BREAKDOWN</option>
              <option value="REPORT">REPORT</option>
              
            </select>

            <input
              className="w-full border p-2"
              placeholder="Version"
              value={form.version}
              onChange={(e) => setForm({ ...form, version: e.target.value })}
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)}>Cancel</button>
              <button
                className="bg-primary-500 text-white px-4 py-2 rounded"
                onClick={handleCreateTemplate}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExcelTemplates;
