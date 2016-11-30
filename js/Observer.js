var Observer = function() {
	return {
		_subscribers: [],
		subscribe: function(target, data, config) {
			if (typeof config !== "undefined") {
				config = JSON.parse(config);
			}
			var sub = {"target": target, "data": data, "config": config };
			return (this._subscribers.map(function(d) { return d.target; }).indexOf(sub.target) == -1) ? this._subscribers.push(sub) : false;
		},
		unsubscribe: function(target) {
			removeIndex = this._subscribers.map(function(d) { return d.target; }).indexOf(target);
			return this._subscribers.splice(removeIndex, 1);
		}
	}
};
