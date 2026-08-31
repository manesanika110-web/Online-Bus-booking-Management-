import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { updateProfile, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../css/EditProfile.css";
import { successAlert, errorAlert } from "../utils/alert";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { FaUserCircle } from "react-icons/fa";

const EditProfile = () => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [photo, setPhoto] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setName(user.displayName || "");

        const savedMobile = localStorage.getItem("mobile");

        setMobile(savedMobile || "");

        const savedPhoto = localStorage.getItem("profilePhoto");

        setPhoto(savedPhoto || "");
      }
    });

    return () => unsubscribe();
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Only Image
    if (!file.type.startsWith("image/")) {
      errorAlert("Please select a valid image.");
      return;
    }

    // Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      errorAlert("Image size should be less than 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setPhoto(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (mobile.length !== 10) {
      errorAlert("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      await updateProfile(auth.currentUser, {
        displayName: name,
      });

      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        {
          name,
          email: auth.currentUser.email,
          mobile,
          profilePhoto: photo,
        },
        { merge: true },
      );
      // Local Storage
      localStorage.setItem("mobile", mobile);
      localStorage.setItem("profilePhoto", photo);
      console.log("Photo Saved:", photo);
      console.log("LocalStorage:", localStorage.getItem("profilePhoto"));

      successAlert("Profile Updated Successfully!");

      navigate("/profile");
    } catch (error) {
      errorAlert(error.message);
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <h2>Edit Profile</h2>

        <form onSubmit={handleUpdate}>
          <div className="profile-photo-section">
            {photo ? (
              <img src={photo} alt="Profile" className="profile-preview" />
            ) : (
              <FaUserCircle className="default-profile-icon" />
            )}

            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          </div>

          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              if (e.target.value.length <= 30) {
                setName(e.target.value);
              }
            }}
            placeholder="Enter Name"
            maxLength={30}
            required
          />
          <label>Mobile Number</label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");

              if (value.length <= 10) {
                setMobile(value);
              }
            }}
            placeholder="Enter Mobile Number"
            maxLength={10}
            required
          />

          <button type="submit">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
