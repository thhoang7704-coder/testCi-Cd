// @ts-nocheck
/* eslint-disable */
import { Server, Model, Factory, belongsTo, hasMany } from "miragejs";
import type {
  User,
  Company,
  Talent,
  Mentor,
  Project,
  ProjectApplication,
  ProjectTeam,
  Task,
  Report,
  Payment,
  FundAllocation,
  FundDistribution,
  MentorPayment,
  Evaluation,
  MentorCandidateReview,
  MentorInvitation,
  Notification,
  ExcelTemplate,
  AuditLog,
  Setting,
  EmailTemplate,
} from "../types";

export function makeServer({ environment = "development" } = {}) {
  const server = new Server({
    environment,

    models: {
      user: Model.extend({}),
      company: Model.extend({
        projects: hasMany(),
        user: belongsTo(),
      }),
      talent: Model.extend({
        user: belongsTo(),
        applications: hasMany(),
        teams: hasMany(),
      }),
      mentor: Model.extend({
        user: belongsTo(),
        invitations: hasMany(),
        reviews: hasMany(),
        projects: hasMany(),
      }),
      project: Model.extend({
        company: belongsTo(),
        mentor: belongsTo(),
        applications: hasMany(),
        teams: hasMany(),
        tasks: hasMany(),
        reports: hasMany(),
        payments: hasMany(),
        evaluations: hasMany(),
      }),
      projectApplication: Model.extend({
        project: belongsTo(),
        talent: belongsTo(),
      }),
      projectTeam: Model.extend({
        project: belongsTo(),
        talent: belongsTo(),
      }),
      task: Model.extend({
        project: belongsTo(),
        assignedTo: belongsTo("user"),
        createdBy: belongsTo("user"),
        comments: hasMany(),
      }),
      taskComment: Model.extend({
        task: belongsTo(),
        user: belongsTo(),
      }),
      report: Model.extend({
        project: belongsTo(),
        submittedBy: belongsTo("user"),
        reviewedBy: belongsTo("user"),
      }),
      payment: Model.extend({
        project: belongsTo(),
        createdBy: belongsTo("user"),
      }),
      fundAllocation: Model.extend({
        project: belongsTo(),
        distributions: hasMany(),
      }),
      fundDistribution: Model.extend({
        fundAllocation: belongsTo(),
        recipient: belongsTo("user"),
      }),
      mentorPayment: Model.extend({
        mentor: belongsTo(),
        project: belongsTo(),
      }),
      evaluation: Model.extend({
        evaluator: belongsTo("user"),
        evaluatee: belongsTo("user"),
        project: belongsTo(),
      }),
      mentorCandidateReview: Model.extend({
        mentor: belongsTo(),
        talent: belongsTo(),
        project: belongsTo(),
      }),
      mentorInvitation: Model.extend({
        mentor: belongsTo(),
        project: belongsTo(),
        invitedBy: belongsTo("user"),
      }),
      notification: Model.extend({
        user: belongsTo(),
      }),
      excelTemplate: Model.extend({
        createdBy: belongsTo("user"),
      }),
      auditLog: Model.extend({
        user: belongsTo(),
      }),
      setting: Model.extend({
        updatedBy: belongsTo("user"),
      }),
      emailTemplate: Model.extend({
        createdBy: belongsTo("user"),
      }),
    },

    factories: {
      user: Factory.extend({
        email: (i: number) => `user${i}@example.com`,
        full_name: (i: number) => `User ${i}`,
        phone: (i: number) => `+123456789${i}`,
        role: "TALENT",
        is_active: true,
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      }),

      company: Factory.extend({
        company_name: (i: number) => `Tech Company ${i}`,
        tax_code: `TC${i.toString().padStart(3, "0")}`,
        address: `123 Business St, City ${i}`,
        industry: "Technology",
        website: (i: number) => `https://company${i}.com`,
        company_size: 50,
        description: "A technology company focused on innovation",
        contact_email: (i: number) => `contact@company${i}.com`,
        status: "APPROVED",
        created_at: new Date(),
        updated_at: new Date(),
      }),

      talent: Factory.extend({
        student_code: (i: number) => `STU${i.toString().padStart(4, "0")}`,
        major: "Computer Science",
        year: 4,
        gpa: 3.8,
        skills: ["React", "Node.js", "Python"],
        bio: "Passionate software developer",
        status: "ACTIVE",
        is_leader: false,
        created_at: new Date(),
        updated_at: new Date(),
      }),

      mentor: Factory.extend({
        expertise: ["JavaScript", "React", "Node.js"],
        years_experience: 5,
        bio: "Experienced software engineer and mentor",
        status: "ACTIVE",
        rating: 4.5,
        total_projects: 3,
        created_at: new Date(),
        updated_at: new Date(),
      }),

      project: Factory.extend({
        project_name: (i: number) => `Project ${i}`,
        description: "An innovative project for digital transformation",
        requirements: "Strong technical skills required",
        budget: 50000,
        duration_months: 6,
        max_team_size: 5,
        required_skills: ["React", "Node.js", "MongoDB"],
        status: "APPROVED",
        validation_status: "APPROVED",
        created_at: new Date(),
        updated_at: new Date(),
      }),

      task: Factory.extend({
        title: (i: number) => `Task ${i}`,
        description: "Complete the assigned task",
        status: "TODO",
        priority: "MEDIUM",
        created_at: new Date(),
        updated_at: new Date(),
      }),

      payment: Factory.extend({
        payment_type: "INITIAL",
        amount: 10000,
        currency: "USD",
        status: "COMPLETED",
        created_at: new Date(),
        updated_at: new Date(),
      }),
    },

    seeds(server) {
      // Create users for different roles
      const systemAdmin = server.create("user", {
        email: "admin@labodc.com",
        full_name: "System Admin",
        role: "SYSTEM_ADMIN" as const,
      });

      const labAdmin = server.create("user", {
        email: "lab@labodc.com",
        full_name: "Lab Admin",
        role: "LAB_ADMIN" as const,
      });

      const companyUser = server.create("user", {
        email: "company@techcorp.com",
        full_name: "Company Manager",
        role: "COMPANY" as const,
      });

      const mentorUser = server.create("user", {
        email: "mentor@expert.com",
        full_name: "John Mentor",
        role: "MENTOR" as const,
      });

      const talentUsers = server.createList("user", 5, {
        role: "TALENT" as const,
        full_name: (i: number) => `Talent ${i + 1}`,
      });

      // Create related entities
      const company = server.create("company", {
        created_by: companyUser.id,
        contact_email: companyUser.email,
      });

      const mentor = server.create("mentor", { user: mentorUser });

      talentUsers.forEach((user, index) => {
        server.create("talent", { user });
      });

      // Create projects
      const projects = server.createList("project", 3, {
        company,
        mentor,
        created_by: companyUser.id,
      });

      // Create applications and teams
      const talents = server.schema.talents.all();
      projects.forEach((project, projectIndex) => {
        const selectedTalents = talents.models.slice(
          projectIndex * 2,
          (projectIndex + 1) * 2,
        );

        selectedTalents.forEach((talent, talentIndex) => {
          server.create("projectApplication", {
            project,
            talent,
            status: talentIndex === 0 ? "APPROVED" : "PENDING",
            cover_letter: "I am very interested in this project...",
          });

          if (talentIndex === 0) {
            server.create("projectTeam", {
              project,
              talent,
              role: talentIndex === 0 ? "LEADER" : "MEMBER",
            });
          }
        });

        // Create tasks for each project
        server.createList("task", 5, {
          project,
          created_by: mentorUser.id,
        });

        // Create payments
        server.create("payment", {
          project,
          created_by: companyUser.id,
        });
      });

      // Create fund allocations
      projects.forEach((project) => {
        const allocation = server.create("fundAllocation", {
          project,
          total_budget: project.budget,
          lab_share: project.budget * 0.1,
          mentor_share: project.budget * 0.2,
          talent_share: project.budget * 0.7,
        });

        // Create distributions
        const teams = server.schema.projectTeams.where({
          projectId: project.id,
        });
        teams.models.forEach((team) => {
          server.create("fundDistribution", {
            fundAllocation: allocation,
            recipient: team.talent.user,
            amount: 5000,
            distribution_type: "SALARY",
            status: "PENDING",
          });
        });
      });

      // Create settings
      server.create("setting", {
        key: "system.maintenance_mode",
        value: "false",
        type: "BOOLEAN",
        description: "Enable maintenance mode",
        is_public: false,
        updated_by: systemAdmin.id,
      });

      // Create notifications
      server.create("notification", {
        user: talentUsers[0],
        title: "New Project Available",
        message: "A new project matching your skills has been posted",
        type: "INFO",
        is_read: false,
      });
    },

    routes() {
      this.namespace = "api";

      // Auth routes
      this.post("/auth/login", (schema, request) => {
        const { email, password } = JSON.parse(request.requestBody);
        const user = schema.users.findBy({ email });

        if (user && password === "password") {
          return {
            user: user.attrs,
            token: "mock-jwt-token-" + user.id,
          };
        }

        return new Response(401, {}, { error: "Invalid credentials" });
      });

      this.post("/auth/register", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        const user = schema.users.create({
          ...attrs,
          is_active: true,
          email_verified: false,
          created_at: new Date(),
          updated_at: new Date(),
        });

        return {
          user: user.attrs,
          token: "mock-jwt-token-" + user.id,
        };
      });

      // Generic CRUD routes for all models
      this.get("/users", (schema) => schema.users.all());
      this.get("/users/:id", (schema, request) =>
        schema.users.find(request.params.id),
      );
      this.patch("/users/:id", (schema, request) => {
        const user = schema.users.find(request.params.id);
        user.update(JSON.parse(request.requestBody));
        return user;
      });

      this.get("/companies", (schema) => schema.companies.all());
      this.get("/companies/:id", (schema, request) =>
        schema.companies.find(request.params.id),
      );
      this.post("/companies", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        return schema.companies.create(attrs);
      });
      this.patch("/companies/:id", (schema, request) => {
        const company = schema.companies.find(request.params.id);
        company.update(JSON.parse(request.requestBody));
        return company;
      });

      this.get("/talents", (schema) => schema.talents.all());
      this.get("/talents/:id", (schema, request) =>
        schema.talents.find(request.params.id),
      );
      this.post("/talents", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        return schema.talents.create(attrs);
      });
      this.patch("/talents/:id", (schema, request) => {
        const talent = schema.talents.find(request.params.id);
        talent.update(JSON.parse(request.requestBody));
        return talent;
      });

      this.get("/mentors", (schema) => schema.mentors.all());
      this.get("/mentors/:id", (schema, request) =>
        schema.mentors.find(request.params.id),
      );
      this.post("/mentors", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        return schema.mentors.create(attrs);
      });
      this.patch("/mentors/:id", (schema, request) => {
        const mentor = schema.mentors.find(request.params.id);
        mentor.update(JSON.parse(request.requestBody));
        return mentor;
      });

      this.get("/projects", (schema) => schema.projects.all());
      this.get("/projects/:id", (schema, request) =>
        schema.projects.find(request.params.id),
      );
      this.post("/projects", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        return schema.projects.create(attrs);
      });
      this.patch("/projects/:id", (schema, request) => {
        const project = schema.projects.find(request.params.id);
        project.update(JSON.parse(request.requestBody));
        return project;
      });

      // Project applications
      this.get("/project-applications", (schema) =>
        schema.projectApplications.all(),
      );
      this.post("/project-applications", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        return schema.projectApplications.create(attrs);
      });
      this.patch("/project-applications/:id", (schema, request) => {
        const application = schema.projectApplications.find(request.params.id);
        application.update(JSON.parse(request.requestBody));
        return application;
      });

      // Tasks
      this.get("/tasks", (schema) => schema.tasks.all());
      this.get("/tasks/:id", (schema, request) =>
        schema.tasks.find(request.params.id),
      );
      this.post("/tasks", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        return schema.tasks.create(attrs);
      });
      this.patch("/tasks/:id", (schema, request) => {
        const task = schema.tasks.find(request.params.id);
        task.update(JSON.parse(request.requestBody));
        return task;
      });

      // Reports
      this.get("/reports", (schema) => schema.reports.all());
      this.post("/reports", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        return schema.reports.create(attrs);
      });
      this.patch("/reports/:id", (schema, request) => {
        const report = schema.reports.find(request.params.id);
        report.update(JSON.parse(request.requestBody));
        return report;
      });

      // Payments
      this.get("/payments", (schema) => schema.payments.all());
      this.post("/payments", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        return schema.payments.create(attrs);
      });
      this.patch("/payments/:id", (schema, request) => {
        const payment = schema.payments.find(request.params.id);
        payment.update(JSON.parse(request.requestBody));
        return payment;
      });

      // Fund allocations and distributions
      this.get("/fund-allocations", (schema) => schema.fundAllocations.all());
      this.get("/fund-distributions", (schema) =>
        schema.fundDistributions.all(),
      );
      this.post("/fund-distributions", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        return schema.fundDistributions.create(attrs);
      });
      this.patch("/fund-distributions/:id", (schema, request) => {
        const distribution = schema.fundDistributions.find(request.params.id);
        distribution.update(JSON.parse(request.requestBody));
        return distribution;
      });

      // Notifications
      this.get("/notifications", (schema) => schema.notifications.all());
      this.patch("/notifications/:id/read", (schema, request) => {
        const notification = schema.notifications.find(request.params.id);
        notification.update({ is_read: true, read_at: new Date() });
        return notification;
      });

      // Settings
      this.get("/settings", (schema) => schema.settings.all());
      this.patch("/settings/:id", (schema, request) => {
        const setting = schema.settings.find(request.params.id);
        setting.update(JSON.parse(request.requestBody));
        return setting;
      });

      // Excel templates
      this.get("/excel-templates", (schema) => schema.excelTemplates.all());
      this.post("/excel-templates", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        return schema.excelTemplates.create(attrs);
      });
      this.patch("/excel-templates/:id", (schema, request) => {
        const template = schema.excelTemplates.find(request.params.id);
        template.update(JSON.parse(request.requestBody));
        return template;
      });

      // Audit logs
      this.get("/audit-logs", (schema) => schema.auditLogs.all());

      // Allow passthrough for any unmatched requests
      this.passthrough();
    },
  });

  return server;
}
