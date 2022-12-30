importScripts( "../ajax.js" );
let g = {}, request, db;
const availableFilterTypes = {topscore:true,topscores:true,limittopscore:true,limittopscores:true,topwscore:true,limittopwscores:true,limittopwscore:true,topwscores:true,format:true,formats:true,genre:true,genres:true,tagcategory:true,tagcategories:true,tag:true,tags:true,studio:true,studios:true,staffrole:true,staffroles:true,staff:true,staffs:true,measure:true,measures:true,average:true,averages:true,includeunknownvariables:true,unknownvariables:true,unknownvariable:true,includeunknown:true,unknown:true,samplesizes:true,samplesize:true,samples:true,sample:true,size:true,minimumpopularity:true,minpopularity:true,popularity:true,minimumaveragescores:true,minimumaveragescore:true,minimumaverages:true,minimumaverage:true,minimumscores:true,minimumscore:true,averagescores:true,averagescore:true,scores:true,score:true,minaveragescores:true,minaveragescore:true,minaverages:true,minaverage:true,minscores:true,minscore:true,minimumavescores:true,minimumavescore:true,minimumave:true,avescores:true,avescore:true,limittopsimilarity:true,limittopsimilarities:true,limitsimilarity:true,limitsimilarities:true,topsimilarities:true,topsimilarity:true,similarities:true,similarity:true,userscore:true,userscores:true,wscore:true,wscores:true,year:true,years:true,season:true,seasons:true,userstatus:true,status:true,title:true,titles:true}
const topSimilarities = {include:{},exclude:{}}

self.onmessage = async({data}) => {
    if(!db){ await IDBinit() }
    g = await data
    await preWorker().then(async()=>{
        return await mainWorker()
    }).then(async()=>{
        return await postWorker()
    })
}

async function preWorker(){
    return await new Promise(async(resolve)=>{
        g.recList = Object.values(await retrieveJSON('savedRecScheme') ?? {})
        g.savedHiddenAnimeIDs = await retrieveJSON('savedHiddenAnimeIDs') ?? {}
        g.savedTheme = await retrieveJSON('savedTheme') ?? 'darkMode'
        g.kidsAnimeIsHidden = await retrieveJSON('kidsAnimeIsHidden') ?? true
        g.savedWarnAnime = await retrieveJSON('savedWarnAnime') ?? [ "!genre: !ecchi","!tag: !boys' love","tag: cgi","!tag: !ero guro","!tag: !female harem",
                                                                    "tag: full cgi","!tag: !male harem","!tag: !mixed gender harem",
                                                                    "!tag: !nudity","!tag: !slavery","!tag: !suicide","!tag: !yuri","!tag: !netorare", "!tag: !rape"
                                                                 ]
        resolve()
    })
}

async function mainWorker(){
    return await new Promise(async(resolve)=>{
        let minTopSimilarities = 5
        // Arrange Filters
        // Table/List Filters
        let filters = []
        let includes = []
        let excludes = g.kidsAnimeIsHidden? ["tag: kids"] : []
        let filterName;
        for(let i=0; i<g.savedFilters.length; i++){
            filterName = g.savedFilters[i].trim().toLowerCase()
            filters.push(filterName)
            if(filterName.charAt(0)==="!") {
                filterName = filterName.slice(1)
                filterName = typeof filterName==="string"? filterName.split(":") : []
                if(filterName.length>1){
                    filterName = [filterName.shift(),filterName.join()]
                    let type = filterName[0]
                    let cinfo = filterName[1].trim().toLowerCase()
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
        let savedWarnR = []
        let savedWarnY = []
        for(let i=0; i<g.savedWarnAnime.length; i++){
            let warnName = g.savedWarnAnime[i].trim().toLowerCase()
            if(warnName.charAt(0)==="!") {
                warnName = warnName.slice(1)
                warnName = typeof warnName==="string"? warnName.split(":") : []
                if(warnName.length>1){
                    warnName = [warnName.shift(),warnName.join()]
                    let type = warnName[0]
                    let cinfo = warnName[1].trim().toLowerCase()
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
        let isHiddenTable = false
        let tempRecScheme = []
        for(let i=0; i<includes.length; i++){
            if(typeof includes[i]!=="string") continue
            // Get the type, seperator, and filter
            let included = includes[i].trim().toLowerCase().split(/(:|>=|<=|>|<)/)
            if(included.length>2&&availableFilterTypes[included[0].replace(/\s|-|_/g,"")]){
                included = [included.shift(),included.shift(),included.join("").trim()]
            } else {
                included = included.shift()
            }
            let type, filter, seperator
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
            )&&seperator===":"){
                if(isaN(filter)){
                    minTopSimilarities = parseFloat(filter)
                }
                continue
            }
            if((type===("topsimilarities")
            ||type===("topsimilarity")
            ||type===("similarities")
            ||type===("similarity")
            )&&seperator===":"){
                let tmpfilter = filter.replace(/\s|-|_/g,"")
                if(tmpfilter===("content")||tmpfilter===("contents")){
                    topSimilarities.include.contents = true
                    continue
                }
                if(tmpfilter===("studio")||tmpfilter===("studios")){
                    topSimilarities.include.studios = true
                    continue
                }
                if(tmpfilter===("staff")||tmpfilter===("staffs")){
                    topSimilarities.include.staffs = true
                    continue
                }
            }
            if(equalsNCS("hidden",filter)){
                isHiddenTable = true
                continue
            }
            for(let j=0; j<g.recList.length; j++){
                // Numbers
                if((type===("averagescore")||type===("averagescores"))){
                    if(seperator===">="){
                        if(isaN(filter)) if(g.recList[j]?.averageScore>=parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator==="<="){
                        if(isaN(filter)) if(g.recList[j]?.averageScore<=parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator===">"){
                        if(isaN(filter)) if(g.recList[j]?.averageScore>parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator==="<"){
                        if(isaN(filter)) if(g.recList[j]?.averageScore<parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator===":"){
                        if(isaN(filter)) if(g.recList[j]?.averageScore===parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                }
                if((type===("userscore")||type===("userscores"))){
                    if(seperator===">="){
                        if(isaN(filter)) if(g.recList[j]?.userScore>=parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator==="<="){
                        if(isaN(filter)) if(g.recList[j]?.userScore<=parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator===">"){
                        if(isaN(filter)) if(g.recList[j]?.userScore>parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator==="<"){
                        if(isaN(filter)) if(g.recList[j]?.userScore<parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator===":"){
                        if(isaN(filter)) if(g.recList[j]?.userScore===parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                }
                if(type===("wscore")||type===("wscores")){
                    if(seperator===">="){
                        if(isaN(filter)) if(g.recList[j]?.weightedScore>=parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator==="<="){
                        if(isaN(filter)) if(g.recList[j]?.weightedScore<=parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator===">"){
                        if(isaN(filter)) if(g.recList[j]?.weightedScore>parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator==="<"){
                        if(isaN(filter)) if(g.recList[j]?.weightedScore<parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator===":"){
                        if(isaN(filter)) if(g.recList[j]?.weightedScore===parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                }
                // Score
                if((type===("score")||type===("scores"))){
                    if(seperator===">="){
                        if(isaN(filter)) if(g.recList[j]?.score>=parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator==="<="){
                        if(isaN(filter)) if(g.recList[j]?.score>parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator===">"){
                        if(isaN(filter)) if(g.recList[j]?.score<=parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator==="<"){
                        if(isaN(filter)) if(g.recList[j]?.score<parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator===":"){
                        if(isaN(filter)) if(g.recList[j]?.score===parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                }
                // Popularity
                if(type===("popularity")){
                    if(seperator===">="){
                        if(isaN(filter)) if(g.recList[j]?.popularity>=parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator==="<="){
                        if(isaN(filter)) if(g.recList[j]?.popularity<=parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator===">"){
                        if(isaN(filter)) if(g.recList[j]?.popularity>parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator==="<"){
                        if(isaN(filter)) if(g.recList[j]?.popularity<parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator===":"){
                        if(isaN(filter)) if(g.recList[j]?.popularity===parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }    
                }
                // Year
                if(type===("year")||type===("years")){
                    if(seperator===">="){
                        if(isaN(filter)) if(g.recList[j]?.year>=parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator==="<="){
                        if(isaN(filter)) if(g.recList[j]?.year<=parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator===">"){
                        if(isaN(filter)) if(g.recList[j]?.year>parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator==="<"){
                        if(!isNaN(filter)) if(g.recList[j]?.year<parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                    if(seperator===":"){
                        if(isaN(filter)) if(g.recList[j]?.year===parseFloat(filter)) tempRecScheme.push(g.recList[j])
                        continue
                    }
                }
                // Categories
                if((type===("format")||type===("formats"))&&seperator===":"){
                    if(findWord(g.recList[j]?.format,filter)){
                        tempRecScheme.push(g.recList[j])
                        continue
                    }
                }
                if((type===("season")||type===("seasons"))&&seperator===":"){
                    if(findWord(g.recList[j]?.season,filter)){
                        tempRecScheme.push(g.recList[j])
                        continue
                    }
                }
                if(type===("userstatus")&&seperator===":"){
                    if(findWord(g.recList[j]?.userStatus,filter)){
                        tempRecScheme.push(g.recList[j])
                        continue
                    }
                }
                if(type===("status")&&seperator===":"){
                    if(findWord(g.recList[j]?.status,filter)){
                        tempRecScheme.push(g.recList[j])
                        continue
                    }
                }
                if((type===("title")||type===("titles"))&&seperator===":"){
                    if(findWord(g.recList[j]?.title,filter)){
                        tempRecScheme.push(g.recList[j])
                        continue
                    }
                }
                if((type===("studio")||type===("studios"))&&seperator===":"){
                    if(findWord(Object.keys(g.recList[j]?.studios||{}),filter)){
                        tempRecScheme.push(g.recList[j])
                        continue
                    }
                }
                if((type===("staff")||type===("staffs"))&&seperator===":"){
                    if(findWord(Object.keys(g.recList[j]?.staff||{}),filter)){
                        tempRecScheme.push(g.recList[j])
                        continue
                    }
                }
                if((type===("genre")||type===("genres"))&&seperator===":"){
                    if(findWord(g.recList[j]?.genres,filter)){
                        tempRecScheme.push(g.recList[j])
                        continue
                    }
                }
                if((type===("tag")||type===("tags"))&&seperator===":"){
                    if(findWord(g.recList[j]?.tags,filter)){
                        tempRecScheme.push(g.recList[j])
                        continue
                    }
                }
                // One Word
                if(!seperator){
                    if(
                        findWord(g.recList[j]?.format,filter)
                        ||findWord(g.recList[j]?.year,filter)
                        ||findWord(g.recList[j]?.season,filter)
                        ||findWord(g.recList[j]?.userStatus,filter)
                        ||findWord(g.recList[j]?.status,filter)
                        ||findWord(g.recList[j]?.title,filter)
                        ||findWord(Object.keys(g.recList[j]?.studios||{}),filter)
                        ||findWord(Object.keys(g.recList[j]?.staff||{}),filter)
                    ){
                        tempRecScheme.push(g.recList[j])
                        continue
                    } 
                    let genres = g.recList[j]?.genres
                    let tags = g.recList[j]?.tags
                    if(typeof genres==="string"||genres instanceof Array){
                        if(findWord(genres,filter)){
                            tempRecScheme.push(g.recList[j])
                            continue
                        }
                    }
                    if(typeof tags==="string"||tags instanceof Array){
                        if(findWord(tags,filter)){
                            tempRecScheme.push(g.recList[j])
                            continue
                        }
                    }
                }
            }
            g.recList = tempRecScheme
            tempRecScheme = []
        }
        
        // Exclude
        for(let i=0; i<excludes.length; i++){
            if(typeof excludes[i]!=="string") continue
            // Get the type, seperator, and filter
            let excluded = excludes[i].trim().toLowerCase().split(/(:|>=|<=|>|<)/)
            if(excluded.length>2&&availableFilterTypes[excluded[0].replace(/\s|-|_/g,"")]){
                excluded = [excluded.shift(),excluded.shift(),excluded.join("").trim()]
            } else {
                excluded = excluded.shift()
            }
            let type, filter, seperator
            if(typeof excluded==="string"){
                type = ""
                seperator = null
                filter = excluded.trim()
            } else {
                type = excluded[0].replace(/\s|-|_/g,"")
                seperator = excluded[1]?.trim()??null
                filter = (excluded[2]??type).trim()
            }
            if((type===("topsimilarities")
            ||type===("topsimilarity")
            ||type===("similarities")
            ||type===("similarity")
            )&&seperator===":"){
                let tmpfilter = filter.replace(/\s|-|_/g,"")
                if(tmpfilter===("content")||tmpfilter===("contents")){
                    topSimilarities.exclude.contents = true
                    continue
                }
                if(tmpfilter===("studio")||tmpfilter===("studios")){
                    topSimilarities.exclude.studios = true
                    continue
                }
                if(tmpfilter===("staff")||tmpfilter===("staffs")){
                    topSimilarities.exclude.staffs = true
                    continue
                }
            }
            for(let j=0; j<g.recList.length; j++){
                if((type===("averagescore")||type===("averagescores"))&&seperator===":"){
                    if(isaN(filter)) if(g.recList[j]?.averageScore===parseFloat(filter)) continue
                }
                if((type===("userscore")||type===("userscores"))&&seperator===":"){
                    if(isaN(filter)) if(g.recList[j]?.userScore===parseFloat(filter)) continue
                }
                if((type===("wscore")||type===("wscores"))&&seperator===":"){
                    if(isaN(filter)) if(g.recList[j]?.weightedScore===parseFloat(filter)) continue
                }
                if((type===("score")||type===("scores"))&&seperator===":"){
                    if(isaN(filter)) if(g.recList[j]?.score===parseFloat(filter)) continue
                }
                if(type===("popularity")&&seperator===":"){
                    if(isaN(filter)) if(g.recList[j]?.popularity===parseFloat(filter)) continue
                }
                if((type===("year")||type===("years"))&&seperator===":"){
                    if(isaN(filter)) if(g.recList[j]?.year===parseFloat(filter)) continue
                }
                // Categories
                if((type===("format")||type===("formats"))&&seperator===":"){
                    if(findWord(g.recList[j]?.format,filter)){
                        continue
                    }
                }
                if((type===("season")||type===("seasons"))&&seperator===":"){
                    if(findWord(g.recList[j]?.season,filter)){
                        continue
                    }
                }
                if(type===("userstatus")&&seperator===":"){
                    if(findWord(g.recList[j]?.userStatus,filter)){
                        continue
                    }
                }
                if(type===("status")&&seperator===":"){
                    if(findWord(g.recList[j]?.status,filter)){
                        continue
                    }
                }
                if((type===("title")||type===("titles"))&&seperator===":"){
                    if(findWord(g.recList[j]?.title,filter)){
                        continue
                    }
                }
                if((type===("studio")||type===("studios"))&&seperator===":"){
                    if(findWord(Object.keys(g.recList[j]?.studios||{}),filter)){
                        continue
                    }
                }
                if((type===("staff")||type===("staffs"))&&seperator===":"){
                    if(findWord(Object.keys(g.recList[j]?.staff||{}),filter)){
                        continue
                    }
                }
                if((type===("genre")||type===("genres"))&&seperator===":"){
                    if(findWord(g.recList[j]?.genres,filter)){
                        continue
                    }
                }
                if((type===("tag")||type===("tags"))&&seperator===":"){
                    if(findWord(g.recList[j]?.tags,filter)){
                        continue
                    }
                }
                // One Word
                if(!seperator){
                    if(
                        findWord(g.recList[j]?.format,filter)
                        ||findWord(g.recList[j]?.year,filter)
                        ||findWord(g.recList[j]?.season,filter)
                        ||findWord(g.recList[j]?.userStatus,filter)
                        ||findWord(g.recList[j]?.status,filter)
                        ||findWord(g.recList[j]?.title,filter)
                        ||findWord(Object.keys(g.recList[j]?.studios||{}),filter)
                        ||findWord(Object.keys(g.recList[j]?.staff||{}),filter)
                    ){
                        continue
                    } 
                    let genres = g.recList[j]?.genres
                    let tags = g.recList[j]?.tags
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
                tempRecScheme.push(g.recList[j])
            }
            g.recList = tempRecScheme
            tempRecScheme = []
        }

        // Filter for Limiting Items In List
        for(let i=0; i<includes.length; i++){
            if(typeof includes[i]!=="string") continue
            // Get the type, seperator, and filter
            let included = includes[i].trim().toLowerCase().split(/(:|>=|<=|>|<)/)
            if(included.length>2&&availableFilterTypes[included[0].replace(/\s|-|_/g,"")]){
                included = [included.shift(),included.shift(),included.join("").trim()]
            } else {
                included = included.shift()
            }
            let type, filter, seperator
            if(typeof included==="string"){  
                type = ""
                seperator = null
                filter = included.trim()
            } else {
                type = included[0].replace(/\s|-|_/g,"")
                seperator = included[1]?.trim()??null
                filter = (included[2]??type).trim()
            }
            if(seperator===":"&&isaN(filter)&&g.recList instanceof Array){
                if(type===("limittopwscores")
                ||type===("limittopwscore")
                ||type===("topwscores")
                ||type===("topwscore")){
                    g.recList = g.recList.sort((a,b)=>parseFloat(b?.weightedScore??0)-parseFloat(a?.weightedScore??0))
                        .filter((e)=>isHiddenTable?g.savedHiddenAnimeIDs[e?.id]:!g.savedHiddenAnimeIDs[e?.id])
                        .slice(0,parseFloat(filter))
                }
                if(type===("limittopscores")
                ||type===("limittopscore")
                ||type===("topscores")
                ||type===("topscore")){
                    g.recList = g.recList.sort((a,b)=>parseFloat(b?.score??0)-parseFloat(a?.score??0))
                        .filter((e)=>isHiddenTable?g.savedHiddenAnimeIDs[e?.id]:!g.savedHiddenAnimeIDs[e?.id])
                        .slice(0,parseFloat(filter))
                    break
                }
            }
        }

        let warnR = {}, warnY = {}
        // Validate Warn Content
        if(savedWarnR instanceof Array){
            for(let i=0;i<savedWarnR.length;i++){
                if(typeof savedWarnR[i]!=="string") continue
                // Get the type, seperator, and content
                let savedWarn = savedWarnR[i].trim().toLowerCase().split(/(:)/)
                if(savedWarn.length>2&&availableFilterTypes[savedWarn[0].replace(/\s|-|_/g,"")]){
                    savedWarn = [savedWarn.shift(),savedWarn.shift(),savedWarn.join("").trim()]
                } else {
                    savedWarn = savedWarn.shift()
                }
                let type, content, seperator
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
                let savedWarn = savedWarnY[i].trim().toLowerCase().split(/(:)/)
                if(savedWarn.length>2&&availableFilterTypes[savedWarn[0].replace(/\s|-|_/g,"")]){
                    savedWarn = [savedWarn.shift(),savedWarn.shift(),savedWarn.join("").trim()]
                } else {
                    savedWarn = savedWarn.shift()
                }
                let type, content, seperator
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
        g.animeData = ""
        g.recList.forEach((value) => {
            if(isHiddenTable){
                if(!g.savedHiddenAnimeIDs[value?.id]){
                    return
                }
            } else {
                if(g.savedHiddenAnimeIDs[value?.id]){
                    return
                }
            }
            let hasWarnR = false
            let hasWarnY = false
            let hasWarnP = false
            let hasWarnI = false
            let warns = []
            let score = parseFloat(value?.score??0)
            let weightedScore = parseFloat(value?.weightedScore??0)
            let userScore = parseFloat(value?.userScore??0)
            let averageScore = parseFloat(value?.averageScore??0)
            let popularity = parseInt(value?.popularity??0)
            let meanScoreAll = parseFloat(value?.meanScoreAll??0)
            let meanScoreAbove = parseFloat(value?.meanScoreAbove??0)
            let similarities = []
            value?.variablesIncluded?.forEach((v)=>{
                if(!jsonIsEmpty(topSimilarities.include)){
                    if(isJson(v)){
                        Object.entries(v).forEach(([name, url])=>{
                            if(name.slice(0,8)==='studio: '){
                                if(topSimilarities.include.studios
                                &&!topSimilarities.exclude.studios){
                                    similarities.push(`<a class="${g.savedTheme} copy-value user-select-all" target="_blank" rel="noopener noreferrer" href=${url||"javascript:;"} data-copy-value="${name}">${name}</a>`)
                                }
                            } else {
                            if(topSimilarities.include.staffs
                                &&!topSimilarities.exclude.staffs){
                                    similarities.push(`<a class="${g.savedTheme} copy-value user-select-all" target="_blank" rel="noopener noreferrer" href=${url||"javascript:;"} data-copy-value="${name}">${name}</a>`)
                                }
                            }
                        })
                    } else if(topSimilarities.include.contents
                    &&!topSimilarities.exclude.contents){
                        similarities.push(`<span class="${g.savedTheme} copy-value user-select-all" data-copy-value="${v}">${v}</span>`)
                    }
                } else {
                    if(isJson(v)){
                        Object.entries(v).forEach(([name, url])=>{
                            if(name.slice(0,8)==='studio: '){
                                if(!topSimilarities.exclude.studios){
                                    similarities.push(`<a class="${g.savedTheme} copy-value user-select-all" target="_blank" rel="noopener noreferrer" href=${url||"javascript:;"} data-copy-value="${name}">${name}</a>`)
                                }
                            } else {
                            if(!topSimilarities.exclude.staffs){
                                    similarities.push(`<a class="${g.savedTheme} copy-value user-select-all" target="_blank" rel="noopener noreferrer" href=${url||"javascript:;"} data-copy-value="${name}">${name}</a>`)
                                }
                            }
                        })
                    } else if(!topSimilarities.exclude.contents){
                        similarities.push(`<span class="${g.savedTheme} copy-value user-select-all" data-copy-value="${v}">${v}</span>`)
                    }
                }
            })
            similarities = similarities.splice(0,minTopSimilarities)
            // Content Warns
            if(meanScoreAll){
                if(score<meanScoreAll){
                hasWarnP = true 
                }
            }
            if(meanScoreAbove){
                if(score<meanScoreAbove){
                hasWarnI = true 
                }
            }
            let genres = value?.genres || []
            if(typeof genres==="string"){
                genres = genres.split(", ")
            }
            genres.forEach((name)=>{
                let valGenre = name.trim().toLowerCase()
                let fullGenre = "genre: "+valGenre
                if(warnR[fullGenre]||warnR[valGenre]) {
                    warns.push(name)
                    hasWarnR = true
                } else if((warnY[fullGenre]||warnY[valGenre])&&!hasWarnR){
                    warns.push(name)
                    hasWarnY = true
                }
            })
            let tags = value?.tags || []
            if(typeof tags==="string"){
                tags = tags.split(", ")
            }
            tags.forEach((name)=>{
                let valTag = name.trim().toLowerCase()
                let fullTag = "tag: "+valTag
                if(warnR[fullTag]||warnR[valTag]) {
                    warns.push(name)
                    hasWarnR = true
                } else if((warnY[fullTag]||warnY[valTag])&&!hasWarnR){
                    warns.push(name)
                    hasWarnY = true
                }
            })
            if(hasWarnP&&typeof meanScoreAll==="number"){
                warns.unshift(`Low Score (Mean: ${nFormatter(meanScoreAll.toFixed(2),2)??'N/A'})`)
            } else if(hasWarnI&& typeof meanScoreAbove==="number"){
                warns.unshift(`Mid Score (Mean: ${nFormatter(meanScoreAbove.toFixed(2),2)??'N/A'})`)
            }
            let hasWarn = hasWarnR||hasWarnY||hasWarnI||hasWarnP
            if(isHiddenTable){
                g.animeData += `
                <tr class="item ${g.savedTheme}" role="row" style="height:65px;">
                    <td class="hide-anime-column ${g.savedTheme}">
                        <div class="td-container ${g.savedTheme}">
                            <button
                                class="show-anime ${g.savedTheme}"
                                style="margin:auto; padding: 5px 13px;" 
                                type="button" 
                                title="Hide this Anime">Show</button>
                        </div>
                    </td>
                    <td class="anime-score ${g.savedTheme} ${hasWarn?'pointer':''}">
                        <div class="td-container ${g.savedTheme} ${hasWarn?'':'user-select-all'} copy-value" data-copy-value="${weightedScore||0}" title="${nFormatter((weightedScore||0),2)}">
                            ${hasWarn?`<div title="${warns.join(', ')}"><i class="${g.savedTheme} fa-solid fa-circle-exclamation ${hasWarnR?'red':hasWarnY?'orange':hasWarnP?'purple':hasWarnI?'iris':''}"></i></div>`:''}
                            ${weightedScore||0}
                        </div>
                    </td>
                    <td class="animeTitle ${g.savedTheme}">
                        <div class="td-container ${g.savedTheme}">
                            <a class="${g.savedTheme} copy-value user-select-all" target="_blank" rel="noopener noreferrer" href="${value?.animeUrl||'javascript:;'}" data-value="${value?.id||''}" data-copy-value="${value?.title||'Title: N/A'}">${value?.title||'Title: N/A'}</a>
                        </div>
                    </td>
                    <td class="${g.savedTheme}">
                        <div class="td-container ${g.savedTheme} copy-value user-select-all" data-copy-value="${value?.format||'Format: N/A'}">
                            ${value?.format||'Format: N/A'}
                        </div>
                    </td>
                    <td class="${g.savedTheme}">
                        <div class="td-container ${g.savedTheme} ${similarities.length<=0?'copy-value user-select-all':''}" ${similarities.length<=0?'data-copy-value="'+(value?.format||'Format: N/A')+'"':''}>
                            ${similarities.length>0 ? similarities.join(', ') : 'Top Similarities: N/A'}
                        </div>
                    </td>
                    <td class="anime-score ${g.savedTheme}" title="${nFormatter((score||0),2)}">
                        <div class="td-container ${g.savedTheme} copy-value user-select-all" data-copy-value="${score||0}">
                            ${score||0}
                        </div>
                    </td>
                    <td class="txt-center ${g.savedTheme}" title="${userScore||0}">
                        <div class="td-container txt-center ${g.savedTheme} copy-value user-select-all" data-copy-value="${userScore||0}">
                            ${userScore||0}
                        </div>
                    </td>
                    <td class="txt-center ${g.savedTheme}" title="${averageScore||0}">
                        <div class="td-container txt-center ${g.savedTheme} copy-value user-select-all" data-copy-value="${averageScore||0}">
                            ${averageScore||0}
                        </div>
                    </td>
                    <td class="txt-center ${g.savedTheme}" title="${popularity||0}">
                        <div class="td-container txt-center ${g.savedTheme} copy-value user-select-all" data-copy-value="${popularity||0}">
                            ${popularity||0}
                        </div>
                    </td>
                    <td class="${g.savedTheme}">
                        <div class="td-container ${g.savedTheme} copy-value user-select-all" data-copy-value="${value?.userStatus||'User Status: N/A'}">
                            ${value?.userStatus||'User Status: N/A'}
                        </div>
                    </td>
                    <td class="${g.savedTheme}">
                        <div class="td-container ${g.savedTheme} copy-value user-select-all" data-copy-value="${value?.status||'Status: N/A'}">
                            ${value?.status||'Status: N/A'}
                        </div>
                    </td>
                </tr>`
            } else {
                g.animeData += `
                <tr class="item ${g.savedTheme}" role="row">
                    <td class="hide-anime-column ${g.savedTheme}">
                        <div class="td-container ${g.savedTheme}">
                            <button
                                class="hide-anime ${g.savedTheme}"
                                style="margin:auto; padding: 5px 13px;" 
                                type="button" 
                                title="Hide this Anime">Hide</button>
                        </div>
                    </td>
                    <td class="anime-score ${g.savedTheme} ${hasWarn?'pointer':''}">
                        <div class="td-container ${g.savedTheme} ${hasWarn?'':'user-select-all'} copy-value" data-copy-value="${weightedScore||0}" title="${nFormatter((weightedScore||0),2)}">
                            ${hasWarn?`<div title="${warns.join(', ')}"><i class="${g.savedTheme} fa-solid fa-circle-exclamation ${hasWarnR?'red':hasWarnY?'orange':hasWarnP?'purple':hasWarnI?'iris':''}"></i></div>`:''}
                            ${weightedScore||0}
                        </div>
                    </td>
                    <td class="animeTitle ${g.savedTheme}">
                        <div class="td-container ${g.savedTheme}">
                            <a class="${g.savedTheme} copy-value user-select-all" target="_blank" rel="noopener noreferrer" href="${value?.animeUrl||'javascript:;'}" data-value="${value?.id||''}" data-copy-value="${value?.title||'Title: N/A'}">${value?.title||'Title: N/A'}</a>
                        </div>
                    </td>
                    <td class="${g.savedTheme}">
                        <div class="td-container ${g.savedTheme} copy-value user-select-all" data-copy-value="${value?.format||'Format: N/A'}">
                            ${value?.format||'Format: N/A'}
                        </div>
                    </td>
                    <td class="${g.savedTheme}">
                        <div class="td-container ${g.savedTheme} ${similarities.length<=0?'copy-value user-select-all':''}" ${similarities.length<=0?'data-copy-value="'+(value?.format||'Format: N/A')+'"':''}>
                            ${similarities.length>0 ? similarities.join(', ') : 'Top Similarities: N/A'}
                        </div>
                    </td>
                    <td class="anime-score ${g.savedTheme}" title="${nFormatter((score||0),2)}">
                        <div class="td-container ${g.savedTheme} copy-value user-select-all" data-copy-value="${score||0}">
                            ${score||0}
                        </div>
                    </td>
                    <td class="txt-center ${g.savedTheme}" title="${userScore||0}">
                        <div class="td-container txt-center ${g.savedTheme} copy-value user-select-all" data-copy-value="${userScore||0}">
                            ${userScore||0}
                        </div>
                    </td>
                    <td class="txt-center ${g.savedTheme}" title="${averageScore||0}">
                        <div class="td-container txt-center ${g.savedTheme} copy-value user-select-all" data-copy-value="${averageScore||0}">
                            ${averageScore||0}
                        </div>
                    </td>
                    <td class="txt-center ${g.savedTheme}" title="${popularity||0}">
                        <div class="td-container txt-center ${g.savedTheme} copy-value user-select-all" data-copy-value="${popularity||0}">
                            ${popularity||0}
                        </div>
                    </td>
                    <td class="${g.savedTheme}">
                        <div class="td-container ${g.savedTheme} copy-value user-select-all" data-copy-value="${value?.userStatus||'User Status: N/A'}">
                            ${value?.userStatus||'User Status: N/A'}
                        </div>
                    </td>
                    <td class="${g.savedTheme}">
                        <div class="td-container ${g.savedTheme} copy-value user-select-all" data-copy-value="${value?.status||'Status: N/A'}">
                            ${value?.status||'Status: N/A'}
                        </div>
                    </td>
                </tr>`
            }
        })
        if(g.animeData===""){
            g.animeData = `
                <tr class="${g.savedTheme} item" role="row">
                    <td class="${g.savedTheme}" style="padding: 1.5em !important;" colspan="11">
                        <i class="fa fa-solid fa-file fa-xl" style="padding-right: 1ch;"></i>
                        No Data
                    </td>
                </tr>
            `
        }
        resolve()
    })
}
async function postWorker(){
    return await new Promise(async(resolve)=>{
        if(g.savedFilters){
            await saveJSON(g.savedFilters,"savedFilters")
        }
        const maxStrLength = 1000000
        const postMessage = chunkString(g.animeData,maxStrLength)
        const pmLen = postMessage.length
        for(let i=0; i<pmLen;i++){
            setTimeout(()=>{
                self.postMessage({
                    chunk: postMessage[i],
                    done: i===pmLen-1
                })
            },i*100)
        }
        resolve()
    })
}
async function IDBinit(){
    return await new Promise((resolve)=>{
        request = indexedDB.open("Kanshi.Anime.Recommendations.Anilist.W~uPtWCq=vG$TR:Zl^#t<vdS]I~N70", 1)
        request.onerror = (error) => {
            console.error(error)
        }
        request.onsuccess = (event) => {
            db = event.target.result
            resolve()
        }
        request.onupgradeneeded = (event) => {
            db = event.target.result
            db.createObjectStore("MyObjectStore")
            resolve()
        }
    })
}
async function saveJSON(data, name) {
    return new Promise(async(resolve)=>{
        try {
            let write = db.transaction("MyObjectStore","readwrite").objectStore("MyObjectStore").openCursor()
            write.onsuccess = async(event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if(cursor.key===name){
                        await cursor.update(data)
                        resolve()
                    }
                    await cursor.continue()
                } else {
                    await db.transaction("MyObjectStore","readwrite").objectStore("MyObjectStore").add(data, name)
                    resolve()
                }
            }
            write.onerror = async(error) => {
                console.error(error)
                await db.transaction("MyObjectStore","readwrite").objectStore("MyObjectStore").add(data, name)
                resolve()
            }
        } catch(ex) {
            try{
                console.error(ex)
                await db.transaction("MyObjectStore","readwrite").objectStore("MyObjectStore").add(data, name)
                resolve()
            } catch(ex2) {
                console.error(ex2)
                resolve()
            }
        }
    })
}
async function retrieveJSON(name) {
    return new Promise((resolve)=>{
        try {
            let read = db.transaction("MyObjectStore","readwrite").objectStore("MyObjectStore").get(name)
            read.onsuccess = () => {
                resolve(read.result)
            }
            read.onerror = (error) => {
                console.error(error)
                resolve()
            }
        } catch(ex){
            console.error(ex)
            resolve()
        }
    })
}
function chunkString(str, chunkSize) {
    const chunks = []
    while (str) {
        if (str.length < chunkSize) {
            chunks.push(str);
            break;
        } else {
            chunks.push(str.substr(0, chunkSize));
            str = str.substr(chunkSize);
        }
    }
    return chunks
}
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
    else if(typeof num==='boolean'){return false}
    else if(typeof num==='string'&&!num){return false}
    return !isNaN(num)
}
function isJson(j){ 
    try{return(j?.constructor.name==='Object'&&`${j}`==='[object Object]')}
    catch(e){return false}
}
function jsonIsEmpty(obj){
    if(isJson(obj)){
        for(let i in obj) return false
        return true
    }
    console.error(`Error: Expected Object Constructor (reading '${obj?.constructor.name}' - ${JSON.stringify(obj)})`)
    return true // Temporarily Added for Past Conditions to Work
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
    let item = lookup.slice().reverse().find(function(item) {
        return num >= item.value;
    });
    return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : num;
}
