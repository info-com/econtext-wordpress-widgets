// override the addBody method
BuildTable.prototype.addBody = function(values,append) {
	tr = this.addRow();
	values.forEach(function(d,i) {
		td = document.createElement("td");
		if (typeof d.className !== "undefined") {
			td.className = d.className;
		}
		if (typeof d.id !== "undefined") {
			td.id = d.id;
		}
		td.appendChild(document.createTextNode(d.text));
		if (typeof append !== "undefined" && i == 0) {
			td.appendChild(append);
		}
		tr.appendChild(td);
	});
	this.output.appendChild(tr);
	return this;
};

(function(EC) {

	var selector = EC.anchor;
	var txtPadding = "20px";
	var data = EC.data.data.reverse();
	ListPathViz.init();
	ListPathViz.config.headers = [ {text: "Matching Categories"}, {text: "Search Volume", className: "score"} ];
	ListPathViz.config.scoreVarName = "volume";
	ListPathViz.config.enableSubCats = true;
	ListPathViz.config.isPercent = false;
	ListPathViz.config.showBreadcrumbs = true;

	data.forEach(function(d) {
		var categoryAnchor = attachAnchor(selector, txtPadding);
		var labelAnchor = attachAnchor(selector, txtPadding, "search-term no-margin-bottom");

		// build label
		$(labelAnchor).append(insertTitle("Search Term", "title")).append(insertElement("h1", d.keyword));
		// render list
		ListPathViz.render(categoryAnchor, d.categories);
	});

})(EC);
