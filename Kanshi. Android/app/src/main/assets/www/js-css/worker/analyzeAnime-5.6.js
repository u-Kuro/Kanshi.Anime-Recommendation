self.onmessage = (message) => {
    const minNumber = 1-6e-17!==1? 6e-17 : 1e-16 // Min Value Javascript
    const mediaRelationTypes = ["adaptation","prequel","sequel","parent","side_story","summary","alternative","spin_off"]
    var data = message.data
    var animeEntries = data.animeEntries || []
    var savedRecScheme = data.savedRecScheme
    var recSchemeIsNew = jsonIsEmpty(savedRecScheme)
    var userListStatus = data.userListStatus
    var varScheme = data.varScheme
    // Algorithm Configs
    const measure = varScheme?.measure || "mean"
    const includeUnknownVar = varScheme?.includeUnknownVar ?? true
    const popularityArray = animeEntries.map((anime)=>{
                                    var popularity = anime?.popularity
                                    if(typeof popularity==="number"){
                                        return popularity
                                    }
                                })
    const popularitySum = popularityArray.length? arraySum(popularityArray) : 3000000
    const popularityMode = varScheme?.minPopularity? varScheme.minPopularity : 0.33*Math.min(arrayMean(popularityArray),arrayMode(popularityArray))
    const averageScoreMode = varScheme?.minAverageScore || 50-0.33
    // Algorithm Configs
    var allFilterInfo = data.allFilterInfo || {}
    var alteredVariables = data.alteredVariables
    var animeFranchises = []
    const hideUnwatchedSequels = data.hideUnwatchedSequels
    //
    if(!jsonIsEmpty(varScheme)){
        for(let i=0; i<animeEntries.length; i++){
            var animeShallUpdate = false
            var anime = animeEntries[i]
            var title = anime?.title?.userPreferred
            var anilistId = anime?.id
            var animeUrl = anime?.siteUrl
            var format = anime?.format
            var year = anime?.seasonYear
            var season = anime?.season
            var genres = anime?.genres || []
            var tags = anime?.tags || []
            var studios = anime?.studios?.nodes?.filter((studio)=>{return studio?.isAnimationStudio}) || []
            var staffs = anime?.staff?.edges || []
            var status = anime?.status
            var popularity = anime?.popularity
            // Check Status
              // For Unwatched
            var userStatus = "UNWATCHED"
            if(!allFilterInfo["user status: "+userStatus.toLowerCase()]
             &&!allFilterInfo["!user status: !"+userStatus.toLowerCase()]){
                allFilterInfo["user status: "+userStatus.toLowerCase()] = true
                allFilterInfo["!user status: !"+userStatus.toLowerCase()] = true
            }
            if(typeof userListStatus?.userStatus?.[anilistId]==="string"){
                userStatus = userListStatus?.userStatus?.[anilistId]
                var tmpUserStatus = userStatus.trim().toLowerCase()
                if(!allFilterInfo["user status: "+tmpUserStatus]
                 &&!allFilterInfo["!user status: !"+tmpUserStatus]){
                    allFilterInfo["user status: "+tmpUserStatus] = true
                    allFilterInfo["!user status: !"+tmpUserStatus] = true
                }
            }
            // Update Anime Franchises
            var afIdxs = animeFranchises.reduce((result,e,idx)=>{
                if(e instanceof Array){
                    if(e.includes(anilistId)){
                        result.push(idx)
                    }
                }
                return result
            },[])
            var afIdx
            if(afIdxs.length>1||afIdxs.length<1){
                // Union if there are duplicate franchise
                if(afIdxs.length>1){
                    var newFranchise = animeFranchises[afIdxs[0]]
                    for(let j=1;j<afIdxs.length;j++){
                        newFranchise = Array.from(new Set(newFranchise.concat(animeFranchises[afIdxs[j]])))
                    }
                    // Remove Old Duplicates
                    afIdxs.sort((a,b)=>b-a)
                    for(let j=0;j<afIdxs.length;j++){
                        animeFranchises.splice(afIdxs[j],1)
                    }
                    // Add New Unioned Franchise
                    animeFranchises.push(newFranchise)
                // If its a New Franchise
                } else {
                    animeFranchises.push([anilistId])
                }
                // Get the index of the New Franchise
                afIdx = animeFranchises.length-1
            } 
            // else if there is only one
            else {
                // Index of Franchise
                afIdx = animeFranchises.findIndex((e)=>{
                    if(e instanceof Array){
                        return e.includes(anilistId)
                    }
                })
            }
            // Next add each Anime relations to its franchise
            var animeRelations = anime?.relations?.edges || []
            animeRelations.forEach((e)=>{
                var animeRelationType = e?.relationType
                var relationID =  e?.node?.id
                if(typeof animeRelationType==="string"&&typeof relationID==="number"&&animeRelationType){
                    if(mediaRelationTypes.includes(animeRelationType.trim().toLowerCase())){
                        if(animeFranchises[afIdx] instanceof Array){
                            if(!animeFranchises[afIdx].includes(relationID)){
                                animeFranchises[afIdx].push(relationID)
                            }
                        }
                    }
                }
            })
            // Hide Unwatched Sequels
            if(hideUnwatchedSequels){
                var animeRelations = anime?.relations?.edges || []
                // Conditions
                var isUnwatchedSequel = 
                  // No Prequel
                !(animeRelations.some((e)=>{
                    var animeRelationType = e?.relationType
                    if(typeof animeRelationType==="string"){
                        if(animeRelationType.trim().toLowerCase()==="prequel"){
                            return true
                        }
                    }
                })) 
                ||  
                  // or Have Prequel but...
                (animeRelations.some((e)=>{
                    var animeRelationType = e?.relationType
                    var animeRelationPopularity = e?.node?.popularity
                    var animeRelationID = e?.node?.id
                    if(typeof animeRelationType==="string"
                     &&typeof animeRelationID==="number"
                     &&typeof animeRelationPopularity==="number"){
                        if(animeRelationType.trim().toLowerCase()==="prequel"){
                            // ...Prequel is Watched
                            if(typeof userListStatus?.userStatus?.[animeRelationID]==="string"){
                                if((userListStatus?.userStatus?.[animeRelationID].trim().toLowerCase()==="completed"
                                  ||userListStatus?.userStatus?.[animeRelationID].trim().toLowerCase()==="repeating")){
                                    return true
                                }
                            // ...Prequel is a Small/Unpopular Anime
                            } else if(!userListStatus?.userStatus?.[animeRelationID]&&typeof popularity==="number"){
                                if(animeRelationPopularity<=popularity){
                                    return true
                                }
                            }
                        }
                    }
                }))
                // Don't Include if Anime Entry 
                if(!isUnwatchedSequel){
                    delete savedRecScheme[anilistId]
                    continue
                }
            }
            //
            if(!allFilterInfo["wscore>="]
             &&!allFilterInfo["wscore>"]
             &&!allFilterInfo["wscore<"]
             &&!allFilterInfo["wscore<="]
             &&!allFilterInfo["wscore:"]){
                allFilterInfo["wscore>="] = true
                allFilterInfo["wscore>"] = true
                allFilterInfo["wscore<"] = true
                allFilterInfo["wscore<="] = true
                allFilterInfo["wscore:"] = true
            }
            if(!allFilterInfo["score>="]
             &&!allFilterInfo["score>"]
             &&!allFilterInfo["score<"]
             &&!allFilterInfo["score<="]
             &&!allFilterInfo["score:"]){
                allFilterInfo["score>="] = true
                allFilterInfo["score>"] = true
                allFilterInfo["score<"] = true
                allFilterInfo["score<="] = true
                allFilterInfo["score:"] = true
            }
            if(!allFilterInfo["user score>="]
             &&!allFilterInfo["user score>"]
             &&!allFilterInfo["user score<"]
             &&!allFilterInfo["user score<="]
             &&!allFilterInfo["user score:"]){
                allFilterInfo["user score>="] = true
                allFilterInfo["user score>"] = true
                allFilterInfo["user score:"] = true
                allFilterInfo["user score<"] = true
                allFilterInfo["user score<="] = true
            }
            if(!allFilterInfo["average score>="]
             &&!allFilterInfo["average score>"]
             &&!allFilterInfo["average score<"]
             &&!allFilterInfo["average score<="]
             &&!allFilterInfo["average score:"]){
                allFilterInfo["average score>="] = true
                allFilterInfo["average score>"] = true
                allFilterInfo["average score:"] = true
                allFilterInfo["average score<"] = true
                allFilterInfo["average score<="] = true
            }
            if(!allFilterInfo["popularity>="]
             &&!allFilterInfo["popularity>"]
             &&!allFilterInfo["popularity<"]
             &&!allFilterInfo["popularity<="]
             &&!allFilterInfo["popularity:"]){
                allFilterInfo["popularity>="] = true
                allFilterInfo["popularity>"] = true
                allFilterInfo["popularity<"] = true
                allFilterInfo["popularity<="] = true
                allFilterInfo["popularity:"] = true
            }
            if(!allFilterInfo["year>="]
             &&!allFilterInfo["year>"]
             &&!allFilterInfo["year<"]
             &&!allFilterInfo["year<="]
             &&!allFilterInfo["year:"]){
                allFilterInfo["year:"] = true
                allFilterInfo["year>="] = true
                allFilterInfo["year>"] = true
                allFilterInfo["year<"] = true
                allFilterInfo["year<="] = true
            }
            if(!allFilterInfo["minimum popularity: "]){
                allFilterInfo["minimum popularity: "] = true
            }
            if(!allFilterInfo["minimum average score: "]){
                allFilterInfo["minimum average score: "] = true
            }
            if(!allFilterInfo["limit top similarities: "]){
                allFilterInfo["limit top similarities: "] = true
            }
            if(!allFilterInfo["measure: mode"]
             &&!allFilterInfo["measure: mean"]){
                allFilterInfo["measure: mode"] = true
                allFilterInfo["measure: mean"] = true
            }
            if(!allFilterInfo["include unknown variables: true"]
             &&!allFilterInfo["include unknown variables: false"]){
                allFilterInfo["include unknown variables: true"] = true
                allFilterInfo["include unknown variables: false"] = true
            }
            if(!allFilterInfo["staff: "]
             &&!allFilterInfo["!staff: !"]){
                allFilterInfo["staff: "] = true
                allFilterInfo["!staff: !"] = true
            }
            if(!allFilterInfo["studio: "]
             &&!allFilterInfo["!studio: !"]){
                allFilterInfo["studio: "] = true
                allFilterInfo["!studio: !"] = true
            }
            // if(!allFilterInfo["format: all"]
            //  &&!allFilterInfo["!format: !all"]){
            //     allFilterInfo["format: all"] = true
            //     allFilterInfo["!format: !all"] = true
            // }
            if(!allFilterInfo["genre: all"]
             &&!allFilterInfo["!genre: !all"]){
                allFilterInfo["genre: all"] = true 
                allFilterInfo["!genre: !all"] = true
            }
            if(!allFilterInfo["tag category: all"]
             &&!allFilterInfo["!tag category: !all"]){
                allFilterInfo["tag category: all"] = true 
                allFilterInfo["!tag category: !all"] = true
            }
            if(!allFilterInfo["tag: all"]
             &&!allFilterInfo["!tag: !all"]){
                allFilterInfo["tag: all"] = true 
                allFilterInfo["!tag: !all"] = true
            }
            if(!allFilterInfo["studio: all"]
             &&!allFilterInfo["!studio: !all"]){
                allFilterInfo["studio: all"] = true  
                allFilterInfo["!studio: !all"] = true
            }
            if(!allFilterInfo["staff role: all"]
             &&!allFilterInfo["!staff role: !all"]){
                allFilterInfo["staff role: all"] = true
                allFilterInfo["!staff role: !all"] = true
            }
            if(!allFilterInfo["staff: all"]
             &&!allFilterInfo["!staff: !all"]){
                allFilterInfo["staff: all"] = true
                allFilterInfo["!staff: !all"] = true
            }
            //
            if(typeof title==="string"){
                var fullTitle = "title: "+title.trim().toLowerCase()
                if(!allFilterInfo[fullTitle]){
                    allFilterInfo[fullTitle] = true
                }
            }
            if(typeof season==="string"){
                var tempSeason = season.trim().toLowerCase()
                var fullSeason = "season: "+tempSeason
                if(!allFilterInfo[fullSeason]
                 &&!allFilterInfo["!season: !"+tempSeason]){
                    allFilterInfo[fullSeason] = true
                    allFilterInfo["!season: !"+tempSeason] = true
                }
            }
            if(typeof status==="string"){
                var tempStatus = status.trim().toLowerCase()
                var fullStatus = "status: "+tempStatus
                if(!allFilterInfo[fullStatus]
                 &&!allFilterInfo["!status: !"+tempStatus]){
                    allFilterInfo[fullStatus] = true
                    allFilterInfo["!status: !"+tempStatus] = true
                }
            }
            // Arrange
            // if(typeof format==="string"){
            //     if(alteredVariables.format_in["format: "+format.trim().toLowerCase()]||recSchemeIsNew) animeShallUpdate=true
            // }
            if(!animeShallUpdate){
                for(let j=0; j<genres.length; j++){
                    var genre = genres[j]
                    if(typeof genre!=="string") continue
                    if((alteredVariables.genres_in["genre: "+genre.trim().toLowerCase()]
                        &&!animeShallUpdate)
                    ||recSchemeIsNew){
                        animeShallUpdate = true
                        break
                    }
                }
            }
            if(!animeShallUpdate){
                for(let j=0; j<tags.length; j++){
                    var tag = tags[j]?.name
                    if(typeof tag!=="string") continue
                    if((alteredVariables.tags_in["tag: "+tag.trim().toLowerCase()]
                        &&!animeShallUpdate)
                    ||recSchemeIsNew){
                        animeShallUpdate = true
                        break
                    }
                }
            }
            if(!animeShallUpdate){
                for(let j=0; j<studios.length; j++){
                    var studio = studios[j]?.name
                    if(typeof studio!=="string") continue
                    studio = studio.trim().toLowerCase()
                    if((alteredVariables.studios_in["studio: "+studio]
                        &&!animeShallUpdate)
                    ||recSchemeIsNew){
                        animeShallUpdate = true
                        break
                    }
                }
            }
            if(!animeShallUpdate){
                for(let j=0; j<staffs.length; j++){
                    var staff = staffs[j]?.node?.name?.userPreferred
                    if(typeof staff!=="string") continue
                    staff = staff.trim().toLowerCase()
                    if((alteredVariables.staff_in["staff: "+staff]
                        &&!animeShallUpdate)
                    ||recSchemeIsNew){
                        animeShallUpdate = true
                        break
                    }
                }
            }
            // Check if any variable is Altered, and continue
            if(!animeShallUpdate) continue
            var genresIncluded = {}
            var tagsIncluded = {}
            var studiosIncluded = {}
            var staffIncluded = {}
            // Analyze
            // var zformat = []
            // if(typeof format==="string"){
            //     var tmpformat = format.trim().toLowerCase()
            //     var fullFormat = "format: "+tmpformat
            //     if(typeof varScheme.format[fullFormat]==="number") {
            //         zformat.push(varScheme.format[fullFormat])
            //     } else if(typeof varScheme.meanFormat==="number"&&includeUnknownVar){
            //         zformat.push(varScheme.meanFormat-minNumber)
            //     }
            //     // Filters
            //     if(!allFilterInfo[fullFormat]
            //      &&!allFilterInfo["!format: !"+tmpformat]){
            //         allFilterInfo[fullFormat] = true
            //         allFilterInfo["!format: !"+tmpformat] = true
            //     }
            // }
            var zgenres = []
            for(let j=0; j<genres.length; j++){
                var genre = genres[j]
                if(typeof genre!=="string") continue
                genre = genre.trim().toLowerCase()
                var fullGenre = "genre: "+genre
                if(typeof varScheme.genres[fullGenre]==="number") {
                    zgenres.push(varScheme.genres[fullGenre])
                    // Top Similarities
                    if(typeof varScheme.meanGenres==="number"){
                        if(varScheme.genres[fullGenre]>=varScheme.meanGenres
                         &&!genresIncluded[fullGenre]){
                            var tmpscore = varScheme.genres[fullGenre]
                            genresIncluded[fullGenre] = [
                                genre+" ("+tmpscore.toFixed(2)+")",
                                tmpscore
                            ]
                        }
                    }
                } else if(typeof varScheme.meanGenres==="number"&&includeUnknownVar){
                    zgenres.push(varScheme.meanGenres-minNumber)
                }
                // Filters
                if(!allFilterInfo[fullGenre]
                 &&!allFilterInfo["!genre: !"+genre]){
                    allFilterInfo[fullGenre] = true 
                    allFilterInfo["!genre: !"+genre] = true
                }
            }
            //
            var ztags = []
            for(let j=0; j<tags.length; j++){
                var tag = tags[j]?.name
                if(typeof tag!=="string") continue
                var tagCategory = tags[j]?.category
                if(typeof tagCategory!=="string") continue
                var tagRank = tags[j]?.rank
                tag = tag.trim().toLowerCase()
                var fullTag = "tag: "+tag
                tagCategory = tagCategory.trim().toLowerCase()
                var fullTagCategory = "tag category: "+tagCategory
                if(!jsonIsEmpty(varScheme.includeCategories)){
                    if(varScheme.includeCategories[fullTagCategory]){
                        if(typeof varScheme.tags[fullTag]==="number"
                         &&(typeof tagRank==="number"
                          ||typeof varScheme.meanTags==="number")){
                            if(tagRank>=50){
                                ztags.push(varScheme.tags[fullTag])
                            } else if(typeof varScheme.meanTags==="number"){
                                if(varScheme.tags[fullTag]<varScheme.meanTags){
                                    ztags.push(varScheme.tags[fullTag])
                                } else if(includeUnknownVar){
                                    ztags.push(varScheme.meanTags-minNumber)
                                }
                            }
                            // Top Similarities
                            if(typeof varScheme.meanTags==="number"
                             &&typeof tagRank==="number"){
                                if(tagRank>=50 
                                 &&varScheme.tags[fullTag]>=varScheme.meanTags
                                 &&!tagsIncluded[fullTag]){
                                    var tmpscore = varScheme.tags[fullTag]
                                    tagsIncluded[fullTag] = [
                                        tag+" ("+tmpscore.toFixed(2)+")",
                                        tmpscore
                                    ]
                                }
                            }
                        }
                    }
                } else {
                    if(!varScheme.excludeCategories[fullTagCategory]){
                        if(typeof varScheme.tags[fullTag]==="number"
                         &&(typeof tagRank==="number"
                          ||typeof varScheme.meanTags==="number")){
                            if(tagRank>=50){
                                ztags.push(varScheme.tags[fullTag])
                            } else if(typeof varScheme.meanTags==="number"){
                                if(varScheme.tags[fullTag]<varScheme.meanTags){
                                    ztags.push(varScheme.tags[fullTag])
                                } else if(includeUnknownVar){
                                    ztags.push(varScheme.meanTags-minNumber)
                                }
                            }
                            // Top Similarities
                            if(typeof varScheme.meanTags==="number"
                             &&typeof tagRank==="number"){
                                if(tagRank>=50
                                 &&varScheme.tags[fullTag]>=varScheme.meanTags
                                 &&!tagsIncluded[fullTag]){
                                    var tmpscore = varScheme.tags[fullTag]
                                    tagsIncluded[fullTag] = [
                                        tag+" ("+tmpscore.toFixed(2)+")",
                                        tmpscore
                                    ]
                                }
                            }
                        }
                    }
                }
                // Filters
                if(!allFilterInfo[fullTagCategory]
                 &&!allFilterInfo["!tag category: !"+tagCategory]){
                    allFilterInfo[fullTagCategory] = true 
                    allFilterInfo["!tag category: !"+tagCategory] = true
                }
                if(!allFilterInfo[fullTag]
                 &&!allFilterInfo["!tag: !"+tag]){
                    allFilterInfo[fullTag] = true 
                    allFilterInfo["!tag: !"+tag] = true
                }
            }
            //
            var zstudios = []
            var includedStudios = {}
            for(let j=0; j<studios.length; j++){
                var studio = studios[j]?.name
                if(typeof studio!=="string") continue
                if(includedStudios[studio]) continue
                includedStudios[studio] = true
                studio = studio.trim().toLowerCase()
                var fullStudio = "studio: "+studio
                if(typeof varScheme.studios[fullStudio]==="number"){
                    zstudios.push(varScheme.studios[fullStudio])
                    // Top Similarities
                    if(typeof varScheme.meanStudios==="number"){
                        var studioUrl = studios[j]?.siteUrl
                        if(varScheme.studios[fullStudio]>=varScheme.meanStudios
                        &&!studiosIncluded[fullStudio]
                        &&typeof studioUrl==="string"){
                            var tmpscore = varScheme.studios[fullStudio]
                            studiosIncluded[fullStudio] = [
                                {[studio+" ("+tmpscore.toFixed(2)+")"]: studioUrl},
                                tmpscore
                            ]
                        }
                    }
                } else if(typeof varScheme.meanStudios==="number"&&includeUnknownVar){
                    zstudios.push(varScheme.meanStudios-minNumber)
                }
                // Filters
                // Removed Since It's Lagging on Too Much Filters
                // if(!allFilterInfo["studio: "+fullStudio]
                //  &&!allFilterInfo["!studio: !"+studio]){
                //     allFilterInfo["studio: "+fullStudio] = true  
                //     allFilterInfo["!studio: !"+studio] = true
                // }
            }
            //
            var zstaff = {}
            var includedStaff = {}
            for(let j=0; j<staffs.length; j++){
                var staff = staffs[j]?.node?.name?.userPreferred
                if(typeof staff!=="string") continue
                if(includedStaff[staff]) continue
                includedStaff[staff] = true
                var staffRole = staffs[j]?.role
                if(typeof staffRole!=="string") continue
                staff = staff.trim().toLowerCase()
                var fullStaff = "staff: "+staff
                staffRole = staffRole.split("(")[0].trim().toLowerCase()
                var fullStaffRole = "staff role: "+staffRole
                if(!jsonIsEmpty(varScheme.includeRoles)){
                    if(varScheme.includeRoles[fullStaffRole]){
                        if(typeof varScheme.staff[fullStaff]==="number"){
                            if(!zstaff[fullStaffRole]){
                                zstaff[fullStaffRole] = [varScheme.staff[fullStaff]]
                            } else {
                                zstaff[fullStaffRole].push(varScheme.staff[fullStaff])
                            }
                            // Top Similarities
                            if(typeof varScheme.meanStaff==="number"){
                                var staffUrl = staffs[j]?.node?.siteUrl
                                if(varScheme.staff[fullStaff]>=varScheme.meanStaff
                                &&!staffIncluded[fullStaff]
                                &&typeof staffUrl==="string"){
                                    var tmpscore = varScheme.staff[fullStaff]
                                    staffIncluded[fullStaff] = [
                                        {[staffRole+": "+staff+" ("+tmpscore.toFixed(2)+")"]: staffUrl},
                                        tmpscore
                                    ]
                                }
                            }
                        } else if(typeof varScheme.meanStaff==="number"&&includeUnknownVar){
                            if(!zstaff[fullStaffRole]){
                                zstaff[fullStaffRole] = [varScheme.meanStaff-minNumber]
                            } else {
                                zstaff[fullStaffRole].push(varScheme.meanStaff-minNumber)
                            }
                        }
                    }
                } else {
                    if(!varScheme.excludeRoles[fullStaffRole]){
                        if(typeof varScheme.staff[fullStaff]==="number"){
                            if(!zstaff[fullStaffRole]){
                                zstaff[fullStaffRole] = [varScheme.staff[fullStaff]]
                            } else {
                                zstaff[fullStaffRole].push(varScheme.staff[fullStaff])
                            }
                            // Top Similarities
                            if(typeof varScheme.meanStaff==="number"){
                                var staffUrl = staffs[j]?.node?.siteUrl
                                if(varScheme.staff[fullStaff]>=varScheme.meanStaff
                                &&!staffIncluded[fullStaff]
                                &&typeof staffUrl==="string"){
                                    var tmpscore = varScheme.staff[fullStaff]
                                    staffIncluded[fullStaff] = [
                                        {[staffRole+": "+staff+" ("+tmpscore.toFixed(2)+")"]: staffUrl},
                                        tmpscore
                                    ]
                                }
                            }
                        } else if(typeof varScheme.meanStaff==="number"&&includeUnknownVar){
                            if(!zstaff[fullStaffRole]){
                                zstaff[fullStaffRole] = [varScheme.meanStaff-minNumber]
                            } else {
                                zstaff[fullStaffRole].push(varScheme.meanStaff-minNumber)
                            }
                        }
                    }
                }
                // filters
                if(!allFilterInfo[fullStaffRole]
                 &&!allFilterInfo["!staff role: !"+staffRole]){
                    allFilterInfo[fullStaffRole] = true  
                    allFilterInfo["!staff role: !"+staffRole] = true
                }
                // Removed Since It's Lagging on Too Much Filters
                // if(!allFilterInfo[fullStaff]
                //  &&!allFilterInfo["!staff: !"+staff]){
                //     allFilterInfo[fullStaff] = true  
                //     allFilterInfo["!staff: !"+staff] = true
                // }
            }
            
            // Anime Type
            var animeType = []
            var seasonYear = anime?.seasonYear
            var yearModel = varScheme.yearModel
            if(isaN(seasonYear)&&!jsonIsEmpty(yearModel)){
                if(typeof seasonYear==="string"){
                    seasonYear = parseFloat(seasonYear)
                }
                animeType.push(Math.max(1,LRpredict(yearModel,seasonYear)))
            } else {
                animeType.push(1)
            }
            var averageScore = anime?.averageScore
            var averageScoreModel = varScheme.averageScoreModel
            if(isaN(averageScore)&&!jsonIsEmpty(averageScoreModel)){
                if(typeof averageScore==="string"){
                    averageScore = parseFloat(averageScore)
                }
                animeType.push(Math.max(1,LRpredict(averageScoreModel,averageScore)))
            } else {
                animeType.push(1)
            }

            // Anime Content
            var animeContent = []
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
            var animeProduction = []
            var zstaffRolesArray = Object.values(zstaff).map((e)=>{
                if(measure==="mode"){
                    return Math.max(1,arrayMode(e))
                } else {
                    return Math.max(1,arrayMean(e))
                }
            }) || []
            
            if(zstaffRolesArray.length&&zstudios.length){
                if(measure==="mode"){
                    animeProduction.push(Math.max(1,arrayMean(zstaffRolesArray.concat([Math.max(1,arrayMode(zstudios))]))))
                } else {
                    animeProduction.push(Math.max(1,arrayMean(zstaffRolesArray.concat([Math.max(1,arrayMean(zstudios))]))))
                }
            } else if(zstaffRolesArray.length){
                animeProduction.push(Math.max(1,arrayMean(zstaffRolesArray)))
            } else if(zstudios.length){
                if(measure==="mode"){
                    animeProduction.push(Math.max(1,arrayMode(zstudios)))
                } else {
                    animeProduction.push(Math.max(1,arrayMean(zstudios)))
                }
            } else {
                animeProduction.push(1)
            }
            // Scores
            var score = Math.max(1,arrayProbability([
                Math.max(1,arrayProbability(animeType)),
                Math.max(1,arrayProbability(animeContent)),
                Math.max(1,arrayProbability(animeProduction))
            ]))
            var weightedScore = score
            // Other Anime Recommendation Info
            genres = genres.length?genres:[]
            tags = tags.length?tags.map((e)=>e?.name||""):[]
            studios = studios.reduce((result,e)=>Object.assign(result,{[e?.name]:e?.siteUrl}),{})
            staffs = staffs.reduce((result,e)=>Object.assign(result,{[e?.node?.name?.userPreferred]:e?.node?.siteUrl}),{})
            // Sort all Top Similarities
            var variablesIncluded = Object.values(genresIncluded)
                .concat(Object.values(tagsIncluded))
                .concat(Object.values(studiosIncluded))
                .concat(Object.values(staffIncluded))
                .sort((a,b)=>{return b?.[1]-a?.[1]}).map((e)=>{return e?.[0]||""})
            variablesIncluded = variablesIncluded.length?variablesIncluded:[]
            savedRecScheme[anilistId] = {
                id: anilistId, title: title, animeUrl: animeUrl, 
                userScore: userListStatus?.userScore?.[anilistId], 
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
        // Add Weight to Scores
        var savedRecSchemeEntries = Object.keys(savedRecScheme)
        for(let i=0;i<savedRecSchemeEntries.length;i++){
            var anime = savedRecScheme[savedRecSchemeEntries[i]]
            var popularity = anime.popularity
            var weightedScore = anime.weightedScore
            var averageScore = anime.averageScore
            // Low Average Scores
            // Low Average
            if(isaN(averageScore)){
                if(typeof averageScore==="string"){
                    averageScore = parseFloat(averageScore)
                }
                if(averageScore<averageScoreMode){
                    var ASmult = averageScore*0.01
                    savedRecScheme[savedRecSchemeEntries[i]].weightedScore = weightedScore*(ASmult>=1?1:ASmult)
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
                    savedRecScheme[savedRecSchemeEntries[i]].weightedScore = (
                        popularity? (anime.popularity/popularitySum)*weightedScore
                        : (minNumber/popularitySum)*weightedScore
                    )
                }
            }
            if(!anime.weightedScore||!isFinite(anime.weightedScore)){
                savedRecScheme[savedRecSchemeEntries[i]].weightedScore = 0
            }
            if(!anime.score||!isFinite(anime.score)){
                savedRecScheme[savedRecSchemeEntries[i]].score = 0
            }
        }
    } else {
        for(let i=0; i<animeEntries.length; i++){
            var anime = animeEntries[i]
            var title = anime?.title?.userPreferred
            var anilistId = anime?.id
            var animeUrl = anime?.siteUrl
            var format = anime?.format
            var year = anime?.seasonYear
            var season = anime?.season
            var genres = anime?.genres || []
            var tags = anime?.tags || []
            var studios = anime?.studios?.nodes?.filter((studio)=>{return studio?.isAnimationStudio}) || []
            var staffs = anime?.staff?.edges || []
            var status = anime?.status
            var popularity = anime?.popularity
            //
            if(!allFilterInfo["wscore>="]
             &&!allFilterInfo["wscore>"]
             &&!allFilterInfo["wscore<"]
             &&!allFilterInfo["wscore<="]
             &&!allFilterInfo["wscore:"]){
                allFilterInfo["wscore>="] = true
                allFilterInfo["wscore>"] = true
                allFilterInfo["wscore<"] = true
                allFilterInfo["wscore<="] = true
                allFilterInfo["wscore:"] = true
            }
            if(!allFilterInfo["score>="]
             &&!allFilterInfo["score>"]
             &&!allFilterInfo["score<"]
             &&!allFilterInfo["score<="]
             &&!allFilterInfo["score:"]){
                allFilterInfo["score>="] = true
                allFilterInfo["score>"] = true
                allFilterInfo["score<"] = true
                allFilterInfo["score<="] = true
                allFilterInfo["score:"] = true
            }
            if(!allFilterInfo["user score>="]
             &&!allFilterInfo["user score>"]
             &&!allFilterInfo["user score<"]
             &&!allFilterInfo["user score<="]
             &&!allFilterInfo["user score:"]){
                allFilterInfo["user score>="] = true
                allFilterInfo["user score>"] = true
                allFilterInfo["user score:"] = true
                allFilterInfo["user score<"] = true
                allFilterInfo["user score<="] = true
            }
            if(!allFilterInfo["average score>="]
             &&!allFilterInfo["average score>"]
             &&!allFilterInfo["average score<"]
             &&!allFilterInfo["average score<="]
             &&!allFilterInfo["average score:"]){
                allFilterInfo["average score>="] = true
                allFilterInfo["average score>"] = true
                allFilterInfo["average score:"] = true
                allFilterInfo["average score<"] = true
                allFilterInfo["average score<="] = true
            }
            if(!allFilterInfo["popularity>="]
             &&!allFilterInfo["popularity>"]
             &&!allFilterInfo["popularity<"]
             &&!allFilterInfo["popularity<="]
             &&!allFilterInfo["popularity:"]){
                allFilterInfo["popularity>="] = true
                allFilterInfo["popularity>"] = true
                allFilterInfo["popularity<"] = true
                allFilterInfo["popularity<="] = true
                allFilterInfo["popularity:"] = true
            }
            if(!allFilterInfo["year>="]
             &&!allFilterInfo["year>"]
             &&!allFilterInfo["year<"]
             &&!allFilterInfo["year<="]
             &&!allFilterInfo["year:"]){
                allFilterInfo["year:"] = true
                allFilterInfo["year>="] = true
                allFilterInfo["year>"] = true
                allFilterInfo["year<"] = true
                allFilterInfo["year<="] = true
            }
            if(!allFilterInfo["minimum popularity: "]){
                allFilterInfo["minimum popularity: "] = true
            }
            if(!allFilterInfo["minimum average score: "]){
                allFilterInfo["minimum average score: "] = true
            }
            if(!allFilterInfo["limit top similarities: "]){
                allFilterInfo["limit top similarities: "] = true
            }
            if(!allFilterInfo["measure: mode"]
             &&!allFilterInfo["measure: mean"]){
                allFilterInfo["measure: mode"] = true
                allFilterInfo["measure: mean"] = true
            }
            if(!allFilterInfo["include unknown variables: true"]
             &&!allFilterInfo["include unknown variables: false"]){
                allFilterInfo["include unknown variables: true"] = true
                allFilterInfo["include unknown variables: false"] = true
            }
            if(!allFilterInfo["staff: "]
             &&!allFilterInfo["!staff: !"]){
                allFilterInfo["staff: "] = true
                allFilterInfo["!staff: !"] = true
            }
            if(!allFilterInfo["studio: "]
             &&!allFilterInfo["!studio: !"]){
                allFilterInfo["studio: "] = true
                allFilterInfo["!studio: !"] = true
            }
            // if(!allFilterInfo["format: all"]
            //  &&!allFilterInfo["!format: !all"]){
            //     allFilterInfo["format: all"] = true
            //     allFilterInfo["!format: !all"] = true
            // }
            if(!allFilterInfo["genre: all"]
             &&!allFilterInfo["!genre: !all"]){
                allFilterInfo["genre: all"] = true 
                allFilterInfo["!genre: !all"] = true
            }
            if(!allFilterInfo["tag category: all"]
             &&!allFilterInfo["!tag category: !all"]){
                allFilterInfo["tag category: all"] = true 
                allFilterInfo["!tag category: !all"] = true
            }
            if(!allFilterInfo["tag: all"]
             &&!allFilterInfo["!tag: !all"]){
                allFilterInfo["tag: all"] = true 
                allFilterInfo["!tag: !all"] = true
            }
            if(!allFilterInfo["studio: all"]
             &&!allFilterInfo["!studio: !all"]){
                allFilterInfo["studio: all"] = true  
                allFilterInfo["!studio: !all"] = true
            }
            if(!allFilterInfo["staff role: all"]
             &&!allFilterInfo["!staff role: !all"]){
                allFilterInfo["staff role: all"] = true
                allFilterInfo["!staff role: !all"] = true
            }
            if(!allFilterInfo["staff: all"]
             &&!allFilterInfo["!staff: !all"]){
                allFilterInfo["staff: all"] = true
                allFilterInfo["!staff: !all"] = true
            }
            //
            if(typeof title==="string"){
                var fullTitle = "title: "+title.trim().toLowerCase()
                if(!allFilterInfo[fullTitle]){
                    allFilterInfo[fullTitle] = true
                }
            }
            if(typeof season==="string"){
                var tempSeason = season.trim().toLowerCase()
                var fullSeason = "season: "+tempSeason
                if(!allFilterInfo[fullSeason]
                 &&!allFilterInfo["!season: !"+tempSeason]){
                    allFilterInfo[fullSeason] = true
                    allFilterInfo["!season: !"+tempSeason] = true
                }
            }
            if(typeof status==="string"){
                var tempStatus = status.trim().toLowerCase()
                var fullStatus = "status: "+tempStatus
                if(!allFilterInfo[fullStatus]
                 &&!allFilterInfo["!status: !"+tempStatus]){
                    allFilterInfo[fullStatus] = true
                    allFilterInfo["!status: !"+tempStatus] = true
                }
            }
            // if(typeof format==="string"){
            //     var tempFormat = format.trim().toLowerCase()
            //     var fullFormat = "format: "+tempFormat
            //     if(!allFilterInfo[fullFormat]
            //      &&!allFilterInfo["!format: !"+tempFormat]){
            //         allFilterInfo[fullFormat] = true
            //         allFilterInfo["!format: !"+tempFormat] = true
            //     }
            // }
            // Arrange
            for(let j=0; j<genres.length; j++){
                var genre = genres[j]
                if(typeof genre!=="string") continue
                genre = genre.trim().toLowerCase()
                fullGenre = "genre: "+genre
                if(!allFilterInfo[fullGenre]
                 &&!allFilterInfo["!genre: !"+genre]){
                    allFilterInfo[fullGenre] = true 
                    allFilterInfo["!genre: !"+genre] = true
                }
            }
            for(let j=0; j<tags.length; j++){
                var tag = tags[j]?.name
                if(typeof tag!=="string") continue
                tag = tag.trim().toLowerCase()
                fullTag = "tag: "+tag
                if(!allFilterInfo[fullTag]
                 &&!allFilterInfo["!tag: !"+tag]){
                    allFilterInfo[fullTag] = true 
                    allFilterInfo["!tag: !"+tag] = true
                }
                var tagCategory = tags[j]?.category
                if(typeof tagCategory!=="string") continue
                tagCategory = tagCategory.trim().toLowerCase()
                var fullTagCategory = "tag category: "+tagCategory
                if(!allFilterInfo[fullTagCategory]
                 &&!allFilterInfo["!tag category: !"+tagCategory]){
                    allFilterInfo[fullTagCategory] = true 
                    allFilterInfo["!tag category: !"+tagCategory] = true
                }
            }
            for(let j=0; j<studios.length; j++){
                var studio = studios[j]?.name
                if(typeof studio!=="string") continue
                studio = studio.trim().toLowerCase()
                var fullStudio = "studio: "+studio
                // Removed Since It's Lagging on Too Much Filters
                // if(!allFilterInfo[fullStudio]
                //  &&!allFilterInfo["!studio: !"+studio]){
                //     allFilterInfo[fullStudio] = true  
                //     allFilterInfo["!studio: !"+studio] = true
                // }
            }
            for(let j=0; j<staffs.length; j++){
                // var staff = staffs[j]?.node?.name?.userPreferred
                // if(typeof staff!=="string") continue
                // staff = staff.trim().toLowerCase()
                // var fullStaff = "staff: "+staff
                // Removed Since It's Lagging on Too Much Filters
                // if(!allFilterInfo[fullStaff]
                //  &&!allFilterInfo[("!staff: !"+staff]){
                //     allFilterInfo[fullStaff] = true
                //     allFilterInfo["!staff: !"+staff] = true
                // }
                var staffRole = staff[j].role
                if(typeof staffRole!=="string") continue
                staffRole = staffRole.split("(")[0].trim().toLowerCase()
                var fullStaffRole = "staff role: "+staffRole
                if(!allFilterInfo[fullStaffRole]
                 &&!allFilterInfo["!staff role: !"+staffRole]){
                    allFilterInfo[fullStaffRole] = true
                    allFilterInfo["!staff role: !"+staffRole] = true
                }
            }
            var score = weightedScore = 0
            var averageScore = anime?.averageScore
            if(isaN(averageScore)){
                if(typeof averageScore==="string"){
                    averageScore = parseFloat(averageScore)
                }
            }
            var favourites = anime?.favourites
            if(isaN(favourites)){
                if(typeof favourites==="string"){
                    favourites = parseFloat(favourites)
                }
            }
            var popularity = anime?.popularity
            if(isaN(popularity)){
                if(typeof popularity==="string"){
                    popularity = parseFloat(popularity)
                }
            }
            if(isaN(averageScore)
             &&isaN(favourites)
             &&isaN(popularity)
             &&popularity){
                var favPopRatio = 1
                if(anime.favourites<anime.popularity){
                    favPopRatio = anime.favourites/anime.popularity
                }
                var ASmult = averageScore*0.01
                score = weightedScore = ((favPopRatio)*(ASmult>=1?1:ASmult))-minNumber
            }
            // Other Anime Recommendation Info
            genres = genres.length?genres:[]
            tags = tags.length?tags.map((e)=>e?.name||""):[]
            studios = studios.reduce((result,e)=>Object.assign(result,{[e?.name]:e?.siteUrl}),{})
            staffs = staffs.reduce((result,e)=>Object.assign(result,{[e?.node?.name?.userPreferred]:e?.node?.siteUrl}),{})
            savedRecScheme[anilistId] = {
                id: anilistId, title: title, animeUrl: animeUrl, 
                userScore: userListStatus?.userScore?.[anilistId], 
                averageScore: averageScore,
                popularity: popularity,
                score: score, weightedScore: weightedScore, 
                variablesIncluded: [],
                userStatus: userStatus, status: status,
                // Others
                genres: genres, tags: tags, year: year, 
                season: season, format: format, studios: studios, staffs: staffs
            }
        }
        // Add Weight to Scores
        var savedRecSchemeEntries = Object.keys(savedRecScheme)
        for(let i=0;i<savedRecSchemeEntries.length;i++){
            var anime = savedRecScheme[savedRecSchemeEntries[i]]
            var popularity = anime.popularity
            var weightedScore = anime.weightedScore
            if(typeof popularity==="number"
             &&typeof popularityMode==="number"
             &&typeof popularitySum==="number"
             &&popularitySum
             &&typeof weightedScore==="number"
             &&weightedScore){
                if(popularity<popularityMode) {
                    savedRecScheme[savedRecSchemeEntries[i]].weightedScore = (
                        popularity? (anime.popularity/popularitySum)*weightedScore
                        : (minNumber/popularitySum)*weightedScore
                    )
                }
            }
            if(!anime.weightedScore||!isFinite(anime.weightedScore)){
                savedRecScheme[savedRecSchemeEntries[i]].weightedScore = 0
            }
            if(!anime.score||!isFinite(anime.score)){
                savedRecScheme[savedRecSchemeEntries[i]].score = 0
            }
        }
    }
    self.postMessage({
        savedRecScheme: savedRecScheme,
        allFilterInfo: allFilterInfo,
        animeFranchises: animeFranchises
    })
    // Used Functions
    function isaN(num){
        if(!num&&num!==0){return false}
        else if(typeof num==='string'){return num.split(' ').join('').length}
        else if(typeof num==='boolean'){return false}
        return !isNaN(num)
    }
    function isJson(j){
        if(j instanceof Array||typeof j==="string") return false
        for(e in j) return true
        return false
    }
    function jsonIsEmpty(obj){
        if(isJson(obj)){
            for(var i in obj) return false
        }
        return true
    }
    function arrayProbability(obj){
        if(!obj?.length) return 0
        return obj.reduce((a, b) => a * b, 1)
    }
    function arraySum(obj) {
        return obj.reduce((a, b) => a + b, 0)
    }
    function arrayMean(obj) {
        return (arraySum(obj) / obj.length) || 0
    }
    function arrayMode(obj){
        if(!obj.length||!(obj instanceof Array)){return}
        else if(obj.length<3){return arrayMean(obj)}
        var max = parseFloat(Math.max(...obj))
        var min = parseFloat(Math.min(...obj))
        const boundary = minNumber  // Min Value Javascript
        var classW = parseFloat(((max-min)/(1.0+(3.322*Math.log(obj.length)))))
        var classIs
        if(max===min||classW<boundary){ // To avoid Inf loop if classWidth is very small
            classIs = [{low:min,high:max,freq:0}]
        } else {
            var high = min+classW-boundary, low = min
            classIs = [{low:low,high:high,freq:0}]
            while(classIs.slice(-1)[0].high<max){
                low=high+boundary
                high=low+classW-boundary
                classIs.push({low:low,high:high,freq:0})
            }
        }
        for(let i=0;i<obj.length;i++){
            for(let j=0;j<classIs.length;j++){
                var num = obj[i]
                if(num>=classIs[j].low&&num<=classIs[j].high){ 
                    ++classIs[j].freq
                    continue
                }
            }
        }
        var modeClass = classIs[0]
        var modeIdx = 0
        for(let i=1;i<classIs.length;i++){
            if(classIs[i].freq>modeClass.freq){
                modeClass = classIs[i]
                modeIdx = i
            }
        }
        var modLowLim = modeClass.low
        var modFreq = modeClass.freq
        var modPreFreq = !classIs[modeIdx-1]?0:classIs[modeIdx-1].freq
        var modSucFreq = !classIs[modeIdx+1]?0:classIs[modeIdx+1].freq
        return modLowLim+(((modFreq-modPreFreq)/((2*modFreq)-modPreFreq-modSucFreq))*classW)
    }
    // Linear Regression
    function LRpredict(modelObj, x){
        if(!modelObj) return null
        if(!modelObj.slope||!modelObj.intercept) return null
        if(isNaN(modelObj.slope)||isNaN(modelObj.intercept)) return null
        return (parseFloat(modelObj.slope)*x)+parseFloat(modelObj.intercept)
    }
}