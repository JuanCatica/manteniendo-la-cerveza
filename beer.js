dataTime = null;
dataCost = null;
dataRisk = null;
datosRadar = null;
timeS = null;
heatMap = null;

$(document).ready(function(){   
    var w = document.getElementById('sliderTimeFilter').clientWidth;
    timeS = new TimeSlider("#sliderTimeFilter", w, 150, {top:25,right:10,bottom:50,left:10});
    heatMap = new HeatMap("#heatmap", w, 350, {top:25,right:10,bottom:50,left:50});
    
    d3.queue()
        .defer(d3.json, "dbprocessed/times.json")
        .defer(d3.json, "dbprocessed/costs.json")
        .defer(d3.json, "dbprocessed/risks_test.json") //_test
        .defer(d3.csv, "radar/data/datos_radar.csv")
        .await(function(error, data_time, data_cost, data_risk, datos_radar) {
            if (error) throw error;
            dataTime = data_time;
            dataCost = data_cost;
            dataRisk = data_risk;
            datosRadar = datos_radar;

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
            dataRisk.forEach(function(d) { d.fecha = tParser(d.fecha);});
            dataRisk = dataRisk.filter(function(d) {return d.fecha.getYear() == 118;});
            dataRisk.sort(function(a,b){return new Date(b.fecha) - new Date(a.fecha);});
            var maxRisk = dataRisk[dataRisk.length - 1].fecha
            var minRisk = dataRisk[0].fecha

            /** VISUALIZACION */
            timeS.setData(dataTime, dataCost, minTime, maxTime); // revisar la entrada de estos tiempos, incorporar como filtros 
            timeS.draw();

            //heatMap.setDataFull(dataRisk);
            heatMap.setData(dataRisk);
            heatMap.draw();
        });

    document.addEventListener("sliderEvent",function(e) {
        /** LINECHART */


        /** HEATMAP */
        heatMap.filter(e.detail.startDate, e.detail.endDate);
        heatMap.update();

        /** RADAR */
        dibujarRadar(e.detail.startDate, e.detail.endDate, datosRadar);
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