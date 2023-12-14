import RenderObject from "../renderObject.ts";

const PLAYER_GRAVITY = 0.25;
const PLAYER_JUMP_VELOCITY = -5;
const PLAYER_KILL_PLANE = 250;

const PIPE_SPACING = 200;
const PIPE_HEIGHT_RANGE = 200;
const PIPE_SPEED = 2;
const PIPE_WIDTH = 200;

const CLOUD_SPEED = 0.5;

export default class FlappyBird {
    playerPosition: number;
    playerVelocity: number;

    pipeOffset: number;
    pipeHeights: number[];

    clouds: { x: number, y: number, z: number }[];

    constructor() {
        this.playerPosition = 0;
        this.playerVelocity = 0;
        this.pipeOffset = 0;
        this.pipeHeights = [];
        this.clouds = [];

        this.reset();
        document.onkeydown = this.onKeyDown.bind(this);
    }

    addPipe() {
        this.pipeHeights.push(Math.random() * PIPE_HEIGHT_RANGE);
    }

    update() {
        this.playerPosition += this.playerVelocity;
        this.playerVelocity += PLAYER_GRAVITY;
        this.pipeOffset -= PIPE_SPEED;

        // Kill Plane
        if (this.playerPosition > PLAYER_KILL_PLANE || this.playerPosition < -PLAYER_KILL_PLANE) {
            this.playerPosition = 0;
            this.playerVelocity = 0;
        }

        // Pipe Spawning
        if (this.pipeOffset < -PIPE_SPACING * 3) {
            this.pipeOffset += PIPE_SPACING;
            this.pipeHeights.shift();
            this.addPipe();
        }

        // Cloud Movement
        for (let i = 0; i < this.clouds.length; i++) {
            this.clouds[i].x -= CLOUD_SPEED;
            if (this.clouds[i].x < -2000)
                this.clouds[i].x = 2000;
        }

        // Pipe Collision
        const playerY = this.playerPosition - 50;
        const playerHeight = 250;
        const playerX = -580;

        const pipeTop = this.pipeHeights[2] + PIPE_WIDTH;
        const pipeBottom = this.pipeHeights[2] - PIPE_WIDTH;
        const pipeLeft = this.pipeOffset;
        const pipeRight = this.pipeOffset + 40;

        if (playerY < pipeBottom || playerY + playerHeight > pipeTop) {
            if (playerX > pipeLeft && playerX < pipeRight) {
                this.reset();
            }
        }
    }

    reset() {
        this.playerPosition = 0;
        this.playerVelocity = 0;
        this.pipeOffset = 0;
        this.pipeHeights = [];
        this.clouds = [];

        for (let i = 0; i < 8; i++)
            this.addPipe();
        for (let i = 0; i < 20; i++) {
            this.clouds.push({
                x: Math.random() * 2000 - 1000,
                y: Math.random() * 2000 - 1000,
                z: Math.random() * 200 + 300
            });
        }
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.key === " ")
            this.playerVelocity = PLAYER_JUMP_VELOCITY;
    }

    getRenderables(): RenderObject[] {
        return [
            {
                position: [-200, this.playerPosition - 50, 0],
                rotation: [0, 0, Math.PI],
                scale: [0.4, 0.4, 0.4],

                baseColor: [1, 1, 0.5, 1],
                diffuseColor: [1, 1, 0.5, 1],
                specularColor: [1, 1, 0.5, 1],
                shininess: 1,
                specularStrength: 1
            },
            ...this.pipeHeights.map((height, index) => {
                return {
                    position: [this.pipeOffset + index * PIPE_SPACING, height + PIPE_WIDTH - 200, 0],
                    rotation: [0, 0, Math.PI],
                    scale: [1, 1, 1],

                    baseColor: [0, 1, 0, 1],
                    diffuseColor: [0, 1, 0, 1],
                    specularColor: [0, 1, 0, 1],
                    shininess: 1,
                    specularStrength: 1
                };
            }),
            ...this.pipeHeights.map((height, index) => {
                return {
                    position: [this.pipeOffset + index * PIPE_SPACING, height - PIPE_WIDTH - 200, -10],
                    rotation: [0, 0, Math.PI],
                    scale: [1, 1.5, 1],

                    baseColor: [0, 1, 0, 1],
                    diffuseColor: [0, 1, 0, 1],
                    specularColor: [0, 1, 0, 1],
                    shininess: 1,
                    specularStrength: 1
                };
            }),
            ...this.clouds.map((cloud) => {
                return {
                    position: [cloud.x, cloud.y, cloud.z],
                    rotation: [0, 0, Math.PI],
                    scale: [10, 1, 1],

                    baseColor: [1, 1, 1, 0],
                    diffuseColor: [1, 1, 1, 0],
                    specularColor: [0, 0, 0, 0],
                    shininess: 0,
                    specularStrength: 0
                };
            })
        ]
    }
}