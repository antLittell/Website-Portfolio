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

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

setInterval(updateGame, 1000/60);

let ship = newShip();
let enemyAliens = setUpAliens();

//------Functions------\\

function updateGame(){
    //drawing the canvas
    CTX.fillStyle = "black";
    CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);

    //drawing the ship
    let shipImage = new Image();
    shipImage.src = "images/game_images/ship.png";
    CTX.drawImage(shipImage, ship.x, ship.y);

    //drawing the aliens
    let alienShipImage = new Image();
    alienShipImage.src = "images/game_images/alien-ship.png";
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
            y: CANVAS.height * 0.2
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