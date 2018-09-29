
function startGame() {


    pack = 30;
    MutationsID = 0;
    testCreature = [];
    wallMass = 25;
    biasSize = 20;
    //size = Math.min(window.innerHeight, window.innerWidth) / 1.2;
    maxWidth = 1200;
    maxCreatures = 50;
    size = 450;
    sides = ((maxWidth - size) / 2) - 2;
    simulation.setHTML();
    for (var i = 0; i < pack; i++) {
      testCreature.push(new creature(8, "Black", Math.random() * size, Math.random() * size, i));
      testCreature[i].brain.request_spawn(i);
      testCreature[i].ID = testCreature[i].brain.DbIdent;//this will have to happen later
    }

    simulation.start();
}

var simulation = {
    canvas : document.getElementById("canvas"),
    explorer : document.getElementById("explorer"),
    leftDiv : document.getElementById("leftSide"),
    //for use comunicating between canvases.
    selectedCreature : null,

    //for passing info between canvases

    setHTML: function() {
      //minus 2 is for size of borders


      this.leftDiv.style.height = size + "px";
      //this.leftDiv.style.width = ((1100 - size) / 2) - 2 + "px";
      this.leftDiv.style.width = sides - 35 + "px";
      //this.leftDiv.style.border = "thin solid Black";

      this.canvas.width = size;
      this.canvas.height = size;
      this.canvas.style.width = size + "px";
      this.canvas.style.height = size + "px";
      this.canvas.style.border = "thin solid Black";
      this.context = this.canvas.getContext("2d");
      this.canvas.addEventListener('click', function(event) {
        elemLeft = simulation.canvas.offsetLeft;
        elemTop = simulation.canvas.offsetTop;
        var x = event.pageX - elemLeft,
            y = event.pageY - elemTop;

        hasSelected = false;
        for (var i = 0; i < pack; i++) {
          if (isWithin(testCreature[i], x, y)) {
            simulation.selectedCreature = testCreature[i];
            testCreature[i].isSelected = true;
            hasSelected = true;
          }
          else {
            testCreature[i].isSelected = false;
          }
        }
        if (hasSelected == false) {
        simulation.selectedCreature = null;
        }
      }, false);

      this.explorer.width = sides - 30;
      //this.explorer.height = ((1100 - size) / 2) - 2;
      this.explorer.height = size;
      this.explorer.style.height = size + "px";
      this.explorer.style.width = sides - 30 + "px";
      //this.explorer.style.border = "thin solid Black";
      this.explorerContext = this.explorer.getContext("2d");

    },
    start : function() {
        //sets game size acording to screen size
      this.interval = setInterval(updateAreas, 45);
    },
    clear : function() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.explorerContext.clearRect(0, 0, this.explorer.width, this.explorer.height);
    }
};

function showText(){
 // get the clock
    var text = document.getElementById('allTheText');

    // get the current value of the clock's display property
    var displaySetting = text.style.display;

    // also get the clock button, so we can change what it says
    var Button = document.getElementById('textButton');

    // now toggle the clock and the button text, depending on current state
    if (displaySetting == 'block') {
      // clock is visible. hide it
      text.style.display = 'none';
      // change button text
      Button.innerHTML = 'Info';
    }
    else {
      // clock is hidden. show it
      text.style.display = 'block';
      // change button text
      Button.innerHTML = 'Hide';
    }

}

function isWithin(creature, x, y) {

  //find creature attributes
  centerx = creature.x;
  centery = creature.y;
  radius = creature.R;

  //quick check
  if (x - centerx > radius || y - centery > radius) {
    return false;
  }

  //if distance between points is larger than radius
  distance = Math.sqrt(Math.pow(x - centerx, 2) + Math.pow(y - centery, 2));

  if (distance < radius) {
    return true;
  }
  else {
    return false;
  }

}

function removeCreature(index) {
  //testCreature[i].brain.send()
  testCreature.splice(index, 1);
  pack--;
}

function updateAreas() {

  simulation.clear();
  updateGameArea();
  updateExplorer();
}

function updateExplorer() {

  expcxt = simulation.explorerContext;
  selectedCreature = getCreature();
  expcxt.font = "20px Arial";
  expcxt.fillStyle = 'black';

  if (selectedCreature == null) {
    //expcxt.fillText("click on a creature to veiw details",10,simulation.explorer.height / 2, simulation.explorer.width);
  }
  else {
    // write creature to explorer
    expcxt.fillText("creature ID : " + selectedCreature.ID, 10, 50, simulation.explorer.width);
    expcxt.fillText("generation : " + selectedCreature.generation, 10, 70, simulation.explorer.width);
    expcxt.fillText("health : " + selectedCreature.Hunger.toFixed(2), 10, 90, simulation.explorer.width);
    expcxt.fillText("cell division in : " + selectedCreature.lifeCycle.toFixed(0), 10, 110, simulation.explorer.width);

    //draw brain animation
    var animationX = 330;
    expcxt.fillText("Network Activation", 90, animationX - 20, simulation.explorer.width);
    ySpaces = (simulation.explorer.height - animationX) / (selectedCreature.brain.structure[0] + 2);
    for (var i = 0; i < selectedCreature.brain.structure[0] + 2; i++) {
      for (var j = 0; j < selectedCreature.brain.structure[i + 1]; j++) {
        //draw a line from point to point
        //width / nodes // / / / / //
        spaces = (sides - 40) / (selectedCreature.brain.structure[i + 1] +1);

        //draw a circle
        //draw from centerpoint startpoint + j * spaces
        x = (j+1) * spaces;
        y = animationX + (ySpaces * i);
        expcxt.beginPath();
        expcxt.arc(x,y,5,0,2*Math.PI);
        expcxt.strokeStyle = "Black";
        expcxt.stroke();

        nVal = 225 - Math.abs(selectedCreature.brain.nodes[i][j]) * 3;
        colour = 'rgb( '+nVal+', '+nVal+', '+nVal+')';
        expcxt.fillStyle = colour;
        expcxt.fill();

      }
    }
  }
}

function getCreature() {
  return simulation.selectedCreature;
}

function updateGameArea() {

  for (var i = 0; i < pack; i++) {

    testCreature[i].hunger();

    if (testCreature[i].lifeCycle <1 && pack < maxCreatures) {
      testCreature[i].cellDivision();
    }

    if (testCreature[i].Hunger < 1) {
    removeCreature(i);
    }
    else {
      testCreature[i].checkFlag();
      testCreature[i].antenaIntersect();
      testCreature[i].creatureIntersect();
      testCreature[i].direct();
      testCreature[i].newPos();
      testCreature[i].bounds();
      testCreature[i].update();
    }
    //debuging space
    if (testCreature[i].brain.DbIdent != testCreature[i].ID && testCreature[i].brain.awaitingAjax === false) {
      alert("BRAINS ARE GETTING MIXED UP!!!!!!!!");
      //also want to check that indexing id right,
    }

    for (var j = 0; j < pack; j++) {
      if (testCreature[i].ID == testCreature[j].ID && testCreature[i].ID != 0 && j != i && testCreature[i].brain.awaitingAjax != true && testCreature[j].brain.awaitingAjax != true) {
        alert ("brains are jumbled" + i + ", " + j);
      }
    }
  }


}



function creature(radius, color, x, y, id) {

  this.R = radius;
  this.speed = 1;
  this.angle = Math.random() * 360;
  this.moveAngle = 0;
  this.x = x;
  this.y = y;
  this.ID =  id;
  this.antenaLen = 100;
  this.isColiding = false;
  this.displayAntena = true;
  this.generation = null;

  this.Mass = 20;
  this.Hunger = 15; //what is the function speed of thing
  this.lifeCycleMax = 1000;
  this.lifeCycle = 1000;
  this.isSelected = false;

  const anteniNum = 11;
  var anteni = new Array();
  for (var i = 0; i < anteniNum; i++) {
    anteni.push(new antena(i, this.antenaLen, anteniNum, 0.2));
  }
  //hold inputs of anteni for drawing and calculations
  this.intArr = new Array(anteniNum * 2);
  this.brain = new brain(anteniNum * 2 + 2);

  this.update = function() {
      ctx = simulation.context;

      if (this.displayAntena == true) {
        this.drawAntena();
      }

      ctx.beginPath();
      ctx.arc(this.x,this.y,this.R,0,2*Math.PI);
      ctx.strokeStyle = "Black";
      if (this.isSelected == true) {
        ctx.lineWidth=2;
      }
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.lineWidth=1;
      if (this.isColiding == true) {
        ctx.fillStyle = '#000000';
        ctx.fill();
      }

  };

  this.forwards = function() {
    //moves a step in direction
    this.speed = 1;
  };

  this.backwards = function() {
    this.speed = -1;
  };

  this.still = function() {
    this.speed = 0;
  };

  this.rotateC = function() {
    this.moveAngle = 2;
  };

  this.rotateAC = function() {
    this.moveAngle = -2;
  };

  this.noRotate = function() {
    this.moveAngle = 0;
  };

  this.newPos = function() {

    this.angle += this.moveAngle * Math.PI / 180;
    this.x += this.speed * Math.sin(this.angle);
    this.y -= this.speed * Math.cos(this.angle);
  };

  this.bounds = function() {
  //would be better if could detect bounds
    if (this.x < this.R) {
      this.x = this.R;
    }
    if(this.x > size - this.R){
      this.x = size - this.R;
    }
    if(this.y < this.R) {
      this.y = this.R;
    }
    if(this.y > size - this.R) {
      this.y = size - this.R;
    }
  };



  this.drawAntena = function() {

    for (var i = 0; i < anteniNum; i++) {

      anteni[i].drawnLen = this.intArr[i*2];
      var thing = simulation.context;
      thing.beginPath();
      thing.moveTo(this.x,this.y);
      thing.lineTo(anteni[i].endX(this.x, this.angle, true), anteni[i].endY(this.y, this.angle, true));
      if (this.intArr[i*2] < this.antenaLen) {
        thing.strokeStyle = "#ff0000";
      }
      else {
        thing.strokeStyle = "#181818";
      }

      thing.stroke();

    }
  };

  this.antenaIntersect = function() {

    for (var i = 0; i < anteniNum; i++) {

      this.intArr[i*2] = this.antenaLen;
      this.intArr[i*2+1] = 0;
      //check for other creatures
      for (var j = 0; j < pack; j++) {
        var curr = this.antenaLen;
        //if antena[i] intersects creature[j] intersectArr = true;
        if (j != testCreature.indexOf(this)) {
          curr = anteni[i].intersects(testCreature[j], this.x, this.y, this.angle);
          if (curr < this.intArr[i*2]) {
            this.intArr[i*2] = curr;
            this.intArr[(i*2)+1] = testCreature[j].Mass;
          }
        }
      }
      //check for walls
      if (this.intArr[(i*2)] == this.antenaLen) {
        this.intArr[(i*2)] = anteni[i].Wall(this.x, this.y, this.angle);
        if (this.intArr[(i*2)] != this.antenaLen) {
          this.intArr[(i*2)+1] = wallMass; //value of wall is 100??? why??
        }
      }
    }
  };

  this.creatureIntersect = function() {
    //reset frame by frame defaults
    this.isColiding = false;
    this.displayAntena = true;
    for (var i = 0; i < pack; i++) {
      if (i != testCreature.indexOf(this) && twoCircles(testCreature[testCreature.indexOf(this)], testCreature[i]) == true)
      {
        this.isColiding = true;
        this.displayAntena = false;
        this.eat(i);
      }
    }
  };

  this.eat = function(j) {
    if (this.Mass > testCreature[j].Mass) {
      this.Hunger+=0.05;
      testCreature[j].Hunger-= 0.1;
    }
    if (this.Mass == testCreature[j].Mass) {
      this.isColiding = false;
    }
  };

  this.hunger = function() { // is being processsed for each creature twice per frame
    if (this.isColiding == false) {
      this.Hunger-= 0.01;
      this.lifeCycle -= 1 ;
    }
  };

  this.cellDivision = function() {
    //if cell has been alive long enough then can have an offspring. pushed onto the array
    testCreature.push(new creature(this.R, "Black", this.x, this.y, null));
    pack++;
    this.lifeCycle = this.lifeCycleMax;
    testCreature[testCreature.length-1].mutate(this.ID);

    //need a function to request mutation, in brain
  };

  this.mutate = function(parentID) {
    this.brain.MutationID = MutationsID;

    this.brain.awaitingAjax = true;
    this.brain.request_child(parentID, MutationsID);
    MutationsID++;
    //sets id from new database entry // this must be wrong
    //this.ID = this.brain.DbIdent;
    if (this.brain.DbIdent == 0) {
      alert ("!!!");
    }
  };

  this.direct = function() {
    //needs an antena reading intarr
    inputsArr = this.intArr.slice();
    //add hunger value
    inputsArr.push(this.Hunger);
    //add colision value
    if (this.isColiding == true) {
      inputsArr.push(10);
    }
    else {
      inputsArr.push(0);
    }
    //call brain function calc
    outputs = this.brain.calculate(inputsArr);

    //or, sliding scale. how defined?? (-2 ---- 2)
    this.moveAngle = sigmoid(outputs[0], 0, 2, 1.2) - 1;
    this.speed = sigmoid(outputs[1], 0, 2, 1.2) - 1;
    //wow look at all the magic numbers!!
  };

  this.checkFlag = function() {
    if (this.brain.flag_infoChange === true) {
      this.ID = this.brain.DbIdent;
      this.Mass = this.brain.mass;
      this.R = (this.brain.mass / 8) + 3; //gives value between 6 and 16
      this.generation = this.brain.generation;
      this.lifeCycleMax = this.brain.lifeCycleMax;
      this.lifeCycle = this.lifeCycleMax;
      this.brain.flag_infoChange = false;
    }
  };

}

function antena(num, length, anteniNum, space){
      this.ID = num;
      this.L = length;
      this.drawnLen = length;
      this.spaces = (anteniNum - 1) / 2;
      this.gap = space;

  this.endX = function(x, angle, type) {
    //what is typeusedfor???
    var length = this.L;
    if (type == true) { length = this.drawnLen;}

    var anteniAngle = angle - (this.gap * this.spaces) + (this.ID*this.gap);
    var endX = x + (length * Math.sin(anteniAngle));
    return endX;
  };

  this.endY = function(y, angle, type) {
    var length = this.L;
    if (type == true) { length = this.drawnLen;}

    var anteniAngle = angle - (this.gap * this.spaces) + (this.ID*this.gap);
    endY = y - (length * Math.cos(anteniAngle));
    return endY;
  };

  this.intersects = function(creature, x, y, angle) {
    //dimentions of creature
    circX = creature.x;
    circY = creature.y;
    //dimentions of line
    startX = x;
    startY = y;
    endX = this.endX(x, angle, false);
    endY = this.endY(y, angle, false);

    return circle(startX, startY, endX, endY, circX, circY, creature.R, this.length);
  };

  this.Wall = function(X, Y, angle) {

    endx = this.endX(X, angle, false);
    endy = this.endY(Y, angle, false);
    len = length;
    if (endx < 0) {
      len = this.wallLineLen(0, X, Y, endx, endy);
    }
    if (endx > size) {
      len = this.wallLineLen(size, X, Y, endx, endy);
    }
    if (endy < 0 ) {
      len = this.wallLineLen(0, Y, X, endy, endx);
    }
    if (endy > size) {
      len = this.wallLineLen(size, Y, X, endy, endx);
    }
    return len;
  };

  this.wallLineLen = function(limit, Srt1st, SrtOth, end1st, endOth) {
    LenAdj = Math.abs(Srt1st - limit);
    percentage = LenAdj / Math.abs(Srt1st - end1st);
    LenOpp = Math.abs(SrtOth - endOth) * percentage;
    return Math.sqrt(Math.pow(LenAdj, 2) + Math.pow(LenOpp, 2));
  };
}


//returns length of line at intersection w. a circle. Or length of line segment if no intersection
function circle(srtX, srtY, endX, endY, circleX, circleY, radius, antenaLen) {

  //return if too far away
  var Hypotenuse = Math.sqrt(Math.pow(srtX - circleX, 2) + Math.pow(srtY - circleY, 2));
  //if (Hypotenuse > antenaLen + radius) {return antenaLen;}

  //slope is vertical rise / horizontal run.
  var hypM = (srtY - circleY) / (srtX - circleX);
  var antM = (endY - srtY) / (endX - srtX);

  //tan of the angle to X = M
  var ang = Math.atan(hypM) - Math.atan(antM);

  //Opposite = sin(θ) * Hypotenuse
  var opposite = Math.sin(ang) * Hypotenuse;

  //adjac is length of line srt to center of instersection/ notintersection
  //diff is the distance from adjac to the edge of the cicle
  var adjac = Math.sqrt(Math.pow(Hypotenuse, 2) - Math.pow(opposite, 2));
  var diff = Math.sqrt(Math.pow(radius, 2) - Math.pow(opposite, 2));

  //catches opposite ghost circle sindrome exeption, checks if intersection is within segment
  minX = Math.min(srtX, endX); maxX = Math.max(srtX, endX);
  minY = Math.min(srtY, endY); maxY = Math.max(srtY, endY);
   if (!(circleX > minX - radius && circleX < maxX + radius) || !(circleY > minY - radius && circleY < maxY + radius)){
    return antenaLen;
  }

  //if oposite > radius then intersection occurs
  if (opposite < radius) {
    //returns
    return adjac - diff;
  }

  else {
    return antenaLen;
  }

}

function twoCircles(creature1, creature2) {

  var distance = Math.sqrt(Math.pow(creature1.x - creature2.x, 2) + Math.pow(creature1.y - creature2.y, 2));
  if (distance < creature1.R + creature2.R) {
    return true;
  }
  else {
    return false;
  }
}

function brain(Inputs) { //pass some sort of json object

  //input = two times anteniNum plus one for hunger;
  //second number isamount of hidden layers .. now this is first number
  //following number is amount of nodes in each hidden layer
  //last is amountof outputs.
  this.DbIdent = null;
  this.structure = [];
  this.inputs = Inputs; //amount of inputs
  this.outputs = 2; //amount of outputs
  this.inputArr = [this.inputs];//array of length of inputs
  this.outputArr = [this.outputs];//array of length of outputs
  this.hidlayers = 0;
  this.layerLen = [];
  this.weights = [];
  this.nodes = [];
  this.flag_infoChange = false;
  this.awaitingAjax = false;
  this.MutationID = null;
  this.mass = 0;
  this.generation = null;
  this.antenaLen = 0;
  this.lifeCycleMax = 1000;

  this.parseBrain = function(data) { //can be used whenever a brain is sent
    //data structure = struct[0], weights[1], dbIdent[2], mass[3], MutaionID[4]
    this.setStructure(data[0]);
    this.setWeights(data[1]);
    this.DbIdent = data[2];
    this.mass = data[3];//sigmoid(data[3], 0, 100, 0)
    this.generation = data[4];
    this.lifeCycleMax = 400 + this.mass * 15; // this is not a very good solution
    //other values to be updated
    this.inputArr = new Array(this.inputs);
    this.outputArr = new Array(this.outputs);
    this.hidlayers = this.structure[0];
    this.layerLen = [];
    //bodgy solution to a problem
    this.antenaLen = 100;

    //this.layerLen[0] = this.inputs;
    for (var i = 0; i < this.structure.length-1; i++) {
      this.layerLen.push(this.structure[i+1]);
    }

    this.nodes = [];
    //this.nodes = [this.hidlayers+2]; build node array
    for (var i = 0; i < this.structure.length -1 ; i++) {
      this.nodes.push(new Array(this.structure[i+1]));
      for (var j = 0; j < this.structure[i+1]; j++) {
        this.nodes[i][j] = 0;
      }
    }
    this.flag_infoChange = true;
  };

  this.setStructure = function(struct) {
    this.structure = struct.slice();
  };

  this.setWeights = function(wgt) {
    this.weights = wgt.slice();
  };

  this.request_spawn = function() {
    data = $.ajax({
      'async': false,
      'global': false,
      'url': "/spawn",
      'dataType': "json",
      'data' : jQuery.param({
        inputs : this.inputs,
        outputs : this.outputs,

      })
    }).responseJSON;
    console.log(data)
    this.parseBrain(data);
    return;//set brain to these vals
  };

  this.request_child = function(parentID, index) {
    if (isNaN(parentID === true)) {
      alert("bad id data from mutID:" + index );
    }
    $.ajax({
      'async': true,
      'global': false,
      'url': "/mutate",
      'dataType': "json",
      'data' : jQuery.param({
        id : parentID,
        Index : index
      }),
      'success' : function(data) {
        for (var i = 0; i < pack; i++) {
          if (testCreature[i].brain.MutationID === data[data.length - 1]) {
          testCreature[i].brain.parseBrain(data);
          testCreature[i].brain.awaitingAjax = false;
          }
        }
      }
    }).responseJSON;
    return;//set brain to these vals
  };

  this.calculate = function(inputVals) {
    //returns array of outputs
    //runs through matrix multiplication on 3d array of weights

    //adds inputs
    antenaNum = 11;
    this.nodes[0] = inputVals.slice();

    //flips outputs to 0 = full antenna len.
    for (var i = 0; i < antenaNum; i++) {
      this.nodes[0][i*2] = this.antenaLen - this.nodes[0][i*2];
      //this.nodes[0][(i*2)+1] = 100 - this.nodes[0][(i*2)+1];

    }

    //iterates layers, missing inputs
    for (var i = 0; i < this.nodes.length - 1; i++) {
      //iterates nodes
      for (var j = 0; j < this.nodes[i+1].length; j++) {
        //reset node to 0;
        this.nodes[i+1][j] = 0;
        //iterates wieghts, also looking back to input layers
        for (var k = 0; k < this.nodes[i].length; k++) {
          this.nodes[i+1][j] += this.nodes[i][k] * this.weights[i][j][k];
        }
        this.nodes[i+1][j] += biasSize * this.weights[i][j][this.weights[i][j].length - 1]
      }
    } //this is going to need significant debuging
    outputArr = new Array(this.outputs);
    for (var i = 0; i < this.outputs; i++) {
      outputArr[i] = this.nodes[this.nodes.length - 1][i];
    }

    //console.log(outputArr);
    return outputArr;
  };

  this.send = function() { // parameters = some stats
    //ToDo

  };


}

function sigmoid(X, Mid, L, K) { //(x = input, mid = X midpoint, L = Max value, k = steepness)
  //sigmoid where min Y allways == 0
  return L/(1+Math.pow(Math.E, 0-K*(X - Mid)));
}