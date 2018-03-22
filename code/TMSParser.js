'use strict'

var request = require('request');
var cheerio = require('cheerio');

var EventEmitter = require('events').EventEmitter;

const emitter = new EventEmitter();
var classList = [];
var cntr = 0;
var completedCntr = 0;

class ClassParser extends EventEmitter {
	constructor() {
		super();
	}

	//gets a list of all classes that were sent back in request
	getClassList(clsLs) {
		var self = this;
		emitter.once("completedList", function(msg) {
			self.emit("classList", msg);
			classList = [];
			cntr = 0;
			completedCntr = 0;
		});
		getClasses(clsLs);
	}

}

//class that is exported for use in ScheduleMaker file
exports.ClassParser = ClassParser;

//callback function that is used by request
function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
				var $ = cheerio.load(body);
				var innerTable = "<table>" + $('.even').parent().html() + "</table>";
				$ = cheerio.load(innerTable);
				var currentClass = organizeArray(parseHTML($, this.subject));

				classList.push(currentClass[0]);
				if(currentClass[1].length != 0) {
					classList.push(currentClass[1]);
				}
				if(currentClass[2].length != 0) {
					classList.push(currentClass[2]);
				}
				if(currentClass[3].length != 0) {
					classList.push(currentClass[3]);
				}

				cntr++;
				if(cntr == completedCntr) {
					emitter.emit("completedList", classList);
				}
		}
}

//organizes the labs with their lecture and formats the time
function organizeArray(array) {
	var labs = [];
	var recit = [];
	var labandrecit = [];
	for(var i = 0; i < array.length; i++) {
		if(array[i].type == "Lab") {
			array[i].time = parseTime(array[i].time);
			labs.push(array[i]);
			array.splice(i, 1);
			i--;
		}
		else if(array[i].type == "Lab &amp; Recitation") {
			array[i].labtime = parseTime(array[i].labtime);
			array[i].recitationtime = parseTime(array[i].recitationtime);
			labandrecit.push(array[i]);
			array.splice(i, 1);
			i--;
		}
		else if(array[i].type == "Recitation/Discussion") {
			array[i].time = parseTime(array[i].time);
			recit.push(array[i]);
			array.splice(i, 1);
			i--;
		}
		else {
			array[i].time = parseTime(array[i].time);
		}
	}
	return [array, labs, recit, labandrecit];
}

//parses the time into a 24 hour format then turns it into an integer for use
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

//parses HTML of Drexel's TMS site to get table
function parseHTML(selector, subject) {
	var $ = selector;
	var arr = [];
	var element = [];
	for(var i = 1; $('tr').eq(i).html() != null; i++) {
		element = parseRow($('tr').eq(i).html());
		if(element.subject == subject) {
			arr.push(element)
		}
	}
	return arr;
}

//parses a single entry of Drexel's TMS site and takes out specific data
function parseRow(row) {
	var arr = row.split(/[><]+/);
	if(arr.length < 20 || arr[18] == 'p title="FULL"' || arr[41] == 'TBD') {
		return ['ignore']
	}
	else if (arr[10] == "Lab &amp; Recitation") {
		var classObj = {
			subject : arr[2],
			number : arr[6],
			type : arr[10],
			section : arr[14],
			crn : arr[20],
			labday : arr[37],
			normallabtime : arr[41],
			labtime : arr[41],
			recitationday : arr[48],
			normalrecittationtime : arr[52],
			recitationtime : arr[52]
		}
		return classObj;
	}
	else {
		var classObj = {
			subject : arr[2],
			number : arr[6],
			type : arr[10],
			section : arr[14],
			crn : arr[20],
			day : arr[37],
			normaltime : arr[41],
			time : arr[41]
		}
		return classObj;
	}
}

//makes a request to Drexel's TMS with a specific course number
function makeRequest(crsSub, crsNum) {
	var options = {
    	url: 'https://termmasterschedule.drexel.edu/webtms_du/app?formids=term%2CcourseName%2CcrseNumb%2Ccrn&component=searchForm&page=Home&service=direct&submitmode=submit&submitname=&term=1&crseNumb='+crsNum,
    	method: 'POST',
	};
	request(options, callback.bind({subject : crsSub}));
}

//makes multiple requests from a list of classes
function getClasses(crsList) {
	completedCntr = crsList.length;
	for(var i = 0; i < crsList.length; i++) {
		makeRequest(crsList[i][0], crsList[i][1]);
	}
}
