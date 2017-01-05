var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var jsonfile = require('jsonfile');
var bodyParser = require('body-parser');
var filesDataBase = require('./dist/dataBase.json');
var usersDataBase = require('./registration/usersDataBase.json');
var uuidV1 = require('uuid/v1');
var jsmediatags = require("jsmediatags");


var fileName = "";
var fileType = "";
var fileLocation = "";
var fileTitle = "";
var fileDescription = "";
var fileDate = new Date();
var fileSize;

var textRegExp = /\.(?:pdf)$/i;

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.post('/upload', function(req, res){

  function writeToFile(fileName, fileTitle, fileType, fileDescription, fileLocation, fileDate, fileSize, songInfo) {

    function NewFileUpload() {
      this.name = fileName.split("_").join(" ");
      this.title= fileTitle;
      this.type = fileType.split("/")[1];
      this.description = fileDescription;
      this.location = fileLocation;
      this.rating = 0;
      this.date = (fileDate.getDate() + 1 < 10 ? "0" + fileDate.getDate() : fileDate.getDate()) + "." + (fileDate.getMonth() + 1 < 10 ? "0" + (fileDate.getMonth() + 1) : (fileDate.getMonth() + 1)) + "." + fileDate.getFullYear() + " on " + fileDate.getHours() + ":" + (fileDate.getMinutes() + 1 < 10 ? "0" + (fileDate.getMinutes() + 1) : (fileDate.getMinutes() + 1));
      this.sortDate = new Date().getTime();
      this.uniqueId = uuidV1();
      this.size = fileSize;
      this.songInfo = songInfo;
    };

    function NewVideoFile(fileName, fileTitle, fileType, fileDescription, fileLocation, fileDate, fileSize) {
      NewFileUpload.call(this, fileName, fileTitle, fileType, fileDescription, fileLocation, fileDate, fileSize);
      this.video = true;
    }

    function NewAudioFile(fileName, fileTitle, fileType, fileDescription, fileLocation, fileDate, fileSize, songInfo) {
      NewFileUpload.call(this, fileName, fileTitle, fileType, fileDescription, fileLocation, fileDate, fileSize, songInfo);
      this.audio = true;
    }

    function NewTextFile(fileName, fileTitle, fileType, fileDescription, fileLocation, fileDate, fileSize) {
      NewFileUpload.call(this, fileName, fileTitle, fileType, fileDescription, fileLocation, fileDate, fileSize);
      this.text = true;
    }

    if(/\bvideo\b/.test(fileType)){
      filesDataBase.push(new NewVideoFile());
    } else if(/\baudio\b/.test(fileType)) {
      filesDataBase.push(new NewAudioFile());
    } else if(/\bapplication\b/.test(fileType)) {
      filesDataBase.push(new NewTextFile());
    }
    jsonfile.writeFileSync('./dist/dataBase.json', filesDataBase, {spaces: 2});
  };

  //Converting size for human eyes
  function getReadableFileSizeString(fileSizeInBytes) {
    var i = -1;
    var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
      fileSizeInBytes = fileSizeInBytes / 1024;
      i++;
    } while (fileSizeInBytes > 1024);
    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
  };

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/dist/upload');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name

  form.on('file', function(title, file) { //fires when file has been send
    fileName = file.name;
    fileType = file.type;
    fileSize = getReadableFileSizeString(file.size);

    if(/\bapplication\b/.test(file.type)){
      fileLocation = 'upload/text/' + file.name;
      fs.rename(file.path, path.join(form.uploadDir + '/text', file.name));
    } else if(/\bvideo\b/.test(file.type)) {
      fileLocation = 'upload/video/' + file.name;
      fs.rename(file.path, path.join(form.uploadDir + '/video', file.name));
    } else if(/\baudio\b/.test(file.type)) {
      fileLocation = 'upload/audio/' + file.name;
      fs.rename(file.path, path.join(form.uploadDir + '/audio', file.name));
    } else {
      fs.rename(file.path, path.join(form.uploadDir + '/misc', file.name));
    }

  });

  form.on('field', function(name, value) { //fires when filed was send
    if(name == "title") {
      fileTitle = value;
    } else {
      fileDescription = value;
    }
  });
  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  form.on('end', function(){
    if(/\bapplication\b/.test(fileType)){
      createData();
    } else if(/\bvideo\b/.test(fileType)) {
      createData();
    }
    res.end('success');
    if(/\baudio\b/.test(fileType)) {
      getSongInfo();
    }
  });

  function createData() {
    writeToFile(fileName, fileTitle, fileType, fileDescription, fileLocation, fileDate, fileSize);
  }


  function getSongInfo() {
    jsmediatags.read("./dist/upload/audio/" + fileName, {
      onSuccess: function(tag) {
        console.log(tag.tags);
        var songInfo = {
          name: tag.tags.title,
          artist: tag.tags.artist,
          album: tag.tags.album,
          year: tag.tags.year,
          genre: tag.tags.genre
        };

        if('picture' in tag.tags) {
          console.log(tag.tags);
          var data = tag.tags.picture.data;//Array of bytes 0...255
          var imageBuffer = new Buffer(data.length);
          for(var i = 0; i < data.length; i++) {
            imageBuffer[i] = data[i];
          }
          var coverPath = 'upload/audio/covers/' + songInfo.artist + " " + songInfo.album + '.jpeg';
          fs.writeFile('dist/' + coverPath, imageBuffer, function(err) {
            console.log(err);
          });
        }
        songInfo.cover_path = coverPath;
        writeToFile(fileName, fileTitle, fileType, fileDescription, fileLocation, fileDate, fileSize, songInfo);
      },
      onError: function(error) {
        console.log(':(', error.type, error.info);
      }
    });
  }
  

  // parse the incoming request containing the form data
  form.parse(req);

});

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

//Content voting
app.post('/rateItem', function(req, res){
//req.body.uniqueId contains id from main.js which i send

    fs.readFile('./dist/dataBase.json','utf-8', function(err, data){
      var parsedData = JSON.parse(data); //data from existing file
      for(var i = 0; i < parsedData.length; i++) {
        if(req.body.uniqueId == parsedData[i].uniqueId){
          var item = parsedData[i];
          var pos = i;
        }
      }
      if(req.body.rateIncrease == 1) {
        item.rating++;
      } else if (req.body.rateIncrease  == 2) {
        item.rating--;
      }
      parsedData.splice(pos, 1, item);
      jsonfile.writeFileSync('./dist/dataBase.json', parsedData, {spaces: 2});//overwrite whole file with new data
    });
});


// END content voting

//Registration
//
// app.post('/registration', function(req, res){
//
//   fs.readFile('./registration/usersDataBase.json', 'utf-8', function(err, data){
//     if(err) {
//       return console.log(err);
//     }
//     var parsedData = JSON.parse(data);
//     for(var i = 0; i < parsedData.length; i++) {
//       if(parsedData[i].name === req.body.name) {
//         res = 'User with such name already exists';
//         return;
//       } else if(parsedData[i].email === req.body.email) {
//         res = 'User with such email already exists';
//         return;
//       }
//     }
//   });

  // usersDataBase.push(req.body);
  // jsonfile.writeFileSync('./registration/usersDataBase.json', usersDataBase, {spaces: 2});
// });

//End registration



var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});
