EC.Events.subscribe('/ready', function(d) {
  var tabbedMode = 'browse';

  // Load the input form
  var inputForm = EC.Templates.get('ui-pr-input');
  $("#input-control-form").append(inputForm());

  // Handle the tabs
  $("li[role='presentation']").on("click", function(e) {
    tabbedMode = $(this).data("show");
    $("li[role='presentation']").removeClass("active");
    $(this).addClass("active");
    $(".econtext-tabcontent").hide();
    $(getSelectedTabId(tabbedMode)).show();
  });

  // Add the proper bindings to the plus and minus buttons for smart-input
  $(".add-another").on("click", function(e) {
    var fieldsCount = $(getSelectedTabId(tabbedMode) + " .smart-input-container").length;
    if (fieldsCount < 4) {
      addSmartInput();
    }
  });

  var getSelectedTabId = function(mode) {
    switch (mode) {
      case 'search':
        return '#econtext-tabcontent-search';
      case 'browse':
      default:
        return '#econtext-tabcontent-browse';
    }
  };

  var addSmartInput = function() {
    $(getSelectedTabId(tabbedMode) + " .smart-input-container").last().after("<div class='smart-input-container'><input type='text' class='form-control smart-input'>&nbsp;<a class='remove-field'><i class='fa fa-times'></i></a></div>");
    $(getSelectedTabId(tabbedMode) + " .smart-input-container .remove-field").last().on("click", removeSmartInput);
  };

  var removeSmartInput = function() {
    $(this).parent().remove();
  };

  $("#type").on("change", function(e) {
    if ($(this).val() === 'search') {
      $("#age-select").show();
      createInputBoxes('search');
      $("#helper-text").html("Enter Twitter Search Queries:");
    }
    else {
      $("#age-select").hide();
      createInputBoxes('users');
      $("#helper-text").html("Enter Twitter Usernames:");
    }
  });

  EC.Prefs.restore('dynamicnews', ['#twitter-count', '#bias-split', '#enable-cache']);

  $(".btn-classify").on("click", function(e) {
    e.preventDefault();

    $(".dynamic-add").remove();
    EC.Events.clearAll();

    EC.Prefs.save('dynamicnews', ['#twitter-count', '#bias-split', '#enable-cache']);

    var ajaxRequest = {};
    if (tabbedMode == 'browse') {
      var query = $(getSelectedTabId(tabbedMode) + " .smart-input").map(function(d) { return $(this).val(); }).get();

      var sources = [];
      $(".dn-source-checkbox:checked").each(function() {
        sources.push($(this).val());
      });
      if (sources.length == 0) {
        alert('You need to select at least 1 news source.');
        return false;
      }
      var tag = sources.join(',');

      var news_source = ($(".dn-source-checkbox:checked").length > 1)
        ? 'Various Sources'
        : $(".dn-source-checkbox:checked").parent().text();

      var tweet_count = $("#twitter-count").val();
      var enable_cache = $("#enable-cache").val();
      var type = $("#type").val();
      var max_age = $("#max-age").val();

      query.forEach(function(d) {
        if (d === '') {
          alert('You are missing a search query, please make sure all fields are filled out.');
          throw 'Fields not filled out.';
        }
      });

      ajaxRequest = {
        method: "get",
        data: {
          "query": query,
          "type": type,
          "tag": tag,
          "news_source": news_source,
          "twitter-count": tweet_count,
          "enable-cache": enable_cache,
          "max-age": max_age
        },
        url: "../api/weighted_search/news"
      };
    }
    else if (tabbedMode == 'search') {
      var query = $(getSelectedTabId(tabbedMode) + " .smart-input").map(function(d) { return $(this).val(); }).get();
      ajaxRequest = {
        method: "get",
        data: {
          "search-query": $("#search-query").val(),
          "search-source": $("#search-source").val(),
          "enable-cache": $("#enable-cache").val(),
          "twitter-count": $("#twitter-count").val(),
          "query": query
        },
        url: "../api/weighted_search/bing"
      };
    }

    EC.loading.show(0);
    $.ajax(ajaxRequest)
      .done(function(d) {
        d3.selectAll(".dynamic-add").remove();
        EC.loading.hide();
        var supLayout = EC.Templates.get("ui-dynamicnews-layout");
        var insertAfter = '.unmatchedBox';
        $(".contentRail").append(supLayout(d.data));
        buildList(d.data);
        d.data.combined_profile.queries = d.data.queries;
        buildBubbles(d.data.combined_profile, insertAfter);
      })
      .fail(function(d) {
        EC.loading.hide();
        var badUsers = d.responseJSON.error.join(',');
        alert('Could not fetch results. The following users either: 1) do not exist on Twitter, 2) have protected or no tweets: ' + badUsers);
        return false;
      });
  });

  var getFavicon = function(tag) {
    switch (tag) {
      case 'NYT':
        return 'http://static01.nyt.com/favicon.ico';
      case 'CNN':
        return 'http://www.cnn.com/favicon.ico';
      case 'CBSSPORTS':
        return 'http://www.cbssports.com/favicon.ico';
      case 'FOX_SPORTS':
        return 'http://www.foxsports.com/etc/designs/fsdigital/foxsports/styles/main/images/logo/favicons/60x60.ico';
      case 'WIRED_TECH':
        return 'http://www.wired.com/favicon.ico';
      case 'YAHOO_HEALTH':
        return 'https://www.yahoo.com/favicon.ico';
      case 'GQ':
        return 'http://www.gq.com/favicons/favicon.png';
      case 'CN_TRAVELER':
        return 'http://www.cntraveler.com/cnt-f-core-img/favicons/favicon.ico';
      case 'PCMAG_HDTV':
        return 'http://www.pcmag.com/favicon.ico';
      case 'PCMAG_CAMERAS':
        return 'http://www.pcmag.com/favicon.ico';
      case 'VOGUE':
        return 'http://www.vogue.com/wp-content/config/favicons/favicon.ico';
      case 'MSN_MONEY':
      case 'MSN_SPORTS':
      case 'MSN_NEWS':
      case 'MSN_AUTOS':
        return 'http://static-autos-eus.s-msn.com/sc/2b/a5ea21.ico';
      default:
        return 'https://www.econtext.com/wp-content/uploads/2015/12/favicon-02.jpg';
    }
  };

  // creates the compare list
  var buildList = function(data) {
    var users = data.queries.map(function(d) {
      return (d.screen_name)
        ? '@' + d.screen_name.toLowerCase()
        : d.query;
    });
    var bias = $("#bias-split").val();
    switch (bias) {
      case "ninety-ten":
        volume_bias = 0.10;
        category_bias = 0.90;
        break;
      case "eight-twenty":
        volume_bias = 0.20;
        category_bias = 0.80;
        break;
      case "seventy-thirty":
        volume_bias = 0.30;
        category_bias = 0.70;
        break;
      case "sixty-forty":
        volume_bias = 0.40;
        category_bias = 0.60;
        break;
      case "fifty-fifty":
        volume_bias = 0.50;
        category_bias = 0.50;
        break;
      case "forty-sixty":
        volume_bias = 0.60;
        category_bias = 0.40;
        break;
      case "thirty-seventy":
        volume_bias = 0.70;
        category_bias = 0.30;
        break;
      case "twenty-eighty":
        volume_bias = 0.80;
        category_bias = 0.20;
        break;
      case "ten-ninety":
        volume_bias = 0.90;
        category_bias = 0.10;
        break;
      default:
        volume_bias = 0.20;
        category_bias = 0.80;
        break;
    }
    // Add color and adj rank properties to the results
    for (name in data.results) {
      data.results[name].forEach(function(d, i) {
        d.original_position = ++i;
        d.adjusted_rank = (d.news_rank * volume_bias) + (d.category_rank * category_bias);
        d.categories = d.categories.slice(0,10);
        d.categories.forEach(function(p) {
          p.color = EC.Colors.byVertical(p.vertical);
        })
        d.favicon = getFavicon(d.tag);
      });
    }
    // Create a copy for unsorted
    var unsorted = EC.deepCopy(data.results['combined']);
    // Sort all the data sets based on adj rank and map the users to category hash_ids
    var user_category_positions = {};
    for (name in data.results) {
      user_category_positions[name] = {};
      data.results[name].sort(function(a, b) {
        return a.adjusted_rank - b.adjusted_rank;
      });
      data.results[name].forEach(function(d, i) {
        d.current_position = ++i;
        d.position_change = d.original_position - d.current_position;
        if (d.position_change > 0) {
          d.change_class = "positive";
          d.change_icon = "fa fa-chevron-up";
        }
        else if (d.position_change < 0) {
          d.change_class = "negative";
          d.change_icon = "fa fa-chevron-down";
        }
        else {
          d.change_class = "no-change";
          d.change_icon = "";
        }
        user_category_positions[name][d.hash_id] = d.current_position;
      });
    }
    // Add the sorted to unsorted
    unsorted.forEach(function(d, i) {
      var adjusted_news = data.results['combined'][i];
      d.new_rank = adjusted_news;
      d.new_rank.user_positions = {};
      if (data.queries.length > 1) {
        users.forEach(function (p) {
          d.new_rank.user_positions[p] = user_category_positions[p][d.new_rank.hash_id];
        });
      }
    });
    if (users.length > 1) {
      var dynamicNewsList = EC.Templates.get("ui-dynamicnews-list-multi");
      $(".listBox").append(dynamicNewsList({"news": unsorted, "users": users}));
    }
    else {
      var dynamicNewsList = EC.Templates.get("ui-dynamicnews-list-single");
      $(".listBox").append(dynamicNewsList(unsorted));
    }
    // Click events
    $(".weighted-list-expand").on("click", function() {
      var position = $(this).data("position");
      var class_name = ".weighted-list-submenu-" + position;
      if ($(class_name).css("display") == "block") {
        $(class_name).hide();
      }
      else {
        $(".weighted-list-submenu").hide();
        $(".weighted-list-submenu-" + position).show();
      }
    });

    // Add unmatched
    data.unmatched_categories.forEach(function(d) {
      d.color = EC.Colors.byVertical(d.vertical);
    });
    var unmatchedList = EC.Templates.get("ui-dynamicnews-list-unmatched");
    $(".unmatchedBox").append(unmatchedList(data.unmatched_categories.slice(0,20)));
  };

  var changeBubbles = function(profile, insertAfter) {
    $("#bubbleChart").remove();
    $("#bubbleControls").remove();
    $("#show-category").remove();
    $("#showTweets").remove();
    EC.Events.clearAll();
    buildBubbles(profile, insertAfter);
    EC.Events.publish('/Browser/scrollToChart');
  };

  // runs the visualization
  var buildBubbles = function(profile, insertAfter) {
    var bubbles, stream, treemap, current_chart;
    var catCount = 40;
    var txtPadding = "20px";
    var data = profile;
    var selector = insertAfter;
    var queries = profile.queries;
    var multipleUsers = (queries.length > 1);

    // Set the controls
    var control_list = {
      "Bubbles" : [".node-count", ".exclude-adult", ".tier-depth", ".bubble-node-pager"],
      "StreamGraph" : [".node-count", ".time-period", ".exclude-adult", ".tier-depth"],
      "ZoomTreeMap" : [".exclude-adult"]
    };

    var toggleControls = function(chart) {
      var type = chart.type;
      var controls = control_list[type];
      $(".chart-control").hide();
      $(".chart-extra").addClass("hide");
      controls.forEach(function(d) {
        $(d).show();
      });
    };

    // set the color scheme
    EC.Colors.setUserColors(queries.length);

    // Set the twitter count drop down
    $("#twitter-count").val(profile.twitter_count);

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

    // attach the tweets anchor, then hide it
    var tweetAnchor = attachAnchor(selector, "20px", "indent-block");
    $(tweetAnchor).attr("id", "showTweets").addClass("hide chart-extra");

    // insert the go to top button
    var buttonTop = insertButton("buttonTop", "buttonTop", "Back To Top", "btn btn-primary btn-top");
    $("body").append(buttonTop);

    // attach category box anchor, then hide it
    var categoryAnchor = attachAnchor(selector, "20px", "indent-block");
    $(categoryAnchor).attr("id", "show-category").addClass("hide chart-extra");

    // bubble chart anchor
    var bubbleAnchor = attachAnchor(selector);
    bubbleAnchor.setAttribute("id", "bubbleChart")

    // initialize the bubble chart
    var bubbles = new EC.Bubbles(bubbleAnchor, data);
    if (queries.length > 1) {
      bubbles.setOptions({
        multipleUsers: true,
      });
    }

    // set the stage width
    var stageWidth = $(bubbleAnchor).width() - parseInt($(bubbleAnchor).parent().css('padding-right'));

    // bubble controls
    var bubbleControls = attachAnchor(selector, txtPadding, "no-margin-bottom");
    var bubbles_switcher = EC.Templates.get('ui-bubbles-switcher');
    $(bubbleControls)
      .attr("id", "bubbleControls")
      .append(insertElement("div", "", "bubble-control-toggle"))
      .append(bubbles_switcher())
      .append(insertElement("div", "", "bubble-controls"));
    $(".bubble-control-toggle").on("click", function() {
      $(".bubble-controls").toggle();
    });
    $("#bubbles-switcher button").on("click", function(e) {
      var period = $(this).data("display");
      // button behavior
      $("#bubbles-switcher button").removeClass("active");
      $(this).addClass("active");
      switch (period) {
        case "frequent" :
          EC.Events.publish("/Bubbles/show");
          break;
        case "time" :
          EC.Events.publish("/StreamGraph/show");
          break;
        case "verticals" :
          EC.Events.publish("/ZoomableTreeMap/show");
          break;
      }
    });

    // set up the depth buttons
    $(".bubble-controls").append(insertElement("div", "Tier Depth", "tier-depth chart-control"));
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
      current_chart.setDepth(i);
      EC.loading.showDeferred(function() { current_chart.refresh(); });
      EC.Events.publish('/Browser/scrollToChart');
    };

    // build the node dropdown
    d3.select(bubbleControls).select(".bubble-controls")
      .append("span")
      .attr("class", "node-count chart-control")
      .append("label")
      .text("Max");
    bubbleCount = d3.select(bubbleControls).select(".bubble-controls span")
      .append("select")
      .style("position", "relative")
      .style("margin-right", "10px")
      .attr("id", "bubble_count");
    var limits = [20,40,60,80];
    limits.forEach(function(n) {
      var bubbleOption = bubbleCount.append("option")
        .attr("value", n)
        .text(n + " Categories");
      if (n == catCount) {
        bubbleOption.property("selected", true);
      };
    });
    bubbleCount.on("change", function() {
      limit = parseInt(this.value);
      current_chart.setLimit(limit);
      EC.loading.showDeferred(function() { current_chart.refresh(); });
    });
    // Time Period Selection
    var time_period = EC.Templates.get('ui-time-period');
    //$('#bubble_count').after(period_select());
    $(".bubble-controls").append(time_period());
    $('#time-period-select').on('change', function(e) {
      var period = $(this).val();
      if (!stream.checkTimeIntervalData(period)) {
        alert("The time period you chose may not have enough data to display a chart. If the chart appears clear, please select another time period.");
      }
      stream.setTimeInterval(period);
      EC.loading.showDeferred(function() { stream.refresh(); });
    });

    // Exclude Adult checkbox
    d3.select('.bubble-controls').append("div")
      .attr("class", "exclude-adult chart-control")
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
          current_chart.hideAdult(true);
        }
        else {
          current_chart.hideAdult(false);
        }
        EC.loading.showDeferred(function() { current_chart.refresh(); });
        EC.Events.publish('/Browser/scrollToChart');
      });
    // Separate Layers Checkbox
    d3.select('.bubble-controls').append("label")
      .attr("class", "separate-layers chart-control")
      .text("Separate Layers")
      .style("text-transform", "none")
      .style("display", "none")
      .append("input")
      .attr("name", "show-small-multiples")
      .attr("type", "checkbox")
      .property("checked", false)
      .style("float", "left")
      .style("margin-right", "3px")
      .on("change", function() {
        if (this.checked) {
          stream.setChartType("small-multiples");
        }
        else {
          stream.setChartType("streamgraph");
        }
        stream.refresh();
      });

    EC.Events.subscribe('/Bubbles/show', function(d) {
      EC.ChartsList.update("remove");
      EC.ChartsList.register(bubbles);
      current_chart = bubbles;
      toggleControls(bubbles);
      $("#bubble_count").val(40);
      bubbles.setLimit(40);
      bubbles.setWidth(stageWidth);
      EC.loading.showDeferred(function() { bubbles.build(); });
    });
    EC.Events.subscribe('/StreamGraph/show', function(d) {
      EC.ChartsList.update("remove");
      stream = (!stream) ? EC.StreamGraph(bubbleAnchor, profile) : stream;
      EC.ChartsList.register(stream);
      current_chart = stream;
      toggleControls(stream);
      $("#bubble_count").val(40);
      stream.setLimit(40);
      stream.setWidth(stageWidth);
      EC.loading.showDeferred(function() { stream.build(); });
      EC.Events.publish('/Browser/scrollToChart');
    });
    EC.Events.subscribe('/ZoomableTreeMap/show', function(d) {
      EC.ChartsList.update("remove");
      treemap = (!treemap) ? EC.ZoomTreeMap(bubbleAnchor, profile) : treemap;
      EC.ChartsList.register(treemap);
      current_chart = treemap;
      toggleControls(treemap);
      treemap.setWidth(stageWidth);
      EC.loading.showDeferred(function() { treemap.build(); });
      EC.Events.publish('/Browser/scrollToChart');
    });
    EC.Events.subscribe('/Viz/finishedLoading', function(d) {
      EC.loading.hide();
    });
    EC.Events.subscribe('/Browser/changeTimePeriod', function(d) {
      $("#time-period-select").val(d);
    });
    EC.Events.subscribe('/Browser/scrollToChart', function(d) {
      $("html, body").animate({
        scrollTop: $("#bubbleControls").offset().top
      }, 500);
    });
    EC.Events.subscribe('/ZoomTreeMap/showTweets', function(d) {
      if (!d) {
        $("#showTweets").addClass("hide");
        return false;
      }
      // clear old tweets
      $("#showTweets").html("");
      // show the anchor class
      $("#showTweets").removeClass("hide");
      var container = document.createElement("div");
      container.className = "tweetAssets";
      container.setAttribute("style", "overflow: hidden;");
      var header = document.createElement("h3");
      header.className = "tweetAssets";
      $(header).append(document.createTextNode("Tweets"));
      $(container).append(header);
      $("#showTweets").append(container);
      d3.event.stopImmediatePropagation();

      var tweets = d.filter(function(n) {
        return n.retweeted === false;
      });
      // If there are no tweets, then grab one retweet
      if (tweets.length == 0) {
        tweets = d;
      }
      // Sort by verified
      tweets = tweets.sort(function(a,b) {
        return b.verified - a.verified;
      });
      var tweetsDisplay = EC.Templates.get('ui-tweet-horizontal');
      $("#showTweets").append(tweetsDisplay({tweets_list: tweets.slice(0, 10)}));
    });

    // build chart on page load
    EC.Events.publish('/Bubbles/show');

    // placeholder for the legend
    if (multipleUsers) {
      $("#bubbleChart").append("<div class='twitter-user-legend chart-extra'><ul></ul></div>");
    }

    // user info boxes and query inputs
    var queriesAnchor = attachAnchor(selector, txtPadding);
    queries.forEach(function(query, i) {
      query.index = i;
      query.selected = false;
      query.display_name = query.screen_name || query.query;
      // add the user box
      var boxClass = (multipleUsers) ? "twitter-user-multiple" : "twitter-user-single";
      var box = (query.screen_name)
        ? EC.UserBox(query, "col-md-" + Math.floor(12 / queries.length) + " no-padding " + boxClass).element()
        : EC.QueryBox(query, "col-md-" + Math.floor(12 / queries.length) + " no-padding " + boxClass).element();
      if (multipleUsers) {
        d3.select(box).on("click", function(d) {
          var boxes = d3.selectAll(".twitter-user-multiple");
          if (d.selected) {
            d.selected = false;
            boxes.classed("user-box-blur", false);
            bubbles.deselectPie();
          }
          else {
            d.selected = true;
            boxes.classed("user-box-blur", function(n) {
              if (n !== d) {
                n.selected = false;
              }
              return !n.selected;
            });
            bubbles.clickPie(d);
          }
        });
      }
      $(queriesAnchor).append(box);
      if (multipleUsers) {
        // legend item
        d3.select(".twitter-user-legend ul").append("li")
          .style("border-left-color", EC.Colors.color(query.index))
          .text(query.display_name)
          .on("click", function() {
            $(".twitter-user-multiple:nth-child(" + (query.index + 1) + ")").trigger("click");
          });
      }
    });

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

    // bind a scrolling event for the top button and legend
    $(window).scroll(function() {
      var bubbleChartTop = $("#bubbleChart").offset().top;
      if ($(this).scrollTop() >= bubbleChartTop && !$("#showTweets").hasClass("hide")) {
        $("#buttonTop").fadeIn(200);
      }
      else {
        $("#buttonTop").fadeOut(200);
      }
      if (multipleUsers) {
        var userBoxBottom = $(".twitter-user-multiple").offset().top;
        if ($(this).scrollTop() >= userBoxBottom) {
          $(".twitter-user-legend").fadeIn(200);
        }
        else {
          $(".twitter-user-legend").fadeOut(200);
        }
      }
    });

    // bind the top button
    $("#buttonTop").click(function() {
      $("html, body").animate({
        scrollTop: $("#bubbleControls").offset().top
      }, 500);
    });

  };
});