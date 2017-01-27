var EC = EC || {};

EC.LoadTemplates = function(base_url) {
  var templates = null;
  $.ajax({
    url: base_url + "/wp-content/plugins/classify/js/templates/ui.hbs",
    type: "GET",
    dataType: "text",
    async: false,
    success: function(d) {
      templates = d;
    }
  });
  return {
    get: function(name, callback) {
      var tpl = $(templates).filter("script." + name).html();
      return Handlebars.compile(tpl);
    }
  };
};

EC.Events = (function() {
  var topics = {};
  return {
    subscribe: function(topic, callback) {
      if (!topics[topic]) {
        topics[topic] = [];
      }
      topics[topic].push(callback);
    },
    unsubscribe: function(topic) {
      if (topics[topic]) {
        delete topics[topic];
      }
    },
    publish: function(topic, arg) {
      if (topics[topic]) {
        var selectedTopic = topics[topic];
        for (var i = 0; i < selectedTopic.length; i++) {
          selectedTopic[i].call(selectedTopic[i], arg);
        }
      }
    },
    topics: function() {
      return topics;
    },
    clearAll: function() {
      topics = {};
    }
  };
})();

EC.Prefs = (function() {
  return {
    save: function(prefix, ids) {
      ids.forEach(function(d) {
        localStorage.setItem(prefix +'.' + d, $(d).val());
      });
    },
    restore: function(prefix, ids) {
      ids.forEach(function(d) {
        var item = localStorage.getItem(prefix + '.' + d);
        if (item) {
          $(d).val(item);
        }
      });
    }
  }
})();

EC.ChartsList = (function() {
  var charts = [];
  return {
    register: function(chart) {
      if (charts.indexOf(chart) == -1) {
        charts.push(chart);
      }
    },
    update: function(method) {
      charts.forEach(function(d) {
        d[method]();
      });
    }
  };
})();

EC.Colors = (function() {
  // colors
  var colorList = [
    { vertical: "unspecified", color: "#000" },
    { vertical: "Adult Content", color: "#555" },
    { vertical: "Apparel", color: "#9b3431" },
    { vertical: "Arts & Entertainment", color: "#FCB514" },
    { vertical: "Beauty", color: "#b87dd7" },
    { vertical: "Books & Literature", color: "#b29840" },
    { vertical: "Business & Industrial", color: "#888888" },
    { vertical: "Computers & Electronics", color: "#00c7eb" },
    { vertical: "Finance", color: "#62c95c" },
    { vertical: "Food & Drink", color: "#d38987" },
    { vertical: "Games & Toys", color: "#FFA474" },
    { vertical: "Government", color: "#dabe93" },
    { vertical: "Health", color: "#dcd696" },
    { vertical: "Hobbies & Leisure", color: "#cf8415" },
    { vertical: "Home & Garden", color: "#359984" },
    { vertical: "Jobs & Education", color: "#7ed5d5" },
    { vertical: "Law & Legal", color: "#6a5c27" },
    { vertical: "People & Society", color: "#923951" },
    { vertical: "Pets & Animals", color: "#b6bd40" },
    { vertical: "Real Estate", color: "#824c0e" },
    { vertical: "Shopping", color: "#7442C8" },
    { vertical: "Sciences & Humanities", color: "#1f2b61" },
    { vertical: "Sports", color: "#EE0000" },
    { vertical: "Travel", color: "#009cb8" },
    { vertical: "Vehicles", color: "#47750c" },
    { vertical: "Weapons", color: "#301d1d" }
  ];
  var userColors = null;
  var userColorCombos = [
    {"users": 1, "colors": ["#9948B1"]},
    {"users": 2, "colors": ["#9948B1", "#0066A4"]},
    {"users": 3, "colors": ["#9948B1", "#0066A4", "#23AC8B"]},
    {"users": 4, "colors": ["#9948B1", "#2728A4", "#0066A4", "#23AC8B"]},
    {"users": 5, "colors": ["#9948B1", "#2728A4", "#0066A4", "#23AC8B", "#97E34D"]},
    {"users": "orig", "colors": ["#252525", "#7cc576", "#448ccb", "#f7941d", "#a864a8"]},
    {"users": "attitude", "colors": ["#00a651", "#d10e15", "#7d7d7d"]}
  ];
  var textColors = {
    dark: "#000000",
    light: "#ffffff"
  };
  var defColor = d3.scale.category10();
  var color = d3.scale.ordinal()
    .domain(colorList.map( function(d) { return d.vertical; }) )
    .range(colorList.map( function(d) { return d.color; }) );
  var getRGB = function(color) {
    // strip the # sign if exists
    if (color.substr(0,1) == "#") {
        color = color.substr(1);
    }

    var num = parseInt(color, 16);

    var r = (num >> 16);

    if (r > 255) {
      r = 255;
    }
    else if (r < 0) {
      r = 0;
    }

    var b = ((num >> 8) & 0x00FF);
    if (b > 255) {
      b = 255;
    }
    else if (b < 0) {
      b = 0;
    }

    var g = (num & 0x0000FF);
    if (g > 255) {
      g = 255;
    }
    else if (g < 0) {
       g = 0;
    }
    return {r: r, g: g, b: b};
  };
  var getContrastYIQ = function(hexcolor) {
    if (hexcolor.substr(0,1) == "#") {
      hexcolor = hexcolor.substr(1);
    }
  	var r = parseInt(hexcolor.substr(0,2),16);
  	var g = parseInt(hexcolor.substr(2,2),16);
  	var b = parseInt(hexcolor.substr(4,2),16);
  	var yiq = ((r*299)+(g*587)+(b*114))/1000;
  	return (yiq >= 128) ? textColors.dark : textColors.light;
  };
  return {
    byVertical: function(vertical) {
      return color(vertical);
    },
    colorsList: function() {
      return colorList;
    },
    getRGB: function(color) {
      return getRGB(color);
    },
    getContrast: function(color) {
      return getContrastYIQ(color);
    },
    color: function(i) {
      return userColors[i];
    },
    getUserColors: function() {
      return userColors;
    },
    setUserColors: function(i) {
      userColors = userColorCombos.filter(function(n) {
        return n.users === i;
      })[0].colors;
    }
  };
})();

EC.stripSpaces = function(str) {
  return str.replace(/[\s]|&/g,'');
};

EC.Gradients = (function() {
  var radial = function() {
    // append the gradient definitions
    var defs = d3.select(document.createElementNS("http://www.w3.org/2000/svg", "defs"));
    // append the radial gradients
    var grads = defs.selectAll("radialGradient")
        .data(EC.Colors.colorsList()).enter()
      .append("radialGradient")
        .attr("id", function(d) {
          return EC.stripSpaces(d.vertical) + "Radial";
        });
    grads.append("stop")
      .attr("offset", "30%")
      .attr("stop-color", function(d) {
        return EC.Colors.byVertical(d.vertical);
      })
      .attr("stop-opacity", .2);
    grads.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", function(d) {
        return EC.Colors.byVertical(d.vertical);
      })
      .attr("stop-opacity", 1);
    return defs;
  };
  return {
    Radial: function() {
      return radial().node();
    }
  };
})();

EC.fontSizeForDimensions = function(text, width, height, maxFontSize) {
  var fontSize = maxFontSize;
  var d = $("<span>" + text + "</span>").appendTo("body");
  d.css("font-size", fontSize + "px");
  while (d.width() > width || d.height() > height) {
      fontSize -= 2;
      d.css("font-size", fontSize + "px");
  }
  d.remove();
  return fontSize;
};

EC.deepCopy = function(data) {
  return JSON.parse(JSON.stringify(data));
};

EC.filterAdult = function(categories) {
  var copy_cats = JSON.parse(JSON.stringify(categories));
  var filtered = copy_cats.filter(function(d) {
    return d.vertical != "Adult Content";
  });
  filtered.forEach(function(d) {
    var f_tweets = d.tweets.filter(function(t) {
      return !t.has_adult_content;
    });
    d.tweets = f_tweets;
    d.count = f_tweets.length;
  });
  return filtered;
};

EC.nestCategories = function(root_name, categories) {
  var createNode = function(category, path, i) {
    var path_str = path.slice(0,i+1).join(' :: ');
    return {
      name: path[i],
      vertical: path[0],
      tweets: category.tweets,
      path: path_str,
      children: []
    };
  };
  var createLeaf = function(category, path, i) {
    var path_str = path.slice(0,i+1).join(' :: ');
    var tweets = category.tweets.filter(function(d) {
      return d.path[i] == path[i];
    });
    return {
      name: path[i],
      vertical: path[0],
      path: path_str,
      tweets: tweets,
      count: category.count
    };
  };
  var nest = {
    name: root_name,
    path: root_name,
    children: []
  };
  var path, current_node, prev_node, names, idx_name;
  for (var i = 0; i < categories.length; i++) {
    path = categories[i].path;
    for (var j = 0; j < path.length; j++) {
      current_node = (j < (path.length - 1))
        ? createNode(categories[i], path, j)
        : createLeaf(categories[i], path, j);
      if (j == 0) {
        names = nest.children.map(function(d) {
          return d.name;
        });
        idx = $.inArray(path[j], names);
        if (idx > -1) {
          current_node = nest.children[idx];
        }
        else {
          nest.children.push(current_node);
        }
      }
      else {
        if (prev_node.hasOwnProperty('children')) {
          names = prev_node.children.map(function(d) {
            return d.name;
          });
          idx = $.inArray(path[j], names);
          if (idx > -1) {
            current_node = prev_node.children[idx];
          }
          else {
            prev_node.children.push(current_node);
          }
        }
      }
      prev_node = current_node;
    }
  }
  function aggregateTweetCounts(d) {
    return (d._children = d.children)
      ? d.count = d.children.reduce(function(p, v) { return p + aggregateTweetCounts(v); }, 0)
      : d.count;
  }
  function aggregateCategoryCounts(d) {
    return (d._children = d.children)
      ? d.category_count = d.children.reduce(function(p, v) { return p + aggregateCategoryCounts(v); }, 0)
      : (d.children) ? d.children.length : 1;
  }
  function aggregateTweets(d) {
    if (d.tweets) {
      return d.tweets;
    }
    d.tweets = [];
    d.children.forEach(function(t) {
      d.tweets = d.tweets.concat(aggregateTweets(t));
    });
    return d.tweets;
  }
  aggregateTweetCounts(nest);
  aggregateCategoryCounts(nest);
  aggregateTweets(nest);
  return nest;
};

EC.daysBetween = function(start_date, end_date) {
  var one_day = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((start_date.getTime() - end_date.getTime())/(one_day)));
};

EC.secondsBetween = function(start_date, end_date) {
  return (end_date.getTime() - start_date.getTime()) / 1000;
};

EC.ZoomBubbles = function(t,d) {
  var options = {
    aspect: 21/9,
    width: 1400,
    height: 960,
    margin: 20,
    hide_adult: true
  };
  var data, target;
  var setTarget = function(t) {
    target = t;
  };
  var setData = function(d) {
    data = EC.nestCategories(d.query_list[0].query, d.categories);
  };
  var render = function() {
    // Set the stage size
    var width = options.width,
      height = Math.round( width / options.aspect ),
      //height = options.width,
      margin = options.margin;

    // Set the root, focus, and view
    var root = data,
      focus = root,
      view;

    var color = d3.scale.linear()
      .domain([-1, 8])
      .range(["hsl(175,73%,87%)", "hsl(228,30%,40%)"])
      .interpolate(d3.interpolateHcl);

    var pack = d3.layout.pack()
      .padding(2)
      .size([width, height])
      .value(function(d) { return d.count; });

    var svg = d3.select(target).append("svg")
        .attr("class", "chartZB")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

    var nodes = pack.nodes(data);

    var circle = svg.selectAll("circle")
        .data(nodes)
      .enter().append("circle")
        .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node-leaf" : "node node-root"; })
        .style("fill", function(d) { return d.children ? color(d.depth) : null; })
        .on("click", function(d) {
          if (focus !== d) {
            zoom(d);
            d3.event.stopPropagation();
          }
        })
        .on("mousemove", function(d) {
          var mouse = d3.mouse(target);
          mouse_x = mouse[0];
          mouse_y = mouse[1];
          tool_tip.html(d.name);
          tool_tip.style("left", function() {
            var tt_width = $(".tool-tip").width();
            return mouse_x - tt_width/2 + "px";
          });
          tool_tip.style("top", function() {
            var tt_height = $(".tool-tip").height();
            return mouse_y + tt_height + "px";
          });
          tool_tip.style("display", "block");
        })
        .on("mouseout", function(d) {
          tool_tip.style("display", "none");
        });

    var text = svg.selectAll("text")
        .data(nodes)
      .enter().append("text")
        .attr("class", "node-label")
        .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
        .style("display", function(d) { return d.parent === root ? null : "none"; })
        .text(function(d) { return d.name; });

    var nav_pointer = svg.append("text")
      .attr("class", "nav-pointer")
      .attr("x", width/2 - margin)
      .attr("y", -(height/2 - margin))
      .attr("text-anchor", "end")
      .text(data.name);

    var tool_tip = d3.select(target)
      .append("div")
      .attr("class", "tool-tip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("display", "none")
      .style("z-index", 200)
      .style("top", "10px")
      .style("left", "10px");

    var node = svg.selectAll("circle.node,text.node-label");

    zoomTo([root.x, root.y, root.r * 2 + margin]);

    function zoomTo(v) {
      var k = height / v[2];
      view = v;
      node.attr("transform", function(d) {
        return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
      })
      circle.attr("r", function(d) {
        if (d.children) {
          if (d.children.length < 2) {
            return d.r * k * 0.90;
          }
          else {
            return d.r * k;
          }
        }
        else {
          return d.r * k * 0.85;
        }
      });
    }

    function zoom(d) {
      var prev_focus = focus;
      focus = d;

      nav_pointer.text(d.path);

      d3.selectAll(".chartZB text.node-label")
        .style("display", "none");

      var transition = d3.transition()
        .duration(200)
        .tween("zoom", function(d) {
          var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
          return function(t) { zoomTo(i(t)); };
        });
      transition.selectAll(".chartZB text.node-label")
        .filter(function(d) { return d.parent === focus })
          .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
          .each("start", function(d) {
            if (d.parent === focus) {
              this.style.display = "inline";
            }
          })
          .each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; })
    }
  };
  setTarget(t);
  setData(d);
  return {
    build: function() {
      return render();
    },
    setWidth: function(v) {
      options.width = v;
    },
    remove: function() {
      d3.select(".chartZB").remove();
    },
    hideAdult: function(b) {
      options.hide_adult = b;
    },
    refresh: function() {
      this.build();
    },
    type: "ZoomBubbles"
  };
};

EC.ZoomTreeMap = function(t,d) {
  var options = {
    aspect: 21/9,
    width: 1400,
    height: 960,
    margin: {top: 40, right: 0, bottom: 0, left: 0},
    hide_adult: true,
    panel_width: 300
  };
  var original_data, root, focus, target, tweet_count, anchor, svg, x, y, width, height, BCSize,
    breadcrumbs, transitioning, panel, tool_tip, back_button, forward_button;
  var bc_path = [];
  var history_path = [];
  var setTarget = function(t) {
    target = t;
  };
  var setData = function(d) {
    original_data = EC.deepCopy(d);
    var categories = (options.hide_adult) ? EC.filterAdult(d.categories) : EC.deepCopy(d.categories);
    var root_name = (d.users) ? "@" + d.users[0].screen_name : d.query_list[0].query;
    root = EC.nestCategories(root_name, categories);
    focus = root;
    tweet_count = categories.reduce(function(p, v, i) {
      var prev_value = (i == 1) ? p.count : p;
      return prev_value + v.count;
    });
  };
  var render = function() {
    var margin = options.margin;
    width = $(target).width() - margin.left - margin.right;
    //height = options.height = Math.round( width / options.aspect ) - margin.top - margin.bottom;
    height = options.height = Math.round( width / options.aspect );
    x = d3.scale.linear().domain([0, width]).range([0, width]);
    y = d3.scale.linear().domain([0, height]).range([0, height]);
    transitioning = false;

    var treemap = d3.layout.treemap()
      .children(function(d, depth) { return depth ? null : d._children; })
      .value(function(d) { return d.count; })
      .sort(function(a, b) { return a.value - b.value; })
      .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
      .round(false);

    anchor = d3.select(target).append("div")
      .attr("class", "anchorZTM");

    svg = anchor.append("svg")
        .attr("class", "chartZTM")
        .attr("viewBox", "0,0," + (width + margin.left + margin.right) + "," + (height + margin.top + margin.bottom))
        .style("z-index", 1)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style("shape-rendering", "crispEdges");

    panel = anchor.append("div")
      .attr("id", "ztm-panel")
      .style("position", "absolute")
      .style("top", options.margin.top + "px")
      .style("right", 0 + "px")
      .style("width", options.panel_width + "px")
      .style("height", height + "px")
      .style("display", "none")
      .style("z-index", 20);

    //var pathButtons = EC.Templates.get("ui-ztm-path-buttons");
    //$(target).append(pathButtons());
    $(".ztm-path-buttons").show();

    back_button = d3.select("#path-button-back")
      .property("disabled", true)
      .on("click", goBack);

    forward_button = d3.select("#path-button-forward")
      .property("disabled", true)
      .on("click", goForward);

    tool_tip = d3.select(target)
      .append("div")
      .attr("class", "tool-tip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("display", "none")
      .style("z-index", 200)
      .style("top", "10px")
      .style("left", "10px");

    var grandparent = svg.append("g")
      .attr("class", "grandparent tm-top");

    grandparent.append("rect")
      .attr("x", 0)
      .attr("y", -options.margin.top)
      .attr("width", width)
      .attr("height", options.margin.top);

    breadcrumbs = anchor.append("div")
      .attr("class", "tm-breadcrumbs")
      .style("width", width)
      .style("height", options.margin.top)
      .style("position", "absolute")
      .style("top", 0)
      .style("z-index", 10)
      .style("color", "#fff");

    // Add additional attributes to the data for building the ZTM
    init(focus);
    layout(focus);

    // Show the root layer
    display(focus);

    function init(d) {
        d.x = 0;
        d.y = 0;
        d.dx = width;
        d.dy = height;
        d.depth = 0;
    }

    function layout(d) {
      if (d._children) {
        treemap.nodes({_children: d._children});
        d._children.forEach(function(c) {
          c.x = d.x + c.x * d.dx;
          c.y = d.y + c.y * d.dy;
          c.dx *= d.dx;
          c.dy *= d.dy;
          c.parent = d;
          layout(c);
        });
      }
    }
  };
  var initBCSize = function() {
    var bc = $(".tm-breadcrumbs");
    BCSize = {
      width: bc.width(),
      height: bc.height(),
      font_size: bc.find(".tm-crumb").first().css("font-size")
    };
  };
  var resizeBC = function() {
    var bc = $(".tm-breadcrumbs");
    $(".tm-crumb").css("font-size", BCSize.font_size);
    if (bc.height() > BCSize.height || bc.css("font-size") != BCSize.font_size) {
      do {
        var s = parseInt($(".tm-crumb").css("font-size"));
        $(".tm-crumb").css("font-size", (s - 1) + "px");
      }
      while ($(".tm-breadcrumbs").height() > BCSize.height);
    }
  };
  var display = function(d) {
    var grandparent = d3.select(".grandparent")
      .datum(d.parent);

    if ($.inArray(d, bc_path) === -1) {
      bc_path.push(d);
    }

    bc_path.splice(bc_path.indexOf(d) + 1, bc_path.length);

    var crumbs = breadcrumbs.selectAll("a").data(bc_path);
    crumbs.enter().append("a")
      .attr("class", "tm-crumb")
      .text(d.name)
      .on("click", function(t, i) {
        if (i < bc_path.length - 1) {
          history_path = bc_path.slice(i + 1, bc_path.length);
          forward_button.property("disabled", false);
          return zoom(t);
        }
        else {
          //clearPanel();
          //showPanel(t.tweets, t.name);
        }
      });
    crumbs.exit().remove();

    crumbs
      .classed("tm-crumb-first", function(t, i) {
        return (i == 0);
      })
      .classed("tm-crumb-last", function(t, i) {
        return (i == bc_path.length - 1 && i > 0);
      });

    if (!BCSize) {
      initBCSize();
    }

    // Make sure everything fits in the breadcrumbs
    resizeBC();

    var depth = svg.insert("g", ".grandparent")
      .datum(d)
      .attr("class", "depth");

    var cell = depth.selectAll("g")
        .data(d._children)
      .enter().append("g");

    cell.filter(function(d) { return d._children; })
      .attr("class", "tm-cell")
      .on("click", function(d) {
        history_path = [];
        forward_button.property("disabled", true);
        zoom(d);
      });

    cell.filter(function(d) { return !d._children; })
      .style("cursor", "pointer")
      .on("click", function(d) {
        //clearPanel();
        //showPanel(d.tweets, d.name);
      });

    cell.selectAll("rect")
        .data(function(d) { return d._children || [d]; })
      .enter().append("rect")
        .attr("class", "tm-rect tm-child")
        .call(makeRect);

    cell.append("rect")
      .attr("class", "tm-rect tm-parent")
      .call(makeRect)
      .on("mouseover", showToolTip)
      .on("mousemove", showToolTip)
      .on("mouseout", function(d) {
        tool_tip.style("display", "none");
      });

    cell.append("text").call(makeText)
      .style("fill-opacity", function(t) {
        var rect_width = x(t.x + t.dx) - x(t.x);
        var rect_height = x(t.y + t.dy) - y(t.y);
        var text_width = $(this).width();
        var text_height = $(this).height();
        return (text_width < rect_width && text_height < rect_height) ? 1 : 0;
      });

    function showToolTip(d) {
      var mouse = d3.mouse(this);
      mouse_x = mouse[0];
      mouse_y = mouse[1];
      tool_tip.html(makeTooltipText(d));
      tool_tip.style("left", function() {
        var tt_width = $(".tool-tip").width();
        return mouse_x + 6 + "px";
      });
      tool_tip.style("top", function() {
        var tt_height = $(".tool-tip").height();
        return mouse_y + 6 + "px";
      });
      tool_tip.style("display", "block");
    }

    function makeTooltipText(d) {
      var more_text = (d.category_count) ? " (" + d.category_count + " more)" : " (Final)";
      var perc = (d.count / tweet_count) * 100;
      return d.name + more_text + "<br>" + d.count + " Tweets / " + perc.toFixed(2) + "%";
    }
    return cell;
  };
  var zoom = function(d) {
    if (transitioning || !d) {
      return false;
    }

    EC.Events.publish('/ZoomTreeMap/zoom', d);
    resizeBC();

    /*
    //clearPanel();

    if (d.parent) {
      x.range([0, width - options.panel_width]);
      panel.style("display", "block");
    }
    else {
      x.range([0, width]);
      //hidePanel();
    }
    */

    transitioning = true;
    focus = d;

    var new_cell = display(d);
    var t1 = d3.select(".depth").transition().duration(500);
    var t2 = new_cell.transition().duration(500);

    x.domain([d.x, d.x + d.dx]);
    y.domain([d.y, d.y + d.dy]);

    new_cell.selectAll("text.tm-label").style("fill-opacity", 0);

    // Transition changes
    t1.selectAll("rect.tm-rect").call(makeRect);
    t2.selectAll("rect.tm-rect").call(makeRect);
    t1.selectAll("text.tm-label").call(makeText).style("fill-opacity", 0);
    t2.selectAll("text.tm-label").call(makeText).style("fill-opacity", function(t) {
      var rect_width = x(t.x + t.dx) - x(t.x);
      var text_width = $(this).width();
      return (text_width < rect_width) ? 1 : 0;
    });

    t1.remove().each("end", function() {
      transitioning = false;
      tool_tip.style("display", "none");
      if (d.parent) {
        //showPanel(d.tweets, d.name);
      }
    });

    if (bc_path.length > 1) {
      back_button.property("disabled", false);
    }
    else {
      back_button.property("disabled", true);
    }

    return true;
  };
  var showPanel = function(tweets, category) {
    var wrapper = panel.append("div")
      .attr("class", "ztm-panel-wrapper")
      .style("height", height + "px")
      .style("padding", "10px")
      .style("overflow-y", "scroll")
      .style("overflow-x", "hidden");
    var tweetDisplay = EC.Templates.get('ui-ztm-tweets');
    $(wrapper.node()).append(tweetDisplay({tweets: tweets, category: category}));
  };
  var hidePanel = function() {
    panel.style("display", "none");
  };
  var clearPanel = function() {
    panel.select("div").remove();
  };
  var goBack = function() {
    if (!transitioning) {
      forward_button.property("disabled", false);
      history_path.unshift(bc_path[bc_path.length - 1]);
      zoom(bc_path[bc_path.length - 2]);
    }
  };
  var goForward = function() {
    if (!transitioning) {
      var current_d = history_path.shift();
      if (history_path.length == 0) {
        forward_button.property("disabled", true);
      }
      zoom(current_d);
    }
  };
  var makeRect = function(rect) {
    rect.attr("x", function(d) { return x(d.x); })
      .attr("y", function(d) { return y(d.y); })
      .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
      .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); })
      .style("fill", function(d) { return EC.Colors.byVertical(d.vertical); });
  };
  var makeText = function(text) {
    text.attr("class", "tm-label")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("x", function(d) {
        var w = x(d.x + d.dx) - x(d.x);
        return x(d.x) + w/2;
      })
      .attr("y", function(d) {
        var h = y(d.y + d.dy) - y(d.y);
        return y(d.y) + h/2;
      })
      .attr("fill", function(d) { return EC.Colors.getContrast(EC.Colors.byVertical(d.vertical)); })
      .text(function(d) {
        var more_text = (d.category_count) ? " (" + d.category_count + " more)" : " (Final)";
        return d.name + more_text;
      });
  };
  var resize = function(width) {
    var height = Math.round( width / options.aspect );
    var margin = options.margin;
    x.range([0, width]);
    y.range([0, height]);

    var depth = d3.select(".depth");
    var new_cell = display(focus);
    var t1 = depth.transition().duration(500);
    var t2 = new_cell.transition().duration(500);

    t2.selectAll("rect.tm-rect").call(makeRect).each("end", function(t) {
      d3.select(".chartZTM")
        .attr("width", width)
        .attr("height", height);
    });
    t1.remove();
  };
  setTarget(t);
  setData(d);
  return {
    build: function() {
      render();
      EC.Events.publish('/Viz/finishedLoading');
    },
    hideAdult: function(b) {
      options.hide_adult = b;
    },
    setWidth: function(v) {
      options.width = v;
    },
    remove: function() {
      bc_path = [];
      d3.select("svg.chartZTM").remove();
      d3.select("div.anchorZTM").remove();
      d3.select(".ztm-path-buttons").remove();
      // reset the data for next time
      setData(original_data);
    },
    refresh: function() {
      this.remove();
      this.build();
    },
    resize: function(w) {
      return resize(w);
    },
    type: "ZoomTreeMap"
  };
};

EC.CVT = function(t,d) {
  var options = {
    width: 500,
    height: 500,
    sites: 20,
    hideAdult: true,
    fontSizes: [12, 32]
  };
  var zoomLevel = 0;
  var target = t;
  var originalData = d;
  var data = d;
  var vertices;
  var savedSVG;
  var voronoi;
  var formatLabelTextWithCount = function(text, count) {
    var countText;
    var verbs = ['&', 'and', 'in', 'for', 'of', 'the'];
    // Get the label text into a nice three line format
    var parts = text.split(' ');
    var outs = [];
    var lineCount = 0;
    parts.forEach(function(d) {
      if (lineCount > 3) {
        outs[outs.length - 1] += ' ' + d;
      }
      else if (verbs.indexOf(d) !== -1) {
        outs[outs.length - 1] += ' ' + d;
      }
      else {
        outs.push(d);
        lineCount++;
      }
    });
    // Format the tweet count
    countText = '<span class="panel-site-count">+' + count + '</span>';
    return outs.join('</br>') + countText;
  };
  var createPolygon = function(d) {
    return "M" + d.vertices.join("L") + "Z";
  };
  var createVerticesData = function(data, relaxers) {
    // define the voronoi algorithm
    voronoi = d3.geom.voronoi()
        .clipExtent([[0, 0], [options.width, options.height]]);
    // generate vertices and use Lloyd's relaxtion algorithm
    vertices = d3.range(data.length).map(function(d) {
      return [Math.random() * options.width, Math.random() * options.height];
    });
    for (var i = 0; i < relaxers; i++) {
      relax();
    }
    // determine areas and vertices
    var sites = [];
    var cells = voronoi(vertices);
    for (var i = 0; i < cells.length; ++i) {
      var cell = cells[i];
      var site = {
        area: d3.geom.polygon(cell).area(),
        vertices: cell,
        centroid: d3.geom.polygon(cell).centroid()
      };
      sites.push(site);
    }
    // sort by largest area to smallest
    sites.sort(function(a,b) {
      return b.area - a.area;
    });
    // join the vertices to the data
    data.forEach(function(d, i) {
      var bounds = polygonBoundingRect(sites[i].vertices);
      d.area = sites[i].area;
      d.vertices = sites[i].vertices;
      d.centroid = sites[i].centroid;
      d.width = bounds.width;
      d.height = bounds.height;
      d.top = bounds.top;
      d.left = bounds.left;
      d.relativeCentroid = [
        d.centroid[0] - bounds.left,
        d.centroid[1] - bounds.top
      ];
    });
    return data;
  };
  var relax = function() {
    var cells = voronoi(vertices);
    for (var i = 0, n = cells.length; i < n; ++i) {
      var cell = cells[i];
      if (cell == null) continue;

      var area = d3.geom.polygon(cell).area(),
          centroid = cell.centroid(-1 / (6 * area)),
          vertex = vertices[i],
          δx = centroid[0] - vertex[0],
          δy = centroid[1] - vertex[1];
      vertex[0] += δx, vertex[1] += δy;
    }
  };
  var polygonBoundingRect = function(verts) {
    var xPoints = verts.map(function(d) {
      return d[0];
    });
    var yPoints = verts.map(function(d) {
      return d[1];
    });
    return {
      top: d3.min(yPoints),
      left: d3.min(xPoints),
      height: d3.max(yPoints) - d3.min(yPoints),
      width: d3.max(xPoints) - d3.min(xPoints)
    };
  };
  var render = function() {
    // Sort by count
    data.sort(function(a,b) {
      return b.count - a.count;
    });
    // Filter out adult categories if option selected
    if (options.hideAdult) {
      data = data.filter(function(d) {
        return d.vertical !== "Adult Content";
      });
    }
    var fontScale = d3.scale.linear()
      .domain(d3.extent(data.map(function(d) {
        return d.count;
      })))
      .rangeRound(options.fontSizes);
    var vertData = createVerticesData(data.slice(0,options.sites), 3);
    // draw the canvas (svg)
    var svg = d3.select(target).append("svg")
        .attr("width", options.width)
        .attr("height", options.height)
        .attr("id", "chartCVT");
    // add radial gradient definitions
    $(svg.node()).append(EC.Gradients.Radial());
    // draw the treemap
    var path = svg.append("g").selectAll("path");
    path = path
        .data(vertData, createPolygon);
    path.exit().remove();
    path.enter().append("path")
        .attr("d", createPolygon)
        .attr("id", function(d,i) {
          return "path-" + i;
        })
        .attr("fill", function(d) {
          return "url(#" + EC.stripSpaces(d.vertical) + "Radial)";
        })
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 5)
        .style("cursor", "pointer")
        .on("click", function(d) {
          if (zoomLevel > 0) {
            EC.Events.publish('/CVT/clickSub', d);
          }
          else {
            EC.Events.publish('/CVT/click', d);
          }
        })
        .on("mouseover", function(d,i) {
          d.index = i;
          EC.Events.publish('/CVT/mouseOver', d);
        })
        .on("mouseout", function(d,i) {
          d.index = i;
          EC.Events.publish('/CVT/mouseOut', d);
        });
    path.order();
    // draw the text labels
    var labelContainers = svg.select("g").selectAll("foreignObject");
    labelContainers.data(vertData)
      .enter().append("foreignObject")
        .attr("x", function(d) {
          return d.left;
        })
        .attr("y", function(d) {
          return d.top;
        })
        .attr("width", function(d) {
          return d.width;
        })
        .attr("height", function(d) {
          return d.height;
        })
        .style("pointer-events", "none")
        .append("xhtml:div")
          .attr("id", function(d,i) {
            return "label-" + i;
          })
          .style("height", function(d) {
            var yMiddle = d.height / 2;
            var yDiff = yMiddle - d.relativeCentroid[1];
            return d.height - yDiff + "px";
          })
          .style("width", function(d) {
            var xMiddle = d.width / 2;
            var xDiff = xMiddle - d.relativeCentroid[0];
            return d.width - xDiff + "px";
          })
          .style("font-weight", "normal")
          .style("font-family", "Arial")
          .style("line-height", 1)
          .style("display", "table-cell")
          .style("vertical-align", "middle")
          .style("text-align", "center")
          .style("font-size", function(d) {
            if (data.length == 1) {
              return d3.max(options.fontSizes) + "px";
            }
            var lbl = formatLabelTextWithCount(d.name, d.count);
            return EC.fontSizeForDimensions(lbl, d.width, d.height, fontScale(d.count)) + "px";
          })
          .html(function(d) {
            return formatLabelTextWithCount(d.name, d.count);
          });
    // save the zoom level 0
    if (zoomLevel == 0) {
      savedSVG = $("#chartCVT");
    }
  };
  return {
    setWidth: function(v) {
      options.width = parseInt(v);
    },
    setHeight: function(v) {
      options.height = parseInt(v);
    },
    setOption: function(n,v) {
      options[n] = v;
    },
    data: function(d) {
      data = d;
    },
    build: function() {
      return render();
    },
    hideAdult: function(b) {
      options.hideAdult = b;
    },
    rebuild: function(d) {
      this.data(originalData);
      zoomLevel = 0;
      this.update();
    },
    update: function() {
      d3.select("#chartCVT").remove();
      return render();
    },
    zoomIn: function(d) {
      zoomLevel = 1;
      this.data(d);
      this.update();
    },
    zoomOut: function() {
      zoomLevel = 0;
      d3.select("#chartCVT").remove();
      $(t).append(savedSVG);
    },
    remove: function() {
      d3.select("#chartCVT").remove();
    },
    refresh: function() {
      this.build();
    },
    type: "CVT"
  };
}

EC.Bubbles = function(t, d) {
  // set the options here
  var options = {
    aspect: 21/9,
    width: 940,
    height: 0,
    margin: { top : 0, right : 0, bottom : 0, left : 0 },
    limit: 40,
    nodeText: "#ffffff",
    nodeTextHover: "#000000",
    nodeTextBlur: "#cccccc",
    nodeBlurFill: "#ebebeb",
    nodeBlurStroke: "#ebebeb",
    nodeHoverFill: "#cfffff",
    nodeHoverStroke: "#9effff",
    maxRadius: 1,
    collisionPadding: 15,
    minCollisionRadius: 13,
    jitter: 0.5,
    currentDepth: 4,
    sizeVar: "count",
    showTweets: true,
    hideRetweets: true,
    hideAdult: true,
    tweetLimit: 10,
    multipleUsers: false,
    userSelected: null,
    fixedCenterNode: true,
    showPager: false,
    dynamicSizing: true,
    customShowTweets: false
  };
  var depthNames = {
    1: "vertical",
    2: "secondary",
    3: "tertiary",
    4: "name"
  };
  var nodeSelected = false;
  var pieSelected = false;
  var target = null;
  var rawData = null;
  var data = null;
  var countSum = null;
  var force = null;
  var rScale = null;
  var colorArc;
  var subscribers = [];
  var currentNodeOffset = 0;
  var nodeCount = 0;
  var areaScale = null;
  var svgArea = null;
  var tweet_categories = [];
  var display = "frequent";
  var pager_label = null;
  var rValue = function(d) {
    return parseFloat(d[options.sizeVar]);
  };
  var idValue = function(d) {
    return d.name;
  };
  var textValue = function(d) {
    return d.name;
  };
  var groupValue = function(d) {
    return d.vertical;
  };
  var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) {
      return d.count;
    });
  var arc = d3.svg.arc();
  var gravity = function(alpha) {
    var ax, ay, cx, cy;
    cx = options.width / 2;
    cy = options.height / 2;
    ax = alpha / 8;
    ay = alpha;
    return function(d) {
      d.x += (cx - d.x) * ax;
      return d.y += (cy - d.y) * ay;
    };
  };
  var stripSpaces = function(str) {
    return str.replace(/[\s]|&/g,'');
  };
  var tick = function(e) {
    var dampenedAlpha;
    dampenedAlpha = e.alpha * 0.1;
    nodes.each(gravity(dampenedAlpha))
      .each(collide(options.jitter))
      .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
      });
    return label.style("left", function(d) {
      return ((options.margin.left + d.x) - d.dx / 2) + "px";
    }).style("top", function(d) {
      return ((options.margin.top + d.y) - d.dy / 2) + "px";
    });
  };
  var collide = function(jitter) {
    return function(d) {
      return data.forEach(function(d2) {
        var distance, minDistance, moveX, moveY, x, y;
        if (d !== d2) {
          x = d.x - d2.x;
          y = d.y - d2.y;
          distance = Math.sqrt(x * x + y * y);
          minDistance = d.forceR + d2.forceR + options.collisionPadding;
          if (distance < minDistance) {
            distance = (distance - minDistance) / distance * options.jitter;
            moveX = x * distance;
            moveY = y * distance;
            d.x -= moveX;
            d.y -= moveY;
            d2.x += moveX;
            return d2.y += moveY;
          }
        }
      });
    };
  };
  var groupByTiers = function(tier, data) {
    // Group the data by tier level
    var nested = d3.nest()
    .key(function(d) {
      return d[tier];
    })
    .entries(data);

    // Map the grouped data to useful objects for our chart
    return nested.map(function(d) {
      var name = d.key;
      var nodes = d.values;
      var vertical = d.values[0].vertical;
      var count = d3.sum(nodes, function(n) {
        return n.count;
      });
      var tweets = [];
      var counts_list = [];
      if (nodes[0].tweets) {
        nodes.forEach(function(n) {
          n.tweets.forEach(function(t) {
            tweets.push(t);
          });
          if (n.counts_list) {
            n.counts_list.forEach(function (c) {
              counts_list.push(c);
            });
          }
        });
      }
      var nested_counts = d3.nest()
        .key(function(d) { return d.id; })
        .rollup(function(l) {
          return {
            id: l[0].id,
            count: d3.sum(l, function(c) {
              return c.count;
            })
          };
        })
        .entries(counts_list);
      counts_list = nested_counts.map(function(d) {
        return d.values;
      });
      return {
        name: name,
        vertical: vertical,
        path: [name],
        tweets: tweets,
        counts_list: counts_list,
        count: count
      };
    });
  };
  var groupByDay = function(data) {
    return d3.nest()
      .key(function(d) {
        var date = new Date(d.created_at);
        var year = date.getFullYear();
        var month = (date.getMonth() + 1);
        if (month < 10) {
          month = '0' + month;
        }
        var day = (date.getDate() < 10) ? '0' + date.getDate() : date.getDate();
        return year + '-' + month + '-' + day;
      })
      .sortKeys(d3.descending)
      .key(function(d) {
        if (options.currentDepth == 4) {
          return d.category_name;
        }
        else {
          return d[depthNames[options.currentDepth]];
        }
      })
      .entries(data);
  };
  var groupByHour = function(data) {
    return d3.nest()
      .key(function(d) {
        var date = new Date(d.created_at);
        var year = date.getFullYear();
        var month = (date.getMonth() + 1);
        if (month < 10) {
          month = '0' + month;
        }
        var day = (date.getDate() < 10) ? '0' + date.getDate() : date.getDate();
        var hour = date.getHours();
        if (hour < 10) {
          hour = '0' + hour;
        }
        return year + '-' + month + '-' + day + ' ' + hour + ':00:00';
      })
      .sortKeys(d3.descending)
      .key(function(d) {
        if (options.currentDepth == 4) {
          return d.category_name;
        }
        else {
          return d[depthNames[options.currentDepth]];
        }
      })
      .entries(data);
  };
  var groupByMonth = function(data) {
    return d3.nest()
      .key(function(d) {
        var date = new Date(d.created_at);
        var year = date.getFullYear();
        var month = (date.getMonth() + 1);
        if (month < 10) {
          month = '0' + month;
        }
        var day = (date.getDate() < 10) ? '0' + date.getDate() : date.getDate();
        return year + '-' + month;
      })
      .sortKeys(d3.descending)
      .key(function(d) {
        if (options.currentDepth == 4) {
          return d.category_name;
        }
        else {
          return d[depthNames[options.currentDepth]];
        }
      })
      .entries(data);
  };
  var groupByWeek = function(data) {
    return d3.nest()
      .key(function(d) {
        var date = new Date(d.created_at);
        var year = date.getFullYear();
        var jan_one = new Date(year, 0, 1);
        var week_num = Math.ceil((((date - jan_one) / 86400000) + jan_one.getDay()+1)/7);
        if (week_num < 10) {
          week_num = '0' + week_num;
        }
        return year + ' ' + 'Week ' + week_num;
      })
      .sortKeys(d3.descending)
      .key(function(d) {
        if (options.currentDepth == 4) {
          return d.category_name;
        }
        else {
          return d[depthNames[options.currentDepth]];
        }
      })
      .entries(data);
  };
  var processDataByTime = function() {
    var filtered = tweet_categories.filter(function(d) {
      if (options.hideAdult && d.vertical == "Adult Content") {
        return false;
      }
      return true;
    });
    switch(display) {
      case 'month':
        var nested = groupByMonth(filtered);
        break;
      case 'hour':
        var nested = groupByHour(filtered);
        break;
      case 'week':
        var nested = groupByWeek(filtered);
        break;
      case 'day':
      default:
        var nested = groupByDay(filtered);
    }
    // populate nodeCount
    nodeCount = nested.length;
    // select the current period of data
    var current_data = nested[currentNodeOffset];
    // set pager label
    pager_label = current_data.key;
    // build new data set
    var new_data = [];
    current_data.values.forEach(function(d) {
      var path = (options.currentDepth == 4) ? d.values[0].path : [d.key];
      var tweets = [];
      d.values.forEach(function(t) {
        tweets.push({
          created_at: t.created_at,
          entities: t.entities,
          favorite_count: t.favorite_count,
          followers_count: t.followers_count,
          friends_count: t.friends_count,
          has_adult_content: t.has_adult_content,
          id: t.id,
          location: t.location,
          name: t.user_name,
          profile_pic: t.profile_pic,
          query: t.query,
          retweet_count: t.retweet_count,
          retweeted: t.retweeted,
          screen_name: t.screen_name,
          text: t.text,
          user_id: t.user_id,
          verified: t.verified,
        });
      });
      // make sure fixed is not set
      if (d.fixed) {
        delete d.fixed;
        delete d.px;
        delete d.py;
      }
      new_data.push({
        name: d.key,
        path: path,
        vertical: d.values[0].vertical,
        count: d.values.length,
        tweets: tweets
      });
    });
    // set the sum of counts
    countSum = new_data.map(function(d) {
      return parseInt(d.count);
    }).reduce(function(a, b) {
      return a + b;
    });
    new_data = new_data.slice(0, options.limit);
    return new_data;
  };
  var processData = function(data) {
    // populate nodeCount
    nodeCount = data.length;
    // sort the initial data by count
    var sorted = data.sort(function(a,b) {
      return b.count - a.count;
    });
    var processed = sorted.filter(function(d) {
      // make sure fixed is not set
      if (d.fixed) {
        delete d.fixed;
        delete d.px;
        delete d.py;
      }
      if (options.hideAdult && d.vertical == "Adult Content") {
        return false;
      }
      return (d[depthNames[options.currentDepth]] != null);
    });
    var start_index = (currentNodeOffset * options.limit);
    var end_index = start_index + options.limit;
    var newData = processed.slice(start_index, end_index);
    if (options.currentDepth != 4) {
      newData = groupByTiers(depthNames[options.currentDepth], newData);
    }
    // set the sum of counts
    countSum = newData.map(function(d) {
      return parseInt(d.count);
    }).reduce(function(a, b) {
      return a + b;
    }, 0);
    return newData;
  };
  var nodeTextWidth = function(radius) {
    var hypoten = Math.pow(radius * 2, 2);
    return Math.sqrt(hypoten / 2);
  };
  var render = function() {
    // clear selected nodes
    nodeSelected = false;

    // clear the stage
    d3.selectAll("svg.chartSVG, #bubble-labels").remove();

    // clear the pager
    $('.bubble-node-pager').remove();

    // set and make the category data ready
    if (display == 'frequent') {
      data = processData(rawData.categories);
    }
    else {
      data = processDataByTime();
    }

    var gravity = (options.height > options.width)
      ? 0.50
      : 0.01;
    var areaMultiplier = (options.height > options.width)
      ? 0.25
      : 0.75;

    // initialize dynamic vars
    if (options.dynamicSizing) {
      options.height = Math.round( options.width / options.aspect );
    }
    force = d3.layout.force().gravity(gravity).charge(0).size([ options.width, options.height ]).on("tick", tick);

    // draw canvas area
    svgArea = (options.height * options.height) * areaMultiplier;
    var variance = d3.variance(data, function(d) { return d.count; }) || 0;
    var multiplier = (variance < 1) ? 1/data.length : .005;
    areaScale = d3.scale.linear().domain([1,countSum]).range([svgArea * multiplier,svgArea]);
    rScale = function(v) {
      return Math.sqrt(areaScale(v) / Math.PI);
    };

    var searchQueries = rawData.queries || rawData.users || rawData.query_list;
    var test = searchQueries.map(function(d) {
      return d.query || d.screen_name;
    });
    colorArc = d3.scale.ordinal().domain(searchQueries.map(function(d) {
      return d.query || d.screen_name;
    })).range(EC.Colors.getUserColors());

    s = d3.select(target).append("svg").data([data]);
    s.attr("viewBox", "0,0," + options.width + "," + options.height)
      .attr("class", "chartSVG");;

    // append the gradient definitions
    var defs = s.append("defs");
    // append the radial gradients
    var grads = defs.selectAll("radialGradient")
        .data(EC.Colors.colorsList()).enter()
      .append("radialGradient")
        .attr("id", function(d) {
          return stripSpaces(d.vertical);
        });
    grads.append("stop")
      .attr("offset", "30%")
      .attr("stop-color", function(d) {
        return EC.Colors.byVertical(d.vertical);
      })
      .attr("stop-opacity", .7);
    grads.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", function(d) {
        return EC.Colors.byVertical(d.vertical);
      })
      .attr("stop-opacity", 1);
    // append an overlay def
    var overlay = defs.append("radialGradient")
      .attr("id", "overlay");
    overlay.append("stop")
      .attr("offset", "35%")
      .attr("stop-color", "#ffffff")
      .attr("stop-opacity", .25);
    overlay.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ffffff")
      .attr("stop-opacity", 0);
    // append an overlayHover
    var overlayHover = defs.append("radialGradient")
      .attr("id", "overlayHover");
    overlayHover.append("stop")
      .attr("offset", "35%")
      .attr("stop-color", "#ffffff")
      .attr("stop-opacity", .75);
    overlayHover.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ffffff")
      .attr("stop-opacity", .25);

    // set up the stage
    node = s.append("g")
      .attr("id", "bubble-nodes")
      .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");
    node.append("rect")
      .attr("id", "bubble-background")
      .attr("width", options.width)
      .attr("height", options.height)
      .style("fill", "white")
      .on("click", deselectNodes);
    label = d3.select(target).selectAll("#bubble-labels")
        .data([data]).enter()
      .append("div")
        .attr("id", "bubble-labels");
    updateChart(data);

    // publish the event
    EC.Events.publish('/Bubbles/render');
  };
  var updateChart = function(data) {
    data.forEach(function(d, i) {
      if (i == 0 && options.fixedCenterNode) {
        // these are used to always center the largest node
        d.px = options.width / 2;
        d.py = options.height / 2;
        d.fixed = true;
      }
      d.nodeState = "normal";
      d.forceR = Math.max(options.minCollisionRadius, rScale(rValue(d)));
    });
    force.nodes(data).start();
    updateNodes(data);
    if (options.showPager) {
      drawPager(data);
    }
  };
  var drawPager = function(data) {
    var current_page = currentNodeOffset + 1;
    var next_page = current_page + 1;
    var prev_page = current_page - 1;
    var total_pages = (display == 'frequent') ? Math.ceil(nodeCount / options.limit) : nodeCount;
    var info = {
      current_page: current_page,
      next_page: next_page,
      prev_page: prev_page,
      total_pages: total_pages,
      first_node: (currentNodeOffset * options.limit) + 1,
      last_node: (current_page == total_pages) ? nodeCount : (current_page * options.limit),
      has_next: (current_page < total_pages),
      has_prev: (current_page > 1),
      has_separator: (current_page < total_pages && current_page > 1),
      pager_label: (pager_label) ? pager_label : null
    };
  };
  var drawPieNodes = function(nodes) {
    // draw the pie nodes
    nodes.enter().append("a")
      .attr("class", "bubble-node")
      .style("cursor", "pointer");

    var g = nodes.selectAll(".bubble-node")
        .data(function(d) {
          var pieData = pie(d.counts_list);
          pieData.forEach(function(n) {
            n.outerRadius = rScale(rValue(d)) + 5;
            n.innerRadius = 0;
          });
          return pieData;
        })
      .enter().append("g")
        .attr("class", "arc")
        .append("path")
          .attr("d", arc)
          .style("fill", function(d,i) {
            return colorArc(d.data.id);
          });
    d3.selectAll(".bubble-node")
      .append("circle")
        .attr("r", function(d) {
          return rScale(rValue(d)) + 5;
        })
        .attr("fill", "url(#overlay)");
  };
  var drawCircleNodes = function(nodes) {
    // draw the nodes (bubbles)
    nodes.enter().append("a")
      .attr("class", "bubble-node")
      .style("cursor", "pointer")
      .append("circle")
        .attr("fill", function(d) {
            return "url(#" + stripSpaces(d.vertical) + ")";
        })
        .attr("r", function(d) {
          return rScale(rValue(d)) + 5;
        })
        .attr("stroke", function(d) {
          return EC.Colors.byVertical(d.vertical);
        })
        .attr("stroke-width", 2);
  };
  var updateNodes = function(data) {
    nodes = node.selectAll(".bubble-node").data(data, function(d) {
      return idValue(d);
    });

    if (options.multipleUsers) {
      drawPieNodes(nodes);
    }
    else {
      drawCircleNodes(nodes);
    }
    // throw the whole beautiful mess into a force layout
    // and go ahead and assign bindings
    nodes.call(force.drag).call(connectEvents);

    // create the text labels using xhtml inside svg
    nodes.append("foreignObject")
      .attr("x", function(d) {
        return -rScale(rValue(d));
      })
      .attr("y", function(d) {
        return -rScale(rValue(d));
      })
      .attr("width", function(d) {
        return rScale(rValue(d)) * 2;
      })
      .attr("height", function(d) {
        return rScale(rValue(d)) * 2;
      })
      .append("xhtml:div")
        .attr("class", "node-text-container")
        .style("background", "transparent")
        .style("height", function(d) {
          return rScale(rValue(d)) * 2 + "px";
        })
        .style("width", function(d) {
          return rScale(rValue(d)) * 2 + "px";
        })
        .style("line-height", function(d) {
          return rScale(rValue(d)) * 2 + "px";
        })
        .style("padding", function(d) {
          var padding = Math.floor(rScale(rValue(d)) / 4);
          return "0px " + padding + "px 0px " + padding + "px";
        })
        .style("text-align", "center")
        .append("span").attr("class", "bubble-label-name")
          .style("display", "inline-block")
          .style("vertical-align", "middle")
          .style("font-family", "Arial")
          .style("line-height", "normal")
          .style("color", function(d) {
            if (options.multipleUsers) {
              if (options.useDonuts) {
                return EC.Colors.getContrast(EC.Colors.byVertical(d.vertical));
              }
              return "#FFFFFF";
            }
            return EC.Colors.getContrast(EC.Colors.byVertical(d.vertical));
          })
          .style("font-size", function(d) {
            return Math.max(8, rScale(rValue(d)) / 3) + "px";
          })
          .text(function(d) {
            return textValue(d);
          })
      .call(force.drag);

    // remove nodes when data set changes
    nodes.exit().remove();
  };
  var connectEvents = function(d) {
    d.on("click", click);
    d.on("mouseover", mouseover);
    d.on("mouseout", mouseout);
  };
  var deselectNodes = function() {
    nodeSelected = false;
    var nodes = d3.selectAll(".bubble-node circle");
    var texts = d3.selectAll(".bubble-label-name");

    nodes.attr("fill", function(n) {
      if (options.multipleUsers) {
        return "url(#overlay)";
      }
      return "url(#" + stripSpaces(n.vertical) + ")";
    })
    .attr("stroke", function(n) {
      if (options.multipleUsers) {
        return "none";
      }
      return EC.Colors.byVertical(n.vertical);
    });
    texts.style("color", function(n) {
      if (options.multipleUsers) {
        return "#ffffff";
      }
      return EC.Colors.getContrast(EC.Colors.byVertical(n.vertical));
    });

    // if multiple users, recolor the arcs
    if (options.multipleUsers) {
      deselectPie();
    }

    // publish the event
    EC.Events.publish('/Bubbles/deselectNodes');
  };
  var click = function(d) {
    EC.Events.publish('/Bubbles/clickNode', d);
    if (options.customShowTweets) {
      return true;
    }
    nodeSelected = d;
    var nodes = d3.selectAll(".bubble-node circle").filter(function(n) { return n !== d; });
    var texts = d3.selectAll(".bubble-label-name").filter(function(n) { return n !== d; });

    nodes.attr("fill", options.nodeBlurFill)
      .attr("stroke", options.nodeBlurStroke);
    texts.style("color", options.nodeTextBlur);

    if (options.showTweets) {
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
      // render the tweets
      showTweets(d.tweets, "showTweets");
      d3.event.stopImmediatePropagation();
    }
    return showCategory(d);
  };
  // displays tweets
  var showTweets = function(d, element) {
    var selectedTweets;
    // Filter out tweets if multiple is selected
    d3.selectAll(".twitter-user-multiple").each(function(n) {
      if (n.selected) {
        selectedTweets = d.filter(function(d) {
          if (d.query) {
            return d.query == n.query;
          }
          else if (d.screen_name) {
            return d.screen_name == n.screen_name;
          }
        });
      }
    });
    if (!selectedTweets) {
      selectedTweets = d;
    }
    // Filter out retweets
    var tweets = selectedTweets.filter(function(n) {
      return n.retweeted === false;
    });
    // If there are no tweets, then grab one retweet
    if (tweets.length == 0) {
      tweets = [selectedTweets[0]];
    }
    // Remove adult tweets if Hide Adult is checked
    if (options.hideAdult) {
      return false;
      tweets = tweets.filter(function(d) {
        return d.has_adult_content === false;
      });
    }
    // Sort by verified
    tweets = tweets.sort(function(a,b) {
      return b.verified - a.verified;
    });
    // Remove any dupes
    var uniqueTweetIds = [];
    var dedupedTweets = [];
    tweets.forEach(function(t) {
      if ($.inArray(t.id, uniqueTweetIds) === -1) {
        uniqueTweetIds.push(t.id);
        dedupedTweets.push(t);
      }
    });
    tweets = dedupedTweets;
    var tweetsDisplay = EC.Templates.get('ui-tweet-horizontal');
    $("#showTweets").append(tweetsDisplay({tweets_list: tweets.slice(0, options.tweetLimit)}));
		$("html, body").animate({
			scrollTop: $("#showTweets").offset().top
		}, 500);
  };
  var clickPie = function(d) {
    nodeSelected = false;
    pieSelected = d;
    d3.selectAll(".bubble-node circle")
      .attr("fill", "url(#overlay)");
    d3.selectAll(".arc path")
      .style("fill", function(n) {
        if (n.data.id === d.screen_name || n.data.id === d.query) {
          return EC.Colors.color(d.index);
        }
        else {
          return options.nodeBlurFill;
        }
      });
    d3.selectAll(".bubble-label-name")
      .style("color", "#000000");
  };
  var deselectPie = function() {
    nodeSelected = false;
    pieSelected = false;
    d3.selectAll(".bubble-node circle")
      .attr("fill", "url(#overlay)");
    d3.selectAll(".arc path")
      .style("fill", function(n) {
        return colorArc(n.data.id);
      });
    d3.selectAll(".bubble-label-name")
      .style("color", "#ffffff");
  };
  var attachCategoryElement = function(text, className, vertical) {
    var elem = document.createElement("div");
    if (typeof className !== "undefined") {
      elem.className = className;
    }
    if (typeof vertical !== "undefined") {
      $(elem).css("border-left-color", EC.Colors.byVertical(d.vertical));
    }
    $(elem).append(document.createTextNode(text));
    return elem;
  };
  var showCategory = function(d) {
    var status = $("#ecw-status");
    // clear old categories
    status.html('<span class="label">Category</span>' + d.path.slice(0,4).join(' :: '));
  };
  var mouseover = function(d) {
    var node = d3.selectAll(".bubble-node circle").filter(function(n) { return n === d; });
    var text = d3.selectAll(".bubble-label-name").filter(function(n) { return n === d; });

    node.attr("fill", function() {
        if (options.multipleUsers) {
          return "url(#overlayHover)";
        }
        return options.nodeHoverFill;
      })
      .attr("stroke", options.nodeHoverStroke);

    text.style("color", options.nodeTextHover);
  };
  var mouseout = function(d) {
    var node = d3.selectAll(".bubble-node circle").filter(function(n) { return n === d; });
    var text = d3.selectAll(".bubble-label-name").filter(function(n) { return n === d; });

    if (!nodeSelected || nodeSelected === d) {
      node.attr("fill", function() {
          if (options.multipleUsers) {
            return "url(#overlay)";
          }
          return "url(#" + stripSpaces(d.vertical) + ")";
        })
        .attr("stroke", function() {
          if (options.multipleUsers) {
            return "none";
          }
          return EC.Colors.byVertical(d.vertical);
        });
      text.style("color", function() {
        if (options.multipleUsers) {
          return (pieSelected) ? "#000000" : "#ffffff";
        }
        return EC.Colors.getContrast(EC.Colors.byVertical(d.vertical));
      });
    }
    else {
      node.attr("fill", options.nodeBlurFill)
        .attr("stroke", options.nodeBlurStroke);
      text.style("color", options.nodeTextBlur);
    }
  };
  var setTarget = function(t) {
    target = t;
  };
  var setData = function(d) {
    rawData = d;
    d.categories.forEach(function(n) {
      n.tweets.forEach(function(t) {
        tweet_categories.push({
          category_name: n.name,
          entities: t.entities,
          path: n.path,
          vertical: n.vertical,
          secondary: n.secondary,
          tertiary: n.tertiary,
          created_at: t.created_at,
          id: t.id,
          user_name: t.name,
          screen_name: t.screen_name,
          profile_pic: t.profile_pic,
          text: t.text,
          user_id: t.user_id,
          favorite_count: t.favorite_count,
          followers_count: t.followers_count,
          friends_count: t.friends_count,
          has_adult_content: t.has_adult_content,
          location: t.location,
          query: t.query,
          retweet_count: t.retweet_count,
          retweeted: t.retweeted,
          verified: t.verified
        });
      });
    });
  };
  // initializers
  if (typeof t !== 'undefined') {
    setTarget(t);
  }
  if (typeof d !== 'undefined') {
    setData(d);
  }
  // return the public object
  return {
    setOptions: function(d) {
      for(var n in d) {
        options[n] = d[n];
      }
      return options;
    },
    selectUser: function(u) {
      this.setOptions(
        {
          multipleUsers: true,
          userSelected: u
        }
      );
    },
    data: function(d) {
      rawData = d;
    },
    connectEvents: function() {
      return connectEvents;
    },
    attach: function(t) {
      target = t;
    },
    getTarget: function() {
      return target;
    },
    getData: function() {
      return rawData;
    },
    setWidth: function(v) {
      options.width = v;
    },
    setLimit: function(v) {
      options.limit = v;
    },
    setDepth: function(v) {
      options.currentDepth = v;
    },
    build: function() {
      self = this;
      render();
      EC.Events.publish('/Viz/finishedLoading');
    },
    hideAdult: function(b) {
      options.hideAdult = b;
    },
    refresh: function() {
      currentNodeOffset = 0;
      this.build();
    },
    switchToPeriod: function(period) {
      display = period;
      pager_label = null;
      this.refresh();
    },
    clickPie: function(d) {
      clickPie(d);
    },
    deselectPie: function() {
      deselectPie();
    },
    deselectNodes: function() {
      deselectNodes();
    },
    remove: function() {
      d3.selectAll("svg.chartSVG, #bubble-labels").remove();
    },
    type: "Bubbles"
  }
};

EC.StreamGraph = function(t, d) {
  var target = null;
  var raw_data = null;
  var days_between, seconds_between, x, y, tweet_count, group_by, anchor, wrapper_sg, wrapper_sm, svg, panel, tool_tip, back_button;
  var tweets = [];
  var root_tweets = [];
  var tweet_categories = [];
  var date_range = [];
  var chart_type = "streamgraph";
  var category_count = 0;
  var layer_is_selected = false;
  var sort_option = "frequency";
  var vertical_counts = {};
  var options = {
    aspect: 21/9,
    width: 940,
    height: 500,
    margin: { top: 20, right: 60, bottom: 30, left: 60 },
    currentDepth: 4,
    limit: 80,
    chart_spacing: 70,
    hideAdult: true,
    panel_width: 300
  };
  var depthNames = {
    1: "vertical",
    2: "secondary",
    3: "tertiary",
    4: "category_name"
  };
  var timeScale = function() {
    switch(group_by) {
      case "minute":
        return d3.time.minutes;
        break;
      case "hour":
        return d3.time.hours;
        break;
      case "day":
        return d3.time.days;
        break;
      case "week":
        return d3.time.weeks;
        break;
      case "month":
      default:
        return d3.time.months;
        break;
    }
  };
  var groupByTime = function(data) {
    var nested = d3.nest()
      .key(function(d) {
        return d[group_by];
      })
      .sortKeys(d3.ascending)
      .key(function(d) {
        return d[depthNames[options.currentDepth]];
      })
      .entries(data);
    return nested;
  };
  var singleRows = function(data) {
    var rows = [];
    if (options.hideAdult) {
      data = data.filter(function(d) {
        return !d.has_adult_content;
      });
    }
    var grouped = groupByTime(data);
    date_range = d3.extent(grouped, function(d) {
      return new Date(d.key);
    });
    grouped.forEach(function(d) {
      d.values.forEach(function(v) {
        rows.push({
          name: v.key,
          count: v.values.length,
          date: new Date(d.key),
          vertical: v.values[0].vertical
        });
      });
    });
    rows.sort(function(a,b) {
      return a.date.getTime() - b.date.getTime();
    });
    // Calculate the tweet count (total in all categories even though they may be duplicates)
    tweet_count = rows.reduce(function(p, v, i) {
      var prev_value = (i == 1) ? p.count : p;
      return prev_value + v.count;
    });
    return rows;
  };
  var normalizeData = function(data) {
    var interval = d3.time[group_by].utc.range(date_range[0], date_range[1]);
    interval.push(date_range[1]);
    var days = d3.time.day.utc.range(d3.time.day.utc.floor(date_range[0]), d3.time.day.utc.floor(date_range[1]));
    data.sort(function(a,b) {
      return b.values.length - a.values.length;
    });
    data.forEach(function(d) {
      var name = d.values[0].name;
      var vertical = d.values[0].vertical;
      var date_ids = d.values.map(function(i) {
        return i.date.getTime();
      });
      interval.forEach(function(t) {
        if ($.inArray(t.getTime(), date_ids) == -1) {
          d.values.push({
            name: name,
            count: 0,
            date: t,
            vertical: vertical
          });
        }
      });
      d.values.sort(function(a,b) {
        return a.date.getTime() - b.date.getTime();
      });
    });
    return data;
  };
  var limitData = function(data) {
    var grouped = d3.nest()
      .key(function(d) {
        return d[depthNames[options.currentDepth]];
      })
      .entries(data);
    grouped.sort(function(a,b) {
      return b.values.length - a.values.length;
    });
    var keep = grouped.slice(0, options.limit).map(function(d) {
      return d.key;
    });
    return tweet_categories.filter(function(d) {
      if ($.inArray(d[depthNames[options.currentDepth]], keep) > -1) {
        return true;
      }
      return false;
    });
  };
  var nest = d3.nest()
    .key(function(d) { return d.name; });
  var bestGroupBy = function() {
    if (seconds_between >= 60 * 60 * 24 * 30) {
      return "month";
    }
    if (seconds_between >= 60 * 60 * 24 * 7) {
      return "week";
    }
    if (seconds_between >= 60 * 60 * 24) {
      return "day";
    }
    if (seconds_between >= 60 * 60) {
      return "hour";
    }
    return "minute";
  };
  var timeIntervalStep = function(t) {
    var max_ticks = 10;
    switch (t) {
      case "month":
        return 1;
        break;
      case "week":
      case "day":
      case "hour":
      case "minute":
      default:
        var ti = d3.time[t].utc.range(date_range[0], date_range[1]);
        return (ti.length <= max_ticks) ? 1 : Math.floor(ti.length / max_ticks);
        break;
    }
  };
  var initCanvas = function() {
    anchor = d3.select(target).append("div")
      .attr("class", "anchorSG");

    var wrapper_width = $(target).width() - options.panel_width;

    wrapper_sg = anchor.append("div")
      .attr("class", "wrapper-sg")
      .style("width", wrapper_width + "px");

    wrapper_sg.append("h3")
      .style("margin-left", options.margin.left + "px")
      .style("margin-bottom", options.margin.top + "px")
      .style("text-transform", "uppercase")
      .style("font-weight", "bold")
      .text("Combined Categories");

    wrapper_sm = anchor.append("div")
      .attr("class", "wrapper-sm")
      .style("width", wrapper_width + "px");

    wrapper_sm.append("h3")
      .style("margin-left", options.margin.left + "px")
      .style("margin-bottom", options.margin.top + "px")
      .style("text-transform", "uppercase")
      .style("font-weight", "bold")
      .text("Separate Categories");

    var sm_sort = EC.Templates.get('ui-sm-sort-control');
    $(wrapper_sm.node()).append(sm_sort());
    $("#sm-sort-control").on("change", function(e) {
      sort_option = $(this).val();
      d3.selectAll("svg.small-multiples").remove();
      renderSmallMultiples();
    });

    panel = anchor.append("div")
      .attr("id", "sg-panel")
      .style("position", "absolute")
      .style("top", "0px")
      .style("right", "0px")
      .style("width", options.panel_width + "px")
      .style("height", $(anchor.node()).height() + "px")
      .style("display", "none")
      .style("z-index", 200);
  };
  var renderStreamGraph = function() {
    // Limit the categories
    var categories = limitData(tweet_categories);

    // Determine the days between
    var d_dates = d3.extent(categories.map(function(d) { return d.date; }));
    days_between = EC.daysBetween(d_dates[0], d_dates[1]);
    seconds_between = EC.secondsBetween(d_dates[0], d_dates[1]);

    // Auto set the group_by based on available data
    if (!group_by) {
      group_by = bestGroupBy(categories);
      EC.Events.publish('/Browser/changeTimePeriod', group_by);
    }

    // Format the data to fit the chart
    var data = singleRows(categories);

    // Create a color scale
    var color = d3.scale.category20();

    var width = $(wrapper_sg.node()).width() - options.margin.left - options.margin.right;
    var height = Math.round(width / options.aspect) * .8;

    var x = d3.time.scale()
      .range([0, width]);

    var y = d3.scale.linear()
      .range([height, 0]);

    var x_axis = d3.svg.axis()
      .scale(x)
      .orient('bottom')
      .ticks(timeScale(), timeIntervalStep(group_by))
      .outerTickSize(0);

    if (group_by == "day") {
      x_axis.tickFormat(d3.time.format('%a %e'));
    }

    var y_axis = d3.svg.axis()
      .ticks(0)
      .scale(y);

    var stack = d3.layout.stack()
      .offset("silhouette")
      .values(function(d) { return d.values; })
      .x(function(d) { return d.date; })
      .y(function(d) { return (d.count == 0) ? 0 : d.count; });

    var area = d3.svg.area()
      .interpolate("basis")
      .x(function(d) { return x(d.date); })
      .y0(function(d) { return y(d.y0); })
      .y1(function(d) { return y(d.y0 + d.y); });

     var svg = wrapper_sg.append("svg")
      .attr("class", "chartSG")
      .attr("position", "relative")
      .attr("viewBox", "0,0," + (width + options.margin.left + options.margin.right) + "," + (height + options.margin.top + options.margin.bottom))
      .style("z-index", 1)
      .on("click", function(d, i) {
        mouseOutLayer(this, d, i);
        layer_is_selected = false;
        d3.selectAll("svg.small-multiples")
          .attr("fill-opacity", 1)
          .attr("stroke-opacity", 1)
          .style("display", "block");
        back_button.style("display", "none");
        showTweets(false);
      })
    .append("g")
      .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");

    var layers = stack(normalizeData(nest.entries(data)));

    x.domain(date_range);
    y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

    back_button = svg.append("text")
      .attr("x", width)
      .attr("y", 0)
      .style("text-anchor", "end")
      .style("fill", "#428bca")
      .style("cursor", "pointer")
      .style("display", "none")
      .text("Show All Verticals");

    tool_tip = d3.select(target)
      .append("div")
      .attr("class", "tool-tip-static")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("display", "none")
      .style("z-index", 200)
      .style("top", "10px")
      .style("left", "10px");

    svg.selectAll(".layer")
      .data(layers)
    .enter().append("path")
      .attr("class", "layer")
      .attr("d", function(d) {
        return area(d.values);
      })
      .attr("stroke", "#000000")
      .attr("stroke-opacity", 0.25)
      .attr("stroke-width", "1px")
      .style("cursor", "pointer")
      .style("fill", function(d,i) {
        return EC.Colors.byVertical(d.values[0].vertical);
      });

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(x_axis);

    svg.append("g")
      .attr("class", "y axis")
      .call(y_axis.orient("left"));

    svg.selectAll(".layer")
      .attr("fill-opacity", 1)
      .on("click", function(d, i) {
        d3.event.stopPropagation();
        if (layer_is_selected) {
          mouseOverLayer(this, d, i);
          mouseMoveLayer(this, d, i);
        }
        selectCategory(this, d, i);
      })
      .on("mouseover", function(d, i) {
        if (layer_is_selected) {
          return false;
        }
        mouseOverLayer(this, d, i);
      })
      .on("mousemove", function(d, i) {
        if (layer_is_selected) {
          return false;
        }
        mouseMoveLayer(this, d, i);
      })
      .on("mouseout", function(d, i) {
        if (layer_is_selected) {
          return false;
        }
        mouseOutLayer(this, d, i);
      });

    function mouseOverLayer(layer, d, i) {
      svg.selectAll(".layer").transition()
        .duration(50)
        .attr("fill-opacity", function(d, j) {
          return j != i ? 0.10 : 1;
        })
        .attr("stroke-opacity", 0);
      tool_tip.style("display", "block");
    }

    function mouseMoveLayer(layer, d, i) {
      var mouse = d3.mouse(layer);
      mouse_x = mouse[0] + options.margin.left;
      mouse_y = mouse[1];
      var pointer = d3.time[group_by].utc.floor(x.invert(mouse_x));
      var dates = d.values.map(function(d) {
        return d.date.getTime();
      });
      var selected = dates.indexOf(pointer.getTime());
      var select_date = d.values[selected].date;
      var date_str = (group_by == "hour") ? select_date.toUTCString() : select_date.toUTCString().replace(" 00:00:00 GMT", "");
      var node_count = d.values[selected].count;
      var tweet_desc = (node_count == 1) ? "Tweet" : "Tweets";
      var percentage = ((node_count / tweet_count) * 100).toFixed(2) + '%';
      tool_tip.html("<h3>" + d.key + "</h3><p>" + node_count + " " + tweet_desc + " / " + percentage + "</p><h7>" + date_str + "</h7>");
      tool_tip.style("left", function() {
        return options.margin.left + 20 + "px";
        var tt_width = $(this).width();
        return mouse_x - (tt_width/2) + "px";
      });
      tool_tip.style("top", function() {
        return options.margin.top + 40 + "px";
      });
    }

    function mouseOutLayer(layer, d, i) {
      svg.selectAll(".layer")
        .transition()
        .duration(50)
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", .20)
      tool_tip.style("display", "none");
    }

    var vertical = wrapper_sg.append("div")
      .attr("class", "vertical")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("z-index", "100")
      .style("width", "1px")
      .style("height", function(d) {
        return height;
      })
      .style("top", function(d) {
        return options.margin.top + "px";
      })
      .style("bottom", function(d) {
        return options.margin.bottom + "px";
      })
      .style("left", "0px")
      .style("background", "#fff");

    d3.select(target)
      .on("mousemove", function(){
         mousex = d3.mouse(this);
         mousex = mousex[0];
         vertical.style("left", mousex + "px" );
       })
      .on("mouseover", function(){
         mousex = d3.mouse(this);
         mousex = mousex[0];
         vertical.style("left", mousex + "px")});
  };
  var countVerticals = function(single_rows) {
    vertical_counts = vertical_counts || {};
    if (Object.keys(vertical_counts).length == 0) {
      single_rows.forEach(function(d) {
        if (typeof vertical_counts[d.vertical] == "undefined") {
          vertical_counts[d.vertical] = d.count;
        }
        else {
          vertical_counts[d.vertical] += d.count;
        }
      });
    }
    return vertical_counts;
  };
  var sortLayers = function(single_rows, layers) {
    var vertical_counts = countVerticals(single_rows);
    var recent_idx = layers[0].values.length - 1;
    var trend_idx = Math.ceil(layers[0].values.length * (2/3)) - 1;
    layers.forEach(function(d) {
      var recent = d.values[recent_idx].count;
      var trend = d.values[trend_idx].count || 1;
      var counts = d.values.map(function(d) { return +d.count; });
      d.vertical_count = vertical_counts[d.values[0].vertical];
      d.trend_score = recent / trend;
      d.count = counts.reduce(function(p,v) { return p + v; });
    });
    switch (sort_option) {
      case "frequency":
        return layers.sort(function(a,b) {
          return b.count - a.count;
        });
        break;
      case "trending-desc":
        return layers.sort(function(a,b) {
          return b.trend_score - a.trend_score;
        });
        break;
      case "trending-asc":
        return layers.sort(function(a,b) {
          return a.trend_score - b.trend_score;
        });
        break;
      case "only-trending-asc":
        return layers.filter(function(d) {
          return d.trend_score < 1;
        });
        break;
      case "only-trending-desc":
        return layers.filter(function(d) {
          return d.trend_score > 1;
        });
        break;
      case "only-trending-nochange":
        return layers.filter(function(d) {
          return d.trend_score == 1;
        });
        break;
      case "vertical":
      default:
        return layers.sort(function(a,b) {
          return b.vertical_count - a.vertical_count;
        });
        break;
    }
  };
  var renderSmallMultiples = function() {
    var data = singleRows(limitData(tweet_categories));

    var color = d3.scale.category20();
    var width = $(wrapper_sm.node()).width() - options.margin.left - options.margin.right;
    var height = Math.round(width / options.aspect) / 8;

    var x = d3.time.scale()
      .range([0, width]);

    var y = d3.scale.linear()
      .domain(d3.extent(data, function(d) {
        return d.count;
      }))
      .range([height, 0]);

    var x_axis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(timeScale(), timeIntervalStep(group_by));

    var y_axis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(4);

    var area = d3.svg.area()
      .x(function(d) { return x(d.date); })
      .y0(height)
      .y1(function(d) {
        var min_count = (d.count == 0) ? 0.01 : d.count;
        return y(min_count);
      });

    var layers = sortLayers(data, normalizeData(nest.entries(data)));

    x.domain(date_range);

    var margin = {top: 30, bottom: 30};

    var svg = wrapper_sm.selectAll("svg")
        .data(layers)
      .enter().append("svg")
        .attr("class", "small-multiples")
        .style("margin-bottom", "5px")
        .attr("viewBox", "0,0," + (width + options.margin.left + options.margin.right) + "," + (height + margin.top + margin.bottom))
        .style("z-index", 1)
      .append("g")
        .attr("transform", "translate(" + options.margin.left + "," + margin.top + ")")
        .style("cursor", "pointer")
        .on("click", function(d, i) {
          d3.event.stopPropagation();
          selectCategory(this, d, i);
        });

    svg.append("rect")
      .attr("x", -options.margin.left / 2)
      .attr("y", -margin.top)
      .attr("width", width + (options.margin.right / 1.5))
      .attr("height", height + (margin.top + margin.bottom))
      .attr("fill", "transparent")
      .attr("stroke", "#ccc")
      .attr("stroke-width", "1px");

    svg.append("g")
      .attr("class", "x axis axis-small")
      .attr("transform", "translate(0," + height + ")")
      .call(x_axis);

    svg.append("g")
      .attr("class", "y axis axis-small")
      .call(y_axis);

    svg.append("path")
      .attr("class", "layer")
      .attr("d", function(d) {
        var max_count = d3.max(d.values, function(v) {
          return v.count;
        });
        y.domain([0, max_count]);
        return area(d.values);
      })
      .style("fill", function(d, i) {
        return EC.Colors.byVertical(d.values[0].vertical);
      });

    svg.append("text")
      .attr("x", width + 2)
      .attr("y", -10)
      .style("text-anchor", "end")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(function(d) { return d.key; });

    showTweets(false);
    $(window).scroll(scrollPanel);
  };
  var selectCategory = function(layer, d, i) {
    layer_is_selected = true;
    // Set StreamGraph
    d3.select(".chartSG").selectAll(".layer").transition()
      .duration(50)
      .attr("fill-opacity", function(f, j) {
        return (f.key == d.key) ? 1 : 0.10;
      })
      .attr("stroke-opacity", 0);
    tool_tip.html("<h3>" + d.key + "</h3>");
    tool_tip.style("display", "block");
    back_button.style("display", "block");
    // Set Small Multiple
    d3.selectAll("svg.small-multiples")
      .attr("fill-opacity", 1)
      .attr("stroke-opacity", 1)
      .style("display", function(v) {
        return (d.key == v.key) ? "block" : "none";
      });
    showTweets(filterTweets(d.key), d.key);
  };
  var filterTweets = function(key) {
    return tweet_categories.filter(function(v) {
      if (options.currentDepth == 4) {
        return v.path[v.path.length - 1] == key;
      }
      else {
        return v.path[options.currentDepth - 1] == key;
      }
    });
  };
  var showTweets = function(tweets, category) {
    var tweet_count = tweets.length || false;
    if (tweet_count) {
      return showPanel(tweets, category);
    }
    return showPanel(root_tweets, "All");
  };
  var panelHeight = function() {
    var anchor_height = $(anchor.node()).height();
    var anchor_top = $(anchor.node()).offset().top;
    var window_height = $(window).height();
    var panel_offset = ($(window).scrollTop() < anchor_top) ? anchor_top - $(window).scrollTop() : 0;
    return (anchor_height > window_height) ? window_height - panel_offset : anchor_height;
  };
  var showPanel = function(tweets, category) {
    clearPanel();
    var panel_height = ($(anchor.node()).height() > $(window).height()) ? $(window).height() : $(anchor.node()).height();
    panel.style("height", panelHeight() + "px")
      .style("overflow-y", "scroll")
      .style("overflow-x", "hidden");
    var tweetDisplay = EC.Templates.get('ui-sg-tweets');
    $(panel.node()).append(tweetDisplay({tweets: tweets, category: category}));
    panel.style("display", "block");
    $(panel.node()).animate({
      scrollTop: "0px"
    }, 500);
  };
  var hidePanel = function() {
    panel.style("display", "none");
  };
  var clearPanel = function() {
    panel.selectAll("div.tweet").remove();
    panel.selectAll("h4").remove();
  };
  var scrollPanel = function() {
    if ($(window).scrollTop() >= $(anchor.node()).offset().top) {
      var top = $(window).scrollTop() - $(anchor.node()).offset().top;
      var margin_bottom = parseInt($(target).css("margin-bottom"));
      var height = ($(window).scrollTop() + $(window).height() >= $(document).height())
        ? $(anchor.node()).height() - top
        : $(window).height();
      var right = $(window).width() - $(anchor.node()).width() - $(anchor.node()).offset().left;
      panel.style("position", "fixed")
        .style("right", right + "px")
        .style("height", height + "px");
    }
    else {
      var panel_height = ($(anchor.node()).height() > $(window).height()) ? $(window).height() : $(anchor.node()).height();
      panel.style("position", "absolute")
        .style("right", "0px")
        .style("height", panel_height + "px");
    }
  };
  var setTarget = function(t) {
    target = t;
  };
  var setData = function(d) {
    raw_data = d;
    category_count = d.category_count;
    var tweet_ids = [];
    d.categories.forEach(function(n) {
      tweets = tweets.concat(n.tweets);
      n.tweets.forEach(function(t) {
        if ($.inArray(t.id, tweet_ids) === -1) {
          root_tweets.push(t);
          tweet_ids.push(t.id);
        }
        tweet_categories.push({
          category_name: n.name,
          entities: t.entities,
          path: n.path,
          vertical: n.vertical,
          secondary: n.secondary,
          tertiary: n.tertiary,
          created_at: t.created_at,
          id: t.id,
          user_name: t.name,
          name: t.name,
          screen_name: t.screen_name,
          profile_pic: t.profile_pic,
          text: t.text,
          user_id: t.user_id,
          favorite_count: t.favorite_count,
          followers_count: t.followers_count,
          friends_count: t.friends_count,
          has_adult_content: t.has_adult_content,
          location: t.location,
          query: t.query,
          retweet_count: t.retweet_count,
          retweeted: t.retweeted,
          verified: t.verified,
          date: new Date(t.created_at),
          minute: d3.time.minute.utc.floor(new Date(t.created_at)),
          hour: d3.time.hour.utc.floor(new Date(t.created_at)),
          day: d3.time.day.utc.floor(new Date(t.created_at)),
          week: d3.time.week.utc.floor(new Date(t.created_at)),
          month: d3.time.month.utc.floor(new Date(t.created_at))
        });
      });
    });
    root_tweets.sort(function(a,b) {
      return b.id - a.id;
    });
  };
  setTarget(t);
  setData(d);
  return {
    setOptions: function(d) {
      for(var n in d) {
        options[n] = d[n];
      }
      return options;
    },
    setTimeInterval: function(t) {
      group_by = t;
    },
    checkTimeIntervalData: function(t) {
      if (t == "month") {
        return (seconds_between >= 60 * 60 * 24 * 30);
      }
      if (t == "week") {
        return (seconds_between >= 60 * 60 * 24 * 7);
      }
      if (t == "day") {
        return (seconds_between >= 60 * 60 * 24);
      }
      if (t == "hour") {
        return (seconds_between >= 60 * 60);
      }
      return true;
    },
    setWidth: function(v) {
      options.width = v;
    },
    setLimit: function(i) {
      options.limit = i;
    },
    setDepth: function(i) {
      options.currentDepth = i;
    },
    setChartType: function(s) {
      chart_type = s;
    },
    build: function() {
      initCanvas();
      renderStreamGraph();
      renderSmallMultiples();
      EC.Events.publish('/Viz/finishedLoading');
    },
    hideAdult: function(b) {
      options.hideAdult = b;
    },
    refresh: function() {
      this.remove();
      this.build();
    },
    remove: function() {
      layer_is_selected = false;
      d3.select("div.anchorSG").remove();
      d3.select("svg.chartSG").remove();
      d3.selectAll(".vertical").remove();
      d3.selectAll(".tool-tip-static").remove();
      d3.selectAll("svg.small-multiples").remove();
      $(window).unbind("scroll", scrollPanel);
    },
    type: "StreamGraph"
  };
};

EC.QueryInput = function(name, className) {
  var container = null;
  var input = null;
  var build = function() {
    container = document.createElement("span");
    input = d3.select(container)
      .attr("class", "zcinput-container")
      .append("input");
    input.attr("name", name)
      .attr("type", "text")
      .attr("class", className);
  };
  var setValue = function(value) {
    d3.select(container).select("input").attr("value", value);
  };
  build();
  return {
    element: function() {
      return container;
    },
    getInput: function() {
      return input;
    },
    setValue: function(v) {
      setValue(v);
    }
  };
}

EC.UserBox = function(d, c) {
  var data = d;
  var className = c;
  var swapTwitterImage = function(n) {
    return n.replace("normal", "bigger");
  };
  var build = function() {
    var container = document.createElement("div");

    var box = d3.select(container).datum(d)
      .attr("class", className)
      .style("border-left-color", function(d) {
        return EC.Colors.color(d.index);
      });

    box.append("h1")
      .text(function(d) {
        return d.screen_name;
      });
    box.append("p")
      .attr("class", "additional-info")
      .text(function(d) {
        var info = d.name;
        if (d.location !== "") {
          info += " \u2022 " + d.location;
        }
        return info;
      });
    box.append("img")
      .attr("class", "profile-image")
      .attr("src", function(d) {
        return swapTwitterImage(d.profile_image_url);
      })
      .attr("height", 80)
      .attr("width", 80);
    box.append("div")
      .attr("class", "tweet-count")
      .append("header")
        .attr("class", "tweet-count-label")
        .text("Tweets");
    box.select(".tweet-count").append("span")
      .attr("class", "tweet-count-value")
      .text(function(d) {
        return d.ec_tweet_count;
      });
    box.append("div")
      .attr("class", "category-count")
      .append("header")
        .attr("class", "category-count-label")
        .text("Categories");
    box.select(".category-count").append("span")
      .attr("class", "category-count-value")
      .text(function(d) {
        return d.ec_category_count;
      });
    return container;
  };
  return {
    element: function() {
      return build();
    }
  }
};

EC.QueryBox = function(d, c) {
  var data = d;
  var className = c;
  var build = function() {
    var container = document.createElement("div");

    var box = d3.select(container).datum(d)
      .attr("class", className)
      .style("border-left-color", function(d) {
        return EC.Colors.color(d.index);
      });
    box.append("h1")
      .text(function(d) {
        return d.query;
      });
    box.append("div")
      .attr("class", "tweet-count")
      .append("header")
        .attr("class", "tweet-count-label")
        .text("Tweets");
    box.select(".tweet-count").append("span")
      .attr("class", "tweet-count-value")
      .text(function(d) {
        return d.ec_tweet_count;
      });
    box.append("div")
      .attr("class", "category-count")
      .append("header")
        .attr("class", "category-count-label")
        .text("Categories");
    box.select(".category-count").append("span")
      .attr("class", "category-count-value")
      .text(function(d) {
        return d.ec_category_count;
      });
    return container;
  };
  return {
    element: function() {
      return build();
    }
  }
};

EC.ScatterPlot = function(t, d) {
  var options = {
    fit: "stretch",
    aspect: 2.3,
    width: 1100,
    height: 600,
    margin: {top: 10, right: 0, bottom: 20, left: 0},
    radius: {min: 6, max: 11},
    nodePadding: 5,
    nodeLimit: 30,
    model: 'score',
    nodeHoverColor: "#6dcff6",
    nodeTextColor: "#000000",
    currentDepth: 4,
    hideAdult: true,
    showTweets: true,
    baselineText: "Average Twitter User"
  };
  var depthNames = {
    1: "vertical",
    2: "secondary",
    3: "tertiary",
    4: "name"
  };
  var rawData = d;
  var target = t;
  var getExtent = function(data) {
    var min = (d3.min(data) > -.05) ? -.05 : d3.min(data);
    var max = (d3.max(data) < .05) ? .05 : d3.max(data);
    return [min, max];
  };
  var color = function(v) {
    return EC.Colors.byVertical(v);
  };
  var processData = function(data) {
    if (options.model == 'total-user-mentions') {
      var top = data.scoreUserMentions.sort(function(a,b) { return b.count - a.count });
      var newData = top.slice(0, options.nodeLimit);
    }
    if (options.model == 'score') {
      var score = data.scoreDifference.sort(function(a,b) { return b.scoreDifference - a.scoreDifference });
      var newData = score.slice(0, options.nodeLimit);
    }
    if (options.hideAdult) {
      var newData = newData.filter(function(d) {
        return d.vertical != 'Adult Content';
      });
    }
    return newData.sort(function(a,b) { return b.deviance - a.deviance; });
  };
  var deselectNodes = function() {
    return;
  };
  var click = function(d) {
    // publish the event
    EC.Events.publish('/ScatterPlot/click', d);
  };
  var showLoadingMessage = function(msg) {
    var svg = d3.select(target).select("svg");
    // Remove the current chart
    svg.selectAll("g").remove();
    // cal the margins
    var marginWidth = options.width - options.margin.left - options.margin.right;
    var marginHeight = options.height - options.margin.top - options.margin.bottom;
    // Show the msg
    svg.append("g")
      .append("text")
        .attr("x", marginWidth / 2)
        .attr("y", marginHeight / 3)
        .style("text-anchor", "middle")
        .style("font-size", "30px")
        .text(msg);
    svg.append("g")
      .append("foreignObject")
        .attr("x", (marginWidth / 2) - (128/2))
        .attr("y", marginHeight / 2)
        .attr("width", "128px")
        .attr("height", "128px")
        .style("text-anchor", "middle")
        .append("xhtml:div")
          .attr("class", "loading-icon loading-circle");
  };
  var render = function() {
    // remove all visual data
    d3.select(target).selectAll("svg").remove();

    // prepare the data
    var data = processData(rawData);

    // set height when using fit:stretch
    if (options.fit == "stretch") {
      options.height = Math.round( options.width / options.aspect );
    }

    // add margin
    var marginWidth = options.width - options.margin.left - options.margin.right;
    var marginHeight = options.height + 10 - options.margin.top - options.margin.bottom;

    // configure scales
    var rScale = d3.scale.linear().rangeRound([options.radius.min, options.radius.max]).domain(d3.extent(data.map(function(d) { return d.score_user_mentions; })));
    var x = d3.scale.linear().rangeRound([0,marginWidth]).domain(getExtent(data.map(function(d) { return d.deviance; } )));
    var y = d3.scale.ordinal().domain(data.map(function(d,i) { return i; })).rangePoints([0,marginHeight], options.nodePadding);

    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.format(",.2r"));
    var yAxis = d3.svg.axis().scale(y).orient("left");
    var zeroLine = d3.svg.axis().scale(x).orient("bottom").tickValues([0]).innerTickSize(-marginHeight).tickFormat("");

    // append the svg element
    var svg = d3.select(target).append("svg")
        .attr("width", options.width)
        .attr("height", options.height)
      .append("g");

    // let the browser make this container fluid (responsive)
    //_this.makeFluid(target);

    // insert a background
    svg.append("rect")
        .attr("class", "scatter-background")
        .attr("width", options.width)
        .attr("height", options.height)
        .attr("fill", "transparent")
        .on("click", deselectNodes);

    // x-axis
    svg.append("g")
        .attr("class", "x scatter-axis")
        .attr("transform", "translate(0," + marginHeight + ")")
        .call(xAxis)
      .append("text")
        .attr("class", "label scatter-zero-line-label")
        .attr("x", options.width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Multiple Over Baseline");

    // add the zero line
    svg.append("g")
        .attr("class", "x scatter-zero-line")
        .attr("transform", "translate(0," + marginHeight + ")")
        .call(zeroLine)
      .append("text")
        .attr("class", "label scatter-zero-line-label")
        .attr("x", marginHeight)
        .attr("y", x(0) - 6)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "end")
        .text(options.baselineText + ' Baseline');
    // make the zero line dashed
    d3.select(".scatter-zero-line").select(".tick").selectAll("line")
        .attr("stroke-dasharray", "3, 3");

    // node groups
    var nodeGroups = svg.selectAll(".scatter-group")
        .data(data)
      .enter().append("g")
        .attr("class", "scatter-group")
        .on("click", click)
        .on("mouseover", function(d) {
          d3.select(this).selectAll(".scatter-category, .scatter-category-text")
            .attr("fill", options.nodeHoverColor);
        })
        .on("mouseout", function(d) {
          d3.select(this).selectAll(".scatter-category")
            .attr("fill", function(d) {
              return color(d.vertical);
            });
          d3.select(this).selectAll(".scatter-category-text")
            .attr("fill", options.nodeTextColor);
        });
    // nodes
    nodeGroups.append("circle")
      .attr("class", "scatter-category")
      .attr("r", function(d) { return rScale(d.score_user_mentions)})
      .attr("cx", function(d, i) {
        var cx = x(d.deviance);
        var padding = 0;
        // add extra padding if first node
        if (cx == 0) {
          padding = rScale(d.score_user_mentions);
        }
        // remove extra padding if last node
        else if (cx == marginWidth) {
          padding = -Math.abs(rScale(d.score_user_mentions));
        }
        return cx + padding;
      })
      .attr("cy", function(d,i) { return y(i); })
      .attr("fill", function(d) {
        d.nodeFill = color(d.vertical);
        return d.nodeFill;
      });
    // node text
    nodeGroups.append("text")
      .attr("class", "scatter-category-text")
      .style("font-size", "12px")
      .text(function(d) { return d.name; })
      .attr("dx", function(d) {
        var dx = x(d.deviance);
        var textWidth = this.getBoundingClientRect().width;
        if (dx == 0 || dx == marginWidth) {
          var padding = (rScale(d.score_user_mentions) * 2) + options.nodePadding;
        }
        else {
          var padding = rScale(d.score_user_mentions) + options.nodePadding;
        }
        // check to see if text clips off screen
        if ((dx + textWidth) > marginWidth) {
          // decrement the padding as we're putting the text to the left of the node
          return dx - padding;
        }
        // increment the padding as we're putting the text to the right of the node
        return dx + padding;
      })
      .attr("dy", function(d,i) { return y(i); })
      .attr("fill", options.nodeTextColor)
      .style("text-anchor", function(d,i) {
          var dx = x(d.deviance);
          var textWidth = this.getBoundingClientRect().width;
          var padding = rScale(d.score_user_mentions);
          // check to see if text clips off screen
          if ((dx + textWidth) > marginWidth) {
            // flip the text to the left of the x coord
            return "end";
          }
          // keep the text to the right of the x coord
          return "start";
      });
  };
  return {
    options: options,
    setOption: function(n,v) {
      options[n] = v;
    },
    data: function(d) {
      rawData = d;
    },
    attach: function(t) {
      target = t;
    },
    setWidth: function(v) {
      options.width = v;
    },
    setLimit: function(v) {
      options.nodeLimit = v;
    },
    setDepth: function(v) {
      options.currentDepth = v;
    },
    setBaselineText: function(v) {
      options.baselineText = v;
    },
    build: function() {
      return render();
    },
    refresh: function() {
      this.build();
    },
    showLoadingMessage: function(msg) {
      showLoadingMessage(msg);
    }
  };
};

EC.SidePanel = function(target, id) {
  var options = {
    title: "Panel Title",
    zindex: 10,
    searchUrl: "http://info.com/"
  };
  var container = null;
  var title = null;
  var body = null;
  var backButton = null;
  var init = function() {
    container = document.createElement("div");
    d3.select(container).style("z-index", options.zindex);
    var heading = d3.select(container)
      .attr("id", id)
      .attr("class", "panel panel-default")
      .append("div")
        .attr("class", "panel-heading");
    backButton = heading.append("span")
      .attr("class", "glyphicon glyphicon-chevron-left side-panel-back hide")
      .on("click", function() {
        EC.Events.publish('/SidePanel/Modal/back', id);
      });
    heading.append("span")
      .attr("class", "glyphicon glyphicon-remove side-panel-close")
      .on("click", function() {
        EC.Events.publish('/SidePanel/close');
      });
    title = heading.append("h3")
      .attr("class", "panel-title")
      .text(options.title);
    body = d3.select(container).append("div")
      .attr("class", "panel-body");
  };
  var render = function() {
    $(target).append(container);
  };
  var addLineItem = function(t) {
    body.append("p").text(t);
  };
  var addViewTweetsLink = function(d) {
    body.append("div")
      .attr("class", "side-panel-viewtweetslink")
      .append("a")
        .text("View tweets from " + d.name)
        .on("click", function() {
          // need to change the event here
          EC.Events.publish("/SidePanel/Subcategory/click", d);
        });
  };
  var addSubcategories = function(data) {
    var table = body.append("table")
      .attr("class", "table table-hover side-panel-table");
    var tHeader = table.append("thead").append("tr");
    tHeader.append("th").text("Top Subcategories");
    tHeader.append("th").style('text-align', 'right').text("Multiple Over Baseline");
    var tBody = table.append("tbody");
    var tr = tBody.selectAll("tr")
      .data(data, function(d) { return d.name; })
      .enter().append("tr")
        .on("click", function(n) {
          n.tier = 0;
          EC.Events.publish("/SidePanel/Subcategory/click", n);
        });
    var catTd = tr.append("td")
      .attr("class", "side-panel-category")
      .text(function(n) {
        if (n.name.length > 30) {
          return n.name.substring(0,27) + '...';
        }
        return n.name
      });
    catTd.append("span")
      .attr("class", "glyphicon glyphicon-tag side-panel-tag")
      .style("float", "left")
      .style("color", function(n) {
        return EC.Colors.byVertical(n.vertical);
      });
    var devTd = tr.append("td").style('text-align', 'right').text(function(n) {
      return n.deviance.toFixed(3);
    });
  };
  var addTweets = function(d) {
    if (d.length) {
      var list = body.append("div").attr("class", "tweets-group side-panel-tweets");
      var section = list.selectAll("span")
          .data(d)
        .enter().append("span")
          .attr("class", "list-group-item")
      section.append("a")
        .attr("href", "https://twitter.com")
        .attr("target", "_blank")
        .attr("class", "tweet-bird-icon");
      section.append("img")
        .style("float", "left")
        .style("margin-right", "10px")
        .attr("src", function(n) {
          return n.user.profile_image_url;
        });
      section.append("h4")
        .attr("class", "list-group-item-heading")
        .text(function(n) {
          return n.user.name;
        });
      section.append("p")
        .style("font-size", "15px")
        .style("color", "#999")
        .text(function(n) {
          return "@" + n.user.screen_name;
        });
      section.append("p")
        .attr("class", "list-group-item-text")
        .html(function(n) {
          var tweet = n.text;
          if (n.entities.urls) {
            n.entities.urls.forEach(function(u) {
              var replaceUrl = '<a href="' + u.url + '" target="_blank">' + u.display_url + '</a>';
              tweet = tweet.replace(u.url, replaceUrl);
            });
          }
          if (n.entities.hashtags) {
            n.entities.hashtags.forEach(function(h) {
              var replaceHashtag = '#<a href="https://twitter.com/hashtag/' + h.text + '?src=hash" target="_blank">' + h.text + '</a>';
              tweet = tweet.replace("#"+h.text, replaceHashtag);
            });
          }
          if (n.entities.media) {
            n.entities.media.forEach(function(m) {
              var replaceMedia = '<a href="' + m.url + '" target="_blank">' + m.display_url + '</a>';
              tweet = tweet.replace(m.url, replaceMedia);
            });
          }
          tweet = tweet.replace(/\#/g, '<a>#</a>');
          return tweet;
        });
      var meta = section.append("div")
        .style("margin-top", "10px");
      meta.append("a")
        .attr("class", "tweet-button tweet-button-favorite")
        .attr("href", function(t) {
          return "https://twitter.com/intent/favorite?tweet_id=" + t.id_str;
        })
        .text("Favorites");
      meta.append("a")
        .attr("class", "tweet-button tweet-button-retweet")
        .attr("href", function(t) {
          return "https://twitter.com/intent/retweet?tweet_id=" + t.id_str;
        })
        .text("Retweet");
      meta.append("a")
        .attr("class", "tweet-button tweet-button-reply")
        .attr("href", function(t) {
          return "https://twitter.com/intent/tweet?in_reply_to=" + t.id_str;
        })
        .text("Reply");
      meta.append("a")
        .attr("class", "tweet-timestamp")
        .attr("target", "_blank")
        .attr("href", function(t) {
          return "https://twitter.com/" + t.user.screen_name + "/status/" + t.id_str;
        })
        .text(function(n) {
          var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sept", "Oct", "Nov", "Dec" ];
          var date = new Date(n.created_at);
          return date.toLocaleTimeString() + ' - ' + date.getDate() + ' ' + monthNames[date.getMonth()] + ' ' + date.getFullYear();
        });
    }
    else {
      body.append("p")
        .attr("class", "panel-body-error-text")
        .text("The tweets requested were deleted by the user.");
    }
  };
  var addSearch = function(n) {
    // remove the panel
    body.remove();
    // remove any existing iframe
    d3.select(container).select("iframe").remove();
    // set up the query and url
    var query = encodeURI(n.replace(/\s/g, '+'));
    var src = options.searchUrl + query;
    // create the iframe
    d3.select(container).append("iframe")
      .attr("class", "side-panel-iframe")
      .attr("src", src);
  };
  var clearItems = function() {
    body.selectAll("*").remove();
  };
  var loadingMsg = function(msg) {
    body.append("p")
      .attr("class", "panel-body-loading-text")
      .text(msg);
    body.append("div")
      .attr("class", "panel-body-loading-icon");
  };
  return {
    options: options,
    setOption: function(n,v) {
      options[n] = v;
    },
    changeTitle: function(name) {
      title.text(name);
    },
    modal: function() {
      backButton.classed("hide", false);
      d3.select(container).classed("side-panel-modal", true);
      return this;
    },
    setPosition: function(i) {
      options.zindex = i;
      return this;
    },
    build: function() {
      init();
      return this;
    },
    display: function() {
      render();
    },
    addLineItem: function(t) {
      addLineItem(t);
    },
    addSubcategories: function(d) {
      addSubcategories(d);
    },
    addTweets: function(d) {
      addTweets(d);
    },
    addSearch: function(n) {
      addSearch(n);
    },
    addViewTweetsLink: function(d) {
      addViewTweetsLink(d);
    },
    clearItems: function() {
      clearItems();
    },
    loadingMsg: function(msg) {
      clearItems();
      loadingMsg(msg);
    }
  };
};

EC.LoadingOverlay = function(element) {
  var overlay;
  var message;
  var time_out = 30000;
  var init = function(e) {
    var tpl = EC.Templates.get("ui-ec-loading-overlay");
    $(e).append(tpl({
      logo: EC.base_url + "/wp-content/themes/zcresponsive/logo.png",
      loading_icon: EC.base_url + "/wp-content/plugins/classify/css/loading-bar.gif"
    }));
    overlay = $("#ec-loading-overlay");
    message = $("#ec-loading-overlay-message");
    // Make sure we hide the overlay
    overlay.css("display", "none");
  };
  var show = function() {
    var defer = $.Deferred();
    // Set the overlay display parameters
    overlay.css("width", $(window).width() + "px");
    overlay.css("height", $(window).height() + "px");
    // Show the overlay
    overlay.show();
    // Set the message container parameters
    message.css("margin-top", -(message.height() / 2) + "px")
    // Resolve and Return the promise
    defer.resolve(true);
    return defer.promise();
  };
  var hide = function() {
    overlay.hide();
  };
  init(element);
  return {
    show: function(seconds) {
      var msToHide;
      if (seconds === undefined) {
        msToHide = time_out;
      }
      else {
        msToHide = seconds * 1000;
      }
      show();
      if (msToHide > 0) {
        // Set a timeout to hide the overlay
        window.setTimeout(this.hide, msToHide);
      }
    },
    hide: function() {
      hide();
    },
    showDeferred: function(callback) {
      $.when(show()).then(function() {
        setTimeout(callback, 0);
      });
    }
  };
};

EC.HorizontalBarGraph = function(data, el)
{
  var options = {
    numBarsPerPage: 5,
    barHeight: 25,
    barPaddingBottom: 5
  };

  var categories = data.categories;

  var offset = 0;

  var page = function() {
    console.log(offset);
    var begin = offset * options.numBarsPerPage;
    var end = begin + options.numBarsPerPage;
    return categories.slice(begin, end);
  };

  var width = function() {
    return $(el).width();
  };

  var height = function() {
    return options.numBarsPerPage * (options.barHeight + options.barPaddingBottom);
  };

  var countsList = categories.map(function(d) {
    return d.count;
  });

  var xScale = d3.scale.linear().domain(d3.extent(countsList)).range([1, width()]);

  var svg = d3.select(el).append("svg")
    .attr("width", width())
    .attr("height", height());

  var paintBars = function() {
    var bars = svg.selectAll(".ecw-viz-bar")
      .data(page())
      .enter()
      .append("rect")
      .attr("class", "ecw-viz-bar")
      .attr("x", 0)
      .attr("y", function(d, i) {
        return i * (options.barHeight + options.barPaddingBottom);
      })
      .attr("width", function(d, i) {
        return xScale(d.count)
      })
      .attr("height", options.barHeight)
      .attr("fill", function(d, i) {
        return EC.Colors.byVertical(d.vertical);
      });

    var text = svg.selectAll(".ecw-viz-text")
      .data(page())
      .enter()
      .append("text")
      .attr("class", "ecw-viz-text")
      .attr("x", 5)
      .attr("y", function(d, i) {
        return i * (options.barHeight + options.barPaddingBottom) + 15;
      })
      .attr("font-size", "12px")
      .style("dominant-baseline", "middle")
      .text(function(d) {
        return d.name;
      });
  };

  return {
    paint: function() {
      paintBars();
    },
    update: function() {
      d3.selectAll(".ecw-viz-bar, .ecw-viz-text").remove();
      this.paint();
    },
    next: function() {
      console.log(offset);
      offset++;
      this.update();
    },
    previous: function() {
      offset--;
      this.update();
    }
  }
};