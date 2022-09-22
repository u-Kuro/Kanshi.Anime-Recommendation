self.onmessage = (message) => {
    var data = message.data
    var recList = data.recList
    var savedHiddenAnimeTitles = data.savedHiddenAnimeTitles
    var includes = data.includes
    var excludes = data.excludes
    //
    // FilterOut User Includes and Excludes
      // Include
    var tempRecScheme = []
    for(let i=0; i<includes.length; i++){
        for(let j=0; j<recList.length; j++){
            var hasValue = false
            if(equalsNCS(includes[i],recList[j].format)
            ||equalsNCS(includes[i],recList[j].year)
            ||equalsNCS(includes[i],recList[j].season)
            ||equalsNCS(includes[i],recList[j].status)
            ||equalsNCS(includes[i],recList[j].title)
            ||equalsNCS(includes[i],"hidden"))
            {
                tempRecScheme.push(recList[j])
                continue
            }
            // Numbers
            //   // Weighted Score
            // if(includes[i].toLowerCase().includes("wscore<=")){
            //     var score=includes[i].toLowerCase().replace("wscore<=", "")
            //     if(!isNaN(score)) if(recList[j].weightedScore<=parseFloat(score)) tempRecScheme.push(recList[j])
            //     continue
            // }
            // if(includes[i].toLowerCase().includes("wscore>=")){
            //     var score=includes[i].toLowerCase().replace("wscore>=", "")
            //     if(!isNaN(score)) if(recList[j].weightedScore>=parseFloat(score)) tempRecScheme.push(recList[j])
            //     continue
            // }
            // if(includes[i].toLowerCase().includes("wscore>")&&!includes[i].toLowerCase().includes("wscore>=")){
            //     var score=includes[i].toLowerCase().replace("wscore>", "")
            //     if(!isNaN(score)) if(recList[j].weightedScore>parseFloat(score)) tempRecScheme.push(recList[j])
            //     continue
            // }
            // if(includes[i].toLowerCase().includes("wscore<")&&!includes[i].toLowerCase().includes("wscore<=")){
            //     var score=includes[i].toLowerCase().replace("wscore<", "")
            //     if(!isNaN(score)) if(recList[j].weightedScore<parseFloat(score)) tempRecScheme.push(recList[j])
            //     continue
            // }
              // Score
            if(includes[i].toLowerCase().includes("score<=")){//&&!includes[i].toLowerCase().includes("wscore<=")){
                var score=includes[i].toLowerCase().replace("score<=", "")
                if(!isNaN(score)) if(recList[j].score<=parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(includes[i].toLowerCase().includes("score>=")){//&&!includes[i].toLowerCase().includes("wscore>=")){
                var score=includes[i].toLowerCase().replace("score>=", "")
                if(!isNaN(score)) if(recList[j].score>=parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(includes[i].toLowerCase().includes("score>")){//&&!includes[i].toLowerCase().includes("score>=")&&!includes[i].toLowerCase().includes("wscore>")){
                var score=includes[i].toLowerCase().replace("score>", "")
                if(!isNaN(score)) if(recList[j].score>parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(includes[i].toLowerCase().includes("score<")){//&&!includes[i].toLowerCase().includes("score<=")&&!includes[i].toLowerCase().includes("wscore<")){
                var score=includes[i].toLowerCase().replace("score<", "")
                if(!isNaN(score)) if(recList[j].score<parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
              // Year
            if(includes[i].toLowerCase().includes("year<=")){
                var year=includes[i].toLowerCase().replace("year<=", "")
                if(!isNaN(year)) if(recList[j].year<=parseFloat(year)) tempRecScheme.push(recList[j])
                continue
            }
            if(includes[i].toLowerCase().includes("year>=")){
                var year=includes[i].toLowerCase().replace("year>=", "")
                if(!isNaN(year)) if(recList[j].year>=parseFloat(year)) tempRecScheme.push(recList[j])
                continue
            }
            if(includes[i].toLowerCase().includes("year>")&&!includes[i].toLowerCase().includes("year>=")){
                var year=includes[i].toLowerCase().replace("year>", "")
                if(!isNaN(year)) if(recList[j].year>parseFloat(year)) tempRecScheme.push(recList[j])
                continue
            }
            if(includes[i].toLowerCase().includes("year<")&&!includes[i].toLowerCase().includes("year<=")){
                var year=includes[i].toLowerCase().replace("year<", "")
                if(!isNaN(year)) if(recList[j].year<parseFloat(year)) tempRecScheme.push(recList[j])
                continue
            }
            // Arrays
            var temp = recList[j].studios.split(", ")
            for(let k=0; k<temp.length; k++){
                if(equalsNCS(includes[i],temp[k])){
                    tempRecScheme.push(recList[j])
                    hasValue = true
                    break
                }
            }
            if(hasValue) continue
            temp = recList[j].genres.split(", ")
            for(let k=0; k<temp.length; k++){
                if(equalsNCS(includes[i],temp[k])){
                    tempRecScheme.push(recList[j])
                    hasValue = true
                    break
                }
            }
            if(hasValue) continue
            temp = recList[j].tags.split(", ")
            for(let k=0; k<temp.length; k++){
                if(equalsNCS(includes[i],temp[k])){
                    tempRecScheme.push(recList[j])
                    hasValue = true
                    break
                }
            }
            if(hasValue) continue
            temp = recList[j].variablesIncluded.split(", ")
            for(let k=0; k<temp.length; k++){
                if(equalsNCS(includes[i],temp[k])){
                    tempRecScheme.push(recList[j])
                    hasValue = true
                    break
                }
            }
        }
        recList = tempRecScheme
        tempRecScheme = []
    }
    // Exclude
    for(let i=0; i<excludes.length; i++){
        for(let j=0; j<recList.length; j++){
            var hasValue = false
            if(equalsNCS(excludes[i],recList[j].format)
            ||equalsNCS(excludes[i],recList[j].year)
            ||equalsNCS(excludes[i],recList[j].season)
            ||equalsNCS(excludes[i],recList[j].title)
            ||equalsNCS(excludes[i],recList[j].status))
            {
                continue
            }
            temp = recList[j].studios.split(", ")
            for(let k=0; k<temp.length; k++){
                if(equalsNCS(excludes[i],temp[k])){
                    hasValue = true
                    break
                }
            }
            if(hasValue) continue
            temp = recList[j].genres.split(", ")
            for(let k=0; k<temp.length; k++){
                if(equalsNCS(excludes[i],temp[k])){
                    hasValue = true
                    break
                }
            }
            if(hasValue) continue
            temp = recList[j].tags.split(", ")
            for(let k=0; k<temp.length; k++){
                if(equalsNCS(excludes[i],temp[k])){
                    hasValue = true
                    break
                }
            }
            if(hasValue) continue
            temp = recList[j].variablesIncluded.split(", ")
            for(let k=0; k<temp.length; k++){
                if(equalsNCS(excludes[i],temp[k])){
                    hasValue = true
                    break
                }
            }
            if(hasValue==false)
                tempRecScheme.push(recList[j])
        }
        recList = tempRecScheme
        tempRecScheme = []
    }
    // Show Table
    var animeData = ""
    recList.forEach((value) => {
        var score = parseFloat(value.score)
        // var weightedScore = parseFloat(value.weightedScore)
        if(includes.some(item=>equalsNCS(item,"hidden"))){                            
            if(savedHiddenAnimeTitles.includes(value.title)){
                animeData += `
                <tr class="item" role="row">
                    <td class="hide-anime-column">
                        <button 
                            style="margin:auto; padding: 5px 13px;" 
                            type="button" class="show-anime" 
                            title="Hide this Anime">Show</button>
                    </td>
                    <td id="animeTitle"><a href="${value.animeUrl||"javascript:;"}">${value.title}</a></td>
                    <td class="anime-score" title="${score}">${score}</td>
                    <td>${value.status}</td>
                    <td>${value.genres}</td>
                    <td>${value.tags}</td>
                    <td>${value.format}</td>
                    <td>${value.year}</td>
                    <td>${value.season}</td>
                    <td>${value.studios}</td>
                    <td>${value.variablesIncluded}</td>
                </tr>`
            }
        } else {
            if(!savedHiddenAnimeTitles.includes(value.title)){
                animeData += `
                <tr class="item" role="row">
                    <td class="hide-anime-column">
                        <button 
                            style="margin:auto; padding: 5px 13px;" 
                            type="button" class="hide-anime" 
                            title="Hide this Anime">Hide</button>
                    </td>
                    <td id="animeTitle"><a href="${value.animeUrl||"javascript:;"}">${value.title}</a></td>
                    <td class="anime-score" title="${score}">${score}</td>
                    <td>${value.status}</td>
                    <td>${value.genres}</td>
                    <td>${value.tags}</td>
                    <td>${value.format}</td>
                    <td>${value.year}</td>
                    <td>${value.season}</td>
                    <td>${value.studios}</td>
                    <td>${value.variablesIncluded}</td>
                </tr>`
            }
        }
    })
    if(animeData===""){
        animeData = `
            <tr class="item" role="row">
                <td style="padding: 1.5em !important;" colspan="10">
                    <i class="fa fa-solid fa-file fa-xl" style="padding-right: 1ch;"></i>
                    No Data
                </td>
            </tr>
        `
    }
    //
    self.postMessage({
        animeData: animeData
    })
    function equalsNCS(str1, str2) {
        var s1 = str1 || ""
        var s2 = str2 || ""
        if(typeof s1==="number") s1 = s1.toString()
        if(typeof s2==="number") s2 = s2.toString()
        if(typeof s1==="string") s1 = s1.toLowerCase()
        if(typeof s2==="string") s2 = s2.toLowerCase()
        return s1 === s2
    }
}