import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { updateProfile, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../css/EditProfile.css";
import { successAlert, errorAlert } from "../utils/alert";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FaUserCircle } from "react-icons/fa";
import { imageDataUrlToFile, uploadImage } from "../utils/imageStorage";
import { readStoredObject, writeStoredObject } from "../utils/localData";

const EditProfile = () => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [photo, setPhoto] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const navigate = useNavigate();

  useEffect(
    () => () => {
      if (photo.startsWith("blob:")) URL.revokeObjectURL(photo);
    },
    [photo],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const cachedProfile = readStoredObject(`profile_${user.uid}`) || {};
        setName(
          cachedProfile.fullName ||
            localStorage.getItem("userName") ||
            user.displayName ||
            "",
        );

        setMobile(
          cachedProfile.mobile ||
            localStorage.getItem("mobile") ||
            localStorage.getItem("userMobile") ||
            "",
        );
        setPhoto(
          cachedProfile.profilePhoto ||
            localStorage.getItem("profilePhoto") ||
            user.photoURL ||
            "",
        );

        if (db) {
          try {
            const snapshot = await getDoc(doc(db, "users", user.uid));
            if (snapshot.exists()) {
              const profile = snapshot.data();
              const cloudTime = new Date(profile.updatedAt || 0).getTime();
              const cacheTime = new Date(cachedProfile.updatedAt || 0).getTime();
              if (cloudTime >= cacheTime) {
                if (profile.name || profile.displayName) {
                  setName(profile.name || profile.displayName);
                }
                if (profile.mobile) setMobile(profile.mobile);
                if (profile.profilePhoto) setPhoto(profile.profilePhoto);
              }
            }
          } catch (error) {
            console.warn("Unable to load the saved profile:", error);
          }
        }
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

    setPhotoFile(file);
    setPhoto(URL.createObjectURL(file));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (mobile.length !== 10) {
      errorAlert("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        errorAlert("Please sign in before saving your profile.");
        return;
      }

      const savedPhoto = photoFile
        ? await uploadImage(
            photoFile,
            `profiles/${currentUser.uid}/avatar-${Date.now()}`,
          )
        : photo.startsWith("data:image/")
          ? await uploadImage(
              imageDataUrlToFile(photo, "profile-photo"),
              `profiles/${currentUser.uid}/avatar-${Date.now()}`,
            )
        : photo;

      localStorage.setItem("userName", name);
      localStorage.setItem("mobile", mobile);
      localStorage.setItem("userMobile", mobile);
      if (savedPhoto) localStorage.setItem("profilePhoto", savedPhoto);
      else localStorage.removeItem("profilePhoto");
      writeStoredObject(`profile_${currentUser.uid}`, {
        fullName: name,
        email: currentUser.email,
        mobile,
        profilePhoto: savedPhoto || "",
        updatedAt: new Date().toISOString(),
      });

      await updateProfile(currentUser, {
        displayName: name,
        photoURL: savedPhoto || "",
      });

      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          name,
          displayName: name,
          email: currentUser.email,
          mobile,
          profilePhoto: savedPhoto,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
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
