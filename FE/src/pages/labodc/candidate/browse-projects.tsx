import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";
import StatusBadge from "@/components/ui/StatusBadge";
import { projectService } from "@/services/project.service";
import { Project } from "@/types";

// Simple Error Boundary to avoid blank white screen on render exceptions
class ErrorBoundary extends React.Component<
  any,
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: any) {
    console.error("Render error in BrowseProjects", error, info);
  }
  render() {
    if (this.state.hasError) {
      const err = this.state.error as Error | undefined;
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Browse Projects</h2>
          <p className="text-gray-600">
            An error occurred while rendering this page. Showing a fallback UI.
          </p>
          <div className="mt-6 max-w-3xl mx-auto text-left">
            <div className="bg-white dark:bg-slate-800 p-4 rounded border">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-red-600">
                    {err?.message || "Unknown error"}
                  </div>
                  {err?.stack && (
                    <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap max-h-52 overflow-auto">
                      {err.stack}
                    </pre>
                  )}
                </div>
                <div className="ml-4">
                  <button
                    className="px-3 py-1 bg-primary-500 text-white rounded"
                    onClick={() =>
                      this.setState({ hasError: false, error: undefined })
                    }
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="p-4 border rounded bg-white dark:bg-slate-800"
              >
                <div className="h-32 bg-gray-100 rounded mb-3" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const BrowseProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState({ min: "", max: "" });
  const [durationFilter, setDurationFilter] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, selectedSkills, budgetRange, durationFilter]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAvailableProjectsForTalent();
      setProjects(response.data);
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (projectId: string) => {
    try {
      setApplyingId(projectId);
      await projectService.applyToProjectAsTalent(
        projectId,
        "I am interested in this project and believe my skills align with the requirements.",
      );
      toast.success("Applied successfully");
    } catch (error: any) {
      const apiData = error?.response?.data;
      const message =
        apiData?.errors?.join?.("; ") || apiData?.message || "Apply failed";
      toast.error(message);
    } finally {
      setApplyingId(null);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          (project.project_name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (project.description || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (project.required_skills || []).some((skill: any) => {
            const s =
              typeof skill === "string"
                ? skill
                : (skill.label ?? skill.value ?? "");
            return s.toLowerCase().includes(searchTerm.toLowerCase());
          }),
      );
    }

    // Skills filter
    if (selectedSkills.length > 0) {
      filtered = filtered.filter((project) =>
        selectedSkills.every((skill) =>
          (project.required_skills || [])
            .map((s: any) =>
              typeof s === "string" ? s : (s.value ?? s.label ?? ""),
            )
            .includes(skill),
        ),
      );
    }

    // Budget filter
    if (budgetRange.min) {
      filtered = filtered.filter(
        (project) => (project.budget ?? 0) >= parseInt(budgetRange.min),
      );
    }
    if (budgetRange.max) {
      filtered = filtered.filter(
        (project) => (project.budget ?? 0) <= parseInt(budgetRange.max),
      );
    }

    // Duration filter
    if (durationFilter) {
      const months = parseInt(durationFilter);
      filtered = filtered.filter(
        (project) => (project.duration_months ?? 0) <= months,
      );
    }

    setFilteredProjects(filtered);
  };

  const skillOptions = [
    { value: "React", label: "React" },
    { value: "Node.js", label: "Node.js" },
    { value: "Python", label: "Python" },
    { value: "JavaScript", label: "JavaScript" },
    { value: "TypeScript", label: "TypeScript" },
    { value: "Java", label: "Java" },
    { value: "C++", label: "C++" },
    { value: "MongoDB", label: "MongoDB" },
    { value: "PostgreSQL", label: "PostgreSQL" },
  ];

  const durationOptions = [
    { value: "", label: "All Durations" },
    { value: "3", label: "Up to 3 months" },
    { value: "6", label: "Up to 6 months" },
    { value: "12", label: "Up to 12 months" },
  ];

  // Pagination
  const pageSize = 9;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const goToPage = (p: number) => {
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Browse Projects
            </h1>
            <p className="text-gray-600 mt-1">
              Find and apply for available projects
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card
          title="Filters"
          subtitle=""
          headerslot=""
          noborder={false}
          className=""
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Textinput
                  name="search"
                  label=""
                  type="text"
                  placeholder="Search projects, skills, or descriptions..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchTerm(e.target.value)
                  }
                  className="h-[40px]"
                />
              </div>
              <Button
                text="Search"
                className="bg-primary-500 text-white"
                onClick={() => {
                  setCurrentPage(1);
                  filterProjects();
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Skills
                </label>
                <Select
                  label=""
                  name="skills"
                  options={skillOptions}
                  placeholder="Select skills..."
                  multiple
                  value={selectedSkills}
                  onChange={(e: any) => {
                    const opts = Array.from(e.target.selectedOptions || []).map(
                      (o: any) => o.value,
                    );
                    setSelectedSkills(opts);
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Duration
                </label>
                <Select
                  label=""
                  name="duration"
                  options={durationOptions}
                  value={durationFilter}
                  onChange={(e: any) => setDurationFilter(e.target.value)}
                  placeholder="Select duration..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Budget
                  </label>
                  <Textinput
                    name="minBudget"
                    type="text"
                    placeholder="0"
                    value={budgetRange.min}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setBudgetRange((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                    className="h-[40px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Budget
                  </label>
                  <Textinput
                    name="maxBudget"
                    type="text"
                    placeholder="100000"
                    value={budgetRange.max}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setBudgetRange((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                    className="h-[40px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Results */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            {filteredProjects.length}{" "}
            {filteredProjects.length === 1 ? "Project" : "Projects"} Available
          </h2>
          <Button
            text="Clear Filters"
            className="bg-white border border-gray-300 text-gray-700"
            onClick={() => {
              setSearchTerm("");
              setSelectedSkills([]);
              setBudgetRange({ min: "", max: "" });
              setDurationFilter("");
            }}
          />
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                title=""
                subtitle=""
                headerslot=""
                noborder={false}
                className="animate-pulse"
              >
                <div className="h-48 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects match your criteria.</p>
            <div className="mt-4 flex justify-center">
              <Button
                text="Clear Filters"
                className="bg-primary-500 text-white"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSkills([]);
                  setBudgetRange({ min: "", max: "" });
                  setDurationFilter("");
                }}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProjects.map((project) => (
                <Card
                  key={project.id}
                  title=""
                  subtitle=""
                  headerslot=""
                  noborder={false}
                  className="hover:shadow-lg transition-shadow"
                >
                  <div className="space-y-4">
                    <div className="h-40 w-full bg-gradient-to-r from-slate-50 to-slate-100 rounded mb-3 flex items-center justify-center text-gray-400">
                      <span className="text-4xl font-bold">
                        {(project.project_name || "").charAt(0) || "P"}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {project.project_name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3 mt-1">
                        {project.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Budget:</span>
                        <span className="font-medium">
                          ${Number(project.budget || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Duration:</span>
                        <span className="font-medium">
                          {project.duration_months ?? 0} months
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Team Size:
                        </span>
                        <span className="font-medium">
                          {project.max_team_size ?? "-"} members
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm text-gray-600">
                        Required Skills:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(project.required_skills || [])
                          .slice(0, 3)
                          .map((skill: any, index: number) => {
                            const label =
                              typeof skill === "string"
                                ? skill
                                : (skill.label ??
                                  skill.value ??
                                  JSON.stringify(skill));
                            return (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {label}
                              </span>
                            );
                          })}
                        {(project.required_skills || []).length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                            +{(project.required_skills || []).length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <StatusBadge status={project.status} />
                      <div className="flex items-center gap-2">
                        <Link to={`/candidate/project/${project.id}`}>
                          <Button
                            text="View Details"
                            className="btn-outline-dark btn-sm"
                          />
                        </Link>
                        <Button
                          text="Apply"
                          className="bg-primary-500 text-white btn-sm"
                          onClick={() => handleApply(String(project.id))}
                          isLoading={applyingId === String(project.id)}
                          disabled={applyingId === String(project.id)}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                <button
                  className="px-3 py-1 border rounded"
                  onClick={() => goToPage(currentPage - 1)}
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={`px-3 py-1 rounded ${
                      currentPage === i + 1
                        ? "bg-primary-500 text-white"
                        : "border"
                    }`}
                    onClick={() => goToPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="px-3 py-1 border rounded"
                  onClick={() => goToPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default BrowseProjects;
