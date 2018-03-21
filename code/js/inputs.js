// Global variables
var course_list = "";
var major_list = "";
var minor_list = "";
var others_list = "";
var days_list = "";
var time_data = "";
//////////////////
/**
 * Runs neccessary functions to import all data in lists to sever
 */
$("#btSchedule").click(function() {
  course_select();
});

/**
 * Runs required functions to retrieve data
 */
function add_data()
{
  mm_select();
  others_select();
  days_select();
  time_inputs();
  format();
}

/**
 * Resets all inputted data
 */
function reset()
{
  course_list = "";
  major_list = "";
  minor_list = "";
  others_list = "";
  days_list = "";
  time_data = "";
}

/**
 * Adds Course Inputs to course_list to send to server
 * course_list is a string containing all inputted courses parsed by ','
 */
function course_select()
{
  courseID = "";
  courseNUM  = "";
  var course_inputs = document.getElementsByClassName('courses');
  for (var i = 0; course_inputs[i].value; i++){
    courseID = course_inputs[i].value.split(/[0-9]/)[0];
    courseNUM = course_inputs[i].value.slice(courseID.length, course_inputs[i].value.length);
    course_list += courseID + "," + courseNUM + ";";
  }
  course_list = course_list.slice(0, -1); // Remove trailing ','

  // Error Checking
  if (course_list.replace(/[^;]/g, "").length < 2){
    var error = document.getElementsByClassName('lead');
    error[1].innerHTML = "Enter courses you'd like to enroll for in the order of priority</p>"
                       + "<p style='color:red'> Please Enter At Least 4 Courses </p>";
    window.scrollTo(0, 0);
  }
  else add_data();
}

/**
 * Adds major / minor selections to mm_list string
 */
function mm_select()
{
  var mm_inputs = $('#major').val();
  major_list = mm_inputs;
}

/**
 * Adds inputed others data into others_list
 */
function others_select()
{

  others_list = 0;
  $('.others:checked').each(function(i) {
    others_list = 1;
  });
}

/**
 * Adds inputed days data into days_list
 */
function days_select()
{
  $('.days:checked').each(function(i) {
    days_list += $(this).val();
  });
}

/**
 * Adds time inputs to time_data
 */
function time_inputs()
{
  var fromTime = document.getElementById('fromTime').value;
  var toTime = document.getElementById('toTime').value;
  var fromOpt = $('#fromDaytime option:selected').val();
  var toOpt = $('#toDaytime option:selected').val();
  if ( (fromTime != "") && (toTime != "") ) {
    time_data += fromTime + "_" + fromOpt + '_-_' + toTime + "_" + toOpt;
  }
}

/**
 * Replace #addMore with an input box and same button
 */
function add_more()
{
  var replace_str = "<li> <input class='courses' type='text' name='course' placeholder='i.e. CS275'> </li>"
                  + "<li> <button class='btn' id='addMore' type='button' onclick='add_more()'>Add More Courses</button>";
  $("#addMore").replaceWith(replace_str);
}

/**
 * Formats and put inputed data into one string
 */
function format()
{
  var request = "";
  request += "classls=" + course_list;
  if (others_list != "") request += "&honors=" + others_list;
  if (days_list != "") request += "&timeoff=" + days_list;
  if (time_data != "") request += "," + time_data;
  request_schedule(request);
}

/**
 * Sends an GET request to server to retrieve schedule data
 */
function request_schedule(request)
{
  var url = "http://localhost:8080/getSchedules?"
          + "classls=" + course_list
          + "&honors=" + others_list;

  if (days_list != "") {
    url += "&timeoff=" + days_list + "," + time_data;
  }

  var table = document.getElementById('displaySchedule');

  alert(url);
  table.innerHTML = "Loading...";

  $.ajax({
    type: "GET",
    url: url,
    data: '{}',
    dataType: "html",
    success: function(msg){
      table.innerHTML = msg;
    },
    error: function (xhr, ajaxOptions, thrownError) {
      alert("Could not retrieve schedule at this time, please try again later.");
    }
  });
  request = "";
  reset();
}
