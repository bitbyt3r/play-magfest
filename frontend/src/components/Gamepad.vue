<template>
	<div>
        <img :src="controls[controller].image" width="300px" @mousedown="mousedown" draggable="false">
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
        </div>
        <div v-else>Keyboard controls disabled. Click here to activate.</div>
    </div>
</template>

<style>

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
            gamepad: [],
            gamepadActive: false,
            keyboardActive: true,
            image: "gameboy.jpg",
            state: {},
            clickedButton: "",
            clickStart: [0,0],
            controls: {
                gameboy: {
                    buttons: {
                        up:     {x: 0.2067, y: 0.6321, type: "button", gamepadIdx: 0, keycode: "ArrowUp"},
                        down:   {x: 0.2066, y: 0.7215, type: "button", gamepadIdx: 1, keycode: "ArrowDown"},
                        left:   {x: 0.13,   y: 0.6768, type: "button", gamepadIdx: 2, keycode: "ArrowLeft"},
                        right:  {x: 0.2833, y: 0.6788, type: "button", gamepadIdx: 3, keycode: "ArrowRight"},
                        a:      {x: 0.8566, y: 0.6443, type: "button", gamepadIdx: 4, keycode: "KeyZ"},
                        b:      {x: 0.6933, y: 0.6890, type: "button", gamepadIdx: 5, keycode: "KeyX"},
                        start:  {x: 0.53,   y: 0.8191, type: "button", gamepadIdx: 6, keycode: "KeyA"},
                        select: {x: 0.36,   y: 0.8211, type: "button", gamepadIdx: 7, keycode: "KeyS"},
                    },
                    image: "gameboy.jpg",
                },
                n64: {
                    buttons: {
                        up:        {x: 0.2067, y: 0.2814, type: "button", gamepadIdx: 12, keycode: "KeyW"},
                        left:      {x: 0.1533, y: 0.3288, type: "button", gamepadIdx: 14, keycode: "KeyA"},
                        down:      {x: 0.2033, y: 0.3831, type: "button", gamepadIdx: 13, keycode: "KeyS"},
                        right:     {x: 0.2567, y: 0.3254, type: "button", gamepadIdx: 15, keycode: "KeyD"},
                        start:     {x: 0.5033, y: 0.3559, type: "button", gamepadIdx: 8, keycode: "KeyF"},
                        a:         {x: 0.7567, y: 0.4169, type: "button", gamepadIdx: 6, keycode: "KeyJ"},
                        b:         {x: 0.6867, y: 0.3492, type: "button", gamepadIdx: 7, keycode: "KeyK"},
                        cup:       {x: 0.8233, y: 0.2339, type: "button", gamepadIdx: 3, keycode: "ArrowUp"},
                        cleft:     {x: 0.7667, y: 0.2915, type: "button", gamepadIdx: 2, keycode: "ArrowLeft"},
                        cdown:     {x: 0.8267, y: 0.3458, type: "button", gamepadIdx: 0, keycode: "ArrowDown"},
                        cright:    {x: 0.8833, y: 0.2949, type: "button", gamepadIdx: 1, keycode: "ArrowRight"},
                        lshoulder: {x: 0.1633, y: 0.1424, type: "button", gamepadIdx: 4, keycode: "KeyQ"},
                        rshoulder: {x: 0.8300, y: 0.1458, type: "button", gamepadIdx: 5, keycode: "KeyE"},
                        z:         {x: 0.5033, y: 0.6915, type: "button", gamepadIdx: 9, keycode: "KeyG"},
                        analog:    {x: 0.5100, y: 0.5424, type: "axis", gamepadIdx: [0, 1], flip: [1, 1], keycode: ["KeyH", "KeyB", "KeyN", "KeyM"], clickable: false},
                    },
                    image: "n64.jpg",
                },
                playstation: {
                    buttons: {
                        up:        {x: 0.2300, y: 0.3500, type: "button", gamepadIdx: 12, keycode: "Digit6"},
                        down:      {x: 0.2333, y: 0.5000, type: "button", gamepadIdx: 13, keycode: "KeyT"},
                        left:      {x: 0.1800, y: 0.4300, type: "button", gamepadIdx: 14, keycode: "KeyY"},
                        right:     {x: 0.2867, y: 0.4200, type: "button", gamepadIdx: 15, keycode: "KeyU"},
                        t:         {x: 0.7600, y: 0.3150, type: "button", gamepadIdx: 3, keycode: "KeyI"},
                        s:         {x: 0.6867, y: 0.4250, type: "button", gamepadIdx: 2, keycode: "KeyJ"},
                        x:         {x: 0.7600, y: 0.5250, type: "button", gamepadIdx: 0, keycode: "KeyK"},
                        o:         {x: 0.8333, y: 0.4200, type: "button", gamepadIdx: 1, keycode: "KeyL"},
                        select:    {x: 0.4167, y: 0.4200, type: "button", gamepadIdx: 8, keycode: "KeyG"},
                        start:     {x: 0.5767, y: 0.4200, type: "button", gamepadIdx: 9, keycode: "KeyH"},
                        l:         {x: 0.2300, y: 0.1300, type: "button", gamepadIdx: 4, keycode: "KeyQ"},
                        r:         {x: 0.7600, y: 0.1250, type: "button", gamepadIdx: 5, keycode: "KeyE"},
                        lt:        {x: 0.2333, y: 0.2250, type: "button", gamepadIdx: 6, keycode: "Digit1"},
                        rt:        {x: 0.7633, y: 0.2250, type: "button", gamepadIdx: 7, keycode: "Digit3"},
                        lstick:    {x: 0.3600, y: 0.6250, type: "axis", gamepadIdx: [0, 1], flip: [1, 1], keycode: ["KeyW", "KeyA", "KeyS", "KeyD", "ShiftLeft"], clickable: true},
                        rstick:    {x: 0.6367, y: 0.6200, type: "axis", gamepadIdx: [2, 3], flip: [1, 1], keycode: ["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight", "ShiftRight"], clickable: true},
                    },
                    image: "playstation.jpg",
                },
                gamecube: {
                    buttons: {
                        up:        {x: 0.3633, y: 0.5259, type: "button", gamepadIdx: 12, keycode: "KeyT"},
                        down:      {x: 0.3633, y: 0.6336, type: "button", gamepadIdx: 13, keycode: "KeyG"},
                        left:      {x: 0.3233, y: 0.5819, type: "button", gamepadIdx: 14, keycode: "KeyF"},
                        right:     {x: 0.4067, y: 0.5776, type: "button", gamepadIdx: 15, keycode: "KeyH"},
                        a:         {x: 0.7233, y: 0.3664, type: "button", gamepadIdx: 0, keycode: "KeyK"},
                        b:         {x: 0.6367, y: 0.4224, type: "button", gamepadIdx: 1, keycode: "KeyJ"},
                        x:         {x: 0.8067, y: 0.3448, type: "button", gamepadIdx: 2, keycode: "KeyO"},
                        y:         {x: 0.6967, y: 0.2629, type: "button", gamepadIdx: 3, keycode: "KeyI"},
                        lshoulder: {x: 0.2600, y: 0.1810, type: "button", gamepadIdx: 4, keycode: "KeyQ"},
                        rshoulder: {x: 0.7367, y: 0.1767, type: "button", gamepadIdx: 5, keycode: "KeyE"},
                        start:     {x: 0.5633, y: 0.2759, type: "button", gamepadIdx: 8, keycode: "KeyB"},
                        z:         {x: 0.7833, y: 0.2112, type: "button", gamepadIdx: 9, keycode: "KeyU"},
                        lstick:    {x: 0.2533, y: 0.3621, type: "axis", gamepadIdx: [0, 1], flip: [1, 1], keycode: ["KeyW", "KeyA", "KeyS", "KeyD"], clickable: false},
                        cstick:    {x: 0.6167, y: 0.5733, type: "axis", gamepadIdx: [2, 3], flip: [1, 1], keycode: ["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"], clickable: false},
                    },
                    image: "gamecube.jpg",
                }
            }
        }
    },
    
    mounted () {
        window.addEventListener('keydown', this.keydown);
        window.addEventListener('keyup', this.keyup);
        window.addEventListener('mouseup', this.mouseup);
        window.addEventListener('gamepadconnected', this.gamepadconnected);
        window.addEventListener('gamepaddisconnected', this.gamepaddisconnected);
        window.addEventListener('focus', () => {
            this.keyboardActive = true;
        });
        window.addEventListener('blur', () => {
            this.keyboardActive = false;
        });
    },

    beforeDestroy() {
        window.removeEventListener('keydown', this.keydown);
        window.removeEventListener('keyup', this.keyup);
        window.removeEventListener('mouseup', this.mouseup);
        window.removeEventListener('gamepadconnected', this.gamepaddisconnected);
        window.removeEventListener('gamepaddisconnected', this.gamepaddisconnected);
        window.removeEventListener('focus');
        window.removeEventListener('blur');
        if (this.clickedButton != "") {
            window.removeEventListener('mousemove', this.mousemove);
        }
    },
    
    methods: {
        keydown(event) {
            console.log(event);
        },
        keyup(event) {
            console.log(event);
        },
        nearestButton(event) {
            var x = event.offsetX / event.srcElement.clientWidth;
            var y = event.offsetY / event.srcElement.clientHeight; // Both use width so that distances are square
            var closest = "";
            var smallestDistance = 1;
            for (const [name, position] of Object.entries(this.controls[this.controller].buttons)) {
                const distance = Math.sqrt(Math.pow(x-position[0], 2)+Math.pow(y-position[1], 2));
                if (distance < smallestDistance) {
                    closest = name;
                    smallestDistance = distance;
                }
            }
            if (smallestDistance > 0.075) {
                return "";
            }
            return closest;
        },
        mousedown(event) {
            const pressed = this.nearestButton(event);
            if (pressed != "") {
                window.addEventListener('mousemove', this.mousemove);
                this.state[pressed] = "down";
            }
            this.clickedButton = pressed;
            this.clickStart = [
                event.pageX,
                event.pageY,
                event.srcElement.clientWidth,
                event.srcElement.clientHeight,
            ];
        },
        mouseup(event) {
            if (this.clickedButton != "") {
                window.removeEventListener('mousemove', this.mousemove);
                var dx = (event.pageX - this.clickStart[0]) / this.clickStart[2];
                var dy = (event.pageY - this.clickStart[1]) / this.clickStart[2]; // Both use width so that distances are square
                var distance = Math.sqrt(Math.pow(dx, 2)+Math.pow(dy, 2));
                if (distance < 0.1) {
                    console.log();
                }
                this.state[this.clickedButton] = "up";
                this.clickedButton = "";
            }
        },
        mousemove() {
        },
        gamepadconnected(event) {
            console.log(event.gamepad);
            this.gamepad = event.gamepad;
            this.gamepadActive = true;
        },
        gamepaddisconnected() {
            this.gamepad = null;
            this.gamepadActive = false;
        },
        gamepadupdate() {

        }
    }
};
</script>
