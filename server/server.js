import express from 'express';
import cors from 'cors';
import http from 'http';
import { initializeSocket } from './socket/socket.js';

const app = express();
const port = 3000;

const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server (no need to store the return value if not used)
initializeSocket(server);

app.use(cors({
    origin: ['http://127.0.0.1:5173', 'http://localhost:5173','https://tic-tac-toe-multiplayer-client.onrender.com'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Define a route for the root path
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
