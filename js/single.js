// Singleplayer

function initializeSingle()
{
    showStartMenu(false);
    m_Player = resetPlayer(floor(m_iMap.width / 2), floor(m_iMap.height / 2));
    m_bGameStatus.started = true;
    m_bGameStatus.single = true;
    m_IntervalId.game = window.setInterval("gameLoopSingle()", m_iSpeed.game);
}

// Runs all the functions required for the game to work.
function gameLoopSingle() 
{
    clearGameScreen();
    playBackgroundMusic();
    m_Player = setUpShip(m_Player);
    m_iTime.current = round(m_iTime.current += m_iSpeed.game / 1000, 2);
    m_Player.lazerTime += m_iSpeed.game;
    m_iLazers.setUpYet = false;
    
    // Handles setting up asteroids
    for(var index = 0; index < m_iAsteroidz.asteroids.length; index++)
    {
        m_iAsteroidz.asteroids[index] = setUpAsteroid(m_iAsteroidz.asteroids[index]);
        
        if(!pointWithinMap(m_iAsteroidz.asteroids[index].center.x, m_iAsteroidz.asteroids[index].center.y, m_iAsteroidz.distFromMap, m_iAsteroidz.distFromMap))
        {    
            if(m_iAsteroidz.asteroids.length <= m_iAsteroidz.count)
            {
                m_iAsteroidz.asteroids[index] = makeOutOfBoundsAsteroid();
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
                m_bGameStatus.lost = true;
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
                if(arrayInside(m_iLazers.lazers[pos].coordinates, m_iAsteroidz.asteroids[index].coordinates, m_iAsteroidz.asteroids[index].center))
                {
                    m_iLazers.lazers.splice(pos, 1);
                    
                    // If the asteroid is big enough, spawn more
                    if(m_iAsteroidz.asteroids[index].size >= m_iAsteroidz.minSize)
                    {
                        for(var maker = 0; maker < getRandomNumber(1, 4); maker++)
                            m_iAsteroidz.asteroids.push(makeAsteroid(m_iAsteroidz.asteroids[index].center, getRandomAsteroidVelocity(), m_iAsteroidz.asteroids[index].size / 4, true));
                        
                        m_iAsteroidz.asteroids.splice(index, 1);
                        m_iScores.one += floor(m_iAsteroidz.pointPer / 3);
                        continue;
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
            m_iAsteroidz.asteroids.push(makeOutOfBoundsAsteroid());
    }
    
    if(m_Player.shootingLazer)
    {
        if(m_Player.lazerTime >= m_iLazers.maxWait)
        {
            playLazer();
            m_iLazers.lazers.push(makeLazer(m_Player));
            m_Player.lazerTime = 0;
        }
    }
    
    writeMessage(m_iTextAlign.left, m_iTextAlign.top, m_iFontSize.medium, "Time: " + m_iTime.current, m_iTime.color);
    writeMessage(m_iTextAlign.left + 333, m_iTextAlign.top, m_iFontSize.medium, "Score: " + m_iScores.one, m_iTime.color);
    
    if(m_bGameStatus.lost)
        endGameSingle();
}

// Stops loop
function pauseGameSingle(bShowPic)
{
    showPausePic(bShowPic);
    pauseBackgroundMusic();
    window.clearInterval(m_IntervalId.game);
}

// Starts loop again
function unPauseGameSingle()
{
    showPausePic(false);
    m_IntervalId.game = window.setInterval("gameLoopSingle();", m_iSpeed.game);
}

// Shows endgame 
function showEndGameSingle(bVisible)
{
    m_bGameStatus.lost = bVisible;
    
    if (bVisible)
        document.getElementById("endGameSingle").style.zIndex = 2;

    else
        document.getElementById("endGameSingle").style.zIndex = -2;
}

function endGameSingle()
{ 
    setFocus("usernameTextBox", true);
    var current = getScoreSingle();
    var highest = current;
    
//    var textRect = 
//    {
//        x: m_iTextAlign.center,
//        y: m_iTextAlign.middle + 60,
//        width: m_iFontSize.big * 3.33,
//        height: m_iFontSize.big * 1.5
//    };
    
    pauseGameSingle(false);
    showEndGameSingle(true);
    //clearGameScreen(textRect.x, textRect.y, textRect.width, textRect.height);
    
    if(m_iScores.list.length > 0)
        highest = current > m_iScores.list[0].score ? current : m_iScores.list[0].score;
     
    // Writes messages
    writeMessage(m_iTextAlign.center + floor(m_iTextAlign.center / 3 * 2), m_iTextAlign.middle + floor(m_iTextAlign.middle / 5 * 2), m_iFontSize.small, "Username", m_iScores.color);
    writeMessage(m_iTextAlign.center, m_iTextAlign.middle, m_iFontSize.big, "You Lost!!!", m_iScores.color);
    writeMessage(m_iTextAlign.center, m_iTextAlign.middle + floor(m_iTextAlign.middle / 3 * 1), m_iFontSize.small, "Time Survived: " + m_iTime.current, m_iScores.color);
    writeMessage(m_iTextAlign.center, m_iTextAlign.middle + floor(m_iTextAlign.middle / 4 * 2), m_iFontSize.small, "Score: " + current + ",  Highest: " + highest, m_iScores.color);
    writeMessage(m_iTextAlign.center, m_iTextAlign.middle + floor(m_iTextAlign.middle / 4 * 3), m_iFontSize.small, "To Play again press Enter", m_iScores.color);
}

function getScoreSingle()
{
    return floor(m_iScores.one + m_iTime.current * m_iTime.multiplyer);
}

function takeInputSingle()
{
    return document.usernameForm.usernameTextBox.value;
}

function submitScoreSingle()
{
    var newScore =
    {
        score: getScoreSingle(),
        y: 0,
        name: takeInputSingle()
    };
    
    m_iScores.list.push(newScore);
    m_iScores.orderList(true);
}

function playSingleAgain()
{
    if(m_bGameStatus.lost)
        submitScoreSingle();
    
    pauseGameSingle(false);
    resetGame();
    initializeSingle();
}

function showStartSingle()
{
    showStartMenu(true);
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
            
            else if (event.keyCode == m_iKeyId.a)    // A was pressed
                m_Player.shootingLazer = true;
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

            else if(event.keyCode == m_iKeyId.enter)
                playSingleAgain();
            
            else if(event.keyCode == m_iKeyId.a)    // A was pressed
                m_Player.shootingLazer = false;
            
            else if(event.keyCode == m_iKeyId.esc)
                showStartSingle();
        }

        if (event.keyCode == m_iKeyId.space && !m_bGameStatus.lost)    // Space bar was pressed
            m_bGameStatus.isPaused ? unPauseGameSingle() : pauseGameSingle(true);
    }
}