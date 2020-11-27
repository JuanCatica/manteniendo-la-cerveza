/* Radar chart design created by Nadieh Bremer - VisualCinnamon.com */
/* https://bl.ocks.org/alandunning/4c36eb1abdb248de34c64f5672afd857 */
var tmpFechaInicial = "";
var tmpFechaFinal = "";
function dibujarRadar(fechaInicial, fechaFinal) {
    if (fechaInicial == tmpFechaFinal || fechaFinal == tmpFechaFinal) {
        return false;
    } else {
        console.log("Llamado a funcion dibujarRadar!");
        tmpFechaFinal = fechaFinal;
        tmpFechaInicial = fechaInicial;
    }
    console.log("Llamado a funcion dibujarRadar");

    var margin = { top: 100, right: 100, bottom: 100, left: 100 },
        width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
        height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);

    var vHeight = 200;
    var vWidth = 200

    d3.csv('radar/data/datos_radar.csv', function (data) {
        //////////////////////////////////////////////////////////////
        ////////////////////////// Data //////////////////////////////
        //////////////////////////////////////////////////////////////
        var datosHoras = [];
        var datosCostos = [];
        let tParser = d3.timeParse("%Y-%m-%d");
        //equipos con valores de costo y horas ok
        //EQ10603
        //Equipos con valores por encima del promedio
        //EQ10012
        var vIdEquipo = document.getElementById("sel_id_equipo").value;
        console.log(vIdEquipo);
        datosFiltradosEq = data.filter(function (d) { return d.id_equipo == vIdEquipo && tParser(d.mes).getTime() >= fechaInicial.getTime() && tParser(d.mes).getTime() <= fechaFinal.getTime() })
        var vTipoEquipo = datosFiltradosEq[0].tipo_equipo;
        console.log(vTipoEquipo);
        datosFiltrados = data.filter(function (d) { return d.tipo_equipo == vTipoEquipo && tParser(d.mes).getTime() >= fechaInicial.getTime() && tParser(d.mes).getTime() <= fechaFinal.getTime() })

        //Agrupamos por mes
        var propiedadMes = d3.nest()
            .key(function (d) { return d.mes; })
            .entries(datosFiltrados);

        propiedadMes.forEach(function (d) { d.key = tParser(d.key); });

        //Agrupamos por tipo de aviso

        var horas_X_TipoAvisoEq = d3.nest()
            .key(function (d) { return d.tipo_aviso; })
            .rollup(function (d) { return d3.mean(d, function (g) { return g["trabajo_real"]; }); })
            .entries(datosFiltradosEq);

        var horas_X_TipoAviso = d3.nest()
            .key(function (d) { return d.tipo_aviso; })
            .rollup(function (d) { return d3.mean(d, function (g) { return g["prom_trabajo_real"]; }); })
            .entries(datosFiltrados);

        var vTrabajoMax = d3.max([horas_X_TipoAviso[0].value, horas_X_TipoAviso[1].value, horas_X_TipoAviso[2].value]);

        try {
            vTrabajoMax = d3.max([horas_X_TipoAviso[0].value, horas_X_TipoAviso[1].value, horas_X_TipoAviso[2].value,
            horas_X_TipoAvisoEq[0].value, horas_X_TipoAvisoEq[1].value, horas_X_TipoAvisoEq[2].value]);
        } catch (e) { }


        var costos_X_TipoAvisoEq = d3.nest()
            .key(function (d) { return d.tipo_aviso; })
            .rollup(function (d) { return d3.mean(d, function (g) { return g["costo_total"]; }); })
            .entries(datosFiltradosEq);

        var costos_X_TipoAviso = d3.nest()
            .key(function (d) { return d.tipo_aviso; })
            .rollup(function (d) { return d3.mean(d, function (g) { return g["prom_costo_total"]; }); })
            .entries(datosFiltrados);

        var vCostoMax = d3.max([costos_X_TipoAviso[0].value, costos_X_TipoAviso[1].value, costos_X_TipoAviso[2].value]);
        try {
            vCostoMax = d3.max([costos_X_TipoAviso[0].value, costos_X_TipoAviso[1].value, costos_X_TipoAviso[2].value
                , costos_X_TipoAvisoEq[0].value, costos_X_TipoAvisoEq[1].value, costos_X_TipoAvisoEq[2].value]);
        } catch (e) { }


        //Construir datos de cada radar

        var escalaTrabajo = d3.scaleLinear()
            .domain([0, vTrabajoMax]) // unit: hrs
            .range([0, 100]); // unit: pixels

        var escalaCosto = d3.scaleLinear()
            .domain([0, vCostoMax]) // unit: $
            .range([0, 100]); // unit: pixels

        var arreglo = [];
        horas_X_TipoAviso.forEach(function (d) {
            if (d.key != "change") {
                row = {};
                row.area = d.key + "(h)";
                row.value = escalaTrabajo(+d.value || 0);
                arreglo.push(row);
            }
        });
        datosHoras.push(arreglo);

        var arreglo = [];
        horas_X_TipoAvisoEq.forEach(function (d) {
            row = {};
            row.area = d.key + "(h)";
            row.value = escalaTrabajo(+d.value || 0);
            arreglo.push(row);
        });
        datosHoras.push(arreglo);

        var arreglo = [];
        costos_X_TipoAviso.forEach(function (d) {
            if (d.key != "change") {
                row = {};
                row.area = d.key + "($)";
                row.value = escalaCosto(+d.value || 0);
                arreglo.push(row);
            }
        });

        datosCostos.push(arreglo);

        var arreglo = [];
        costos_X_TipoAvisoEq.forEach(function (d) {
            row = {};
            row.area = d.key + "($)";
            row.value = escalaCosto(+d.value || 0);
            arreglo.push(row);
        });
        datosCostos.push(arreglo);
        
        ////////////////////////////////////////////////////////////// 
        //////////////////// Draw the Chart ////////////////////////// 
        ////////////////////////////////////////////////////////////// 
        //var color = d3.scale.ordinal()
        //    .range(["#EDC951", "#CC333F", "#00A0B0"]);
        var colorHoras = d3.scaleOrdinal().range(["#EDC951", "#CC333F", "#00A0B0"]);
        var colorCostos = d3.scaleOrdinal().range(["#EDC951", "#CC333F", "#00A0B0"]);

        var radarChartOptionsHoras = {
            w: vWidth,
            h: vHeight,
            maxValue: 100,
            levels: 5,
            color: colorHoras
        }

        var radarChartOptionsCostos = {
            w: vWidth,
            h: vHeight,
            maxValue: 100,
            levels: 5,
            color: colorCostos
        }

        RadarChart.draw("#radarChartHoras", datosHoras, radarChartOptionsHoras);
        RadarChart.draw("#radarChartCosto", datosCostos, radarChartOptionsCostos);
    });
};