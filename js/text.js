(function(EC) {

	var selector = EC.anchor;
	var data = EC.data;
	var txtPadding	  = "20px";

	// set up anchors
	var catAnchor = attachAnchor(selector, txtPadding);
	var tiersAnchor	= attachAnchor(selector, txtPadding);
	$(tiersAnchor).append(insertTitle("Top Verticals (Tier 1)", "title"));

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

	// Populate the original search text in the search box
	$("textarea[name='input_text_classifier']").val(data.search_text);

})(EC);
