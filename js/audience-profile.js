// Set a global timer
var timers = [];
// Set the initial start date
var initialStartDate = '';
// Set the initial classify type ('user', 'query')
var classify_type = 'user';
// Wait for the /ready event...
EC.Events.subscribe('/ready', function() {
	// Load the Audience List
	var startForm = EC.Templates.get('ui-audience-form');
	$("#generated-content").append(startForm());
	// Add events
	$('.bs-datepicker').datepicker();
	EC.addTypeAhead($("input[name='screen-name']"));
	$("#btn-keyword").on("click", function(e) {
		var kw = $("#keyword-input").val();
		// Clear the previous viz
		$(".dynamic-add").remove();
		// Display Loading Icon
		$(".contentRail").append(loadingIcon());
		$.get("../api/audience/profilesByKeyword", {keyword: kw}).done(function(data) {
			keywordBarChart(data);
		});
	});
	$("a[href='#users']").on("click", function(e) {
		$("#users").show();
		$("#query").hide();
		$("#advanced").hide();
	});
	$("a[href='#query']").on("click", function(e) {
		$("#users").hide();
		$("#query").show();
		$("#advanced").hide();
	});
	$("a[href='#advanced']").on("click", function(e) {
		$("#users").hide();
		$("#query").hide();
		$("#advanced").show();
	});
	// Fetch user lists
	$.get('../api/audience/userLists').done(function(data) {
		var filterList = EC.Templates.get('ui-filter-list');
		$(".filter-area").append(filterList(data));
		// Add Events for filter lists
		$("#list-select").on('change', function(e) {
			var listId = parseInt($(this).val());
			updateList(listId);
		});
	}).fail(function() {
		$(".filter-area").hide();
	});
	// Add Events for the Modals
	$('#btn-blend').on('click', function(e) {
		var checked = $('.blend-checkbox:checked');
		var profileIds = [];
		$.each(checked, function(k, v) {
			profileIds.push($(v).data('profile-id'));
		});
		EC.Events.publish('/btn-blend/click', profileIds);
	});
	$('#btn-compare').on('click', function(e) {
		var checked = $('.compare-checkbox:checked');
		var profileIds = [];
		var compareIds = [];
		var sendEvent = true;
		$.each(checked, function(k, v) {
			var pid = $(v).data('profile-id');
			var cid = $(v).data('compare-id');
			if (typeof pid != 'undefined') {
				profileIds.push(pid);
			};
			if (typeof cid != 'undefined') {
				compareIds.push(cid);
			};
		});
		$.each(profileIds, function(k,v) {
			if ($.inArray(v, compareIds) != -1) {
				alert('You cannot compare an Audience Profile against itself.');
				sendEvent = false;
			}
		});
		if (sendEvent) {
			EC.Events.publish('/btn-compare/click', {'profile_ids': profileIds, 'compare_ids': compareIds});
		}
	});
	$('#tab-btn-average').on('click', function(e) {
		$('#split-list-footer').hide();
	});
	$('#tab-btn-compare').on('click', function(e) {
		$('#audience-list-footer').hide();
		$('#split-list-footer').show();
	});

	// Compile an error alert
	var errorAlert = EC.Templates.get('ui-alert-danger');

	// Compile a warning alert
	var warningAlert = EC.Templates.get('ui-alert-warning');

	// Template for loading icon
	var loadingIcon = EC.Templates.get("ui-loading-icon");

	// Template for progress bar
	var progressBar = EC.Templates.get("ui-audience-list-progress");

	// Get last month date
	var lastMonthDate = function() {
		var d = new Date();
		return (d.getMonth() - 1) + '/' + d.getDate() + '/' + d.getFullYear();
	};

	// Set initial start date
	initialStartDate = lastMonthDate();

	var loadAverageList = function(profiles)
	{
		var audienceList = EC.Templates.get('ui-audience-list');
		$("#audience-list-footer").hide();
		$(".audience-list-body").html(audienceList({profiles: profiles}));
		// Apply sortable tables
		$("#audience-list-table.sortable").tablesorter({
			headers: {
				0: {sorter:false},
				2: {sorter:false},
				3: {sorter:false},
				4: {sorter:false}
			}
		});
		// Load the viz when the View button is clicked
		$(".btn-view").on("click", function(e) {
			var id = $(this).data("viewProfileId");
			// Clear the previous viz
			$(".dynamic-add").remove();
			// Display Loading Icon
			$(".contentRail").append(loadingIcon());
			fetchData(id);
		});
		// Refresh the profile when Refresh button is clicked
		$(".btn-refresh").on("click", function(e) {
	    var screenName = $(this).data("refreshScreenName").replace('@', '');
	    refreshProfile(screenName);
		});
		$(".btn-delete").on("click", function(e) {
			$(this).parent().parent().remove();
			var profileId = $(this).data("view-profile-id");
			if (typeof profileId != "undefined") {
				$.get("../api/audience/remove/" + profileId);
			}
		});
	}

	var loadCompareList = function(profiles)
	{
		var compareList = EC.Templates.get('ui-compare-list-split');
		$('.compare-list-split').html(compareList(profiles.sort(function(a,b) {
			var first = a.name.toLowerCase();
			var second = b.name.toLowerCase();
			if (first < second) {
				return -1;
			}
			if (first > second) {
				return 1;
			}
			return 0;
		})));
		// Set bindings for rows
		$('.compare-checkbox').on('change', function(e) {
			if ($(this).prop('checked')) {
				$(this).parent().parent().addClass('selected');
			}
			else {
				$(this).parent().parent().removeClass('selected');
			}
		});
	}

	var loadSilentList = function(profiles)
	{
		var profiles = profiles.sort(function(a,b) {
			return a.screen_name < b.screen_name;
		});
		var silentList = EC.Templates.get('ui-silent-list');
		$('.silent-list-body').html(silentList(profiles));
		// Apply sortable tables
		$("#silent-list.sortable").tablesorter({
			headers: {
				0: {sorter:false},
				2: {sorter:false},
				3: {sorter:false}
			}
		});
		$(".btn-silent").on("click", function(e) {
			var id = $(this).data("viewProfileId");
			// Clear the previous viz
			$(".dynamic-add").remove();
			// Display Loading Icon
			$(".contentRail").append(loadingIcon());
			fetchData(id, null, true);
		});
	}

	var filterProfilesByListId = function(profiles, listId)
	{
		if (listId == -1) {
			return profiles.filter(function(d) {
				return d.type == 'user';
			});
		}
		else if (listId == -2) {
			return profiles.filter(function(d) {
				return d.type == 'query';
			});
		}
		else if (listId) {
			profiles = profiles.filter(function(d) {
				if ($.inArray(listId, d.list_ids) === -1) {
					return false;
				}
				return true;
			});
		};
		return profiles;
	}

	// Init list data
	var listData;
	var silentListData;

	// Loads the audience list
	var showList = function(listId) {
		if (typeof listId == 'undefined') {
			$("#list-select").val(0);
		}
		$(".modal-body").html("Loading...");
		$.get("../api/audience/view")
		.done(function(data) {
			// Set the list data
			listData = data;
			// Filter the data by listId
			profiles = filterProfilesByListId(data, listId);
			// Load the average tab
			loadAverageList(profiles);
			// Load the compare tab
			loadCompareList(profiles);
		});
	};

	// Updates the audience list
	var updateList = function(listId) {
		if (typeof listId == 'undefined') {
			$("#list-select").val(0);
		}
		profiles = filterProfilesByListId(listData, listId);
		loadAverageList(profiles);
		loadCompareList(profiles);
	}

	var updateProgressBar = function() {
		$.get("../api/audience/view", function(data) {
			$.each(data, function(i,d) {
				$("#progress-" + d.profile_id).html(progressBar(d));
				if (d.progress == 1 && d.cursor != 0) {
					$("#btn-refresh-" + d.profile_id).removeClass("hide");
				}
				else {
					$("#btn-refresh-" + d.profile_id).addClass("hide");
				}
			});
		});
	}

	// Handle any Blend requests
	EC.Events.subscribe('/btn-blend/click', function(d) {
		var ids = d.join(',');
		// Clear the previous viz
		$(".dynamic-add").remove();
		// Display Loading Icon
		$(".contentRail").append(loadingIcon());
		fetchData(ids);
	});

	// Handle any Compare requests
	EC.Events.subscribe('/btn-compare/click', function(d) {
		var pids = d.profile_ids.join(',');
		var cids = d.compare_ids.join(',');
		$(".dynamic-add").remove();
		// Display Loading Icon
		$(".contentRail").append(loadingIcon());
		fetchData(pids, cids);
	});

	// Add a @user
	$("#btn-classify-username").on("click", function(e) {
		// Dismiss all alerts
		$('.alert-dismissible').alert('close');
		// Make sure the field is filled out
		var screen_name = $("input[name='users-username']").val();
		if (typeof screen_name == 'undefined' || screen_name == '') {
			return $("#generated-content").before(errorAlert({message: "You must enter a Twitter Username."}));
		}
		// Add the profile
		var btn = $(this);
		btn.button("loading");
		$.get("../api/audience/add/" + screen_name, null, null, 'json')
			.done(function(data) {
				if (typeof data.success != 'undefined' && !data.success) {
					alert(data.data);
					btn.button("reset");
					return false;
				}
				// We want to refresh the modal, so set the opened once flag to false
				openedModalOnce = false;
				$("#audience-list").modal('toggle');
				btn.button("reset");
			})
			.fail(function(data) {
				$("#generated-content").before(errorAlert({message: "User does not exist on Twitter."}));
				btn.button("reset");
			});
	});

	// Add a query
	$("#btn-classify-query").on("click", function(e) {
		// Dismiss all alerts
		$('.alert-dismissible').alert('close');
		// Make sure the field is filled out
		var title = $("input[name='query-title']").val();
		var query = $("input[name='query-query']").val();
		if (typeof title == 'undefined' || typeof query == 'undefined' || title == '' || query == '') {
			return $("#generated-content").before(errorAlert({message: "You must fill out all fields."}));
		}
		// Add the query
		var btn = $(this);
		btn.button("loading");
		$.ajax({
			type: "GET",
			url: "../api/audience/addQuery",
			data: {
				"title": title,
				"query": query
			}
		})
		.done(function(data) {
			if (typeof data.success != 'undefined' && !data.success) {
				alert(data.data);
				btn.button("reset");
				return false;
			}
			// We want to refresh the modal, so set the opened once flag to false
			openedModalOnce = false;
			$("#audience-list").modal('toggle');
			btn.button("reset");
		})
		.fail(function(data) {
			var response = data.responseJSON;
			$("#generated-content").before(errorAlert({message: response.error}));
			btn.button("reset");
		});
	});

	// Add advanced query
	$("#btn-classify-advanced").on("click", function(e) {
		// Dismiss all alerts
		$('.alert-dismissible').alert('close');
		// Start building the advanced query
		var title = $("input[name='advanced-title']").val();
		if (typeof title == 'undefined' || title == '') {
			return $("#generated-content").before(errorAlert({message: "You must provide a title."}));
		}
		var query = '';
		// All Words
		query += $("input[name='advanced-all']").val() || '';
		// Exact Phrase
		if ($("input[name='advanced-exact']").val() != '') {
			query += ' "' + $("input[name='advanced-exact']").val() + '"';
		}
		// Any Words
		if ($("input[name='advanced-any']").val() != '') {
			var any_str = $("input[name='advanced-any']").val();
			var any_arr = any_str.split(' ');
			query += ' ' + any_arr.join(' OR ');
		}
		// Hashtags
		if ($("input[name='advanced-hashtags']").val() != '') {
			var hashtags = $("input[name='advanced-hashtags']").val().split(' ');
			hashtags.forEach(function(d,i) {
				hashtags[i] = '#'+d;
			});
			query += ' ' + hashtags.join(' ');
		}
		// From, To, Mention
		if ($("input[name='advanced-from']").val() != '') {
			var from_str = $("input[name='advanced-from']").val().split(' ');
			from_str.forEach(function(d,i) {
				from_str[i] = 'from:'+d;
			});
			query += ' ' + from_str.join(' ');
		}
		if ($("input[name='advanced-to']").val() != '') {
			var to_str = $("input[name='advanced-to']").val().split(' ');
			to_str.forEach(function(d,i) {
				to_str[i] = 'to:'+d;
			});
			query += ' ' + to_str.join(' ');
		}
		if ($("input[name='advanced-mentions']").val() != '') {
			var mentions = $("input[name='advanced-mentions']").val().split(' ');
			mentions.forEach(function(d,i) {
				mentions[i] = '@'+d;
			});
			query += ' ' + mentions.join(' ');
		}
		// Dates
		if ($("input[name='advanced-since']").val() != '') {
			var since = new Date($("input[name='advanced-since']").val());
			var since_date = since.getFullYear() + '-' + (since.getMonth() + 1) + '-' + since.getDate();
			query += ' since:' + since_date;
		}
		if ($("input[name='advanced-until']").val() != '') {
			var until = new Date($("input[name='advanced-until']").val());
			var until_date = until.getFullYear() + '-' + (until.getMonth() + 1) + '-' + until.getDate();
			query += ' until:' + until_date;
		}
		// Make sure the query is not blank
		if (typeof query == 'undefined' || query == '') {
			return $("#generated-content").before(errorAlert({message: "You must provide a valid query."}));
		}
		// Add the query
		var btn = $(this);
		btn.button("loading");
		$.ajax({
			type: "GET",
			url: "../api/audience/addQuery",
			data: {
				"title": title,
				"query": query
			}
		})
		.done(function(data) {
			if (typeof data.success != 'undefined' && !data.success) {
				alert(data.data);
				btn.button("reset");
				return false;
			}
			// We want to refresh the modal, so set the opened once flag to false
			openedModalOnce = false;
			$("#audience-list").modal('toggle');
			btn.button("reset");
		})
		.fail(function(data) {
			var response = data.responseJSON;
			$("#generated-content").before(warningAlert({message: response.error}));
			btn.button("reset");
		});
	});

	// Flag to know if we've already opened the modal
	var openedModalOnce = false;
	// Load the audience view when modal is shown
	$("#audience-list").on("shown.bs.modal", function(e) {
		if (!openedModalOnce) {
			showList();
			openedModalOnce = true;
		}
		var refreshTime = setInterval(updateProgressBar, 1500);
		timers.push(refreshTime);
	});
	$("#audience-list").on("hidden.bs.modal", function(e) {
		timers.forEach(function(d) {
			clearInterval(d);
		});
		timers = [];
	});

	// Fetch the data and build the viz
	var fetchData = function(profileId, compareId, disableModalToggle) {
		EC.data = {};
		if (!disableModalToggle) {
			$("#audience-list").modal('toggle');
		}
		// Get the initial build data
		$.ajax({
			type: "GET",
			url: "../api/audience/show/" + profileId,
			data: {
				"start_date": initialStartDate,
				"compare_id": (compareId || ''),
				"tier": 3
			}
		})
		.done(function(data) {
			if (data.category_count == 0) {
				alert("There were no results newer than " + initialStartDate + ". Click OK to get older data.");
				initialStartDate = '';
				return fetchData(profileId, compareId, true);
			}
			EC.data = data;
			EC.data.profileId = profileId;
			buildProfile(EC);
			// Update user statistics
			EC.Events.publish('/update-user-statistics');
			// Get full sub data
			EC.data.subData = {};
			$.ajax({
				type: "GET",
				url: "../api/audience/show/" + profileId,
				data: {
					"start_date": initialStartDate,
					"compare_id": (compareId || ''),
					"tier": 0
				}
			})
			.done(function(d) {
				EC.data.subData = d.data;
				EC.Events.publish('/ScatterPlot/subData/loaded');
			});
		});
	};

	// Refresh the audience profile
	var refreshProfile = function(screenName) {
		$.get("../api/audience/refresh/" + screenName, null, null, 'json')
			.done(function(data) {
				if (typeof data.success != 'undefined' && !data.success) {
					return alert(data.data);
				}
				showList();
			})
			.fail(function(data) {
				$("#generated-content").before(errorAlert({message: "Could not refresh profile."}));
			});
	};

});

// keyword bar chart
var keywordBarChart = function(chartData)
{
	// Dimensions
	var selector = ".contentBox";
	var barWidth = 500;
	var barHeight = 18;
	var chartPadding = 50;
	var txtSpacing = "20px";

	// Remove all the previous instances of the viz
	$(".dynamic-add").remove();

	// Load the chart template
	var kwAnchor = attachAnchor(selector, txtSpacing);
	var kwList = EC.Templates.get('ui-keyword-list');

	// Load the title template
	var kwTitleAnchor = attachAnchor(selector, txtSpacing);
	$(kwTitleAnchor).attr('id', 'show-category');
	var kwTitle = EC.Templates.get('ui-keyword-title');

	// Check to see if we actually have data
	if (chartData.data.length == 0) {
		$(kwAnchor).html("Sorry, there are no profiles matching your keyword: " + chartData.keyword);
		return false;
	}

	// Set the subcats, final node, category color, and path margins
	chartData.subcats = chartData.path.slice(0, chartData.path.length - 1);
	chartData.finalNode = chartData.path.slice(-1);
	chartData.categoryColor = EC.Colors.byVertical(chartData.path[0]);
	chartData.pathTopMargin = 5;
	if (chartData.path.length < 4) {
		chartData.pathTopMargin += 10;
	}
	if (chartData.path.length < 3) {
		chartData.pathTopMargin += 10;
	}

	// Sort data and return only top 20 results
	var data = chartData.data.sort(function(a,b) {
		return b.count - a.count;
	}).slice(0, 20);

	// Display the title card
	$(kwTitleAnchor).append(kwTitle(chartData));

	// Display the template
	$(kwAnchor).append(kwList(data));

	// Apply sortable tables
	$("#keyword-list-table.sortable").tablesorter({
		headers: {
			0: {sorter:false},
			2: {sorter:false}
		}
	});

	// Set dynamic bar width based on the cell width
	var kwBarChartCellWidth = $(".kwBarChart-cell").width();
	barWidth = kwBarChartCellWidth - chartPadding;
	$(".kwBarChart").css("width", barWidth);

	// Set the scale based on category counts
	var xCounts = d3.scale.linear()
		.domain(d3.extent(data, function(d) {
			return d.count;
		}))
		.range([1, barWidth]);
	// Set the scale based on percent of total conversation
	var xPTC = d3.scale.linear()
		.domain(d3.extent(data, function(d) {
			return d.ptc;
		}))
		.range([1, barWidth]);

	// Render the CFP bars
	d3.selectAll(".kwBarChart").datum(data)
		.append("rect")
			.attr("fill", "#1BC4ED")
			.attr("width", function(d, i) {
				return xCounts(d[i].count);
			})
			.attr("height", barHeight);
	// Render the PTC bars
	d3.selectAll(".kwBarChart").datum(data)
		.append("rect")
			.attr("fill", "#9e0b0f")
			.attr("y", barHeight)
			.attr("width", function(d, i) {
				return xPTC(d[i].ptc);
			})
			.attr("height", barHeight);
}

// audience profile scatterplot
var buildProfile = function(EC) {

	var txtPadding = "20px";
	var chartData = EC.data;
	var data = chartData.data;
	var profileId = chartData.profile_id;
	var compareId = chartData.compare_id;
	var tier = 3;
	var showSilent = false;
	var startDate = initialStartDate;
	var endDate;
	var postalCode;
	var distance;
	var selector = ".contentBox";
	var tweetsPerRequest = 100;
	var subDataNames = {
		"score": "scoreDifference",
		"total-user-mentions": "scoreUserMentions"
	};

	var updateScatterPlot = function() {
		// Show the updating message
		scatter.showLoadingMessage("Loading Calculations, please wait...");
		// Set the subcats to an empty object to prevent old data from appearing
		EC.data.subData = {};
		$.ajax({
			type: "GET",
			url: "../api/audience/show/" + profileId,
			data: {
				"tier": (tier || 0),
				"start_date": (startDate || ''),
				"end_date": (endDate || ''),
				"postal_code": (postalCode || ''),
				"distance": (distance || ''),
				"compare_id": (compareId || ''),
				"show_silent": showSilent
			},
		})
		.done(function(d) {
			// Reload the subcategories
			$.ajax({
				type: "GET",
				url: "../api/audience/show/" + profileId,
				data: {
					"tier": 0,
					"start_date": (startDate || ''),
					"end_date": (endDate || ''),
					"postal_code": (postalCode || ''),
					"distance": (distance || ''),
					"compare_id": (compareId || ''),
					"show_silent": showSilent
				}
			})
			.done(function(d) {
				EC.data.subData = d.data;
				EC.Events.publish('/ScatterPlot/subData/loaded');
			});
			// Update the user stats
			if (typeof d.friend_count == 'undefined') {
				$(".audience-profile-followers #follower-count").html(d.follower_count);
				$(".audience-profile-followers .status-label").html("Followers");
			}
			else {
				$(".audience-profile-followers #follower-count").html(d.friend_count);
				$(".audience-profile-followers .status-label").html("Friends");
			}
			$(".audience-profile-tweets #tweet-count").html(d.tweet_count);
			$(".audience-profile-categories #category-count").html(d.category_count);
			// Update the scatter plot viz
			data = d.data;
			scatter.data(d.data);
			scatter.refresh();
		});
	};

	var loadSubcategories = function(d, panel) {
		var subCats = getSubcategories(d.name);
		if (subCats.length < 2) {
			panel.changeTitle("Tweets: " + d.name);
			// Populate the tweet modal with tweets
			fetchTweets(d, panel);
		}
		else {
			panel.changeTitle("Subcategories: " + d.name);
			panel.clearItems();
			panel.addViewTweetsLink(d);
			panel.addSubcategories(subCats);
		}
	};

	var fetchTweets = function(d, panel) {
		panel.loadingMsg("Loading Tweets...");
		var display_tier = (typeof d.tier != 'undefined') ? d.tier : tier;
		$.ajax({
			url: "../api/audience/tweetIds",
			data: {
				"profile_id": profileId,
				"category": d.id,
				"hash_id": d.hash_id,
				"tier": display_tier,
				"start_date": (startDate || ''),
				"end_date": (endDate || ''),
				"postal_code": (postalCode || ''),
				"distance": (distance || ''),
				"show_silent": showSilent
			},
			type: "GET",
			success: function(d) {
				panel.clearItems();
				panel.addTweets(d);
			}
		});
	};

	var getSubData = function() {
		var model = $('input[name="scatter-distribution-model"]').val();
		var subName = subDataNames[model];
		return EC.data.subData[subName];
	};

	var getSubcategories = function(category) {
		return getSubData().filter(function(d) {
			if ($.inArray(category, d.path) === -1) {
				return false;
			};
			return true;
		}).sort(function(a,b) { return b.deviance - a.deviance; });
	};

	var getCompareLabel = function(compare) {
		if (!compare.length) {
			return "Average Twitter User";
		}
		var label = compare.map(function(d) {
			if (d.type == 'query') {
				return "Q:" + d.screen_name + " (" + d.name.replace("Parameters: ", "") + ")";
			}
			else {
				return "@" + d.screen_name;
			}
		});
		return label.join(' + ');
	};

	var getProfileStatusTemplate = function(data) {
		if (typeof data.friend_count != 'undefined') {
			return 'ui-audience-profile-status-silent';
		}
		return (data.users.length > 1) ? 'ui-audience-profile-status-multiple' : 'ui-audience-profile-status-single';
	}

	// Remove all the previous instances of the viz
	$(".dynamic-add").remove();

	// attach the tweets anchor, then hide it
	var tweetAnchor = attachAnchor(selector, "20px", "indent-block");
	$(tweetAnchor).attr("id", "show-tweets").addClass("hide");

	// attach category box anchor, then hide it
	var categoryAnchor = attachAnchor(selector, "20px", "indent-block");
	$(categoryAnchor).attr("id", "show-category").addClass("hide");

	// set up the scatter plot deviance viz
	var scatterAnchor = attachAnchor(selector, txtPadding);
	var stageWidth = $(scatterAnchor).width() - parseInt($(scatterAnchor).parent().css('padding-right'));
	var scatter = new EC.ScatterPlot(scatterAnchor, data);
	scatter.setWidth(stageWidth);
	scatter.setLimit(40);
	scatter.setBaselineText(getCompareLabel(EC.data.compare));
	scatter.build();

	// Subcategory Side Panel
	var sidePanel = new EC.SidePanel(scatterAnchor, "side-panel");
	sidePanel.setOption("title", "Subcategories");
	sidePanel.setPosition(100).build().display();

	// Tweets Modal
	var tweetsModal = new EC.SidePanel(scatterAnchor, "tweets-modal");
	tweetsModal.setOption("title", "Tweets");
	tweetsModal.setPosition(200).build().modal().display();

	// Search Modal
	var searchModal = new EC.SidePanel(scatterAnchor, "search-modal");
	searchModal.setOption("title", "Search");
	searchModal.setPosition(300).build().modal().display();

	// scatter controls
	var scatterControls = attachAnchor(selector, txtPadding, "no-margin-bottom");
	$(scatterControls).append(insertElement("div", "", "bubble-control-toggle"))
		.append(insertTitle("Audience Profile", "title"))
		.append(insertElement("div", "", "bubble-controls separator"));
	$(".bubble-control-toggle").on("click", function() {
		$(".bubble-controls").toggle();
	});

	// distribution model
	var distributionInputs = [
		{"name": "scatter-distribution-model", "type": "radio", "value": "score", "text": "Score", "default": true},
		{"name": "scatter-distribution-model", "type": "radio", "value": "total-user-mentions", "text": "Users"}
	];
	var model = d3.select(scatterControls).select(".bubble-controls").append("div")
			.attr("class", "scatter-distribution-model")
			.style("float", "right");
	model.selectAll("input")
		.data(distributionInputs).enter().append("label")
			.style("text-transform", "none")
			.text(function(d) { return d.text; })
		.insert("input")
			.attr("name", function(d) { return d.name; })
			.attr("type", function(d) { return d.type; })
			.attr("value", function(d) { return d.value; })
			.property("checked", function(d,i) { return (d.default) ? "selected" : ""; })
			.style("float", "left")
			.style("margin-right", "3px")
			.on("change", function() {
				scatter.setOption('model', $(this).val());
				scatter.refresh();
			});
	model.insert("label", "label")
			.style("text-transform", "uppercase")
			.text("Filters");
	model.append("div")
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
				scatter.setOption('hideAdult', $(this).prop('checked'));
				scatter.refresh();
			});

	// Create Depth Buttons
	$(".bubble-controls").append(insertElement("div", "Tier Depth", "tier-depth"));
	$(".tier-depth").css("margin-right", "50px");
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
	var depthButtons = d3.select(scatterControls).select(".tier-depth").append("svg")
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
				if (i == (tier - 1)) {
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
		tier = (i == 4) ? 0 : i;
		updateScatterPlot();
	};
	// count dropdown
	var countInputs = [
		{"name": "10 Categories", "value": 10},
		{"name": "20 Categories", "value": 20},
		{"name": "30 Categories", "value": 30},
		{"name": "40 Categories", "value": 40, "default": true}
	];
	var countDropDown = d3.select(scatterControls).select(".bubble-controls").append("div")
			.attr("class", "scatter-count");
	countDropDown.append("select")
			.attr("name", "scatter-count")
			.on("change", function() {
				scatter.setOption('nodeLimit', $(this).val());
				scatter.refresh();
			})
			.selectAll("option")
		.data(countInputs).enter().append("option")
			.attr("value", function(d) { return d.value; })
			.property("selected", function(d,i) { return (d.default) ? "selected" : ""; })
			.text(function(d) { return d.name; });
	countDropDown.insert("label", "select")
			.style("text-transform", "uppercase")
			.text("Max");

	// Date Picker
	var datePicker = EC.Templates.get('ui-chart-datepicker');
	$(".bubble-controls").append(datePicker({initial_start_date: initialStartDate}));

	// Active Silent User Chooser
	var user_chooser = EC.Templates.get('ui-active-silent-chooser');
	$(".bubble-controls").append(user_chooser());
	// Add events to the choose
	$("#user-chooser button").on("click", function(e) {
		$("#user-chooser button").removeClass("active");
		$(this).addClass("active");
		var usertype = $(this).data("usertype");
		showSilent = (usertype == "silent") ? true : false;
		updateScatterPlot();
	});

	// are we doing a compare?
	if (chartData.compare.length) {
		var compareAnchor = attachAnchor(selector, '0px');
		var compareStatusTemplate = EC.Templates.get('ui-audience-profile-status-compare');
		$(compareAnchor).append(compareStatusTemplate(chartData.compare));
	}

	// user information section
	var userAnchor = attachAnchor(selector, '0');
	var profileStatusTemplate = getProfileStatusTemplate(chartData);
	var profileStatus = EC.Templates.get(profileStatusTemplate);
	$(userAnchor).append(profileStatus(chartData));
	$('[data-toggle="popover"]').popover();

	// Handle Channel Events
	EC.Events.subscribe('/ScatterPlot/click', function(d) {

		if (scatter.options.fit != "exact") {
			var altWidth = scatter.options.width - $("#side-panel").width();
			scatter.setOption("fit", "exact");
			scatter.setOption("width", altWidth);
			scatter.refresh();
		}

		$("#side-panel").show().animate({
			right: "+0"
		}, 150);

		$(".side-panel-modal").animate({
			right: "-400",
			opacity: "hide"
		}, 200);

		if ($.isEmptyObject(EC.data.subData)) {
			EC.Events.subscribe('/ScatterPlot/subData/loaded', function() {
				loadSubcategories(d, sidePanel);
			});
			sidePanel.loadingMsg("Loading Data...");
		}
		else {
			loadSubcategories(d, sidePanel);
		}
	});
	EC.Events.subscribe('/SidePanel/close', function(d) {
		$(".panel").animate({
			right: "-400",
			opacity: "hide"
		}, 400);
		var width = $(scatterAnchor).width() - parseInt($(scatterAnchor).parent().css('padding-right'));
		scatter.setOption("fit", "stretch");
		scatter.setOption("width", width);
		scatter.refresh();
	});
	EC.Events.subscribe('/SidePanel/Subcategory/click', function(d) {
		$("#tweets-modal").show().animate({
			right: "+0"
		}, 150);
		var tweetIds = d.tweet_ids;
		tweetsModal.changeTitle("Tweets: " + d.name);
		tweetsModal.clearItems();
		// Populate the tweet modal with tweets
		fetchTweets(d, tweetsModal);
	});
	EC.Events.subscribe('/SidePanel/Modal/back', function(id) {
		$("#" + id).animate({
			right: "-400",
			opacity: "hide"
		}, 200);
	});
	EC.Events.subscribe('/SidePanel/Search/click', function(d) {
		$("#search-modal").show().animate({
			right: "+0"
		}, 150);
		searchModal.addSearch(d.name);
	});
	EC.Events.subscribe('/ScatterPlot/applyFilters', function(d) {
		if (typeof d.start_date != 'undefined' && typeof d.end_date != 'undefined') {
			if (Date.parse(d.start_date) > Date.parse(d.end_date)) {
				return alert('You cannot have a start date after an end date.');
			}
		}
		startDate = d.start_date;
		endDate = d.end_date;
		postalCode = d.postal_code;
		distance = d.distance;
		updateScatterPlot();
	});
};
