// This file conatins all variables used with different variations of the game, and some useful functions

// Contains map width, map height, color and toolbar thickness
var m_iMap;
var m_Player;
var m_iAsteroidz;
var m_iLazers;
var m_iDistanceFromMap;
var m_iAsterData = { starting: 5, time: 0, maxTime: 5000 };
var m_iSpeed = { gameOriginal: 33, game: 33 };
var m_iScores = { one: 0, highest: 0, color: "white"};
var m_iMessageAlignment;
var m_CanvasMain;
var m_CanvasBackground;
var m_IntervalId = { game: null};
var m_bGameStatus = { started: false, paused: false, single: false };
var m_iKeyId = { arrowUp: 38, arrowDown: 40, arrowRight: 39, arrowLeft: 37, esc: 27, space: 32, a: 65 };

window.addEventListener('keydown', doKeyDown, true);
window.addEventListener('keyup', doKeyUp, true);
document.addEventListener("DOMContentLoaded", initializeGame, false);
document.documentElement.style.overflowX = 'hidden';	 // Horizontal scrollbar will be hidden
document.documentElement.style.overflowY = 'hidden';     // Vertical scrollbar will be hidden

// Initialize canvas
function initializeGame()
{
    alert("Hi Grady! Its me, Merfoo!!!");
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
        toolbarThickness: floor(window.innerHeight / 25),
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
    m_iDistanceFromMap = 250;
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

function paintObject(array, width, color)
{    
    m_CanvasMain.beginPath();
    m_CanvasMain.lineWidth = width;
    m_CanvasMain.moveTo(array[0].x, array[0].y);
    
    for(var index = 0; index < array.length; index++)
        m_CanvasMain.lineTo(array[index].x, array[index].y);
    
    m_CanvasMain.lineTo(array[0].x, array[0].y);
    m_CanvasMain.strokeStyle = color;
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
    m_iLazers = new Array();
    initializeAsteroidz();
    showPausePic(false);
}

// Handles the key down
function doKeyDown(event) 
{
    if (m_bGameStatus.started && !m_bGameStatus.isPaused)
        if(m_bGameStatus.single)
            keyBoardDownSingle(event);
    
    if(event.keyCode == m_iKeyId.space || event.keyCode == m_iKeyId.arrowUp || event.keyCode == m_iKeyId.arrowDown)
    {
        event.preventDefault();
        return false;
    }
}

// Handles key up events
function doKeyUp(event)
{
    if(event.keyCode == m_iKeyId.esc)
        showStartMenu(true);
        
    else if (m_bGameStatus.started)
        if(m_bGameStatus.single)
            keyBoardUpSingle(event);
    
    if(event.keyCode == m_iKeyId.space || event.keyCode == m_iKeyId.arrowUp || event.keyCode == m_iKeyId.arrowDown)
    {
        event.preventDefault();
        return false;
    }
}

function resetPlayer(centerX, centerY)
{
    var middleWidth = centerX;
    var middleHeight = centerY;
    var shipWidth = floor(m_iMap.width / 125);
    var shipHeight = floor(m_iMap.height / 13);
    var buttDistance = floor(shipHeight - floor(shipHeight / 6));
    
    var player =
    {        
        center:
        {
            x: middleWidth,
            y: middleHeight + buttDistance
        }, 
        
        velocity:
        {
            x: 0,
            y: 0
        }, 
        
        wantedVelocity:
        {
            x: 0,
            y: 0
        },
        
        spedUpYet: 
        {
            x: false,
            y: false
        },
           
        coordinates: new Array(),
        color: "white",
        up: false,
        down: false,
        left: false,
        right: false,
        width: 2,
        degree: 0,
        wantedDegree: .125
    };
    
    player.coordinates.push({ x: player.center.x, y: player.center.y - buttDistance }); // Head
    player.coordinates.push({ x: player.center.x + shipWidth, y: player.center.y + shipHeight - buttDistance }); // Tail right
    player.coordinates.push(player.center); // Butt
    player.coordinates.push({ x: player.center.x - shipWidth, y: player.center.y + shipHeight - buttDistance });    // Tail left
    
    return player;
}

function rotateObject(array, center, angle)
{    
    for(var index = 0; index < array.length; index++)
        array[index] = rotatePoint(array[index].x, array[index].y, angle, center.x, center.y);
}

function setUpShip(ship)
{  
    rotateObject(ship.coordinates, ship.center, ship.degree);
    var shipMoveDividerAccel = 10;
    var shipMoveDividerDeccel = 50;
    
    // Moving ship
    if(ship.up || ship.down)
    {
        ship.wantedVelocity = findShipVelocity(ship);
        ship.wantedVelocity.x /= 3;
        ship.wantedVelocity.y /= 3;
        
        if(ship.down)
        {
            ship.wantedVelocity.x = -ship.wantedVelocity.x;
            ship.wantedVelocity.y = -ship.wantedVelocity.y;
        }
        
        if(!ship.spedUpYet.x)
        {
            if(ship.wantedVelocity.x > 0)
                if((ship.velocity.x += ship.wantedVelocity.x / shipMoveDividerAccel) > ship.wantedVelocity.x)
                    ship.spedUpYet.x = true;

            if(ship.wantedVelocity.x < 0)
                if((ship.velocity.x += ship.wantedVelocity.x / shipMoveDividerAccel) < ship.wantedVelocity.x)
                    ship.spedUpYet.x = true;
        } 

        if(!ship.spedUpYet.y)
        {   
            if(ship.wantedVelocity.y > 0)
                if((ship.velocity.y += ship.wantedVelocity.y / shipMoveDividerAccel) > ship.wantedVelocity.y)
                    ship.spedUpYet.y = true;

            if(ship.wantedVelocity.y < 0)
                if((ship.velocity.y += ship.wantedVelocity.y / shipMoveDividerAccel) < ship.wantedVelocity.y)
                    ship.spedUpYet.y = true;
        }
        
        if(ship.spedUpYet.x)
            ship.velocity.x = ship.wantedVelocity.x;
        
        if(ship.spedUpYet.y)
            ship.velocity.y = ship.wantedVelocity.y;
    }
    
    if(!ship.up && !ship.down)
    {
        ship.spedUpYet.x = false;
        ship.spedUpYet.y = false;
        ship.wantedVelocity.x = abs(ship.wantedVelocity.x);
        ship.wantedVelocity.y = abs(ship.wantedVelocity.y);
        
        if(ship.velocity.x > 0)
            if((ship.velocity.x -= (ship.wantedVelocity.x / (shipMoveDividerDeccel))) < 0)
                ship.velocity.x = 0;
        
        if(ship.velocity.x < 0)
            if((ship.velocity.x += (ship.wantedVelocity.x / (shipMoveDividerDeccel))) > 0)
                ship.velocity.x = 0;
        
        if(ship.velocity.y > 0)
            if((ship.velocity.y -= (ship.wantedVelocity.y / (shipMoveDividerDeccel))) < 0)
                ship.velocity.y = 0;
        
        if(ship.velocity.y < 0)
            if((ship.velocity.y += (ship.wantedVelocity.y / (shipMoveDividerDeccel))) > 0)
                ship.velocity.y = 0;
    }
    
    if(ship.left || ship.right)
    {
        ship.degree = ship.wantedDegree;
        
        if(ship.left)
            ship.degree = -ship.degree;
    }
    
    if(!ship.left && !ship.right)
        ship.degree = 0;
    
    moveObject(ship.coordinates, ship.center, ship.velocity.x, ship.velocity.y);
    
    // Putting the ship on the other side if its out of bounds
    if(ship.center.x < 0)
        moveObject(ship.coordinates, ship.center, m_iMap.width, 0);
        
    if(ship.center.x > m_iMap.width)
        moveObject(ship.coordinates, ship.center, -m_iMap.width, 0);
    
    if(ship.center.y < 0)
        moveObject(ship.coordinates, ship.center, 0, m_iMap.height);
        
    if(ship.center.y > m_iMap.height)
        moveObject(ship.coordinates, ship.center, 0, -m_iMap.height);
    
    // Paint ship
    paintObject(ship.coordinates, ship.width, ship.color);
    
    return ship;
}

function moveObject(array, center, x, y)
{
    for(var index = 0; index < array.length; index++)
    {
        array[index].x += x;
        array[index].y += y;
    }
    
    center.x += x;
    center.y += y;
}

function findShipVelocity(ship)
{
    var velocity = { x: ship.coordinates[0].x - ship.center.x, y: ship.coordinates[0].y - ship.center.y };
    
    return velocity;
}

function setUpAsteroid(asteroid)
{  
    rotateObject(asteroid.coordinates, asteroid.center, asteroid.degree);
    moveObject(asteroid.coordinates, asteroid.center, asteroid.velocity.x, asteroid.velocity.y);
    paintObject(asteroid.coordinates, asteroid.width, asteroid.color);
  
    return asteroid;
}

function makeAsteroid(newCenter, newSizeMidPoint)
{
    var sizeMidPoint = 60;
    var widthDivider = 200;
    var size = getRandomNumber(10, 40);
    var degreeDivider = 1000;   
    var maxDegree = 100;    // Maximum rotation angle the asteroid
    var amountOfPoints = 6;
    var center = { x: 0, y: 0 };
    
    var asteroid = 
    {
        coordinates: new Array(),
        velocity: { x: 0, y: 0},
        center: { x: 0, y: 0},
        degree: getRandomNumber(-maxDegree, maxDegree) / degreeDivider, 
        width: 3,
        size: 0,
        color: "white"
    };
   
    if(newCenter != null && newSizeMidPoint != null) // If true, spawn inside the map
    {
        var xDir = getRandomNumber(0, 10) > 5 ? -1 : 1;
        var yDir = getRandomNumber(0, 10) > 5 ? -1 : 1;
        asteroid.velocity.x = xDir * getRandomNumber(1, floor(m_iMap.width / widthDivider));
        asteroid.velocity.y = yDir * getRandomNumber(1, floor(m_iMap.width / widthDivider));
        center = newCenter;
        sizeMidPoint = newSizeMidPoint;
    }
    
    else    // Else, spawn outside the map
    {   
        var position = getRandomNumber(1, 4);
        
        if(position == 1 || position == 3) // Spawn left/right of the map
        {
            center.y = getRandomNumber(0, m_iMap.height);
            asteroid.velocity.y = getRandomNumber(-floor((m_iMap.width / widthDivider) / 2), floor((m_iMap.width / widthDivider) / 2));
            
            if(position == 1)   // Left
            {
                center.x = getRandomNumber(-m_iDistanceFromMap, -m_iDistanceFromMap / 2); 
                asteroid.velocity.x = getRandomNumber(1, floor(m_iMap.width / widthDivider));
            }
            
            else if(position == 3)  // Right
            {
                center.x = getRandomNumber((m_iDistanceFromMap / 2) + m_iMap.width, m_iDistanceFromMap + m_iMap.width);
                asteroid.velocity.x = getRandomNumber(-floor(m_iMap.width / widthDivider), 1);
            }
        }
        
        else if(position == 2 || position == 4) // Spawn above/below map
        {
            center.x = getRandomNumber(0, m_iMap.width);
            asteroid.velocity.x = getRandomNumber(-floor((m_iMap.width / widthDivider) / 2), floor((m_iMap.width / widthDivider) / 2));
            
            if(position == 2)   // Above
            {
                center.y = getRandomNumber(-m_iDistanceFromMap, -m_iDistanceFromMap / 2);
                asteroid.velocity.y = getRandomNumber(1, floor(m_iMap.width / widthDivider));
            }
            
            else if(position == 4)  // Below
            {
                center.y = getRandomNumber((m_iDistanceFromMap / 2) + m_iMap.height, m_iMap.height + m_iDistanceFromMap);
                asteroid.velocity.y = getRandomNumber(-floor(m_iMap.width / widthDivider), 1);
            }
        }
    }
    
    asteroid.coordinates.push(center);

    for(var index = 1; index < amountOfPoints; index++)
    {
        var distance = getRandomNumber(sizeMidPoint - size, sizeMidPoint + size);
        var point;
        
        if(index <= amountOfPoints / 3)
            point = 
            { 
                x: asteroid.coordinates[index - 1].x + distance, 
                y: getRandomNumber(asteroid.coordinates[index - 1].y - floor(distance / 2), asteroid.coordinates[index - 1].y + floor(distance * (3 / 4))) 
            };    
            
        else if(index > amountOfPoints / 3 && index <= (amountOfPoints / 3) + (amountOfPoints / 3))
            point = 
            { 
                x: getRandomNumber(asteroid.coordinates[index - 1].x - floor(distance * (3 / 4)), asteroid.coordinates[index - 1].x + floor(distance / 2)),
                y: asteroid.coordinates[index - 1].y + distance 
            };
        
        else
            point = 
            { 
                x: asteroid.coordinates[index - 1].x - distance, 
                y: getRandomNumber(asteroid.coordinates[index - 1].y - floor(distance / 2), asteroid.coordinates[index - 1].y + floor(distance * (3 / 4))) 
            };
        
        asteroid.coordinates.push(point);
    }
    
    asteroid.center = findCenter(asteroid.coordinates);
    asteroid.size = size;
    var centerDiffX = center.x - asteroid.center.x; 
    var centerDiffY = center.y - asteroid.center.y; 
    asteroid.center.x += centerDiffX;
    asteroid.center.y += centerDiffY;
    
    for(var index = 0; index < asteroid.coordinates.length; index++)
    {
        asteroid.coordinates[index].x += centerDiffX;
        asteroid.coordinates[index].y += centerDiffY;
    }    
    
    return asteroid;
}

function findCenter(array)
{
    var centerX = 0;
    var centerY = 0;
    
    for(var index = 0; index < array.length; index++)
    {
        centerX += array[index].x;
        centerY += array[index].y;
    }
    
    centerX /= array.length;
    centerY /= array.length;
    
    return { x: centerX, y: centerY };
}

function makeLazer(ship)
{
    var shipVelocity = findShipVelocity(ship);
    var array = new Array();
    var lineWidth = 2;
    var lineColor = "red";
    var newCenter = findCenter(array);
    
    array.push({ x: ship.coordinates[0].x, y: ship.coordinates[0].y });
    array.push({ x: array[0].x + shipVelocity.x, y: array[0].y + shipVelocity.y });
    
    return { coordinates: array, velocity: { x: shipVelocity.x / 2, y: shipVelocity.y / 2 }, center: newCenter, width: lineWidth, color: lineColor };
}

function setUpLazer(lazer)
{
    moveObject(lazer.coordinates, lazer.center, lazer.velocity.x, lazer.velocity.y);
    paintObject(lazer.coordinates, lazer.width, lazer.color);
}

function isOutOfBounds(array)
{
    for(var index = 0; index < array.length; index++)
        if(pointWithinMap(array[index].x, array[index].y, m_iDistanceFromMap, m_iDistanceFromMap))
            return false;
    
    return true;
}

function pointWithinMap(x, y, bufferX, bufferY)
{
    if((x >= -bufferX && x <= m_iMap.width + bufferX) && (y >= -bufferY && y <= m_iMap.height + bufferY))
        return true;
    
    return false;
}

function insideEachOther(arrayOne, arrayTwo, centerOne, centerTwo)
{
    for(var index = 0; index < arrayOne.length; index++)
        if(insideObject(arrayOne[index], arrayTwo, centerTwo))
            return true;
    
    // If you uncomment this, the collision for the ship will be true all the time
    // and the shooting a lot of lazers will cause the game to lag, like really bad.
    // Not sure why ... I know it loops a lot, but still
//    for(var index = 0; index < arrayTwo.length; index++)
//        if(insideObject(arrayTwo[index], arrayOne, centerOne))
//            return true;
    
    return false;
}

function insideObject(point, array, center)
{
    var howManyTrue = 0;
    var sideEq;
    var pointEq = getEquation(point, center);
    var pointDir = getPointDirection(point, center);
    var interPoint;
    var interDir;
    
    for(var index = 0, indexAhead = 1; index < array.length; index++)
    {
        indexAhead = (index + 1) % array.length;
        sideEq = getEquation(array[index], array[indexAhead]);
        interPoint = findIntersectPoint(pointEq, sideEq);
        interDir = getPointDirection(point, interPoint);
        
        if(pointDir.x == interDir.x && pointDir.y == interDir.y)
            if(withinTwoPoints(array[index], array[indexAhead], interPoint))
                howManyTrue++;
    }
    
    if(howManyTrue % 2 == 0)
        return false;
    
    return true;
}