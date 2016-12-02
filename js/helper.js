/**
 * helpers.js - just a small library of helpful javascript tools
 */

// builds tables via javascript
function BuildTable(className, style) {
	this.className 	= className;
	this.style		= style;
	this.output		= document.createElement("table");
};
BuildTable.prototype = {
	constructor: BuildTable,
	addRow: function() {
		tr = document.createElement("tr");
		return tr;
	},
	addHeader: function(labels) {
		tr = this.addRow();
		labels.forEach(function(d) {
			th = document.createElement("th");
			if (typeof d.className !== "undefined") {
				th.className = d.className;
			}
			if (typeof d.colSpan !== "undefined") {
				th.setAttribute("colspan", parseInt(d.colSpan));
			}
			th.appendChild(document.createTextNode(d.text));
			tr.appendChild(th);
		});
		this.output.appendChild(tr);
		return this;
	},
	addBody: function(values) {
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
			tr.appendChild(td);
		});
		this.output.appendChild(tr);
		return this;
	},
	getTable: function() {
		if (typeof this.style !== "undefined"){
			this.output.setAttribute("style", this.style);
		}
		if (typeof this.className !== "undefined"){
			this.output.className = this.className;
		}
		return this.output;
	},
	setId: function(id) {
		this.output.id = id;
		return this;
	}
};

// takes a single dimension array and makes it a string
var nodeGlue = function(input, separator, limit) {
	var output;
	var separator = (typeof separator !== "undefined") ? separator : ",";
	var limit = (typeof limit !== "undefined") ? limit : 0;
	if ($.isEmptyObject(input) === false) {
		output = input.reduce(function(p,c,i) {
			if ( limit && (i >= limit && i < (input.length - 1)) ) {
				return p;
			}
			return p + separator + c;
		})
	}
	return output;
};

// creates an anchor point for a chart - note this returns a Node
var attachAnchor = function(selector, padding, className) {
	var className = className || "";
	var anchor = document.createElement("div");
	anchor.className = "row contentBox " + className + " dynamic-add";
	if (typeof padding != "undefined") {
		anchor.style.padding = padding;
	}
	return $(anchor).insertAfter($(selector).first())[0];
};

var insertElement = function(element, text, className) {
	var elem = document.createElement(element);
	elem.className = className || "";
	return $(elem).append(document.createTextNode(text));
};

var insertInput = function(name, type, value, className) {
	var e = document.createElement("input");
	e.setAttribute("name", name);
	e.setAttribute("type", type);
	e.setAttribute("value", value);
	e.className = className || "";
	return $(e);
};

var insertButton = function(name, id, text, className) {
	var b = document.createElement("button");
	b.setAttribute("type", "button");
	b.setAttribute("name", name);
	b.setAttribute("id", id);
	b.className = className || "";
	$(b).append(document.createTextNode(text));
	return b;
}

var insertTitle = function(text, className) {
	var title = document.createElement("h3");
	title.className = className || "";
	return $(title).append(document.createTextNode(text));
};

var EC = EC || {};

// attach jQuery handlers for elements that need to be handled before a submit is clicked
$(document).ready(function() {
	// Let the app know we have other components loaded
	EC.Events.publish('/ready');
});

EC.Events.subscribe('/update-user-statistics', function() {
	$.get('../api/user/', function(data) {
		data.show_faq_link = (window.location.pathname.match(/faq/)) ? false : true;
		var template = EC.Templates.get('ui-user-statistics');
		$(".user-statistics").html(template(data));
	})
		.fail(function(d) {
			console.log('Could not load user stats.');
		});
});

EC.Events.subscribe('/ready', function() {
	if (!EC.base_url) {
		return false;
	}
	if ($.inArray(EC.page_name, ['audience-profile']) !== -1) {
		return false;
	}
	$("input[name='submit']").on("click", function(e) {
		EC.loading.show();
	});
});
