// This file conatins all variables used with different variations of the game, and some useful functions

// Contains map width, map height, color and toolbar thickness
var m_iMap;
var m_Player;
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
    
    alert("WARNING: If you have had epileptic seizures in the past, this game may cause one to occur again.\n\
            Play with Caution!");
    
    var isChrome = /chrome/.test(navigator.userAgent.toLowerCase());
    
    if(!isChrome)
        alert("This game currently does not fully function in IE or Firefox, for best results try Google Chrome :D");

    showStartMenu(true);
}

// Starts game
function startGame(iGameVersion)
{
    if(iGameVersion == 0)
        initializeSingle();
}

// Changes gamespeed
function changeGameSpeed(intervalID, sFunction,gameSpeed)
{
    window.clearInterval(intervalID);
    intervalID = window.setInterval(sFunction, gameSpeed);

    return intervalID;
}

// Sets the canvas as big as the broswer size
function initializeCanvas()
{
    m_CanvasContext = document.getElementById("myCanvas").getContext("2d");
    
    m_iMap = 
    {
        height: window.innerHeight, 
        width: window.innerWidth,
        toolbarThickness: Math.floor(this.height / 25),
        toolbarColor: "black",
        backgroundColor: "black"
    };
    
    m_iMessageAlignment = 
    {
        left: 5,
        middle: Math.floor(m_iMap.width / 2),
        right: Math.floor((m_iMap.width / 2) + (m_iMap.width / 2) / 2)
    };
    
    m_CanvasContext.canvas.width = m_iMap.width -= Math.floor(m_iMap.width / 75); 
    m_CanvasContext.canvas.height = m_iMap.height -= Math.floor(m_iMap.height / 36);
}

// Shows start menu, based on argument.
function showStartMenu(bVisible)
{
    if (bVisible)
    {
        paintScreen(m_iMap.backgroundColor);
        resetGame();
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
}

// Shows pause pause if true, otherwise hides it.
function showPausePic(bVisible)
{
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
    m_Player = resetPlayer(Math.floor(m_iMap.width / 2), Math.floor(m_iMap.height / 2));
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
    var middleWidth = centerX;//Math.floor(m_iMap.width / 2);
    var middleHeight = centerY;//Math.floor(m_iMap.height / 2);
    var shipWidth = Math.floor(m_iMap.width / 100);
    var shipHeight = Math.floor(middleHeight / 5);
    var buttDistance = Math.floor(shipHeight - Math.floor(shipHeight / 3));
    
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
                    
        slope:
        {
            x: 0,
            y: 0
        },
        
        velocity:
        {
            x: 0,
            y: 0
        }, 
        
        increase: 5,        
        color: "white",
        up: false,
        down: false,
        left: false,
        right: false,
        degree: .125
    };
    
    console.log("Initialized");
    console.log(player.head.x + "-" + player.head.y);
    console.log(player.tailLeft.x + "-" + player.tailLeft.y);
    console.log(player.tailRight.x + "-" + player.tailRight.y);
    console.log(player.butt.x + "-" + player.butt.y);
    
    return player;
}

function rotateShip(ship, angle)
{
    var newHead = rotatePoint(ship.head.x, ship.head.y, angle, ship.head.x, ship.head.y);
    var newTailLeft = rotatePoint(ship.tailLeft.x, ship.tailLeft.y, angle, ship.head.x, ship.head.y);
    var newTailRight = rotatePoint(ship.tailRight.x, ship.tailRight.y, angle, ship.head.x, ship.head.y);
    var newButt = rotatePoint(ship.butt.x, ship.butt.y, angle, ship.head.x, ship.head.y);
    
    ship.head = newHead;
    ship.tailLeft = newTailLeft;
    ship.tailRight = newTailRight;
    ship.butt = newButt;
}

function setUpShip(ship)
{
    // Repaint the prevous ship to background color
    paintShip(ship, 3, m_iMap.backgroundColor);    
    rotateShip(ship, ship.degree);
    
    // Moving the ship up and down
    if(ship.up)
        ship.velocity.y = -ship.increase;
    
    if(ship.down)
        ship.velocity.y = ship.increase;
    
    if(ship.left)
        ship.velocity.x = -ship.increase;
    
    if(ship.right)
        ship.velocity.x = ship.increase;
    
    if(!ship.up && !ship.down)
        ship.velocity.y = 0;
    
    if(!ship.right && !ship.left)
        ship.velocity.x = 0;
    
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

