import mongoose from "mongoose";

const airlineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

const Airline = mongoose.models.Airline || mongoose.model("Airline", airlineSchema);

const initializeAirlines = async () => {
  const defaultAirlines = ["Airline A", "Airline B", "Airline C", "Airline D", "Airline E"];

  for (const name of defaultAirlines) {
    await Airline.findOneAndUpdate(
      { name },
      { name },
      { upsert: true, new: true }
    );
  }
};

initializeAirlines().catch((error) => {
  console.error("Error initializing airlines:", error);
});

export default Airline;
