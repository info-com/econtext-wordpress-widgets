var solvedCaptcha = EC.solvedCaptcha;

$(document).ready(function() {
    $(".ecw-controls .tabs li").on('click', function(e) {
        var panelId = $(this).data('showId');
        $(".tab-item").removeClass("active");
        $(this).addClass("active");
        $(".panel").removeClass("active");
        $("#" + panelId).addClass("active");
        removeAllCharts();
    });
    $(".ecw-dialog-close, #ecw-button-dismiss").click(function(e) {
        hideDialog();
    });
    $(".ecw-btn-classify").click(function(e) {
       var query, type;
       $(".panel").each(function(i, d) {
           if ($(d).hasClass('active')) {
               var qi = $(d).find("[name='ecw-query-input']");
               query = qi.val();
               type = qi.data('classifyType');
           }
       });
       if (query == '') {
           return showDialog('You must enter something in the query field.');
       }
       var url = EC.baseUrl + '/' + type;
       var method = 'get';
       var formData = {
           query: query
       };
       var classify = function() {
           showLoadingScreen(true);
           $.ajax({
               method: method,
               data: formData,
               url: url
           })
               .done(function(d) {
                   showLoadingScreen(false);
                   if (type == 'user') {
                       buildTreeMap(d, '#ecw-canvas');
                   } else {
                       buildCategoryBarChart(d, '#ecw-canvas');
                   }
               })
               .fail(function(e) {
                   showDialog(e.responseJSON.error);
                });
        };
        if (!solvedCaptcha) {
            var gResponse = $("[name='g-recaptcha-response']").val();
            if (gResponse.length == 0) {
                return showDialog('Sorry, but you must complete the captcha first.');
            }
            $.ajax({
                url: EC.baseUrl + '/' + 'verify',
                data: {
                    'g-captcha-response': gResponse
                }
            })
                .done(function(d) {
                    solvedCaptcha = true;
                    $('.g-recaptcha').hide();
                    classify();
                })
                .fail(function(e) {
                    showDialog(e.responseJSON.error);
                });
        } else {
            classify();
        }
    });
});

// tweets box
var tweetsBox = new Vue({
    el: '#ecw-tweets',
    data: {
        tweets: null
    },
    methods: {
        formatDate: function(dateStr) {
            var newDate = new Date(dateStr);
            return newDate.toLocaleDateString();
        },
        largerProfilePic: function(url) {
            return url.replace("normal", "bigger");
        },
        textWithUrls: function(tweet) {
            var text = tweet.text;
            if (tweet.entities) {
                if (tweet.entities.urls) {
                    tweet.entities.urls.forEach(function(u) {
                        var replace = '<a href="' + u.expanded_url + '" target="_blank">' + u.display_url + '</a>';
                        text = text.replace(u.url, replace);
                    });
                }
                if (tweet.entities.media) {
                    tweet.entities.media.forEach(function(u) {
                        var replace = '<a href="' + u.expanded_url + '" target="_blank">' + u.display_url + '</a>';
                        text = text.replace(u.url, replace);
                    })
                }
            }
            return text;
        }
    }
});

var categoriesBox = new Vue({
    el: '#ecw-categories',
    data: {
        categories: null
    },
    methods: {
        showPath: function(pathArr) {
            if (pathArr.length == 1) {
                return null;
            }
            var newArr = pathArr.slice(0, (pathArr.length - 1));
            return newArr.join(' :: ') + ' :: ';
        }
    }
});

var showLoadingScreen = function(n) {
    $(".ecw-mask-asset").hide();
    $(".ecw-loading-screen").show();
    if (n === true) {
        $(".ecw-mask").show();
    } else {
        $(".ecw-mask").hide();
    }
};

var showDialog = function(t) {
    $(".ecw-mask-asset").hide();
    $(".ecw-mask, .ecw-dialog").show();
    $("#ecw-dialog-text").html(t);
};

var hideDialog = function() {
    $(".ecw-mask").hide();
};

// treemap
var buildTreeMap = function(data, selector) {
    removeAllCharts();
    var stageWidth = $(selector).width();

    var treemap = EC.ZoomTreeMap(selector, data);
    treemap.setWidth(stageWidth);
    treemap.build();
    EC.scrollTo('.ecw-controls', 1000, 5);

    EC.Events.subscribe('/ZoomTreeMap/zoom', function(d) {
        tweetsBox.tweets = [];
        if (d.parent) {
            tweetsBox.tweets = d.tweets.slice(0,5);
            EC.scrollTo('#ecw-canvas', 500, 5);
        }
    });
};

// category bar chart
var buildCategoryBarChart = function(data, selector) {
    removeAllCharts();
    var chart = EC.CategoryBarChart(selector, data);
    chart.render();
    categoriesBox.categories = data.categories.slice(0, 10);
};

// remove all charts
var removeAllCharts = function() {
    // treemap
    $(".anchorZTM, .tool-tip").remove();
    tweetsBox.tweets = [];
    $(".ztm-path-buttons").hide();
    // categorybarchart
    $("#ecw-canvas").html('');
    categoriesBox.categories = null;
};