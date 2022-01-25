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
const { Player } = require('./player');
const { Enemy } = require('./enemy');

const state = {};
const clientRooms = {};
let playerRooms = {};

var home = require('./routes/index');
const { CLIENT_RENEG_WINDOW } = require('tls');
const { stat } = require('fs');
const { callbackify } = require('util');

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
    if (!playerRooms[roomName]) {
      client.emit('unknownCode');
      return;
    } else if (playerRooms[roomName].length > 3) {
      client.emit('tooManyPlayers');
      return;
    }

    playerRooms[roomName].push(client.id);
    clientRooms[client.id] = roomName;

    client.join(roomName);
    client.emit('init', 1); //to be changed
    if(playerRooms[roomName].length < 4){ //to be changed "more players"
      startPlayerInterval(roomName, client.id);
    }
    if(playerRooms[roomName].length > 1){
      // spawEnemies(roomName)
      const interval = setInterval(() => {
        if (!state[roomName]) {
          clearInterval(interval);
        }else{
          spawEnemies(roomName);
        }
      }, 5000);
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
    if (!roomName || !playerRooms[roomName] || !state[roomName].players[client.id]) {
      return;
    }

    const vel = getUpdatedVelocity(keyCode);
    const jumping = isJumping(keyCode)

    if (vel && state[roomName].players != null) { 
      if(state[roomName].players[client.id].falling){
        state[roomName].players[client.id].vel.x = vel.x;
      }else{
        state[roomName].players[client.id].vel = vel;
      }
    }
    if(jumping && !state[roomName].players[client.id].jumping && !state[roomName].players[client.id].falling){
      state[roomName].players[client.id].jumping = jumping.jumping;
      state[roomName].players[client.id].vel.x = jumping.x;
      state[roomName].players[client.id].vel.y = jumping.y;
    }
  }

  function handleWeaponDir(position) {
    const roomName = clientRooms[client.id];
    if (!roomName || !state[roomName] || !state[roomName].players[client.id]) {
      return;
    }

    state[roomName].players[client.id].weapon.weaponRotate(position);
  }

  function handleShooting(){
    const roomName = clientRooms[client.id];
    if (!roomName || !state[roomName] || !state[roomName].players[client.id]) {
      return;
    }


    state[roomName].players[client.id].weapon.shooting = true;
    state[roomName].players[client.id].weapon.shoot();
  }
});


function startPlayerInterval(roomName, playerId) {
  var loop;
  state[roomName].players[playerId] = new Player(PLAYER_SIZE,PLAYER_SIZE, 200, 300, playerRooms[roomName].length-1);
  const player = state[roomName].players[playerId]

  const intervalId = setInterval(() => {
    if(!state[roomName]){
      clearInterval(intervalId);
    }else{
      loop = gameLoop(player, state[roomName].platforms, state[roomName].enemies);
      
      if(state[roomName].players[playerId].kills === 10){
        state[roomName].gameEnded = true;
        state[roomName].winner = state[roomName].players[playerId];
      }

      if (state[roomName].gameEnded || player.health <= 0) {
        clearInterval(intervalId);
        delete state[roomName].players[playerId];
      }
    }
  }, 1000 / FRAME_RATE);
}

function startEmitInterval(roomName) {
  let gameIdling = false;
  const checkGameIdling = setTimeout(() => {
    if(playerRooms[roomName] === undefined || !playerRooms[roomName].length || playerRooms[roomName].length === 1){
      gameIdling = true;
    }
  }, 120000);
  const emitInterval = setInterval(() => {
    let noPlayersLeft = (Object.keys(state[roomName].players).length === 0 && playerRooms[roomName].length > 0);
    if (state[roomName].gameEnded || noPlayersLeft || gameIdling) {
      if(noPlayersLeft || gameIdling){
        state[roomName].winner = new Player(75,75,0,0,69);
      }
      emitGameOver(roomName, state[roomName].winner);
      clearInterval(emitInterval);
    } else {
      emitGameState(roomName, state[roomName])
    }
  }, 1000 / FRAME_RATE);
}

function spawEnemies(roomName){
  const enemyId = makeid(20);
  state[roomName].enemies[enemyId] = new Enemy(PLAYER_SIZE,PLAYER_SIZE, Math.floor(Math.random() * (525 - 0 + 1) + 0), -75, Math.floor(Math.random() * 3));
  const enemySpawned = state[roomName].enemies[enemyId];
  const enemyInterval = setInterval(() => {
    if(state[roomName]){
      if (enemySpawned.health === 0) {
        delete state[roomName].enemies[enemyId];
        clearInterval(enemyInterval);
      }

      gameLoop(enemySpawned, state[roomName].platforms, state[roomName].players);
      if(Math.floor(Math.random() * 150) === 25 && Object.keys(state[roomName].players).length !== 0){
        let listKeys = Object.keys(state[roomName].players);
        let randomIndex = Math.floor(Math.random() * listKeys.length);
        enemySpawned.weapon.shoot(state[roomName].players[listKeys[randomIndex]])
      }
    }else{
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
  delete state[room];
  delete playerRooms[room];
  
  io.sockets.in(room)
    .emit('gameOver', JSON.stringify({ winner }));

    io.socketsLeave(room);
}


http.listen(PORT, () => console.log(`Listening on ${ PORT }`));