const { bullet } = require('./bullets');
const { GRID_SIZE } = require('./constants');
const { GRAVITY } = require('./constants');
const { PLAYER_SIZE } = require('./constants');
const { levelOne } = require('./levels');
const { player } = require('./player');

let fallCounter = 0

module.exports = {
  initGame,
  gameLoop,
  getUpdatedVelocity,
  isJumping,
}

function initGame() {
  const state = createGameState()
  return state;
}

function createGameState() {
  return {
    players: [],
    platforms: levelOne(),
    gridsize: GRID_SIZE,
    gameEnded: false,
  };
}
function gameLoop(player, platforms) {
  if (!player) {
    return;
  }

  //let prevPlayerState = Object.assign({}, player);
  playerGravity(player);

  playerCollisions(player, platforms);

  bulletMovement(player.weapon, platforms);

  shootingTime(player.weapon)

  return;
}
function playerCollisions(player, platforms){
  var onPlatform = []
  for(i=0; i<platforms.length; i++){
    // console.log(player.bottom, prevPlayer.bottom, platforms[i]);
    // if(pointOnLine(player.bottom, prevPlayer.bottom, platforms[i]).between_y) console.log("test")
    //console.log(pointOnLine(player.bottom, prevPlayerState.bottom, platforms[i]).between_y);
    if(platforms[i].intersects(player.bottom, {w: PLAYER_SIZE-10, h: 10})){
      if(!player.jumping){
        player.vel.y = 0
      }
      player.falling = false;
      player.updateOnCollideGround(platforms[i])
      onPlatform.push(true);
      //console.log("bottom: "+ player.pos.x, player.pos.y)
      continue
    }else{
      onPlatform.push(false);
    }
    if(platforms[i].intersects(player.top, {w: PLAYER_SIZE-10, h: 10})){
      player.vel.y = GRAVITY;
      player.updateOnCollideCeiling(platforms[i]);
      player.falling = true;
      // console.log("top : "+ player.pos.x, player.pos.y)
      continue
    }
    if(platforms[i].intersects(player.right, {w: 10, h: PLAYER_SIZE-10})){
      player.vel.x = 0;
      player.updateOnCollideRight(platforms[i]);
      //console.log("right: "+ player.pos.x, player.pos.y, platforms[i])
      continue
    }
    if(platforms[i].intersects(player.left, {w: 10, h: PLAYER_SIZE-10})){
      player.vel.x = 0;
      player.updateOnCollideLeft(platforms[i]);
      //console.log("left: "+ player.pos.x, player.pos.y)
      continue
    }
  }
  if(onPlatform.every(function(bool){return bool === false})){
    player.falling = true;
  }
}

function playerGravity(player){
  //console.log(player.vel.y);
  player.updatePosition();

  if(player.falling){
    player.vel.y += GRAVITY
    //console.log(player.vel.y);
  }
  if(player.jumping){
    player.vel.y -= GRAVITY*10
    if(player.vel.y <= -7){ //how high can jump
      player.falling = true;
      player.jumping = false;
    }
  }
}

function bulletMovement(weapon, platforms){
  for(i=0 ; i<weapon.bullets.length; i++){
    weapon.bullets[i].updatePosition();
    //bullet out of canvas
    if (weapon.bullets[i].pos.x + weapon.bullets[i].radius < 0 || weapon.bullets[i].pos.x - weapon.bullets[i].pos.radius > GRID_SIZE || weapon.bullets[i].pos.y + weapon.bullets[i].radius < 0 || weapon.bullets[i].pos.y - weapon.bullets[i].radius > GRID_SIZE) {
      weapon.bullets.splice(i, 1);
      i--; //fixes out of bounds after splice.
      continue;
    }
    //bullet wall collision
    for(j=0; i>-1 && j<platforms.length; j++){
      if(platforms[j].intersects({x: weapon.bullets[i].pos.x-weapon.bullets[i].radius, y:weapon.bullets[i].pos.y-weapon.bullets[i].radius}, {w: weapon.bullets[i].radius*2, h: weapon.bullets[i].radius*2})){
        weapon.bullets.splice(i, 1);
        i--; //fixes out of bounds after splice.
      }
    }
  }
}

function shootingTime(weapon){
  if(weapon.fireCounter > 4){
    weapon.fireCounter = 0
    weapon.shooting = false;
  }else{
    weapon.fireCounter++;
  }
}

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
