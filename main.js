// us map

var draw = async function(){
    var activePollutant = 'CO';
    var yUnits = null;
    var avgData = null;
    const sidePadding = 40;
    var yearRange = [2000, 2016];

    var pollutant_data = await d3.json("pollutant_by_state.json");
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
        'NM': "New Mexico",
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

    var stateValues = [];
    let id = 1;
    for(let stateAbbr in abbrToFull){
        stateValues.push(stateAbbr);
        id++;
    }

    var stateChosen = false;
    var stateFeatures;
    var stateHeader = document.getElementById("state");
    async function drawMap(){
        function resizeMap(){
            mapWidth = (document.body.clientWidth-sidePadding*2)/2-sidePadding/2;
            mapSvg.attr("width",mapWidth);
        }

        mapWidth = (document.body.clientWidth-sidePadding*2)/2-sidePadding/2;
        var mapSvg = d3.select('svg#map')
        .attr("width",mapWidth)
        .attr('height',350);
        var path = d3.geoPath();

        var us = await d3.json('us-10m.v1.json');
        stateFeatures = topojson.feature(us,us.objects.states).features;
        updatePopulation()

        const colorScale = d3.scaleSequential()

        .domain([minPop-1,maxPop+1])
        .interpolator(t=>{
            let rgb = d3.rgb(209*t+249*(1-t), 61*t+195*(1-t), 0*t+11*(1-t));
            let c = d3.color(rgb);
            c.opacity = Math.min(20*t,1);

            return c;
        })
        
        var selection = mapSvg.append('g')
        .attr('class','states')
        .selectAll('path')
        .data(stateFeatures);

        var enter = selection.enter();
        selection.attr('fill',d=>{
            return colorScale(d.population)
        });

        function onSelectState(d){
            selectedState = idToStates[d.id];
            // stateHeader.innerHTML = abbrToFull[selectedState];
         
            if (activePollutant!=null){
                drawGraph(selectedState, activePollutant);
            }
            
            popText.attr('opacity',(d2,id2)=>{
                if(d2.id === d.id) return 1;
                return 0;
            })

            inputBox.value = abbrToFull[selectedState];

        }

        inputBox.addEventListener('input',(evt)=>{
            let val = inputBox.value.toLowerCase();
            var matchRes = stateValues.filter(e=>(e.toLowerCase().indexOf(val)>-1
            ||abbrToFull[e].toLowerCase().indexOf(val)>-1));
            inputMatchResult.innerHTML = '';
            for(let i=0;i<matchRes.length;i++){
                var node = document.createElement('div')
                node.setAttribute('class','state-input-result-item');
                // console.log(node);
                node.innerHTML = abbrToFull[matchRes[i]];
                inputMatchResult.appendChild(node);
                node.addEventListener('click',()=>{
                    let stateId = '';
                    for(let id in idToStates){
                        if(matchRes[i]===idToStates[id]){
                            stateId = id;
                            break;
                        }
                    }
                    let d = null;
                    for(let i=0;i<stateFeatures.length;i++ ){
                        if(stateId == stateFeatures[i].id){
                            d = stateFeatures[i];
                            break;
                        }
                    }
                    onSelectState(d)
                })
            }

        })

        var update = enter.append('path')
        .attr('class','state')
        .attr('d',path)
        .on('click',onSelectState)
        .attr('fill',d=>{
            return colorScale(d.population)
        });

        var popText = enter.append('text').text(d=>d.population+'k')
        .attr('font-size','30px')
        .attr('pointer-event','none')
        .attr('fill','#4f342a')
        .attr('text-anchor','middle')
        .attr('alignment-baseline','central')
        .attr('opacity','0')
        .attr('transform',d=>{
            let xarr = d.geometry.coordinates[0][0].map(e=>e[0]);
            let yarr = d.geometry.coordinates[0][0].map(e=>e[1])
            let minX = d3.min(xarr);
            let maxX = d3.max(xarr);
            let minY = d3.min(yarr);
            let maxY = d3.max(yarr);
            return 'translate('+parseInt((minX+maxX)/2)+','+parseInt((minY+maxY)/2)+')'
        })
        .on('click',onSelectState)
        
        var updateColor = ()=>{
            update.attr('fill',(d,id)=>{
                return colorScale(stateFeatures[id].population)
            })
            popText.text((d,id)=>stateFeatures[id].population+'k')

        }

        mapSvg.append('path')
        .attr('class','state-borders')
        .attr('d',path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));

        window.addEventListener('resize',resizeMap)

        return {
            selection,updateColor
        };
    }

    function drawSlider(){
        var width = document.body.clientWidth-sidePadding*2, height = 80;
        
        const triangleSize = 40;
        const sqrt3 = Math.sqrt(3)/2;
        
        var svg = d3.select('svg#yearSlider')
        .attr('width',width)
        .attr('height',height).append('g')
        .attr('transform','translate('+(sidePadding)+',0)');

        let sliderBar = svg.append('line')
        .classed('track',true);
        let sliderBarMiddle = svg.append('line')
        .classed('track-middle',true);

        let thumb1 = svg.append('svg:image');
        thumb1.attr('xlink:href',"img/arrow.svg")
        .attr('x', -triangleSize/4+1).attr('y',-triangleSize/2)
        .attr('width',triangleSize).attr('height',triangleSize);
        
        let label1 = svg.append('text')
        .text(yearRange[1])
        .style('text-anchor','end');

        let thumb2 = svg.append('svg:image')
        thumb2.attr('xlink:href',"img/arrow.svg")
        .attr('x',-triangleSize/4).attr('y',-triangleSize/2)
        .attr('width',triangleSize).attr('height',triangleSize);
        
        let label2 = svg.append('text')
        .text(yearRange[0])
        .style('text-anchor','start');

        function resizeSlider(){
            width = document.body.clientWidth-sidePadding*2;
            
            document.getElementById('yearSlider').setAttribute('width',width+triangleSize)

            let xScale = d3.scaleLinear()
            .domain(yearRange)
            .range([0,width]).clamp(true);

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

        resizeSlider();

        window.addEventListener('resize', resizeSlider)
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
        if(activePollutant!==null){
            drawGraph(selectedState, activePollutant);
        }
        
    }
    
    let popByYear = await d3.json('pop_by_year.json');

    var maxPop = 0, minPop = Infinity;
    for(let year in popByYear){
        for(let state in popByYear[year]){
            maxPop = Math.max(popByYear[year][state],maxPop);
            minPop = Math.min(popByYear[year][state],minPop);
        }
    }
    
    var svgChart = d3.select("#bar_chart")
    .attr('height',400)
    .attr('width',1000);
    
    var chartWidth = svgChart.attr("width");
    var chartHeight = svgChart.attr("height");
  

    /*
    UNITS:
    NO2: ppb
    O3: ppm
    SO2: ppb
    CO: ppm

    */
    function clearGraph(){

        svgChart.selectAll("path.line").remove();
        svgChart.selectAll("text").remove();
        svgChart.selectAll("g").remove();
        svgChart.selectAll(".line").remove();
    }

    function generateAvgData(pollutant_data, activePollutant, currState){
        let valueList = [];
        let stateList = [];
        let missingList = [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 
        2012, 2013, 2014, 2015, 2016];

        console.log(pollutant_data[currState]);

        for (let currYear = yearRange[0]; currYear<=yearRange[1]; currYear++){
            let state_count = 0;
            let total_pollutant = 0;
           
           
            for (let state in pollutant_data){
              //  console.log(state);
                if (currYear in pollutant_data[state]){
                    total_pollutant += pollutant_data[state][currYear][activePollutant];
                    state_count++;
                }

            }
            valueList.push(total_pollutant/state_count);
        }
        
        let tempYear = undefined;
        let firstYear = undefined;
        if (pollutant_data[currState] != undefined){
            for (let currYear = yearRange[0]; currYear<=yearRange[1]; currYear++){
                // console.log(pollutant_data[currState]);
                if (currYear in pollutant_data[currState]){
                    stateList.push(pollutant_data[currState][currYear][activePollutant]);
                    missingList.splice( missingList.indexOf(currYear), 1 );
                    tempYear = currYear;
                    if (firstYear == undefined) firstYear = currYear;
                }
                else {
                    if (tempYear != undefined){
                     //   pollutant_data[currState][currYear]=activePollutant;
                     //   pollutant_data[currState][currYear][activePollutant] = pollutant_data[currState][tempYear][activePollutant];
                        stateList.push(pollutant_data[currState][tempYear][activePollutant]);
                    }
                  

                }
            }
        }   

        for (let currYear = yearRange[0]; currYear<firstYear; currYear++){
            stateList.unshift(pollutant_data[currState][firstYear][activePollutant]);

        }

       // console.log(valueList);
     //   console.log(stateList);
        return [valueList, stateList, missingList];

    }

    function interpolate(){

        
    }

    function drawGraph(activeState, activePollutant){
        clearGraph();
        
        let [avgData, stateData, missingList] = generateAvgData(pollutant_data, activePollutant, abbrToFull[activeState]);
        console.log(missingList);
        // y scales -> Energy Generated
        let stateDataMax;
        if (stateData.length>=1) {
            stateDataMax = d3.max(stateData);
        }else{
            stateDataMax = 0;
        }
        const yScale = d3.scaleLinear().domain([0, Math.max(d3.max(avgData), stateDataMax)]).range([chartHeight-50, 30]);
        var yearScale;

        function resizeSvgChart(){
            let width = document.body.clientWidth - sidePadding*2;
            svgChart.attr('width',width/2);
            chartWidth = svgChart.attr("width");
            yearScale = d3.scaleLinear().domain(yearRange).range([0, chartWidth - 80 ]);
        };

        resizeSvgChart();

        //Create an offset to correctly place d3 line over axes
        var xAxisOffsetLine =  130; 

        //Create y axis
        var yAxis = d3.axisLeft(yScale);
        svgChart.append("g")
            .attr("class", "left axis")
            .attr("transform", "translate(" + 40 + "," + 0 + ")")
            .call(yAxis);
        
        var yearArray = [];
        for(let y=yearRange[0];y<=yearRange[1];y++){
            yearArray.push(y);
        }
        var yearAxis = d3.axisBottom(yearScale).tickValues(yearArray)
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
            .attr("font-size", "14px")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text(yUnits);


        var line = d3.line()
        .x(function (d, i) {
            return yearScale(i+yearRange[0])+50;
        })
        .y(function (d) {
            return yScale(d);
        }).curve(d3.curveCardinal);
        
        svgChart.append("path")
            .datum(avgData)
            .attr("class", "line")
            .style("stroke", "#826c64")
            .style('opacity',0.3)
            .attr('d', line);

        // console.log(stateData.length);
    


        // No data for Montana, Mississippi, New Mexico, Vermont, Nebraska
        
        if (stateData.length>=1){
            svgChart.append("path")
                .datum(stateData)
                .attr("class", "line")
                .style("stroke", "#02d1ff")
                .style('stroke-width','3')
                .attr('d', line);
        }

    }



    var selectedState = "NY";

    var part1 =document.getElementById('part2map');
    var btns = document.querySelectorAll('.pollutant');
    var inputBox = document.getElementById('state-input');
    var inputMatchResult = document.getElementById('state-input-result');
    
    
    for(let i=0;i<btns.length;i++){
        btns[i].onclick = ()=>{
            activePollutant = btns[i].innerHTML;
            for(let j=0;j<btns.length;j++){
                if(btns[j].innerHTML === activePollutant){
                    btns[j].setAttribute('class','pollutant-chosen pollutant');
                }else{
                    btns[j].setAttribute('class','pollutant');
                }
                
            }
            if (activePollutant === "CO" || activePollutant === "O3"){yUnits = "Parts per million";} else{ yUnits = "Parts per billion";}

            drawGraph(selectedState, activePollutant);
        }
    }

    var mapDraw = await drawMap();
    drawSlider();

    yUnits = "Parts per million";
    drawGraph(selectedState, activePollutant);
}

draw();

// page jump
