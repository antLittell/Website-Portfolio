/*
Created by: Anthony Littell
Date: 9.28.2021
Version: 1.0
Description: Simple game of asteroids. Below are settings that control how the game plays. 
*/

const ascanvas = document.getElementById("asteroid-canvas");
const canvas_ctx = ascanvas.getContext("2d");
const textSize = 34;
const fps = 60;
const shipSize = 30;
const explosionTime = 0.5;
const invincibilityTime = 3;
const blinkTime = 0.1;
const turnSpeed = 300; //turn speed in degrees per second
const thrustSpeed = 5; //acceleration of ship while thrusting
const friction = 0.3;
const playerLives = 3;
const numOfAsteroids = 5;
const asteroidSpeed = 40;
const asteroidSize = 100;
const asteroidVert = 10; //average number of vertices on each asteroid
const asteroidJag = 0.5;
const maxLaser = 10;
const laserSpeed = 500; //px per second
const maxLaserDistance = 1000;

let currentLevel, player, lives, asteroids, text, score, highScore;

let laserSound = new Sound("../sounds/asteroids/laser.mp3", 10, 1);
let explosionSound = new Audio("../sounds/asteroids/explode.mp3");
let lightSpeedSound = new Audio("../sounds/asteroids/lightspeed.mp3");

newGame();

//for movement
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);
document.getElementById("reset").addEventListener('click', newGame);
window.addEventListener("keydown", function(e) {
    //arrow keys and space bar
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

//updates game(draws game per frame rate)
setInterval(update, 1000/fps);

function newShip(){
    return s = {
        x: ascanvas.width/2, //where it is on the x axis
        y: ascanvas.height/2, //where it is on the y axis
        r: shipSize/2, //its radius 
        d: 45/180 * Math.PI, //which direction it is facing
        a: 0, //current turn speed
        thrusting: false,
        m: { //magnitude
            x: 0,
            y: 0
        },
        explodeTime: 0,
        blink: Math.ceil(blinkTime * fps),
        blinkNum: Math.ceil(invincibilityTime/blinkTime),
        canShoot: true,
        lasers: []
    };
}

//creates new game
function newGame(){
    level = 0;
    score = 0;
    let hiScore = localStorage.getItem("highscore");
    if(hiScore == null){
        highScore = 0;
    }
    else{
        highScore = parseInt(hiScore);
    }
    lives = playerLives;
    player = newShip()
    updateLevel(); 
    document.getElementById("asteroid-game-over").style.display = "none";
}

//used for next level
function updateLevel(){
    text = "Level " + (level+1);
    createAsteroids();
}

//function to allow sounds to be played before sound clip is over
function Sound(src, maxPlays = 1, volume = 1){
    this.numOfPlays = 0;
    this.plays = [];
    for(let i = 0; i < maxPlays; i++){
        this.plays.push(new Audio(src));
        this.plays[i].v = volume;
    }

    this.play = function(){
        this.numOfPlays = (this.numOfPlays+1) % maxPlays;
        this.plays[this.numOfPlays].play();
    }
}

//updates the screen of the game
function update(){
    //draws on canvas
    canvas_ctx.fillStyle = "black";
    canvas_ctx.fillRect(0, 0, ascanvas.width, ascanvas.height);

    let exp = player.explodeTime > 0;
    let isBlinking = player.blinkNum % 2 == 0;

    //if the ship is not blown up
    if(!exp){
        //for drawing the ship
        if(isBlinking){
            canvas_ctx.strokeStyle = "white";
            canvas_ctx.lineWidth = shipSize/20;
            canvas_ctx.beginPath();
            canvas_ctx.moveTo( //defining the tip of the ship
                player.x + 4/3 * player.r * Math.cos(player.d),
                player.y - 4/3 * player.r * Math.sin(player.d)
            );
            //for the lines of the triangle
            canvas_ctx.lineTo( 
                player.x - player.r * (2/3 * Math.cos(player.d) + Math.sin(player.d)),
                player.y + player.r * (2/3 * Math.sin(player.d) - Math.cos(player.d))
            );
            canvas_ctx.lineTo(
                player.x - player.r * (2/3 * Math.cos(player.d) - Math.sin(player.d)),
                player.y + player.r * (2/3 * Math.sin(player.d) + Math.cos(player.d))
            );
            canvas_ctx.closePath();
            canvas_ctx.stroke();
        }
        if(player.blinkNum > 0){
            player.blink--;
            if(player.blink == 0){
                player.blink = Math.ceil(blinkTime * fps);
                player.blinkNum--;
            }
        }

        if(player.thrusting){
            player.m.x += thrustSpeed * Math.cos(player.d) / fps;
            player.m.y -= thrustSpeed * Math.sin(player.d) / fps;

            console.log(thrustSpeed * Math.cos(player.d) / fps);

            if(isBlinking){
                canvas_ctx.strokeStyle = "yellow";
                canvas_ctx.fillStyle = "red";
                canvas_ctx.lineWidth = shipSize/10;
                canvas_ctx.beginPath();
                canvas_ctx.moveTo( 
                    player.x - player.r * (2/3 * Math.cos(player.d) + 0.5 * Math.sin(player.d)),
                    player.y + player.r * (2/3 * Math.sin(player.d) - 0.5 * Math.cos(player.d))
                );
                //drawing the lines of the thrust
                canvas_ctx.lineTo( 
                    player.x - player.r * (6/3 * Math.cos(player.d)),
                    player.y + player.r * (6/3 * Math.sin(player.d))
                );
                canvas_ctx.lineTo(
                    player.x - player.r * (2/3 * Math.cos(player.d) - 0.5 * Math.sin(player.d)),
                    player.y + player.r * (2/3 * Math.sin(player.d) + 0.5 * Math.cos(player.d))
                );
                canvas_ctx.closePath();
                canvas_ctx.fill();
                canvas_ctx.stroke();
            }
        }
        else{ //for the friction (in space!)
            player.m.x -= friction * player.m.x / fps;
            player.m.y -= friction * player.m.y / fps;
        }

        if(player.blinkNum == 0){
            for(let i = 0; i < asteroids.length; i++){
                if(distanceBetween(player.x, player.y, asteroids[i].x, asteroids[i].y) < player.r + asteroids[i].r){
                    shipExplode();
                    breakAsteroid(i);
                    break; 
                }
            } 
        }
        
        //draws lasers
        for(let i = 0; i < player.lasers.length; i++){
            canvas_ctx.fillStyle = "red";
            canvas_ctx.beginPath();
            canvas_ctx.arc(player.lasers[i].x, player.lasers[i].y, shipSize/15, 0, Math.PI * 2, false);
            canvas_ctx.fill();
        }
        
        let asx, asy, asr, lx, ly;
        for(let i = asteroids.length-1; i >= 0; i--){
            asx = asteroids[i].x;
            asy = asteroids[i].y;
            asr = asteroids[i].r;

            for(let j = player.lasers.length-1; j >= 0; j--){
                lx = player.lasers[j].x;
                ly = player.lasers[j].y;

                if(distanceBetween(asx, asy, lx, ly) < asr){
                    player.lasers.splice(j, 1);
                    breakAsteroid(i);
                    break;
                }
            }
        }
        
        
        //updates the direction
        player.d += player.a;

        //updates players speed
        player.x += player.m.x;
        player.y += player.m.y;
    }
    //if the ship is exploding
    else{
        canvas_ctx.fillStyle = "darkred";
        canvas_ctx.beginPath();
        canvas_ctx.arc(player.x, player.y, player.r * 1.5, 0, Math.PI * 2, false);
        canvas_ctx.fill();
        canvas_ctx.fillStyle = "red";
        canvas_ctx.beginPath();
        canvas_ctx.arc(player.x, player.y, player.r * 1.2, 0, Math.PI * 2, false);
        canvas_ctx.fill();
        canvas_ctx.fillStyle = "orange";
        canvas_ctx.beginPath();
        canvas_ctx.arc(player.x, player.y, player.r * 0.9, 0, Math.PI * 2, false);
        canvas_ctx.fill();

        player.explodeTime--;
        if(player.explodeTime == 0){
            player = newShip();
        }
    }

    //draws the asteroids
    canvas_ctx.strokeStyle = "slategrey";
    canvas_ctx.lineWidth = shipSize / 20;
    let ax, ay, ar, ad, av, aj;
    for(let i = 0; i < asteroids.length; i++){
        ax = asteroids[i].x;
        ay = asteroids[i].y;
        ar = asteroids[i].r;
        ad = asteroids[i].d;
        av = asteroids[i].v;
        aj = asteroids[i].jag;

        canvas_ctx.beginPath();
        canvas_ctx.moveTo(
            ax + ar * aj[0] * Math.cos(ad),
            ay + ar * aj[0] * Math.sin(ad)
        );
        Math.floor(Math.random() * ar)
        for(let j = 1; j < av; j++){
            canvas_ctx.lineTo(
                ax + ar * aj[j] * Math.cos(ad + j * Math.PI * 2 / av),
                ay + ar * aj[j] * Math.sin(ad + j * Math.PI * 2 / av)
            )
        }
        canvas_ctx.closePath();
        canvas_ctx.stroke();
    }

    //loops player around canvas
    if(player.x < 0 - player.r){
        player.x = ascanvas.width + player.r;
    }
    else if(player.x > ascanvas.width + player.r){
        player.x = 0 - player.r;
    }
    if(player.y < 0 - player.r){
        player.y = ascanvas.height + player.r;
    }
    else if(player.y > ascanvas.height + player.r){
        player.y = 0 - player.r;
    }

    for(let i = 0; i < asteroids.length; i++){
        asteroids[i].x += asteroids[i].xVelocity;
        asteroids[i].y += asteroids[i].yVelocity;

        if(asteroids[i].x < 0 - asteroids[i].r){
            asteroids[i].x = ascanvas.width + asteroids[i].r;
        }
        else if(asteroids[i].x > ascanvas.width + asteroids[i].r){
            asteroids[i].x = 0 - asteroids[i].r;
        }
        if(asteroids[i].y < 0 - asteroids[i].r){
            asteroids[i].y = ascanvas.height + asteroids[i].r;
        }
        else if(asteroids[i].y > ascanvas.height + asteroids[i].r){
            asteroids[i].y = 0 - asteroids[i].r;
        }
    }
    
    //for lasers moving
    for(let i = player.lasers.length-1; i >= 0; i--){
        if(player.lasers[i].d > maxLaserDistance){
            player.lasers.splice(i, 1);
            continue;
        }

        player.lasers[i].x += player.lasers[i].xVel;
        player.lasers[i].y += player.lasers[i].yVel;

        player.lasers[i].d += Math.sqrt(player.lasers[i].xVel**2 + player.lasers[i].yVel**2);

        if(player.lasers[i].x < 0){
            player.lasers[i].x = ascanvas.width;
        }
        else if(player.lasers[i].x > ascanvas.width){
            player.lasers[i].x = 0;
        }
        if(player.lasers[i].y < 0){
            player.lasers[i].y = ascanvas.height;
        }
        else if(player.lasers[i].y > ascanvas.height){
            player.lasers[i].y = 0;
        }
    }

    canvas_ctx.fillStyle = "white";
    canvas_ctx.font = "small-caps " + textSize + "px dejavu sans mono";
    canvas_ctx.fillText(text, ascanvas.width*0.85, ascanvas.height*0.07);

    canvas_ctx.strokeStyle = "white";
    canvas_ctx.lineWidth = shipSize/25;
    canvas_ctx.beginPath();
    canvas_ctx.moveTo(
        ascanvas.width*0.04 + 4/3 * player.r * 0.8 * Math.cos(0),
        ascanvas.height*0.07 - 4/3 * player.r * 0.8 * Math.sin(0)
    );
    canvas_ctx.lineTo(
        ascanvas.width*0.04 - player.r * 0.8 * (2/3 * Math.cos(0) + Math.sin(0)),
        ascanvas.height*0.07 + player.r * 0.8 * (2/3 * Math.sin(0) - Math.cos(0))
    );
    canvas_ctx.lineTo(
        ascanvas.width*0.04 - player.r * 0.8 * (2/3 * Math.cos(0) - Math.sin(0)),
        ascanvas.height*0.07 + player.r * 0.8 * (2/3 * Math.sin(0) + Math.cos(0))
    );
    canvas_ctx.closePath();
    canvas_ctx.stroke();

    canvas_ctx.fillStyle = "white";
    canvas_ctx.font = "small-caps" + (textSize) + "px dejavu sans mono";
    canvas_ctx.fillText("| " + lives, ascanvas.width*0.06, ascanvas.height*0.07);
    if(lives == 0){
        document.getElementById("asteroid-game-over").style.display = "flex";
    }

    canvas_ctx.textAlign = "right";
    canvas_ctx.textBaseline = "middle";
    canvas_ctx.fillStyle = "white";
    canvas_ctx.font = (textSize - 5) + "px Nunito Sans";
    canvas_ctx.fillText(score, ascanvas.width * 0.515, ascanvas.height * 0.07);

    canvas_ctx.textAlign = "left";
    canvas_ctx.textBaseline = "middle";
    canvas_ctx.fillStyle = "white";
    canvas_ctx.font = (textSize - 5) + "px Nunito Sans";
    canvas_ctx.fillText("High Score: " + highScore, ascanvas.width * 0.03, ascanvas.height * 0.93);
}

function shipExplode(){
    player.explodeTime = Math.ceil(explosionTime * fps);
    if(lives > 0){
        lives--;
        explosionSound.play();
    }
}

//function for the controls
function keyDown(e){
    if(lives == 0){
        return;
    }
    switch(e.keyCode){
        case 32:
            shootLaser();
            break;
        case 37: //left
            player.a = turnSpeed/180 * Math.PI/fps;
            break;
        case 38: //up(thrust)
            player.thrusting = true;
            break;
        case 39: //right
            player.a = -turnSpeed/180 * Math.PI/fps;
            break;
    }
}

function keyUp(e){
    if(lives == 0){
        return;
    }
    switch(e.keyCode){
        case 32:
            player.canShoot = true;
            break;
        case 37: //left
            player.a = 0;
            break;
        case 38: //up(thrust)
            player.thrusting = false;
            break;
        case 39: //right
            player.a = 0;
            break;
    }
}

function shootLaser(){
    if(player.canShoot && player.lasers.length < maxLaser){
        player.lasers.push({
            x: player.x + 4/3 * player.r * Math.cos(player.d),
            y: player.y - 4/3 * player.r * Math.sin(player.d),
            xVel: laserSpeed * Math.cos(player.d)/fps,
            yVel: -laserSpeed * Math.sin(player.d)/fps,
            d: 0
        });
        laserSound.play();
    }
}

function createAsteroids(){
    asteroids = [];
    let x, y;
    for(let i = 0; i < numOfAsteroids + level; i++){
        do{
            x = Math.floor(Math.random() * ascanvas.width);
            y = Math.floor(Math.random() * ascanvas.height);
        }while(distanceBetween(player.x, player.y, x, y) < asteroidSize * 2 + player.r);
        asteroids.push(newAsteroid(x, y, Math.ceil(asteroidSize/2)));
    }
}

//tells distance between asteroid and ship to see if it is colliding or not
function distanceBetween(shipX, shipY, astX, astY){
    return Math.sqrt((astX - shipX)**2 + (astY - shipY)**2);
}

//creating new asteroids of different shapes and sizes
function newAsteroid(x, y, r){
    let asteroidAccelerator = 1 + 0.3 * level;
    let as = {
        x: x,
        y: y,
        xVelocity: Math.random() * asteroidSpeed * asteroidAccelerator/fps * (Math.random() < 0.5 ? 1 : -1),
        yVelocity: Math.random() * asteroidSpeed * asteroidAccelerator/fps * (Math.random() < 0.5 ? 1 : -1),
        r: r,
        d: Math.random() * Math.PI * 2,
        v: Math.floor(Math.random() * (asteroidVert + 1) + asteroidVert/2),
        jag: []
    };

    for(let i = 0; i < as.v; i++){
        as.jag.push(Math.random() * asteroidJag * 2 + 1 - asteroidJag);
    }

    return as;
}

//destroying/breaking apart an asteroid
function breakAsteroid(i){
    let x = asteroids[i].x;
    let y = asteroids[i].y;
    let r = asteroids[i].r;

    if(r == Math.ceil(asteroidSize/2)){
        asteroids.push(newAsteroid(x, y, Math.ceil(asteroidSize/4)));
        asteroids.push(newAsteroid(x, y, Math.ceil(asteroidSize/4)));
        score += 10;
    }
    else if(r == Math.ceil(asteroidSize/4)){
        asteroids.push(newAsteroid(x, y, Math.ceil(asteroidSize/8)));
        asteroids.push(newAsteroid(x, y, Math.ceil(asteroidSize/8)));
        score += 20;
    }
    else{
        score += 30;
    }
    
    if(score > highScore){
        highScore = score;
        localStorage.setItem("highscore", highScore);
    }

    asteroids.splice(i, 1);

    if(asteroids.length == 0){
        level++;
        updateLevel();
    }
}
