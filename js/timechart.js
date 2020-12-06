class TimeChart{
    //https://bl.ocks.org/LemoNode/a9dc1a454fdc80ff2a738a9990935e9d
    //https://observablehq.com/@d3/multi-line-chart

    constructor(DOMElement, width, height, margins) {
        this.DOMElement = DOMElement;
        this.data = null;
        this.width = width;
        this.height = height;
        this.margins = margins;

        d3.select("body").append("div")	
            .attr("class", "tooltip-hm")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("text-align", "center")
            .style("background", "lightsteelblue")
            .style("border-radius", "3px");
    }

    setData(data, field, time, serie){
        this.data = data.map((d) => ({field: d[field], time: d[time], serie: d[serie]}));
        this.maxTime = d3.max(this.data, d => d.time);
        this.minTime = d3.min(this.data, d => d.time);
        
        this.dviz = d3.nest()
            .key((d) => d.serie)
            .key((d) => d.time)
            .rollup((d) => d3.sum(d, (d) => d.field))
            .entries(this.data);
              
        this.dviz.forEach((d) => d.values.forEach(function(g) { g.key = new Date(g.key);}))
        this.dviz.forEach((d) => d.values.sort(function(a,b){return b.key - a.key}))
        this.filter(this.minTime, this.maxTime)
    }

    filter(minTime, maxTime){ 
        this.maxTime = maxTime
        this.minTime = minTime

        this.dvizFiltered = this.dviz.map(function(dSeries) { 
            let filteredSerie = dSeries.values.filter(d => d.key.getTime() >= minTime && d.key.getTime() <= maxTime)
            return {
                key : dSeries.key,
                value : filteredSerie,
                max : d3.max(filteredSerie, d => d.value),
                min : d3.min(filteredSerie, d => d.value)
            }
        });
        
        this.maxVariable = d3.max(this.dvizFiltered, d => d.max);
        this.minVariable = d3.min(this.dvizFiltered, d => d.min);
    }

    draw(){
        this.w = this.width - (this.margins.left + this.margins.right);
        this.h = this.height - (this.margins.top + this.margins.bottom);
        this.svgLC = d3.select(this.DOMElement)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .append("g")
            .attr("transform","translate(" + this.margins.left + "," + this.margins.top + ")");
        this.gYAxis = this.svgLC.append("g")
        this.gXAxis = this.svgLC.append("g")
            .attr("transform", "translate(0," + this.h + ")");
        this.update();
    }

    update(){
        //var div = d3.select(".tooltip-hm")
        var div = d3.select(".tooltip-lc")

        var x = d3.scaleTime()
            .range([0, this.width])
            .domain([this.minTime,this.maxTime])
        var y = d3.scaleLinear()
            .domain([this.minVariable, this.maxVariable])
            .range([this.h, 0]);

        var s = d3.scaleOrdinal()
            .domain(d3.map(this.dvizFiltered, function(d){return d.key;}).keys())
            .range(d3.schemeCategory10)

        const line = d3.line()
            .x(function(d) { return x(d.key) })
            .y(function(d) { return y(d.value) }) 
        this.gYAxis.call(d3.axisLeft(y));
        this.gXAxis.call(d3.axisBottom(x));

        var updateCell = this.svgLC.selectAll(".line")
            .data(this.dvizFiltered)
        updateCell.exit()
            .remove();
        updateCell.enter()
            .append("path")
            .style("stroke", d => s(d.key))
            .style("fill", "none")
            .attr("class","line")
            .merge(updateCell)
            .attr("d", d => line(d.value))
    }
}