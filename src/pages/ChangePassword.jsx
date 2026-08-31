import { useState } from "react";
import { auth } from "../firebase";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../css/ChangePassword.css";
import { successAlert, errorAlert } from "../utils/alert";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const getStrength = () => {
    if (!newPassword) return "";

    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[@$!%*?&]/.test(newPassword);

    if (
      newPassword.length >= 8 &&
      hasUpper &&
      hasLower &&
      hasNumber &&
      hasSpecial
    ) {
      return "Strong";
    }

    if (newPassword.length >= 6) {
      return "Medium";
    }

    return "Weak";
  };
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      errorAlert("New Password and Confirm Password do not match.");
      return;
    }

    if (newPassword.length < 6) {
      errorAlert("Password must be at least 6 characters.");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword,
      );

      await reauthenticateWithCredential(auth.currentUser, credential);

      await updatePassword(auth.currentUser, newPassword);

      successAlert("Password Changed Successfully!");

      navigate("/profile");
    } catch (error) {
      errorAlert(error.message);
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-card">
        <button
          className="back-profile-btn"
          onClick={() => navigate("/profile")}
          type="button"
        >
          <FaArrowLeft />
        </button>
        <h2>Change Password</h2>

        <form onSubmit={handleChangePassword}>
          <div className="password-field">
            <input
              type={showCurrent ? "text" : "password"}
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <span onClick={() => setShowCurrent(!showCurrent)}>
              {showCurrent ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="password-field">
            <input
              type={showNew ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            {newPassword && (
              <p className={`strength ${getStrength().toLowerCase()}`}>
                Password Strength : {getStrength()}
              </p>
            )}

            <span onClick={() => setShowNew(!showNew)}>
              {showNew ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="password-field">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {confirmPassword && (
              <p
                className={
                  newPassword === confirmPassword
                    ? "match success"
                    : "match error"
                }
              >
                {newPassword === confirmPassword
                  ? "✔ Password Matched"
                  : "✖ Password Not Matched"}
              </p>
            )}

            <span onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            disabled={
              !currentPassword ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword
            }
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
