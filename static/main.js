// custom javascript

$(function() {
	ddLocations();
	//createGraph();
});

function ddLocations() {
	var locationTotals = [
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0]
	];
	var cols = locationTotals[0].length,
		rows = locationTotals.length,
		cellHeight = 80,
		cellWidth = 100,
		tooltipTransition = 1000;

	d3.json("/season?no=4", function(data) {
		data.forEach(function(d) {
			if (d.daily_double) {
				locationTotals[d.coord[0]-1][d.coord[1]-1] += 1;
			}
		});

		arr = locationTotals.reduce(function iter(r, a) {
			return r.concat(a);
		}, []);

		var colors = d3.scaleLinear().domain([1, Math.max.apply(null, arr)])
			.interpolate(d3.interpolateHcl)
			.range([d3.rgb("#FFFFFF"), d3.rgb("#0000FF")]);

		var grid = d3.select("#grid")
			.append("svg")
			.attr("width", rows * cellWidth)
			.attr("height", cols * cellHeight)
			.style("background", "blue");

		var tooltip = d3.tip()
			.attr("class", "d3-tip")
			.offset([(cellHeight / 2) + 12, 0])
			.html(function(d) { return d; });

		grid.call(tooltip);

		var rects = grid.selectAll("g")
			.data(locationTotals)
			.enter().append("g")
			.attr("transform", function(d, i) {
				return "translate(" + i * cellWidth + ")";
			});

		rects.selectAll("rect")
			.data(function(d) {return d;})
			.enter().append("rect")
			.attr("fill", function(d) {
				return colors(d);
			})
			.attr("x", 0)
			.attr("y", function(d, i) {
				return i * cellHeight;
			})
			.attr("height", cellHeight)
			.attr("width", cellWidth)
			.on("mouseover", function(d) {
				d3.select(".d3-tip").transition().style("opacity", "1");
				tooltip.show(d);
			})
			.on("mouseout", function(d) {
				d3.select(".d3-tip").transition().duration(tooltipTransition).style("opacity", "0").on("end", tooltip.hide);
			});

		d3.select(".d3-tip")
			.on("mouseover", function(d) {
				d3.select(".d3-tip").transition().style("opacity", "1");
			})
			.on("mousout", function(d) {
				d3.select(".d3-tip").transition().duration(tooltipTransition).style("opacity", "0").on("end", tooltip.hide);
			})
		/* Keeping in case of needing 2d array iteration stuff
		rects.selectAll("text")
			.data(function(d) {return d;})
			.enter().append("text")
			.attr("x", function(d, i) {
				return (cellWidth / 2);
			})
			.attr("y", function(d, i) {
				return (i * cellHeight) + (cellHeight / 2) + 6;
			})
			.text(function(d) { return d;})
			.attr("font-family", "sans-serif")
			.attr("font-size", "20px")
			.attr("text-anchor", "middle")
			.attr("font-weight", "bold");
		*/
	})
}

/*
function createGraph() {
	var w = 1400;
	var h = 600;
	var barPadding = 2;

	d3.json("/season?no=8", function(data) {
		var svg = d3.select("#chart")
			.append("svg")
			.attr("width", w)
			.attr("height", h);

		var dataset = data.slice(40,80);
		var valueFactor = 10;

		svg.selectAll("rect")
			.data(dataset)
			.enter()
			.append("rect")
			.attr("x", function(d, i) {
				return i * (w / dataset.length);
			})
			.attr("y", function(d) {
				return h - (Math.max(...d.value) / valueFactor);
			})
			.attr("width", w / dataset.length - barPadding)
			.attr("height", function(d) {
				return Math.max(...d.value) / valueFactor;
			})
			.attr("fill", function(d) {
				return "rgb(0, 0, " + (Math.max(...d.value) / valueFactor) + ")";
			});

		svg.selectAll("text")
			.data(dataset)
			.enter()
			.append("text")
			.text(function(d) {
				return (Math.max(...d.value) / valueFactor);
			})
			.attr("x", function(d, i) {
				return i * (w / dataset.length) + (w / dataset.length - barPadding) / 2;
			})
			.attr("y", function(d) {
				return h - (Math.max(...d.value) / valueFactor) + 15
			})
			.attr("font-family", "sans-serif")
			.attr("font-size", "12px")
			.attr("fill", "white")
			.attr("text-anchor", "middle");
	})
}
*/