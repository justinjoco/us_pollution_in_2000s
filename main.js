// us map

var draw = async function(){

    async function drawMap(){
        const idToStates = {
            "01": "AL",
            "02": 'AK',
            "04": 'AZ',
            "05": 'AR',
            "06": 'CA',
            "08": 'CO',
            "09": 'CT',
            10: 'DE',
            12: 'FL',
            13: 'GA',
            15: 'HI',
            16: 'ID',
            17: 'IL',
            19: 'IA',
            18: 'IN',
            20:	'KS',
            21:	'KY',
            22:	'LA',
            23:	'ME',
            24:	'MD',
            25:	'MA',
            26:	'MI',
            27:	'MN',
            28:	'MS',
            29:	'MO',
            30:	'MT',
            31:	'NE',
            32:	'NV',
            33:	'NH',
            34:	'NJ',
            35:	'NM',
            36:	'NY',
            37:	'NC',
            38:	'ND',
            39:	'OH',
            40:	'OK',
            41:	'OR',
            42:	"PA",
            44:	"RI",
            45:	"SC",
            46:	"SD",
            47:	"TN",
            48:	"TX",
            49:'UT',
            50:	"VT",
            51:	"VA",
            53:	"WA",
            54:	"WV",
            55:	"WI",
            56:	"WY"
        }
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
        .attr('d',path)
        .on('click',d=>{
            selectedState = idToStates[d.id];
            // console.log(d.id)
            showPopulation();
        });

        mapSvg.append('path')
        .attr('class','state-borders')
        .attr('d',path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));
    }

    function drawSlider(){
        const sidePadding = 20;
        var width = document.body.clientWidth-sidePadding*2, height = 50;
        
        const triangleSize = 20;
        const offsetX = triangleSize;
        const sqrt3 = Math.sqrt(3)/2;
        
        var svg = d3.select('svg#yearSlider')
        .attr('width',width+triangleSize)
        .attr('height',height).append('g')
        .attr('transform','translate('+(offsetX+sidePadding)+',0)');

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

        let sliderBar = svg.append('line')
        .classed('track',true);

        let thumb1 = svg.append('path')
        .attr('d',rightTrgl)
        .classed('slider-to',true)
        .style('stroke','grey')
        .style('fill', 'white');
        
        let label1 = svg.append('text')
        .text(yearRange[1])
        .style('text-anchor','end');

        let thumb2 = svg.append('path')
        .attr('d',leftTrgl)
        .classed('slider-from',true)
        .style('stroke','grey')
        .style('fill', 'white')
        
        let label2 = svg.append('text')
        .text(yearRange[0])
        .style('text-anchor','start');

        function resize(){
            width = document.body.clientWidth-sidePadding*2;
            
            document.getElementById('yearSlider').setAttribute('width',width+triangleSize)

            let xScale = d3.scaleLinear()
            .domain(yearRange)
            .range([0,width-2*triangleSize]).clamp(true);

            sliderBar.attr('x1',xScale.range()[0])
            .attr('x2',xScale.range()[1])
            .attr('y1',triangleSize/2)
            .attr('y2',triangleSize/2);

            
            moveThumb(thumb1,label1,yearRange[1]);
            moveThumb(thumb2,label2,yearRange[0]);

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
                    yearRange[1] = Math.floor(x);
                    if(xFrom>xTo){
                        moveThumb(thumb2,label2,x);
                        yearRange[0] = yearRange[1];
                    }
                    showPopulation()
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
                    yearRange[0] = Math.floor(x);
                    if(xFrom>xTo){
                        moveThumb(thumb1,label1,x);
                        yearRange[1] = yearRange[0];
                    }
                    showPopulation();
                })
            );

            function moveThumb(thumb,label,x){
                thumb.attr('transform','translate('+xScale(x)+','+triangleSize/2+')');
                label.attr('transform','translate('+xScale(x)+','+2*triangleSize+')').text(parseInt(x));
            }

        }

        resize();

        window.addEventListener('resize', resize)
    }

    function calcAvgPop(yearRange, state){
        let pop = 0;
        let nYear = 0;
        for(let year = yearRange[0];year<=yearRange[1];year++){
            if(popByYear[year] && popByYear[year][state]){
                pop+=parseFloat(popByYear[year][state]);
                nYear++;
            }
        }
        // console.log(nYear,pop)
        return pop===0?'NA':Math.floor(pop/nYear);
    }

    function showPopulation(){
        stateNameArea.innerHTML = selectedState;
        statePopArea.innerHTML = calcAvgPop(yearRange, selectedState);
    }
    
    let popByYear = await d3.json('pop_by_year.json');
    drawMap();
    drawSlider();
    showPopulation();
    
}

var selectedState = "NY";
var stateNameArea = document.getElementById('selectedState');
var statePopArea = document.getElementById('statePopulation');
var yearRange = [2000, 2010];

draw();

// page jump
var part4= document.getElementById('part4chart');
var btns = document.querySelectorAll('.pollutant');
let textarea =  document.getElementById("output");
let descriptionArea = document.getElementById('description');

const descriptions = [
    'Carbon monoxide (CO) is toxic to animals that use hemoglobin as an oxygen carrier when encountered in concentrations above about 35 ppm',
    'Nitrogen dioxide (NO2) is ',
    'Ozone or trioxygen (O3) is',
    'Sulfur dioxide (SO2) is'];
descriptionArea.innerHTML = descriptions[0];

for(let i=0;i<btns.length;i++){
    btns[i].onclick = ()=>{
        part4.scrollIntoView({behavior: "smooth"});
        let msg = btns[i].innerHTML;
        textarea.innerHTML=msg;
    }
    btns[i].onmouseover = ()=>{
        descriptionArea.innerHTML = descriptions[i];
    }
}
