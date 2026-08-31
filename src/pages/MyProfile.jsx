import React, { useEffect, useState, useRef } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, updateProfile, updatePassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { successAlert, errorAlert } from "../utils/alert";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaLock,
  FaCamera,
  FaSave,
  FaUpload,
  FaKey,
  FaHome,
  FaTrashAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import "../css/MyProfile.css";

const MyProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState("Male");
  const [profilePhoto, setProfilePhoto] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        setFullName(currentUser.displayName || localStorage.getItem("userName") || "");
        setEmail(currentUser.email || "");

        const savedAvatar =
          localStorage.getItem("profilePhoto") ||
          currentUser.photoURL ||
          "";
        setProfilePhoto(savedAvatar);

        if (db) {
          try {
            const docRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.mobile) setMobile(data.mobile);
              if (data.gender) setGender(data.gender);
              if (data.profilePhoto) setProfilePhoto(data.profilePhoto);
            }
          } catch (e) {
            console.log(e);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        errorAlert("File size should not exceed 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto("");
  };

  const getUserInitial = () => {
    return (fullName?.trim()?.charAt(0) || email?.charAt(0) || "U").toUpperCase();
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      if (newPassword) {
        if (newPassword.length < 6) {
          errorAlert("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          errorAlert("New Password and Confirm Password do not match.");
          setLoading(false);
          return;
        }
        if (user) {
          await updatePassword(user, newPassword);
        }
      }

      if (user) {
        await updateProfile(user, {
          displayName: fullName.trim(),
          photoURL: profilePhoto || "",
        });

        if (db) {
          await setDoc(
            doc(db, "users", user.uid),
            {
              fullName: fullName.trim(),
              name: fullName.trim(),
              displayName: fullName.trim(),
              email: user.email,
              mobile: mobile.trim(),
              gender,
              profilePhoto: profilePhoto || "",
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      }

      localStorage.setItem("userName", fullName.trim());
      if (profilePhoto) {
        localStorage.setItem("profilePhoto", profilePhoto);
      } else {
        localStorage.removeItem("profilePhoto");
      }
      localStorage.setItem("userMobile", mobile.trim());

      window.dispatchEvent(new Event("profileUpdated"));
      window.dispatchEvent(new Event("storage"));
      setLoading(false);

      const res = await successAlert("Profile updated successfully!");
      if (res.isConfirmed || res.isDismissed) {
        navigate("/");
      }
    } catch (err) {
      errorAlert(err.message || "Failed to update profile.");
      setLoading(false);
    }
  };

  return (
    <div className="faint-red-profile-page">
      <Navbar />

      <main className="faint-red-main-container">
        <div className="clean-profile-centered-card">
          {/* 1. Header */}
          <div className="profile-card-header">
            <div className="header-icon-badge">
              <FaUser />
            </div>
            <div>
              <h1 className="profile-title">My Profile Settings</h1>
              <p className="profile-subtitle">
                Manage your account details and upload custom profile picture
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="profile-form-body">
            {/* 2. Custom Photo Upload Section */}
            <div className="custom-photo-upload-card">
              <div className="photo-upload-left">
                <div
                  className="user-photo-large-circle"
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to Upload Photo"
                >
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Profile Avatar"
                      className="avatar-preview-img"
                    />
                  ) : (
                    <div className="avatar-initial-large">{getUserInitial()}</div>
                  )}
                  <div className="photo-camera-overlay">
                    <FaCamera />
                  </div>
                </div>
              </div>

              <div className="photo-upload-right-controls">
                <h4 className="photo-box-title">Profile Picture</h4>
                <p className="photo-box-subtitle">
                  Upload a photo from your device. Recommended format: JPG, PNG or WebP (Max 5MB).
                </p>

                <div className="photo-action-buttons-row">
                  <button
                    type="button"
                    className="btn-upload-file-trigger"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FaUpload /> <span>Upload New Photo</span>
                  </button>

                  {profilePhoto && (
                    <button
                      type="button"
                      className="btn-remove-photo"
                      onClick={handleRemovePhoto}
                    >
                      <FaTrashAlt /> <span>Remove</span>
                    </button>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            </div>

            {/* 3. Form Inputs */}
            <div className="profile-fields-grid">
              <div className="profile-input-group">
                <label className="profile-label">Full Name</label>
                <div className="input-icon-wrapper">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    required
                    className="profile-native-input"
                  />
                </div>
              </div>

              <div className="profile-input-group">
                <label className="profile-label">Email Address</label>
                <div className="input-icon-wrapper">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    required
                    className="profile-native-input"
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="profile-fields-grid">
              <div className="profile-input-group">
                <label className="profile-label">Mobile Number</label>
                <div className="input-icon-wrapper">
                  <FaPhoneAlt className="input-icon" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter 10-digit mobile"
                    maxLength={10}
                    className="profile-native-input"
                  />
                </div>
              </div>

              <div className="profile-input-group">
                <label className="profile-label">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="profile-native-input select-native"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* 4. Change Password Section */}
            <div className="change-password-box">
              <div className="section-title-tag gold">
                <FaKey /> <span>CHANGE PASSWORD (OPTIONAL)</span>
              </div>

              <div className="password-fields-grid">
                <div className="profile-input-group">
                  <label className="profile-label">New Password</label>
                  <div className="input-icon-wrapper">
                    <FaLock className="input-icon" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Leave blank to keep current"
                      className="profile-native-input has-eye-toggle"
                    />
                    <button
                      type="button"
                      className="password-eye-toggle-btn"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      title={showNewPassword ? "Hide password" : "Show password"}
                      tabIndex="-1"
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="profile-input-group">
                  <label className="profile-label">Confirm New Password</label>
                  <div className="input-icon-wrapper">
                    <FaLock className="input-icon" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="profile-native-input has-eye-toggle"
                    />
                    <button
                      type="button"
                      className="password-eye-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Bottom Actions */}
            <div className="profile-form-actions-row">
              <button
                type="button"
                className="profile-back-home-btn"
                onClick={() => navigate("/")}
              >
                <FaHome /> <span>Back to Home</span>
              </button>

              <button
                type="submit"
                className="profile-save-submit-btn"
                disabled={loading}
              >
                <FaSave />
                <span>{loading ? "Saving..." : "Save Profile Details"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyProfile;
