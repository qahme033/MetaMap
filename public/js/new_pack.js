var transformPack = d3.zoomTransform(this)

function pack(rawData, div, tSampleIDs, same){
	 width = window.innerWidth;
	 height =  window.innerHeight;

	var svg = d3.select(div).append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("id", "svg")
		.style("position", "fixed")
		.style("top", "0px")
		.style("right", "0px")
		.style("z-index", "-1")

	svgPack = svg
	var filteredData = {};
	for(var sampleID in rawData){
		for(var i = 0; i < tSampleIDs.length; i++){
			if(sampleID  == tSampleIDs[i].id){
				filteredData[sampleID] = rawData[sampleID]
			}
		}
	}
	drawMap(filteredData, svg, same)

	


}
var data;
function drawMap(filteredData, svg, same){
	var ng = svg.append("g").attr("transform", "translate(" + 0 + "," + 0 + ")");


	data = averageData(filteredData);
//	return
    var margin = 2


	var stratify = d3.stratify()
		.parentId(function(d) { 
			return d.id.substring(0, d.id.lastIndexOf("@")); });

	var root = stratify(data)
			//.sum(function(d) { return d.value; })
			.sort(function(a, b) { return a.depth - b.depth })
			.eachAfter(function(node) { node.value = node.data.value;})


	rootPack = root

	 maxi = getMax(data)
	 maxD = data[maxi].value
	 console.log(maxD)

	packThis = d3.pack()
    	.size([width - margin, height - margin])
		.padding(nodePadding/100)
		.radius(function(d){return  width * d.value/data[maxi].value})



	packThis(root);

		console.log(root)


	node = svg.select("g")
			.selectAll("g")
			.data(rootPack.descendants())
		//	.filter(function(d) { console.log(d); return d.children })
			.enter()//.filter(function(d){return d.depth <= packDepth})
			.append("g")
			.attr("r", function(d){return d.r })
			.attr("id", function(d){return d.id})
			  .attr("transform", function(d) { 
			  	return "translate(" + d.x + "," +d.y+ ")"; })
			  	.attr("class", function(d) { return "node" + (!d.children ? " node--leaf" : d.depth ? "" : " node--root"); })
			   .each(function(d) { d.node = this; })
			   .attr("value", function(d){return d.value})
			   .on("mouseover", hoveredPack(true))
			   .on("mouseout", hoveredPack(false))
			   .on("contextmenu", function(d){ tooltipPack( true, data, d)})
			  // .on("mousemove", function(){tooltipPack(false, rawData)})
			   .on("dblclick", function(d){zoomByDoubleClick(d, width, root, node, ng)} )
			 //  .style("opacity", 1)

			   .style("stroke-width", strokeWidthPack/100)
			   .style("stroke", "#000")




	var leaf = node.filter(function(d) { return !d.children || d.depth == packDepth; });

	//node = node			.filter(function(d){return d.depth < packDepth})


	colors = generateColors(leaf, data);

	var circle = node.append("circle")
		.attr("r", function(d) { return d.r})
		.attr("class", "circle")
	//	.style("opacity", function(d){return  opacityPack/(Math.max(1,d.height))})

		.style("fill", function(d){
			return colors[d.id];
		});

	arc = d3.arc()
		.innerRadius(function(d,i){return d.r ;})
		.outerRadius(function(d,i){return d.r ;})
		.startAngle(Math.PI)
		.endAngle(3*Math.PI);

	node.append("path")
		.attr("fill","black")
		.attr("id", function(d,i){return "s"+i;})
		.attr("d",arc)


	node.append("text")
		.style("text-anchor","middle")
		.append("textPath")
		.attr("xlink:href",function(d,i){return "#s"+i;})
		.attr("startOffset",function(d,i){return "25%";})
		.text(function(d){ return (d.r>50 )? d.id.substring(d.id.lastIndexOf("@") + 1) : "";})
	//	.style("opacity", function(d){ return opacityPack/Math.log(Math.max(1,d.height))})
	
	if(localStorage.getItem("transformPack") && same){
		transformPack = d3.zoomTransform(this)
		var tmpTransform = JSON.parse(localStorage.getItem("transformPack"))
		transformPack.k = tmpTransform.k
		transformPack.x = tmpTransform.x
		transformPack.y = tmpTransform.y
		zoomManually(root, node, ng, svg, transformPack)
	}
	else if(!same){
		transformPack = d3.zoomTransform(this)
		transformPack.k = 1
		transformPack.x = 0
		transformPack.y = 0
	}

	//console.log(d3.zoom())

	svg.call(d3.zoom()
		.on("zoom", function(d){zoomManually( root, node, ng, svg)})).on("dblclick.zoom", null);//cancel default behavior 
	return data;

}

function zoomManually( root, node, ng, svg, transform){

	focus = root
	//update tranform based off event
	if(!transform)
		transformPack = d3.event.transform;
	//console.log(d3.event.transform)
	// else
	// 	transformPack = transform
	//apply transform
	ng.attr("transform", transformPack);

	//Re-adjust text
	node.each(function(d){
		if(d.r*transformPack.k>50){
				d.node.lastChild.lastChild.textContent =d.id.substring(d.id.lastIndexOf("@") + 1) 
		}
		else
			d.node.lastChild.lastChild.textContent = "";
	})
	node.style("font-size",function(d){return packFont/transformPack.k})
	// node.style("stroke-width",function(d){return strokeWidthPack/(transformPack.k)})
	localStorage.setItem("transformPack", JSON.stringify(transformPack))
}

function zoomByDoubleClick(d, width, root, node, ng) {
	//var transform = d3.zoomTransform(this)

	//if you are double clicking on same circle you will zoom back all the way out
	if (focus == d) d = root
	//update who is on focus
	focus = d
    //updating last transform
    transformPack.k = width/((d.r+Math.log(d.r))*2)
    transformPack.x = (width/2 -d.x*transformPack.k)
    transformPack.y= (width/2 -d.y*transformPack.k)
    ng.attr("transform", transformPack);
    //Re-adjust text
    root.each(function(d){(d.r*transformPack.k>50)? d.node.lastChild.lastChild.textContent =d.id.substring(d.id.lastIndexOf("@") + 1) : d.node.lastChild.lastChild.textContent = "";})
	node.style("font-size",function(d){return packFont/transformPack.k})
	//node.style("stroke-width",function(d){return 1.2/(transformPack.k)})
	//	d3.event.transform = transformPack;
	d3.event.stopPropagation();
	//return transform;
	localStorage.setItem("transformPack", JSON.stringify(transformPack))

}

function averageData(samples){
	var data = []
	var keys = Object.keys(samples)[0]
	//var sampleID;
	for(var row in samples[keys]){
		var sum = 0;
		var count = 0;
		for(var sampleID in samples){
			//	if(sampleID == tSampleIDs[0]) 
				//2224611517516.411 
				//25015596493216.4
				sum += parseFloat(samples[sampleID][row].value) + 0.01
				// if(sum != 0)
				// 	sum = sum + 0.001
		}
		var value = sum/keys.length
		var id = samples[sampleID][row].id;
		// if(keys.length > 1)
		// 	id = id.substring(id.indexOf("|")+1)
		data.push({id: id , value:value, order: parseInt(row)})
	}
//	downloadCSV({"data" : data, filename: "failmin.csv"})
	return data;
}


    function convertArrayOfObjectsToCSV(args) {
        var result, ctr, keys, columnDelimiter, lineDelimiter, data;

        data = args.data || null;
        if (data == null || !data.length) {
            return null;
        }

        columnDelimiter = args.columnDelimiter || ',';
        lineDelimiter = args.lineDelimiter || '\n';

        keys = Object.keys(data[0]);

        result = '';
        result += keys.join(columnDelimiter);
        result += lineDelimiter;

        data.forEach(function(item) {
            ctr = 0;
            keys.forEach(function(key) {
                if (ctr > 0) result += columnDelimiter;

                result += item[key];
                ctr++;
            });
            result += lineDelimiter;
        });

        return result;
    }

    function downloadCSV(args) {
        var data, filename, link;

        var csv = convertArrayOfObjectsToCSV({"data": args.data});
        if (csv == null) return;

        filename = args.filename || 'export.csv';

        if (!csv.match(/^data:text\/csv/i)) {
            csv = 'data:text/csv;charset=utf-8,' + csv;
        }
        data = encodeURI(csv);

        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename);
        link.click();
    }

function hoveredPack(hover) {
  return function(d) {
  	//console.log(d.depth, d)
    var nodes = d3.selectAll(d.descendants().map(function(d1) {return d1.node? d1.node.firstChild : d1.node; }))
    nodes.classed("node--hover", hover);
    nodes.style("opacity", function(d){ return hover ? 1/Math.sqrt(Math.max(1,d.height)):  opacityPack/(Math.max(1,d.height)*3)})
    nodes.attr("focus", "true")
   // console.log(d.descendants())
  };
}

function generateColors(leafs, data) {
	var colors = {};

	var leavesIDs = []
	// for(var sampleID in sampleData){
	// 	leavesInOrderPerSample[sampleID] = []
	// }
	//getting all the leaves
	leafs.each(function(d){
		// var sampleID = d.id.substring(0, d.id.lastIndexOf("|"))
		// if(sampleID == "") 
		// 	sampleID = "default"
		leavesIDs.push(d.id)
	})
	//ordering the leaves
	//leafsInOrder = leafsInOrder.sort();
	//creating color pallets. For now I only generate two. One for Eukaryotes and one for Bacteria to emphasize their differences
	var colorBac = d3.scaleSequential(d3.interpolateCubehelix.gamma(3)("#" + bakColor1, "#" + bakColor2));
	var colorAr = d3.scaleSequential(d3.interpolateCubehelixLong.gamma(3)("#" + eukColor1, "#" + eukColor2));
	var colorEuk = d3.scaleSequential(d3.interpolateRgbBasis(["#" + arcColor1, "#" + arcColor2]));
	//Colouring the leaves
	// for(var sampleID in leavesInOrderPerSample){
	// 	var leafsInOrder = leavesInOrderPerSample[sampleID]
		for(var i in leavesIDs){
			if(leavesIDs[i].includes("Eukaryota"))
				colors[leavesIDs[i]] = colorEuk(i *2 / data.length*2);
			else if((leavesIDs[i].includes("Bacteria")))
				colors[leavesIDs[i]] = colorBac(i  / data.length);
			else
				colors[leavesIDs[i]] = colorAr(i  / data.length);
		}
	//}

	//Here is where I will color the rest of the nodes. By starting at the leaves (that are already colored) and deducing parent colors
	leafs.each(function(d){
		var currentParent = d.parent //skip leaf since already colored
	loop1:
		while(currentParent){
			if(!colors[currentParent.id] ){ //Only if color for parent node doesnt exist to avoid redundant computation
				var siblings = currentParent.children;
				var currentColorSum = [0,0,0]
				for(var i in siblings){
					//leafs are not all at the same depth so if we get a leaf at a higher depth its parents will have siblings that 
					// may not be leaves and may not have a defined color. In this case we skip and this parent will be revisited later 
					// by starting at a different leaf
					if(!colors[siblings[i].id])
						break loop1;
					//console.log(colors[siblings[i].id])
					//else all siblings have defined colors
					var siblingColorRGB = d3.rgb(colors[siblings[i].id])
					currentColorSum[0] += siblingColorRGB.r
					currentColorSum[1] += siblingColorRGB.g
					currentColorSum[2] += siblingColorRGB.b

				}
				currentColorSum[0] /= siblings.length
				currentColorSum[1] /= siblings.length
				currentColorSum[2] /= siblings.length
				colors[currentParent.id] = d3.rgb(currentColorSum[0], currentColorSum[1], currentColorSum[2])
			}
			currentParent = currentParent.parent
		}
	})
	return colors;
}
//gets all descendants
function reduceRoot(data,d){
	// data.sort(function(d1, d2){
	// 	return d1.id.localeCompare(d2.id)
	// })
	var data2 = []
	var rootPieces = d.id.split("@")

	for(var row = 0; row < data.length; row++){
		//var beforeTmp;
		if(data[row].id.includes(d.id)){
			//data[row].id
			//console.log(data[row], "INNNN")
			//console.log(data[row].id.substring(data[row].id.indexOf(d.id)))
			var tmp = data[row]
			//beforeTmp = tmp.id.substring(tmp.id.indexOf(0,rootPieces[rootPieces.length-1]))
			var modified = {id: tmp.id.substr(tmp.id.indexOf(rootPieces[rootPieces.length-1])), value: tmp.value, order: tmp.order}
			//tmp.id = tmp.id.substr(tmp.id.indexOf(rootPieces[rootPieces.length-1]))

			//console.log(tmp.id.substring(19), rootPieces[rootPieces.length-1])
			data2.push(modified)
		}
	}
	//console.log(beforeTmp)
	return data2
}

//gets immediate descendants
function reduceRoot2(data,d){
	// data.sort(function(d1, d2){
	// 	return d1.id.localeCompare(d2.id)
	// })
	var data2 = []
	var rootPieces = d.id.split("@")
	var orgName = d.id.substring(d.id.lastIndexOf("@") + 1);

	for(var row = 0; row < data.length; row++){
		//var beforeTmp;
		if(data[row].id.substring(0, data[row].id.lastIndexOf("@")) == d.id){
			// console.log(data[row])
			// console.log(d)

			//data[row].id
			//console.log(data[row], "INNNN")
			//console.log(data[row].id.substring(data[row].id.indexOf(d.id)))
			var tmp = data[row]
			//beforeTmp = tmp.id.substring(tmp.id.indexOf(0,rootPieces[rootPieces.length-1]))
			var modified = {id: tmp.id.substr(tmp.id.lastIndexOf("@")), value: tmp.value, order: tmp.order}
			//tmp.id = tmp.id.substr(tmp.id.indexOf(rootPieces[rootPieces.length-1]))

			//console.log(tmp.id.substring(19), rootPieces[rootPieces.length-1])
			//console.log(tmp.value, tmp)
			if(tmp.value > 0)
				data2.push(modified)
		}
	}
	//console.log(beforeTmp)
	return data2
}

function filterData(data){
	console.log(packDepth)
	console.log(data)
	data = data.filter(function(item, index) {
	   return item.depth <= packDepth 
	})
	console.log(data)
	return data
}

var data2;

function updatePack() {

	var data2 = filterData(rootPack.descendants())
// data2 = data
// console.log(data == data2)
	node = svgPack.select("g")
			.selectAll("g")
			.data(data2);
	circle = svgPack.select("g")
			.selectAll("g").select("cir")
			.data(data2);

	node.exit().remove();



	node = node
			.enter().append("g")
			.attr("r", function(d){ console.log(d); return d.r })
			.attr("id", function(d){return d.id})
			  .attr("transform", function(d) { 
			  	return "translate(" + d.x + "," +d.y+ ")"; })
			  	.attr("class", function(d) { return "node" + (!d.children ? " node--leaf" : d.depth ? "" : " node--root"); })
			   .each(function(d) { d.node = this; })
			   .attr("value", function(d){return d.value})
			   .on("mouseover", hoveredPack(true))
			   .on("mouseout", hoveredPack(false))
			   .on("contextmenu", function(d){ tooltipPack( true, data, d)})
			   .on("dblclick", function(d){zoomByDoubleClick(d, width, root, node, ng)} )
			   .style("stroke-width", strokeWidthPack/100)
			   .style("stroke", "#000");
			 //  .append("circle")
			   // 	.attr("r", function(d) { console.log(d);return d.r})
			   // 	.style("fill", function(d){
			   // 		return colors[d.id];
			   // 	});

	node.append("circle")
		.attr("r", function(d) { console.log(d);return d.r})
		.style("fill", function(d){
			return colors[d.id];
		});


		var arc = d3.arc()
			.innerRadius(function(d,i){ return d.r ;})
			.outerRadius(function(d,i){return d.r ;})
			.startAngle(Math.PI)
			.endAngle(3*Math.PI);

		node.append("path")
			.attr("fill","black")
			.attr("id", function(d,i){return "s"+i;})
			.attr("d",arc);

			node.append("text")
				.style("text-anchor","middle")
				.append("textPath")
				.attr("xlink:href",function(d,i){return "#s"+i;})
				.attr("startOffset",function(d,i){return "25%";})
				.text(function(d){ return (d.r>50 )? d.id.substring(d.id.lastIndexOf("@") + 1) : "";})

				svg.call(d3.zoom()
					.on("zoom", function(d){zoomManually( root, node, ng, svg)})).on("dblclick.zoom", null);//cancel default behavior 

}




function getMax(data){
	var max = 0;
	var maxi = 0
	for(var i in data){
		if(data[i].value > max){
			max = data[i].value
			maxi = i
		}
	}
	return maxi;
}