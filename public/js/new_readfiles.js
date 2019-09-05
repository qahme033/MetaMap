$(document).ready(function(){
	/****************************Global Variables*********************************/
	var reader; //global FilerReader which will be used for progress bar
	var file;//global variable for input file
	var parsedData = []; //global variable for parsed  data


	var input = document.getElementById("input-files");
	// var packInputField = document.getElementById("pack-map-upload-field");
	var output = document.getElementById("output-field");

	//register eventlisteners
	input.addEventListener("change", function(e){
		fileSelectHandler(e,output);
	}, false);
});

// $( window ).on("unload",function() {
//   localStorage.clear()
// });


// packInputField.addEventListener("dragover", fileDragHandler, false);
// packInputField.addEventListener("drop", function(e){
// 	fileDropHandler(e,packOutput);
// }, false);

/******************************File reader functions*************************/
function fileSelectHandler(e, output){
	file = e.target.files[0];
	//console.log(file.name);
	progressHandler(file);
	fileInputHandler(file, output);
}

function fileDropHandler(e, output){
	e.stopPropagation();
	e.preventDefault();
	file = e.dataTransfer.files[0];
	progressHandler(file);
	fileInputHandler(file, output);

}

function fileDragHandler(e){
	e.stopPropagation();
	e.preventDefault();
	e.dataTransfer.dropEffect = "copy";
}

function errorHandle(e) {
	switch (e.target.error.code) {
		case e.target.error.NOT_FOUND_ERR:
			alert("File Not Found!");
			break;
		case e.target.error.NOT_READABLE_ERR:
			alert("File is not readable");
			break;
		case e.target.error.ABORT_ERR:
			break;	
		default:
			alert("An error occurred reading this file");
	};
}

function fileInputHandler(file, output, type){

	var fileTypeJSON = /json.*/;
	var fileTypeCSV = /csv.*/;
	var fileTypeTSV = /tsv.*/;
	var fileTypeTXT = /txt.*/;

	//check file type, currently not supporting json and txt
	if(file.name.match(fileTypeCSV) || file.name.match(fileTypeTSV)){

		output.innerText = "Current file: "+file.name.toString();
		console.log(file.size/1000+" KB");
		var fileSize = file.size/1000+" KB";

		//the maximum file size that can be handled in the browser
		if(file.size <23000000){
			//read file content by FileReader
			//need to generate a local FileReader to readAsText
			var reader = new FileReader();

			reader.onload = function(e){
				var data = reader.result;
				//parse the data into d3 compatible format
				if(file.name.match(fileTypeCSV)){
					parsedData = d3.csvParse(data);
					console.log(parsedData, parsedData.columns)

					//localStorage.setItem("parsedData", JSON.stringify(parsedData))
					//localStorage.setItem("foo", "yo")
					//console.log(parsedData, parsedData.columns)
					$(output).append('<div class="row" ><h4>Please select which samples</h4></div>')
					var samplesRow = ''
					for(var i = 1; i < parsedData.columns.length; i++){
						var btn = ' <label class="checkbox-inline"><input type="checkbox" class="checkbox" value="" checked="true" id="' + parsedData.columns[i] + '">' + parsedData.columns[i] + '</label>'
						samplesRow += btn;
						//$(output).append(btn)
					}
					$(output).append('<div class="row" >' + samplesRow +'</div>')
					$(output).append('<div class="row"><button type="button" class="btn btn-default" id="toggleChecked">Toggle all checks</button></div>')

					$(output).append('<div class="row"><button type="button" class="btn btn-primary btn-lg" id="goBtn">GO</button></div>')
					$("#toggleChecked").click(toggleChecked)

					$("#goBtn").click(startSVG)


				}
			}//END reader.onload

		reader.readAsText(file);

		}else{
			alert("Current file size: " + fileSize + " is too large to be processed.  File size has to be less than 23000KB.");
		}
		
	}else{
		output.innerText = "File format not supported!";
	}	
}

function startSVG(e){

	if(localStorage.getItem("parsedData"))
		parsedData = JSON.parse(localStorage.getItem("parsedData"))

	while ($("#svgField")[0].firstChild) {
    	$("#svgField")[0].removeChild($("#svgField")[0].firstChild);
	}

	//console.log(parsedData[0], parsedData.length)
	var tmp = {};
	//var allTotal = 0;
	$(".checkbox:checked").each(function(){
		var sampleID = this.id
			tmp[sampleID] = [];
			for(var row = 0; row < parsedData.length; row++){
			//	console.log(row)
				tmp[sampleID].push({id:  sampleID + "|"  + parsedData[row].Taxon  , value: parseFloat(parsedData[row][sampleID]), sampleID: sampleID})
			}
	//	}

	//	tmp[sampleID].unshift({id: "ALL@" + sampleID   , value: parseFloat(parsedData[0][sampleID])})
	})
	//console.log(tmp)
//	tmp["ALL@"]
	for(sampleID in tmp){
		for(row in tmp[sampleID]){
			var preproccedID = tmp[sampleID][row].id.replace(/[@_]{2,}/g, "@")
			if(preproccedID[preproccedID.length-1] == "@"){
				preproccedID = preproccedID.slice(0,preproccedID.length-1)
			}
			tmp[sampleID][row].id = preproccedID
		}
	}
	parsedData = tmp;

	var goBtn = document.getElementById("goBtn");
	var outputSVG = document.getElementById("svgField");
	//var packDisplayLable = document.getElementById("pack-map-type-indicator");

	//goBtn.addEventListener("click", function(){
	//	d3.select("#pack-map-display").selectAll("*").remove();

		mainSVG(parsedData, outputSVG);
		//var string = this.textContent;
		//packDisplayLable.textContent = string;
	//}, false);
}

function toggleChecked(e){
	$(".checkbox").each(function() {
		this.checked== true ? this.checked = false: this.checked = true;
    });
}

function progressHandler(file, type){
	reader = new FileReader();
	reader.onerror = errorHandle;
	reader.onprogress = updateProgress;

	reader.onabort = function(event){
		console.log("File read cancelled");
	};

	reader.onloadstart = function(event){
		console.log("loading...");
	};
	//reset option labels on action bar and remove previous graph upon successful loading
	reader.onload = function(event){
		console.log("loaded");
	}
	reader.readAsBinaryString(file);
}

function updateProgress(e){
	if(e.lengthComputable){
		var percentLoaded = Math.round((e.loaded/e.total)*100);
		if(percentLoaded < 100){
			console.log(percentLoaded + "%");
		}
	}
}
