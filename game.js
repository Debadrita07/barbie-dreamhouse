const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


const groundImg = new Image();
groundImg.src = 'ground.png';
let groundDrawHeight = 0;

const skyImg = new Image();
skyImg.src = 'sky.png';
let skyDrawHeight = 0;

const firebrandImg = new Image();
firebrandImg.src = 'firebrand.png';

const houseImg = new Image();
houseImg.src = 'house.png';
let houseDrawWidth = 0;
let houseDrawHeight = 0;

let canvasSize = Math.min(window.innerWidth, window.innerHeight);
//canvas.width = size;
//canvas.height = size;
//fixing blurry font
let dpr = window.devicePixelRatio || 1;
canvas.width = canvasSize * dpr;
canvas.height = canvasSize * dpr;
canvas.style.width = canvasSize + 'px';
canvas.style.height = canvasSize + 'px';
ctx.scale(dpr, dpr);

let gameState = 'menu';
let difficulty = 'easy';
let score = 0;

let playerName = '';

let firebrands=[]

let characterType = '';
let selectedCharacter = '';

function resetGame() {
    vulnerability = 0;
    firebrands = [];
    spawnTime = 0;
    if (characterType === 'barbie') {
        score = 2;
    } else if (characterType === 'ken') {
        score = -5;
    } else {
        score = 0;
    }
    water.current = water.max;
    gameOver = false;
}

function getSpawnRate() {
    if (difficulty == 'easy') return 1;
    if (difficulty == 'medium') return 0.75;
    if (difficulty == 'hard') return 0.5;
}

function spawnFirebrand() {

    let speedMultiplier = 1;
    if (difficulty == 'medium') speedMultiplier = 3;
    if (difficulty == 'hard') speedMultiplier = 5;

    let firebrand = {
    x: 40 + Math.random() * 10,
    y: canvasSize * 0.3 + Math.random() * canvasSize * 0.15,
    vx: (100 + Math.random() * 100),
    vy: (-100 - Math.random() * 100),
    gravity: 300,
    landed: false 
    };
    
    firebrands.push(firebrand);
}

let wind = 200;

let house = {
    x: canvasSize * 0.7,
    y: canvasSize * 0.8,
    width: canvasSize * 0.15,
    height: canvasSize * 0.2
}

let mouse = {
    x: 0,
    y: 0,
    clicking: false
};

let water = {
    current: 100,
    max: 100,
    drainRate: 25,
    refillRate: 8
}

let vulnerability = 0;
let maxVulnerability = 100;

let gameOver = false;

function drawMeter() {
    let meterX = 20;
    let meterY = 20;
    let meterW = canvasSize * 0.22;
    let meterH = canvasSize * 0.035;
    let fill = (vulnerability / 100) * meterW;

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.roundRect(meterX, meterY, meterW, meterH, 10);
    ctx.fill();

    // Fill
    if (fill > 0) {
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.roundRect(meterX, meterY, fill, meterH, 10);
        ctx.fill();
    }

    // Fire emoji at fill edge
    if (vulnerability > 0) {
        ctx.font = `${meterH * 1.2}px serif`;
        ctx.textAlign = 'left';
        ctx.fillText('🔥', meterX + fill - meterH * 0.6, meterY + meterH * 0.85);
    }

    // Label
    ctx.fillStyle = '#ff0000ff';
    ctx.font = `bold ${canvasSize * 0.03}px 'Dancing Script', sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('Danger', meterX, meterY + meterH + canvasSize * 0.025);
}

function drawWaterMeter() {
    let meterX = 20;
    let meterY = canvasSize * 0.1;
    let meterW = canvasSize * 0.22;
    let meterH = canvasSize * 0.035;
    let fill = (water.current / water.max) * meterW;

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.roundRect(meterX, meterY, meterW, meterH, 10);
    ctx.fill();

    // Fill
    if (fill > 0) {
        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.roundRect(meterX, meterY, fill, meterH, 10);
        ctx.fill();
    }

    // Dolphin emoji at fill edge
    if (water.current > 0) {
        ctx.font = `${meterH * 1.2}px serif`;
        ctx.textAlign = 'left';
        ctx.fillText('🐬', meterX + fill - meterH * 0.6, meterY + meterH * 0.85);
    }

    // Label
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${canvasSize * 0.03}px 'Dancing Script', sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('Water Supply', meterX, meterY + meterH + canvasSize * 0.025);
}

function drawScore() {
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${canvasSize * 0.03}px 'Dancing Script', sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 20, canvasSize * 0.22);
}


function drawSpray() {
        if (!mouse.clicking || water.current <= 0) return;

        for (let i =0; i< 10; i++) {
            let angle = Math.random() * Math.PI * 2;
            let distance = Math.random() * 50;
            let sx = mouse.x + Math.cos(angle) * distance;
            let sy = mouse.y + Math.sin(angle) * distance;

            ctx.fillStyle = 'rgba(0, 222, 251, 0.9)';
            ctx.beginPath();
            ctx.arc(sx, sy, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

function drawGameOver() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    ctx.fillStyle = '#ff0000';
    ctx.font = `italic ${canvasSize * 0.07}px 'Dancing Script', cursive`;
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER!', canvasSize/2, canvasSize/2 * 0.25);

    ctx.fillStyle = '#ff4444';
    ctx.font = `italic ${canvasSize * 0.03}px 'Dancing Script', cursive`;
    ctx.fillText('You destroyed the Dream House!', canvasSize/2, canvasSize * 0.28);

    ctx.fillStyle = '#000000';
    ctx.font = `italic ${canvasSize * 0.024}px 'Dancing Script', sans-serif`;
    if (characterType === 'ken') {
        ctx.fillText("Barbie would have never let this happen 💅", canvasSize/2, canvasSize * 0.38);
    } else {
        ctx.fillText("Its okay, house was falling apart anyway ✨", canvasSize/2, canvasSize * 0.38);
    }
    // Score
    ctx.fillStyle = '#ff69b4';
    ctx.font = `${canvasSize * 0.035}px 'Dancing Script', cursive`;
    ctx.fillText('Score: ' + score, canvasSize/2, canvasSize * 0.50);

    // Leaderboard button
    ctx.fillStyle = '#ff69b4';
    ctx.beginPath();
    ctx.roundRect(canvasSize/2 - canvasSize*0.2, canvasSize * 0.60, canvasSize*0.4, canvasSize*0.08, 20);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${canvasSize * 0.03}px 'Dancing Script', sans-serif`;
    ctx.fillText('Leaderboard 🏆', canvasSize/2, canvasSize * 0.652);

    // Main menu button
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(canvasSize/2 - canvasSize*0.2, canvasSize * 0.72, canvasSize*0.4, canvasSize*0.08, 20);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Main Menu', canvasSize/2, canvasSize * 0.772);

    // Play again
    ctx.fillStyle = '#000000';
    ctx.font = `italic ${canvasSize * 0.03}px 'Dancing Script', sans-serif`;
    ctx.fillText('← Play Again', canvasSize/2, canvasSize * 0.88);

}

function drawMenu() {
    ctx.fillStyle = 'rgba(252, 252, 252, 0.5)';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    ctx.fillStyle = '#de0973ff';
    ctx.font = `italic ${canvasSize * 0.055}px 'Dancing Script', cursive`;
    ctx.textAlign = 'center';
    ctx.fillText("Can You Save", canvasSize/2, canvasSize * 0.25);
    ctx.fillStyle = '#de0973ff';
    ctx.fillText("Barbie's Dream House?", canvasSize/2, canvasSize * 0.35);
     
    ctx.fillStyle = '#000000ff';
    //ctx.font = `${canvasSize * 0.025}px 'Pacifo', sans-serif`;
    ctx.fillText('Are you a Barbie or a Ken?', canvasSize/2, canvasSize * 0.55);

    // Barbie radio
    let radioX = canvasSize/2 - canvasSize * 0.08;
    let barbieY = canvasSize * 0.65;
    let kenY = canvasSize * 0.75;
    let radioR = canvasSize * 0.015;

    ctx.strokeStyle = '#ff69b4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(radioX, barbieY, radioR, 0, Math.PI * 2);
    ctx.stroke();
    if (selectedCharacter === 'barbie') {
        ctx.fillStyle = '#ff69b4';
        ctx.beginPath();
        ctx.arc(radioX, barbieY, radioR * 0.55, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = '#ff69b4';
    ctx.font = `bold ${canvasSize* 0.045}px 'Dancing Script', cursive`;
    ctx.textAlign = 'left';
    ctx.fillText('Barbie 💅', radioX + radioR * 2.5, barbieY + radioR * 0.55);

    // Ken radio
    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(radioX, kenY, radioR, 0, Math.PI * 2);
    ctx.stroke();
    if (selectedCharacter === 'ken') {
        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.arc(radioX, kenY, radioR * 0.55, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.fillStyle = '#4fc3f7';
    ctx.fillText('Ken 🏄', radioX + radioR * 2.5, kenY + radioR * 0.55);

    ctx.textAlign = 'center';
}

function drawCharacter() {
    // Background color based on character
    if (selectedCharacter === 'barbie') {
        ctx.fillStyle = '#ffb6c1'; // pink
    } else {
        ctx.fillStyle = '#b6d4ff'; // light blue
    }
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    ctx.textAlign = 'center';

    if (selectedCharacter === 'barbie') {
        ctx.fillStyle = '#c2185b'; // dark pink
        ctx.font = `${canvasSize * 0.05}px 'Dancing Script', cursive`;
        ctx.fillText('Welcome Barbie! 💅', canvasSize/2, canvasSize * 0.1);
        ctx.fillStyle = '#880e4f';
        ctx.font = `bold ${canvasSize * 0.035}px 'Dancing Script', sans-serif`;
        ctx.fillText('You start with +2 points ✨', canvasSize/2, canvasSize * 0.2);
        ctx.fillText('⚠️ Disclaimer: The Barbie who designed the game is mad at a Ken', canvasSize/2, canvasSize * 0.35);
        ctx.fillText('so all Barbies start at +2 and all Kens start at -5', canvasSize/2, canvasSize * 0.4);
    } else {
        ctx.fillStyle = '#1565c0'; // dark blue
        ctx.font = `${canvasSize * 0.05}px 'Dancing Script', cursive`;
        ctx.fillText('Welcome Ken! 🏄', canvasSize/2, canvasSize * 0.1);
        ctx.fillStyle = '#0d47a1';
        ctx.font = `bold ${canvasSize * 0.028}px 'Dancing Script', sans-serif`;
        ctx.fillText('You start with -5 points ✨', canvasSize/2, canvasSize * 0.2);
        ctx.fillText('⚠️ Disclaimer: The Barbie who designed the game is mad at a Ken', canvasSize/2, canvasSize * 0.35);
        ctx.fillText('so all Barbies start at +2 and all Kens start at -5', canvasSize/2, canvasSize * 0.4);
    }

    // Everything else in black
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${canvasSize * 0.035}px 'Dancing Script', sans-serif`;
    ctx.fillText('ENTER YOUR NAME', canvasSize/2, canvasSize * 0.5);

    ctx.font = `bold ${canvasSize * 0.035}px 'Dancing Script', cursive`;
    ctx.fillText('NEXT ->', canvasSize/2, canvasSize * 0.8);

    ctx.font = `${canvasSize * 0.035}px 'Dancing Script', sans-serif`;
    ctx.fillText('<- BACK', canvasSize/2, canvasSize * 0.92);
}

function drawInstructions() {
    if (selectedCharacter === 'barbie') {
        ctx.fillStyle = '#ffb6c1';
    } else {
        ctx.fillStyle = '#b6d4ff';
    }
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#000000';

    ctx.font = `${canvasSize * 0.045}px 'Dancing Script', cursive`;
    ctx.fillText('How to Play', canvasSize/2, canvasSize * 0.1);

    ctx.font = `italic ${canvasSize * 0.028}px 'Dancing Script', sans-serif`;
    ctx.fillText('💧 Hold click to spray water on firebrands', canvasSize/2, canvasSize * 0.22);
    ctx.fillText('🔥 Stop firebrands from hitting the house', canvasSize/2, canvasSize * 0.31);
    ctx.fillText('📊 Vulnerability hits 100% = Game Over', canvasSize/2, canvasSize * 0.40);
    ctx.fillText('💦 Water is limited — refills slowly!', canvasSize/2, canvasSize * 0.49);

    ctx.font = `${canvasSize * 0.035}px 'Dancing Script', cursive`;
    ctx.fillText('Choose a Difficulty Level', canvasSize/2, canvasSize * 0.63);

    // Easy button
    ctx.fillStyle = '#69db7c';
    ctx.beginPath();
    ctx.roundRect(canvasSize/2 - canvasSize*0.22, canvasSize * 0.69, canvasSize*0.13, canvasSize*0.08, 15);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = `italic ${canvasSize * 0.022}px 'Dancing Script', sans-serif`;
    ctx.fillText('EASY', canvasSize/2 - canvasSize*0.155, canvasSize * 0.742);

    // Medium button
    ctx.fillStyle = '#ffa94d';
    ctx.beginPath();
    ctx.roundRect(canvasSize/2 - canvasSize*0.065, canvasSize * 0.69, canvasSize*0.13, canvasSize*0.08, 15);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.fillText('MEDIUM', canvasSize/2, canvasSize * 0.742);

    // Hard button
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.roundRect(canvasSize/2 + canvasSize*0.09, canvasSize * 0.69, canvasSize*0.13, canvasSize*0.08, 15);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.fillText('HARD', canvasSize/2 + canvasSize*0.155, canvasSize * 0.742);

    ctx.font = `${canvasSize * 0.035}px 'Dancing Script', sans-serif`;
    ctx.fillText('<- BACK', canvasSize/2, canvasSize * 0.92);
}

function drawScene() {
    // Sky
    //ctx.fillStyle = '#010101ff';
    //let skyAspect = skyImg.width/skyImg.height;
    //skyDrawHeight = canvas.width / skyAspect;
    ctx.drawImage(skyImg,0, 0, canvasSize, canvasSize);

    // Ground
    //ctx.fillStyle = '#13b916ff';
    //let groundAspect = groundImg.width/groundImg.height;
    //groundDrawHeight = canvas.width / groundAspect;
    //ctx.drawImage(groundImg,0, canvas.height - groundDrawHeight, canvas.width, groundDrawHeight);

    //firebrands
    firebrands.forEach( f => {
    if (firebrandImg.complete && firebrandImg.naturalWidth > 0) {
        let size = 100;
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.angle || 0);
        ctx.drawImage(firebrandImg, -size/2, -size/2, size, size);
        ctx.restore();
    }
    });

    //house
    //ctx.fillStyle = '#e312abff';
    //ctx.fillRect(house.x,house.y,house.width,house.height);

    //roof
    //ctx.fillStyle = '#6d0651ff';
    //ctx.beginPath();
    //ctx.moveTo(house.x - 10, house.y);
    //ctx.lineTo(house.x + house.width/2, house.y - canvas.height * 0.1);
    //ctx.lineTo(house.x + house.width + 10, house.y);
    //ctx.closePath();
    //ctx.fill();

    //let houseAspect = houseImg.width / houseImg.height;
    //houseDrawWidth = canvas.width * 0.15;
    //houseDrawHeight = houseDrawWidth/houseAspect;

    //ctx.drawImage(houseImg, house.x, house.y, houseDrawWidth, houseDrawHeight);

    //mouse tracker
    if (mouse.clicking) {
        ctx.fillStyle = '#13c1d5ff';
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 1, 0, Math.PI * 2);
        ctx.fill();
    }


    //spray
    drawSpray();

    //meter
    drawMeter();
    drawWaterMeter();
    drawScore();
}

function updateWater(deltaTime) {
    if (mouse.clicking && water.current > 0) {
        water.current -= water.drainRate * deltaTime;
        water.current = Math.max(water.current, 0);
    } 
    else if (!mouse.clicking) {
        water.current += water.refillRate * deltaTime;
        water.current = Math.min(water.current, water.max);
    }
}

function saveScore() {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]')
    leaderboard.push({
        name: playerName,
        score: score,
        difficulty: difficulty,
        character: characterType,
    });
    leaderboard.sort((a,b) => b.score - a.score);
    leaderboard = leaderboard.slice(0,5);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function getLeaderboard() {
    return JSON.parse(localStorage.getItem('leaderboard') || '[]');
}

function drawLeaderboard() {
    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    ctx.textAlign = 'center';

    // Title
    ctx.fillStyle = '#c2185b';
    ctx.font = `${canvasSize * 0.07}px 'Dancing Script', cursive`;
    ctx.fillText('Leaderboard 🏆', canvasSize/2, canvasSize * 0.12);

    let leaderboard = getLeaderboard();

    if (leaderboard.length === 0) {
        ctx.fillStyle = '#ff69b4';
        ctx.font = `italic ${canvasSize * 0.025}px 'Dancing Script', sans-serif`;
        ctx.fillText('No scores yet — play a game!', canvasSize/2, canvasSize * 0.5);
    } else {
        leaderboard.forEach((entry, index) => {
            let y = canvasSize * 0.25 + index * canvasSize * 0.13;

            // Rank
            //ctx.fillStyle = '#c2185b';
            //ctx.font = `bold ${canvasSize * 0.03}px 'Dancing Script', cursive`;
            //ctx.textAlign = 'left';
            //ctx.fillText('#' + (index + 1), canvasSize * 0.08, y);

            // Name — pink for Barbie, blue for Ken
            let nameColor = entry.character === 'barbie' ? '#ff69b4' : '#4fc3f7';
            ctx.fillStyle = nameColor;
            ctx.font = ` ${canvasSize * 0.03}px 'Dancing Script', sans-serif`;
            ctx.fillText('#' + (index+1) + '  ' + entry.name + '  ' + entry.score + ' pts  ·  ', canvasSize/2, y);

            // Score and difficulty — same color as name
            //ctx.fillStyle = nameColor;
            //ctx.font = ` ${canvasSize * 0.02}px 'Dancing Script', sans-serif`;
            //ctx.fillText(entry.score + ' pts  ·  ' + entry.difficulty, canvasSize * 0.22, y + canvasSize * 0.045);
        });
    }

    // Back button
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff69b4';
    ctx.beginPath();
    ctx.roundRect(canvasSize/2 - canvasSize*0.2, canvasSize * 0.88, canvasSize*0.4, canvasSize*0.07, 20);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${canvasSize * 0.025}px 'Dancing Script', sans-serif`;
    ctx.fillText('Back to Menu', canvasSize/2, canvasSize * 0.928);
}

function checkSprayCollision() {

    if (!mouse.clicking || water.current <= 0) return;

    firebrands.forEach(f => {
        if (f.landed) return;

        let dx = f.x - mouse.x;
        let dy = f.y - mouse.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 40) {
            f.landed = true;
            f.extinguished = true;
            score++;
        }
    }
    );
    
    firebrands = firebrands.filter(f => !f.extinguished);

}

function updateFirebrand(deltaTime){

    checkSprayCollision();

    firebrands.forEach(f => {

    if (f.landed) return;

    f.vy += f.gravity * deltaTime;
    f.vx += wind * deltaTime;
    f.x += f.vx * deltaTime;
    f.y += f.vy * deltaTime;
    
    //collision with house
    if (f.x > canvasSize*0.75 && f.x < canvasSize*0.95 &&
        f.y > canvasSize*0.55 && f.y < canvasSize*0.9)
        {
            console.log('HIT HOUSE!');
            f.landed = true;
            vulnerability = Math.min(vulnerability + 10, 100);
            return;
        }

    //collision with ground
    if (f.y >= canvasSize * 0.9){
        console.log('HIT GROUND!');
        f.landed = true;
        return;
    }
});
    //filtering firebrands that flew off screen 
    firebrands = firebrands.filter(f => f.x < canvasSize && !f.extinguished);

}

function checkGameOver() {
    if (vulnerability >= 100)
    {
        gameOver = true;
        saveScore();
    }
    //gameState = 'gameOver';
}

let lastTime = 0;
let spawnTime = 0;

function gameLoop(timestamp) {

    const nameInput = document.getElementById('nameInput');
    if (gameState == 'character') {
        nameInput.style.display = 'block';
    }
    else {
        nameInput.style.display = 'none';
    }

    let deltaTime = (timestamp - lastTime)/1000;
    lastTime = timestamp;

    if (deltaTime > 0.1) deltaTime = 0.1;

    if (gameState == 'menu') {
        drawMenu();
        requestAnimationFrame(gameLoop);
        return;
    }

    if (gameState == 'character') {
    nameInput.style.display = 'block';
    let rect = canvas.getBoundingClientRect();
    nameInput.style.top = (rect.top + canvasSize * 0.55) + 'px';
    nameInput.style.left = (rect.left + canvasSize/2) + 'px';
    nameInput.style.transform = 'translateX(-50%)';
    drawCharacter();
    requestAnimationFrame(gameLoop);
    return;
}

if (gameState == 'instructions') {
    nameInput.style.display = 'none';
    drawInstructions();
    requestAnimationFrame(gameLoop);
    return;
}

    if (gameState == 'leaderboard') {
        drawLeaderboard();
        requestAnimationFrame(gameLoop);
        return;
    }

    if (gameOver) {
        drawGameOver();
        requestAnimationFrame(gameLoop);
        return;
    }

    spawnTime += deltaTime;
    if (spawnTime > getSpawnRate()){
        spawnFirebrand();
        spawnTime = 0;
    }

    updateWater(deltaTime);
    drawScene();
    checkGameOver();
    updateFirebrand(deltaTime);
    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('mousemove', function(e) {
    let rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    console.log(mouse.x, mouse.y);
});

canvas.addEventListener('mousedown', function(e) {
    mouse.clicking = true;
});

canvas.addEventListener('mouseup', function(e) {
    mouse.clicking = false;
});

canvas.addEventListener('click', function(e) {
    //console.log('clicked!');
    //if (gameState != 'menu') return;

    let rect = canvas.getBoundingClientRect();
    let clickX = e.clientX - rect.left;
    let clickY = e.clientY - rect.top;

    if (gameState == 'menu')
    {
    let radioX = canvasSize/2 - canvasSize*0.08;
    let barbieY = canvasSize * 0.65;
    let kenY = canvasSize * 0.75;
    let radioR = canvasSize * 0.04;

    if (Math.sqrt((clickX-radioX)**2 + (clickY-barbieY)**2) < radioR) {
        selectedCharacter = 'barbie';
        gameState = 'character';
    }
    if (Math.sqrt((clickX-radioX)**2 + (clickY-kenY)**2) < radioR) {
        selectedCharacter = 'ken';
        gameState = 'character';
    }
    }

    if (gameState == 'character') {
    // How to play
    let howToPlayY = canvasSize * 0.8;
    if (clickY > howToPlayY - 25 && clickY < howToPlayY + 25) {
        gameState = 'instructions';
    }
    // Back
    let backY = canvasSize * 0.92;
    if (clickY > backY - 20 && clickY < backY + 20) {
        gameState = 'menu';
        selectedCharacter = '';
    }
}   

    if (gameState == 'instructions') {
    let btnY = canvasSize * 0.69;
    let btnH = canvasSize * 0.08;
    let btnW = canvasSize * 0.13;

    if (clickY > btnY && clickY < btnY + btnH) {
        if (clickX > canvasSize/2 - canvasSize*0.22 && 
            clickX < canvasSize/2 - canvasSize*0.22 + btnW) {
            characterType = selectedCharacter;
            playerName = document.getElementById('nameInput').value || 'Anonymous';
            difficulty = 'easy';
            resetGame();
            gameState = 'playing';
        }
        if (clickX > canvasSize/2 - canvasSize*0.065 && 
            clickX < canvasSize/2 - canvasSize*0.065 + btnW) {
            characterType = selectedCharacter;
            playerName = document.getElementById('nameInput').value || 'Anonymous';
            difficulty = 'medium';
            resetGame();
            gameState = 'playing';
        }
        if (clickX > canvasSize/2 + canvasSize*0.09 && 
            clickX < canvasSize/2 + canvasSize*0.09 + btnW) {
            characterType = selectedCharacter;
            playerName = document.getElementById('nameInput').value || 'Anonymous';
            difficulty = 'hard';
            resetGame();
            gameState = 'playing';
        }
    }

    // Back
    let backY = canvasSize * 0.92;
    if (clickY > backY - 20 && clickY < backY + 20) {
        gameState = 'character';
    }
}

    //console.log(clickX, clickY);

    /*if (gameState == 'menu') {

    let howToPlayY = canvas.height * 0.44;
    if (clickY > howToPlayY - 20 && clickY < howToPlayY + 20) {
        gameState = 'instructions'
    }
    let easyY = canvas.height * 0.56;
    let mediumY = canvas.height * 0.68;
    let hardY = canvas.height * 0.80;
    let buttonPadding = 25;
    let leftBound = canvas.width/2 - 80;
    let rightBound = canvas.width/2 + 80;
    
    if (clickX > leftBound && clickX < rightBound && clickY > easyY - buttonPadding && clickY < easyY + buttonPadding) {
        playerName = document.getElementById('nameInput').value || 'Anonymous';
        difficulty = 'easy';
        resetGame();
        gameState = 'playing';
    }

    if (clickX > leftBound && clickX < rightBound && clickY > mediumY - buttonPadding && clickY < mediumY + buttonPadding) {
        playerName = document.getElementById('nameInput').value || 'Anonymous';
        difficulty = 'medium';
        resetGame();
        gameState = 'playing';
    }

    if (clickX > leftBound && clickX < rightBound && clickY > hardY - buttonPadding && clickY < hardY + buttonPadding) {
        playerName = document.getElementById('nameInput').value || 'Anonymous';
        difficulty = 'hard';
        resetGame();
        gameState = 'playing';
    }
}*/
    if (gameOver) {
    // Leaderboard button
    let lbY = canvasSize * 0.60;
    if (clickY > lbY && clickY < lbY + canvasSize*0.08 &&
        clickX > canvasSize/2 - canvasSize*0.2 && clickX < canvasSize/2 + canvasSize*0.2) {
        gameState = 'leaderboard';
    }

    // Main menu button
    let mmY = canvasSize * 0.72;
    if (clickY > mmY && clickY < mmY + canvasSize*0.08 &&
        clickX > canvasSize/2 - canvasSize*0.2 && clickX < canvasSize/2 + canvasSize*0.2) {
        gameOver = false;
        gameState = 'menu';
        selectedCharacter = '';
    }

    // Play again
    let paY = canvasSize * 0.88;
    if (clickY > paY - 20 && clickY < paY + 20) {
        gameOver = false;
        selectedCharacter = characterType;
        gameState = 'instructions';
        resetGame();
    }
}

    if (gameState == 'instructions') {
        let backY = canvas.height * 0.82;
        if (clickY > backY - 25 && clickY < backY + 25) {
            gameState = 'menu';
        }
    }

    if (gameState == 'leaderboard') {
    let backY = canvasSize * 0.88;
    let backH = canvasSize * 0.07;
    if (clickY > backY && clickY < backY + backH &&
        clickX > canvasSize/2 - canvasSize*0.2 && 
        clickX < canvasSize/2 + canvasSize*0.2) {
        gameOver = false;
        gameState = 'menu';
        selectedCharacter = '';
    }
}

});
document.getElementById('nameInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && gameState == 'character') {
        gameState = 'instructions';
    }
});
window.addEventListener('resize', function() {

    dpr = window.devicePixelRatio || 1;
    canvasSize = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = canvasSize + 'px';
    canvas.style.height = canvasSize + 'px';
    ctx.scale(dpr, dpr);


    house.x = canvas.width * 0.75,
    house.y = canvas.height * 0.7,
    house.width = canvas.width * 0.2,
    house.height = canvas.height * 0.2
}
);
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        dpr = window.devicePixelRatio || 1;
        canvasSize = Math.min(window.innerWidth, window.innerHeight);
        canvas.width = canvasSize * dpr;
        canvas.height = canvasSize * dpr;
        canvas.style.width = canvasSize + 'px';
        canvas.style.height = canvasSize + 'px';
        ctx.scale(dpr, dpr);
    }
});

requestAnimationFrame(gameLoop);


