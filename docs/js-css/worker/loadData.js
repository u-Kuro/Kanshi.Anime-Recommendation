self.onmessage = (message) => {
    var data = message.data
    var recList = data.recList
    var savedHiddenAnimeTitles = data.savedHiddenAnimeTitles
    var includes = data.includes
    var excludes = data.excludes
    var savedWarnR = data.savedWarnR
    var savedWarnY = data.savedWarnY
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
            // Weighted Score
            if(includes[i].toLowerCase().includes("wscore<=")){
                var score=includes[i].toLowerCase().replace("wscore<=", "")
                if(!isNaN(score)) if(recList[j].weightedScore<=parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(includes[i].toLowerCase().includes("wscore>=")){
                var score=includes[i].toLowerCase().replace("wscore>=", "")
                if(!isNaN(score)) if(recList[j].weightedScore>=parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(includes[i].toLowerCase().includes("wscore>")&&!includes[i].toLowerCase().includes("wscore>=")){
                var score=includes[i].toLowerCase().replace("wscore>", "")
                if(!isNaN(score)) if(recList[j].weightedScore>parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(includes[i].toLowerCase().includes("wscore<")&&!includes[i].toLowerCase().includes("wscore<=")){
                var score=includes[i].toLowerCase().replace("wscore<", "")
                if(!isNaN(score)) if(recList[j].weightedScore<parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            // Score
            if(includes[i].toLowerCase().includes("score<=")&&!includes[i].toLowerCase().includes("wscore<=")){
                var score=includes[i].toLowerCase().replace("score<=", "")
                if(!isNaN(score)) if(recList[j].score<=parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(includes[i].toLowerCase().includes("score>=")&&!includes[i].toLowerCase().includes("wscore>=")){
                var score=includes[i].toLowerCase().replace("score>=", "")
                if(!isNaN(score)) if(recList[j].score>=parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(includes[i].toLowerCase().includes("score>")&&!includes[i].toLowerCase().includes("score>=")&&!includes[i].toLowerCase().includes("wscore>")){
                var score=includes[i].toLowerCase().replace("score>", "")
                if(!isNaN(score)) if(recList[j].score>parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(includes[i].toLowerCase().includes("score<")&&!includes[i].toLowerCase().includes("score<=")&&!includes[i].toLowerCase().includes("wscore<")){
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
            var temp = Object.keys(recList[j].studios)
            for(let k=0; k<temp.length; k++){
                if(equalsNCS(includes[i],temp[k])){
                    tempRecScheme.push(recList[j])
                    hasValue = true
                    break
                }
            }
            if(hasValue) continue
            var temp = Object.keys(recList[j].staff)
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
            temp = Object.keys(recList[j].studios)
            for(let k=0; k<temp.length; k++){
                if(equalsNCS(excludes[i],temp[k])){
                    hasValue = true
                    break
                }
            }
            if(hasValue) continue
            temp = Object.keys(recList[j].staff)
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
            if(hasValue==false)
                tempRecScheme.push(recList[j])
        }
        recList = tempRecScheme
        tempRecScheme = []
    }
    // Show Table
    var animeData = []
    recList.forEach((value) => {
        var hasWarnR = false
        var hasWarnY = false
        var warns = []
        var score = parseFloat(value.score)
        var weightedScore = parseFloat(value.weightedScore)
        var similarities = []
        value.variablesIncluded.forEach((v)=>{
            if(isJson(v)){
                Object.entries(v).forEach(([name, url])=>{
                    similarities.push(`<a target="_blank" rel="noopener noreferrer" href=${url||"javascript:;"}>${name}</a>`)
                })
            } else {
                similarities.push(v)
            }
        })
        if(savedWarnR[value.title.toLowerCase()]!==undefined) {
            warns.push(value.title)
            hasWarnR = true
        }else if(savedWarnY[value.title.toLowerCase()]!==undefined&&hasWarnR!==true){
            warns.push(value.title)
            hasWarnY = true
        }
        if(savedWarnR[value.status.toLowerCase()]!==undefined) {
            warns.push(value.status)
            hasWarnR = true
        }else if(savedWarnY[value.status.toLowerCase()]!==undefined&&hasWarnR!==true) {
            warns.push(value.status)
            hasWarnY = true
        }
        if(savedWarnR[value.format.toLowerCase()]!==undefined){
            warns.push(value.format)
            hasWarnR = true
        } else if(savedWarnY[value.format.toLowerCase()]!==undefined&&hasWarnR!==true) {
            warns.push(value.format)
            hasWarnY = true
        }
        if(savedWarnR[`${value.year}`.toLowerCase()]!==undefined){
            warns.push(value.year)
            hasWarnR = true
        }else if(savedWarnY[`${value.year}`.toLowerCase()]!==undefined&&hasWarnR!==true) {
            warns.push(value.year)
            hasWarnY = true
        }
        if(savedWarnR[value.season.toLowerCase()]!==undefined){
            warns.push(value.season)
            hasWarnR = true
        }else if(savedWarnY[value.season.toLowerCase()]!==undefined&&hasWarnR!==true){
            warns.push(value.season)
            hasWarnY = true
        }
        var genres = value.genres.split(", ")
        genres.forEach((name)=>{
            if(savedWarnR[name.toLowerCase()]!==undefined) {
                warns.push(name)
                hasWarnR = true
            }else if(savedWarnY[name.toLowerCase()]!==undefined&&hasWarnR!==true){
                warns.push(name)
                hasWarnY = true
            }
        })
        var tags = value.tags.split(", ")
        tags.forEach((name)=>{
            if(savedWarnR[name.toLowerCase()]!==undefined) {
                warns.push(name)
                hasWarnR = true
            }else if(savedWarnY[name.toLowerCase()]!==undefined&&hasWarnR!==true){
                warns.push(name)
                hasWarnY = true
            }
        })
        var studios = []
        Object.entries(value.studios).forEach(([name,url])=>{
            studios.push(`<a target="_blank" rel="noopener noreferrer" href=${url||"javascript:;"}>${name}</a>`)
            if(savedWarnR[name.toLowerCase()]!==undefined) {
                warns.push(name)
                hasWarnR = true
            }else if(savedWarnY[name.toLowerCase()]!==undefined&&hasWarnR!==true){
                warns.push(name)
                hasWarnY = true
            }
        })
        var staff = []
        Object.entries(value.staff).forEach(([name,url])=>{
            staff.push(`<a target="_blank" rel="noopener noreferrer" href=${url||"javascript:;"}>${name}</a>`)
            if(savedWarnR[name.toLowerCase()]!==undefined) {
                warns.push(name)
                hasWarnR = true
            }else if(savedWarnY[name.toLowerCase()]!==undefined&&hasWarnR!==true){
                warns.push(name)
                hasWarnY = true
            }
        })
        var hasWarn = hasWarnR||hasWarnY
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
                    <td class="anime-score" title="${weightedScore}">
                        <div>
                            ${hasWarn?`<div title="${warns.join(", ")}"><i class="fa-solid fa-circle-exclamation ${hasWarnR?"red":hasWarnY?"orange":""}"></i></div>`:""}
                            ${weightedScore}
                        </div>
                    </td>
                    <td id="animeTitle">
                        <a target="_blank" rel="noopener noreferrer" href="${value.animeUrl||"javascript:;"}" data-value="${value.title}">${value.title}</a>
                    </td>
                    <td>`
                        animeData += similarities.length>0 ? similarities.join(", ") : "Top Similarities: N/A"
                        animeData += `
                    </td>
                    <td class="anime-score" title="${score}">${score}</td>
                    <td>${value.status}</td>
                    <td>${value.genres}</td>
                    <td>${value.tags}</td>
                    <td>${value.format}</td>
                    <td>${value.year}</td>
                    <td>${value.season}</td>
                    <td>`
                        animeData += studios.length>0 ? studios.join(", ") : "Studios: N/A"
                        animeData += `
                    </td>
                    <td>`
                        animeData += staff.length>0 ? staff.join(", ") : "Staff: N/A"
                        animeData += `
                    </td>
                </tr>`
            }
        } else {
            if(!savedHiddenAnimeTitles.includes(value.title)){
                animeData.push(`
                <tr class="item" role="row">
                    <td class="hide-anime-column">
                        <button 
                            style="margin:auto; padding: 5px 13px;" 
                            type="button" class="hide-anime" 
                            title="Hide this Anime">Hide</button>
                    </td>
                    <td class="anime-score" title="${weightedScore}">
                        <div>
                            ${hasWarn?`<div title="${warns.join(", ")}"><i class="fa-solid fa-circle-exclamation ${hasWarnR?"red":hasWarnY?"orange":""}"></i></div>`:""}
                            ${weightedScore}
                        </div>
                    </td>
                    <td id="animeTitle">
                        <a target="_blank" rel="noopener noreferrer" href="${value.animeUrl||"javascript:;"}" data-value="${value.title}">${value.title}</a>
                    </td>
                    <td>
                        ${similarities.length>0 ? similarities.join(", ") : "Similarities: N/A"}
                    </td>
                    <td class="anime-score" title="${score}">${score}</td>
                    <td>${value.status}</td>
                    <td>${value.genres}</td>
                    <td>${value.tags}</td>
                    <td>${value.format}</td>
                    <td>${value.year}</td>
                    <td>${value.season}</td>
                    <td>
                        ${studios.length>0 ? studios.join(", ") : "Studios: N/A"}
                    </td>
                    <td>
                        ${staff.length>0 ? staff.join(", ") : "Staff: N/A"}
                    </td>
                </tr>`)
            }
        }
    })
    if(!animeData.length){
        animeData = `
            <tr class="item" role="row">
                <td style="padding: 1.5em !important;" colspan="13">
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
    function isJson(data) { 
        if(data instanceof Array) {return false;}
        if(typeof data==="string") {return false;}
        try {return Object.entries(data).length>0;} 
        catch (e) {return false;}
    }
}