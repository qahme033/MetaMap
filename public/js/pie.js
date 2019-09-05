
function rotatingPie(data, div){
	console.log("PIE")
	var width = window.innerWidth;
	height =  window.innerHeight;
    	radius = Math.min(width, height) / 2 - 50;

	var x = d3.scaleLinear().range([0, 2 * Math.PI]);
	var y = d3.scaleLinear().range([0, radius]);
	var color = d3.scaleOrdinal(d3.schemeCategory20c);

	var svg = d3.select(div).append("svg")
	.attr("width", width)
	.attr("height", height)
	.attr("id", "svgBarChart")
	.style("position", "fixed")
	.style("top", "0px")
	.style("right", "0px")
	.style("z-index", "-1")
	//.style("background-color", "white")

	.append("g")
	.attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");

	var partition = d3.partition();
	var stratify = d3.stratify()
		.parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf("@")); });
	var root = stratify(data);

	var arc = d3.arc()
	    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
	    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
	    .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
	    .outerRadius(function(d) { return Math.max(0, y(d.y1)); });

	root.sum(function(d) { return d.value; });

	var g = svg.selectAll("g")
		.data(partition(root).descendants())
		.enter().append("g");

	var path = g.append("path")
		.attr("d", arc)
		.style("fill", function(d) { return color(d.depth >= 1 && d.data.id.split("@", 6)); })
		.on("click", click);

		var text = g.append("text")
		.attr("transform", function(d) { return "rotate(" + computeTextRotation(d) + ")"; })
		.attr("x", function(d) { return y(d.y0); })
		.attr("dx", "6") // margin
		.attr("dy", ".35em") // vertical-align
		.style("font", "10px sans-serif")
		.text(function(d) { return d.data.id.substring(d.id.lastIndexOf("@") + 1); });

	function click(d) {
		text.transition().attr("opacity", 0);

		path.transition()
			.duration(750)
			.attrTween("d", arcTween(d))
			.on("end", function(e, i) {
			  // check if the animated element's data e lies within the visible angle span given in d
				if (e.x0 >= d.x0 && e.x0 < (d.x1)) {
					// get a selection of the associated text element
					var arcText = d3.select(this.parentNode).select("text");
					// fade in the text element and recalculate positions
					arcText.transition().duration(750)
						.attr("opacity", 1)
						.attr("transform", function() { return "rotate(" + computeTextRotation(e) + ")" })
						.attr("x", function(d) { return y(d.y0); });
				}
			});
	}

	// Interpolate the scales!
	function arcTween(d) {
		var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
			yd = d3.interpolate(y.domain(), [d.y0, 1]),
			yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);

		return function(d, i) {
			return i
			    ? function(t) {return arc(d); }
			    : function(t) {x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
		};
	}

	function computeTextRotation(d) {
		return (x((d.x0 + d.x1) / 2) - Math.PI / 2) / Math.PI * 180;
	}
}


function staticPieX(data, div, connector){
	var width = window.innerWidth,
		height =  window.innerHeight,
    	radius = Math.min(width, height) / 2 - 10;

    //breadcrumb dimensions: width, height, spacing, width of tip/tail
    var b = {
    	w: 180, h: 30, s: 2, t: 6
    };
    //top legend text dimensions: width, height, spacing, width of tip/tail
    var p = {
    	w: 140, h: 30, s: 2, t: 6
    }

	var x = d3.scaleLinear().range([0, 2 * Math.PI]);
	var y = d3.scaleLinear().range([0, radius]);

	/**********************************************************************/
	/**********************color scheme*********************************/
	/**********************************************************************/
	var color = d3.scaleOrdinal(d3.schemeCategory20c);
	var myColorset1 = ["#9E9E9E", "#DD2C00", "#827717", "#006064", "#311B92"];
	var myColorset2 = ["#795548", "#F57F17", "#004D40", "#1A237E", "#B71C1C"];
	var myColorset3 = ["#BDBDBD", "#78909C", "#8D6E63", "#FF7043", "#D4E157", "#26C6DA", "#7E57C2", "#FFA726", "#9CCC65", "#29B6F6", "#AB47BC", "#FFCA28", "#66BB6A", "#42A5F5", "#EC407A", "#FFEE58", "#26A69A", "#5C6BC0", "#EF5350"];
	var Chloroflexi_Color = d3.interpolateRgb(d3.rgb("#CE93D8"), d3.rgb("#8E24AA")); //purple600-200
	var Bacteroidetes_Color = d3.interpolateRgb(d3.rgb("#F48FB1"), d3.rgb("#D81B60")); //pink600-200
	var Proteobacteria_Color = d3.interpolateRgb(d3.rgb("#80CBC4"), d3.rgb("#00897B")); //teal600-200
	var Actinobacteria_Color = d3.interpolateRgb(d3.rgb("#A5D6A7"), d3.rgb("#43A047")); //green600-200
	var Firmicutes_Color = d3.interpolateRgb(d3.rgb("#FFE082"), d3.rgb("#FFB300")); //amber600-200
	var primColor = d3.scaleOrdinal(myColorset1);
	var secdColor = d3.scaleOrdinal(myColorset2);
	var fullColor = d3.scaleOrdinal(myColorset3);
	var standardColorset = {
		"cellular organisms": "#1976D2", //blue700
		"Bacteria": "#0288D1",	//lightblue700
		"Proteobacteria": "#00796B", //teal700
		"Bacteroidetes": "#C2185B",	//pink700
		"Actinobacteria": "#388E3C", //green700
		"Firmicutes": "#FFA000", //amber700
		"Chloroflexi": "#7B1FA2" //purple700
	};

	//#container g in svg
	var svg = d3.select(div).append("svg")
	.attr("width", width)
	.attr("height", height)
	.attr("id", "svgBarChart")
	.style("position", "fixed")
	.style("top", "0px")
	.style("right", "0px")
	.style("z-index", "-1")
	    .append("g")
	    .attr("id", "container")
	    .attr("transform", "translate(" + width / 3.5 + "," + (height / 2 + 10) + ")");

	// Basic setup of page elements.
  	initializeBreadcrumbTrail();

	var invisibleCircle = svg.append("circle")
		.attr("r", radius)
		.style("opacity", 0);

	var partition = d3.partition();
	var stratify = d3.stratify()
		.parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf("@")); });
	var root = stratify(data);

	var arc = d3.arc()
	    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
	    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
	    .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
	    .outerRadius(function(d) { return Math.max(0, y(d.y1)); });

	root.sum(function(d) { return d.value; });

	var g = svg.selectAll("g")
		.data(partition(root).descendants())
		.enter().append("g");

	var path = g.append("path")
		.attr("d", arc)
		.style("fill", function(d){
			/**********************distinct color set***************************/
			return color(d.id);
		})
		.style("stroke-width", 0.0)
		.style("stroke", "#fff")
		.on("click", click);

	path.on("mouseover", mouseover);

	//Add the mouseleave handler to the bounding circle
	d3.select("#container").on("mouseleave", mouseleave);

	var alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p","q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
	var legendIndex = 0;
	var coordinates = [0, 0];

	function click(d){

		legendIndex++;
		coordinates = d3.mouse(this);
		var cx = coordinates[0];
		var cy = coordinates[1];

		labelText = g.append("text")
			.attr("x", cx)
			.attr("y", cy)
			.attr("class", "labeltext")
			.attr("text-anchor", "middle")
			.style("font", "15px sans-serif")
			// .style("font-weight", "600")
			.style("text-shadow", "2px 2px #BDBDBD")
			.text(alphabet[legendIndex-1]);

		var arr = d.id.split("@");
		arr.shift();//remove "cellular organisms"
		arr.unshift(alphabet[legendIndex-1]);//add an alphabet letter as the first element
		var str = arr.join(connector);//convert the array into a string 

		//enter the top legend text as a string
		var topLegend = svg.append("text")
			.attr("x", -250)
			.attr("y", -(height / 2) + legendIndex*14)
			.attr("dy", "0.35em")
			.style("font", "15px sans-serif")
			.attr("text-anchor", "start")
			.text(str);

		var legend = svg.selectAll(".aa")
			.data(d.ancestors())
			.enter().append("g")
			.attr("class", "legend");

		/******************************************************************/
		/****************enter top legend text individually*****************/
		/******************************************************************/
		//set position for entering and updating nodes
		legend.attr("transform", function(d, i){
			return "translate(" + d.depth * (p.w) + ", 0)";
		});
	}


	svg.call(d3.zoom()
	//	.scaleExtent([1/2, 10])
		.on("zoom", function(d){
			var transform = d3.event.transform;
			g.attr("transform", transform);
		}));
	
	//fade all but the current sequence, and show it in the breadcrumb trail
	function mouseover(d){
		var sequenceArray = d.ancestors();

		updateBreadcrumbs(sequenceArray);

		//fade all the segments
		d3.selectAll("path")
			.style("opacity", 0.3);
		//then highlight only those that are an ancestor of the current segment
		d3.selectAll("path")
			.filter(function(node){
				return (sequenceArray.indexOf(node) >= 0);
			})
			.style("opacity", 1);
	}

	//restore everything to full opacity when moving off the visualization
	function mouseleave(d){

		//hide the breadcrumb trail
		d3.select("#trail")
			.style("visibility", "hidden");

		//deactivate all segments during transition
		d3.selectAll("path").on("mouseover", null);

		//transition each segment to full opacity and then reactivate it
		d3.selectAll("path").transition()
			.duration(1000)
			.style("opacity", 1)
			.on("end", function(){
				d3.select(this).on("mouseover", mouseover);
			});
	}

	function getAncestors(node){
		var path = [];
		var current = node;
		while(current.parent){
			path.unshift(current);
			current = current.parent;
		}
		return path;
	}

	function initializeBreadcrumbTrail(){
		//Add the svg area
		var trail = d3.select("#pie-chart-extension-navbar").append("svg")
			.attr("width", width+20)
			.attr("height", 30)
			.attr("id", "trail");
		//Add the label at the, for the percentage
		//add this feature later
	}

	//generate a string that describes the points of a breadcrumb polygon
	function breadcrumbPoints(d, i){
		var points = [];
		points.push("0,0");
		points.push(b.w + ",0");
		points.push(b.w + b.t + "," + (b.h / 2));
		points.push(b.w + "," + b.h);
		points.push("0," + b.h);
		if(i > 0){//leftmost breadcrumb; 
			points.push(b.t + "," + (b.h / 2));
		}
		return points.join(" ");
	}

	//Update the breadcrumb trail to show the current sequence
	function updateBreadcrumbs(nodeArray){
		//data join; key function combines name and depth (= position in sequence)
		var g = d3.select("#trail")
			.selectAll("g")
			.data(nodeArray, function(d){return d.id + d.depth; });

		//add breadcrumb and label for entering nodes
		var entering = g.enter().append("g");

		entering.append("polygon")
			.attr("points", breadcrumbPoints)
			.style("fill", function(d){return color(d.id); });

		entering.append("text")
			.attr("x", (b.w + b.t) / 2)
			.attr("y", b.h / 2)
			.attr("dy", "0.35em")
			.style("font", "14px sans-serif")
			.attr("text-anchor", "middle")
			.text(function(d){return d.data.id.substring(d.id.lastIndexOf("@") + 1); })

		//set position for entering and updating nodes
		g.attr("transform", function(d, i){
			return "translate(" + i * (b.w + b.s) + ", 0)";
		});

		//remove exiting nodes
		g.exit().remove();

		//make the breadcrumb trail visible, if it's hidden
		d3.select("#trail")
			.style("visibility", "");

	}
}

function staticPieY(data, div, connector){
	var width = window.innerWidth,
		height =  window.innerHeight,
    	radius = Math.min(width, height) / 2 - 10;

    //obtain the sum of all values
    var valueArr = [];
    data.forEach(function(d){
    	valueArr.push(d.value);
    });
    var valueTotal = d3.sum(valueArr);

    //breadcrumb dimensions: width, height, spacing, width of tip/tail
    var b = {
    	w: 180, h: 30, s: 2, t: 6
    };
    //top legend text dimensions: width, height, spacing, width of tip/tail
    var p = {
    	w: 140, h: 30, s: 2, t: 6
    }

	var x = d3.scaleLinear().range([0, 2 * Math.PI]);
	var y = d3.scaleLinear().range([0, radius]);

	/**********************************************************************/
	/**********************color scheme*********************************/
	/**********************************************************************/
	var color = d3.scaleOrdinal(d3.schemeCategory20c);
	var myColorset1 = ["#9E9E9E", "#DD2C00", "#827717", "#006064", "#311B92"];
	var myColorset2 = ["#795548", "#F57F17", "#004D40", "#1A237E", "#B71C1C"];
	var myColorset3 = ["#BDBDBD", "#78909C", "#8D6E63", "#FF7043", "#D4E157", "#26C6DA", "#7E57C2", "#FFA726", "#9CCC65", "#29B6F6", "#AB47BC", "#FFCA28", "#66BB6A", "#42A5F5", "#EC407A", "#FFEE58", "#26A69A", "#5C6BC0", "#EF5350"];
	var Chloroflexi_Color = d3.interpolateRgb(d3.rgb("#CE93D8"), d3.rgb("#8E24AA")); //purple600-200
	var Bacteroidetes_Color = d3.interpolateRgb(d3.rgb("#F48FB1"), d3.rgb("#D81B60")); //pink600-200
	var Proteobacteria_Color = d3.interpolateRgb(d3.rgb("#80CBC4"), d3.rgb("#00897B")); //teal600-200
	var Actinobacteria_Color = d3.interpolateRgb(d3.rgb("#A5D6A7"), d3.rgb("#43A047")); //green600-200
	var Firmicutes_Color = d3.interpolateRgb(d3.rgb("#FFE082"), d3.rgb("#FFB300")); //amber600-200
	var primColor = d3.scaleOrdinal(myColorset1);
	var secdColor = d3.scaleOrdinal(myColorset2);
	var fullColor = d3.scaleOrdinal(myColorset3);
	var standardColorset = {
		"cellular organisms": "#1976D2", //blue700
		"Bacteria": "#0288D1",	//lightblue700
		"Proteobacteria": "#00796B", //teal700
		"Bacteroidetes": "#C2185B",	//pink700
		"Actinobacteria": "#388E3C", //green700
		"Firmicutes": "#FFA000", //amber700
		"Chloroflexi": "#7B1FA2" //purple700
	};

	//#container g in svg
	var svg = d3.select(div).append("svg")
	.attr("width", width)
	.attr("height", height)
	.attr("id", "svgBarChart")
	.style("position", "fixed")
	.style("top", "0px")
	.style("right", "0px")
	.style("z-index", "-1")
	    .append("g")
	    .attr("id", "container")
	    .attr("transform", "translate(" + width / 3.5 + "," + (height / 2 + 10) + ")");

	// Basic setup of page elements.
  	initializeBreadcrumbTrail();

	var invisibleCircle = svg.append("circle")
		.attr("r", radius)
		.style("opacity", 0);

	var partition = d3.partition();
	var stratify = d3.stratify()
		.parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf("@")); });
	var root = stratify(data);

	var arc = d3.arc()
	    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
	    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
	    .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
	    .outerRadius(function(d) { return Math.max(0, y(d.y1)); });

	root.sum(function(d) { return d.value; });

	var g = svg.selectAll("g")
		.data(partition(root).descendants())
		.enter().append("g");

	var path = g.append("path")
		.attr("d", arc)
		.style("fill", function(d){
			/**********************based on category***************************/
			var node_array = d.id.split("@");
			if(d.depth <= 2){
				return standardColorset[d.id.substring(d.id.lastIndexOf("@") + 1)];
			}
			else{
				if(node_array.indexOf("Proteobacteria") != -1){
					return (d.value / valueTotal) <= 0.1 ? Proteobacteria_Color(d.value / valueTotal * 10) : Proteobacteria_Color(d.value / valueTotal);
				}else{
					if(node_array.indexOf("Bacteroidetes") != -1){
						return (d.value / valueTotal) <= 0.1 ? Bacteroidetes_Color(d.value / valueTotal * 10) : Bacteroidetes_Color(d.value / valueTotal);
					}else{
						if(node_array.indexOf("Actinobacteria") != -1){
							// console.log(d.value / valueTotal);
							return (d.value / valueTotal) <= 0.1 ?Actinobacteria_Color(d.value / valueTotal * 10) : Actinobacteria_Color(d.value / valueTotal);
						}else{
							if(node_array.indexOf("Firmicutes") != -1){
								return (d.value / valueTotal) <= 0.1 ?Firmicutes_Color(d.value / valueTotal * 10) : Firmicutes_Color(d.value / valueTotal);
							}else{
								if(node_array.indexOf("Chloroflexi") != -1){
									return (d.value / valueTotal) <= 0.1 ? Chloroflexi_Color(d.value / valueTotal * 10) : Chloroflexi_Color(d.value / valueTotal);
								}else{
									color(d.id);
								}
							}
						}

					}
				}
				
			}//END of category color set
			
		})
		.style("stroke-width", 0.0)
		.style("stroke", "#fff")
		.on("click", click);

	path.on("mouseover", mouseover);

	//Add the mouseleave handler to the bounding circle
	d3.select("#container").on("mouseleave", mouseleave);

	var alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p","q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
	var legendIndex = 0;
	var coordinates = [0, 0];

	function click(d){

		legendIndex++;
		coordinates = d3.mouse(this);
		var cx = coordinates[0];
		var cy = coordinates[1];

		labelText = g.append("text")
			.attr("x", cx)
			.attr("y", cy)
			.attr("class", "labeltext")
			.attr("text-anchor", "middle")
			.style("font", "15px sans-serif")
			// .style("font-weight", "600")
			.style("text-shadow", "2px 2px #BDBDBD")
			.text(alphabet[legendIndex-1]);

		var arr = d.id.split("@");
		arr.shift();//remove "cellular organisms"
		arr.unshift(alphabet[legendIndex-1]);//add an alphabet letter as the first element
		var str = arr.join(connector);//convert the array into a string 

		//enter the top legend text as a string
		var topLegend = svg.append("text")
			.attr("x", -250)
			.attr("y", -(height / 2) + legendIndex*14)
			.attr("dy", "0.35em")
			.style("font", "15px sans-serif")
			.attr("text-anchor", "start")
			.text(str);

		var legend = svg.selectAll(".aa")
			.data(d.ancestors())
			.enter().append("g")
			.attr("class", "legend");

		/******************************************************************/
		/****************enter top legend text individually*****************/
		/******************************************************************/

		//set position for entering and updating nodes
		legend.attr("transform", function(d, i){
			return "translate(" + d.depth * (p.w) + ", 0)";
		});
	}


	svg.call(d3.zoom()
		//.scaleExtent([1/2, 10])
		.on("zoom", function(d){
			var transform = d3.event.transform;
			g.attr("transform", transform);
		}));
	
	//fade all but the current sequence, and show it in the breadcrumb trail
	function mouseover(d){
		var sequenceArray = d.ancestors();

		updateBreadcrumbs(sequenceArray);

		//fade all the segments
		d3.selectAll("path")
			.style("opacity", 0.3);
		//then highlight only those that are an ancestor of the current segment
		d3.selectAll("path")
			.filter(function(node){
				return (sequenceArray.indexOf(node) >= 0);
			})
			.style("opacity", 1);
	}

	//restore everything to full opacity when moving off the visualization
	function mouseleave(d){

		//hide the breadcrumb trail
		d3.select("#trail")
			.style("visibility", "hidden");

		//deactivate all segments during transition
		d3.selectAll("path").on("mouseover", null);

		//transition each segment to full opacity and then reactivate it
		d3.selectAll("path").transition()
			.duration(1000)
			.style("opacity", 1)
			.on("end", function(){
				d3.select(this).on("mouseover", mouseover);
			});
	}

	function getAncestors(node){
		var path = [];
		var current = node;
		while(current.parent){
			path.unshift(current);
			current = current.parent;
		}
		return path;
	}

	function initializeBreadcrumbTrail(){
		//Add the svg area
		var trail = d3.select("#pie-chart-extension-navbar").append("svg")
			.attr("width", width+20)
			.attr("height", 30)
			.attr("id", "trail");
		//Add the label at the, for the percentage
		//add this feature later
	}

	//generate a string that describes the points of a breadcrumb polygon
	function breadcrumbPoints(d, i){
		var points = [];
		points.push("0,0");
		points.push(b.w + ",0");
		points.push(b.w + b.t + "," + (b.h / 2));
		points.push(b.w + "," + b.h);
		points.push("0," + b.h);
		if(i > 0){//leftmost breadcrumb; 
			points.push(b.t + "," + (b.h / 2));
		}
		return points.join(" ");
	}

	//Update the breadcrumb trail to show the current sequence
	function updateBreadcrumbs(nodeArray){
		//data join; key function combines name and depth (= position in sequence)
		var g = d3.select("#trail")
			.selectAll("g")
			.data(nodeArray, function(d){return d.id + d.depth; });

		//add breadcrumb and label for entering nodes
		var entering = g.enter().append("g");

		entering.append("polygon")
			.attr("points", breadcrumbPoints)
			.style("fill", function(d){return color(d.id); });

		entering.append("text")
			.attr("x", (b.w + b.t) / 2)
			.attr("y", b.h / 2)
			.attr("dy", "0.35em")
			.style("font", "14px sans-serif")
			.attr("text-anchor", "middle")
			.text(function(d){return d.data.id.substring(d.id.lastIndexOf("@") + 1); })

		//set position for entering and updating nodes
		g.attr("transform", function(d, i){
			return "translate(" + i * (b.w + b.s) + ", 0)";
		});

		//remove exiting nodes
		g.exit().remove();

		//make the breadcrumb trail visible, if it's hidden
		d3.select("#trail")
			.style("visibility", "");

	}

}