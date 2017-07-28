var scatterToolTipListener;
var packToolTipListener;

function tooltipScatter(mainDiv, show, rawData, d){
	d3.event.preventDefault();
	var tooltip = d3.select($(".tooltip")[0]);

	if(show){
		   	tooltip
		   		.style("opacity", 1)
  	            .html(genButtom("scatter", d, rawData))
  	            .style("left", (d3.event.pageX) + "px")		
  	            .style("top", (d3.event.pageY ) + "px");	
	}
	else{
		tooltip
			.style("opacity", 0)
	}

}

function tooltipPack( show, filteredData, d){
	d3.event.preventDefault();
	var tooltip = d3.select($(".tooltip")[0]);
	console.log(d)

	if(show){
		   	tooltip
		   		.style("opacity", 1)
  	            .html(genButtom("pack", d, filteredData))
  	            .style("left", (d3.event.pageX) + "px")		
  	            .style("top", (d3.event.pageY ) + "px");	
	}
	else{
		tooltip
			.style("opacity", 0)
	}

}


function genButtom(type, d, data){
	var buttonOpenTag = '<button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">'
	var description = 'Options'
	var downIcon = '<span class="caret"></span>'
	var buttonClosingTag = '</button>'
	var dropDownOpenTag = '<ul class="dropdown-menu" id="foo">'
	console.log(d)

	var dropDownOption;
	if(type == "scatter"){
	 	dropDownOption = '<li id="packButton" ><a href="#" > Analyse ' + d.id + '</a></li>'
		if(scatterToolTipListener)
			scatterToolTipListener.off()
		scatterToolTipListener = $("body").on("click", "#packButton",function(){sampleDetail(d, data)})

	}
	else if(type == "pack"){
		console.log(data)
		dropDownOption = '<li  ><a href="#" id="barChartDecendants"> Bar Chart (descendants) for  ' + d.id.substring(d.id.lastIndexOf("@") + 1) + '</a></li>'
		dropDownOption += '<li  ><a href="#" id="barChartButton">  Bar chart for ' + d.id.substring(d.id.lastIndexOf("@") + 1) + '</a></li>'
		dropDownOption += '<li  ><a href="#" id="rPie"> Rotating Pie for  ' + d.id.substring(d.id.lastIndexOf("@") + 1) + '</a></li>'
		dropDownOption += '<li  ><a href="#" id="sPieX"> Static X Pie for  ' + d.id.substring(d.id.lastIndexOf("@") + 1) + '</a></li>'
		// dropDownOption += '<li  ><a href="#" id="sPieY"> Static Y Pie for  ' + d.id.substring(d.id.lastIndexOf("@") + 1) + '</a></li>'
		dropDownOption += '<li  ><a href="#" id="treeButton">  Tree for  ' + d.id.substring(d.id.lastIndexOf("@") + 1) + '</a></li>'
		dropDownOption += '<li  ><a href="#" id="rTreeButton"> Radial Tree for  ' + d.id.substring(d.id.lastIndexOf("@") + 1) + '</a></li>'
		dropDownOption += '<li  ><a href="#" id="donutChart"> Donut Chart (samples) for  ' + d.id.substring(d.id.lastIndexOf("@") + 1) + '</a></li>'



		if(packToolTipListener)
			packToolTipListener.off()
		packToolTipListener = $("body").on("click", "#foo",function(e){handlePackListener(e,d, data)})
	
	}

	var dropDownClosingTag = '</ul>'

	var button = buttonOpenTag + description + downIcon + buttonClosingTag
	var dropdown = dropDownOpenTag + dropDownOption + dropDownClosingTag

	return button + dropdown
}
function makeBarChart(d, div, type){
	// while ($("#svgField")[0].firstChild) {
 //    	$("#svgField")[0].removeChild($("#svgField")[0].firstChild);
	// }
	$("#goBtn").remove()
	$("#goBtn").remove()
	packPanel.close()
	//back button
	$("#svgField")[0].innerHTML += '<button type="button" class="btn btn-danger btn-lg" id="backPackButton"  ><span class="glyphicon glyphicon-arrow-left"></span></button>'
	$("body").one("click", "#backPackButton",function(){getBackPack(rawData)})

	while ($("#tooltip")[0].firstChild) {
	   	$("#tooltip")[0].removeChild($("#tooltip")[0].firstChild);
	}
	if(type == "barChartButton"){
		barChart(d, $("#svgField")[0])
		makeBarChartPanels()

	}
	else if(type == "donutChart"){
		console.log("donutChart")
		donutChart(d)
	}



}
function makeTree(data, d, type){
	$("#goBtn").remove()
	$("#goBtn").remove()
	packPanel.close()

	//back button
	$("#svgField")[0].innerHTML += '<button type="button" class="btn btn-danger btn-lg" id="backPackButton" style="z-index: 2"  ><span class="glyphicon glyphicon-arrow-left"></span></button>'
	$("body").one("click", "#backPackButton",function(){getBackPack(rawData)})


	if(type == "treeButton"){
		var rdata = reduceRoot(data, d)
		console.log(rdata)
		tree(rdata, $('#svgField')[0])
		makeTreeChartPanels(rdata)

	}
	if(type == "rTreeButton"){
		var rdata = reduceRoot(data, d)
		radialTree(rdata, $('#svgField')[0])
	}
	if(type == "rPie"){
		var rdata = reduceRoot(data, d)
		rotatingPie(rdata, $('#svgField')[0])
	}
	if(type == "sPieX"){
		var rdata = reduceRoot(data, d)
		var default_connector = "-";
		staticPieX(rdata, $('#svgField')[0], default_connector)
	}
	if(type == "sPieY"){
		var rdata = reduceRoot(data, d)
		var default_connector = "-";

		staticPieY(rdata, $('#svgField')[0], default_connector)
	}	
	else if(type == "barChartDecendants"){
		barChart(d, $("#svgField")[0], reduceRoot2(data,d))
		makeBarChartPanels()

	}
	// else{
	// 	tree(data, $('#svgField')[0])
	// 	//makeTreeChartPanels(rdata)
	// }

}

function handlePackListener(e,d, data){
	while ($("#tooltip")[0].firstChild) {
	   	$("#tooltip")[0].removeChild($("#tooltip")[0].firstChild);
	}

	$("#svg").css("opacity", 0.1)
	// $("#output-field").css("opacity", 0.1)
	var type = e.target.id 
	console.log(type)

	if(type == "barChartButton")
		makeBarChart(d, $("#svgField")[0], type)
	// if(type == "treeButton"){
	// 	makeTree(data, d, type)
	// }
	// if(type == "rTreeButton"){
	// 	makeTree(data, d, type)
	// }
	// if(type == "rTreeButton"){
	// 	makeTree(data, d, type)
	// }
	if(type == "donutChart"){
		makeBarChart(d, $("#svgField")[0], "donutChart")
	}
	else{
		makeTree(data,d,type)
	}
}

function sampleDetail(id, rawData){
	//$('#myModal').modal('show');





	while ($("#svgField")[0].firstChild) {
    	$("#svgField")[0].removeChild($("#svgField")[0].firstChild);
	}
	while ($("#tooltip")[0].firstChild) {
	   	$("#tooltip")[0].removeChild($("#tooltip")[0].firstChild);
	}

	//back button
	$("#svgField")[0].innerHTML += '<button type="button" class="btn btn-danger btn-lg"   id="goBtn"><span class="glyphicon glyphicon-arrow-left"></span></button>'
	$("body").one("click", "#goBtn",function(){getBackMain(rawData)})

	//save state
	localStorage.setItem("packData", JSON.stringify([id]));
	//localStorage.setItem("rawData", JSON.stringify(rawData));



	pack(rawData, $("#svgField")[0], [id], false)
	makePackPanels()

}

function getBackPack(rawData){
	//thirdLevelPanel.close()
	while ($("#svgField")[0].firstChild) {
    	$("#svgField")[0].removeChild($("#svgField")[0].firstChild);
	}
	$("#backPackButton").remove()
	
	$("#svgField")[0].innerHTML += '<button type="button" class="btn btn-danger btn-lg"   id="goBtn"><span class="glyphicon glyphicon-arrow-left"></span></button>'
	$("body").one("click", "#goBtn",function(){getBackMain(rawData)})

	pack(rawData, $("#svgField")[0], JSON.parse(localStorage.getItem("packData")), true)
	//makePackPanels()
}

function getBackMain(){
	while ($("#svgField")[0].firstChild) {
    	$("#svgField")[0].removeChild($("#svgField")[0].firstChild);
	}
	$("#svgField")[0].innerHTML += '<button type="button" class="btn btn-danger btn-lg" id="backPackButton" style="z-index: 2"  ><span class="glyphicon glyphicon-remove"></span></button>'
	$("body").one("click", "#backPackButton",function(){exit(rawData)})
	plot(JSON.parse(localStorage.getItem("coordinates")), $("#svgField")[0], rawData)
	packPanel.close()
}

//.html(' <ul class="dropdown-menu">  </ul>')
