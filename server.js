const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

io.on("connection", function (socket) {

    console.log("Có người kết nối", socket.id);
    socket.on("disconnect", () => {
        console.log("Người dùng đã ngắt kết nối: ", socket.id);

    })

    socket.on("chat_message", (msg) => {
        console.log("Tin nhắn nhận được: " + msg);
        // Phát sóng tin nhắn đến tất cả client
        io.emit("message", msg);
    });

})

server.listen(8080, () => {
    console.log("Server run at port 8080");
})


