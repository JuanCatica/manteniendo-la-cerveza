  ///////////////////////////////////////////////////////////////////////
    //////////////////// Draw STack Bar //////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    // List of subgroups = header of the csv files = soil condition here
    https://bl.ocks.org/d3noob/bdf28027e0ce70bd132edc64f1dd7ea4

    /*var vCostoMaxStack = 0;
    var escalaCostoStack = d3.scaleLinear()
        .domain([0, vCostoMaxStack]) // unit: $
        .range([0, 100]); // unit: pixels
    /*var dataStack_Costos = [];
    costos_X_dia.forEach(function (d) {
        row = {};
        row.group = d.key;
        row.value = escalaCostoStack(+d.value || 0);
        arreglo.push(row);
    });
    dataStack_Costos.push(arreglo);
    console.log(costos_X_dia);
    console.log("====================================================");
    console.log("dataStack_Costos");
    console.log(dataStack_Costos);
    console.log("====================================================");*/
    var marginStack = { top: 20, right: 20, bottom: 30, left: 40 },
        widthStack = 960 - marginStack.left - marginStack.right,
        heightStack = 500 - marginStack.top - marginStack.bottom;

    // set the ranges
    var xStack = d3.scaleBand()
        .range([0, widthStack])
        .padding(0.1);
    var yStack = d3.scaleLinear()
        .range([heightStack, 0]);

    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    svgStacked = d3.select("#stackbars").append("svg")
        .attr("width", widthStack + marginStack.left + marginStack.right)
        .attr("height", heightStack + marginStack.top + marginStack.bottom)
        .append("g")
        .attr("transform",
            "translate(" + marginStack.left + "," + marginStack.top + ")");

    // get the data
    // Scale the range of the data in the domains
    xStack.domain(costos_X_dia.map(function (d) { return new Date(d.key).getMonth(); }));
    yStack.domain([0, d3.max(costos_X_dia, function (d) { return d.value; })]);

    // append the rectangles for the bar chart
    svgStacked.selectAll(".bar")
        .data(costos_X_dia)
        .exit()//
        .remove()//
        .enter().append("rect")
        .merge(svgStacked)//
        .attr("class", "bar")
        .attr("x", function (d) { return xStack(new Date(d.key).getMonth()); })
        .attr("width", xStack.bandwidth())
        .attr("y", function (d) { return yStack(d.value); })
        .attr("height", function (d) { return height - yStack(d.value); });

    // add the x Axis
    svgStacked.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xStack));

    // add the y Axis
    svgStacked.append("g")
        .call(d3.axisLeft(yStack));
