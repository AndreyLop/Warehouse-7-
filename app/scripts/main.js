$(document).ready(function(){

  (function(){
    //Router settings
    routie({
      '' : function() {
        render()
      },
      'about' : function(){
        render('.aboutPage');
      },
      'upload' : function() {
        render('.uploadPage');
      },
      'library' : function() {
        render('.libraryPage');
        loadFiles('');
      },
      'library/:type' : function(type) {
        render('.libraryPage');
        loadFiles(type);
      },
      'single/:id' : function(id) {
        render('.singItemPage');
        getSingleItem(id);
      },
      'gallery' : function() {
        render('.galleryPage');
      },
      'registration' : function() {
        render('.registrationPage');
      },
      'login' : function() {
        render('.loginPage');
      },
      'contacts' : function() {
        render('.contactsPage');
      }
    });

    function render(pageClass) {
      $('.singe-item').remove();
      $('.content .page').removeClass('visible');
      $(pageClass).addClass('visible');
    }
    //End router settings


    //Library logic

    function loadFiles(filter) {
      $('.list__item').remove(); //clear all previous items

      $.getJSON('dataBase.json', function(data){
        var resultsArr = [];
        if(filter == '') {
          resultsArr = data.slice();
        } else {
          for(var i = 0; i < data.length; i++) {
            if(!data[i][filter]) continue;
            resultsArr.push(data[i]);
          }
        }

        if($('#sortNewFirst').prop('checked') == true) {
          resultsArr.sort(function(a, b) {
            return b.sortDate - a.sortDate;
          });
        } else if($('#sortOldFirst').prop('checked') == true) {
          resultsArr.sort(function(a, b) {
            return a.sortDate - b.sortDate;
          });
        }

        var templateScript = $('#item-template').html();
        //compiling the template
        var theTemplate = Handlebars.compile(templateScript);
        $('.library__list').append(theTemplate(resultsArr));

        createPagination(); //Creating pagination each time load content
      });
    } //end loadFiles

    //Sort already chosen items
    $('input[name=time-sort]').change(function(){
      loadFiles(window.location.hash.slice(9));
    });


    //Single item load
    function getSingleItem(item) {
      $('.singe-item').remove();
      $.getJSON('dataBase.json', function(data){
        var singleItem;
        for(var i = 0; i < data.length; i++) {
          if(data[i].uniqueId == item) {
            singleItem = data[i];
            break;
          }
        }

        var templateScript = $('#single-item-template').html();
        var theTemaplte = Handlebars.compile(templateScript);
        $('.singe-item-container').append(theTemaplte(singleItem));
      })
    }
    //End Single item load

    //Rate content
    function itemRateCall(id, rate) {
      $.ajax({
        url: '/rateItem',
        data: {
          uniqueId: id,
          rateIncrease: rate
        },
        dataType: 'json',
        type: 'POST',
        success: function(res) {
          console.log(res);
        },
        error: function(err) {
          console.log(err);
        }
      });
    }

    $('.library__list').on('click', '.item__rating-up', function() {
      $(this).attr('disabled', true);
      var that = this;
      var uniqueId = $(this).parent('.list__item').data('index');
      $(this).siblings().children('.item__rating').html(function(i ,val){
        return Number(val) + 1;
      });
      itemRateCall(uniqueId, 1);
      setTimeout(function(){$(that).attr('disabled', false)}, 2000);
    });

    $('.library__list').on('click','.item__rating-down', function() {
      $(this).attr('disabled', true);
      var that = this;
      var uniqueId = $(this).parent('.list__item').data('index');
      $(this).siblings().children('.item__rating').html(function(i ,val){
        return Number(val) - 1;
      });
      itemRateCall(uniqueId, 2);
      setTimeout(function(){$(that).attr('disabled', false)}, 2000);
    });

    //End rate content

    // Text search
    $('.library__search').on('keyup', function(){
      var searchText = $(this).val();

      $('.list__item').each(function(){
        var currentText = $(this).text(),
          showCurrent = currentText.indexOf(searchText) !== -1;
        $(this).toggle(showCurrent);
      });
    });

    //Pagination logic
    function createPagination() {
      var showPerPage = 10; //max number of items
      var numberOfItems = $('.library__list').children().size(); //total items
      var numberOfPages = Math.ceil(numberOfItems/showPerPage);

      $('#current_page').val(0);
      $('#show_per_page').val(showPerPage);

      var navigationHTML = '<a class="previous_link" href="#">Prev</a>';
      var currentLink = 0;
      while(numberOfPages > currentLink){
        navigationHTML += '<a class="page_link" href="#" data-desc="' + currentLink +'">'+ (currentLink + 1) +'</a>';
        currentLink++;
      }
      navigationHTML += '<a class="next_link" href="#">Next</a>';

      $('.library__page-navigation').html(navigationHTML);


      $('.content').on('click', '.previous_link', function(e){
        e.preventDefault();
        previous();
      });
      $('.content').on('click', '.page_link', function(e){
        e.preventDefault();
        goToPage($(this).text() - 1);
      });
      $('.content').on('click', '.next_link', function(e){
        e.preventDefault();
        next();
      });

      //adding active page class to first page link
      $('.library__page-navigation .page_link:first').addClass('active_page');

      //hide all elements
      $('.library__list').children().css('display', 'none');

      //show first 10 elements
      $('.library__list').children().slice(0, showPerPage).css('display', 'block');

      function previous() {
        var newPage = parseInt($('#current_page').val())-1;
        //if there is an item before the current active link run the function
        if($('.active_page').prev('.page_link').length == true) {
          goToPage(newPage);
        }
      }

      function next() {
        var newPage = parseInt($('#current_page').val())+1;
        //if there is an item after the current active link run the function
        if($('.active_page').next('.page_link').length == true) {
          goToPage(newPage);
        }
      }

      function goToPage(pageNumb) {
        var showPerPage = parseInt($('#show_per_page').val()),     // number of items shown per page
          startFrom = pageNumb * showPerPage,                      //element number where to start the slice from
          endOn = startFrom + showPerPage;                         //element number where to end the slice
        $('.library__list').children().css('display', 'none').slice(startFrom, endOn).css('display', 'block');
        /*get the page link that has data-desc attribute of the current page and add active_page class to it
         and remove that class from previously active page link*/
        $('.page_link[data-desc=' + pageNumb +']').addClass('active_page').siblings('.active_page').removeClass('active_page');
        //update the current page input field
        $('#current_page').val(pageNumb);
      }

    }
    //End pagination logic
  })(); // End library logic

  //Generate error message for invalid input fields
  function inputFieldError(placement, error) {
    $('.input-error').remove();
    var templateScript = $('#input-error-template').html();
    var theTemaplte = Handlebars.compile(templateScript);
    $(placement).after(theTemaplte({error: error}));
  }



  //Registration
  (function(){
    var userData = {},
      nameStatus,
      emailStatus,
      passStatus,
      passConfirmStatus,
      inputName = $('.registration-form__input-name'),
      inputEmail = $('.registration-form__input-email'),
      passInput = $('.registration-form__input-password'),
      passComfirmInput = $('.registration-form__input-password-confirm'),
      regNameREGexp = /^[a-z0-9]{5,20}$/i,
      regPasswordREGexp = /^[A-Za-z0-9!@#$%^&*()_]{7,20}$/,
      regEmailREGexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    function keyPressInputChecker(value,regularExpression){
      var inputValue = value.val();
      return regularExpression.test(inputValue);
    }

    inputName.on('keyup', function() {
      nameStatus = keyPressInputChecker(inputName, regNameREGexp);
      userData.name = inputName.val();
    });

    inputEmail.on('keyup', function() {
      emailStatus = keyPressInputChecker(inputEmail, regEmailREGexp);
      userData.email = inputEmail.val();
    });

    passInput.on('keyup', function(){
      passStatus = keyPressInputChecker(passInput, regPasswordREGexp);
      userData.password = passInput.val();
    });

    passComfirmInput.on('keyup',function(){
      passConfirmStatus = passComfirmInput.val() == passInput.val() ? true : false;
    });

    $('.registration-form__submit-button').on('click', function(){
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
      } else if(!nameStatus) {
        inputFieldError('.registration-form__input-name', 'Invalid name, it can contain letters and numbers only, and must be minimum 3 and maximum 20 chars long');
      } else if(!emailStatus) {
        inputFieldError('.registration-form__input-email', 'Invalid email, please check your email and try again');
      } else if(!passStatus) {
        inputFieldError('.registration-form__input-password', 'Invalid password, it must be minimum 7 and maximum 20 chars long');
      } else if(!passConfirmStatus) {
        inputFieldError('.registration-form__input-password-confirm', 'Your passwords don\'t match');
      }
    });

    //Login

    $('.login-form__submit').on('click', function(){
      var jsonLoginData = {};
      $.ajax({
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: jsonLoginData,
        url: '/registration/login',
        success: function(res) {
          console.log(res);
        },
        error: function(data) {
          console.log(data)
        }
      })
    })

    //End Login

  })();//end Registration

  //File upload
  (function(){
    if(window.FormData !==undefined) { //FormData support
      $('.upload-form__upload-input').on('click',  function(){
        $('.progress-bar').text('0%');
        $('.progress-bar').width('0%');
      });

      $('.upload-form__upload-button').on('click', function(e){
        e.preventDefault();
        var file = $('.upload-form__upload-input')[0].files[0];
        var title = $('.upload-form__file-name').val();
        var description = $('.upload-form__description-textarea').val();

        if(file !== undefined && title.length > 0 && description.length > 0) {
          var formData = new FormData();

          formData.append('newFile', file, file.name);
          formData.append('title', title);
          formData.append('description', description);

          $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(data) {
              console.log('upload successful\n' + data);
              //on success clear fields and remove all error messages
              $('.upload-form__file-name').val('');
              $('.upload-form__description-textarea').val('');
              $('.input-error').remove();
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
        } else if(file == undefined){ // Error if user didn't input title of file
          inputFieldError('.upload-form__upload-input', 'Choose file to upload please');
        } else if(title.length == 0) {
          inputFieldError('.upload-form__file-name', 'Please give title to file upload');
        } else if(description.length == 0) {
          inputFieldError('.upload-form__description-textarea', 'Please give some kind of description');
        }
      });
    } else { // IE8 solution for file upload, sending whole frame which is created here
      var iframeUpload = {
        init: function() {
          $('.uploadPage').append('<iframe name="uploadiframe" style="display:none;"></iframe>');
          iframeUpload.started();
        },
        started: function() {
          $('#response').html('Loading, please wait.').show();
          $('.uploadPage').hide();
        },
        complete: function() {
          $('.uploadPage').show();
          $('#response').html(' ').show();
          var response = $('iframe').contents().text();
          if(response){
            response = $.parseJSON(response);
            console.log(response);
          }
        }
      };
      $('.upload-form__upload-button').on('click', function(e) {
        var name = $('.upload-form__file-name').val();
        var file = $('.upload-form__upload-input').val();
        var description = $('.upload-form__description-textarea').val();


        if(name.length <= 0) {
          e.preventDefault();
          inputFieldError('.upload-form__file-name', 'Please give title to file upload')
        }
        if(description.length <= 0) {
          e.preventDefault();
          inputFieldError('.upload-form__description-textarea', 'Please give some kind of description');
        }
        if(file == '') {
          e.preventDefault();
          inputFieldError('.upload-form__upload-input', 'Choose file to upload please');
        }
        if(name.length > 0 && file != '' && description.length > 0) {
          iframeUpload.init();
          iframeUpload.complete();
          name = '';
          description = '';
        }

      });

    } // end IE8 upload support

  })();//end file upload

  //Gallery logic
  (function(){

  })();
  //End gallery

  //Slider
  (function(){
    $('.bxslider').bxSlider({
      auto:true
    });
  })();
  //End slider

}); //end ready
