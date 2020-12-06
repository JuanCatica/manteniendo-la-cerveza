dataCostTime = null;
dataCost = null;
dataRisk = null;
datosRadar = null;

timeSlider = null;
timeChartCostos = null;
timeChartTiempos = null;
heatMap = null;
tParser = d3.timeParse("%Y-%m-%d");

$(document).ready(function(){   
    var w = document.getElementById('sliderTimeFilter').clientWidth;
    timeSlider = new TimeSlider("#sliderTimeFilter", w, 150, {top:25,right:10,bottom:50,left:10});
    timeChartCostos = new TimeChart("#timeChartCostos",w, 300, {top:25,right:10,bottom:50,left:100})
    timeChartTiempos = new TimeChart("#timeChartTiempos",w, 300, {top:25,right:10,bottom:50,left:100})
    heatMap = new HeatMap("#heatmap", w, 350, {top:25,right:10,bottom:50,left:50});
    
    d3.queue()
        .defer(d3.csv, "dbprocessed/ct-general.csv")
        .defer(d3.csv, "dbprocessed/random_risk_test.csv") //_test
        .defer(d3.csv, "radar/data/datos_radar.csv")
        .await(function(error, data_cost_time, data_risk, datos_radar) {
            if (error) throw error;
            dataCostTime = data_cost_time;
            dataCostTime.forEach(function(d) { 
                d.fecha = tParser(d.fecha);
                d.costo_total = parseFloat(d.costo_total)
                d.trabajo_real = parseFloat(d.trabajo_real)
            });
            
            dataRisk = data_risk;
            datosRadar = datos_radar;

            /** PROCESAMIENTO DE DATOS */
            /** SLIDER : TIME-&-COST */

            dataCostTimeSlider = d3.nest()
                .key(function(d) { return d.fecha;})
                .rollup(function(d) {
                    return {
                        up : d3.sum(d, (g) => g["trabajo_real"]),
                        down : d3.sum(d, (g) => g["costo_total"]),
                    }})
                .entries(dataCostTime);
                
            dataCostTimeSlider = dataCostTimeSlider.map(function(d) {
                var date0 = new Date(d.key);
                var date1 = new Date(date0);
                date1.setDate(date1.getDate() + 7);
                return {
                    date0 : date0,
                    date1 : date1,   
                    up : d.value.up,
                    down : d.value.down,
                }
            });
            
            timeSlider.setData(dataCostTimeSlider);
            timeChartCostos.setData(dataCostTime, "costo_total", "fecha", "tipo_aviso");
            timeChartTiempos.setData(dataCostTime, "trabajo_real", "fecha", "tipo_aviso");
            //timeChartCostos.filter( "costo_total", "planta")
            
            /** LINE/BAR_CHART : TIME-&-COST */

            /* RISK DATA */
            dataRisk.forEach(function(d) { d.fecha = tParser(d.fecha);});
            dataRisk = dataRisk.filter(function(d) {return d.fecha.getYear() == 118;});
            dataRisk.sort(function(a,b){return new Date(b.fecha) - new Date(a.fecha);});
            var maxRisk = dataRisk[dataRisk.length - 1].fecha
            var minRisk = dataRisk[0].fecha

            /** VISUALIZACION */
             // revisar la entrada de estos tiempos, incorporar como filtros 
            timeSlider.draw();            
            timeChartCostos.draw();
            timeChartTiempos.draw();
            //heatMap.setDataFull(dataRisk);
            //heatMap.setData(dataRisk);
            //heatMap.draw();
        });

    document.addEventListener("sliderEvent",function(e) {
        /** LINECHART */

        /** HEATMAP */
        //heatMap.filter(e.detail.startDate, e.detail.endDate);
        //heatMap.update();

        timeChartCostos.filter(e.detail.startDate, e.detail.endDate);
        timeChartTiempos.filter(e.detail.startDate, e.detail.endDate);

        timeChartCostos.update();
        timeChartTiempos.update();
        /** RADAR */
        //dibujarRadar(e.detail.startDate, e.detail.endDate, datosRadar);
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
    timeSlider.setData(dataTime, dataCost, minTime, maxTime);
    timeSlider.update();
}