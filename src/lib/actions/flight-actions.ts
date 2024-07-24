"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { faker } from '@faker-js/faker';
import mongoose from "mongoose";
import FlightModel from "@/model/Flight";
import Airline from "@/model/Airline";
import FlightStatus from "@/model/FlightStatus";

class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

const getFlightsData = async () => {
  const session = await getServerSession(authOptions);

  try {
    // Your logic to get flights data
    throw new CustomError("Sample error", 404); // Throwing custom error with status code
  } catch (error) {
    const statusCode = (error as CustomError).statusCode || 500;
    redirect(`/error?error=${encodeURIComponent((error as Error).message)}&status=${statusCode}`);
  }
};

const generateRandomFlight = async () => {
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
    for (let i = 0; i < 20; i++) {
      const flightData = await generateRandomFlight();
      // const newFlight = new FlightModel(flightData);
      // await newFlight.save();
      // console.log(`Flight data ${i + 1} saved:`, flightData);
    }
  } catch (error) {
    console.error('Error generating or saving flight data:', error);
  }
};

export { getFlightsData, generateRandomFlight, addRandomFlights };
