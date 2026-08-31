import React, { useState } from "react";
import {
  FaRupeeSign,
  FaCreditCard,
  FaSearch,
  FaCheckCircle,
  FaExchangeAlt,
  FaTimes,
  FaReceipt,
  FaMobileAlt,
  FaUniversity,
  FaWallet,
  FaShieldAlt,
  FaCalendarAlt,
  FaPrint,
  FaFileInvoiceDollar,
  FaQrcode,
} from "react-icons/fa";

function AdminPayments({ payments = [], bookings = [], searchQuery = "" }) {
  const [methodFilter, setMethodFilter] = useState("all");
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Generate combined list of transactions from payments & bookings
  const transactionsList = (() => {
    const combined = [];
    const seenTxIds = new Set();

    // 1. Direct payments from Firestore `payments` collection
    payments.forEach((p, idx) => {
      const txId = p.transactionId || p.paymentId || `TXN${100000 + idx}`;
      seenTxIds.add(txId);
      combined.push({
        id: txId,
        bookingId: p.bookingId || "BUS1000",
        pnr: p.pnr || "PBK1000",
        customer: p.customerName || p.passengerName || "Customer",
        email: p.email || p.userEmail || "",
        mobile: p.mobile || p.phone || "",
        amount: Number(p.amount) || 650,
        method: p.method || p.paymentMethod || "UPI",
        status: p.status || "Success",
        date: p.timestamp || p.date || new Date().toISOString(),
        details: p,
      });
    });

    // 2. Derive payments from bookings if not already present
    bookings.forEach((b, idx) => {
      const txId = b.transactionId || `TXN_${b.bookingId || idx}`;
      if (!seenTxIds.has(txId)) {
        combined.push({
          id: txId,
          bookingId: b.bookingId || `BUS${1000 + idx}`,
          pnr: b.pnr || "PBK" + (b.bookingId || "1000"),
          customer: b.passenger?.name || b.name || "Customer",
          email: b.passenger?.email || b.userEmail || "",
          mobile: b.passenger?.mobile || b.passenger?.phone || "",
          amount: Number(b.totalAmount) || 650,
          method: b.paymentMethod || "UPI",
          status: b.status === "cancelled" ? "Refunded" : "Success",
          date: b.createdAt || b.bookingDate || new Date().toISOString(),
          details: b,
        });
      }
    });

    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  })();

  // Filter transactions based on methodFilter & search query
  const filteredTransactions = transactionsList.filter((tx) => {
    const term = (searchQuery || "").toLowerCase().trim();
    const matchesSearch =
      !term ||
      tx.id.toLowerCase().includes(term) ||
      tx.pnr.toLowerCase().includes(term) ||
      tx.customer.toLowerCase().includes(term) ||
      tx.bookingId.toLowerCase().includes(term);

    const m = (tx.method || "").toLowerCase();
    if (methodFilter === "upi") {
      return matchesSearch && m.includes("upi");
    }
    if (methodFilter === "card") {
      return matchesSearch && (m.includes("card") || m.includes("credit") || m.includes("debit") || m.includes("visa") || m.includes("master"));
    }
    if (methodFilter === "wallet") {
      return matchesSearch && (m.includes("wallet") || m.includes("bank") || m.includes("netbanking") || m.includes("paytm") || m.includes("phonepe"));
    }
    return matchesSearch;
  });

  // Dynamic Metrics Analysis calculated based on selected methodFilter
  const activeMethodTransactions = methodFilter === "all"
    ? transactionsList
    : transactionsList.filter((tx) => {
        const m = (tx.method || "").toLowerCase();
        if (methodFilter === "upi") return m.includes("upi");
        if (methodFilter === "card") return m.includes("card") || m.includes("credit") || m.includes("debit");
        if (methodFilter === "wallet") return m.includes("wallet") || m.includes("bank") || m.includes("netbanking");
        return true;
      });

  const totalRevenue = activeMethodTransactions
    .filter((t) => t.status === "Success")
    .reduce((acc, t) => acc + t.amount, 0);

  const successfulTxCount = activeMethodTransactions.filter((t) => t.status === "Success").length;
  const avgTicketValue = successfulTxCount > 0 ? Math.round(totalRevenue / successfulTxCount) : 0;

  // Percentage share of total
  const overallTotalRevenue = transactionsList
    .filter((t) => t.status === "Success")
    .reduce((acc, t) => acc + t.amount, 0) || 1;

  const methodSharePercent = Math.round((totalRevenue / overallTotalRevenue) * 100);

  const getMethodIcon = (methodStr = "") => {
    const m = methodStr.toLowerCase();
    if (m.includes("upi")) return <FaMobileAlt className="method-icon upi" />;
    if (m.includes("card")) return <FaCreditCard className="method-icon card" />;
    if (m.includes("bank")) return <FaUniversity className="method-icon bank" />;
    return <FaWallet className="method-icon wallet" />;
  };

  // Official Print Payment Receipt Function
  const handlePrintOfficialReceipt = (receipt) => {
    if (!receipt) return;

    const printWindow = window.open("", "_blank", "width=850,height=900");
    if (!printWindow) {
      alert("Please allow popups to print official payment receipts.");
      return;
    }

    const formattedDate = new Date(receipt.date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const baseFare = Math.round(receipt.amount * 0.82);
    const gstAmount = Math.round(receipt.amount * 0.18);

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>BusVista Payment Receipt - ${receipt.id}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
          body { background: #f8fafc; padding: 40px 20px; color: #0f172a; }
          .receipt-container { max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 36px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
          .header-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
          .logo-badge { display: flex; align-items: center; gap: 10px; font-size: 24px; font-weight: 800; color: #d81b60; }
          .logo-bus { background: #d81b60; color: #fff; padding: 4px 10px; border-radius: 8px; font-size: 16px; }
          .invoice-tag { text-align: right; }
          .invoice-tag h2 { font-size: 18px; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px; }
          .invoice-tag p { font-size: 12px; color: #64748b; margin-top: 2px; }
          
          .status-banner { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
          .status-banner strong { color: #065f46; font-size: 15px; }
          .paid-badge { background: #10b981; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }

          .grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; padding: 18px; border-radius: 12px; margin-bottom: 24px; font-size: 13px; }
          .info-group label { display: block; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 600; margin-bottom: 3px; }
          .info-group span { font-weight: 600; color: #0f172a; }

          .breakdown-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13.5px; }
          .breakdown-table th { text-align: left; background: #f1f5f9; padding: 10px 14px; color: #475569; font-size: 12px; text-transform: uppercase; }
          .breakdown-table td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; }
          .breakdown-table .amount-col { text-align: right; font-weight: 600; }
          .breakdown-table .total-row td { border-top: 2px solid #cbd5e1; border-bottom: none; font-size: 16px; font-weight: 800; color: #d81b60; padding-top: 16px; }

          .footer-note { text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 20px; font-size: 11.5px; color: #64748b; line-height: 1.5; }
          .footer-note strong { color: #0f172a; }

          @media print {
            body { background: #fff; padding: 0; }
            .receipt-container { box-shadow: none; border: 1px solid #ccc; max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div className="receipt-container">
          <div class="header-row">
            <div class="logo-badge">
              <span class="logo-bus">🚌 BusVista</span>
              <span>Online Services</span>
            </div>
            <div class="invoice-tag">
              <h2>Payment Receipt</h2>
              <p>Txn Ref: ${receipt.id}</p>
            </div>
          </div>

          <div class="status-banner">
            <div>
              <strong>Payment Status: ${receipt.status}</strong>
              <div style="font-size: 12px; color: #047857; margin-top: 2px;">Authorized by Razorpay / BusVista Gateway</div>
            </div>
            <span class="paid-badge">CONFIRMED</span>
          </div>

          <div class="grid-info">
            <div class="info-group">
              <label>Passenger / Customer</label>
              <span>${receipt.customer}</span>
            </div>
            <div class="info-group">
              <label>Booking ID & PNR</label>
              <span>${receipt.bookingId} (${receipt.pnr})</span>
            </div>
            <div class="info-group">
              <label>Payment Method</label>
              <span>${receipt.method.toUpperCase()}</span>
            </div>
            <div class="info-group">
              <label>Transaction Date & Time</label>
              <span>${formattedDate}</span>
            </div>
          </div>

          <table class="breakdown-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Payment Mode</th>
                <th class="amount-col">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bus Travel Fare (E-Ticket Booking)</td>
                <td>${receipt.method.toUpperCase()}</td>
                <td class="amount-col">₹ ${baseFare.toLocaleString("en-IN")}</td>
              </tr>
              <tr>
                <td>Integrated GST & Highway Tolls (18%)</td>
                <td>Standard</td>
                <td class="amount-col">₹ ${gstAmount.toLocaleString("en-IN")}</td>
              </tr>
              <tr class="total-row">
                <td colspan="2">Total Amount Paid</td>
                <td class="amount-col">₹ ${receipt.amount.toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer-note">
            <p><strong>This is a computer-generated official payment receipt. No physical signature required.</strong></p>
            <p>For customer support and booking inquiries: help@busvista.com • Toll Free: 1800-BUS-VISTA</p>
            <p style="margin-top: 6px; font-size: 10.5px; color: #94a3b8;">BusVista Mobility Solutions Pvt. Ltd. • GSTIN: 27AABCB1234F1Z5</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  return (
    <div className="admin-subview-container">
      {/* Top Financial Stats Grid - Dynamically Analyzed Based on Active Method Filter */}
      <div className="admin-payments-metrics-grid">
        <div className="payment-metric-card highlight">
          <div className="metric-icon-wrap">
            <FaRupeeSign />
          </div>
          <div className="metric-info">
            <span className="metric-lbl">
              {methodFilter === "all" ? "Total Gross Revenue" : `${methodFilter.toUpperCase()} Collections`}
            </span>
            <h3 className="metric-value">₹ {totalRevenue.toLocaleString("en-IN")}</h3>
            <span className="metric-sub">
              {methodFilter === "all" ? "100% Verified Collections" : `${methodSharePercent}% of Total Revenue`}
            </span>
          </div>
        </div>

        <div className="payment-metric-card">
          <div className="metric-icon-wrap icon-green">
            <FaCheckCircle />
          </div>
          <div className="metric-info">
            <span className="metric-lbl">Successful Payments</span>
            <h3 className="metric-value">{successfulTxCount}</h3>
            <span className="metric-sub">
              {methodFilter === "all" ? "Processed Across All Gateways" : `Via ${methodFilter.toUpperCase()}`}
            </span>
          </div>
        </div>

        <div className="payment-metric-card">
          <div className="metric-icon-wrap icon-blue">
            <FaExchangeAlt />
          </div>
          <div className="metric-info">
            <span className="metric-lbl">Avg. Ticket Size</span>
            <h3 className="metric-value">₹ {avgTicketValue}</h3>
            <span className="metric-sub">Per Successful Booking</span>
          </div>
        </div>

        <div className="payment-metric-card">
          <div className="metric-icon-wrap icon-purple">
            <FaShieldAlt />
          </div>
          <div className="metric-info">
            <span className="metric-lbl">Payment Mode</span>
            <h3 className="metric-value">
              {methodFilter === "all" ? "All Methods" : methodFilter === "upi" ? "UPI Apps" : methodFilter === "card" ? "Debit / Credit" : "Wallets / NetBank"}
            </h3>
            <span className="metric-sub">256-bit Encrypted Gateway</span>
          </div>
        </div>
      </div>

      {/* Subview Header Strip with Filter Button Group */}
      <div className="admin-subview-header">
        <div className="subview-header-left">
          <div className="subview-counter-pill">
            <FaReceipt />
            <span>
              {filteredTransactions.length} {methodFilter === "all" ? "Transactions" : `${methodFilter.toUpperCase()} Transactions`} Recorded
            </span>
          </div>
        </div>

        <div className="subview-header-right">
          <div className="filter-button-group">
            <button
              type="button"
              className={`filter-tab-btn ${methodFilter === "all" ? "active" : ""}`}
              onClick={() => setMethodFilter("all")}
            >
              All Methods ({transactionsList.length})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${methodFilter === "upi" ? "active" : ""}`}
              onClick={() => setMethodFilter("upi")}
            >
              UPI ({transactionsList.filter((t) => (t.method || "").toLowerCase().includes("upi")).length})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${methodFilter === "card" ? "active" : ""}`}
              onClick={() => setMethodFilter("card")}
            >
              Cards ({transactionsList.filter((t) => (t.method || "").toLowerCase().includes("card") || (t.method || "").toLowerCase().includes("credit") || (t.method || "").toLowerCase().includes("debit")).length})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${methodFilter === "wallet" ? "active" : ""}`}
              onClick={() => setMethodFilter("wallet")}
            >
              Wallets / NetBanking ({transactionsList.filter((t) => (t.method || "").toLowerCase().includes("wallet") || (t.method || "").toLowerCase().includes("bank") || (t.method || "").toLowerCase().includes("netbanking")).length})
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="admin-card-table-wrapper">
        {filteredTransactions.length === 0 ? (
          <div className="admin-empty-state">
            <FaReceipt className="empty-state-icon" />
            <h3>No Transactions Found</h3>
            <p>No payment records match your "{methodFilter.toUpperCase()}" filter or search query.</p>
          </div>
        ) : (
          <table className="admin-custom-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Booking Ref</th>
                <th>Customer</th>
                <th>Payment Mode</th>
                <th>Date & Time</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <strong className="tx-id-code">{tx.id}</strong>
                  </td>
                  <td>
                    <div className="pnr-cell">
                      <span>{tx.bookingId}</span>
                      <small>PNR: {tx.pnr}</small>
                    </div>
                  </td>
                  <td>
                    <div className="customer-cell">
                      <strong>{tx.customer}</strong>
                      <small>{tx.mobile || tx.email || "Verified"}</small>
                    </div>
                  </td>
                  <td>
                    <div className="method-pill-cell">
                      {getMethodIcon(tx.method)}
                      <span>{tx.method.toUpperCase()}</span>
                    </div>
                  </td>
                  <td>
                    <span className="date-text">
                      {new Date(tx.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td>
                    <strong className="fare-highlight">₹ {tx.amount}</strong>
                  </td>
                  <td>
                    <span className={`status-pill pill-${tx.status.toLowerCase()}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="action-icon-btn view-btn"
                      title="View & Print Payment Receipt"
                      onClick={() => setSelectedReceipt(tx)}
                    >
                      <FaReceipt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Payment Receipt Modal */}
      {selectedReceipt && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedReceipt(null)}>
          <div className="admin-modal-box modal-receipt" onClick={(e) => e.stopPropagation()}>
            <div className="modal-box-header">
              <div className="receipt-title-box">
                <FaFileInvoiceDollar className="receipt-head-icon" />
                <h3>Official Payment Receipt</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedReceipt(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="receipt-modal-body">
              <div className="receipt-status-header">
                <div className="receipt-check-wrap">
                  <FaCheckCircle />
                </div>
                <h4>Payment Successful</h4>
                <p className="receipt-amount-display">₹ {selectedReceipt.amount}</p>
                <span className="receipt-tx-code">TXN: {selectedReceipt.id}</span>
              </div>

              <div className="receipt-table-list">
                <div className="receipt-row">
                  <span className="r-lbl">Passenger Name</span>
                  <span className="r-val">{selectedReceipt.customer}</span>
                </div>
                <div className="receipt-row">
                  <span className="r-lbl">Booking Reference</span>
                  <span className="r-val">{selectedReceipt.bookingId} ({selectedReceipt.pnr})</span>
                </div>
                <div className="receipt-row">
                  <span className="r-lbl">Payment Mode</span>
                  <span className="r-val">{selectedReceipt.method.toUpperCase()}</span>
                </div>
                <div className="receipt-row">
                  <span className="r-lbl">Transaction Status</span>
                  <span className="r-val text-green font-bold">{selectedReceipt.status}</span>
                </div>
                <div className="receipt-row">
                  <span className="r-lbl">Timestamp</span>
                  <span className="r-val">{new Date(selectedReceipt.date).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="receipt-actions">
                <button
                  type="button"
                  className="ticket-print-action-btn"
                  onClick={() => handlePrintOfficialReceipt(selectedReceipt)}
                >
                  <FaPrint /> Print Payment Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPayments;
