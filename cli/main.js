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

const nextBox = blessed.box({
  top: 'center',
  left: '5%',
  width: '20%',
  height: '100%',
  label: 'Next Pieces',
  content: '',
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

const spectersBox = blessed.box({
  top: 'center',
  left: '75%',
  width: '20%',
  height: '100%',
  label: 'Specters',
  content: '',
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
screen.append(nextBox);
screen.append(spectersBox);
screen.render();

function createRandomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function formatBoard(board) {
  let formattedBoard = "";
  for (let row of board) {
    formattedBoard += row.map(cell => cell.filled ? (cell.indestructible ? 'X' : cell.ghost ? 'G' : '1') : '0').join(' ') + "\n";
  }
  return formattedBoard;
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

  box.setLabel(`${parsedData.room} - Game started`);
  screen.render();
});

socket.on("game-state", (data) => {
  const grid = data.grid;
  const board = formatBoard(grid);
  const roomLabel = `${data.room.id}@${data.room.owner.username} - ${data.room.status}`;

  box.setLabel(`${roomLabel}`);
  box.setContent(`-- Board --\n${board}`);

  const nextPiecesText = data.nextPieces
    .map((piece, i) => `Piece #${i + 1}:\n${piece.shape.map(row => row.join(' ')).join('\n')}`)
    .join('\n\n');
  nextBox.setContent(nextPiecesText);

  const spectersText = data.clients
    .map(client => `> ${client.username}\n${(client.specter ? formatBoard(client.specter) : 'Loading...')}`)
    .join('\n\n');
  spectersBox.setContent(spectersText);

  screen.render();
});

screen.key(['left', 'right', 'up', 'down', 'space'], function (ch, key) {
  const direction = key.name;
  socket.emit("move-piece", {
    direction: direction,
  });
});

screen.key(['s'], function (ch, key) {
  socket.emit("start-game");
});

screen.key(['r'], function (ch, key) {
  socket.emit("restart-game");
});

screen.key(['q', 'C-c'], function () {
  return process.exit(0);
});
