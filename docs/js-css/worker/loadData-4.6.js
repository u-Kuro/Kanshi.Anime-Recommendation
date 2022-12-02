self.onmessage = (message) => {
    var data = message.data
    var recList = data.recList || []
    var savedHiddenAnimeIDs = data.savedHiddenAnimeIDs
    var includes = data.includes || []
    var excludes = data.excludes || []
    var savedWarnR = data.savedWarnR
    var savedWarnY = data.savedWarnY
    var savedTheme = data.savedTheme
    var minTopSimilarities = 5
    // FilterOut User Includes and Excludes
    // Include
    var isHiddenTable = false
    var tempRecScheme = []
    for(let i=0; i<includes.length; i++){
        if(typeof includes[i]!=="string") continue
        var included = includes[i].trim().toLowerCase()
        if(included.includes("limit top similarities:")){
            var tempMinTopSim = included.split("limit top similarities:")[1].trim().toLowerCase()
            if(isaN(tempMinTopSim)){
                minTopSimilarities = parseFloat(tempMinTopSim)
            }
            if(includes.length>1){
                continue
            } else{
                break
            }
        }
        var noType = !included.includes(":")
        for(let j=0; j<recList.length; j++){
            if(included.includes("format:")){
                if(findWord(recList[j]?.format,included.split("format:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(included.includes("year:")){
                if(findWord(recList[j]?.year,included.split("year:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(included.includes("season:")){
                if(findWord(recList[j]?.season,included.split("season:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(included.includes("user status:")){
                if(findWord(recList[j]?.userStatus,included.split("user status:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(included.includes("status:")){
                if(findWord(recList[j]?.status,included.split("status:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(included.includes("title:")){
                if(findWord(recList[j]?.title,included.split("title:")[1])){
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
                if(isaN(score)) if(recList[j]?.weightedScore>=parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("wscore>")&&!included.includes("wscore>=")){
                var score=included.replace("wscore>", "")
                if(isaN(score)) if(recList[j]?.weightedScore>parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("wscore<=")){
                var score=included.replace("wscore<=", "")
                if(isaN(score)) if(recList[j]?.weightedScore<=parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("wscore<")&&!included.includes("wscore<=")){
                var score=included.replace("wscore<", "")
                if(isaN(score)) if(recList[j]?.weightedScore<parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            // User Score
            if(included.includes("userscore>=")){
                var userScore=included.replace("userscore>=", "")
                if(isaN(userScore)) if(recList[j]?.userScore>=parseFloat(userScore)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("userscore>")&&!included.includes("userscore>=")){
                var userScore=included.replace("userScore>", "")
                if(isaN(userScore)) if(recList[j]?.userScore>parseFloat(userScore)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("userscore<=")){
                var userScore=included.replace("userscore<=", "")
                if(isaN(userScore)) if(recList[j]?.userScore<=parseFloat(userScore)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("userscore<")&&!included.includes("userscore<=")){
                var userScore=included.replace("userscore<", "")
                if(isaN(userScore)) if(recList[j]?.userScore<parseFloat(userScore)) tempRecScheme.push(recList[j])
                continue
            }
            // Average Score
            if(included.includes("averagescore>=")){
                var averageScore=included.replace("averagescore>=", "")
                if(isaN(averageScore)) if(recList[j]?.averageScore>=parseFloat(averageScore)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("averagescore>")&&!included.includes("averageScore>=")){
                var averageScore=included.replace("averagescore>", "")
                if(isaN(averageScore)) if(recList[j]?.averageScore>parseFloat(averageScore)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("averagescore<=")){
                var averageScore=included.replace("averagescore<=", "")
                if(isaN(averageScore)) if(recList[j]?.averageScore<=parseFloat(averageScore)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("averagescore<")&&!included.includes("averageScore<=")){
                var averageScore=included.replace("averagescore<", "")
                if(isaN(averageScore)) if(recList[j]?.averageScore<parseFloat(averageScore)) tempRecScheme.push(recList[j])
                continue
            }
            // Score
            if(included.includes("score>=")&&!included.includes("wscore>=")){
                var score=included.replace("score>=", "")
                if(isaN(score)) if(recList[j]?.score>=parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("score>")&&!included.includes("score>=")&&!included.includes("wscore>")){
                var score=included.replace("score>", "")
                if(isaN(score)) if(recList[j]?.score>parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("score<=")&&!included.includes("wscore<=")){
                var score=included.replace("score<=", "")
                if(isaN(score)) if(recList[j]?.score<=parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("score<")&&!included.includes("score<=")&&!included.includes("wscore<")){
                var score=included.replace("score<", "")
                if(isaN(score)) if(recList[j]?.score<parseFloat(score)) tempRecScheme.push(recList[j])
                continue
            }
            // Popularity
            if(included.includes("popularity>=")){
                var popularity=included.replace("popularity>=", "")
                if(isaN(popularity)) if(recList[j]?.popularity>=parseFloat(popularity)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("popularity>")&&!included.includes("popularity>=")){
                var popularity=included.replace("popularity>", "")
                if(isaN(popularity)) if(recList[j]?.popularity>parseFloat(popularity)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("popularity<=")){
                var popularity=included.replace("popularity<=", "")
                if(isaN(popularity)) if(recList[j]?.popularity<=parseFloat(popularity)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("popularity<")&&!included.includes("popularity<=")){
                var popularity=included.replace("popularity<", "")
                if(isaN(popularity)) if(recList[j]?.popularity<parseFloat(popularity)) tempRecScheme.push(recList[j])
                continue
            }
            // Year
            if(included.includes("year>=")){
                var year=included.replace("year>=", "")
                if(isaN(year)) if(recList[j]?.year>=parseFloat(year)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("year>")&&!included.includes("year>=")){
                var year=included.replace("year>", "")
                if(isaN(year)) if(recList[j]?.year>parseFloat(year)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("year<=")){
                var year=included.replace("year<=", "")
                if(isaN(year)) if(recList[j]?.year<=parseFloat(year)) tempRecScheme.push(recList[j])
                continue
            }
            if(included.includes("year<")&&!included.includes("year<=")){
                var year=included.replace("year<", "")
                if(!isNaN(year)) if(recList[j]?.year<parseFloat(year)) tempRecScheme.push(recList[j])
                continue
            }
            // JSON
            if(included.includes("studio:")){
                if(findWord(Object.keys(recList[j]?.studios||{}),included.split("studio:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(included.includes("staff:")){
                if(findWord(Object.keys(recList[j]?.staff||{}),included.split("staff:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            // Arrays
            if(included.includes("genre:")){
                if(findWord(recList[j]?.genres,included.split("genre:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(included.includes("tag:")){
                if(findWord(recList[j]?.tags,included.split("tag:")[1])){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(noType){
                if(
                    findWord(recList[j]?.format,included)
                    ||findWord(recList[j]?.year,included)
                    ||findWord(recList[j]?.season,included)
                    ||findWord(recList[j]?.userStatus,included)
                    ||findWord(recList[j]?.status,included)
                    ||findWord(recList[j]?.title,included)
                    ||findWord(Object.keys(recList[j]?.studios||{}),included)
                    ||findWord(Object.keys(recList[j]?.staff||{}),included)
                ){
                    tempRecScheme.push(recList[j])
                    continue
                } 
                var genres = recList[j]?.genres
                var tags = recList[j]?.tags
                if(typeof genres==="string"||genres instanceof Array){
                    if(findWord(genres,included)){
                        tempRecScheme.push(recList[j])
                        continue
                    }
                }
                if(typeof tags==="string"||tags instanceof Array){
                    if(findWord(tags,included)){
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
        if(typeof excludes[i]!=="string") continue
        var excluded = excludes[i].trim().toLowerCase()
        var noType = !excluded.includes(":")
        for(let j=0; j<recList.length; j++){
            if(excluded.includes("format:")){
                if(findWord(recList[j]?.format,excluded.split("format:")[1])){
                    continue
                }
            }
            if(excluded.includes("year:")){
                if(findWord(recList[j]?.year,excluded.split("year:")[1])){
                    continue
                }
            }
            if(excluded.includes("season:")){
                if(findWord(recList[j]?.season,excluded.split("season:")[1])){
                    continue
                }
            }
            if(excluded.includes("user status:")){
                if(findWord(recList[j]?.userStatus,excluded.split("user status:")[1])){
                    continue
                }
            }
            if(excluded.includes("status:")){
                if(findWord(recList[j]?.status,excluded.split("status:")[1])){
                    continue
                }
            }
            if(excluded.includes("title:")){
                if(findWord(recList[j]?.title,excluded.split("title:")[1])){
                    continue
                }
            }
            // JSON
            if(excluded.includes("studio:")){
                if(findWord(Object.keys(recList[j]?.studios||{}),excluded.trim().toLowerCase().split("studio:")[1])){
                    continue
                }
            }
            if(excluded.includes("staff:")){
                if(findWord(Object.keys(recList[j]?.staffs||{}),excluded.split("staff:")[1])){
                    continue
                }
            }
            // Arrays
            if(excluded.includes("genre:")){
                if(findWord(recList[j]?.genres,excluded.split("genre:")[1])){
                    continue
                }
            }
            if(excluded.includes("tag:")){
                if(findWord(recList[j]?.tags,excluded.split("tag:")[1])){
                    continue
                }
            }
            if(noType){
                if(
                    findWord(recList[j]?.format,excluded)
                    ||findWord(recList[j]?.year,excluded)
                    ||findWord(recList[j]?.season,excluded)
                    ||findWord(recList[j]?.userStatus,excluded)
                    ||findWord(recList[j]?.status,excluded)
                    ||findWord(recList[j]?.title,excluded)
                    ||findWord(Object.keys(recList[j]?.studios||{}),excluded)
                    ||findWord(Object.keys(recList[j]?.staff||{}),excluded)
                ){
                    continue
                } 
                var genres = recList[j]?.genres
                var tags = recList[j]?.tags
                if(typeof genres==="string"||genres instanceof Array){
                    if(findWord(genres,included)){
                        continue
                    }
                }
                if(typeof tags==="string"||tags instanceof Array){
                    if(findWord(tags,included)){
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
            if(!savedHiddenAnimeIDs[value?.id]){
                return
            }
        } else {
            if(savedHiddenAnimeIDs[value?.id]){
                return
            }
        }
        var hasWarnR = false
        var hasWarnY = false
        var warns = []
        var score = parseFloat(value?.score)
        var weightedScore = parseFloat(value?.weightedScore)
        var userScore = parseFloat(value?.userScore)
        var averageScore = parseFloat(value?.averageScore)
        var popularity = parseInt(value?.popularity)
        var similarities = []
        value?.variablesIncluded?.forEach((v)=>{
            if(isJson(v)){
                Object.entries(v).forEach(([name, url])=>{
                    similarities.push(`<a class="${savedTheme}" target="_blank" rel="noopener noreferrer" href=${url||"javascript:;"}>${name}</a>`)
                })
            } else {
                similarities.push(v)
            }
        })
        similarities = similarities.splice(0,minTopSimilarities)
        // Content Warns
        var genres = value?.genres || []
        if(typeof genres==="string"){
            genres = genres.split(", ")
        }
        genres.forEach((name)=>{
            var valGenre = name.trim().toLowerCase()
            var fullGenre = "genre: "+valGenre
            if(savedWarnR[fullGenre]||savedWarnR[valGenre]) {
                warns.push(name)
                hasWarnR = true
            } else if((savedWarnY[fullGenre]||savedWarnY[valGenre])&&!hasWarnR){
                warns.push(name)
                hasWarnY = true
            }
        })
        var tags = value?.tags || []
        if(typeof tags==="string"){
            tags = tags.split(", ")
        }
        tags.forEach((name)=>{
            var valTag = name.trim().toLowerCase()
            var fullTag = "tag: "+valTag
            if(savedWarnR[fullTag]||savedWarnR[valTag]) {
                warns.push(name)
                hasWarnR = true
            } else if((savedWarnY[fullTag]||savedWarnY[valTag])&&!hasWarnR){
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
                    <a class="${savedTheme}" target="_blank" rel="noopener noreferrer" href="${value?.animeUrl||'javascript:;'}" data-value="${value?.id||''}">${value?.title||'Title: N/A'}</a>
                </td>
                <td class="${savedTheme}">`
                    animeData += similarities.length>0 ? similarities.join(', ') : 'Top Similarities: N/A'
                    animeData += `
                </td>
                <td class="anime-score ${savedTheme}" title="${score||0}">${score||0}</td>
                <td class="anime-score ${savedTheme}" title="${userScore||0}">${userScore||0}</td>
                <td class="anime-score ${savedTheme}" title="${averageScore||0}">${averageScore||0}</td>
                <td class="anime-score ${savedTheme}" title="${popularity||0}">${popularity||0}</td>
                <td class="${savedTheme}">${value?.userStatus||'User Status: N/A'}</td>
                <td class="${savedTheme}">${value?.status||'Status: N/A'}</td>
                <td class="${savedTheme}">${value?.format||'Format: N/A'}</td>
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
                    <a class="${savedTheme}" target="_blank" rel="noopener noreferrer" href="${value?.animeUrl||'javascript:;'}" data-value="${value?.id||''}">${value?.title||'Title: N/A'}</a>
                </td>
                <td class="${savedTheme}">
                    ${similarities.length>0 ? similarities.join(', ') : 'Similarities: N/A'}
                </td>
                <td class="anime-score ${savedTheme}" title="${score||0}">${score||0}</td>
                <td class="anime-score ${savedTheme}" title="${userScore||0}">${userScore||0}</td>
                <td class="anime-score ${savedTheme}" title="${averageScore||0}">${averageScore||0}</td>
                <td class="anime-score ${savedTheme}" title="${popularity||0}">${popularity||0}</td>
                <td class="${savedTheme}">${value?.userStatus||'User Status: N/A'}</td>
                <td class="${savedTheme}">${value?.status||'Status: N/A'}</td>
                <td class="${savedTheme}">${value?.format||'Format: N/A'}</td>
            </tr>`)
        }
    })
    if(!animeData.length){
        animeData = `
            <tr class="${savedTheme} item" role="row">
                <td class="${savedTheme}" style="padding: 1.5em !important;" colspan="11">
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
        } else {
            return false
        }
    }
    function equalsNCS(str1, str2) {
        var s1 = str1 || ""
        var s2 = str2 || ""
        if(typeof s1==="number") s1 = s1.toString()
        if(typeof s2==="number") s2 = s2.toString()
        if(typeof s1==="string") s1 = s1.trim().toLowerCase()
        if(typeof s2==="string") s2 = s2.trim().toLowerCase()
        return s1 === s2
    }
    function isaN(num){
        if(!num&&num!==0){return false}
        else if(typeof num==='string'){return num.split(' ').join('').length}
        else if(typeof num==='boolean'){return false}
        return !isNaN(num)
    }
    function isJson(data) { 
        if(data instanceof Array) {return false;}
        if(typeof data==="string") {return false;}
        try {return Object.entries(data).length>0;} 
        catch (e) {return false;}
    }
}