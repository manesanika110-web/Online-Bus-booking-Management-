import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/Payment.css";

function Payment() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const bus = state?.bus;
  const selectedSeats = state?.selectedSeats || [];
  const passenger = state?.passenger;

  const totalAmount = selectedSeats.length * bus.price;

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");

  const handlePayment = () => {
    if (paymentMethod === "upi") {
      if (!upiId.includes("@")) {
        setError("Please enter a valid UPI ID.");
        return;
      }
    }

    if (paymentMethod === "card") {
      if (cardNumber.length !== 16 || isNaN(cardNumber)) {
        setError("Card Number must be 16 digits.");
        return;
      }

      if (!cardHolder.trim()) {
        setError("Enter Card Holder Name.");
        return;
      }

      const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;

      if (!expiryPattern.test(expiry)) {
        setError("Expiry should be in MM/YY format.");
        return;
      }

      if (cvv.length !== 3 || isNaN(cvv)) {
        setError("CVV must be 3 digits.");
        return;
      }
    }

    if (paymentMethod === "netbanking") {
      setError("");
    }

    if (paymentMethod === "wallet") {
      setError("");
    }

    const methodLabel =
      paymentMethod === "upi"
        ? "UPI"
        : paymentMethod === "card"
        ? "Credit Card"
        : paymentMethod === "netbanking"
        ? "Net Banking"
        : "Wallet";

    navigate("/booking-success", {
      state: {
        bus,
        selectedSeats,
        passenger,
        totalAmount,
        paymentMethod: methodLabel,
      },
    });
  };

  return (
    <div className="payment-page">
      <div className="payment-card">
        <h2>Payment</h2>

        <div className="booking-summary">
          <h3>Booking Summary</h3>

          <p>
            <span>Passenger</span>
            <span>{passenger.name}</span>
          </p>

          <p>
            <span>Bus</span>
            <span>{bus.name}</span>
          </p>

          <p>
            <span>Route</span>
            <span>
              {bus.from} → {bus.to}
            </span>
          </p>

          <p>
            <span>Seats</span>
            <span>{selectedSeats.join(", ")}</span>
          </p>

          <p>
            <span>Total Amount</span>
            <span>₹ {totalAmount}</span>
          </p>
        </div>

        <div className="payment-method">
          <h3>Select Payment Method</h3>

          {/* UPI */}
          <label>
            <input
              type="radio"
              value="upi"
              checked={paymentMethod === "upi"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            UPI
          </label>

          {/* Card */}
          <label>
            <input
              type="radio"
              value="card"
              checked={paymentMethod === "card"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Credit / Debit Card
          </label>

          {/* Net Banking */}
          <label>
            <input
              type="radio"
              value="netbanking"
              checked={paymentMethod === "netbanking"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Net Banking
          </label>

          {/* Wallet */}
          <label>
            <input
              type="radio"
              value="wallet"
              checked={paymentMethod === "wallet"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Wallet
          </label>

          {/* ---------- UPI ---------- */}

          {paymentMethod === "upi" && (
            <div className="payment-box">
              <h4>Enter UPI ID</h4>

              <input
                type="text"
                placeholder="example@okaxis"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            </div>
          )}

          {/* ---------- CARD ---------- */}

          {paymentMethod === "card" && (
            <div className="payment-box">
              <input
                type="text"
                placeholder="Card Number"
                value={cardNumber}
                maxLength={16}
                onChange={(e) =>
                  setCardNumber(e.target.value.replace(/\D/g, ""))
                }
              />

              <input
                type="text"
                placeholder="Card Holder Name"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
              />

              <div className="card-row">
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  maxLength={5}
                  onChange={(e) => setExpiry(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="CVV"
                  value={cvv}
                  maxLength={3}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>
          )}

          {/* ---------- NET BANKING ---------- */}

          {paymentMethod === "netbanking" && (
            <div className="payment-box">
              <select>
                <option>Select Bank</option>
                <option>SBI Bank</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
              </select>
            </div>
          )}

          {/* ---------- WALLET ---------- */}
          {paymentMethod === "wallet" && (
            <div className="payment-box">
              <button type="button" className="wallet-btn">
                <img
                  src="https://cdn.simpleicons.org/phonepe/ffffff"
                  alt="PhonePe"
                />
                PhonePe
              </button>
              <button type="button" className="wallet-btn">
                <img
                  src="https://cdn.simpleicons.org/googlepay/ffffff"
                  alt="Google Pay"
                />
                Google Pay
              </button>
              <button type="button" className="wallet-btn">
                <img
                  src="https://cdn.simpleicons.org/paytm/ffffff"
                  alt="Paytm"
                />
                Paytm
              </button>
            </div>
          )}
        </div>
        {error && <p className="payment-error">{error}</p>}
        <button className="pay-btn" onClick={handlePayment}>
          Pay Now
        </button>
      </div>
    </div>
  );
}

export default Payment;
