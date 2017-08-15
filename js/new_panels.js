var packPanel;
var barChartPanel;
var treeChartPanel;
var mainPlotPanel;

function makePackPanels(){
	var fontSliderHTML ='<label>FONT size</label><div id="packFontSlider"><div id="packFontSlider-handle" class="ui-slider-handle"></div></div>'
	var paddingSliderHTML = '<label>Node padding</label><div id="nodePadSlider"><div id="nodePadSlider-handle" class="ui-slider-handle"></div></div>'
	var depthSliderHTML = '<label>Depth</label><div id="depthSlider"><div id="depthSlider-handle" class="ui-slider-handle"></div></div>'
	var opacitySliderHTML = '<label>Opacity</label><div id="packOpacitySlider"><div id="packOpacitySlider-handle" class="ui-slider-handle"></div></div>'
	var strokeSliderHTML = '<label>Stroke width</label><div id="strokeSlider"><div id="depthSlider-handle" class="ui-slider-handle"></div></div>'
	var packScaleOption1 = '<div class="radio"><label><input type="radio" checked="true" id="linearOption" name="optradio">Linear</label></div>'
	var packScaleOption2 = '<div class="radio"><label><input type="radio" id="logOption" name="optradio">Log</label></div>'
	var packScaleOption3 = '<div class="radio"><label><input type="radio" id="sqrtOption" name="optradio">Power...  </label></div><input id="powerScale" value="0.5"></input>'
	var packScaleOptions = packScaleOption1 + packScaleOption2 + packScaleOption3;


	packPanel =	$.jsPanel({
	    position:    {my: "right-top", at: "right-top", offsetY: 400},
	  //  theme:       "rebeccapurple",
	    contentSize: {width: 300, height: 500},
	    headerTitle: " Settings",
	    content:     '<p id="bakColor">Backteria </p><p id="eukColor">Eukaryotes ...</p><p id="arcColor">Archaea ...</p>' + fontSliderHTML + paddingSliderHTML + depthSliderHTML + opacitySliderHTML +strokeSliderHTML +packScaleOptions,
	    callback:    function () {
	        this.content.css("padding", "15px");

	        var bakColorInput1 = document.createElement('INPUT'); bakColorInput1.id = "bakColor1"
	        var bakColorInput2 = document.createElement('INPUT'); bakColorInput2.id = "bakColor2"
	        var eukColorInput1 = document.createElement('INPUT'); eukColorInput1.id = "eukColor1"
	        var eukColorInput2 = document.createElement('INPUT'); eukColorInput2.id = "eukColor2"
	        var arcColorInput1 = document.createElement('INPUT'); arcColorInput1.id = "arcColor1"
	        var arcColorInput2 = document.createElement('INPUT'); arcColorInput2.id = "arcColor2"

	        bakColor1 = "F1FF00"; bakColor2 = "FF0000";
	        eukColor1 = "00E8FF"; eukColor2 = "000BFF";
	        arcColor1 = "9F8868"; arcColor2 = "699F62";

	        new jscolor(bakColorInput1).fromString(bakColor1); new jscolor(bakColorInput2).fromString(bakColor2);
	        new jscolor(eukColorInput1).fromString(eukColor1); new jscolor(eukColorInput2).fromString(eukColor2);
	        new jscolor(arcColorInput1).fromString(arcColor1); new jscolor(arcColorInput2).fromString(arcColor2)

	        document.getElementById("bakColor").appendChild(bakColorInput1); document.getElementById("bakColor").appendChild(bakColorInput2)
	        document.getElementById("eukColor").appendChild(eukColorInput1); document.getElementById("eukColor").appendChild(eukColorInput2)
	        document.getElementById("arcColor").appendChild(arcColorInput1); document.getElementById("arcColor").appendChild(arcColorInput2)

	        $(bakColorInput1).on("change", function(e){updateColors(e)})
	        $(bakColorInput2).on("change", function(e){updateColors(e)})
	        $(eukColorInput1).on("change", function(e){updateColors(e)})
	        $(eukColorInput2).on("change", function(e){updateColors(e)})
	        $(arcColorInput1).on("change", function(e){updateColors(e)})
	        $(arcColorInput2).on("change", function(e){updateColors(e)})

	        var handle1 = $( "#packFontSlider-handle" );
	            $( "#packFontSlider" ).slider({
	            	value:30,
	            	min:0,
	            	max:100,
	              create: function() {
	                	handle1.text( $( this ).slider( "value" ) );

	              },
	              slide: function( event, ui ) {
		                handle1.text( ui.value );
		                packFont = ui.value;
		                node.style("font-size",function(d){return packFont/transformPack.k})
		                //getBackPack(rawData)	              
	            	}
	            });

	        var handle2 = $( "#nodePadSlider-handle" );
	            $( "#nodePadSlider" ).slider({
	            	value:nodePadding,
	            	min:1,
	            	max:200,
	              create: function() {
	             	   handle2.text( $( this ).slider( "value" ) );

	              },
	              slide: function( event, ui ) {
		                handle2.text( ui.value );
		                nodePadding = ui.value;
		               // packThis.padding(nodePadding/100);

		             //   getBackPack(rawData)	              
	            	}
	            });

	            var handle3 = $( "#depthSlider-handle" );
	                $( "#depthSlider" ).slider({
	                	value:packDepth,
	                	min:0,
	                	max:10,
	                  create: function() {
	                   		handle3.text( $( this ).slider( "value" ) );

	                  },
	                  slide: function( event, ui ) {
		                    handle3.text( ui.value );
		                    packDepth = ui.value;
		                    updatePack()             
		                }
	                });

	            var handle4 = $( "#packOpacitySlider-handle" );
	                $( "#packOpacitySlider" ).slider({
	                	value:opacityPack,
	                	min:0,
	                	max:15,
	                  create: function() {
	                    handle4.text( $( this ).slider( "value" ) );

	                  },
	                  slide: function( event, ui ) {
	                    handle4.text( ui.value/10 );
	                 //   opacityPack = ui.value/10;
	                    updatePack()	              
	                }
	                });

	            var handle5 = $( "#strokeSlider-handle" );
	                $( "#strokeSlider" ).slider({
	                	value:strokeWidthPack,
	                	min:0,
	                	max:10,
	                  create: function() {
	                    	handle5.text( $( this ).slider( "value" ) );

	                  },
	                  slide: function( event, ui ) {
		                    handle5.text( ui.value );
		                    strokeWidthPack = ui.value/100;
		                    console.log(document.getElementsByTagName('style'))
							$(".node").css("stroke-width",strokeWidthPack)
		                    //getBackPack(rawData)	             
	                    }
	                });


	                $(".radio").on("change", function(e){
	                	console.log(e)

	                	mainPlotScaleType = e.target.id

	                	//updateMainPlot()

	                })

	    }
	});

}


function makeBarChartPanels(){
	console.log("YOO")
	var fontSliderHTML ='<label>FONT size</label><div id="packFontSlider"><div id="packFontSlider-handle" class="ui-slider-handle"></div></div>'



	barChartPanel = $.jsPanel({
	    position:    {my: "right-top", at: "right-top", offsetY: 400},
	  //  theme:       "rebeccapurple",
	    contentSize: {width: 300, height: 350},
	    headerTitle: "Bar Chart Settings",
	    content:     fontSliderHTML ,
	    callback:    function () {
	        this.content.css("padding", "15px");

	       

	        var handle1 = $( "#packFontSlider-handle" );
	            $( "#packFontSlider" ).slider({
	            	value:30,
	            	min:0,
	            	max:100,
	              create: function() {
	                	handle1.text( $( this ).slider( "value" ) );
	              },
	              slide: function( event, ui ) {
		                handle1.text( ui.value );
		                barChartFont = ui.value;
		              //  console.log(x_axis? x_axis.style("font-size"))
			        	x_axis.style("font-size", function(d){return barChartFont})
	            	}
	            });

	    
	    }
	});

	thirdLevelPanel = barChartPanel

}




function makeTreeChartPanels(rdata){
	console.log("YOO")
	var treeScaleSliderHTML ='<label>FONT size</label><div id="treeScaleSlider"><div id="treeScaleSlider-handle" class="ui-slider-handle"></div></div>'
	var treeScaleOption1 = '<div class="radio"><label><input type="radio" id="linearOption" name="optradio">Linear</label></div>'
	var treeScaleOption2 = '<div class="radio"><label><input type="radio" id="logOption" name="optradio">Log</label></div>'
	var treeScaleOption3 = '<div class="radio"><label><input type="radio" id="sqrtOption" name="optradio">Sqrt</label></div><input id="treePowerScale" value="0.5"></input>'
	var treeScaleOptions = treeScaleOption1 + treeScaleOption2 + treeScaleOption3;




	treeChartPanel = $.jsPanel({
	    position:    {my: "right-top", at: "right-top", offsetY: 400},
	  //  theme:       "rebeccapurple",
	    contentSize: {width: 300, height: 350},
	    headerTitle: "Tree Settings",
	    content:     treeScaleSliderHTML + treeScaleOptions,
	    callback:    function () {
	        this.content.css("padding", "15px");

	       

	        var handle1 = $( "#treeScaleSlider-handle" );
	            $( "#treeScaleSlider" ).slider({
	            	value:100,
	            	min:1,
	            	max:10000,
	              create: function() {
	                	handle1.text( $( this ).slider( "value" ) );
	              },
	              slide: function( event, ui ) {
		                handle1.text( ui.value );
		                scaleFac = ui.value;
		                updateTreeLink()
						//$(".node").css("stroke-width",strokeWidthPack)
		                //console.log(x_axis? x_axis.style("font-size"))
			        	//x_axis.style("font-size", function(d){return barChartFont})
	            	}
	            });

            $("#treePowerScale").on("change", function(e){
            	console.log("POWER")

            	tPower = e.target.value
            	 if(treeScaleType == "sqrtOption")
            	 	updateTreeLink()


            	//updateMainPlot()

            })

	        $(".radio").on("change", function(e){
	        	console.log(e)

	        	treeScaleType = e.target.id
	        	updateTreeLink()

	        })

	    
	    }
	});

	thirdLevelPanel = barChartPanel

}


function mainPlotPanels(){
	console.log("YOO")
	var treeScaleSliderHTML ='<label>FONT size</label><div id="mPFontSizeSlider"><div id="mPFontSizeSlider-handle" class="ui-slider-handle"></div></div>'
	var treeScaleOption1 = '<div class="radio"><label><input type="radio" checked="true" id="linearOption" name="optradio">Linear</label></div>'
	var treeScaleOption2 = '<div class="radio"><label><input type="radio" id="logOption" name="optradio">Log</label></div>'
	var treeScaleOption3 = '<div class="radio"><label><input type="radio" id="sqrtOption" name="optradio">Power...  </label></div><input id="powerScale" value="0.5"></input>'
	var treeScaleOptions = treeScaleOption1 + treeScaleOption2 + treeScaleOption3;




	mainPlotPanel = $.jsPanel({
	    position:    {my: "right-top", at: "right-top", offsetY: 400},
	  //  theme:       "rebeccapurple",
	    contentSize: {width: 300, height: 350},
	    headerTitle: "Scatter Settings",
	    content:     treeScaleSliderHTML + treeScaleOptions,
	    callback:    function () {
	        this.content.css("padding", "15px");

	       

	        var handle1 = $( "#mPFontSizeSlider-handle" );
	            $( "#mPFontSizeSlider" ).slider({
	            	value:5,
	            	min:1,
	            	max:10,
	              create: function() {
	                	handle1.text( $( this ).slider( "value" ) );
	              },
	              slide: function( event, ui ) {
		                handle1.text( ui.value );
		                mpFontSize = ui.value;
		                updateMainPlot()
						//$(".node").css("stroke-width",strokeWidthPack)
		              //  console.log(x_axis? x_axis.style("font-size"))
			        	//x_axis.style("font-size", function(d){return barChartFont})
	            	}
	            });


	        $("#powerScale").on("change", function(e){
	        	console.log("POWER")

	        	mpPower = e.target.value
	        	 if(mainPlotScaleType == "sqrtOption")
	        	 	updateMainPlot()


	        	//updateMainPlot()

	        })

	        $(".radio").on("change", function(e){
	        	console.log(e)

	        	mainPlotScaleType = e.target.id

	        	updateMainPlot()

	        })
	        

	    
	    }
	});

}

function closePanels(){
	if(packPanel) packPanel.close();
	if(barChartPanel) barChartPanel.close();
	if(treeChartPanel) treeChartPanel.close();
	if(mainPlotPanel) mainPlotPanel.close();
}