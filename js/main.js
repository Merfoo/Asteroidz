// This file conatins all variables used with different variations of the game, and some useful functions

// Contains map width, map height, color and toolbar thickness
var m_iMap;
var m_Player;
var m_iStars;
var m_iAsteroidz;   // Has asteroids position info
var m_iLazers;  // Has lazers position info
var m_iLazerVar = { setUpYet: false };
var m_iAsterVar = { starting: 7, time: 0, maxTime: 5000, distFromMap: 250, minDist: 123, count: 10, minSize: 60 };    // Contains variables related to asteroids
var m_iTime = { current: 0, highest: 0, color: "white" };
var m_iSpeed = { gameOriginal: 33, game: 33, stars: 50 };
var m_iScores = { one: 0, highest: 0, color: "white"};
var m_iMessageAlignment;
var m_CanvasMain;
var m_CanvasBackground;
var m_IntervalId = { game: null, stars: null};
var m_bGameStatus = { started: false, paused: false, single: false, lost: false };
var m_iKeyId = { arrowUp: 38, arrowDown: 40, arrowRight: 39, arrowLeft: 37, esc: 27, space: 32, a: 65 };

window.addEventListener('keydown', keyboardEvent, true);
window.addEventListener('keyup', keyboardEvent, true);
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
    m_iAsteroidz = new Array();
    
    for(var index = 0; index < m_iAsterVar.starting; index++)
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
        clearInterval(m_IntervalId.stars);
        m_IntervalId.stars = setInterval("showStars()", m_iSpeed.stars);
    }

    else
    {
        clearInterval(m_IntervalId.stars);
        document.getElementById("startMenu").style.zIndex = -2;
    }
}

function paintObject(array, width, color)
{    
    m_CanvasMain.beginPath();
    m_CanvasMain.lineWidth = width;
    m_CanvasMain.moveTo(array[0].x, array[0].y);
    
    for(var index = 1; index < array.length; index++)
        m_CanvasMain.lineTo(array[index].x, array[index].y);
    
    m_CanvasMain.lineTo(array[0].x, array[0].y);
    m_CanvasMain.strokeStyle = color;
    m_CanvasMain.stroke();
    m_CanvasMain.closePath();
}

// Paints a rectangle by pixels
function paintTileBackground(startX, startY, width, height, color)
{
    m_CanvasBackground.fillStyle = color;
    m_CanvasBackground.fillRect(startX, startY, width, height);
}

function paintBackground()
{
    paintTileBackground(0, 0, m_iMap.width, m_iMap.height, m_iMap.backgroundColor);

    for(var index = 0; index < floor((m_iMap.width * m_iMap.height) / 500); index++)
        paintTileBackground(getRandomNumber(0, m_iMap.width), getRandomNumber(0, m_iMap.height), 1, 1, getRandomColor(1, 255));
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
    m_CanvasMain.font = (m_iMap.toolbarThickness - 5)  + 'pt Calibri';
    m_CanvasMain.fillStyle = color;
    m_CanvasMain.fillText(message, startTile, m_iMap.toolbarThickness - 5);
}

// Resets the status's about the game
function resetGame()
{
    clearInterval(m_IntervalId.game);
    clearInterval(m_IntervalId.stars);
    m_bGameStatus.started = false;
    m_bGameStatus.isPaused = false;
    m_bGameStatus.single = false;
    m_bGameStatus.lost = false;
    m_iScores.one = 0;
    m_iScores.highest = 0;
    m_iAsterVar.count = m_iAsterVar.starting;
    m_Player = resetPlayer(floor(m_iMap.width / 2), floor(m_iMap.height / 2));
    m_iLazers = new Array();
    initializeStars();
    initializeAsteroidz();
    showPausePic(false);
}

function keyboardEvent(event)
{
    if(event.type == "keyup")
        if(event.keyCode == m_iKeyId.esc)
            showStartMenu(true);
    
    if (m_bGameStatus.started)
        if(m_bGameStatus.single)
            keyBoardEventSingle(event);
    
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
    var xTotal = 0;
    var yTotal = 0;
    var sizeMidPoint = 60;
    var widthDivider = 200;
    var size = getRandomNumber(10, 20);
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
                center.x = getRandomNumber(-m_iAsterVar.distFromMap, -m_iAsterVar.distFromMap / 2); 
                asteroid.velocity.x = getRandomNumber(1, floor(m_iMap.width / widthDivider));
            }
            
            else if(position == 3)  // Right
            {
                center.x = getRandomNumber((m_iAsterVar.distFromMap / 2) + m_iMap.width, m_iAsterVar.distFromMap + m_iMap.width);
                asteroid.velocity.x = getRandomNumber(-floor(m_iMap.width / widthDivider), 1);
            }
        }
        
        else if(position == 2 || position == 4) // Spawn above/below map
        {
            center.x = getRandomNumber(0, m_iMap.width);
            asteroid.velocity.x = getRandomNumber(-floor((m_iMap.width / widthDivider) / 2), floor((m_iMap.width / widthDivider) / 2));
            
            if(position == 2)   // Above
            {
                center.y = getRandomNumber(-m_iAsterVar.distFromMap, -m_iAsterVar.distFromMap / 2);
                asteroid.velocity.y = getRandomNumber(1, floor(m_iMap.width / widthDivider));
            }
            
            else if(position == 4)  // Below
            {
                center.y = getRandomNumber((m_iAsterVar.distFromMap / 2) + m_iMap.height, m_iMap.height + m_iAsterVar.distFromMap);
                asteroid.velocity.y = getRandomNumber(-floor(m_iMap.width / widthDivider), 1);
            }
        }
    }
    
    asteroid.coordinates.push(center);
    xTotal += asteroid.coordinates[0].x;
    yTotal += asteroid.coordinates[0].y;
    
    for(var index = 1; index <= amountOfPoints; index++)
    {
        var distance = getRandomNumber(sizeMidPoint - size, sizeMidPoint + size);
        var point;
        
        if(index <= amountOfPoints / 3)
        {    
            point = 
            { 
                x: asteroid.coordinates[index - 1].x + distance, 
                y: getRandomNumber(asteroid.coordinates[index - 1].y - floor(distance / 2), asteroid.coordinates[index - 1].y + floor(distance * (3 / 4))) 
            };    
        }    
            
        else if(index > amountOfPoints / 3 && index <= (amountOfPoints / 3) + (amountOfPoints / 3))
        {        
            point = 
            { 
                x: getRandomNumber(asteroid.coordinates[index - 1].x - floor(distance * (3 / 4)), asteroid.coordinates[index - 1].x + floor(distance / 2)),
                y: asteroid.coordinates[index - 1].y + distance 
            };
         }   
        
        else
        {    
            point = 
            { 
                x: asteroid.coordinates[index - 1].x - distance, 
                y: getRandomNumber(asteroid.coordinates[index - 1].y - floor(distance / 3), asteroid.coordinates[index - 1].y + floor(distance * (2 / 3))) 
            };
        }    
        
        asteroid.coordinates.push(point);
        xTotal += point.x;
        yTotal += point.y;
    }
    
    xTotal /= asteroid.coordinates.length;
    yTotal /= asteroid.coordinates.length;
    asteroid.center = {x: xTotal, y: yTotal};
    asteroid.size = size + sizeMidPoint;  
    
    return asteroid;
}

function makeLazer(ship)
{
    var shipVelocity = findShipVelocity(ship);
    var array = new Array();
    var lineWidth = 2;
    var lineColor = "red";
    var newCenter;
    
    array.push({ x: ship.coordinates[0].x, y: ship.coordinates[0].y });
    array.push({ x: array[0].x + shipVelocity.x, y: array[0].y + shipVelocity.y });
    newCenter = {x: (ship.coordinates[0].x + ship.coordinates[1].x) / 2, y: (array[0].y + array[1].y) / 2};
    
    return { coordinates: array, velocity: { x: shipVelocity.x / 2, y: shipVelocity.y / 2 }, center: newCenter, width: lineWidth, color: lineColor };
}

function setUpLazer(lazer)
{
    moveObject(lazer.coordinates, lazer.center, lazer.velocity.x, lazer.velocity.y);
    paintObject(lazer.coordinates, lazer.width, lazer.color);
}

function pointWithinMap(x, y, bufferX, bufferY)
{
    if((x >= -bufferX && x <= m_iMap.width + bufferX) && (y >= -bufferY && y <= m_iMap.height + bufferY))
        return true;
    
    return false;
}

function arrayInside(arrayOne, arrayTwo, centerTwo)
{
    for(var index = 0; index < arrayOne.length; index++)
        if(pointInside(arrayOne[index], arrayTwo, centerTwo))
            return true;
    
    return false;
}

function pointInside(point, array, center)
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

function initializeStars()
{
    m_iStars = 
    {
        star: new Array,
        initialized: false,
        starting: 50
    };
    
    for(var index = 0; index < m_iStars.starting; index++)
        m_iStars.star.push(makeStar());
}

function makeStar()
{
    var star = 
    {
        x: getRandomNumber(0, m_iMap.width),
        y: getRandomNumber(0, m_iMap.height),
        r: getRandomNumber(floor(m_iMap.width / 333), floor(m_iMap.width / 330)),
        currentStop: .0,
        stopIncrease: getRandomNumber(1, 10) / 250
    };
    
    return star;
}

function showStars()
{
    clearGameScreen();
    
    for(var index = 0; index  < m_iStars.star.length; index++)
    {
        var gradient = m_CanvasMain.createRadialGradient(m_iStars.star[index].x, m_iStars.star[index].y, 1, m_iStars.star[index].x, m_iStars.star[index].y, m_iStars.star[index].r);
        gradient.addColorStop(0, getRandomColor(1, 255));
        gradient.addColorStop(m_iStars.star[index].currentStop, m_iMap.backgroundColor);
        m_CanvasMain.fillStyle = gradient;
        m_CanvasMain.fillRect(m_iStars.star[index].x - m_iStars.star[index].r, m_iStars.star[index].y - m_iStars.star[index].r, m_iStars.star[index].r * 2, m_iStars.star[index].r * 2);

        if((m_iStars.star[index].currentStop += m_iStars.star[index].stopIncrease) >= 1)
        {
            m_iStars.star[index].stopIncrease = -m_iStars.star[index].stopIncrease;
            m_iStars.star[index].currentStop = .99;
        }
        
        if(m_iStars.star[index].currentStop <= 0)
            m_iStars.star[index] = makeStar();   
    }
}