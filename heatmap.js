class HeatMap {

    constructor(DOMElement, width, height, margins) {
        this.DOMElement = DOMElement;
        this.upperData = null;
        this.lowerData = null;
        this.width = width;
        this.height = height;
        this.margins = margins;
    }

    setData(upperData, lowerData, minTime, maxTime){
        this.upperData = upperData;
        this.lowerData = lowerData;
        this.maxTime = maxTime;
        this.minTime = minTime;
    }

    draw(){
        this.w = this.width - (this.margins.left + this.margins.right);
        this.h = this.height - (this.margins.top + this.margins.bottom);
        this.svgBar = d3.select(this.DOMElement)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .append("g")
            .attr("transform","translate(" + this.margins.left + "," + this.margins.top + ")")
        this.gAxix = this.svgBar.append("g")
            .attr("transform", "translate(0," + this.h + ")");
        this.update();
    }

    update(){   


        const tParser = d3.timeParse("%Y-%m-%d %H:%M:%S");
        data_risk.forEach(function(d) { d.fecha = tParser(d.fecha);});
        data_risk = data_risk.filter(function(d) {return d.fecha.getYear() == 117;});
        data_risk.sort(function(a,b){return new Date(b.fecha) - new Date(a.fecha);});
        var maxRisk = data_risk[data_risk.length - 1].fecha
        var minRisk = data_risk[0].fecha
        //data_risk.forEach(function(d) { d.fecha = d.fecha.toISOString().slice(0,10)});
        var equipos = d3.map(data_risk, function(d){return d.id_equipo;}).keys();


        var x = d3.scaleTime()
            .range([0, hmSize.w])
            .domain([this.minTime,this.maxTime])
            .padding(0.01);
        var y = d3.scaleBand()
            .range([this.h, 0])
            .domain(equipos)
            .padding(0.01);
        var z = d3.scaleLinear()
            .range(["white", "#69b3a2"])
            .domain([0,1])

        svg.append("g")
            .attr("transform", "translate(0," + hmSize.h + ")")
            .call(d3.axisBottom(x))

        var xb = d3.scaleTime()
            .range([0, this.w])
            .domain([this.minTime,this.maxTime]);
        var yu = d3.scaleLinear()
            .range([this.h/2, 0])
            .domain([d3.min(this.upperData, d => d.value), d3.max(this.upperData, d => d.value)]);
        var yl = d3.scaleLinear()
            .range([this.h/2, 0])
            .domain([d3.min(this.lowerData, d => d.value), d3.max(this.lowerData, d => d.value)]);
        this.gAxix.call(d3.axisTop(xb));
        
        var upDateLowBar = this.svgBar.selectAll(".upper-rect")
            .data(this.lowerData)
        upDateLowBar.enter()
            .append("rect")
            .attr("class","upper-rect")
            .merge(upDateLowBar)
            .attr("x", (d) => xb(d.key))
            .attr("y", (d) => this.h/2 - yl(d.value))
            .attr("width", this.w/(this.lowerData.length ))
            .attr("height",(d) => yl(d.value))
            .style("opacity", 0.8)
            .style("fill", "#69b3a2")
            .exit().remove();
    }
}