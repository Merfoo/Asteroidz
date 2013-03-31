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
        if(isOutOfBounds(m_iAsteroidz[index].coordinates))
            m_iAsteroidz[index] = makeAsteroid();
            
        m_iAsteroidz[index] = setUpAsteroid(m_iAsteroidz[index]);
        
        if(insideEachOther(m_Player.coordinates, m_iAsteroidz[index].coordinates, m_Player.center, m_iAsteroidz[index].center))
            m_iAsteroidz = removeIndex(index, m_iAsteroidz);
    }
    
    for(var index = 0; index < m_iLazers.length; index++)
    {
        setUpLazer(m_iLazers[index]);
                
        if(isOutOfBounds(m_iLazers[index].coordinates))
            m_iLazers = removeIndex(index, m_iLazers);
        
        for(var pos = 0; pos < m_iAsteroidz.length; pos++)
        {            
            if(insideEachOther(m_iLazers[index].coordinates, m_iAsteroidz[pos].coordinates, m_iLazers[index].center, m_iAsteroidz[pos].center))
            {
                m_iAsteroidz.push(makeAsteroid(m_iAsteroidz[pos].center, m_iAsteroidz[pos].size * (3 / 4)));
                m_iAsteroidz[pos] = makeAsteroid(m_iAsteroidz[pos].center, m_iAsteroidz[pos].size * (3 / 4));
                m_iLazers = removeIndex(index, m_iLazers);
            }
        }
    }
    
    if((m_iAsterData.time += m_iSpeed.game) > m_iAsterData.maxTime)
    {
        m_iAsterData.time = 0;
        m_iAsteroidz.push(makeAsteroid());
    }
    
    console.log(m_iLazers.length);
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
        m_iLazers.push(makeLazer(m_Player));
        
    if (event.keyCode == m_iKeyId.space)    // Space bar was pressed
        m_bGameStatus.isPaused ? unPauseGameSingle() : pauseGameSingle();
}