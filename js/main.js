// This file conatins all variables used with different variations of the game

var m_iMap;
var m_Player;
var m_iStars;
var m_iAsteroidz;
var m_iLazers;
var m_iFontSize;
var m_iTextAlign;
var m_bGameStatus;
var m_iScores;
var m_iMouse = { wheelDelta: 0, divider: 16, min: 0, max: 0 };
var m_Canvas = { main: null, glowingStars: null, stars: null };
var m_Music = { background: null, lazer: null, mute: false, lazerSrc: null, backgroundSrc: null };
var m_IntervalId = { game: null, glowingStars: null, scores: null };
var m_iTime = { current: 0, color: "white", multiplyer: 10 };
var m_iSpeed = { game: 33, glowingStars: 100, scores: 50 };
var m_iKeyId = { arrowUp: 38, arrowDown: 40, arrowRight: 39, arrowLeft: 37, esc: 27, space: 32, a: 65, m: 77, enter: 13 };

window.addEventListener("keydown", keyboardEvent, true);
window.addEventListener("keyup", keyboardEvent, true);
window.addEventListener("mousewheel", mouseScrollEvent, true);
document.addEventListener("DOMContentLoaded", initializeGame, false);
document.documentElement.style.overflowX = "hidden";	 // Horizontal scrollbar will be hidden
document.documentElement.style.overflowY = "hidden";     // Vertical scrollbar will be hidden

// Initialize canvas
function initializeGame()
{
    initializeMusic();
    initializeCanvas();
    initializeScores();
    initializeStars();
    paintStars();
    showStartMenu(true);

    $("input[type='text']").keypress
    (
        function (event) {
            if (this.value.length > m_iScores.maxNameLength)
                event.preventDefault();
        }
    );

    m_IntervalId.glowingStars = setInterval("paintGlowingStars();", m_iSpeed.glowingStars);
}

// Starts game
function startGame(iGameVersion)
{
    if (iGameVersion == 0)
        initializeSingle();
}

// Sets the canvas as big as the broswer size
function initializeCanvas() 
{
    m_Canvas.main = document.getElementById("myCanvas").getContext("2d");
    m_Canvas.glowingStars = document.getElementById("glowingStars").getContext("2d");
    m_Canvas.stars = document.getElementById("stars").getContext("2d");

    m_iMap =
    {
        height: window.innerHeight,
        width: window.innerWidth,
        backgroundColor: "black"
    };

    m_iTextAlign =
    {
        left: floor(m_iMap.width / 200),
        center: floor(m_iMap.width / 3),
        right: floor((m_iMap.width / 2) + (m_iMap.width / 2) / 4 * 3),
        top: floor(m_iMap.height / 30),
        middle: floor(m_iMap.height / 3),
        bottom: floor((m_iMap.height / 2) + (m_iMap.height / 2) / 4 * 3)
    };

    m_iFontSize =
    {
        big: floor(m_iMap.height / 10),
        medium: floor(m_iMap.height / 33),
        small: floor(m_iMap.height / 50)
    };

    m_Canvas.glowingStars.canvas.width = m_Canvas.stars.canvas.width = m_Canvas.main.canvas.width = m_iMap.width -= floor(m_iMap.width / 75);
    m_Canvas.glowingStars.canvas.height = m_Canvas.stars.canvas.height = m_Canvas.main.canvas.height = m_iMap.height -= floor(m_iMap.height / 36);
}

// Clears the whole screen, or specified 
function clearGameScreen(x, y, width, height)
{
    if (height == undefined)
        m_Canvas.main.clearRect(0, 0, m_iMap.width, m_iMap.height);

    else
        m_Canvas.main.clearRect(x, y, width, height);
}

// Initialize the astroidz array
function initializeAsteroidz()
{
    m_iAsteroidz =
    {
        asteroids: new Array(),     // Array containing each asteroid object
        starting: 7,                // Starting amount of asteroids
        time: 0,                    // Time since last asteroid spawning           
        widthDivider: 200,          // Used for determining asteroid size based map size
        maxTime: 2500,              // Spawn rate for spawning each asteroid
        distFromMap: 250,           // Starting distance from the map when each asteroid is created
        minDist: 250,               // Minimum distance from map 
        count: 7,                   // Amount of asteroids on the map
        minSize: 60,                // Minimum size of asteroid for it to be able to spawn more
        pointPer: 75                // Points each asteroid is worth
    };

    for (var index = 0; index < m_iAsteroidz.starting; index++)
        m_iAsteroidz.asteroids.push(makeOutOfBoundsAsteroid());
}

// Initialize Lazer object
function initializeLazers() 
{
    m_iLazers =
    {
        lazers: new Array(),    // Stores all lazer objects
        setUpYet: false,        // Whether all the lazers have been set up
        minWait: 333            // Minimum time in between each lazer shot
    };
}

// Shows start menu, based on argument.
function showStartMenu(bVisible) 
{
    setFocus("usernameTextBox", false);
    resetGame();

    if (bVisible)
    {
        document.getElementById("startMenu").style.zIndex = 2;
        document.getElementById("scoresMenu").style.zIndex = -2;
    }

    else 
    {
        document.getElementById("startMenu").style.zIndex = -2;
        document.getElementById("scoresMenu").style.zIndex = -2;
    }
}

// Paints coordinates in array
function paintObject(array, width, color) 
{
    m_Canvas.main.beginPath();
    m_Canvas.main.lineWidth = width;
    m_Canvas.main.moveTo(array[0].x, array[0].y);

    for (var index = 1; index < array.length; index++)
        m_Canvas.main.lineTo(array[index].x, array[index].y);

    m_Canvas.main.lineTo(array[0].x, array[0].y);
    m_Canvas.main.strokeStyle = color;
    m_Canvas.main.stroke();
    m_Canvas.main.closePath();
}

// Paints a rectangle by pixels
function paintTileBackground(startX, startY, width, height, color) 
{
    m_Canvas.stars.fillStyle = color;
    m_Canvas.stars.fillRect(startX, startY, width, height);
}

// Paints the background stars
function paintStars() 
{
    paintTileBackground(0, 0, m_iMap.width, m_iMap.height, m_iMap.backgroundColor);

    for (var index = 0; index < floor((m_iMap.width * m_iMap.height) / 500) ; index++)
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
function writeMessage(x, y, font, message, color) 
{
    m_Canvas.main.font = font + 'pt Georgia';
    m_Canvas.main.fillStyle = color;
    m_Canvas.main.fillText(message, x, y);
}

// Resets the status's about the game
function resetGame() 
{
    pauseBackgroundMusic();
    clearGameScreen();
    clearAllIntervals();
    initializeAsteroidz();
    initializeLazers();
    initializeGameStatus();
    m_iScores.one = 0;
    m_iTime.current = 0;
    showPausePic(false);
    showEndGameSingle(false);
}

// Clears all intervals()
function clearAllIntervals() 
{
    clearInterval(m_IntervalId.game);
    clearInterval(m_IntervalId.scores);
}

// Initializes game status
function initializeGameStatus() 
{
    m_bGameStatus =
    {
        started: false,
        isPaused: false,
        single: false,
        lost: false,
        showingScores: false
    };
}

// Initializes the scores array
function initializeScores() 
{
    m_iScores =
    {
        one: 0,
        list: new Array(),
        color: "white",
        distFromEach: floor(m_iMap.height / 10),
        name: "",
        count: 1,
        maxNameLength: 20,  // Maximum amount of characters in the username

        orderList: function (bHighFirst) 
        {
            var temp;

            for (var loop = 0; loop < this.list.length; loop++) 
            {
                for (var index = 0; index < this.list.length - 1; index++) 
                {
                    if ((bHighFirst && this.list[index].score < this.list[index + 1].score) || (!bHighFirst && this.list[index].score > this.list[index + 1].score))
                    {
                        temp = this.list[index];
                        this.list[index] = this.list[index + 1];
                        this.list[index + 1] = temp;
                    }
                }
            }
        }
    };
}

// Sets up the correct music format
function initializeMusic() 
{
    var sDir = "music/";
    m_Music.backgroundSrc = sDir + "background.mp3";

    // Sets up music
    if (!!(document.createElement('audio').canPlayType && document.createElement('audio').canPlayType('audio/mpeg;').replace(/no/, '')))
        m_Music.lazerSrc = sDir + "lazer.mp3";

    else
        m_Music.lazerSrc = sDir + "lazer.ogg";

    m_Music.background = new Audio(m_Music.backgroundSrc);
    m_Music.lazer = new Audio(m_Music.lazerSrc);
}

// Plays lazer sound, only when not muted
function playLazer()
{
    if (!m_Music.mute) 
    {
        m_Music.lazer.play();
        m_Music.lazer.src = m_Music.lazer.src;
    }
}

// Plays background music, only when not muted
function playBackgroundMusic()
{
    if (!m_Music.mute)
    {
        if (m_Music.background.ended)
            m_Music.background.src = m_Music.background.src;

        m_Music.background.play();
    }

    else
        m_Music.background.pause();
}

// Pauses background music
function pauseBackgroundMusic() 
{
    m_Music.background.pause();
}

// Handles keyboard events
function keyboardEvent(event) 
{
    if (event.type == "keyup")
        if (event.keyCode == m_iKeyId.m)
            m_Music.mute = !m_Music.mute;

    if (m_bGameStatus.started)
        if (m_bGameStatus.single)
            keyBoardEventSingle(event);

    if (m_bGameStatus.showingScores)
        showStartMenu(true);

    if (event.keyCode == m_iKeyId.space || event.keyCode == m_iKeyId.arrowUp || event.keyCode == m_iKeyId.arrowDown || event.keyCode == m_iKeyId.arrowLeft || event.keyCode == m_iKeyId.arrowRight) 
    {
        event.preventDefault();
        return false;
    }
}

// Handles mousescroll events
function mouseScrollEvent(event) 
{
    var addValue = floor(event.wheelDelta / m_iMouse.divider);

    if (m_bGameStatus.showingScores) 
        if ((m_iScores.list[m_iScores.list.length - 1].y > m_iMap.height && addValue < 0) || (m_iMouse.wheelDelta < m_iMouse.min && addValue > 0))
            m_iMouse.wheelDelta += addValue;
}

// Resets ship
function resetShip(centerX, centerY) 
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
        shootingLazer: false,
        lazerTime: 0,
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

// Rotates all coordinates in an array
function rotateObject(array, center, angle) 
{
    for (var index = 0; index < array.length; index++)
        array[index] = rotatePoint(array[index].x, array[index].y, angle, center.x, center.y);
}

// Updates the ships locations, status
function setUpShip(ship) 
{
    rotateObject(ship.coordinates, ship.center, ship.degree);
    var shipMoveDividerAccel = 10;
    var shipMoveDividerDeccel = 50;

    // Moving ship
    if (ship.up || ship.down) 
    {
        ship.wantedVelocity = findShipVelocity(ship);
        ship.wantedVelocity.x /= 3;
        ship.wantedVelocity.y /= 3;

        if (ship.down) 
        {
            ship.wantedVelocity.x = -ship.wantedVelocity.x;
            ship.wantedVelocity.y = -ship.wantedVelocity.y;
        }

        if (!ship.spedUpYet.x) 
        {
            if (ship.wantedVelocity.x > 0)
                if ((ship.velocity.x += ship.wantedVelocity.x / shipMoveDividerAccel) > ship.wantedVelocity.x)
                    ship.spedUpYet.x = true;

            if (ship.wantedVelocity.x < 0)
                if ((ship.velocity.x += ship.wantedVelocity.x / shipMoveDividerAccel) < ship.wantedVelocity.x)
                    ship.spedUpYet.x = true;
        }

        if (!ship.spedUpYet.y) 
        {
            if (ship.wantedVelocity.y > 0)
                if ((ship.velocity.y += ship.wantedVelocity.y / shipMoveDividerAccel) > ship.wantedVelocity.y)
                    ship.spedUpYet.y = true;

            if (ship.wantedVelocity.y < 0)
                if ((ship.velocity.y += ship.wantedVelocity.y / shipMoveDividerAccel) < ship.wantedVelocity.y)
                    ship.spedUpYet.y = true;
        }

        if (ship.spedUpYet.x)
            ship.velocity.x = ship.wantedVelocity.x;

        if (ship.spedUpYet.y)
            ship.velocity.y = ship.wantedVelocity.y;
    }

    if (!ship.up && !ship.down)
    {
        ship.spedUpYet.x = false;
        ship.spedUpYet.y = false;
        ship.wantedVelocity.x = abs(ship.wantedVelocity.x);
        ship.wantedVelocity.y = abs(ship.wantedVelocity.y);

        if (ship.velocity.x > 0)
            if ((ship.velocity.x -= (ship.wantedVelocity.x / (shipMoveDividerDeccel))) < 0)
                ship.velocity.x = 0;

        if (ship.velocity.x < 0)
            if ((ship.velocity.x += (ship.wantedVelocity.x / (shipMoveDividerDeccel))) > 0)
                ship.velocity.x = 0;

        if (ship.velocity.y > 0)
            if ((ship.velocity.y -= (ship.wantedVelocity.y / (shipMoveDividerDeccel))) < 0)
                ship.velocity.y = 0;

        if (ship.velocity.y < 0)
            if ((ship.velocity.y += (ship.wantedVelocity.y / (shipMoveDividerDeccel))) > 0)
                ship.velocity.y = 0;
    }

    if (ship.left || ship.right) {
        ship.degree = ship.wantedDegree;

        if (ship.left)
            ship.degree = -ship.degree;
    }

    if (!ship.left && !ship.right)
        ship.degree = 0;

    moveObject(ship.coordinates, ship.center, ship.velocity.x, ship.velocity.y);

    // Putting the ship on the other side if its out of bounds
    if (ship.center.x < 0)
        moveObject(ship.coordinates, ship.center, m_iMap.width, 0);

    if (ship.center.x > m_iMap.width)
        moveObject(ship.coordinates, ship.center, -m_iMap.width, 0);

    if (ship.center.y < 0)
        moveObject(ship.coordinates, ship.center, 0, m_iMap.height);

    if (ship.center.y > m_iMap.height)
        moveObject(ship.coordinates, ship.center, 0, -m_iMap.height);

    // Paint ship
    paintObject(ship.coordinates, ship.width, ship.color);

    return ship;
}

// Moves all coordinates in an array
function moveObject(array, center, x, y)
{
    for (var index = 0; index < array.length; index++) {
        array[index].x += x;
        array[index].y += y;
    }

    center.x += x;
    center.y += y;
}

// Finds the ships direction/velocity/slope
function findShipVelocity(ship)
{
    var velocity = { x: ship.coordinates[0].x - ship.center.x, y: ship.coordinates[0].y - ship.center.y };

    return velocity;
}

// Updates the asteroid
function setUpAsteroid(asteroid)
{
    rotateObject(asteroid.coordinates, asteroid.center, asteroid.degree);
    moveObject(asteroid.coordinates, asteroid.center, asteroid.velocity.x, asteroid.velocity.y);
    paintObject(asteroid.coordinates, asteroid.width, asteroid.color);

    return asteroid;
}

// Makes new asteroid outside the map randomly
function makeOutOfBoundsAsteroid() 
{
    var sideLength = 60;
    var position = getRandomNumber(1, 4);
    var asteroid =
    {
        velocity: { x: 0, y: 0 },
        center: { x: 0, y: 0 }
    };

    if (position == 1 || position == 3) // Spawn left/right of the map
    {
        asteroid.center.y = getRandomNumber(0, m_iMap.height);
        asteroid.velocity.y = getRandomNumber(-floor((m_iMap.width / m_iAsteroidz.widthDivider) / 2), floor((m_iMap.width / m_iAsteroidz.widthDivider) / 2));

        if (position == 1)   // Left
        {
            asteroid.center.x = getRandomNumber(-m_iAsteroidz.distFromMap, -m_iAsteroidz.distFromMap / 2);
            asteroid.velocity.x = getRandomNumber(1, floor(m_iMap.width / m_iAsteroidz.widthDivider));
        }

        else if (position == 3)  // Right
        {
            asteroid.center.x = getRandomNumber((m_iAsteroidz.distFromMap / 2) + m_iMap.width, m_iAsteroidz.distFromMap + m_iMap.width);
            asteroid.velocity.x = getRandomNumber(-floor(m_iMap.width / m_iAsteroidz.widthDivider), 1);
        }
    }

    else if (position == 2 || position == 4) // Spawn above/below map
    {
        asteroid.center.x = getRandomNumber(0, m_iMap.width);
        asteroid.velocity.x = getRandomNumber(-floor((m_iMap.width / m_iAsteroidz.widthDivider) / 2), floor((m_iMap.width / m_iAsteroidz.widthDivider) / 2));

        if (position == 2)   // Above
        {
            asteroid.center.y = getRandomNumber(-m_iAsteroidz.distFromMap, -m_iAsteroidz.distFromMap / 2);
            asteroid.velocity.y = getRandomNumber(1, floor(m_iMap.width / m_iAsteroidz.widthDivider));
        }

        else if (position == 4)  // Below
        {
            asteroid.center.y = getRandomNumber((m_iAsteroidz.distFromMap / 2) + m_iMap.height, m_iMap.height + m_iAsteroidz.distFromMap);
            asteroid.velocity.y = getRandomNumber(-floor(m_iMap.width / m_iAsteroidz.widthDivider), 1);
        }
    }

    return makeAsteroid(asteroid.center, asteroid.velocity, sideLength, false);
}

// Makes asteroid based on location arguments passed in
function makeAsteroid(center, velocity, sideLength, broken)
{
    var amountOfPoints = 6;
    var xTotal = 0;
    var yTotal = 0;
    var lengthSize = sideLength;
    var lengthCompensator = getRandomNumber(10, 20);
    var maxDegree = 100;    // Maximum rotation angle the asteroid

    var asteroid =
    {
        coordinates: new Array(),
        velocity: { x: velocity.x, y: velocity.y },
        center: { x: 0, y: 0 },
        degree: getRandomNumber(-maxDegree, maxDegree) / 1000,
        width: 3,
        size: lengthCompensator + lengthSize,
        broken: broken,
        color: "white"
    };

    asteroid.coordinates.push({ x: center.x, y: center.y });
    xTotal += asteroid.coordinates[0].x;
    yTotal += asteroid.coordinates[0].y;

    for (var index = 1; index <= amountOfPoints; index++) 
    {
        var distance = getRandomNumber(lengthSize - lengthCompensator, lengthSize + lengthCompensator);
        var point;

        if (index <= amountOfPoints / 3)
        {
            point =
            {
                x: asteroid.coordinates[index - 1].x + distance,
                y: getRandomNumber(asteroid.coordinates[index - 1].y - floor(distance / 2), asteroid.coordinates[index - 1].y + floor(distance * (3 / 4)))
            };
        }

        else if (index > amountOfPoints / 3 && index <= (amountOfPoints / 3) + (amountOfPoints / 3))
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

    asteroid.center.x = xTotal / asteroid.coordinates.length;
    asteroid.center.y = yTotal / asteroid.coordinates.length;

    return asteroid;
}

// Makes new lazer based on ships direction
function makeLazer(ship) 
{
    var shipVelocity = findShipVelocity(ship);
    var array = new Array();
    var lineWidth = 2;
    var lineColor = "red";
    var newCenter;

    array.push({ x: ship.coordinates[0].x, y: ship.coordinates[0].y });
    array.push({ x: array[0].x + shipVelocity.x, y: array[0].y + shipVelocity.y });
    newCenter = { x: (ship.coordinates[0].x + ship.coordinates[1].x) / 2, y: (array[0].y + array[1].y) / 2 };

    return { coordinates: array, velocity: { x: shipVelocity.x / 2, y: shipVelocity.y / 2 }, center: newCenter, width: lineWidth, color: lineColor };
}

// Updates the lazers location
function setUpLazer(lazer) 
{
    moveObject(lazer.coordinates, lazer.center, lazer.velocity.x, lazer.velocity.y);
    paintObject(lazer.coordinates, lazer.width, lazer.color);
}

// Checks if the point is inside the map
function pointWithinMap(x, y, bufferX, bufferY) 
{
    if ((x >= -bufferX && x <= m_iMap.width + bufferX) && (y >= -bufferY && y <= m_iMap.height + bufferY))
        return true;

    return false;
}

// Checks if all coordinates are inside an object
function arrayInside(arrayOne, arrayTwo, centerTwo)
{
    for (var index = 0; index < arrayOne.length; index++)
        if (pointInside(arrayOne[index], arrayTwo, centerTwo))
            return true;

    return false;
}

// Checks if a point is within an object
function pointInside(point, array, center) 
{
    var howManyTrue = 0;
    var sideEq;
    var pointEq = getEquation(point, center);
    var pointDir = getPointDirection(point, center);
    var interPoint;
    var interDir;

    for (var index = 0, indexAhead = 1; index < array.length; index++)
    {
        indexAhead = (index + 1) % array.length;
        sideEq = getEquation(array[index], array[indexAhead]);
        interPoint = findIntersectPoint(pointEq, sideEq);
        interDir = getPointDirection(point, interPoint);

        if (pointDir.x == interDir.x && pointDir.y == interDir.y)
            if (withinTwoPoints(array[index], array[indexAhead], interPoint))
                howManyTrue++;
    }

    if (howManyTrue % 2 == 0)
        return false;

    return true;
}

// Initializes the stars object
function initializeStars() 
{
    m_iStars =
    {
        star: new Array,
        initialized: false,
        starting: 50
    };

    for (var index = 0; index < m_iStars.starting; index++)
        m_iStars.star.push(makeStar());

    paintGlowingStars();
}

// Makes new star randomly
function makeStar() 
{
    var star =
    {
        x: getRandomNumber(0, m_iMap.width),
        y: getRandomNumber(0, m_iMap.height),
        maxR: getRandomNumber(1, 2),//getRandomNumber(floor(m_iMap.width / 383), floor(m_iMap.width / 382)),
        currentR: .0,
        stopIncrease: getRandomNumber(1, 10) / 250
    };

    return star;
}

// Paints the stars in the background
function paintGlowingStars() 
{
    for (var index = 0; index < m_iStars.star.length; index++) 
    {
        m_Canvas.glowingStars.fillStyle = getRandomColor(1, 255);
        m_Canvas.glowingStars.clearRect(m_iStars.star[index].x - m_iStars.star[index].currentR, m_iStars.star[index].y - m_iStars.star[index].currentR, m_iStars.star[index].currentR * 2, m_iStars.star[index].currentR * 2);
        m_Canvas.glowingStars.beginPath();
        m_Canvas.glowingStars.arc(m_iStars.star[index].x, m_iStars.star[index].y, m_iStars.star[index].currentR, 0, 2 * Math.PI, false);
        m_Canvas.glowingStars.fill();
        
        if ((m_iStars.star[index].currentR += m_iStars.star[index].stopIncrease) >= m_iStars.star[index].maxR) 
        {
            m_iStars.star[index].stopIncrease = -m_iStars.star[index].stopIncrease;
            m_iStars.star[index].currentR = m_iStars.star[index].maxR;
        }

        if (m_iStars.star[index].currentR <= 0)
            m_iStars.star[index] = makeStar();
    }
}

// Returns random velocity for asteroids
function getRandomAsteroidVelocity()
{
    var xDir = getRandomNumber(0, 10) > 5 ? -1 : 1;
    var yDir = getRandomNumber(0, 10) > 5 ? -1 : 1;
    var velocity =
    {
        x: xDir * getRandomNumber(1, floor(m_iMap.width / m_iAsteroidz.widthDivider)),
        y: yDir * getRandomNumber(1, floor(m_iMap.width / m_iAsteroidz.widthDivider))
    };

    return velocity;
}

// Shows the scores
function showScores()
{
    showStartMenu(false);
    document.getElementById("scoresMenu").style.zIndex = 2;
    m_bGameStatus.showingScores = true;
    m_IntervalId.scores = setInterval("paintScores()", m_iSpeed.scores);
}

// Paints the scores
function paintScores() 
{
    clearGameScreen();
    writeMessage(m_iTextAlign.right - floor(m_iTextAlign.right / 5), m_iTextAlign.top, m_iFontSize.small, "Press any key to go back", m_iScores.color);

    if (m_iScores.list.length > 0) 
    {
        for (var index = 0; index < m_iScores.list.length; index++) 
        {
            m_iScores.list[index].y = (m_iScores.distFromEach * index) + m_iScores.distFromEach + m_iMouse.wheelDelta;
            writeMessage(m_iTextAlign.left, m_iScores.list[index].y, m_iFontSize.medium, index + 1 + ".", m_iScores.color);
            writeMessage(m_iTextAlign.left + floor(m_iTextAlign.center / 10), m_iScores.list[index].y, m_iFontSize.medium, m_iScores.list[index].name, m_iScores.color);
            writeMessage(m_iTextAlign.center, m_iScores.list[index].y, m_iFontSize.medium, m_iScores.list[index].score, m_iScores.color);
        }
    }

    else
        writeMessage(floor(m_iTextAlign.center / 2), m_iTextAlign.middle, m_iFontSize.medium, "None so far", m_iScores.color);
}

// Gives and element focuse based on argument
function setFocus(id, bFocused) 
{
    if (bFocused)
        document.getElementById(id).focus();

    else
        document.getElementById(id).blur();
}