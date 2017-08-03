var solvedCaptcha = EC.solvedCaptcha;

$(document).ready(function() {
    $(".ecw-dialog-close, #ecw-button-dismiss").click(function(e) {
        hideDialog();
    });
    $("#ecw-btn-classify").click(function(e) {
        var query = $("#ecw-query-input").val();
        if (query == '') {
            alert('You must enter something in the query field.');
            return false;
        }
        var baseUrl = EC.baseUrl;
        var method = 'get';
        var match;
        var payload;
        var endPoint;
        var formData;
        if (null !== (match = query.match(/\@([^.]+)/))) {
            payload = match[1];
            endPoint = 'user';
            formData = {
                screen_name: payload
            };
        } else if (null !== (match = query.match(/https?/))) {
            payload = query;
            endPoint = 'url';
            formData = {
                url: payload
            };
        } else if (null !== (match = query.match(/\s/g))) {
            payload = query;
            endPoint = (match.length > 2)
                ? 'text'
                : 'search';
            if (endPoint == 'text') {
                formData = {
                    text: payload
                };
                method = 'post';
            } else {
                formData = {
                    q: payload
                };
            }
        } else {
            payload = query;
            endPoint = 'search';
            formData = {
                q: payload
            };
        }
        var classify = function() {
            showLoadingScreen(true);
            $.ajax({
                method: method,
                data: formData,
                url: baseUrl + '/' + endPoint
            })
                .done(function(d) {
                    showLoadingScreen(false);
                    buildTreeMap(d, '#ecw-canvas');
                })
                .fail(function(e) {
                    console.log(e);
                });
        }
        if (!solvedCaptcha) {
            var gResponse = $("[name='g-recaptcha-response']").val();
            if (gResponse.length == 0) {
                showDialog('Sorry, but you must complete the captcha first.');
            }
            $.ajax({
                url: baseUrl + '/' + 'verify',
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

    // remove previous viz
    $(".anchorZTM, .tool-tip").remove();
    tweetsBox.tweets = [];
    $(".ztm-path-buttons").hide();

    var treemap = EC.ZoomTreeMap(selector, data);

    // set the stage width
    var stageWidth = $(selector).width();

    treemap.setWidth(stageWidth);
    treemap.build();

    EC.Events.subscribe('/ZoomTreeMap/zoom', function(d) {
        tweetsBox.tweets = [];
        tweetsBox.tweets = d.tweets;
    });
};