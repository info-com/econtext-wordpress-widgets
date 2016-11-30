var c,s,colors,
VertBarViz = {

	init: function() {
		jQuery.extend(this, Observer());
	},
	stage: {},
	config: {
		aspect: 21/9,
		outerPadding: .1,
		barHeight: 40,
		barPaddingRight: 40,
		labelTextSize: "14px",
		labelTextColor: "#fff",
		labelTextPaddingLeft: 5,
		countTextSize: "14px",
		countTextColor: "#000",
		countTextPaddingLeft: 5,
		barLimit: 5,
	},
	render: function(target,data) {
		var _this = this;

		c = this.config;
		s = this.stage = $(target);
		colors = this.colors = TierColors;
		data = data.slice(0, c.barLimit);

		// determine the stage size
		var width = s.width();
		if (typeof c.barHeight !== "undefined" && c.barHeight !== "auto") {
			var height = Math.round(c.barHeight * data.length);
		}
		else {
			var height = Math.round(width / c.aspect);
		}

		// append the main svg element
		var svg = d3.select(s.get(0)).append("svg")
			.attr("width", width)
			.attr("height", height);
		// set the ranges and domains
		var x = d3.scale.linear()
			.range( [0, width] )
			.domain( [0, d3.max(data, function(d) {
				return parseInt(d.count);
			})] );
		var y = d3.scale.ordinal()
			.rangeRoundBands( [0, height], c.outerPadding )
			.domain(data.map(function(d) {
				return d.vertical;
			}));

	  	// actually render the chart on the
		svg.selectAll(".viz-vert-bar")
  			.data(data)
	  	  .enter().append("rect")
	  	  	.attr("fill", function(d) { return colors.byTierName(d.vertical); })
	        .attr("class", "viz-vert-bar")
	        .attr("x", 0)
	        .attr("y", function(d) { return y(d.vertical); })
	        .attr("height", y.rangeBand())
	        .attr("width", function(d) { return ((x(parseInt(d.count)) - c.barPaddingRight) > 0) ? (x(parseInt(d.count)) - c.barPaddingRight) : 1; });

		// add count
		svg.selectAll(".viz-vert-count")
			.data(data)
		  .enter().append("text")
			.attr("class", "viz-vert-count")
			.text(function(d) { return d.count + "%"; })
			.attr("dominant-baseline", "middle")
			.attr("font-size", c.countTextSize)
			.attr("fill", c.countTextColor)
			.attr("x", function(d) { return ( (x(parseInt(d.count)) - c.barPaddingRight) + c.countTextPaddingLeft ); })
			.attr("y", function(d) { return y(d.vertical) + (y.rangeBand() / 2); });

		// add label text
		svg.selectAll(".viz-vert-label")
			.data(data)
		  .enter().append("text")
		  	.attr("class", "viz-vert-label")
		  	.text(function(d) { return d.vertical; })
		  	.attr("dominant-baseline", "middle")
		  	.attr("font-size", c.labelTextSize)
		  	.attr("fill", c.labelTextColor)
		  	.attr("x", function(d, i) {
		  		var textWidth = this.getComputedTextLength() + c.labelTextPaddingLeft;
		  		var barWidth  = (x(parseInt(d.count)) - c.barPaddingRight);
		  		if (textWidth >= barWidth) {
		  			this.style.fill = "#000";
		  			this.textContent = this.textContent + ", " + d.count + "%";
		  			$(".viz-vert-count")[i].textContent = "";
		  			return ((x(parseInt(d.count)) - c.barPaddingRight) > 0) ? barWidth + c.countTextPaddingLeft : 1 + c.countTextPaddingLeft;
		  		}
		  		else {
		  			return c.labelTextPaddingLeft;
		  		}
		  	})
		  	.attr("y", function(d) { return y(d.vertical) + (y.rangeBand() / 2); });

		// track node
		this.subscribe(s.get(0), data);
	},
	update: function() {
		var _this = this;
		this._subscribers.forEach(function(d) {
			d3.selectAll(d.target.getElementsByTagName("svg")).remove();
			_this.render(d.target, d.data);
		});
	}
};
