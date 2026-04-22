import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import InputGroup from "@/components/ui/InputGroup";
import Textarea from "@/components/ui/Textarea";

import {
  createCandidateProfile,
  getMyCandidateProfile,
  updateMyCandidateProfile,
  type CandidateProfilePayload,
} from "@/services";

type FieldErrors = Partial<Record<keyof CandidateProfilePayload, string>>;

const isValidHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const ProfileUpdatePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    token,
    roles: authRoles,
    user,
  } = useSelector((state: any) => state.auth);

  const tokenRoles = useMemo(() => {
    const raw = Array.isArray(authRoles) ? authRoles : [];
    return raw.map((r: any) =>
      String(r)
        .replace(/^ROLE_/, "")
        .toUpperCase(),
    );
  }, [authRoles]);

  const isTalent = tokenRoles.includes("TALENT") || user?.role === "TALENT";
  const isUser = tokenRoles.includes("USER") || user?.role === "USER";

  const emptyProfile: CandidateProfilePayload = useMemo(
    () => ({
      studentCode: "",
      major: "",
      year: undefined,
      skills: "",
      certifications: "",
      portfolioUrl: "",
      githubUrl: "",
      linkedinUrl: "",
    }),
    [],
  );

  const [profile, setProfile] = useState<CandidateProfilePayload>(emptyProfile);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const prefillFromMyProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});
    try {
      const res = await getMyCandidateProfile();
      const data = res?.data?.data || res?.data || {};
      setProfile({
        studentCode: data.studentCode || data.student_code || "",
        major: data.major || "",
        year: data.year ?? undefined,
        skills: data.skills || "",
        certifications: data.certifications || "",
        portfolioUrl: data.portfolioUrl || data.portfolio_url || "",
        githubUrl: data.githubUrl || data.github_url || "",
        linkedinUrl: data.linkedinUrl || data.linkedin_url || "",
      });
    } catch (err: any) {
      const apiData = err?.response?.data;
      const status = err?.response?.status;
      if (status === 403) {
        setError("You don't have permission to load this profile.");
        return;
      }
      setError(
        apiData?.errors?.join?.("; ") ||
          apiData?.message ||
          "Failed to load profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]:
        name === "year" ? (value === "" ? undefined : Number(value)) : value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }) as any);
  };

  const validateForm = (): boolean => {
    const next: FieldErrors = {};

    if (!profile.studentCode?.trim()) {
      next.studentCode = "Student ID is required.";
    }

    const portfolioUrl = profile.portfolioUrl?.trim();
    if (portfolioUrl && !isValidHttpUrl(portfolioUrl)) {
      next.portfolioUrl = "Invalid URL. Use http(s)://...";
    }

    const githubUrl = profile.githubUrl?.trim();
    if (githubUrl && !isValidHttpUrl(githubUrl)) {
      next.githubUrl = "Invalid URL. Use http(s)://...";
    }

    const linkedinUrl = profile.linkedinUrl?.trim();
    if (linkedinUrl && !isValidHttpUrl(linkedinUrl)) {
      next.linkedinUrl = "Invalid URL. Use http(s)://...";
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    if (!token) {
      setError("Please sign in to update your profile.");
      return;
    }
    if (!isTalent && !isUser) {
      setError("Your account is not allowed to update this profile.");
      return;
    }
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const payload: CandidateProfilePayload = {
        studentCode: profile.studentCode,
        major: profile.major || undefined,
        year: typeof profile.year === "number" ? profile.year : undefined,
        skills: profile.skills || undefined,
        certifications: profile.certifications || undefined,
        portfolioUrl: profile.portfolioUrl || undefined,
        githubUrl: profile.githubUrl || undefined,
        linkedinUrl: profile.linkedinUrl || undefined,
      };

      const res = isTalent
        ? await updateMyCandidateProfile(payload)
        : await createCandidateProfile(payload);
      const data = res?.data?.data || res?.data || {};
      setProfile({
        studentCode:
          data.studentCode || data.student_code || payload.studentCode,
        major: data.major ?? payload.major ?? "",
        year: data.year ?? payload.year,
        skills: data.skills ?? payload.skills ?? "",
        certifications: data.certifications ?? payload.certifications ?? "",
        portfolioUrl:
          data.portfolioUrl || data.portfolio_url || payload.portfolioUrl || "",
        githubUrl: data.githubUrl || data.github_url || payload.githubUrl || "",
        linkedinUrl:
          data.linkedinUrl || data.linkedin_url || payload.linkedinUrl || "",
      });

      setSuccess("Saved successfully.");
      setTimeout(() => navigate("/candidate/profile"), 300);
    } catch (err: any) {
      const apiData = err?.response?.data;
      const message =
        apiData?.errors?.join?.("; ") ||
        apiData?.message ||
        "Profile update failed.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card
        title="Update Profile"
        subtitle="Skills, certifications, and portfolio"
        bodyClass="p-6"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="Student ID"
              name="studentCode"
              value={profile.studentCode}
              onChange={handleChange}
              disabled={false}
              placeholder="Student ID"
              error={
                fieldErrors.studentCode
                  ? { message: fieldErrors.studentCode }
                  : undefined
              }
            />
            <InputGroup
              label="Major"
              name="major"
              value={profile.major || ""}
              onChange={handleChange}
              placeholder="Computer Science"
            />
            <InputGroup
              label="Years of experience"
              type="number"
              name="year"
              value={profile.year ?? ""}
              onChange={handleChange}
              placeholder="2"
            />
            <InputGroup
              label="Portfolio URL"
              name="portfolioUrl"
              value={profile.portfolioUrl || ""}
              onChange={handleChange}
              placeholder="https://portfolio.example.com"
              error={
                fieldErrors.portfolioUrl
                  ? { message: fieldErrors.portfolioUrl }
                  : undefined
              }
            />
            <InputGroup
              label="GitHub URL"
              name="githubUrl"
              value={profile.githubUrl || ""}
              onChange={handleChange}
              placeholder="https://github.com/username"
              error={
                fieldErrors.githubUrl
                  ? { message: fieldErrors.githubUrl }
                  : undefined
              }
            />
            <InputGroup
              label="LinkedIn URL"
              name="linkedinUrl"
              value={profile.linkedinUrl || ""}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
              error={
                fieldErrors.linkedinUrl
                  ? { message: fieldErrors.linkedinUrl }
                  : undefined
              }
            />
          </div>

          <Textarea
            label="Skills (comma-separated)"
            name="skills"
            row={3}
            value={profile.skills || ""}
            onChange={handleChange}
            placeholder="Java, Spring Boot, React"
          />
          <Textarea
            label="Certifications"
            name="certifications"
            row={3}
            value={profile.certifications || ""}
            onChange={handleChange}
            placeholder="AWS, TOEIC..."
          />

          {error && <div className="text-sm text-danger-500">{error}</div>}
          {success && <div className="text-sm text-success-500">{success}</div>}

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              text={
                saving
                  ? "Saving..."
                  : isTalent
                    ? "Save Changes"
                    : "Create Profile"
              }
              isLoading={saving}
              disabled={saving || loading || !token}
              className="btn-primary"
            />
            <Button
              type="button"
              text="Clear"
              className="btn-outline-dark"
              disabled={saving || loading}
              onClick={() => {
                setProfile(emptyProfile);
                setFieldErrors({});
                setError(null);
                setSuccess(null);
              }}
            />
            {isTalent && (
              <Button
                type="button"
                text={
                  loading ? "Loading..." : "Prefill from my current profile"
                }
                className="btn-outline-dark"
                disabled={saving || loading}
                isLoading={loading}
                onClick={prefillFromMyProfile}
              />
            )}
            <Link to="/candidate/profile">
              <Button text="Cancel" className="btn-outline-dark" />
            </Link>
            {loading && (
              <span className="text-sm text-slate-500">Loading...</span>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProfileUpdatePage;
