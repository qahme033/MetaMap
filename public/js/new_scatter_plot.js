var maxR;
var svgMainPlot;
var mainPlotScaleType ="linear"
var mainPlotCircles;
var mainPlotNode;
var mpPower = 0.5;
var mpFontSize = 5;
const pointRadius = 20;
var rScale;




function plot(){
	console.log(coordinates)
	console.log(rawData)
	var x = []
	var y = []
	for(var i = 0; i < coordinates.length; i++){
		x[i] = coordinates[i].x
		y[i] = coordinates[i].y
	}

	// outer svgMainPlot dimensions
	const width = window.innerWidth;
	const height =  window.innerHeight;

	// padding around the chart where axes will go
	const padding = {
	  top: 20,
	  right: 20,
	  bottom: 40,
	  left: 100,
	};

	// inner chart dimensions, where the dots are plotted
	const plotAreaWidth = width - padding.left - padding.right;
	const plotAreaHeight = height - padding.top - padding.bottom;

	// radius of points in the scatterplot
	const pointRadius = 20;

	var xScale = d3.scaleLinear().domain([d3.min(x),d3.max(x)]).range([0, plotAreaWidth]);
	var yScale = d3.scaleLinear().domain([d3.min(y),d3.max(y)]).range([plotAreaHeight, 0]);
    rScale = d3.scaleLinear().domain([getMinR(coordinates), getMaxR(coordinates)]).range([0, 50]);

	const colorScale = d3.scaleLinear().domain([0, 1]).range(['#06a', '#0bb']);

	// select the root container where the chart will be added
	const container = d3.select(svgDiv);

	// initialize main svgMainPlot
	svgMainPlot = container.append('svg')
	  .attr('width', width)
	  .attr('height', height)
	  .style("position", "fixed")
	  .style("top", "0px")
	  .style("right", "0px")
	  .style("z-index", "-1")



	var ng = svgMainPlot.append("g").attr("transform", "translate(" + 0 + "," + 0 + ")");

	 maxR = getMaxR(coordinates)

	var color = d3.scaleOrdinal(d3.schemeCategory10);

	mainPlotNode = svgMainPlot.select("g").selectAll("g")
				.data(coordinates)
				.enter()
				.append("g")
				.attr("transform", function(d) { return "translate(" + xScale(d.x) + "," +yScale(d.y)+ ")"; })
				.on("mouseover", function(d) {hovered(true, mainPlotNode, d)})
				.on("mouseout", function(d) {hovered(false, mainPlotNode, d)})
				//.on("click", function(d) {click(true, mainPlotNode, d)})
				.on("contextmenu", function(d){ tooltipScatter(svgDiv, true,rawData,  d)})
				//.on("mousemove", function(){tooltipScatter( svgDiv, false, rawData)})

				console.log( svgMainPlot)

	mainPlotCircles = mainPlotNode.append("circle")
	  .classed('data-point', true)
	  .style("fill", d => color(d.id))
	  .attr("r", function(d) { return rScale(d.r); });

	  var arc = d3.arc()
		.innerRadius(function(d,i){return rScale(d.r);})
		.outerRadius(function(d,i){return rScale(d.r);})
		.startAngle(Math.PI)
		.endAngle(3*Math.PI)


	  mainPlotNode.append("path")
		.attr("fill","red")
		.attr("id", function(d,i){return "s"+i;})
		.attr("d",arc)



	  mainPlotNode.append("text")
		.style("text-anchor","middle")
		.append("textPath")
		.attr("xlink:href",function(d,i){return "#s"+i;})
		.style("font-size",function(d){return mpFontSize * rScale(d.r)/200 * pointRadius})
		.attr("startOffset",function(d,i){return "25%";})
		.text(function(d){ return d.id;})

	  svgMainPlot.call(d3.zoom().on("zoom", function(){zoomed(ng, mainPlotNode)}));

	  if(localStorage.getItem("transformPlot")){
	  	var transformPlot = d3.zoomTransform(svgMainPlot.mainPlotNode());
	  	console.log(transformPlot)
	  	var transformData = JSON.parse(localStorage.getItem("transformPlot"))
	  	transformPlot.k = transformData.k
	  	transformPlot.x = transformData.x
	  	transformPlot.y = transformData.y
	  	//ng.attr("transform", transform)
	  	zoomed(ng, mainPlotNode, transformPlot)
	  }
}



function zoomed(ng, mainPlotNode, transform){
	var transformPlot;
	if(transform)
		transformPlot = transform 
	else{
		transformPlot = d3.event.transform;
		localStorage.setItem("transformPlot", JSON.stringify(transformPlot))
	}

	ng.attr("transform", transformPlot)
	mainPlotNode.style("stroke-width",function(d){return 1.2/(transformPlot.k)})
}

function hovered(hover, mainPlotNode, d){
		mainPlotNode.style("opacity", function(d1){ return hover? ((d1 == d)? 1 : 0.5): 1})
		.classed("mainPlotNode--hover", function(d1){ return hover? ((d1 == d)? true : false): false})
}

// function click(click, mainPlotNode, d){
// 		mainPlotNode.style("opacity", function(d1){  return click? ((d1 == d)? 1 : 0.5): 1})
// 		.style("stroke-width", function(d1){ return click? ((d1 == d)? (d1.r/maxR)*3 : 0): (d1.r/maxR)*3})
// 		.classed("mainPlotNode--click", function(d1){ return click? ((d1 == d)? true : false): false})
// }


function getMaxR(coordinates){
	var maxR = 0
	for(var coordinate in coordinates){
		if(maxR < coordinates[coordinate].r)
			maxR = coordinates[coordinate].r
	}
	return maxR
}

function getMinR(coordinates){
	var maxR = Number.MAX_VALUE
	for(var coordinate in coordinates){
		if(maxR > coordinates[coordinate].r)
			maxR = coordinates[coordinate].r
	}
	return maxR
}

function updateMainPlot() {
	console.log(mainPlotScaleType)
	console.log(rScale(0))

	mainPlotNode = svgMainPlot.select("g")
			.selectAll("g")
			.data(coordinates);



	if(mainPlotScaleType == "linearOption"){
		rScale = d3.scaleLinear().domain([getMinR(coordinates), getMaxR(coordinates)]).range([0, 50]);
	}
	else if(mainPlotScaleType == "logOption"){
		rScale = d3.scaleLog().domain([getMinR(coordinates), getMaxR(coordinates)]).range([0, 50]);
	}
	else if(mainPlotScaleType == "sqrtOption"){
		rScale = d3.scalePow().exponent(mpPower).domain([getMinR(coordinates), getMaxR(coordinates)]).range([0, 50]);
	}
	console.log(rScale(0))

	mainPlotNode.selectAll("circle").attr("r", function(d) { return rScale(d.r); })



	  var arc = d3.arc()
		.innerRadius(function(d,i){return rScale(d.r);})
		.outerRadius(function(d,i){return rScale(d.r);})
		.startAngle(Math.PI)
		.endAngle(3*Math.PI)


	  mainPlotNode.selectAll("path")
		.attr("fill","red")
		.attr("d",arc)



	  mainPlotNode.selectAll("text")
		.style("text-anchor","middle")
		.selectAll("textPath")
		.style("font-size",function(d){return  mpFontSize * rScale(d.r)/200 * pointRadius})

		mainPlotNode.exit().remove();



}