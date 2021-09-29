/*
Created by: Anthony Littell
Date: 9.28.2021
Version: 1.0
Description: My first game that I ever made, a remake of snake. Below you can change the color of the board, snake, and the food that spawns.  
*/

const GAMEBOARD = document.getElementById("snake-canvas");
const GAMEBOARD_CTX = GAMEBOARD.getContext("2d");
const SNAKE_COLOR = "lime";
const SNAKE_BORDER = "darkgreen";
const BOARD_COLOR = "white";
const BOARD_BORDER = "black";
const FOOD_COLOR = "yellow";
const FOOD_BORDER = "darkyellow";

//the starting pieces of the snake
let player = [{x: 200, y: 200}, {x: 190, y: 200}, {x: 180, y: 200},];

let score = 0;
let foodX;
let foodY;
let changingDirection = false;
let dx = 10;
let dy = 0;

main();
generate_food();

document.addEventListener("keydown", change_direction);

//----FUNCTIONS----\\

//used to run the game in a loop
function main(){
    if(game_over()){return;}
    changingDirection = false;
    setTimeout(function func1() {
        clear_canvas();
        draw_food();
        player_move();
        draw_snake();
        main();
    }, 100)
}

//clears the board to start new every frame
function clear_canvas(){
    GAMEBOARD_CTX.fillStyle = BOARD_COLOR;
    GAMEBOARD_CTX.strokestyle = BOARD_BORDER;
    GAMEBOARD_CTX.fillRect(0, 0, GAMEBOARD.width, GAMEBOARD.height);
    GAMEBOARD_CTX.strokeRect(0, 0, GAMEBOARD.width, GAMEBOARD.height);
}

//draws the snake for every frame
function drawSnakeSection(player){
    GAMEBOARD_CTX.fillStyle = SNAKE_COLOR;
    GAMEBOARD_CTX.strokestyle = SNAKE_BORDER;
    GAMEBOARD_CTX.fillRect(player.x, player.y, 10, 10);
    GAMEBOARD_CTX.strokeRect(player.x, player.y, 10, 10);
}

function draw_snake(){
    player.forEach(drawSnakeSection);
}

//draws the food for each frame
function draw_food(){
    GAMEBOARD_CTX.fillStyle = FOOD_COLOR;
    GAMEBOARD_CTX.strokestyle = FOOD_BORDER;
    GAMEBOARD_CTX.fillRect(foodX, foodY, 10, 10);
    GAMEBOARD_CTX.strokeRect(foodX, foodY, 10, 10);
}

function player_move(){
    let head = {x: player[0].x + dx, y: player[0].y + dy};
    player.unshift(head);
    let hasEatenFood = player[0].x === foodX && player[0].y === foodY;
    if(hasEatenFood){
        score += 10;
        document.getElementById("score").innerHTML = score;
        generate_food();
    }
    else{player.pop();}
}

function change_direction(keyPress){
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    if(changingDirection){return;}
    changingDirection = true;

    const keyEvent = keyPress.keyCode;
    const goLeft = dx === -10;
    const goUp = dy === -10;
    const goRight = dx === 10;
    const goDown = dy === 10;

    if(keyEvent === LEFT && !goRight){
        dx = -10;
        dy = 0;
    }
    else if(keyEvent === UP && !goDown){
        dx = 0;
        dy = -10;
    }
    else if(keyEvent === RIGHT && !goLeft){
        dx = 10;
        dy = 0;
    }
    else if(keyEvent === DOWN && !goUp){
        dx = 0;
        dy = 10;
    }
}

function game_over(){
    for(let i = 2; i < player.length; i++){
        if(player[i].x === player[0].x && player[i].y == player[0].y){
            document.getElementById("game-over").style.display = "block";
            return true;
        }
    }
    if(player[0].x < 0 || player[0].x > GAMEBOARD.width - 10 || player[0].y < 0 || player[0].y > GAMEBOARD.height - 10){
        document.getElementById("game-over").style.display = "block";
        return true;
    }
}

function food(min, max){
    return Math.round((Math.random()*(max-min)+min)/10) * 10;
}

//generates new food in a random location
function generate_food(){
    foodX = food(0, GAMEBOARD.width - 10);
    foodY = food(0, GAMEBOARD.height - 10);
    player.forEach(function eated_food(part){
        const hasEaten = part.x == foodX && part.y == foodY;
        if(hasEaten){generate_food();}
    });
}