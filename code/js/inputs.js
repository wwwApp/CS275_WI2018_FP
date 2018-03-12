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
  mm_select();
  others_select();
  days_select();
  time_inputs();
});

/**
 * Adds Course Inputs to course_list to send to server
 * course_list is a string containing all inputted courses parsed by ','
 */
function course_select()
{
  var course_inputs = document.getElementsByClassName('courses');
  for (var i = 0; course_inputs[i].value; i++){
    course_list += course_inputs[i].value + ",";
  }
  course_list = course_list.slice(0, -1); // Remove trailing ','
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
  $('.others:checked').each(function(i) {
    others_list += $(this).val() + ",";
  });
  others_list = others_list.slice(0, -1); // Remove trailing ','
}

/**
 * Adds inputed days data into days_list
 */
function days_select()
{
  $('.days:checked').each(function(i) {
    days_list += $(this).val() + ",";
  });
  days_list = days_list.slice(0, -1); // Remove trailing ','
  alert(days_list);
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
  time_data += fromTime + fromOpt + ',' + toTime + toOpt;
}

/**
 * Replace #addMore with an input box and same button
 */
function add_more()
{
  var replace_str = "<li> <input class='courses' type='text' name='course'> </li>"
                  + "<li> <button class='btn' id='addMore' type='button' onclick='add_more()'>Add More Courses</button>";
  $("#addMore").replaceWith(replace_str);
}