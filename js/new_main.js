var bakColor1 = "F1FF00";
var bakColor2 = "FF0000";
var eukColor1 = "00E8FF";
var eukColor2 = "000BFF";
var arcColor1 = "9F8868";
var arcColor2 = "699F62";
var packFont = 30;
var nodePadding = 1;
var packDepth = 3;
var opacityPack = 1;
var strokeWidthPack =5;

function mainSVG(data, mainDiv){

	//pack(data,div)


	// var width = 880,
	// 	height = 880;
	// var svg = d3.select(div).append("svg")
	// 	.attr("width", width)
	// 	.attr("height", height)
	// 	.style("background-color", "white")



	var stratify = d3.stratify()
		.parentId(function(d) { 
			return d.id.substring(0, d.id.lastIndexOf("@")); });

	//console.log(data)
	var roots = {}
	for(var sampleID in data){
		roots[sampleID] = stratify(data[sampleID])
		.sort(function(a, b) { return (a.value - b.value) })
		.eachAfter(function(node) { node.value = node.data.value;})
	}

	var rootsH = {}
	for(var sampleID in roots){
		rootsH[sampleID] = d3.hierarchy(roots[sampleID])
	}
	var leaves = {}
	for(var sampleID in rootsH){
		leaves[sampleID] = rootsH[sampleID].leaves();
	}

	//var similarities = genSimilarities(data, leaves)

	//force(data, div, similarities)
	savedRawData = data
	rawData = data
	var coordinates = pca(data);

	if (typeof(Storage) !== "undefined") {
    // Code for localStorage/sessionStorage.
       localStorage.setItem("coordinates", JSON.stringify(coordinates));

	} else {
	    // Sorry! No Web Storage support..
	    alert("UPDATE YOUR BROWSER")
	}

	//back button
	$("#svgField")[0].innerHTML += '<button type="button" class="btn btn-danger btn-lg" id="backPackButton" style="z-index: 2"  ><span class="glyphicon glyphicon-remove"></span></button>'
	$("body").one("click", "#backPackButton",function(){exit(rawData)})

	$("#output-field").css("opacity", 0.1)
	$("#inputRow").css("opacity", 0.1)




	plot(coordinates, mainDiv, rawData)


}









function updateColors(e){
	window[e.target.id] = e.target.value
	getBackPack(rawData)
}

function exit(){
	while ($("#svgField")[0].firstChild) {
    	$("#svgField")[0].removeChild($("#svgField")[0].firstChild);
	}
	while ($("#output-field")[0].firstChild) {
    	$("#output-field")[0].removeChild($("#output-field")[0].firstChild);
	}
	$("#output-field").css("opacity", 1)
	$("#inputRow").css("opacity", 1)

}

$( window ).on("unload" ,function() {
  	localStorage.clear();
});