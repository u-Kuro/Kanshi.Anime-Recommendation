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
            var included = includes[i].trim().toLowerCase()
            if(included.includes("format:")){
                if(findWord(recList[j].format,included.split("format:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(included.includes("year:")){
                if(findWord(recList[j].year,included.split("year:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(included.includes("season:")){
                if(findWord(recList[j].season,included.split("season:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(included.includes("user status:")){
                if(findWord(recList[j].userStatus,included.split("user status:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(included.includes("status:")){
                if(findWord(recList[j].status,included.split("status:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(included.includes("title:")){
                if(findWord(recList[j].title,included.split("title:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(equalsNCS("hidden",included)){
                isHiddenTable = true
                tempRecScheme.push(recList[j])
                continue
            }
            // Numbers
            // Weighted Score
            if(included.includes("wscore>=")){
                var score=included.replace("wscore>=", "")
                if(!isNaN(score)) if(recList[j].weightedScore>=parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("wscore>")&&!included.includes("wscore>=")){
                var score=included.replace("wscore>", "")
                if(!isNaN(score)) if(recList[j].weightedScore>parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("wscore<=")){
                var score=included.replace("wscore<=", "")
                if(!isNaN(score)) if(recList[j].weightedScore<=parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("wscore<")&&!included.includes("wscore<=")){
                var score=included.replace("wscore<", "")
                if(!isNaN(score)) if(recList[j].weightedScore<parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            // Score
            if(included.includes("score>=")&&!included.includes("wscore>=")){
                var score=included.replace("score>=", "")
                if(!isNaN(score)) if(recList[j].score>=parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("score>")&&!included.includes("score>=")&&!included.includes("wscore>")){
                var score=included.replace("score>", "")
                if(!isNaN(score)) if(recList[j].score>parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("score<=")&&!included.includes("wscore<=")){
                var score=included.replace("score<=", "")
                if(!isNaN(score)) if(recList[j].score<=parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("score<")&&!included.includes("score<=")&&!included.includes("wscore<")){
                var score=included.replace("score<", "")
                if(!isNaN(score)) if(recList[j].score<parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            // Year
            if(included.includes("year>=")){
                var year=included.replace("year>=", "")
                if(!isNaN(year)) if(recList[j].year>=parseFloat(year)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("year>")&&!included.includes("year>=")){
                var year=included.replace("year>", "")
                if(!isNaN(year)) if(recList[j].year>parseFloat(year)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("year<=")){
                var year=included.replace("year<=", "")
                if(!isNaN(year)) if(recList[j].year<=parseFloat(year)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("year<")&&!included.includes("year<=")){
                var year=included.replace("year<", "")
                if(!isNaN(year)) if(recList[j].year<parseFloat(year)) tempRecScheme.push(recList[j])
                continue
            }
            // Arrays
            if(included.includes("studio:")){
                if(findWord(Object.keys(recList[j].studios),included.split("studio:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(included.includes("staff:")){
                if(findWord(Object.keys(recList[j].staff),included.split("staff:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(included.includes("genre:")){
                if(recList[j].genres.length){
                    if(findWord(recList[j].genres.split(", "),included.split("genre:")[1])){
                        tempRecScheme.push(recList[j])
                        continue
                    }
                }
            }
            if(included.includes("tag:")){
                if(recList[j].tags.length){
                    if(findWord(recList[j].tags.split(", "),included.split("tag:")[1])){
                        tempRecScheme.push(recList[j])
                        continue
                    }
                }
            }
        }
        recList = tempRecScheme
        tempRecScheme = []
    }
    // Exclude
    for(let i=0; i<excludes.length; i++){
        for(let j=0; j<recList.length; j++){
            var excluded = excludes[i].trim().toLowerCase()
            if(excluded.includes("format:")){
                if(findWord(recList[j].format,excluded.split("format:")[1])){
                    continue
                }
            }
            if(excluded.includes("year:")){
                if(findWord(recList[j].year,excluded.split("year:")[1])){
                    continue
                }
            }
            if(excluded.includes("season:")){
                if(findWord(recList[j].season,excluded.split("season:")[1])){
                    continue
                }
            }
            if(excluded.includes("user status:")){
                if(findWord(recList[j].userStatus,excluded.split("user status:")[1])){
                    continue
                }
            }
            if(excluded.includes("status:")){
                if(findWord(recList[j].status,excluded.split("status:")[1])){
                    continue
                }
            }
            if(excluded.includes("title:")){
                if(findWord(recList[j].title,excluded.split("title:")[1])){
                    continue
                }
            }
            // Arrays
            if(excluded.includes("studio:")){
                if(findWord(Object.keys(recList[j].studios),excluded.trim().toLowerCase().split("studio:")[1])){
                    continue
                }
            }
            if(excluded.includes("staff:")){
                if(findWord(Object.keys(recList[j].staff),excluded.split("staff:")[1])){
                    continue
                }
            }
            if(excluded.includes("genre:")){
                if(recList[j].genres.length){
                    if(findWord(recList[j].genres.split(", "),excluded.split("genre:")[1])){
                        continue
                    }
                }
            }
            if(excluded.includes("tag:")){
                if(recList[j].tags.length){
                    if(findWord(recList[j].tags.split(", "),excluded.split("tag:")[1])){
                        continue
                    }
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
        var fullTitle = "title: "+(value.title||"").trim().toLowerCase()
        if(savedWarnR[fullTitle]!==undefined) {
            warns.push(value.title)
            hasWarnR = true
        } else if(savedWarnY[fullTitle]!==undefined&&hasWarnR!==true){
            warns.push(value.title)
            hasWarnY = true
        }
        var fullStatus = "status: "+(value.status||"").trim().toLowerCase()
        if(savedWarnR[fullStatus]!==undefined) {
            warns.push(value.status)
            hasWarnR = true
        } else if(savedWarnY[fullStatus]!==undefined&&hasWarnR!==true) {
            warns.push(value.status)
            hasWarnY = true
        }
        var fullFormat = "format: "+(value.format||"").trim().toLowerCase()
        if(savedWarnR[fullFormat]!==undefined){
            warns.push(value.format)
            hasWarnR = true
        } else if(savedWarnY[fullFormat]!==undefined&&hasWarnR!==true) {
            warns.push(value.format)
            hasWarnY = true
        }
        var fullYear = "year: "+`${(value.year||"")}`.trim().toLowerCase()
        if(savedWarnR[fullYear]!==undefined){
            warns.push(value.year)
            hasWarnR = true
        } else if(savedWarnY[fullYear]!==undefined&&hasWarnR!==true) {
            warns.push(value.year)
            hasWarnY = true
        }
        var fullSeason = "season: "+(value.season||"").trim().toLowerCase()
        if(savedWarnR[fullSeason]!==undefined){
            warns.push(value.season)
            hasWarnR = true
        } else if(savedWarnY[fullSeason]!==undefined&&hasWarnR!==true){
            warns.push(value.season)
            hasWarnY = true
        }
        var genres = value.genres.length? value.genres.split(", ") : []
        genres.forEach((name)=>{
            var fullGenre = "genre: "+name.trim().toLowerCase()
            if(savedWarnR[fullGenre]!==undefined) {
                warns.push(name)
                hasWarnR = true
            }else if(savedWarnY[fullGenre]!==undefined&&hasWarnR!==true){
                warns.push(name)
                hasWarnY = true
            }
        })
        var tags = value.tags.length? value.tags.split(", ") : []
        tags.forEach((name)=>{
            var fullTag = "tag: "+name.trim().toLowerCase()
            if(savedWarnR[fullTag]!==undefined) {
                warns.push(name)
                hasWarnR = true
            }else if(savedWarnY[fullTag]!==undefined&&hasWarnR!==true){
                warns.push(name)
                hasWarnY = true
            }
        })
        var studios = []
        Object.entries(value.studios).forEach(([name,url])=>{
            studios.push(`<a class="${savedTheme}" target="_blank" rel="noopener noreferrer" href=${url||"javascript:;"}>${name}</a>`)
            var fullStudio = "studio: "+name.toLowerCase()
            if(savedWarnR[fullStudio]!==undefined) {
                warns.push(name)
                hasWarnR = true
            }else if(savedWarnY[fullStudio]!==undefined&&hasWarnR!==true){
                warns.push(name)
                hasWarnY = true
            }
        })
        var staff = []
        Object.entries(value.staff).forEach(([name,url])=>{
            staff.push(`<a class="${savedTheme}" target="_blank" rel="noopener noreferrer" href=${url||"javascript:;"}>${name}</a>`)
            var fullStaff = "staff: "+name.toLowerCase()
            if(savedWarnR[fullStaff]!==undefined) {
                warns.push(name)
                hasWarnR = true
            }else if(savedWarnY[fullStaff]!==undefined&&hasWarnR!==true){
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
            return data.some((e)=>e.trim().toLowerCase().includes(word.trim().toLowerCase()))
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