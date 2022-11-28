self.onmessage = (message) => {
    const minNumber = 1-6e-17!==1? 6e-17 : 1e-16 // Min Value Javascript
    const mediaRelationTypes = ["adaptation","prequel","sequel","parent","side_story","summary","alternative","spin_off"]
    const data = message.data
    const notAnUpdate = data.notAnUpdate || undefined
    const savedAnimeFranchises = data.savedAnimeFranchises || []
    var savedUserList = data.savedUserList
    var tempUserList = {}
    var minSampleSize
    var userEntries
    var include = {
        formats: {}, genres: {}, tags: {}, categories: {}, studios: {}, staffs: {}, roles: {}
    }, 
    exclude = {
       formats: {}, genres: {}, tags: {}, categories: {}, studios: {}, staffs: {}, roles: {} 
    }, 
    savedIncluded = data.savedIncluded,
    savedExcluded = data.savedExcluded
    for(let i=0;i<savedIncluded.length;i++){
        var savedIncludes = savedIncluded[i].trim().toLowerCase()
        if(savedIncludes.includes("format:")){
            include.formats["format: "+savedIncludes.split("format:")[1].trim()] = null
            continue
        }
        if(savedIncludes.includes("genre:")){
            include.genres["genre: "+savedIncludes.split("genre:")[1].trim()] = null
            continue
        }
        if(savedIncludes.includes("tag category:")){
            include.categories["category: "+savedIncludes.split("tag category:")[1].trim()] = null
            continue
        }
        if(savedIncludes.includes("tag:")){
            include.tags["tag: "+savedIncludes.split("tag:")[1].trim()] = null
            continue
        }
        if(savedIncludes.includes("studio:")){
            include.studios["studio: "+savedIncludes.split("studio:")[1].trim()] = null
            continue
        }
        if(savedIncludes.includes("staff role:")){
            include.roles["role: "+savedIncludes.split("staff role:")[1].trim()] = null
            continue
        }
        if(savedIncludes.includes("staff:")){
            include.staffs["staff: "+savedIncludes.split("staff:")[1].trim()] = null
            continue
        }
        if(savedIncludes.includes("sample size:")){
            var tempNum = savedIncludes.split("sample size:")[1].trim()
            if(isNaN(tempNum)) continue
            minSampleSize = parseInt(tempNum)
            continue
        }
    }
    //
    for(let i=0;i<savedExcluded.length;i++){
        var savedExcludes = savedExcluded[i].trim().toLowerCase()
        if(savedExcludes.includes("format:")){
            exclude.formats["format: "+savedExcludes.split("format:")[1].trim()] = null
            continue
        }
        if(savedExcludes.includes("genre:")){
            exclude.genres["genre: "+savedExcludes.split("genre:")[1].trim()] = null
            continue
        }
        if(savedExcludes.includes("tag category:")){
            exclude.categories["category: "+savedExcludes.split("tag category:")[1].trim()] = null
            continue
        }
        if(savedExcludes.includes("tag:")){
            exclude.tags["tag: "+savedExcludes.split("tag:")[1].trim()] = null
            continue
        }
        if(savedExcludes.includes("studio:")){
            exclude.studios["studio: "+savedExcludes.split("studio:")[1].trim()] = null
            continue
        }
        if(savedExcludes.includes("staff role:")){
            exclude.roles["role: "+savedExcludes.split("staff role:")[1].trim()] = null
            continue
        }
        if(savedExcludes.includes("staff:")){
            exclude.staffs["staff: "+savedExcludes.split("staff:")[1].trim()] = null
            continue
        }
    }
    
    if(!notAnUpdate){
        userEntries = data.userEntries
    } else {
        savedUserList = Object.values(savedUserList)
        for(let i=0;i<savedUserList.length;i++){
            if(typeof savedUserList[i]==="string"){
                savedUserList[i] = JSON.parse(savedUserList[i])
            }
        }
        userEntries = savedUserList
        tempUserList = {}
    }
    var alteredVariables = {
        format_in: {},
        year_in: {},
        genres_in: {},
        tags_in: {},
        studios_in: {},
        staff_in: {},
    }
    // sort by popularity for unique anime in franchise
    if(userEntries.length>1){
        if(userEntries[0].score!==null&&userEntries[1].score!==null&&userEntries[0].media!==null&&userEntries[1].media!==null){
            userEntries.sort((a,b)=>{
                return b.score-a.score
            })
            if(userEntries[0].media.popularity!==null&&userEntries[1].media.popularity!==null){
                userEntries.sort((a,b)=>{
                    if(a.score===b.score){
                        return b.media.popularity-a.media.popularity
                    }
                })
            }
        }
    }
    var varScheme = {
        format: {},
        genres: {},
        tags: {},
        categories: {},
        studios: {},
        staff: {},
        roles: {}
    }
    // Check Watched
    var userListStatus = {}
    // For Linear Regression Models
    var episodes = []
    var duration = []
    var averageScore = []
    var trending = []
    var popularity = []
    var favourites = []
    var year = []
    //
    var formatMeanCount = {}
    var genresMeanCount = {}
    var tagsMeanCount = {}
    var studiosMeanCount = {}
    var staffMeanCount = {}
    // For Alert user if Scored List is 0
    // to have a better recommendation
    var userListCount = 0
    // For checking any deleted Anime
    var savedUserListIDs = Object.keys(savedUserList)
    var newUserListIDs = {}
    // Analyze each Anime Variable
    var includedAnimeRelations = {}
    for(let i=0; i<userEntries.length; i++){
        var isNewAnime = false
        var anime = userEntries[i].media
        var status = userEntries[i].status        
        var anilistId = anime.id
        // Save every anime status in userlist
        if(status!==null&&anilistId!==null){
            userListStatus[anilistId] = status
        }
        var editedEntry = JSON.parse(JSON.stringify(userEntries[i]))
        if(editedEntry.media!==null){
            delete editedEntry.media.duration
            delete editedEntry.media.trending
            delete editedEntry.media.popularity
            delete editedEntry.media.favourites
        }
        var newAnimeObjStr = JSON.stringify(editedEntry)
        if(savedUserList[anilistId]===undefined){
            isNewAnime = true
            tempUserList[anilistId] = newAnimeObjStr
        } else {
            // Check Any Changes in User List
            if(typeof savedUserList[anilistId]==="string"){
                tempUserList[anilistId] = JSON.parse(savedUserList[anilistId])
            } else {
                tempUserList[anilistId] = savedUserList[anilistId]
            }
            if(tempUserList[anilistId].media!==null&&tempUserList[anilistId].media!==undefined){
                delete tempUserList[anilistId].media.duration
                delete tempUserList[anilistId].media.trending
                delete tempUserList[anilistId].media.popularity
                delete tempUserList[anilistId].media.favourites
                tempUserList[anilistId] = JSON.stringify(tempUserList[anilistId])
            }            
            newUserListIDs[anilistId] = null
        }
        // Save for Updates
        if(!notAnUpdate){
            savedUserList[anilistId] = userEntries[i]
        }
        // Variables
        var format = anime.format
        var genres = anime.genres
        var tags = anime.tags
        var studios = anime.studios.nodes
        var includedStudio = {}
        var staffs = anime.staff.edges
        var includedStaff = {}
        if(userEntries[i].score>0){
            // Check if a related anime is already analyzed
            if(includedAnimeRelations[anilistId]!==undefined) continue
            includedAnimeRelations[anilistId] = null
            var animeFranchise = savedAnimeFranchises.find((e)=>e.includes(anilistId))
            // First Check
            if(animeFranchise instanceof Array){
                if(animeFranchise.length>0){
                    animeFranchise.forEach((relatedID)=>{
                        if(typeof relatedID==="number"){
                            includedAnimeRelations[relatedID] = null
                        }
                    })
                }
            }
            // Second Check for Recent Anime
            if(anime.relations!==null&&anime.relations!==undefined){
                var animeRelations = anime.relations.edges
                for(let j=0;j<animeRelations.length;j++){
                    var animeRelationNode = animeRelations[j].node
                    var animeRelationType = animeRelations[j].relationType
                    if(animeRelationNode!==null&&animeRelationType!==null){
                        // Other characters may cast at a completely different anime
                        if(typeof animeRelationNode.id==="number"&&mediaRelationTypes.includes(animeRelationType.toLowerCase())){
                            includedAnimeRelations[animeRelationNode.id] = null
                        }
                    }
                }
            }
            ++userListCount
            var userScore = userEntries[i].score
            // Formats
            if(format!==null&&format!==undefined){
                var fullFormat = "format: "+format.toLowerCase()
                if(Object.values(include.formats).length>0){
                    if((include.formats[fullFormat]!==undefined&&exclude.formats[fullFormat]===undefined
                        &&exclude.formats["format: all"]===undefined)||include.formats["format: all"]!==undefined){
                        if(varScheme.format[fullFormat]===undefined){
                            varScheme.format[fullFormat] = {userScore:[userScore],count:1}
                        } else {
                            varScheme.format[fullFormat].userScore.push(userScore)
                            varScheme.format[fullFormat].count += 1
                        }
                        if(formatMeanCount[fullFormat]===undefined){
                            formatMeanCount[fullFormat] = 1
                        } else {
                            formatMeanCount[fullFormat] += 1
                        }
                    }
                } else {
                    if((exclude.formats[fullFormat]===undefined
                        &&exclude.formats["format: all"]===undefined)||include.formats["format: all"]!==undefined){
                        if(varScheme.format[fullFormat]===undefined){
                            varScheme.format[fullFormat] = {userScore:[userScore],count:1}
                        } else {
                            varScheme.format[fullFormat].userScore.push(userScore)
                            varScheme.format[fullFormat].count += 1
                        }
                        if(formatMeanCount[fullFormat]===undefined){
                            formatMeanCount[fullFormat] = 1
                        } else {
                            formatMeanCount[fullFormat] += 1
                        }
                    }
                }
            }
            // Genres
            for(let j=0; j<genres.length; j++){
                var genre = genres[j]
                if(genre!==null&&genre!==undefined){
                    var fullGenre = "genre: "+genre.toLowerCase()
                    if(Object.values(include.genres).length>0){
                        if((include.genres[fullGenre]!==undefined&&exclude.genres[fullGenre]===undefined
                            &&exclude.genres["genre: all"]===undefined)||include.genres["genre: all"]!==undefined){
                            if(varScheme.genres[fullGenre]===undefined){
                                varScheme.genres[fullGenre] = {userScore:[userScore],count:1}
                            } else {
                                varScheme.genres[fullGenre].userScore.push(userScore)
                                varScheme.genres[fullGenre].count += 1
                            }
                            if(genresMeanCount[fullGenre]===undefined){
                                genresMeanCount[fullGenre] = 1
                            } else {
                                genresMeanCount[fullGenre] += 1
                            }
                        }
                    } else {
                        if((exclude.genres[fullGenre]===undefined
                            &&exclude.genres["genre: all"]===undefined)||include.genres["genre: all"]!==undefined){
                            if(varScheme.genres[fullGenre]===undefined){
                                varScheme.genres[fullGenre] = {userScore:[userScore],count:1}
                            } else {
                                varScheme.genres[fullGenre].userScore.push(userScore)
                                varScheme.genres[fullGenre].count += 1
                            }
                            if(genresMeanCount[fullGenre]===undefined){
                                genresMeanCount[fullGenre] = 1
                            } else {
                                genresMeanCount[fullGenre] += 1
                            }
                        }
                    }
                }
            }
            // Tags
            for(let j=0; j<tags.length; j++){
                var tag = tags[j].name
                var tagCategory = tags[j].category
                if(tag!==null && tagCategory!==null && tags[j].rank>=50){
                    var fullTag = "tag: "+tag.toLowerCase()
                    var fullTagCategory = "category: "+tagCategory.toLowerCase()
                    if(Object.values(include.categories).length>0){
                        if((include.categories[fullTagCategory]!==undefined&&exclude.tags[fullTagCategory]===undefined
                            &&exclude.categories["category: all"]===undefined)||include.categories["category: all"]!==undefined){
                            if(Object.values(include.tags).length>0){
                                if((include.tags[fullTag]!==undefined&&exclude.tags[fullTag]===undefined
                                    &&exclude.tags["tag: all"]===undefined)||include.tags["tag: all"]!==undefined){
                                    if(varScheme.tags[fullTag]===undefined){
                                        varScheme.tags[fullTag] = {userScore:[userScore],count:1}
                                    } else {
                                        varScheme.tags[fullTag].userScore.push(userScore)
                                        varScheme.tags[fullTag].count += 1
                                    }
                                    if(tagsMeanCount[fullTag]===undefined){
                                        tagsMeanCount[fullTag] = 1
                                    } else {
                                        tagsMeanCount[fullTag] += 1
                                    }
                                }
                            } else {
                                if((exclude.tags[fullTag]===undefined
                                    &&exclude.tags["tag: all"]===undefined)||include.tags["tag: all"]!==undefined){
                                    if(varScheme.tags[fullTag]===undefined){
                                        varScheme.tags[fullTag] = {userScore:[userScore],count:1}
                                    } else {
                                        varScheme.tags[fullTag].userScore.push(userScore)
                                        varScheme.tags[fullTag].count += 1
                                    }
                                    if(tagsMeanCount[fullTag]===undefined){
                                        tagsMeanCount[fullTag] = 1
                                    } else {
                                        tagsMeanCount[fullTag] += 1
                                    }
                                }
                            }
                        }
                    } else {
                        if((exclude.tags[fullTagCategory]===undefined
                            &&exclude.categories["category: all"]===undefined)||include.categories["category: all"]!==undefined){
                            if(Object.values(include.tags).length>0){
                                if((include.tags[fullTag]!==undefined&&exclude.tags[fullTag]===undefined
                                    &&exclude.tags["tag: all"]===undefined)||include.tags["tag: all"]!==undefined){
                                    if(varScheme.tags[fullTag]===undefined){
                                        varScheme.tags[fullTag] = {userScore:[userScore],count:1}
                                    } else {
                                        varScheme.tags[fullTag].userScore.push(userScore)
                                        varScheme.tags[fullTag].count += 1
                                    }
                                    if(tagsMeanCount[fullTag]===undefined){
                                        tagsMeanCount[fullTag] = 1
                                    } else {
                                        tagsMeanCount[fullTag] += 1
                                    }
                                }
                            } else {
                                if((exclude.tags[fullTag]===undefined
                                    &&exclude.tags["tag: all"]===undefined)||include.tags["tag: all"]!==undefined){
                                    if(varScheme.tags[fullTag]===undefined){
                                        varScheme.tags[fullTag] = {userScore:[userScore],count:1}
                                    } else {
                                        varScheme.tags[fullTag].userScore.push(userScore)
                                        varScheme.tags[fullTag].count += 1
                                    }
                                    if(tagsMeanCount[fullTag]===undefined){
                                        tagsMeanCount[fullTag] = 1
                                    } else {
                                        tagsMeanCount[fullTag] += 1
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // Studios
            for(let j=0; j<studios.length; j++){
                if(!studios[j].isAnimationStudio) continue
                var studio = studios[j].name
                var fullStudio = "studio: "+studio.toLowerCase()
                if(includedStudio[studio]!==undefined) continue
                else includedStudio[studio] = null
                if(studio!==null){
                    if(Object.values(include.studios).length>0){
                        if((include.studios[fullStudio]!==undefined&&exclude.studios[fullStudio]===undefined
                            &&exclude.studios["studio: all"]===undefined)||include.studios["studio: all"]!==undefined){
                            if(varScheme.studios[fullStudio]===undefined){
                                varScheme.studios[fullStudio] = {userScore:[userScore],count:1}
                            } else {
                                varScheme.studios[fullStudio].userScore.push(userScore)
                                varScheme.studios[fullStudio].count += 1
                            }
                            if(studiosMeanCount[fullStudio]===undefined){
                                studiosMeanCount[fullStudio] = 1
                            } else {
                                studiosMeanCount[fullStudio] += 1
                            }
                        }
                    } else {
                        if((exclude.studios[fullStudio]===undefined
                            &&exclude.studios["studio: all"]===undefined)||include.studios["studio: all"]!==undefined){
                            if(varScheme.studios[fullStudio]===undefined){
                                varScheme.studios[fullStudio] = {userScore:[userScore],count:1}
                            } else {
                                varScheme.studios[fullStudio].userScore.push(userScore)
                                varScheme.studios[fullStudio].count += 1
                            }
                            if(studiosMeanCount[fullStudio]===undefined){
                                studiosMeanCount[fullStudio] = 1
                            } else {
                                studiosMeanCount[fullStudio] += 1
                            }
                        }
                    }
                }
            }
            // Staffs
            for(let j=0; j<staffs.length; j++){
                var staff = staffs[j].node.name.userPreferred
                if(staff!==null){
                    if(includedStaff[staff]!==undefined) continue
                    else includedStaff[staff] = null
                    var staffRole = staffs[j].role.split("(")[0].trim()
                    var fullStaff = "staff: "+staff.toLowerCase()
                    var fullStaffRole = "role: "+staffRole.toLowerCase()
                    if(Object.values(include.roles).length>0){
                        if((include.roles[fullStaffRole]!==undefined&&exclude.roles[fullStaffRole]===undefined
                            &&exclude.roles["role: all"]===undefined)||include.roles["role: all"]!==undefined){
                            if(Object.values(include.staffs).length>0){
                                if((include.staffs[fullStaff]!==undefined&&exclude.staffs[fullStaff]===undefined
                                    &&exclude.staffs["staff: all"]===undefined)||include.staffs["staff: all"]!==undefined){
                                    if(varScheme.staff[fullStaff]===undefined){
                                        varScheme.staff[fullStaff] = {userScore:[userScore],count:1}
                                    } else {
                                        varScheme.staff[fullStaff].userScore.push(userScore)
                                        varScheme.staff[fullStaff].count += 1
                                    }
                                    if(staffMeanCount[fullStaff]===undefined){
                                        staffMeanCount[fullStaff] = 1
                                    } else {
                                        staffMeanCount[fullStaff] += 1
                                    }
                                }
                            } else {
                                if((exclude.staffs[fullStaff]===undefined
                                    &&exclude.staffs["staff: all"]===undefined)||include.staffs["staff: all"]!==undefined){
                                    if(varScheme.staff[fullStaff]===undefined){
                                        varScheme.staff[fullStaff] = {userScore:[userScore],count:1}
                                    } else {
                                        varScheme.staff[fullStaff].userScore.push(userScore)
                                        varScheme.staff[fullStaff].count += 1
                                    }
                                    if(staffMeanCount[fullStaff]===undefined){
                                        staffMeanCount[fullStaff] = 1
                                    } else {
                                        staffMeanCount[fullStaff] += 1
                                    }
                                }
                            }
                        }
                    } else {
                        if((exclude.roles[fullStaffRole]===undefined
                            &&exclude.roles["role: all"]===undefined)||include.roles["role: all"]!==undefined){
                            if(Object.values(include.staffs).length>0){
                                if((include.staffs[fullStaff]!==undefined&&exclude.staffs[fullStaff]===undefined
                                    &&exclude.staffs["staff: all"]===undefined)||include.staffs["staff: all"]!==undefined){
                                    if(varScheme.staff[fullStaff]===undefined){
                                        varScheme.staff[fullStaff] = {userScore:[userScore],count:1}
                                    } else {
                                        varScheme.staff[fullStaff].userScore.push(userScore)
                                        varScheme.staff[fullStaff].count += 1
                                    }
                                    if(staffMeanCount[fullStaff]===undefined){
                                        staffMeanCount[fullStaff] = 1
                                    } else {
                                        staffMeanCount[fullStaff] += 1
                                    }
                                }
                            } else {
                                if((exclude.staffs[fullStaff]===undefined
                                    &&exclude.staffs["staff: all"]===undefined)||include.staffs["staff: all"]!==undefined){
                                    if(varScheme.staff[fullStaff]===undefined){
                                        varScheme.staff[fullStaff] = {userScore:[userScore],count:1}
                                    } else {
                                        varScheme.staff[fullStaff].userScore.push(userScore)
                                        varScheme.staff[fullStaff].count += 1
                                    }
                                    if(staffMeanCount[fullStaff]===undefined){
                                        staffMeanCount[fullStaff] = 1
                                    } else {
                                        staffMeanCount[fullStaff] += 1
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // Number
            if(isaN(anime.episodes)){
                episodes.push({userScore: userScore, episodes: anime.episodes})
            }
            if(isaN(anime.duration)){
                duration.push({userScore: userScore, duration: anime.duration})
            }
            if(isaN(anime.averageScore)){
                averageScore.push({userScore: userScore, averageScore: anime.averageScore})
            }
            if(isaN(anime.trending)){
                trending.push({userScore: userScore, trending: anime.trending})
            }
            if(isaN(anime.popularity)){
                popularity.push({userScore: userScore, popularity: anime.popularity})
            }
            if(isaN(anime.favourites)){
                favourites.push({userScore: userScore, favourites: anime.favourites})
            }
            if(isaN(parseInt(anime.seasonYear))){
                year.push({userScore: userScore, year: parseInt(anime.seasonYear)})
            }
        }
        // Altered Variables
          // Altered Formats
        if(format!==null&&format!==undefined){
            var fullFormat = "format: "+format.toLowerCase()
            if((tempUserList[anilistId]!==newAnimeObjStr)||isNewAnime){
                tempUserList[anilistId] = newAnimeObjStr
                if(alteredVariables.format_in[fullFormat]===undefined){
                    alteredVariables.format_in[fullFormat] = 1
                }
            }
        }
          // Altered Genres
        for(let j=0; j<genres.length; j++){
            var genre = genres[j]
            if(genre!==null&&genre!==undefined){
                var fullGenre = "genre: "+genre.toLowerCase()
                if((tempUserList[anilistId]!==newAnimeObjStr)||isNewAnime){
                    tempUserList[anilistId] = newAnimeObjStr
                    if(alteredVariables.genres_in[fullGenre]===undefined){
                        alteredVariables.genres_in[fullGenre] = 1
                    }
                }
            }
        }
          // Altered Tags
        for(let j=0; j<tags.length; j++){
            var tag = tags[j].name
            var tagCategory = tags[j].category
            if(tag!==null && tagCategory!==null && tags[j].rank>=50){
                var fullTag = "tag: "+tag.toLowerCase()
                if((tempUserList[anilistId]!==newAnimeObjStr)||isNewAnime){
                    tempUserList[anilistId] = newAnimeObjStr
                    if(alteredVariables.tags_in[fullTag]===undefined){
                        alteredVariables.tags_in[fullTag] = 1
                    }
                }
            }
        }
          // Altered Studios
        for(let j=0; j<studios.length; j++){
            if(!studios[j].isAnimationStudio) continue
            var studio = studios[j].name
            var fullStudio = "studio: "+studio.toLowerCase()
            if(includedStudio[studio]!==undefined) continue
            else includedStudio[studio] = null
            if(studio!==null){
                if((tempUserList[anilistId]!==newAnimeObjStr)||isNewAnime){
                    tempUserList[anilistId] = newAnimeObjStr
                    if(alteredVariables.studios_in[fullStudio]===undefined){
                        alteredVariables.studios_in[fullStudio] = 1
                    }
                }
            }
        }
          // Altered Staff
        for(let j=0; j<staffs.length; j++){
            var staff = staffs[j].node.name.userPreferred
            if(staff!==null){
                if(includedStaff[staff]!==undefined) continue
                else includedStaff[staff] = null
                var fullStaff = "staff: "+staff.toLowerCase()
                if((tempUserList[anilistId]!==newAnimeObjStr)||isNewAnime){
                    tempUserList[anilistId] = newAnimeObjStr
                    if(alteredVariables.staff_in[fullStaff]===undefined){
                        alteredVariables.staff_in[fullStaff] = 1
                    }
                }
            }
        }
    }

    // Check and Remove if User Deleted an Anime, and add its variables as altered
    for(let i=0;i<savedUserListIDs.length;i++){
        if(newUserListIDs[savedUserListIDs[i]]===undefined){
            var entry = savedUserList[savedUserListIDs[i]]
            if(entry!==undefined){
                if(typeof entry==="string"){
                    entry = JSON.parse(entry)
                }
                var anime = entry.media
                if(anime!==undefined){
                    var format = anime.format
                    if(format!==null&&format!==undefined){
                        var fullFormat = "format: "+format
                        if(alteredVariables.format_in[fullFormat]===undefined){
                            alteredVariables.format_in[fullFormat] = 1
                        }
                    }
                    var genres = anime.genres
                    if(genres!==null&&genres!==undefined){
                        for(let j=0; j<genres.length; j++){   
                            var fullGenre = "genre: "+genres[j]
                            if(alteredVariables.genres_in[fullGenre]===undefined){
                                alteredVariables.genres_in[fullGenre] = 1
                            }
                        }
                    }
                    var tags = anime.tags
                    if(tags!==null&&tags!==undefined){
                        for(let j=0; j<tags.length; j++){
                            var fullTag = "tag: "+tags[j].name
                            if(alteredVariables.tags_in[fullTag]===undefined){
                                alteredVariables.tags_in[fullTag] = 1
                            }
                        }
                    }
                    var studios = anime.studios.nodes
                    if(studios!==null&&studios!==undefined){
                        for(let j=0; j<studios.length; j++){
                            if(!studios[j].isAnimationStudio) continue
                            var fullStudio = "studio: "+studios[j].name
                            if(alteredVariables.studios_in[fullStudio]===undefined){
                                alteredVariables.studios_in[fullStudio] = 1
                            }
                        }
                    }
                    var staffs = anime.staff.edges
                    if(staffs!==null&&staffs!==undefined){
                        for(let j=0; j<staffs.length; j++){
                            var fullStaff = "staff: "+staffs[j].node.name.userPreferred
                            if(alteredVariables.staff_in[fullStaff]===undefined){
                                alteredVariables.staff_in[fullStaff] = 1
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
    if(Object.values(formatMeanCount).length>0){
        var formatCountValues = Object.values(formatMeanCount)
        var formatCountMode = arrayMode(Object.values(formatCountValues))
        var formatCountMean = arrayMean(Object.values(formatCountValues))
        var tempformatMeanCount = formatCountMean>=33? 33 : Math.max(formatCountMode,formatCountMean)
        formatMeanCount = minSampleSize? minSampleSize : tempformatMeanCount
    } else {
        formatMeanCount = 10
    }
    if(Object.values(genresMeanCount).length>0){
        var genresCountValues = Object.values(genresMeanCount)
        var genresCountMode = arrayMode(Object.values(genresCountValues))
        var genresCountMean = arrayMean(Object.values(genresCountValues))
        var tempgenresMeanCount = genresCountMean>=33? 33 : Math.max(genresCountMode,genresCountMean)
        genresMeanCount = minSampleSize? minSampleSize : tempgenresMeanCount
    } else {
        genresMeanCount = 10
    }
    if(Object.values(tagsMeanCount).length>0){
        var tagsCountValues = Object.values(tagsMeanCount)
        var tagsCountMode = arrayMode(Object.values(tagsCountValues))
        var tagsCountMean = arrayMean(Object.values(tagsCountValues))
        var temptagsMeanCount = tagsCountMean>=33? 33 : Math.max(tagsCountMode,tagsCountMean)
        tagsMeanCount = minSampleSize? minSampleSize : temptagsMeanCount
    } else {
        tagsMeanCount = 10
    }
    if(Object.values(studiosMeanCount).length>0){
        var studiosCountValues = Object.values(studiosMeanCount)
        var studiosCountMode = arrayMode(Object.values(studiosCountValues))
        var studiosCountMean = arrayMean(Object.values(studiosCountValues))
        var tempstudiosMeanCount = studiosCountMean>=33? 33 : Math.max(studiosCountMode,studiosCountMean)
        studiosMeanCount = minSampleSize? minSampleSize : tempstudiosMeanCount
    } else {
        studiosMeanCount = 10
    }
    if(Object.values(staffMeanCount).length>0){
        var staffCountValues = Object.values(staffMeanCount)
        var staffCountMode = arrayMode(Object.values(staffCountValues))
        var staffCountMean = arrayMean(Object.values(staffCountValues))
        var tempstaffMeanCount = staffCountMean>=33? 33 : Math.max(staffCountMode,staffCountMean)
        staffMeanCount = minSampleSize? minSampleSize : tempstaffMeanCount
    } else {
        staffMeanCount = 10
    }
    //
    if(Object.keys(varScheme).length>0){
        var formatKey = Object.keys(varScheme.format)
        var formatMean = []
        // Format
        for(let i=0; i<formatKey.length; i++){
            formatMean.push(arrayMean(varScheme.format[formatKey[i]].userScore))
        }
        formatMean = arrayMean(formatMean)
        for(let i=0; i<formatKey.length; i++){
            var tempScore = arrayMean(varScheme.format[formatKey[i]].userScore)
            // Include High Weight or Low scored Variables to avoid High-scored Variables without enough sample
            var count = varScheme.format[formatKey[i]].count
            if(count>=formatMeanCount||tempScore<formatMean){ 
                varScheme.format[formatKey[i]] = tempScore
            } else {
                delete varScheme.format[formatKey[i]]
            }
        }
        // Genres
        var genresKey = Object.keys(varScheme.genres)
        var genresMean = []
        for(let i=0; i<genresKey.length; i++){
            genresMean.push(arrayMean(varScheme.genres[genresKey[i]].userScore))
        }
        genresMean = arrayMean(genresMean)
        for(let i=0; i<genresKey.length; i++){
            var tempScore = arrayMean(varScheme.genres[genresKey[i]].userScore)
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
            tagsMean.push(arrayMean(varScheme.tags[tagsKey[i]].userScore))
        }
        tagsMean = arrayMean(tagsMean)
        for(let i=0; i<tagsKey.length; i++){
            var tempScore = arrayMean(varScheme.tags[tagsKey[i]].userScore)
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
            studiosMean.push(arrayMean(varScheme.studios[studiosKey[i]].userScore))
        }
        studiosMean = arrayMean(studiosMean)
        for(let i=0; i<studiosKey.length; i++){
            var tempScore = arrayMean(varScheme.studios[studiosKey[i]].userScore)
            // Include High Weight or Low scored Variables to avoid High-scored Variables without enough sample
            var count = varScheme.studios[studiosKey[i]].count
            if(count>=studiosMeanCount||tempScore<studiosMean){
                varScheme.studios[studiosKey[i]] = tempScore
            } else {
                delete varScheme.studios[studiosKey[i]]
            }
        }
        // Staffs
        var staffKey = Object.keys(varScheme.staff)
        var staffMean = []
        for(let i=0; i<staffKey.length; i++){
            staffMean.push(arrayMean(varScheme.staff[staffKey[i]].userScore))
        }
        staffMean = arrayMean(staffMean)
        for(let i=0; i<staffKey.length; i++){
            var tempScore = arrayMean(varScheme.staff[staffKey[i]].userScore)
            // Include High Weight or Low scored Variables to avoid High-scored Variables without enough sample
            var count = varScheme.staff[staffKey[i]].count
            if(count>=staffMeanCount||tempScore<staffMean){
                varScheme.staff[staffKey[i]] = tempScore
            } else {
                delete varScheme.staff[staffKey[i]]
            }
        }
        // Join Data
        varScheme.meanFormat = formatMean
        varScheme.meanGenres = genresMean
        varScheme.meanTags = tagsMean
        varScheme.meanStudios = studiosMean
        varScheme.meanStaff = staffMean
        varScheme.includeRoles = include.roles
        varScheme.excludeRoles = exclude.roles
        varScheme.includeCategories = include.categories
        varScheme.excludeCategories = exclude.categories
        // Create Model for Numbers| y is predicted so userscore
        // Average Score Model
        const r2Thresh = 0.1 // Lower than 0.3 Since Media is Subjective
        // For Anime Date Model
        var animeDateModel = []
        var yearXY = []
        for(let i=0; i<year.length;i++){
            yearXY.push([year[i].year,year[i].userScore])
        }
        if(yearXY.length>=(minSampleSize||33)){
            var tempLinearReg = linearRegression(yearXY)
            animeDateModel.push([tempLinearReg,"yearModel"])
        }
        var sortedAnimeDateModels = animeDateModel.sort(function(a, b) {
            return b[0].r2 - a[0].r2;
        })
        if(sortedAnimeDateModels.length>0){
            sortedAnimeDateModels = sortedAnimeDateModels[0]
            varScheme[sortedAnimeDateModels[1]] = sortedAnimeDateModels[0]
        }
        // For Anime Length Models
        var animeLengthModels = []
        var episodesXY = []
        for(let i=0; i<episodes.length;i++){
            episodesXY.push([episodes[i].episodes,episodes[i].userScore])
        }
        if(episodesXY.length>=(minSampleSize||33)){
            var tempLinearReg = linearRegression(episodesXY)
            if(tempLinearReg.r2>r2Thresh){
                animeLengthModels.push([tempLinearReg,"episodesModel"])
            }
        }
        var durationXY = []
        for(let i=0; i<duration.length;i++){
            durationXY.push([duration[i].duration,duration[i].userScore])
        }
        if(durationXY.length>=(minSampleSize||33)){
            var tempLinearReg = linearRegression(durationXY)
            if(tempLinearReg.r2>r2Thresh){
                animeLengthModels.push([tempLinearReg,"durationModel"])
            }
        }
        var sortedAnimeLengthModels = animeLengthModels.sort(function(a, b) {
            return b[0].r2 - a[0].r2;
        })
        if(sortedAnimeLengthModels.length>0){
            sortedAnimeLengthModels = sortedAnimeLengthModels[0]
            varScheme[sortedAnimeLengthModels[1]] = sortedAnimeLengthModels[0]
        }
        // For Popularity Models
        var wellKnownAnimeModels = []
        var averageScoreXY = []
        for(let i=0; i<averageScore.length;i++){
            averageScoreXY.push([averageScore[i].averageScore,averageScore[i].userScore])
        }
        if(averageScoreXY.length>=(minSampleSize||33)){
            var tempLinearReg = linearRegression(averageScoreXY)
            wellKnownAnimeModels.push([tempLinearReg,"averageScoreModel"])
        }
        var trendingXY = []
        for(let i=0; i<trending.length;i++){
            trendingXY.push([trending[i].trending,trending[i].userScore])
        }
        if(trendingXY.length>=(minSampleSize||33)){
            var tempLinearReg = linearRegression(trendingXY)
            wellKnownAnimeModels.push([tempLinearReg,"trendingModel"])
        }
        var popularityXY = []
        for(let i=0; i<popularity.length;i++){
            popularityXY.push([popularity[i].popularity,popularity[i].userScore])
        }
        if(popularityXY.length>=(minSampleSize||33)){
            var tempLinearReg = linearRegression(popularityXY)
            wellKnownAnimeModels.push([tempLinearReg,"popularityModel"])
        }
        var favouritesXY = []
        for(let i=0; i<favourites.length;i++){
            favouritesXY.push([favourites[i].favourites,favourites[i].userScore])
        }
        if(favouritesXY.length>=(minSampleSize||33)){
            var tempLinearReg = linearRegression(favouritesXY)
            wellKnownAnimeModels.push([tempLinearReg,"favouritesModel"])
        }
        var sortedWellKnownAnimeModels = wellKnownAnimeModels.sort(function(a, b) {
            return b[0].r2 - a[0].r2;
        })
        if(sortedWellKnownAnimeModels.length>0){
            sortedWellKnownAnimeModels = sortedWellKnownAnimeModels[0]
            varScheme[sortedWellKnownAnimeModels[1]] = sortedWellKnownAnimeModels[0]
        }
    }
    // If User List Scores is Empty
    if(userListCount<1){
        varScheme={}
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
        if(num===null){return false
        }else if(typeof num==='string'){if(num.split(' ').join('').length===0){return false}
        }else if(typeof num==='boolean'){return false}
        else return !isNaN(num)
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
        var modPreFreq = classIs[modeIdx-1]===undefined?0:classIs[modeIdx-1].freq
        var modSucFreq = classIs[modeIdx+1]===undefined?0:classIs[modeIdx+1].freq
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