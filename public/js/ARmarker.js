var sometrack = document.getElementById('sometrack');
var currentMap;


window.onload= function(){
	getARContent();
}

var getARContent = function() {

  jQuery.ajax({
    url : '/api/get',
    dataType : 'json',
    success : function(response) {

      // console.log(response);
      memories = response.memories;
      console.log(memories);
      changeAudio(memories);
    }
  })
};

function changeAudio(memories){

	if(typeof(Storage) !== "undefined") {

        if (localStorage.clickcount && localStorage.clickcount < memories.length-1 ) {
            localStorage.clickcount = Number(localStorage.clickcount)+1;
        } else {
            localStorage.clickcount = 0;
        }
        console.log("local storage : " + localStorage.clickcount );
    } else {
        console.log("can't do it");
    }

	var memorycount = localStorage.clickcount;
	console.log("memory number:  " + memorycount)

	var currentTrack = memories[memorycount].audio;
	currentMap = memories[memorycount].image;

	console.log("called for source track");
    var audio = document.getElementById('tracksource');

    audio.src = currentTrack;
}

function playAudio() { 
	sometrack.load();
   	sometrack.play(); 
} 

function pauseAudio() { 
   sometrack.pause(); 
} 

//ARTOOLKIT stuff
if (window.ARController && ARController.getUserMediaThreeScene) {
  ARThreeOnLoad()
}

var cameranum = 0;

var videoParams;

function ARThreeOnLoad() {
	videoParams = {};

  navigator
    .mediaDevices
    .enumerateDevices()
    .then(function(devices) {
      var device = devices.find(function(element) {
      	console.log(element)


      	// if(element.label.indexOf("back") != -1){
      	// 	videoParams = {
			    //   	deviceId: element.deviceId
			   	// } 
      	
      	if(element.kind == "videoinput"){
      		cameranum++;
      		if(cameranum == 2){
	 			videoParams = {
			      	deviceId: element.deviceId
			   	} 
      		}
      	}
      })

      gotStream(window.stream,videoParams)

    })
    .catch(function(err) {
      alert(err.name + ": " + err.message);
    })
}

function gotStream(stream,videoParams) {
var video = document.createElement('video');
  window.stream = stream; // make stream available to console
  video.srcObject = stream;
    ARController.getUserMediaThreeScene({
    maxARVideoSize: 640,
    cameraParam:    'Data/camera_para.dat',
    facingMode: 	"environment",
    deviceId:       videoParams.deviceId,
    onSuccess:      createAR
  })
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

function createAR(arScene, arController, arCameraParam) {
// function ARThreeOnLoad(arScene, arController, arCameraParam) {

	var canvasHolder = $('#canvasHolder');

	document.body.className = arController.orientation;

	arController.setPatternDetectionMode(artoolkit.AR_MATRIX_CODE_DETECTION);

	var renderer = new THREE.WebGLRenderer({antialias: true});
	if (arController.orientation === 'portrait') {
		// var w = (window.innerWidth / arController.videoHeight) * arController.videoWidth;
		// var h = window.innerWidth;
		renderer.setSize(300, 300);
		// renderer.domElement.style.paddingBottom = (w-h) + 'px';
	} else {
		if (/Android|mobile|iPad|iPhone/i.test(navigator.userAgent)) {
			// renderer.setSize(window.innerWidth, (window.innerWidth / arController.videoWidth) * arController.videoHeight);
			renderer.setSize(300, 300);
		} else {
			renderer.setSize(arController.videoWidth, arController.videoHeight);
			// document.body.className += ' desktop';
			canvasHolder.className += ' desktop';
		}
	}

	canvasHolder.append(renderer.domElement);

	// See /doc/patterns/Matrix code 3x3 (72dpi)/20.png
	var markerRoot = arController.createThreeBarcodeMarker(20);
	
	arController.addEventListener('getMarker', function(ev){
		
	});

	var map = currentMap;
	// var map = "/Data/ADI.png"

	THREE.ImageUtils.crossOrigin = '';
	var texture = THREE.ImageUtils.loadTexture( map );
	texture.crossOrigin = '';
	texture.needsUpdate = true;


	//PLANE!!!
	var geometry = new THREE.PlaneGeometry( 7.6, 3.45);
	var material = new THREE.MeshBasicMaterial( 
		{ 
		map: texture,
		transparent: true
		} 
		);
	// material.needsUpdate = true;
	 // var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
	var plane = new THREE.Mesh( geometry, material );
	plane.position.x = 3.5;
	plane.position.y = .05;
	//something.position.(an axis) == a property!!!!!
	//something.position.set(x, y, z)a function which takes a glorious VECTOR 3!!!!!!!!!!!!!!!

	//attaching to marker!!
	markerRoot.add(plane);

	//added to scene
	arScene.scene.add(markerRoot);
	//arScene.scene.add(camera);

	var rotationV = 0;
	var rotationTarget = 0;

	renderer.domElement.addEventListener('click', function(ev) {
		ev.preventDefault();
		rotationTarget += 1;
	}, false);

	//here the meaning is LOOP FOREVER!!!!!!
	var tick = function() {
		arScene.process();
		arScene.renderOn(renderer);
	
		requestAnimationFrame(tick);
	};

	tick();
}