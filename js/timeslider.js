class TimeSlider {
    //http://square.github.io/crossfilter/
    //https://observablehq.com/@bumbeishvili/data-driven-range-sliders#barRangeSlider
    //https://observablehq.com/d/c55a5839a5bb7c73
    //https://stackoverflow.com/questions/9671995/javascript-custom-event-listener
    //https://www.d3-graph-gallery.com/graph/interactivity_brush.html

    constructor(DOMElement, width, height, margins) {
        this.DOMElement = DOMElement;
        this.width = width;
        this.height = height;
        this.margins = margins;
    }

    setData(data, date0=null, date1=null, up=null, down=null){
        date0 = date0!=null ? date0: "date0";
        date1 = date1!=null ? date1: "date1";
        up = up!=null ? up: "up";
        down = down!=null ? down: "down";

        this.data = data;
        this.data.sort(function(a,b){return new Date(a[date0]) - new Date(b[date0]);});
        this.minTime = data[0][date0]
        this.maxTime = data[data.length - 1][date1]
    }

    draw(){
        this.w = this.width - (this.margins.left + this.margins.right);
        this.h = this.height - (this.margins.top + this.margins.bottom);
        this.svgBar = d3.select(this.DOMElement)
            .append("svg")
            .attr("class", "svgbar")
            .attr("width", this.width)
            .attr("height", this.height)
            .append("g")
            .attr("transform","translate(" + this.margins.left + "," + this.margins.top + ")")
        this.gXAxis = this.svgBar.append("g");
            //.attr("transform", "translate(0," + this.h + ")");
        this.update();
    }

    update(){   
        let h = this.h;
        let w = this.w;
        let window = w/this.data.length;

        let startDate = null;
        let endDate = null;

        var xb = d3.scaleTime()
            .range([0, this.w])
            .domain([this.minTime,this.maxTime]);
        var yu = d3.scaleLinear()
            .range([this.h/2, 0])
            .domain([d3.min(this.data, d => d.up), d3.max(this.data, d => d.up)]);
        var yl = d3.scaleLinear()
            .range([this.h/2, 0])
            .domain([d3.min(this.data, d => d.down), d3.max(this.data, d => d.down)]);
        this.gXAxis.call(d3.axisTop(xb));
        
        var updateUpBar = this.svgBar.selectAll(".upper-rect")
            .data(this.data)
        updateUpBar.enter()
            .append("rect")
            .attr("class","upper-rect")
            .merge(updateUpBar)
            .attr("x", (d) => xb(d.date0))
            .attr("y", (d) => this.h/2 - yu(d.up))
            .attr("width", this.w/(this.data.length ))
            .attr("height", (d) => yu(d.up))
            .attr('stroke', 'white')
            .style("opacity", 0.8)
            .style("fill", "#74a0b9")//salmon #39789c
            .exit().remove();
        
        var updateDownBar = this.svgBar.selectAll(".lower-rect")
            .data(this.data)
        updateDownBar.enter()
            .append("rect")
            .attr("class","lower-rect")
            .merge(updateDownBar)
            .attr("x", (d) => xb(d.date0))
            .attr("y", this.h/2)
            .attr("width", this.w/(this.data.length ))
            .attr("height",(d) => yl(d.down))
            .attr('stroke', 'white') //#2378ae
            .style("opacity", 0.8)
            .style("fill", "#9ccdc1")//.style('stroke',"#9ccdc1") // #69b3a2
            .exit().remove();
        
        /* BRUSH ELEMENTS */
        this.svgBar.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 0)
            .attr("height", 0)
            .attr("class","left-curtain")
            .style("opacity", 0.2 )
            .style("fill", "black")
            .style("border", "black")
            .attr("border-radius", "5px");
        this.svgBar.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 0)
            .attr("height", 0)
            .attr("class","right-curtain")
            .style("opacity", 0.2 )
            .style("fill", "black")
            .style("border", "black")
            .attr("border-radius", "5px");
        
        this.svgBar.append("rect")
            .attr("class","left-label")
            .style("fill", "#39789c")
            .style("border", "black")
            .attr("border-radius", "5px")
            .style("opacity", 0.8 );
        this.svgBar.append("rect")
            .attr("class","right-label")
            .style("fill", "#39789c")
            .style("border", "black")
            .attr("border-radius", "5px")
            .style("opacity", 0.8 );
        
        this.svgBar.append("text")
            .attr('fill', 'white')
            .attr("font-family", "sans-serif")
            .attr("font-size", "16px")
            .attr("class","left-label-text");
        this.svgBar.append("text")
            .attr('fill', 'white')
            .attr("font-family", "sans-serif")
            .attr("font-size", "16px")
            .attr("class","right-label-text");

        this.svgBar.call(
            d3.brushX()
                .extent([[0, 0], [this.w, this.h]])
                //.on("start", console.log("start"))
                //.on("end", console.log("end"))
                .on("brush", brush)
        );
        
        function brush() {
            if (d3.event.sourceEvent.type === "brush") return;
            const lableH = 20;
            const labelW = 100;

            let bruchX1 = d3.event.selection[0];
            let bruchX2 = d3.event.selection[1];

            bruchX1 = Math.round(window*(Math.round(bruchX1/window)));
            bruchX2 = Math.round(window*(Math.round(bruchX2/window)));
            
            /* LABELS */
            let xl1 = bruchX1;
            let xl0 = xl1 - labelW;
            xl0 = (xl0 >= 0) ? xl0 : 0
            xl1 = xl0 + labelW;
            
            let xr0 = bruchX2;
            let xr1 = xr0 + labelW;
            xr0 = (xr1 <= w) ? xr0 : w-labelW;
            xr1 = xr1 + labelW;

            xl0 = (xr1 >= w && xl1 > xr0) ? w-2*labelW-1 : xl0
            xr0 = (xl0 <= 0 && xl1 > xr0) ? labelW+1 : xr0
            
            d3.select(".handle.handle--w")	
                .attr("x", bruchX1)
            d3.select(".handle.handle--e")	
                .attr("x", bruchX2)
            d3.select(".selection")
                .attr("x", bruchX1)
                .attr("width", bruchX2-bruchX1)
                .style("opacity", 0 );

            /* CURTAINS */
            d3.select(".left-curtain")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", bruchX1)
                .attr("height", h);
            d3.select(".right-curtain")
                .attr("x", bruchX2)
                .attr("y", 0)
                .attr("width",w - bruchX2)
                .attr("height", h);

            d3.select(".left-label")
                .attr("x", xl0)
                .attr("y", h)
                .attr("width", labelW)
                .attr("height", lableH);
            d3.select(".right-label")
                .attr("x", xr0)
                .attr("y", h)
                .attr("width", labelW)
                .attr("height", lableH);

            if(startDate && endDate){
                if (xb.invert(xl1).getTime() != startDate.getTime() || xb.invert(xr0).getTime() != endDate.getTime()){
                    var event = new CustomEvent("sliderEvent", {
                        detail: {
                            startDate: xb.invert(bruchX1),
                            endDate: xb.invert(bruchX2)
                        }
                    });
                    document.dispatchEvent(event);
                }
            } 

            startDate = xb.invert(bruchX1);
            endDate = xb.invert(bruchX2);

            d3.select(".left-label-text")
                .attr("x", xl0+ 8)
                .attr("y", h + lableH - 4)
                .text(startDate.toISOString().slice(0,10))
            d3.select(".right-label-text")
                .attr("x", xr0+ 8)
                .attr("y", h + lableH - 4)
                .text(endDate.toISOString().slice(0,10))

            /*
            d3.selectAll(".upper-rect")
                .style("fill", "#9ccdc1")
                .filter(d => {
                    let endDate = xb.invert(d3.event.selection[1])
                    endDate.setDate(endDate.getDate() - 7);
                    return d.key >= xb.invert(d3.event.selection[0]) && d.key <= endDate;
                })
                .style('fill', '#00D180');

            d3.selectAll(".lower-rect")
                .style("fill", "#74a0b9")
                .filter(d => {
                    let endDate = xb.invert(d3.event.selection[1])
                    endDate.setDate(endDate.getDate() - 7);
                    return d.key >= xb.invert(d3.event.selection[0]) && d.key <= endDate;
                })
                .style('fill', '#5c8094');
            */
        }
    }
}