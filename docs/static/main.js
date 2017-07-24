//	The function that runs when the page loads
$(function() {
	seasonSlider();
	ddHeatmap(1);
	ddStats(1);
	fjStats(1);
	ddOrder(1);
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

	/*
		d.daily_double = (d.daily_double == "true" || d.daily_double == "True") ? Boolean(true):Boolean(false);
		d.newCoord = [0, 0];
		d.newCoord[0] = +d.coord[1];
		d.newCoord[1] = +d.coord[4];
		if (d.daily_double) {
			locationTotals[d.newCoord[0]-1][d.newCoord[1]-1] += 1;
			colTotals[d.newCoord[0]-1] += 1;
			rowTotals[d.newCoord[1]-1] += 1;
		}
	*/

	//	Go through each question, totalling the number of
	//	times a daily double occurs on each grid location
	data.forEach(function(d) {
		d.daily_double = (d.daily_double == "true" || d.daily_double == "True") ? Boolean(true):Boolean(false);
		d.newCoord = [0, 0];
		d.newCoord[0] = +d.coord[1];
		d.newCoord[1] = +d.coord[4];
		if (d.daily_double) {
			locationTotals[d.newCoord[0]-1][d.newCoord[1]-1] += 1;
			colTotals[d.newCoord[0]-1] += 1;
			rowTotals[d.newCoord[1]-1] += 1;
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

function updateDdStats(data) {
	var ddMax = 0,
		ddMin = Infinity,
		ddSum = 0,
		ddAvg = [];

	/*
		d.daily_double = (d.daily_double == "true" || d.daily_double == "True") ? Boolean(true):Boolean(false);
		if (d.daily_double) {
			d.value = d.value.slice(1, d.value.indexOf(","));
			if (d.value > ddMax) {
				ddMax = d.value;
			}
			if (d.value < ddMin) {
				ddMin = d.value;
			}
			ddAvg.push(d.value);
			ddSum += d.value;
		}
	*/

	data.forEach(function(d) {
		if (d.daily_double) {
			d.value = d.value.toArray();
			d.value.forEach(function(v) {
				if (d.value > ddMax) {
					ddMax = d.value;
				}
				if (d.value < ddMin) {
					ddMin = d.value;
				}
				ddAvg.push(d.value);
				ddSum += d.value;
			}
		}
	});

	var format = d3.format(",d");

	d3.selectAll("#dd-stats text.values")
		.data([ddMax, ddMin, (ddSum/ddAvg.length).toFixed(2)])
		.transition()
		.duration(1000).delay(0)
		.tween("text", function(d) {
			var that = d3.select(this),
				i = d3.interpolateNumber(that.text().replace(/,/g, ""), d);
			return function(t) { that.text(format(i(t))); };
		});
}

function updateFjStats(data) {
	var fjMax = 0,
		fjMin = Infinity,
		fjSum = 0,
		fjAvg = [];

	/*
		d.daily_double = (d.daily_double == "true" || d.daily_double == "True") ? Boolean(true):Boolean(false);
		if (d.daily_double) {
			d.value = d.value.slice(1, d.value.indexOf(","));
			if (d.value > ddMax) {
				ddMax = d.value;
			}
			if (d.value < ddMin) {
				ddMin = d.value;
			}
			ddAvg.push(d.value);
			ddSum += d.value;
		}
	*/

	data.forEach(function(d) {
		if (d.round_name == "Final Jeopardy") {
			d.value.forEach(function(v) {
				if (v > fjMax) {
					fjMax = v;
				}
				if (v < fjMin) {
					fjMin = v;
				}
				fjAvg.push(v);
				fjSum += v;
			});
		}
	});

	var format = d3.format(",d");

	d3.selectAll("#fj-stats text.values")
		.data([fjMax, fjMin, (fjSum/fjAvg.length).toFixed(2)])
		.transition()
		.duration(1000).delay(0)
		.tween("text", function(d) {
			var that = d3.select(this),
				i = d3.interpolateNumber(that.text().replace(/,/g, ""), d);
			return function(t) { that.text(format(i(t))); };
		});
}

function updateDdOrder(data) {
	var h = 400,
		jOrder = (new Array(30)).init(0),
		djOrder = (new Array(30)).init(0),
		valueFactor = 5;

	data.forEach(function(d) {
		if (d.daily_double) {
			if (d.round_name == "Jeopardy") {
				jOrder[parseInt(d.order) -1] += 1;
			}
			if (d.round_name == "Double Jeopardy") {
				djOrder[parseInt(d.order) -1] += 1;
			}
		}
	})

	d3.selectAll("#dd-order g.j-order rect")
		.data(jOrder)
		.transition().duration(1000)
		.attr("y", function(d) {
			return (h / 2) - (d * valueFactor);
		})
		.attr("height", function(d) {
			return d * valueFactor;
		});

	d3.selectAll("#dd-order g.dj-order rect")
		.data(djOrder)
		.transition().duration(1000)
		.attr("y", function(d) {
			return (h / 2) - (d * valueFactor);
		})
		.attr("height", function(d) {
			return d * valueFactor;
		});
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
	*/

	//	Read data from season
	///////////////////////////
	d3.csv("/jeopardy-d3js/j-archive-csv/j-archive-season-" + seasonNo + ".csv", function(data) {
		updateHeatmap(data);
		updateDdStats(data);
		updateFjStats(data);
		updateDdOrder(data);
	})
}

function seasonSlider() {
	//////////////////////////////////////////////
	//	Create Slider for Changing Season Data	//
	//////////////////////////////////////////////
	var numSeasons = 33;
	var seasons = Array.from(new Array(numSeasons), (val,index)=>index+1);

	
	var slider = d3.select("#slider");

	//	Slider
	slider.append("input")
		.attr("name", "seasons-slider")
		.attr("id", "seasons-slider")
		.attr("type", "range")
		.attr("value", Math.min.apply(Math, seasons))
		.attr("min", Math.min.apply(Math, seasons))
		.attr("max", Math.max.apply(Math, seasons))
		.attr("list", seasons)
		.on("change", function() {
			updateData(this.value);
		});

	var xScale = d3.scalePoint()
		.domain(seasons)
		.range([0, 600 - 11]);

	var xAxis = d3.axisBottom(xScale);

	slider.append("svg")
		.attr("width", 600)
		.attr("height", 30)
		.append("g")
		.attr("transform", "translate(5, 4)")
		.call(xAxis);
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
				colTotals[d.coord[0]-1] += 1;
				rowTotals[d.coord[1]-1] += 1;
			}
		});
	*/

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
				colTotals[d.newCoord[0]-1] += 1;
				rowTotals[d.newCoord[1]-1] += 1;
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
	//	Data reading method for github.io or just not local webserver					//
	//	(So I can copy the whole file and just change one part when making changes)		//
	//////////////////////////////////////////////////////////////////////////////////////
	/*
	//	Read data from season
	////////////////////////////
	d3.csv("/jeopardy-d3js/j-archive-csv/j-archive-season-" + seasonNo + ".csv", function(data) {

		var ddMax = 0,
			ddMin = Infinity,
			ddSum = 0,
			ddAvg = [];

		data.forEach(function(d) {
			d.daily_double = (d.daily_double == "true" || d.daily_double == "True") ? Boolean(true):Boolean(false);
			if (d.daily_double) {
				d.value = d.value.slice(1, d.value.indexOf(","));
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
	*/

	//	Read data from season
	////////////////////////////
	d3.csv("/jeopardy-d3js/j-archive-csv/j-archive-season-" + seasonNo + ".csv", function(data) {

		var ddMax = 0,
			ddMin = Infinity,
			ddSum = 0,
			ddAvg = [];

		data.forEach(function(d) {
			d.daily_double = (d.daily_double == "true" || d.daily_double == "True") ? Boolean(true):Boolean(false);
			if (d.daily_double) {
				d.value = parseInt(d.value.slice(1, d.value.indexOf(",")));
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

		var format = d3.format(",d");

		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		ctx.font = "24px sans-serif";

		var stats = d3.select("#dd-stats")
			.append("svg")
			.attr("width", 600)
			.attr("height", 60);

		var title = stats.append("text")
			.attr("x", 0)
			.attr("y", 20)
			.attr("class", "title")
			.text("Daily Double Stats");

		var labels = stats.selectAll("text.labels")
			.data(["Max: ", "Min: ", "Avg: "])
			.enter().append("text")
			.attr("class", "labels")
			.attr("x", function(d, i) {
				return (i * 200) + 100 - ctx.measureText(d).width;
			})
			.attr("y", 55)
			.text(function(d) {
				return d;
			})

		var values = stats.selectAll("text.values")
			.data([ddMax, ddMin, (ddSum/ddAvg.length).toFixed(2)])
			.enter().append("text")
			.attr("class", "values")
			.attr("x", function(d, i) {
				return (i * 200) + 100;
			})
			.attr("y", 55)
			.text(function(d) {
				return format(d);
			});
	});
}

function fjStats(seasonNo) {
	//	Data reading method for github.io or just not local webserver					//
	//	(So I can copy the whole file and just change one part when making changes)		//
	//////////////////////////////////////////////////////////////////////////////////////
	/*
	//	Read data from season
	////////////////////////////
	d3.csv("/jeopardy-d3js/j-archive-csv/j-archive-season-" + seasonNo + ".csv", function(data) {

		var ddMax = 0,
			ddMin = Infinity,
			ddSum = 0,
			ddAvg = [];

		data.forEach(function(d) {
			d.daily_double = (d.daily_double == "true" || d.daily_double == "True") ? Boolean(true):Boolean(false);
			if (d.daily_double) {
				d.value = d.value.slice(1, d.value.indexOf(","));
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
	*/

	//	Read data from season
	////////////////////////////
	d3.csv("/jeopardy-d3js/j-archive-csv/j-archive-season-" + seasonNo + ".csv", function(data) {

		//	Go through each question, totalling the number of
		//	times a daily double occurs on each grid location

		var fjMax = 0,
			fjMin = Infinity,
			fjSum = 0,
			fjAvg = [];

		data.forEach(function(d) {
			if (d.round_name == "Final Jeopardy") {
				d.value = d.value.toArray();
				d.value.forEach(function(v) {
					if (v > fjMax) {
						fjMax = v;
					}
					if (v < fjMin) {
						fjMin = v;
					}
					fjAvg.push(v);
					fjSum += v;
				});
			}
		});

		var format = d3.format(",d");

		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		ctx.font = "24px sans-serif";

		var stats = d3.select("#fj-stats")
			.append("svg")
			.attr("width", 600)
			.attr("height", 60);

		var title = stats.append("text")
			.attr("x", 0)
			.attr("y", 20)
			.attr("class", "title")
			.text("Final Jeopardy Stats");

		var labels = stats.selectAll("text.labels")
			.data(["Max: ", "Min: ", "Avg: "])
			.enter().append("text")
			.attr("class", "labels")
			.attr("x", function(d, i) {
				return (i * 200) + 100 - ctx.measureText(d).width;
			})
			.attr("y", 55)
			.text(function(d) {
				return d;
			})

		var values = stats.selectAll("text.values")
			.data([fjMax, fjMin, (fjSum/fjAvg.length).toFixed(2)])
			.enter().append("text")
			.attr("class", "values")
			.attr("x", function(d, i) {
				return (i * 200) + 100;
			})
			.attr("y", 55)
			.text(function(d) {
				return format(d);
			});
	});
}

function ddOrder(seasonNo) {
	var w = 600,
		h = 500,
		indChartH = 200,
		barPadding = 2,
		jOrder = (new Array(30)).init(0),
		djOrder = (new Array(30)).init(0),
		valueFactor = 5;

	d3.csv("/jeopardy-d3js/j-archive-csv/j-archive-season-" + seasonNo + ".csv", function(data) {
		data.forEach(function(d) {
			d.daily_double = (d.daily_double == "true" || d.daily_double == "True") ? Boolean(true):Boolean(false);
			if (d.daily_double) {
				if (d.round_name == "Jeopardy") {
					jOrder[d.order -1] += 1;
				}
				if (d.round_name == "Double Jeopardy") {
					djOrder[d.order -1] += 1;
				}
			}
		})

		var chart = d3.select("#dd-order")
			.append("svg")
			.attr("width", w)
			.attr("height", h);

		chart.append("text")
			.attr("x", 0)
			.attr("y", 20)
			.attr("font-size", 24)
			.attr("font-family", "sans-serif")
			.attr("fill", "#fff")
			.text("Daily Double Pick Order");

		var j = chart.append("svg")
			.attr("width", w)
			.attr("height", indChartH + 48);

		j.append("text")
			.attr("x", 10)
			.attr("y", 48)
			.attr("font-size", 22)
			.attr("font-family", "sans-serif")
			.attr("fill", "#fff")
			.text("Jeopardy Round");

		j.append("g")
			.attr("class", "j-order")
			.selectAll("rect")
			.data(jOrder)
			.enter().append("rect")
			.attr("x", function(d, i) {
				return i * (w / 30);
			})
			.attr("y", function(d) {
				return indChartH - (d * valueFactor);
			})
			.attr("width", w / 30 - barPadding)
			.attr("height", function(d) {
				return d * valueFactor;
			})
			.attr("fill", "#fff");

		var xScale = d3.scalePoint()
			.domain(d3.ticks(1,30,30))
			.range([0, 600 - 21]);

		var xAxis = d3.axisBottom(xScale);

		j.append("g")
			.attr("transform", function() {
				return "translate(9, " + (indChartH + 4) + ")";
			})
			.call(xAxis);

		var dj = chart.append("svg")
			.attr("x", 0)
			.attr("y", 200)
			.attr("width", w)
			.attr("height", indChartH + 48);

		dj.append("text")
			.attr("x", 10)
			.attr("y", 48)
			.attr("font-size", 22)
			.attr("font-family", "sans-serif")
			.attr("fill", "#fff")
			.text("Double Jeopardy Round");

		dj.append("g")
			.attr("class", "dj-order")
			.selectAll("rect")
			.data(djOrder)
			.enter().append("rect")
			.attr("x", function(d, i) {
				return i * (w / 30);
			})
			.attr("y", function(d) {
				return indChartH - (d * valueFactor);
			})
			.attr("width", w / 30 - barPadding)
			.attr("height", function(d) {
				return d * valueFactor;
			})
			.attr("fill", "#fff");

		dj.append("g")
			.attr("transform", function() {
				return "translate(9, " + (indChartH + 4) + ")";
			})
			.call(xAxis);
	})
}

Array.prototype.init = function(x,n)
{
    if(typeof(n)=='undefined') { n = this.length; }
    while (n--) { this[n] = x; }
    return this;
}

String.prototype.toArray = function()
{
	var nums = [];
	this.slice(1, this.length-1).split(", ").forEach(function(s) {
		nums.push(parseInt(s));
	})
	return nums;
}