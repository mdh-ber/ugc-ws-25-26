import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const passwordRules = {
  length: (pwd) => pwd.length >= 8,
  upper: (pwd) => /[A-Z]/.test(pwd),
  lower: (pwd) => /[a-z]/.test(pwd),
  digit: (pwd) => /[0-9]/.test(pwd),
  special: (pwd) => /[^A-Za-z0-9]/.test(pwd),
};

function Rule({ ok, text }) {
  return (
    <li className={`flex items-center gap-2 ${ok ? "text-green-600" : "text-gray-500"}`}>
      <span className="font-bold">{ok ? "✔" : "✖"}</span>
      <span>{text}</span>
    </li>
  );
}

function Register() {
  const nav = useNavigate();
  const fileRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [avatarBase64, setAvatarBase64] = useState("");
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    primaryEmail: "",
    secondaryEmail: "",
    gender: "",
    dob: "",
    city: "",
    mobile: "",
    joinedDate: "",
    course: "",
    intake: "",
    primaryLanguage: "",
    socialAccounts: [""],
  });

  // ✅ Keep these ONLY ONCE (you had duplicates)
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const passwordChecks = {
    length: passwordRules.length(password),
    upper: passwordRules.upper(password),
    lower: passwordRules.lower(password),
    digit: passwordRules.digit(password),
    special: passwordRules.special(password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSocialChange = (index, value) => {
    const updated = [...profile.socialAccounts];
    updated[index] = value;
    setProfile({ ...profile, socialAccounts: updated });
  };

  const addSocialAccount = () => {
    setProfile({ ...profile, socialAccounts: [...profile.socialAccounts, ""] });
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleAvatarUpload = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      const b64 = await fileToBase64(file);
      setAvatarBase64(b64);
    } catch (err) {
      console.error(err);
      setError("Failed to read image file");
    }
  };

  const handleRegister = async () => {
    setError("");

    if (!profile.primaryEmail.trim()) {
      setError("Primary email is required");
      return;
    }

    if (!isPasswordValid) {
      setError("Password does not meet the required criteria");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        ...profile,
        password,
        socialAccounts: profile.socialAccounts.map((s) => s.trim()).filter(Boolean),
        profilePic: avatarBase64, // base64 string
      };

      const res = await axios.post(`${API_BASE}/auth/register`, payload);

      // auto-login (session-based)
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("role", res.data.user.role);

      nav("/profile");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start p-6">
      <div className="w-full max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">Register</h1>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow space-y-6">
          {/* Photo */}
          <div className="flex items-center gap-5">
            <div className="w-28 h-28 rounded-full overflow-hidden border shadow">
              {avatarBase64 ? (
                <img
                  src={avatarBase64}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 text-sm">
                  No Photo
                </div>
              )}
            </div>

            <label className="cursor-pointer text-blue-600 text-sm">
              Upload Photo
              <input
                type="file"
                accept="image/*"
                hidden
                ref={fileRef}
                onChange={handleAvatarUpload}
                disabled={submitting}
              />
            </label>
          </div>

          {/* Form */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" value={profile.firstName} onChange={handleChange} />
            <Input label="Last Name" name="lastName" value={profile.lastName} onChange={handleChange} />

            <Input label="Primary Email (MDH)" name="primaryEmail" value={profile.primaryEmail} onChange={handleChange} />
            <Input label="Secondary Email" name="secondaryEmail" value={profile.secondaryEmail} onChange={handleChange} />

            <Select label="Gender" name="gender" value={profile.gender} onChange={handleChange} />
            <Input label="DOB" name="dob" type="date" value={profile.dob} onChange={handleChange} />

            <Input label="City" name="city" value={profile.city} onChange={handleChange} />
            <Input label="Mobile (Optional)" name="mobile" value={profile.mobile} onChange={handleChange} />

            <Input label="Joined Date (UGC Campaign)" name="joinedDate" value={profile.joinedDate} onChange={handleChange} />
            <Input label="Enrolled Course" name="course" value={profile.course} onChange={handleChange} />

            <Input label="Which Intake" name="intake" value={profile.intake} onChange={handleChange} />
            <Input label="Primary Language" name="primaryLanguage" value={profile.primaryLanguage} onChange={handleChange} />
          </div>

          {/* Socials */}
          <div>
            <p className="font-semibold mb-2">Social Media Accounts</p>

            {profile.socialAccounts.map((link, index) => (
              <input
                key={index}
                value={link}
                onChange={(e) => handleSocialChange(index, e.target.value)}
                className="border p-2 rounded w-full mb-2"
                placeholder="Enter social link"
                disabled={submitting}
              />
            ))}

            <button
              onClick={addSocialAccount}
              className="text-blue-600 text-sm"
              disabled={submitting}
              type="button"
            >
              + Add another social account
            </button>
          </div>

          {/* Password */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* ✅ Rules list below password */}
              <ul className="mt-2 text-sm space-y-1">
                <Rule ok={passwordChecks.length} text="Minimum 8 characters" />
                <Rule ok={passwordChecks.upper} text="At least one uppercase letter (A–Z)" />
                <Rule ok={passwordChecks.lower} text="At least one lowercase letter (a–z)" />
                <Rule ok={passwordChecks.digit} text="At least one digit (0–9)" />
                <Rule ok={passwordChecks.special} text="At least one special character (!@#$%^&*)" />
              </ul>
            </div>

            <Input
              label="Confirm Password"
              name="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleRegister}
              disabled={submitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-60"
            >
              {submitting ? "Registering..." : "Register"}
            </button>
          </div>

          {/* Optional: link back to login */}
          <div className="text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <button
              type="button"
              className="text-blue-600 underline"
              onClick={() => nav("/login")}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, name, value, type = "text", onChange }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="border p-2 rounded w-full"
        placeholder={`Enter ${label}`}
      />
    </div>
  );
}

function Select({ label, name, value, onChange }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="border p-2 rounded w-full"
      >
        <option value="">Select Gender</option>
        <option>Male</option>
        <option>Female</option>
        <option>Other</option>
      </select>
    </div>
  );
}

export default Register;