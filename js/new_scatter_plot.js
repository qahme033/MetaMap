var maxR;
function plot(coordinates, mainDiv, rawData){
	//console.log(coordinates)
	var x = []
	var y = []
	for(var i = 0; i < coordinates.length; i++){
		x[i] = coordinates[i].x
		y[i] = coordinates[i].y
	}

	// outer svg dimensions
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

	const xScale = d3.scaleLinear().domain([d3.min(x),d3.max(x)]).range([0, plotAreaWidth]);
	const yScale = d3.scaleLinear().domain([d3.min(y),d3.max(y)]).range([plotAreaHeight, 0]);
	const colorScale = d3.scaleLinear().domain([0, 1]).range(['#06a', '#0bb']);

	// select the root container where the chart will be added
	const container = d3.select(mainDiv);

	// initialize main SVG
	var svg = container.append('svg')
	  .attr('width', width)
	  .attr('height', height)
	  .style("position", "fixed")
	  .style("top", "0px")
	  .style("right", "0px")
	  .style("z-index", "-1")



	var ng = svg.append("g").attr("transform", "translate(" + 0 + "," + 0 + ")");

	 maxR = getMaxR(coordinates)

	var color = d3.scaleOrdinal(d3.schemeCategory10);

	var node = svg.select("g").selectAll("g")
				.data(coordinates)
				.enter()
				.append("g")
				.attr("transform", function(d) { return "translate(" + xScale(d.x) + "," +yScale(d.y)+ ")"; })
				.on("mouseover", function(d) {hovered(true, node, d)})
				.on("mouseout", function(d) {hovered(false, node, d)})
				//.on("click", function(d) {click(true, node, d)})
				.on("contextmenu", function(d){ tooltipScatter(mainDiv, true,rawData,  d)})
				//.on("mousemove", function(){tooltipScatter( mainDiv, false, rawData)})

	var circles = node.append("circle")
	  .classed('data-point', true)
	  .style("fill", d => color(d.id))
	  .attr("r", d => d.r/maxR * pointRadius);

	  var arc = d3.arc()
		.innerRadius(function(d,i){return d.r/maxR * pointRadius;})
		.outerRadius(function(d,i){return d.r/maxR * pointRadius;})
		.startAngle(Math.PI)
		.endAngle(3*Math.PI)


	  node.append("path")
		.attr("fill","red")
		.attr("id", function(d,i){return "s"+i;})
		.attr("d",arc)



	  node.append("text")
		.style("text-anchor","middle")
		.append("textPath")
		.attr("xlink:href",function(d,i){return "#s"+i;})
		.style("font-size",function(d){return d.r/maxR * pointRadius/2})
		.attr("startOffset",function(d,i){return "25%";})
		.text(function(d){ return d.id;})

	  svg.call(d3.zoom().on("zoom", function(){zoomed(ng, node)}));

	  if(localStorage.getItem("transformPlot")){
	  	var transformPlot = d3.zoomTransform(svg.node());
	  	console.log(transformPlot)
	  	var transformData = JSON.parse(localStorage.getItem("transformPlot"))
	  	transformPlot.k = transformData.k
	  	transformPlot.x = transformData.x
	  	transformPlot.y = transformData.y
	  	//ng.attr("transform", transform)
	  	zoomed(ng, node, transformPlot)
	  }
}



function zoomed(ng, node, transform){
	var transformPlot;
	if(transform)
		transformPlot = transform 
	else{
		transformPlot = d3.event.transform;
		localStorage.setItem("transformPlot", JSON.stringify(transformPlot))
	}

	ng.attr("transform", transformPlot)
	node.style("stroke-width",function(d){return 1.2/(transformPlot.k)})
}

function hovered(hover, node, d){
		node.style("opacity", function(d1){ return hover? ((d1 == d)? 1 : 0.5): 1})
		.classed("node--hover", function(d1){ return hover? ((d1 == d)? true : false): false})
}

// function click(click, node, d){
// 		node.style("opacity", function(d1){  return click? ((d1 == d)? 1 : 0.5): 1})
// 		.style("stroke-width", function(d1){ return click? ((d1 == d)? (d1.r/maxR)*3 : 0): (d1.r/maxR)*3})
// 		.classed("node--click", function(d1){ return click? ((d1 == d)? true : false): false})
// }


function getMaxR(coordinates){
	var maxR = 0
	for(var coordinate in coordinates){
		if(maxR < coordinates[coordinate].r)
			maxR = coordinates[coordinate].r
	}
	return maxR
}