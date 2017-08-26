var scaleFac = 1;
var treeScaleType = "linearOption"
var treeTextFilterType = "depth"	
var ttdepth = 100;
var ttchilds = 100;
var ttradius = 100;	
var tPower = 0.5;
/******************************draw tree***************************************/
function tree(data, div){

	var width = window.innerWidth;
	 	height =  window.innerHeight;

	var color = d3.scaleOrdinal(d3.schemeCategory10);

	var svg = d3.select(div).append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("id", "svgBarChart")
		.style("position", "fixed")
		.style("top", "0px")
		.style("right", "0px")
		.style("z-index", "-1")
svgTree = svg;

    var ng = svg.append("g").attr("transform", "translate(60,150)");

	var tree = d3.tree()
	    .size([height -200, width - 300]);
fooTree= tree
	var stratify = d3.stratify()
	    .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf("@")); });
	console.log(data)
	var root = stratify(data)
		.sort(function(a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); });
		fooroot = root

	var maxi = getMax(data)
	var maxD = data[maxi].value
	console.log(maxD)

	var max = getMaxTreeR(rdata)
	var min = getMinTreeR(rdata)
	var rScale = d3.scaleLinear().domain([min, max]).range([0, 50]);

	//console.log(tree(root).descendants().slice(1));
	var link = ng.selectAll(".link")
		.data(tree(root).descendants().slice(1))
		.enter().append("path")
		.attr("class", "link")
		//.attr("class", "treeLink")
		.style("stroke", color)
		.style("fill", "none")
		.style("stroke", function(d){return color(d.depth >= 2 && d.id.split("@", 3));})
		.style("stroke-opacity", 0.4)
		.style("stroke-width",  function(d){return rScale(d.data.value)})
		.attr("d", function(d) {
			return "M" + d.y + "," + d.x
		    + "C" + (d.y + d.parent.y) / 2 + "," + d.x
		    + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
		    + " " + d.parent.y + "," + d.parent.x;
		});
	treeLink = link

	var node = ng.selectAll(".node")
		.data(root.descendants())
		.enter().append("g")
		.attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
		.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });



	node.append("circle")
	.attr("r", function(d){return rScale(d.data.value)})
		.style("fill", function(d){return color(d.depth >= 2 && d.id.split("@", 3));});

  	node.append("text")
  		.attr("dy", 5)
		.attr("x", function(d) { return d.parent ? 10 : -10; })
		.style("text-anchor", function(d) { return d.parent ? "start" : "end"; })
		.style("font", "10px sans-serif")
		.attr("transform", function(d){return d.parent ? "rotate(-30)" : "rotate(0)"; })
		.text(function(d) {console.log(d); return d.id.substring(d.id.lastIndexOf("@") + 1); });

	svg.call(d3.zoom()
//	.scaleExtent([0, 10])
	.on("zoom", function(){
		var transform = d3.event.transform;
		ng.selectAll(".node").attr("transform", function(d){
			return "translate("+transform.applyX(d.y)+","+transform.applyY(d.x)+")";
		});

		ng.selectAll(".link").attr("d", function(d) {
	    	return "M" + transform.applyX(d.y) + "," + transform.applyY(d.x)
	        + "C" + (transform.applyX(d.y) + transform.applyX(d.parent.y)) / 2 + "," + transform.applyY(d.x)
	        + " " + (transform.applyX(d.y) + transform.applyX(d.parent.y)) / 2 + "," + transform.applyY(d.parent.x)
	        + " " + transform.applyX(d.parent.y) + "," + transform.applyY(d.parent.x);
	  	});
	})); 
}


/*********************************draw radial tree*********************************/
function radialTree(data, div, svg){
	var width = window.innerWidth;
	 	height =  window.innerHeight;

	var color = d3.scaleOrdinal(d3.schemeCategory10);

	var svg = d3.select(div).append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("id", "svgBarChart")
		.style("position", "fixed")
		.style("top", "0px")
		.style("right", "0px")
		.style("z-index", "-1")



    var ng = svg.append("g").attr("transform", "translate(" + (width / 2 + 40) + "," + (height / 2) + ")");

	var stratify = d3.stratify()
	    .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf("@")); });

	var tree = d3.tree()
	    .size([360, 500])
	    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

	var root = tree(stratify(data));

	var link = ng.selectAll(".link")
	.data(root.descendants().slice(1))
	.enter().append("path")
	  .attr("class", "link")
	  .style("stroke", color)
	  .style("fill", "none")
      .style("stroke-opacity", 0.4)
      .style("stroke-width", 1.5)
	  .attr("d", function(d) {
	    return "M" + project(d.x, d.y)
	        + "C" + project(d.x, (d.y + d.parent.y) / 2)
	        + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
	        + " " + project(d.parent.x, d.parent.y);
	  })

	var node = ng.selectAll(".node")
	.data(root.descendants())
	.enter().append("g")
	  .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
	  .attr("transform", function(d) { 	return "translate(" + project(d.x, d.y) + ")"; })



	node.append("circle")
	  .attr("r", function(d){return scaleFac * d.r})
	  .style("fill", function(d){return color(d.depth >= 2 && d.id.split("@", 3));
	      })


	node.append("text")
	  .attr("dy", ".31em")
	  .attr("x", function(d) { return d.parent ? 10 : -10; })
	  .style("text-anchor", function(d) { return d.parent ? "start" : "end"; })
	  .style("font", "10px sans-serif")
	  .attr("transform", function(d){ if(d.children){ return "rotate(30)";}else{return "rotate(" + (d.x - 100) + ")";} })
	  .text(function(d) { return d.id.substring(d.id.lastIndexOf("@") + 1); })
	  .on("mouseover", function(d) {console.log(d)})
	  //.on("mouseout", function(d) {k, d)})

	svg.call(d3.zoom()
	//.scaleExtent([0, 10])
	.on("zoom", function(){
		var transform = d3.event.transform;
		ng.selectAll(".node")
			.attr("transform", function(d){
			return "translate(" + transform.apply(project(d.x, d.y)) + ")"; 
		});

		ng.selectAll(".link")
			.attr("d", function(d) {
		     return "M" + transform.apply(project(d.x, d.y))
	        + "C" + transform.apply(project(d.x, (d.y + d.parent.y) / 2))
	        + " " + transform.apply(project(d.parent.x, (d.y + d.parent.y) / 2))
	        + " " + transform.apply(project(d.parent.x, d.parent.y));
		  });
	}));
}

function project(x, y){
	var angle = (x-90)/180 * Math.PI, radius = y;
	return [radius*Math.cos(angle), radius*Math.sin(angle)];
}

function updateTreeLink() {
var max = getMaxTreeR(rdata)
var min = getMinTreeR(data)

	treeLink = svgTree.select("g")
			.selectAll(".link")
			.data(fooTree(fooroot).descendants().slice(1));

treeLink.exit().remove();

	var rScale;
console.log(treeScaleType)
	if(treeScaleType == "linearOption"){
		rScale = d3.scaleLinear().domain([min, max]).range([0, 50]);
		//	console.log(rScale(10))

	}
	else if(treeScaleType == "logOption"){
		rScale = d3.scaleLog().domain([min + 1, max]).range([0, 50]);
		// console.log(getMinTreeR(rdata))
		// console.log(getMaxTreeR(rdata))
		//	console.log(rScale(10))

	}
	else if(treeScaleType == "sqrtOption"){
	//	console.log(mpPower)
		rScale = d3.scalePow().exponent(tPower).domain([min, max]).range([0, 50]);
	//console.log(rScale(10))
	}
//	console.log(rScale(10))

	treeLink			
		.style("stroke-width",  function(d){
			// if(scaleType == "linearOption") 
			// 	return scaleFac * d.data.value/maxD 
			// else if(scaleType == "logOption")
			// 	return scaleFac * Math.log(d.data.value + 1)/Math.log(maxD + 1)
			// else if(scaleType == "sqrtOption")
			// 	return scaleFac * Math.sqrt(d.data.value)/Math.sqrt(maxD)	
		//	console.log(d.data.value)
		if(d.id.endsWith("cellular organisms@Bacteria")){
			console.log(d)
			console.log(rScale(d.data.value))
		}
		//console.log(d)
			return rScale(d.data.value)	
		})


	var circles = svgTree.select("g").selectAll(".node").select("circle")
	var text = svgTree.select("g").selectAll(".node").select("text")
		console.log(treeTextFilterType)
		console.log(ttdepth)
	text.text(function(d) { 
		var texts = d.id.substring(d.id.lastIndexOf("@") + 1); 

		if(treeTextFilterType == "depthTextFilter" && d.depth < ttdepth){
			console.log("made it")
			return texts
		}
		else if(d.parent){
			if(treeTextFilterType == "siblingsTextFilter" && d.parent.children.length < ttchilds)
				return texts
		}
		else if(treeTextFilterType == "intensityTextFilter" && d.data.value < ttradius)
			return texts
	})


	circles.exit().remove()
	circles

		.attr("r",  function(d){
			// if(scaleType == "linearOption") 
			// 	return scaleFac * d.data.value/maxD 
			// else if(scaleType == "logOption")
			// 	return scaleFac * Math.log(d.data.value + 1)/Math.log(maxD + 1)
			// else if(scaleType == "sqrtOption")
			// 	return scaleFac * Math.sqrt(d.data.value)/Math.sqrt(maxD)
			//console.log("**********", rScale(100))
		if(d.id.endsWith("cellular organisms@Bacteria")){
			console.log(d)
			console.log(rScale(d.data.value))
		}
			return rScale(d.data.value)	
		})

}


function getMaxTreeR(data){
	var maxR = 0
	//console.log(data)
	for(var d in data){
	//	console.log(d)
		if(maxR < data[d].value)
			maxR = data[d].value
	}
	return maxR
}

function getMinTreeR(data){
	var maxR = Number.MAX_VALUE
	for(var d in coordinates){
		if(maxR > data[d].value)
			maxR = data[d].value
	}
	return maxR
}

function hoveredTree(hover, mainPlotNode, d){
	console.log(d)
}