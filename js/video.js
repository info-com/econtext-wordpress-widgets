(function(EC) {

	var selector = EC.anchor;
	var data = EC.data;
	var txtPadding	  = "20px";

	// set up anchors
	var catAnchor = attachAnchor(selector, txtPadding);
	var tiersAnchor	= attachAnchor(selector, txtPadding);
	var videoAnchor = attachAnchor(selector, txtPadding);
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

	// Set up the video
	$(videoAnchor).css("text-align", "center");
	$(videoAnchor).append('<iframe style="float: left;" width="560" height="315" src="https://www.youtube.com/embed/' + data.video_id + '" frameborder="0" allowfullscreen></iframe>');
	$(videoAnchor).append('<textarea id="transcript" style="width: 50%; height: 315px; float: right";>' + data.transcript + '</textarea>');

	// Populate the original search text in the search box
	$("input[name='input_text_video']").val(data.video_url);

})(EC);
