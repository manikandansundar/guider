var map;
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var user_lat = '';
var user_lng = '';
var dir_start;
var dir_end;
var usermap_marker;

if($.trim(localStorage.user_saved_places_title) == '')
{
	localStorage.user_saved_places_title = '';
	var temp_user_data = '';
	var temp_user_data_array = new Array();
	
	
	var temp_user_positon = ''
	var temp_position_array = new Array();
}
else
{
	var temp_user_data = localStorage.user_saved_places_title;
	var temp_user_data_array = temp_user_data.split('#');
	
	
	var temp_user_positon = localStorage.user_saved_places_position
	var temp_position_array = temp_user_positon.split('#');
}

if($.trim(localStorage.user_saved_places_position) == '')
{
	localStorage.user_saved_places_position = '';
}


document.addEventListener("deviceready", onDeviceReady, false);
/*$(document).ready(function(){
	onDeviceReady();
});*/

// Cordova is ready
//
function onDeviceReady() {
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
	document.addEventListener("menubutton", showMenuIcons, false);
}

// onSuccess Geolocation
//
function onSuccess(position) {
	user_lat = position.coords.latitude
	user_lng = position.coords.longitude
    initialize();
}

// onError Callback receives a PositionError object
//
function onError(error) {
    alert('code: '    + error.code    + '\n' +
            'message: ' + error.message + '\n');
}

function showMenuIcons()
{
	$('#tool_box').fadeToggle('slow');
}

function addMarker(lat,lng)
{
	var myLatlng = new google.maps.LatLng(lat , lng);
	usermap_marker = new google.maps.Marker({
	      position: myLatlng,
	      map: map,
		  draggable:false,
		  icon:'mark.png'
	});
	
	google.maps.event.addListener(usermap_marker, 'click', function() {
		//if($.trim(marker.title) == '')
		{
			var place_name = prompt('Enter place name');
			usermap_marker.setTitle(place_name);
			localStorage.user_saved_places_title += place_name+'#';
			localStorage.user_saved_places_position += usermap_marker.getPosition().toString()+'#';
			
			temp_user_data = localStorage.user_saved_places_title;
			temp_user_data_array = temp_user_data.split('#');
			
			
			temp_user_positon = localStorage.user_saved_places_position
			temp_position_array = temp_user_positon.split('#');
		}
	});
	
	//drawCircle(myLatlng);
}

function drawCircle(myLatlng)
{
	var circleOptions = {
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: map,
      center: myLatlng,
      radius: 20
    };
    cityCircle = new google.maps.Circle(circleOptions);
}

function initialize() {
	directionsDisplay = new google.maps.DirectionsRenderer();
	var mapOptions = {
	    zoom: 18,
	    center: new google.maps.LatLng(user_lat, user_lng),
	    mapTypeId: google.maps.MapTypeId.ROADMAP
	  };
	map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
	directionsDisplay.setMap(map);
	addMarker(user_lat,user_lng);
	
	setTimeout(function(){
		navigator.geolocation.getCurrentPosition(onRecursiveSuccess, onError);
	},1000);
}

function onRecursiveSuccess(position) {
	user_lat = position.coords.latitude
	user_lng = position.coords.longitude
    usermap_marker.setMap(null);
	addMarker(user_lat,user_lng)
	setTimeout(function(){
		navigator.geolocation.getCurrentPosition(onRecursiveSuccess, onError);
	},1000);
}

function showPlaces()
{
	if(temp_user_data.length > 0)
	{
		$('#places_list').html('');
		for(i in temp_user_data_array)
		{
			var temp_place_name = temp_user_data_array[i];
			if(temp_place_name != '')
			{
				var div_places = '<div><label><input class="selected_place" type="radio" name="user_paces_lists" id="user_place_chbx_'+i+'" value="'+temp_position_array[i]+'"/>'+temp_place_name+'</label></div>';
				$('#places_list').append(div_places);
			}
		}
		dir_start = new google.maps.LatLng(user_lat, user_lng);
		$('#direction_guide').show();
	}
}

function getDirection() {
  var dir_end_pos = $.trim($('.selected_place:checked').val());
  var temp_end_dir = dir_end_pos.split(',');
  dir_end = new google.maps.LatLng(temp_end_dir[0], temp_end_dir[1]);
  /*dir_start = new google.maps.LatLng(37.7699298, -122.4469157);
  dir_end = new google.maps.LatLng(37.7683909618184, -122.51089453697205);*/
  var request = {
      origin: dir_start,
      destination: dir_end,
      // Note that Javascript allows us to access the constant
      // using square brackets and a string value as its
      // "property."
      travelMode: google.maps.DirectionsTravelMode.DRIVING
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    }
  });
  calculateDistances();
}

function calculateDistances() {
  var dir_end_pos = $.trim($('.selected_place:checked').val());
  var temp_end_dir = dir_end_pos.split(',');
  dir_end = new google.maps.LatLng(temp_end_dir[0], temp_end_dir[1]);
  /*dir_start = new google.maps.LatLng(37.7699298, -122.4469157);
  dir_end = new google.maps.LatLng(37.7683909618184, -122.51089453697205);*/
  var service = new google.maps.DistanceMatrixService();
  service.getDistanceMatrix(
    {
      origins: [dir_start],
      destinations: [dir_end],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    }, callback);
}

function callback(response, status) {
  if (status != google.maps.DistanceMatrixStatus.OK) {
    alert('Error was: ' + status);
  } else {
    var origins = response.originAddresses;
    var destinations = response.destinationAddresses;

    for (var i = 0; i < origins.length; i++) {
      var results = response.rows[i].elements;
      for (var j = 0; j < results.length; j++) {
        alert('Total Distance : '+results[j].distance.text);
		alert('Total Duration : '+results[j].duration.text);
      }
    }
  }
}

function closeApp()
{
	if (navigator.app && navigator.app.exitApp) {
    navigator.app.exitApp();
	} else if (navigator.device && navigator.device.exitApp) {
	    navigator.device.exitApp();
	}
}

$(window).click(function(){
	//$('#tool_box').fadeToggle('slow');
});