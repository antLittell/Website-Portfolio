/*
Created by: Anthony Littell
Date: 9.28.2021
Version: 1.0
Description: A space invaders clone with my own sprite work. Work in progress.
*/
const CANVAS = document.getElementById("si-canvas");
const CTX = CANVAS.getContext("2d");
const SHIP_SPEED = 1;
const SHOOTING_SPEED = 500;
const LASER_SPEED = 15;
const MAX_LASER_DIST = CANVAS.height;
const NUM_OF_ALIENS = 10;
const ALIEN_SPACING = 0.75;
let ALIEN_SPEED = 6;
let ALIEN_HEIGHT = CANVAS.height * 0.2;

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);



let ship = newShip();
let enemyAliens = setUpAliens();
let shipImage = new Image();
let alienShipImage = new Image();
let backgroundImage = new Image();

shipImage.src = "images/game_images/ship.png";
alienShipImage.src = "images/game_images/alien-ship.png";
backgroundImage.src = "images/game_images/background.png";

let lvl_1 = setInterval(updateLevel1, 1000/60);

//------Functions------\\

function updateLevel1(){
    //drawing the canvas
    CTX.fillStyle = "black";
    CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);

    CTX.drawImage(backgroundImage, 0, 0);

    //drawing the ship
    CTX.drawImage(shipImage, ship.x, ship.y);

    //drawing the aliens
    for(let i = 0; i < enemyAliens.length; i++){
        CTX.drawImage(alienShipImage, enemyAliens[i].x, enemyAliens[i].y);
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

    //for aliens moving
    for(let i in enemyAliens){
        if(enemyAliens[i].x+40 >= CANVAS.width || enemyAliens[i].x <= 0){
            ALIEN_SPEED = -ALIEN_SPEED;
            ALIEN_HEIGHT += 10;
        }
        enemyAliens[i].x += ALIEN_SPEED;
        enemyAliens[i].y = ALIEN_HEIGHT;
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
        for(let j = 0; j < enemyAliens.length; j++){
            if(isColliding(ship.lasers[i].x, ship.lasers[i].y, 5, 25, enemyAliens[j].x, enemyAliens[j].y, alienShipImage.width, alienShipImage.height)){
                ship.lasers.splice(i, 1);
                enemyAliens.splice(j, 1);
            }
        }
        
    }

    if(ALIEN_HEIGHT >= ship.y-30){
        console.log("reached the end");
        CTX.textAlign = "left";
        CTX.textBaseline = "middle";
        CTX.fillStyle = "white";
        CTX.font = "30px Nunito Sans";
        CTX.fillText("GAME OVER", CANVAS.width*0.415, CANVAS.height*0.4);
    }

}

function newShip(){
    return {
        x: CANVAS.width * 0.49,
        y: CANVAS.height * 0.9,
        center: 0,
        movingLeft: false,
        movingRight: false,
        canShoot: true,
        lasers: []
    }
}

function setUpAliens(){
    let temp = [];
    for(let i = 0; i < NUM_OF_ALIENS; i++){
        temp.push({
            x: 100 * ((i+1) * ALIEN_SPACING),
            y: ALIEN_HEIGHT
        })
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