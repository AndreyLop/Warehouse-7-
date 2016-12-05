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

		$('a').on('click', function(e){
      if(e.preventDefault){
        e.preventDefault();
      }else{
        e.returnValue = false;
      };
      var pageRef = $(this).attr('href');
			callPage(pageRef)
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
          type: 'GET',
          dataType: 'json',
          data: jsonUserData,
          url: 'http://localhost/project/dist/save_to_json.php',
          success: function() {
            console.log(jsonUserData);
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
    $('.upload-form__upload-button').on('click', function(){
      var file = $('.upload-form__input-file')[0];
      $.ajax({
        url:'http://localhost/project/dist/move_to_folder.php',
        data: new FormData(file),// the formData function is available in almost all new browsers.
        type:'post',
        contentType:false,
        processData:false,
        cache:false,
        error:function(err){
          console.error(err);
        },
        success:function(data){
          console.log(data);
        },
        complete:function(){
          console.log('Request finished.');
        }
      });
    });
  })();//end file upload


}); //end ready
