const express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
const PORT = process.env.PORT || 5000;
const { initGame, gameLoop, getUpdatedVelocity,isJumping } = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeid } = require('./utils');

const state = {};
const clientRooms = {};

var home = require('./routes/index')

room = 'abc';

app.use(express.static(path.join(__dirname, 'public'))); 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', home);

io.on('connection', client => {

  client.on('keydown', handleKeydown);
  client.on('newGame', handleNewGame);
  client.on('joinGame', handleJoinGame);

  function handleJoinGame(roomName) {
    const room = io.sockets.adapter.rooms[roomName];

    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }

    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      client.emit('unknownCode');
      return;
    } else if (numClients > 1) { //to be changed "more players"
      client.emit('tooManyPlayers');
      return;
    }

    clientRooms[client.id] = roomName;

    client.join(roomName);
    client.number = numClients+1;
    client.emit('init', numClients+1);
    if(numClients === 1){ //to be changed "more players"
      startGameInterval(roomName);
    }
  }

  function handleNewGame() {
    let roomName = makeid(5);
    console.log("newgame")
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);

    state[roomName] = initGame();

    client.join(roomName);
    client.number = 1;
    client.emit('init', 1);
  }

  function handleKeydown(keyCode) {
    const roomName = clientRooms[client.id];
    if (!roomName) {
      return;
    }

    const vel = getUpdatedVelocity(keyCode);
    const jumping = isJumping(keyCode)

    if (vel && state[roomName].players != null) { //to be fixed, allows for slow falling
      if(state[roomName].players[client.number - 1].falling){
        state[roomName].players[client.number - 1].vel.x = vel.x;
      }else{
        state[roomName].players[client.number - 1].vel = vel;
      }
    }
    if(jumping && !state[roomName].players[client.number - 1].jumping && !state[roomName].players[client.number - 1].falling){
      // console.log(jumping.jumping)
      state[roomName].players[client.number - 1].jumping = jumping.jumping;
      state[roomName].players[client.number - 1].vel.x = jumping.x;
      state[roomName].players[client.number - 1].vel.y = jumping.y;
    }
  }
});

function startGameInterval(roomName) {
  var winnerOne;
  var winnderTwo;
  const intervalIdOne = setInterval(() => {
    winnerOne = gameLoop(state[roomName].players[0], state[roomName].platforms);
    
    if (!winnerOne) {
      emitGameState(roomName, state[roomName])
    } else {
      emitGameOver(roomName, winner);
      state[roomName] = null;
      clearInterval(intervalIdOne);
    }
  }, 1000 / FRAME_RATE);
  const intervalIdTwo = setInterval(() => {
    winnerTwo = gameLoop(state[roomName].players[1], state[roomName].platforms);
    
    if (!winnerTwo) {
      emitGameState(roomName, state[roomName])
    } else {
      emitGameOver(roomName, winner);
      state[roomName] = null;
      clearInterval(intervalIdTwo);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  io.sockets.in(room)
    .emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
  io.sockets.in(room)
    .emit('gameOver', JSON.stringify({ winner }));
}


http.listen(PORT, () => console.log(`Listening on ${ PORT }`));