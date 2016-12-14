var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var jsonfile = require('jsonfile');
var bodyParser = require('body-parser');
var filesDataBase = require('./dist/dataBase.json');
var usersDataBase = require('./registration/usersDataBase.json');

var fileName = "";
var fileType = "";
var fileLocation = "";
var fileTitle = "";
var fileDescription = "";
var fileDate = new Date();

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.post('/upload', function(req, res){

  function writeToFile(fileName, fileTitle, fileType, fileDescription, fileLocation, fileDate) {

    function NewFileUpload() {
      this.name = fileName;
      this.title= fileTitle
      this.type = fileType;
      this.description = fileDescription;
      this.location = fileLocation;
      this.rating = 0;
      this.date = fileDate.getDate() + "." + (fileDate.getMonth() + 1 < 10 ? "0" + (fileDate.getMonth() + 1) : (fileDate.getMonth() + 1)) + "." + fileDate.getFullYear() + " on " + fileDate.getHours() + ":" + (fileDate.getMinutes() + 1 < 10 ? "0" + (fileDate.getMinutes() + 1) : (fileDate.getMinutes() + 1));
      this.sortDate = new Date();
    };
    filesDataBase.push(new NewFileUpload());
    jsonfile.writeFileSync('./dist/dataBase.json', filesDataBase, {spaces: 2});
  };

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/upload');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name

  form.on('file', function(title, file) { //fires when file has been send
    fileName = file.name;
    fileType = file.type;

    if(/\bapplication\b/.test(file.type)){
      fileLocation = form.uploadDir + '/text';
      fs.rename(file.path, path.join(form.uploadDir + '/text', file.name));
    } else if(/\bvideo\b/.test(file.type)) {
      fileLocation = form.uploadDir + '/video';
      fs.rename(file.path, path.join(form.uploadDir + '/video', file.name));
    } else if(/\baudio\b/.test(file.type)) {
      fileLocation = form.uploadDir + '/audio';
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
    writeToFile(fileName, fileTitle, fileType, fileDescription, fileLocation, fileDate);
    res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req);


});

//Content voting



// END content voting

//Registration

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

app.post('/registration', function(req, res){

  fs.readFile('./registration/usersDataBase.json', 'utf-8', function(err, data){
    if(err) {
      return console.log(err);
    }
    var parsedData = JSON.parse(data);
    for(var i = 0; i < parsedData.length; i++) {
      if(parsedData[i].name === req.body.name) {
        res = 'User with such name already exists';
        return;
      } else if(parsedData[i].email === req.body.email) {
        res = 'User with such email already exists';
        return;
      }
    }

  })

  // usersDataBase.push(req.body);
  // jsonfile.writeFileSync('./registration/usersDataBase.json', usersDataBase, {spaces: 2});
});

//End registration



var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});
