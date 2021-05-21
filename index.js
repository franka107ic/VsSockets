/**
 * Https Integration
 */
const express = require("express");
const app = express();
const { Server } = require("socket.io");
const https = require("https");
const fs = require("fs");
// const privateKey = fs.readFileSync(
//   "/etc/letsencrypt/live/ic-proj-updates-sockets-server.ideascloud.io/privkey.pem",
//   "utf8"
// );
// const certificate = fs.readFileSync(
//   "/etc/letsencrypt/live/ic-proj-updates-sockets-server.ideascloud.io/fullchain.pem",
//   "utf8"
// );
const privateKey = fs.readFileSync("./privkey.pem");
const certificate = fs.readFileSync("./fullchain.pem");
const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);
const io = new Server(httpsServer, {
  cors: {
    origin: "*",
  },
});

app.use("/", (req, res) => {
  res.send("<h1>Welcome to ideascloud socket server</h1>");
});

app.post("/emitChange", (req, res) => {
  io.broadcast.to(req.body.projectId);
});

io.use((socket, next) => {
  console.log(socket.handshake.query);
  if (socket.handshake.query && socket.handshake.query.token) {
    //TODO: Verify from ideascloud-sdk
    //------------- Test Auth -------------------
    const tokens = ["token1", "token2"];
    if (tokens.find((token) => token === socket.handshake.query.token)) {
      next();
    } else {
      throw new Error("Authentication Error");
    }
    //-------------------------------------------
  } else {
    throw new Error("Authentication Error");
  }
});

io.on("connection", (socket) => {
  console.log("New device connected");

  socket.on("joinChannel", ({ projectId }) => {
    console.log("A device is joining to project room");
    socket.join(projectId);
  });

  //socket.

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
