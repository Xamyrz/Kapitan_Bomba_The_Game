
const BG_COLOUR = '#231f20';
const FOOD_COLOUR = '#e66916';
const PLAYER_SIZE = 75;

const socket = io();

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

const shootBtn = document.getElementById('shootButton');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);

shootBtn.addEventListener('touchstart', shoot, false);
shootBtn.addEventListener('click', shoot, false);


function newGame() {
  socket.emit('newGame');
  console.log("emitted")
  init();
}

function joinGame() {
  const code = gameCodeInput.value;
  socket.emit('joinGame', code);
  init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;
var joy;

function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";
  shootBtn.style.display = "block";

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvas.height = 600;

  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  gameActive = true;


  joy = new JoyStick('joyDiv');

  let joystick = document.getElementById('joyDiv');
  joystick.style.display = "block";

  setInterval(function(){
      socket.emit('keydown', joy.GetDir());
  }, 50);

  joyTwo = new JoyStick('joyWeapon')

  let joystickWeapon = document.getElementById('JoyWeapon');

  setInterval(function(){
      if(joyTwo.GetPosX() !== 100 && joyTwo.GetPosY() !== 100){
        socket.emit('weaponDir', {x: joyTwo.GetPosX(), y: joyTwo.GetPosY()});
      }
  }, 50);
}

var bomba = new Image();
var szeregowyOne = new Image();
var szeregowyTwo = new Image();
var weapon = new Image();
bomba.src = './bomba.png';
szeregowyOne.src = './szeregowy1.png';
szeregowyTwo.src = './szeregowy2.png';
weapon.src = './weapon.png';

function paintGame(state) {
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // const food = state.food;
  const gridsize = state.gridsize;
  const size = gridsize;
  const platforms = state.platforms;

  for(i=0;i<platforms.length;i++){
    ctx.fillStyle = platforms[i].color;
    ctx.fillRect(platforms[i].x, platforms[i].y, platforms[i].w, platforms[i].h);
  }
  paintPlayer(state.players[0], size, bomba);
  paintPlayer(state.players[1], size, szeregowyOne)
  //paintPlayer(state.players[2], size, szeregowytwo)
}

function paintPlayer(playerState, size, p) {
  const playerWeapon = playerState.weapon;
  const playerPos = playerState.pos;
  ctx.drawImage(p, playerPos.x, playerPos.y, PLAYER_SIZE, PLAYER_SIZE);
  for(i = 0; i<playerWeapon.bullets.length; i++){
    drawBullets(playerWeapon.bullets[i]);
  }
  drawImage(weapon, playerWeapon.pos.x,playerWeapon.pos.y, 0.1, playerWeapon.rotation);
  ctx.setTransform(1,0,0,1,0,0);
}

function shoot(){
  console.log("shoot")
  if(gameActive){
    socket.emit('shooting', true);
  }
}

function handleInit(number) {
  playerNumber = number;
}

function handleGameState(gameState) {
  if (!gameActive) {
    return;
  }
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
  if (!gameActive) {
    return;
  }
  data = JSON.parse(data);

  // gameActive = false;

  // if (data.winner === playerNumber) {
  //   alert('You Win!');
  // } else {
  //   alert('You Lose :(');
  // }
}

function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}

function handleUnknownCode() {
  reset();
  alert('Unknown Game Code')
}

function handleTooManyPlayers() {
  reset();
  alert('This game is already in progress');
}

function reset() {
  playerNumber = null;
  gameCodeInput.value = '';
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}

function drawImage(image, x, y, scale, rotation){
  ctx.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
  ctx.rotate(rotation);

  if((0 <= rotation && rotation <= 0.7853981633974483) || //turn the weapon
    -0.7853981633974483 <= rotation && rotation <= 0){
    ctx.scale(1, -1);
  }
  ctx.drawImage(image, -image.width / 2, -image.height / 2);
  ctx.restore();
}

function drawBullets(bullet) {
  // ctx.fillStyle = "orange"
  // ctx.fillRect(bullet.pos.x, bullet.pos.y, bullet.radius, bullet.radius);
  ctx.save()
  ctx.globalAlpha = 1
  ctx.beginPath()
  ctx.arc(bullet.pos.x, bullet.pos.y, bullet.radius, 0, Math.PI * 2, false)
  ctx.fillStyle = "orange"
  ctx.fill()
  ctx.restore()
}