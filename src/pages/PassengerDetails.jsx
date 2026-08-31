import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/PassengerDetails.css";

function PassengerDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const bus = state?.bus;
  const selectedSeats = state?.selectedSeats || [];

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");

    if (value.length <= 10) {
      setMobile(value);
    }
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mobile.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!emailValid) {
      alert("Please enter a valid email.");
      return;
    }

    navigate("/payment", {
      state: {
        bus,
        selectedSeats,
        passenger: {
          name,
          mobile,
          email,
          age,
          gender,
        },
      },
    });
  };

  return (
    <div className="passenger-page">
      <div className="passenger-card">
        <h2>Passenger Details</h2>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="input-group">
            <label>Full Name</label>

            <input
              type="text"
              placeholder="Enter Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Mobile */}
          <div className="input-group">
            <label>Mobile Number</label>

            <input
              type="text"
              placeholder="Enter 10 Digit Mobile Number"
              value={mobile}
              onChange={handleMobileChange}
              maxLength="10"
              required
            />

            {mobile.length > 0 && mobile.length < 10 && (
              <small className="error">
                Mobile number must contain exactly 10 digits.
              </small>
            )}
          </div>

          {/* Email */}
          <div className="input-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {email.length > 0 && !emailValid && (
              <small className="error">Please enter a valid email.</small>
            )}
          </div>

          <div className="row">
            <div className="input-group">
              <label>Age</label>

              <input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Gender</label>

              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <button type="submit">Continue to Payment</button>
        </form>
      </div>
    </div>
  );
}

export default PassengerDetails;
