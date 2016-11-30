// runs the visualization
(function(EC) {

	var listLimit = 10;
	var catCount = 30;
	var tierNames = [ "vertical", "secondary", "tertiary", "name" ];
	var txtPadding = "20px";
	var data = EC.data.categories;
	var selector = EC.anchor;
	var queries = EC.queries;
	var multipleUsers = (queries.length > 1) ? true : false;

	$("textarea[name='zcinput']").val(queries);

	if (data.length == 0) {
		return alert("I'm sorry, we could not find any suitable categories to match this text. Please try different text.");
	}

	EC.data.users = [];

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
	var categoryAnchor = attachAnchor(selector, "20px", "indent-block");
	$(categoryAnchor).attr("id", "show-category").addClass("hide");

	// bubble chart anchor
	var bubbleAnchor = attachAnchor(selector);
	bubbleAnchor.setAttribute("id", "bubbleChart");

	// initialize the bubble chart
	var bubbles = new EC.Bubbles(bubbleAnchor, EC.data);
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

})(EC);
