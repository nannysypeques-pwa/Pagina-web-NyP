/**
 * Nanny Runner - Retro Mini-game (Fix Rendering Edition)
 * Antigravity for Nannys y Peques
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('game-score');
const startScreen = document.getElementById('game-start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElement = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// Assets
const nannySprite = new Image();
nannySprite.src = 'img/pixel_nanny.png';

const bgImg = new Image();
bgImg.src = 'img/pixel_bg.png';

const carSprites = new Image();
carSprites.src = 'img/pixel_cars.png';

const houseImg = new Image();
houseImg.src = 'img/pixel_house.png';

// Ensure all images are loaded
let assetsLoaded = 0;
const totalAssets = 4;
function onAssetLoad() {
    assetsLoaded++;
    if (assetsLoaded === totalAssets) {
        console.log("All assets loaded");
    }
}
[nannySprite, bgImg, carSprites, houseImg].forEach(img => img.onload = onAssetLoad);

// Game State
let isGameRunning = false;
let isVictoryEnding = false;
let score = 0;
let distance = 0;
const goalDistance = 3000;
let lives = 3;
let invincibilityFrames = 0;
let gameSpeed = 5;
let animationFrameId;
let isCinematicEnding = false;

// Animation & Scene State
let frameX = 0;
let frameCounter = 0;
const frameSpeed = 8;
let bgX = 0;
let houseX = 0;

// Character State
const nanny = {
    x: 100,
    y: 0,
    width: 100, // Increased size
    height: 120,
    dy: 0,
    jumpForce: 14, // Increased to clear 150px cars
    gravity: 0.5,
    isJumping: false,
    isCrouching: false,
    groundY: 0,
    offsetY: 30 // 👈 AJUSTA ESTE VALOR
};

// Obstacles
let obstacles = [];
const obstacleTypes = [
    { type: 'car', sx_index: 0, w: 150, h: 150, pos: 'ground', offsetY: 20 }, // Yellow (reduced h for hitbox)
    { type: 'car', sx_index: 1, w: 150, h: 150, pos: 'ground', offsetY: 20 }, // Blue (reduced h for hitbox)
    { type: 'bird', w: 40, h: 30, pos: 'air', colors: ['#FF1493', '#00BFFF', '#FFD700'], offsetY: 0 }
];

function initCanvas() {
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const groundTop = canvas.height * 0.75;

    nanny.groundY = groundTop - nanny.height;
    nanny.y = nanny.groundY;
}

function startGame() {
    if (assetsLoaded < totalAssets) {
        alert("Cargando juego... por favor espera un momento.");
        return;
    }
    isGameRunning = true;
    isVictoryEnding = false;
    score = 0;
    distance = 0;
    lives = 3;
    invincibilityFrames = 0;
    gameSpeed = 5;
    obstacles = [];
    nanny.x = 80;
    nanny.y = nanny.groundY;
    nanny.dy = 0;
    nanny.isJumping = false;
    nanny.isCrouching = false;
    houseX = canvas.width + 50;
    isCinematicEnding = false;

    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    gameLoop();
}

function gameOver() {
    isGameRunning = false;
    cancelAnimationFrame(animationFrameId);
    finalScoreElement.textContent = Math.floor(score);
    gameOverScreen.querySelector('h3').textContent = '¡Servicio interrumpido!';
    gameOverScreen.querySelector('h3').style.color = 'var(--color-pink)';
    gameOverScreen.querySelector('p').textContent = 'No pudiste llegar a tiempo esta vez.';
    gameOverScreen.classList.remove('hidden');
}

function showVictory() {
    isVictoryEnding = true;
}

function spawnObstacle() {
    if (isVictoryEnding || distance > goalDistance - 400) return;

    const spawnRate = 0.01 + (distance / 50000);
    if (Math.random() < Math.min(spawnRate, 0.04)) {
        if (obstacles.length > 0 && obstacles[obstacles.length - 1].x > canvas.width - 300) return;

        const baseType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        const type = { ...baseType };

        const groundTop = canvas.height * 0.75;
        let yPos = 0;

        if (type.pos === 'ground') {
            yPos = groundTop - type.h + (type.offsetY || 0);
        } else if (type.pos === 'air') {
            yPos = groundTop - 110 + (type.offsetY || 0);
        }

        if (type.type === 'bird') {
            type.color = type.colors[Math.floor(Math.random() * type.colors.length)];
        }

        obstacles.push({
            x: canvas.width,
            y: yPos,
            ...type
        });
    }
}

function update() {
    if (!isVictoryEnding) {
        distance += gameSpeed / 5;
        score = distance;
        if (distance >= goalDistance) showVictory();

        bgX -= gameSpeed * 0.5;
        if (bgX <= -canvas.width) bgX = 0;

        spawnObstacle();
    } else {
        // Nanny keeps running for a moment before the cut
        if (nanny.x < canvas.width + 100) {
            nanny.x += 4;
        } else {
            // Cut to cinematic
            isCinematicEnding = true;
            // createConfetti(); // REMOVED
            finalScoreElement.textContent = Math.floor(score);
            gameOverScreen.querySelector('h3').textContent = '¡Misión Cumplida! 🎉';
            gameOverScreen.querySelector('h3').style.color = '#4CAF50';
            gameOverScreen.querySelector('p').textContent = '¡Gracias a tu ayuda, tu nanny llego a tiempo y segura!';
            setTimeout(() => {
                gameOverScreen.classList.remove('hidden');
            }, 3000); // AUMENTADO A 3S
        }
    }

    if (isCinematicEnding) {
        // updateConfetti(); // REMOVED
        return; // Skip the rest of the logic during cinematic
    }

    if (invincibilityFrames > 0) invincibilityFrames--;

    // Animation
    frameCounter++;
    if (frameCounter >= frameSpeed) {
        if (!isGameRunning || (isVictoryEnding && nanny.x >= houseX + 180)) {
            frameX = 0;
        } else {
            frameX = (frameX + 1) % 4;
        }
        frameCounter = 0;
    }

    // Nanny Physics
    if (nanny.isJumping) {
        nanny.dy += nanny.gravity;
        nanny.y += nanny.dy;
        if (nanny.y > nanny.groundY) {
            nanny.y = nanny.groundY;
            nanny.dy = 0;
            nanny.isJumping = false;
        }
    }

    // Move Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= gameSpeed;

        if (invincibilityFrames === 0 && !isVictoryEnding) {
            // Precise Nanny Hitbox (Update for 120x120 size)
            const nannyHitbox = {
                x: nanny.x + 40,
                y: nanny.isCrouching ? nanny.y + 75 + nanny.offsetY : nanny.y + 30 + nanny.offsetY,
                w: nanny.width - 80,
                h: nanny.isCrouching ? nanny.height - 85 : nanny.height - 55
            };

            // Precise Obstacle Hitbox
            let obsHitbox = {
                x: obs.x + 25,
                y: obs.y + 10,
                w: obs.w - 50,
                h: obs.h - 20
            };

            // If it's a car, we adjust the top part since the sprite includes empty space
            if (obs.type === 'car') {
                obsHitbox.y = obs.y + 40; // Car body starts lower
                obsHitbox.h = obs.h - 40;
            }

            if (nannyHitbox.x < obsHitbox.x + obsHitbox.w &&
                nannyHitbox.x + nannyHitbox.w > obsHitbox.x &&
                nannyHitbox.y < obsHitbox.y + obsHitbox.h &&
                nannyHitbox.y + nannyHitbox.h > obsHitbox.y) {
                lives--;
                invincibilityFrames = 60;
                if (lives <= 0) gameOver();
            }
        }
        if (obs.x + obs.w < 0) obstacles.splice(i, 1);
    }

    if (!isVictoryEnding) {
        gameSpeed = 5 + (distance / 500);
    } else {
        gameSpeed = Math.max(2, gameSpeed * 0.98);
    }
}

function drawHUD() {
    if (isVictoryEnding) return;

    // Lives (Hearts)
    for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = i < lives ? 1 : 0.3;
        ctx.fillStyle = '#FF1493';
        const hx = 30 + (i * 35), hy = 25, hs = 25;
        ctx.fillRect(hx + hs / 4, hy, hs / 2, hs / 4);
        ctx.fillRect(hx, hy + hs / 4, hs, hs / 2);
        ctx.fillRect(hx + hs / 4, hy + hs * 3 / 4, hs / 2, hs / 4);
    }
    ctx.globalAlpha = 1;

    // Progress Bar
    const barWidth = 250;
    const progress = Math.min(distance / goalDistance, 1);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    const bx = canvas.width / 2 - barWidth / 2, by = 28;
    ctx.beginPath();
    ctx.roundRect(bx, by, barWidth, 18, 9);
    ctx.fill();
    ctx.fillStyle = '#FF1493';
    ctx.beginPath();
    ctx.roundRect(bx, by, barWidth * progress, 18, 9);
    ctx.fill();

    // Distance
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px Courier New';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.floor(distance)}m`, canvas.width - 30, 42);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background (Sky & Moving City)
    ctx.fillStyle = '#E0F7FA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, bgX + canvas.width, 0, canvas.width, canvas.height);

    // Victory Cinematic
    if (isCinematicEnding) {
        // Draw the full scene image
        ctx.drawImage(houseImg, 0, 0, canvas.width, canvas.height);
        // drawConfetti(); // ELIMINADO
        return; // Skip drawing the rest of the game world
    }

    // Victory House in game world (Removed as requested)
    /* if (isVictoryEnding) {
        ctx.drawImage(houseImg, houseX, nanny.groundY - 260, 450, 340);
    } */

    // Ground
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, canvas.height * 0.75, canvas.width, canvas.height * 0.25);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, canvas.height * 0.75 - 4, canvas.width, 4);

    // Nanny (Clipping from spritesheet)
    if (invincibilityFrames % 10 < 6) {
        const sSizeX = nannySprite.width / 4;
        const sSizeY = nannySprite.height;

        if (nanny.isCrouching) {
            ctx.drawImage(
                nannySprite,
                frameX * sSizeX,
                0,
                sSizeX,
                sSizeY,
                nanny.x,
                nanny.y + 35 + nanny.offsetY,
                nanny.width,
                nanny.height - 35
            );
        } else {
            ctx.drawImage(
                nannySprite,
                frameX * sSizeX,
                0,
                sSizeX,
                sSizeY,
                nanny.x,
                nanny.y + nanny.offsetY,
                nanny.width,
                nanny.height
            );
        }
    }

    // Obstacles
    obstacles.forEach(obs => {
        if (obs.type === 'car') {
            const sSizeX = carSprites.width / 2;
            const sSizeY = carSprites.height;
            // Draw car from sprite (using original dimensions for visual, but collision is tighter)
            ctx.drawImage(carSprites, obs.sx_index * sSizeX, 0, sSizeX, sSizeY, obs.x, obs.y, obs.w, obs.h + 50);
        } else if (obs.type === 'bird') {
            drawBird(ctx, obs.x, obs.y, obs.color);
        }
    });

    drawHUD();
}

function drawBird(ctx, x, y, color) {
    const frame = Math.floor(frameCounter / 8) % 2;

    // Shadow (subtle)
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(x + 5, y + 25, 30, 4);

    // Body
    ctx.fillStyle = color;
    ctx.fillRect(x + 8, y + 10, 24, 12); // Main body
    ctx.fillRect(x + 10, y + 8, 18, 2);  // Top curve

    // Belly (lighter/different shade)
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(x + 12, y + 18, 16, 4);

    // Head
    ctx.fillStyle = color;
    ctx.fillRect(x + 28, y + 4, 12, 12);
    ctx.fillRect(x + 30, y + 2, 8, 2); // Top of head

    // Beak (more detailed)
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(x + 40, y + 8, 6, 3);
    ctx.fillStyle = '#E67E22';
    ctx.fillRect(x + 40, y + 11, 4, 2);

    // Eye
    ctx.fillStyle = 'white';
    ctx.fillRect(x + 34, y + 5, 3, 3);
    ctx.fillStyle = 'black';
    ctx.fillRect(x + 36, y + 6, 1, 1);

    // Wings (Animated)
    ctx.fillStyle = color;
    if (frame === 0) {
        // Wings up
        ctx.fillRect(x + 10, y - 4, 4, 14); // Inner wing
        ctx.fillRect(x + 6, y - 8, 4, 12);  // Outer wing
        // Extension
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(x + 6, y - 4, 8, 2);
    } else {
        // Wings down
        ctx.fillStyle = color;
        ctx.fillRect(x + 10, y + 15, 6, 12); // Inner wing
        ctx.fillRect(x + 14, y + 18, 6, 10); // Outer wing
        // Extension
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(x + 12, y + 20, 8, 2);
    }

    // Tail
    ctx.fillStyle = color;
    ctx.fillRect(x, y + 12, 8, 6);
    ctx.fillRect(x - 2, y + 14, 4, 2);
}

/* function createConfetti() { ... } ELIMINADO */

function gameLoop() {
    if (!isGameRunning && !isVictoryEnding && !isCinematicEnding) return;
    update();
    draw();
    if (isGameRunning || isVictoryEnding || isCinematicEnding) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

// Input Handling
window.addEventListener('keydown', (e) => {
    if (isVictoryEnding) return;
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (!nanny.isJumping && !nanny.isCrouching) {
            nanny.isJumping = true;
            nanny.dy = -nanny.jumpForce;
        }
        e.preventDefault();
    }
    if (e.code === 'ArrowDown') {
        if (!nanny.isJumping) nanny.isCrouching = true;
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowDown') nanny.isCrouching = false;
});

// Mobile Input
canvas.addEventListener('touchstart', (e) => {
    if (isVictoryEnding) return;
    if (!nanny.isJumping && !nanny.isCrouching) {
        nanny.isJumping = true;
        nanny.dy = -nanny.jumpForce;
    }
    e.preventDefault();
}, { passive: false });

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

window.addEventListener('resize', initCanvas);
initCanvas();
console.log("Nanny Runner Engine (Fix) Loaded");
