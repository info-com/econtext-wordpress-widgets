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
// Initialize TypeAhead datasource
EC.repos = new Bloodhound({
	datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
	queryTokenizer: Bloodhound.tokenizers.whitespace,
	remote: '../api/twitter_user/lookup/?q=%QUERY'
});
// Inserts Typeahead into a container
EC.addTypeAhead = function(element) {
	$(element).typeahead(null, {
		name: 'repos',
		source: EC.repos.ttAdapter(),
		templates: {
			suggestion: Handlebars.compile([
				'<p class="repo-language">{{description}}</p>',
				'<p class="repo-name">@{{name}}</p>'
			].join(''))
		}
	});
};
EC.addInputBehavior = function(element, disableTab) {
	var input = $(element).find("input[name='zcinput[]']");
	input.on("mouseup", function(e) {
		e.preventDefault();
	});
	input.on("focus", function(e) {
		e.preventDefault();
		$(this).select();
	});
	if (!disableTab) {
		input.on("keydown", function(e) {
			var code = e.keyCode || e.which;
			if (code == 9) {
				if (!input.hasClass("was-tabbed")) {
					$('#add-query-input').trigger("click");
				}
				input.addClass("was-tabbed");
			}
		});
	}
};
// Connect the Typeahead datasource
EC.repos.initialize();

// Register Handlebars helpers
Handlebars.registerHelper("formatPercent", function(num) {
	return Math.round(num * 100);
});
Handlebars.registerHelper("showProgressBar", function(num, options) {
	if (num > 0 && num < 1) {
		return options.fn(this);
	}
	else {
		return options.inverse(this);
	}
});
Handlebars.registerHelper("showRefreshButton", function(progress, cursor, options) {
	if (progress == 1 && cursor != 0) {
		return options.fn(this);
	}
});
Handlebars.registerHelper("isQueued", function(progress, options) {
	if (progress == 0) {
		return options.fn(this);
	}
	return options.inverse(this);
});
Handlebars.registerHelper("isNotQueued", function(progress, options) {
	if (progress == 1) {
		return options.fn(this);
	}
	return options.inverse(this);
});
Handlebars.registerHelper("startedProcessing", function(num, options) {
	if (num > 0) {
		return options.fn(this);
	}
	else {
		return options.inverse(this);
	}
});
Handlebars.registerHelper("hiddenClassName", function(progress, cursor) {
	if (progress < 1 && cursor == 0) {
		return "hide";
	}
	return "";
});
Handlebars.registerHelper("showProfilePic", function(path) {
	return path.replace("_normal", "_bigger");
});
Handlebars.registerHelper("concatUserNames", function(users) {
	var names = users.map(function(d) {
		return d.screen_name;
	});
	return names.join(' + ');
});
Handlebars.registerHelper("formatPath", function(path) {
	if (path.length > 4) {
		var itemsToRemove = path.length - 3;
		var findNodeItem = path.slice(-1);
		path.splice(3, itemsToRemove, findNodeItem);
	}
	return path.join(' > ');
});
Handlebars.registerHelper("listPath", function(items, options) {
	// Set the output to an empty string
	var output = '';
	// Set the array count for items
	var itemsCount = (items.length > 3) ? 3 : items.length;
	for (var i=0; i<itemsCount; i++) {
		output = output + options.fn(items[i]);
	}
	return output;
});
Handlebars.registerHelper("finalNodePath", function(items) {
	return items.pop();
});
Handlebars.registerHelper("formatDateString", function(dateString) {
	var date = new Date(dateString);
  var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sept", "Oct", "Nov", "Dec" ];
	return date.toLocaleTimeString() + ' - ' + date.getDate() + ' ' + monthNames[date.getMonth()] + ' ' + date.getFullYear();
});
Handlebars.registerHelper("formatCompareLabel", function(profile) {
	if (profile.type == 'query') {
		return profile.screen_name + " (" + profile.name.replace('Parameters: ', '') + ")";
	}
	return profile.screen_name;
});
Handlebars.registerHelper("formatTweetText", function(tweet) {
	var tweet_text = tweet.text;
	var changes = [];
	var searchTerm = function(indices) {
		var emoji = tweet_text.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g);
		var padding = (emoji != null) ? emoji.length : 0;
		var offset = indices[0] + padding;
		var length = indices[1] - indices[0];
		return tweet_text.substr(offset, length);
	};
	var createUrl = function(url, text) {
		return '<a href="' + url + '" target="_blank">' + text +'</a>';
	};
	var createUserMention = function(screen_name) {
		return '<a href="//twitter.com/' + screen_name + '" target="_blank">@' + screen_name +'</a>';
	};
	var createHashTag = function(hashtag) {
		return '<a href="//twitter.com/search?q=%23' + hashtag + '" target="_blank">#' + hashtag +'</a>';
	};
	// Format urls
	if (tweet.entities.urls != null) {
		tweet.entities.urls.forEach(function(d) {
			changes.push({
				search_text: searchTerm(d.indices),
				replace_text: createUrl(d.expanded_url, d.display_url)
			});
		});
	}
	// Format media
	if (tweet.entities.media != null) {
		tweet.entities.media.forEach(function(d) {
			changes.push({
				search_text: searchTerm(d.indices),
				replace_text: createUrl(d.expanded_url, d.display_url)
			});
		});
	}
	// Format user mentions
	if (tweet.entities.user_mentions != null) {
		tweet.entities.user_mentions.forEach(function(d) {
			changes.push({
				search_text: searchTerm(d.indices),
				replace_text: createUserMention(d.screen_name)
			});
		});
	}
	// Format hash tags
	if (tweet.entities.hashtags != null) {
		tweet.entities.hashtags.forEach(function(d) {
			changes.push({
				search_text: searchTerm(d.indices),
				replace_text: createHashTag(d.text)
			});
		});
	}
	// Replace text with entities
	changes.forEach(function(d) {
		tweet_text = tweet_text.replace(d.search_text, d.replace_text);
	});
	return new Handlebars.SafeString(tweet_text);
});

// attach jQuery handlers for elements that need to be handled before a submit is clicked
$(document).ready(function() {
	if ($('.zcinput-container').length < 1) {
		var input = new EC.QueryInput('zcinput[]', 'form-control');
		$('#submit-query').before(input.element());
		if (EC.autocomplete) {
			EC.addTypeAhead(input.getInput());
		}
		EC.addInputBehavior(input.element());
	};
	$('#add-query-input').click(function() {
		var numInputs = $('input[name="zcinput[]"]').length;
		if (numInputs < 4) {
			var input = new EC.QueryInput('zcinput[]', 'form-control');
			$('#submit-query').before(input.element());
			$(input.element()).focus();
			if (EC.autocomplete) {
				EC.addTypeAhead(input.getInput());
			}
			EC.addInputBehavior(input.element());
		}
	});
	$('#remove-query-input').click(function() {
		var numInputs = $('.zcinput-container').length;
		if (numInputs > 1) {
			$('.zcinput-container')[numInputs - 1].remove();
		}
	});
	// Initialize the loading overlay
	EC.loading = EC.LoadingOverlay("body");
	// Update the user statistics box
	EC.Events.publish('/update-user-statistics');
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
