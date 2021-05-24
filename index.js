/**
 * Https Integration
 */
const express = require("express");
const app = express();
const { Server } = require("socket.io");
const https = require("https");
const fs = require("fs");
const ProjectsManager = require("ideascloud-sdk/classes/ProjectsManager");

const privateKey = fs.readFileSync(
  "/etc/letsencrypt/live/ic-proj-updates-sockets-server.ideascloud.io/privkey.pem",
  "utf8"
);
const certificate = fs.readFileSync(
  "/etc/letsencrypt/live/ic-proj-updates-sockets-server.ideascloud.io/fullchain.pem",
  "utf8"
);

// const privateKey = fs.readFileSync("./privkey.pem");
// const certificate = fs.readFileSync("./fullchain.pem");
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

io.use(async (socket, next) => {
  console.log(socket.handshake.query);
  if (socket.handshake.query && socket.handshake.query.token) {
    //TODO: [IC-9] Verify from ideascloud-sdk
    try {
      const projectsManager = new ProjectsManager({
        accessToken: socket.handshake.query.token,
      });
      await projectsManager.listProjects();
      console.log("Auth succesfully");
      next();
    } catch (e) {
      console.error("Authenticaton error");
    }
  } else {
    console.error("Authentication Error");
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
