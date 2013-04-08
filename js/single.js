// Singleplayer

function initializeSingle()
{
    showStartMenu(false);
    m_Player = resetPlayer(floor(m_iMap.width / 2), floor(m_iMap.height / 2));
    m_bGameStatus.started = true;
    m_bGameStatus.single = true;
    m_IntervalId.game = window.setInterval("gameLoopSingle();", m_iSpeed.game);
}

// Runs all the functions required for the game to work.
function gameLoopSingle() 
{
    clearGameScreen();
    m_iTime.current += m_iSpeed.game;
    m_iLazers.time += m_iSpeed.game;
    m_iLazers.setUpYet = false;
    showStars();
    m_Player = setUpShip(m_Player);
    
    // Handles setting up asteroids
    for(var index = 0; index < m_iAsteroidz.asteroid.length; index++)
    {
        m_iAsteroidz.asteroid[index] = setUpAsteroid(m_iAsteroidz.asteroid[index]);
        
        if(!pointWithinMap(m_iAsteroidz.asteroid[index].center.x, m_iAsteroidz.asteroid[index].center.y, m_iAsteroidz.distFromMap, m_iAsteroidz.distFromMap))
        {    
            if(m_iAsteroidz.asteroid.length <= m_iAsteroidz.count)
            {
                m_iAsteroidz.asteroid[index] = makeAsteroid();
                continue;
            }
            
            else
            {
                m_iAsteroidz.asteroid.splice(index, 1);
                continue;
            }
        }
        
        if(getDistance(m_Player.center, m_iAsteroidz.asteroid[index].center) < m_iAsteroidz.minDist)
        {
            if(arrayInside(m_Player.coordinates, m_iAsteroidz.asteroid[index].coordinates, m_iAsteroidz.asteroid[index].center))
                endGameSingle();
        }
        
        // Handles setting up lazers and checking if the lazer hit the asteroids
        for(var pos = 0; pos < m_iLazers.lazer.length; pos++)
        {
            if(!m_iLazers.setUpYet)
                setUpLazer(m_iLazers.lazer[pos]);
                
            if(!pointWithinMap(m_iLazers.lazer[pos].center.x, m_iLazers.lazer[pos].center.y, m_iAsteroidz.distFromMap, m_iAsteroidz.distFromMap))
            {
                m_iLazers.lazer.splice(pos, 1);
                continue;
            }
        
            if(getDistance(m_iLazers.lazer[pos].center, m_iAsteroidz.asteroid[index].center) < m_iAsteroidz.minDist)
            {
                if(arrayInside(m_iLazers.lazer[pos].coordinates, m_iAsteroidz.asteroid[index].coordinates, m_iLazers.lazer[pos].center, m_iAsteroidz.asteroid[index].center))
                {
                    m_iLazers.lazer.splice(pos, 1);
                    
                    if(m_iAsteroidz.asteroid[index].size >= m_iAsteroidz.minSize)
                    {
                        for(var maker = 0; maker < getRandomNumber(1, 4); maker++)
                            m_iAsteroidz.asteroid.push(makeAsteroid(m_iAsteroidz.asteroid[index].center, m_iAsteroidz.asteroid[index].size / 4));
                        
                        m_iAsteroidz.asteroid[index] = makeAsteroid(m_iAsteroidz.asteroid[index].center, m_iAsteroidz.asteroid[index].size / 4);
                    }
                    
                    else
                    {
                        m_iAsteroidz.asteroid.splice(index, 1);
                        continue;
                    }
                }
            }
        }
        
        m_iLazers.setUpYet = true;
    }
    
    if((m_iAsteroidz.time += m_iSpeed.game) > m_iAsteroidz.maxTime)
    {
        m_iAsteroidz.time = 0;
        m_iAsteroidz.count++;
        
        for(var index = 0; index < m_iAsteroidz.count - m_iAsteroidz.length; index++)
            m_iAsteroidz.push(makeAsteroid());
    }
    
    writeMessage(m_iTextAlign.left, m_iTextAlign.top, m_iFontSize.medium,  "Time: " + Math.round(m_iTime.current / 10) / 100, m_iTime.color);
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

function endGameSingle()
{
    pauseGameSingle();
    showPausePic(false);
    m_bGameStatus.lost = true;
    writeMessage(m_iTextAlign.center, m_iTextAlign.middle, m_iFontSize.big, "You Lost!!!", m_iScores.color);
    writeMessage(m_iTextAlign.center, m_iTextAlign.middle + 75, m_iFontSize.small, "You lasted: " + m_iTime.current / 1000 + " seconds", m_iScores.color);
    writeMessage(m_iTextAlign.center, m_iTextAlign.middle + 150, m_iFontSize.small, "To Play again press the esc", m_iScores.color);
}

// Handle keyboard events for single player
function keyBoardEventSingle(event)
{
    if(event.type == "keydown")
    { 
        if(!m_bGameStatus.paused)
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
    }
    
    if(event.type == "keyup")
    {
        if(!m_bGameStatus.paused)
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
            {
                if(m_iLazers.time >= m_iLazers.maxWait)
                {
                    playLazer();
                    m_iLazers.lazer.push(makeLazer(m_Player));
                    m_iLazers.time = 0;
                }
            }
        }

        if (event.keyCode == m_iKeyId.space && !m_bGameStatus.lost)    // Space bar was pressed
            m_bGameStatus.isPaused ? unPauseGameSingle() : pauseGameSingle();
    }
}