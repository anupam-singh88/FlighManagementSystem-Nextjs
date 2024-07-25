"use strict";
"use server";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRandomFlights = exports.generateRandomFlight = void 0;
const faker_1 = require("@faker-js/faker");
const Airline_1 = __importDefault(require("../../model/Airline"));
const FlightStatus_1 = __importDefault(require("../../model/FlightStatus"));
const Flight_1 = __importDefault(require("../../model/Flight"));
class CustomError extends Error {
    constructor(message, statusCode) {
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
const generateRandomFlight = () => __awaiter(void 0, void 0, void 0, function* () {
    // dbConnect()
    const airlines = yield Airline_1.default.find();
    const randomAirline = airlines[Math.floor(Math.random() * airlines.length)];
    let flightStatus = yield FlightStatus_1.default.findOne({ status: "Scheduled/En-Route" });
    if (!flightStatus) {
        throw new Error("Flight status not found");
    }
    const flightNumber = faker_1.faker.string.numeric({ length: 5, allowLeadingZeros: true });
    const origin = faker_1.faker.location.city();
    const destination = faker_1.faker.location.city();
    const departureTime = faker_1.faker.date.soon().toISOString();
    const status = flightStatus._id;
    return {
        number: flightNumber,
        origin,
        destination,
        departure_time: departureTime,
        airline: randomAirline._id,
        status
    };
});
exports.generateRandomFlight = generateRandomFlight;
const addRandomFlights = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const flightData = yield generateRandomFlight();
        console.log("🚀 ~ addRandomFlights ~ flightData:", flightData);
        const newFlight = new Flight_1.default(flightData);
        const savedFlight = yield newFlight.save();
        // Populate the airline field
        const populatedFlight = yield Flight_1.default.findById(savedFlight._id).populate('airline');
        // Extract only the airline name
        const flightWithAirlineName = Object.assign(Object.assign({}, populatedFlight.toObject()), { airline: populatedFlight.airline.name });
        return flightWithAirlineName;
    }
    catch (error) {
        console.error('Error generating or saving flight data:', error);
        throw error;
    }
});
exports.addRandomFlights = addRandomFlights;
