// us map
var draw = async function(){
    const idToStates = {
        "01": "AL",
        "02": 'AK',
        "04": 'AZ',
        "05": 'AR',
        "06": 'CA',
        "08": 'CO',
        "09": 'CT',
        10: 'DE',
        11: 'DC',
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
        49: 'UT',
        50:	"VT",
        51:	"VA",
        53:	"WA",
        54:	"WV",
        55:	"WI",
        56:	"WY"
    };

    const abbrToFull = {
        "AL":"Alabama",
        "AK": "Alaska",
        'AZ': "Arizona",
         'AR': "Arkansas",
        'CA': "California",
        'CO': "Colorado",
        'CT': "Connecticut",
        'DE': "Delaware",
        'DC': "Washington, DC",
        'FL': "Florida",
        'GA': "Georgia",
        'HI': "Hawaii",
        'ID': "Idaho",
        'IL':"Illinois",
        'IA': "Iowa",
        'IN': "Indiana",
        'KS': "Kansas",
        'KY': "Kentucky",
        'LA': "Louisiana",
        'ME': "Maine",
        'MD':"Maryland",
        'MA': "Massachusetts",
        'MI': "Michigan",
        'MN':"Minnesota",
        'MS': "Mississippi",
        'MO': "Missouri",
        'MT': "Montana",
        'NE': "Nebraska",
        'NV': "Nevada",
        'NH': "New Hampshire",
        'NJ': "New Jersey",
        'NM': "Nex Mexico",
        'NY': "New York",
        'NC': "North Carolina",
        'ND': "North Dakota",
        'OH': "Ohio",
        'OK': "Oklahoma",
        'OR': "Oregon",
        "PA": "Pennsylvania",
        "RI": "Rhode Island",
        "SC": "South Carolina",
        "SD": "South Dakota",
        "TN": "Tennessee",
        "TX": "Texas",
        'UT': "Utah",
        "VT": "Vermont",
        "VA": "Virginia",
        "WA": "Washington",
        "WV": "West Virginia",
        "WI": "Wisconsin",
        "WY": "Wyoming"
    };
    var stateChosen = false;
    var stateFeatures;
    var stateHeader = document.getElementById("state");
    async function drawMap(){
        var mapSvg = d3.select('svg#map')
        .attr("width",600)
        .attr('height',400);
        var path = d3.geoPath();

        var us = await d3.json('us-10m.v1.json');
        stateFeatures = topojson.feature(us,us.objects.states).features;
        updatePopulation()

        const colorScale = d3.scaleDiverging()
        .domain([minPop-1,maxPop+1])
        .interpolator(t=>{
            return d3.rgb(214*t+249*(1-t), 110*t+195*(1-t), 67*t+11*(1-t));
        })
        
        var selection = mapSvg.append('g')
        .attr('class','states')
        .selectAll('path')
        .data(stateFeatures);

        var enter = selection.enter();
        selection.attr('fill',d=>{
            return colorScale(d.population)
        });
        
        var update = enter.append('path')
        .attr('class','state')
        .attr('d',path)
        .on('click',d=>{
            selectedState = idToStates[d.id];
            stateHeader.innerHTML = abbrToFull[selectedState];
            stateChosen = true;
            showSinglePopulation();
        })
        .attr('fill',d=>{
            return colorScale(d.population)
        });
        var updateColor = ()=>{
            update.attr('fill',(d,id)=>{
                return colorScale(stateFeatures[id].population)
            })
        }

        mapSvg.append('path')
        .attr('class','state-borders')
        .attr('d',path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));

        return {
            selection,updateColor
        };
    }

    function drawSlider(){
        const sidePadding = 20;
        var width = document.body.clientWidth-sidePadding*2, height = 80;
        
        const triangleSize = 40;
        const offsetX = triangleSize;
        const sqrt3 = Math.sqrt(3)/2;
        
        var svg = d3.select('svg#yearSlider')
        .attr('width',width+triangleSize)
        .attr('height',height).append('g')
        .attr('transform','translate('+(offsetX+sidePadding)+',0)');

        let sliderBar = svg.append('line')
        .classed('track',true);
        let sliderBarMiddle = svg.append('line')
        .classed('track-middle',true);

        let thumb1 = svg.append('svg:image');
        thumb1.attr('xlink:href',"img/arrow.svg")
        .attr('x',-triangleSize/2).attr('y',-triangleSize/2)
        .attr('width',triangleSize).attr('height',triangleSize);
        
        let label1 = svg.append('text')
        .text(yearRange[1])
        .style('text-anchor','end');

        let thumb2 = svg.append('svg:image')
        thumb2.attr('xlink:href',"img/arrow.svg")
        .attr('x',-triangleSize/2).attr('y',-triangleSize/2)
        .attr('width',triangleSize).attr('height',triangleSize);
        
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

            sliderBarMiddle.attr('x1',xScale.range()[0])
            .attr('x2',xScale.range()[1])
            .attr('y1',triangleSize/2)
            .attr('y2',triangleSize/2);

            
            moveThumb(thumb1,label1,yearRange[1],1);
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
                    moveThumb(thumb1,label1,x,1);
                    yearRange[1] = Math.floor(x);
                    if(xFrom>xTo){
                        moveThumb(thumb2,label2,x);
                        yearRange[0] = yearRange[1];
                    }
                    updatePopulation();

                    mapDraw.updateColor()
                    
                    showSinglePopulation()
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
                        moveThumb(thumb1,label1,x,1);
                        yearRange[1] = yearRange[0];
                    }
                    updatePopulation();
                    mapDraw.updateColor()

                    showSinglePopulation();
                })
            );

            function moveThumb(thumb,label,x, isRight){
                thumb.attr('transform','translate('+xScale(x)+','+triangleSize/2+') '+(isRight?" rotate(180)":""));
                label.attr('transform','translate('+xScale(x)+','+triangleSize*3/2+')').text(parseInt(x));
                if(isRight){
                    sliderBarMiddle
                    .attr('x2',xScale(x));
                }else{
                    sliderBarMiddle.attr('x1',xScale(x));
                }
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

    function updatePopulation(){
        for(let i=0;i<stateFeatures.length;i++){
            let state = idToStates[stateFeatures[i].id]
            let pop = calcAvgPop(yearRange, state);
            if(pop!==stateFeatures[i].population){
                let newElem = {};
                for(let key in stateFeatures[i]){
                    newElem[key] = stateFeatures[i][key];
                }
                newElem.population = pop;
                stateFeatures[i] = newElem;
            } 
        }
    }

    function showSinglePopulation(){
        stateNameArea.innerHTML = selectedState;
    }
    
    let popByYear = await d3.json('pop_by_year.json');
    var maxPop = 0, minPop = Infinity;
    for(let year in popByYear){
        for(let state in popByYear[year]){
            maxPop = Math.max(popByYear[year][state],maxPop);
            minPop = Math.min(popByYear[year][state],minPop);
        }
    }
    
    var pollutant_by_state = await d3.json("pollutant_by_state.json");
    var svgChart = d3.select("#bar_chart");
    var chartWidth = svgChart.attr("width");
    var chartHeight = svgChart.attr("height");
  
    /*
    UNITS:
    NO2: ppb
    O3: ppm
    SO2: ppb
    CO: ppm

    */

    function drawGraph(stateChosen){

        
        console.log(pollutant_by_state);


        
            const yearScale = d3.scaleLinear().domain([2000, 2016]).range([0, chartWidth - 80 ]);
         
    
       

            // y scales -> Energy Generated
        
            const yScale = d3.scaleLinear().domain([0, 1]).range([chartHeight-50, 30]);

        


            //Create an offset to correctly place d3 line over axes
            var xAxisOffsetLine =  130; 

            //Create y axis
            var yAxis = d3.axisLeft(yScale);
            svgChart.append("g")
                .attr("class", "left axis")
                .attr("transform", "translate(" + 40 + "," + 0 + ")")
                .call(yAxis);

            
            
            var yearAxis = d3.axisBottom(yearScale).tickValues([2000,2001,2002,2003,2004, 2005,2006,2007,2008, 2009,2010,2011, 2012, 2013, 2014, 2015, 2016])
            .tickFormat(function(d,i){ return d; });
        
            // Create x axis and get array of x pixel locations of the month ticks
            var yearTickArray = [];
            svgChart.append("g")
                .attr("class", "bottom axis")
                .attr("transform", "translate(50," + (chartHeight-50) + ")")
                .call(yearAxis);

     

            // x label
            svgChart.append("text")
                .attr("class", "x axis label")
                .attr("x", chartWidth / 2)
                .attr("y", chartHeight - 8)
                .attr("font-size", "18px")
                .attr("text-anchor", "middle")
                .text("Year");

            // y label
            svgChart.append("text")
                .attr("class", "y axis label")
                .attr("x", -chartHeight / 2)
                .attr("y", 10)
                .attr("font-size", "16px")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .text("Units");

    }










    var mapDraw = await drawMap();
    drawSlider();
    showSinglePopulation();
    drawGraph(stateChosen);
}

var selectedState = "*Choose a state*";
var stateNameArea = document.getElementById('selectedState');
var statePopArea = document.getElementById('statePopulation');
var yearRange = [2000, 2016];

draw();

// page jump
var part1 =document.getElementById('part2map');
var part2= document.getElementById('part4chart');
var btns = document.querySelectorAll('.pollutant');
let textarea =  document.getElementById("output");
var banner = document.querySelector('.pollutant-buttons-banner');
let backBtn = document.querySelector('#back');

for(let i=0;i<btns.length;i++){
    btns[i].onclick = ()=>{
        part2.scrollIntoView({behavior: "smooth"});
        banner.style.opacity = 1;
        banner.style.delay = 'opacity 2s'
        banner.style.transition = 'opacity 1s'
        let msg = btns[i].innerHTML;
        textarea.innerHTML=msg;
    }
    btns[i].onmouseover = ()=>{
        
    }
}

backBtn.onclick = ()=>{
    part1.scrollIntoView({behavior: "smooth"});
    banner.style.opacity = 0;
}
