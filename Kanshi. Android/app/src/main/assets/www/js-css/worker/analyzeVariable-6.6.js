self.onmessage = (message) => {
    const minNumber = 1-6e-17!==1? 6e-17 : 1e-16 // Min Value Javascript
    const mediaRelationTypes = ["adaptation","prequel","sequel","parent","side_story","summary","alternative","spin_off"]
    const availableFilterTypes = {minsize:true,minsizes:true,minsamplesize:true,minsamplesizes:true,minimumsizes:true,minimumsizes:true,minimumsamplesize:true,minimumsamplesizes:true,format:true,formats:true,genre:true,genres:true,tagcategory:true,tagcategories:true,tag:true,tags:true,studio:true,studios:true,staffrole:true,staffroles:true,staff:true,staffs:true,measure:true,measures:true,average:true,averages:true,includeunknownvariables:true,unknownvariables:true,unknownvariable:true,includeunknown:true,unknown:true,samplesizes:true,samplesize:true,samples:true,sample:true,size:true,minimumpopularity:true,minpopularity:true,popularity:true,minimumaveragescores:true,minimumaveragescore:true,minimumaverages:true,minimumaverage:true,minimumscores:true,minimumscore:true,averagescores:true,averagescore:true,scores:true,score:true,minaveragescores:true,minaveragescore:true,minaverages:true,minaverage:true,minscores:true,minscore:true,minimumavescores:true,minimumavescore:true,minimumave:true,avescores:true,avescore:true,limittopsimilarity:true,limittopsimilarities:true,limitsimilarity:true,limitsimilarities:true,topsimilarities:true,topsimilarity:true,similarities:true,similarity:true,userscore:true,userscores:true,wscore:true,wscores:true,year:true,years:true,season:true,seasons:true,userstatus:true,status:true,title:true,titles:true}
    const data = message?.data
    const notAnUpdate = data?.notAnUpdate
    const savedAnimeFranchises = data?.savedAnimeFranchises || []
    const savedAnimeEntries = data?.savedAnimeEntries || {}
    var savedUserList = data?.savedUserList || {}
    var tempUserList = {}
    // Filter Algorithm
    var measure = "mean"
    var includeUnknownVar = true
    var minSampleSize
    var sampleSize
    var minPopularity
    var minAverageScore
    var includeYear = true
    var includeAverageScore = true
    // Filter Algorithm
    var userEntries
    var include = {
    //    formats: {}, 
        genres: {}, tags: {}, categories: {}, studios: {}, staffs: {}, roles: {}
    }, 
    exclude = {
    //    formats: {}, 
       genres: {}, tags: {}, categories: {}, studios: {}, staffs: {}, roles: {} 
    }, 
    savedFilterAlgo = data?.savedFilterAlgo ?? [],
    savedIncluded = [],
    savedExcluded = [],
    filterName
    // Group Filters
    for(let i=0; i<savedFilterAlgo.length; i++){
        filterName = savedFilterAlgo[i].trim().toLowerCase()
        if(filterName.charAt(0)==="!") {
            filterName = filterName.slice(1)
            filterName = typeof filterName==="string"? filterName.split(":") : []
            // Only Allow Specific (non-specified removes almost all predictors)
            if(filterName.length>1){
                filterName = [filterName.shift(),filterName.join()]
                var type = filterName[0]
                var cinfo = filterName[1].trim().toLowerCase()
                if(cinfo.charAt(0)==="!"){
                    cinfo = cinfo.slice(1)
                    savedExcluded.push(type+":"+cinfo)
                } else {
                    savedExcluded.push(type+":"+cinfo)
                }
            } else if(filterName.length===1){
                savedExcluded.push(filterName[0])
            }
        }
        else savedIncluded.push(filterName)
    }
    for(let i=0;i<savedIncluded.length;i++){
        if(typeof savedIncluded[i]!=="string") continue
        // Get the type, seperator, and content
        var included = savedIncluded[i].trim().toLowerCase().split(/(:)/)
        if(included.length>2&&availableFilterTypes[included[0].replace(/\s|-|_/g,"")]){
            included = [included.shift(),included.shift(),included.join("").trim()]
        } else {
            included = included.shift()
        }
        var type, filter, seperator
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
                include.categories["category: "+filter] = true
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
                include.roles["role: "+filter] = true
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
            if(type===("includeunknownvariables")
             ||type===("includeunknownvariable")
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
        var excluded = savedExcluded[i].trim().toLowerCase().split(/(:)/)
        if(excluded.length>2&&availableFilterTypes[excluded[0].replace(/\s|-|_/g,"")]){
            excluded = [excluded.shift(),excluded.shift(),excluded.join("").trim()]
        } else {
            excluded = excluded.shift()
        }
        var type, filter, seperator
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
                exclude.categories["category: "+filter] = true
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
                exclude.roles["role: "+filter] = true
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
    var userListCount = 0
    if(!notAnUpdate){
        if(jsonIsEmpty(savedAnimeEntries)){
            userListCount = 1000 // Stop User Alert
            userEntries = []
        } else {
            userEntries = data?.userEntries || []
            userEntries = userEntries.reduce((result, userEnty)=>{
                var anime = userEnty?.media
                var tmpAnimeEntry = {}
                if(anime?.id&&savedAnimeEntries[anime?.id]){
                    tmpAnimeEntry.media = savedAnimeEntries[anime?.id]
                    tmpAnimeEntry.status = userEnty.status
                    tmpAnimeEntry.score = userEnty.score
                    result.push(tmpAnimeEntry)
                }
                return result
            },[])
        }
    } else {
        savedUserList = Object.values(savedUserList)
        for(let i=0;i<savedUserList.length;i++){
            if(typeof savedUserList[i]==="string"){
                savedUserList[i] = parseJson(savedUserList[i])
            }
        }
        userEntries = savedUserList || []
        tempUserList = {}
    }
    var alteredVariables = {
        // format_in: {},
        genres_in: {},
        tags_in: {},
        studios_in: {},
        staff_in: {},
    }
    // sort by popularity for unique anime in franchise
    if(userEntries.length>1){
        if( typeof userEntries[0]?.score==="number"
            &&typeof userEntries[1]?.score==="number"
            &&typeof userEntries[0]?.media?.popularity==="number"
            &&typeof userEntries[1]?.media?.popularity==="number"){
            userEntries.sort((a,b)=>{
                return b.score-a.score
            })
            userEntries.sort((a,b)=>{
                if(a.score===b.score){
                    return b.media.popularity-a.media.popularity
                }
            })
        }
    }
    var varScheme = {
        // format: {},
        genres: {},
        tags: {},
        studios: {},
        staff: {}
    }
    // Check Watched
    var userListStatus = {
        userScore: {},
        userStatus: {}
    }
    // For Linear Regression Models
    // var episodes = []
    // var duration = []
    var averageScore = []
    // var trending = []
    // var popularity = []
    // var favourites = []
    var year = []
    //
    // var formatMeanCount = {}
    var genresMeanCount = {}
    var tagsMeanCount = {}
    var studiosMeanCount = {}
    var staffMeanCount = {}
    // For checking any deleted Anime
    var savedUserListIDs = Object.keys(savedUserList) || []
    var newUserListIDs = {}
    // Analyze each Anime Variable
    var includedAnimeRelations = {}
    for(let i=0; i<userEntries.length; i++){
        var isNewAnime = false
        var anime = userEntries[i]?.media
        var status = userEntries[i]?.status        
        var anilistId = anime?.id
        // var title = anime?.title?.userPreferred
        var userScore = userEntries?.[i]?.score
        // Save every anime status in userlist
        if(anilistId){
            if(status){
                userListStatus.userStatus[anilistId] = status
            }
            if(userScore){
                userListStatus.userScore[anilistId] = userScore
            }
        }
        var editedEntry = parseJson(JSON.stringify(userEntries[i])) || {}
        if(editedEntry.media){
            delete editedEntry.media.duration
            delete editedEntry.media.trending
            delete editedEntry.media.popularity
            delete editedEntry.media.favourites
            delete editedEntry.media.relations
        }
        var newAnimeObjStr = JSON.stringify(editedEntry)
        if(!savedUserList[anilistId]){
            isNewAnime = true
            tempUserList[anilistId] = newAnimeObjStr
        } else {
            // Check Any Changes in User List
            if(typeof savedUserList[anilistId]==="string"){
                tempUserList[anilistId] = parseJson(savedUserList[anilistId])
            } else {
                tempUserList[anilistId] = savedUserList[anilistId]
            }
            if(tempUserList[anilistId]?.media&&tempUserList[anilistId]?.media){
                delete tempUserList[anilistId].media.duration
                delete tempUserList[anilistId].media.trending
                delete tempUserList[anilistId].media.popularity
                delete tempUserList[anilistId].media.favourites
                delete tempUserList[anilistId].media.relations
                tempUserList[anilistId] = JSON.stringify(tempUserList[anilistId])
            }            
        }
        newUserListIDs[anilistId] = true
        // Save for Updates
        if(!notAnUpdate){
            savedUserList[anilistId] = userEntries[i]
        }
        // Variables
        // var format = anime?.format
        var genres = anime?.genres || []
        var tags = anime?.tags || []
        var studios = anime?.studios?.nodes || []
        var staffs = anime?.staff?.edges || []
        // Altered Variables
          // Altered Formats
        // if(typeof format==="string"){
        //     var fullFormat = "format: "+format.trim().toLowerCase()
        //     if((tempUserList[anilistId]!==newAnimeObjStr)||isNewAnime){
        //         if(!alteredVariables.format_in[fullFormat]){
        //             alteredVariables.format_in[fullFormat] = true
        //         }
        //     }
        // }
          // Altered Genres
        for(let j=0; j<genres.length; j++){
            var genre = genres[j]
            if(typeof genre==="string"){
                var fullGenre = "genre: "+genre.trim().toLowerCase()
                if((tempUserList[anilistId]!==newAnimeObjStr)||isNewAnime){
                    if(!alteredVariables.genres_in[fullGenre]){
                        alteredVariables.genres_in[fullGenre] = true
                    }
                }
            }
        }
          // Altered Tags
        for(let j=0; j<tags.length; j++){
            var tag = tags[j]?.name
            var tagCategory = tags[j]?.category
            if(typeof tag==="string" && typeof tagCategory==="string" && tags[j]?.rank>=50){
                var fullTag = "tag: "+tag.trim().toLowerCase()
                if((tempUserList[anilistId]!==newAnimeObjStr)||isNewAnime){
                    if(!alteredVariables.tags_in[fullTag]){
                        alteredVariables.tags_in[fullTag] = true
                    }
                }
            }
        }
          // Altered Studios
        for(let j=0; j<studios.length; j++){
            if(!studios[j]?.isAnimationStudio) continue
            var studio = studios[j]?.name
            if(typeof studio==="string"){
                var fullStudio = "studio: "+studio.trim().toLowerCase()
                if((tempUserList[anilistId]!==newAnimeObjStr)||isNewAnime){
                    if(!alteredVariables.studios_in[fullStudio]){
                        alteredVariables.studios_in[fullStudio] = true
                    }
                }
            }
        }
          // Altered Staff
        for(let j=0; j<staffs.length; j++){
            var staff = staffs[j].node.name.userPreferred
            if(typeof staff==="string"){
                var fullStaff = "staff: "+staff.trim().toLowerCase()
                if((tempUserList[anilistId]!==newAnimeObjStr)||isNewAnime){
                    if(!alteredVariables.staff_in[fullStaff]){
                        alteredVariables.staff_in[fullStaff] = true
                    }
                }
            }
        }
        // Update UserList
        if((tempUserList[anilistId]!==newAnimeObjStr)||isNewAnime){
            tempUserList[anilistId] = newAnimeObjStr
        }
        if(userScore>0){
            // Check if a related anime is already analyzed
            if(includedAnimeRelations[anilistId]) continue
            includedAnimeRelations[anilistId] = true
            var animeFranchise = savedAnimeFranchises.find((e)=>{
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
                var animeRelations = anime?.relations?.edges || []
                for(let j=0;j<animeRelations.length;j++){
                    var animeRelationNode = animeRelations?.[j]?.node
                    var animeRelationType = animeRelations?.[j]?.relationType
                    if(animeRelationNode&&animeRelationType&&typeof animeRelationType==="string"){
                        // Other characters may cast at a completely different anime
                        if(typeof animeRelationNode?.id==="number"&&mediaRelationTypes.includes(animeRelationType.trim().toLowerCase())){
                            includedAnimeRelations[animeRelationNode.id] = true
                        }
                    }
                }
            }
            ++userListCount
            // Formats
            // if(typeof format==="string"){
            //     var fullFormat = "format: "+format.trim().toLowerCase()
            //     if(!jsonIsEmpty(include.formats)){
            //         if((include.formats[fullFormat]&&!exclude.formats[fullFormat]
            //             &&!exclude.formats["format: all"])||include.formats["format: all"]){
            //             if(varScheme.format[fullFormat]){
            //                 varScheme.format[fullFormat].userScore.push(userScore)
            //                 ++varScheme.format[fullFormat].count
            //             } else {
            //                 varScheme.format[fullFormat] = {userScore:[userScore],count:1}
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
            //             if(varScheme.format[fullFormat]){
            //                 varScheme.format[fullFormat].userScore.push(userScore)
            //                 ++varScheme.format[fullFormat].count                            
            //             } else {
            //                 varScheme.format[fullFormat] = {userScore:[userScore],count:1}
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
                var genre = genres[j]
                if(typeof genre==="string"){
                    var fullGenre = "genre: "+genre.trim().toLowerCase()
                    if(!jsonIsEmpty(include.genres)){
                        if((include.genres[fullGenre]&&!exclude.genres[fullGenre]
                            &&!exclude.genres["genre: all"])||include.genres["genre: all"]){
                            if(varScheme.genres[fullGenre]){
                                varScheme.genres[fullGenre].userScore.push(userScore)
                                ++varScheme.genres[fullGenre].count
                            } else {
                                varScheme.genres[fullGenre] = {userScore:[userScore],count:1}
                            }
                            if(genresMeanCount[fullGenre]){
                                ++genresMeanCount[fullGenre]
                            } else {
                                genresMeanCount[fullGenre] = 1
                            }
                        }
                    } else {
                        if((!exclude.genres[fullGenre]
                            &&!exclude.genres["genre: all"])||include.genres["genre: all"]){
                            if(varScheme.genres[fullGenre]){
                                varScheme.genres[fullGenre].userScore.push(userScore)
                                ++varScheme.genres[fullGenre].count
                            } else {
                                varScheme.genres[fullGenre] = {userScore:[userScore],count:1}
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
                var tag = tags[j]?.name
                var tagCategory = tags[j]?.category
                if(typeof tag==="string" && typeof tagCategory==="string" && tags?.[j]?.rank>=50){
                    var fullTag = "tag: "+tag.trim().toLowerCase()
                    var fullTagCategory = "category: "+tagCategory.trim().toLowerCase()
                    if(!jsonIsEmpty(include.categories)){
                        if((include.categories[fullTagCategory]&&!exclude.tags[fullTagCategory]
                            &&!exclude.categories["category: all"])||include.categories["category: all"]){
                            if(!jsonIsEmpty(include.tags)){
                                if((include.tags[fullTag]&&!exclude.tags[fullTag]
                                    &&!exclude.tags["tag: all"])||include.tags["tag: all"]){
                                    if(varScheme.tags[fullTag]){
                                        varScheme.tags[fullTag].userScore.push(userScore)
                                        ++varScheme.tags[fullTag].count
                                    } else {
                                        varScheme.tags[fullTag] = {userScore:[userScore],count:1}
                                    }
                                    if(tagsMeanCount[fullTag]){
                                        ++tagsMeanCount[fullTag]
                                    } else {
                                        tagsMeanCount[fullTag] = 1
                                    }
                                }
                            } else {
                                if((!exclude.tags[fullTag]
                                    &&!exclude.tags["tag: all"])||include.tags["tag: all"]){
                                    if(varScheme.tags[fullTag]){
                                        varScheme.tags[fullTag].userScore.push(userScore)
                                        ++varScheme.tags[fullTag].count
                                    } else {
                                        varScheme.tags[fullTag] = {userScore:[userScore],count:1}
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
                        if((!exclude.tags[fullTagCategory]
                            &&!exclude.categories["category: all"])||include.categories["category: all"]){
                            if(!jsonIsEmpty(include.tags)){
                                if((include.tags[fullTag]&&!exclude.tags[fullTag]
                                    &&!exclude.tags["tag: all"])||include.tags["tag: all"]){
                                    if(varScheme.tags[fullTag]){
                                        varScheme.tags[fullTag].userScore.push(userScore)
                                        ++varScheme.tags[fullTag].count
                                    } else {
                                        varScheme.tags[fullTag] = {userScore:[userScore],count:1}
                                    }
                                    if(tagsMeanCount[fullTag]){
                                        ++tagsMeanCount[fullTag]
                                    } else {
                                        tagsMeanCount[fullTag] = 1
                                    }
                                }
                            } else {
                                if((!exclude.tags[fullTag]
                                    &&!exclude.tags["tag: all"])||include.tags["tag: all"]){
                                    if(varScheme.tags[fullTag]){
                                        varScheme.tags[fullTag].userScore.push(userScore)
                                        ++varScheme.tags[fullTag].count
                                    } else {
                                        varScheme.tags[fullTag] = {userScore:[userScore],count:1}
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
            var includedStudios = {}
            for(let j=0; j<studios.length; j++){
                if(!studios[j]?.isAnimationStudio) continue
                var studio = studios[j]?.name
                if(typeof studio==="string"){
                    if(includedStudios[studio]) continue
                    includedStudios[studio] = true
                    var fullStudio = "studio: "+studio.trim().toLowerCase()
                    if(!jsonIsEmpty(include.studios)){
                        if((include.studios[fullStudio]&&!exclude.studios[fullStudio]
                            &&!exclude.studios["studio: all"])||include.studios["studio: all"]){
                            if(varScheme.studios[fullStudio]){
                                varScheme.studios[fullStudio].userScore.push(userScore)
                                ++varScheme.studios[fullStudio].count
                            } else {
                                varScheme.studios[fullStudio] = {userScore:[userScore],count:1}
                            }
                            if(studiosMeanCount[fullStudio]){
                                ++studiosMeanCount[fullStudio]
                            } else {
                                studiosMeanCount[fullStudio] = 1                                
                            }
                        }
                    } else {
                        if((!exclude.studios[fullStudio]
                            &&!exclude.studios["studio: all"])||include.studios["studio: all"]){
                            if(varScheme.studios[fullStudio]){
                                varScheme.studios[fullStudio].userScore.push(userScore)
                                ++varScheme.studios[fullStudio].count
                            } else {
                                varScheme.studios[fullStudio] = {userScore:[userScore],count:1}
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
            var includedStaff = {}
            for(let j=0; j<staffs.length; j++){
                var staff = staffs[j]?.node?.name?.userPreferred
                if(typeof staff==="string"&&typeof staffs[j]?.role==="string"){
                    if(includedStaff[staff]) continue
                    includedStaff[staff] = true
                    var staffRole = staffs[j].role.split("(")[0].trim()
                    var fullStaff = "staff: "+staff.trim().toLowerCase()
                    var fullStaffRole = "role: "+staffRole.trim().toLowerCase()
                    if(!jsonIsEmpty(include.roles)){
                        if((include.roles[fullStaffRole]&&!exclude.roles[fullStaffRole]
                            &&!exclude.roles["role: all"])||include.roles["role: all"]){
                            if(!jsonIsEmpty(include.staffs)){
                                if((include.staffs[fullStaff]&&!exclude.staffs[fullStaff]
                                    &&!exclude.staffs["staff: all"])||include.staffs["staff: all"]){
                                    if(varScheme.staff[fullStaff]){
                                        varScheme.staff[fullStaff].userScore.push(userScore)
                                        ++varScheme.staff[fullStaff].count
                                    } else {
                                        varScheme.staff[fullStaff] = {userScore:[userScore],count:1}
                                    }
                                    if(staffMeanCount[fullStaff]){
                                        ++staffMeanCount[fullStaff]
                                    } else {
                                        staffMeanCount[fullStaff] = 1
                                    }
                                }
                            } else {
                                if((!exclude.staffs[fullStaff]
                                    &&!exclude.staffs["staff: all"])||include.staffs["staff: all"]){
                                    if(varScheme.staff[fullStaff]){
                                        varScheme.staff[fullStaff].userScore.push(userScore)
                                        ++varScheme.staff[fullStaff].count
                                    } else {
                                        varScheme.staff[fullStaff] = {userScore:[userScore],count:1}
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
                        if((!exclude.roles[fullStaffRole]
                            &&!exclude.roles["role: all"])||include.roles["role: all"]){
                            if(!jsonIsEmpty(include.staffs)){
                                if((include.staffs[fullStaff]&&!exclude.staffs[fullStaff]
                                    &&!exclude.staffs["staff: all"])||include.staffs["staff: all"]){
                                    if(varScheme.staff[fullStaff]){
                                        varScheme.staff[fullStaff].userScore.push(userScore)
                                        ++varScheme.staff[fullStaff].count
                                    } else {
                                        varScheme.staff[fullStaff] = {userScore:[userScore],count:1}
                                    }
                                    if(staffMeanCount[fullStaff]){
                                        ++staffMeanCount[fullStaff]
                                    } else {
                                        staffMeanCount[fullStaff] = 1
                                    }
                                }
                            } else {
                                if((!exclude.staffs[fullStaff]
                                    &&!exclude.staffs["staff: all"])||include.staffs["staff: all"]){
                                    if(varScheme.staff[fullStaff]){
                                        varScheme.staff[fullStaff].userScore.push(userScore)
                                        ++varScheme.staff[fullStaff].count
                                    } else {
                                        varScheme.staff[fullStaff] = {userScore:[userScore],count:1}
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

    // Check and Remove if User Deleted an Anime, and add its variables as altered
    for(let i=0;i<savedUserListIDs.length;i++){
        if(!newUserListIDs[savedUserListIDs[i]]){
            var entry = savedUserList[savedUserListIDs[i]]
            if(typeof entry==="string"){
                entry = parseJson(entry)
            }
            if(!jsonIsEmpty(entry)){
                var anime = entry.media
                if(anime){
                    // var format = anime.format
                    // if(typeof format==="string"){
                    //     var fullFormat = "format: "+format.trim().toLowerCase()
                    //     if(!alteredVariables.format_in[fullFormat]){
                    //         alteredVariables.format_in[fullFormat] = true
                    //     }
                    // }
                    var genres = anime.genres || []
                    for(let j=0; j<genres.length; j++){   
                        if(typeof genres[j]==="string"){
                            var fullGenre = "genre: "+genres[j].trim().toLowerCase()
                            if(!alteredVariables.genres_in[fullGenre]){
                                alteredVariables.genres_in[fullGenre] = true
                            }
                        }
                    }
                    var tags = anime.tags || []
                    for(let j=0; j<tags.length; j++){
                        if(typeof tags[j]?.name==="string"){
                            var fullTag = "tag: "+tags[j].name.trim().toLowerCase()
                            if(!alteredVariables.tags_in[fullTag]){
                                alteredVariables.tags_in[fullTag] = true
                            }
                        }
                    }
                    var studios = anime.studios.nodes || []
                    for(let j=0; j<studios.length; j++){
                        if(typeof studios[j].name==="string"){
                            if(!studios[j]?.isAnimationStudio) continue
                            var fullStudio = "studio: "+studios[j].name.trim().toLowerCase()
                            if(!alteredVariables.studios_in[fullStudio]){
                                alteredVariables.studios_in[fullStudio] = true
                            }
                        }
                    }
                    var staffs = anime.staff.edges || []
                    for(let j=0; j<staffs.length; j++){
                        if(typeof staffs[j]?.node?.name?.userPreferred==="string"){
                            var fullStaff = "staff: "+staffs[j].node.name.userPreferred.trim().toLowerCase()
                            if(!alteredVariables.staff_in[fullStaff]){
                                alteredVariables.staff_in[fullStaff] = true
                            }
                        }
                    }
                    // Lastly delete the anime in the savedUserList
                    delete savedUserList[savedUserListIDs[i]]
                }
            }
        }
    }
    // Clean Data JSON
    // if(sampleSize>=0){
    //     formatMeanCount = sampleSize
    // } else if(!jsonIsEmpty(formatMeanCount)){
    //     var formatCountValues = Object.values(formatMeanCount)
    //     var formatCountMode = arrayMode(formatCountValues)
    //     var formatCountMean = arrayMean(formatCountValues)
    //     var tempformatMeanCount = formatCountMean>=33? 33 : Math.max(formatCountMode,formatCountMean)
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
        var genresCountValues = Object.values(genresMeanCount)
        var genresCountMode = arrayMode(genresCountValues)
        var genresCountMean = arrayMean(genresCountValues)
        var tempgenresMeanCount = genresCountMean>=33? 33 : Math.max(genresCountMode,genresCountMean)
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
        var tagsCountValues = Object.values(tagsMeanCount)
        var tagsCountMode = arrayMode(tagsCountValues)
        var tagsCountMean = arrayMean(tagsCountValues)
        var temptagsMeanCount = tagsCountMean>=33? 33 : Math.max(tagsCountMode,tagsCountMean)
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
        var studiosCountValues = Object.values(studiosMeanCount)
        var studiosCountMode = arrayMode(studiosCountValues)
        var studiosCountMean = arrayMean(studiosCountValues)
        var tempstudiosMeanCount = studiosCountMean>=33? 33 : Math.max(studiosCountMode,studiosCountMean)
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
        var staffCountValues = Object.values(staffMeanCount)
        var staffCountMode = arrayMode(staffCountValues)
        var staffCountMean = arrayMean(staffCountValues)
        var tempstaffMeanCount = staffCountMean>=33? 33 : Math.max(staffCountMode,staffCountMean)
        staffMeanCount = tempstaffMeanCount
    } else {
        staffMeanCount = 10
    }
    if(minSampleSize>=0){
        staffMeanCount = Math.max(minSampleSize,staffMeanCount)
    }
    // If User List Scores is Empty
    if(userListCount<1){
        varScheme={}
    } else {
        varScheme.includeUnknownVar = includeUnknownVar
        varScheme.minPopularity = minPopularity
        varScheme.minAverageScore = minAverageScore
    }
    if(!jsonIsEmpty(varScheme)){
        // var formatKey = Object.keys(varScheme.format)
        // var formatMean = []
        // // Format
        // for(let i=0; i<formatKey.length; i++){
        //     if(measure==="mode"){
        //         formatMean.push(arrayMode(varScheme.format[formatKey[i]].userScore))
        //     } else {
        //         formatMean.push(arrayMean(varScheme.format[formatKey[i]].userScore))
        //     }
        // }
        // formatMean = arrayMode(formatMean)
        // for(let i=0; i<formatKey.length; i++){
        //     var tempScore = 0
        //     if(measure==="mode"){
        //         tempScore = arrayMode(varScheme.format[formatKey[i]].userScore)
        //     } else {
        //         tempScore = arrayMean(varScheme.format[formatKey[i]].userScore)
        //     }
        //     // Include High Weight or Low scored Variables to avoid High-scored Variables without enough sample
        //     var count = varScheme.format[formatKey[i]].count
        //     if(count>=formatMeanCount||tempScore<formatMean){ 
        //         varScheme.format[formatKey[i]] = tempScore
        //     } else {
        //         delete varScheme.format[formatKey[i]]
        //     }
        // }
        // Genres
        var genresKey = Object.keys(varScheme.genres)
        var genresMean = []
        for(let i=0; i<genresKey.length; i++){
            if(measure==="mode"){
                genresMean.push(arrayMode(varScheme.genres[genresKey[i]].userScore))
            } else {
                genresMean.push(arrayMean(varScheme.genres[genresKey[i]].userScore))
            }
        }
        genresMean = arrayMean(genresMean)
        for(let i=0; i<genresKey.length; i++){
            var tempScore = 0
            if(measure==="mode"){
                tempScore = arrayMode(varScheme.genres[genresKey[i]].userScore)
            } else {
                tempScore = arrayMean(varScheme.genres[genresKey[i]].userScore)
            }
            // Include High Weight or Low scored Variables to avoid High-scored Variables without enough sample
            var count = varScheme.genres[genresKey[i]].count
            if(count>=genresMeanCount||tempScore<genresMean){
                varScheme.genres[genresKey[i]] = tempScore
            } else {
                delete varScheme.genres[genresKey[i]]
            }
        }
        // Tags
        var tagsKey = Object.keys(varScheme.tags)
        var tagsMean = []
        for(let i=0; i<tagsKey.length; i++){
            if(measure==="mode"){
                tagsMean.push(arrayMode(varScheme.tags[tagsKey[i]].userScore))
            } else {
                tagsMean.push(arrayMean(varScheme.tags[tagsKey[i]].userScore))
            }
        }
        tagsMean = arrayMean(tagsMean)
        for(let i=0; i<tagsKey.length; i++){
            var tempScore = 0
            if(measure==="mode"){
                tempScore = arrayMode(varScheme.tags[tagsKey[i]].userScore)
            } else {
                tempScore = arrayMean(varScheme.tags[tagsKey[i]].userScore)
            }
            // Include High Weight or Low scored Variables to avoid High-scored Variables without enough sample
            var count = varScheme.tags[tagsKey[i]].count
            if(count>=tagsMeanCount||tempScore<tagsMean){
                varScheme.tags[tagsKey[i]] = tempScore
            } else {
                delete varScheme.tags[tagsKey[i]]
            }
        }
        // Studios
        var studiosKey = Object.keys(varScheme.studios)
        var studiosMean = []
        for(let i=0; i<studiosKey.length; i++){
            if(measure==="mode"){
                studiosMean.push(arrayMode(varScheme.studios[studiosKey[i]].userScore))
            } else {
                studiosMean.push(arrayMean(varScheme.studios[studiosKey[i]].userScore))
            }
        }
        studiosMean = arrayMean(studiosMean)
        for(let i=0; i<studiosKey.length; i++){
            var tempScore = 0
            if(measure==="mode"){
                tempScore = arrayMode(varScheme.studios[studiosKey[i]].userScore)
            } else {
                tempScore = arrayMean(varScheme.studios[studiosKey[i]].userScore)
            }
            // Include High Weight or Low scored Variables to avoid High-scored Variables without enough sample
            var count = varScheme.studios[studiosKey[i]].count
            if(count>=studiosMeanCount||(count>=(minSampleSize??2))&&tempScore<studiosMean){
                varScheme.studios[studiosKey[i]] = tempScore
            } else {
                delete varScheme.studios[studiosKey[i]]
            }
        }
        // Staffs
        var staffKey = Object.keys(varScheme.staff)
        var staffMean = []
        for(let i=0; i<staffKey.length; i++){
            if(measure==="mode"){
                staffMean.push(arrayMode(varScheme.staff[staffKey[i]].userScore))
            } else {
                staffMean.push(arrayMean(varScheme.staff[staffKey[i]].userScore))
            }
        }
        staffMean = arrayMean(staffMean)
        for(let i=0; i<staffKey.length; i++){
            var tempScore = 0
            if(measure==="mode"){
                tempScore = arrayMode(varScheme.staff[staffKey[i]].userScore)
            } else {
                tempScore = arrayMean(varScheme.staff[staffKey[i]].userScore)
            }
            // Include High Weight or Low scored Variables to avoid High-scored Variables without enough sample
            var count = varScheme.staff[staffKey[i]].count
            if(count>=staffMeanCount||(count>=(minSampleSize??2))&&tempScore<staffMean){
                varScheme.staff[staffKey[i]] = tempScore
            } else {
                delete varScheme.staff[staffKey[i]]
            }
        }
        // Join Data
        // varScheme.meanFormat = formatMean
        varScheme.meanGenres = genresMean
        varScheme.meanTags = tagsMean
        varScheme.meanStudios = studiosMean
        varScheme.meanStaff = staffMean
        varScheme.includeRoles = include.roles
        varScheme.excludeRoles = exclude.roles
        varScheme.includeCategories = include.categories
        varScheme.excludeCategories = exclude.categories
        varScheme.measure = measure
        // Create Model for Numbers| y is predicted so userscore
        // Average Score Model
        // const r2Thresh = 0.1 // Lower than 0.3 Since Media is Subjective
        // For Anime Date Model
        // var animeDateModel = []
        if(includeYear){
            var yearXY = []
            for(let i=0; i<year.length;i++){
                yearXY.push([year[i].year,year[i].userScore])
            }
            if(yearXY.length>=(minSampleSize||33)){
                // var tempLinearReg = linearRegression(yearXY)
                // animeDateModel.push([tempLinearReg,"yearModel"])
                varScheme.yearModel = linearRegression(yearXY)
            }
        }
        // var sortedAnimeDateModels = animeDateModel.sort(function(a, b) {
        //     return b[0].r2 - a[0].r2;
        // })
        // if(sortedAnimeDateModels.length>0){
        //     sortedAnimeDateModels = sortedAnimeDateModels[0]
        //     varScheme[sortedAnimeDateModels[1]] = sortedAnimeDateModels[0]
        // }
        // For Anime Length Models
        // var animeLengthModels = []
        // var episodesXY = []
        // for(let i=0; i<episodes.length;i++){
        //     episodesXY.push([episodes[i].episodes,episodes[i].userScore])
        // }
        // if(episodesXY.length>=(minSampleSize||33)){
        //     var tempLinearReg = linearRegression(episodesXY)
        //     animeLengthModels.push([tempLinearReg,"episodesModel"])
        // }
        // var durationXY = []
        // for(let i=0; i<duration.length;i++){
        //     durationXY.push([duration[i].duration,duration[i].userScore])
        // }
        // if(durationXY.length>=(minSampleSize||33)){
        //     var tempLinearReg = linearRegression(durationXY)
        //     animeLengthModels.push([tempLinearReg,"durationModel"])
        // }
        // var sortedAnimeLengthModels = animeLengthModels.sort(function(a, b) {
        //     return b[0].r2 - a[0].r2;
        // })
        // if(sortedAnimeLengthModels.length>0){
        //     sortedAnimeLengthModels = sortedAnimeLengthModels[0]
        //     varScheme[sortedAnimeLengthModels[1]] = sortedAnimeLengthModels[0]
        // }
        // For Popularity Models
        // var wellKnownAnimeModels = []
        if(includeAverageScore){
            var averageScoreXY = []
            for(let i=0; i<averageScore.length;i++){
                averageScoreXY.push([averageScore[i].averageScore,averageScore[i].userScore])
            }
            if(averageScoreXY.length>=(minSampleSize||33)){
                // var tempLinearReg = linearRegression(averageScoreXY)
                // wellKnownAnimeModels.push([tempLinearReg,"averageScoreModel"])
                varScheme.averageScoreModel = linearRegression(averageScoreXY)
            }
        }
        // var trendingXY = []
        // for(let i=0; i<trending.length;i++){
        //     trendingXY.push([trending[i].trending,trending[i].userScore])
        // }
        // if(trendingXY.length>=(minSampleSize||33)){
        //     var tempLinearReg = linearRegression(trendingXY)
        //     wellKnownAnimeModels.push([tempLinearReg,"trendingModel"])
        // }
        // var popularityXY = []
        // for(let i=0; i<popularity.length;i++){
        //     popularityXY.push([popularity[i].popularity,popularity[i].userScore])
        // }
        // if(popularityXY.length>=(minSampleSize||33)){
        //     var tempLinearReg = linearRegression(popularityXY)
        //     wellKnownAnimeModels.push([tempLinearReg,"popularityModel"])
        // }
        // var favouritesXY = []
        // for(let i=0; i<favourites.length;i++){
        //     favouritesXY.push([favourites[i].favourites,favourites[i].userScore])
        // }
        // if(favouritesXY.length>=(minSampleSize||33)){
        //     var tempLinearReg = linearRegression(favouritesXY)
        //     wellKnownAnimeModels.push([tempLinearReg,"favouritesModel"])
        // }
        // var sortedWellKnownAnimeModels = wellKnownAnimeModels.sort(function(a, b) {
        //     return b[0].r2 - a[0].r2;
        // })
        // if(sortedWellKnownAnimeModels.length>0){
        //     sortedWellKnownAnimeModels = sortedWellKnownAnimeModels[0]
        //     varScheme[sortedWellKnownAnimeModels[1]] = sortedWellKnownAnimeModels[0]
        // }
    }
    self.postMessage({
        varScheme: varScheme, 
        userListStatus: userListStatus,
        savedUserList: savedUserList,
        alteredVariables: alteredVariables,
        userListCount: userListCount
    })
    // Used Function
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
    function parseJson(obj){
        try{return JSON.parse(obj)}catch(ex){return {}}
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
        var max = parseFloat(Math.max(...obj))
        var min = parseFloat(Math.min(...obj))
        const boundary = minNumber
        var classW = parseFloat(((max-min)/(1.0+(3.322*Math.log(obj.length)))))
        var classIs = []
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
    function linearRegression(data){
        var lr = {};
        var n = data.length;
        var sum_x = 0;
        var sum_y = 0;
        var sum_xy = 0;
        var sum_xx = 0;
        var sum_yy = 0;
        for (var i = 0; i < data.length; i++) {
            sum_x += data[i][0];
            sum_y += data[i][1];
            sum_xy += (data[i][0]*data[i][1]);
            sum_xx += (data[i][0]*data[i][0]);
            sum_yy += (data[i][1]*data[i][1]);
        } 
        lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
        lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
        lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);
        return lr;
    }
}