'use strict'
/* RETURN THE WINDOW SIZE */
function getWindowSize(){ return {w:window.innerWidth, h:window.innerHeight}};

/*
HANDLE THE WINDOW EVENTS
TODO: Incorporar elemento
https://uniandes-my.sharepoint.com/:w:/r/personal/jc_catica_uniandes_edu_co/Documents/AWSCouse/solution-architect.docx?d=w171c2ab5f9a5476eb9794d8c0c45192b&csf=1&web=1&e=fdXi79
https://stackoverflow.com/questions/26220936/how-can-i-group-json-data-into-the-weeks-according-to-calender
http://www.d3noob.org/2014/02/grouping-and-summing-data-using-d3nest.html
https://observablehq.com/@d3/d3-scaletime
https://stackoverflow.com/questions/8614947/jquery-and-django-csrf-token
https://stackoverflow.com/questions/52690413/d3-js-queue-with-multiple-json-files
https://observablehq.com/@d3/streamgraph-transitions
https://groups.google.com/g/d3-js/c/3hHke9ZKfQM?pli=1
https://groups.google.com/g/d3-js/c/3Y9VHkOOdCM/m/YnmOPopWUxQJ
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
http://learnjsdata.com/read_data.html
*/
//function drag(){
//    console.log("hola")
//    return d3.drag()
//        .on("start", console.log("start"))
//        .on("drag", console.log("drag"))
//        .on("end", console.log("end"));
//}
/* EXECUTED WHEN DOM IS READY */
$(document).ready(function(){

    /* WIN VARs */
    var winSize = getWindowSize();

    /* HEATMAP VARs */
    var hmMargin = {top:30,right:130,bottom:20,left:50}
    var hmSize = {w:winSize.w - hmMargin.left - hmMargin.right, h:150 - hmMargin.top - hmMargin.bottom}

    var div = d3.select("body").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0)
        .style("position", "absolute")
        .style("text-align", "center")
        .style("background", "lightsteelblue")
        .style("border-radius", "3px");

    
    
    /* DATA */
    //d3.csv("file.csv", function(data) {
    //d3.json("dbprocessed/risks_test.json", function(error, data_risk) {
    d3.queue()
        .defer(d3.json, "dbprocessed/times.json")
        .defer(d3.json, "dbprocessed/costs.json")
        .defer(d3.json, "dbprocessed/risks_test.json")
        .await(function(error, data_time, data_cost, data_risk) {
            if (error) throw error;
        
            const tParser = d3.timeParse("%Y-%m-%d %H:%M:%S");
            data_risk.forEach(function(d) { d.fecha = tParser(d.fecha);});
            data_risk = data_risk.filter(function(d) {return d.fecha.getYear() == 117;});
            data_risk.sort(function(a,b){return new Date(b.fecha) - new Date(a.fecha);});
            var maxRisk = data_risk[data_risk.length - 1].fecha
            var minRisk = data_risk[0].fecha
            //data_risk.forEach(function(d) { d.fecha = d.fecha.toISOString().slice(0,10)});
            
            var equipos = d3.map(data_risk, function(d){return d.id_equipo;}).keys();
            //var fechas = d3.map(data_risk, function(d){return d.fecha;}).keys();
            
            // ------------------------------
            // BARRAS
            data_time = d3.nest()
                .key(function(d) { return d.fecha;})
                .rollup(function(d) { return d3.sum(d, function(g) {return g.trabajo_real; }); })
                .entries(data_time);
            data_time.forEach(function(d) { d.key = tParser(d.key);});
            
            data_cost = d3.nest()
                .key(function(d) { return d.fecha;})
                .rollup(function(d) { return d3.sum(d, function(g) {return g.costo_total; }); })
                .entries(data_cost);
            data_cost.forEach(function(d) { d.key = tParser(d.key);});

            data_time.sort(function(a,b){return new Date(b.fecha) - new Date(a.fecha);});
            data_cost.sort(function(a,b){return new Date(b.fecha) - new Date(a.fecha);});

            var max = data_time[data_time.length - 1].key
            var min = data_time[0].key

            var xb = d3.scaleTime()
                .range([0, hmSize.w])
                .domain([min,max]);
            var yt = d3.scaleLinear()
                .range([hmSize.h/2, 0])
                .domain([d3.min(data_time, d => d.value), d3.max(data_time, d => d.value)]); // en max agregar una semana mas

            var yc = d3.scaleLinear()
                .range([hmSize.h/2, 0])
                .domain([d3.min(data_cost, d => d.value), d3.max(data_cost, d => d.value)]);
            
            
            var svgBar = d3.select("#sliderTimeFilter")
                .append("svg")
                .attr("width", hmSize.w + hmMargin.left + hmMargin.right)
                .attr("height", hmSize.h + hmMargin.top + hmMargin.bottom)
                .append("g") //brush
                .attr("transform","translate(" + hmMargin.left + "," + hmMargin.top + ")")
                .attr("class", "brush")

            //svgBar.append("g")
            //    .attr("class", "brush")

            svgBar.append("g")
                .attr("transform", "translate(0," + hmSize.h + ")")
                .call(d3.axisBottom(xb))
            //svgBar.append("g")
            //    .call(d3.axisLeft(yt))
            svgBar.selectAll()
                .data(data_time)
                .enter()
                .append("rect")
                .attr("x", function(d) {return xb(d.key); })
                .attr("y", hmSize.h/2)
                .attr("width", hmSize.w/(data_time.length ))
                .attr("height", function(d) { return yt(d.value); } )
                .style("opacity", 0.8)
                .style("fill", "salmon");
                //.on("mouseover", function(d){
                //    //d3.selectAll("rect").style("opacity", .6)
                //    d3.select(this)
                //    //  .style("opacity", 1);   
                //    slider.transition()		
                //    .duration(200)		
                //    .style("opacity", 0.9);		
                //    slider.html("total: " + d.value)	
                //    .style("left", (d3.event.pageX) + 40 + "px")		
                //    .style("top", (d3.event.pageY) + "px");
                //})
                //.on("mouseout", function(d){  
                //    //d3.selectAll("rect").style("opacity", 1)
                //    slider.transition()		
                //    .duration(500)		
                //    .style("opacity", 0);
                //});

            svgBar.selectAll()
                .data(data_cost)
                .enter()
                .append("rect")
                .attr("x", function(d) {return xb(d.key); })
                .attr("y", function(d) { return hmSize.h/2 - yc(d.value) })
                .attr("width", hmSize.w/(data_cost.length ))
                .attr("height", function(d) { return yc(d.value); } )
                .style("opacity", 0.8)
                .style("fill", "#69b3a2")
                //.on("mouseover", function(d){
                //    //d3.selectAll("rect").style("opacity", .6)
                //    d3.select(this)
                //    //  .style("opacity", 1);   
                //    slider.transition()		
                //    .duration(200)		
                //    .style("opacity", 0.9);		
                //    slider.html("total: " + d.value)	
                //    .style("left", (d3.event.pageX) + 40 + "px")		
                //    .style("top", (d3.event.pageY) + "px");
                //})
                //.on("mouseout", function(d){  
                //    //d3.selectAll("rect").style("opacity", 1)
                //    slider.transition()		
                //    .duration(500)		
                //    .style("opacity", 0);
                //});
                

            svgBar.call(
                    d3.brushX()
                        .extent([
                            [0, 0],
                            [hmSize.w, hmSize.h]
                        ])
                        .on("start", console.log("start:", new Date()))
                        .on("end", console.log("end"))
                        .on("brush", brush)
                );
                //https://observablehq.com/@bumbeishvili/data-driven-range-sliders#barRangeSlider
                //https://observablehq.com/d/c55a5839a5bb7c73
                function brush(event, d) {
                    if (d3.event.sourceEvent.type === "brush") return;
                    console.log('brushed x:',xb.invert(d3.event.selection[0]), "  y:",xb.invert(d3.event.selection[1]))

                    d3.select(".selection")	
                        .style("opacity", 0.8)
                        .style("fill", "#69b3a2")
                }

            // ------------------------------
            // X-Y-Z SCALES
            var x = d3.scaleTime()
                .range([0, hmSize.w])
                .domain([minRisk,maxRisk])
                //.padding(0.01);
            var y = d3.scaleBand()
                .range([hmSize.h, 0])
                .domain(equipos)
                .padding(0.01);
            var z = d3.scaleLinear()
                .range(["white", "#69b3a2"])
                .domain([0,1])

            // ------------------------------
            // ADDING THE GENERAR SVG
            var svg = d3.select("#generalviz")
                .append("svg")
                .attr("width", hmSize.w + hmMargin.left + hmMargin.right)
                .attr("height", hmSize.h + hmMargin.top + hmMargin.bottom)
                .append("g")
                .attr("transform","translate(" + hmMargin.left + "," + hmMargin.top + ")");

            // ------------------------------
            // X/Y AXES
            svg.append("g")
                .attr("transform", "translate(0," + hmSize.h + ")")
                .call(d3.axisBottom(x))
                //.selectAll("text")
                //.style("text-anchor", "end")
                //.attr("dx", "-.8em")
                //.attr("dy", ".15em")
                //.attr("transform", "rotate(-45)")
            svg.append("g")
                .call(d3.axisLeft(y))
            
            // ------------------------------
            // RECTs (X,Y,Z) 
            svg.selectAll()
                .data(data_risk)
                .enter()
                .append("rect")
                .attr("x", function(d) { return x(d.fecha); })
                .attr("y", function(d) { return y(d.id_equipo); })
                .attr("width", hmSize.w/52 )
                .attr("height", y.bandwidth() )
                .style("fill", function(d) { return z(d.risk)})
                .on("mouseover", function(d){
                    //d3.selectAll("rect").style("opacity", .6)
                    d3.select(this)
                    //  .style("opacity", 1);   
                    div.transition()		
                        .duration(200)		
                        .style("opacity", 0.9);		
                    div.html("Risk: " + d.risk)	
                        .style("left", (d3.event.pageX) + 40 + "px")		
                        .style("top", (d3.event.pageY) + "px");
                })
                .on("mouseout", function(d){  
                    //d3.selectAll("rect").style("opacity", 1)
                    div.transition()		
                    .duration(500)		
                    .style("opacity", 0);
                })
        });
});