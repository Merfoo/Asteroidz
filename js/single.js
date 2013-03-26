// Singleplayer

function initializeSingle()
{
    showStartMenu(false);
    m_bGameStatus.started = true;
    m_bGameStatus.single = true;
    m_IntervalId.game = window.setInterval("gameLoopSingle();", m_iSpeed.game);
}

// Runs all the functions required for the game to work.
function gameLoopSingle() 
{
    clearGameScreen();
    m_Player = setUpShip(m_Player);
    
    for(var index = 0; index < m_iAsteroidz.length; index++)
        m_iAsteroidz[index] = setUpAsteroid(m_iAsteroidz[index]);
}

// Stops loop
function pauseGameSingle()
{
    showPausePic(true);
    window.clearInterval(m_IntervalId.game);
}

// Starts loop again
function unPauseGameSingle()
{
    showPausePic(false);
    m_IntervalId.game = window.setInterval("gameLoopSingle();", m_iSpeed.game);
}

// Handle keyboard events for multiplayer
function keyBoardDownSingle(event)
{
    if (event.keyCode == m_iKeyId.arrowUp)   // Up arrow key was pressed.
        m_Player.up = true;

    else if (event.keyCode == m_iKeyId.arrowDown)    // Down arrow key was pressed.
        m_Player.down = true;
    
    else if(event.keyCode == m_iKeyId.arrowRight)   // Right arrow key was pressed
        m_Player.right = true;
    
    else if(event.keyCode == m_iKeyId.arrowLeft)    // Right arrow key was pressed
        m_Player.left = true;
}

function keyBoardUpSingle(event)
{
    if (event.keyCode == m_iKeyId.arrowUp)   // Up arrow key was pressed.
        m_Player.up = false;

    else if (event.keyCode == m_iKeyId.arrowDown)    // Down arrow key was pressed.
        m_Player.down = false;
    
    else if(event.keyCode == m_iKeyId.arrowRight)   // Right arrow key was pressed
        m_Player.right = false;
    
    else if(event.keyCode == m_iKeyId.arrowLeft)    // Right arrow key was pressed
        m_Player.left = false;

    if (event.keyCode == m_iKeyId.space)
        m_bGameStatus.isPaused ? unPauseGameSingle() : pauseGameSingle();
}