var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var jsonfile = require('jsonfile');
var parsedJSON = require('./upload/dataBase.json');



app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.post('/upload', function(req, res){


  function writeToFile(fileName, fileType, fileTitle, fileLocation) {

    function NewFileUpload() {
      this.name = fileName;
      this.type = fileType;
      this.title = fileTitle;
      this.location = fileLocation;
      this.rating = 0;
      this.date = new Date();
    };
    parsedJSON.push(new NewFileUpload());
    jsonfile.writeFileSync(form.uploadDir + '/dataBase.json', parsedJSON, {spaces: 2});
  };

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/upload');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    console.log(parsedJSON);
    if(/\bapplication\b/.test(file.type)){

      writeToFile(file.name, 'text', field, '../upload/' + file.name);

      fs.rename(file.path, path.join(form.uploadDir + '/text', file.name));

    } else if(/\bvideo\b/.test(file.type)) {

      writeToFile(file.name, 'video', field, '../upload/' + file.name);

      fs.rename(file.path, path.join(form.uploadDir + '/video', file.name));

    } else if(/\baudio\b/.test(file.type)) {

      writeToFile(file.name, 'audio', field, '../upload/' + file.name);

      fs.rename(file.path, path.join(form.uploadDir + '/audio', file.name));
      
    } else {
      fs.rename(file.path, path.join(form.uploadDir + '/misc', file.name));
    }
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req);


});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});
