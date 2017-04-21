var sometrack = document.getElementById('sometrack');

var currentMap;

var memorycount = 0;

window.onload= function(){

	getARContent();
	// document.getElementById("ARtrigger").addEventListener("click", myFunction);


    // audio.load(); //call this to just preload the audio without playing
    // audio.play(); //call this to play the song right away

}

function changeAudio(memories){

	if (memorycount <= memories.length-1){
		var currentTrack = memories[memorycount].audio;
		currentMap = memories[memorycount].image;

		memorycount += 1;
		console.log("memory number:  " + memorycount)
	} else{

		memorycount = 0;
		console.log("memory number:  " + memorycount)

		var currentTrack = memories[memorycount].audio;
		currentMap = memories[memorycount].image;

		memorycount += 1;
		console.log("memory number:  " + memorycount)
	}

	// for(var i=0;i<memories.length;i++){
	// 	var currentTrack = memories[0].audio;
	// 	currentMap = memories[0].image;
	// }

	console.log("called for source track");

    var audio = document.getElementById('tracksource');

    audio.src = currentTrack;
}

function playAudio() { 
	console.log("Play clicked");
	sometrack.load();
   	sometrack.play(); 
} 

function pauseAudio() { 
   sometrack.pause(); 
} 

if (window.ARController && ARController.getUserMediaThreeScene) {
  ARThreeOnLoad()
}
var videoParams;

function ARThreeOnLoad() {
debugger;
  navigator
    .mediaDevices
    .enumerateDevices()
    .then(function(devices) {
      var device = devices.find(function(element) {
      	console.log(element)
      	
      	if(element.kind == "videoinput"){
      		if(element.label == "camera2 0, facing back"){
      			console.log(element);
      			      videoParams = {
					      	exact: element.deviceId
					   }
      		}
      	}
      	
        return element.label.indexOf('back') !== -1
      })

      //var videoParams = {deviceId: device ? {exact: device.deviceId} : undefined}


      cameraSuccess(videoParams);
    })
    .catch(function(err) {
      alert(err.name + ": " + err.message);
    })
}

function cameraSuccess(videoParams) {
	// console.log(videoParams);
	navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
	navigator.getUserMedia({ audio: true, video: { 
			facingMode: "environment" 
		} 
	}, gotStream, handleError);
}

function gotStream(stream) {
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

	// document.body.insertBefore(renderer.domElement, document.body.firstChild);

	// See /doc/patterns/Matrix code 3x3 (72dpi)/20.png
	var markerRoot = arController.createThreeBarcodeMarker(20);
	
	arController.addEventListener('getMarker', function(ev){

		console.log("found the fucking marker ");
		// if(!sometrack.isPlaying){
		// 	sometrack.play();
		// }
	});

	var map = currentMap;

	THREE.ImageUtils.crossOrigin = '';
	var texture = THREE.ImageUtils.loadTexture( map );
	texture.crossOrigin = '';
	texture.needsUpdate = true;


	//PLANE!!!
	var geometry = new THREE.PlaneGeometry( 2, 2, 32 );
	var material = new THREE.MeshBasicMaterial( 
		{ 
		map: texture,
		transparent: true
		} 
		);
	// material.needsUpdate = true;
	 // var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
	var plane = new THREE.Mesh( geometry, material );
	plane.position.x -= .5;
	plane.position.y -= .5;

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

	var tick = function() {
		arScene.process();
		arScene.renderOn(renderer);
		// rotationV += (rotationTarget - sphere.rotation.z) * 0.05;
		// sphere.rotation.z += rotationV;
		// rotationV *= 0.8;

		//here the meaning is LOOP FOREVER!!!!!!
		//plane.rotation.y += 0.1;
		

		requestAnimationFrame(tick);

	};

	tick();


}

// window.ARThreeOnLoad = function() {
// 	ARController.getUserMediaThreeScene({maxARVideoSize: 320, cameraParam: 'Data/camera_para.dat', 
// 	onSuccess: function(arScene, arController, arCamera) {

// 		var canvasHolder = $('#canvasHolder');

// 		document.body.className = arController.orientation;

// 		arController.setPatternDetectionMode(artoolkit.AR_MATRIX_CODE_DETECTION);

// 		var renderer = new THREE.WebGLRenderer({antialias: true});
// 		if (arController.orientation === 'portrait') {
// 			// var w = (window.innerWidth / arController.videoHeight) * arController.videoWidth;
// 			// var h = window.innerWidth;
// 			renderer.setSize(300, 300);
// 			// renderer.domElement.style.paddingBottom = (w-h) + 'px';
// 		} else {
// 			if (/Android|mobile|iPad|iPhone/i.test(navigator.userAgent)) {
// 				// renderer.setSize(window.innerWidth, (window.innerWidth / arController.videoWidth) * arController.videoHeight);
// 				renderer.setSize(300, 300);
// 			} else {
// 				renderer.setSize(arController.videoWidth, arController.videoHeight);
// 				// document.body.className += ' desktop';
// 				canvasHolder.className += ' desktop';
// 			}
// 		}

		
// 		canvasHolder.append(renderer.domElement);

// 		// document.body.insertBefore(renderer.domElement, document.body.firstChild);

// 		// See /doc/patterns/Matrix code 3x3 (72dpi)/20.png
// 		var markerRoot = arController.createThreeBarcodeMarker(20);
		
// 		arController.addEventListener('getMarker', function(ev){

// 			console.log("found the fucking marker ");
// 			// if(!sometrack.isPlaying){
// 			// 	sometrack.play();
// 			// }
// 		});

// 		var map = currentMap;

// 		THREE.ImageUtils.crossOrigin = '';
// 		var texture = THREE.ImageUtils.loadTexture( map );
// 		texture.crossOrigin = '';
// 		texture.needsUpdate = true;


// 		//PLANE!!!
// 		var geometry = new THREE.PlaneGeometry( 2, 2, 32 );
// 		var material = new THREE.MeshBasicMaterial( 
// 			{ 
// 			map: texture,
// 			transparent: true
// 			} 
// 			);
// 		// material.needsUpdate = true;
// 		 // var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
// 		var plane = new THREE.Mesh( geometry, material );
// 		plane.position.x -= .5;
// 		plane.position.y -= .5;

// 		//something.position.(an axis) == a property!!!!!
// 		//something.position.set(x, y, z)a function which takes a glorious VECTOR 3!!!!!!!!!!!!!!!

// 		//attaching to marker!!
// 		markerRoot.add(plane);

// 		//added to scene
// 		arScene.scene.add(markerRoot);
// 		//arScene.scene.add(camera);

// 		var rotationV = 0;
// 		var rotationTarget = 0;

// 		renderer.domElement.addEventListener('click', function(ev) {
// 			ev.preventDefault();
// 			rotationTarget += 1;
// 		}, false);

// 		var tick = function() {
// 			arScene.process();
// 			arScene.renderOn(renderer);
// 			// rotationV += (rotationTarget - sphere.rotation.z) * 0.05;
// 			// sphere.rotation.z += rotationV;
// 			// rotationV *= 0.8;

// 			//here the meaning is LOOP FOREVER!!!!!!
// 			//plane.rotation.y += 0.1;
			

// 			requestAnimationFrame(tick);

// 		};

// 		tick();

// 	}});

// 	delete window.ARThreeOnLoad;

// };

// if (window.ARController && ARController.getUserMediaThreeScene) {
// 	ARThreeOnLoad();
// }