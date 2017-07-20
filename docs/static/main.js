// custom javascript

$(function() {
	ddLocations();
	//createGraph();
});

function ddLocations(seasonNo) {
	var cols = 5,
		rows = 6,
		cellHeight = 80,
		cellWidth = 100;

	var numSeasons = 33;
	var seasons = Array.from(new Array(numSeasons), (val,index)=>index+1);

	var locationTotals = [
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0]
	];

	var updateButtons = d3.select("#season-picker")
		.selectAll(".season-button")
		.data(seasons);

	updateButtons.enter()
		.append("input")
		.attr("value", function(d) {return d;})
		.attr("type", "button")
		.attr("class", "update-button")
		.on("click", function(d) {
			updateData(d);
		});

	var grid = d3.select("#grid")
		.append("svg")
		.attr("width", rows * cellWidth)
		.attr("height", cols * cellHeight)
		.style("background", "#fff");

	var colors = d3.scaleLinear()
		.interpolate(d3.interpolateHcl)
		.range([d3.rgb("#FFFFFF"), d3.rgb("#0000FF")]);

	d3.csv("/jeopardy-d3js/j-archive-csv/j-archive-season-" + seasonNo + ".csv", function(data) {
		locationTotals = [
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0]
		];

		data.forEach(function(d) {
			d.daily_double = (d.daily_double == "true" || d.daily_double == "True") ? Boolean(true):Boolean(false);
			d.newCoord = [0, 0];
			d.newCoord[0] = +d.coord[1];
			d.newCoord[1] = +d.coord[4];
			if (d.daily_double) {
				locationTotals[d.newCoord[0]-1][d.newCoord[1]-1] += 1;
			}
		});

		arr = locationTotals.reduce(function iter(r, a) {
			return r.concat(a);
		}, []);

		colors.domain([1, Math.max.apply(null, arr) * 10]);

		var rects = grid.selectAll("g.col")
			.data(locationTotals)
			.enter().append("g")
			.attr("class", "col")
			.attr("transform", function(d, i) {
				return "translate(" + i * cellWidth + ")";
			})

		var cells = rects.selectAll("g")
			.data(locationTotals);

		var heatCells = cells.data(function(d) {return d;})
			.enter().append("rect")
			.attr("x", 0)
			.attr("y", function(d, i) {
				return i * cellHeight;
			})
			.attr("height", cellHeight)
			.attr("width", cellWidth)
			.attr("class", "heatCell")
			.attr("z-index", 2)
			.attr("fill", "#fff");

		heatCells.transition().duration(1000)
			.attr("fill", function(d) {
				return colors(d * 10);
			});

		var g = cells.enter().append("g")
			.attr("opacity", "0")
			.on("mouseover", function() {
				d3.select(this).transition()
					.duration("250")
					.attr("opacity", "1");
			})
			.on("mouseout", function() {
				d3.select(this).transition()
					.duration("250")
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
			.attr("width", cellWidth)
			.attr("z-index", 5)
			.attr("class", ".tipCell");

		var cellTips = g.data(function(d) {return d;})
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
			.attr("z-index", 10)
			.attr("class", "tip")
			.text("");

		cellTips.transition().duration(1000)
			.text(function(d) {return d;});
	});

	function updateData(seasonNo) {
		d3.json("/season?no=" + seasonNo, function(data) {
			locationTotals = [
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0]
			];

			data.forEach(function(d) {
				if (d.daily_double) {
					locationTotals[d.coord[0]-1][d.coord[1]-1] += 1;
				}
			});

			arr = locationTotals.reduce(function iter(r, a) {
				return r.concat(a);
			}, []);

			colors.domain([1, Math.max.apply(null, arr) * 10]);

			var gCol = d3.select("#grid")
				.selectAll("g.col")
				.data(locationTotals);

			gCol.selectAll("rect.heatCell")
				.data(function(d) {return d;})
				.transition().duration(1000)
				.attr("fill", function(d) {
					return colors(d * 10);
				});

			gCol.selectAll("text.tip")
				.data(function(d) {return d;})
				.transition().duration(1000)
				.text(function(d) {
					return d;
				});
		})
	}
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