// CUSTOM JS FILE //
// var map; // global map variable
// var markers = []; // array to hold map markers



jQuery("#addForm").submit(function(e){

  // first, let's pull out all the values
  // the name form field value
  var name = jQuery("#name").val();
  // var audio = jQuery("#audio").val();

  var fd = new FormData();
  fd.append('name', name);
  fd.append('audio', $('input[type=file]')[0].files[0]);
  fd.append('image', $('input[type=file]')[1].files[0]);
  
  

  // POST the data from above to our API create route
  jQuery.ajax({
    url : '/api/create/submition',
    dataType : 'json',
    type : 'POST',
    processData: false,
    contentType: false,
    // we send the data in a data object (with key/value pairs)
    data : fd,
    success : function(response){
      if(response.status=="OK"){
        // success
        console.log(response);
        // re-render the map
        renderPlaces();
        // now, clear the input fields
        jQuery("#addForm input").val('');
      }
      else {
        alert("something went wrong");
      }
    },
    error : function(err){
      // do error checking
      alert("something went wrong");
      console.error(err);
    }
  });

  // prevents the form from submitting normally
  e.preventDefault();
  return false;

});

var getARContent = function() {


  // console.log("places rendered");

  jQuery.ajax({
    url : '/api/get',
    dataType : 'json',
    success : function(response) {

      console.log(response);
      memories = response.memories;
      console.log(memories);

      // renderMemories(memories);
      changeAudio(memories);

    }
  })
};


var renderPlaces = function() {


  // console.log("places rendered");

  jQuery.ajax({
    url : '/api/get',
    dataType : 'json',
    success : function(response) {

      console.log(response);
      memories = response.memories;
      console.log(memories);

      // renderMemories(memories);
      // changeAudio(memories);

    }
  })
};




function renderMemories(memories){
	console.log(memories);

	// first, make sure the #animal-holder is empty
	jQuery('#animal-holder').empty();

	// loop through all the animals and add them in the animal-holder div

		
		// 'add this as test html';
    for(var i=0;i<memories.length;i++){

      var htmlToAdd = 
		'<div class="col-md-4 animal">'+
			'<img class="url" src="'+memories[i].image+'">'+
			'<img class="url" src="'+memories[i].audio+'">'+
			'<h1 class="name">'+memories[i].name+'</h1>'+
		'</div>';

		jQuery('#animal-holder').prepend(htmlToAdd);
    }

	
}


var audio_context;
var recorder;

function startUserMedia(stream) {


    var input = audio_context.createMediaStreamSource(stream);
    console.log('Media stream created.');
    // Uncomment if you want the audio to feedback directly
    //input.connect(audio_context.destination);
    //console.log('Input connected to audio context destination.');

    recorder = new Recorder(input);
    console.log('Recorder initialised.');
    }
    function startRecording(button) {
      recorder && recorder.record();
      button.disabled = true;
      button.nextElementSibling.disabled = false;
      console.log('Recording...');
    }
    function stopRecording(button) {
      recorder && recorder.stop();
      button.disabled = true;
      button.previousElementSibling.disabled = false;
      console.log('Stopped recording.');
    // create WAV download link using audio data blob
    }


function submitMemory(){

  

  var name = jQuery("#name").val();
  // var audio = jQuery("#audio").val();

  //var fd = new FormData();
  var fd = {};

  //AUDIO FILE!!!
  recorder && recorder.exportWAV(function(blob) {

  var canv = document.getElementById('mapcanvas');
  var dataUrl = canv.toDataURL('image/png',0.1);

  fd.name = name;
  fd.audio = null;
  fd.image = dataUrl;

  var blobToBase64 = function(theBlob, cb) {
    var reader = new FileReader();
    reader.onload = function() {
      var dataUrl = reader.result;
      var base64 = dataUrl.split(',')[1];
      cb(base64);
    };
    reader.readAsDataURL(theBlob);
	};
	
	blobToBase64(blob, function(base64Audio){ // encode
	  fd.audio = base64Audio;
	  console.log(fd);
	  ajaxPost(fd);
	})  

    clear();
    recorder.clear();
  });

  // 
}


function ajaxPost(fd){
	    // POST the data from above to our API create route
    jQuery.ajax({
      url : '/api/create/image',
      method : 'POST',
      // we send the data in a data object (with key/value pairs)
      data : fd,
      success : function(response){
        if(response.status == "OK"){
          // success
          console.log(response);
          // re-render the map
          // renderPlaces();
          // // now, clear the input fields
          // jQuery("#addForm input").val('');

          window.location.href = "/thankyou";
        }
        else {
          console.log("head issue");
        }
      },
      error : function(err){
        // do error checking
        alert("something went wrong wtf???");
        console.error(err);
      }
    });

    // 
}

  window.onload = function init() {
    try {
      // webkit shim
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
      window.URL = window.URL || window.webkitURL;
      
      audio_context = new AudioContext;
      console.log('Audio context set up.');
      console.log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
    } catch (e) {
      alert('No web audio support in this browser!');
    }
    
    navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
      console.log('No live audio input: ' + e);
    });
};


var canvas;
var button;



function preload() {
  img = loadImage("img/WSP.png");
}

function setup(){
  // background(255);

  var mapwidth = displayWidth - 80;
  var mapheight = displayWidth - 225;
  
  canvas = createCanvas(mapwidth, mapheight);
  // canvas.position(300, 50);
  canvas.class("map");
  canvas.id("mapcanvas");
  canvas.parent('sketch-holder');

  button = createButton('clear canvas');
  // button.position(900, 1150);
  button.id("clearButton");
  button.parent('sketch-holder');
  button.mousePressed(clearDrawing)

  // image(img, 0, 0);
}
  
function draw(){
  if(mouseIsPressed){
    stroke(255,0,0);
    strokeWeight(3); 
    line(pmouseX,pmouseY,mouseX,mouseY)
    }
  
  if (mouseIsPressed && mouseButton == RIGHT){
    // image(img, 0, 0);
  }
}

function touchMoved() {
    stroke(255,0,0);
    strokeWeight(3); 
    line(pmouseX,pmouseY,mouseX,mouseY)
}


function clearDrawing(){
  clear();
}








