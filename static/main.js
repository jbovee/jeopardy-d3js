//	The function that runs when the page loads
$(function() {
	ddHeatmap(1);
	ddStats(1);
	//createGraph();
});

function updateHeatmap(data) {
	//	Reset location totals
	var locationTotals = [
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0]
	],
		colTotals = [0, 0, 0, 0, 0, 0],
		rowTotals = [0, 0, 0, 0, 0];

	//	Go through each question, totalling the number of
	//	times a daily double occurs on each grid location
	data.forEach(function(d) {
		if (d.daily_double) {
			locationTotals[d.coord[0]-1][d.coord[1]-1] += 1;
			colTotals[d.coord[0]-1] += 1;
			rowTotals[d.coord[1]-1] += 1;
		}
	});

	//	Again flatten location totals
	arr = locationTotals.reduce(function iter(r, a) {
		return r.concat(a);
	}, []);

	//	Update color range
	var colors = d3.scaleLinear()
		.interpolate(d3.interpolateHcl)
		.range([d3.rgb(startColor), d3.rgb(endColor)])
		.domain([1, Math.max.apply(null, arr) * 10]);

	var rowColors = d3.scaleLinear()
		.interpolate(d3.interpolateHcl)
		.range([d3.rgb(startColor), d3.rgb(endColor)])
		.domain([1, Math.max.apply(null, rowTotals) * 10]);

	var colColors = d3.scaleLinear()
		.interpolate(d3.interpolateHcl)
		.range([d3.rgb(startColor), d3.rgb(endColor)])
		.domain([1, Math.max.apply(null, colTotals) * 10]);

	//	Update heat cells and tooltips to new season
	//////////////////////////////////////////////////
	var gCol = d3.select("#grid")
		.selectAll("g.col")
		.data(locationTotals);

	var gColRows = d3.select("#grid")
		.select("g.rowTotals");

	var gColCols = d3.select("#grid")
		.select("g.colTotals");

	//	Change the color of all heat cells
	gCol.selectAll("rect.heatCell")
		.data(function(d) {return d;})
		.transition().duration(1000)
		.attr("fill", function(d) {
			return colors(d * 10);
		});

	//	Change the text in tooltips
	gCol.selectAll("text.tip")
		.data(function(d) {return d;})
		.transition().duration(1000)
		.text(function(d) {
			return d;
		});

	gColRows.selectAll("rect.heatRow")
		.data(rowTotals)
		.transition().duration(1000)
		.attr("fill", function(d) {
			return rowColors(d * 10);
		});

	gColRows.selectAll("text.rowTip")
		.data(rowTotals)
		.transition().duration(1000)
		.text(function(d) {
			return d;
		});

	gColCols.selectAll("rect.heatCol")
		.data(colTotals)
		.transition().duration(1000)
		.attr("fill", function(d) {
			return colColors(d * 10);
		});

	gColCols.selectAll("text.colTip")
		.data(colTotals)
		.transition().duration(1000)
		.text(function(d) {
			return d;
		});
}

function updateStats(data) {
	var ddMax = 0,
		ddMin = Infinity,
		ddSum = 0,
		ddAvg = [];

	data.forEach(function(d) {
		d.value = d.value[0];
		if (d.daily_double) {
			if (d.value > ddMax) {
				ddMax = d.value;
			}
			if (d.value < ddMin) {
				ddMin = d.value;
			}
			ddAvg.push(d.value);
			ddSum += d.value;
		}
	});

	d3.select("#season-stats").select("p").text("Max: " + ddMax + ", Min: " + ddMin + ", Avg: " + (ddSum/ddAvg.length).toFixed(2));
}

//////////////////////////////////////////////////////////////////////
//	Function for updating gric colors and tip values given a season	//
//////////////////////////////////////////////////////////////////////

function updateData(seasonNo) {
	//	Data reading method for github page or just not local webserver					//
	//	(So I can copy the whole file and just change one part when making changes)		//
	//////////////////////////////////////////////////////////////////////////////////////
	/*
	//	Read data from season
	///////////////////////////
	d3.csv("/jeopardy-d3js/j-archive-csv/j-archive-season-" + seasonNo + ".csv", function(data) {

		//	Reset location totals
		locationTotals = [
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0]
		];
		//	Go through each question, totalling the number of
		//	times a daily double occurs on each grid location

		data.forEach(function(d) {
			d.daily_double = (d.daily_double == "true" || d.daily_double == "True") ? Boolean(true):Boolean(false);
			d.newCoord = [0, 0];
			d.newCoord[0] = +d.coord[1];
			d.newCoord[1] = +d.coord[4];
			if (d.daily_double) {
				locationTotals[d.newCoord[0]-1][d.newCoord[1]-1] += 1;
			}
		});
	*/

	//	Read data from season
	///////////////////////////
	d3.json("/season?no=" + seasonNo, function(data) {
		updateHeatmap(data);
		updateStats(data);
	})
}

//////////////////////////////////////////////////////
//	Function for creating a daily double heatmap,	//
//	plus buttons and a slider for changing season.	//
//	Must have a starting season as input			//
//////////////////////////////////////////////////////

function ddHeatmap(seasonNo) {
	//////////////////////////////
	//	Initialize variables	//
	//////////////////////////////

	var rows = 5,
		cols = 6,
		cellHeight = 80,
		cellWidth = 100;

	startColor = "#FFFFFF";
	endColor = "#0000FF";

	var numSeasons = 33;
	var seasons = Array.from(new Array(numSeasons), (val,index)=>index+1);

	var locationTotals = [
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0]
	],
		colTotals = [0, 0, 0, 0, 0, 0],
		rowTotals = [0, 0, 0, 0, 0];

	//////////////////////////////////////////////
	//	Create Slider for Changing Season Data	//
	//////////////////////////////////////////////
	
	var updateSlider = d3.select("#slider");

	//	Slider
	updateSlider.append("input")
		.attr("name", "seasons-slider")
		.attr("id", "seasons-slider")
		.attr("type", "range")
		.attr("value", Math.min.apply(Math, seasons))
		.attr("min", Math.min.apply(Math, seasons))
		.attr("max", Math.max.apply(Math, seasons))
		.attr("list", seasons)
		.on("change", function() {
			$("#seasons-slider-value").text("Season " + this.value);
			updateData(this.value);
		});

	//	Text that shows slider value
	updateSlider.append("p")
		.attr("id", "seasons-slider-value")
		.text("Season " + Math.min.apply(Math, seasons));

	//////////////////////////////////////////////
	//	Create Buttons for Changing Season Data	//
	//////////////////////////////////////////////
	/*
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
	*/
	//////////////////////////////////////////
	//	Create Daily Double Heatmap Grid	//
	//////////////////////////////////////////

	//	Main svg element
	var grid = d3.select("#grid")
		.append("svg")
		.attr("width", (cols + 1) * cellWidth + 10)
		.attr("height", (rows + 1) * cellHeight + 10);

	//	Color scale from white to blue. Domain assigned later
	var colors = d3.scaleLinear()
		.interpolate(d3.interpolateHcl)
		.range([d3.rgb(startColor), d3.rgb(endColor)]);

	var rowColors = d3.scaleLinear()
		.interpolate(d3.interpolateHcl)
		.range([d3.rgb(startColor), d3.rgb(endColor)]);

	var colColors = d3.scaleLinear()
		.interpolate(d3.interpolateHcl)
		.range([d3.rgb(startColor), d3.rgb(endColor)]);

	//	Data reading method for github.io or just not local webserver					//
	//	(So I can copy the whole file and just change one part when making changes)		//
	//////////////////////////////////////////////////////////////////////////////////////
	/*
	//	Read data from season
	////////////////////////////
	d3.csv("/jeopardy-d3js/j-archive-csv/j-archive-season-" + seasonNo + ".csv", function(data) {

		//	Go through each question, totalling the number of
		//	times a daily double occurs on each grid location
		data.forEach(function(d) {
			d.daily_double = (d.daily_double == "true" || d.daily_double == "True") ? Boolean(true):Boolean(false);
			d.newCoord = [0, 0];
			d.newCoord[0] = +d.coord[1];
			d.newCoord[1] = +d.coord[4];
			if (d.daily_double) {
				locationTotals[d.newCoord[0]-1][d.newCoord[1]-1] += 1;
			}
		});
	*/

	//	Read data from season
	////////////////////////////
	d3.json("/season?no=" + seasonNo, function(data) {

		//	Go through each question, totalling the number of
		//	times a daily double occurs on each grid location
		data.forEach(function(d) {
			if (d.daily_double) {
				locationTotals[d.coord[0]-1][d.coord[1]-1] += 1;
				colTotals[d.coord[0]-1] += 1;
				rowTotals[d.coord[1]-1] += 1;
			}
		});

		//	Flatten location totals for easier
		//	calculation of max/min location total
		arr = locationTotals.reduce(function iter(r, a) {
			return r.concat(a);
		}, []);

		//	Set color range domain from 1 to maximum location total
		colors.domain([1, Math.max.apply(Math, arr) * 10]);

		//	Grid columns groupings
		/////////////////////////////
		var rects = grid.selectAll("g.col")
			.data(locationTotals)
			.enter().append("g")
			.attr("class", "col")
			.attr("transform", function(d, i) {
				return "translate(" + i * cellWidth + ")";
			})

		var cells = rects.selectAll("g")
			.data(locationTotals);

		//	Heatmap cells
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

		//	Heatmap cells start white, then transition
		//	when loading data for a season
		heatCells.transition().duration(1000)
			.attr("fill", function(d) {
				return colors(d * 10);
			});

		rowColors.domain([1, Math.max.apply(Math, rowTotals) * 10]);

		var heatRows = d3.select("#grid svg")
			.append("g")
			.attr("class", "rowTotals")
			.attr("transform", function() {
				return "translate(" + (cols * cellWidth + 10) + ")";
			});

		var heatRowCells = heatRows.selectAll("rect")
			.data(rowTotals)
			.enter().append("rect")
			.attr("x", 0)
			.attr("y", function(d, i) {
				return i * cellHeight;
			})
			.attr("height", cellHeight)
			.attr("width", cellWidth)
			.attr("class", "heatRow")
			.attr("fill", "#fff");

		heatRowCells.transition().duration(1000)
			.attr("fill", function(d) {
				return rowColors(d * 10);
			});

		colColors.domain([1, Math.max.apply(Math, colTotals) * 10]);

		var heatCols = d3.select("#grid svg")
			.append("g")
			.attr("class", "colTotals")
			.attr("transform", function() {
				return "translate(0 " + (rows * cellHeight + 10) + ")";
			});

		var heatColCells = heatCols.selectAll("rect")
			.data(colTotals)
			.enter().append("rect")
			.attr("x", function(d, i) {
				return i * cellWidth;
			})
			.attr("y", 0)
			.attr("height", cellHeight)
			.attr("width", cellWidth)
			.attr("class", "heatCol")
			.attr("fill", "#fff");

		heatColCells.transition().duration(1000)
			.attr("fill", function(d) {
				return colColors(d * 10);
			});

		//	Tooltip groupings
		////////////////////////
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

		//	Dark background
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
			.attr("class", ".tipCell");

		//	White text
		var cellTips = g.data(function(d) {return d;})
			.append("text")
			.attr("x", (cellWidth / 2))
			.attr("y", function(d, i) {
				return i * cellHeight + (cellHeight / 2);
			})
			.style("font-family", "sans-serif")
			.style("font-size", "24")
			.style("fill", "#fff")
			.style("text-anchor", "middle")
			.style("alignment-baseline", "central")
			.attr("class", "tip")
			.text("");

		//	Tooltip text starts out blank, then
		//	transitions when loading data for a season
		cellTips.transition().duration(1000)
			.text(function(d) {return d;});

		var gRow = heatRows.selectAll("g.rowTip")
			.data(rowTotals)
			.enter().append("g")
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

		gRow.append("rect")
			.attr("fill", "#000")
			.attr("fill-opacity", "0.4")
			.attr("x", 0)
			.attr("y", function(d, i) {
				return i * cellHeight;
			})
			.attr("height", cellHeight)
			.attr("width", cellWidth)
			.attr("class", ".rowTipCell");

		var rowTips = gRow.append("text")
			.attr("x", (cellWidth / 2))
			.attr("y", function(d, i) {
				return i * cellHeight + (cellHeight / 2);
			})
			.style("font-family", "sans-serif")
			.style("font-size", "24")
			.style("fill", "#fff")
			.style("text-anchor", "middle")
			.style("alignment-baseline", "central")
			.attr("class", "rowTip")
			.text("");

		rowTips.transition().duration(1000)
			.text(function(d) {return d;});

		var gCol = heatCols.selectAll("g.colTip")
			.data(colTotals)
			.enter().append("g")
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

		gCol.append("rect")
			.attr("fill", "#000")
			.attr("fill-opacity", "0.4")
			.attr("x", function(d, i) {
				return i * cellWidth;
			})
			.attr("y", 0)
			.attr("height", cellHeight)
			.attr("width", cellWidth)
			.attr("class", ".colTipCell");

		var colTips = gCol.append("text")
			.attr("x", function(d, i) {
				return i * cellWidth + (cellWidth / 2);
			})
			.attr("y", (cellHeight / 2))
			.style("font-family", "sans-serif")
			.style("font-size", "24")
			.style("fill", "#fff")
			.style("text-anchor", "middle")
			.style("alignment-baseline", "central")
			.attr("class", "colTip")
			.text("");

		colTips.transition().duration(1000)
			.text(function(d) {return d;});
	});
}

function ddStats(seasonNo) {
	var stats = d3.select("#season-stats")
		.append("p")
		.text("");

	//	Data reading method for github.io or just not local webserver					//
	//	(So I can copy the whole file and just change one part when making changes)		//
	//////////////////////////////////////////////////////////////////////////////////////
	/*
	//	Read data from season
	////////////////////////////
	d3.csv("/jeopardy-d3js/j-archive-csv/j-archive-season-" + seasonNo + ".csv", function(data) {

		//	Go through each question, totalling the number of
		//	times a daily double occurs on each grid location
		data.forEach(function(d) {
			d.daily_double = (d.daily_double == "true" || d.daily_double == "True") ? Boolean(true):Boolean(false);
			d.newCoord = [0, 0];
			d.newCoord[0] = +d.coord[1];
			d.newCoord[1] = +d.coord[4];
			if (d.daily_double) {
				locationTotals[d.newCoord[0]-1][d.newCoord[1]-1] += 1;
			}
		});
	*/

	//	Read data from season
	////////////////////////////
	d3.json("/season?no=" + seasonNo, function(data) {

		//	Go through each question, totalling the number of
		//	times a daily double occurs on each grid location

		var ddMax = 0,
			ddMin = Infinity,
			ddSum = 0,
			ddAvg = [];

		data.forEach(function(d) {
			d.value = d.value[0];
			if (d.daily_double) {
				if (d.value > ddMax) {
					ddMax = d.value;
				}
				if (d.value < ddMin) {
					ddMin = d.value;
				}
				ddAvg.push(d.value);
				ddSum += d.value;
			}
		});

		stats.text("Max: " + ddMax + ", Min: " + ddMin + ", Avg: " + (ddSum/ddAvg.length).toFixed(2));
	});
}

//////////////////////////////////////////////////////////////////
//	Function for creating a bar graph, from early learning d3	//
//////////////////////////////////////////////////////////////////
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