self.onmessage = (message) => {
    var data = message.data
    var recList = data.recList
    var savedHiddenAnimeIDs = data.savedHiddenAnimeIDs
    var includes = data.includes
    var excludes = data.excludes
    var savedWarnR = data.savedWarnR
    var savedWarnY = data.savedWarnY
    var savedTheme = data.savedTheme
    // FilterOut User Includes and Excludes
    // Include
    var isHiddenTable = false
    var tempRecScheme = []
    for(let i=0; i<includes.length; i++){
        for(let j=0; j<recList.length; j++){
            if(includes[i].includes("format:")){
                if(findWord(recList[j].format,includes[i].split("format:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(includes[i].includes("year:")){
                if(findWord(recList[j].year,includes[i].split("year:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(includes[i].includes("season:")){
                if(findWord(recList[j].season,includes[i].split("season:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(includes[i].includes("user status:")){
                if(findWord(recList[j].userStatus,includes[i].split("user status:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(includes[i].includes("status:")){
                if(findWord(recList[j].status,includes[i].split("status:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(includes[i].includes("title:")){
                if(findWord(recList[j].title,includes[i].split("title:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(equalsNCS("hidden",includes[i].trim())){
                isHiddenTable = true
                tempRecScheme.push(recList[j])
                continue
            }
            // Numbers
            // Weighted Score
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
            if(includes[i].toLowerCase().includes("wscore<=")){
                var score=includes[i].toLowerCase().replace("wscore<=", "")
                if(!isNaN(score)) if(recList[j].weightedScore<=parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(includes[i].toLowerCase().includes("wscore<")&&!includes[i].toLowerCase().includes("wscore<=")){
                var score=includes[i].toLowerCase().replace("wscore<", "")
                if(!isNaN(score)) if(recList[j].weightedScore<parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            // Score
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
            if(includes[i].toLowerCase().includes("score<=")&&!includes[i].toLowerCase().includes("wscore<=")){
                var score=includes[i].toLowerCase().replace("score<=", "")
                if(!isNaN(score)) if(recList[j].score<=parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(includes[i].toLowerCase().includes("score<")&&!includes[i].toLowerCase().includes("score<=")&&!includes[i].toLowerCase().includes("wscore<")){
                var score=includes[i].toLowerCase().replace("score<", "")
                if(!isNaN(score)) if(recList[j].score<parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            // Year
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
            if(includes[i].toLowerCase().includes("year<=")){
                var year=includes[i].toLowerCase().replace("year<=", "")
                if(!isNaN(year)) if(recList[j].year<=parseFloat(year)) tempRecScheme.push(recList[j])
                continue
            }
            if(includes[i].toLowerCase().includes("year<")&&!includes[i].toLowerCase().includes("year<=")){
                var year=includes[i].toLowerCase().replace("year<", "")
                if(!isNaN(year)) if(recList[j].year<parseFloat(year)) tempRecScheme.push(recList[j])
                continue
            }
            // Arrays
            if(includes[i].includes("studio:")){
                if(findWord(Object.keys(recList[j].studios),includes[i].split("studio:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(includes[i].includes("staff:")){
                if(findWord(Object.keys(recList[j].staff),includes[i].split("staff:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(includes[i].includes("genre:")){
                if(findWord(recList[j].genres.split(", "),includes[i].split("genre:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(includes[i].includes("tag:")){
                if(findWord(recList[j].tags.split(", "),includes[i].split("tag:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
        }
        recList = tempRecScheme
        tempRecScheme = []
    }
    // Exclude
    for(let i=0; i<excludes.length; i++){
        for(let j=0; j<recList.length; j++){
            if(excludes[i].includes("format:")){
                if(findWord(recList[j].format,excludes[i].trim().split("format:")[1])){
                    continue
                }
            }
            if(excludes[i].includes("year:")){
                if(findWord(recList[j].year,excludes[i].trim().split("year:")[1])){
                    continue
                }
            }
            if(excludes[i].includes("season:")){
                if(findWord(recList[j].season,excludes[i].trim().split("season:")[1])){
                    continue
                }
            }
            if(excludes[i].includes("user status:")){
                if(findWord(recList[j].userStatus,excludes[i].trim().split("user status:")[1])){
                    continue
                }
            }
            if(excludes[i].includes("status:")){
                if(findWord(recList[j].status,excludes[i].trim().split("status:")[1])){
                    continue
                }
            }
            if(excludes[i].includes("title:")){
                if(findWord(recList[j].title,excludes[i].trim().split("title:")[1])){
                    continue
                }
            }
            // Arrays
            if(excludes[i].includes("studio:")){
                if(findWord(Object.keys(recList[j].studios),includes[i].trim().split("studio:")[1])){
                    continue
                }
            }
            if(excludes[i].includes("staff:")){
                if(findWord(Object.keys(recList[j].staff),excludes[i].trim().split("staff:")[1])){
                    continue
                }
            }
            if(excludes[i].includes("genre:")){
                if(findWord(recList[j].genres.split(", "),excludes[i].trim().split("genre:")[1])){
                    continue
                }
            }
            if(excludes[i].includes("tag:")){
                if(findWord(recList[j].tags.split(", "),excludes[i].trim().split("tag:")[1])){
                    continue
                }
            }
            tempRecScheme.push(recList[j])
        }
        recList = tempRecScheme
        tempRecScheme = []
    }
    // Show Table
    var animeData = []
    recList.forEach((value) => {
        if(isHiddenTable){
            if(savedHiddenAnimeIDs[value.id]===undefined){
                return
            }
        } else {
            if(savedHiddenAnimeIDs[value.id]!==undefined){
                return
            }
        }
        var hasWarnR = false
        var hasWarnY = false
        var warns = []
        var score = parseFloat(value.score)
        var weightedScore = parseFloat(value.weightedScore)
        var similarities = []
        value.variablesIncluded.forEach((v)=>{
            if(isJson(v)){
                Object.entries(v).forEach(([name, url])=>{
                    similarities.push(`<a class="${savedTheme}" target="_blank" rel="noopener noreferrer" href=${url||"javascript:;"}>${name}</a>`)
                })
            } else {
                similarities.push(v)
            }
        })
        if(savedWarnR[value.title.toLowerCase()]!==undefined) {
            warns.push(value.title)
            hasWarnR = true
        } else if(savedWarnY[value.title.toLowerCase()]!==undefined&&hasWarnR!==true){
            warns.push(value.title)
            hasWarnY = true
        }
        if(savedWarnR[value.status.toLowerCase()]!==undefined) {
            warns.push(value.status)
            hasWarnR = true
        } else if(savedWarnY[value.status.toLowerCase()]!==undefined&&hasWarnR!==true) {
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
        } else if(savedWarnY[`${value.year}`.toLowerCase()]!==undefined&&hasWarnR!==true) {
            warns.push(value.year)
            hasWarnY = true
        }
        if(savedWarnR[value.season.toLowerCase()]!==undefined){
            warns.push(value.season)
            hasWarnR = true
        } else if(savedWarnY[value.season.toLowerCase()]!==undefined&&hasWarnR!==true){
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
            studios.push(`<a class="${savedTheme}" target="_blank" rel="noopener noreferrer" href=${url||"javascript:;"}>${name}</a>`)
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
            staff.push(`<a class="${savedTheme}" target="_blank" rel="noopener noreferrer" href=${url||"javascript:;"}>${name}</a>`)
            if(savedWarnR[name.toLowerCase()]!==undefined) {
                warns.push(name)
                hasWarnR = true
            }else if(savedWarnY[name.toLowerCase()]!==undefined&&hasWarnR!==true){
                warns.push(name)
                hasWarnY = true
            }
        })
        var hasWarn = hasWarnR||hasWarnY
        if(isHiddenTable){
            animeData += `
            <tr class="item ${savedTheme}" role="row" style="height:65px;">
                <td class="hide-anime-column ${savedTheme}">
                    <button
                        class="show-anime ${savedTheme}"
                        style="margin:auto; padding: 5px 13px;" 
                        type="button" 
                        title="Hide this Anime">Show</button>
                </td>
                <td class="anime-score ${savedTheme}" title="${weightedScore||0}">
                    <div>
                        ${hasWarn?`<div title="${warns.join(', ')}"><i class="${savedTheme} fa-solid fa-circle-exclamation ${hasWarnR?'red':hasWarnY?'orange':''}"></i></div>`:''}
                        ${weightedScore||0}
                    </div>
                </td>
                <td class="animeTitle ${savedTheme}">
                    <a class="${savedTheme}" target="_blank" rel="noopener noreferrer" href="${value.animeUrl||'javascript:;'}" data-value="${value.id||''}">${value.title||'Title: N/A'}</a>
                </td>
                <td class="${savedTheme}">`
                    animeData += similarities.length>0 ? similarities.join(', ') : 'Top Similarities: N/A'
                    animeData += `
                </td>
                <td class="anime-score ${savedTheme}" title="${score||0}">${score||0}</td>
                <td class="${savedTheme}">${value.userStatus||'User Status: N/A'}</td>
                <td class="${savedTheme}">${value.status||'Status: N/A'}</td>
                <td class="${savedTheme}">${value.genres||'Genres: N/A'}</td>
                <td class="${savedTheme}">${value.tags||'Tags: N/A'}</td>
                <td class="${savedTheme}">${value.format||'Format: N/A'}</td>
                <td class="${savedTheme}">${value.year||'Year: N/A'}</td>
                <td class="${savedTheme}">${value.season||'Season: N/A'}</td>
                <td class="${savedTheme}">`
                    animeData += studios.length>0 ? studios.join(', ') : 'Studios: N/A'
                    animeData += `
                </td>
                <td class="${savedTheme}">`
                    animeData += staff.length>0 ? staff.join(', ') : 'Staff: N/A'
                    animeData += `
                </td>
            </tr>`
        } else {
            animeData.push(`
            <tr class="item ${savedTheme}" role="row">
                <td class="hide-anime-column ${savedTheme}">
                    <button
                        class="hide-anime ${savedTheme}"
                        style="margin:auto; padding: 5px 13px;" 
                        type="button" 
                        title="Hide this Anime">Hide</button>
                </td>
                <td class="anime-score ${savedTheme}" title="${weightedScore||0}">
                    <div>
                        ${hasWarn?`<div title="${warns.join(', ')}"><i class="fa-solid fa-circle-exclamation ${hasWarnR?'red':hasWarnY?'orange':''}"></i></div>`:''}
                        ${weightedScore||0}
                    </div>
                </td>
                <td class="animeTitle ${savedTheme}">
                    <a class="${savedTheme}" target="_blank" rel="noopener noreferrer" href="${value.animeUrl||'javascript:;'}" data-value="${value.id||''}">${value.title||'Title: N/A'}</a>
                </td>
                <td class="${savedTheme}">
                    ${similarities.length>0 ? similarities.join(', ') : 'Similarities: N/A'}
                </td>
                <td class="anime-score ${savedTheme}" title="${score||0}">${score||0}</td>
                <td class="${savedTheme}">${value.userStatus||'User Status: N/A'}</td>
                <td class="${savedTheme}">${value.status||'Status: N/A'}</td>
                <td class="${savedTheme}">${value.genres||'Genres: N/A'}</td>
                <td class="${savedTheme}">${value.tags||'Tags: N/A'}</td>
                <td class="${savedTheme}">${value.format||'Format: N/A'}</td>
                <td class="${savedTheme}">${value.year||'Year: N/A'}</td>
                <td class="${savedTheme}">${value.season||'Season: N/A'}</td>
                <td class="${savedTheme}">
                    ${studios.length>0 ? studios.join(', ') : 'Studios: N/A'}
                </td>
                <td class="${savedTheme}">
                    ${staff.length>0 ? staff.join(', ') : 'Staff: N/A'}
                </td>
            </tr>`)
        }
    })
    if(!animeData.length){
        animeData = `
            <tr class="${savedTheme} item" role="row">
                <td class="${savedTheme}" style="padding: 1.5em !important;" colspan="14">
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
    function findWord(data, word){
        if(typeof data==="string"){
            return data.toLowerCase().includes(word.trim().toLowerCase())
        } else if(Array.isArray(data)){
            return data.some((e)=>e.trim().toLowerCase()===word.trim().toLowerCase())
        }
    }
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