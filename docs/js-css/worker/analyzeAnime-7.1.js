importScripts( "../ajax.js" );
let g = {}, request, db;
const minNumber = 1-6e-17!==1? 6e-17 : 1e-16 // Min Value Javascript
const mediaRelationTypes = ["adaptation","prequel","sequel","parent","side_story","summary","alternative","spin_off"]

self.onmessage = async({data}) => {
    if(!db){ await IDBinit() }
    g = await data
    await preWorker().then(async()=>{
        return await mainWorker()
    }).then(async()=>{
        return await postWorker()
    }).then(()=>{
        self.postMessage({status:'loadData'})
        if(g.returnInfo==='init'){
            self.postMessage({status:'updateAnime',returnInfo:'getNewAnime'})
            self.postMessage({status:'backUpData',saveBackupDate:false})
        } else if(g.returnInfo==='getNewAnime'){
            self.postMessage({status:'notify',alertUser:true})
            self.postMessage({status:'updateAnime',returnInfo:'updateNewAnime'})
            self.postMessage({status:'backUpData',saveBackupDate:true})
        } else if(g.returnInfo==='updateNewAnime'){
            self.postMessage({status:'notify',clearUpdateStatus:true})
            self.postMessage({status:'notify',alertUser:true})
            self.postMessage({status:'backUpData',saveBackupDate:true})
        } else if(g.returnInfo==='getAllAnime'){
            self.postMessage({status:'notify',clearUpdateStatus:true})
            self.postMessage({status:'notify',alertUser:true})
            self.postMessage({status:'backUpData',saveBackupDate:true})
        } else if(g.returnInfo==='notAnUpdate'){
            self.postMessage({status:'notify',clearUpdateStatus:true})
            self.postMessage({status:'notAnUpdate'})
        } else {
            self.postMessage({status:'notify',clearUpdateStatus:true})
            self.postMessage({status:'notify',alertUser:true})
            self.postMessage({status:'backUpData',saveBackupDate:true})
        }
    })
}

async function preWorker(){
    return await new Promise(async(resolve)=>{
        // Notify User
        g.savedUpdateAnalyzeAnimeTime = await retrieveJSON('savedUpdateAnalyzeAnimeTime') ?? [15]
        g.updateAnalyzeAnimeTime = Math.ceil(arrayMean(g.savedUpdateAnalyzeAnimeTime))
        self.postMessage({status:'notify', updateAnalyzeAnimeTime: g.updateAnalyzeAnimeTime})  // Notify User for the Update
        g.updateAnalyzeAnimeStartTime = new Date()
        // retrieve
        g.animeEntries = Object.values(await retrieveJSON('savedAnimeEntries') ?? {})
        g.savedUsername = await retrieveJSON('savedUsername') ?? ''
        g.allFilterInfo = await retrieveJSON('allFilterInfo') ?? {}
        g.hideUnwatchedSequels = await retrieveJSON('hideUnwatchedSequels') ?? true
        // Temporarily Saved
        g.userEntriesStatus = await retrieveJSON('userEntriesStatus') ?? {}
        if(!jsonIsEmpty(g.userEntriesStatus)&&g.returnInfo==='updateNewAnime'){
            deleteJSON('userEntriesStatus')
        }
        g.varScheme = await retrieveJSON('varScheme') ?? {}
        if(!jsonIsEmpty(g.varScheme)&&g.returnInfo==='updateNewAnime'){
            deleteJSON('varScheme')
        }
        g.deepUpdateStartTime = await retrieveJSON('deepUpdateStartTime') ?? false
        if(g.deepUpdateStartTime&&g.returnInfo==='getAllAnime'){
            g.savedDeepUpdateTime = await retrieveJSON('savedDeepUpdateTime') ?? [6700]
            deleteJSON('deepUpdateStartTime')
        }
        // Alter
        g.savedRecScheme = {}
        g.savedUserScores = {
            all: {},
            above: {}
        }
        return resolve()
    })
}
async function mainWorker(){
    return await new Promise((resolve)=>{
        // Algorithm Configs
        const measure = g.varScheme?.measure || "mean"
        const includeUnknownVar = g.varScheme?.includeUnknownVar ?? true
        const popularityArray = g.animeEntries.map((anime)=>{
                                        let popularity = anime?.popularity
                                        if(typeof popularity==="number"){
                                            return popularity
                                        }
                                    })
        const popularitySum = popularityArray.length? arraySum(popularityArray) : 3000000
        const popularityMode = g.varScheme?.minPopularity? g.varScheme.minPopularity : 0.33*Math.min(arrayMean(popularityArray),arrayMode(popularityArray))
        const averageScoreMode = g.varScheme?.minAverageScore || 50-0.33
        // Algorithm Configs
        g.savedAnimeFranchises = []
        //
        if(!jsonIsEmpty(g.varScheme)){
            let userScores = Object.values(g.userEntriesStatus.userScore)
            let meanUserScore, meanScoreAll, meanScoreAbove, userScoreBase;
            if(userScores?.length){
                let max = Math.max(...userScores)
                let min = Math.min(...userScores)
                userScoreBase = max<=5&&min>=1?5:max<=10&&min>=1?10:100
                meanUserScore = arrayMean(userScores)
            }
            for(let i=0; i<g.animeEntries.length; i++){
                let anime = g.animeEntries[i]
                let title = anime?.title?.userPreferred
                let anilistId = anime?.id
                let animeUrl = anime?.siteUrl
                let format = anime?.format
                let year = anime?.seasonYear
                let season = anime?.season
                let genres = anime?.genres || []
                let tags = anime?.tags || []
                let studios = anime?.studios?.nodes?.filter((studio)=> studio?.isAnimationStudio) || []
                let staffs = anime?.staff?.edges || []
                let status = anime?.status
                let popularity = anime?.popularity
                // Check Status
                // For Unwatched
                let userStatus = "UNWATCHED"
                if(!g.allFilterInfo["user status: "+userStatus.toLowerCase()]
                &&!g.allFilterInfo["!user status: !"+userStatus.toLowerCase()]){
                    g.allFilterInfo["user status: "+userStatus.toLowerCase()] = true
                    g.allFilterInfo["!user status: !"+userStatus.toLowerCase()] = true
                }
                if(typeof g.userEntriesStatus?.userStatus?.[anilistId]==="string"){
                    userStatus = g.userEntriesStatus?.userStatus?.[anilistId]
                    let tmpUserStatus = userStatus.trim().toLowerCase()
                    if(!g.allFilterInfo["user status: "+tmpUserStatus]
                    &&!g.allFilterInfo["!user status: !"+tmpUserStatus]){
                        g.allFilterInfo["user status: "+tmpUserStatus] = true
                        g.allFilterInfo["!user status: !"+tmpUserStatus] = true
                    }
                }
                // Update Anime Franchises
                let afIdxs = g.savedAnimeFranchises.reduce((result,e,idx)=>{
                    if(e instanceof Array){
                        if(e.includes(anilistId)){
                            result.push(idx)
                        }
                    }
                    return result
                },[])
                let afIdx;
                if(afIdxs.length>1||afIdxs.length<1){
                    // Union if there are duplicate franchise
                    if(afIdxs.length>1){
                        let newFranchise = g.savedAnimeFranchises[afIdxs[0]]
                        for(let j=1;j<afIdxs.length;j++){
                            newFranchise = Array.from(new Set(newFranchise.concat(g.savedAnimeFranchises[afIdxs[j]])))
                        }
                        // Remove Old Duplicates
                        afIdxs.sort((a,b)=>b-a)
                        for(let j=0;j<afIdxs.length;j++){
                            g.savedAnimeFranchises.splice(afIdxs[j],1)
                        }
                        // Add New Unioned Franchise
                        g.savedAnimeFranchises.push(newFranchise)
                    // If its a New Franchise
                    } else {
                        g.savedAnimeFranchises.push([anilistId])
                    }
                    // Get the index of the New Franchise
                    afIdx = g.savedAnimeFranchises.length-1
                } 
                // else if there is only one
                else {
                    // Index of Franchise
                    afIdx = g.savedAnimeFranchises.findIndex((e)=>{
                        if(e instanceof Array){
                            return e.includes(anilistId)
                        }
                    })
                }
                // Next add each Anime relations to its franchise
                let animeRelations = anime?.relations?.edges || []
                animeRelations.forEach((e)=>{
                    let animeRelationType = e?.relationType
                    let relationID =  e?.node?.id
                    if(typeof animeRelationType==="string"&&typeof relationID==="number"&&animeRelationType){
                        if(mediaRelationTypes.includes(animeRelationType.trim().toLowerCase())){
                            if(g.savedAnimeFranchises[afIdx] instanceof Array){
                                if(!g.savedAnimeFranchises[afIdx].includes(relationID)){
                                    g.savedAnimeFranchises[afIdx].push(relationID)
                                }
                            }
                        }
                    }
                })
                // Hide Unwatched Sequels
                if(g.hideUnwatchedSequels){
                    let animeRelations = anime?.relations?.edges || []
                    // Conditions
                    let isUnwatchedSequel = 
                    // No Prequel
                    !(animeRelations.some((e)=>{
                        let animeRelationType = e?.relationType
                        if(typeof animeRelationType==="string"){
                            if(animeRelationType.trim().toLowerCase()==="prequel"){
                                return true
                            }
                        }
                    })) 
                    ||  
                    // or Have Prequel but...
                    (animeRelations.some((e)=>{
                        let animeRelationType = e?.relationType
                        let animeRelationPopularity = e?.node?.popularity
                        let animeRelationID = e?.node?.id
                        if(typeof animeRelationType==="string"
                        &&typeof animeRelationID==="number"
                        &&typeof animeRelationPopularity==="number"){
                            if(animeRelationType.trim().toLowerCase()==="prequel"){
                                // ...Prequel is Watched
                                if(typeof g.userEntriesStatus?.userStatus?.[animeRelationID]==="string"){
                                    if((g.userEntriesStatus?.userStatus?.[animeRelationID].trim().toLowerCase()==="completed"
                                    ||g.userEntriesStatus?.userStatus?.[animeRelationID].trim().toLowerCase()==="repeating")){
                                        return true
                                    }
                                // ...Prequel is a Small/Unpopular Anime
                                } else if(!g.userEntriesStatus?.userStatus?.[animeRelationID]&&typeof popularity==="number"){
                                    if(animeRelationPopularity<=popularity){
                                        return true
                                    }
                                }
                            }
                        }
                    }))
                    // Don't Include if Anime Entry 
                    if(!isUnwatchedSequel){
                        delete g.savedRecScheme[anilistId]
                        continue
                    }
                }
                //
                if(!g.allFilterInfo["wscore>="]
                &&!g.allFilterInfo["wscore>"]
                &&!g.allFilterInfo["wscore<"]
                &&!g.allFilterInfo["wscore<="]
                &&!g.allFilterInfo["wscore:"]){
                    g.allFilterInfo["wscore>="] = true
                    g.allFilterInfo["wscore>"] = true
                    g.allFilterInfo["wscore<"] = true
                    g.allFilterInfo["wscore<="] = true
                    g.allFilterInfo["wscore:"] = true
                }
                if(!g.allFilterInfo["score>="]
                &&!g.allFilterInfo["score>"]
                &&!g.allFilterInfo["score<"]
                &&!g.allFilterInfo["score<="]
                &&!g.allFilterInfo["score:"]){
                    g.allFilterInfo["score>="] = true
                    g.allFilterInfo["score>"] = true
                    g.allFilterInfo["score<"] = true
                    g.allFilterInfo["score<="] = true
                    g.allFilterInfo["score:"] = true
                }
                if(!g.allFilterInfo["user score>="]
                &&!g.allFilterInfo["user score>"]
                &&!g.allFilterInfo["user score<"]
                &&!g.allFilterInfo["user score<="]
                &&!g.allFilterInfo["user score:"]){
                    g.allFilterInfo["user score>="] = true
                    g.allFilterInfo["user score>"] = true
                    g.allFilterInfo["user score:"] = true
                    g.allFilterInfo["user score<"] = true
                    g.allFilterInfo["user score<="] = true
                }
                if(!g.allFilterInfo["average score>="]
                &&!g.allFilterInfo["average score>"]
                &&!g.allFilterInfo["average score<"]
                &&!g.allFilterInfo["average score<="]
                &&!g.allFilterInfo["average score:"]){
                    g.allFilterInfo["average score>="] = true
                    g.allFilterInfo["average score>"] = true
                    g.allFilterInfo["average score:"] = true
                    g.allFilterInfo["average score<"] = true
                    g.allFilterInfo["average score<="] = true
                }
                if(!g.allFilterInfo["popularity>="]
                &&!g.allFilterInfo["popularity>"]
                &&!g.allFilterInfo["popularity<"]
                &&!g.allFilterInfo["popularity<="]
                &&!g.allFilterInfo["popularity:"]){
                    g.allFilterInfo["popularity>="] = true
                    g.allFilterInfo["popularity>"] = true
                    g.allFilterInfo["popularity<"] = true
                    g.allFilterInfo["popularity<="] = true
                    g.allFilterInfo["popularity:"] = true
                }
                if(!g.allFilterInfo["year>="]
                &&!g.allFilterInfo["year>"]
                &&!g.allFilterInfo["year<"]
                &&!g.allFilterInfo["year<="]
                &&!g.allFilterInfo["year:"]){
                    g.allFilterInfo["year:"] = true
                    g.allFilterInfo["year>="] = true
                    g.allFilterInfo["year>"] = true
                    g.allFilterInfo["year<"] = true
                    g.allFilterInfo["year<="] = true
                }
                if(!g.allFilterInfo["sample size: "]){
                    g.allFilterInfo["sample size: "] = true
                }
                if(!g.allFilterInfo["minimum sample size: "]){
                    g.allFilterInfo["minimum sample size: "] = true
                }
                if(!g.allFilterInfo["minimum popularity: "]){
                    g.allFilterInfo["minimum popularity: "] = true
                }
                if(!g.allFilterInfo["minimum average score: "]){
                    g.allFilterInfo["minimum average score: "] = true
                }
                if(!g.allFilterInfo["limit top wscore: "]){
                    g.allFilterInfo["limit top wscore: "] = true
                }
                if(!g.allFilterInfo["limit top score: "]){
                    g.allFilterInfo["limit top score: "] = true
                }
                if(!g.allFilterInfo["limit top similarities: "]){
                    g.allFilterInfo["limit top similarities: "] = true
                }
                if(!g.allFilterInfo["top similarities: contents"]
                &&!g.allFilterInfo["!top similarities: !contents"]){
                    g.allFilterInfo["top similarities: contents"] = true
                    g.allFilterInfo["!top similarities: !contents"] = true
                }
                if(!g.allFilterInfo["top similarities: studios"]
                &&!g.allFilterInfo["!top similarities: !studios"]){
                    g.allFilterInfo["top similarities: studios"] = true
                    g.allFilterInfo["!top similarities: !studios"] = true
                }
                if(!g.allFilterInfo["top similarities: staffs"]
                &&!g.allFilterInfo["!top similarities: !staffs"]){
                    g.allFilterInfo["top similarities: staffs"] = true
                    g.allFilterInfo["!top similarities: !staffs"] = true
                }
                if(!g.allFilterInfo["measure: mode"]
                &&!g.allFilterInfo["measure: mean"]){
                    g.allFilterInfo["measure: mode"] = true
                    g.allFilterInfo["measure: mean"] = true
                }
                if(!g.allFilterInfo["include unknown variables: true"]
                &&!g.allFilterInfo["include unknown variables: false"]){
                    g.allFilterInfo["include unknown variables: true"] = true
                    g.allFilterInfo["include unknown variables: false"] = true
                }
                if(!g.allFilterInfo["staff: "]
                &&!g.allFilterInfo["!staff: "]){
                    g.allFilterInfo["staff: "] = true
                    g.allFilterInfo["!staff: "] = true
                }
                if(!g.allFilterInfo["studio: "]
                &&!g.allFilterInfo["!studio: "]){
                    g.allFilterInfo["studio: "] = true
                    g.allFilterInfo["!studio: "] = true
                }
                // if(!g.allFilterInfo["format: all"]
                //  &&!g.allFilterInfo["!format: !all"]){
                //     g.allFilterInfo["format: all"] = true
                //     g.allFilterInfo["!format: !all"] = true
                // }
                if(!g.allFilterInfo["genre: all"]
                &&!g.allFilterInfo["!genre: !all"]){
                    g.allFilterInfo["genre: all"] = true 
                    g.allFilterInfo["!genre: !all"] = true
                }
                if(!g.allFilterInfo["tag category: all"]
                &&!g.allFilterInfo["!tag category: !all"]){
                    g.allFilterInfo["tag category: all"] = true 
                    g.allFilterInfo["!tag category: !all"] = true
                }
                if(!g.allFilterInfo["tag: all"]
                &&!g.allFilterInfo["!tag: !all"]){
                    g.allFilterInfo["tag: all"] = true 
                    g.allFilterInfo["!tag: !all"] = true
                }
                if(!g.allFilterInfo["studio: all"]
                &&!g.allFilterInfo["!studio: !all"]){
                    g.allFilterInfo["studio: all"] = true  
                    g.allFilterInfo["!studio: !all"] = true
                }
                if(!g.allFilterInfo["staff role: all"]
                &&!g.allFilterInfo["!staff role: !all"]){
                    g.allFilterInfo["staff role: all"] = true
                    g.allFilterInfo["!staff role: !all"] = true
                }
                if(!g.allFilterInfo["staff: all"]
                &&!g.allFilterInfo["!staff: !all"]){
                    g.allFilterInfo["staff: all"] = true
                    g.allFilterInfo["!staff: !all"] = true
                }
                //
                if(typeof title==="string"){
                    let fullTitle = "title: "+title.trim().toLowerCase()
                    if(!g.allFilterInfo[fullTitle]){
                        g.allFilterInfo[fullTitle] = true
                    }
                }
                if(typeof season==="string"){
                    let tempSeason = season.trim().toLowerCase()
                    let fullSeason = "season: "+tempSeason
                    if(!g.allFilterInfo[fullSeason]
                    &&!g.allFilterInfo["!season: !"+tempSeason]){
                        g.allFilterInfo[fullSeason] = true
                        g.allFilterInfo["!season: !"+tempSeason] = true
                    }
                }
                if(typeof status==="string"){
                    let tempStatus = status.trim().toLowerCase()
                    let fullStatus = "status: "+tempStatus
                    if(!g.allFilterInfo[fullStatus]
                    &&!g.allFilterInfo["!status: !"+tempStatus]){
                        g.allFilterInfo[fullStatus] = true
                        g.allFilterInfo["!status: !"+tempStatus] = true
                    }
                }
                let genresIncluded = {}
                let tagsIncluded = {}
                let studiosIncluded = {}
                let staffIncluded = {}
                // Analyze
                // let zformat = []
                // if(typeof format==="string"){
                //     let tmpformat = format.trim().toLowerCase()
                //     let fullFormat = "format: "+tmpformat
                //     if(typeof g.varScheme.format[fullFormat]==="number") {
                //         zformat.push(g.varScheme.format[fullFormat])
                //     } else if(typeof g.varScheme.meanFormat==="number"&&includeUnknownVar){
                //         zformat.push(g.varScheme.meanFormat-minNumber)
                //     }
                //     // Filters
                //     if(!g.allFilterInfo[fullFormat]
                //      &&!g.allFilterInfo["!format: !"+tmpformat]){
                //         g.allFilterInfo[fullFormat] = true
                //         g.allFilterInfo["!format: !"+tmpformat] = true
                //     }
                // }
                let zgenres = []
                for(let j=0; j<genres.length; j++){
                    let genre = genres[j]
                    if(typeof genre!=="string") continue
                    genre = genre.trim().toLowerCase()
                    let fullGenre = "genre: "+genre
                    if(typeof g.varScheme.genres[fullGenre]==="number") {
                        zgenres.push(g.varScheme.genres[fullGenre])
                        // Top Similarities
                        if(typeof g.varScheme.meanGenres==="number"){
                            if(g.varScheme.genres[fullGenre]>=g.varScheme.meanGenres
                            &&!genresIncluded[fullGenre]){
                                let tmpscore = g.varScheme.genres[fullGenre]
                                genresIncluded[fullGenre] = [
                                    genre+" ("+tmpscore.toFixed(2)+")",
                                    tmpscore
                                ]
                            }
                        }
                    } else if(typeof g.varScheme.meanGenres==="number"&&includeUnknownVar){
                        zgenres.push(g.varScheme.meanGenres-minNumber)
                    }
                    // Filters
                    if(!g.allFilterInfo[fullGenre]
                    &&!g.allFilterInfo["!genre: !"+genre]){
                        g.allFilterInfo[fullGenre] = true 
                        g.allFilterInfo["!genre: !"+genre] = true
                    }
                }
                //
                let ztags = []
                for(let j=0; j<tags.length; j++){
                    let tag = tags[j]?.name
                    if(typeof tag!=="string") continue
                    let tagCategory = tags[j]?.category
                    if(typeof tagCategory!=="string") continue
                    let tagRank = tags[j]?.rank
                    tag = tag.trim().toLowerCase()
                    let fullTag = "tag: "+tag
                    tagCategory = tagCategory.trim().toLowerCase()
                    let fullTagCategory = "tag category: "+tagCategory
                    if(!jsonIsEmpty(g.varScheme.includeCategories)){
                        if(g.varScheme.includeCategories[fullTagCategory]){
                            if(typeof g.varScheme.tags[fullTag]==="number"){
                                ztags.push(g.varScheme.tags[fullTag])
                                // Top Similarities
                                if(typeof g.varScheme.meanTags==="number"
                                &&typeof tagRank==="number"){
                                    if(tagRank>=50 
                                    &&g.varScheme.tags[fullTag]>=g.varScheme.meanTags
                                    &&!tagsIncluded[fullTag]){
                                        let tmpscore = g.varScheme.tags[fullTag]
                                        tagsIncluded[fullTag] = [
                                            tag+" ("+tmpscore.toFixed(2)+")",
                                            tmpscore
                                        ]
                                    }
                                }
                            } else if(includeUnknownVar){
                                ztags.push(g.varScheme.meanTags-minNumber)
                            }
                        }
                    } else {
                        if(!g.varScheme.excludeCategories[fullTagCategory]){
                            if(typeof g.varScheme.tags[fullTag]==="number"){
                                ztags.push(g.varScheme.tags[fullTag])
                                // Top Similarities
                                if(typeof g.varScheme.meanTags==="number"
                                &&typeof tagRank==="number"){
                                    if(tagRank>=50
                                    &&g.varScheme.tags[fullTag]>=g.varScheme.meanTags
                                    &&!tagsIncluded[fullTag]){
                                        let tmpscore = g.varScheme.tags[fullTag]
                                        tagsIncluded[fullTag] = [
                                            tag+" ("+tmpscore.toFixed(2)+")",
                                            tmpscore
                                        ]
                                    }
                                }
                            } else if(includeUnknownVar){
                                ztags.push(g.varScheme.meanTags-minNumber)
                            }
                        }
                    }
                    // Filters
                    if(!g.allFilterInfo[fullTagCategory]
                    &&!g.allFilterInfo["!tag category: !"+tagCategory]){
                        g.allFilterInfo[fullTagCategory] = true 
                        g.allFilterInfo["!tag category: !"+tagCategory] = true
                    }
                    if(!g.allFilterInfo[fullTag]
                    &&!g.allFilterInfo["!tag: !"+tag]){
                        g.allFilterInfo[fullTag] = true 
                        g.allFilterInfo["!tag: !"+tag] = true
                    }
                }
                //
                let zstudios = []
                let includedStudios = {}
                for(let j=0; j<studios.length; j++){
                    let studio = studios[j]?.name
                    if(typeof studio!=="string") continue
                    if(includedStudios[studio]) continue
                    includedStudios[studio] = true
                    studio = studio.trim().toLowerCase()
                    let fullStudio = "studio: "+studio
                    if(typeof g.varScheme.studios[fullStudio]==="number"){
                        zstudios.push(g.varScheme.studios[fullStudio])
                        // Top Similarities
                        if(typeof g.varScheme.meanStudios==="number"){
                            let studioUrl = studios[j]?.siteUrl
                            if(g.varScheme.studios[fullStudio]>=g.varScheme.meanStudios
                            &&!studiosIncluded[fullStudio]
                            &&typeof studioUrl==="string"){
                                let tmpscore = g.varScheme.studios[fullStudio]
                                studiosIncluded[fullStudio] = [
                                    {["studio: "+studio+" ("+tmpscore.toFixed(2)+")"]: studioUrl},
                                    tmpscore
                                ]
                            }
                        }
                    } else if(typeof g.varScheme.meanStudios==="number"&&includeUnknownVar){
                        zstudios.push(g.varScheme.meanStudios-minNumber)
                    }
                    // Filters
                    // Removed Since It's Lagging on Too Much Filters
                    // if(!g.allFilterInfo["studio: "+fullStudio]
                    //  &&!g.allFilterInfo["!studio: !"+studio]){
                    //     g.allFilterInfo["studio: "+fullStudio] = true  
                    //     g.allFilterInfo["!studio: !"+studio] = true
                    // }
                }
                //
                let zstaff = {}
                let includedStaff = {}
                for(let j=0; j<staffs.length; j++){
                    let staff = staffs[j]?.node?.name?.userPreferred
                    if(typeof staff!=="string") continue
                    if(includedStaff[staff]) continue
                    includedStaff[staff] = true
                    let staffRole = staffs[j]?.role
                    if(typeof staffRole!=="string") continue
                    staff = staff.trim().toLowerCase()
                    let fullStaff = "staff: "+staff
                    staffRole = staffRole.split("(")[0].trim().toLowerCase()
                    let fullStaffRole = "staff role: "+staffRole
                    if(!jsonIsEmpty(g.varScheme.includeRoles)){
                        if(g.varScheme.includeRoles[fullStaffRole]){
                            if(typeof g.varScheme.staff[fullStaff]==="number"){
                                if(!zstaff[fullStaffRole]){
                                    zstaff[fullStaffRole] = [g.varScheme.staff[fullStaff]]
                                } else {
                                    zstaff[fullStaffRole].push(g.varScheme.staff[fullStaff])
                                }
                                // Top Similarities
                                if(typeof g.varScheme.meanStaff==="number"){
                                    let staffUrl = staffs[j]?.node?.siteUrl
                                    if(g.varScheme.staff[fullStaff]>=g.varScheme.meanStaff
                                    &&!staffIncluded[fullStaff]
                                    &&typeof staffUrl==="string"){
                                        let tmpscore = g.varScheme.staff[fullStaff]
                                        staffIncluded[fullStaff] = [
                                            {[staffRole+": "+staff+" ("+tmpscore.toFixed(2)+")"]: staffUrl},
                                            tmpscore
                                        ]
                                    }
                                }
                            } else if(typeof g.varScheme.meanStaff==="number"&&includeUnknownVar&&zstaff[fullStaffRole]){
                                // if(!zstaff[fullStaffRole]){
                                //     zstaff[fullStaffRole] = [g.varScheme.meanStaff-minNumber]
                                // } else {
                                zstaff[fullStaffRole].push(g.varScheme.meanStaff-minNumber)
                                // }
                            }
                        }
                    } else {
                        if(!g.varScheme.excludeRoles[fullStaffRole]){
                            if(typeof g.varScheme.staff[fullStaff]==="number"){
                                if(!zstaff[fullStaffRole]){
                                    zstaff[fullStaffRole] = [g.varScheme.staff[fullStaff]]
                                } else {
                                    zstaff[fullStaffRole].push(g.varScheme.staff[fullStaff])
                                }
                                // Top Similarities
                                if(typeof g.varScheme.meanStaff==="number"){
                                    let staffUrl = staffs[j]?.node?.siteUrl
                                    if(g.varScheme.staff[fullStaff]>=g.varScheme.meanStaff
                                    &&!staffIncluded[fullStaff]
                                    &&typeof staffUrl==="string"){
                                        let tmpscore = g.varScheme.staff[fullStaff]
                                        staffIncluded[fullStaff] = [
                                            {[staffRole+": "+staff+" ("+tmpscore.toFixed(2)+")"]: staffUrl},
                                            tmpscore
                                        ]
                                    }
                                }
                            } else if(typeof g.varScheme.meanStaff==="number"&&includeUnknownVar&&zstaff[fullStaffRole]){
                                // if(!zstaff[fullStaffRole]){
                                //     zstaff[fullStaffRole] = [g.varScheme.meanStaff-minNumber]
                                // } else {
                                    zstaff[fullStaffRole].push(g.varScheme.meanStaff-minNumber)
                                // }
                            }
                        }
                    }
                    // filters
                    if(!g.allFilterInfo[fullStaffRole]
                    &&!g.allFilterInfo["!staff role: !"+staffRole]){
                        g.allFilterInfo[fullStaffRole] = true  
                        g.allFilterInfo["!staff role: !"+staffRole] = true
                    }
                    // Removed Since It's Lagging on Too Much Filters
                    // if(!g.allFilterInfo[fullStaff]
                    //  &&!g.allFilterInfo["!staff: !"+staff]){
                    //     g.allFilterInfo[fullStaff] = true  
                    //     g.allFilterInfo["!staff: !"+staff] = true
                    // }
                }
                // Average Mean Score for All Categorical Variables (Avoid High Predicted Value from Linear Regression)
                // let meanCatVars = []
                // if(typeof g.varScheme.meanGenres==="number"){
                //     meanCatVars.push(g.varScheme.meanGenres)
                // }
                // if(typeof g.varScheme.meanTags==="number"){
                //     meanCatVars.push(g.varScheme.meanTags)
                // }
                // if(typeof g.varScheme.meanStudios==="number"){
                //     meanCatVars.push(g.varScheme.meanStudios)
                // }
                // if(typeof g.varScheme.meanStaff==="number"){
                //     meanCatVars.push(g.varScheme.meanStaff)
                // }
                // if(meanCatVars.length){
                //     meanCatVars = arrayMean(meanCatVars)
                // }
                // let userScoreMid = userScoreBase/2
                // Anime Type
                let animeType = []
                let seasonYear = anime?.seasonYear
                let yearModel = g.varScheme.yearModel ?? {}
                if(isaN(seasonYear)&&!jsonIsEmpty(yearModel)){
                    if(typeof seasonYear==="string"){
                        seasonYear = parseFloat(seasonYear)
                    }
                    animeType.push(Math.max(1,(LRpredict(yearModel,seasonYear))))
                } else {
                    animeType.push(1)
                }
                let averageScore = anime?.averageScore
                let averageScoreModel = g.varScheme.averageScoreModel ?? {}
                if(isaN(averageScore)&&!jsonIsEmpty(averageScoreModel)){
                    if(typeof averageScore==="string"){
                        averageScore = parseFloat(averageScore)
                    }
                    animeType.push(Math.max(1,(LRpredict(averageScoreModel,averageScore))))
                } else {
                    animeType.push(1)
                }
                // Anime Content
                let animeContent = []
                if(zgenres.length){
                    if(measure==="mode"){
                        animeContent.push(Math.max(1,arrayMode(zgenres)))
                    } else {
                        animeContent.push(Math.max(1,arrayMean(zgenres)))
                    }
                } else {
                    animeContent.push(1)
                }
                if(ztags.length){
                    if(measure==="mode"){
                        animeContent.push(Math.max(1,arrayMode(ztags)))
                    } else {
                        animeContent.push(Math.max(1,arrayMean(ztags)))
                    }
                } else {
                    animeContent.push(1)
                }

                // Anime Production
                let animeProduction = []
                let zstaffRolesArray = Object.values(zstaff).map((e)=>{
                    if(measure==="mode"){
                        return Math.max(1,arrayMode(e))
                    } else {
                        return Math.max(1,arrayMean(e))
                    }
                }) || []
                if(zstaffRolesArray.length){
                    if(measure==="mode"){
                        animeProduction = animeProduction.concat(zstaffRolesArray)
                    } else {
                        animeProduction = animeProduction.concat(zstaffRolesArray)
                    }
                } else {
                    animeProduction = animeProduction.concat([1])
                }
                if(zstudios.length){
                    if(measure==="mode"){
                        animeProduction = animeProduction.concat([Math.max(1,arrayMode(zstudios))])
                    } else {
                        animeProduction = animeProduction.concat([Math.max(1,arrayMean(zstudios))])
                    }
                } else {
                    animeProduction = animeProduction.concat([1])
                }
                // Scores
                let score = Math.max(1,arrayProbability([
                    Math.max(1,(measure==="mode"?arrayMode(animeType):arrayMean(animeType))),
                    Math.max(1,arrayProbability(animeContent)),
                    Math.max(1,(measure==="mode"?arrayMode(animeProduction):arrayMean(animeProduction)))
                ]))
                let weightedScore = score
                // Check mean score
                if(typeof meanUserScore==="number"&&typeof g.userEntriesStatus.userScore[anilistId]==="number"){
                    g.savedUserScores.all[anilistId] = score
                    if(g.userEntriesStatus.userScore[anilistId]>=meanUserScore){
                        g.savedUserScores.above[anilistId] = score
                    }
                }
                // Other Anime Recommendation Info
                genres = genres.length?genres:[]
                tags = tags.length?tags.map((e)=>e?.name||""):[]
                studios = studios.reduce((result,e)=>Object.assign(result,{[e?.name]:e?.siteUrl}),{})
                staffs = staffs.reduce((result,e)=>Object.assign(result,{[e?.node?.name?.userPreferred]:e?.node?.siteUrl}),{})
                // Sort all Top Similarities
                let variablesIncluded = Object.values(genresIncluded)
                    .concat(Object.values(tagsIncluded))
                    .concat(Object.values(studiosIncluded))
                    .concat(Object.values(staffIncluded))
                    .sort((a,b)=>{return b?.[1]-a?.[1]}).map((e)=>{return e?.[0]||""})
                variablesIncluded = variablesIncluded.length?variablesIncluded:[]
                g.savedRecScheme[anilistId] = {
                    id: anilistId, title: title, animeUrl: animeUrl, 
                    userScore: g.userEntriesStatus?.userScore?.[anilistId], 
                    averageScore: averageScore,
                    popularity: popularity,
                    score: score, weightedScore: weightedScore, 
                    variablesIncluded: variablesIncluded,
                    userStatus: userStatus, status: status,
                    // Others
                    genres: genres, tags: tags, year: year, 
                    season: season, format: format, studios: studios, staffs: staffs
                }
            }
            // Calculate Mean Score minus Standard Deviation
            if(!jsonIsEmpty(g.savedUserScores)){
                meanScoreAll = Object.values(g.savedUserScores.all??{})
                meanScoreAbove = Object.values(g.savedUserScores.above??{})
                //for(let i=0;i<meanScoreAll.length-1;i++){
                //    if(typeof meanScoreAll[i]==="number"&&typeof meanScoreAll[i+1]==="number"){
                //        scoreSD.push(Math.abs(meanScoreAll[i]-meanScoreAll[i+1]))
                //    }
                //}
                //scoreSD = scoreSD.length? arrayMean(scoreSD.sort((a,b)=>b-a)) : 0
                meanScoreAll = Math.max(Math.min(...meanScoreAbove),arrayMean(meanScoreAll))//-scoreSD
                meanScoreAbove = arrayMean(meanScoreAbove)//-scoreSD
            }
            // Add Weight to Scores
            let savedRecSchemeEntries = Object.keys(g.savedRecScheme)
            for(let i=0;i<savedRecSchemeEntries.length;i++){
                let anime = g.savedRecScheme[savedRecSchemeEntries[i]]
                let popularity = anime.popularity
                let weightedScore = anime.weightedScore
                let averageScore = anime.averageScore
                // Add Mean Score
                if(typeof meanScoreAll==="number"){
                    g.savedRecScheme[savedRecSchemeEntries[i]].meanScoreAll = meanScoreAll
                } else {
                    g.savedRecScheme[savedRecSchemeEntries[i]].meanScoreAll = 0
                }
                if(typeof meanScoreAbove==="number"){
                    g.savedRecScheme[savedRecSchemeEntries[i]].meanScoreAbove = meanScoreAbove
                } else {
                    g.savedRecScheme[savedRecSchemeEntries[i]].meanScoreAbove = 0
                }
                // Low Average
                if(isaN(averageScore)){
                    if(typeof averageScore==="string"){
                        averageScore = parseFloat(averageScore)
                    }
                    if(averageScore<averageScoreMode){
                        let ASmult = averageScore*0.01
                        g.savedRecScheme[savedRecSchemeEntries[i]].weightedScore = weightedScore*(ASmult>=1?1:ASmult)
                    }
                }
                // Low Popularity
                if(typeof popularity==="number"
                &&typeof popularityMode==="number"
                &&typeof popularitySum==="number"
                &&popularitySum
                &&typeof weightedScore==="number"
                &&weightedScore){
                    if(popularity<popularityMode) {
                        g.savedRecScheme[savedRecSchemeEntries[i]].weightedScore = (
                            popularity? (anime.popularity/popularitySum)*weightedScore
                            : (minNumber/popularitySum)*weightedScore
                        )
                    }
                }
                if(!anime.weightedScore||!isFinite(anime.weightedScore)){
                    g.savedRecScheme[savedRecSchemeEntries[i]].weightedScore = 0
                }
                if(!anime.score||!isFinite(anime.score)){
                    g.savedRecScheme[savedRecSchemeEntries[i]].score = 0
                }
            }
        } else {
            for(let i=0; i<g.animeEntries.length; i++){
                let anime = g.animeEntries[i]
                let title = anime?.title?.userPreferred
                let anilistId = anime?.id
                let animeUrl = anime?.siteUrl
                let format = anime?.format
                let year = anime?.seasonYear
                let season = anime?.season
                let genres = anime?.genres || []
                let tags = anime?.tags || []
                let studios = anime?.studios?.nodes?.filter((studio)=>{return studio?.isAnimationStudio}) || []
                let staffs = anime?.staff?.edges || []
                let status = anime?.status
                //
                if(!g.allFilterInfo["wscore>="]
                &&!g.allFilterInfo["wscore>"]
                &&!g.allFilterInfo["wscore<"]
                &&!g.allFilterInfo["wscore<="]
                &&!g.allFilterInfo["wscore:"]){
                    g.allFilterInfo["wscore>="] = true
                    g.allFilterInfo["wscore>"] = true
                    g.allFilterInfo["wscore<"] = true
                    g.allFilterInfo["wscore<="] = true
                    g.allFilterInfo["wscore:"] = true
                }
                if(!g.allFilterInfo["score>="]
                &&!g.allFilterInfo["score>"]
                &&!g.allFilterInfo["score<"]
                &&!g.allFilterInfo["score<="]
                &&!g.allFilterInfo["score:"]){
                    g.allFilterInfo["score>="] = true
                    g.allFilterInfo["score>"] = true
                    g.allFilterInfo["score<"] = true
                    g.allFilterInfo["score<="] = true
                    g.allFilterInfo["score:"] = true
                }
                if(!g.allFilterInfo["user score>="]
                &&!g.allFilterInfo["user score>"]
                &&!g.allFilterInfo["user score<"]
                &&!g.allFilterInfo["user score<="]
                &&!g.allFilterInfo["user score:"]){
                    g.allFilterInfo["user score>="] = true
                    g.allFilterInfo["user score>"] = true
                    g.allFilterInfo["user score:"] = true
                    g.allFilterInfo["user score<"] = true
                    g.allFilterInfo["user score<="] = true
                }
                if(!g.allFilterInfo["average score>="]
                &&!g.allFilterInfo["average score>"]
                &&!g.allFilterInfo["average score<"]
                &&!g.allFilterInfo["average score<="]
                &&!g.allFilterInfo["average score:"]){
                    g.allFilterInfo["average score>="] = true
                    g.allFilterInfo["average score>"] = true
                    g.allFilterInfo["average score:"] = true
                    g.allFilterInfo["average score<"] = true
                    g.allFilterInfo["average score<="] = true
                }
                if(!g.allFilterInfo["popularity>="]
                &&!g.allFilterInfo["popularity>"]
                &&!g.allFilterInfo["popularity<"]
                &&!g.allFilterInfo["popularity<="]
                &&!g.allFilterInfo["popularity:"]){
                    g.allFilterInfo["popularity>="] = true
                    g.allFilterInfo["popularity>"] = true
                    g.allFilterInfo["popularity<"] = true
                    g.allFilterInfo["popularity<="] = true
                    g.allFilterInfo["popularity:"] = true
                }
                if(!g.allFilterInfo["year>="]
                &&!g.allFilterInfo["year>"]
                &&!g.allFilterInfo["year<"]
                &&!g.allFilterInfo["year<="]
                &&!g.allFilterInfo["year:"]){
                    g.allFilterInfo["year:"] = true
                    g.allFilterInfo["year>="] = true
                    g.allFilterInfo["year>"] = true
                    g.allFilterInfo["year<"] = true
                    g.allFilterInfo["year<="] = true
                }
                if(!g.allFilterInfo["minimum popularity: "]){
                    g.allFilterInfo["minimum popularity: "] = true
                }
                if(!g.allFilterInfo["minimum average score: "]){
                    g.allFilterInfo["minimum average score: "] = true
                }
                if(!g.allFilterInfo["limit top similarities: "]){
                    g.allFilterInfo["limit top similarities: "] = true
                }
                if(!g.allFilterInfo["measure: mode"]
                &&!g.allFilterInfo["measure: mean"]){
                    g.allFilterInfo["measure: mode"] = true
                    g.allFilterInfo["measure: mean"] = true
                }
                if(!g.allFilterInfo["include unknown variables: true"]
                &&!g.allFilterInfo["include unknown variables: false"]){
                    g.allFilterInfo["include unknown variables: true"] = true
                    g.allFilterInfo["include unknown variables: false"] = true
                }
                if(!g.allFilterInfo["staff: "]
                &&!g.allFilterInfo["!staff: "]){
                    g.allFilterInfo["staff: "] = true
                    g.allFilterInfo["!staff: "] = true
                }
                if(!g.allFilterInfo["studio: "]
                &&!g.allFilterInfo["!studio: "]){
                    g.allFilterInfo["studio: "] = true
                    g.allFilterInfo["!studio: "] = true
                }
                // if(!g.allFilterInfo["format: all"]
                //  &&!g.allFilterInfo["!format: !all"]){
                //     g.allFilterInfo["format: all"] = true
                //     g.allFilterInfo["!format: !all"] = true
                // }
                if(!g.allFilterInfo["genre: all"]
                &&!g.allFilterInfo["!genre: !all"]){
                    g.allFilterInfo["genre: all"] = true 
                    g.allFilterInfo["!genre: !all"] = true
                }
                if(!g.allFilterInfo["tag category: all"]
                &&!g.allFilterInfo["!tag category: !all"]){
                    g.allFilterInfo["tag category: all"] = true 
                    g.allFilterInfo["!tag category: !all"] = true
                }
                if(!g.allFilterInfo["tag: all"]
                &&!g.allFilterInfo["!tag: !all"]){
                    g.allFilterInfo["tag: all"] = true 
                    g.allFilterInfo["!tag: !all"] = true
                }
                if(!g.allFilterInfo["studio: all"]
                &&!g.allFilterInfo["!studio: !all"]){
                    g.allFilterInfo["studio: all"] = true  
                    g.allFilterInfo["!studio: !all"] = true
                }
                if(!g.allFilterInfo["staff role: all"]
                &&!g.allFilterInfo["!staff role: !all"]){
                    g.allFilterInfo["staff role: all"] = true
                    g.allFilterInfo["!staff role: !all"] = true
                }
                if(!g.allFilterInfo["staff: all"]
                &&!g.allFilterInfo["!staff: !all"]){
                    g.allFilterInfo["staff: all"] = true
                    g.allFilterInfo["!staff: !all"] = true
                }
                //
                if(typeof title==="string"){
                    let fullTitle = "title: "+title.trim().toLowerCase()
                    if(!g.allFilterInfo[fullTitle]){
                        g.allFilterInfo[fullTitle] = true
                    }
                }
                if(typeof season==="string"){
                    let tempSeason = season.trim().toLowerCase()
                    let fullSeason = "season: "+tempSeason
                    if(!g.allFilterInfo[fullSeason]
                    &&!g.allFilterInfo["!season: !"+tempSeason]){
                        g.allFilterInfo[fullSeason] = true
                        g.allFilterInfo["!season: !"+tempSeason] = true
                    }
                }
                if(typeof status==="string"){
                    let tempStatus = status.trim().toLowerCase()
                    let fullStatus = "status: "+tempStatus
                    if(!g.allFilterInfo[fullStatus]
                    &&!g.allFilterInfo["!status: !"+tempStatus]){
                        g.allFilterInfo[fullStatus] = true
                        g.allFilterInfo["!status: !"+tempStatus] = true
                    }
                }
                // if(typeof format==="string"){
                //     let tempFormat = format.trim().toLowerCase()
                //     let fullFormat = "format: "+tempFormat
                //     if(!g.allFilterInfo[fullFormat]
                //      &&!g.allFilterInfo["!format: !"+tempFormat]){
                //         g.allFilterInfo[fullFormat] = true
                //         g.allFilterInfo["!format: !"+tempFormat] = true
                //     }
                // }
                // Arrange
                for(let j=0; j<genres.length; j++){
                    let genre = genres[j]
                    if(typeof genre!=="string") continue
                    genre = genre.trim().toLowerCase()
                    fullGenre = "genre: "+genre
                    if(!g.allFilterInfo[fullGenre]
                    &&!g.allFilterInfo["!genre: !"+genre]){
                        g.allFilterInfo[fullGenre] = true 
                        g.allFilterInfo["!genre: !"+genre] = true
                    }
                }
                for(let j=0; j<tags.length; j++){
                    let tag = tags[j]?.name
                    if(typeof tag!=="string") continue
                    tag = tag.trim().toLowerCase()
                    fullTag = "tag: "+tag
                    if(!g.allFilterInfo[fullTag]
                    &&!g.allFilterInfo["!tag: !"+tag]){
                        g.allFilterInfo[fullTag] = true 
                        g.allFilterInfo["!tag: !"+tag] = true
                    }
                    let tagCategory = tags[j]?.category
                    if(typeof tagCategory!=="string") continue
                    tagCategory = tagCategory.trim().toLowerCase()
                    let fullTagCategory = "tag category: "+tagCategory
                    if(!g.allFilterInfo[fullTagCategory]
                    &&!g.allFilterInfo["!tag category: !"+tagCategory]){
                        g.allFilterInfo[fullTagCategory] = true 
                        g.allFilterInfo["!tag category: !"+tagCategory] = true
                    }
                }
                // for(let j=0; j<studios.length; j++){
                //     let studio = studios[j]?.name
                //     if(typeof studio!=="string") continue
                //     studio = studio.trim().toLowerCase()
                //     let fullStudio = "studio: "+studio
                //     // Removed Since It's Lagging on Too Much Filters
                //     // if(!g.allFilterInfo[fullStudio]
                //     //  &&!g.allFilterInfo["!studio: !"+studio]){
                //     //     g.allFilterInfo[fullStudio] = true  
                //     //     g.allFilterInfo["!studio: !"+studio] = true
                //     // }
                // }
                for(let j=0; j<staffs.length; j++){
                    // let staff = staffs[j]?.node?.name?.userPreferred
                    // if(typeof staff!=="string") continue
                    // staff = staff.trim().toLowerCase()
                    // let fullStaff = "staff: "+staff
                    // Removed Since It's Lagging on Too Much Filters
                    // if(!g.allFilterInfo[fullStaff]
                    //  &&!g.allFilterInfo[("!staff: !"+staff]){
                    //     g.allFilterInfo[fullStaff] = true
                    //     g.allFilterInfo["!staff: !"+staff] = true
                    // }
                    let staffRole = staffs[j].role
                    if(typeof staffRole!=="string") continue
                    staffRole = staffRole.split("(")[0].trim().toLowerCase()
                    let fullStaffRole = "staff role: "+staffRole
                    if(!g.allFilterInfo[fullStaffRole]
                    &&!g.allFilterInfo["!staff role: !"+staffRole]){
                        g.allFilterInfo[fullStaffRole] = true
                        g.allFilterInfo["!staff role: !"+staffRole] = true
                    }
                }
                let score = weightedScore = 0
                let averageScore = anime?.averageScore
                if(isaN(averageScore)){
                    if(typeof averageScore==="string"){
                        averageScore = parseFloat(averageScore)
                    }
                }
                let favourites = anime?.favourites
                if(isaN(favourites)){
                    if(typeof favourites==="string"){
                        favourites = parseFloat(favourites)
                    }
                }
                let popularity = anime?.popularity
                if(isaN(popularity)){
                    if(typeof popularity==="string"){
                        popularity = parseFloat(popularity)
                    }
                }
                if(isaN(averageScore)
                &&isaN(favourites)
                &&isaN(popularity)
                &&popularity){
                    let favPopRatio = 1
                    if(anime.favourites<anime.popularity){
                        favPopRatio = anime.favourites/anime.popularity
                    }
                    let ASmult = averageScore*0.01
                    score = weightedScore = ((favPopRatio)*(ASmult>=1?1:ASmult))-minNumber
                }
                // Other Anime Recommendation Info
                genres = genres.length?genres:[]
                tags = tags.length?tags.map((e)=>e?.name||""):[]
                studios = studios.reduce((result,e)=>Object.assign(result,{[e?.name]:e?.siteUrl}),{})
                staffs = staffs.reduce((result,e)=>Object.assign(result,{[e?.node?.name?.userPreferred]:e?.node?.siteUrl}),{})
                g.savedRecScheme[anilistId] = {
                    id: anilistId, title: title, animeUrl: animeUrl, 
                    userScore: g.userEntriesStatus?.userScore?.[anilistId], 
                    averageScore: averageScore,
                    popularity: popularity,
                    score: score, weightedScore: weightedScore, 
                    variablesIncluded: [],
                    userStatus: "UNWATCHED", status: status,
                    // Others
                    genres: genres, tags: tags, year: year, 
                    season: season, format: format, studios: studios, staffs: staffs
                }
            }
            // Add Weight to Scores
            let savedRecSchemeEntries = Object.keys(g.savedRecScheme)
            for(let i=0;i<savedRecSchemeEntries.length;i++){
                let anime = g.savedRecScheme[savedRecSchemeEntries[i]]
                let popularity = anime.popularity
                let weightedScore = anime.weightedScore
                if(typeof popularity==="number"
                &&typeof popularityMode==="number"
                &&typeof popularitySum==="number"
                &&popularitySum
                &&typeof weightedScore==="number"
                &&weightedScore){
                    if(popularity<popularityMode) {
                        g.savedRecScheme[savedRecSchemeEntries[i]].weightedScore = (
                            popularity? (anime.popularity/popularitySum)*weightedScore
                            : (minNumber/popularitySum)*weightedScore
                        )
                    }
                }
                if(!anime.weightedScore||!isFinite(anime.weightedScore)){
                    g.savedRecScheme[savedRecSchemeEntries[i]].weightedScore = 0
                }
                if(!anime.score||!isFinite(anime.score)){
                    g.savedRecScheme[savedRecSchemeEntries[i]].score = 0
                }
            }
        }
        // Add Filters
        if(g.anUpdate||g.versionUpdate){
            g.savedFilterOptionsJson = []
            for(let key in g.allFilterInfo){
                g.savedFilterOptionsJson.push({info: key})
            }
        }
        return resolve()
    })
}
async function postWorker(){
    return await new Promise(async(resolve)=>{
        if(!equalsNCS(g.username,g.savedUsername)){
            await saveJSON(g.username,"savedUsername")
            self.postMessage({status:'update', savedUsername: g.username})
        }
        await saveJSON(g.savedRecScheme,"savedRecScheme")
        self.postMessage({
            status:'update', 
            haveSavedRecScheme: !jsonIsEmpty(g.savedRecScheme)
        })
        await saveJSON(g.hideUnwatchedSequels,'hideUnwatchedSequels')
        // Save Check
        if(g.anUpdate||g.versionUpdate){
            await saveJSON(g.allFilterInfo,"allFilterInfo")
            await saveJSON(g.savedAnimeFranchises,"savedAnimeFranchises")    
        }
        if(g.versionUpdate){
            await saveJSON(false,"versionUpdate")
            self.postMessage({status:'update', versionUpdate: false})
        }
        // Time Check
        if(g.deepUpdateStartTime&&g.returnID==="getAllAnime"){
            timeInterval = (new Date).getTime()-g.deepUpdateStartTime.getTime()
            if(g.savedDeepUpdateTime.length<33){
                await g.savedDeepUpdateTime.push(Math.ceil(timeInterval/1000))
            } else {
                await g.savedDeepUpdateTime.shift()
                await g.savedDeepUpdateTime.push(Math.ceil(timeInterval/1000))
            }
            self.postMessage({status:'update', savedDeepUpdateTime: g.savedDeepUpdateTime})
        }
        let timeInterval = (new Date).getTime()-g.updateAnalyzeAnimeStartTime.getTime()
        if(g.savedUpdateAnalyzeAnimeTime.length<33){
            await g.savedUpdateAnalyzeAnimeTime.push(Math.ceil(timeInterval/1000))
        } else {
            await g.savedUpdateAnalyzeAnimeTime.shift()
            await g.savedUpdateAnalyzeAnimeTime.push(Math.ceil(timeInterval/1000))
        }
        await saveJSON(g.savedUpdateAnalyzeAnimeTime, "savedUpdateAnalyzeAnimeTime")
        self.postMessage({status:'update', savedUpdateAnalyzeAnimeTime: g.savedUpdateAnalyzeAnimeTime})
        // Filters
        if(g.anUpdate||g.versionUpdate){
            await saveJSON(g.savedFilterOptionsJson,"savedFilterOptionsJson")
            self.postMessage({status:'update',savedFilterOptionsJson: g.savedFilterOptionsJson}) // Notify User for the Filter Update
        }
        return resolve()
    })
}
// Functions
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
            read.onsuccess = (event) => {
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
function arrayProbability(obj){
    if(!obj?.length) return 0
    return obj.reduce((a, b) => a * b, 1)
}
function arraySum(obj) {
    return obj.reduce((a, b) =>{
        if(typeof a==="number"&&typeof b==="number"){
            return a + b
        }
    }, 0)
}
function arrayMean(obj) {
    return (arraySum(obj) / obj.filter((e)=>typeof e==="number"?true:false).length) || 0
}
function arrayMode(obj){
    if(!obj.length||!(obj instanceof Array)){return}
    else if(obj.length<3){return arrayMean(obj)}
    let max = parseFloat(Math.max(...obj))
    let min = parseFloat(Math.min(...obj))
    const boundary = minNumber  // Min Value Javascript
    let classW = parseFloat(((max-min)/(1.0+(3.322*Math.log(obj.length)))))
    let classIs
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
function equalsNCS(str1, str2) {
    let s1 = str1
    let s2 = str2
    if(typeof s1==="number") s1 = s1.toString()
    if(typeof s2==="number") s2 = s2.toString()
    if(typeof s1==="string") s1 = s1.trim().toLowerCase()
    if(typeof s2==="string") s2 = s2.trim().toLowerCase()
    return s1 === s2
}
// Linear Regression
function LRpredict(modelObj, x){
    if(!modelObj) return null
    if(!modelObj.slope||!modelObj.intercept) return null
    if(isNaN(modelObj.slope)||isNaN(modelObj.intercept)) return null
    return (parseFloat(modelObj.slope)*x)+parseFloat(modelObj.intercept)
}