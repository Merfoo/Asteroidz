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
    playBackgroundMusic();
    m_iTime.current = round(m_iTime.current += m_iSpeed.game / 1000, 2);
    m_iLazers.time += m_iSpeed.game;
    m_iLazers.setUpYet = false;
    showStars();
    m_Player = setUpShip(m_Player);
    
    // Handles setting up asteroids
    for(var index = 0; index < m_iAsteroidz.asteroids.length; index++)
    {
        m_iAsteroidz.asteroids[index] = setUpAsteroid(m_iAsteroidz.asteroids[index]);
        
        if(!pointWithinMap(m_iAsteroidz.asteroids[index].center.x, m_iAsteroidz.asteroids[index].center.y, m_iAsteroidz.distFromMap, m_iAsteroidz.distFromMap))
        {    
            if(m_iAsteroidz.asteroids.length <= m_iAsteroidz.count)
            {
                m_iAsteroidz.asteroids[index] = makeAsteroid();
                continue;
            }
            
            else
            {
                m_iAsteroidz.asteroids.splice(index, 1);
                continue;
            }
        }
        
        if(getDistance(m_Player.center, m_iAsteroidz.asteroids[index].center) < m_iAsteroidz.minDist)
        {
            if(arrayInside(m_Player.coordinates, m_iAsteroidz.asteroids[index].coordinates, m_iAsteroidz.asteroids[index].center))
                {}//endGameSingle();
        }
        
        // Handles setting up lazers and checking if the lazer hit the asteroids
        for(var pos = 0; pos < m_iLazers.lazers.length; pos++)
        {
            // Sets up lazers if it hasn't yet
            if(!m_iLazers.setUpYet)
                setUpLazer(m_iLazers.lazers[pos]);
              
            // Removes the lazer if it has gone outside the map
            if(!pointWithinMap(m_iLazers.lazers[pos].center.x, m_iLazers.lazers[pos].center.y, m_iAsteroidz.distFromMap, m_iAsteroidz.distFromMap))
            {
                m_iLazers.lazers.splice(pos, 1);
                continue;
            }
        
            if(getDistance(m_iLazers.lazers[pos].center, m_iAsteroidz.asteroids[index].center) < m_iAsteroidz.minDist)
            {
                if(arrayInside(m_iLazers.lazers[pos].coordinates, m_iAsteroidz.asteroids[index].coordinates, m_iLazers.lazers[pos].center, m_iAsteroidz.asteroids[index].center))
                {
                    m_iLazers.lazers.splice(pos, 1);
                    
                    // If the asteroid is big enough, spawn more
                    if(m_iAsteroidz.asteroids[index].size >= m_iAsteroidz.minSize)
                    {
                        for(var maker = 0; maker < getRandomNumber(1, 4); maker++)
                            m_iAsteroidz.asteroids.push(makeAsteroid(m_iAsteroidz.asteroids[index].center, m_iAsteroidz.asteroids[index].size / 4));
                        
                        m_iAsteroidz.asteroids[index] = makeAsteroid(m_iAsteroidz.asteroids[index].center, m_iAsteroidz.asteroids[index].size / 4);
                    }
                    
                    // If ths asteroid is too small, remove it
                    else
                    {
                        m_iScores.one += m_iAsteroidz.pointPer;
                        m_iAsteroidz.asteroids.splice(index, 1);
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
        
        for(var index = 0; index < m_iAsteroidz.count - m_iAsteroidz.asteroids.length; index++)
            m_iAsteroidz.asteroids.push(makeAsteroid());
    }
    
    writeMessage(m_iTextAlign.left, m_iTextAlign.top, m_iFontSize.medium, "Time: " + m_iTime.current, m_iTime.color);
    writeMessage(m_iTextAlign.left + 333, m_iTextAlign.top, m_iFontSize.medium, "Score: " + m_iScores.one, m_iTime.color);
}

// Stops loop
function pauseGameSingle()
{
    showPausePic(true);
    pauseBackgroundMusic();
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
    m_iScores.list.push(m_iScores.one = floor(m_iScores.one + m_iTime.current * m_iTime.multiplyer));
    m_iScores.list = order(m_iScores.list, true);
    writeMessage(m_iTextAlign.center, m_iTextAlign.middle, m_iFontSize.big, "You Lost!!!", m_iScores.color);
    writeMessage(m_iTextAlign.center, m_iTextAlign.middle + 75, m_iFontSize.small, "Time Survived: " + m_iTime.current, m_iScores.color);
    writeMessage(m_iTextAlign.center, m_iTextAlign.middle + 100, m_iFontSize.small, "Score: " + m_iScores.one + ",  Highest: " + m_iScores.list[0], m_iScores.color);
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
                    m_iLazers.lazers.push(makeLazer(m_Player));
                    m_iLazers.time = 0;
                }
            }
        }

        if (event.keyCode == m_iKeyId.space && !m_bGameStatus.lost)    // Space bar was pressed
            m_bGameStatus.isPaused ? unPauseGameSingle() : pauseGameSingle();
    }
}