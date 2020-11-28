/* Radar chart design created by Nadieh Bremer - VisualCinnamon.com */
/* https://bl.ocks.org/alandunning/4c36eb1abdb248de34c64f5672afd857 */
var tmpFechaInicial = "";
var tmpFechaFinal = "";

var svgStacked= null;

function dibujarRadar(fechaInicial, fechaFinal, data) {
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

    //d3.csv('radar/data/datos_radar.csv', function (data) {
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
    datosFiltradosEq = data.filter(function (d) { return d.id_equipo == vIdEquipo && tParser(d.fecha_aviso.substring(0, 10)).getTime() >= fechaInicial.getTime() && tParser(d.fecha_aviso.substring(0, 10)).getTime() <= fechaFinal.getTime() })
    var vTipoEquipo = datosFiltradosEq[0].tipo_equipo;
    console.log(vTipoEquipo);
    datosFiltrados = data.filter(function (d) { return d.tipo_equipo == vTipoEquipo && tParser(d.fecha_aviso.substring(0, 10)).getTime() >= fechaInicial.getTime() && tParser(d.fecha_aviso.substring(0, 10)).getTime() <= fechaFinal.getTime() })

    //Agrupamos por mes
    var costos_X_dia = d3.nest()
        .key(function (d) { return d.fecha_aviso; })
        .rollup(function (d) { return d3.sum(d, function (g) { return g["costo_total"]; }); })
        .entries(datosFiltrados);

    costos_X_dia.forEach(function (d) { d.key = tParser(d.key.substring(0, 10)); });
    //console.log(costos_X_dia);

    var horas_X_dia = d3.nest()
        .key(function (d) { return d.fecha_aviso; })
        .rollup(function (d) { return d3.sum(d, function (g) { return g["trabajo_real"]; }); })
        .entries(datosFiltrados);
    //horas_X_dia.forEach(function (d) { d.key = tParser(d.key.substring(0, 10)); });
    //console.log(horas_X_dia);

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


    ///////////////////////////////////////////////////////////////////////
    //////////////////// Draw STack Bar //////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    // List of subgroups = header of the csv files = soil condition here
    https://bl.ocks.org/d3noob/bdf28027e0ce70bd132edc64f1dd7ea4

    /*var vCostoMaxStack = 0;
    var escalaCostoStack = d3.scaleLinear()
        .domain([0, vCostoMaxStack]) // unit: $
        .range([0, 100]); // unit: pixels
    /*var dataStack_Costos = [];
    costos_X_dia.forEach(function (d) {
        row = {};
        row.group = d.key;
        row.value = escalaCostoStack(+d.value || 0);
        arreglo.push(row);
    });
    dataStack_Costos.push(arreglo);
    console.log(costos_X_dia);
    console.log("====================================================");
    console.log("dataStack_Costos");
    console.log(dataStack_Costos);
    console.log("====================================================");*/
    var marginStack = { top: 20, right: 20, bottom: 30, left: 40 },
        widthStack = 960 - marginStack.left - marginStack.right,
        heightStack = 500 - marginStack.top - marginStack.bottom;

    // set the ranges
    var xStack = d3.scaleBand()
        .range([0, widthStack])
        .padding(0.1);
    var yStack = d3.scaleLinear()
        .range([heightStack, 0]);

    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    svgStacked = d3.select("#stackbars").append("svg")
        .attr("width", widthStack + marginStack.left + marginStack.right)
        .attr("height", heightStack + marginStack.top + marginStack.bottom)
        .append("g")
        .attr("transform",
            "translate(" + marginStack.left + "," + marginStack.top + ")");

    // get the data
    // Scale the range of the data in the domains
    xStack.domain(costos_X_dia.map(function (d) { return new Date(d.key).getMonth(); }));
    yStack.domain([0, d3.max(costos_X_dia, function (d) { return d.value; })]);

    // append the rectangles for the bar chart
    svgStacked.selectAll(".bar")
        .data(costos_X_dia)
        .exit()//
        .remove()//
        .enter().append("rect")
        .merge(svgStacked)//
        .attr("class", "bar")
        .attr("x", function (d) { return xStack(new Date(d.key).getMonth()); })
        .attr("width", xStack.bandwidth())
        .attr("y", function (d) { return yStack(d.value); })
        .attr("height", function (d) { return height - yStack(d.value); });

    // add the x Axis
    svgStacked.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xStack));

    // add the y Axis
    svgStacked.append("g")
        .call(d3.axisLeft(yStack));


    //});
};