(function(EC) {

	var selector = EC.anchor;
	var data = EC.data;
	var categoryLimit = 5;
	var keywordLimit  = 10;
	var txtPadding	  = "20px";

	// set up anchors
	var catAnchor	= attachAnchor(selector, txtPadding);
	var tiersAnchor	= attachAnchor(selector, txtPadding);
	$(tiersAnchor).append(insertTitle("Top Verticals (Tier 1)", "title"));
	var titleAnchor = attachAnchor(selector, txtPadding);
	$(titleAnchor).append(insertTitle("Page Title", "title"));

	// set up the title
	var titleTbl = new BuildTable("textAssets", "width: 100%");
	titleTbl
		.addBody([ {text: data.title, className: "title"} ])
		.addBody([ {text: data.url, className: "url"} ]);
	$(titleAnchor).append(titleTbl.getTable());

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

	// set up the categories
	ListPathViz.init();
	ListPathViz.config.showBreadcrumbs = true;
	ListPathViz.render(catAnchor, data.categories);

})(EC);
