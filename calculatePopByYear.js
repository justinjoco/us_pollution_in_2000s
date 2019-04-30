const states = ['AL','AK','AS','AZ','AR','CA','CO','CT','DE','DC','FL','GA','GU','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MH','MA','MI','FM','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','MP','OH','OK','OR','PW','PA','PR','RI','SC','SD','TN','TX','UT','VT','VA','VI','WA','WV','WI','WY'];

    var popByYear = {};
    for(let i=0;i<states.length;i++){
        let pop = await d3.csv('pop/'+states[i]+'POP.csv');
        for(let j=0;j<pop.length;j++){
            let year = pop[j].DATE.substring(0,4);
            popByYear[year]=popByYear[year]||{};
            popByYear[year][states[i]] = pop[j][states[i]+'POP'];
        }

    }
    console.log(JSON.stringify(popByYear))


