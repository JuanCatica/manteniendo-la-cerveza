dataTime = null;
dataCost = null;
data_risk = null;
timeS = null;

$(document).ready(function(){   
    var w = document.getElementById('sliderTimeFilter').clientWidth;
    timeS = new TimeSlider("#sliderTimeFilter", w, 150, {top:25,right:10,bottom:50,left:10});
    heatMap = new HeatMap("#heatmap", w, 350, {top:25,right:10,bottom:50,left:50});
    
    d3.queue()
        .defer(d3.json, "dbprocessed/times.json")
        .defer(d3.json, "dbprocessed/costs.json")
        .defer(d3.json, "dbprocessed/risks_test.json")
        .await(function(error, data_time, data_cost, data_risk) {
            if (error) throw error;
            dataTime = data_time;
            dataCost = data_cost;
            data_risk = data_risk;

            /** PROCESAMIENTO DE DATOS */
            /** TIME&COST DATA */
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

            /* RISK DATA */
            data_risk.forEach(function(d) { d.fecha = tParser(d.fecha);});
            data_risk = data_risk.filter(function(d) {return d.fecha.getYear() == 118;});
            data_risk.sort(function(a,b){return new Date(b.fecha) - new Date(a.fecha);});
            var maxRisk = data_risk[data_risk.length - 1].fecha
            var minRisk = data_risk[0].fecha

            /** VISUALIZACION */
            timeS.setData(dataTime, dataCost, minTime, maxTime);
            timeS.draw();

            heatMap.setDataFull(data_risk);
            heatMap.setData(data_risk, minRisk, maxRisk);
            heatMap.draw();
        });

    document.addEventListener("sliderEvent",function(e) {
        //console.log(e.detail)
        //console.log(heatMap.dataFull)
        data_filtrada = heatMap.dataFull.filter(function(d) {return d.fecha.getTime() >= e.detail.startDate.getTime() && d.fecha.getTime() <= e.detail.endDate.getTime();});
        //console.log("=======================");
        //console.log(data_filtrada);
        //console.log(e.detail.startDate);
        //console.log(e.detail.endDate);
        //console.log(e.detail);
        heatMap.setData(data_filtrada, e.detail.startDate, e.detail.endDate);
        heatMap.update();
        //radar
        dibujarRadar(e.detail.startDate, e.detail.endDate);
    },false);
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