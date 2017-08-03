var solvedCaptcha = EC.solvedCaptcha;
var barViz;
$(document).ready(function() {
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
            }
            else {
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
        $.ajax({
            method: method,
            data: formData,
            url: baseUrl + '/' + endPoint
        })
            .done(function(d) {
                barViz = EC.HorizontalBarGraph(d, '#ecw-canvas');
                barViz.paint();
                $("#ecw-canvas").on('swipeleft', function(e) {
                    barViz.next();
                });
                $("#ecw-canvas").on('swiperight', function(e) {
                    barViz.previous();
                });
            })
            .fail(function(e) {
                console.log(e);
            });
    });
});

var buildBar = function(profile, el) {
    var categories = profile.categories.sort(function(a,b) {
        return b.count - a.count;
    });
    var numBarsPerPage = categories.length;
    var barHeight = 25;
    var barPaddingBottom = 5;

    var width = function() {
        return $(el).width();
    };
    var height = function() {
        return options.numBarsPerPage * (options.barHeight + options.barPaddingBottom);
    };
    var countsList = categories.map(function(d) {
        return d.count;
    });
    var xScale = d3.scale.linear().domain(d3.extent(countsList)).range([1, width()]);

    var svg = d3.select(el).append("svg")
        .attr("width", width())
        .attr("height", height());

    var bars = svg.selectAll(".bar")
        .data(categories)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", function(d, i) {
            return i * (barHeight + barPaddingBottom);
        })
        .attr("width", function(d, i) {
            return xScale(d.count)
        })
        .attr("height", barHeight)
        .attr("fill", function(d, i) {
            return EC.Colors.byVertical(d.vertical);
        });

    var text = svg.selectAll(".text")
        .data(categories)
        .enter()
        .append("text")
        .attr("x", 5)
        .attr("y", function(d, i) {
            return i * (barHeight + barPaddingBottom) + 15;
        })
        .attr("font-size", "12px")
        .style("dominant-baseline", "middle")
        .text(function(d) {
            return d.name;
        });
}