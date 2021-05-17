const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {

  socket.on("joinChannel", ({ projectId }) => {
    socket.join(projectId);
  });

  socket.on("onChange", ({ projectId }) => {
    io.to(projectId).emit("onChange", ({projectId}));
  });

  socket.on("disconnect", () => {
    console.log("disconnect");
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () =>
  console.log(`server listening at http://localhost:${PORT}`)
);
