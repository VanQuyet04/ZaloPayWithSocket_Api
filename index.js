const express = require('express'); 
const CryptoJS = require('crypto-js'); //mã hóa dữ liệu

const http = require("http");
const app = express();
const server = http.createServer(app);
const {Server}=require("socket.io");

const io = new Server(server);

const config = {
  key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf" 
};

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Lắng nghe sự kiện kết nối từ client 
io.on("connection", function (socket) {
  console.log("Có người kết nối", socket.id);
  socket.on("disconnect", () => {
      console.log("Người dùng đã ngắt kết nối: ", socket.id);

  })

})

// hàm xử lí khi nhận được callback từ zalopay
app.post('/api/callback', (req, res) => {
  const callbackData = req.body;
  const dataStr = callbackData.data; // Dữ liệu từ Zalopay
  const reqMac = callbackData.mac; // MAC từ Zalopay

  // Tính toán MAC từ dữ liệu nhận được
  const calculatedMac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();

  console.log("MAC từ Zalopay:", reqMac);
  console.log("MAC tính toán:", calculatedMac);

  // So sánh MAC
  if (reqMac !== calculatedMac) {
    console.log("MAC không hợp lệ");
    return res.status(400).json({ return_code: -1, return_message: "mac not equal" });
  }

  // Nếu MAC hợp lệ, xử lý dữ liệu
  const dataJson = JSON.parse(dataStr); // Giải mã dữ liệu
  console.log("Thông tin thanh toán:", dataJson);

  // Xử lý logic để cập nhật trạng thái đơn hàng ở đây
  io.emit("paymentStatus", {
    app_trans_id: dataJson.app_trans_id,
    status: "Success"
  })


  // Phản hồi lại Zalopay
  return res.status(200).json({ return_code: 1, return_message: "Success" });
});

// Khởi động server

server.listen(3000, () => {
  console.log("Server run at port 3000");
})