const path = require('path');
const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

// create connection with server and client
io.on('connection', (socket) => {

    // socket is an object with information of new connection
    console.log('New WebSockets connection');

    socket.on('join', ({ username, room }, callback) => {

        //socket.on('join', (options, callback) => {
    
        const { error, user } = addUser({ id: socket.id, username, room });
        //const { error, user } = addUser({ id: socket.id, ...options });

        if (error) {
            return callback(error);
        }
        // here join method allows us to join a given chat room and pass the name of room
        // have to join with exact room
        socket.join(user.room);

        // pass data to single client
        socket.emit('message', generateMessage('Admin', 'Welcome!'));
        
        // broadcast send data except this particular socket
        // here we have to indicate what room he used
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        callback();
    });

    // getting data from client
    socket.on('sendMessage', (message, callback) => {

        const user = getUser(socket.id);
        // checking the bed words that client given
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed');
        }

        // pass data to every connected socket
        io.to(user.room).emit('message', generateMessage(user.username, message));
        // callback('Delivered');
        callback();
    });

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    });

    // whenever a client gets disconnected
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        // get every connected client that  one client are disconnect
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });
});

server.listen(port, () => {
    console.log(`Server is running on ${port}`);
});