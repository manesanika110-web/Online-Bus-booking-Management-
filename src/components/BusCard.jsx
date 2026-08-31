import "../css/BusCard.css";

function BusCard({ bus, onViewSeats }) {
  return (
    <div className="bus-card">
      <div className="bus-left">
        <h2>{bus.name}</h2>

        <p>{bus.type}</p>

        <h3>
          {bus.departure} → {bus.arrival}
        </h3>

        <span>{bus.duration}</span>
      </div>

      <div className="bus-right">
        <h2>₹ {bus.price}</h2>

        <p>{bus.seats} Seats Left</p>

        <button onClick={() => onViewSeats(bus)}>View Seats</button>
      </div>
    </div>
  );
}

export default BusCard;
