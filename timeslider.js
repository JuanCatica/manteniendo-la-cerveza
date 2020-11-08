class TimeSlider {
    //https://observablehq.com/@bumbeishvili/data-driven-range-sliders#barRangeSlider
    //https://observablehq.com/d/c55a5839a5bb7c73
    
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
        var xb = d3.scaleTime()
            .range([0, this.w])
            .domain([this.minTime,this.maxTime]);
        var yu = d3.scaleLinear()
            .range([this.h/2, 0])
            .domain([d3.min(this.upperData, d => d.value), d3.max(this.upperData, d => d.value)]);
        var yl = d3.scaleLinear()
            .range([this.h/2, 0])
            .domain([d3.min(this.lowerData, d => d.value), d3.max(this.lowerData, d => d.value)]);
        this.gAxix.call(d3.axisBottom(xb));
        
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
        var upDateUpBar = this.svgBar.selectAll(".lower-rect")
            .data(this.upperData)
        upDateUpBar.enter()
            .append("rect")
            .attr("class","lower-rect")
            .merge(upDateUpBar)
            .attr("x", (d) => xb(d.key))
            .attr("y", this.h/2)
            .attr("width", this.w/(this.upperData.length ))
            .attr("height", (d) => yu(d.value))
            .style("opacity", 0.8)
            .style("fill", "salmon")
            .exit().remove();

        this.svgBar.call(
            d3.brushX()
                .extent([[0, 0], [this.w, this.h]])
                .on("start", console.log("start:", new Date()))
                .on("end", console.log("end"))
                .on("brush", brush)
        );
        function brush() {
            if (d3.event.sourceEvent.type === "brush") return;
            console.log('brushed x:',xb.invert(d3.event.selection[0]), "  y:",xb.invert(d3.event.selection[1]))
            d3.select(".selection")	
                .style("opacity", 0.5 )
                .style("fill", "black")
                .style("border", "black")
                .attr("border-radius", "5px");
        }
    }
}