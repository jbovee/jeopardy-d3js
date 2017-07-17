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

		var rects = grid.selectAll("g.col")
			.data(locationTotals)
			.enter().append("g")
			.attr("class", "col")
			.attr("transform", function(d, i) {
				return "translate(" + i * cellWidth + ")";
			})

		var cell = rects.selectAll("g.cell")
			.data(locationTotals);

		cell.data(function(d) {return d;})
			.enter().append("rect")
			.attr("fill", function(d) {
				return colors(d);
			})
			.attr("x", 0)
			.attr("y", function(d, i) {
				return i * cellHeight;
			})
			.attr("height", cellHeight)
			.attr("width", cellWidth);

		var g = cell.enter().append("g")
			.attr("opacity", "0")
			.on("mouseover", function() {
				d3.select(this).transition()
					.duration("500")
					.attr("opacity", "1");
			})
			.on("mouseout", function() {
				d3.select(this).transition()
					.duration("500")
					.attr("opacity", "0");
			});

		g.data(function(d) {return d;})
			.append("rect")
			.attr("fill", "#000")
			.attr("fill-opacity", "0.4")
			.attr("x", 0)
			.attr("y", function(d, i) {
				return i * cellHeight;
			})
			.attr("height", cellHeight)
			.attr("width", cellWidth);

		g.data(function(d) {return d;})
			.append("text")
			.attr("x", (cellWidth / 2))
			.attr("y", function(d, i) {
				return i * cellHeight + (cellHeight / 2);
			})
			.attr("font-family", "sans-serif")
			.attr("font-size", "24")
			.attr("fill", "#fff")
			.attr("text-anchor", "middle")
			.attr("alignment-baseline", "central")
			.text(function(d) {return d;});
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