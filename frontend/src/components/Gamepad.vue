<template>
	<div>
        <img ref="graphic" :src="controls[controller].image" width="300px" @mousedown="mousedown" draggable="false">
        <div>
            <span v-for="(dot, name) in userdots" v-bind:key="'u'+name" class="userdot" :style="'top: '+ dot.y + 'px;left: '+dot.x+'px; visibility: '+dot.visibility"></span>
            <span v-for="(dot, name) in globaldots" v-bind:key="'g'+name" class="globaldot" :style="'top: '+ dot.y + 'px;left: '+dot.x+'px; visibility: '+dot.visibility"></span>
        </div>
        <div>
            <b>
                <p v-if="players == 1">You are the only player.</p>
                <p v-else>You are one of {{ players }} players.</p>
            </b>
        </div>
        <div v-if="gamepadActive">
            Gamepad connected, keyboard disabled.
            <b-button @click="gamepaddisconnected">Disable Gamepad</b-button>
        </div>
        <div v-else>
            <h3>Keyboard Controls:</h3>
            <div v-if="keyboardActive">
                <div v-if="controller == 'gameboy'">
                    DPad - Arrow keys<br>
                    A - Z<br>
                    B - X<br>
                    Start - A<br>
                    Select - S
                </div>
                <div v-else-if="controller == 'n64'">
                    C Buttons - Arrow keys<br>
                    DPad - WASD<br>
                    Analog Stick - HBNM<br>
                    Left Shoulder - Q<br>
                    Right Shoulder - E<br>
                    A - J<br>
                    B - K<br>
                    Z - G<br>
                    Start - F
                </div>
                <div v-else-if="controller == 'playstation'">
                    Left Stick - WASD, Left Shift to click<br>
                    Right Stick - Arrow Keys, Right Shift to click<br>
                    DPad - 6TYU (Why does this thing have so many buttons...<br>
                    Triangle - I<br>
                    Square - J<br>
                    X - K<br>
                    O - L<br>
                    Select - G<br>
                    Start - H<br>
                    Left Shoulder - Q<br>
                    Right Shoulder - E<br>
                    Left Trigger - 1<br>
                    Right Trigger - 3
                </div>
                <div v-else-if="controller == 'gamecube'">
                    Left Stick - WASD<br>
                    C-Stick - Arrow Keys<br>
                    DPad - TFGH<br>
                    B - J<br>
                    A - K<br>
                    X - O<br>
                    Y - I<br>
                    Z - U<br>
                    Left Shoulder - Q<br>
                    Right Shoulder - E<br>
                    Start - B
                </div>
                <p>You can also plug in a gamepad or click the controls with your mouse!</p>
            </div>
            <div v-else>Keyboard controls disabled. Click here to activate.</div>
        </div>
    </div>
</template>

<style>
.userdot {
    height: 25px;
    width: 25px;
    background-color: #f00;
    border-radius: 50%;
    display: block;
    position: fixed;
    z-index: 2;
}
.globaldot {
    height: 15px;
    width: 15px;
    background-color: #00f;
    border-radius: 50%;
    display: block;
    position: fixed;
    z-index: 3;
}
</style>

<script>
export default {
	name: 'GamePad',

	props: {
        controller: {
            type: String,
            default: "gameboy",
        },
        sessionID: String,
	},

    data() {
        return {
            players: 1,
            gamepad: undefined,
            gamepadActive: false,
            keyboardActive: true,
            statusUpdater: undefined,
            controllerSubscription: undefined,
            playersubSubscription: undefined,
            playerunsubSubscription: undefined,
            image: "gameboy.jpg",
            userdots: {},
            globaldots: {},
            state: {},
            clickedButton: "",
            clickedAxis: "",
            clickStart: [0,0],
            controls: {
                gameboy: {
                    buttons: {
                        a:      {x: 0.8566, y: 0.6443, type: "button", gamepadIdx: 0, keycode: "KeyZ"},
                        b:      {x: 0.6933, y: 0.6890, type: "button", gamepadIdx: 1, keycode: "KeyX"},
                        select: {x: 0.36,   y: 0.8211, type: "button", gamepadIdx: 8, keycode: "KeyS"},
                        start:  {x: 0.53,   y: 0.8191, type: "button", gamepadIdx: 9, keycode: "KeyA"},
                        up:     {x: 0.2067, y: 0.6321, type: "button", gamepadIdx: 12, keycode: "ArrowUp"},
                        down:   {x: 0.2066, y: 0.7215, type: "button", gamepadIdx: 13, keycode: "ArrowDown"},
                        left:   {x: 0.13,   y: 0.6768, type: "button", gamepadIdx: 14, keycode: "ArrowLeft"},
                        right:  {x: 0.2833, y: 0.6788, type: "button", gamepadIdx: 15, keycode: "ArrowRight"},
                    },
                    image: "gameboy.jpg",
                },
                n64: {
                    buttons: {
                        a:         {x: 0.8267, y: 0.3458, type: "button", gamepadIdx: 0, keycode: "ArrowDown"},
                        b:         {x: 0.8833, y: 0.2949, type: "button", gamepadIdx: 1, keycode: "ArrowRight"},
                        x:         {x: 0.7667, y: 0.2915, type: "button", gamepadIdx: 2, keycode: "ArrowLeft"},
                        y:         {x: 0.8233, y: 0.2339, type: "button", gamepadIdx: 3, keycode: "ArrowUp"},
                        lshoulder: {x: 0.1633, y: 0.1424, type: "button", gamepadIdx: 4, keycode: "KeyQ"},
                        rshoulder: {x: 0.8300, y: 0.1458, type: "button", gamepadIdx: 5, keycode: "KeyE"},
                        ltrigger:  {x: 0.7567, y: 0.4169, type: "button", gamepadIdx: 6, keycode: "KeyJ"},
                        rtrigger:  {x: 0.6867, y: 0.3492, type: "button", gamepadIdx: 7, keycode: "KeyK"},
                        select:    {x: 0.5033, y: 0.3559, type: "button", gamepadIdx: 8, keycode: "KeyF"},
                        start:     {x: 0.5033, y: 0.6915, type: "button", gamepadIdx: 9, keycode: "KeyG"},
                        up:        {x: 0.2067, y: 0.2814, type: "button", gamepadIdx: 12, keycode: "KeyW"},
                        down:      {x: 0.2033, y: 0.3831, type: "button", gamepadIdx: 13, keycode: "KeyS"},
                        left:      {x: 0.1533, y: 0.3288, type: "button", gamepadIdx: 14, keycode: "KeyA"},
                        right:     {x: 0.2567, y: 0.3254, type: "button", gamepadIdx: 15, keycode: "KeyD"},
                        analog0:   {x: 0.5100, y: 0.5424, type: "axis", gamepadIdx: [0, 1], flip: [1, 1], keycode: ["KeyH", "KeyB", "KeyN", "KeyM"]},
                    },
                    image: "n64.jpg",
                },
                playstation: {
                    buttons: {
                        a:         {x: 0.7600, y: 0.5250, type: "button", gamepadIdx: 0, keycode: "KeyK"},
                        b:         {x: 0.8333, y: 0.4200, type: "button", gamepadIdx: 1, keycode: "KeyL"},
                        x:         {x: 0.6867, y: 0.4250, type: "button", gamepadIdx: 2, keycode: "KeyJ"},
                        y:         {x: 0.7600, y: 0.3150, type: "button", gamepadIdx: 3, keycode: "KeyI"},
                        lshoulder: {x: 0.2300, y: 0.1300, type: "button", gamepadIdx: 4, keycode: "KeyQ"},
                        rshoulder: {x: 0.7600, y: 0.1250, type: "button", gamepadIdx: 5, keycode: "KeyE"},
                        ltrigger:  {x: 0.2333, y: 0.2250, type: "button", gamepadIdx: 6, keycode: "Digit1"},
                        rtrigger:  {x: 0.7633, y: 0.2250, type: "button", gamepadIdx: 7, keycode: "Digit3"},
                        select:    {x: 0.4167, y: 0.4200, type: "button", gamepadIdx: 8, keycode: "KeyG"},
                        start:     {x: 0.5767, y: 0.4200, type: "button", gamepadIdx: 9, keycode: "KeyH"},
                        lstick:    {x: 0.3600, y: 0.6250, type: "button", gamepadIdx: 10, keycode: "ShiftLeft"},
                        rstick:    {x: 0.6367, y: 0.6200, type: "button", gamepadIdx: 11, keycode: "ShiftRight"},
                        up:        {x: 0.2300, y: 0.3500, type: "button", gamepadIdx: 12, keycode: "Digit6"},
                        down:      {x: 0.2333, y: 0.5000, type: "button", gamepadIdx: 13, keycode: "KeyY"},
                        left:      {x: 0.1800, y: 0.4300, type: "button", gamepadIdx: 14, keycode: "KeyT"},
                        right:     {x: 0.2867, y: 0.4200, type: "button", gamepadIdx: 15, keycode: "KeyU"},
                        analog0:   {x: 0.3600, y: 0.6250, type: "axis", gamepadIdx: [0, 1], flip: [1, 1], keycode: ["KeyW", "KeyA", "KeyS", "KeyD"]},
                        analog1:   {x: 0.6367, y: 0.6200, type: "axis", gamepadIdx: [2, 3], flip: [1, 1], keycode: ["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"]},
                        
                    },
                    image: "playstation.jpg",
                },
                gamecube: {
                    buttons: {
                        a:         {x: 0.7233, y: 0.3664, type: "button", gamepadIdx: 0, keycode: "KeyK"},
                        b:         {x: 0.6367, y: 0.4224, type: "button", gamepadIdx: 1, keycode: "KeyJ"},
                        x:         {x: 0.8067, y: 0.3448, type: "button", gamepadIdx: 2, keycode: "KeyO"},
                        y:         {x: 0.6967, y: 0.2629, type: "button", gamepadIdx: 3, keycode: "KeyI"},
                        lshoulder: {x: 0.2600, y: 0.1810, type: "button", gamepadIdx: 4, keycode: "KeyQ"},
                        rshoulder: {x: 0.7367, y: 0.1767, type: "button", gamepadIdx: 5, keycode: "KeyE"},
                        select:    {x: 0.5633, y: 0.2759, type: "button", gamepadIdx: 8, keycode: "KeyB"},
                        start:     {x: 0.7833, y: 0.2112, type: "button", gamepadIdx: 9, keycode: "KeyU"},
                        up:        {x: 0.3633, y: 0.5259, type: "button", gamepadIdx: 12, keycode: "KeyT"},
                        down:      {x: 0.3633, y: 0.6336, type: "button", gamepadIdx: 13, keycode: "KeyG"},
                        left:      {x: 0.3233, y: 0.5819, type: "button", gamepadIdx: 14, keycode: "KeyF"},
                        right:     {x: 0.4067, y: 0.5776, type: "button", gamepadIdx: 15, keycode: "KeyH"},
                        analog0:   {x: 0.2533, y: 0.3621, type: "axis", gamepadIdx: [0, 1], flip: [1, 1], keycode: ["KeyW", "KeyA", "KeyS", "KeyD"]},
                        analog1:    {x: 0.6167, y: 0.5733, type: "axis", gamepadIdx: [2, 3], flip: [1, 1], keycode: ["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"]},
                    },
                    image: "gamecube.jpg",
                }
            }
        }
    },
    mounted () {
        this.setListeners();
    },
    beforeDestroy() {
        this.clearListeners();
    },
    activated () {
        this.setListeners();
    },
    deactivated() {
        this.clearListeners();
    },

    methods: {
        setListeners() {
            this.gamepadconnected(null);
            window.addEventListener('keydown', this.keydown);
            window.addEventListener('keyup', this.keyup);
            window.addEventListener('mouseup', this.mouseup);
            window.addEventListener('mousemove', this.mousemove);
            window.addEventListener('gamepadconnected', this.gamepadconnected);
            window.addEventListener('gamepaddisconnected', this.gamepaddisconnected);
            window.addEventListener('focus', this.focus);
            window.addEventListener('blur', this.blur);
            this.statusUpdater = setInterval(this.updateState, 30);
            this.$wamp.subscribe(this.sessionID+'.feedback', this.receiveState).then(sub => {
                this.controllerSubscription = sub;
            });
            this.$wamp.subscribe('wamp.subscription.on_subscribe', this.updatePlayers).then(sub => {
                this.playersubSubscription = sub;
            });
            this.$wamp.subscribe('wamp.subscription.on_unsubscribe', this.updatePlayers).then(sub => {
                this.playerunsubSubscription = sub;
            });
        },
        clearListeners() {
            this.gamepaddisconnected();
            window.removeEventListener('keydown', this.keydown);
            window.removeEventListener('keyup', this.keyup);
            window.removeEventListener('mouseup', this.mouseup);
            window.removeEventListener('mousemove', this.mousemove);
            window.removeEventListener('gamepadconnected', this.gamepaddisconnected);
            window.removeEventListener('gamepaddisconnected', this.gamepaddisconnected);
            window.removeEventListener('focus', this.focus);
            window.removeEventListener('blur', this.blur);
            if (this.clickedButton != "") {
                window.removeEventListener('mousemove', this.mousemove);
            }
            clearInterval(this.statusUpdater);
            this.$wamp.unsubscribe(this.controllerSubscription);
            this.$wamp.unsubscribe(this.playersubSubscription);
            this.$wamp.unsubscribe(this.playerunsubSubscription);
        },
        updatePlayers() {
            this.$wamp.call('wamp.subscription.list_subscribers', [this.controllerSubscription.id]).then(args => {
                this.players = args.length;
            });
        },
        focus() {
            this.keyboardActive = true;
        },
        blur() {
            this.keyboardActive = false;
        },
        receiveState(receivedState) {
            const buttons = this.controls[this.controller].buttons;
            const box = this.$refs.graphic.getBoundingClientRect();
            const width = box.right - box.left;
            const height = box.bottom - box.top;
            for (const [name, status] of Object.entries(receivedState[0])) {
                if (!Object.prototype.hasOwnProperty.call(buttons, name)) {
                    continue;
                }
                if (!Object.prototype.hasOwnProperty.call(this.globaldots, name)) {
                    this.$set(this.globaldots, name, {x: 0, y: 0, visibility: 'hidden'});
                }
                if (buttons[name].type === "button") {
                    const x = box.left + width * buttons[name].x - 15/2;
                    const y = box.top + height * buttons[name].y - 15/2;
                    this.$set(this.globaldots[name], 'x', x);
                    this.$set(this.globaldots[name], 'y', y);
                    if (status >= 0.99) {
                        this.$set(this.globaldots[name], 'visibility', 'visible');
                    } else {
                        this.$set(this.globaldots[name], 'visibility', 'hidden');
                    }
                } else if (buttons[name].type === "axis") {
                    const x = box.left + width * buttons[name].x - 15/2;
                    const y = box.top + height * buttons[name].y - 15/2;
                    this.$set(this.globaldots[name], 'x', status[0]*25+x);
                    this.$set(this.globaldots[name], 'y', status[1]*25+y);
                    if (Math.abs(status[0]) > 0.05 || Math.abs(status[1]) > 0.05) {
                        this.$set(this.globaldots[name], 'visibility', 'visible');
                    } else {
                        this.$set(this.globaldots[name], 'visibility', 'hidden');
                    }
                }
            }
        },
        updateState() {
            const buttons = this.controls[this.controller].buttons;
            const box = this.$refs.graphic.getBoundingClientRect();
            const width = box.right - box.left;
            const height = box.bottom - box.top;
            for (const [name, status] of Object.entries(this.state)) {
                if (!Object.prototype.hasOwnProperty.call(this.userdots, name)) {
                    this.$set(this.userdots, name, {x: 0, y: 0, visibility: 'hidden'});
                }
                if (buttons[name].type === "button") {
                    const x = box.left + width * buttons[name].x - 25/2;
                    const y = box.top + height * buttons[name].y - 25/2;
                    this.$set(this.userdots[name], 'x', x);
                    this.$set(this.userdots[name], 'y', y);
                    if (status >= 0.99) {
                        this.$set(this.userdots[name], 'visibility', 'visible');
                    } else {
                        this.$set(this.userdots[name], 'visibility', 'hidden');
                    }
                } else if (buttons[name].type === "axis") {
                    const x = box.left + width * buttons[name].x - 25/2;
                    const y = box.top + height * buttons[name].y - 25/2;
                    this.$set(this.userdots[name], 'x', status[0]*25+x);
                    this.$set(this.userdots[name], 'y', status[1]*25+y);
                    if (Math.abs(status[0]) > 0.05 || Math.abs(status[1]) > 0.05) {
                        this.$set(this.userdots[name], 'visibility', 'visible');
                    } else {
                        this.$set(this.userdots[name], 'visibility', 'hidden');
                    }
                }
            }
            this.$wamp.publish(this.sessionID+'.inputs', [this.state]);
        },
        keydown(event) {
            if (this.gamepadActive) {
                return;
            }
            event.preventDefault();
            if (event.repeat) {
                return;
            }
            for (const [name, button] of Object.entries(this.controls[this.controller].buttons)) {
                if (button.type === "button") {
                    if (button.keycode === event.code) {
                        this.$set(this.state, name, 1);
                    }
                } else if (button.type === "axis") {
                    if (!Object.prototype.hasOwnProperty.call(this.state, name)) {
                        this.$set(this.state, name, [0,0]);
                    }
                    var x = this.state[name][0];
                    var y = this.state[name][1];
                    for (var i=0; i<button.keycode.length; i++) {
                        if (button.keycode[i] === event.code) {
                            if (i === 0) {
                                y = -1;
                            } else if (i === 1) {
                                x = -1;
                            } else if (i === 2) {
                                y = 1;
                            } else if (i === 3) {
                                x = 1;
                            }
                            this.$set(this.state, name, [x, y]);
                        }
                    }
                }
            }
        },
        keyup(event) {
            if (this.gamepadActive) {
                return;
            }
            for (const [name, button] of Object.entries(this.controls[this.controller].buttons)) {
                if (button.type === "button") {
                    if (button.keycode === event.code) {
                        this.$set(this.state, name, 0);
                    }
                } else if (button.type === "axis") {
                    var x = this.state[name][0];
                    var y = this.state[name][1];
                    for (var i=0; i<button.keycode.length; i++) {
                        if (button.keycode[i] === event.code) {
                            if (i % 2 === 0) {
                                y = 0;
                            } else {
                                x = 0;
                            }
                            this.$set(this.state, name, [x, y]);
                        }
                    }
                }
            }
        },
        nearestButton(event, type, radius) {
            var x = event.offsetX / event.srcElement.clientWidth;
            var y = event.offsetY / event.srcElement.clientHeight; // Both use width so that distances are square
            var closest = "";
            var smallestDistance = 1;
            for (const [name, button] of Object.entries(this.controls[this.controller].buttons)) {
                if (button.type === type) {
                    const distance = Math.sqrt(Math.pow(x-button.x, 2)+Math.pow(y-button.y, 2));
                    if (distance < smallestDistance) {
                        closest = name;
                        smallestDistance = distance;
                    }
                }
            }
            if (smallestDistance > radius) {
                return "";
            }
            return closest;
        },
        mousedown(event) {
            if (this.gamepadActive) {
                return;
            }
            const pressed = this.nearestButton(event, "button", 0.075);
            if (pressed != "") {
                this.state[pressed] = 1;
            }
            this.clickedButton = pressed;
            const pressedaxis = this.nearestButton(event, "axis", 0.2);
            if (pressedaxis != "") {
                if (this.clickedButton === "") {
                    this.clickedButton = pressedaxis;
                } else {
                    this.clickedAxis = pressedaxis;
                }
            }
            this.clickStart = [
                event.pageX,
                event.pageY,
                event.srcElement.clientWidth,
                event.srcElement.clientHeight,
            ];
        },
        mouseup() {
            if (this.gamepadActive) {
                return;
            }
            if (this.clickedButton != "") {
                const button = this.controls[this.controller].buttons[this.clickedButton];
                if (button.type === "button") {
                    this.state[this.clickedButton] = 0;
                    this.clickedButton = "";
                } else if (button.type === "axis") {
                    this.state[this.clickedButton] = [0, 0];
                    this.clickedButton = "";
                }
            }
            this.clickedAxis = "";
        },
        mousemove(event) {
            if (this.gamepadActive) {
                return;
            }
            if (this.clickedButton != "") {
                var dx = (event.pageX - this.clickStart[0]) / this.clickStart[2];
                var dy = (event.pageY - this.clickStart[1]) / this.clickStart[2]; // Both use width so that distances are square
                var distance = Math.sqrt(Math.pow(dx, 2)+Math.pow(dy, 2));
                if (distance > 0.1 && this.clickedAxis != "") {
                    this.state[this.clickedButton] = 0;
                    this.clickedButton = this.clickedAxis;
                    this.clickedAxis = "";
                }
                const button = this.controls[this.controller].buttons[this.clickedButton];
                if (button.type === "axis") {
                    this.state[this.clickedButton] = [
                        Math.max(-1, Math.min(1, dx*5)),
                        Math.max(-1, Math.min(1, dy*5)),
                    ];
                }
            }
        },
        gamepadconnected(event) {
            if (event != null) {
                this.gamepad = event.gamepad.index;
                this.gamepadActive = true;
                setInterval(this.gamepadupdate, 30);
            } else {
                const gamepads = navigator.getGamepads();
                for (var i=gamepads.length-1; i>=0; i--) {
                    if (gamepads[i] != null) {
                        this.gamepad = i;
                        this.gamepadActive = true;
                        setInterval(this.gamepadupdate, 30);
                        return;
                    }
                }
            }
        },
        gamepaddisconnected() {
            this.gamepad = undefined;
            this.gamepadActive = false;
        },
        gamepadupdate() {
            if (!this.gamepadActive) {
                return;
            }
            const currentGamepad = navigator.getGamepads()[this.gamepad];
            if (currentGamepad == undefined) {
                return;
            }
            const buttons = this.controls[this.controller].buttons;
            for (const [name, button] of Object.entries(buttons)) {
                if (button.type === "button") {
                    this.$set(this.state, name, currentGamepad.buttons[button.gamepadIdx].value);
                } else if (button.type === "axis") {
                    this.$set(this.state, name, [
                        currentGamepad.axes[button.gamepadIdx[0]] * button.flip[0],
                        currentGamepad.axes[button.gamepadIdx[1]] * button.flip[1],
                    ]);
                }
            }
        }
    }
};
</script>
