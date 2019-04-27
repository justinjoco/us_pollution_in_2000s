var draw = async function(){
    var mapSvg = d3.select('svg#map')
    .attr("width",600)
    .attr('height',400);
    var path = d3.geoPath();

    var us = await d3.json('us-10m.v1.json');

    mapSvg.append('g')
    .attr('class','states')
    .selectAll('path')
    .data(topojson.feature(us,us.objects.states).features)
    .enter().append('path')
    .attr('class','state')
    .attr('d',path);

    mapSvg.append('path')
    .attr('class','state-borders')
    .attr('d',path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));
    
    let popByYear = await d3.json('pop_by_year.json');
    
}

draw();
