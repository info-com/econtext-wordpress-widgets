EC.Events.subscribe("/ready", function() {
    // Classify Button Press
    $("#btn-classify").on("click", function(e) {
        // Don't let the button submit the form
        e.preventDefault();

        // Clear previous elements on screen
        clearAll();

        var screen_name = $("#txt-screen-name").val();
        var keyword = $("#txt-keyword").val();
        var points_model = $("#points-model").val();

        processingCard();
        $.ajax({
            method: "get",
            data: {
                "screen_name": screen_name,
                "keyword": keyword,
                "points_model": points_model
            },
            url: "../api/weighted_search/search"
        })
            .done(function(d) {
                // change the profile pic to something bigger
                d.data[0].user.profile_image_url_https = d.data[0].user.profile_image_url_https.replace("normal", "bigger");
                // load the layout
                var layout = EC.Templates.get("ui-weighted-layout");
                $(".contentRail").append(layout(d.data[0]));
                removeProcessingCard();
                buildList(d.data[0].categories);
                buildBubbles(d.data[0]);
            });
    });

    // Clears the page
    var clearAll = function() {
        removeProcessingCard();
        $(".dynamic-add").remove();
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
        var processing = EC.Templates.get("ui-weighted-processing");
        newCard(processing(), processing_class);
    };

    // Removes processing card
    var removeProcessingCard = function() {
        $(".processing").remove();
    };

    // Builds list
    var buildList = function(data) {
        var sorted, volume_bias, category_bias;
        // Set colors
        data.forEach(function(d) {
            d.color = EC.Colors.byVertical(d.vertical);
        });
        var bias = $("#bias-split").val();
        switch (bias) {
            case "ninety-ten":
                volume_bias = 0.10;
                category_bias = 0.90;
                break;
            case "eight-twenty":
                volume_bias = 0.20;
                category_bias = 0.80;
                break;
            case "seventy-thirty":
                volume_bias = 0.30;
                category_bias = 0.70;
                break;
            case "sixty-forty":
                volume_bias = 0.40;
                category_bias = 0.60;
                break;
            case "fifty-fifty":
                volume_bias = 0.50;
                category_bias = 0.50;
                break;
            case "forty-sixty":
                volume_bias = 0.60;
                category_bias = 0.40;
                break;
            case "thirty-seventy":
                volume_bias = 0.70;
                category_bias = 0.30;
                break;
            case "twenty-eighty":
                volume_bias = 0.80;
                category_bias = 0.20;
                break;
            case "ten-ninety":
                volume_bias = 0.90;
                category_bias = 0.10;
                break;
            default:
                volume_bias = 0.20;
                category_bias = 0.80;
                break;
        }
        data.forEach(function(d) {
            d.adjusted_rank = (d.volume_rank * volume_bias) + (d.category_rank * category_bias);
        });
        sorted = data.slice();
        sorted.sort(function(a, b) {
            return a.adjusted_rank - b.adjusted_rank;
        });
        // delta change
        sorted.forEach(function(d, i) {
            var current_rank = ++i;
            d.change_position = d.volume_rank - current_rank;
            if (d.change_position > 0) {
                d.change_class = "positive";
                d.change_icon = "fa fa-chevron-up";
            }
            else if (d.change_position < 0) {
                d.change_class = "negative";
                d.change_icon = "fa fa-chevron-down";
            }
            else {
                d.change_class = "no-change";
                d.change_icon = "";
            }
        });
        data.forEach(function(d, i) {
            d.new_rank = sorted[i];
        });

        var listViz = EC.Templates.get("ui-weighted-list");
        $(".listBox").append(listViz(data));

        // Click events
        $(".weighted-list-expand").on("click", function() {
            var position = $(this).data("position");
            var class_name = ".weighted-list-submenu-" + position;
            if ($(class_name).css("display") == "block") {
                $(class_name).hide();
            }
            else {
                $(".weighted-list-submenu").hide();
                $(".weighted-list-submenu-" + position).show();
            }
        });
    };

    var buildBubbles = function(data) {
        var selector = ".bubbleBox";
        var txtPadding = "20px";
        var catCount = 30;

        // bubble chart anchor
        var bubbleAnchor = attachAnchor(selector);
        $(bubbleAnchor).attr("id", "bubbleChart");

        // initialize the bubble chart
        var bubbles = new EC.Bubbles(bubbleAnchor, {
            "category_count": data.profile.category_count,
            "categories": data.profile.categories,
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
    };
});
