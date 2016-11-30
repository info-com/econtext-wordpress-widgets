var TierColors = {

	colorList: [
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
    ],
	byTierName: function(tierName) {
		var color = d3.scale.ordinal()
			.domain(this.colorList.map( function(d) { return d.vertical; }) )
			.range(this.colorList.map( function(d) { return d.color; }) );
		return color(tierName);
	}

}
