import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { addRandomFlights } from '../src/lib/actions/flight-actions';
import dbConnect from '../src/lib/dbConnect';

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

const emittedFlightIds = new Set();

io.on('connection', async (socket) => {
    await dbConnect();
    console.log('a user connected');

    const intervalId = setInterval(async () => {
        try {
            const data = await addRandomFlights();
            if (!emittedFlightIds.has(data._id.toString())) {
                socket.emit('newFlight', data);
                emittedFlightIds.add(data._id.toString());
                console.log("New flight data sent:", data);
            }
        } catch (error) {
            console.error('Error generating or saving flight data:', error);
        }
    }, 5000);

    socket.on('disconnect', () => {
        console.log('user disconnected');
        clearInterval(intervalId); 
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
