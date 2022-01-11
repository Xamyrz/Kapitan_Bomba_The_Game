var joy = new JoyStick('joyDiv');

setInterval(function(){
    socket.emit('keydown', joy.GetDir());
}, 50);