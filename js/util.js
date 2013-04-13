// Has useful functions 

// Returns random color between iMin and iMax.
function getRandomColor(iMin, iMax)
{
    // Creating a random number between iMin and iMax, converting to hex
    var hexR = (getRandomNumber(iMin, iMax)).toString(16);
    var hexG = (getRandomNumber(iMin, iMax)).toString(16);
    var hexB = (getRandomNumber(iMin, iMax)).toString(16);
    
    // Making sure single character values are prepended with a "0"
    if (hexR.length == 1)
        hexR = "0" + hexR;

    if (hexG.length == 1)
        hexG = "0" + hexG;

    if (hexB.length == 1)
        hexB = "0" + hexB;

    // Creating the hex value by concatenatening the string values
    return ("#" + hexR + hexG + hexB).toUpperCase();
}

// Returns random number between iMin and iMax, include iMin and iMax
function getRandomNumber(iMin, iMax)
{
    if(iMax < iMin)
    {
        var temp = iMax;
        iMax = iMin;
        iMin = temp;
    }
    
    return Math.floor((Math.random() * ((iMax + 1) - iMin)) + iMin);
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

function round(number, places)
{
    return Math.round(number * Math.pow(10, places)) / Math.pow(10, places);
}

function floor(number)
{
    return Math.floor(number);
}

function abs(number)
{
    return Math.abs(number);
}

function getEquation(pointA, pointB)
{
    var slopeX = pointB.x - pointA.x;
    var slopeY = pointB.y - pointA.y;
    var yIntercept = pointA.y - ((slopeY / slopeX) * pointA.x);
    
    return { slope: slopeY / slopeX, intercept: yIntercept } ;
}

function lessThanEquation(equation, point)
{
    if(runEquation(equation, point) > point.y)
        return true;
    
    return false;
}

function runEquation(eq, x)
{
    return (eq.slope * x) + eq.intercept;
}

function withinTwoPoints(pointA, pointB, testingPoint)
{
    var eq = getEquation(pointA, pointB);
    var y = runEquation(eq, testingPoint.x);
    
    if((y > pointA.y && y < pointB.y) || (y < pointA.y && y > pointB.y))
        return true;
        
    return false;
}

function findIntersectPoint(eqOne, eqTwo)
{
    var intersectX = (eqTwo.intercept - eqOne.intercept) / (eqOne.slope - eqTwo.slope);
    var intersectY = runEquation(eqOne, intersectX);
    
    return { x: intersectX, y: intersectY };
}

function getPointDirection(pointBeingCompared, pointComparedTo)
{
    var dirX = 0;
    var dirY = 0;
    
    if(pointBeingCompared.x < pointComparedTo.x)
        dirX = -1;
    
    if(pointBeingCompared.x > pointComparedTo.x)
        dirX = 1;
    
    if(pointBeingCompared.y < pointComparedTo.y)
        dirY = -1;
    
    if(pointBeingCompared.y > pointComparedTo.y)
        dirY = 1;
    
    return { x: dirX, y: dirY };
}

function getDistance(pointA, pointB)
{
    return Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2));
}

function order(array, highFirst)
{
    var temp;
    
    for(var loop = 0; loop < array.length; loop++)
    {
        for(var index = 0; index < array.length - 1; index++)
        {
            if((highFirst && array[index] < array[index + 1]) || (!highFirst && array[index] > array[index + 1]))
            {
                temp = array[index];
                array[index] = array[index + 1];
                array[index + 1] = temp;
            }
        }
    }
    
    return array;
}

function limit(value, lower, upper)
{
    upper = upper > lower ? upper : lower;
    
    if(value > upper)
        return upper;
    
    else if(value < lower)
        return lower;
    
    return value;
}