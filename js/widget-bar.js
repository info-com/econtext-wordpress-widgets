var solvedCaptcha = EC.solvedCaptcha;
var barViz;

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
        var classify = function() {
            showLoadingScreen(true);
            if (barViz) {
                barViz.remove();
            }

            var baseUrl = EC.baseUrl;
            var method = 'get';
            var url;

            if (query.match(/^\@/)) {
                url = baseUrl + '/' + 'user'
            } else {
                url = baseUrl + '/' + 'url'
            }
            $.ajax({
                method: method,
                data: { query: query},
                url: url
            })
                .done(function(d) {
                    barViz = EC.HorizontalBarGraph(d, '#ecw-canvas');
                    barViz.setOption('chartHeight', chartHeight());
                    barViz.paint();
                    $("#ecw-canvas").on('swipeleft', function(e) {
                        barViz.next();
                    });
                    $("#ecw-canvas").on('swiperight', function(e) {
                        barViz.previous();
                    });
                    hideDialog();
                    scrollTo('#chart-control', 15);
                })
                .fail(function(e) {
                    showDialog(e.responseJSON.error);
                });
        };
        if (!solvedCaptcha) {
            var gResponse = $("[name='g-recaptcha-response']").val();
            if (gResponse.length == 0) {
                showDialog('Sorry, but you must complete the captcha first.');
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

    $(".ecw-fullmodal-close").on("click", function(e) {
        hideFullModal();
    });
});

var tweetsPanel = new Vue({
    el: '#ecw-tweets',
    data: {
        category: null
    }
});

EC.Events.subscribe('/HorizontalBarGraph/barClick', function(d) {
    tweetsPanel.category = d;
    showFullModal();
});
EC.Events.subscribe('/HorizontalBarGraph/btnPrevClick', function(d) {
    barViz.previous();
});
EC.Events.subscribe('/HorizontalBarGraph/btnNextClick', function(d) {
    barViz.next();
});

var chartHeight = function() {
    return $(window).height() - $(".ecw-controls").height();
};

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

var showFullModal = function() {
    $(".ecw-mask-asset").hide();
    $(".ecw-mask, .ecw-fullmodal").show();
};

var hideFullModal = function() {
    $(".ecw-mask").hide();
};

var scrollTo = function(sel, padding) {
    var topPadding = (padding) ? padding : 0;
    $('html, body').animate({
        scrollTop: $(sel).offset().top - topPadding
    }, 500);
};