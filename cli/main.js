const io = require("socket.io-client");
const blessed = require("blessed");

const socket = io("http://localhost:3000");

const screen = blessed.screen({
  smartCSR: true,
  title: 'Tetris Terminal Client',
});

const box = blessed.box({
  top: 'center',
  left: 'center',
  width: '50%',
  height: '100%',
  label: 'Disconnected',
  content: 'You are not connected.',
  tags: true,
  border: {
    type: 'line',
  },
  style: {
    fg: 'white',
    border: {
      fg: '#f0f0f0',
    },
  },
});

screen.append(box);
screen.render();

function createRandomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}


socket.on("connect", () => {
  box.setLabel("Connected");
  box.setContent("Waiting for instructions...");
  screen.render();
  socket.emit("client-update", {
    username: "c-" + createRandomString(5),
  });
});

socket.on("client-updated", (data) => {
  const parsedData = JSON.parse(data);

  box.setLabel("Connected");
  box.setContent("Connected as " + parsedData.username);
  screen.render();

  setTimeout(() => {
    socket.emit("room-join", {
      roomName: "testRoom",
    });
  }, 1000);
});

socket.on("room-created", (data) => {
  const parsedData = JSON.parse(data);

  box.setLabel("Connected");
  box.setContent(`Joined room ${parsedData.roomName}. You are owner!`);
  screen.render();
});

socket.on("room-joined", (data) => {
  const parsedData = JSON.parse(data);

  box.setLabel("Connected");
  box.setContent(`Joined room ${parsedData.roomName}. You are player!`);
  screen.render();
});

socket.on("game-started", (data) => {
  const parsedData = JSON.parse(data);
  const pieces = parsedData.pieces;

  box.setLabel(`${parsedData.room} - Game started`);
  box.setContent(`Clients: ${parsedData.clients.map((client) => {
    return client.username + ", ";
  })}\n-- First piece --\n* shape: ${pieces[0].shape}\n* color: ${pieces[0].color}\n* position: (x=${pieces[0].position.x}, y=${pieces[0].position.y})`);
  screen.render();
});

function formatBoard(board) {
  let formattedBoard = "";
  for (let row of board) {
    formattedBoard += row.map(cell => cell.filled ? (cell.indestructible ? 'X' : cell.ghost ? 'G' : '1') : '0').join(' ') + "\n";
  }
  return formattedBoard;
}

socket.on("game-state", (data) => {
  const grid = data.grid;
  const board = formatBoard(grid);

  box.setLabel(`${data.room} - Game started`);
  box.setContent(`-- Board --\n${board}`);
  screen.render();
});

// socket.on("gameUpdate", (data) => {
//   const board = formatBoard(data.board);
//   box.setContent(board);
//   screen.render();
// });

// screen.key(['left', 'right', 'up', 'down', 'space'], function (ch, key) {
//   socket.emit("input", key.name);
// });

screen.key(['left', 'right', 'up', 'down', 'space'], function (ch, key) {
  const direction = key.name;
  socket.emit("move-piece", {
    direction: direction,
  });
});

screen.key(['s'], function (ch, key) {
  socket.emit("start-game");
});

screen.key(['q', 'C-c'], function () {
  return process.exit(0);
});
