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
    }

    filter(minTime, maxTime, variable, groupby){
        

        this.maxTime = maxTime;
        this.minTime = minTime;

        this.variable = variable;
        this.maxVariable = d3.max(this.data_filtered, d => d[this.variable]);
        this.minVariable = d3.min(this.data_filtered, d => d[this.variable]);

        this.groupby = groupby;


        this.data_filtered = this.data.filter(function(d) {return d.fecha.getTime() >= minTime && d.fecha.getTime() <= maxTime;});
        dataCostTimeSlider = d3.nest()
            .key(function(d) { return d[this.groupby];})
            .rollup(function(d) {
                return {
                    costo : d3.sum(d, (g) => g["trabajo_real"]),
                    fecha : d3.sum(d, (g) => g["costo_total"]),
                }})
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

        var data_meses = [{'fecha': 1,
        'min': 0.0,
        'sum': 370293911262.84937,
        'mean': 67473380.33215185,
        'median': 4000000.0,
        'max': 8217760877.35,
        'q1': 1100000.0,
        'q2': 4000000.0,
        'q3': 10397097.344999999,
        'mes': 'enero'},
       {'mes_n': 2,
        'min': 0.0,
        'sum': 519852160667.25964,
        'mean': 69806923.68299444,
        'median': 4000000.0,
        'max': 10350132618.0,
        'q1': 1100000.0,
        'q2': 4000000.0,
        'q3': 8999048.52,
        'mes': 'febrero'},
       {'mes_n': 3,
        'min': 0.0,
        'sum': 506998969166.22784,
        'mean': 62965594.77971036,
        'median': 4463675.965,
        'max': 6557096212.0,
        'q1': 2014861.5,
        'q2': 4463675.965,
        'q3': 9398550.399999999,
        'mes': 'marzo'},
       {'mes_n': 4,
        'min': 0.0,
        'sum': 601786511174.3894,
        'mean': 86787786.43991771,
        'median': 4762309.5,
        'max': 26500000000.0,
        'q1': 2496017.0,
        'q2': 4762309.5,
        'q3': 9658561.75,
        'mes': 'abril'},
       {'mes_n': 5,
        'min': 0.0,
        'sum': 428127850227.10956,
        'mean': 58535391.06195099,
        'median': 4501450.5,
        'max': 9518981759.44,
        'q1': 2258100.75,
        'q2': 4501450.5,
        'q3': 8335757.0,
        'mes': 'mayo'},
       {'mes_n': 6,
        'min': 0.0,
        'sum': 362422499352.5202,
        'mean': 47369298.04633645,
        'median': 4448840.0,
        'max': 7240726849.56,
        'q1': 2633409.0,
        'q2': 4448840.0,
        'q3': 8000000.0,
        'mes': 'junio'},
       {'mes_n': 7,
        'min': 0.0,
        'sum': 593575062146.0496,
        'mean': 71913625.16913612,
        'median': 4500000.0,
        'max': 18939933132.0,
        'q1': 2701241.0,
        'q2': 4500000.0,
        'q3': 8485502.25,
        'mes': 'julio'},
       {'mes_n': 8,
        'min': 0.0,
        'sum': 568681406002.6497,
        'mean': 66598126.94725959,
        'median': 4884276.71,
        'max': 20678799383.0,
        'q1': 2701241.0,
        'q2': 4884276.71,
        'q3': 8897679.0,
        'mes': 'agosto'}]



        
        //var div = d3.select(".tooltip-hm")
        var series = d3.map(this.data_filtered, function(d){return d.planta;}).keys();

        //var x = d3.scaleTime()
        //    .range([0, this.width])
        //    .domain([this.minTime,this.maxTime])
        //var y = d3.scaleLinear()
        //    .domain([this.minVariable, this.maxVariable])
        //    .range([this.h, 0]);
        //const line = d3.line()
        //    //.defined(d => !isNaN(d))
        //    .x(d=> x(d.fecha))
        //    .y(d=> y(d.costo_total));
//
//
        var x = d3.scaleBand()
            .domain(["enero","febrero","marzo","abril","mayo","junio","julio","agosto"])
            .range([0, this.width])
            .paddingInner(1)
            .paddingOuter(0.2);
          
        const y = d3.scaleLinear()
            .domain([d3.min(data_meses, d => d.sum)/1000000, d3.max(data_meses, d => d.sum)/1000000])
            .range([this.h, 0]); 
        
        const line = d3.line()
            .x( d=> x(d.mes))
            .y( d=> y(d.sum/1000000));
            
        this.gYAxis.call(d3.axisLeft(y));
        this.gXAxis.call(d3.axisBottom(x));

        //const path = this.svgLC.append("g")
        ////.attr("fill", "none")
        ////.attr("stroke", "steelblue")
        ////.attr("stroke-width", 1.5)
        ////.attr("stroke-linejoin", "round")
        ////.attr("stroke-linecap", "round")
        //.selectAll("path")
        //.data(this.data_filtered)
        //.append("path")
        ////.join("path")
        //    //.style("mix-blend-mode", "multiply")
        //    .attr("d", d => line(d.costo_total));
        //console.log(this.data[0], line(this.data[0]))

        this.svgLC.append("path")
            .style("stroke", "salmon")
            .style("fill", "none")
            .attr("d", line(data_meses));
    }
}