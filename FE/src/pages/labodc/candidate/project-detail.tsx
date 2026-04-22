import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { projectService } from "@/services/project.service";
import { Project } from "@/types";
// Using emoji icons instead of heroicons

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const projectData = await projectService.getProjectFromBackend(id!);
      setProject(projectData);
    } catch (error) {
      console.error("Error loading project:", error);
      toast.error((error as any)?.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!project) return;

    try {
      setApplying(true);
      await projectService.applyToProjectAsTalent(
        project.id,
        "I am very interested in this project and believe my skills align well with the requirements.",
      );
      toast.success("Applied successfully");
      // Refresh project data
      await loadProject();
    } catch (error) {
      console.error("Error applying for project:", error);
      toast.error((error as any)?.message || "Apply failed");
    } finally {
      setApplying(false);
    }
  };

  const canApply =
    Boolean(project) &&
    String((project as any).validation_status || "").toUpperCase() ===
      "APPROVED";

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found.</p>
        <Link to="/candidate/browse-projects">
          <Button
            text="Back to Projects"
            className="mt-4"
            isLoading={false}
            disabled={false}
            children=""
            icon=""
            loadingClass=""
            iconPosition="left"
            iconClass=""
            link=""
            onClick={() => {}}
            div={false}
          />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/candidate/browse-projects">
            <Button
              text="←"
              className="bg-white border border-gray-300 p-2"
              isLoading={false}
              disabled={false}
              children=""
              icon=""
              loadingClass=""
              iconPosition="left"
              iconClass=""
              link=""
              onClick={() => {}}
              div={false}
            />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {project.project_name}
            </h1>
            <p className="text-gray-600">Project Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <StatusBadge status={project.status} />
          <Button
            text="Apply Now"
            className="bg-primary-500 text-white"
            onClick={handleApply}
            isLoading={applying}
            disabled={!canApply || applying}
            children=""
            icon=""
            loadingClass=""
            iconPosition="left"
            iconClass=""
            link=""
            div={false}
          />
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card
            title="Project Description"
            subtitle=""
            headerslot=""
            noborder={false}
          >
            <div className="prose max-w-none">
              <p className="text-gray-700">{project.description}</p>
            </div>
          </Card>

          {/* Requirements */}
          <Card title="Requirements" subtitle="" headerslot="" noborder={false}>
            <div className="prose max-w-none">
              <p className="text-gray-700">{project.requirements}</p>
            </div>
          </Card>

          {/* Required Skills */}
          <Card
            title="Required Skills"
            subtitle=""
            headerslot=""
            noborder={false}
          >
            <div className="flex flex-wrap gap-2">
              {project.required_skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* Project Info Sidebar */}
        <div className="space-y-6">
          <Card
            title="Project Information"
            subtitle=""
            headerslot=""
            noborder={false}
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-green-600">💰</span>
                <div>
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="font-semibold">
                    ${project.budget.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-blue-600">📅</span>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold">
                    {project.duration_months} months
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-purple-600">👥</span>
                <div>
                  <p className="text-sm text-gray-600">Team Size</p>
                  <p className="font-semibold">
                    {project.max_team_size} members
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-red-600">📍</span>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <StatusBadge status={project.status} />
                </div>
              </div>
            </div>
          </Card>

          <Card title="Timeline" subtitle="" headerslot="" noborder={false}>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-medium">
                  {project.start_date
                    ? new Date(project.start_date).toLocaleDateString()
                    : "TBD"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-medium">
                  {project.end_date
                    ? new Date(project.end_date).toLocaleDateString()
                    : "TBD"}
                </p>
              </div>
            </div>
          </Card>

          {/* Apply Button */}
          <div className="bg-primary-50 p-4 rounded-lg">
            <h3 className="font-medium text-primary-900 mb-2">
              Ready to Apply?
            </h3>
            <p className="text-sm text-primary-700 mb-4">
              Submit your application and cover letter to join this project.
            </p>
            <Button
              text="Apply for Project"
              className="w-full bg-primary-500 text-white"
              onClick={handleApply}
              isLoading={applying}
              disabled={!canApply || applying}
              children=""
              icon=""
              loadingClass=""
              iconPosition="left"
              iconClass=""
              link=""
              div={false}
            />
            {!canApply ? (
              <div className="text-xs text-primary-700 mt-2">
                Applications are available after the project is approved.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
