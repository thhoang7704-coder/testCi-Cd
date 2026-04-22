import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Auth components
const Login = lazy(() => import("./pages/auth/login"));
const Register = lazy(() => import("./pages/auth/register"));
const ForgotPass = lazy(() => import("./pages/auth/forgot-password"));
const Landing = lazy(() => import("./pages/landing"));
const Error = lazy(() => import("./pages/404"));

// Layouts
import Layout from "./layout/Layout";
import AuthLayout from "./layout/AuthLayout";
import AuthGuard from "./components/auth/AuthGuard";
import AdminRoute from "./Routes/AdminRoute";
import LabAdminRoute from "./Routes/LabAdminRoute";
import CompanyRoute from "./Routes/CompanyRoute";
import MentorRoute from "./Routes/MentorRoute";
import UserRoute from "./Routes/UserRoute";

// Loading component
import Loading from "@/components/Loading";

// Lazy load all LabOdc pages
// Candidate/Talent pages
const CandidateDashboard = lazy(
  () => import("./pages/labodc/candidate/dashboard"),
);
const CandidateProfile = lazy(() => import("./pages/labodc/candidate/profile"));
const CandidateProfileUpdate = lazy(
  () => import("./pages/labodc/candidate/profile-update"),
);
const BrowseProjects = lazy(
  () => import("./pages/labodc/candidate/browse-projects"),
);
const ProjectDetail = lazy(
  () => import("./pages/labodc/candidate/project-detail"),
);
const MyApplications = lazy(
  () => import("./pages/labodc/candidate/applications"),
);
const MyProjects = lazy(() => import("./pages/labodc/candidate/my-projects"));
const TaskDetail = lazy(() => import("./pages/labodc/candidate/task-detail"));
const CandidateTasks = lazy(() => import("./pages/labodc/candidate/tasks.tsx"));
const FundDistributions = lazy(
  () => import("./pages/labodc/candidate/fund-distributions"),
);
const CandidateReports = lazy(() => import("./pages/labodc/candidate/reports"));
const CandidateEvaluations = lazy(
  () => import("./pages/labodc/candidate/evaluations"),
);
const CompanyVerification = lazy(
  () => import("./pages/labodc/candidate/company-verification"),
);

// Company/Enterprise pages
const EnterpriseDashboard = lazy(
  () => import("./pages/labodc/enterprise/dashboard"),
);
// CompanyProfile removed - use common `profile` page
const ProjectList = lazy(() => import("./pages/labodc/enterprise/projects"));
const CreateProject = lazy(
  () => import("./pages/labodc/enterprise/create-project"),
);
const EditProject = lazy(
  () => import("./pages/labodc/enterprise/edit-project"),
);
const ProjectDetailEnterprise = lazy(
  () => import("./pages/labodc/enterprise/project-detail"),
);
const Payments = lazy(() => import("./pages/labodc/enterprise/payments"));
const ChangeRequests = lazy(
  () => import("./pages/labodc/enterprise/change-requests"),
);
const CompanyEvaluations = lazy(
  () => import("./pages/labodc/enterprise/evaluations"),
);
const EnterpriseReports = lazy(
  () => import("./pages/labodc/enterprise/reports"),
);

// Mentor pages
const MentorDashboard = lazy(() => import("./pages/labodc/mentor/dashboard"));
// MentorProfile removed - use common `profile` page
const MentorInvitations = lazy(
  () => import("./pages/labodc/mentor/invitations"),
);
const CandidateReviews = lazy(
  () => import("./pages/labodc/mentor/candidate-reviews"),
);
const MentorProjectWorkspace = lazy(
  () => import("./pages/labodc/mentor/project-workspace"),
);
const MentorApplications = lazy(
  () => import("./pages/labodc/mentor/applications"),
);
const MentorReports = lazy(() => import("./pages/labodc/mentor/reports"));
const MentorEvaluations = lazy(
  () => import("./pages/labodc/mentor/evaluations"),
);
const FundApprovals = lazy(
  () => import("./pages/labodc/mentor/fund-approvals"),
);
const MentorExcelTemplates = lazy(
  () => import("./pages/labodc/mentor/excel-templates"),
);

// Lab Admin pages
const LabAdminDashboard = lazy(
  () => import("./pages/labodc/lab-admin/dashboard"),
);
const ValidateProjects = lazy(
  () => import("./pages/labodc/lab-admin/validate-projects"),
);
const PaymentsOverview = lazy(
  () => import("./pages/labodc/lab-admin/payments-overview"),
);
const FundAllocations = lazy(
  () => import("./pages/labodc/lab-admin/fund-allocations"),
);
const LabFundAdvances = lazy(
  () => import("./pages/labodc/lab-admin/lab-fund-advances"),
);
const TransparencyReport = lazy(
  () => import("./pages/labodc/lab-admin/transparency-report"),
);
const ChangeRequestApprovals = lazy(
  () => import("./pages/labodc/lab-admin/change-request-approvals"),
);
const LabAdminEvaluations = lazy(
  () => import("./pages/labodc/lab-admin/evaluations"),
);
const RejectedProjects = lazy(
  () => import("./pages/labodc/lab-admin/rejected-projects"),
);
const RejectedCompanies = lazy(
  () => import("./pages/labodc/lab-admin/rejected-companies"),
);
const RiskRecords = lazy(() => import("./pages/labodc/lab-admin/risk-records"));
const CompanyApprovals = lazy(
  () => import("./pages/labodc/lab-admin/company-approvals"),
);
const ApprovedCompanies = lazy(
  () => import("./pages/labodc/lab-admin/approved-companies"),
);
const ApprovedProjects = lazy(
  () => import("./pages/labodc/lab-admin/approved-projects"),
);
const MentorsManagement = lazy(
  () => import("./pages/labodc/lab-admin/mentors"),
);
const TalentsManagement = lazy(
  () => import("./pages/labodc/lab-admin/talents"),
);
const LabAdminReports = lazy(() => import("./pages/labodc/lab-admin/reports"));

// System Admin pages
const SystemAdminDashboard = lazy(
  () => import("./pages/labodc/system-admin/dashboard"),
);
const UserManagement = lazy(
  () => import("./pages/labodc/system-admin/user-management"),
);
const Settings = lazy(() => import("./pages/labodc/system-admin/settings"));
const ExcelTemplates = lazy(
  () => import("./pages/labodc/system-admin/excel-templates"),
);
const EmailTemplates = lazy(
  () => import("./pages/labodc/system-admin/email-templates"),
);
const AuditLogs = lazy(() => import("./pages/labodc/system-admin/audit-logs"));

// Common pages
const Profile = lazy(() => import("./pages/profile"));
const ProfileRedirect = lazy(() => import("./pages/profile-redirect"));
const Notifications = lazy(() => import("./pages/notifications"));

function App() {
  return (
    <main className="App relative">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<AuthLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPass />} />
        </Route>

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <AuthGuard requireAuth={true}>
              <Layout />
            </AuthGuard>
          }
        >
          {/* Candidate/Talent (Users) routes */}
          <Route element={<UserRoute />}>
            <Route
              path="candidate/dashboard"
              element={<CandidateDashboard />}
            />
            <Route path="candidate/profile" element={<CandidateProfile />} />
            <Route
              path="candidate/profile/update"
              element={<CandidateProfileUpdate />}
            />
            <Route
              path="candidate/browse-projects"
              element={<BrowseProjects />}
            />
            <Route
              path="candidate/view-projects"
              element={<BrowseProjects />}
            />
            <Route path="candidate/project/:id" element={<ProjectDetail />} />
            <Route path="candidate/applications" element={<MyApplications />} />
            <Route path="candidate/my-projects" element={<MyProjects />} />
            <Route path="candidate/tasks" element={<CandidateTasks />} />
            <Route path="candidate/task/:id" element={<TaskDetail />} />
            <Route
              path="candidate/fund-distributions"
              element={<FundDistributions />}
            />
            <Route path="candidate/reports" element={<CandidateReports />} />
            <Route
              path="candidate/evaluations"
              element={<CandidateEvaluations />}
            />
              <Route
                path="candidate/company-verification"
                element={<CompanyVerification />}
              />
          </Route>

          {/* Company/Enterprise routes */}
          <Route element={<CompanyRoute />}>
            <Route
              path="enterprise/dashboard"
              element={<EnterpriseDashboard />}
            />
            <Route path="enterprise/profile" element={<Profile />} />
            <Route path="enterprise/projects" element={<ProjectList />} />
            <Route
              path="enterprise/projects/create"
              element={<CreateProject />}
            />
            <Route
              path="enterprise/projects/:id/edit"
              element={<EditProject />}
            />
            <Route
              path="enterprise/projects/:id"
              element={<ProjectDetailEnterprise />}
            />
            <Route path="enterprise/payments" element={<Payments />} />
            <Route
              path="enterprise/change-requests"
              element={<ChangeRequests />}
            />
            <Route
              path="enterprise/evaluations"
              element={<CompanyEvaluations />}
            />
            <Route path="enterprise/reports" element={<EnterpriseReports />} />
          </Route>

          {/* Mentor routes */}
          <Route element={<MentorRoute />}>
            <Route path="mentor/dashboard" element={<MentorDashboard />} />
            <Route path="mentor/profile" element={<Profile />} />
            <Route path="mentor/invitations" element={<MentorInvitations />} />
            <Route
              path="mentor/candidate-reviews"
              element={<CandidateReviews />}
            />
            <Route
              path="mentor/applications"
              element={<MentorApplications />}
            />
            <Route path="mentor/project" element={<MentorProjectWorkspace />} />
            <Route
              path="mentor/project/:id"
              element={<MentorProjectWorkspace />}
            />
            <Route path="mentor/reports" element={<MentorReports />} />
            <Route path="mentor/evaluations" element={<MentorEvaluations />} />
            <Route path="mentor/fund-approvals" element={<FundApprovals />} />
            <Route path="mentor/excel-templates" element={<MentorExcelTemplates />} />
          </Route>

          {/* Lab Admin routes */}
          <Route element={<LabAdminRoute />}>
            <Route path="lab-admin/dashboard" element={<LabAdminDashboard />} />
            <Route path="lab-admin/profile" element={<Profile />} />
            <Route
              path="lab-admin/evaluations"
              element={<LabAdminEvaluations />}
            />
            <Route
              path="lab-admin/validate-projects"
              element={<ValidateProjects />}
            />
            <Route
              path="lab-admin/approved-projects"
              element={<ApprovedProjects />}
            />
            <Route
              path="lab-admin/payments-overview"
              element={<PaymentsOverview />}
            />
            <Route
              path="lab-admin/fund-allocations"
              element={<FundAllocations />}
            />
            <Route
              path="lab-admin/lab-fund-advances"
              element={<LabFundAdvances />}
            />
            <Route
              path="lab-admin/transparency-report"
              element={<TransparencyReport />}
            />
            <Route
              path="lab-admin/rejected-projects"
              element={<RejectedProjects />}
            />
            <Route
              path="lab-admin/rejected-companies"
              element={<RejectedCompanies />}
            />
            <Route
              path="lab-admin/change-request-approvals"
              element={<ChangeRequestApprovals />}
            />
            <Route path="lab-admin/risk-records" element={<RiskRecords />} />
            <Route
              path="lab-admin/company-approvals"
              element={<CompanyApprovals />}
            />
            <Route
              path="lab-admin/approved-companies"
              element={<ApprovedCompanies />}
            />
            <Route path="lab-admin/mentors" element={<MentorsManagement />} />
            <Route path="lab-admin/talents" element={<TalentsManagement />} />
            <Route path="lab-admin/reports" element={<LabAdminReports />} />
            <Route
              path="lab-admin/students"
              element={<Navigate to="/lab-admin/transparency-report" replace />}
            />
          </Route>

          {/* System Admin routes */}
          <Route element={<AdminRoute />}>
            <Route
              path="system-admin/dashboard"
              element={<SystemAdminDashboard />}
            />
            <Route path="system-admin/profile" element={<Profile />} />
            <Route path="system-admin/users" element={<UserManagement />} />
            <Route path="system-admin/settings" element={<Settings />} />
            <Route
              path="system-admin/excel-templates"
              element={<ExcelTemplates />}
            />
            <Route
              path="system-admin/email-templates"
              element={<EmailTemplates />}
            />
            <Route path="system-admin/audit-logs" element={<AuditLogs />} />
          </Route>

          {/* Common routes */}
          <Route path="profile" element={<ProfileRedirect />} />
          <Route path="notifications" element={<Notifications />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/404" />} />
        </Route>

        {/* Error page */}
        <Route
          path="/404"
          element={
            <Suspense fallback={<Loading />}>
              <Error />
            </Suspense>
          }
        />
      </Routes>
    </main>
  );
}

export default App;
