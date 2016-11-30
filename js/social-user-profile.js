EC.Events.subscribe('/ready', function(d) {

    // add first twitter screen_name box
    if ($('.zcinput-container').length < 1) {
        var input = new EC.QueryInput('zcinput[]', 'form-control');
        $('#btn-classify').before(input.element());
        EC.addTypeAhead(input.getInput());
    };

    // add twitter screen_name box
    $('#add-query-input').click(function() {
        var numInputs = $("input[name='zcinput[]']").length;
        if (numInputs < 3) {
            var input = new EC.QueryInput('zcinput[]', 'form-control');
            $('#btn-classify').before(input.element());
            $(input.element()).focus();
            EC.addTypeAhead(input.getInput());
        }
    });

    EC.Prefs.restore('sup', ['#twitter-count', '#bias-split', '#enable-cache']);

    $("#btn-classify").on("click", function(e) {
        e.preventDefault();

        $(".dynamic-add").remove();
        EC.Events.clearAll();

        var screen_name = $("input[name='zcinput[]']").map(function(d) { return $(this).val(); }).get();
        var keyword = $("#keyword").val();
        var tweet_count = $("#twitter-count").val();
        var enable_cache = $("#enable-cache").val();

        EC.Prefs.save('sup', ['#twitter-count', '#bias-split', '#enable-cache']);

		screen_name.forEach(function(d) {
			if (d === '') {
				alert('You are missing a search query, please make sure all fields are filled out.');
                throw 'Fields not filled out.';
			}
		});

		EC.loading.show(0);
        $.ajax({
            method: "get",
            data: {
                "screen_name": screen_name,
                "keyword": keyword,
                "twitter-count": tweet_count
            },
            url: "../api/weighted_search/checkUsers"
        })
            .done(function(d) {
				$.ajax({
					method: "get",
					data: {
						"screen_name": screen_name,
						"keyword": keyword,
						"twitter-count": tweet_count,
                        "enable-cache": enable_cache
					},
					url: "../api/weighted_search/searchMany"
				})
					.done(function(d) {
						d3.selectAll(".dynamic-add").remove();
						EC.loading.hide();
						var supLayout = EC.Templates.get("ui-sup-layout");
						var insertAfter = '.listBox';
						$(".contentRail").append(supLayout(d.data));
						if (d.data.keyword === '') {
								$(".headerBox").remove();
								$(".listBox").remove();
								insertAfter = '.contentBox';
						}
						else {
								buildList(d.data);
						}
						d.data.combined_profile.queries = d.data.queries;
						buildBubbles(d.data.combined_profile, insertAfter);
					})
            })
			.fail(function(d) {
				EC.loading.hide();
				var badUsers = d.responseJSON.error.join(',');
				alert('The following users do not exist on Twitter: ' + badUsers);
				return false;
		});
    });

	// creates the compare list
	var buildList = function(data) {
		var users = data.queries.map(function(d) {
            return d.toLowerCase();
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
        // Add color and adj rank properties to the results
        for (name in data.results) {
            data.results[name].categories.forEach(function(d, i) {
                d.original_position = ++i;
                // add the appropriate color by vertical
                d.color = EC.Colors.byVertical(d.vertical);
                // create the adjusted rank
                d.adjusted_rank = (d.volume_rank * volume_bias) + (d.category_rank * category_bias);
            });
        }
        // Create a copy for unsorted
        var unsorted = EC.deepCopy(data.results['combined'].categories);
        // Sort all the data sets based on adj rank and map the users to category hash_ids
        var user_category_positions = {};
        for (name in data.results) {
            user_category_positions[name] = {};
            data.results[name].categories.sort(function(a, b) {
                return a.adjusted_rank - b.adjusted_rank;
            });
            data.results[name].categories.forEach(function(d, i) {
                d.current_position = ++i;
                d.position_change = d.original_position - d.current_position;
                if (d.position_change > 0) {
                    d.change_class = "positive";
                    d.change_icon = "fa fa-chevron-up";
                }
                else if (d.position_change < 0) {
                    d.change_class = "negative";
                    d.change_icon = "fa fa-chevron-down";
                }
                else {
                    d.change_class = "no-change";
                    d.change_icon = "";
                }
                user_category_positions[name][d.hash_id] = d.current_position;
            });
        }
        // Add the sorted to unsorted
        unsorted.forEach(function(d, i) {
            var adjusted_category = data.results['combined'].categories[i];
            d.new_rank = adjusted_category;
            d.new_rank.user_positions = {};
            users.forEach(function(p, n) {
                d.new_rank.user_positions[p] = user_category_positions[p][d.new_rank.hash_id];
            });
        });
		if (users.length > 1) {
            var supList = EC.Templates.get("ui-sup-list-multi");
            $(".listBox").append(supList({"categories": unsorted, "users": users}));
        }
        else {
            var supList = EC.Templates.get("ui-sup-list-single");
            $(".listBox").append(supList(unsorted));
        }
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

	// runs the visualization
	var buildBubbles = function(profile, insertAfter) {
        var bubbles, stream, treemap, current_chart;
        var catCount = 40;
        var txtPadding = "20px";
        var data = profile;
        var meta = profile.users;
        var selector = insertAfter;
        var queries = profile.queries;
        var multipleUsers = (queries.length > 1) ? true : false;

        // Set the controls
        var control_list = {
            "Bubbles" : [".node-count", ".exclude-adult", ".tier-depth", ".bubble-node-pager"],
            "StreamGraph" : [".node-count", ".time-period", ".exclude-adult", ".tier-depth"],
            "ZoomTreeMap" : [".exclude-adult"]
        };

        var toggleControls = function(chart) {
            var type = chart.type;
            var controls = control_list[type];
            $(".chart-control").hide();
            $(".chart-extra").addClass("hide");
            controls.forEach(function(d) {
                $(d).show();
            });
        };

        // set the color scheme
        EC.Colors.setUserColors(queries.length);

        // Set the twitter count drop down
        $("#twitter-count").val(profile.twitter_count);

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

		// attach the tweets anchor, then hide it
		var tweetAnchor = attachAnchor(selector, "20px", "indent-block");
		$(tweetAnchor).attr("id", "showTweets").addClass("hide chart-extra");

		// insert the go to top button
		var buttonTop = insertButton("buttonTop", "buttonTop", "Back To Top", "btn btn-primary btn-top");
		$("body").append(buttonTop);

		// attach category box anchor, then hide it
		var categoryAnchor = attachAnchor(selector, "20px", "indent-block");
		$(categoryAnchor).attr("id", "show-category").addClass("hide chart-extra");

		// bubble chart anchor
		var bubbleAnchor = attachAnchor(selector);
		bubbleAnchor.setAttribute("id", "bubbleChart");

		// initialize the bubble chart
		var bubbles = new EC.Bubbles(bubbleAnchor, data);
		// do we have single user or multiple users?
		if (meta.length > 1) {
			bubbles.setOptions({
				multipleUsers: true,
			});
		}
		// set the stage width
		var stageWidth = $(bubbleAnchor).width() - parseInt($(bubbleAnchor).parent().css('padding-right'));

		// bubble controls
		var bubbleControls = attachAnchor(selector, txtPadding, "no-margin-bottom");
		var bubbles_switcher = EC.Templates.get('ui-bubbles-switcher');
		$(bubbleControls)
			.attr("id", "bubbleControls")
			.append(insertElement("div", "", "bubble-control-toggle"))
			.append(bubbles_switcher())
			.append(insertElement("div", "", "bubble-controls"));
		$(".bubble-control-toggle").on("click", function() {
			$(".bubble-controls").toggle();
		});
		$("#bubbles-switcher button").on("click", function(e) {
			var period = $(this).data("display");
			// button behavior
			$("#bubbles-switcher button").removeClass("active");
			$(this).addClass("active");
			switch (period) {
				case "frequent" :
					EC.Events.publish("/Bubbles/show");
					break;
				case "time" :
					EC.Events.publish("/StreamGraph/show");
					break;
				case "verticals" :
					EC.Events.publish("/ZoomableTreeMap/show");
					break;
			}
		});

		// set up the depth buttons
		$(".bubble-controls").append(insertElement("div", "Tier Depth", "tier-depth chart-control"));
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
			current_chart.setDepth(i);
			EC.loading.showDeferred(function() { current_chart.refresh(); });
			EC.Events.publish('/Browser/scrollToChart');
		};

		// build the node dropdown
		d3.select(bubbleControls).select(".bubble-controls")
			.append("span")
				.attr("class", "node-count chart-control")
			.append("label")
				.text("Max");
		bubbleCount = d3.select(bubbleControls).select(".bubble-controls span")
			.append("select")
				.style("position", "relative")
				.style("margin-right", "10px")
				.attr("id", "bubble_count");
		var limits = [20,40,60,80];
		limits.forEach(function(n) {
			var bubbleOption = bubbleCount.append("option")
				.attr("value", n)
				.text(n + " Categories");
			if (n == catCount) {
				bubbleOption.property("selected", true);
			};
		});
		bubbleCount.on("change", function() {
			limit = parseInt(this.value);
			current_chart.setLimit(limit);
			EC.loading.showDeferred(function() { current_chart.refresh(); });
		});
		// Time Period Selection
		var time_period = EC.Templates.get('ui-time-period');
		//$('#bubble_count').after(period_select());
		$(".bubble-controls").append(time_period());
		$('#time-period-select').on('change', function(e) {
			var period = $(this).val();
			if (!stream.checkTimeIntervalData(period)) {
				alert("The time period you chose may not have enough data to display a chart. If the chart appears clear, please select another time period.");
			}
			stream.setTimeInterval(period);
			EC.loading.showDeferred(function() { stream.refresh(); });
		});

		// Exclude Adult checkbox
		d3.select('.bubble-controls').append("div")
			.attr("class", "exclude-adult chart-control")
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
						current_chart.hideAdult(true);
					}
					else {
						current_chart.hideAdult(false);
					}
					EC.loading.showDeferred(function() { current_chart.refresh(); });
					EC.Events.publish('/Browser/scrollToChart');
				});
		// Separate Layers Checkbox
		d3.select('.bubble-controls').append("label")
			.attr("class", "separate-layers chart-control")
			.text("Separate Layers")
			.style("text-transform", "none")
			.style("display", "none")
		.append("input")
			.attr("name", "show-small-multiples")
			.attr("type", "checkbox")
			.property("checked", false)
			.style("float", "left")
			.style("margin-right", "3px")
			.on("change", function() {
				if (this.checked) {
					stream.setChartType("small-multiples");
				}
				else {
					stream.setChartType("streamgraph");
				}
				stream.refresh();
			});

		EC.Events.subscribe('/Bubbles/show', function(d) {
			EC.ChartsList.update("remove");
			EC.ChartsList.register(bubbles);
			current_chart = bubbles;
			toggleControls(bubbles);
			$("#bubble_count").val(40);
			bubbles.setLimit(40);
			bubbles.setWidth(stageWidth);
			EC.loading.showDeferred(function() { bubbles.build(); });
			if (multipleUsers) {
				$(".twitter-user-legend").removeClass("hide");
			}
			//EC.Events.publish('/Browser/scrollToChart');
		});
		EC.Events.subscribe('/StreamGraph/show', function(d) {
			EC.ChartsList.update("remove");
			stream = (!stream) ? EC.StreamGraph(bubbleAnchor, profile) : stream;
			EC.ChartsList.register(stream);
			current_chart = stream;
			toggleControls(stream);
			$("#bubble_count").val(40);
			stream.setLimit(40);
			stream.setWidth(stageWidth);
			EC.loading.showDeferred(function() { stream.build(); });
			//EC.Events.publish('/Browser/scrollToChart');
		});
		EC.Events.subscribe('/ZoomableTreeMap/show', function(d) {
			EC.ChartsList.update("remove");
			treemap = (!treemap) ? EC.ZoomTreeMap(bubbleAnchor, profile) : treemap;
			EC.ChartsList.register(treemap);
			current_chart = treemap;
			toggleControls(treemap);
			treemap.setWidth(stageWidth);
			EC.loading.showDeferred(function() { treemap.build(); });
			//EC.Events.publish('/Browser/scrollToChart');
		});
		EC.Events.subscribe('/Viz/finishedLoading', function(d) {
			EC.loading.hide();
		});
		EC.Events.subscribe('/Browser/changeTimePeriod', function(d) {
			$("#time-period-select").val(d);
		});
		EC.Events.subscribe('/Browser/scrollToChart', function(d) {
			$("html, body").animate({
				scrollTop: $("#bubbleControls").offset().top
			}, 500);
		});
		EC.Events.subscribe('/ZoomTreeMap/showTweets', function(d) {
			if (!d) {
				$("#showTweets").addClass("hide");
				return false;
			}
	    // clear old tweets
	    $("#showTweets").html("");
	    // show the anchor class
	    $("#showTweets").removeClass("hide");
	    var container = document.createElement("div");
	    container.className = "tweetAssets";
	    container.setAttribute("style", "overflow: hidden;");
	    var header = document.createElement("h3");
	    header.className = "tweetAssets";
	    $(header).append(document.createTextNode("Tweets"));
	    $(container).append(header);
	    $("#showTweets").append(container);
	    d3.event.stopImmediatePropagation();

	    var tweets = d.filter(function(n) {
	      return n.retweeted === false;
	    });
	    // If there are no tweets, then grab one retweet
	    if (tweets.length == 0) {
	      tweets = d;
	    }
	    // Sort by verified
	    tweets = tweets.sort(function(a,b) {
	      return b.verified - a.verified;
	    });
	    var tweetsDisplay = EC.Templates.get('ui-tweet-horizontal');
	    $("#showTweets").append(tweetsDisplay({tweets_list: tweets.slice(0, 10)}));
		});

		// build chart on page load
		EC.Events.publish('/Bubbles/show');

		// placeholder for the legend
		if (multipleUsers) {
			$("#bubbleChart").append("<div class='twitter-user-legend chart-extra'><ul></ul></div>");
		}

		// user info boxes and query inputs
		var usersAnchor = attachAnchor(selector, txtPadding);
		queries.forEach(function(d, i) {
			var user = meta.filter(function(n) {
				return n.screen_name.match(new RegExp(d, "i"));
			})[0];
			user.index = i;
			user.selected = false;
			// add the query input for the user
			var input = new EC.QueryInput("zcinput[]", "form-control");
			input.setValue(user.screen_name);
			$('#submit-query').before(input.element());
			EC.addTypeAhead(input.getInput());
			EC.addInputBehavior(input.element(), true);
			// add the user box
			var boxClass = (multipleUsers) ? "twitter-user-multiple" : "twitter-user-single";
			var box = EC.UserBox(user, "col-md-" + Math.floor(12 / queries.length) + " no-padding " + boxClass).element();
			if (multipleUsers) {
				d3.select(box).on("click", function(d) {
					var boxes = d3.selectAll(".twitter-user-multiple");
					if (d.selected) {
						d.selected = false;
						boxes.classed("user-box-blur", false);
						bubbles.deselectPie();
					}
					else {
						d.selected = true;
						boxes.classed("user-box-blur", function(n) {
							if (n !== d) {
								n.selected = false;
							}
							return !n.selected;
						});
						bubbles.clickPie(d);
					}
				});
			}
			$(usersAnchor).append(box);
			if (multipleUsers) {
				// legend item
				d3.select(".twitter-user-legend ul").append("li")
					.style("border-left-color", EC.Colors.color(user.index))
					.text(user.screen_name)
					.on("click", function() {
						$(".twitter-user-multiple:nth-child(" + (user.index + 1) + ")").trigger("click");
					});
			}
		});

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

		// bind a scrolling event for the top button and legend
		$(window).scroll(function() {
			var bubbleChartTop = $("#bubbleChart").offset().top;
			if ($(this).scrollTop() >= bubbleChartTop && !$("#showTweets").hasClass("hide")) {
				$("#buttonTop").fadeIn(200);
			}
			else {
				$("#buttonTop").fadeOut(200);
			}
			if (multipleUsers) {
				var userBoxBottom = $(".twitter-user-multiple").offset().top;
				if ($(this).scrollTop() >= userBoxBottom) {
					$(".twitter-user-legend").fadeIn(200);
				}
				else {
					$(".twitter-user-legend").fadeOut(200);
				}
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
