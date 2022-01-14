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
    players: [new player(PLAYER_SIZE,PLAYER_SIZE, 390, 10), new player(PLAYER_SIZE,PLAYER_SIZE, 200, 300)],
    platforms: levelOne(),
    gridsize: GRID_SIZE,
  };
}
function gameLoop(player, platforms) {
  if (!player) {
    return;
  }

  //let prevPlayerState = Object.assign({}, player);
  playerGravity(player);

  playerCollisions(player, platforms);

  return;
}
function playerCollisions(player, platforms){
  var onPlatform = []
  for(i=0; i<platforms.length; i++){
    // console.log(player.bottom, prevPlayer.bottom, platforms[i]);
    // if(pointOnLine(player.bottom, prevPlayer.bottom, platforms[i]).between_y) console.log("test")
    //console.log(pointOnLine(player.bottom, prevPlayerState.bottom, platforms[i]).between_y);
    if(platforms[i].intersects(player.right, {w: 10, h: PLAYER_SIZE-10})){
      player.vel.x = 0;
      player.updateOnCollideRight(platforms[i]);
      // console.log("right: "+ player.pos.x, player.pos.y)
      continue
    }
    if(platforms[i].intersects(player.left, {w: 10, h: PLAYER_SIZE-10})){
      player.vel.x = 0;
      player.updateOnCollideLeft(platforms[i]);
      // console.log("left: "+ player.pos.x, player.pos.y)
      continue
    }
    if(platforms[i].intersects(player.bottom, {w: PLAYER_SIZE-10, h: 10})){
      if(!player.jumping){
        player.vel.y = 0
      }
      player.falling = false;
      player.updateOnCollideGround(platforms[i])
      onPlatform.push(true);
      // console.log("bottom: "+ player.pos.x, player.pos.y)
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
    if(player.vel.y <= -5){ //how high can jump
      player.falling = true;
      player.jumping = false;
    }
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
      //return { x: 0, y: 0 };
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

function pointOnLine(pt1, pt2, pt3) {
  const result = {
      on_projected_line: true,
      on_line: false,
      between_both: false,
      between_x: false,
      between_y: false,
  };

  // Determine if on line interior or exterior
  const x = (pt3.x - pt1.x) / (pt2.x - pt1.x);
  const y = (pt3.y - pt1.y) / (pt2.y - pt1.y);

  // Check if on line equation
  result.on_projected_line = x === y;

  // Check within x bounds
  if (
      (pt1.x <= pt3.x && pt3.x <= pt2.x) ||
      (pt2.x <= pt3.x && pt3.x <= pt1.x)
  ) {
      result.between_x = true;
  }

  // Check within y bounds
  if (
      (pt1.y <= pt3.y && pt3.y <= pt2.y) ||
      (pt2.y <= pt3.y && pt3.y <= pt1.y)
  ) {
      result.between_y = true;
  }

  result.between_both = result.between_x && result.between_y;
  result.on_line = result.on_projected_line && result.between_both;
  return result;
}
