

let canvas;
let canvasContext;
let ballX = 50;
let ballSpeedX = 10;
let ballY = 50;
let ballSpeedY = 10;


const PADDLE_HEIGHT = 100;
const PADDLE_THICKNESS = 10;


let paddle1X = 250;


//Bricks $$$
const BRICK_W = 80;
const BRICK_H = 20;
const BRICK_GAP = 2;
const BRICK_COLS = 19;
const BRICK_ROWS = 16;

let brickGrid = new Array(BRICK_COLS * BRICK_ROWS);

let brickCounter = 0;


window.onload = function () {

    canvas = document.getElementById("gameCanvas");
    canvasContext = canvas.getContext("2d");


    let framesPerSecond = 30;
    setInterval(callBoth, 1000 / framesPerSecond);



    // Aici este adaugat evenimentul pentru a sincroniza jucatorul din stanga cu mouse ul;
    canvas.addEventListener('mousemove', function (evt) {
        let mousePos = calculateMousePos(evt);
        paddle1X = mousePos.x - (PADDLE_HEIGHT / 2);

    });

    resetBricks();


    ballReset();

    if(brickCounter==BRICK_COLS*BRICK_ROWS)
        resetBricks();

}

/* 0  1  2  3  4 
   5  6  7  8  9
   10 11 12 13 14 */
function isBrickAtTileCoord(brickTileCol, brickTileRow) {
    let brickIndex = brickTileToIndex(brickTileCol, brickTileRow)
    return (brickGrid[brickIndex] == 1)
}


function brickTileToIndex(tileCol, tileRow) {
    return (tileCol + BRICK_COLS * tileRow);
}


function resetBricks() {

    for (let i = 0; i < BRICK_COLS * BRICK_ROWS; i++) {
        brickGrid[i] = 1;
    }
}

function drawBricks() {
    for (let eachCol = 0; eachCol < BRICK_COLS; eachCol++) { //	in	each	column...
        for (let eachRow = 0; eachRow < BRICK_ROWS; eachRow++) { //	in	each	row	in	that	col
            //	compute	the	corner	in	pixel	coordinates	of	the	corresponding	brick
            //	multiply	the	brick's	tile	coordinate	by	BRICK_W	or	BRICK_H	for	pixel
            if (isBrickAtTileCoord(eachCol, eachRow)) {
                let brickLeftEdgeX = eachCol * BRICK_W;
                let brickTopEdgeY = eachRow * BRICK_H;
                //	draw	a	blue	rectangle	at	that	position,	leaving	a	small	margin	for	BRICK_GAP
                colorRect(brickLeftEdgeX, brickTopEdgeY, BRICK_W - BRICK_GAP, BRICK_H - BRICK_GAP, 'blue');
            } //	end	of	for	eachRow
        } //	end	of	for	eachCol
    } //	end	of	drawBricks()
}


function calculateMousePos(evt) {
    let rect = canvas.getBoundingClientRect();
    let root = document.documentElement;
    let mouseX = evt.clientX - rect.left - root.scrollLeft;
    let mouseY = evt.clientY - rect.top - root.scrollTop;

    return {
        x: mouseX,
        y: mouseY
    };
}


// Nu trebuie sa las o conditie, ci trebuie doar sa pun ce face functia, caci jocul este constrans de limitele lui
function ballReset() {

    ballSpeedY = -ballSpeedY * 1, 1;
    ballSpeedX = 0;

    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
}


function colorRect(leftX, topY, width, height, drawColor) {
    canvasContext.fillStyle = drawColor;
    canvasContext.fillRect(leftX, topY, width, height);
}

//Functie pentru bila
function colorCircle(centerX, centerY, radius, drawColor) {
    canvasContext.fillStyle = drawColor;
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
    canvasContext.fill();
}

function drawEverything() {
    //Canvas 
    colorRect(0, 0, canvas.width, canvas.height, "black");


    //Bricks
    drawBricks();


    //Jucator Stanga
    colorRect(paddle1X, canvas.height - PADDLE_THICKNESS, PADDLE_HEIGHT, PADDLE_THICKNESS, "#00BFFF");


    //Bila
    colorCircle(ballX, ballY, 10, "white")

}


function callBoth() {
    moveEverything();
    drawEverything();
}


function moveEverything() {


    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Lovirea canvasului si resetul

    if (ballY < 0)
        ballReset();
    if (ballY > canvas.height) {

        if (ballX > paddle1X && ballX < paddle1X + PADDLE_HEIGHT) {
            let deltaX = ballX - (paddle1X + PADDLE_HEIGHT / 2);
            ballSpeedX = deltaX * 0.4;
            ballSpeedY = -ballSpeedY;
        }
        else
            ballReset();
    }

    if (ballX < 0) {
        ballSpeedX = -ballSpeedX;
    }
    if (ballX > canvas.width) {
        ballSpeedX = -ballSpeedX;
    }
    breakAndBouncOffBrickAtPixelCoord(ballX, ballY);
}

function breakAndBouncOffBrickAtPixelCoord(pixelX, pixelY) {
    let tileCol = pixelX / BRICK_W;
    let tileRow = pixelY / BRICK_H;

    tileCol = Math.floor(tileCol);
    tileRow = Math.floor(tileRow);


    let brickIndex = brickTileToIndex(tileCol, tileRow);


    if (tileCol < 0 || tileCol > BRICK_COLS || tileRow < 0 || tileRow > BRICK_ROWS) {
        return false;
    }
    if (brickGrid[brickIndex] == 1) {

        let prevBallX = ballX - ballSpeedX;
        let prevBallY = ballY - ballSpeedY;
        let prevTileCol = Math.floor(prevBallX / BRICK_W);
        let prevTileRow = Math.floor(prevBallY / BRICK_H);

        let bothTestsFailed = true;



        if (prevTileCol != tileCol) {

            let adjacentBrickIndex = brickTileToIndex(prevTileCol, tileRow);

            if (brickGrid[adjacentBrickIndex] != 1) {
                ballSpeedX *= -1;
                bothTestsFailed = false;
            }

        }
        if (prevTileRow != tileRow) {
            let adjacentBrickIndex = brickTileToIndex(tileCol, prevTileRow);

            if (brickGrid[adjacentBrickIndex] != 1) {
                ballSpeedY *= -1;
                bothTestsFailed = false;
            }

        }

        if (bothTestsFailed) {
            ballSpeedX *= -1;
            ballSpeedY *= -1;
        }

        brickGrid[brickIndex] = 0;
        brickCounter++;
    }

}