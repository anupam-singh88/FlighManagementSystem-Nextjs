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
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const flight_actions_1 = require("../src/lib/actions/flight-actions");
const dbConnect_1 = __importDefault(require("../src/lib/dbConnect"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
const io = new socket_io_1.Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});
const emittedFlightIds = new Set();
io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, dbConnect_1.default)();
    console.log('a user connected');
    const intervalId = setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const data = yield (0, flight_actions_1.addRandomFlights)();
            if (!emittedFlightIds.has(data._id.toString())) {
                socket.emit('newFlight', data);
                emittedFlightIds.add(data._id.toString());
                console.log("New flight data sent:", data);
            }
        }
        catch (error) {
            console.error('Error generating or saving flight data:', error);
        }
    }), 5000);
    socket.on('disconnect', () => {
        console.log('user disconnected');
        clearInterval(intervalId);
    });
}));
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
