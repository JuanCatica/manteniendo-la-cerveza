class LineChart{

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

    setData(data){
        this.data = data;
        this.data.forEach(element => {element.costo_total = parseFloat(element.costo_total)});
        this.maxTime = d3.max(this.data, d => d.fecha);
        this.minTime = d3.min(this.data, d => d.fecha);
    }

    filter(minTime, maxTime,variable, groupby){//minTime, maxTime, 
        this.maxTime = maxTime
        this.minTime = minTime
        this.variable = variable;
        this.groupby = groupby;

        this.data_filtered = this.data.filter(function(d) {
            return d.fecha.getTime() >= minTime && d.fecha.getTime() <= maxTime;
        });
   
        this.maxVariable = d3.max(this.data_filtered, d => d[this.variable]);
        this.minVariable = d3.min(this.data_filtered, d => d[this.variable]);

        this.data_filtered = d3.nest()
            .key(function(d) { return d.planta;})
            .rollup(function(d) {
                var datos = d.map(function(g) { return {costo:g.costo_total,fecha:g.fecha}})
                datos.sort(function(a,b){return new Date(b.fecha) - new Date(a.fecha);});
                return datos;
            })
            .entries(this.data_filtered);
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
        //var series = d3.map(this.data_filtered, function(d){return d.planta;}).keys();
        console.log(this.minTime,this.maxTime)

        var x = d3.scaleTime()
            .range([0, this.width])
            .domain([this.minTime,this.maxTime])
        var y = d3.scaleLinear()
            .domain([this.minVariable, this.maxVariable])
            .range([this.h, 0]);
        const line = d3.line()
            .x(function(d) { return x(d.fecha) })
            .y(function(d) { return y(d.costo) }) 
        this.gYAxis.call(d3.axisLeft(y));
        this.gXAxis.call(d3.axisBottom(x));

        var updateCell = this.svgLC.selectAll(".ect")
            .data(this.data_filtered)
        updateCell.exit()
            .remove();
        updateCell.enter()
            .append("path")
            .style("stroke", "salmon")
            .style("fill", "none")
            .attr("class","ect")
            .merge(updateCell)
            .attr("d", d => line(d.value))
    }
}