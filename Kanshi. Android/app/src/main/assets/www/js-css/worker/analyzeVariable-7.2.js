importScripts( "../ajax.js" );
let g = {}, request, db;

self.onmessage = async({data}) => {
    if(!db){ await IDBinit() }
    g = await data
    await preWorker().then(async()=>{
        return await mainWorker()
    }).then(async()=>{
        return await postWorker()
    }).then(()=>{
        self.postMessage({status:'analyzeAnime'})
    })
}
// Used Functions
async function preWorker(){
    return await new Promise(async(resolve)=>{
        // Notify User
        g.savedAnalyzeVariableTime = await retrieveJSON('savedAnalyzeVariableTime') ?? [15]
        g.analyzeVariableTime = Math.ceil(arrayMean(g.savedAnalyzeVariableTime))
        self.postMessage({
            status:'notify', 
            updateStatus: {
                analyzeVariableTime: g.analyzeVariableTime,
                info: 'normal'
            }
        })
        g.analyzeVariableStartTime = new Date()
        // Retrieve
        g.savedUsername = await retrieveJSON('savedUsername') ?? ''
        g.savedAnimeEntries = await retrieveJSON('savedAnimeEntries') ?? {}
        g.savedUserEntries = await retrieveJSON('savedUserEntries') ?? []
        g.savedAnimeFranchises = await retrieveJSON('savedAnimeFranchises') ?? []
        g.hideUnwatchedSequels = await retrieveJSON('hideUnwatchedSequels') ?? true
        if(g.savedFilterAlgo===undefined){
            g.savedFilterAlgo = await retrieveJSON('savedFilterAlgo') ?? ["minimum sample size: 2","include unknown variables: false"]
        }
        g.lastSavedUpdateTime = await retrieveJSON('lastSavedUpdateTime') ?? 0
        // Alter Data
        g.isNewName = !equalsNCS(g.username,g.savedUsername)
        if(jsonIsEmpty(g.savedAnimeEntries)||g.lastSavedUpdateTime===0){
            g.deepUpdateStartTime = new Date()
            g.savedUserEntries = []
        } else if(g.isNewName){
            g.savedUserEntries = []
        }
        g.varScheme = {
            genres: {},
            tags: {},
            studios: {},
            staff: {}
        }
        g.userEntriesStatus = {
            userScore: {},
            userStatus: {}
        }
        if(g.username&&!jsonIsEmpty(g.savedAnimeEntries)){
            if(g.anUpdate){
                g.savedUserEntries = []
                const maxAnimePerChunk = 500
                async function recallAV(chunk){
                    // Request API
                    $.ajax({
                        type: 'POST',
                        url: 'https://graphql.anilist.co',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Cache-Control': 'max-age=31536000, immutable'
                        },
                        dataType: 'json',
                        data: JSON.stringify({query:
                            `{
                                MediaListCollection(userName: "${g.username}",
                                chunk:${chunk},
                                perChunk:${maxAnimePerChunk},
                                forceSingleCompletedList: true,
                                type: ANIME) {
                                    hasNextChunk
                                    lists {
                                        entries {
                                            status
                                            media {
                                                id
                                            }
                                            score
                                        }
                                    }
                                }
                            }`
                        }),
                        success: (result,status,xhr)=> {
                            const responseHeaders = xhr.getAllResponseHeaders()
                            let userList = result?.data?.MediaListCollection?.lists ?? []
                            let hasNextChunk = (result?.data?.MediaListCollection?.hasNextChunk ?? (userList?.length??0)>0)
                            for(let i=0; i<userList.length; i++){
                                g.savedUserEntries = g.savedUserEntries.concat(userList[i]?.entries??[])
                            }
                            if(hasNextChunk){
                                if((responseHeaders?.['x-ratelimit-remaining']??1)>0){
                                    return recallAV(++chunk)
                                } else {
                                    g.analyzeVariableTime = Math.ceil(Math.max(g.analyzeVariableTime-Math.ceil(((new Date).getTime()-g.analyzeVariableStartTime.getTime())/1000),1))
                                    self.postMessage({
                                        status:'notify', 
                                        updateStatus: {
                                            analyzeVariableTime: g.analyzeVariableTime,
                                            info: 'rateLimit'
                                        }
                                    })
                                    setTimeout(()=>{
                                        return recallAV(++chunk)
                                    },60000)
                                }
                            } else {
                                return resolve()
                            }
                        },
                        error: function(xhr) {
                            const responseHeaders = xhr.getAllResponseHeaders()
                            const error = xhr?.responseJSON?.errors?.[0]?.message || 'Oops... something wen\'t wrong, please try again...'
                            try {
                                if(error==='User not found'){
                                    throw error+', please try again...'
                                } else {
                                    if(responseHeaders?.['x-ratelimit-remaining']??0>0){
                                        return recallAV(chunk)
                                    } else {
                                        g.analyzeVariableTime = Math.ceil(Math.max(g.analyzeVariableTime-Math.ceil(((new Date).getTime()-g.analyzeVariableStartTime.getTime())/1000),1))
                                        self.postMessage({
                                            status:'notify', 
                                            updateStatus: {
                                                analyzeVariableTime: g.analyzeVariableTime,
                                                info: 'rateLimit'
                                            }
                                        })
                                        setTimeout(()=>{
                                            return recallAV(chunk)
                                        },60000)
                                    }
                                }
                            } catch(error) {
                                self.postMessage({status:'error',error:error})
                            }
                        }
                    })
                }
                recallAV(1) // first chunk
            } else {
                if(g.savedUserEntries.length>0){
                    return resolve()
                } else {
                    // Update User List if Empty
                    self.postMessage({status:'notify', needUpdate: true})
                    self.postMessage({status:'reupdate',anUpdate:true})
                }
            }
        } else {
            if(jsonIsEmpty(g.savedAnimeEntries)){
                if(!g.anUpdate){ self.postMessage({status:'notify', needUpdate: true}) }
                self.postMessage({status:'updateAnime',returnInfo:'getAnime'})
            } else {
                self.postMessage({status:'error', error: "Can't connect to Anilist..."})
            }
        }
    })
}
async function mainWorker(){
    return await new Promise((resolve)=>{
        const mediaRelationTypes = ["adaptation","prequel","sequel","parent","side_story","summary","alternative","spin_off"]
        const availableFilterTypes = {minsize:true,minsizes:true,minsamplesize:true,minsamplesizes:true,minimumsizes:true,minimumsizes:true,minimumsamplesize:true,minimumsamplesizes:true,format:true,formats:true,genre:true,genres:true,tagcategory:true,tagcategories:true,tag:true,tags:true,studio:true,studios:true,staffrole:true,staffroles:true,staff:true,staffs:true,measure:true,measures:true,average:true,averages:true,includeUnknownVariables:true,unknownvariables:true,unknownvariable:true,includeunknown:true,unknown:true,samplesizes:true,samplesize:true,samples:true,sample:true,size:true,minimumpopularity:true,minpopularity:true,popularity:true,minimumaveragescores:true,minimumaveragescore:true,minimumaverages:true,minimumaverage:true,minimumscores:true,minimumscore:true,averagescores:true,averagescore:true,scores:true,score:true,minaveragescores:true,minaveragescore:true,minaverages:true,minaverage:true,minscores:true,minscore:true,minimumavescores:true,minimumavescore:true,minimumave:true,avescores:true,avescore:true,limittopsimilarity:true,limittopsimilarities:true,limitsimilarity:true,limitsimilarities:true,topsimilarities:true,topsimilarity:true,similarities:true,similarity:true,userscore:true,userscores:true,wscore:true,wscores:true,year:true,years:true,season:true,seasons:true,userstatus:true,status:true,title:true,titles:true}
        // Filter Algorithm
        let measure = "mean"
        let includeUnknownVar = true
        let minSampleSize
        let sampleSize
        let minPopularity
        let minAverageScore
        let includeYear = true
        let includeAverageScore = true
        // Filter Algorithm
        let include = {
            //  formats: {}, 
            genres: {}, tags: {}, categories: {}, studios: {}, staffs: {}, roles: {}
        }, 
        exclude = {
            //  formats: {}, 
            genres: {}, tags: {}, categories: {}, studios: {}, staffs: {}, roles: {} 
        }, 
        savedIncluded = [],
        savedExcluded = [],
        filterName;
        // Group Filters
        for(let i=0; i<g.savedFilterAlgo.length; i++){
        filterName = g.savedFilterAlgo[i].trim().toLowerCase()
        if(filterName.charAt(0)==="!") {
            filterName = filterName.slice(1)
            filterName = typeof filterName==="string"? filterName.split(":") : []
            // Only Allow Specific (non-specified removes almost all predictors)
                if(filterName.length>1){
                    filterName = [filterName.shift(),filterName.join()]
                    let type = filterName[0]
                    let cinfo = filterName[1].trim().toLowerCase()
                if(cinfo.charAt(0)==="!"){
                    cinfo = cinfo.slice(1)
                    savedExcluded.push(type+":"+cinfo)
                } else {
                    savedExcluded.push(type+":"+cinfo)
                }
            } else if(filterName.length===1){
                savedExcluded.push(filterName[0])
            }
        } else savedIncluded.push(filterName)
    }
    for(let i=0;i<savedIncluded.length;i++){
        if(typeof savedIncluded[i]!=="string") continue
        // Get the type, seperator, and content
        let included = savedIncluded[i].trim().toLowerCase().split(/(:)/)
        if(included.length>2&&availableFilterTypes[included[0].replace(/\s|-|_/g,"")]){
            included = [included.shift(),included.shift(),included.join("").trim()]
        } else {
            included = included.shift()
        }
        let type, filter, seperator
        if(typeof included==="string"){  
            type = ""
            seperator = null
            filter = included.replace(/\s|-|_/g,"")
        } else {
            type = included[0].replace(/\s|-|_/g,"")
            seperator = included[1]?.trim()??null
            filter = (included[2]??type).trim()
        }
        if(seperator===":"){
        // if(type===("format")||type===("formats")){
        //     include.formats["format: "+filter] = true
        //     continue
        // }
        if(type===("genre")||type===("genres")){
            include.genres["genre: "+filter] = true
            continue
        }
        if(type===("tagcategory")||type===("tagcategories")){
            include.categories["tag category: "+filter] = true
            continue
        }
        if(type===("tag")||type===("tags")){
            include.tags["tag: "+filter] = true
            continue
        }
        if(type===("studio")||type===("studios")){
            include.studios["studio: "+filter] = true
            continue
        }
        if(type===("staffrole")||type===("staffroles")){
            include.roles["staff role: "+filter] = true
            continue
        }
        if(type===("staff")||type===("staffs")){
            include.staffs["staff: "+filter] = true
            continue
        }
        if(type===("measure")||type===("measures")||type===("average")||type===("averages")){
            if(filter==="mode"){
                measure = "mode"
            } else if(filter==="mean"){
                measure = "mean"
            }
            continue
        }
        if(type===("includeUnknownVariables")
            ||type===("includeUnknownVariable")
            ||type===("unknownvariables")
            ||type===("unknownvariable")
            ||type===("includeunknown")
            ||type===("unknown")){
            if(filter==="false"){
                includeUnknownVar = false
            } else if(filter==="true"){
                includeUnknownVar = true
            }
            continue
        }
        if(type===("minimumsamplesizes")
            ||type===("minimumsamplesize")
            ||type===("minimumsizes")
            ||type===("minimumsize")
            ||type===("minsamplesizes")
            ||type===("minsamplesize")
            ||type===("minsizes")
            ||type===("minsize")){
            if(isaN(filter)){
                minSampleSize = parseFloat(filter)
            }
            continue
        }
        if(type===("samplesizes")
            ||type===("samplesize")
            ||type===("samples")
            ||type===("sample")){
            if(isaN(filter)){
                sampleSize = parseFloat(filter)
            }
            continue
        }
        if(type===("minimumpopularity")
            ||type===("minpopularity")
            ||type===("popularity")){
            if(isaN(filter)){
                minPopularity = parseFloat(filter)
            }
            continue
        }
        if(type===("minimumaveragescores")
            ||type===("minimumaveragescore")
            ||type===("minimumaverages")
            ||type===("minimumaverage")
            ||type===("minimumscores")
            ||type===("minimumscore")
            ||type===("minaveragescores")
            ||type===("minaveragescore")
            ||type===("minaverages")
            ||type===("minaverage")
            ||type===("minscores")
            ||type===("minscore")
            ||type===("minimumavescores")
            ||type===("minimumavescore")
            ||type===("minimumave")){
            if(isaN(filter)){
                minAverageScore = parseFloat(filter)
            }
            continue
        }
    }
    }
    //
    for(let i=0;i<savedExcluded.length;i++){
        if(typeof savedExcluded[i]!=="string") continue
        // Get the type, seperator, and content
        let excluded = savedExcluded[i].trim().toLowerCase().split(/(:)/)
        if(excluded.length>2&&availableFilterTypes[excluded[0].replace(/\s|-|_/g,"")]){
            excluded = [excluded.shift(),excluded.shift(),excluded.join("").trim()]
        } else {
            excluded = excluded.shift()
        }
        let type, filter, seperator
        if(typeof excluded==="string"){
            type = ""
            seperator = null
            filter = excluded.replace(/\s|-|_/g,"")
        } else {
            type = excluded[0].replace(/\s|-|_/g,"")
            seperator = excluded[1]?.trim()??null
            filter = (excluded[2]??type).trim()
        }
        if(seperator===":"){
            // if(type===("format")||type===("formats")){
            //     exclude.formats["format: "+filter] = true
            //     continue
            // }
            if(type===("genre")||type===("genres")){
                exclude.genres["genre: "+filter] = true
                continue
            }
            if(type===("tagcategory")||type===("tagcategories")){
                exclude.categories["tag category: "+filter] = true
                continue
            }
            if(type===("tag")||type===("tags")){
                exclude.tags["tag: "+filter] = true
                continue
            }
            if(type===("studio")||type===("studios")){
                exclude.studios["studio: "+filter] = true
                continue
            }
            if(type===("staffrole")||type===("staffroles")){
                exclude.roles["staff role: "+filter] = true
                continue
            }
            if(type===("staff")||type===("staffs")){
                exclude.staffs["staff: "+filter] = true
                continue
            }
        } else if(!seperator){
            if(filter===("year")||filter===("years")){
                includeYear = false
                continue
            }
            if(filter===("averagescores")
                ||filter===("averagescore")
                ||filter===("avescores")
                ||filter===("avescore")){
                includeAverageScore = false
                continue
            }
        }
    }
    // For Alert user if Scored List is 0
    // to have a better recommendation
    if(jsonIsEmpty(g.savedAnimeEntries)){
        g.userListCount = 1000 // Stop User Alert
        g.savedUserEntries = []
    } else {
        g.userListCount = 0
        g.savedUserEntries = g.savedUserEntries.reduce((result, userEntryIDs)=>{
            let userAnimeID = userEntryIDs?.media?.id
            let userEntry = {}
            if(userAnimeID&&g.savedAnimeEntries[userAnimeID]){
                userEntry.media = g.savedAnimeEntries[userAnimeID]
                userEntry.status = userEntryIDs.status
                userEntry.score = userEntryIDs.score
                result.push(userEntry)
            }
            return result
        },[])
    }
    // sort by popularity for unique anime in franchise
    if(g.savedUserEntries.length>1){
        if( typeof g.savedUserEntries[0]?.score==="number"
            &&typeof g.savedUserEntries[1]?.score==="number"
            &&typeof g.savedUserEntries[0]?.media?.popularity==="number"
            &&typeof g.savedUserEntries[1]?.media?.popularity==="number"){
            g.savedUserEntries.sort((a,b)=>{
                return b.score-a.score
            })
            g.savedUserEntries.sort((a,b)=>{
                if(a.score===b.score){
                    return b.media.popularity-a.media.popularity
                }
            })
        }
    }
    // For Linear Regression Models
    // let episodes = []
    // let duration = []
    let averageScore = []
    // let trending = []
    // let popularity = []
    // let favourites = []
    let year = []
    //
    // let formatMeanCount = {}
    let genresMeanCount = {}
    let tagsMeanCount = {}
    let studiosMeanCount = {}
    let staffMeanCount = {}
    // Analyze each Anime Variable
    let includedAnimeRelations = {}
    for(let i=0; i<g.savedUserEntries.length; i++){
        let anime = g.savedUserEntries[i]?.media
        let status = g.savedUserEntries[i]?.status        
        let anilistId = anime?.id
        // let title = anime?.title?.userPreferred
        let userScore = g.savedUserEntries?.[i]?.score
        // Save every anime status in userlist
        if(anilistId){
            if(status){
                g.userEntriesStatus.userStatus[anilistId] = status
            }
            if(userScore){
                g.userEntriesStatus.userScore[anilistId] = userScore
            }
        }
        // Variables
        // let format = anime?.format
        let genres = anime?.genres || []
        let tags = anime?.tags || []
        let studios = anime?.studios?.nodes || []
        let staffs = anime?.staff?.edges || []
        if(userScore>0){
            // Check if a related anime is already analyzed
            if(includedAnimeRelations[anilistId]) continue
            includedAnimeRelations[anilistId] = true
            let animeFranchise = g.savedAnimeFranchises.find((e)=>{
                if(e instanceof Array){
                    return e.includes(anilistId)
                }
            })
            // First Check
            if(animeFranchise instanceof Array){
                if(animeFranchise.length>0){
                    animeFranchise.forEach((relatedID)=>{
                        if(typeof relatedID==="number"){
                            includedAnimeRelations[relatedID] = true
                        }
                    })
                }
            }
            // Second Check for Recent Anime
            if(anime?.relations){
                let animeRelations = anime?.relations?.edges || []
                for(let j=0;j<animeRelations.length;j++){
                    let animeRelationNode = animeRelations?.[j]?.node
                    let animeRelationType = animeRelations?.[j]?.relationType
                    if(animeRelationNode&&animeRelationType&&typeof animeRelationType==="string"){
                        // Other characters may cast at a completely different anime
                        if(typeof animeRelationNode?.id==="number"&&mediaRelationTypes.includes(animeRelationType.trim().toLowerCase())){
                            includedAnimeRelations[animeRelationNode.id] = true
                        }
                    }
                }
            }
            // Include Anime Count
            ++g.userListCount
            // Formats
            // if(typeof format==="string"){
            //     let fullFormat = "format: "+format.trim().toLowerCase()
            //     if(!jsonIsEmpty(include.formats)){
            //         if((include.formats[fullFormat]&&!exclude.formats[fullFormat]
            //             &&!exclude.formats["format: all"])||include.formats["format: all"]){
            //             if(g.varScheme.format[fullFormat]){
            //                 g.varScheme.format[fullFormat].userScore.push(userScore)
            //                 ++g.varScheme.format[fullFormat].count
            //             } else {
            //                 g.varScheme.format[fullFormat] = {userScore:[userScore],count:1}
            //             }
            //             if(formatMeanCount[fullFormat]){
            //                 ++formatMeanCount[fullFormat]
            //             } else {
            //                 formatMeanCount[fullFormat] = 1
            //             }
            //         }
            //     } else {
            //         if((!exclude.formats[fullFormat]
            //             &&!exclude.formats["format: all"])||include.formats["format: all"]){
            //             if(g.varScheme.format[fullFormat]){
            //                 g.varScheme.format[fullFormat].userScore.push(userScore)
            //                 ++g.varScheme.format[fullFormat].count                            
            //             } else {
            //                 g.varScheme.format[fullFormat] = {userScore:[userScore],count:1}
            //             }
            //             if(formatMeanCount[fullFormat]){
            //                 ++formatMeanCount[fullFormat]
            //             } else {
            //                 formatMeanCount[fullFormat] = 1
            //             }
            //         }
            //     }
            // }
            // Genres
            for(let j=0; j<genres.length; j++){
                let genre = genres[j]
                if(typeof genre==="string"){
                    let fullGenre = "genre: "+genre.trim().toLowerCase()
                    if(!jsonIsEmpty(include.genres)){
                        if(((include.genres[fullGenre]&&!exclude.genres[fullGenre])
                            ||include.genres["genre: all"])
                            &&!exclude.genres["genre: all"]){
                            if(g.varScheme.genres[fullGenre]){
                                g.varScheme.genres[fullGenre].userScore.push(userScore)
                                ++g.varScheme.genres[fullGenre].count
                            } else {
                                g.varScheme.genres[fullGenre] = {userScore:[userScore],count:1}
                            }
                            if(genresMeanCount[fullGenre]){
                                ++genresMeanCount[fullGenre]
                            } else {
                                genresMeanCount[fullGenre] = 1
                            }
                        }
                    } else {
                        if((!exclude.genres[fullGenre]||include.genres["genre: all"])
                            &&!exclude.genres["genre: all"]){
                            if(g.varScheme.genres[fullGenre]){
                                g.varScheme.genres[fullGenre].userScore.push(userScore)
                                ++g.varScheme.genres[fullGenre].count
                            } else {
                                g.varScheme.genres[fullGenre] = {userScore:[userScore],count:1}
                            }
                            if(genresMeanCount[fullGenre]){
                                ++genresMeanCount[fullGenre]
                            } else {
                                genresMeanCount[fullGenre] = 1
                            }
                        }
                    }
                }
            }
            // Tags
            for(let j=0; j<tags.length; j++){
                let tag = tags[j]?.name
                let tagCategory = tags[j]?.category
                if(typeof tag==="string" && typeof tagCategory==="string" && tags?.[j]?.rank>=50){
                    let fullTag = "tag: "+tag.trim().toLowerCase()
                    let fullTagCategory = "tag category: "+tagCategory.trim().toLowerCase()
                    if(!jsonIsEmpty(include.categories)){
                        if(((include.categories[fullTagCategory]&&!exclude.categories[fullTagCategory])
                            ||include.categories["tag category: all"])
                            &&!exclude.categories["tag category: all"]){
                            if(!jsonIsEmpty(include.tags)){
                                if(((include.tags[fullTag]&&!exclude.tags[fullTag])
                                    ||include.tags["tag: all"])
                                    &&!exclude.tags["tag: all"]){
                                    if(g.varScheme.tags[fullTag]){
                                        g.varScheme.tags[fullTag].userScore.push(userScore)
                                        ++g.varScheme.tags[fullTag].count
                                    } else {
                                        g.varScheme.tags[fullTag] = {userScore:[userScore],count:1}
                                    }
                                    if(tagsMeanCount[fullTag]){
                                        ++tagsMeanCount[fullTag]
                                    } else {
                                        tagsMeanCount[fullTag] = 1
                                    }
                                }
                            } else {
                                if((!exclude.tags[fullTag]||include.tags["tag: all"])
                                    &&!exclude.tags["tag: all"]){
                                    if(g.varScheme.tags[fullTag]){
                                        g.varScheme.tags[fullTag].userScore.push(userScore)
                                        ++g.varScheme.tags[fullTag].count
                                    } else {
                                        g.varScheme.tags[fullTag] = {userScore:[userScore],count:1}
                                    }
                                    if(tagsMeanCount[fullTag]){
                                        ++tagsMeanCount[fullTag]
                                    } else {
                                        tagsMeanCount[fullTag] = 1
                                    }
                                }
                            }
                        }
                    } else {
                        if((!exclude.categories[fullTagCategory]||include.categories["tag category: all"])
                            &&!exclude.categories["tag category: all"]){
                            if(!jsonIsEmpty(include.tags)){
                                if(((include.tags[fullTag]&&!exclude.tags[fullTag])
                                    ||include.tags["tag: all"])
                                    &&!exclude.tags["tag: all"]){
                                    if(g.varScheme.tags[fullTag]){
                                        g.varScheme.tags[fullTag].userScore.push(userScore)
                                        ++g.varScheme.tags[fullTag].count
                                    } else {
                                        g.varScheme.tags[fullTag] = {userScore:[userScore],count:1}
                                    }
                                    if(tagsMeanCount[fullTag]){
                                        ++tagsMeanCount[fullTag]
                                    } else {
                                        tagsMeanCount[fullTag] = 1
                                    }
                                }
                            } else {
                                if((!exclude.tags[fullTag]||include.tags["tag: all"])
                                    &&!exclude.tags["tag: all"]){
                                    if(g.varScheme.tags[fullTag]){
                                        g.varScheme.tags[fullTag].userScore.push(userScore)
                                        ++g.varScheme.tags[fullTag].count
                                    } else {
                                        g.varScheme.tags[fullTag] = {userScore:[userScore],count:1}
                                    }
                                    if(tagsMeanCount[fullTag]){
                                        ++tagsMeanCount[fullTag]
                                    } else {
                                        tagsMeanCount[fullTag] = 1
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // Studios
            let includedStudios = {}
            for(let j=0; j<studios.length; j++){
                if(!studios[j]?.isAnimationStudio) continue
                let studio = studios[j]?.name
                if(typeof studio==="string"){
                    if(includedStudios[studio]) continue
                    includedStudios[studio] = true
                    let fullStudio = "studio: "+studio.trim().toLowerCase()
                    if(!jsonIsEmpty(include.studios)){
                        if(((include.studios[fullStudio]&&!exclude.studios[fullStudio])
                            ||include.studios["studio: all"])
                            &&!exclude.studios["studio: all"]){
                            if(g.varScheme.studios[fullStudio]){
                                g.varScheme.studios[fullStudio].userScore.push(userScore)
                                ++g.varScheme.studios[fullStudio].count
                            } else {
                                g.varScheme.studios[fullStudio] = {userScore:[userScore],count:1}
                            }
                            if(studiosMeanCount[fullStudio]){
                                ++studiosMeanCount[fullStudio]
                            } else {
                                studiosMeanCount[fullStudio] = 1                                
                            }
                        }
                    } else {
                        if((!exclude.studios[fullStudio]||include.studios["studio: all"])
                            &&!exclude.studios["studio: all"]){
                            if(g.varScheme.studios[fullStudio]){
                                g.varScheme.studios[fullStudio].userScore.push(userScore)
                                ++g.varScheme.studios[fullStudio].count
                            } else {
                                g.varScheme.studios[fullStudio] = {userScore:[userScore],count:1}
                            }
                            if(studiosMeanCount[fullStudio]){
                                ++studiosMeanCount[fullStudio]
                            } else {
                                studiosMeanCount[fullStudio] = 1
                            }
                        }
                    }
                }
            }
            // Staffs
            let includedStaff = {}
            for(let j=0; j<staffs.length; j++){
                let staff = staffs[j]?.node?.name?.userPreferred
                if(typeof staff==="string"&&typeof staffs[j]?.role==="string"){
                    if(includedStaff[staff]) continue
                    includedStaff[staff] = true
                    let staffRole = staffs[j].role.split("(")[0].trim()
                    let fullStaff = "staff: "+staff.trim().toLowerCase()
                    let fullStaffRole = "staff role: "+staffRole.trim().toLowerCase()
                    if(!jsonIsEmpty(include.roles)){
                        if(((include.roles[fullStaffRole]&&!exclude.roles[fullStaffRole])
                            ||include.roles["staff role: all"])
                            &&!exclude.roles["staff role: all"]){
                            if(!jsonIsEmpty(include.staffs)){
                                if(((include.staffs[fullStaff]&&!exclude.staffs[fullStaff])
                                    ||include.staffs["staff: all"])
                                    &&!exclude.staffs["staff: all"]){
                                    if(g.varScheme.staff[fullStaff]){
                                        g.varScheme.staff[fullStaff].userScore.push(userScore)
                                        ++g.varScheme.staff[fullStaff].count
                                    } else {
                                        g.varScheme.staff[fullStaff] = {userScore:[userScore],count:1}
                                    }
                                    if(staffMeanCount[fullStaff]){
                                        ++staffMeanCount[fullStaff]
                                    } else {
                                        staffMeanCount[fullStaff] = 1
                                    }
                                }
                            } else {
                                if((!exclude.staffs[fullStaff]||include.staffs["staff: all"])
                                    &&!exclude.staffs["staff: all"]){
                                    if(g.varScheme.staff[fullStaff]){
                                        g.varScheme.staff[fullStaff].userScore.push(userScore)
                                        ++g.varScheme.staff[fullStaff].count
                                    } else {
                                        g.varScheme.staff[fullStaff] = {userScore:[userScore],count:1}
                                    }
                                    if(staffMeanCount[fullStaff]){
                                        ++staffMeanCount[fullStaff]
                                    } else {
                                        staffMeanCount[fullStaff] = 1
                                    }
                                }
                            }
                        }
                    } else {
                        if((!exclude.roles[fullStaffRole]||include.roles["staff role: all"])
                            &&!exclude.roles["staff role: all"]){
                            if(!jsonIsEmpty(include.staffs)){
                                if(((include.staffs[fullStaff]&&!exclude.staffs[fullStaff])
                                    ||include.staffs["staff: all"])
                                    &&!exclude.staffs["staff: all"]){
                                    if(g.varScheme.staff[fullStaff]){
                                        g.varScheme.staff[fullStaff].userScore.push(userScore)
                                        ++g.varScheme.staff[fullStaff].count
                                    } else {
                                        g.varScheme.staff[fullStaff] = {userScore:[userScore],count:1}
                                    }
                                    if(staffMeanCount[fullStaff]){
                                        ++staffMeanCount[fullStaff]
                                    } else {
                                        staffMeanCount[fullStaff] = 1
                                    }
                                }
                            } else {
                                if((!exclude.staffs[fullStaff]||include.staffs["staff: all"])
                                    &&!exclude.staffs["staff: all"]){
                                    if(g.varScheme.staff[fullStaff]){
                                        g.varScheme.staff[fullStaff].userScore.push(userScore)
                                        ++g.varScheme.staff[fullStaff].count
                                    } else {
                                        g.varScheme.staff[fullStaff] = {userScore:[userScore],count:1}
                                    }
                                    if(staffMeanCount[fullStaff]){
                                        ++staffMeanCount[fullStaff]
                                    } else {
                                        staffMeanCount[fullStaff] = 1
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // Number
            // if(isaN(anime?.episodes)){
            //     episodes.push({userScore: userScore, episodes: anime.episodes})
            // }
            // if(isaN(anime?.duration)){
            //     duration.push({userScore: userScore, duration: anime.duration})
            // }
            if(isaN(anime?.averageScore)){
                averageScore.push({userScore: userScore, averageScore: anime.averageScore})
            }
            // if(isaN(anime?.trending)){
            //     trending.push({userScore: userScore, trending: anime.trending})
            // }
            // if(isaN(anime?.popularity)){
            //     popularity.push({userScore: userScore, popularity: anime.popularity})
            // }
            // if(isaN(anime?.favourites)){
            //     favourites.push({userScore: userScore, favourites: anime.favourites})
            // }
            if(isaN(parseFloat(anime?.seasonYear))){
                year.push({userScore: userScore, year: parseFloat(anime.seasonYear)})
            }
        }
    }
    // Clean Data JSON
    // if(sampleSize>=0){
    //     formatMeanCount = sampleSize
    // } else if(!jsonIsEmpty(formatMeanCount)){
    //     let formatCountValues = Object.values(formatMeanCount)
    //     let formatCountMode = arrayMode(formatCountValues)
    //     let formatCountMean = arrayMean(formatCountValues)
    //     let tempformatMeanCount = formatCountMean>=33? 33 : Math.max(formatCountMode,formatCountMean)
    //     formatMeanCount = tempformatMeanCount
    // } else {
    //     formatMeanCount = 10
    // }
    // if(minSampleSize>=0){
    //     formatMeanCount = Math.max(minSampleSize,formatMeanCount)
    // }
    if(sampleSize>=0){
        genresMeanCount = sampleSize
    } else if(!jsonIsEmpty(genresMeanCount)){
        let genresCountValues = Object.values(genresMeanCount)
        let genresCountMode = arrayMode(genresCountValues)
        let genresCountMean = arrayMean(genresCountValues)
        let tempgenresMeanCount = genresCountMean>=33? 33 : Math.max(genresCountMode,genresCountMean)
        genresMeanCount = tempgenresMeanCount
    } else {
        genresMeanCount = 10
    }
    if(minSampleSize>=0){
        genresMeanCount = Math.max(minSampleSize,genresMeanCount)
    }

    if(sampleSize>=0){
        tagsMeanCount = sampleSize
    } else if(!jsonIsEmpty(tagsMeanCount)){
        let tagsCountValues = Object.values(tagsMeanCount)
        let tagsCountMode = arrayMode(tagsCountValues)
        let tagsCountMean = arrayMean(tagsCountValues)
        let temptagsMeanCount = tagsCountMean>=33? 33 : Math.max(tagsCountMode,tagsCountMean)
        tagsMeanCount = temptagsMeanCount
    } else {
        tagsMeanCount = 10
    }
    if(minSampleSize>=0){
        tagsMeanCount = Math.max(minSampleSize,tagsMeanCount)
    }

    if(sampleSize>=0){
        studiosMeanCount = sampleSize
    } else if(!jsonIsEmpty(studiosMeanCount)){
        let studiosCountValues = Object.values(studiosMeanCount)
        let studiosCountMode = arrayMode(studiosCountValues)
        let studiosCountMean = arrayMean(studiosCountValues)
        let tempstudiosMeanCount = studiosCountMean>=33? 33 : Math.max(studiosCountMode,studiosCountMean)
        studiosMeanCount = tempstudiosMeanCount
    } else {
        studiosMeanCount = 10
    }
    if(minSampleSize>=0){
        studiosMeanCount = Math.max(minSampleSize,studiosMeanCount)
    }

    if(sampleSize>=0){
        staffMeanCount = sampleSize
    } else if(!jsonIsEmpty(staffMeanCount)){
        let staffCountValues = Object.values(staffMeanCount)
        let staffCountMode = arrayMode(staffCountValues)
        let staffCountMean = arrayMean(staffCountValues)
        let tempstaffMeanCount = staffCountMean>=33? 33 : Math.max(staffCountMode,staffCountMean)
        staffMeanCount = tempstaffMeanCount
    } else {
        staffMeanCount = 10
    }
    if(minSampleSize>=0){
        staffMeanCount = Math.max(minSampleSize,staffMeanCount)
    }
    // If User List Scores is Empty
    if(g.userListCount<1){
        g.varScheme={}
    } else {
        g.varScheme.includeUnknownVar = includeUnknownVar
        g.varScheme.minPopularity = minPopularity
        g.varScheme.minAverageScore = minAverageScore
    }
    if(!jsonIsEmpty(g.varScheme)){
        // let formatKey = Object.keys(g.varScheme.format)
        // let formatMean = []
        // // Format
        // for(let i=0; i<formatKey.length; i++){
        //     if(measure==="mode"){
        //         formatMean.push(arrayMode(g.varScheme.format[formatKey[i]].userScore))
        //     } else {
        //         formatMean.push(arrayMean(g.varScheme.format[formatKey[i]].userScore))
        //     }
        // }
        // formatMean = arrayMode(formatMean)
        // for(let i=0; i<formatKey.length; i++){
        //     let tempScore = 0
        //     if(measure==="mode"){
        //         tempScore = arrayMode(g.varScheme.format[formatKey[i]].userScore)
        //     } else {
        //         tempScore = arrayMean(g.varScheme.format[formatKey[i]].userScore)
        //     }
        //     // Include High Weight or Low scored Variables to avoid High-scored Variables without enough sample
        //     let count = g.varScheme.format[formatKey[i]].count
        //     if(count>=formatMeanCount||tempScore<formatMean){ 
        //         g.varScheme.format[formatKey[i]] = tempScore
        //     } else {
        //         delete g.varScheme.format[formatKey[i]]
        //     }
        // }
        // Genres
        let genresKey = Object.keys(g.varScheme.genres)
        let genresMean = []
        for(let i=0; i<genresKey.length; i++){
            if(measure==="mode"){
                genresMean.push(arrayMode(g.varScheme.genres[genresKey[i]].userScore))
            } else {
                genresMean.push(arrayMean(g.varScheme.genres[genresKey[i]].userScore))
            }
        }
        genresMean = arrayMean(genresMean)
        for(let i=0; i<genresKey.length; i++){
            let tempScore = 0
            if(measure==="mode"){
                tempScore = arrayMode(g.varScheme.genres[genresKey[i]].userScore)
            } else {
                tempScore = arrayMean(g.varScheme.genres[genresKey[i]].userScore)
            }
            // Include High Weight or Low scored Variables to avoid High-scored Variables without enough sample
            let count = g.varScheme.genres[genresKey[i]].count
            if(count>=genresMeanCount||tempScore<genresMean){
                g.varScheme.genres[genresKey[i]] = tempScore
            } else {
                delete g.varScheme.genres[genresKey[i]]
            }
        }
        // Tags
        let tagsKey = Object.keys(g.varScheme.tags)
        let tagsMean = []
        for(let i=0; i<tagsKey.length; i++){
            if(measure==="mode"){
                tagsMean.push(arrayMode(g.varScheme.tags[tagsKey[i]].userScore))
            } else {
                tagsMean.push(arrayMean(g.varScheme.tags[tagsKey[i]].userScore))
            }
        }
        tagsMean = arrayMean(tagsMean)
        for(let i=0; i<tagsKey.length; i++){
            let tempScore = 0
            if(measure==="mode"){
                tempScore = arrayMode(g.varScheme.tags[tagsKey[i]].userScore)
            } else {
                tempScore = arrayMean(g.varScheme.tags[tagsKey[i]].userScore)
            }
            // Include High Weight or Low scored Variables to avoid High-scored Variables without enough sample
            let count = g.varScheme.tags[tagsKey[i]].count
            if(count>=tagsMeanCount||tempScore<tagsMean){
                g.varScheme.tags[tagsKey[i]] = tempScore
            } else {
                delete g.varScheme.tags[tagsKey[i]]
            }
        }
        // Studios
        let studiosKey = Object.keys(g.varScheme.studios)
        let studiosMean = []
        for(let i=0; i<studiosKey.length; i++){
            if(measure==="mode"){
                studiosMean.push(arrayMode(g.varScheme.studios[studiosKey[i]].userScore))
            } else {
                studiosMean.push(arrayMean(g.varScheme.studios[studiosKey[i]].userScore))
            }
        }
        studiosMean = arrayMean(studiosMean)
        for(let i=0; i<studiosKey.length; i++){
            let tempScore = 0
            if(measure==="mode"){
                tempScore = arrayMode(g.varScheme.studios[studiosKey[i]].userScore)
            } else {
                tempScore = arrayMean(g.varScheme.studios[studiosKey[i]].userScore)
            }
            // Include High Weight or Low scored Variables to avoid High-scored Variables without enough sample
            let count = g.varScheme.studios[studiosKey[i]].count
            if(count>=studiosMeanCount||(count>=(minSampleSize??2))&&tempScore<studiosMean){
                g.varScheme.studios[studiosKey[i]] = tempScore
            } else {
                delete g.varScheme.studios[studiosKey[i]]
            }
        }
        // Staffs
        let staffKey = Object.keys(g.varScheme.staff)
        let staffMean = []
        for(let i=0; i<staffKey.length; i++){
            if(measure==="mode"){
                staffMean.push(arrayMode(g.varScheme.staff[staffKey[i]].userScore))
            } else {
                staffMean.push(arrayMean(g.varScheme.staff[staffKey[i]].userScore))
            }
        }
        staffMean = arrayMean(staffMean)
        for(let i=0; i<staffKey.length; i++){
            let tempScore = 0
            if(measure==="mode"){
                tempScore = arrayMode(g.varScheme.staff[staffKey[i]].userScore)
            } else {
                tempScore = arrayMean(g.varScheme.staff[staffKey[i]].userScore)
            }
            // Include High Weight or Low scored Variables to avoid High-scored Variables without enough sample
            let count = g.varScheme.staff[staffKey[i]].count
            if(count>=staffMeanCount||(count>=(minSampleSize??2))&&tempScore<staffMean){
                g.varScheme.staff[staffKey[i]] = tempScore
            } else {
                delete g.varScheme.staff[staffKey[i]]
            }
        }
        // Join Data
        // g.varScheme.meanFormat = formatMean
        g.varScheme.meanGenres = genresMean
        g.varScheme.meanTags = tagsMean
        g.varScheme.meanStudios = studiosMean
        g.varScheme.meanStaff = staffMean
        g.varScheme.includeRoles = include.roles
        g.varScheme.excludeRoles = exclude.roles
        g.varScheme.includeCategories = include.categories
        g.varScheme.excludeCategories = exclude.categories
        g.varScheme.measure = measure
        // Create Model for Numbers| y is predicted so userscore
        // Average Score Model
        // const r2Thresh = 0.1 // Lower than 0.3 Since Media is Subjective
        // For Anime Date Model
        // let animeDateModel = []
        if(includeYear){
            let yearXY = []
            for(let i=0; i<year.length;i++){
                yearXY.push([year[i].year,year[i].userScore])
            }
            if(yearXY.length>=(minSampleSize||33)){
                // let tempLinearReg = linearRegression(yearXY)
                // animeDateModel.push([tempLinearReg,"yearModel"])
                g.varScheme.yearModel = linearRegression(yearXY)
            }
        }
        // let sortedAnimeDateModels = animeDateModel.sort(function(a, b) {
        //     return b[0].r2 - a[0].r2;
        // })
        // if(sortedAnimeDateModels.length>0){
        //     sortedAnimeDateModels = sortedAnimeDateModels[0]
        //     g.varScheme[sortedAnimeDateModels[1]] = sortedAnimeDateModels[0]
        // }
        // For Anime Length Models
        // let animeLengthModels = []
        // let episodesXY = []
        // for(let i=0; i<episodes.length;i++){
        //     episodesXY.push([episodes[i].episodes,episodes[i].userScore])
        // }
        // if(episodesXY.length>=(minSampleSize||33)){
        //     let tempLinearReg = linearRegression(episodesXY)
        //     animeLengthModels.push([tempLinearReg,"episodesModel"])
        // }
        // let durationXY = []
        // for(let i=0; i<duration.length;i++){
        //     durationXY.push([duration[i].duration,duration[i].userScore])
        // }
        // if(durationXY.length>=(minSampleSize||33)){
        //     let tempLinearReg = linearRegression(durationXY)
        //     animeLengthModels.push([tempLinearReg,"durationModel"])
        // }
        // let sortedAnimeLengthModels = animeLengthModels.sort(function(a, b) {
        //     return b[0].r2 - a[0].r2;
        // })
        // if(sortedAnimeLengthModels.length>0){
        //     sortedAnimeLengthModels = sortedAnimeLengthModels[0]
        //     g.varScheme[sortedAnimeLengthModels[1]] = sortedAnimeLengthModels[0]
        // }
        // For Popularity Models
        // let wellKnownAnimeModels = []
        if(includeAverageScore){
            let averageScoreXY = []
            for(let i=0; i<averageScore.length;i++){
                averageScoreXY.push([averageScore[i].averageScore,averageScore[i].userScore])
            }
            if(averageScoreXY.length>=(minSampleSize||33)){
                // let tempLinearReg = linearRegression(averageScoreXY)
                // wellKnownAnimeModels.push([tempLinearReg,"averageScoreModel"])
                g.varScheme.averageScoreModel = linearRegression(averageScoreXY)
            }
        }
        // let trendingXY = []
        // for(let i=0; i<trending.length;i++){
        //     trendingXY.push([trending[i].trending,trending[i].userScore])
        // }
        // if(trendingXY.length>=(minSampleSize||33)){
        //     let tempLinearReg = linearRegression(trendingXY)
        //     wellKnownAnimeModels.push([tempLinearReg,"trendingModel"])
        // }
        // let popularityXY = []
        // for(let i=0; i<popularity.length;i++){
        //     popularityXY.push([popularity[i].popularity,popularity[i].userScore])
        // }
        // if(popularityXY.length>=(minSampleSize||33)){
        //     let tempLinearReg = linearRegression(popularityXY)
        //     wellKnownAnimeModels.push([tempLinearReg,"popularityModel"])
        // }
        // let favouritesXY = []
        // for(let i=0; i<favourites.length;i++){
        //     favouritesXY.push([favourites[i].favourites,favourites[i].userScore])
        // }
        // if(favouritesXY.length>=(minSampleSize||33)){
        //     let tempLinearReg = linearRegression(favouritesXY)
        //     wellKnownAnimeModels.push([tempLinearReg,"favouritesModel"])
        // }
        // let sortedWellKnownAnimeModels = wellKnownAnimeModels.sort(function(a, b) {
        //     return b[0].r2 - a[0].r2;
        // })
        // if(sortedWellKnownAnimeModels.length>0){
        //     sortedWellKnownAnimeModels = sortedWellKnownAnimeModels[0]
        //     g.varScheme[sortedWellKnownAnimeModels[1]] = sortedWellKnownAnimeModels[0]
        // }
        }
        return resolve()
    })
}
async function postWorker(){
    return await new Promise(async(resolve)=>{
        await saveJSON(g.savedUserEntries,'savedUserEntries')
        // Temporarily Saved
        if(g.deepUpdateStartTime){
            await saveJSON(g.deepUpdateStartTime,'deepUpdateStartTime')
        }
        await saveJSON(g.varScheme,'varScheme')
        await saveJSON(g.userEntriesStatus,'userEntriesStatus')
        await saveJSON(g.alteredVariables,'alteredVariables')
        // Update Main Algorithm Filters
        if(!g.anUpdate){
            await saveJSON(g.savedFilterAlgo,"savedFilterAlgo")
            self.postMessage({status:'update', savedFilterAlgo: g.savedFilterAlgo})
        }
        // Update Interval Time
        let timeInterval = (new Date).getTime()-g.analyzeVariableStartTime.getTime()
        if(g.savedAnalyzeVariableTime.length<33){
            await g.savedAnalyzeVariableTime.push(Math.ceil(timeInterval/1000))
        } else {
            await g.savedAnalyzeVariableTime.shift()
            await g.savedAnalyzeVariableTime.push(Math.ceil(timeInterval/1000))
        }
        await saveJSON(g.savedAnalyzeVariableTime, "savedAnalyzeVariableTime")
        self.postMessage({status:'update',savedAnalyzeVariableTime: g.savedAnalyzeVariableTime})
        // Alert user if Scored List is not Sufficient
        self.postMessage({status:'notify',userListCount: g.userListCount})
        return resolve()
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
            return resolve()
        }
        request.onupgradeneeded = (event) => {
            db = event.target.result
            db.createObjectStore("MyObjectStore")
            return resolve()
        }
    })
}
async function saveJSON(data, name) {
    return await new Promise(async(resolve)=>{
        try {
            let write = db.transaction("MyObjectStore","readwrite").objectStore("MyObjectStore").openCursor()
            write.onsuccess = async(event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if(cursor.key===name){
                        await cursor.update(data)
                        return resolve()
                    }
                    await cursor.continue()
                } else {
                    await db.transaction("MyObjectStore","readwrite").objectStore("MyObjectStore").add(data, name)
                    return resolve()
                }
            }
            write.onerror = async(error) => {
                console.error(error)
                await db.transaction("MyObjectStore","readwrite").objectStore("MyObjectStore").add(data, name)
                return resolve()
            }
        } catch(ex) {
            try{
                console.error(ex)
                await db.transaction("MyObjectStore","readwrite").objectStore("MyObjectStore").add(data, name)
                return resolve()
            } catch(ex2) {
                console.error(ex2)
                return resolve()
            }
        }
    })
}
async function retrieveJSON(name) {
    return await new Promise((resolve)=>{
        try {
            let read = db.transaction("MyObjectStore","readwrite").objectStore("MyObjectStore").get(name)
            read.onsuccess = () => {
                return resolve(read.result)
            }
            read.onerror = (error) => {
                console.error(error)
                return resolve()
            }
        } catch(ex){
            console.error(ex)
            return resolve()
        }
    })
}
async function deleteJSON(name) {
    return await new Promise((resolve)=>{
        try {
            let read = db.transaction("MyObjectStore","readwrite").objectStore("MyObjectStore").delete(name)
            read.onsuccess = (event) => {
                return resolve()
            }
            read.onerror = (error) => {
                console.error(error)
                return resolve()
            }
        } catch(ex) {
            console.error(ex)
            return resolve()
        }
    })
}
function equalsNCS(str1, str2) {
    let s1 = str1
    let s2 = str2
    if(typeof s1==="number") s1 = s1.toString()
    if(typeof s2==="number") s2 = s2.toString()
    if(typeof s1==="string") s1 = s1.trim().toLowerCase()
    if(typeof s2==="string") s2 = s2.trim().toLowerCase()
    return s1 === s2
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
function arrayMean(obj) {
    return (arraySum(obj) / obj.length) || 0
}
function arraySum(obj) {
    return obj.reduce((a, b) => a + b, 0)
}
function arrayMode(obj){
    if(obj.length===0){return}
    else if(obj.length===1){return obj[0]}
    else if(obj.length===2){return (obj[0]+obj[1])/2}
    let max = parseFloat(Math.max(...obj))
    let min = parseFloat(Math.min(...obj))
    const boundary = 1-6e-17!==1? 6e-17 : 1e-16 // Min Value Javascript
    let classW = parseFloat(((max-min)/(1.0+(3.322*Math.log(obj.length)))))
    let classIs = []
    if(max===min||classW<boundary){ // To avoid Inf loop if classWidth is very small
        classIs = [{low:min,high:max,freq:0}]
    } else {
        let high = min+classW-boundary, low = min
        classIs = [{low:low,high:high,freq:0}]
        while(classIs.slice(-1)[0].high<max){
            low=high+boundary
            high=low+classW-boundary
            classIs.push({low:low,high:high,freq:0})
        }
    }
    for(let i=0;i<obj.length;i++){
        for(let j=0;j<classIs.length;j++){
            let num = obj[i]
            if(num>=classIs[j].low&&num<=classIs[j].high){ 
                ++classIs[j].freq
                continue
            }
        }
    }
    let modeClass = classIs[0]
    let modeIdx = 0
    for(let i=1;i<classIs.length;i++){
        if(classIs[i].freq>modeClass.freq){
            modeClass = classIs[i]
            modeIdx = i
        }
    }
    let modLowLim = modeClass.low
    let modFreq = modeClass.freq
    let modPreFreq = !classIs[modeIdx-1]?0:classIs[modeIdx-1].freq
    let modSucFreq = !classIs[modeIdx+1]?0:classIs[modeIdx+1].freq
    return modLowLim+(((modFreq-modPreFreq)/((2*modFreq)-modPreFreq-modSucFreq))*classW)
}
    // Linear Regression
function linearRegression(XY){
    let lr = {};
    let n = XY.length;
    let sum_x = 0;
    let sum_y = 0;
    let sum_xy = 0;
    let sum_xx = 0;
    let sum_yy = 0;
    for (let i = 0; i < XY.length; i++) {
        sum_x += XY[i][0];
        sum_y += XY[i][1];
        sum_xy += (XY[i][0]*XY[i][1]);
        sum_xx += (XY[i][0]*XY[i][0]);
        sum_yy += (XY[i][1]*XY[i][1]);
    }
    lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
    lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
    lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);
    return lr;
}