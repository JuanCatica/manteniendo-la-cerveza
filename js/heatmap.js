class HeatMap{

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
    
    setDataFull(data){
        this.dataFull = data;
    }

    setData(data, minTime, maxTime){
        this.data = data;
        this.maxTime = maxTime;
        this.minTime = minTime;
    }

    draw(){
        this.w = this.width - (this.margins.left + this.margins.right);
        this.h = this.height - (this.margins.top + this.margins.bottom);
        this.svgHM = d3.select(this.DOMElement)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .append("g")
            .attr("transform","translate(" + this.margins.left + "," + this.margins.top + ")")
        this.gYAxis = this.svgHM.append("g")
        this.gXAxis = this.svgHM.append("g")
            .attr("transform", "translate(0," + this.h + ")");
        this.update();
    }

    update(){
        var div = d3.select(".tooltip-hm")
        var equipos = d3.map(this.data, function(d){return d.id_equipo;}).keys();

        var x = d3.scaleTime()
            .range([0, this.width])
            .domain([this.minTime,this.maxTime])
        var y = d3.scaleBand()
            .range([this.h, 0])
            .domain(equipos)
            .padding(0.01);
        var z = d3.scaleLinear()
            .range(["green", "red"])
            .domain([0,1])
        this.gYAxis.call(d3.axisLeft(y));
        this.gXAxis.call(d3.axisBottom(x));

        var updateCell = this.svgHM.selectAll(".risk-rect")
            .data(this.data)
        updateCell.exit()
            .remove();
        updateCell.enter()
            .append("rect")
            .attr("class","risk-rect")
            .merge(updateCell)
            .attr("x", (d) => x(d.fecha))
            .attr("y", (d) => y(d.id_equipo))
            .attr("width", this.w/(this.data.length/16 ))
            .attr("height", y.bandwidth() )
            .style("fill", (d) => z(d.risk))
            .style("opacity", 0.8)   
            .on("mouseover", function(d){
                d3.selectAll("rect.risk-rect").style("opacity", .9)
                d3.select(this)
                  .style("opacity", 1);   
                div.transition()		
                    .duration(200)		
                    .style("opacity", 0.9);		
                div.html("Risk: " + d.risk)	
                    .style("left", (d3.event.pageX) + 40 + "px")		
                    .style("top", (d3.event.pageY) + "px");
            })
            .on("mouseout", function(d){  
                d3.selectAll("rect.risk-rect").style("opacity", 1)
                div.transition()		
                .duration(500)		
                .style("opacity", 0);
            })
    }
}