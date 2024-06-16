import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';

class Room {
    constructor(roomName, player1_Id, player2_Id, player1_Name, player2_Name, v1, v2) {
        this.roomName = roomName;
        this.playersId = [player1_Id, player2_Id];
        this.playersName = [player1_Name, player2_Name];
        this.value = {
            [player1_Name]: v1,
            [player2_Name]: v2
        }
        this.board = Array(9).fill(null);
        this.moves = 0
    }
}

class Player {
    constructor(playerId, playerName) {
        this.playerId = playerId;
        this.playerName = playerName
        this.idle = true; // Initially idle
    }
}

const playersOnline = new Map();
const matchMakingPlayers = new Map();
const rooms = new Map();

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: ["https://admin.socket.io", 'http://127.0.0.1:5173', 'http://localhost:5173','https://tic-tac-toe-multiplayer-client.onrender.com'],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });
    instrument(io, {
        auth: false
    });


    io.on('connection', (socket) => {
        console.log('a user connected: ', socket.id);
        playersOnline.set(socket.id, socket.id);

        io.emit('total-onlines', playersOnline.size);

        // To Find Random Opponent
        socket.on('find-opponent', (playerName) => {
            matchMakingPlayers.set(socket.id, new Player(socket.id, playerName));
            const availablePlayers = Array.from(matchMakingPlayers.values())
                .filter(player => player.playerId !== socket.id && player.idle)
                .map(player => player.playerId);

            if (availablePlayers.length > 0) {
                const opponentId = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
                const roomName = `room-${socket.id}-${opponentId}`;

                // Update idle status for both players
                matchMakingPlayers.get(socket.id).idle = false;
                matchMakingPlayers.get(opponentId).idle = false;

                const xo = ['X', 'O'];
                const randomIndex = Math.floor(Math.random() * xo.length);
                let obj;
                if (randomIndex === 1) {
                    obj = {
                        value1: 'X',
                        value2: 'O'
                    }
                } else {
                    obj = {
                        value1: 'O',
                        value2: 'X'
                    }
                }

                const newRoom = new Room(
                    roomName,
                    opponentId,
                    socket.id,
                    matchMakingPlayers.get(opponentId).playerName,
                    matchMakingPlayers.get(socket.id).playerName,
                    obj.value1,
                    obj.value2,
                );
                rooms.set(roomName, newRoom);

                socket.join(roomName);
                io.sockets.sockets.get(opponentId).join(roomName);

                io.to(opponentId).emit('match-found', newRoom);
                io.to(socket.id).emit('match-found', newRoom);
            } else {
                console.log('No players available to match with');
                io.to(socket.id).emit('match-not-found');
            }
        });

        // To Perform Real-Time Interaction Of GamePlay
        socket.on('playing', (obj) => {
            const { roomDetails, btnId, value } = obj;
            const index = parseInt(btnId.replace('btn', ''));
            const roomId = roomDetails.roomName;
            const room = rooms.get(roomId);

            if (room) {
                room.board[index] = value;
                room.moves++;

                const winningCombinations = [
                    [0, 1, 2],
                    [3, 4, 5],
                    [6, 7, 8],
                    [0, 3, 6],
                    [1, 4, 7],
                    [2, 5, 8],
                    [0, 4, 8],
                    [2, 4, 6]
                ];

                for (const combination of winningCombinations) {
                    const [a, b, c] = combination;
                    if (room.board[a] && room.board[a] === room.board[b] && room.board[a] === room.board[c]) {
                        io.to(roomId).emit('playing', { btnId, value, roomDetails });
                        io.to(roomId).emit('game-over', { winner: room.board[a] });
                        rooms.delete(roomId);
                        return;
                    }
                }

                if (!room.board.includes(null)) {
                    io.to(roomId).emit('playing', { btnId, value, roomDetails });
                    io.to(roomId).emit('game-over', { winner: 'Draw' });
                    rooms.delete(roomId);  // Delete the room
                    return;
                }

                io.to(roomId).emit('playing', { btnId, value, roomDetails });
            } else {
                console.log(`Room ${roomId} not found.`);
                return null;
            }
        });


        // Need To Implement
        socket.on('play-with-friend', () => {
            console.log('got event2');
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            playersOnline.delete(socket.id); // O(1) time complexity

            // Find and handle the room associated with the disconnected player
            for (const [roomName, room] of rooms.entries()) {
                if (rooms.size !== 0) {
                    if (room.playersId.includes(socket.id)) {
                        // Notify the opponent that the player has disconnected
                        const opponentId = room.playersId.find(id => id !== socket.id);
                        io.to(opponentId).emit('opponent-disconnected');

                        // Remove the room from rooms map
                        rooms.delete(roomName);

                        console.log(`Room ${roomName} deleted due to player disconnect`);
                        break; // Exit loop once room is found and handled
                    }
                }
            }
            io.emit('total-onlines', playersOnline.size);
        });
    });

}

export { initializeSocket };
