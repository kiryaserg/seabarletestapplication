'use strict';


function FindPosition(oElement)
{
    if (typeof(oElement.offsetParent) != "undefined")
    {
        for (var posX = 0, posY = 0; oElement; oElement = oElement.offsetParent)
        {
            posX += oElement.offsetLeft;
            posY += oElement.offsetTop;
        }
        return [posX, posY];
    }
    else
    {
        return [oElement.x, oElement.y];
    }
}
function GetCoordinates(e, element){
    var PosX = 0;
    var PosY = 0;
    var elementPosition;
    elementPosition = FindPosition(element);
    if (!e)
        var e = window.event;
    if (e.pageX || e.pageY)
    {
        PosX = e.pageX;
        PosY = e.pageY;
    }
    else if (e.clientX || e.clientY)
    {
        PosX = e.clientX + document.body.scrollLeft
                + document.documentElement.scrollLeft;
        PosY = e.clientY + document.body.scrollTop
                + document.documentElement.scrollTop;
    }
    ret = {};
    ret.PosX = PosX - elementPosition[0];
    ret.PosY = PosY - elementPosition[1];
    return ret;
} 

// Declare app level module which depends on views, and components
var app = angular.module('seaBatle', [
  'ngDraggable'
]);

function getFieldMatrix(columns,rows) {
    var arr = new Array();
    for (var i = 0; i < columns; i++) {
        for (var j = 0; j < rows; j++) {
            arr.push({column:i,row:j});
        }
    }
    return arr;
}

function battleField(size){
    var GRID_SIZE = 10;
    self = this;
    this.getFieldSideLength = function (){
        return size;
    }.bind(this);
    var shipsCount = 0;
    this.getShipsCount = function(){
        return shipsCount;
    }.bind(this);

    this.getCoseInEmptyCeil = function(position){
        return {top:0,left:0};
    }.bind(this);
    
    this.getCoseInChoordinateInGrid = function (coord){
        var percent = Math.round(((coord *100) / this.getFieldSideLength())/10)*10;
        return (percent * this.getFieldSideLength() / 100);
    }.bind(this);

    var battleGrid = [];
    var getBattleGrid = function() {
        if (battleGrid.length == 0) {
            for (var i = 0;  i < GRID_SIZE; i++) {
                battleGrid[i] = [];
                for (var j = 0; j < GRID_SIZE; j++) {
                    battleGrid[i][j] = 0;
                }
            }
        }
      return battleGrid; 
    }.bind(this);

    var setPointToBatleGrid = function(x,y,data){
        if(battleGrid[y] != undefined && battleGrid[y][x]!=undefined){
             battleGrid[y][x]  = data;
        }
    };

    var positionToGrid = function (position){
        var res = {};
        function getGridPos(pos){
            return Math.round(pos / (self.getFieldSideLength() / GRID_SIZE));
        }
        res.y =  getGridPos(position.top);
        res.x =   getGridPos(position.left);
        return res; 
    }; 

    var gridToPosition = function (position){
        var res = {};
        function getFieldCoord(pos){
            return Math.round(pos * (self.getFieldSideLength() / GRID_SIZE));
        }
        res.top =  getFieldCoord(position.y);
        res.left =   getFieldCoord(position.x);
        return res; 
    }; 
    
    var checkIsEmptyShipRect = function(i,j,batleGrid,ship){
        var empty = true;
        for(var s = -1; s < ship.length+1; s++){
                if( j+s > GRID_SIZE){
                    return false;
                }
                
                var min = i-1 <0?0:i-1;
                var max = i+1 > GRID_SIZE-1?GRID_SIZE-1:i+1;
             
                if((batleGrid[i][j+s] == 0 || batleGrid[i][j+s]==undefined)
                && (batleGrid[max][j+s] == 0 || batleGrid[max][j+s]==undefined)
                && (batleGrid[min][j+s] == 0 || batleGrid[min][j+s]==undefined)
                ){
                      empty = true;
                }else{
                    return false;
                }
            }
        return empty;
    };
    var findEmptyPositionStartedFromPoint = function(gridPosition,batleGrid,ship){
        for (var i = gridPosition.y;  i < GRID_SIZE;) {
             for (var j = gridPosition.x; j < GRID_SIZE;) {
                if(checkIsEmptyShipRect(i,j,batleGrid,ship)){
                    return gridToPosition(gridPosition);
                }
            gridPosition.x = ++j;
            }
           gridPosition.x=0;
           gridPosition.y = ++i;
        }
      return false;
    };
    
    this.getCoseInEmptyPointInAGrid = function(ship){
        var  gridPosition = positionToGrid(ship);
        var batleGrid = getBattleGrid();
        var ret =  findEmptyPositionStartedFromPoint(gridPosition,batleGrid,ship);
         if(ret === false){
             ret = findEmptyPositionStartedFromPoint({x:0,y:0},batleGrid,ship);
         }
     return ret;
    };

    this.removeShipFromAGrid = function (ship){
         var  gridPosition = positionToGrid(ship);
         for(var i = gridPosition.x; i < gridPosition.x + ship.length;){
            setPointToBatleGrid(i,gridPosition.y,0);
            i++;
        }
    };

    this.addShipToGrid = function (ship){
        var  gridPosition = positionToGrid(ship);
        for(var i = gridPosition.x; i < gridPosition.x + ship.length;){
            setPointToBatleGrid(i,gridPosition.y,1);
            i++;
        }
    }.bind(this);

    this.putShipOnABattlefield = function (x,y,ship){
        this.removeShipFromAGrid(ship);
        ship.top = this.getCoseInChoordinateInGrid(y);
        ship.left = this.getCoseInChoordinateInGrid(x);
        var shipPosition = this.getCoseInEmptyPointInAGrid(ship);
        ship.top = shipPosition.top;
        ship.left = shipPosition.left;
        this.addShipToGrid(ship);
    }.bind(this);
}

app.controller('batleCtrl', function($scope){
    $scope.battleField = new battleField(400);
    $scope.fieldSideLength = $scope.battleField.getFieldSideLength();
    $scope.batleGrid = getFieldMatrix(10,10);
    $scope.batleShips = [];
    $scope.draggableObjects =  $scope.ships;
    $scope.ships = [
        {type:'s4',count:1, length:4, top:0, left:0, canClone: true, isDragging:false},
        {type:'s3',count:2, length:3, top:0, left:0, canClone:true , isDragging:false},
        {type:'s2',count:3, length:2, top:0, left:0, canClone:true, isDragging:false},
        {type:'s1',count:4, length:1, top:0, left:0, canClone:true, isDragging:false}
    ];

$scope.addToBattleGrid = function(index){
    $scope.addShipToBattleGrid($scope.ships[index]);
};

$scope.addShipToBattleGrid = function(ship){
    var position = $scope.battleField.getCoseInEmptyPointInAGrid(ship);
    var clone = angular.copy(ship);
    clone.canClone = false;
    $scope.addShipToField(clone,position);
    ship.count--;
    return clone;
};

$scope.addShipToField  = function(ship,position){
    ship.top =  position.top;
    ship.left =  position.left;
    $scope.battleField.addShipToGrid(ship);
    $scope.batleShips.push(ship);
};

 $scope.onDropComplete = function(ship,evt){
     ship.isDragging = false;
     if(!ship){
         return false;
     }
    var fieldPosition = GetCoordinates(evt, document.getElementById("field"));
    if(ship.canClone){
      ship = $scope.addShipToBattleGrid(ship);
    }

    $scope.battleField.putShipOnABattlefield(
    (evt.x - evt.element.mouseX+ fieldPosition.PosX),
    (evt.y - evt.element.mouseY + fieldPosition.PosY),
    ship
        );
        
};
$scope.onDragStart =  function(ship,evt){
    ship.isDragging = true;
};

$scope.onDragStop =  function(ship,evt){
   if(!ship){
       return false;
   }
    ship.isDragging = false;
};

});