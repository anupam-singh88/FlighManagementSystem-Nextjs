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
const airlineSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
});
const Airline = mongoose_1.default.models.Airline || mongoose_1.default.model("Airline", airlineSchema);
const initializeAirlines = () => __awaiter(void 0, void 0, void 0, function* () {
    const defaultAirlines = ["Airline A", "Airline B", "Airline C", "Airline D", "Airline E"];
    for (const name of defaultAirlines) {
        yield Airline.findOneAndUpdate({ name }, { name }, { upsert: true, new: true });
    }
});
initializeAirlines().catch((error) => {
    console.error("Error initializing airlines:", error);
});
exports.default = Airline;
