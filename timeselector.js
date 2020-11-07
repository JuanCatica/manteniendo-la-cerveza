class TimeSelector {
    //https://observablehq.com/@bumbeishvili/data-driven-range-sliders#barRangeSlider
    //https://observablehq.com/d/c55a5839a5bb7c73
    constructor(DOMElement, width, height, margins) {
        this.DOMElement = DOMElement;
        this.width = width;
        this.height = height;
        this.margins = margins;
    }

    draw(data_time, data_cost) {
        let w = this.width - (this.margins.left + this.margins.right)
        let h = this.height - (this.margins.top + this.margins.bottom)
        let tParser = d3.timeParse("%Y-%m-%d %H:%M:%S");
        
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
            .range([0, w])
            .domain([min,max]);
        var yt = d3.scaleLinear()
            .range([h/2, 0])
            .domain([d3.min(data_time, d => d.value), d3.max(data_time, d => d.value)]);
        var yc = d3.scaleLinear()
            .range([h/2, 0])
            .domain([d3.min(data_cost, d => d.value), d3.max(data_cost, d => d.value)]);  
            
        var svgBar = d3.select(this.DOMElement)
            .append("svg")
            .attr("width", this.width) //+ this.margins.left + this.margins.right
            .attr("height", this.height) //+ this.margins.top + this.margins.bottom
            .append("g")
            .attr("transform","translate(" + this.margins.left + "," + this.margins.top + ")")
            .attr("class", "brush")
        svgBar.append("g")
            .attr("transform", "translate(0," + h + ")")
            .call(d3.axisBottom(xb))
        svgBar.selectAll()
            .data(data_time)
            .enter()
            .append("rect")
            .attr("x", function(d) {return xb(d.key); })
            .attr("y", h/2)
            .attr("width", w/(data_time.length ))
            .attr("height", function(d) { return yt(d.value); } )
            .style("opacity", 0.8)
            .style("fill", "salmon");
        svgBar.selectAll()
            .data(data_cost)
            .enter()
            .append("rect")
            .attr("x", function(d) { return xb(d.key); })
            .attr("y", function(d) { return h/2 - yc(d.value); })
            .attr("width", w/(data_cost.length ))
            .attr("height", function(d) { return yc(d.value); })
            .style("opacity", 0.8)
            .style("fill", "#69b3a2");   
        svgBar.call(
            d3.brushX()
                .extent([[0, 0], [w, h]])
                .on("start", console.log("start:", new Date()))
                .on("end", console.log("end"))
                .on("brush", brush)
            );

        function brush(event, d) {
            if (d3.event.sourceEvent.type === "brush") return;
            console.log('brushed x:',xb.invert(d3.event.selection[0]), "  y:",xb.invert(d3.event.selection[1]))
            d3.select(".selection")	
                .style("opacity", 0.8)
                .style("fill", "#69b3a2")
        }
    }
}