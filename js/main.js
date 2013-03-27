// This file conatins all variables used with different variations of the game, and some useful functions

// Contains map width, map height, color and toolbar thickness
var m_iMap;
var m_Player;
var m_iAsteroidz;
var m_iDistanceFromMap;
var m_iAsterData = { starting: 10, time: 0, maxTime: 10000 };
var m_iSpeed = { gameOriginal: 33, game: 33 };
var m_iScores = { one: 0, highest: 0, color: "white"};
var m_iMessageAlignment;
var m_CanvasMain;
var m_CanvasBackground;
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
    paintBackground();
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
    m_CanvasMain = document.getElementById("myCanvas").getContext("2d");
    m_CanvasBackground = document.getElementById("background").getContext("2d");
    
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
    
    m_CanvasBackground.canvas.width = m_CanvasMain.canvas.width = m_iMap.width -= floor(m_iMap.width / 75); 
    m_CanvasBackground.canvas.height = m_CanvasMain.canvas.height = m_iMap.height -= floor(m_iMap.height / 36);
}

function clearGameScreen()
{
    m_CanvasMain.clearRect(0, 0, m_iMap.width, m_iMap.height);
}

// Initialize the astroidz array with 10
function initializeAsteroidz()
{
    m_iDistanceFromMap = (m_iMap.width * m_iMap.height) / 5000;
    m_iAsteroidz = new Array();
    
    for(var index = 0; index < m_iAsterData.starting; index++)
        m_iAsteroidz.push(makeAsteroid());
}

// Shows start menu, based on argument.
function showStartMenu(bVisible)
{
    if (bVisible)
    {
        resetGame();
        clearGameScreen();
        document.getElementById("startMenu").style.zIndex = 2;        
    }

    else
    {
        document.getElementById("startMenu").style.zIndex = -2;
    }
}

function paintShip(ship, color)
{    
    m_CanvasMain.beginPath();
    m_CanvasMain.lineWidth = ship.width;
    m_CanvasMain.moveTo(ship.head.x, ship.head.y);
    m_CanvasMain.lineTo(ship.tailRight.x, ship.tailRight.y);
    m_CanvasMain.lineTo(ship.butt.x, ship.butt.y);
    m_CanvasMain.lineTo(ship.tailLeft.x, ship.tailLeft.y);
    m_CanvasMain.lineTo(ship.head.x, ship.head.y);
    m_CanvasMain.strokeStyle = color;
    m_CanvasMain.stroke();
    m_CanvasMain.closePath();
}

// Paint asteroid
function paintAsteroid(asteroid)
{
    m_CanvasMain.beginPath();
    m_CanvasMain.lineWidth = asteroid.width;
    m_CanvasMain.moveTo(asteroid.array[0].x, asteroid.array[0].y);
    
    for(var index = 1; index < asteroid.array.length; index++)
        m_CanvasMain.lineTo(asteroid.array[index].x, asteroid.array[index].y);
    
    m_CanvasMain.lineTo(asteroid.array[0].x, asteroid.array[0].y);
    m_CanvasMain.strokeStyle = asteroid.color;
    m_CanvasMain.stroke();
    m_CanvasMain.closePath();
}

// Paints a rectangle by pixels
function paintTile(startX, startY, width, height, color)
{
    m_CanvasMain.fillStyle = color;
    m_CanvasMain.fillRect(startX, startY, width, height);
}

function paintBackground()
{
    m_CanvasBackground.fillStyle = m_iMap.backgroundColor;
    m_CanvasBackground.fillRect(0, 0, m_iMap.width, m_iMap.height);
    
    m_CanvasBackground.fillStyle = m_iMap.toolbarColor;
    m_CanvasBackground.fillRect(0, 0, m_iMap.width, m_iMap.toolbarThickness);

    for(var index = 0; index < floor((m_iMap.width * m_iMap.height) / 500); index++)
    {
        m_CanvasBackground.fillStyle = getRandomColor(1, 255);
        m_CanvasBackground.fillRect(getRandomNumber(0, m_iMap.width), getRandomNumber(0, m_iMap.height), 1, 1);
    }
}

// Shows pause pause if true, otherwise hides it.
function showPausePic(bVisible)
{
    m_bGameStatus.isPaused = bVisible;
    
    if (bVisible)
        document.getElementById("pause").style.zIndex = 2;

    else
        document.getElementById("pause").style.zIndex = -2;
}

// Writes message to corresponding tile, with specified colour
function writeMessage(startTile, message, color)
{
    m_CanvasMain.font = (m_iMap.toolbarThickness - 10)  + 'pt Calibri';
    m_CanvasMain.fillStyle = color;
    m_CanvasMain.fillText(message, startTile, m_iMap.toolbarThickness - 5);
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
    showPausePic(false);
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
        
        oldVelocity:
        {
            x: 0,
            y: 0
        },
        
        color: "white",
        up: false,
        down: false,
        left: false,
        right: false,
        width: 3,
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

function rotateAsteroid(asteroid)
{
    for(var index = 0; index < asteroid.array.length; index++)
        asteroid.array[index] = rotatePoint(asteroid.array[index].x, asteroid.array[index].y, asteroid.degree, asteroid.center.x, asteroid.center.y);
    
    return asteroid;
}

function setUpShip(ship)
{  
    rotateShip(ship, ship.degree);
    var shipMoveDivider = 10;
    
    // Moving ship
    if(ship.up || ship.down)
    {
        ship.oldVelocity = findShipVelocity(ship);
        ship.oldVelocity.x /= 3;
        ship.oldVelocity.y /= 3;
        
        if(ship.down)
        {
            ship.oldVelocity.x = -ship.oldVelocity.x;
            ship.oldVelocity.y = -ship.oldVelocity.y;
        }
        
        if(ship.oldVelocity.x > 0)
            if((ship.velocity.x += ship.oldVelocity.x / shipMoveDivider) > ship.oldVelocity.x)
                ship.velocity.x = ship.oldVelocity.x;

        if(ship.oldVelocity.x < 0)
            if((ship.velocity.x += ship.oldVelocity.x / shipMoveDivider) < ship.oldVelocity.x)
                ship.velocity.x = ship.oldVelocity.x;

        if(ship.oldVelocity.y > 0)
            if((ship.velocity.y += ship.oldVelocity.y / shipMoveDivider) > ship.oldVelocity.y)
                ship.velocity.y = ship.oldVelocity.y

        if(ship.oldVelocity.y < 0)
            if((ship.velocity.y += ship.oldVelocity.y / shipMoveDivider) < ship.oldVelocity.y)
                ship.velocity.y = ship.oldVelocity.y
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
    paintShip(ship, 2,ship.color);
    
    return ship;
}

function findShipVelocity(ship)
{
    var slope = { x: ship.head.x - ship.butt.x, y: ship.head.y - ship.butt.y };
    
    return slope;
}

function setUpAsteroid(asteroid)
{  
    asteroid = rotateAsteroid(asteroid);
    
    for(var index = 0;index < asteroid.array.length; index++)
    {
        asteroid.array[index].x += asteroid.velocity.x;
        asteroid.array[index].y += asteroid.velocity.y;
    }
    
    asteroid.center.x += asteroid.velocity.x;
    asteroid.center.y += asteroid.velocity.y;
    paintAsteroid(asteroid);
  
    return asteroid;
}

function makeAsteroid()
{
    var position = getRandomNumber(0, 4);
    var degreeDivider = 100;
    var minDegree = 1;
    var maxDegree = 10;
    var m_distanceFromMap = (m_iMap.width * m_iMap.height) / 5000;
    
    var asteroid = 
    {
        array: new Array(),
        velocity: { x: 0, y: 0},
        center: { x: 0, y: 0},
        degree: getRandomNumber(0, 10) > 4 ? -getRandomNumber(minDegree, maxDegree) / degreeDivider : getRandomNumber(minDegree, maxDegree) / degreeDivider, 
        width: 3,
        color: "white"
    };
    
    var amountOfPoints = 6;
    var center;
    var xVerticalVelocity = floor(getRandomNumber(0, 10) >  5 ? getRandomNumber(0, floor(m_iMap.width / 200)) : -getRandomNumber(0, floor(m_iMap.width / 200)));
    var yVerticalVelocity = floor(getRandomNumber(floor(m_iMap.width / 300), floor(m_iMap.width / 200)));
    var xHorizontaVelocity = floor(getRandomNumber(floor(m_iMap.width / 300), floor(m_iMap.width / 200)));
    var yHorizontalVelocity = floor(getRandomNumber(0, 10) >  5 ? getRandomNumber(0, floor(m_iMap.width / 200)) : -getRandomNumber(0, floor(m_iMap.width / 200)));
    
    if(position == 0)   // Spawn above the map
    {    
        center = { x: getRandomNumber(0, m_iMap.width), y: -getRandomNumber(0, m_distanceFromMap) };
        asteroid.velocity.x = xVerticalVelocity;
        asteroid.velocity.y = yVerticalVelocity;
    }
    
    if(position == 1)   // Spawn below the map
    {    
        center = { x: getRandomNumber(0, m_iMap.width), y: getRandomNumber(m_iMap.height, m_iMap.height + m_distanceFromMap) };
        asteroid.velocity.x = xVerticalVelocity;
        asteroid.velocity.y = -yVerticalVelocity;
    }
    
    if(position == 2)   // Spawn left of the map
    {    
        center = { x: -getRandomNumber(0, m_iMap.width + m_distanceFromMap), y: getRandomNumber(0, m_iMap.height) };
        asteroid.velocity.x = xHorizontaVelocity;
        asteroid.velocity.y = yHorizontalVelocity;
    }
    
    if(position == 3)   // Spawn right of the map
    {    
        center = { x: getRandomNumber(m_iMap.width, m_iMap.width + m_distanceFromMap), y: getRandomNumber(0, m_iMap.height) };
        asteroid.velocity.x = -xHorizontaVelocity;
        asteroid.velocity.y = yHorizontalVelocity;
    }

    for(var index = 0; index < amountOfPoints; index++)
    {
        var distance = getRandomNumber(50, 100);
        var point;
        
        if(index == 0)
            point = { x: floor(getRandomNumber(center.x - distance, center.x + distance)), y: floor(getRandomNumber(center.y - distance, center.y + distance)) };    
        
        else if(index < amountOfPoints / 2)
            point = { x: floor(getRandomNumber(asteroid.array[index - 1].x, asteroid.array[index - 1].x + floor(distance / index))), y: floor(getRandomNumber(asteroid.array[index - 1].y, asteroid.array[index - 1].y + distance)) };    
            
        else
            point = { x: floor(getRandomNumber(asteroid.array[index - 1].x, asteroid.array[index - 1].x - floor(distance / index * 2))), y: floor(getRandomNumber(asteroid.array[index - 1].y, asteroid.array[index - 1].y - floor(distance / index / 2))) };
        
        asteroid.array.push(point);
    }
    
    asteroid.center = findCenter(asteroid);
    return asteroid;
}

function findCenter(asteroid)
{
    var centerX = 0;
    var centerY = 0;
    
    for(var index = 0; index < asteroid.array.length; index++)
    {
        centerX += asteroid.array[index].x;
        centerY += asteroid.array[index].y;
    }
    
    centerX = centerX / asteroid.array.length;
    centerY = centerY / asteroid.array.length;
    
    return { x: centerX, y: centerY };
}

function asteroidOutOfBounds(asteroid)
{
    var compensator = 10;
    var maxWidth = m_iMap.width + m_iDistanceFromMap + compensator;
    var minWidth = -(m_iMap.width + m_iDistanceFromMap + compensator);
    var maxHeight = m_iMap.height + m_iDistanceFromMap + compensator;
    var minHeight = -(m_iMap.height + m_iDistanceFromMap + compensator);
    
    for(var index = 0; index < asteroid.array.length; index++)
        if(asteroid.array[index].x >= minWidth && asteroid.array[index].x <= maxWidth  && asteroid.array[index].y >= minHeight && asteroid.array[index].y <= maxHeight)
            return false;
    
    return true;
}
