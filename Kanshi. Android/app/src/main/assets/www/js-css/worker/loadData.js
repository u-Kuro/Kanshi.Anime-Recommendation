self.onmessage = (message) => {
    var data = message.data
    var recScheme = data.recScheme
    var savedHiddenAnimeTitles = data.savedHiddenAnimeTitles
    var includes = data.includes
    var excludes = data.excludes
    //
    // FilterOut User Includes and Excludes
      // Include
    var tempRecScheme = []
    for(let i=0; i<includes.length; i++){
        for(let j=0; j<recScheme.length; j++){
            var hasValue = false
            if(equalsNCS(includes[i],recScheme[j].format)
            ||equalsNCS(includes[i],recScheme[j].year)
            ||equalsNCS(includes[i],recScheme[j].season)
            ||equalsNCS(includes[i],recScheme[j].status)
            ||equalsNCS(includes[i],recScheme[j].title)
            ||equalsNCS(includes[i],"hidden"))
            {
                tempRecScheme.push(recScheme[j])
                continue
            }
            // Numbers
              // Weighted Score
            if(includes[i].toLowerCase().includes("wscore<=")){
                var score=includes[i].toLowerCase().replace("wscore<=", "")
                if(!isNaN(score)) if(recScheme[j].weightedScore<=parseFloat(score)) tempRecScheme.push(recScheme[j])
                continue
            }
            if(includes[i].toLowerCase().includes("wscore>=")){
                var score=includes[i].toLowerCase().replace("wscore>=", "")
                if(!isNaN(score)) if(recScheme[j].weightedScore>=parseFloat(score)) tempRecScheme.push(recScheme[j])
                continue
            }
            if(includes[i].toLowerCase().includes("wscore>")&&!includes[i].toLowerCase().includes("wscore>=")){
                var score=includes[i].toLowerCase().replace("wscore>", "")
                if(!isNaN(score)) if(recScheme[j].weightedScore>parseFloat(score)) tempRecScheme.push(recScheme[j])
                continue
            }
            if(includes[i].toLowerCase().includes("wscore<")&&!includes[i].toLowerCase().includes("wscore<=")){
                var score=includes[i].toLowerCase().replace("wscore<", "")
                if(!isNaN(score)) if(recScheme[j].weightedScore<parseFloat(score)) tempRecScheme.push(recScheme[j])
                continue
            }
              // Score
            if(includes[i].toLowerCase().includes("score<=")&&!includes[i].toLowerCase().includes("wscore<=")){
                var score=includes[i].toLowerCase().replace("score<=", "")
                if(!isNaN(score)) if(recScheme[j].score<=parseFloat(score)) tempRecScheme.push(recScheme[j])
                continue
            }
            if(includes[i].toLowerCase().includes("score>=")&&!includes[i].toLowerCase().includes("wscore>=")){
                var score=includes[i].toLowerCase().replace("score>=", "")
                if(!isNaN(score)) if(recScheme[j].score>=parseFloat(score)) tempRecScheme.push(recScheme[j])
                continue
            }
            if(includes[i].toLowerCase().includes("score>")&&!includes[i].toLowerCase().includes("score>=")&&!includes[i].toLowerCase().includes("wscore>")){
                var score=includes[i].toLowerCase().replace("score>", "")
                if(!isNaN(score)) if(recScheme[j].score>parseFloat(score)) tempRecScheme.push(recScheme[j])
                continue
            }
            if(includes[i].toLowerCase().includes("score<")&&!includes[i].toLowerCase().includes("score<=")&&!includes[i].toLowerCase().includes("wscore<")){
                var score=includes[i].toLowerCase().replace("score<", "")
                if(!isNaN(score)) if(recScheme[j].score<parseFloat(score)) tempRecScheme.push(recScheme[j])
                continue
            }
              // Year
            if(includes[i].toLowerCase().includes("year<=")){
                var year=includes[i].toLowerCase().replace("year<=", "")
                if(!isNaN(year)) if(recScheme[j].year<=parseFloat(year)) tempRecScheme.push(recScheme[j])
                continue
            }
            if(includes[i].toLowerCase().includes("year>=")){
                var year=includes[i].toLowerCase().replace("year>=", "")
                if(!isNaN(year)) if(recScheme[j].year>=parseFloat(year)) tempRecScheme.push(recScheme[j])
                continue
            }
            if(includes[i].toLowerCase().includes("year>")&&!includes[i].toLowerCase().includes("year>=")){
                var year=includes[i].toLowerCase().replace("year>", "")
                if(!isNaN(year)) if(recScheme[j].year>parseFloat(year)) tempRecScheme.push(recScheme[j])
                continue
            }
            if(includes[i].toLowerCase().includes("year<")&&!includes[i].toLowerCase().includes("year<=")){
                var year=includes[i].toLowerCase().replace("year<", "")
                if(!isNaN(year)) if(recScheme[j].year<parseFloat(year)) tempRecScheme.push(recScheme[j])
                continue
            }
            // Arrays
            var temp = recScheme[j].studios.split(", ")
            for(let k=0; k<temp.length; k++){
                if(equalsNCS(includes[i],temp[k])){
                    tempRecScheme.push(recScheme[j])
                    hasValue = true
                    break
                }
            }
            if(hasValue) continue
            temp = recScheme[j].genres.split(", ")
            for(let k=0; k<temp.length; k++){
                if(equalsNCS(includes[i],temp[k])){
                    tempRecScheme.push(recScheme[j])
                    hasValue = true
                    break
                }
            }
            if(hasValue) continue
            temp = recScheme[j].tags.split(", ")
            for(let k=0; k<temp.length; k++){
                if(equalsNCS(includes[i],temp[k])){
                    tempRecScheme.push(recScheme[j])
                    hasValue = true
                    break
                }
            }
            if(hasValue) continue
            temp = recScheme[j].variablesIncluded.split(", ")
            for(let k=0; k<temp.length; k++){
                if(equalsNCS(includes[i],temp[k])){
                    tempRecScheme.push(recScheme[j])
                    hasValue = true
                    break
                }
            }
        }
        recScheme = tempRecScheme
        tempRecScheme = []
    }
    // Exclude
    for(let i=0; i<excludes.length; i++){
        for(let j=0; j<recScheme.length; j++){
            var hasValue = false
            if(equalsNCS(excludes[i],recScheme[j].format)
            ||equalsNCS(excludes[i],recScheme[j].year)
            ||equalsNCS(excludes[i],recScheme[j].season)
            ||equalsNCS(excludes[i],recScheme[j].title)
            ||equalsNCS(excludes[i],recScheme[j].status))
            {
                continue
            }
            temp = recScheme[j].studios.split(", ")
            for(let k=0; k<temp.length; k++){
                if(equalsNCS(excludes[i],temp[k])){
                    hasValue = true
                    break
                }
            }
            if(hasValue) continue
            temp = recScheme[j].genres.split(", ")
            for(let k=0; k<temp.length; k++){
                if(equalsNCS(excludes[i],temp[k])){
                    hasValue = true
                    break
                }
            }
            if(hasValue) continue
            temp = recScheme[j].tags.split(", ")
            for(let k=0; k<temp.length; k++){
                if(equalsNCS(excludes[i],temp[k])){
                    hasValue = true
                    break
                }
            }
            if(hasValue) continue
            temp = recScheme[j].variablesIncluded.split(", ")
            for(let k=0; k<temp.length; k++){
                if(equalsNCS(excludes[i],temp[k])){
                    hasValue = true
                    break
                }
            }
            if(hasValue==false)
                tempRecScheme.push(recScheme[j])
        }
        recScheme = tempRecScheme
        tempRecScheme = []
    }
    // Show Table
    var animeData = ""
    
    recScheme.forEach((value) => {
        var score = parseFloat(value.score)
        var weightedScore = parseFloat(value.weightedScore)
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
                    <td id="animeTitle"><a href="${value.url}">${value.title}</a></td>
                    <td class="anime-score" title="${weightedScore}">${weightedScore}</td>
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
                    <td id="animeTitle"><a href="${value.url}">${value.title}</a></td>
                    <td class="anime-score" title="${weightedScore}">${weightedScore}</td>
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