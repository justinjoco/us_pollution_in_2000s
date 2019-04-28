// us map
var draw = async function(){

    async function drawMap(){
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
    }

    function drawSlider(){
        const width = document.body.clientWidth, height = 50;
        const triangleSize = 20;
        const offsetX = triangleSize;
        const sqrt3 = Math.sqrt(3)/2;
        var svg = d3.select('#yearSlider')
        .attr('width',width)
        .attr('height',height).append('g')
        .attr('transform','translate('+offsetX+',0)');

        var triangleLeft = {
            draw: function(context, size){
                context.moveTo(-sqrt3*size,0);
                context.lineTo(0,-size/2);
                context.lineTo(0,size/2);
                context.closePath();
            }
        }

        var triangleRight = {
            draw: function(context, size){
                context.moveTo(sqrt3*size,0);
                context.lineTo(0,-size/2);
                context.lineTo(0,size/2);
                context.closePath();
            }
        }

        let leftTrgl = d3.symbol().type(triangleLeft).size(triangleSize);
        let rightTrgl = d3.symbol().type(triangleRight).size(triangleSize);

        let xScale = d3.scaleLinear()
        .domain([2000, 2010])
        .range([0,width-2*triangleSize]).clamp(true);

        let sliderBar = svg.append('line')
        .classed('track',true)
        .attr('x1',xScale.range()[0])
        .attr('x2',xScale.range()[1])
        .attr('y1',triangleSize/2)
        .attr('y2',triangleSize/2);

        let thumb1 = svg.append('path')
        .attr('d',rightTrgl)
        .classed('slider-to',true)
        .style('stroke','grey')
        .style('fill', 'white');
        
        let label1 = svg.append('text')
        .text('x');
        moveThumb(thumb1,label1,2010);

        let thumb2 = svg.append('path')
        .attr('d',leftTrgl)
        .classed('slider-from',true)
        .style('stroke','grey')
        .style('fill', 'white')
        
        let label2 = svg.append('text')
        .text('y')
        
        moveThumb(thumb2,label2,2000);

        thumb1.call(d3.drag()
            .on('start.interrupt', function(){
                thumb1.interrupt()
            })
            .on('start drag', ()=>{
                let xTo = Number(thumb1.attr('transform').split('translate(')[1].split(',')[0])
                let xFrom = Number(thumb2.attr('transform').split('translate(')[1].split(',')[0]);
                if(xFrom>xScale.range()[1])return;
                let x = xScale.invert(d3.event.x);
                moveThumb(thumb1,label1,x);
                if(xFrom>xTo){
                    moveThumb(thumb2,label2,x);
                }
            })
        );

        thumb2.call(d3.drag()
            .on('start.interrupt', function(){
                thumb2.interrupt()
            })
            .on('start drag', ()=>{
                let xTo = Number(thumb1.attr('transform').split('translate(')[1].split(',')[0])
                let xFrom = Number(thumb2.attr('transform').split('translate(')[1].split(',')[0]);
                if(xTo<xScale.range()[0])return;
                
                let x = xScale.invert(d3.event.x);
                moveThumb(thumb2,label2,x);
                if(xFrom>xTo){
                    moveThumb(thumb1,label1,x);
                }
            })
        );

        function moveThumb(thumb,label,x){
            thumb.attr('transform','translate('+xScale(x)+','+triangleSize/2+')');
            label.attr('transform','translate('+xScale(x)+','+2*triangleSize+')').text(parseInt(x))
            
        }
    }
    

    drawMap();
    let popByYear = await d3.json('pop_by_year.json');
    drawSlider();
    
}

draw();

// page jump
var part4= document.getElementById('part4chart');
var btns = document.querySelectorAll('.btn');
let textarea =  document.getElementById("output");

for(let i=0;i<btns.length;i++){
    btns[i].onclick = ()=>{
        part4.scrollIntoView();
        let msg = btns[i].innerHTML;
        textarea.innerHTML=msg;
    }
}
