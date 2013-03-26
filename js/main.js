// This file conatins all variables used with different variations of the game, and some useful functions

// Contains map width, map height, color and toolbar thickness
var m_iMap;
var m_iSpecks;
var m_Player;
var m_iAsteroidz;
var m_iSpeed = { gameOriginal: 33, game: 33 };
var m_iScores = { one: 0, highest: 0, color: "white"};
var m_iMessageAlignment;
var m_CanvasContext;
var m_IntervalId = { game: null};
var m_bGameStatus = { started: false, paused: false, single: false };
var m_iKeyId = { arrowUp: 38, arrowDown: 40, arrowRight: 39, arrowLeft: 37, esc: 27, space: 32 };

window.addEventListener('keydown', doKeyDown, true);
window.addEventListener('keyup', doKeyUp, true);
document.addEventListener("DOMContentLoaded", initializeGame, false);
document.documentElement.style.overflowX = 'hidden';	 // Horizontal scrollbar will be hidden
document.documentElement.style.overflowY = 'hidden';     // Vertical scrollbar will be hidden

// Initialize canvas
function initializeGame()
{
    initializeCanvas(); 
    showStartMenu(true);
}

// Starts game
function startGame(iGameVersion)
{
    if(iGameVersion == 0)
        initializeSingle();
}

// Sets the canvas as big as the broswer size
function initializeCanvas()
{
    m_CanvasContext = document.getElementById("myCanvas").getContext("2d");
    
    m_iMap = 
    {
        height: window.innerHeight, 
        width: window.innerWidth,
        toolbarThickness: floor(this.height / 25),
        toolbarColor: "black",
        backgroundColor: "black"
    };
    
    m_iMessageAlignment = 
    {
        left: 5,
        middle: floor(m_iMap.width / 2),
        right: floor((m_iMap.width / 2) + (m_iMap.width / 2) / 2)
    };
    
    m_CanvasContext.canvas.width = m_iMap.width -= floor(m_iMap.width / 75); 
    m_CanvasContext.canvas.height = m_iMap.height -= floor(m_iMap.height / 36);
}

// Initialize the astroidz array with 10
function initializeAsteroidz()
{
    m_iAsteroidz = new Array();
    
    for(var index = 0; index < 100; index++)
        m_iAsteroidz.push(makeAsteroid(getRandomNumber(0, 4)));
}

// Shows start menu, based on argument.
function showStartMenu(bVisible)
{
    if (bVisible)
    {
        resetGame();
        paintScreen(m_iMap.backgroundColor);
        document.getElementById("startMenu").style.zIndex = 1;        
    }

    else
    {
        document.getElementById("startMenu").style.zIndex = -1;
        paintScreen(m_iMap.backgroundColor);
        paintToolbar(m_iMap.toolbarColor);
    }
}

function paintShip(ship, width, color)
{    
    m_CanvasContext.beginPath();
    m_CanvasContext.lineWidth = width;
    m_CanvasContext.moveTo(ship.head.x, ship.head.y);
    m_CanvasContext.lineTo(ship.tailRight.x, ship.tailRight.y);
    m_CanvasContext.lineTo(ship.butt.x, ship.butt.y);
    m_CanvasContext.lineTo(ship.tailLeft.x, ship.tailLeft.y);
    m_CanvasContext.lineTo(ship.head.x, ship.head.y);
    m_CanvasContext.strokeStyle = color;
    m_CanvasContext.stroke();
    m_CanvasContext.closePath();
}

// Paint 7 point asteroid
function paintAsteroid(asteroid, width, color)
{
    m_CanvasContext.beginPath();
    m_CanvasContext.lineWidth = width;
    m_CanvasContext.moveTo(asteroid[0].x, asteroid[0].y);
    
    for(var index = 1; index < asteroid.length; index++)
        m_CanvasContext.lineTo(asteroid[index].x, asteroid[index].y);
    
    m_CanvasContext.lineTo(asteroid[0].x, asteroid[0].y);
    m_CanvasContext.strokeStyle = color;
    m_CanvasContext.stroke();
    m_CanvasContext.closePath();
}

// Paints a rectangle by pixels
function paintTile(startX, startY, width, height, color)
{
    m_CanvasContext.fillStyle = color;
    m_CanvasContext.fillRect(startX, startY, width, height);
}

// Paints toolbar back to regular
function paintToolbar(color)
{
    paintTile(0, 0, m_iMap.width, m_iMap.toolbarThickness, color);
}

// Paints whole screen
function paintScreen(color)
{
    paintTile(0, 0, m_iMap.width, m_iMap.height, color);
    paintSpecks();
}

function paintSpecks()
{
    for(var index = 0; index < m_iSpecks.length; index++)
        paintTile(m_iSpecks[index].x, m_iSpecks[index].y, 1, 1, m_iSpecks[index].color);
}

// Shows pause pause if true, otherwise hides it.
function showPausePic(bVisible)
{
    m_bGameStatus.isPaused = bVisible;
    
    if (bVisible)
        document.getElementById("pause").style.zIndex = 1;

    else
        document.getElementById("pause").style.zIndex = -1;
}

// Writes message to corresponding tile, with specified colour
function writeMessage(startTile, message, color)
{
    m_CanvasContext.font = (m_iMap.toolbarThickness - 10)  + 'pt Calibri';
    m_CanvasContext.fillStyle = color;
    m_CanvasContext.fillText(message, startTile, m_iMap.toolbarThickness - 5);
}

// Resets the status's about the game
function resetGame()
{
    window.clearInterval(m_IntervalId.game);
    m_bGameStatus.started = false;
    m_bGameStatus.isPaused = false;
    m_bGameStatus.single = false;
    m_iScores.one = 0;
    m_iScores.highest = 0;
    m_Player = resetPlayer(floor(m_iMap.width / 2), floor(m_iMap.height / 2));
    initializeAsteroidz();
    m_iSpecks = new Array();
    showPausePic(false);
    
    for(var index = 0; index < floor((m_iMap.width * m_iMap.height) / 500); index++)
        m_iSpecks.push({x: getRandomNumber(0, m_iMap.width), y: getRandomNumber(0, m_iMap.height), color: getRandomColor(1, 255)});
}

// Handles the changing direction of the snake.
function doKeyDown(event) {

    if (m_bGameStatus.started && !m_bGameStatus.isPaused)
        if(m_bGameStatus.single)
            keyBoardDownSingle(event);
    
    event.preventDefault();
    return false;
}

// Handles key up events
function doKeyUp(event)
{
    if(event.keyCode == m_iKeyId.esc)
        showStartMenu(true);
        
    else if (m_bGameStatus.started)
        if(m_bGameStatus.single)
            keyBoardUpSingle(event);
    
    event.preventDefault();
    return false;
}

function resetPlayer(centerX, centerY)
{
    var middleWidth = centerX;
    var middleHeight = centerY;
    var shipWidth = floor(m_iMap.width / 100);
    var shipHeight = floor(middleHeight / 5);
    var buttDistance = floor(shipHeight - floor(shipHeight / 3));
    
    var player =
    {
        head: 
        { 
            x: middleWidth,
            y: middleHeight 
        },
                  
        tailLeft: 
        { 
            x: middleWidth - shipWidth,
            y: middleHeight + shipHeight
        },

        tailRight: 
        { 
            x: middleWidth + shipWidth,
            y: middleHeight + shipHeight
        },
        
        butt:
        {
            x: middleWidth,
            y: middleHeight + buttDistance
        }, 
        
        velocity:
        {
            x: 0,
            y: 0
        }, 
        
        color: "white",
        up: false,
        down: false,
        left: false,
        right: false,
        speedDecrease: .25,
        degree: 0,
        degreeVelocity: .222
    };
    
    return player;
}

function rotateShip(ship, angle)
{
    var centerX = ship.butt.x;
    var centerY = ship.butt.y;
    var newHead = rotatePoint(ship.head.x, ship.head.y, angle, centerX, centerY);
    var newTailLeft = rotatePoint(ship.tailLeft.x, ship.tailLeft.y, angle, centerX, centerY);
    var newTailRight = rotatePoint(ship.tailRight.x, ship.tailRight.y, angle, centerX, centerY);
    var newButt = rotatePoint(ship.butt.x, ship.butt.y, angle, centerX, centerY);
    
    ship.head = newHead;
    ship.tailLeft = newTailLeft;
    ship.tailRight = newTailRight;
    ship.butt = newButt;
}

function setUpShip(ship)
{
    // Repaint the prevous ship to background color
    paintShip(ship, 13, m_iMap.backgroundColor);    
    rotateShip(ship, ship.degree);
    
    // Moving ship
    if(ship.up || ship.down)
    {
        ship.velocity = findShipSlope(ship);
        ship.velocity.x /= 3;
        ship.velocity.y /= 3;
        
        if(ship.down)
        {
            ship.velocity.x = -ship.velocity.x;
            ship.velocity.y = -ship.velocity.y;
        }
    }
    
    if(!ship.up && !ship.down)
    {
        if(ship.velocity.x > 0)
            if((ship.velocity.x -= ship.speedDecrease) < 0)
                ship.velocity.x = 0;
        
        if(ship.velocity.x < 0)
            if((ship.velocity.x += ship.speedDecrease) > 0)
                ship.velocity.x = 0;
        
        if(ship.velocity.y > 0)
            if((ship.velocity.y -= ship.speedDecrease) < 0)
                ship.velocity.y = 0;
        
        if(ship.velocity.y < 0)
            if((ship.velocity.y += ship.speedDecrease) > 0)
                ship.velocity.y = 0;
    }
    
    if(ship.left || ship.right)
    {
        ship.degree = ship.degreeVelocity;
        
        if(ship.left)
            ship.degree = -ship.degree;
    }
    
    if(!ship.left && !ship.right)
        ship.degree = 0;
    
    
    ship.head.x += ship.velocity.x;
    ship.tailLeft.x += ship.velocity.x;
    ship.tailRight.x += ship.velocity.x;
    ship.butt.x += ship.velocity.x;
    
    ship.head.y += ship.velocity.y;
    ship.tailLeft.y += ship.velocity.y;
    ship.tailRight.y += ship.velocity.y;
    ship.butt.y += ship.velocity.y;
    
    // Putting the ship on the other side if its out of bounds
    if(ship.head.x < 0 && ship.tailLeft.x < 0 && ship.tailRight.x < 0 && ship.butt.x < 0)
    {       
        ship.head.x += m_iMap.width;
        ship.tailLeft.x += m_iMap.width;;
        ship.tailRight.x += m_iMap.width;;
        ship.butt.x += m_iMap.width;;
    }
        
    if(ship.head.x > m_iMap.width && ship.tailLeft.x > m_iMap.width && ship.tailRight.x > m_iMap.width && ship.butt.x > m_iMap.width)
    {       
        ship.head.x -= m_iMap.width;
        ship.tailLeft.x -= m_iMap.width;
        ship.tailRight.x -= m_iMap.width;
        ship.butt.x -= m_iMap.width;
    }
    
    if(ship.head.y < 0 && ship.tailLeft.y < 0 && ship.tailRight.y < 0 && ship.butt.y < 0)
    {       
        ship.head.y += m_iMap.height;
        ship.tailLeft.y += m_iMap.height;;
        ship.tailRight.y += m_iMap.height;;
        ship.butt.y += m_iMap.height;;
    }
        
    if(ship.head.y > m_iMap.height && ship.tailLeft.y > m_iMap.height && ship.tailRight.y > m_iMap.height && ship.butt.y > m_iMap.height)
    {       
        ship.head.y -= m_iMap.height;
        ship.tailLeft.y -= m_iMap.height;;
        ship.tailRight.y -= m_iMap.height;;
        ship.butt.y -= m_iMap.height;;
    }
    
    // Paint ship
    paintShip(ship, 1,ship.color);
    
    return ship;
}

function findShipSlope(ship)
{
    var slope = { x: ship.head.x - ship.butt.x, y: ship.head.y - ship.butt.y };
    
    return slope;
}

function setUpAsteroid(asteroid)
{
    paintAsteroid(asteroid.array, 7, m_iMap.backgroundColor);
    
    for(var index = 0; index < asteroid.array.length; index++)
    {
        asteroid.array[index].x += asteroid.velocity.x;
        asteroid.array[index].y += asteroid.velocity.y;
    }
    
    paintAsteroid(asteroid.array, 3, asteroid.color);
}

function makeAsteroid(position)
{
    var asteroid = 
    {
        array: new Array(),
        velocity: { x: 0, y: 0},
        color: "white"
    };
    
    var amountOfPoints = 6;
    var center;
    var xVerticalVelocity = getRandomNumber(0, 10) >  5 ? getRandomNumber(0, floor(m_iMap.width / 200)) : -getRandomNumber(0, floor(m_iMap.width / 200));
    var yVerticalVelocity = getRandomNumber(floor(m_iMap.width / 300), floor(m_iMap.width / 200));
    var xHorizontaVelocity = getRandomNumber(floor(m_iMap.width / 300), floor(m_iMap.width / 200));
    var yHorizontalVelocity = getRandomNumber(0, 10) >  5 ? getRandomNumber(0, floor(m_iMap.width / 200)) : -getRandomNumber(0, floor(m_iMap.width / 200));
    
    if(position == 0)   // Spawn above the map
    {    
        center = { x: getRandomNumber(0, m_iMap.width), y: getRandomNumber(0, floor(-m_iMap.height / 3)) };
        asteroid.velocity.x = xVerticalVelocity;
        asteroid.velocity.y = yVerticalVelocity;
    }
    
    if(position == 1)   // Spawn below the map
    {    
        center = { x: getRandomNumber(0, m_iMap.width), y: getRandomNumber(m_iMap.height, m_iMap.height + floor(m_iMap.height / 3)) };
        asteroid.velocity.x = xVerticalVelocity;
        asteroid.velocity.y = -yVerticalVelocity;
    }
    
    if(position == 2)   // Spawn left of the map
    {    
        center = { x: getRandomNumber(floor(-m_iMap.width / 3), 0), y: getRandomNumber(0, m_iMap.height) };
        asteroid.velocity.x = xHorizontaVelocity;
        asteroid.velocity.y = yHorizontalVelocity;
    }
    
    if(position == 3)   // Spawn right of the map
    {    
        center = { x: getRandomNumber(m_iMap.width, m_iMap.width + floor(m_iMap.width / 3)), y: getRandomNumber(0, m_iMap.height) };
        asteroid.velocity.x = -xHorizontaVelocity;
        asteroid.velocity.y = yHorizontalVelocity;
    }

    for(var index = 0; index < amountOfPoints; index++)
    {
        var distance = getRandomNumber(50, 100);
        var point;
        
        if(index == 0)
            point = { x: getRandomNumber(center.x - distance, center.x + distance), y: getRandomNumber(center.y - distance, center.y + distance) };    
        
        else if(index < amountOfPoints / 2)
            point = { x: getRandomNumber(asteroid.array[index - 1].x, asteroid.array[index - 1].x + distance / index), y: getRandomNumber(asteroid.array[index - 1].y, asteroid.array[index - 1].y + distance) };    
            
        else
            point = { x: getRandomNumber(asteroid.array[index - 1].x, asteroid.array[index - 1].x - distance / index * 2), y: getRandomNumber(asteroid.array[index - 1].y, asteroid.array[index - 1].y - distance / index / 2) };
        
        asteroid.array.push(point);
    }
    
    return asteroid;
}

