import React, { useState } from "react";
import { FaChevronDown, FaQuestionCircle } from "react-icons/fa";
import "../css/HomeSections.css";

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "How do I book a bus ticket on Bus Vista?",
      a: "Simply select your departure city ('Leaving From'), destination ('Going To'), and journey date on the homepage search bar. Click 'Search Buses', select your favorite bus and seats, fill in passenger details, and make a quick payment. Your confirmed ticket will be generated instantly!",
    },
    {
      q: "Can I cancel my bus ticket and get an instant refund?",
      a: "Yes! You can cancel your booked ticket by going to 'My Bookings' or clicking 'Cancel Booking' in your profile menu. Once cancelled, your refund is processed automatically to your source payment account.",
    },
    {
      q: "Do I need to carry a printed copy of the ticket?",
      a: "No physical printout is required! You can show the digital M-Ticket or PDF received on your phone to the bus conductor while boarding.",
    },
    {
      q: "What payment methods are supported?",
      a: "We support Google Pay, PhonePe, Paytm, all UPI apps, Visa/Mastercard/RuPay Debit & Credit cards, and Net Banking across all Indian banks.",
    },
    {
      q: "How does live bus tracking work?",
      a: "Click on 'Track Ticket' in the top navigation bar, enter your PNR or Booking ID, and you will see the bus operator's live location, boarding point address, and estimated arrival time.",
    },
    {
      q: "How do I apply coupon discount codes?",
      a: "You can click on 'Offers' in the top navigation or scroll to our Offers section, copy your preferred coupon code (such as BUSVISTA20), and apply it during payment checkout.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="faq-home-section">
      <div className="section-header-box">
        <span className="section-sub-tag">
          <FaQuestionCircle /> GOT QUESTIONS?
        </span>
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-description">
          Find quick answers to common questions regarding bus booking, refunds, and live tracking.
        </p>
      </div>

      <div className="faq-accordion-wrapper">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`faq-item-card ${openIndex === index ? "active" : ""}`}
            onClick={() => toggleFaq(index)}
          >
            <div className="faq-question-row">
              <h4>{faq.q}</h4>
              <FaChevronDown
                className={`faq-chevron-icon ${openIndex === index ? "rotated" : ""}`}
              />
            </div>
            {openIndex === index && (
              <div className="faq-answer-box">
                <p>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
