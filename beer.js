dataTime = null;
dataCost = null;
timeS = null;

$(document).ready(function(){   
    var margins = {top:10,right:20,bottom:50,left:20}
    var w = document.getElementById('sliderTimeFilter').clientWidth;
    console.log(w)
    timeS = new TimeSlider("#sliderTimeFilter", w, 150, margins);
    
    d3.queue()
        .defer(d3.json, "dbprocessed/times.json")
        .defer(d3.json, "dbprocessed/costs.json")
        .await(function(error, data_time, data_cost) {
            if (error) throw error;
            dataTime = data_time;
            dataCost = data_cost;


            //let data_time = this.upperData;
            //let data_cost = this.lowerData
            let tParser = d3.timeParse("%Y-%m-%d %H:%M:%S");
            
            dataTime = d3.nest()
                .key(function(d) { return d.fecha;})
                .rollup(function(d) { return d3.sum(d, function(g) {return g["trabajo_real"]; }); })
                .entries(dataTime);
            dataTime.forEach(function(d) { d.key = tParser(d.key);});
            dataCost = d3.nest()
                .key(function(d) { return d.fecha;})
                .rollup(function(d) { return d3.sum(d, function(g) {return g.costo_total; }); })
                .entries(dataCost);
            dataCost.forEach(function(d) { d.key = tParser(d.key);});

            dataTime.sort(function(a,b){return new Date(b.fecha) - new Date(a.fecha);});
            dataCost.sort(function(a,b){return new Date(b.fecha) - new Date(a.fecha);});
            maxTime = Math.max(dataTime[dataTime.length - 1].key, dataCost[dataCost.length - 1].key);
            minTime = Math.min(dataTime[0].key, dataCost[0].key);

            timeS.setData(dataTime, dataCost, minTime, maxTime);
            timeS.draw();
        });


});

$(window).resize(function(){
    //timeS.reSize(window.innerWidth, null, null);
});

function doUpdateViz(){
    dataTime.forEach(function(d) { d.value = d.value*2*Math.random();});
    dataCost.forEach(function(d) { d.value = d.value*2*Math.random();});

    maxTime = Math.max(dataTime[dataTime.length - 1].key, dataCost[dataCost.length - 1].key);
    minTime = Math.min(dataTime[0].key, dataCost[0].key);
    timeS.setData(dataTime, dataCost, minTime, maxTime);
    timeS.update();
}