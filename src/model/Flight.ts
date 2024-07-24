import mongoose from "mongoose";

const flightSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
    },
    origin: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    departure_time: {
      type: Date,
      default: new Date(),
    },
    status: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FlightStatus",
      required: true,
    },
    airline: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Airline",
    },
  },
  { timestamps: true }
);

const FlightModel = mongoose.models.Flight || mongoose.model("Flight", flightSchema);

export default FlightModel;
