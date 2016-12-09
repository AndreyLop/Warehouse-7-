$(document).ready(function(){
  //Load page elements logic
  (function(){
    function callPage(pageRefInput) {
      $.ajax({
        url: pageRefInput,
        type: 'GET',
        dataType: 'text',
        success: function(response) {
          $('.content').html(response);
        },
        error: function(error) {
          console.log('the page was NOT loaded', error);
        },
        complete: function(xhr, status) {
          console.log('the request is complete!');
        }
      })
    }//end callPage

    $('.nav__element').on('click', function(e){
      if(e.preventDefault){
        e.preventDefault();
      }else{
        e.returnValue = false;
      }
      var pageRef = $(this).attr('href');
      callPage(pageRef);
    });

  })();

  //Registration
  (function(){
    var userData = {},
      nameStatus,
      emailStatus,
      passStatus,
      passConfirmStatus,
      regNameREGexp = /^[A-Za-z]{3,20}$/,
      regPasswordREGexp = /^[A-Za-z0-9!@#$%^&*()_]{7,20}$/,
      regEmailREGexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    function keyPressInputChecker(value,regularExpression){
      var inputValue = value.val();
      return regularExpression.test(inputValue);
    }

    $('.content').on('keyup', '.registration-form__input-name', function() {
      nameStatus = keyPressInputChecker($('.registration-form__input-name'), regNameREGexp);
      userData.name = $('.registration-form__input-name').val();
    });

    $('.content').on('keyup', '.registration-form__input-email' , function() {
      emailStatus = keyPressInputChecker($('.registration-form__input-email'), regEmailREGexp);
      userData.email = $('.registration-form__input-email').val();
    });

    $('.content').on('keyup', '.registration-form__input-password', function(){
      passStatus = keyPressInputChecker($('.registration-form__input-password'), regPasswordREGexp);
      userData.password = $('.registration-form__input-password').val();
    });

    $('.content').on('keyup', '.registration-form__input-password-confirm',function(){
      passConfirmStatus = $('.registration-form__input-password-confirm').val() == $('.registration-form__input-password').val() ? true : false;
    });

    $('.content').on('click', '.registration-form__submit-button', function(){
      console.log('Name:',nameStatus);
      console.log('Email:',emailStatus);
      console.log('Pass:',passStatus);
      console.log('Pass2:',passConfirmStatus);
      if(nameStatus && emailStatus && passStatus && passConfirmStatus) {
        var jsonUserData = JSON.stringify(userData);
        $.ajax({
          type: 'POST',
          dataType: 'json',
          contentType: 'application/json',
          data: jsonUserData,
          url: '/registration',
          success: function(res) {
            console.log(res);
          },
          error: function(data) {
            console.log('Error', data);
          }
        })
      }
    });
  })();//end Registration

  //File upload
  (function(){
    if(window.FormData !==undefined) {
      $('.content').on('click','.upload-form__upload-input',  function(){
        $('.progress-bar').text('0%');
        $('.progress-bar').width('0%');
      });


      $('.content').on('click', '.upload-form__upload-button', function(e){
        e.preventDefault();
        var files = $('.upload-form__upload-input').get(0).files;
        var title = $('.upload-form__file-name').val();

        if(files.length > 0 && title.length > 0) {
          var formData = new FormData();

          for(var i = 0; i < files.length; i++) {
            var file = files[i];
            formData.append(title || 'upload', file, file.name);
          }

          $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(data) {
              console.log('upload successful\n' + data);
              $('.upload-form__file-name').val('');
              $('.upload-form__upload-input').get(0).files = null;
            },
            xhr: function() {
              var xhr = new XMLHttpRequest();

              xhr.upload.addEventListener('progress', function(e){
                if(e.lengthComputable){
                  var percentComplete = e.loaded/e.total;
                  percentComplete = parseInt(percentComplete * 100);

                  $('.progress-bar').text(percentComplete + '%');
                  $('.progress-bar').width(percentComplete + '%');

                  if(percentComplete == 100) {
                    $('.progress-bar').html('Done');
                  }
                }
              }, false);
              return xhr;
            }
          });
        } else { // Error if user didn't input title of file
          console.log('Give it title please');
        }
      });
    } else { // IE8 nightmare solution for file upload, sending whole iframe which is created here
      var iframeUpload = {
        init: function() {
          $('body').append('<iframe name="uploadiframe" onload="iframeUpload.complete();" style="display: none"></iframe>');
          $('.content').on('click', '.upload-form__upload-button', iframeUpload.started);
        },
        started: function() {
          $('#response').html('Loading, please wait.').show();
          $('form').hide();
        },
        complete: function(){
          $('form').show();
          var response = $('iframe').contents().text();
          if(response){
            response = $.parseJSON(response);
            console.log(response);
          }
        }
      };
      iframeUpload.init();
    } // end IE8 upload support

  })();//end file upload

  //Library logic
  (function(){
    function loadFiles() {
      $.getJSON('dataBase.json', function(data){
        for(var i = 0; i < data.length; i++) {
          console.log(data[i].name);
        }
      });
    }
    $('.content').on('click', '.library__all', function(){
      loadFiles();
    });
  })();//End library logic

}); //end ready
