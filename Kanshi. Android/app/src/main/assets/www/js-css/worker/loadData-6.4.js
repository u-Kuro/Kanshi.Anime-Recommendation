self.onmessage = (message) => {
    var data = message.data
    var recList = data.recList || []
    var savedHiddenAnimeIDs = data.savedHiddenAnimeIDs
    var savedTheme = data.savedTheme
    var kidsAnimeIsHidden = data.kidsAnimeIsHidden?? true
    var savedFilters = data.savedFilters??[]
    var savedWarnAnime = data.savedWarnAnime??[]
    const availableFilterTypes = {topscore:true,topscores:true,limittopscore:true,limittopscores:true,topwscore:true,limittopwscores:true,limittopwscore:true,topwscores:true,format:true,formats:true,genre:true,genres:true,tagcategory:true,tagcategories:true,tag:true,tags:true,studio:true,studios:true,staffrole:true,staffroles:true,staff:true,staffs:true,measure:true,measures:true,average:true,averages:true,includeunknownvariables:true,unknownvariables:true,unknownvariable:true,includeunknown:true,unknown:true,samplesizes:true,samplesize:true,samples:true,sample:true,size:true,minimumpopularity:true,minpopularity:true,popularity:true,minimumaveragescores:true,minimumaveragescore:true,minimumaverages:true,minimumaverage:true,minimumscores:true,minimumscore:true,averagescores:true,averagescore:true,scores:true,score:true,minaveragescores:true,minaveragescore:true,minaverages:true,minaverage:true,minscores:true,minscore:true,minimumavescores:true,minimumavescore:true,minimumave:true,avescores:true,avescore:true,limittopsimilarity:true,limittopsimilarities:true,limitsimilarity:true,limitsimilarities:true,topsimilarities:true,topsimilarity:true,similarities:true,similarity:true,userscore:true,userscores:true,wscore:true,wscores:true,year:true,years:true,season:true,seasons:true,userstatus:true,status:true,title:true,titles:true}
    var minTopSimilarities = 5
    // Arrange Filters
      // Table/List Filters
    var filters = []
    var includes = []
    var excludes = kidsAnimeIsHidden? ["tag: kids"] : []
    var filterName;
    for(let i=0; i<savedFilters.length; i++){
        filterName = savedFilters[i].trim().toLowerCase()
        filters.push(filterName)
        if(filterName.charAt(0)==="!") {
            filterName = filterName.slice(1)
            filterName = typeof filterName==="string"? filterName.split(":") : []
            if(filterName.length>1){
                filterName = [filterName.shift(),filterName.join()]
                var type = filterName[0]
                var cinfo = filterName[1].trim().toLowerCase()
                if(cinfo.charAt(0)==="!"){
                    cinfo = cinfo.slice(1)
                    excludes.push(type+":"+cinfo)
                } else {
                    excludes.push(type+":"+cinfo)
                }
            } else if(filterName.length===1){
                excludes.push(filterName[0])
            }
        }
        else includes.push(filterName)
    }
      // Content Warnings
    var savedWarnR = []
    var savedWarnY = []
    for(let i=0; i<savedWarnAnime.length; i++){
        var warnName = savedWarnAnime[i].trim().toLowerCase()
        if(warnName.charAt(0)==="!") {
            warnName = warnName.slice(1)
            warnName = typeof warnName==="string"? warnName.split(":") : []
            if(warnName.length>1){
                warnName = [warnName.shift(),warnName.join()]
                var type = warnName[0]
                var cinfo = warnName[1].trim().toLowerCase()
                if(cinfo.charAt(0)==="!"){
                    cinfo = cinfo.slice(1)
                    savedWarnR.push(type+": "+cinfo)
                } else {
                    savedWarnR.push(type+": "+cinfo)
                }
            } else if(warnName.length===1){
                savedWarnR.push(warnName)
            }
        }
        else savedWarnY.push(warnName)
    }
    // FilterOut User Includes and Excludes
      // Note: Order of Sequence is Important Here 
    // Include
    // For other Filters
    var isHiddenTable = false
    var tempRecScheme = []
    for(let i=0; i<includes.length; i++){
        if(typeof includes[i]!=="string") continue
        // Get the type, seperator, and filter
        var included = includes[i].trim().toLowerCase().split(/(:|>=|<=|>|<)/)
        if(included.length>2&&availableFilterTypes[included[0].replace(/\s|-|_/g,"")]){
            included = [included.shift(),included.shift(),included.join("").trim()]
        } else {
            included = included.shift()
        }
        var type, filter, seperator
        if(typeof included==="string"){  
            type = ""
            seperator = null
            filter = included.trim()
        } else {
            type = included[0].replace(/\s|-|_/g,"")
            seperator = included[1]?.trim()??null
            filter = (included[2]??type).trim()
        }
        if(type===("limittopwscores")
         ||type===("limittopwscore")
         ||type===("topwscores")
         ||type===("topwscore")){
                continue
            }
        if(type===("limittopscores")
         ||type===("limittopscore")
         ||type===("topscores")
         ||type===("topscore")){
            continue
        }
        if((type===("limittopsimilarity")
          ||type===("limittopsimilarities")
          ||type===("limitsimilarity")
          ||type===("limitsimilarities")
          ||type===("topsimilarities")
          ||type===("topsimilarity")
          ||type===("similarities")
          ||type===("similarity")
          )&&seperator===":"){
            if(isaN(filter)){
                minTopSimilarities = parseFloat(filter)
            }
            continue
        }
        if(equalsNCS("hidden",filter)){
            isHiddenTable = true
            continue
        }
        for(let j=0; j<recList.length; j++){
            // Numbers
            if((type===("averagescore")||type===("averagescores"))){
                if(seperator===">="){
                    if(isaN(filter)) if(recList[j]?.averageScore>=parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator==="<="){
                    if(isaN(filter)) if(recList[j]?.averageScore<=parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator===">"){
                    if(isaN(filter)) if(recList[j]?.averageScore>parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator==="<"){
                    if(isaN(filter)) if(recList[j]?.averageScore<parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator===":"){
                    if(isaN(filter)) if(recList[j]?.averageScore===parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
            }
            if((type===("userscore")||type===("userscores"))){
                if(seperator===">="){
                    if(isaN(filter)) if(recList[j]?.userScore>=parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator==="<="){
                    if(isaN(filter)) if(recList[j]?.userScore<=parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator===">"){
                    if(isaN(filter)) if(recList[j]?.userScore>parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator==="<"){
                    if(isaN(filter)) if(recList[j]?.userScore<parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator===":"){
                    if(isaN(filter)) if(recList[j]?.userScore===parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(type===("wscore")||type===("wscores")){
                if(seperator===">="){
                    if(isaN(filter)) if(recList[j]?.weightedScore>=parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator==="<="){
                    if(isaN(filter)) if(recList[j]?.weightedScore<=parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator===">"){
                    if(isaN(filter)) if(recList[j]?.weightedScore>parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator==="<"){
                    if(isaN(filter)) if(recList[j]?.weightedScore<parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator===":"){
                    if(isaN(filter)) if(recList[j]?.weightedScore===parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
            }
            // Score
            if((type===("score")||type===("scores"))){
                if(seperator===">="){
                    if(isaN(filter)) if(recList[j]?.score>=parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator==="<="){
                    if(isaN(filter)) if(recList[j]?.score>parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator===">"){
                    if(isaN(filter)) if(recList[j]?.score<=parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator==="<"){
                    if(isaN(filter)) if(recList[j]?.score<parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator===":"){
                    if(isaN(filter)) if(recList[j]?.score===parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
            }
            // Popularity
            if(type===("popularity")){
                if(seperator===">="){
                    if(isaN(filter)) if(recList[j]?.popularity>=parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator==="<="){
                    if(isaN(filter)) if(recList[j]?.popularity<=parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator===">"){
                    if(isaN(filter)) if(recList[j]?.popularity>parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator==="<"){
                    if(isaN(filter)) if(recList[j]?.popularity<parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator===":"){
                    if(isaN(filter)) if(recList[j]?.popularity===parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }    
            }
            // Year
            if(type===("year")||type===("years")){
                if(seperator===">="){
                    if(isaN(filter)) if(recList[j]?.year>=parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator==="<="){
                    if(isaN(filter)) if(recList[j]?.year<=parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator===">"){
                    if(isaN(filter)) if(recList[j]?.year>parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator==="<"){
                    if(!isNaN(filter)) if(recList[j]?.year<parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
                if(seperator===":"){
                    if(isaN(filter)) if(recList[j]?.year===parseFloat(filter)) tempRecScheme.push(recList[j])
                    continue
                }
            }
            // Categories
            if((type===("format")||type===("formats"))&&seperator===":"){
                if(findWord(recList[j]?.format,filter)){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if((type===("season")||type===("seasons"))&&seperator===":"){
                if(findWord(recList[j]?.season,filter)){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(type===("userstatus")&&seperator===":"){
                if(findWord(recList[j]?.userStatus,filter)){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if(type===("status")&&seperator===":"){
                if(findWord(recList[j]?.status,filter)){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if((type===("title")||type===("titles"))&&seperator===":"){
                if(findWord(recList[j]?.title,filter)){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if((type===("studio")||type===("studios"))&&seperator===":"){
                if(findWord(Object.keys(recList[j]?.studios||{}),filter)){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if((type===("staff")||type===("staffs"))&&seperator===":"){
                if(findWord(Object.keys(recList[j]?.staff||{}),filter)){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if((type===("genre")||type===("genres"))&&seperator===":"){
                if(findWord(recList[j]?.genres,filter)){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            if((type===("tag")||type===("tags"))&&seperator===":"){
                if(findWord(recList[j]?.tags,filter)){
                    tempRecScheme.push(recList[j])
                    continue
                }
            }
            // One Word
            if(!seperator){
                if(
                    findWord(recList[j]?.format,filter)
                    ||findWord(recList[j]?.year,filter)
                    ||findWord(recList[j]?.season,filter)
                    ||findWord(recList[j]?.userStatus,filter)
                    ||findWord(recList[j]?.status,filter)
                    ||findWord(recList[j]?.title,filter)
                    ||findWord(Object.keys(recList[j]?.studios||{}),filter)
                    ||findWord(Object.keys(recList[j]?.staff||{}),filter)
                ){
                    tempRecScheme.push(recList[j])
                    continue
                } 
                var genres = recList[j]?.genres
                var tags = recList[j]?.tags
                if(typeof genres==="string"||genres instanceof Array){
                    if(findWord(genres,filter)){
                        tempRecScheme.push(recList[j])
                        continue
                    }
                }
                if(typeof tags==="string"||tags instanceof Array){
                    if(findWord(tags,filter)){
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
        // Get the type, seperator, and filter
        var excluded = excludes[i].trim().toLowerCase().split(/(:|>=|<=|>|<)/)
        if(excluded.length>2&&availableFilterTypes[excluded[0].replace(/\s|-|_/g,"")]){
            excluded = [excluded.shift(),excluded.shift(),excluded.join("").trim()]
        } else {
            excluded = excluded.shift()
        }
        var type, filter, seperator
        if(typeof excluded==="string"){
            type = ""
            seperator = null
            filter = excluded.trim()
        } else {
            type = excluded[0].replace(/\s|-|_/g,"")
            seperator = excluded[1]?.trim()??null
            filter = (excluded[2]??type).trim()
        }
        for(let j=0; j<recList.length; j++){
            if((type===("averagescore")||type===("averagescores"))&&seperator===":"){
                if(isaN(filter)) if(recList[j]?.averageScore===parseFloat(filter)) continue
            }
            if((type===("userscore")||type===("userscores"))&&seperator===":"){
                if(isaN(filter)) if(recList[j]?.userScore===parseFloat(filter)) continue
            }
            if((type===("wscore")||type===("wscores"))&&seperator===":"){
                if(isaN(filter)) if(recList[j]?.weightedScore===parseFloat(filter)) continue
            }
            if((type===("score")||type===("scores"))&&seperator===":"){
                if(isaN(filter)) if(recList[j]?.score===parseFloat(filter)) continue
            }
            if(type===("popularity")&&seperator===":"){
                if(isaN(filter)) if(recList[j]?.popularity===parseFloat(filter)) continue
            }
            if((type===("year")||type===("years"))&&seperator===":"){
                if(isaN(filter)) if(recList[j]?.year===parseFloat(filter)) continue
            }
            // Categories
            if((type===("format")||type===("formats"))&&seperator===":"){
                if(findWord(recList[j]?.format,filter)){
                    continue
                }
            }
            if((type===("season")||type===("seasons"))&&seperator===":"){
                if(findWord(recList[j]?.season,filter)){
                    continue
                }
            }
            if(type===("userstatus")&&seperator===":"){
                if(findWord(recList[j]?.userStatus,filter)){
                    continue
                }
            }
            if(type===("status")&&seperator===":"){
                if(findWord(recList[j]?.status,filter)){
                    continue
                }
            }
            if((type===("title")||type===("titles"))&&seperator===":"){
                if(findWord(recList[j]?.title,filter)){
                    continue
                }
            }
            if((type===("studio")||type===("studios"))&&seperator===":"){
                if(findWord(Object.keys(recList[j]?.studios||{}),filter)){
                    continue
                }
            }
            if((type===("staff")||type===("staffs"))&&seperator===":"){
                if(findWord(Object.keys(recList[j]?.staff||{}),filter)){
                    continue
                }
            }
            if((type===("genre")||type===("genres"))&&seperator===":"){
                if(findWord(recList[j]?.genres,filter)){
                    continue
                }
            }
            if((type===("tag")||type===("tags"))&&seperator===":"){
                if(findWord(recList[j]?.tags,filter)){
                    continue
                }
            }
            // One Word
            if(!seperator){
                if(
                    findWord(recList[j]?.format,filter)
                    ||findWord(recList[j]?.year,filter)
                    ||findWord(recList[j]?.season,filter)
                    ||findWord(recList[j]?.userStatus,filter)
                    ||findWord(recList[j]?.status,filter)
                    ||findWord(recList[j]?.title,filter)
                    ||findWord(Object.keys(recList[j]?.studios||{}),filter)
                    ||findWord(Object.keys(recList[j]?.staff||{}),filter)
                ){
                    continue
                } 
                var genres = recList[j]?.genres
                var tags = recList[j]?.tags
                if(typeof genres==="string"||genres instanceof Array){
                    if(findWord(genres,filter)){
                        continue
                    }
                }
                if(typeof tags==="string"||tags instanceof Array){
                    if(findWord(tags,filter)){
                        continue
                    }
                }
            }
            // else add Anime if it doesn't have any excluded content
            tempRecScheme.push(recList[j])
        }
        recList = tempRecScheme
        tempRecScheme = []
    }

    // Filter for Limiting Items In List
    for(let i=0; i<includes.length; i++){
        if(typeof includes[i]!=="string") continue
        // Get the type, seperator, and filter
        var included = includes[i].trim().toLowerCase().split(/(:|>=|<=|>|<)/)
        if(included.length>2&&availableFilterTypes[included[0].replace(/\s|-|_/g,"")]){
            included = [included.shift(),included.shift(),included.join("").trim()]
        } else {
            included = included.shift()
        }
        var type, filter, seperator
        if(typeof included==="string"){  
            type = ""
            seperator = null
            filter = included.trim()
        } else {
            type = included[0].replace(/\s|-|_/g,"")
            seperator = included[1]?.trim()??null
            filter = (included[2]??type).trim()
        }
        if(seperator===":"&&isaN(filter)&&recList instanceof Array){
            if(type===("limittopwscores")
             ||type===("limittopwscore")
             ||type===("topwscores")
             ||type===("topwscore")){
                recList = recList.sort((a,b)=>parseFloat(b?.weightedScore??0)-parseFloat(a?.weightedScore??0))
                    .filter((e)=>isHiddenTable?savedHiddenAnimeIDs[e?.id]:!savedHiddenAnimeIDs[e?.id])
                    .slice(0,parseFloat(filter))
            }
            if(type===("limittopscores")
             ||type===("limittopscore")
             ||type===("topscores")
             ||type===("topscore")){
                recList = recList.sort((a,b)=>parseFloat(b?.score??0)-parseFloat(a?.score??0))
                    .filter((e)=>isHiddenTable?savedHiddenAnimeIDs[e?.id]:!savedHiddenAnimeIDs[e?.id])
                    .slice(0,parseFloat(filter))
                break
            }
        }
    }

    var warnR = {}, warnY = {}
    // Validate Warn Content
    if(savedWarnR instanceof Array){
        for(let i=0;i<savedWarnR.length;i++){
            if(typeof savedWarnR[i]!=="string") continue
            // Get the type, seperator, and content
            var savedWarn = savedWarnR[i].trim().toLowerCase().split(/(:)/)
            if(savedWarn.length>2&&availableFilterTypes[savedWarn[0].replace(/\s|-|_/g,"")]){
                savedWarn = [savedWarn.shift(),savedWarn.shift(),savedWarn.join("").trim()]
            } else {
                savedWarn = savedWarn.shift()
            }
            var type, content, seperator
            if(typeof savedWarn==="string"){
                type = ""
                seperator = null
                content = savedWarn.trim()
            } else {
                type = savedWarn[0].replace(/\s/g,"")
                seperator = savedWarn[1]?.trim()??null
                content = (savedWarn[2]??type).trim()
            }
            if(seperator){
                if(type===("genre")||type===("genres")){
                    warnR["genre: "+content] = true
                }
                if(type===("tag")||type===("tags")){
                    warnR["tag: "+content] = true
                }
            } else {
                warnR["genre: "+content] = true
                warnR["tag: "+content] = true
            }

        }
    } else if(isJson(savedWarnR)){
        warnR = savedWarnR
    }
    if(savedWarnY instanceof Array){
        for(let i=0;i<savedWarnY?.length;i++){
            if(typeof savedWarnY[i]!=="string") continue
            // Get the type, seperator, and content
            var savedWarn = savedWarnY[i].trim().toLowerCase().split(/(:)/)
            if(savedWarn.length>2&&availableFilterTypes[savedWarn[0].replace(/\s|-|_/g,"")]){
                savedWarn = [savedWarn.shift(),savedWarn.shift(),savedWarn.join("").trim()]
            } else {
                savedWarn = savedWarn.shift()
            }
            var type, content, seperator
            if(typeof savedWarn==="string"){
                type = ""
                seperator = null
                content = savedWarn.trim()
            } else {
                type = savedWarn[0].replace(/\s/g,"")
                seperator = savedWarn[1]?.trim()??null
                content = (savedWarn[2]??type).trim()
            }
            if(seperator){
                if(type===("genre")||type===("genres")){
                    warnY["genre: "+content] = true
                }
                if(type===("tag")||type===("tags")){
                    warnY["tag: "+content] = true
                }
            } else {
                warnY["genre: "+content] = true
                warnY["tag: "+content] = true
            }
        }
    } else if(isJson(savedWarnY)){
        warnY = savedWarnY
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
        var hasWarnP = false
        var warns = []
        var score = parseFloat(value?.score??0)
        var weightedScore = parseFloat(value?.weightedScore??0)
        var userScore = parseFloat(value?.userScore??0)
        var averageScore = parseFloat(value?.averageScore??0)
        var popularity = parseInt(value?.popularity??0)
        var meanScore = parseFloat(value?.meanScore??0)
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
        if(meanScore){
            if(score<meanScore){
               hasWarnP = true 
            }
        }
        var genres = value?.genres || []
        if(typeof genres==="string"){
            genres = genres.split(", ")
        }
        genres.forEach((name)=>{
            var valGenre = name.trim().toLowerCase()
            var fullGenre = "genre: "+valGenre
            if(warnR[fullGenre]||warnR[valGenre]) {
                warns.push(name)
                hasWarnR = true
            } else if((warnY[fullGenre]||warnY[valGenre])&&!hasWarnR){
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
            if(warnR[fullTag]||warnR[valTag]) {
                warns.push(name)
                hasWarnR = true
            } else if((warnY[fullTag]||warnY[valTag])&&!hasWarnR){
                warns.push(name)
                hasWarnY = true
            }
        })
        if(hasWarnP&&typeof meanScore==="number"){
            warns.unshift(`Low Score (Mean: ${nFormatter(meanScore.toFixed(2),2)??'N/A'})`)
        }
        var hasWarn = hasWarnR||hasWarnY||hasWarnP
        if(isHiddenTable){
            animeData.push(`
            <tr class="item ${savedTheme}" role="row" style="height:65px;">
                <td class="hide-anime-column ${savedTheme}">
                    <div class="td-container ${savedTheme}">
                        <button
                            class="show-anime ${savedTheme}"
                            style="margin:auto; padding: 5px 13px;" 
                            type="button" 
                            title="Hide this Anime">Show</button>
                    </div>
                </td>
                <td class="anime-score ${savedTheme}" title="${nFormatter((weightedScore||0),2)}">
                    <div class="td-container ${savedTheme}">
                        ${hasWarn?`<div title="${warns.join(', ')}"><i class="${savedTheme} fa-solid fa-circle-exclamation ${hasWarnR?'red':hasWarnY?'orange':hasWarnP?'iris':''}"></i></div>`:''}
                        ${weightedScore||0}
                    </div>
                </td>
                <td class="animeTitle ${savedTheme}">
                    <div class="td-container ${savedTheme}">
                        <a class="${savedTheme}" target="_blank" rel="noopener noreferrer" href="${value?.animeUrl||'javascript:;'}" data-value="${value?.id||''}">${value?.title||'Title: N/A'}</a>
                    </div>
                </td>
                <td class="${savedTheme}">
                    <div class="td-container ${savedTheme}">
                        ${value?.format||'Format: N/A'}
                    </div>
                </td>
                <td class="${savedTheme}">
                    <div class="td-container ${savedTheme}">
                        ${similarities.length>0 ? similarities.join(', ') : 'Top Similarities: N/A'}
                    </div>
                </td>
                <td class="anime-score ${savedTheme}" title="${nFormatter((score||0),2)}">
                    <div class="td-container ${savedTheme}">
                        ${score||0}
                    </div>
                </td>
                <td class="txt-center ${savedTheme}" title="${userScore||0}">
                    <div class="td-container txt-center ${savedTheme}">
                        ${userScore||0}
                    </div>
                </td>
                <td class="txt-center ${savedTheme}" title="${averageScore||0}">
                    <div class="td-container txt-center ${savedTheme}">
                        ${averageScore||0}
                    </div>
                </td>
                <td class="txt-center ${savedTheme}" title="${popularity||0}">
                    <div class="td-container txt-center ${savedTheme}">
                        ${popularity||0}
                    </div>
                </td>
                <td class="${savedTheme}">
                    <div class="td-container ${savedTheme}">
                        ${value?.userStatus||'User Status: N/A'}
                    </div>
                </td>
                <td class="${savedTheme}">
                    <div class="td-container ${savedTheme}">
                        ${value?.status||'Status: N/A'}
                    </div>
                </td>
            </tr>`)
        } else {
            animeData.push(`
            <tr class="item ${savedTheme}" role="row">
                <td class="hide-anime-column ${savedTheme}">
                    <div class="td-container ${savedTheme}">
                        <button
                            class="hide-anime ${savedTheme}"
                            style="margin:auto; padding: 5px 13px;" 
                            type="button" 
                            title="Hide this Anime">Hide</button>
                    </div>
                </td>
                <td class="anime-score ${savedTheme}" title="${nFormatter((weightedScore||0),2)}">
                    <div class="td-container ${savedTheme}">
                        ${hasWarn?`<div title="${warns.join(', ')}"><i class="${savedTheme} fa-solid fa-circle-exclamation ${hasWarnR?'red':hasWarnY?'orange':hasWarnP?'iris':''}"></i></div>`:''}
                        ${weightedScore||0}
                    </div>
                </td>
                <td class="animeTitle ${savedTheme}">
                    <div class="td-container ${savedTheme}">
                        <a class="${savedTheme}" target="_blank" rel="noopener noreferrer" href="${value?.animeUrl||'javascript:;'}" data-value="${value?.id||''}">${value?.title||'Title: N/A'}</a>
                    </div>
                </td>
                <td class="${savedTheme}">
                    <div class="td-container ${savedTheme}">
                        ${value?.format||'Format: N/A'}
                    </div>
                </td>
                <td class="${savedTheme}">
                    <div class="td-container ${savedTheme}">
                        ${similarities.length>0 ? similarities.join(', ') : 'Top Similarities: N/A'}
                    </div>
                </td>
                <td class="anime-score ${savedTheme}" title="${nFormatter((score||0),2)}">
                    <div class="td-container ${savedTheme}">
                        ${score||0}
                    </div>
                </td>
                <td class="txt-center ${savedTheme}" title="${userScore||0}">
                    <div class="td-container txt-center ${savedTheme}">
                        ${userScore||0}
                    </div>
                </td>
                <td class="txt-center ${savedTheme}" title="${averageScore||0}">
                    <div class="td-container txt-center ${savedTheme}">
                        ${averageScore||0}
                    </div>
                </td>
                <td class="txt-center ${savedTheme}" title="${popularity||0}">
                    <div class="td-container txt-center ${savedTheme}">
                        ${popularity||0}
                    </div>
                </td>
                <td class="${savedTheme}">
                    <div class="td-container ${savedTheme}">
                        ${value?.userStatus||'User Status: N/A'}
                    </div>
                </td>
                <td class="${savedTheme}">
                    <div class="td-container ${savedTheme}">
                        ${value?.status||'Status: N/A'}
                    </div>
                </td>
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
        if(!(typeof str1==="number"||typeof str1==="string")
         &&(typeof str2==="number"||typeof str2==="string")) return false
        return str1.toString() === str2.toString()
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
    function nFormatter(num, digits) {
        const lookup = [
            { value: 1e3, symbol: "k" },
            { value: 1e6, symbol: "M" },
            { value: 1e9, symbol: "G" },
            { value: 1e12, symbol: "T" },
            { value: 1e15, symbol: "P" },
            { value: 1e18, symbol: "E" }
        ];
        const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        var item = lookup.slice().reverse().find(function(item) {
            return num >= item.value;
        });
        return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : num;
    }

}