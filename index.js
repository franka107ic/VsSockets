/**
 * Https Integration
 */
const express = require("express");
const app = express();
const { Server } = require("socket.io");
const https = require("https");
const fs = require("fs");
const privateKey = fs.readFileSync(
  "/etc/letsencrypt/live/ic-proj-updates-sockets-server.ideascloud.io/privkey.pem",
  "utf8"
);
const certificate = fs.readFileSync(
  "/etc/letsencrypt/live/ic-proj-updates-sockets-server.ideascloud.io/fullchain.pem",
  "utf8"
);
const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);
const io = new Server(httpsServer);

app.use("/", (req, res) => {
  res.send("<h1>Welcome to ideascloud socket server</h1>");
});

io.on("connection", (socket) => {
  console.log("New device connected");

  socket.on("joinChannel", ({ projectId }) => {
    console.log("A device is joining to project room");
    socket.join(projectId);
  });

  socket.on("onChange", ({ projectId }) => {
    console.log(`A change ocurred in project: ${projectId}`);
    socket.broadcast.to(projectId).emit("onChange", { projectId });
  });

  socket.on("disconnect", () => {
    console.log("A device was disconnected");
  });
});

const HTTPSPORT = 443;

httpsServer.listen(HTTPSPORT, () =>
  console.log(`server listening at https: ${HTTPSPORT}`)
);
