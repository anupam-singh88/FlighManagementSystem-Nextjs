const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

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

io.on('connection', (socket :any) => {
    console.log('a user connected');
    const intervalId = setInterval(() => {
        const rowData = { timestamp: new Date(), value: Math.random() };
        socket.emit('newRow', rowData);
        // console.log(rowData)
        // generateRandomFlight();
    }, 5000);

    socket.on('disconnect', () => {
        console.log('user disconnected');
        clearInterval(intervalId); // Clear interval when user disconnects
    });
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
