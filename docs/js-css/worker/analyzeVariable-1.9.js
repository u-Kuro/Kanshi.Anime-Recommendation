self.onmessage = (message) => {
    const minNumber = 1-6e-17!==1? 6e-17 : 1e-16 // Min Value Javascript
    const data = message.data
    const notAnUpdate = data.notAnUpdate || undefined
    var savedUserList = data.savedUserList
    var tempUserList = {}
    var include = {
        formats: {}, genres: {}, tags: {}, categories: {}, studios: {}, staffs: {}, roles: {}
    }, 
    exclude = {
       formats: {}, genres: {}, tags: {}, categories: {}, studios: {}, staffs: {}, roles: {} 
    }, 
    savedIncluded = data.savedIncluded,
    savedExcluded = data.savedExcluded
    for(let i=0;i<savedIncluded.length;i++){
        var savedIncludes = savedIncluded[i]
        if(savedIncludes.toLowerCase().includes("format:")){
            include.formats[savedIncludes.trim().split("format:")[1].trim().toLowerCase()] = null
            continue
        }
        if(savedIncludes.toLowerCase().includes("genre:")){
            include.genres[savedIncludes.trim().split("genre:")[1].trim().toLowerCase()] = null
            continue
        }
        if(savedIncludes.toLowerCase().includes("tag-category:")){
            include.categories[savedIncludes.trim().split("tag-category:")[1].trim().toLowerCase()] = null
            continue
        }
        if(savedIncludes.toLowerCase().includes("tag category:")){
            include.categories[savedIncludes.trim().split("tag category:")[1].trim().toLowerCase()] = null
            continue
        }
        if(savedIncludes.toLowerCase().includes("tag-categories:")){
            include.categories[savedIncludes.trim().split("tag-categories:")[1].trim().toLowerCase()] = null
            continue
        }
        if(savedIncludes.toLowerCase().includes("tag categories:")){
            include.categories[savedIncludes.trim().split("tag categories:")[1].trim().toLowerCase()] = null
            continue
        }
        if(savedIncludes.toLowerCase().includes("tag:")){
            include.tags[savedIncludes.trim().split("tag:")[1].trim().toLowerCase()] = null
            continue
        }
        if(savedIncludes.toLowerCase().includes("studio:")){
            include.studios[savedIncludes.trim().split("studio:")[1].trim().toLowerCase()] = null
            continue
        }
        if(savedIncludes.toLowerCase().includes("staff-role:")){
            include.roles[savedIncludes.trim().split("staff-role:")[1].trim().toLowerCase()] = null
            continue
        }
        if(savedIncludes.toLowerCase().includes("staff role:")){
            include.roles[savedIncludes.trim().split("staff role:")[1].trim().toLowerCase()] = null
            continue
        }
        if(savedIncludes.toLowerCase().includes("staff:")){
            include.staffs[savedIncludes.trim().split("staff:")[1].trim().toLowerCase()] = null
            continue
        }
    }
    //
    for(let i=0;i<savedExcluded.length;i++){
        var savedExcludes = savedExcluded[i]
        if(savedExcludes.toLowerCase().includes("format:")){
            exclude.formats[savedExcludes.trim().split("format:")[1].trim().toLowerCase()] = null
            continue
        }
        if(savedExcludes.toLowerCase().includes("genre:")){
            exclude.genres[savedExcludes.trim().split("genre:")[1].trim().toLowerCase()] = null
            continue
        }
        if(savedExcludes.toLowerCase().includes("tag category:")){
            exclude.categories[savedExcludes.trim().split("tag category:")[1].trim().toLowerCase()] = null
            continue
        }
        if(savedExcludes.toLowerCase().includes("tag-category:")){
            exclude.categories[savedExcludes.trim().split("tag-category:")[1].trim().toLowerCase()] = null
            continue
        }
        if(savedExcludes.toLowerCase().includes("tag categories:")){
            exclude.categories[savedExcludes.trim().split("tag categories:")[1].trim().toLowerCase()] = null
            continue
        }
        if(savedExcludes.toLowerCase().includes("tag-categories:")){
            exclude.categories[savedExcludes.trim().split("tag-categories:")[1].trim().toLowerCase()] = null
            continue
        }
        if(savedExcludes.toLowerCase().includes("tag:")){
            exclude.tags[savedExcludes.trim().split("tag:")[1].trim().toLowerCase()] = null
            continue
        }
        if(savedExcludes.toLowerCase().includes("studio:")){
            exclude.studios[savedExcludes.trim().split("studio:")[1].trim().toLowerCase()] = null
            continue
        }
        if(savedExcludes.toLowerCase().includes("staff role:")){
            exclude.roles[savedExcludes.trim().split("staff role:")[1].trim().toLowerCase()] = null
            continue
        }
        if(savedExcludes.toLowerCase().includes("staff-role:")){
            exclude.roles[savedExcludes.trim().split("staff-role:")[1].trim().toLowerCase()] = null
            continue
        }
        if(savedExcludes.toLowerCase().includes("staff:")){
            exclude.staffs[savedExcludes.trim().split("staff:")[1].trim().toLowerCase()] = null
            continue
        }
    }
    
    if(!notAnUpdate){
        var userEntries = data.userEntries
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
        if(userEntries[0].media!==null&&userEntries[1].media!==null){
            if(userEntries[0].media.popularity!==null&&userEntries[1].media.popularity!==null){
                userEntries.sort((a,b)=>b.media.popularity-a.media.popularity)
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
    var userListStatus = []
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
            userListStatus.push({
                id: anilistId,
                status: status
            })
        }
        // Check if a related anime is already analyzed
        if(includedAnimeRelations[anilistId]!==undefined) continue
        includedAnimeRelations[anilistId] = null
        if(anime.relations!==null){
            var animeRelations = anime.relations.edges
            for(let j=0;j<animeRelations;j++){
                var animeRelationsNode = animeRelations[j].node
                var animeRelationType = animeRelations[j].relationType
                if(animeRelationsNode!==null&&animeRelationType!==null){
                    // Other characters may cast at a completely different anime
                    if(animeRelationsNode.id!==null&&animeRelationType.toLowerCase()!=="character"){
                        includedAnimeRelations[animeRelationsNode.id] = null
                    }
                }
            }
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
        if(userEntries[i].score>0){
            ++userListCount
            var userScore = userEntries[i].score
            // Formats
            var format = anime.format
            if(format!==null&&format!==undefined){
                var fullFormat = "Format: "+format
                if(Object.values(include.formats).length>0){
                    if((include.formats[format]!==undefined&&exclude.formats[format]===undefined
                        &&exclude.formats["all"]===undefined)||include.formats["all"]!==undefined){
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
                    if((exclude.formats[format]===undefined
                        &&exclude.formats["all"]===undefined)||include.formats["all"]!==undefined){
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
                // Altered Formats
                if((tempUserList[anilistId]!==newAnimeObjStr)||isNewAnime){
                    tempUserList[anilistId] = newAnimeObjStr
                    if(alteredVariables.format_in[fullFormat]===undefined){
                        alteredVariables.format_in[fullFormat] = 1
                    }
                }
            }
            // Genres
            var genres = anime.genres
            for(let j=0; j<genres.length; j++){
                var genre = genres[j]
                if(genre!==null&&genre!==undefined){
                    var fullGenre = "Genre: "+genre
                    if(Object.values(include.genres).length>0){
                        if((include.genres[genre.toLowerCase()]!==undefined&&exclude.genres[genre.toLowerCase()]===undefined
                            &&exclude.genres["all"]===undefined)||include.genres["all"]!==undefined){
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
                        if((exclude.genres[genre.toLowerCase()]===undefined
                            &&exclude.genres["all"]===undefined)||include.genres["all"]!==undefined){
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
                    // Altered Genres
                    if((tempUserList[anilistId]!==newAnimeObjStr)||isNewAnime){
                        tempUserList[anilistId] = newAnimeObjStr
                        if(alteredVariables.genres_in[fullGenre]===undefined){
                            alteredVariables.genres_in[fullGenre] = 1
                        }
                    }
                }
            }
            // Tags
            var tags = anime.tags
            for(let j=0; j<tags.length; j++){
                var tag = tags[j].name
                var tagCategory = tags[j].category
                if(tag!==null && tagCategory!==null && tags[j].rank>=50){
                    var fullTag = "Tag: "+tag
                    var fullTagCategory = "Category: "+tagCategory
                    if(Object.values(include.categories).length>0){
                        if((include.categories[tagCategory.toLowerCase()]!==undefined&&exclude.tags[tagCategory.toLowerCase()]===undefined
                            &&exclude.categories["all"]===undefined)||include.categories["all"]!==undefined){
                            if(varScheme.categories[fullTagCategory]===undefined){
                                varScheme.categories[fullTagCategory] = null
                            }
                            if(Object.values(include.tags).length>0){
                                if((include.tags[tag.toLowerCase()]!==undefined&&exclude.tags[tag.toLowerCase()]===undefined
                                    &&exclude.tags["all"]===undefined)||include.tags["all"]!==undefined){
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
                                } else {
                                    if((exclude.tags[tag.toLowerCase()]===undefined
                                        &&exclude.tags["all"]===undefined)||include.tags["all"]!==undefined){
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
                            } else {
                                if((exclude.tags[tag.toLowerCase()]===undefined
                                    &&exclude.tags["all"]===undefined)||include.tags["all"]!==undefined){
                                    if(varScheme.tags[fullTag]===undefined){
                                        varScheme.tags[fullTag] = {userScore:[userScore],count:1}
                                    } else {
                                        varScheme.tags[fullTag].userScore.push(userScore)
                                        varScheme.tags[fullTag].count += 1
                                    }
                                    if(genresMeanCount[fullTag]===undefined){
                                        genresMeanCount[fullTag] = 1
                                    } else {
                                        genresMeanCount[fullTag] += 1
                                    }
                                }
                            }
                        }
                    } else {
                        if((exclude.tags[tagCategory.toLowerCase()]===undefined
                            &&exclude.categories["tag categories"]===undefined)||include.categories["tag categories"]!==undefined){
                            if(varScheme.categories[fullTagCategory]===undefined){
                                varScheme.categories[fullTagCategory] = null
                            }
                            if(Object.values(include.tags).length>0){
                                if((include.tags[tag.toLowerCase()]!==undefined&&exclude.tags[tag.toLowerCase()]===undefined
                                    &&exclude.tags["all"]===undefined)||include.tags["all"]!==undefined){
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
                                } else {
                                    if((exclude.tags[tag.toLowerCase()]===undefined
                                        &&exclude.tags["all"]===undefined)||include.tags["all"]!==undefined){
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
                            } else {
                                if((exclude.tags[tag.toLowerCase()]===undefined
                                    &&exclude.tags["all"]===undefined)||include.tags["all"]!==undefined){
                                    if(varScheme.tags[fullTag]===undefined){
                                        varScheme.tags[fullTag] = {userScore:[userScore],count:1}
                                    } else {
                                        varScheme.tags[fullTag].userScore.push(userScore)
                                        varScheme.tags[fullTag].count += 1
                                    }
                                    if(genresMeanCount[fullTag]===undefined){
                                        genresMeanCount[fullTag] = 1
                                    } else {
                                        genresMeanCount[fullTag] += 1
                                    }
                                }
                            }
                        }
                        // Altered Tags
                        if((tempUserList[anilistId]!==newAnimeObjStr)||isNewAnime){
                            tempUserList[anilistId] = newAnimeObjStr
                            if(alteredVariables.tags_in[fullTag]===undefined){
                                alteredVariables.tags_in[fullTag] = 1
                            }
                        }
                    }
                }
            }
            // Studios
            var studios = anime.studios.nodes
            var includedStudio = {}
            for(let j=0; j<studios.length; j++){
                if(!studios[j].isAnimationStudio) continue
                var studio = studios[j].name
                var fullStudio = "Studio: "+studio
                if(includedStudio[studio]!==undefined) continue
                else includedStudio[studio] = null
                if(studio!==null){
                    if(Object.values(include.studios).length>0){
                        if((include.studios[studio.toLowerCase()]!==undefined&&exclude.studios[studio.toLowerCase()]===undefined
                            &&exclude.studios["all"]===undefined)||include.studios["all"]!==undefined){
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
                        if((exclude.studios[studio.toLowerCase()]===undefined
                            &&exclude.studios["all"]===undefined)||include.studios["all"]!==undefined){
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
                    // Altered Studios
                    if((tempUserList[anilistId]!==newAnimeObjStr)||isNewAnime){
                        tempUserList[anilistId] = newAnimeObjStr
                        if(alteredVariables.studios_in[fullStudio]===undefined){
                            alteredVariables.studios_in[fullStudio] = 1
                        }
                    }
                }
            }
            // Staffs
            var staffs = anime.staff.edges
            var includedStaff = {}
            for(let j=0; j<staffs.length; j++){
                var staff = staffs[j].node.name.userPreferred
                if(staff!==null){
                    if(includedStaff[staff]!==undefined) continue
                    else includedStaff[staff] = null
                    var staffRole = staffs[j].role.split(" (")[0]
                    var fullStaff = "Staff: "+staff
                    var fullStaffRole = "Role: "+staffRole
                    if(Object.values(include.roles).length>0){
                        if((include.roles[staffRole.toLowerCase()]!==undefined&&exclude.roles[staffRole.toLowerCase()]===undefined
                            &&exclude.roles["all"]===undefined)||include.roles["all"]!==undefined){
                            if(varScheme.roles[fullStaffRole]===undefined){
                                varScheme.roles[fullStaffRole] = null
                            }
                            if(Object.values(include.staffs).length>0){
                                if((include.staffs[staff.toLowerCase()]!==undefined&&exclude.staffs[staff.toLowerCase()]===undefined
                                    &&exclude.staffs["all"]===undefined)||include.staffs["all"]!==undefined){
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
                                if((exclude.staffs[staff.toLowerCase()]===undefined
                                    &&exclude.staffs["all"]===undefined)||include.staffs["all"]!==undefined){
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
                        if((exclude.roles[staffRole.toLowerCase()]===undefined
                            &&exclude.roles["all"]===undefined)||include.roles["all"]!==undefined){
                            if(varScheme.roles[fullStaffRole]===undefined){
                                varScheme.roles[fullStaffRole] = null
                            }
                            if(Object.values(include.staffs).length>0){
                                if((include.staffs[staff.toLowerCase()]!==undefined&&exclude.staffs[staff.toLowerCase()]===undefined
                                    &&exclude.staffs["all"]===undefined)||include.staffs["all"]!==undefined){
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
                                if((exclude.staffs[staff.toLowerCase()]===undefined
                                    &&exclude.staffs["all"]===undefined)||include.staffs["all"]!==undefined){
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
                        if((tempUserList[anilistId]!==newAnimeObjStr)||isNewAnime){
                            tempUserList[anilistId] = newAnimeObjStr
                            if(alteredVariables.staff_in[fullStaff]===undefined){
                                alteredVariables.staff_in[fullStaff] = 1
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
                        var fullFormat = "Format: "+format
                        if(alteredVariables.format_in[fullFormat]===undefined){
                            alteredVariables.format_in[fullFormat] = 1
                        }
                    }
                    var genres = anime.genres
                    if(genres!==null&&genres!==undefined){
                        for(let j=0; j<genres.length; j++){   
                            var fullGenre = "Genre: "+genres[j]
                            if(alteredVariables.genres_in[fullGenre]===undefined){
                                alteredVariables.genres_in[fullGenre] = 1
                            }
                        }
                    }
                    var tags = anime.tags
                    if(tags!==null&&tags!==undefined){
                        for(let j=0; j<tags.length; j++){
                            var fullTag = "Tag: "+tags[j].name
                            if(alteredVariables.tags_in[fullTag]===undefined){
                                alteredVariables.tags_in[fullTag] = 1
                            }
                        }
                    }
                    var studios = anime.studios.nodes
                    if(studios!==null&&studios!==undefined){
                        for(let j=0; j<studios.length; j++){
                            if(!studios[j].isAnimationStudio) continue
                            var fullStudio = "Studio: "+studios[j].name
                            if(alteredVariables.studios_in[fullStudio]===undefined){
                                alteredVariables.studios_in[fullStudio] = 1
                            }
                        }
                    }
                    var staffs = anime.staff.edges
                    if(staffs!==null&&staffs!==undefined){
                        for(let j=0; j<staffs.length; j++){
                            var fullStaff = "Staff: "+staffs[j].node.name.userPreferred
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
    const minSampleSize = 2
    if(Object.values(formatMeanCount).length>0){
        var tempformatMeanCount = arrayMode(Object.values(formatMeanCount))
        formatMeanCount = tempformatMeanCount<minSampleSize?minSampleSize:tempformatMeanCount
    } else {
        formatMeanCount = minSampleSize
    }
    if(Object.values(genresMeanCount).length>0){
        var tempgenresMeanCount = arrayMode(Object.values(genresMeanCount))
        genresMeanCount = tempgenresMeanCount<minSampleSize?minSampleSize:tempgenresMeanCount
    } else {
        genresMeanCount = minSampleSize
    }
    if(Object.values(tagsMeanCount).length>0){
        var temptagsMeanCount = arrayMode(Object.values(tagsMeanCount))
        tagsMeanCount = temptagsMeanCount<minSampleSize?minSampleSize:temptagsMeanCount
    } else {
        tagsMeanCount = minSampleSize
    }
    if(Object.values(studiosMeanCount).length>0){
        var tempstudiosMeanCount = arrayMode(Object.values(studiosMeanCount))
        studiosMeanCount = tempstudiosMeanCount<minSampleSize?minSampleSize:tempstudiosMeanCount
    } else {
        studiosMeanCount = minSampleSize
    }
    if(Object.values(staffMeanCount).length>0){
        var tempstaffMeanCount = arrayMode(Object.values(staffMeanCount))
        staffMeanCount = tempstaffMeanCount<minSampleSize?minSampleSize:tempstaffMeanCount
    } else {
        staffMeanCount = minSampleSize
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
        // Create Model for Numbers| y is predicted so userscore
        // Average Score Model
        const r2Thresh = 0.1 // Lowered Since Media is Subjective
        const limitSample = 30
        // For Anime Date Model
        var animeDateModel = []
        var yearXY = []
        for(let i=0; i<year.length;i++){
            yearXY.push([year[i].year,year[i].userScore])
        }
        if(yearXY.length>=limitSample){
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
        if(episodesXY.length>=limitSample){
            var tempLinearReg = linearRegression(episodesXY)
            if(tempLinearReg.r2>r2Thresh){
                animeLengthModels.push([tempLinearReg,"episodesModel"])
            }
        }
        var durationXY = []
        for(let i=0; i<duration.length;i++){
            durationXY.push([duration[i].duration,duration[i].userScore])
        }
        if(durationXY.length>=limitSample){
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
        if(averageScoreXY.length>=limitSample){
            var tempLinearReg = linearRegression(averageScoreXY)
            wellKnownAnimeModels.push([tempLinearReg,"averageScoreModel"])
        }
        var trendingXY = []
        for(let i=0; i<trending.length;i++){
            trendingXY.push([trending[i].trending,trending[i].userScore])
        }
        if(trendingXY.length>=limitSample){
            var tempLinearReg = linearRegression(trendingXY)
            wellKnownAnimeModels.push([tempLinearReg,"trendingModel"])
        }
        var popularityXY = []
        for(let i=0; i<popularity.length;i++){
            popularityXY.push([popularity[i].popularity,popularity[i].userScore])
        }
        if(popularityXY.length>=limitSample){
            var tempLinearReg = linearRegression(popularityXY)
            wellKnownAnimeModels.push([tempLinearReg,"popularityModel"])
        }
        var favouritesXY = []
        for(let i=0; i<favourites.length;i++){
            favouritesXY.push([favourites[i].favourites,favourites[i].userScore])
        }
        if(favouritesXY.length>=limitSample){
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