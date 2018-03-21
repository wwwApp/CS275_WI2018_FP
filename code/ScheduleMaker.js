var express = require('express');
var tmsparser = require('./TMSParser.js');

var app = express();
app.use(express.static("."));
var parser = new tmsparser.ClassParser();

app.get("/getSchedules", function(req, res) {
  var classls = req.query.classls;
  classls = parseInput(classls);
  var honors = req.query.honors;
  var timeoff = req.query.timeoff;
  parser.once('classList', function(msg) {
    if(typeof(timeoff) != "undefined") {
      timeoff = timeoff.split(",");
      timeoff[1] = timeoff[1].replace(/_/g, " ");
      formattedtime = parseTime(timeoff[1]);
      var timeoffObj = {
        subject : "",
        number : "",
        type : "Custom",
        section : "",
        crn : "",
        day : timeoff[0],
        normaltime : timeoff[1],
        time : formattedtime
      }
      msg.push([timeoffObj]);
    }

    var validSchedules = getSchedules(msg);
    var finalSchedule = removeInvalidHonors(validSchedules);
    if(typeof(honors) != "undefined") {
      finalSchedule = filterHonors(finalSchedule, honors);
    }
    html = "<table cellspacing='10'>";
    html += "<tr><th>CRN</th><th>Subject</th><th>Number</th><th>Section</th><th>Type</th><th>Time(s)</th></tr>";
    for(var i = 0; i < finalSchedule.length; i++) {
      for(var j = 0; j < finalSchedule[i].length; j++) {
        html += "<tr>";
        html += "<td>";
        var crn = finalSchedule[i][j].crn;
        html += crn + "</td><td>";
        var subject = finalSchedule[i][j].subject;
        html += subject + "</td><td>";
        var number = finalSchedule[i][j].number;
        html += number + "</td><td>";
        var section = finalSchedule[i][j].section;
        html += section + "</td><td>";
        if(finalSchedule[i][j].type == "Lab &amp; Recitation") {
          var type = finalSchedule[i][j].type;
          html += "Lab & Recitation" + "</td><td>";
          var labday = finalSchedule[i][j].labday;
          html += labday + "</td><td>";
          var labtime = finalSchedule[i][j].normallabtime;
          html += labtime + "</td><td>";
          var recitationday = finalSchedule[i][j].recitationday;
          html += recitationday + "</td><td>";
          var recitationtime = finalSchedule[i][j].normalrecittationtime;
          html += recitationtime + "</td></tr>";
        }
        else {
          var type = finalSchedule[i][j].type;
          html += type + "</td><td>";
          var day = finalSchedule[i][j].day;
          html += day + "</td><td>";
          var time = finalSchedule[i][j].normaltime;
          html += time + "</td></tr>";
        }
      }
      html += "<tr><td><p> </P></td></tr>";
    }
    html += "</table>";

    res.send(html);
  });
  parser.getClassList(classls);

});

function filterHonors(classls, showHonors) {
  var onlyhonors = [];
  var nohonors = [];
  for(var i = 0; i < classls.length; i++) {
    for(var j = 0; j < classls[i].length; j++) {
      if(classls[i][j].section.includes("H")) {
        onlyhonors.push(classls[i]);
        break;
      }
    }
  }
  for(var i = 0; i < classls.length; i++) {
    for(var j = 0; j < classls[i].length; j++) {
      if(!classls[i][j].section.includes("H")) {
        nohonors.push(classls[i]);
        break;
      }
    }
  }

  if(showHonors == "1") {
    return onlyhonors;
  }
  else {
    return nohonors;
  }
}

function parseTime(timeString) {
	var timeArr = timeString.split(/[\s:]+/);
	var milArr = [0,0];
	milArr[0] = parseInt(timeArr[0]);
	milArr[1] = parseInt(timeArr[4]);

	if(timeArr[2] == "am" && milArr[0] == 12) {
		milArr[0] = 0;
	}
	else if(timeArr[2] == "pm" && milArr[0] != 12) {
		milArr[0] = milArr[0] + 12;
	}

	if(timeArr[6] == "am" && milArr[1] == 12) {
		milArr[1] = 0;
	}
	else if(timeArr[6] == "pm" && milArr[1] != 12) {
		milArr[1] = milArr[1] + 12;
	}

  return [parseInt(milArr[0]+""+timeArr[1]), parseInt(milArr[1]+""+timeArr[5])];
}



function parseInput(inp) {
  var splitClasses = inp.split(";");
  var currentClass;
  for(var i = 0; i < splitClasses.length; i++) {
    splitClasses[i] = splitClasses[i].split(",");
    splitClasses[i][1] = parseInt(splitClasses[i][1]);
  }
  return splitClasses;
}

function removeInvalidHonors(scheduleLs) {
  var newScheduleLs = [];
  for(var i = 0; i < scheduleLs.length; i++) {
    if(isValidHonors(scheduleLs[i])) {
      newScheduleLs.push(scheduleLs[i]);
    }
  }
  return newScheduleLs;
}

function isValidHonors(schedule) {
  for(var i = 0; i < schedule.length; i++) {
    if(schedule[i].section.includes("H")) {
      for(var j = 0; j < schedule.length; j++) {
        if((schedule[i].subject == schedule[j].subject) && (schedule[i].number == schedule[j].number) && (i != j)) {
          if(!schedule[j].section.includes("H")) {
            return false;
          }
        }
      }
    }
  }
  return true;
}

function dist_concat(el, ls) {
  var curr = [];
  var newLs = [];
  for(var i = 0; i < ls.length; i++) {
    curr.push(el);
    curr = curr.concat(ls[i]);
    newLs.push(curr);
    curr = [];
  }
  return newLs;
}

function getCombinations(ls, oldMasterLs) {
  var masterLs = [];
  var currLs = [];
  var currEl;
  for(var i = 0; i < ls.length; i++) {
    currEl = ls[i];
    currLs = dist_concat(currEl, oldMasterLs);
    masterLs = masterLs.concat(currLs);
    currLs = [];
  }
  return masterLs;
}

function getAllCombinations(ls) {
  var masterLs = [];
  var currentLs = getCombinations(ls[ls.length-1], [[]]);
  for(var i = ls.length-2; i >= 0; i--) {
    currentLs = getCombinations(ls[i], currentLs);
  }
  return currentLs;
}

function getSchedules(classLs) {
  var schedules = getAllCombinations(classLs)
  var masterSchedule = [];
  for(var i = 0; i < schedules.length; i++) {
    if(isValidSchedule(schedules[i])) {
      masterSchedule.push(schedules[i]);
    }
  }
  return masterSchedule;
}


//checks if the current classes are valid for first part
function isValidSchedule(currentLs) {
  for(var i = 0; i < currentLs.length; i++) {
    for(var j = i+1; j < currentLs.length; j++) {
      if(hasConflict(currentLs[i], currentLs[j])) {
        return false
      }
    }
  }
  return true;
}


//checks for time conflicts by distributing time and checking for overlap
function hasConflict(classObj1, classObj2) {

  if(classObj1.type == "Lab &amp; Recitation" && classObj2.type == "Lab &amp; Recitation") {
    var labtime1 = classObj1.labtime;
    var recitationtime1 = classObj1.recitationtime;
    var labday1 = classObj1.labday;
    var recitationday1 = classObj1.recitationday;
    var labtime2 = classObj2.labtime;
    var recitationtime2 = classObj2.recitationtime;
    var labday2 = classObj2.labday;
    var recitationday2 = classObj2.recitationday;
    return hasTimeConflict(labtime1, labday1, labtime2, labday2) ||
            hasTimeConflict(labtime1, labday1, recitationtime2, recitationday2) ||
            hasTimeConflict(recitationtime1, recitationday1, labtime2, labday2) ||
            hasTimeConflict(recitationtime1, recitationday1, recitationtime2, recitationday2);
  }
  else if(classObj1.type == "Lab &amp; Recitation") {
    var labtime = classObj1.labtime;
    var recitationtime = classObj1.recitationtime;
    var labday = classObj1.labday;
    var recitationday = classObj1.recitationday;
    var time2 = classObj2.time;
    var day2 = classObj2.day;
    return hasTimeConflict(labtime, labday, time2, day2) || hasTimeConflict(recitationtime, recitationday, time2, day2);
  }
  else if(classObj2.type == "Lab &amp; Recitation") {
    var labtime = classObj2.labtime;
    var recitationtime = classObj2.recitationtime;
    var labday = classObj2.labday;
    var recitationday = classObj2.recitationday;
    var time2 = classObj1.time;
    var day2 = classObj1.day;
    return hasTimeConflict(labtime, labday, time2, day2) || hasTimeConflict(recitationtime, recitationday, time2, day2);
  }
  else {
    var time1 = classObj1.time;
    var day1 = classObj1.day;
    var time2 = classObj2.time;
    var day2 = classObj2.day;
    return hasTimeConflict(time1, day1, time2, day2);
  }
}

function hasTimeConflict(time1, day1, time2, day2) {
  if((day1.includes("M") && day2.includes("M")) ||
     (day1.includes("T") && day2.includes("T")) ||
     (day1.includes("W") && day2.includes("W")) ||
     (day1.includes("R") && day2.includes("R")) ||
     (day1.includes("F") && day2.includes("F"))) {

    var time1Start = time1[0];
    var time2Start = time2[0];
    var time1End = time1[1];
    var time2End = time2[1];

    if(time1Start < time2Start) {
      return time1End - time2Start >= 0;
    }
    else if(time2Start < time1Start) {
      return time2End - time1Start >= 0;
    }
    else {
      return true;
    }
  }
  else {
    return false;
  }
}

app.listen(8080);
