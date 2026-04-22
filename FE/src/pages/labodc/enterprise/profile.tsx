import { useEffect, useState } from "react";
import {
  getMyCandidateProfile,
  updateMyCandidateProfile,
} from "../../../services";

type CandidateProfile = {
  studentCode: string;
  major?: string;
  year?: number;
  skills?: string;
  certifications?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
};

const Profile = () => {
  const [profile, setProfile] = useState<CandidateProfile>({
    studentCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ================= LOAD PROFILE =================
  useEffect(() => {
    setLoading(true);
    getMyCandidateProfile()
      .then((res) => {
        setProfile(res?.data?.data || res?.data || {});
      })
      .catch((err) => {
        console.error("Load profile error", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // ================= HANDLE CHANGE =================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      await updateMyCandidateProfile(profile);
      alert("Profile updated successfully");
    } catch (err) {
      console.error("Update failed", err);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>My Profile</h2>

      <form onSubmit={handleSubmit}>
        {/* STUDENT CODE */}
        <div>
          <label>Student Code</label>
          <input
            type="text"
            name="studentCode"
            value={profile.studentCode}
            disabled
          />
        </div>

        {/* MAJOR */}
        <div>
          <label>Major</label>
          <input
            type="text"
            name="major"
            value={profile.major || ""}
            onChange={handleChange}
          />
        </div>

        {/* YEAR */}
        <div>
          <label>Year</label>
          <input
            type="number"
            name="year"
            value={profile.year || ""}
            onChange={handleChange}
          />
        </div>

        {/* SKILLS */}
        <div>
          <label>Skills</label>
          <textarea
            name="skills"
            value={profile.skills || ""}
            onChange={handleChange}
            placeholder="Java, Spring Boot, React"
          />
        </div>

        {/* CERTIFICATIONS */}
        <div>
          <label>Certifications</label>
          <textarea
            name="certifications"
            value={profile.certifications || ""}
            onChange={handleChange}
          />
        </div>

        {/* PORTFOLIO */}
        <div>
          <label>Portfolio URL</label>
          <input
            type="text"
            name="portfolioUrl"
            value={profile.portfolioUrl || ""}
            onChange={handleChange}
          />
        </div>

        {/* GITHUB */}
        <div>
          <label>Github</label>
          <input
            type="text"
            name="githubUrl"
            value={profile.githubUrl || ""}
            onChange={handleChange}
          />
        </div>

        {/* LINKEDIN */}
        <div>
          <label>LinkedIn</label>
          <input
            type="text"
            name="linkedinUrl"
            value={profile.linkedinUrl || ""}
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
