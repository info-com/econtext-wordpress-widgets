var c,s,colors,
ListPathViz = {

	init: function() {
		jQuery.extend(this, Observer());
	},
	stage: {},
	config: {
		className: "top-categories",
		headers: [ {text: "Top Categories"}, {text: "% Content Score", className: "score"} ],
		pathLimit: 6,
		singleRenderPathLimit: 4,
		pathPaddingLeft: 20,
		rowHeight: 100,
		animateSpeed: 200,
		limit: 10,
		catTierPadding: 20,
		enableSubCats: false,
		showScore: true,
		scoreVarName: "count",
		decimalPrecision: 1,
		isPercent: true,
		showBreadcrumbs: false,
		bias: {
			category: 0.80,
			volume: 0.20
		}
	},
	setBias: function(category, volume) {
		this.config.bias.category = category;
		this.config.bias.volume = volume;
	},
	getScore: function(data) {
		if (this.config.showScore) {
			var scoreVarName = this.config.scoreVarName;
			var score = (scoreVarName == "volume" || scoreVarName == "adjusted_volume") ? data[scoreVarName] : +(data[scoreVarName] * 100).toFixed(2);
			if (!isNaN(score)) {
				score = (score % 1 === 0) ? score : score.toFixed(this.config.decimalPrecision);
			}
			return (this.config.isPercent) ? score + "%" : score;
		}
	},
	renderWeighted: function(target, data) {
		var category_bias = this.config.bias.category;
		var volume_bias = this.config.bias.volume;
		data.forEach(function(d) {
			d.adjusted_rank = (d.volume_rank * volume_bias) + (d.category_rank * category_bias);
		});
		data.sort(function(a, b) {
			return a.adjusted_rank - b.adjusted_rank;
		});
		this.render(target, data);
	},
	render: function(target,data) {
		var _this = this;

		c = _this.config;
		s = $(target);
		colors = TierColors;

		data = data.slice(0,c.limit);

		// Create the path string (based on path limit)
		data.forEach(function(d) {
			var path_length = ListPathViz.config.pathLimit;
			return d.path_str = (d.path.length <= path_length) ? d.path.slice(0, d.path.length - 1).join(" :: ") : d.path.slice(0, path_length).join(" :: ");
		});

		// attach table
		var titleTable = s.append(document.createElement("table")).children(":nth-child(1)").addClass(c.className).css("margin-bottom", "10px");
		var dataTable  = s.append(document.createElement("table")).children(":nth-child(2)").addClass(c.className);

		// attach title table headers
		var headers = d3.select(titleTable.get(0)).append("tr");
		headers.selectAll("tr")
				.data(c.headers)
		  .enter().append("th")
		  	.attr("class", function(d) { return d.className; })
		  	.text(function(d) { return d.text; });

		// attach data table
		var rows = d3.select(dataTable.get(0)).selectAll("tr")
				.data(data)
		  .enter().append("tr");

		var category_wrapper = rows.append("td")
		  .append("div")
		  	.attr("class", "category-wrapper")
		  	.style("border-left-color", function(d) { return colors.byTierName(d.vertical); })
				.style("border-left-style", "solid")
				.style("border-left-width", "10px")
		  	.style("height", c.rowHeight + "px");

		if (this.config.showBreadcrumbs) {
			category_wrapper.append("div")
				.style("margin-left", "5px")
				.style("font-size", "16px")
				.style("margin-bottom", "5px")
				.text(function(d) { return (d.path_str.length) ? d.path_str : "[Final Node]"; });
		}

		category_wrapper.append("div")
			.style("font-size", "28px")
			.style("font-weight", "bold")
			.style("margin-left", "5px")
			.text(function(d) { return d.name; });

		rows.append("td")
			.attr("class", "score")
			.text(function(d) { return _this.getScore(d); });

		if (c.enableSubCats) {
			// insert subcategories
			rows.select("td").append("table")
					.attr("class", "subcategory-table hide")
				.selectAll("tr")
					.data(function(d) { return d.keywords; })
				.enter().append("tr").selectAll("td")
					.data(function(d) { return [d.keyword, d.volume]; })
				.enter().append("td")
					.attr("class", function(d,i) {
						if (i) {
							return "score";
						}
					})
					.text(function(d) { return d; });
			// insert subcat headers
			rows.select("td table").insert("tr", ":first-child")
				.html("<th>Sample Keywords</th><th class=\"score\">Volume</th>");
		}

		// offset the path container
		rows.select("td").select(".path")
			.style("top", function(d) {
				return Math.floor((c.rowHeight - $(this).height()) / 2 ) + "px";
			});

		// remove all binding before we add more -- avoids issue when calling render() more than once
		$(".category-wrapper").off();
		// add binding events for animation
		$(".category-wrapper")
			.on("click", function(e) {
				var c = ListPathViz.config;
				if (c.enableSubCats) {
					var subTable = $(this).parent().find(".subcategory-table");
					if (subTable.hasClass("hide")) {
						subTable.removeClass("hide");
					}
					else {
						subTable.addClass("hide");
					}
				}
				else {
					return false;
				}
			});
		this.subscribe(target, data, JSON.stringify(this.config));
	},
	renderSingle: function(target,data) {
		var _this = this;

		c = _this.config;
		s = $(target);
		colors = TierColors;
		data = [data];

		var wrapper = d3.select(target).selectAll("div")
				.data(data)
			.enter().append("div")
				.attr("class", "category-wrapper");

		var path = wrapper.append("div")
				.attr("class", "path");

		path.selectAll("span")
				.data(function(d) { return d.path.slice(0,c.singleRenderPathLimit); })
			.enter().append("span")
				.style("font-size", "17px")
				.text(function(d) { return d; });

		wrapper.append("div")
				.attr("class", "category-name")
				.style("border-left-color", function(d) { return colors.byTierName(d.vertical); })
				.style("height", c.rowHeight + "px")
				.style("line-height", c.rowHeight + "px")
				.text(function(d) { return d.name; });

		// offset the path container
		path.style("top", function(d) {
			return Math.floor((c.rowHeight - $(this).height()) / 2 ) + "px";
		});
	},
	clear: function(target) {
		d3.selectAll(target.getElementsByTagName("table")).remove();
	},
	refresh: function(target, data) {
		var _this = this;
		_this._subscribers.forEach(function(d) {
			if (d.target === target) {
				_this.config = d.config;
				_this.clear(target);
				_this.render(target, data);
			}
		});
	},
	update: function() {
		var _this = this;
		_this._subscribers.forEach(function(d) {
			d3.selectAll(d.target.getElementsByTagName("svg")).remove();
			_this.render(d.target, d.data);
		});
	}

};
