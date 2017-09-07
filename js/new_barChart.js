var barChartFont = 1;
function barChart(d, div, data){
	console.log("NEW BAR CHART")
	width = window.innerWidth;
	height =  window.innerHeight;

	var svg = d3.select(div).append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("id", "svgBarChart")
		.style("position", "fixed")
		.style("top", "0px")
		.style("right", "0px")
		// .style("background-color", "gray")
		// .style("opacity", "0.")
		.style("z-index", "-1")
		.call(d3.zoom().on("zoom", zoomBar));      // ref [1]


	
		var margin = {top: 400, right: 20, bottom: 100, left: 100},
		width = window.innerWidth - margin.left - margin.right,
		height = window.innerHeight - margin.top - margin.bottom,

    g = svg.insert("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			var x = d3.scaleBand()
			    .rangeRound([0, width])
			    .paddingInner(0.05)
			    .align(0.1);

			var y = d3.scaleLog()
			    .range([height, 0]);

			var z = d3.scaleOrdinal()
			    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
			var category = "id"
			if(!data){
				var category = "sampleID"
				var data = []
					for(var col in rawData){
						var tmp =  rawData[col][d.data.order] 
						data.push(tmp)
					}
			}
			 // var keys = Object.keys(data[0]);
			 var keys = ["value"]
			//  data.sort(function(a, b) { return parseFloat(b.value) - parseFloat(a.value); });
			  x.domain(data.map(function(d) { return  d[category].substring( d[category].lastIndexOf("@")+1 ); }));
			  y.domain([1, d3.max(data, function(d) {return parseFloat(d.value); })]).nice();
			  z.domain(keys);

			var bars =  g.append("g")
			    .selectAll("g")
			    .data(d3.stack().keys(keys)(data))
			    .enter().append("g")
			      .attr("fill", function(d) { return "#98abc5"; })
			    .selectAll("rect")
			    .data(function(d) { return d; })
			    .enter().append("rect")
			      .attr("x", function(d) {return x(d.data[category].substring( d.data[category].lastIndexOf("@")+1 )); })
			      .attr("y", function(d) { return y(d[1]) ; })
			      .attr("height", function(d) {return y(d[0]+1)- y(d[1]) ; })
			      .attr("width", x.bandwidth())
			      .attr("class", function(){return "foo"})
			      .attr("id", function(d){return  d.data[category].substring( d.data[category].lastIndexOf("@")+1 )})

			setTimeout(function(){  

				$(".foo").on("mouseover", function(e){
							var axisElems = $("#xAxis")[0].children
							for(var i = 1; i < axisElems.length; i++){
								if(e.target.id.includes(axisElems[i].textContent)){
									axisElems[i].style.opacity = 1
									//axisElems[i].style.fontSize = 15
								}
								else{
									axisElems[i].style.opacity = 0.5
								}
							}
						})

				$(".foo").on("mouseout", function(e){
					var axisElems = $("#xAxis")[0].children
					for(var i = 1; i < axisElems.length; i++){
						if(e.target.id.includes(axisElems[i].textContent)){
							//axisElems[i].style.opacity = 0
							//axisElems[i].style.fontSize = 6
						}
					}
				})
				.on("contextMenu", function(d){
					console.log(d)
				})
				 }, 0);

			var xAxis = d3.axisBottom(x)
			   x_axis = g.append("g")
			      .attr("class", "axis").style("font-size", barChartFont )//.style("opacity", 0.5)
			      .attr("id", "xAxis")
			      .attr("transform", "translate(0," + height + ")")
			      .on("mouseover", function(d){console.log(d);console.log(d3.event)})

			     // .attr("font-size", 0.5)
			      .call(d3.axisBottom(x))

			  var yAxis =d3.axisLeft(y);

			  var axis = g.append("g")
			      .attr("class", "axis")
			   //   .attr("transform", "translate(0," + height + ")")
			      .call(yAxis)

			  //  .append("text")
			   //   .attr("x", 2)
			      // .attr("y", y(y.ticks().pop()) + 0.5)
			      // .attr("dy", "0.32em")
			      // .attr("fill", "#000")
			      // .attr("font-weight", "bold")
			      // .attr("text-anchor", "start")
			      // .text("Population")




			  var title = g.append("text")
			        .attr("x", (width / 2))             
			        .attr("y", 0 - (margin.top / 3))
			        .attr("text-anchor", "middle")  
			        .style("font-size", "25px") 
			        .style("text-decoration", "underline")  
			        .text(d.id.endsWith("cellular organisms")? d.id.substring( d.id.lastIndexOf("|") + 1) : d.id.substring( d.id.lastIndexOf("@")+1 ))


			  var legend = g.append("g")
			      .attr("font-family", "sans-serif")
			      .attr("font-size", 10)
			      .attr("text-anchor", "end")
			    .selectAll("g")
			    .data(keys.slice().reverse())
			    .enter().append("g")
			      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });


			      function zoomBar(){
			      	console.log("zoom")
			      	axis.transition()
			      	      .duration(50)
			      	      .call(yAxis.scale(d3.event.transform.rescaleY(y)));

			     	var new_yScale = d3.event.transform.rescaleY(y);
			      	bars.attr("height", function(d) {return new_yScale(d[0]+1) - new_yScale(d[1]); });

			      	bars.attr("y", function(d) { return new_yScale(d[1]); });


			      	console.log(d3.event)
			      	bars.attr("transform", "translate(" + d3.event.transform.x+",0)scale(" + d3.event.transform.k + ",1)");
			        x_axis.attr("transform", "translate(" + d3.event.transform.x+","+(height)+")")
			        //	.style("font-size", function(d){return d3.event.transform.k*barChartFont})
			            .call(xAxis.scale(x.rangeRound([0, width * d3.event.transform.k],.1 * d3.event.transform.k)));
			      	axis.call(yAxis);

			    	     //  .attr("cy", function(d) { return y(d.messages_sent_in_day); });
			      }
		// //	});
	}


