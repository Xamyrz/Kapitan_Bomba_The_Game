const { GRID_SIZE } = require('./constants');
const { GRAVITY } = require('./constants');
const { levelOne } = require('./levels');

module.exports = {
  initGame,
  gameLoop,
  getUpdatedVelocity,
  isJumping,
}

function initGame() {
  const state = createGameState()
  //randomFood(state);
  return state;
}

function createGameState() {
  return {
    players: [{
      jumping: false,
      falling: true,
      pos: {
        x: 3,
        y: 10,
      },
      vel: {
        x: 0,
        y: 0,
      },
      snake: [
        {x: 1, y: 10},
        {x: 2, y: 10},
        {x: 3, y: 10},
      ],
    }, {
      jumping: false,
      falling: true,
      pos: {
        x: 18,
        y: 10,
      },
      vel: {
        x: 0,
        y: 0,
      },
      snake: [
        {x: 20, y: 10},
        {x: 19, y: 10},
        {x: 18, y: 10},
      ],
    }],
    food: {},
    platforms: levelOne(),
    gridsize: GRID_SIZE,
  };
}
function gameLoop(player, platforms) {
  if (!player) {
    return;
  }

  playerCollisions(player, platforms);

  playerGravity(player);
  playerGravity(player);

  return;
}
function playerCollisions(p, s){
  var onPlatform = []
    for(i=0; i<s.length; i++){
      if(s[i].intersects(p)){
        p.vel.y = 0
        p.falling = false;
        p.pos.y = s[i].y-100;
        onPlatform.push(true);
      }else{
        onPlatform.push(false);
      }
    }
    
    if(onPlatform.every(function(bool){return bool === false})){
      p.falling = true;
    }
}

function playerGravity(player){
  player.pos.x += player.vel.x;
  player.pos.y += player.vel.y;

  if(player.falling){
    player.vel.y += GRAVITY
  }
  if(player.jumping){
    player.vel.y -= GRAVITY*20
    if(player.vel.y <= 0){
      player.falling = true;
      player.jumping = false;
    }
  }
}

// function randomFood(state) {
//   food = {
//     x: Math.floor(Math.random() * GRID_SIZE),
//     y: Math.floor(Math.random() * GRID_SIZE),
//   }

//   for (let cell of state.players[0].snake) {
//     if (cell.x === food.x && cell.y === food.y) {
//       return randomFood(state);
//     }
//   }

//   for (let cell of state.players[1].snake) {
//     if (cell.x === food.x && cell.y === food.y) {
//       return randomFood(state);
//     }
//   }

//   state.food = food;
// }

function getUpdatedVelocity(keyCode) {
  switch (keyCode) {
    case "W": { // left
      return { x: -1, y: 0 };
    }
    case "S": { // down
      return { x: 0, y: 1 };
    }
    case "E": { // right
      return { x: 1, y: 0 };
    }
    // case "NW": {
    //   return { x: -1, y: -1}
    // }
    // case "NE": {
    //   return { x: 1, y: -1}
    // }
    // case "SW": {
    //   return { x: -1, y: 1}
    // }
    // case "SE": {
    //   return { x: 1, y: 1}
    // }
    case "C": {
      return null
    }
  }
}

function isJumping(keyCode) {
  switch (keyCode) {
    case "N": { // jump
      return { x: 0, y: 0, jumping: true}
    }
    case "NW": {
      return { x: -1, y: 0, jumping: true}
    }
    case "NE": {
      return { x: 1, y: 0, jumping: true}
    }
    case "C": {
      return { x: 0, y: 0, jumping: false}
    }
  }
}
