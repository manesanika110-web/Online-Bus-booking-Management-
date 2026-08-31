import React, { useState, useEffect, useRef } from "react";
import {
  FaTimes,
  FaUser,
  FaEnvelope,
  FaCamera,
  FaLock,
  FaSave,
  FaUpload,
  FaKey,
  FaIdCard,
  FaPhoneAlt,
  FaTrashAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { auth, db } from "../firebase";
import { updateProfile, updatePassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { successAlert, errorAlert } from "../utils/alert";
import "../css/ProfileModal.css";

const ProfileModal = ({ isOpen, onClose }) => {
  const fileInputRef = useRef(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState("Male");
  const [selectedPhoto, setSelectedPhoto] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load user data on open
  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setFullName(user.displayName || localStorage.getItem("userName") || "");
        setEmail(user.email || "");

        const savedAvatar =
          localStorage.getItem("profilePhoto") ||
          user.photoURL ||
          "";
        setSelectedPhoto(savedAvatar);

        if (db) {
          try {
            const docRef = doc(db, "users", user.uid);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
              const d = snap.data();
              if (d.mobile) setMobile(d.mobile);
              if (d.gender) setGender(d.gender);
              if (d.profilePhoto) setSelectedPhoto(d.profilePhoto);
            }
          } catch (e) {
            console.log("Firestore profile fetch:", e);
          }
        }
      }
    };

    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        errorAlert("File size should not exceed 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto("");
  };

  const getUserInitial = () => {
    return (fullName?.trim()?.charAt(0) || email?.charAt(0) || "U").toUpperCase();
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;

      // Update password if provided
      if (newPassword) {
        if (newPassword.length < 6) {
          errorAlert("Password must be at least 6 characters long.");
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

      // Update Firebase Auth Profile
      if (user) {
        await updateProfile(user, {
          displayName: fullName.trim(),
          photoURL: selectedPhoto || "",
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
              profilePhoto: selectedPhoto || "",
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      }

      // Save locally
      localStorage.setItem("userName", fullName.trim());
      if (selectedPhoto) {
        localStorage.setItem("profilePhoto", selectedPhoto);
      } else {
        localStorage.removeItem("profilePhoto");
      }
      localStorage.setItem("userMobile", mobile.trim());

      window.dispatchEvent(new Event("profileUpdated"));
      window.dispatchEvent(new Event("storage"));
      setLoading(false);

      const res = await successAlert("Profile updated successfully!");
      if (res.isConfirmed || res.isDismissed) {
        onClose();
      }
    } catch (err) {
      console.error(err);
      errorAlert(err.message || "Failed to update profile.");
      setLoading(false);
    }
  };

  return (
    <div className="profile-modal-backdrop" onClick={onClose}>
      <div
        className="profile-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Top Header */}
        <div className="profile-modal-top-header">
          <div className="header-title-wrapper">
            <div className="header-icon-circle">
              <FaUser />
            </div>
            <div>
              <h2 className="modal-heading">My Profile Settings</h2>
              <p className="modal-subheading">
                Update your personal information and profile picture
              </p>
            </div>
          </div>

          <button className="profile-close-btn" onClick={onClose} title="Close">
            <FaTimes />
          </button>
        </div>

        {/* 2. Modal Form Body */}
        <form onSubmit={handleSaveProfile} className="profile-modal-form-body">
          {/* Custom Profile Photo Upload Box */}
          <div className="custom-photo-upload-card">
            <div className="photo-upload-left">
              <div
                className="user-photo-large-circle"
                onClick={() => fileInputRef.current?.click()}
                title="Click to Upload Photo"
              >
                {selectedPhoto ? (
                  <img
                    src={selectedPhoto}
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

                {selectedPhoto && (
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

          {/* Form Fields: Full Name & Email Address */}
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

          {/* Mobile & Gender Row */}
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

          {/* Change Password Section */}
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

          {/* Bottom Actions */}
          <div className="profile-modal-actions">
            <button
              type="button"
              className="profile-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="profile-save-btn"
              disabled={loading}
            >
              <FaSave />
              <span>{loading ? "Saving..." : "Save Profile Details"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
