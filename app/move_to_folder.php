<?php
  $fileName = $_FILES["fileUpload"]["name"]; //file name
  $fileTmpLoc = $_FILES["fileUpload"]["tmp_name"]; //File in php tmp folder
  $fileType = $_FILES["fileUpload"]["type"]; // Type of file duh
  $fileSize = $_FILES["fileUpload"]["size"]; // get the extension of the file
  $fileError = $_FILES["fileUpload"]["error"]; //Error msg 0 for false 1 for true
  if(!$fileTmpLoc) {
    echo "Error: Please browse for file before uploading it.";
    exit();
  }
  if(move_uploaded_file($fileTmpLoc, "uploads/$fileName")) {
    echo "$fileName upload is complete";
  } else {
    echo "move_uploaded_file function failed";
  }
  ?>
