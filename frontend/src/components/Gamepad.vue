<template>
	<div>
        <img :src="controls[controller].image" width="300px" @mousedown="mousedown" draggable="false">
        <h3>Keyboard Controls:</h3>
        <div v-if="keyboardActive">
            <div v-if="controller == 'gameboy'">
                DPad - Arrow keys<br>
                A - A<br>
                B - B<br>
                Start - Q<br>
                Select - W
            </div>
            <div v-else-if="controller == 'n64'">
                C Buttons - Arrow keys<br>
                DPad - WASD
                Analog Stick - HBNM
                Left Shoulder - Q
                Right Shoulder - E
                A - J
                B - K
                Z - G
                Start - F
            </div>
            <div v-else-if="controller == 'playstation'">

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
            gamepads: [],
            gamepadActive: false,
            keyboardActive: true,
            image: "gameboy.jpg",
            state: {},
            clickedButton: "",
            clickStart: [0,0],
            controls: {
                gameboy: {
                    buttons: {
                        up: [0.20666666666666667, 0.6321138211382114],
                        down: [0.20666666666666667, 0.7215447154471545],
                        left: [0.13, 0.676829268292683],
                        right: [0.2833333333333333, 0.6788617886178862],
                        a: [0.8566666666666667, 0.6443089430894309],
                        b: [0.6933333333333334, 0.6890243902439024],
                        start: [0.53, 0.8191056910569106],
                        select: [0.36, 0.8211382113821138],
                    },
                    axes: {
                    },
                    image: "gameboy.jpg",
                },
                n64: {
                    buttons: {},
                    axes: {},
                    image: "n64.jpg",
                },
                playstation: {
                    buttons: {},
                    axes: {},
                    image: "playstation.jpg",
                },
            }
        }
    },
    
    mounted () {
        window.addEventListener('mouseup', this.mouseup);
        window.addEventListener('focus', () => {
            this.keyboardActive = true;
        });
        window.addEventListener('blur', () => {
            this.keyboardActive = false;
        });
    },
    
    methods: {
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
                var dx = (event.pageX - this.clickStart[0]) / this.clickStart[2];
                var dy = (event.pageY - this.clickStart[1]) / this.clickStart[2]; // Both use width so that distances are square
                var distance = Math.sqrt(Math.pow(dx, 2)+Math.pow(dy, 2));
                console.log("Mouseup", this.clickedButton, distance);
                this.state[this.clickedButton] = "up";
                this.clickedButton = "";
            }
        }
    }
};
</script>
