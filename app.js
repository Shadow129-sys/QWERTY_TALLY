const express = require('express');
const http = require('http');
const cors = require('cors');
const getSentence = require('./utils/getSentence');
const BadRequestError = require("./errors/badRequest");
const { Server } = require('socket.io');
const getROOMID = require('./utils/getROOMID');
const { get } = require('https');

// configs
const port = process.env.PORT || 4000;
const users_in_room = 3;

const app = express();
app.use(cors());
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
});

users_count = [0, 0, 0]
last_room = ["", "", ""]

io.on("connection", async (socket) => {

    // give { username, id, diff }
    socket.on("get-info", async (data) => {
        const { username, id, mode } = data;
        if(users_count[mode]===0){
            last_room[mode] = getROOMID();
        }
        console.log(users_count);
        console.log("IN ROOM");
        socket.join(last_room[mode]);
        const room_size = io.sockets.adapter.rooms.get(last_room[mode]).size;
        console.log("ROOM SIZE : ", room_size);
        users_count[mode] = room_size;
        socket.emit("assigned-room", { room : last_room[mode] });
        if(users_count[mode]==users_in_room){
            info = {
                room: last_room[mode],
                text: await getSentence(),
            }
            console.log("BROADCAST GAME STARTED");
            io.to(last_room[mode]).emit("get-started", info);
            users_count[mode] = 0;
        }
        console.log(socket.rooms);
    });

    socket.on("get-current-score", (data) => {
        const { username, id, score, room } = data;
        const info = { username, id, score };
        io.to(room).emit("current-score", info);
    });
    
    // Only if game has not started yet
    socket.on("cancel-game", (data)=>{
        const { username, id, mode, room } = data;
        console.log("IN CANCEL");
        let room_size = 0;
        if(io.sockets.adapter.rooms.has(room)){
            room_size = io.sockets.adapter.rooms.get(room).size;
            if(room===last_room[mode]){
                socket.leave(room);
                users_count[mode] = room_size;
            }
        }        
        console.log("ROOM SIZE : ", room_size);
        console.log(users_count[mode]);
    })
    console.log("IN_SOCKET", socket.id);
});


// Home
app.get("/", (req, res) => {
    res.send("Response from server");
});


// Text Route
app.get("/text", async (req, res) => {
    try{
        let mode = req.query.mode==="undefined" ? "0" : req.query.mode;
        if(isNaN(parseInt(mode)))throw new BadRequestError("query parameter mode is not an integer");
        mode = parseInt(mode);
        if(mode<0 || mode>2)throw new BadRequestError("query parameter mode is not valid integer");
        mode = (mode<=0 ? 0 : mode>=2 ? 2 : 1);
        const response = await getSentence(mode);
        res.json({response});
    }catch(err){
        console.log(err);
        res.json({ msg : "Some Error Occured" });
    }
});


httpServer.listen(port, () => {
    console.log("app is running");
});