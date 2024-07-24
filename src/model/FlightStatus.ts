import mongoose from "mongoose";

const flightStatusSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
});

const FlightStatus =
  mongoose.models.FlightStatus ||
  mongoose.model("FlightStatus", flightStatusSchema);

const initializeFlightStatus = async () => {
  const defaultStatuses = [
    "Delayed",
    "Cancelled",
    "In-flight",
    "Scheduled/En-Route",
  ];

  for (const status of defaultStatuses) {
    await FlightStatus.findOneAndUpdate(
      { status },
      { status },
      { upsert: true, new: true }
    );
  }
};

initializeFlightStatus().catch((error) => {
  console.error("Error initializing FlightStatus:", error);
});

export default FlightStatus;
