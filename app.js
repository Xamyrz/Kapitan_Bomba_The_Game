const express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);
const PORT = process.env.PORT || 5000;
const { initGame, gameLoop, getUpdatedVelocity,isJumping } = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeid } = require('./utils');

const { PLAYER_SIZE } = require('./constants');
const { player } = require('./player');
const { enemy } = require('./enemy');

const state = {};
const clientRooms = {};
let playerRooms = {};

var home = require('./routes/index');
const { CLIENT_RENEG_WINDOW } = require('tls');

room = 'abc';

app.use(express.static(path.join(__dirname, 'public'))); 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', home);

io.on('connection', client => {

  client.on('keydown', handleKeydown);
  client.on('weaponDir', handleWeaponDir);
  client.on('shooting', handleShooting);
  client.on('newGame', handleNewGame);
  client.on('joinGame', handleJoinGame);
  client.on('joinSpectate', handleSpectate);

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
    } else if (playerRooms[roomName].length > 3) { //to be changed "more players"
      client.emit('tooManyPlayers');
      return;
    }
    playerRooms[roomName].push(client.id);
    console.log(playerRooms[roomName])
    clientRooms[client.id] = roomName;
    console.log(playerRooms[roomName]);

    client.join(roomName);
    client.emit('init', room.player); //to be changed
    if(playerRooms[roomName].length < 4){ //to be changed "more players"
      startPlayerInterval(roomName, playerRooms[roomName].length-1);
    }
    if(playerRooms[roomName].length > 1){
      spawEnemies(roomName)
      // const interval = setInterval(() => {
      //   spawEnemies(roomName);
      //   if (state[roomName].gameEnded) {
      //     clearInterval(interval);
      //   }
      // }, 5000);
    }
  }

  function handleSpectate(roomName) {
    if(playerRooms[roomName]){
      client.join(roomName);
      client.emit('init', 0);
    }
  }

  function handleNewGame() {
    let roomName = makeid(5);
    playerRooms[roomName] = [];
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);

    state[roomName] = initGame();
    
    client.join(roomName);
    client.emit('init', 0);
    startEmitInterval(roomName);
  }

  function handleKeydown(keyCode) {
    const roomName = clientRooms[client.id];
    if (!roomName || playerRooms[roomName].indexOf(client.id) === -1) {
      return;
    }

    const playerIndex = playerRooms[roomName].indexOf(client.id);

    const vel = getUpdatedVelocity(keyCode);
    const jumping = isJumping(keyCode)

    if (vel && state[roomName].players != null) { //to be fixed, allows for slow falling
      if(state[roomName].players[playerIndex].falling){
        state[roomName].players[playerIndex].vel.x = vel.x;
      }else{
        state[roomName].players[playerIndex].vel = vel;
      }
    }
    if(jumping && !state[roomName].players[playerIndex].jumping && !state[roomName].players[playerIndex].falling){
      // console.log(jumping.jumping)
      state[roomName].players[playerIndex].jumping = jumping.jumping;
      state[roomName].players[playerIndex].vel.x = jumping.x;
      state[roomName].players[playerIndex].vel.y = jumping.y;
    }
  }

  function handleWeaponDir(position) {
    const roomName = clientRooms[client.id];
    if (!roomName || playerRooms[roomName].indexOf(client.id) === -1) {
      return;
    }

    const playerIndex = playerRooms[roomName].indexOf(client.id);
    state[roomName].players[playerIndex].weapon.weaponRotate(position);
    //console.log("hi: "+state[roomName].players[client.number - 1].weapon.rotation)
  }

  function handleShooting(){
    const roomName = clientRooms[client.id];
    if (!roomName || playerRooms[roomName].indexOf(client.id) === -1) {
      return;
    }

    const playerIndex = playerRooms[roomName].indexOf(client.id);

    state[roomName].players[playerIndex].weapon.shooting = true;
    state[roomName].players[playerIndex].weapon.shoot();
  }
});


function startPlayerInterval(roomName, playerIndex) {
  var loop;
  state[roomName].players.push(new player(PLAYER_SIZE,PLAYER_SIZE, 200, 300));
  const intervalId = setInterval(() => {
    loop = gameLoop(state[roomName].players[playerIndex], state[roomName].platforms, state[roomName].enemies);
    
    if (state[roomName].gameEnded) {
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function startEmitInterval(roomName) {
  const emitInterval = setInterval(() => {
    if (state[roomName].gameEnded) {
      emitGameOver(roomName, winner);
      delete state[roomName];
      delete playerRooms[roomName];
      console.log(playerRooms, state[roomName]);
      clearInterval(emitInterval);
    } else {
      emitGameState(roomName, state[roomName])
    }
  }, 1000 / FRAME_RATE);
}

function spawEnemies(roomName){
  state[roomName].enemies.push(new enemy(PLAYER_SIZE,PLAYER_SIZE, 400, 300, Math.floor(Math.random() * 3)));
  const enemySpawned = state[roomName].enemies[state[roomName].enemies.length - 1];
  const enemyIndex = state[roomName].enemies.length - 1;
  const enemyInterval = setInterval(() => {
    gameLoop(enemySpawned, state[roomName].platforms, state[roomName].players);
    if(Math.floor(Math.random() * 30) === 25){
      enemySpawned.weapon.shoot(state[roomName].players[Math.floor(Math.random() * state[roomName].players.length)])
    }
    if (state[roomName].gameEnded || enemySpawned.health === 0) {
      state[roomName].enemies.splice(enemyIndex, 1);
      clearInterval(enemyInterval);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  io.sockets.in(room)
    .emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
  //delete playerRooms[room];
  io.sockets.in(room)
    .emit('gameOver', JSON.stringify({ winner }));
}


http.listen(PORT, () => console.log(`Listening on ${ PORT }`));