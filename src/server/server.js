const express = require("express");
const path = require("path")

const app = express();

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../../build')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../build', 'index.html'));
});

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  transports: ["websocket", "polling"]
}
);
const users = {};
io.on("connection", client => {
  console.log("Server connected !")
  client.on("username", username => {
    const user = {
      name: username,
      id: client.id
    };
    users[client.id] = user;
    io.emit("connected", user);
    io.emit("users", Object.values(users));
  });

  client.on("send", message => {
    io.emit("message", {
      text: message,
      date: new Date().toISOString(),
      user: users[client.id]
    });
  });

  client.on("disconnect", () => {
    const username = users[client.id];
    delete users[client.id];
    io.emit("disconnected", client.id);
  });
});
server.listen(3000,()=>{
  console.log("Server running on port 3000")
});