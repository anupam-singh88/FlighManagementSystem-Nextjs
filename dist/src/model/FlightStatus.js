"use strict";
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
const mongoose_1 = __importDefault(require("mongoose"));
const flightStatusSchema = new mongoose_1.default.Schema({
    status: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
});
const FlightStatus = mongoose_1.default.models.FlightStatus ||
    mongoose_1.default.model("FlightStatus", flightStatusSchema);
const initializeFlightStatus = () => __awaiter(void 0, void 0, void 0, function* () {
    const defaultStatuses = [
        "Delayed",
        "Cancelled",
        "In-flight",
        "Scheduled/En-Route",
    ];
    for (const status of defaultStatuses) {
        yield FlightStatus.findOneAndUpdate({ status }, { status }, { upsert: true, new: true });
    }
});
initializeFlightStatus().catch((error) => {
    console.error("Error initializing FlightStatus:", error);
});
exports.default = FlightStatus;
