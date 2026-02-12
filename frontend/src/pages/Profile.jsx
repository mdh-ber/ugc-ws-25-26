import { useState, useEffect, useRef } from "react";
import { getProfile, updateProfile } from "../services/profileService";
// import { useState } from "react";
const USER_ID = "65d4f1e2b1c2d3e4f5a67890";   // 🔴 Put your MongoDB User _id here
function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const fileRef = useRef(null);
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
    socialAccounts: [""]
  });
    // 2️⃣ USEEFFECT (FETCH PROFILE)  ← ADD HERE
  useEffect(() => {
    const fetchData = async () => {
      try {
        // const data = await getProfile();
        const data = await getProfile(USER_ID);

        setProfile({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          primaryEmail: data.primaryEmail || "",
          secondaryEmail: data.secondaryEmail || "",
          gender: data.gender || "",
          dob: data.dob ? data.dob.substring(0, 10) : "",
          city: data.city || "",
          mobile: data.mobile || "",
          joinedDate: data.joinedDate || "",
          course: data.course || "",
          intake: data.intake || "",
          primaryLanguage: data.primaryLanguage || "",
          socialAccounts: data.socialAccounts?.length
            ? data.socialAccounts[0].split(",")  // Assuming backend sends as comma-separated string            : [""]
        });

        if (data.profilePic) {
          setAvatar(data.profilePic);
        }

      } catch (err) {
        console.error("Fetch profile error:", err);
      }
    };

    fetchData();
  }, []);

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

  // const handleAvatarUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setAvatar(URL.createObjectURL(file));
  //   }
  // };
  const handleAvatarUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    setAvatar(file);   // store FILE object (not base64, not blob)
  }
};
// const handleSave = async () => {
//   try {
//     const formData = new FormData();

//     // Add text fields
//     Object.keys(profile).forEach((key) => {
//       formData.append(key, profile[key]);
//     });

//     // Add image file
//     if (avatar instanceof File) {
//       formData.append("profilePic", avatar);
//     }

//     await updateProfile(formData);

//     alert("Profile updated successfully");
//     setIsEditing(false);
//   } catch (err) {
//     console.error(err);
//     alert("Update failed");
//   }
// };
const handleSave = async () => {
  try {
    const formData = new FormData();

    Object.keys(profile).forEach(key => {
      formData.append(key, profile[key]);
    });

    if (fileRef.current?.files[0]) {
      formData.append("profilePic", fileRef.current.files[0]);
    }

    // await updateProfile(formData);
    // await updateProfile(formData, USER_ID);
    const updated = await updateProfile(formData, USER_ID);

    //  UPDATE AVATAR FROM BACKEND (Base64 string)
    if (updated.profilePic) {
      setAvatar(updated.profilePic);
    }


    alert("Profile updated");
    setIsEditing(false);

  } catch (err) {
    console.error(err);
    alert("Update failed");
  }
};

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="bg-white p-6 rounded-xl shadow space-y-6">

        {/* Profile Photo Section */}
        <div className="flex items-center gap-5">
          <div className="w-28 h-28 rounded-full overflow-hidden border shadow">
            {avatar ? (
              // <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
//               <img
// src={
//     avatar instanceof File
//       ? URL.createObjectURL(avatar)
//       : `http://localhost:5000${avatar}`
//   }
//   alt="Profile"
// />
<img
  src={
    avatar instanceof File
      ? URL.createObjectURL(avatar)
      : avatar   // Base64 string already complete
  }
  alt="Profile"
  className="w-full h-full object-cover"
/>

            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 text-sm">
                No Photo
              </div>
            )}
          </div>

          {isEditing && (
            <label className="cursor-pointer text-blue-600 text-sm">
              Change Photo
              <input
  type="file"
  accept="image/*"
  hidden
  ref={fileRef}
  onChange={handleAvatarUpload}
/>

            </label>
          )}
        </div>

        {/* Form Grid */}
        <div className="grid md:grid-cols-2 gap-4">

          <Input label="First Name" name="firstName" value={profile.firstName} edit={isEditing} onChange={handleChange} />
          <Input label="Last Name" name="lastName" value={profile.lastName} edit={isEditing} onChange={handleChange} />

          <Input label="Primary Email (MDH)" name="primaryEmail" value={profile.primaryEmail} edit={false} />

          <Input label="Secondary Email" name="secondaryEmail" value={profile.secondaryEmail} edit={isEditing} onChange={handleChange} />

          <Select label="Gender" name="gender" value={profile.gender} edit={isEditing} onChange={handleChange} />

          <Input label="DOB" name="dob" type="date" value={profile.dob} edit={isEditing} onChange={handleChange} />

          <Input label="City" name="city" value={profile.city} edit={isEditing} onChange={handleChange} />

          <Input label="Mobile (Optional)" name="mobile" value={profile.mobile} edit={isEditing} onChange={handleChange} />

          <Input label="Joined Date (UGC Campaign)" name="joinedDate" value={profile.joinedDate} edit={false} />

          <Input label="Enrolled Course" name="course" value={profile.course} edit={isEditing} onChange={handleChange} />

          <Input label="Which Intake" name="intake" value={profile.intake} edit={isEditing} onChange={handleChange} />

          <Input label="Primary Language" name="primaryLanguage" value={profile.primaryLanguage} edit={isEditing} onChange={handleChange} />
        </div>

        {/* Social Media */}
        <div>
          <p className="font-semibold mb-2">Social Media Accounts</p>

          {profile.socialAccounts.map((link, index) => (
            <input
              key={index}
              value={link}
              disabled={!isEditing}
              onChange={(e) => handleSocialChange(index, e.target.value)}
              className="border p-2 rounded w-full mb-2 disabled:bg-gray-100"
              placeholder="Enter social link"
            />
          ))}

          {isEditing && (
            <button onClick={addSocialAccount} className="text-blue-600 text-sm">
              + Add another social account
            </button>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-5 py-2 rounded"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-5 py-2 rounded"
              
            >
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ label, name, value, edit, type = "text", onChange }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        disabled={!edit}
        onChange={onChange}
        className="border p-2 rounded w-full disabled:bg-gray-100"
        placeholder={`Enter ${label}`}
      />
    </div>
  );
}

function Select({ label, name, value, edit, onChange }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <select
        name={name}
        value={value}
        disabled={!edit}
        onChange={onChange}
        className="border p-2 rounded w-full disabled:bg-gray-100"
      >
        <option value="">Select Gender</option>
        <option>Male</option>
        <option>Female</option>
        <option>Other</option>
      </select>
    </div>
  );
}

export default Profile;
