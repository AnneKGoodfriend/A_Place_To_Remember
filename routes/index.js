var express = require('express');
var router = express.Router();
var mongoose = require('mongoose'); // mongoDB library
var geocoder = require('geocoder'); // geocoder library
var base64Img = require('base64-img');

// our db model
var Memory = require("../models/model.js");

// S3 File dependencies
var AWS = require('aws-sdk');
var awsBucketName = process.env.AWS_BUCKET_NAME;
var s3Path = process.env.AWS_S3_PATH; // TODO - we shouldn't hard code the path, but get a temp URL dynamically using aws-sdk's getObject
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'us-east-2'
});
var s3 = new AWS.S3();

// file processing dependencies
var fs = require('fs');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

/**
 * GET '/'
 * Default home route. Just relays a success message back.
 * @param  {Object} req
 * @return {Object} json
 */


router.get('/entry', function(req, res) {
  res.render('entry.html');
});

router.get('/', function(req, res) {
  res.render('intro.html');
});

router.get('/how', function(req, res) {
  res.render('how.html');
});

router.get('/marker', function(req, res) {
  res.render('marker.html');
});

router.get('/memories', function(req, res) {
  res.render('memories.html');
});

router.get('/next', function(req, res) {
  res.render('next.html');
});

router.get('/thankyou', function(req, res) {
  res.render('thankyou.html');
});



// /**
//  * GET '/api/get'
//  * Receives a GET request to get all animal details
//  * @return {Object} JSON
//  */

router.get('/api/get', function(req, res){

  // Memory.count().exec(function(err, count){

  // var random = Math.floor(Math.random() * count);

  // Memory.findOne().skip(random).exec(
  //   function (err, data) {

  //     // result is random 

  // if(err || data == null){
  //     var error = {status:'ERROR', message: 'Could not find memories'};
  //     return res.json(error);
  //   }

    Memory.find(function(err, data){
    // if err or no animals found, respond with error 
    if(err || data == null){
      var error = {status:'ERROR', message: 'Could not find Memories'};
      return res.json(error);
    }
    // otherwise, respond with the data 
    var jsonData = {
      status: 'OK',
      memories: data
    } 

    res.json(jsonData);
  });

});




router.post('/api/create/image', multipartMiddleware, function(req,res){

  //console.log('the incoming data >> ' + JSON.stringify(req.body.image));
  //console.log(req.body);

  var name = req.body.name;

  var memoryObj = {
      name: req.body.name,
      audio: req.body.audio,
      image: req.body.image
  };

  var saveStatus = true;
    
  // Saving a data URL (server side)

  //IMAGE STUFF
  var searchFor = "data:image/png;base64,";
  var strippedImage = req.body.image.slice(req.body.image.indexOf(searchFor) + searchFor.length);
  var binaryImage = new Buffer(strippedImage, 'base64');

  // reference to the Amazon S3 Bucket
  var s3bucket = new AWS.S3({params: {Bucket: awsBucketName}});
  
  // Set the bucket object properties
  // Key == filename
  // Body == contents of file
  // ACL == Should it be public? Private?
  // ContentType == MimeType of file ie. image/jpeg.
  var imageparams = {
    // Key: cleanedImageFileName,
    Key: name + "image",
    // Body: file_buffer,
    Body: binaryImage,
    ACL: 'public-read',
    // ContentType: imagemimeType
    ContentType: "image/png"
  };
  
  // Put the above Object in the Bucket
  s3bucket.putObject(imageparams, function(err, data) {
    if (err) {
      console.log(err)
      return;
    } else {
      console.log("Successfully uploaded data to s3 bucket");

      memoryObj['image'] = s3Path + name + "image";

        // now, we can create our person instance

        //audio stuff
        // console.log(req.body.audio);

        // Saving a data URL (server side)
        var binaryAudio = new Buffer(req.body.audio, 'base64');
        var s3bucket = new AWS.S3({params: {Bucket: awsBucketName}});
          
          // Set the bucket object properties
          // Key == filename
          // Body == contents of file
          // ACL == Should it be public? Private?
          // ContentType == MimeType of file ie. image/jpeg.
          var audioparams = {
            // Key: cleanedImageFileName,
            Key: name + "audio",
            // Body: file_buffer,
            Body: binaryAudio,
            ACL: 'public-read',
            // ContentType: imagemimeType
            ContentType: "audio/wav"
          };
          
          // Put the above Object in the Bucket
          s3bucket.putObject(audioparams, function(err, data) {
            if (err) {
              console.log(err)
              return;
            } else {
              console.log("Successfully uploaded data to s3 bucket");

              memoryObj['audio'] = s3Path + name + "audio";

              // now, we can create our person instance
              var memory = new Memory(memoryObj);

              memory.save(function(err,data){
                if(err){
                  var error = {
                    status: "ERROR",
                    message: err
                  }
                  return res.json(err)
                }

                var jsonData = {
                  status: "OK",
                  person: data
                }

                return res.json(jsonData);        
              })
            
         }});
      // end of putObject function


    
 }});
})

router.post('/api/create/submition', multipartMiddleware, function(req,res){

  console.log('the incoming data >> ' + JSON.stringify(req.body));
  console.log('the incoming image file >> ' + JSON.stringify(req.files.image));

    // hold all this data in an object
    // this object should be structured the same way as your db model
    var memoryObj = {
      name: req.body.name,
      audio: req.body.audio,
      image: req.body.image
    };




  // NOW, we need to deal with the image
  // the contents of the image will come in req.files (not req.body)
  var imagefilename = req.files.image.name; // actual filename of file
  var imagepath = req.files.image.path; // will be put into a temp directory
  var imagemimeType = req.files.image.type; // image/jpeg or actual mime type
  
  // create a cleaned file name to store in S3
  // see cleanFileName function below
  var cleanedImageFileName = cleanFileName(imagefilename);

  // We first need to open and read the uploaded image into a buffer
  fs.readFile(imagepath, function(err, file_buffer){

    // reference to the Amazon S3 Bucket
    var s3bucket = new AWS.S3({params: {Bucket: awsBucketName}});
    
    // Set the bucket object properties
    // Key == filename
    // Body == contents of file
    // ACL == Should it be public? Private?
    // ContentType == MimeType of file ie. image/jpeg.
    var imageparams = {
      Key: cleanedImageFileName,
      Body: file_buffer,
      ACL: 'public-read',
      ContentType: imagemimeType
    };
    
    // Put the above Object in the Bucket
    s3bucket.putObject(imageparams, function(err, data) {
      if (err) {
        console.log(err)
        return;
      } else {
        console.log("Successfully uploaded data to s3 bucket");

    memoryObj['image'] = s3Path + cleanedImageFileName;


   
  //image file saved now lets save the audio file
  
  // the contents of the image will come in req.files (not req.body)
  var audiofilename = req.files.audio.name; // actual filename of file
  var audiopath = req.files.audio.path; // will be put into a temp directory
  var audiomimeType = req.files.audio.type; // image/jpeg or actual mime type
  
  // create a cleaned file name to store in S3
  // see cleanFileName function below
  var cleanedAudioFileName = cleanFileName(audiofilename);

   fs.readFile(audiopath, function(err, file_buffer){

    // reference to the Amazon S3 Bucket
    var s3bucket = new AWS.S3({params: {Bucket: awsBucketName}});
    
    // Set the bucket object properties
    // Key == filename
    // Body == contents of file
    // ACL == Should it be public? Private?
    // ContentType == MimeType of file ie. image/jpeg.
    var audioparams = {
      Key: cleanedAudioFileName,
      Body: file_buffer,
      ACL: 'public-read',
      ContentType: audiomimeType
    };
    
    // Put the above Object in the Bucket
    s3bucket.putObject(audioparams, function(err, data) {
      if (err) {
        console.log(err)
        return;
      } else {
        console.log("Successfully uploaded data to s3 bucket");

        // now that we have the image
        // we can add the s3 url our person object from above
        memoryObj['audio'] = s3Path + cleanedAudioFileName;

        // now, we can create our person instance
        var memory = new Memory(memoryObj);

        memory.save(function(err,data){
          if(err){
            var error = {
              status: "ERROR",
              message: err
            }
            return res.json(err)
          }

          var jsonData = {
            status: "OK",
            person: data
          }

          return res.json(jsonData);        
        })

      }

    }); // end of putObject function

  });// end of read file for audio
  
  }

    }); // end of putObject function

  });// end of read file
})

function cleanFileName (filename) {
    
    // cleans and generates new filename for example userID=abc123 and filename="My Pet Dog.jpg"
    // will return "abc123_my_pet_dog.jpg"
    var fileParts = filename.split(".");
    
    //get the file extension
    var fileExtension = fileParts[fileParts.length-1]; //get last part of file
    
    //add time string to make filename a little more random
    d = new Date();
    timeStr = d.getTime();
    
    //name without extension
    newFileName = fileParts[0];
    
    return newFilename = timeStr + "_" + fileParts[0].toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_') + "." + fileExtension;
    
}

module.exports = router;


