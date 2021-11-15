/*
Created by: Anthony Littell
Date: 9.28.2021
Version: 1.0
Description: A space invaders clone with my own sprite work. Work in progress.
*/
const CANVAS = document.getElementById("si-canvas");
const CTX = CANVAS.getContext("2d");
const SHIP_SPEED = 6;
const SHOOTING_SPEED = 500;
const LASER_SPEED = 15;
const MAX_LASER_DIST = CANVAS.height;
const NUM_OF_ALIENS = 10;
const ALIEN_SPACING = 0.75;
const ALIEN_OFFSET = -30;
let ALIEN_SPEED = 1;
let ALIEN_HEIGHT = CANVAS.height * 0.2;
let currentLevel = 1;

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

let ship = newShip();
let alienSetupCheck = true;
let alienShoot = false;
let enemyAliens = [];
let shipImage = new Image();
let alienShipImage = new Image();
let backgroundImage = new Image();
let randAlienRow, randAlien;

shipImage.src = "images/game_images/ship.png";
alienShipImage.src = "images/game_images/alien-ship.png";
backgroundImage.src = "images/game_images/background.png";

setInterval(updateGame, 1000/60);
setInterval(() => { 
    alienShoot = true;
    randAlienRow = getRandomInt(2);
    randAlien = getRandomInt(enemyAliens[randAlienRow].length);
    enemyAliens[randAlienRow][randAlien].lasers.push({
        x: enemyAliens[randAlienRow][randAlien].x+11,
        y: enemyAliens[randAlienRow][randAlien].y + 40,
        d: 0
    })
}, 2000);
//------Functions------\\

function updateGame(){
    //drawing the canvas
    CTX.fillStyle = "black";
    CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);

    CTX.drawImage(backgroundImage, 0, 0);

    //drawing the ship
    CTX.drawImage(shipImage, ship.x, ship.y);

    //for level 1 only
    if(currentLevel === 1){
        if(alienSetupCheck){
            enemyAliens.push(setUpAliens());
            enemyAliens.push(setUpAliens(40, ALIEN_OFFSET));
            console.log(enemyAliens[0]);
            console.log(enemyAliens[1]);
            alienSetupCheck = false;
        }
        //drawing the alien
        for(let i in enemyAliens){
            for(let j in enemyAliens[i]){
                CTX.drawImage(alienShipImage, enemyAliens[i][j].x, enemyAliens[i][j].y);
            }
        }

        if(enemyAliens[0].length === 0 && enemyAliens[1].length === 0){
            CTX.textAlign = "left";
            CTX.textBaseline = "middle";
            CTX.fillStyle = "white";
            CTX.font = "30px Nunito Sans";
            CTX.fillText("Level Complete!", CANVAS.width*0.415, CANVAS.height*0.4);
        }
    }

    //for aliens moving
    for(let i in enemyAliens){
        for(let j in enemyAliens[i]){
            if(enemyAliens[i][j].x+40 >= CANVAS.width || enemyAliens[i][j].x <= 0){
                ALIEN_SPEED = -ALIEN_SPEED;
                ALIEN_HEIGHT += 10;
            }
            enemyAliens[i][j].x += ALIEN_SPEED;
            if(i == 0){ enemyAliens[i][j].y = ALIEN_HEIGHT; }
            else if(i == 1){ enemyAliens[i][j].y = ALIEN_HEIGHT + ALIEN_OFFSET; }
        }
    }
    //for ship moving
    if(ship.movingRight){
        if(ship.x+37 < CANVAS.width){
            ship.x += SHIP_SPEED;
        }
    }
    else if(ship.movingLeft){
        if(ship.x > 0){
            ship.x -= SHIP_SPEED;
        }
    }

    if(ALIEN_HEIGHT > CANVAS.height/4){
        if(ALIEN_SPEED < 0){ ALIEN_SPEED = -1.5 }
        else { ALIEN_SPEED = 1.5 }
    }
    else if(ALIEN_HEIGHT > CANVAS.height/2){
        if(ALIEN_SPEED < 0){ ALIEN_SPEED = -2 }
        else { ALIEN_SPEED = 2 }
    }
    //for shooting lasers
    ship.center = ship.x + 16;
    for(let i = 0; i < ship.lasers.length; i++){
        CTX.fillStyle = "red";
        CTX.fillRect(ship.lasers[i].x, ship.lasers[i].y, 5, 25);
        
    }
    for(let i = ship.lasers.length-1; i > -1; i--){
        if(ship.lasers[i].d > MAX_LASER_DIST){
            ship.lasers.splice(i, 1);
            continue;
        }
        ship.lasers[i].y -= LASER_SPEED;
        ship.lasers[i].d += -ship.lasers[i].y;
        for(let j in enemyAliens){
            for(let k in enemyAliens[j])
                if(isColliding(ship.lasers[i].x, ship.lasers[i].y, 5, 25, enemyAliens[j][k].x, enemyAliens[j][k].y, alienShipImage.width, alienShipImage.height)){
                    ship.lasers.splice(i, 1);
                    enemyAliens[j].splice(k, 1);
                }
        }
        
    }
    //for enemies shooting (needs work)
    for(let i in enemyAliens){
        for(let j in enemyAliens[i]){
            for(let k in enemyAliens[i][j].lasers){
                CTX.fillStyle = "green";
                CTX.fillRect(enemyAliens[i][j].lasers[k].x, enemyAliens[i][j].lasers[k].y, 5, -25);
            }
            for(let k = enemyAliens[i][j].lasers.length-1; i > -1; i--){
                if(enemyAliens[i][j].lasers[k].d > MAX_LASER_DIST){
                    enemyAliens[i][j].lasers.splice(k, 1);
                    continue;
                }
                enemyAliens[i][j].lasers[k].y += LASER_SPEED;
                enemyAliens[i][j].lasers[k].d += enemyAliens[i][j].lasers[k].y;
                if(isColliding(enemyAliens[i][j].lasers[k].x, enemyAliens[i][j].lasers[k].y, 5, 25, ship.x, ship.y, shipImage.width, shipImage.height)){
                    enemyAliens[i][j].lasers.splice(k, 1);
                    lives--;
                }
            }
        }
    }

    if(ALIEN_HEIGHT >= ship.y-30 || ship.lives <= 0){
        CTX.textAlign = "left";
        CTX.textBaseline = "middle";
        CTX.fillStyle = "white";
        CTX.font = "30px Nunito Sans";
        CTX.fillText("GAME OVER", CANVAS.width*0.415, CANVAS.height*0.4);
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

function newShip(){
    return {
        x: CANVAS.width * 0.49,
        y: CANVAS.height * 0.9,
        center: 0,
        movingLeft: false,
        movingRight: false,
        canShoot: true,
        lives: 3,
        lasers: []
    }
}

//a and b are for the offsets of each line of enemies 
function setUpAliens(a = 0, b = 0){
    let temp = [];
    for(let i = 0; i < NUM_OF_ALIENS; i++){
        temp.push({
            x: (100 * ((i+1) * ALIEN_SPACING)) + a,
            y: ALIEN_HEIGHT + b,
            lasers: []
        });
    }
    return temp;
}

function keyDown(e){
    switch(e.keyCode){
        case 32:
            if(ship.canShoot){
                shootLaser();
                ship.canShoot = false;
                setTimeout(() => {ship.canShoot = true;}, SHOOTING_SPEED);
            }
            break;
        case 37:
            ship.movingLeft = true;
            break;
        case 39:
            ship.movingRight = true;
            break;
    }
}

function keyUp(e){
    switch(e.keyCode){
        case 37:
            ship.movingLeft = false;
            break;
        case 39:
            ship.movingRight = false;
            break;
    }
}

function shootLaser(){
    ship.lasers.push({
        x: ship.center,
        y: ship.y - 40,
        d: 0
    });
}

function isColliding(x1, y1, w1, h1, x2, y2, w2, h2){
    if(x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2){
        return false;
    }
    return true;
}