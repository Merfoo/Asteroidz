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
    {
        if(asteroidOutOfBounds(m_iAsteroidz[index]))
            m_iAsteroidz[index] = makeAsteroid();
            
        m_iAsteroidz[index] = setUpAsteroid(m_iAsteroidz[index]);
        
        if(insideAsteroid(m_Player.head, m_iAsteroidz[index]))
            m_iAsteroidz = removeIndex(index, m_iAsteroidz);
    }
    
    for(var index = 0; index < m_iLazers.length; index++)
    {
        setUpLazer(m_iLazers[index]);
                
        if(lazerOutOfBounds(m_iLazers[index]))
            m_iLazers = removeIndex(index, m_iLazers);
        
        for(var pos = 0; pos < m_iAsteroidz.length; pos++)
        {            
            if(insideAsteroid(m_iLazers[index].head, m_iAsteroidz[pos]))
            {
                m_iAsteroidz.push(makeAsteroid(m_iAsteroidz[pos].center));
                m_iAsteroidz[pos] = makeAsteroid(m_iAsteroidz[pos].center);
                m_iLazers = removeIndex(index, m_iLazers);
            }
        }
    }
    
    if((m_iAsterData.time += m_iSpeed.game) > m_iAsterData.maxTime)
    {
        m_iAsterData.time = 0;
        m_iAsteroidz.push(makeAsteroid());
    }
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

    if (event.keyCode == m_iKeyId.a)    // A was pressed
        m_iLazers.push(makeNewLazer(m_Player));
        
    if (event.keyCode == m_iKeyId.space)    // Space bar was pressed
        m_bGameStatus.isPaused ? unPauseGameSingle() : pauseGameSingle();
}