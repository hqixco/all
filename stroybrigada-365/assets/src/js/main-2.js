// Preloader
jQuery(window).on('load', function () {
	if (jQuery('.sp-loader-with-logo').length > 0) {
		move();
	}
	jQuery('.sp-pre-loader').fadeOut(500, function () {
		jQuery(this).remove();
	});
});
function uniAutoHeight(div) {
        	const block_height = () => {
        		$(div).css({height: ''});
        		
        		let maxheight = 0;
        		
        		$(div).each(function(){
        			if($(this).height() > maxheight) {
        				maxheight = $(this).height();
        			}
        		});
        		
        		if(maxheight > 0) $(div).height(maxheight);
        	};
        	
        	block_height();
        	$(window).resize(block_height);
        }
/**
 * Move the progress bar
 */
function move() {
	var elem = document.getElementById('line-load');
	var width = 1;
	var id = setInterval(frame, 10);
	function frame() {
		if (width >= 100) {
			clearInterval(id);
		} else {
			width++;
			elem.style.width = width + '%';
		}
	}
}


 $('.reviews-thumbs__more-text a').click(function(e){
            var fullt = $(this).closest('.testimonials-section__item').html();
            $("#full_comment .testimonials-section__item").html(fullt);
    });


$('.site-header__contacts').mouseleave(function (event) {
    
    $(this).find('.site-header__contacts-bottom').removeClass('active')
});

function normalizeInternalTrailingSlash(linkUrl) {
    if (!linkUrl || linkUrl.indexOf('javascript:') === 0 || linkUrl.indexOf('mailto:') === 0 || linkUrl.indexOf('tel:') === 0) {
        return linkUrl;
    }

    try {
        var url = new URL(linkUrl, window.location.origin);
        var pathname = url.pathname;
        var lastSegment = pathname.split('/').pop();

        if (url.origin !== window.location.origin || pathname === '/' || pathname.endsWith('/') || lastSegment.indexOf('.') !== -1) {
            return url.toString();
        }

        url.pathname = pathname + '/';
        return url.toString();
    } catch (error) {
        return linkUrl;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('a[href]').forEach(function (link) {
        var href = link.getAttribute('href');

        if (!href || href.charAt(0) === '#') {
            return;
        }

        link.setAttribute('href', normalizeInternalTrailingSlash(href));
    });

    if (window.innerWidth > 767 || !document.querySelector('#works')) {
        return;
    }

    document.querySelectorAll('.hero-section').forEach(function (heroSection) {
        if (!(heroSection instanceof HTMLElement) || heroSection.querySelector('.hero-section__video-link-mobile')) {
            return;
        }

        var features = heroSection.querySelector('.hero-section__features') ||
            heroSection.querySelector('.hero-section__content > .list50w') ||
            heroSection.querySelector('.w60 > .list50w');
        if (!(features instanceof HTMLElement)) {
            return;
        }

        features.classList.add('hero-section__features--with-mobile-video');

        var link = document.createElement('a');
        link.href = '#works';
        link.className = 'hero-section__video-link-mobile';
        link.innerHTML = '<span class="hero-section__video-link-title">Кейсы работ</span><span class="hero-section__video-link-play" aria-hidden="true"></span>';
        features.appendChild(link);
    });
});

document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href]');

    if (!link) {
        return;
    }

    var href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#') {
        return;
    }

    link.setAttribute('href', normalizeInternalTrailingSlash(href));
});
     
     
     
    jQuery(function ($) {
        var consentText = 'Соглашаюсь с <a href="/politika-konfidentsialnosti/" target="_blank" rel="noopener noreferrer">политикой конфиденциальности</a> и обработкой персональных данных';

        $('form').each(function (index) {
            var $form = $(this);
            var $existingConsent = $form.find('.site-form-consent, .soglasie-form, .last-step-form__accept').first();

            if ($form.closest('#wpadminbar').length) {
                return;
            }

            if ($form.is('.portable-test-wrapper, .quiz__form') && !$existingConsent.length) {
                return;
            }

            if (!$form.find('button[type="submit"], input[type="submit"]').length) {
                return;
            }

            var checkboxId = 'site-form-consent-' + (index + 1);
            var consentMarkup = '<label class="site-form-consent__label" for="' + checkboxId + '">' +
                '<input class="site-form-consent__checkbox" type="checkbox" id="' + checkboxId + '" name="privacy_agreement" value="1" required checked>' +
                '<span class="site-form-consent__text">' + consentText + '</span>' +
            '</label>';
            var $consent = $existingConsent;

            if ($consent.length) {
                $consent.addClass('site-form-consent').html(consentMarkup);
                return;
            }

            var $anchor = $form.find('.form-button, .last-step-form').last();
            if (!$anchor.length) {
                $anchor = $form.find('button[type="submit"], input[type="submit"]').last();
            }

            if ($anchor.length) {
                $('<div class="site-form-consent">' + consentMarkup + '</div>').insertAfter($anchor);
            }
        });

        $(document).on('submit', 'form', function (event) {
            var form = this;

            if ($(form).closest('#wpadminbar').length) {
                return;
            }

            if ($(form).is('.portable-test-wrapper, .quiz__form') && !form.querySelector('input[name="privacy_agreement"]')) {
                return;
            }

            var consentCheckbox = form.querySelector('input[name="privacy_agreement"]');
            if (consentCheckbox && !consentCheckbox.checked) {
                event.preventDefault();
                consentCheckbox.reportValidity();
            }
        });
    });

$(document).ready(function(){
    function loadSharedTestimonials() {
        var testimonialsSection = document.querySelector('.testimonials-section');
        if (!testimonialsSection) {
            return;
        }

        var customTestimonials = testimonialsSection.hasAttribute('data-testimonials-url');
        var testimonialsUrl = testimonialsSection.getAttribute('data-testimonials-url') || '/assets/partials/site-testimonials.html';

        var existingSlides = testimonialsSection.querySelectorAll('.testimonials-section__item');
        if (existingSlides.length && !customTestimonials) {
            return;
        }

        try {
            var request = new XMLHttpRequest();
            request.open('GET', testimonialsUrl, false);
            request.send(null);

            var isSuccess = (request.status >= 200 && request.status < 300) || request.status === 0;
            if (!isSuccess || !request.responseText) {
                throw new Error('Unexpected status ' + request.status);
            }

            testimonialsSection.outerHTML = request.responseText;
        } catch (error) {
            console.error('Failed to load testimonials:', error);
        }
    }

    loadSharedTestimonials();

    var referenceContacts = {
        phoneText: '+7 (977) 779-87-77',
        phoneHref: 'tel:+79777798777',
        emailText: 'Stroydvor7788@mail.ru',
        emailHref: 'mailto:Stroydvor7788@mail.ru',
        addressText: 'Силикатная ул., 35, Мытищи'
    };

    function setLinkText($link, text) {
        if (!$link.length) {
            return;
        }

        if ($link.children().length) {
            var firstChild = $link.children().first();
            var iconMarkup = firstChild.prop('outerHTML') || '';
            if (iconMarkup) {
                $link.html(iconMarkup + text);
                return;
            }
        }

        $link.text(text);
    }

    function applyReferenceContacts() {
        $('a[href^="tel:"]').attr('href', referenceContacts.phoneHref);
        $('a[href^="mailto:"]').attr('href', referenceContacts.emailHref);

        setLinkText($('.site-header__phone-value a').first(), referenceContacts.phoneText);
        setLinkText($('.footer__col .title-sm.fw700 a[href^="tel:"]').first(), referenceContacts.phoneText);
        setLinkText($('.footer__col .title-sm.fw700 a[href^="mailto:"]').first(), referenceContacts.emailText);
        setLinkText($('.bottom__phone.mobile a[href^="tel:"]').first(), referenceContacts.phoneText);

        $('.footer__col .footer__text').filter(function () {
            return $(this).find('a[href^="tel:"]').length && $(this).find('a[href^="mailto:"]').length;
        }).find('> div').first().text(referenceContacts.addressText);
    }

    applyReferenceContacts();
    
    
     $('.last-step-form ul.tab-control > li > a').on('click', function(){
			

			var thisHold = $(this).closest(".last-step-form");
			var _ind = $(this).closest('li').index();

			thisHold.children('.tab-body').children(".tab").removeClass('active').find('input').removeAttr('required');
			thisHold.children('.tab-body').children("div.tab:eq("+_ind+")").addClass('active').find('input').attr('required', true);
			$(this).closest("ul").find(".active").removeClass("active");
			$(this).parent().addClass("active");
            $(this).closest(".last-step-form").find(".contact-input").val($(this).attr('title'));
			return false;
		});

    
    $('.time_choose_radio input').click(function(){
    if ($('.time_choose_radio .wpcf7-list-item.last input').is(":checked")) {
        $('.time_choose').show();
    } 
    
    else {
        $('.time_choose').hide();
        
    }
        
    });
    
    



	 $('.scrollto').on('click', function() {
			let href = $(this).attr('href');
			$('html, body').animate({
				scrollTop: $(href).offset().top
			}, {
				duration: 500,   // по умолчанию «400» 
				easing: "linear" // по умолчанию «swing» 
			});
			return false;
	});

	$(window).scroll(function() {
		
    });
    
 
    var scrollVal = $(window).scrollTop();
    var scrollPos = 0; 
    var stickyHeader = function () {
			    
                

        		
        		if ($(this).scrollTop() > 300) {
        			$('.sp-scroll-up').fadeIn();
        		} else {
        			$('.sp-scroll-up').fadeOut(400);
        		}
	};

			stickyHeader();
			$(window).scroll(function () {
				stickyHeader();
				
				
				  
				
			});
    


	$('.sp-scroll-up').click(function () {
		$('html, body').animate(
			{
				scrollTop: -60,
			},
			100
		);
		return false;
	});

    $(".forms__upload input[type=file]").on("change", function () {
            var t = $(this);
            $(this).closest(".forms__upload").addClass("uploaded"),
                $(this)
                    .closest(".forms__upload")
                    .find(".forms__uploadinput")
                    .html($(this).val().replace("C:\\fakepath\\", "") + '&nbsp;<a class="forms__delete"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" class="svg-icon" id="Capa_1" enable-background="new 0 0 413.348 413.348" viewBox="0 0 413.348 413.348" xmlns="http://www.w3.org/2000/svg"><path d="m413.348 24.354-24.354-24.354-182.32 182.32-182.32-182.32-24.354 24.354 182.32 182.32-182.32 182.32 24.354 24.354 182.32-182.32 182.32 182.32 24.354-24.354-182.32-182.32z"/></svg></a>'),
                $(".forms__upload .forms__delete").on("click", function () {
                    var e = $(this).closest(".forms__upload").find(".forms__uploadinput");
                    return (
                        t.replaceWith(t.val("").clone(!0)), $(".forms__upload").removeClass("uploaded"), void 0 !== $(".forms__uploadinput").attr("data-text") ? e.html(e.attr("data-text")) : e.html("Приложите файл, чертеж, эскиз или ТЗ"), !1
                    );
                });
        });
    

  
  
  
  
  

	
	$('.site-header__more-phones').click(function(){
		if ($(this).closest('.site-header__contacts').find('.site-header__contacts-bottom').hasClass('active')) {
			$(this).closest('.site-header__contacts').find('.site-header__contacts-bottom').removeClass('active')
		} else {
		  
		    $('.site-header__contacts-bottom').removeClass('active');
			$(this).closest('.site-header__contacts').find('.site-header__contacts-bottom').addClass('active');
		}
	});
	
	
	
	$(".site-header__contacts-bottom").mouseleave(function (event) {
	   event.preventDefault();
	        if ($(this).hasClass('active')){
			$(this).closest('.site-header__contacts').find('.site-header__contacts-bottom').removeClass('active');
	        }
	});
	
	

	

	$('.site-header__submenu').hide();

	$('.site-header__menu-toggle').click(function() {
	    
		if ($(this).parents('.site-header__menu-item').find('.site-header__submenu').hasClass('hidden')) {
			$(this).parents('.site-header__menu-item').find('.site-header__submenu').show(300);
			
		
			
			$(this).parents('.site-header__menu-item').find('.site-header__submenu').removeClass("hidden");
			$(this).parents('.site-header__menu-item').find('i').addClass('rotated');
		}
		else {
			$(this).parents('.site-header__menu-item').find('.site-header__submenu').hide(300);
			$(this).parents('.site-header__menu-item').find('.site-header__submenu').addClass("hidden");
			$(this).parents('.site-header__menu-item').find('i').removeClass('rotated');
		}
	});

	
	$('.site-header__menu-close, .offcanvas-overlay').on('click', function (event) {
	   event.preventDefault();
		//$('.site-header__menu').removeClass('active');
		$('.site-header--offcanvas-ready').removeClass('site-header--offcanvas-open');
		
	});
	
	jQuery(".site-header__menu").mouseleave(function (event) {
	   event.preventDefault();
		//$('.site-header__menu').removeClass('active');
		$('.site-header--offcanvas-ready').removeClass('site-header--offcanvas-open');
		
	});

	$('.site-header__burger').click(function(){
		//$('.site-header__menu').addClass('active');
		$('.site-header--offcanvas-ready').addClass('site-header--offcanvas-open');
	})
	
	
    const bannerslider = new Swiper('.banner-slider', {
		slidesPerView: 1,
		loop:true,
        spaceBetween: 0,
        autoplay: {
            delay: 5000,
          },
        disableOnInteraction: true,
        navigation: {
			nextEl: '.slider-next',
			prevEl: '.slider-prev',
		},
        pagination: {
			el: '.dotsc-slider',
			clickable: true,
		},
          
		
	});





    const servicesSlider = new Swiper('.services-slider', {
		slidesPerView: 3,
		loop:true,
        spaceBetween: 20,
       
        navigation: {
			nextEl: '.js-swiper-centered-auto-button-next',
			prevEl: '.js-swiper-centered-auto-button-prev',
		},
        pagination: {
			el: '.dotsc-services-slider',
			clickable: true,
		},
		breakpoints: {
			// when window width is >= 320px
			1: {
				slidesPerView: 1.2,
			},
			// when window width is >= 480px
			480: {
				slidesPerView: 2,
			},
			// when window width is >= 640px
			768: {
				slidesPerView: 2,
			},
			992: {
				slidesPerView: 3,
			},
			1400: {
				slidesPerView: 3,
			},
		}
          
		
	});


      const testimonialsSlider = new Swiper('.review-text__slider', {
		// Optional parameters
		direction: 'horizontal',
		autoplay: {
    delay: 2000,
  },
		loop: true,
		spaceBetween: 15,
		slidesPerView: 4,
		// If we need pagination
		pagination: {
			el: '.dotsc2',
			clickable: true,
		},
		navigation: {
			nextEl: '.reviews-next',
			prevEl: '.reviews-prev',
		},
		breakpoints: {
			// when window width is >= 320px
			1: {
				slidesPerView: 1.2,
			},
			// when window width is >= 480px
			480: {
				slidesPerView: 2.2,
			},
			// when window width is >= 640px
			992: {
				slidesPerView: 3,
			},
			1200: {
				slidesPerView: 4,
			},
		}
	});

	
	    

	const salesSlider = new Swiper('.sales-slider', {
		// Optional parameters
		direction: 'horizontal',
		loop: false,
		spaceBetween: 15,
		slidesPerView: 4,
		// If we need pagination
		pagination: {
			el: '.dotsc',
			clickable: true,
		},
		navigation: {
			nextEl: '.sales-next',
			prevEl: '.sales-prev',
		},
		breakpoints: {
			// when window width is >= 320px
			0: {
				slidesPerView: 1.2,
			},
			// when window width is >= 480px
			480: {
				slidesPerView: 2.2,
			},
            768: {
				slidesPerView: 2.2,
			},
			// when window width is >= 640px
			992: {
				slidesPerView: 2,
			},
			1200: {
				slidesPerView: 3,
			},
		}
	});



const gallery4Slider = new Swiper('.gallery4-slider', {
		  slidesPerView: 1,
		loop:true,
        spaceBetween: 20,
       
        navigation: {
			nextEl: '.gallery-next',
			prevEl: '.gallery-prev',
		},
        pagination: {
			el: '.dotsc-testimonials-slider',
			clickable: true,
		},
		breakpoints: {
			// when window width is >= 320px
			1: {
				slidesPerView: 1.2,
			},
			// when window width is >= 480px
			480: {
				slidesPerView: 2,
			},
			// when window width is >= 640px
			768: {
				slidesPerView:  2,
			},
			992: {
				slidesPerView:  3,
			},
		}
          
		
	});




uniAutoHeight($('.aheight'));
uniAutoHeight($('.aheight-sales'));
uniAutoHeight($('.aheight2'));
       
window.onresize = function() {
  
    uniAutoHeight($('.aheight'));
    uniAutoHeight($('.aheight2'));
    uniAutoHeight($('.aheight-sales'));
};        
    
});




    





function get_cookie(cookie_name) {
    var results = document.cookie.match('(^|;) ?' + cookie_name + '=([^;]*)(;|$)');

    if (results)
        return (unescape(results[2]));
    else
        return null;
}



$(document).ready(function() {
    if ($('#testForm[data-quiz-mode="house-reconstruction"]').length) {
        return;
    }
     


	for (var i = 0; i < $('.step-slide').length - 1; i++) {
		$('.step__extender').append('<div class="step__extender-item"></div>');
	};

	var progress = {
		current: ( 100 / ($('.step-slide').length - 1) ),
		total: $('.step-slide').length,
		width: ( 100 / ($('.step-slide').length + 1) ),
		process: doProgress
	};



	function doProgress () {}

	var testSlider = $('.test-slider').bxSlider({
		mode: 'fade',
		infiniteLoop: false,
		speed: 0,
		adaptiveHeight: true,
		adaptiveHeightSpeed: 0,
		touchEnabled: false,
		pager: false,
		nextSelector: '.btn-next-container',
		prevSelector: '.bt-back',
		prevText: '<div class="btn-back"><span>Предыдущий вопрос</span> </div>',
		nextText: '<div class="btn-next"><span>Следующий вопрос</span></div> ',
		onSliderLoad: function (currentIndex) {
			// первоначальные стили
			$('.main-progress__text').eq(currentIndex).addClass('main-progress__text_active');
			$('.step__extender-item').eq(currentIndex).addClass('step__extender-item_active');
			$('.quiz-form__progress-fill').css('width', progress.width + '%');
		},
		onSlideNext: function (slideElement, oldIndex, newIndex) {

			// активация кнопок
			$('.btn-next-container').removeClass('btn-next-container_active');
			$('.btn-next').removeClass('btn-next_active btn-shine');

			// изменение полосы загрузки
			progress.current += progress.width;
			$('.quiz-form__progress-fill').css('width', progress.current + '%');

			// изменение шага
			$('.step__extender-item').eq(newIndex).addClass('step__extender-item_active');
			$('.step__text span').html(newIndex + 1);

			// изменение заголовка в полосе загрузки
			if ( $('.main-progress__text').eq(newIndex).length != 0 ) {
				$('.main-progress__text').eq(oldIndex).removeClass('main-progress__text_active');
				$('.main-progress__text').eq(newIndex).addClass('main-progress__text_active');
			};
			//$('.last_dn').hide(); 
		
			    
			  
			//console.log(newIndex);  
			    
			//if (newIndex==4) {
              
           // window.setTimeout(function () {
           //     $('.last_dn').show();   
            //    $('.quiz__load').fadeOut();
                
            //  }, 2000);    
                
            //}
            

			
			

		},
		onSlidePrev: function(slideElement, oldIndex, newIndex) {
		    
		    $('.step-slide').eq(oldIndex).find("input:radio").removeAttr("checked");
		    $('.step-slide').eq(oldIndex).find("input:checkbox").removeAttr("checked");
		    
		    // изменение полосы загрузки
			progress.current -= progress.width;
			$('.quiz-form__progress-fill').css('width', progress.current + '%');
        	slideElement.find('.btn-next-container').addClass('btn-next-container_active');
			slideElement.find('.btn-next').addClass('btn-next_active btn-shine');
			
		
        },
        onSlideAfter: function (slideElement, oldIndex, newIndex) {
            //progress.current += progress.width; 
            //$('.quiz-form__progress-fill').css('width', progress.current + '%');
            
            
            slideElement.find('.btn-next-container').addClass('btn-next-container_active');
			slideElement.find('.btn-next').addClass('btn-next_active btn-shine');
           
            
            
            var toTopDoc = $('.quiz-section');

			// console.log(toTopDoc);

			$('html, body').animate({scrollTop: parseInt($('.quiz').offset().top)}, 200);
			//$('body').scrollTo('#quiz-section');
            
            
            
        }
		
		
		
		
		
	});
	
	
$('.pick-item__input.radio').on('change', function(event) {
    	    $(this).closest('.step-slide').find('.pick-item__img').removeClass('active');  
    		
    		if ($(this).prop("checked") === true) {
    	
            $(this).closest('.pick-item').find('.pick-item__img').addClass('active');
            } else {
             $(this).closest('.pick-item').find('.pick-item__img').removeClass('active');  
            }
    		
    	
    	});
    	
    	$('.pick-item__input.checkbox').on('change', function(event) {
    	   // $(this).closest('.step-slide').find('.pick-item__img').removeClass('active');  
    		
    		if ($(this).prop("checked") === true) {
    	
            $(this).closest('.pick-item').find('.pick-item__img').addClass('active');
            } else {
             $(this).closest('.pick-item').find('.pick-item__img').removeClass('active');  
            }
    		
    	
    	});


	$('.pick-item__input').on('change', function(event) {
		event.preventDefault();
		$('.btn-next-container').addClass('btn-next-container_active');
		$('.btn-next').addClass('btn-next_active btn-shine');
	
	});
	$('#testForm .pick-item__input[type="radio"] ').on('change', function(event) {
		event.preventDefault();
		setTimeout(function(){
            testSlider.goToNextSlide();
            },500);
		
	});
$('input[type="file"]').on('change', function(){
      let countFiles = '';
      if (this.files && this.files.length >= 1)
        countFiles = this.files.length;
	  var box = $(this).closest('.quiz__file-label');
	  var filesText = $(box).find('.quiz__file__text');
      if (countFiles)
        $(filesText).html('Выбрано файлов: ' + countFiles)
      else {
		$(filesText).html('Загрузите файл');
	  }
    });	

});


    var x = document.getElementsByClassName("agree");
var i;
for (i = 0; i < x.length; i++) {
x[i].checked = false;
}

    function bindPhoneMask(selector) {
        var $fields = $(selector);

        $fields.each(function () {
            var $field = $(this);
            var input = this;
            var prefixLength = 4;

            $field.off('.phoneMask');

            function formatPhoneValue(rawValue) {
                var digits = String(rawValue || "").replace(/\D/g, "");

                if (digits.charAt(0) === "7" || digits.charAt(0) === "8") {
                    digits = digits.substring(1);
                }

                digits = digits.substring(0, 10);

                if (!digits.length) {
                    return "";
                }

                var parts = [];
                parts.push("+7 (");
                parts.push(digits.substring(0, 3));

                if (digits.length > 3) {
                    parts.push(") " + digits.substring(3, 6));
                }

                if (digits.length > 6) {
                    parts.push("-" + digits.substring(6, 8));
                }

                if (digits.length > 8) {
                    parts.push("-" + digits.substring(8, 10));
                }

                return parts.join("");
            }

            function placeCaretAtInputStart() {
                if (input.selectionStart !== undefined && input.setSelectionRange) {
                    input.setSelectionRange(prefixLength, prefixLength);
                }
            }

            function syncValue() {
                var start = input.selectionStart;
                var end = input.selectionEnd;

                input.value = formatPhoneValue(input.value);

                if (input.value === "") {
                    return;
                }

                if (typeof start === "number" && typeof end === "number" && input.setSelectionRange) {
                    var caret = Math.max(prefixLength, input.value.length);
                    input.setSelectionRange(caret, caret);
                }
            }

            $field.attr("placeholder", "+7 (___) ___-__-__");

            $field.on("focus.phoneMask click.phoneMask", function () {
                if (!this.value) {
                    setTimeout(placeCaretAtInputStart, 0);
                }
            });

            $field.on("keydown.phoneMask", function (event) {
                var key = event.key;
                var caret = typeof this.selectionStart === "number" ? this.selectionStart : prefixLength;
                var isDigit = /^[0-9]$/.test(key);

                if (isDigit && caret <= prefixLength && (key === "7" || key === "8")) {
                    event.preventDefault();
                    return;
                }

                if (key === "Backspace" && caret <= prefixLength) {
                    event.preventDefault();
                }
            });

            $field.on("input.phoneMask", syncValue);

            $field.on("paste.phoneMask", function () {
                var self = this;
                setTimeout(function () {
                    self.value = formatPhoneValue(self.value);
                }, 0);
            });
        });
    }

    function enhancePopupPhonePlaceholders() {
        $('.remodal .form-input input[type="tel"], .remodal .form-input input[name="phone"]').each(function () {
            var $field = $(this);
            var $next = $field.next('span.placeholder');

            if (!$next.length) {
                $field.attr('placeholder', ' ');
                $('<span class="placeholder">Контактный телефон *</span>').insertAfter($field);
                return;
            }

            $field.attr('placeholder', ' ');
        });
    }

    enhancePopupPhonePlaceholders();

    bindPhoneMask('input[type="tel"], input[name="phone"]');

    function normalizeLeadValue(value) {
        return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
    }

    function getStorageAvailable(storageName) {
        try {
            var storage = window[storageName];
            var probeKey = '__storage_probe__';
            storage.setItem(probeKey, '1');
            storage.removeItem(probeKey);
            return storage;
        } catch (error) {
            return null;
        }
    }

    var leadStorage = getStorageAvailable('localStorage') || getStorageAvailable('sessionStorage');
    var leadAttributionKey = 'stroybrigada365_attribution';
    var leadMetricsConfig = (window.StroybrigadaSettings && window.StroybrigadaSettings.metrics) || {};
    var leadCounterId = Number(leadMetricsConfig.counterId) || 108767903;
    var leadGoalName = leadMetricsConfig.leadGoal || 'form_submit_success';
    var leadGoalByPath = {
        '/': 'form_submit_main',
        '/stroitelstvo-chastnyh-domov-kottedzhey-ban/': 'form_submit_stroitelstvo',
        '/stroitelstvo-rekonstrukciya-domov/': 'form_submit_stroitelstvo',
        '/montazh-krovli-i-stropil/': 'form_submit_krovlya',
        '/krovelnye-raboty/': 'form_submit_krovlya',
        '/ustroystvo-fundamentov-otmostok-parkovok/': 'form_submit_fundament',
        '/stroitelstvo-fundamenta/': 'form_submit_fundament',
        '/otdelochnye-raboty-ustroystvo-styazhek-i-polov/': 'form_submit_uteplenie',
        '/uteplenie-doma/': 'form_submit_uteplenie',
        '/otmostki/': 'form_submit_otmostki',
        '/ustrojstvo-otmostki-vokrug-doma/': 'form_submit_otmostki',
        '/ukladka-bruschatki/': 'form_submit_otmostki',
        '/stroitelstvo-pristroek/': 'form_submit_pristroyki',
        '/pristroyki/': 'form_submit_pristroyki',
        '/stroitelstvo-sten-derevyannyh-karkasnyh-kamennyh/': 'form_submit_vosstanovlenie',
        '/vostanovlenie-staryh-domov-i-dach/': 'form_submit_vosstanovlenie',
        '/stroitelstvo-zdaniy-i-otdelka/': 'form_submit_otdelka',
        '/fasadnye-raboty/': 'form_submit_otdelka'
    };
    var leadSuccessMessage = 'Заявка успешно отправлена, мы свяжемся с Вами в ближайшее время';
    var leadErrorMessage = 'Не удалось отправить заявку. Повторите попытку или свяжитесь с нами по телефону.';
    var leadFallbackNote = 'Не удалось отправить заявку. Повторите попытку или свяжитесь с нами по телефону.';

    function normalizeLeadPath(pathname) {
        var normalized = normalizeLeadValue(pathname || '/');

        if (!normalized || normalized === '/') {
            return '/';
        }

        if (normalized.charAt(0) !== '/') {
            normalized = '/' + normalized;
        }

        if (normalized.charAt(normalized.length - 1) !== '/') {
            normalized += '/';
        }

        return normalized;
    }

    function getLeadGoalName() {
        return leadGoalName;
    }

    function readStoredAttribution() {
        if (!leadStorage) {
            return {};
        }

        try {
            return JSON.parse(leadStorage.getItem(leadAttributionKey) || '{}') || {};
        } catch (error) {
            return {};
        }
    }

    function persistAttribution() {
        if (!leadStorage) {
            return readStoredAttribution();
        }

        var url = new URL(window.location.href);
        var stored = readStoredAttribution();
        var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid', 'gclid'];

        keys.forEach(function (key) {
            var value = normalizeLeadValue(url.searchParams.get(key));
            if (value) {
                stored[key] = value;
            }
        });

        leadStorage.setItem(leadAttributionKey, JSON.stringify(stored));
        return stored;
    }

    function addHoneypotFields() {
        $('form').each(function () {
            var $form = $(this);
            if ($form.find('input[name="website"]').length) {
                return;
            }

            $('<div class="site-form-honeypot" aria-hidden="true" style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;">' +
                '<input type="text" name="website" tabindex="-1" autocomplete="off">' +
            '</div>').prependTo($form);
        });
    }

    function ensureStatusNode($form) {
        var $status = $form.find('.site-form-status').first();
        if ($status.length) {
            return $status;
        }

        $status = $('<div class="site-form-status" aria-live="polite"></div>');
        var $anchor = $form.find('.site-form-consent, .soglasie-form, .last-step-form__accept, .form-button').last();
        if ($anchor.length) {
            $status.insertAfter($anchor);
        } else {
            $form.append($status);
        }

        return $status;
    }

    function ensureFallbackNote($form) {
        var $note = $form.find('.site-form-fallback-note').first();
        if ($note.length) {
            $note.prop('hidden', true);
            return $note;
        }

        $note = $('<div class="site-form-fallback-note" hidden></div>').text(leadFallbackNote);
        var $anchor = $form.find('.site-form-status, .site-form-consent, .soglasie-form, .last-step-form__accept, .form-button').last();
        if ($anchor.length) {
            $note.insertAfter($anchor);
        } else {
            $form.append($note);
        }

        return $note;
    }

    function setFormStatus($form, message, isError) {
        var $status = ensureStatusNode($form);
        $status.text(message || '');
        $status.toggleClass('site-form-status_error', !!isError);
        $status.toggleClass('site-form-status_success', !isError && !!message);

        var $note = $form.find('.site-form-fallback-note').first();
        if ($note.length) {
            $note.prop('hidden', !isError);
        }
    }

    function getSuccessMarkup(message) {
        var title = 'Заявка успешно отправлена';
        var text = message;

        if (message && typeof message === 'object') {
            title = normalizeLeadValue(message.title) || title;
            text = normalizeLeadValue(message.text || message.message);
        }

        return '' +
            '<div class="site-form-success" aria-live="polite">' +
                '<div class="site-form-success__icon" aria-hidden="true"></div>' +
                '<div class="site-form-success__title">' + title + '</div>' +
                '<div class="site-form-success__text">' + text + '</div>' +
            '</div>';
    }

    function showInlineSuccess($form, message) {
        if ($form.hasClass('is-submitted-success')) {
            return;
        }

        $form.children().addClass('site-form-success-hidden');
        $form.addClass('is-submitted-success');
        $form.append(getSuccessMarkup(message));
    }

    function getQuizFormHook(form, hookName) {
        if (!form || !window.StroybrigadaQuizHooks || typeof window.StroybrigadaQuizHooks !== 'object') {
            return null;
        }

        var hook = window.StroybrigadaQuizHooks[hookName];
        return typeof hook === 'function' ? hook : null;
    }

    function restoreInlineSuccess($form) {
        if (!$form.hasClass('is-submitted-success')) {
            return;
        }

        $form.removeClass('is-submitted-success');
        $form.children('.site-form-success').remove();
        $form.children('.site-form-success-hidden').removeClass('site-form-success-hidden');
        $form.find('.site-form-status').remove();
        if ($form[0]) {
            $form[0].reset();
        }
        enhancePopupPhonePlaceholders();
        bindPhoneMask($form.find('input[type="tel"], input[name="phone"]'));
    }

    function getFormName($form) {
        var explicitName = normalizeLeadValue($form.data('formName'));
        var hiddenName = normalizeLeadValue($form.find('input[name="formData"]').first().val());
        var sourceId = normalizeLeadValue($form.find('input[name="source_id"]').first().val());
        var modalId = normalizeLeadValue($form.closest('[data-remodal-id]').data('remodalId'));

        if ($form.is('#testForm')) {
            return 'Квиз: ' + (sourceId || document.title);
        }

        return explicitName || hiddenName || modalId || sourceId || 'Заявка с сайта';
    }

    function collectQuizAnswers($form) {
        var answers = [];

        $form.find('.step-slide[data-step]').each(function () {
            var $step = $(this);
            var question = normalizeLeadValue($step.find('.step-slide__title, .quiz__question-title').first().text());
            if (!question) {
                return;
            }

            var stepAnswers = [];
            var groupedValues = {};

            $step.find('input[type="radio"]:checked, input[type="checkbox"]:checked, select, textarea, input[type="text"], input[type="tel"], input[type="email"]').each(function () {
                var field = this;
                var name = normalizeLeadValue(field.name || '');
                var value = normalizeLeadValue($(field).val());

                if (!name || !value || name === 'phone' || name === 'comment' || name === 'contact' || name === 'website' || name === 'privacy_agreement') {
                    return;
                }

                if (!groupedValues[name]) {
                    groupedValues[name] = [];
                }

                groupedValues[name].push(value);
            });

            Object.keys(groupedValues).forEach(function (key) {
                stepAnswers = stepAnswers.concat(groupedValues[key]);
            });

            if (stepAnswers.length) {
                answers.push({
                    question: question,
                    answer: stepAnswers
                });
            }
        });

        return answers;
    }

    function formDataToPayload($form, extraData) {
        var form = $form[0];
        var formData = new FormData(form);
        var payload = {};

        formData.forEach(function (rawValue, rawKey) {
            var key = rawKey === 'number-foto' ? 'number_foto' : rawKey === 'link-foto' ? 'link_foto' : rawKey;
            var value = rawValue instanceof File ? rawValue.name : rawValue;
            value = normalizeLeadValue(value);

            if (!value && key !== 'website') {
                return;
            }

            if (payload[key] !== undefined) {
                if (!Array.isArray(payload[key])) {
                    payload[key] = [payload[key]];
                }
                payload[key].push(value);
                return;
            }

            payload[key] = value;
        });

        if (Array.isArray(payload.name) && $form.is('.form-callback__form_o')) {
            payload.comment = normalizeLeadValue(payload.name[1] || payload.comment);
            payload.name = normalizeLeadValue(payload.name[0]);
        }

        if (!payload.comment && Array.isArray(payload.comment)) {
            payload.comment = payload.comment.filter(Boolean).join(', ');
        }

        payload.form_name = getFormName($form);
        payload.page = window.location.href;
        payload.page_id = normalizeLeadValue((window.StroybrigadaSettings && window.StroybrigadaSettings.pageId) || '');
        payload.page_title = normalizeLeadValue((window.StroybrigadaSettings && window.StroybrigadaSettings.pageTitle) || document.title);
        payload.source_id = normalizeLeadValue(payload.source_id);
        payload.service = normalizeLeadValue(payload.service || payload.source_id);
        payload.contact_method = normalizeLeadValue(payload.contact || '');
        payload.attachment_name = '';

        var fileInput = form.querySelector('input[type="file"]');
        if (fileInput && fileInput.files && fileInput.files.length) {
            payload.attachment_name = Array.from(fileInput.files).map(function (file) {
                return normalizeLeadValue(file.name);
            }).filter(Boolean).join(', ');
        }

        if ($form.is('#testForm')) {
            payload.quiz_answers = collectQuizAnswers($form);
        }

        var enrichPayloadHook = getQuizFormHook(form, 'enrichPayload');
        if (enrichPayloadHook) {
            var enrichedPayload = enrichPayloadHook(form, payload);
            if (enrichedPayload && typeof enrichedPayload === 'object') {
                payload = enrichedPayload;
            }
        }

        var attribution = persistAttribution();
        Object.keys(attribution).forEach(function (key) {
            if (!normalizeLeadValue(payload[key])) {
                payload[key] = attribution[key];
            }
        });

        if (extraData && typeof extraData === 'object') {
            Object.keys(extraData).forEach(function (key) {
                payload[key] = extraData[key];
            });
        }

        return payload;
    }

    function payloadToRequestBody(form, payload) {
        var requestBody = new FormData();

        Object.keys(payload).forEach(function (key) {
            var value = payload[key];

            if (value === undefined || value === null || value === '') {
                return;
            }

            if (key === 'quiz_answers' || key === 'quiz_payload') {
                requestBody.append(key, JSON.stringify(value));
                return;
            }

            if (Array.isArray(value)) {
                value.forEach(function (item) {
                    if (item !== undefined && item !== null && item !== '') {
                        requestBody.append(key, item);
                    }
                });
                return;
            }

            requestBody.append(key, value);
        });

        Array.from(form.querySelectorAll('input[type="file"]')).forEach(function (input) {
            Array.from(input.files || []).forEach(function (file) {
                requestBody.append(input.name || 'attachment', file, file.name);
            });
        });

        return requestBody;
    }

    function updateSubmitState($form, isSubmitting) {
        var $submitControls = $form.find('button[type="submit"], input[type="submit"], .last-step-form__button');
        $submitControls.prop('disabled', isSubmitting);
        $form.toggleClass('is-submitting', isSubmitting);

        $form.find('.btn__load').toggle(isSubmitting);
        if ($form.is('[data-quiz-mode="house-reconstruction"]')) {
            $form.find('.quiz__final__btn__text').text(isSubmitting ? 'Отправляем...' : 'Отправить заявку');
        } else {
            $form.find('.quiz__final__btn__text').toggle(!isSubmitting);
        }

        $form.find('.form-button__button').each(function () {
            var $button = $(this);
            if (!$button.data('default-label')) {
                $button.data('default-label', $button.val());
            }

            $button.val(isSubmitting ? 'Отправляем...' : $button.data('default-label'));
        });
    }

    function configureCallbackModal(trigger) {
        var $trigger = $(trigger);
        var $modal = $('[data-remodal-id="callback"]').first();

        if (!$modal.length) {
            return;
        }

        var $title = $modal.find('[data-default-modal-title]').first();
        var $submit = $modal.find('.form-button__button[data-default-submit-label]').first();
        var $source = $modal.find('input[name="source_id"]').first();
        var $formName = $modal.find('input[name="formData"]').first();

        var defaultTitle = normalizeLeadValue($title.data('defaultModalTitle')) || normalizeLeadValue($title.text());
        var defaultSubmit = normalizeLeadValue($submit.data('defaultSubmitLabel')) || normalizeLeadValue($submit.val());
        var defaultSource = normalizeLeadValue($source.data('defaultSource')) || normalizeLeadValue($source.val());
        var defaultFormName = normalizeLeadValue($formName.data('defaultFormName')) || normalizeLeadValue($formName.val());

        if (!$source.attr('data-default-source')) {
            $source.attr('data-default-source', defaultSource);
        }

        var modalTitle = normalizeLeadValue($trigger.data('modalTitle')) || defaultTitle;
        var $serviceCard = $trigger.closest('.services3 .decorative-item');
        var serviceTitle = '';
        if ($serviceCard.length && $trigger.is('.small_form .btn.btn-st0')) {
            var buttonText = normalizeLeadValue($trigger.text());
            var cardTitle = normalizeLeadValue($serviceCard.find('.decorative-item-title').first().text());
            serviceTitle = buttonText && !/^(заказать звонок|обратный звонок|оставить заявку|подробнее|рассчитать|заказать)$/i.test(buttonText)
                ? buttonText
                : (cardTitle ? 'Рассчитать стоимость: ' + cardTitle : buttonText);
            modalTitle = serviceTitle || defaultTitle;
        }
        var modalSubmit = normalizeLeadValue($trigger.data('modalSubmit')) || defaultSubmit;
        var modalSource = normalizeLeadValue($trigger.data('modalSource')) || defaultSource;
        var modalFormName = normalizeLeadValue($trigger.data('modalFormName')) || defaultFormName;
        if (serviceTitle) {
            modalSubmit = 'Получить расчет';
            modalSource = serviceTitle;
            modalFormName = serviceTitle;
        }

        $title.text(modalTitle);
        $submit.val(modalSubmit).data('default-label', modalSubmit);
        $source.val(modalSource);
        $formName.val(modalFormName);
    }

    function resetCallbackModal() {
        var $modal = $('[data-remodal-id="callback"]').first();

        if (!$modal.length) {
            return;
        }

        var $title = $modal.find('[data-default-modal-title]').first();
        var $submit = $modal.find('.form-button__button[data-default-submit-label]').first();
        var $source = $modal.find('input[name="source_id"]').first();
        var $formName = $modal.find('input[name="formData"]').first();

        $title.text(normalizeLeadValue($title.data('defaultModalTitle')) || $title.text());
        $submit
            .val(normalizeLeadValue($submit.data('defaultSubmitLabel')) || $submit.val())
            .data('default-label', normalizeLeadValue($submit.data('defaultSubmitLabel')) || $submit.val());
        $source.val(normalizeLeadValue($source.attr('data-default-source')) || $source.val());
        $formName.val(normalizeLeadValue($formName.data('defaultFormName')) || $formName.val());
    }

    function markQuizSubmitIntent(form) {
        $(form).data('quizSubmitIntent', true);
    }

    function consumeQuizSubmitIntent(form, nativeEvent) {
        var $form = $(form);
        var submitter = nativeEvent && nativeEvent.submitter ? nativeEvent.submitter : null;
        var hasIntent = Boolean($form.data('quizSubmitIntent'));
        var isFinalSubmitter = false;
        var hasVisibleFinalSubmit = $form.find('.last-step-form__button').filter(function () {
            return $(this).is(':visible') && $(this).closest('.step-slide').is(':visible');
        }).length > 0;

        if (submitter) {
            isFinalSubmitter = $(submitter).is('.last-step-form__button');
        }

        $form.removeData('quizSubmitIntent');
        return hasIntent || isFinalSubmitter || hasVisibleFinalSubmit;
    }

    function reachLeadGoal(formName) {
        if (typeof window.ym !== 'function') {
            return;
        }

        window.ym(leadCounterId, 'reachGoal', getLeadGoalName(), {
            form_name: formName
        });
        return;

        if (formName && formName.toLowerCase().indexOf('квиз') !== -1) {
            window.ym(leadCounterId, 'reachGoal', 'quiz_complete', {
                form_name: formName
            });
        }
    }

    function updatePriceLeadPreviewHeights() {
        $('.prices--lead-enhanced .prices__table-preview').each(function () {
            var $container = $(this);
            var $rows = $container.find('tbody tr');
            var previewRows = 4;
            var rowIndex = Math.min(previewRows, $rows.length - 1);
            var extraSpace = window.innerWidth <= 575 ? 420 : window.innerWidth <= 991 ? 360 : 260;

            if (rowIndex < 0) {
                return;
            }

            var $lastVisibleRow = $rows.eq(rowIndex);
            var top = $lastVisibleRow.position().top;
            var height = $lastVisibleRow.outerHeight(true);

            if (typeof top === 'number' && typeof height === 'number') {
                $container.css('max-height', Math.ceil(top + height + extraSpace) + 'px');
            }
        });
    }

    function initPriceLeadCapture() {
        $('#price').each(function () {
            var $price = $(this);

            if ($price.find('.prices__cta').length) {
                return;
            }

            var $text = $price.find('.prices__text').first();
            var $table = $text.find('.table-responsive').first();

            if (!$text.length || !$table.length) {
                return;
            }

            var sourceId = normalizeLeadValue($price.find('.section-title').first().text()) || normalizeLeadValue(document.title);
            var leadMarkup = [
                '<div class="prices__cta">',
                '<div class="prices__cta-card">',
                '<div class="prices__cta-copy">',
                '<h3>Получить полный прайс лист</h3>',
                '<p>Отправим полный перечень строительных работ и актуальные цены удобным для вас способом.</p>',
                '</div>',
                '<form class="form-callback__form modal-form_form prices__cta-form">',
                '<input type="hidden" name="source_id" value="' + sourceId.replace(/"/g, '&quot;') + '">',
                '<input type="hidden" name="formData" value="Получить полный прайс-лист">',
                '<input type="hidden" name="service" value="Прайс-лист">',
                '<div class="form-input">',
                '<input type="tel" name="phone" class="white-input" required placeholder="Телефон">',
                '</div>',
                '<div class="form-select">',
                '<select name="contact" required>',
                '<option value="" selected disabled>Способ получения</option>',
                '<option value="Telegram">Телеграм</option>',
                '<option value="Max">Макс</option>',
                '<option value="SMS">СМС</option>',
                '</select>',
                '</div>',
                '<div class="form-button">',
                '<input type="submit" value="Получить полный прайс" class="form-button__button button-bg btn-sm bold pulse-button">',
                '</div>',
                '<div class="site-form-consent"><div class="site-form-consent__text">Нажимая кнопку, вы соглашаетесь на обработку персональных данных.</div></div>',
                '</form>',
                '</div>',
                '</div>'
            ].join('');

            $price.addClass('prices--lead-enhanced');
            $table.wrap('<div class="prices__table-preview"></div>');
            $text.append(leadMarkup);
            bindPhoneMask($price.find('.prices__cta-form input[type="tel"], .prices__cta-form input[name="phone"]'));
        });

        updatePriceLeadPreviewHeights();
        $(window).off('resize.priceLead').on('resize.priceLead', updatePriceLeadPreviewHeights);
    }

    async function submitLeadForm(form, extraData) {
        var $form = $(form);

        if ($form.data('isSubmitting')) {
            return;
        }

        var payload = formDataToPayload($form, extraData);
        var submitStartHook = getQuizFormHook(form, 'onSubmitStart');
        if (submitStartHook) {
            submitStartHook(form, payload);
        }
        var hasPhone = normalizeLeadValue(payload.phone);
        var hasEmail = normalizeLeadValue(payload.email);
        var isReviewForm = normalizeLeadValue(payload.form_name).toLowerCase() === 'отзыв';

        if (!hasPhone && !hasEmail && !isReviewForm) {
            setFormStatus($form, leadErrorMessage, true);
            if (typeof form.reportValidity === 'function') {
                form.reportValidity();
            }
            throw new Error('Missing contact field');
        }

        $form.data('isSubmitting', true);
        setFormStatus($form, '', false);
        updateSubmitState($form, true);

        try {
            var themeSettings = window.StroybrigadaSettings || {};
            var leadEndpoint = themeSettings.restUrl ? String(themeSettings.restUrl).replace(/\/?$/, '/') + 'lead' : '/api/lead.php';
            var response = await fetch(leadEndpoint, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-WP-Nonce': themeSettings.nonce || ''
                },
                body: payloadToRequestBody(form, payload)
            });

            var result = await response.json().catch(function () {
                return { success: false, message: leadErrorMessage };
            });

            if (!response.ok || !result.success) {
                throw new Error(normalizeLeadValue(result.message) || leadErrorMessage);
            }

            var successState = leadSuccessMessage;
            var successStateHook = getQuizFormHook(form, 'getSuccessState');
            if (successStateHook) {
                successState = successStateHook(form, payload, result) || successState;
            }

            setFormStatus($form, typeof successState === 'object' ? normalizeLeadValue(successState.text || successState.message) : successState, false);
            reachLeadGoal(payload.form_name);

            showInlineSuccess($form, successState);
            form.reset();

            var submitSuccessHook = getQuizFormHook(form, 'onSubmitSuccess');
            if (submitSuccessHook) {
                submitSuccessHook(form, payload, result);
            }

            return result;
        } catch (error) {
            setFormStatus($form, normalizeLeadValue(error && error.message) || leadErrorMessage, true);
            var submitErrorHook = getQuizFormHook(form, 'onSubmitError');
            if (submitErrorHook) {
                submitErrorHook(form, payload, error);
            }
            throw error;
        } finally {
            $form.data('isSubmitting', false);
            updateSubmitState($form, false);
        }
    }

    addHoneypotFields();
    persistAttribution();
    initPriceLeadCapture();
    $('.form-callback__form, .form-callback__form_h, .form-callback__form_o, .form-callback__form_v, .form-callback__form_v1, #testForm').each(function () {
        ensureFallbackNote($(this));
    });
    $('form[onsubmit*="quiz_complete"]').removeAttr('onsubmit');

    $(document).on('click', '#testForm .last-step-form__button', function () {
        markQuizSubmitIntent($(this).closest('form'));
    });

    $(document).on('keydown', '#testForm .last-step-form__input, #testForm .last-step-form__input3', function (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            markQuizSubmitIntent($(this).closest('form'));
        }
    });

    $(document).on('submit', '.form-callback__form, .form-callback__form_h, .form-callback__form_o, .form-callback__form_v, .form-callback__form_v1, #testForm', function (event) {
        if (this.id === 'testForm' && !consumeQuizSubmitIntent(this, event.originalEvent)) {
            event.preventDefault();
            return;
        }

        var customValidationHook = getQuizFormHook(this, 'validateForm');
        if (customValidationHook && customValidationHook(this) === false) {
            event.preventDefault();
            return;
        }

        event.preventDefault();
        submitLeadForm(this).catch(function () {
            return null;
        });
    });

    $(document).on('click', 'a[href^="#"]', function (event) {
        var modalId = this.getAttribute('href').slice(1);
        var $modal = $('[data-remodal-id]').filter(function () {
            return this.getAttribute('data-remodal-id') === modalId;
        }).first();
        if (!modalId || !$modal.length || !$.fn.remodal) {
            return;
        }

        event.preventDefault();
        if (modalId === 'callback') {
            configureCallbackModal(this);
        }
        var modal = $modal.remodal({ hashTracking: false });
        modal.settings.hashTracking = false;
        modal.open();
    });

    $(document).on('closed', '.remodal', function () {
        $(this).find('form').each(function () {
            restoreInlineSuccess($(this));
        });

        if ($(this).is('[data-remodal-id="callback"]')) {
            resetCallbackModal();
        }
    });
