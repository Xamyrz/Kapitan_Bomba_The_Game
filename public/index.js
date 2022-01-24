
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
const controls = document.getElementById('controls');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const spectateBtn = document.getElementById('joinSpectateBtn');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

const shootBtn = document.getElementById('shootButton');

const toggleGameScreenBtn = document.getElementById("toggleGameScreenButton");
const toggleControlsBtn = document.getElementById("toggleControlsButton");

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);
spectateBtn.addEventListener('click', spectateGame);
toggleControlsBtn.addEventListener('click', toggleControls);
toggleGameScreenBtn.addEventListener('click', toggleGameScreen);

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

function spectateGame(){
  socket.emit('joinSpectate', gameCodeInput.value);
  init();
}

function toggleGameScreen(){
  let screen = document.getElementById("section");
  if (gameScreen.style.display === "none") {
    screen.style.display = "block";
    gameScreen.style.display = "block";
  } else {
    screen.style.display = "none";
    gameScreen.style.display = "none";
  }
}

function toggleControls(){
  if (controls.style.display === "none") {
    controls.style.display = "block";
  } else {
    controls.style.display = "none";
  }
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

  setInterval(function(){
      if(joyTwo.GetPosX() !== 100 && joyTwo.GetPosY() !== 100){
        socket.emit('weaponDir', {x: joyTwo.GetPosX(), y: joyTwo.GetPosY()});
      }
  }, 50);
}

var bomba = new Image();
var janusz = new Image();
var sebek = new Image();
var weapon = new Image();
var fire = [new Image(), new Image(), new Image(), new Image()];
var kurvinox = [new Image(), new Image(), new Image()];
var weaponEnemy = new Image();
bomba.src = './bomba.png';
janusz.src = './janusz.png';
sebek.src = './sebek.png';
weapon.src = './weapon.png';
fire[0].src = './fire1.png';
fire[1].src = './fire2.png';
fire[2].src = './fire3.png';
fire[3].src = './fire4.png';
kurvinox[0].src = './kurvinox.png';
kurvinox[1].src = './kurvinox2.png';
kurvinox[2].src = './kurvinox3.png';
weaponEnemy.src = './weapon2.png';




function paintGame(state) {
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gridsize = state.gridsize;
  const size = gridsize;
  const platforms = state.platforms;

  for(i=0;i<platforms.length;i++){
    ctx.fillStyle = platforms[i].color;
    ctx.fillRect(platforms[i].x, platforms[i].y, platforms[i].w, platforms[i].h);
  }

  switch (state.players.length) {
    case 1:
      paintPlayer(state.players[0], bomba);
      break;
    case 2:
      paintPlayer(state.players[0], bomba);
      paintPlayer(state.players[1], janusz);
      break;
    case 3:
      paintPlayer(state.players[0], bomba);
      paintPlayer(state.players[1], janusz);
      paintPlayer(state.players[2], sebek);
  }

  let j = 0;
  while(j<state.enemies.length){
    paintEnemy(state.enemies[j]);
    j++;
  }
  // if(state.enemies.length !== 0){
  //   for(i=0;i<state.enemies.length;i++){
  //     paintEnemy(state.enemies[i]);
  //   }
  // }
}

function paintPlayer(playerState, p) {
  const playerWeapon = playerState.weapon;
  const playerPos = playerState.pos;
  ctx.drawImage(p, playerPos.x, playerPos.y, PLAYER_SIZE, PLAYER_SIZE);
  for(i = 0; i<playerWeapon.bullets.length; i++){
    drawBullets(playerWeapon.bullets[i]);
  }
  if(playerWeapon.shooting){
    var rand = Math.floor(Math.random() * 4);
    ctx.drawImage(fire[rand], playerWeapon.fire.x-20, playerWeapon.fire.y-20, 40, 40);
  }
  drawImage(weapon, playerWeapon.pos.x,playerWeapon.pos.y, 0.1, playerWeapon.rotation);
  ctx.setTransform(1,0,0,1,0,0);
}

function paintEnemy(enemyState) {
  const enemyWeapon = enemyState.weapon;
  const enemyPos = enemyState.pos;
  ctx.drawImage(kurvinox[enemyState.image], enemyPos.x, enemyPos.y, PLAYER_SIZE, PLAYER_SIZE);
  for(i = 0; i<enemyWeapon.bullets.length; i++){
    drawBullets(enemyWeapon.bullets[i]);
  }
  ctx.drawImage(weaponEnemy, enemyWeapon.pos.x, enemyWeapon.pos.y, 25, 25);
  // ctx.setTransform(1,0,0,1,0,0);
}

function shoot(){
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
  if(gameScreen.style.display === "block"){
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
  }
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
  ctx.fillStyle = bullet.color;
  ctx.fill()
  ctx.restore()
}