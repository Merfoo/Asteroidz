// Has useful functions 

// Returns random color between iMin and iMax.
function getRandomColor(iMin, iMax)
{
    // creating a random number between iMin and iMax
    var r = getRandomNumber(iMin, iMax);
    var g = getRandomNumber(iMin, iMax);
    var b = getRandomNumber(iMin, iMax);

    // going from decimal to hex
    var hexR = r.toString(16);
    var hexG = g.toString(16);
    var hexB = b.toString(16);

    // making sure single character values are prepended with a "0"
    if (hexR.length == 1)
        hexR = "0" + hexR;

    if (hexG.length == 1)
        hexG = "0" + hexG;

    if (hexB.length == 1)
        hexB = "0" + hexB;

    // creating the hex value by concatenatening the string values
    var hexColor = "#" + hexR + hexG + hexB;
    return hexColor.toUpperCase();
}

// Returns random number between iMin and iMax. Include iMin, not iMax.
function getRandomNumber(iMin, iMax)
{
    return Math.floor((Math.random() * (iMax - iMin)) + iMin);
}

// Removes specified index of the array
function removeIndex(index, array)
{
    var returnArray = new Array();
    
    for(var iPos = 0; iPos < array.length; iPos++)
         if(iPos != index)
            returnArray.push(array[iPos]);
    
    return returnArray;
}
function cos(angle)
{
    return Math.cos(angle);
}

function sin(angle)
{
    return Math.sin(angle);
}

function rotatePoint(x, y, ang, cornerX, cornerY)
{
    var newX = cos(ang)*(x - cornerX) - sin(ang)*( y - cornerY) + cornerX;
    var newY = sin(ang)*(x - cornerX) + cos(ang)*( y - cornerY) + cornerY;
    
    return { x: newX, y: newY };
}

function floor(number)
{
    return Math.floor(number);
}

function abs(number)
{
    return Math.abs(number);
}


