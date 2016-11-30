EC.Events.subscribe("/ready", function() {
    var timer;
    var second_timer;

    // Classify Button Press
    $("#btn-transcribe").on("click", function(e) {
        // Don't let the button submit the form
        e.preventDefault();

        // Clear previous elements on screen
        clearAll();

        var video_url = $("#txt-transcribe").val();
        $.ajax({
            method: "get",
            data: {
               "video_url": video_url
            },
            url: "../api/video/add",
        })
        .done(function(d) {
            processingCard();
            timer = window.setInterval(show, 1000, video_url);
        })
        .fail(function(d) {
            alert(d.responseJSON.error);
        });
    });

    // Clears the page
    var clearAll = function() {
        removeProcessingCard();
        $(".dynamic-add").remove();
        window.clearInterval(timer);
    };

    // Checks to see if video is done processing
    var show = function(url) {
        $.ajax({
            method: "get",
            data: {
                "video_url": url
            },
            url: "../api/video/show"
        })
        .done(function(d) {
            if (d.status == "complete") {
                removeProcessingCard();
                window.clearInterval(timer);
                build(d.video);
            }
            if (d.status == "error") {
                removeProcessingCard();
                window.clearInterval(timer);
                alert("Sorry, there was a problem transcribing this video.");
            }
        });
    };

    // Creates a new card
    var newCard = function(html, extra_class) {
        var extra_class = extra_class || "";
        var anchor = $(".contentRail");
        anchor.append("<div class='row contentBox dynamic-add "+ extra_class + "'><div class='col-md-12'>" + html + "</div>");
    };

    // Creates a processing card
    var processingCard = function(processing_class) {
        var processing_class = processing_class || "processing";
        var processing = EC.Templates.get("ui-transcribe-processing");
        newCard(processing(), processing_class);
    };

    // Removes processing card
    var removeProcessingCard = function() {
        $(".processing").remove();
    }

    // Builds page
    var build = function(d) {
        var title = EC.Templates.get("ui-transcribe-title");
        newCard(title(d));
        var transcript = EC.Templates.get("ui-transcribe-transcript");
        newCard(transcript(d), "videoInfoBox");
        processingCard();
        $.ajax({
            method: "post",
            data: {
                "text": d.wrap_html
            },
            url: "../api/video/classify"
        })
        .done(function(d) {
            removeProcessingCard();
            vizText(d);
        });
    };

    var vizText = function(data) {
        var selector = ".videoInfoBox";
        var data = data;
        var txtPadding = "20px";
        var video_url = $("#txt-transcribe").val();

        // set up anchors
        var catAnchor = attachAnchor(selector, txtPadding, "dynamic-add catInfoBox");
        var tiersAnchor	= attachAnchor(selector, txtPadding, "dynamic-add");
        var imageRecogAnchor = attachAnchor(selector, txtPadding, "dynamic-add imageRecogBox");
        // Remove selector from last anchor
        $(selector).removeClass(selector);
        // Set up the title sections
        $(tiersAnchor).append(insertTitle("Top Verticals (Tier 1)", "title"));
        $(imageRecogAnchor).append(insertTitle("Image Recognition", "title"));
        $(imageRecogAnchor).append("<div>Recognizing Images...</div>");

        // set up the categories
        ListPathViz.init();
        ListPathViz.config.showBreadcrumbs = true;
        ListPathViz.render(catAnchor, data.categories);

        // top verticals list
        var verticalData = d3.nest()
            .key(function(d) { return d.vertical; })
            .rollup(function(leaves) { return d3.sum(leaves, function(d) { return +(d.count * 100).toFixed(2); }); })
            .entries(data.categories);
        verticalData.sort(function(a,b) { return (b.values - a.values); });
        var topVerticals = verticalData.map(function(d) {
            return { vertical: d.key, count: Math.round(d.values) };
        });
        // set up the top tiers
        VertBarViz.init();
        VertBarViz.render(tiersAnchor, topVerticals);
        processingCard();
        $.ajax({
            method: "post",
            data: {
                "text": data.transcript
            },
            url: "../api/video/classifySocial"
        })
        .done(function(p) {
            removeProcessingCard();
            vizSocial(p, data.transcript);
        });

        // fetch image recognition box
        second_timer = window.setInterval(recognizeImages, 1000, video_url);
    };

    // fetches recognized images
    var recognizeImages = function(url) {
        $.ajax({
            method: "post",
            data: {
                "video_url": url
            },
            url: "../api/video/recognizeImages"
        })
            .done(function(d) {
                if (d.length > 0) {
                    window.clearInterval(second_timer);
                    $(".imageRecogBox div").html(d.join(", "));
                }
            })
            .fail(function(d) {
                alert(d);
            });
    };

    // runs the visualization
    var vizSocial = function(d, q) {
        var listLimit = 10;
        var catCount = 30;
        var tierNames = [ "vertical", "secondary", "tertiary", "name" ];
        var txtPadding = "20px";
        var data = d.categories;
        var selector = ".catInfoBox";
        var queries = q;
        var multipleUsers = (queries.length > 1) ? true : false;

        // Handle Events
        EC.Events.subscribe('/Bubbles/render', function() {
            d3.selectAll(".twitter-user-multiple").classed("user-box-blur", function(d) {
                d.selected = false;
                return false;
            });
            $(".node-text-container").textfill({
                maxFontPixels: 75,
                minFontPixels: 8
            });
        });
        EC.Events.subscribe('/Bubbles/deselectNodes', function() {
            d3.selectAll(".twitter-user-multiple").classed("user-box-blur", function(d) {
                d.selected = false;
                return false;
            });
        });

        // attach category box anchor, then hide it
        var categoryAnchor = attachAnchor(selector, "20px", "dynamicContent indent-block");
        $(categoryAnchor).attr("id", "show-category").addClass("hide");

        // bubble chart anchor
        var bubbleAnchor = attachAnchor(selector);
        $(bubbleAnchor).attr("id", "bubbleChart");

        // initialize the bubble chart
        var bubbles = new EC.Bubbles(bubbleAnchor, {
            "category_count": d.category_count,
            "categories": d.categories,
            "users": []
        });
        bubbles.setOptions({showTweets: false, fixedCenterNode: false});

        // set the stage width
        var stageWidth = $(bubbleAnchor).width() - parseInt($(bubbleAnchor).parent().css('padding-right'));
        bubbles.setWidth(stageWidth);

        // bubble controls
        var bubbleControls = attachAnchor(selector, txtPadding, "no-margin-bottom");
        $(bubbleControls)
            .attr("id", "bubbleControls")
            .append(insertElement("div", "", "bubble-control-toggle"))
            .append(insertTitle("Frequent Categories", "title"))
            .append(insertElement("div", "", "bubble-controls"));
        $(".bubble-control-toggle").on("click", function() {
            $(".bubble-controls").toggle();
        });

        // set up the depth buttons
        $(".bubble-controls").append(insertElement("div", "Tier Depth", "tier-depth"));
        var depthRadius = 15;
        var buttonSpacing = 5;
        var depthTextTop = 15;
        var depthNames = [
            {indicator: "1", text: "1st"},
            {indicator: "2", text: "2nd"},
            {indicator: "3", text: "3rd"},
            {indicator: "F", text: "Final"}
        ];
        var setDepthText = function(target, i) {
            d3.select(target.parentNode).selectAll(".depth-name-text").remove();
            d3.select(target.parentNode)
                .append("text")
                .attr("class", "depth-name-text")
                //.attr("dominant-baseline", "central")
                .attr("text-anchor", "middle")
                .attr("y", depthRadius * 2 + depthTextTop)
                .attr("x", function() {
                    var x = target.getAttribute("x") || target.getAttribute("cx");
                    return parseInt(x);
                })
                .text(depthNames[i].text);
        };
        var depthButtons = d3.select(bubbleControls).select(".tier-depth").append("svg")
            .attr("height", function() { return (depthRadius * 2) + depthTextTop; })
            .style("float", "right")
            .style("margin-left", "10px");
        depthButtons.selectAll("circle")
            .data(depthNames).enter()
            .append("circle")
            .attr("cx", function(d,i) {
                var offset = ((depthRadius * 2) + buttonSpacing) * i;
                var parentWidth = offset + (depthRadius * 2);
                // here we set the svg width and height dynamically
                this.parentNode.setAttribute("width", parentWidth);
                return offset + depthRadius;
            })
            .attr("cy", depthRadius)
            .attr("r", depthRadius)
            .attr("class", function(d,i) {
                if (i == (depthNames.length - 1)) {
                    setDepthText(this, i);
                    return "selected";
                }
            })
            .on("click", function(d, i) {
                selectDepthButton(this, i + 1);
            });
        depthButtons.selectAll("text.depth-indicator-text")
            .data(depthNames).enter()
            .append("text")
            .attr("class", "depth-indicator-text")
            .attr("dominant-baseline", "central")
            .attr("text-anchor", "middle")
            .attr("y", depthRadius)
            .attr("x", function(d,i) {
                var offset = ((depthRadius * 2) + buttonSpacing) * i;
                return offset + depthRadius;
            })
            .text(function(d) { return d.indicator; })
            .on("click", function(d,i) {
                selectDepthButton(this, i + 1);
            });
        var selectDepthButton = function(target, i) {
            d3.select(".tier-depth").selectAll("circle").classed("selected", false);
            d3.select(".tier-depth").selectAll("circle:nth-child(" + i + ")").classed("selected", true);
            setDepthText(target, i - 1);
            bubbles.setDepth(i);
            bubbles.refresh();
        };

        // build the node dropdown
        d3.select(bubbleControls).select(".bubble-controls")
            .append("label")
            .text("Max");
        bubbleCount = d3.select(bubbleControls).select(".bubble-controls")
            .append("select")
            .style("position", "relative")
            .attr("id", "bubble_count");
        for (n = 10; n <= 40; n += 10) {
            var bubbleOption = bubbleCount.append("option")
                .attr("value", n)
                .text(n + " Categories");
            if (n == catCount) {
                bubbleOption.property("selected", true);
            };
        }
        bubbleCount.on("change", function() {
            limit = parseInt(this.value);
            bubbles.setLimit(limit);
            bubbles.refresh();
        });

        d3.select('.bubble-controls').append("div")
            .style("display", "inline-block")
            .style("margin-left", "20px")
            .append("label")
            .text("Exclude Adult Content")
            .style("text-transform", "none")
            .append("input")
            .attr("name", "exclude-adult-content")
            .attr("type", "checkbox")
            .property("checked", true)
            .style("float", "left")
            .style("margin-right", "3px")
            .on("change", function() {
                if (this.checked) {
                    bubbles.setOptions({hideAdult: true});
                }
                else {
                    bubbles.setOptions({hideAdult: false});
                }
                bubbles.refresh();
            });

        // build chart on page load
        bubbles.build();

        // attach a resizing event to know when to resize
        var anchorWidth = $(bubbleAnchor).width();
        $(window).resize(function() {
            if ($(bubbleAnchor).width() != anchorWidth) {
                anchorWidth = $(bubbleAnchor).width();
                VertBarViz.update();
                bubbles.setWidth(anchorWidth);
                bubbles.refresh();
            }
        });

        // bind the top button
        $("#buttonTop").click(function() {
            $("html, body").animate({
                scrollTop: $("#bubbleControls").offset().top
            }, 500);
        });

    };
});
