;$(document).ready(function(){

  ;(function(){
    //Router settings
    routie({
      'home' : function() {
        render('.homePage');
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
        if(type == 'video' || type == 'audio' || type == 'text') {
          render('.libraryPage');
          loadFiles(type);
        } else {
          render('.noSuchPage');
        }
      },
      'library/:type/:id' : function(type, id) {
        render('.singItemPage');
        getSingleItem(type, id);
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
        initMap();
      },
      '*' : function() {
        render('.noSuchPage');
      }
    });

    function render(pageClass) {
      $('.singe-item').remove();
      $('.content .page').removeClass('visible');
      $('.nav__element').removeClass('active-page-link');
      var address = '.' + window.location.hash.split('/')[0].slice(1) + '__nav-link';
      $(address).addClass('active-page-link');
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
        } else if($('#sortGoodFirst').prop('checked') == true) {
          resultsArr.sort(function(a, b) {
            return b.rating - a.rating;
          });
        } else if($('#sortBadFirst').prop('checked') == true) {
          resultsArr.sort(function(a, b){
            return a.rating - b.rating;
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
    $('input.sort').change(function(){
      loadFiles(window.location.hash.slice(9));
    });

    //Single item load
    function getSingleItem(type, id) {
      $('.singe-item').remove();
      $.getJSON('dataBase.json', function(data){
        var singleItem;
        for(var i = 0; i < data.length; i++) {
          if(data[i].uniqueId == id) {
            singleItem = data[i];
            break;
          }
        }

        var templateScript = $('#single-item-template').html();
        var theTemaplte = Handlebars.compile(templateScript);
        $('.singe-item__container').append(theTemaplte(singleItem));

        $('.single-item__back-btn').on('click', function(e){
          e.preventDefault();
          window.history.back();
        });

        $('#audio').prop('volume', 0.3);//set default audio volume level
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

    //Content search
    $('.search__input ').on('keyup', function(){
      var searchText = $(this).val().toLowerCase();

      $('.list__item').each(function(){
        var currentText = $(this).text().toLowerCase();
        var showCurrent = currentText.indexOf(searchText) !== -1;
        $(this).toggle(showCurrent);
      });
    });


    //Pagination logic
    function createPagination() {
      $('.pagination').off('click');
      var showPerPage = 10;
      var numberOfItems = $('.library__list').children().size(); //total items
      var numberOfPages = Math.ceil(numberOfItems/showPerPage);

      $('.current-page').val(0);
      $('.show-per-page').val(showPerPage);

      var navigationHTML = '<a class="previous-link pagination__item" href="#">Prev</a>';
      var currentLink = 0;
      while(numberOfPages > currentLink){
        navigationHTML += '<a class="page-link pagination__item" href="#" data-desc="' + currentLink +'">'+ (currentLink + 1) +'</a>';
        currentLink++;
      }
      navigationHTML += '<a class="next-link pagination__item" href="#">Next</a>';

      $('.library__page-navigation').html(navigationHTML);


      $('.pagination').on('click', '.previous-link', function(e){
        e.preventDefault();
        previous();
      });
      $('.pagination').on('click', '.page-link', function(e){
        e.preventDefault();
        goToPage($(this).text() - 1);
      });
      $('.pagination').on('click', '.next-link', function(e){
        e.preventDefault();
        next();
      });

      //adding active page class to first page link
      $('.library__page-navigation .page-link:first').addClass('active-page');

      //hide all elements
      $('.library__list').children().css('display', 'none');

      //show first 10 elements
      $('.library__list').children().slice(0, showPerPage).css('display', 'block');

      function previous() {
        var newPage = parseInt($('.current-page').val())-1;
        if($('.active-page').prev('.page-link').length == true) {
          goToPage(newPage);
        }
      }

      function next() {
        var newPage = parseInt($('.current-page').val())+1;
        if($('.active-page').next('.page-link').length == true) {
          goToPage(newPage);
        }
      }

      function goToPage(pageNumb) {
        var showPerPage = parseInt($('.show-per-page').val()),     // number of items shown per page
          startFrom = pageNumb * showPerPage,
          endOn = startFrom + showPerPage;
        $('.library__list').children().css('display', 'none').slice(startFrom, endOn).css('display', 'block');
        /*get the page link that has data-desc attribute of the current page and add active_page class to it
         and remove that class from previously active page link*/
        $('.page-link[data-desc=' + pageNumb +']').addClass('active-page').siblings('.active-page').removeClass('active-page');
        //update the current page input field
        $('.current-page').val(pageNumb);
      }

    } //End create pagination

  })(); // End library logic

  //Navigation
  ;(function(){
    $('.nav__mobile-drop').on('click', function(){
      $('.hamburger').toggleClass('change');//Hamburger close animation
      $('.nav__menu').slideToggle(function(){
        $(this).toggleClass('shown');
        $(this).removeAttr('style');
      });//SHow menu to button toggle
      $('.content, footer').one('click', function() {//on click on content hide drop down navigation
        $('.hamburger').toggleClass('change');
        $('.nav__menu').toggleClass('shown');
      });
    });

  })();

  //Generate error message for invalid input fields
  function inputFieldError(placement, error) {
    $('.input-error').remove();
    var templateScript = $('#input-error-template').html();
    var theTemaplte = Handlebars.compile(templateScript);
    $(placement).after(theTemaplte({error: error}));
  }


  //Registration
  ;(function(){
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
    var loginUserData = {},
      loginEmail = $('.login-form__email-input'),
      loginPassword = $('.login-form__password-input'),
      loginEmailStatus,
      loginPassStatus;

    loginEmail.on('keyup', function(){
      loginEmailStatus = keyPressInputChecker(loginEmail, regEmailREGexp);
      loginUserData.email = loginEmail.val();
    });

    loginPassword.on('keyup', function(){
      loginPassStatus = keyPressInputChecker(loginPassword, regPasswordREGexp);
      loginUserData.password = loginPassword.val();
    });

    $('.login-form__submit').on('click', function(){
      if(loginEmailStatus && loginPassStatus) {
        var jsonLoginUserData = JSON.stringify(loginUserData);
        $.ajax({
          type: 'POST',
          dataType: 'json',
          contentType: 'application/json',
          data: jsonLoginUserData,
          url: '/registration/login',
          success: function(res) {
            console.log(res);
          },
          error: function(data) {
            console.log(data)
          }
        })
      } else if(!loginEmailStatus){
        inputFieldError('.login-form__email-input', 'Invalid email, please check your email and try again');
      } else if(!loginPassStatus) {
        inputFieldError('.login-form__password-input', 'Invalid password');
      }
    });
    //End Login

    //Contacts
    var contactsMessageObj = {},
      contactsEmail = $('.contacts__email'),
      contactsMessage = $('.contacts__message'),
      contactsEmailStatus;

    contactsEmail.on('keyup', function(){
      contactsEmailStatus = keyPressInputChecker(contactsEmail, regEmailREGexp);
      contactsMessageObj.email = contactsEmail.val();
    });
    contactsMessageObj.message = contactsMessage.val();

    $('.contact-submit-button').on('click', function(){
      if(contactsEmailStatus && contactsMessage.val() > 0) {
        var jsonContacts = JSON.stringify(contactsMessageObj);
        $.ajax({
          type: 'POST',
          dataType: 'json',
          contentType: 'application/json',
          data: jsonContacts,
          url: '/contacts',
          success: function(res) {
            console.log(res);
          },
          error: function(data) {
            console.log(data)
          }
        })
      } else if(!contactsEmailStatus) {
        inputFieldError('.contacts__email', 'Invalid Email check your email and try again');
      } else if(contactsMessage.val() <= 0) {
        inputFieldError('.contacts__message', 'Message field is empty');
      }
    });
    //End contacts

  })();//end Registration

  //File upload
  ;(function(){
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

        if(file !== undefined && title.length > 0 && description.length > 0 && description.length < 500) {
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
              $('.upload-form')[0].reset();
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
          inputFieldError('.upload-form__upload-input-container', 'Choose file to upload please');
        } else if(title.length == 0) {
          inputFieldError('.upload-form__file-name', 'Please give title to file upload');
        } else if(description.length == 0) {
          inputFieldError('.upload-form__description-textarea', 'Please give some kind of description');
        } else if(description.length > 500) {
          inputFieldError('.upload-form__description-textarea', 'Description should be no more than 500 symbols');
        }
      });
    } else { // IE8 solution for file upload, sending whole frame which is created here
      var iframe = $('<iframe name="uploadiframe" class="iframe-upload" style="display: none"></iframe>');
      $('.upload-form').append(iframe);
      $('.upload-form').on('submit', function(e){

        var name = $('.upload-form__file-name').val();
        var file = $('.upload-form__upload-input').val();
        var description = $('.upload-form__description-textarea').val();

        if(name.length <= 0) {
          e.preventDefault();
          inputFieldError('.upload-form__file-name', 'Please give title to file upload')
        } else if(description.length <= 0) {
          e.preventDefault();
          inputFieldError('.upload-form__description-textarea', 'Please give some kind of description');
        } else if(file == '') {
          e.preventDefault();
          inputFieldError('.upload-form__upload-input-container', 'Choose file to upload please');
        } else {
          $('#response').html('Loading, please wait.');
          iframe[0].onload = function() {
            $('#response').html('Done');
            $('.upload-form')[0].reset();
          }
        }
      });
    } // end IE8 upload support
  })();//end file upload

  //Gallery logic
  ;(function(){

    var images = [
      {imgThumb: 'img1-thumb.jpg', imgLg: 'img1.jpg'},
      {imgThumb: 'img2-thumb.jpg', imgLg: 'img2.jpg'},
      {imgThumb: 'img3-thumb.jpg', imgLg: 'img3.jpg'},
      {imgThumb: 'img4-thumb.jpg', imgLg: 'img4.jpg'},
      {imgThumb: 'img5-thumb.png', imgLg: 'img5.png'},
      {imgThumb: 'img6-thumb.png', imgLg: 'img6.png'},
      {imgThumb: 'img7-thumb.jpg', imgLg: 'img7.jpg'},
      {imgThumb: 'img8-thumb.jpg', imgLg: 'img8.jpg'},
      {imgThumb: 'img9-thumb.jpg', imgLg: 'img9.jpg'},
      {imgThumb: 'img10-thumb.jpg', imgLg: 'img10.jpg'},
      {imgThumb: 'img11-thumb.jpg', imgLg: 'img11.jpg'},
      {imgThumb: 'img12-thumb.jpg', imgLg: 'img12.jpg'}
    ];

    var templateScript = $('#gallery-template').html();
    var theTemplate = Handlebars.compile(templateScript);
    $('.gallery__container').append(theTemplate(images));

  })();
  //End gallery

  //Slider
  ;(function(){
    $('.bxslider').bxSlider({
      auto: true
    });
  })();
  //End slider

  //Google map initialisation
    function initMap() {
      var uluru = {lat: 50.518, lng: 30.499};
      var map = new google.maps.Map($('.google-map')[0], {
        zoom: 14,
        center: uluru
      });
      var marker = new google.maps.Marker({
        position: uluru,
        map: map
      });

      google.maps.event.addDomListener(window, 'resize', function() {
        var center = uluru;
        google.maps.event.trigger(map, 'resize');
        map.setCenter(center);
      });

    }

  //Dynamic sticky footer
  ;(function(){
    function footerAlign() {
      $('footer').css('display', 'block');
      $('footer').css('height', 'auto');
      var footerHeight = $('footer').outerHeight();
      $('body').css('padding-bottom', footerHeight);
      $('footer').css('height', footerHeight);
    }
    $(document).ready(function(){
      footerAlign();
    });
    $( window ).resize(function() {
      footerAlign();
    });
  })();

}); //end ready
