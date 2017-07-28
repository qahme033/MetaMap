function donutChart(d, data){
	// console.log(data)
	// console.log(reduceRoot2(data, d))
	const width = window.innerWidth;
	const height =  window.innerHeight;
	const margin = {top: 10, right: 10, bottom: 10, left: 10};
	var colour = d3.scaleOrdinal(d3.schemeCategory20c) // colour scheme
	var radius = Math.min(width, height) / 2;
	var variable ="value"
	var category;
	var cornerRadius = 3 // sets how rounded the corners are on each slice
	var padAngle = 0.015 // effectively dictates the gap between slices


	floatFormat = d3.format('.4r')
	percentFormat = d3.format(',.2%')



	// var data = [
	//             {
	//                 Error:"0.045296463390387814",
	//                 Probability:"0.10069108308662117",
	//                 Species:"Halobacillus halophilus"
	//             },
	//             {
	//                 Error:"0.0096463390387814",
	//                 Probability:"0.04076903848429238",
	//                 Species:"Staphylococcus epidermidis"
	//             },
	//             {
	//                 Error:"0.03390387814",
	//                 Probability:"0.10318269548054262",
	//                 Species:"Chromobacterium violaceum"
	//             }
	// ]
	if(data){
		data = reduceRoot2(data, d)
		category = "id"

	}
	else{
	var category = "sampleID"
	var data = []
		for(var col in rawData){
			var tmp =  rawData[col][d.data.order] 
			//tmp.id = col
			data.push(tmp)
		}
			console.log(data)
	}
	// creates a new pie generator
	var pie = d3.pie()
	    .value(function(d) { return d[variable]; })
	    .sort(null);

	// contructs and arc generator. This will be used for the donut. The difference between outer and inner
	// radius will dictate the thickness of the donut
	var arc = d3.arc()
	    .outerRadius(radius * 0.8)
	    .innerRadius(radius * 0.6)
	    .cornerRadius(cornerRadius)
	    .padAngle(padAngle);

	// this arc is used for aligning the text labels
	var outerArc = d3.arc()
	    .outerRadius(radius * 0.9)
	    .innerRadius(radius * 0.9);

	var selection = document.getElementById("svgField");

	var svg = d3.select(selection).append('svg')
	    .attr('width', width + margin.left + margin.right)
	    .attr('height', height + margin.top + margin.bottom)
	    .style("position", "fixed")
	    .style("top", "0px")
	    .style("right", "0px")
	    .style("z-index", "-1")
	  .append('g')
	    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    // ===========================================================================================
    // g elements to keep elements within svg modular
    svg.append('g').attr('class', 'slices');
    svg.append('g').attr('class', 'labelName');
    svg.append('g').attr('class', 'lines');

    // ===========================================================================================
    // add and colour the donut slices
    var path = svg.select('.slices')
        .datum(data).selectAll('path')
        .data(pie)
    	.enter().append('path')
        .attr('fill', function(d) { return colour(d.data[category]); })
        .attr('d', arc);

    // ===========================================================================================
    // add text labels
    console.log(pie )

    var label = svg.select('.labelName').datum(data).selectAll('text')
        .data(pie)
    	.enter().append('text')
        .attr('dy', '.35em')
        .html(function(d) {
            // add "key: value" for given category. Number inside tspan is bolded in stylesheet.
            return d.data[category] + ': <tspan>' + d.data[variable] + '</tspan>';
        })
        .attr('transform', function(d) {

            // effectively computes the centre of the slice.
            // see https://github.com/d3/d3-shape/blob/master/README.md#arc_centroid
            var pos = outerArc.centroid(d);

            // changes the point to be on left or right depending on where label is.
            pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
            return 'translate(' + pos + ')';
        })
        .style('text-anchor', function(d) {
            // if slice centre is on the left, anchor text to start, otherwise anchor to end
            return (midAngle(d)) < Math.PI ? 'start' : 'end';
        });

    // ===========================================================================================
    // add lines connecting labels to slice. A polyline creates straight lines connecting several points
    var polyline = svg.select('.lines')
        .datum(data).selectAll('polyline')
        .data(pie)
    	.enter().append('polyline')
        .attr('points', function(d) {

            // see label transform function for explanations of these three lines.
            var pos = outerArc.centroid(d);
            pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
            return [arc.centroid(d), outerArc.centroid(d), pos]
        });

    // ===========================================================================================
    // add tooltip to mouse events on slices and labels
    d3.selectAll('.labelName text, .slices path').call(toolTip);


    // ===========================================================================================
    // Functions

    // calculates the angle for the middle of a slice
    function midAngle(d) { return d.startAngle + (d.endAngle - d.startAngle) / 2; }

    // function that creates and adds the tool tip to a selected element
    function toolTip(selection) {

        // add tooltip (svg circle element) when mouse enters label or slice
        selection.on('mouseenter', function (data) {

            svg.append('text')
                .attr('class', 'toolCircle')
                .attr('dy', -15) // hard-coded. can adjust this to adjust text vertical alignment in tooltip
                .html(toolTipHTML(data)) // add text to the circle.
                .style('font-size', '.9em')
                .style('text-anchor', 'middle'); // centres text in tooltip

            svg.append('circle')
                .attr('class', 'toolCircle')
                .attr('r', radius * 0.55) // radius of tooltip circle
                .style('fill', colour(data.data[category])) // colour based on category mouse is over
                .style('fill-opacity', 0.35);

        });

        // remove the tooltip when mouse leaves the slice/label
        selection.on('mouseout', function () {
            d3.selectAll('.toolCircle').remove();
        });
    }

    // function to create the HTML string for the tool tip. Loops through each key in data object
    // and returns the html string key: value
    function toolTipHTML(data) {

        var tip = '',
            i   = 0;

        for (var key in data.data) {

            // if value is a number, format it as a percentage
            var value = (!isNaN(parseFloat(data.data[key]))) ? data.data[key] : data.data[key];

            if(key == "id")
            	value = data.data.id.substring(data.data.id.lastIndexOf("@") + 1)

            // leave off 'dy' attr for first tspan so the 'dy' attr on text element works. The 'dy' attr on
            // tspan effectively imitates a line break.
            if (i === 0) tip += '<tspan x="0">' + key + ': ' + value + '</tspan>';
            else tip += '<tspan x="0" dy="1.2em">' + key + ': ' + value + '</tspan>';
            i++;
        }

        return tip;
    }
}

