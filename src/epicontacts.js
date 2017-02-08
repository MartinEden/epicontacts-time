const vis = require("vis");

class TimeRange {
	constructor(times, container, callback) {
		this.start = new Date(Math.min.apply(null, times));
		this.end = new Date(Math.max.apply(null, times));
		this.duration = this.end.getTime() - this.start.getTime();
		this.slider = this.makeSlider(container, callback);		
	}

	makeSlider(container, callback) {
		const me = this;
		const slider = document.createElement("input");
		slider.type = "range";
		slider.min = 0;
		slider.max = 1;
		slider.step = 0.0001;
		slider.value = 0;
		slider.style.cssText = "position: absolute; bottom: 0; left: 0; right: 0; width: 100%;";
		container.appendChild(slider);

		slider.addEventListener('input', ev => callback(me.getTimeFromSlider()));
		return slider;
	}

	getTimeFromSlider() {
		return this.getTimeFromInput(parseFloat(this.slider.value));
	}

	getTimeFromRelative(number) {
		return new Date(this.start.getTime() + (this.duration * number));
	}

	getTimeFromInput(input) {
		let time = null;
		if (input instanceof Date) {
			time = input;
		} else if (Number.isFinite(input)) {
			if (input < 0 || input > 1) {
				throw `Relative time was not in the range 0 to 1. Actual value: ${input}`
			}
			time = this.getTimeFromRelative(input);
		} else {
			throw `Expected either an absolute date, or a number from 0 to 1 to indicate a relative point within the date range. Actual value: "${input}".`
		}
		if (time < this.start || time > this.end) {
			throw `Given time ${time} was not in range. Minimum: ${this.start}. Maximum: ${this.end}`
		}
		return time
	}
}

export class Epicontacts {
	constructor(containerId, inputData) {
		const me = this;
		const container = document.getElementById(containerId);
		const networkDiv = document.createElement("div");
		networkDiv.style["width"] = container.style["width"];
		networkDiv.style["height"] = container.style["height"];
		container.appendChild(networkDiv);

		this.nodes = new vis.DataSet(inputData.linelist.map(x => (
			{ id: x.id, label: "", date: new Date(x.dt_report) }
		)));
		this.edges = new vis.DataSet(inputData.contacts.map(x => (
			{ from: x.from, to: x.to }
		)));
		this.range = new TimeRange(this.nodes.map(x => x.date), container, newTime => me.setTime(newTime));
		this.fadeIn = 7 * 24 * 60 * 60 * 1000;

		const data = { nodes: this.nodes, edges: this.edges };		
		const options = {
			layout: {
				improvedLayout: false
			}
		};
		new vis.Network(networkDiv, data, options);

		this.setTime(0);
	}

	setTime(timeInput) {
		const me = this;
		const time = this.range.getTimeFromInput(timeInput);

		this.time = time;
		this.nodes.update(this.nodes.map(x => ({ 
			id: x.id, 
			color: me.calculateNodeColour(x, time)
		})));
	}

	calculateNodeColour(node, time) {
		const diff = node.date.getTime() - time.getTime();

		const distance = clamp(diff / this.fadeIn, 0, 1);
		const opacity = 1 - distance;
		const newness = Math.ceil(distance) * 255;

		const color = `rgba(0, ${newness}, ${newness}, ${opacity})`;
		return color;
	}
}

const clamp = function(x, min, max) {
  return Math.min(Math.max(x, min), max);
};