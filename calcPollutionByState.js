let pollutantData = await d3.csv('data/us_pollution_2000_2016_condensed.csv');
    
    pollutantData.sort((a,b)=>a.State>b.State?1:(a.State===b.State?(a.Year>b.Year?1:(a.Year===b.Year?0:-1)):-1));
    console.log(pollutantData)
    let pollutantByState={};
    let dayCount, currState, currYear;
    for(let i=0;i<pollutantData.length;i++){
        
        let state = pollutantData[i]["State"];
        let year = pollutantData[i]["Year"];
        if(currState!==state||currYear!==year){
            if(pollutantByState[currState]&&pollutantByState[currState][currYear]){
                pollutantByState[currState][currYear]["CO"]/=dayCount;
                pollutantByState[currState][currYear]["NO2"]/=dayCount;
                pollutantByState[currState][currYear]["O3"]/=dayCount;
                pollutantByState[currState][currYear]["SO2"]/=dayCount;
                pollutantByState[currState][currYear].dayCount = dayCount;
            }

            dayCount = 0;
            currState = state, currYear = year;

            pollutantByState[currState] = pollutantByState[currState]||{};
            pollutantByState[currState][currYear]=pollutantByState[currState][currYear]||{"CO":0,"NO2":0,"O3":0,"SO2":0};
        }
        dayCount++;
        pollutantByState[state][year]["CO"]+=parseFloat(pollutantData[i]["CO Mean"]);
        pollutantByState[state][year]["NO2"]+=parseFloat(pollutantData[i]["NO2 Mean"]);
        pollutantByState[state][year]["O3"]+=parseFloat(pollutantData[i]["O3 Mean"]);
        pollutantByState[state][year]["SO2"]+=parseFloat(pollutantData[i]["SO2 Mean"]);
        
    }
    console.log(JSON.stringify(pollutantByState))