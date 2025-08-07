const CONTROLS = {};
CONTROLS.keyboard = {
    _pressed: {},

    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    SPACE: 32,

    isDown: function (keyCode) {
        return this._pressed[keyCode];
    },

    onKeydown: function (event) {
        this._pressed[event.keyCode] = true;
    },

    onKeyup: function (event) {
        delete this._pressed[event.keyCode];
    },
};
CONTROLS.nipple = nipplejs.create({
    dataOnly: true,
    // zone: document.body,
    zone: document.getElementById("joystick-overlay"),
});
CONTROLS.nipple.on("move", (e, data) => {
    // console.log(data)
    const vx = data.force * Math.cos(data.angle.radian);
    const vy = -data.force * Math.sin(data.angle.radian);
    const v = applySpeedLimit(vx, vy, GAME.player.maxSpeed);
    GAME.player.vx = v.vx;
    GAME.player.vy = v.vy;
    // player.force = data.distance/25;
    //
    GAME.player.jactive = true;
});
CONTROLS.nipple.on("end", (e, data) => {
    GAME.player.jactive = false;
    GAME.player.vx = 0;
    GAME.player.vy = 0;
});

window.addEventListener(
    "keyup",
    function (event) {
        CONTROLS.keyboard.onKeyup(event);
    },
    false
);
window.addEventListener(
    "keydown",
    function (event) {
        CONTROLS.keyboard.onKeydown(event);
    },
    false
);