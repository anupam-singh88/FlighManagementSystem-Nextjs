"use server";
import { faker } from '@faker-js/faker';
import Airline from "../../model/Airline";
import FlightStatus from "../../model/FlightStatus";
import FlightModel from "../../model/Flight";
import dbConnect from '../dbConnect';

class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

// const getFlightsData = async () => {
//   const session = await getServerSession(authOptions);

//   try {
//     // Your logic to get flights data
//     throw new CustomError("Sample error", 404); // Throwing custom error with status code
//   } catch (error) {
//     const statusCode = (error as CustomError).statusCode || 500;
//     redirect(`/error?error=${encodeURIComponent((error as Error).message)}&status=${statusCode}`);
//   }
// };

const generateRandomFlight = async () => {
  // dbConnect()
  const airlines = await Airline.find();
  const randomAirline = airlines[Math.floor(Math.random() * airlines.length)];

  let flightStatus = await FlightStatus.findOne({ status: "Scheduled/En-Route" });

  if (!flightStatus) {
    throw new Error("Flight status not found");
  }

  const flightNumber = faker.string.numeric({ length: 5, allowLeadingZeros: true });
  const origin = faker.location.city();
  const destination = faker.location.city();
  const departureTime = faker.date.soon().toISOString();
  const status = flightStatus._id;

  return {
    number: flightNumber,
    origin,
    destination,
    departure_time: departureTime,
    airline: randomAirline._id,
    status
  };
};

const addRandomFlights = async () => {
  try {
      const flightData = await generateRandomFlight();
      const newFlight = new FlightModel(flightData);
      const savedFlight = await newFlight.save();

      // Populate the airline field
      const populatedFlight = await FlightModel.findById(savedFlight._id).populate('airline');
      const flightWithAirlineName = {
          ...populatedFlight.toObject(),
          airline: populatedFlight.airline.name
      };

      return flightWithAirlineName;
  } catch (error) {
      console.error('Error generating or saving flight data:', error);
      throw error;
  }
};




export {  generateRandomFlight, addRandomFlights };
