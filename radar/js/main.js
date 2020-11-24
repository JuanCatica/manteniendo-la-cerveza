/* Radar chart design created by Nadieh Bremer - VisualCinnamon.com */
var tmpFechaInicial="";
var tmpFechaFinal="";
function dibujarRadar(fechaInicial, fechaFinal) {
    if (fechaInicial == tmpFechaFinal || fechaFinal == tmpFechaFinal) {
        return false;
    } else {
        console.log("Llamado a funcion dibujarRadar!");
        tmpFechaFinal = fechaFinal;
        tmpFechaInicial = fechaInicial;
    }
    console.log("Llamado a funcion dibujarRadar");
    var vTipoEquipo = document.getElementById("tipo_equipo").value;
    //console.log("Rangos de fecha recibidos:", fechaInicial.getTime(), fechaFinal)

    var margin = { top: 100, right: 100, bottom: 100, left: 100 },
        width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
        height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);

    d3.csv('radar/data/datos_radar.csv', function (data) {
        //////////////////////////////////////////////////////////////
        ////////////////////////// Data //////////////////////////////
        //////////////////////////////////////////////////////////////
        var datosHoras = [];
        var datosCostos = [];
        let tParser = d3.timeParse("%Y-%m-%d");

        datosFiltrados = data.filter(function (d) { return d.tipo_equipo == vTipoEquipo && tParser(d.mes).getTime() >= fechaInicial.getTime() && tParser(d.mes).getTime() <= fechaFinal.getTime() })

        //Agrupamos por mes
        var propiedadMes = d3.nest()
            .key(function (d) { return d.mes; })
            .entries(datosFiltrados);

        propiedadMes.forEach(function (d) { d.key = tParser(d.key); });

        //Agrupamos por tipo de aviso
        var horas_X_TipoAviso = d3.nest()
            .key(function (d) { return d.tipo_aviso; })
            .rollup(function (d) { return d3.mean(d, function (g) { return g["prom_trabajo_real"]; }); })
            .entries(datosFiltrados);

        var costos_X_TipoAviso = d3.nest()
            .key(function (d) { return d.tipo_aviso; })
            .rollup(function (d) { return d3.mean(d, function (g) { return g["costo_total"]; }); })
            .entries(datosFiltrados);

        //Construir datos de cada radar
        var arreglo = [];
        horas_X_TipoAviso.forEach(function (d) {
            row = {};
            row.area = d.key + "(h)";
            row.value = +d.value || 0;
            arreglo.push(row);
        });
        datosHoras.push(arreglo);

        var arreglo = [];
        costos_X_TipoAviso.forEach(function (d) {
            row = {};
            row.area = d.key + "($)";
            row.value = +d.value || 0;
            arreglo.push(row);
        });
        datosCostos.push(arreglo);

        //console.log(datosHoras);
        //console.log(datosCostos);

        ////////////////////////////////////////////////////////////// 
        //////////////////// Draw the Chart ////////////////////////// 
        ////////////////////////////////////////////////////////////// 
        //var color = d3.scale.ordinal()
        //    .range(["#EDC951", "#CC333F", "#00A0B0"]);
        var colorHoras = d3.scaleOrdinal().range(["#EDC951", "#CC333F", "#00A0B0"]);
        var colorCostos = d3.scaleOrdinal().range(["#EDC951", "#CC333F", "#00A0B0"]);
        var radarChartOptionsHoras = {
            w: 200,
            h: 200,
            maxValue: 100,
            levels: 5,
            color: colorHoras
        }

        var radarChartOptionsCostos = {
            w: 200,
            h: 200,
            maxValue: 100000000,
            levels: 10
        }

        RadarChart.draw("#radarChartHoras", datosHoras,radarChartOptionsHoras);
        RadarChart.draw("#radarChartCosto", datosCostos,radarChartOptionsCostos);
    });
};