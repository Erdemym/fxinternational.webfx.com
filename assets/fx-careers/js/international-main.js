jQuery(function($) {
    var jobsBoard = {
        pagination: {
            postPerPage: 10,
            page: 1,
            paginationClass: 'pagination'
        },
        jobsPostsArray: [],
        instance: '#cr-jobs-board',
        jobsPostsApiURL: 'https://api.lever.co/v0/postings/webfx?v1&group=team&mode=json',
        getPaginationControl: function() {
            var paginationClass = '.' + jobsBoard.pagination.paginationClass;
            return $(jobsBoard.getJobsListContainer().find(paginationClass).get(0));
        },
        getJobsPostsArray: function() {
            return jobsBoard.jobsPostsArray;
        },
        getJobsPostsArrayFiltered: function(departmentId, locationId) {
            var jobsFound = [];
            var jobsPostsArray = jobsBoard.getJobsPostsArray();
            for (var a = 0; a < jobsPostsArray.length; a++) {
                var jobItem = jobsPostsArray[a];
                if ((departmentId == '' || jobItem.department.id == departmentId) && (locationId == '' || jobItem.location.id == locationId)) {
                    jobsFound.push(jobItem);
                }
            }
            return jobsFound;
        },
        pushJobPostInArray: function(job) {
            jobsBoard.jobsPostsArray.push(job);
        },
        getDeparmentsDropdown: function() {
            return jobsBoard.getInstance().find('.deparment-dropdown');
        },
        setDeparmentsDropdownChangeHandler: function() {
            jobsBoard.getDeparmentsDropdown().change(function() {
                var departmentId = jobsBoard.getDeparmentsDropdown().val();
                var locationId = jobsBoard.getLocationsDropdown().val();
                jobsBoard.getJobsListContainer().find('.no-open-positions').addClass('hidden');
                var jobsPostsArray = jobsBoard.getJobsPostsArrayFiltered(departmentId, locationId);
                jobsBoard.setupJobsPaginationList(jobsPostsArray);
            });
        },
        getLocationsDropdown: function() {
            return jobsBoard.getInstance().find('.location-dropdown');
        },
        setLocationsDropdownChangeHandler: function() {
            jobsBoard.getLocationsDropdown().change(function() {
                var departmentId = jobsBoard.getDeparmentsDropdown().val();
                var locationId = jobsBoard.getLocationsDropdown().val();
                jobsBoard.getJobsListContainer().find('.no-open-positions').addClass('hidden');
                var jobsPostsArray = jobsBoard.getJobsPostsArrayFiltered(departmentId, locationId);
                jobsBoard.setupJobsPaginationList(jobsPostsArray);
            });
        },
        setupJobsPaginationList: function(jobsPostsArray) {
            jobsBoard.getPaginationControl().empty();
            jobsBoard.getJobsListContainer().find('.open_post-item:not(.job-model)').remove();
            jobsBoard.getJobsListContainer().find('.no-open-positions').addClass('hidden');
            var totalItems = jobsPostsArray.length;
            if (totalItems > 0) {
                jobsBoard.getPaginationControl().pagination({
                    dataSource: jobsPostsArray,
                    callback: function(data, pagination) {
                        jobsBoard.addJobsPostsInBoard(data);
                        jobsBoard.setJobsToggleButtons();
                    }
                });
            } else {
                jobsBoard.getJobsListContainer().find('.no-open-positions').removeClass('hidden');
            }
        },
        addJobsPostsInBoard(jobsPostsArray) {
            var jobsItemModel = $(jobsBoard.getJobsListContainer().find('.job-model.hidden').get(0));
            jobsBoard.getJobsListContainer().find('.open_post-item:not(.job-model)').remove();
            jobsBoard.getJobsListContainer().find('.no-open-positions').addClass('hidden');
            for (var a = 0; a < jobsPostsArray.length; a++) {
                var postItem = jobsPostsArray[a];
                var applyBtn = '<a href="' + postItem.applyUrl + '" class="btn btn-green" target="_blank">APPLY NOW </a>';
                jobsItemModel.find('.card-title a').html(postItem.title);
                jobsItemModel.find('.card-title a').attr('href', postItem.url);
                jobsItemModel.find('.location-name').html(postItem.location.name);
                jobsItemModel.find('.commitment').html(postItem.commitment);
                jobsItemModel.find('.card-text').html(postItem.description + applyBtn);
                jobsItemModel.find('.date').html(postItem.createdAtFriendlyDate);
                jobsItemModel.removeClass('.job-model');
                $('<div class="open_post-item">' + jobsItemModel.html() + '</div>').insertBefore(jobsBoard.getPaginationControl());
                var lastJobAdded = $(jobsBoard.getJobsListContainer().find('.open_post-item:last').get(0));
                lastJobAdded.data('locationId', postItem.location.id);
                lastJobAdded.data('departmentId', postItem.department.id);
            }
        },
        getJobsListContainer: function() {
            return jobsBoard.getInstance().find('#jobs-list');
        },
        getJobsPostsApiURL: function() {
            return jobsBoard.jobsPostsApiURL;
        },
        getInstance: function() {
            return $(jobsBoard.instance);
        },
        getJobsPosts: function(parameters, successCallback, errorCallback) {
            $.ajax({
                type: "GET",
                url: jobsBoard.getJobsPostsApiURL(),
                data: parameters,
                dataType: 'json',
                success: successCallback,
                error: errorCallback
            });
        },
        setupJobsBoard: function(data) {
            for (var a = 0; a < data.length; a++) {
                var department = data[a];
                var departmentId = jobsBoard.removeNonAlphanumericCharacters(department.title).toLowerCase();
                jobsBoard.getDeparmentsDropdown().append('<option value="' + departmentId + '">' + department.title + '</option>');
                if (department.postings !== undefined && department.postings !== null && department.postings.length > 0) {
                    for (var p = 0; p < department.postings.length; p++) {
                        var postItem = department.postings[p];
                        var locationName = "";
                        var locationId = "";
                        var commitment = "";
                        if (postItem.categories !== undefined && postItem.categories !== null) {
                            if (postItem.categories.location !== undefined && postItem.categories.location !== null) {
                                locationName = postItem.categories.location;
                                locationId = jobsBoard.removeNonAlphanumericCharacters(locationName).toLowerCase();
                                if (jobsBoard.getLocationsDropdown().find('option[value="' + locationId + '"]').length == 0 && (locationId == 'remote' || locationId == "guatemala" || locationId == "southafrica" || locationId == "capetown" || locationId == 'johannesburg' || locationId == 'antiguagt' || locationId == 'philippines')) {
                                    jobsBoard.getLocationsDropdown().append('<option value="' + locationId + '">' + locationName + '</option>');
                                }
                            }
                            if (postItem.categories.commitment !== undefined && postItem.categories.commitment !== null) {
                                commitment = postItem.categories.commitment;
                            }
                        }
                        if (locationId == 'remote' || locationId == 'guatemala' || locationId == 'southafrica' || locationId == 'capetown' || locationId == 'johannesburg' || locationId == 'antiguagt' || locationId == 'phremote' || locationId == 'philippines') {
                            var locationItem = {
                                name: locationName,
                                id: locationId
                            };
                            if (locationId == 'phremote') {
                                locationItem = {
                                    name: 'Philippines',
                                    id: 'philippines'
                                };
                            }
                            var newJob = {
                                title: postItem.text,
                                description: postItem.description,
                                url: postItem.hostedUrl,
                                applyUrl: postItem.applyUrl,
                                location: locationItem,
                                department: {
                                    name: department.title,
                                    id: departmentId
                                },
                                commitment: commitment,
                                createdAtFriendlyDate: jobsBoard.convertTimestampToHumanDate(postItem.createdAt)
                            };
                            jobsBoard.pushJobPostInArray(newJob);
                        }
                    }
                }
            }
            jobsBoard.setDeparmentsDropdownChangeHandler();
            jobsBoard.setLocationsDropdownChangeHandler();
            jobsBoard.setupJobsPaginationList(jobsBoard.getJobsPostsArray());
        },
        onSuccessJobsPostsHandler: function(data, textStatus, jqXHR) {
            if (data !== undefined && data != null && data.constructor === Array && data.length > 0) {
                jobsBoard.setupJobsBoard(data);
            }
        },
        onErrorJobsPostsHandler: function(jqXHR, textStatus, errorThrown) {},
        setJobsToggleButtons: function() {
            jQuery('.open_post-item .card-toggle').click(function() {
                if ($(this).parents('.open_post-item').hasClass('open')) {
                    $('.open_post-item').removeClass('open');
                    $(this).find('i').addClass('cic-plus');
                    $(this).find('i').removeClass('cic-minus-icon');
                } else {
                    $('.open_post-item').removeClass('open');
                    $(this).parents('.open_post-item').addClass('open');
                    $(this).find('i').removeClass('cic-plus');
                    $(this).find('i').addClass('cic-minus-icon');
                }
                return false;
            });
        },
        init: function() {
            jobsBoard.getJobsPosts({}, jobsBoard.onSuccessJobsPostsHandler, jobsBoard.onErrorJobsPostsHandler);
        },
        removeNonAlphanumericCharacters: function(str) {
            var regex = /[^A-Za-z0-9]/g;
            return str.replace(regex, "");
        },
        convertTimestampToHumanDate: function(timestamp) {
            if (timestamp == undefined || timestamp == null) {
                return "";
            }
            var d = new Date(timestamp);
            return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
        }
    };
    jobsBoard.init();
    jQuery('.CR-testi-carousel').slick({
        autoplay: true,
        arrows: false,
    });
    jQuery('.hubs-carousel').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        appendArrows: '.CR-hubs-control',
        prevArrow: '<button type="button" class="slick-prev slick-arrow"><i class="cic-long-arrow-left"></i></button>',
        nextArrow: '<button type="button" class="slick-next slick-arrow"><i class="cic-long-arrow-right"></i></button>',
        responsive: [{
            breakpoint: 1200,
            settings: {
                slidesToShow: 2
            }
        }, {
            breakpoint: 600,
            settings: {
                slidesToShow: 1
            }
        }]
    });
    jQuery('.initiatives-cards-slider').slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        appendArrows: '.initiatives-cards-control',
        prevArrow: '<button type="button" class="slick-prev slick-arrow"><i class="cic-long-arrow-left"></i></button>',
        nextArrow: '<button type="button" class="slick-next slick-arrow"><i class="cic-long-arrow-right"></i></button>',
        responsive: [{
            breakpoint: 1200,
            settings: {
                slidesToShow: 3
            }
        }, {
            breakpoint: 600,
            settings: {
                slidesToShow: 1
            }
        }]
    });
    $('main').find('a').each(function() {
        if ($(this).attr('href') != undefined && $(this).attr('href').charAt(0) == '#' && $(this).attr('href').length > 1) {
            $(this).click(function() {
                $('html, body').animate({
                    scrollTop: $($(this).attr('href')).offset().top - 70
                });
            });
        }
    });
    $('.team-photos-slider').slick({
        dots: true,
        infinite: true,
        speed: 300,
        slidesToShow: 2,
        slidesToScroll: 1,
        dots: false,
        prevArrow: '',
        nextArrow: '<a href="" id="next-btn"></a>',
        variableWidth: true
    });
    function setupPopup() {
        if (!isDisclaimerClosed()) {
            $('#cookieConsent').fadeIn(2000);
        }
        $('#cookieConsent').find('#closeCookieConsent').click(function() {
            var expirationDate = new Date();
            expirationDate.setTime(expirationDate.getTime() + (400 * 24 * 60 * 60 * 1000));
            document.cookie = 'close-country-disclaimer=true;  domain=.webfx.com; expires=' + expirationDate.toUTCString() + '; path=/';
        });
    }
    function isDisclaimerClosed() {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.indexOf('close-country-disclaimer=') === 0) {
                return true;
            }
        }
        return false;
    }
    setupPopup();
});
