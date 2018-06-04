//	The function that runs when the page loads
$(function() {
	var initSeason = 1
	seasonSlider();
	ddHeatmap(initSeason);
	ddStats(initSeason);
	fjStats(initSeason);
	ddOrder(initSeason);
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
				if (v > ddMax) {
					ddMax = v;
				}
				if (v < ddMin) {
					ddMin = v;
				}
				ddAvg.push(v);
				ddSum += v;
			});
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
	var indChartH = 240,
		jOrder = (new Array(30)).init(0),
		djOrder = (new Array(30)).init(0),
		valueFactor = 5,
		format = d3.format(",d");

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
			return indChartH - (d * valueFactor);
		})
		.attr("height", function(d) {
			return d * valueFactor;
		});

	d3.selectAll("#dd-order g.j-order text.bar")
		.data(jOrder)
		.transition().duration(1000).delay(0)
		.attr("y", function(d) {
			return indChartH - (d * valueFactor) - 6;
		})
		.tween("text", function(d) {
			var that = d3.select(this),
				i = d3.interpolateNumber(that.text(), d);
			return function(t) { that.text(format(i(t))); };
		});

	d3.selectAll("#dd-order g.dj-order rect")
		.data(djOrder)
		.transition().duration(1000)
		.attr("y", function(d) {
			return indChartH - (d * valueFactor);
		})
		.attr("height", function(d) {
			return d * valueFactor;
		});

	d3.selectAll("#dd-order g.dj-order text.bar")
		.data(djOrder)
		.transition().duration(1000).delay(0)
		.attr("y", function(d) {
			return indChartH - (d * valueFactor) - 6;
		})
		.tween("text", function(d) {
			var that = d3.select(this),
				i = d3.interpolateNumber(that.text(), d);
			return function(t) { that.text(format(i(t))); };
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

function updateDataAllSeasons() {
	var indChartH = 240,
		valueFactor = 5;

	var locationTotals = [
		[6, 338, 959, 1300, 903],
		[2, 191, 585, 818, 511],
		[4, 271, 817, 1187, 801],
		[3, 223, 799, 1095, 814],
		[4, 267, 779, 1097, 724],
		[4, 178, 578, 761, 546]
	],
		colTotals = [3506, 2107, 3080, 2934, 2871, 2067],
		rowTotals = [23, 1468, 4517, 6258, 4299],
		ddMax = 19000,
		ddMin = 5,
		ddAvg = 1923,
		fjMax = 30000,
		fjMin = 0,
		fjAvg = 4931,
		jOrder = [19,78,151,252,241,123,130,180,253,273,141,148,197,226,244,119,134,193,210,255,135,181,191,241,248,155,164,190,286,188],
		djOrder = [48,159,378,490,425,267,270,393,420,432,317,326,384,475,437,301,292,437,461,456,288,325,428,517,435,315,352,446,455,290];

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

	var format = d3.format(",d");

	d3.selectAll("#dd-stats text.values")
		.data([ddMax, ddMin, ddAvg])
		.transition()
		.duration(1000).delay(0)
		.tween("text", function(d) {
			var that = d3.select(this),
				i = d3.interpolateNumber(that.text().replace(/,/g, ""), d);
			return function(t) { that.text(format(i(t))); };
		});

	d3.selectAll("#fj-stats text.values")
		.data([fjMax, fjMin, fjAvg])
		.transition()
		.duration(1000).delay(0)
		.tween("text", function(d) {
			var that = d3.select(this),
				i = d3.interpolateNumber(that.text().replace(/,/g, ""), d);
			return function(t) { that.text(format(i(t))); };
		});

	d3.selectAll("#dd-order g.j-order rect")
		.data(jOrder)
		.transition().duration(1000)
		.attr("y", function(d) {
			return indChartH - (d * valueFactor);
		})
		.attr("height", function(d) {
			return d * valueFactor;
		});

	d3.selectAll("#dd-order g.j-order text.bar")
		.data(jOrder)
		.transition().duration(1000).delay(0)
		.attr("y", function(d) {
			return indChartH - (d * valueFactor) - 6;
		})
		.tween("text", function(d) {
			var that = d3.select(this),
				i = d3.interpolateNumber(that.text(), d);
			return function(t) { that.text(format(i(t))); };
		});

	d3.selectAll("#dd-order g.dj-order rect")
		.data(djOrder)
		.transition().duration(1000)
		.attr("y", function(d) {
			return indChartH - (d * valueFactor);
		})
		.attr("height", function(d) {
			return d * valueFactor;
		});

	d3.selectAll("#dd-order g.dj-order text.bar")
		.data(djOrder)
		.transition().duration(1000).delay(0)
		.attr("y", function(d) {
			return indChartH - (d * valueFactor) - 6;
		})
		.tween("text", function(d) {
			var that = d3.select(this),
				i = d3.interpolateNumber(that.text(), d);
			return function(t) { that.text(format(i(t))); };
		});
}

/*
//Function for calculating heatmap values for all seasons together.
function allSeasonsData() {
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

	var ddMax = 0,
		ddMin = Infinity,
		ddSum = 0,
		ddAvg = [];

	var fjMax = 0,
		fjMin = Infinity,
		fjSum = 0,
		fjAvg = [];

	var jOrder = (new Array(30)).init(0),
		djOrder = (new Array(30)).init(0);

	d3.queue()
		.defer(d3.json, "/season?no=1")
		.defer(d3.json, "/season?no=2")
		.defer(d3.json, "/season?no=3")
		.defer(d3.json, "/season?no=4")
		.defer(d3.json, "/season?no=5")
		.defer(d3.json, "/season?no=6")
		.defer(d3.json, "/season?no=7")
		.defer(d3.json, "/season?no=8")
		.defer(d3.json, "/season?no=9")
		.defer(d3.json, "/season?no=10")
		.defer(d3.json, "/season?no=11")
		.defer(d3.json, "/season?no=12")
		.defer(d3.json, "/season?no=13")
		.defer(d3.json, "/season?no=14")
		.defer(d3.json, "/season?no=15")
		.defer(d3.json, "/season?no=16")
		.defer(d3.json, "/season?no=17")
		.defer(d3.json, "/season?no=18")
		.defer(d3.json, "/season?no=19")
		.defer(d3.json, "/season?no=20")
		.defer(d3.json, "/season?no=21")
		.defer(d3.json, "/season?no=22")
		.defer(d3.json, "/season?no=23")
		.defer(d3.json, "/season?no=24")
		.defer(d3.json, "/season?no=25")
		.defer(d3.json, "/season?no=26")
		.defer(d3.json, "/season?no=27")
		.defer(d3.json, "/season?no=28")
		.defer(d3.json, "/season?no=29")
		.defer(d3.json, "/season?no=30")
		.defer(d3.json, "/season?no=31")
		.defer(d3.json, "/season?no=32")
		.defer(d3.json, "/season?no=33")
		.await(function(error, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20, s21, s22, s23, s24, s25, s26, s27, s28, s29, s30, s31, s32, s33) {
			if (error) {
				console.error("Something went wrong: " + error);
			} else {
				files = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16, s17, s18, s19, s20, s21, s22, s23, s24, s25, s26, s27, s28, s29, s30, s31, s32, s33];
				files.forEach(function(data) {
					data.forEach(function(d) {
						if (d.daily_double) {
							locationTotals[d.coord[0]-1][d.coord[1]-1] += 1;
							colTotals[d.coord[0]-1] += 1;
							rowTotals[d.coord[1]-1] += 1;

							d.value = d.value[0];
							if (d.value > ddMax) {
								ddMax = d.value;
							}
							if (d.value < ddMin) {
								ddMin = d.value;
							}
							ddAvg.push(d.value);
							ddSum += d.value;

							if (d.round_name == "Jeopardy") {
								jOrder[d.order -1] += 1;
							}
							if (d.round_name == "Double Jeopardy") {
								djOrder[d.order -1] += 1;
							}
						}
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
				});
			}
			console.log(locationTotals);
			console.log(colTotals);
			console.log(rowTotals);

			console.log("DDMax: " + ddMax);
			console.log("DDMin: " + ddMin);
			console.log("DDAvg: " + (ddSum/ddAvg.length).toFixed(2))
			console.log("FJMax: " + fjMax);
			console.log("FJMin: " + fjMin);
			console.log("FJAvg: " + (fjSum/fjAvg.length).toFixed(2))
			console.log(jOrder);
			console.log(djOrder);
		});
}
*/

function seasonSlider() {
	var numSeasons = 33,
		seasons = Array.from(new Array(numSeasons), (val,index)=>index+1);

	var slider2 = d3.sliderHorizontal()
		.min(1)
		.max(numSeasons)
		.step(1)
		.width(690)
		.tickValues(seasons)
		.on('end', val => {
			updateData(val);
		});

	var g = d3.select("div#slider").append("svg")
		.attr("width", 675)
		.attr("height", 55)
		.attr("viewBox", "0 0 710 55")
		.attr("preserveAspectRatio", "xMinYMax meet")
		.append("g")
		.attr("transform", "translate(10,10)")
		.call(slider2);
}

function allSeasons() {
	var svg = d3.select("div#all-seasons-button").append("svg")
		.attr("width", 55)
		.attr("height", 55)
		.attr("viewBox", "0 0 55 55")
		.attr("preserveAspectRatio", "xMinYMax meet");

	var g = svg.append("g");

	g.append("rect")
		.attr("x", 5)
		.attr("y", 5)
		.attr("width", 45)
		.attr("height", 45)
		.attr("rx", 10)
		.attr("ry", 10)
		.attr("z-index", 2);

	g.append("text")
		.attr("x", 27.5)
		.attr("y", 27.5)
		.attr("text-anchor", "middle")
		.attr("alignment-baseline", "central")
		.text("All");

	var gClick = svg.append("g")
		.attr("opacity", 0)
		.append("rect")
		.attr("x", 5)
		.attr("y", 5)
		.attr("width", 45)
		.attr("height", 45)
		.attr("rx", 10)
		.attr("ry", 10)
		.on("click", function() {
			$(this.parentNode.parentNode).toggleClass("active");
			$("div#slider svg").toggleClass("disabled");
			if(d3.select(this.parentNode.parentNode).classed("active")) {
				updateDataAllSeasons();
			} else {
				updateData(parseInt($(".parameter-value text").text()));
			}
		});
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

	var title = d3.select("#heatmap #title")
		.append("svg")
		.attr("viewBox", "0 0 600 60")
		.attr("preserveAspectRatio", "xMinYMax meet")
		.append("text")
		.attr("class", "title")
		.attr("x", 0)
		.attr("y", 40)
		.text("Daily Double Location Heatmap");

	//////////////////////////////////////////
	//	Create Daily Double Heatmap Grid	//
	//////////////////////////////////////////

	//	Main svg element
	var grid = d3.select("#grid")
		.append("svg")
		.attr("width", (cols + 1) * cellWidth + 10)
		.attr("height", (rows + 1) * cellHeight + 10)
		.attr("viewBox", "0 0 " + ((cols + 1) * cellWidth + 1) + " " + ((rows + 1) * cellHeight + 10))
		.attr("preserveAspectRatio", "xMinYMax meet");

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
			.attr("height", 100)
			.attr("viewBox", "0 0 600 60")
			.attr("preserveAspectRatio", "xMinYMax meet");

		var title = stats.append("text")
			.attr("x", 0)
			.attr("y", 0)
			.attr("class", "title")
			.text("Daily Double Stats");

		var labels = stats.selectAll("text.labels")
			.data(["Max: ", "Min: ", "Avg: "])
			.enter().append("text")
			.attr("class", "labels")
			.attr("x", function(d, i) {
				return (i * 200) + 100 - ctx.measureText(d).width;
			})
			.attr("y", 44)
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
			.attr("y", 44)
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
			.attr("height", 100)
			.attr("viewBox", "0 0 600 60")
			.attr("preserveAspectRatio", "xMinYMax meet");

		var title = stats.append("text")
			.attr("x", 0)
			.attr("y", 0)
			.attr("class", "title")
			.text("Final Jeopardy Stats");

		var labels = stats.selectAll("text.labels")
			.data(["Max: ", "Min: ", "Avg: "])
			.enter().append("text")
			.attr("class", "labels")
			.attr("x", function(d, i) {
				return (i * 200) + 100 - ctx.measureText(d).width;
			})
			.attr("y", 44)
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
			.attr("y", 44)
			.text(function(d) {
				return format(d);
			});
	});
}

function ddOrder(seasonNo) {
	var w = 600,
		h = 580,
		indChartH = 240,
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
			.attr("height", h + 10)
			.attr("viewBox", "0 0 " + w + " " + h)
			.attr("preserveAspectRatio", "xMinYMax meet");

		chart.append("text")
			.attr("x", 0)
			.attr("y", 20)
			.attr("class", "title")
			.text("Daily Double Pick Order");

		var j = chart.append("svg")
			.attr("width", w)
			.attr("height", indChartH + 48)
			.attr("viewBox", "0 0 " + w + " " + (indChartH + 48))
			.attr("preserveAspectRatio", "xMinYMax meet");

		j.append("text")
			.attr("x", 10)
			.attr("y", 48)
			.attr("font-size", 22)
			.attr("font-family", "sans-serif")
			.attr("fill", "#fff")
			.text("Jeopardy Round");

		var jg = j.append("g")
			.attr("class", "j-order")

		jg.selectAll("rect")
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

		jg.selectAll("text.bar")
			.data(jOrder)
			.enter().append("text")
			.attr("class", "bar")
			.attr("text-anchor", "middle")
			.attr("font-size", 10)
			.attr("font-family", "sans-serif")
			.attr("fill", "#fff")
			.attr("x", function(d, i) {
				return i * (w / 30) + (w / 60) - 2;
			})
			.attr("y", function(d) {
				return indChartH - (d * valueFactor) - 6;
			})
			.text(function(d) { return d; });

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
			.attr("y", indChartH)
			.attr("width", w)
			.attr("height", indChartH + 48)
			.attr("viewBox", "0 0 " + w + " " + (indChartH + 48))
			.attr("preserveAspectRatio", "xMinYMax meet");

		dj.append("text")
			.attr("x", 10)
			.attr("y", 48)
			.attr("font-size", 22)
			.attr("font-family", "sans-serif")
			.attr("fill", "#fff")
			.text("Double Jeopardy Round");

		var djg = dj.append("g")
			.attr("class", "dj-order")

		djg.selectAll("rect")
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

		djg.selectAll("text.bar")
			.data(djOrder)
			.enter().append("text")
			.attr("class", "bar")
			.attr("text-anchor", "middle")
			.attr("font-size", 10)
			.attr("font-family", "sans-serif")
			.attr("fill", "#fff")
			.attr("x", function(d, i) {
				return i * (w / 30) + (w / 60) - 2;
			})
			.attr("y", function(d) {
				return indChartH - (d * valueFactor) - 6;
			})
			.text(function(d) { return d; });

		dj.append("g")
			.attr("transform", function() {
				return "translate(9, " + (indChartH + 4) + ")";
			})
			.call(xAxis);
	})
}

/*
//	Work in progress	//
function missedStats(seasonNo) {
	var height = 200,
		width = 600,
		radius = 100;

	var svg = d3.select("#missed-stats")
		.append("svg");

	var missedQ = svg.append("g")
		.attr("class", "missed-fj")

	missedQ.append("g")
		.attr("class", "slices");
	missedQ.append("g")
		.attr("class", "labelName");
	missedQ.append("g")
		.attr("class", "labelValue");
	missedQ.append("g")
		.attr("class", "lines");
}
*/

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

//	I've realized I don't actually need this, but I like it so it's staying here
Number.prototype.toUniqueChars = function()
{
	//	Not for negative numbers
	var alpha = "abcdefghijklmnopqrstuvwxyz",
		res = "";
	if (this < 27) {
		res = alpha[this-1];
	}
	else {
		for (i = 0; i < Math.floor(this/26) + 1; i++) {
			res += alpha[(this-1)%26];
		}
	}
	return res;
}