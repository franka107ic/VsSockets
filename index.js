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

io.on("connection", (socket) => {
  socket.on("joinChannel", ({ projectId }) => {
    socket.join(projectId);
  });

  socket.on("onChange", ({ projectId }) => {
    io.to(projectId).emit("onChange", { projectId });
  });

  socket.on("disconnect", () => {
    console.log("disconnect");
  });
});

const HTTPSPORT = 443;

httpsServer.listen(HTTPSPORT, () =>
  console.log(`server listening at https: ${HTTPSPORT}`)
);
