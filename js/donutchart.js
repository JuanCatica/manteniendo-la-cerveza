class DonutChart{
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

        this.radius = Math.min(width, height) / 2 - 10;
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
              
        this.dviz.forEach((d) => d.values.forEach(function(g) { g.key = new Date(g.key);}));
        this.dviz.forEach((d) => d.values.sort(function(a,b){return b.key - a.key}));
        this.filter(this.minTime, this.maxTime);
    }

    filter(minTime, maxTime){ 
        this.maxTime = maxTime
        this.minTime = minTime
        this.dvizFiltered = {}
        
        let dataDics = this.dviz.map(function(dSeries) { 
            let filteredSerie = dSeries.values.filter(d => d.key.getTime() >= minTime && d.key.getTime() <= maxTime)
            return {
                key : dSeries.key,
                value : d3.sum(filteredSerie, (d) => d.value)
            }
        });
        dataDics.forEach((d) => this.dvizFiltered[d.key]=d.value)
    }

    draw(){
        this.w = this.width - (this.margins.left + this.margins.right);
        this.h = this.height - (this.margins.top + this.margins.bottom);
        this.svgDC = d3.select(this.DOMElement)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .append("g")
            .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");
        
        this.update();
    }

    update(){
        //var div = d3.select(".tooltip-hm")
        var div = d3.select(".tooltip-lc")

        var s = d3.scaleOrdinal()
            .domain(d3.map(this.dvizFiltered, function(d){return d.key;}).keys())
            .range(d3.schemeCategory10);
        var pie = d3.pie()
            .value(function(d) {return d.value;});

        var updateCell = this.svgDC.selectAll(".donut")
            .data(pie(d3.entries(this.dvizFiltered)))
        updateCell.exit()
            .remove();
        updateCell.enter()
            .append("path")
            .style("fill", d => s(d.data.key))
            .attr("class","donut")
            .merge(updateCell)
            .attr('d', d3.arc().innerRadius(70).outerRadius(this.radius));
    }
}