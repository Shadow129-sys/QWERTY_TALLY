const express = require('express');
const http = require('https');
const cors = require('cors');
const getSentence = require('./utils/getSentence');
const BadRequestError = require("./errors/badRequest");
// const { Server } = require('socket.io');

// configs
const port = process.env.PORT || 4000;

const app = express();
app.use(cors());
// const httpServer = http.createServer(app);
/*
const io = new Server(httpServer, {
    cors: {
        // origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log(socket.toString());
});
*/
app.get("/", (req, res) => {
    res.send("Response from server");
});

// Text Route
app.get("/text", async (req, res) => {
    try{
        let mode = req.query.mode!==undefined ? req.query.mode : "0";
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

app.listen(port, () => {
    console.log("app is running");
});