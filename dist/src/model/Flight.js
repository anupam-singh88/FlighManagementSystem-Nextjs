"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const flightSchema = new mongoose_1.default.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "FlightStatus",
        required: true,
    },
    airline: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Airline",
    },
}, { timestamps: true });
const FlightModel = mongoose_1.default.models.Flight || mongoose_1.default.model("Flight", flightSchema);
exports.default = FlightModel;
