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
    m_iTime.current += m_iSpeed.game;
    m_Player = setUpShip(m_Player);
    m_iLazerVar.setUpYet = false;
    
    // Handles setting up asteroids
    for(var index = 0; index < m_iAsteroidz.length; index++)
    {
        m_iAsteroidz[index] = setUpAsteroid(m_iAsteroidz[index]);
        
        if(!pointWithinMap(m_iAsteroidz[index].center.x, m_iAsteroidz[index].center.y, m_iAsterVar.distFromMap, m_iAsterVar.distFromMap))
        {    
            if(m_iAsteroidz.length <= m_iAsterVar.count)
                m_iAsteroidz[index] = makeAsteroid();
            
            else
                m_iAsteroidz.splice(index, 1);
        }
        
        if(getDistance(m_Player.center, m_iAsteroidz[index].center) < m_iAsterVar.minDist)
        {
            if(arrayInside(m_Player.coordinates, m_iAsteroidz[index].coordinates, m_iAsteroidz[index].center))
                endGameSingle();
        }
        
        // Handles setting up lazers and checking if the lazer hit the asteroids
        for(var pos = 0; pos < m_iLazers.length; pos++)
        {
            if(!m_iLazerVar.setUpYet)
                setUpLazer(m_iLazers[pos]);
                
            if(!pointWithinMap(m_iLazers[pos].center.x, m_iLazers[pos].center.y, m_iAsterVar.distFromMap, m_iAsterVar.distFromMap))
                m_iLazers.splice(pos, 1);
        
            if(getDistance(m_iLazers[pos].center, m_iAsteroidz[index].center) < m_iAsterVar.minDist)
            {
                if(arrayInside(m_iLazers[pos].coordinates, m_iAsteroidz[index].coordinates, m_iLazers[pos].center, m_iAsteroidz[index].center))
                {
                    m_iLazers.splice(pos, 1);
                    
                    if(m_iAsteroidz[index].size >= m_iAsterVar.minSize)
                    {
                        for(var maker = 0; maker < getRandomNumber(1, 4); maker++)
                            m_iAsteroidz.push(makeAsteroid(m_iAsteroidz[index].center, m_iAsteroidz[index].size / 4));
                        
                        m_iAsteroidz[index] = makeAsteroid(m_iAsteroidz[index].center, m_iAsteroidz[index].size / 4);
                    }
                    
                    else
                        m_iAsteroidz.splice(index, 1);
                }
            }
        }
        
        m_iLazerVar.setUpYet = true;
    }
    
    if((m_iAsterVar.time += m_iSpeed.game) > m_iAsterVar.maxTime)
    {
        m_iAsterVar.time = 0;
        m_iAsterVar.count++;
        
        for(var index = 0; index < m_iAsterVar.count - m_iAsteroidz.length; index++)
            m_iAsteroidz.push(makeAsteroid());
    }
    
    writeMessage(m_iMessageAlignment.left, "Time: " + Math.round(m_iTime.current / 10) / 100, m_iTime.color);
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
    
    m_CanvasMain.fillStyle = "white";
    
    m_CanvasMain.font = (m_iMap.width * m_iMap.height) / 10000  + 'pt Calibri';
    m_CanvasMain.fillText("You Lost!!!", m_iMap.width / 3, m_iMap.height / 2);
    
    m_CanvasMain.font = (m_iMap.width * m_iMap.height) / 50000  + 'pt Calibri';
    m_CanvasMain.fillText("You lasted: " + m_iTime.current / 1000 + " seconds", m_iMap.width / 3, m_iMap.height / 5 * 3);
    
    m_CanvasMain.font = (m_iMap.width * m_iMap.height) / 50000  + 'pt Calibri';
    m_CanvasMain.fillText("To Play again press the esc", m_iMap.width / 3, m_iMap.height / 4 * 3);
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
                m_iLazers.push(makeLazer(m_Player));
        }

        if (event.keyCode == m_iKeyId.space && !m_bGameStatus.lost)    // Space bar was pressed
            m_bGameStatus.isPaused ? unPauseGameSingle() : pauseGameSingle();
    }
}