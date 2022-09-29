self.onmessage = (message) => {
    const data = message.data
    const userList = data.userList.data
    var savedUserList = data.savedUserList
    var alteredVariables = {
        format_in: {},
        year_in: {},
        season_in: {},
        genres_in: {},
        tags_in: {},
        studios_in: {},
        staff_in: {}
    }
    //Concat Completed, Watching, Drop, etc.
    var animeList = userList.MediaListCollection.lists
    var animeEntries = []
    for(let i=0; i<animeList.length-1; i++){
        animeEntries = animeList[i].entries.concat(animeList[++i].entries)
    }
    var varScheme = {}
    // Check Watched
    var userListStatus = []
    for(let i=0; i<animeList.length; i++){
        for(let j=0; j<animeList[i].entries.length; j++){ 
            userListStatus.push({
                title: animeList[i].entries[j].media.title.userPreferred,
                status: animeList[i].status
            })
        }
    }
    // For Linear Regression Models
    var episodes = []
    var duration = []
    var averageScore = []
    var trending = []
    var popularity = []
    var favourites = []
    //
    var genresCount = []
    var tagsCount = []
    var studiosCount = []
    var staffCount = []
    //
    var formatMeanCount = {}
    var yearMeanCount = {}
    var seasonMeanCount = {}
    var genresMeanCount = {}
    var tagsMeanCount = {}
    var studiosMeanCount = {}
    var staffMeanCount = {}
    // For checking any deleted Anime
    var savedUserListTitles = Object.keys(savedUserList)
    // Analyze each Anime Variable
    for(let i=0; i<animeEntries.length; i++){
        // Check Any Changes in User List
        var isNewAnime = false
        var anime = animeEntries[i].media
        var title = anime.title.userPreferred
        var editedEntry = JSON.parse(JSON.stringify(animeEntries[i]))
        delete editedEntry.media.duration
        delete editedEntry.media.trending
        delete editedEntry.media.popularity
        delete editedEntry.media.favourites
        var newAnimeObjStr = JSON.stringify(editedEntry)
        if(savedUserList[title]===undefined){
            isNewAnime = true
            savedUserList[title] = newAnimeObjStr
        } else {
            // Filter Anime not in the savedUserList, if one is deleted in Anilist
            savedUserListTitles = savedUserListTitles.filter((savedTitle)=>{return savedTitle!==title})
        }
        if(animeEntries[i].score>0){
            var userScore = animeEntries[i].score
            var format = {}
            var year = {}
            var season = {}
            var genres = {}
            var tags = {}
            var studios = {}
            var staff = {}
            if(Object.keys(varScheme).length<1){
                // Categories
                if(anime.format!==null){
                    if(format["Format: "+anime.format]===undefined){
                        format["Format: "+anime.format] = {userScore:[userScore],count:1}
                    } else {
                        format["Format: "+anime.format].userScore.push(userScore)
                        format["Format: "+anime.format].count += 1
                    }
                    if(formatMeanCount["Format: "+anime.format]===undefined){
                        formatMeanCount["Format: "+anime.format] = 1
                    } else {
                        formatMeanCount["Format: "+anime.format] += 1
                    }
                }
                if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&anime.format!==null){
                    savedUserList[title] = newAnimeObjStr
                    if(alteredVariables.format_in["Format: "+anime.format]===undefined){
                        alteredVariables.format_in["Format: "+anime.format] = 1
                    }
                }
                if(anime.seasonYear!==null){
                    if(year["Year: "+anime.seasonYear]===undefined){
                        year["Year: "+anime.seasonYear] = {userScore:[userScore],count:1}
                    } else {
                        year["Year: "+anime.seasonYear].userScore.push(userScore)
                        year["Year: "+anime.seasonYear].count += 1
                    }
                    if(yearMeanCount["Year: "+anime.seasonYear]===undefined){
                        yearMeanCount["Year: "+anime.seasonYear] = 1
                    } else {
                        yearMeanCount["Year: "+anime.seasonYear] += 1
                    }
                }
                if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&anime.seasonYear!==null){
                    savedUserList[title] = newAnimeObjStr
                    if(alteredVariables.year_in["Year: "+anime.seasonYear]===undefined){
                        alteredVariables.year_in["Year: "+anime.seasonYear]=1
                    }
                }
                if(anime.season!==null){
                    if(season["Season: "+anime.season]===undefined){
                        season["Season: "+anime.season] = {userScore:[userScore],count:1}
                    } else {
                        season["Season: "+anime.season].userScore.push(userScore)
                        season["Season: "+anime.season].count += 1
                    }
                    if(seasonMeanCount["Season: "+anime.season]===undefined){
                        seasonMeanCount["Season: "+anime.season] = 1
                    } else {
                        seasonMeanCount["Season: "+anime.season] += 1
                    }
                }
                if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&anime.season!==null){
                    savedUserList[title] = newAnimeObjStr
                    if(alteredVariables.season_in["Season: "+anime.season]===undefined){
                        alteredVariables.season_in["Season: "+anime.season] = 1
                    }
                }
                for(let j=0; j<anime.genres.length; j++){
                    if(anime.genres[j]!==null){
                        if(genres["Genre: "+anime.genres[j]]===undefined){
                            genres["Genre: "+anime.genres[j]] = {userScore:[userScore],count:1}
                        } else {
                            genres["Genre: "+anime.genres[j]].userScore.push(userScore)
                            genres["Genre: "+anime.genres[j]].count += 1
                        }
                        if(genresMeanCount["Genre: "+anime.genres[j]]===undefined){
                            genresMeanCount["Genre: "+anime.genres[j]] = 1
                        } else {
                            genresMeanCount["Genre: "+anime.genres[j]] += 1
                        }
                    }
                    if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&anime.genres[j]!==null){
                        savedUserList[title] = newAnimeObjStr
                        if(alteredVariables.genres_in["Genre: "+anime.genres[j]]===undefined){
                            alteredVariables.genres_in["Genre: "+anime.genres[j]] = 1
                        }
                    }
                }
                for(let j=0; j<anime.tags.length; j++){
                    if(anime.tags[j].name===null){
                        if(tags["Tag: "+anime.tags[j].name]===undefined){
                            tags["Tag: "+anime.tags[j].name] = {userScore:[userScore],count:1}
                        } else {
                            tags["Tag: "+anime.tags[j].name].userScore.push(userScore)
                            tags["Tag: "+anime.tags[j].name].count += 1
                        }
                        if(tagsMeanCount["Tag: "+anime.tags[j].name]===undefined){
                            tagsMeanCount["Tag: "+anime.tags[j].name] = 1
                        } else {
                            tagsMeanCount["Tag: "+anime.tags[j].name] += 1
                        }
                    }
                    if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&anime.tags[j].name!==null){
                        savedUserList[title] = newAnimeObjStr
                        if(alteredVariables.tags_in["Tag: "+anime.tags[j].name]===undefined){
                            alteredVariables.tags_in["Tag: "+anime.tags[j].name] = 1
                        }
                    }
                }
                var includedStudio = {}
                for(let j=0; j<anime.studios.nodes.length; j++){
                    if(!anime.studios.nodes[j].isAnimationStudio) continue
                    if(includedStudio[anime.studios.nodes[j].name]!==undefined) continue
                    else includedStudio[anime.studios.nodes[j].name] = null
                    if(anime.studios.nodes[j].name!==null){
                        if(studios["Studio: "+anime.studios.nodes[j].name]===undefined){
                            studios["Studio: "+anime.studios.nodes[j].name] = {userScore:[userScore],count:1}
                        } else {
                            studios["Studio: "+anime.studios.nodes[j].name].userScore.push(userScore)
                            studios["Studio: "+anime.studios.nodes[j].name].count += 1
                        }
                        if(studiosMeanCount["Studio: "+anime.studios.nodes[j].name]===undefined){
                            studiosMeanCount["Studio: "+anime.studios.nodes[j].name] = 1
                        } else {
                            studiosMeanCount["Studio: "+anime.studios.nodes[j].name] += 1
                        }
                    }
                    if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&anime.studios.nodes[j].name!==null){
                        savedUserList[title] = newAnimeObjStr
                        if(alteredVariables.studios_in["Studio: "+anime.studios.nodes[j].name]===undefined){
                            alteredVariables.studios_in["Studio: "+anime.studios.nodes[j].name] = 1
                        }
                    }
                }
                //
                var includedStaff = {}
                for(let j=0; j<anime.staff.edges.length; j++){
                    if(anime.staff.edges[j].node.name.userPreferred!==null){
                        if(includedStaff[anime.staff.edges[j].node.name.userPreferred]!==undefined) continue
                        else includedStaff[anime.staff.edges[j].node.name.userPreferred] = null
                        if(staff["Staff: "+anime.staff.edges[j].node.name.userPreferred]===undefined){
                            staff["Staff: "+anime.staff.edges[j].node.name.userPreferred] = {userScore:[userScore],count:1}
                        } else {
                            staff["Staff: "+anime.staff.edges[j].node.name.userPreferred].userScore.push(userScore)
                            staff["Staff: "+anime.staff.edges[j].node.name.userPreferred].count += 1
                        }
                        if(staffMeanCount["Staff: "+anime.staff.edges[j].node.name.userPreferred]===undefined){
                            staffMeanCount["Staff: "+anime.staff.edges[j].node.name.userPreferred] = 1
                        } else {
                            staffMeanCount["Staff: "+anime.staff.edges[j].node.name.userPreferred] += 1
                        }
                    }
                    if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&anime.staff.edges[j].node.name.userPreferred!==null){
                        savedUserList[title] = newAnimeObjStr
                        if(alteredVariables.staff_in["Staff: "+anime.staff.edges[j].node.name.userPreferred]===undefined){
                            alteredVariables.staff_in["Staff: "+anime.staff.edges[j].node.name.userPreferred] = 1
                        }
                    }
                }
                varScheme = {
                    format: format, year: year, season: season, genres: genres, tags: tags, studios: studios, staff: staff,
                }
            } else {
                var xformat = anime.format===null? null : "Format: "+anime.format
                if(xformat!==null){
                    if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                        savedUserList[title] = newAnimeObjStr
                        if(alteredVariables.format_in[xformat]===undefined){
                            alteredVariables.format_in[xformat] = 1
                        }
                    }
                    if(varScheme.format[xformat]!==undefined){
                        varScheme.format[xformat].userScore.push(userScore)
                        varScheme.format[xformat].count += 1
                    }
                    else{
                        varScheme.format[xformat] = {userScore:[userScore],count:1}
                    }
                    if(formatMeanCount[xformat]!==undefined){
                        formatMeanCount[xformat] += 1
                    } else {
                        formatMeanCount[xformat] = 1
                    }
                }
                var xyear = anime.seasonYear===null? null : "Year: "+anime.seasonYear.toString()
                if(xyear!==null){
                    if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                        savedUserList[title] = newAnimeObjStr
                        if(alteredVariables.year_in[xyear]===undefined){
                            alteredVariables.year_in[xyear] = 1
                        }
                    }
                    if(varScheme.year[xyear]!==undefined){
                        varScheme.year[xyear].userScore.push(userScore)
                        varScheme.year[xyear].count += 1
                    }
                    else{
                        varScheme.year[xyear] = {userScore:[userScore],count:1}
                    }
                    if(yearMeanCount[xyear]!==undefined){
                        yearMeanCount[xyear] += 1
                    } else {
                        yearMeanCount[xyear] = 1
                    }
                }
                var xseason = anime.season===null? null : "Season: "+anime.season
                if(xseason!==null){
                    if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                        savedUserList[title] = newAnimeObjStr
                        if(alteredVariables.season_in[xseason]===undefined){
                            alteredVariables.season_in[xseason] = 1
                        }
                    }
                    if(varScheme.season[xseason]!==undefined){
                        varScheme.season[xseason].userScore.push(userScore)
                        varScheme.season[xseason].count += 1
                    }
                    else{
                        varScheme.season[xseason] = {userScore:[userScore],count:1}
                    }
                    if(seasonMeanCount[xseason]!==undefined){
                        seasonMeanCount[xseason] += 1
                    } else {
                        seasonMeanCount[xseason] = 1
                    }
                }
                for(let j=0; j<anime.genres.length; j++){
                    var xgenres = anime.genres[j]===null? null : "Genre: "+anime.genres[j]
                    if(xgenres!==null){
                        if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                            savedUserList[title] = newAnimeObjStr
                            if(alteredVariables.genres_in[xgenres]===undefined){
                                alteredVariables.genres_in[xgenres] = 1
                            }
                        }
                        if(varScheme.genres[xgenres]!==undefined){
                            varScheme.genres[xgenres].userScore.push(userScore)
                            varScheme.genres[xgenres].count += 1
                        }
                        else{
                            varScheme.genres[xgenres] = {userScore:[userScore],count:1}
                        }
                        if(genresMeanCount[xgenres]!==undefined){
                            genresMeanCount[xgenres] += 1
                        } else {
                            genresMeanCount[xgenres] = 1
                        }
                    }
                }
                for(let j=0; j<anime.tags.length; j++){
                    var xtags = anime.tags[j].name===null? null : "Tag: "+anime.tags[j].name
                    if(xtags!==null){
                        if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                            savedUserList[title] = newAnimeObjStr
                            if(alteredVariables.tags_in[xtags]===undefined){
                                alteredVariables.tags_in[xtags] = 1
                            }
                        }
                        if(varScheme.tags[xtags]!==undefined){
                            varScheme.tags[xtags].userScore.push(userScore)
                            varScheme.tags[xtags].count += 1
                        }
                        else {
                            varScheme.tags[xtags] = {userScore:[userScore],count:1}
                        }
                        if(tagsMeanCount[xtags]!==undefined){
                            tagsMeanCount[xtags] += 1
                        } else {
                            tagsMeanCount[xtags] = 1
                        }
                    }
                }
                var includedStudio = {}
                for(let j=0; j<anime.studios.nodes.length; j++){
                    if(!anime.studios.nodes[j].isAnimationStudio) continue
                    if(includedStudio[anime.studios.nodes[j].name]!==undefined) continue
                    else includedStudio[anime.studios.nodes[j].name] = null
                    var xstudios = anime.studios.nodes[j].name===null? null : "Studio: "+anime.studios.nodes[j].name
                    if(xstudios!==null){
                        if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                            savedUserList[title] = newAnimeObjStr
                            if(alteredVariables.studios_in[xstudios]===undefined){
                                alteredVariables.studios_in[xstudios] = 1
                            }
                        }
                        if(Object.keys(varScheme.studios).includes(xstudios)){
                            varScheme.studios[xstudios].userScore.push(userScore)
                            varScheme.studios[xstudios].count += 1
                        }
                        else {
                            varScheme.studios[xstudios] = {userScore:[userScore],count:1}
                        }
                        if(studiosMeanCount[xstudios]!==undefined){
                            studiosMeanCount[xstudios] += 1
                        } else {
                            studiosMeanCount[xstudios] = 1
                        }
                    }
                }
                var includedStaff = {}
                for(let j=0; j<anime.staff.edges.length; j++){
                    if(includedStaff[anime.staff.edges[j].node.name.userPreferred]!==undefined) continue
                    else includedStaff[anime.staff.edges[j].node.name.userPreferred] = null
                    var xstaff = anime.staff.edges[j].node.name.userPreferred===null?null: "Staff: "+anime.staff.edges[j].node.name.userPreferred
                    if(xstaff!==null){
                        if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                            savedUserList[title] = newAnimeObjStr
                            if(alteredVariables.staff_in[xstaff]===undefined){
                                alteredVariables.staff_in[xstaff] = 1
                            }
                        }
                        if(varScheme.staff[xstaff]!==undefined){
                            varScheme.staff[xstaff].userScore.push(userScore)
                            varScheme.staff[xstaff].count += 1
                        }
                        else {
                            varScheme.staff[xstaff] = {userScore:[userScore],count:1}
                        }
                        if(staffMeanCount[xstaff]!==undefined){
                            staffMeanCount[xstaff] += 1
                        } else {
                            staffMeanCount[xstaff] = 1
                        }
                    }
                }
            }
            // Number
            if(anime.episodes!==null){
                episodes.push({userScore: userScore, episodes: anime.episodes})
            }
            if(anime.duration!==null){
                duration.push({userScore: userScore, duration: anime.duration})
            }
            if(anime.averageScore!==null){
                averageScore.push({userScore: userScore, averageScore: anime.averageScore})
            }
            if(anime.trending!==null){
                trending.push({userScore: userScore, trending: anime.trending})
            }
            if(anime.popularity!==null){
                popularity.push({userScore: userScore, popularity: anime.popularity})
            }
            if(anime.favourites!==null){
                favourites.push({userScore: userScore, favourites: anime.favourites})
            }
            //
            if(anime.genres!==null){
                genresCount.push({userScore: userScore, genresCount: anime.genres.length})
            }
            if(anime.tags!==null){
                tagsCount.push({userScore: userScore, tagsCount: anime.tags.length})
            }
            if(anime.studios.nodes!==null){
                var studioLength = 0
                for(let i=0;i<anime.studios.nodes.length;i++){
                    if(!anime.studios.nodes[i].isAnimationStudio) continue
                    studioLength++
                }
                studiosCount.push({userScore: userScore, studiosCount: studioLength})
            }
            if(anime.staff.edges!==null){
                staffCount.push({userScore: userScore, staffCount: anime.staff.edges.length})
            }
        }
    }
    // Check and Remove if User Deleted an Anime, and add its variables as altered
    for(let i=0;i<savedUserListTitles.length;i++){
        var entry = JSON.parse(savedUserList[savedUserListTitles[i]])
        var anime = entry.media
        if(alteredVariables.format_in["Format: "+anime.format]===undefined){
            alteredVariables.format_in["Format: "+anime.format] = 1
        }
        if(alteredVariables.year_in["Year: "+anime.seasonYear]===undefined){
            alteredVariables.year_in["Year: "+anime.seasonYear]=1
        }
        if(alteredVariables.season_in["Season: "+anime.season]===undefined){
            alteredVariables.season_in["Season: "+anime.season] = 1
        }
        for(let j=0; j<anime.genres.length; j++){   
            if(alteredVariables.genres_in["Genre: "+anime.genres[j]]===undefined){
                alteredVariables.genres_in["Genre: "+anime.genres[j]] = 1
            }
        }
        for(let j=0; j<anime.tags.length; j++){
            if(alteredVariables.tags_in["Tag: "+anime.tags[j].name]===undefined){
                alteredVariables.tags_in["Tag: "+anime.tags[j].name] = 1
            }
        }
        for(let j=0; j<anime.studios.nodes.length; j++){
            if(!anime.studios.nodes[j].isAnimationStudio) continue
            if(alteredVariables.studios_in["Studio: "+anime.studios.nodes[j].name]===undefined){
                alteredVariables.studios_in["Studio: "+anime.studios.nodes[j].name] = 1
            }
        }
        for(let j=0; j<anime.staff.edges.length; j++){
            if(alteredVariables.staff_in["Staff: "+anime.staff.edges[j].node.name.userPreferred]===undefined){
                alteredVariables.staff_in["Staff: "+anime.staff.edges[j].node.name.userPreferred] = 1
            }
        }
        // Lastly delete the anime in the savedUserList
        delete savedUserList[savedUserListTitles[i]]
    }
    // Clean Data JSON
    formatMeanCount = Object.values(formatMeanCount).length>0 ? arrayMean(Object.values(formatMeanCount)) : 0
    yearMeanCount = Object.values(yearMeanCount).length>0 ? arrayMean(Object.values(yearMeanCount)) : 0
    seasonMeanCount = Object.values(seasonMeanCount).length>0 ? arrayMean(Object.values(seasonMeanCount)) : 0
    genresMeanCount = Object.values(genresMeanCount).length>0 ? arrayMean(Object.values(genresMeanCount)) : 0
    tagsMeanCount = Object.values(tagsMeanCount).length>0 ? arrayMean(Object.values(tagsMeanCount)) : 0
    studiosMeanCount = Object.values(studiosMeanCount).length>0 ? arrayMean(Object.values(studiosMeanCount)) : 0
    staffMeanCount = Object.values(staffMeanCount).length>0 ? arrayMean(Object.values(staffMeanCount)) : 0
    //
    var formatKey = Object.keys(varScheme.format)
    var formatMean = []
    //
    for(let i=0; i<formatKey.length; i++){
        formatMean.push(arrayMean(varScheme.format[formatKey[i]].userScore))
    }
    formatMean = arrayMean(formatMean)
    for(let i=0; i<formatKey.length; i++){
        var tempScore = arrayMean(varScheme.format[formatKey[i]].userScore)
        var count = varScheme.format[formatKey[i]].count
        // Include High Weight or Low scored Variables to avoid High-scored Variables without enough sample
        if(count>=formatMeanCount){//||tempScore<formatMean){ 
            varScheme.format[formatKey[i]] = tempScore
        } else {
            delete varScheme.format[formatKey[i]]
        }
    }
    //
    var yearKey = Object.keys(varScheme.year)
    var yearMean = []
    for(let i=0; i<yearKey.length; i++){
        yearMean.push(arrayMean(varScheme.year[yearKey[i]].userScore))
    }
    yearMean = arrayMean(yearMean)
    for(let i=0; i<yearKey.length; i++){
        var tempScore = arrayMean(varScheme.year[yearKey[i]].userScore)
        var count = varScheme.year[yearKey[i]].count
        // Include High Weight or Low scored Variables to avoid High-scored Variables without enough sample
        if(count>=yearMeanCount){//||tempScore<yearMean){
            varScheme.year[yearKey[i]] = tempScore
        } else {
            delete varScheme.year[yearKey[i]]
        }
    }
    //
    var seasonKey = Object.keys(varScheme.season)
    var seasonMean = []
    for(let i=0; i<seasonKey.length; i++){
        seasonMean.push(arrayMean(varScheme.season[seasonKey[i]].userScore))
    }
    seasonMean = arrayMean(seasonMean)
    for(let i=0; i<seasonKey.length; i++){
        var tempScore = arrayMean(varScheme.season[seasonKey[i]].userScore)
        var count = varScheme.season[seasonKey[i]].count
        if(count>=seasonMeanCount){//||tempScore<seasonMean){
            varScheme.season[seasonKey[i]] = tempScore
        } else {
            delete varScheme.season[seasonKey[i]]
        }
    }
    //
    var genresKey = Object.keys(varScheme.genres)
    var genresMean = []
    for(let i=0; i<genresKey.length; i++){
        genresMean.push(arrayMean(varScheme.genres[genresKey[i]].userScore))
    }
    genresMean = arrayMean(genresMean)
    for(let i=0; i<genresKey.length; i++){
        var tempScore = arrayMean(varScheme.genres[genresKey[i]].userScore)
        var count = varScheme.genres[genresKey[i]].count
        if(count>=genresMeanCount){//||tempScore<genresMean){
            varScheme.genres[genresKey[i]] = tempScore
        } else {
            delete varScheme.genres[genresKey[i]]
        }
    }
    //
    var tagsKey = Object.keys(varScheme.tags)
    var tagsMean = []
    for(let i=0; i<tagsKey.length; i++){
        tagsMean.push(arrayMean(varScheme.tags[tagsKey[i]].userScore))
    }
    tagsMean = arrayMean(tagsMean)
    for(let i=0; i<tagsKey.length; i++){
        var tempScore = arrayMean(varScheme.tags[tagsKey[i]].userScore)
        var count = varScheme.tags[tagsKey[i]].count
        if(count>=tagsMeanCount){//||tempScore<tagsMean){
            varScheme.tags[tagsKey[i]] = tempScore
        } else {
            delete varScheme.tags[tagsKey[i]]
        }
    }
    //
    var studiosKey = Object.keys(varScheme.studios)
    var studiosMean = []
    for(let i=0; i<studiosKey.length; i++){
        studiosMean.push(arrayMean(varScheme.studios[studiosKey[i]].userScore))
    }
    studiosMean = arrayMean(studiosMean)
    for(let i=0; i<studiosKey.length; i++){
        var tempScore = arrayMean(varScheme.studios[studiosKey[i]].userScore)
        var count = varScheme.studios[studiosKey[i]].count
        if(count>=studiosMeanCount){//||tempScore<studiosMean){
            varScheme.studios[studiosKey[i]] = tempScore
        } else {
            delete varScheme.studios[studiosKey[i]]
        }
    }
    //
    var staffKey = Object.keys(varScheme.staff)
    var staffMean = []
    for(let i=0; i<staffKey.length; i++){
        staffMean.push(arrayMean(varScheme.staff[staffKey[i]].userScore))
    }
    staffMean = arrayMean(staffMean)
    for(let i=0; i<staffKey.length; i++){
        var tempScore = arrayMean(varScheme.staff[staffKey[i]].userScore)
        var count = varScheme.staff[staffKey[i]].count
        if(count>=staffMeanCount){//||tempScore<staffMean){
            varScheme.staff[staffKey[i]] = tempScore
        } else {
            delete varScheme.staff[staffKey[i]]
        }
    }
    // Join Data
    var varSchemeKeys = Object.keys(varScheme)
    var tempVar = {
        meanFormat: formatMean,
        meanYear: yearMean,
        meanSeason: seasonMean,
        meanGenres: genresMean,
        meanTags: tagsMean,
        meanStudios: studiosMean,
        meanStaff: staffMean
    }
    for(let i=0; i<varSchemeKeys.length; i++){
        var variables = varScheme[varSchemeKeys[i]]
        for(let j=0; j<Object.keys(variables).length; j++){
            var varEntries = Object.entries(variables)
            tempVar[varEntries[j][0]] = varEntries[j][1]
        }
    }
    // Create Model for Numbers| y is predicted so userscore
    // Average Score Model
    var averageScoreX = [], averageScoreY = []
    for(let i=0; i<averageScore.length;i++){
        averageScoreX.push(averageScore[i].averageScore)
        averageScoreY.push(averageScore[i].userScore)
    }
    if(averageScoreX.length>0&&averageScoreY.length>0){
        tempVar["averageScoreModel"] = linearRegression(averageScoreX,averageScoreY)
    }
    // For Anime Length Model
    // var animeLengthModels = []
    var episodesX = [], episodesY = []
    for(let i=0; i<episodes.length;i++){
        episodesX.push(episodes[i].episodes)
        episodesY.push(episodes[i].userScore)
    }
    // animeLengthModels.push([linearRegression(episodesX,episodesY),"episodesModel"])
    if(episodesX.length>0&&episodesY.length>0){
        tempVar["episodesModel"] = linearRegression(episodesX,episodesY)
    }
    var durationX = [], durationY = []
    for(let i=0; i<duration.length;i++){
        durationX.push(duration[i].duration)
        durationY.push(duration[i].userScore)
    }
    // animeLengthModels.push([linearRegression(durationX,durationY),"durationModel"])
    if(durationX.length>0&&durationY.length>0){
        tempVar["durationModel"] = linearRegression(durationX,durationY)
    }
    // var sortedAnimeLengthModels = animeLengthModels.sort(function(a, b) {
    //     return b[0].r2 - a[0].r2;
    // })
    // sortedAnimeLengthModels = sortedAnimeLengthModels[0]
    // tempVar[sortedAnimeLengthModels[1]] = sortedAnimeLengthModels[0]
    // For Popularity
    // var wellKnownAnimeModels = []
    var trendingX = [], trendingY = []
    for(let i=0; i<trending.length;i++){
        trendingX.push(trending[i].trending)
        trendingY.push(trending[i].userScore)
    }
    // wellKnownAnimeModels.push([linearRegression(trendingX,trendingY),"trendingModel"])
    if(trendingX.length>0&&trendingY.length>0){
        tempVar["trendingModel"] = linearRegression(trendingX,trendingY)
    }
    var popularityX = [], popularityY = []
    for(let i=0; i<popularity.length;i++){
        popularityX.push(popularity[i].popularity)
        popularityY.push(popularity[i].userScore)
    }
    // wellKnownAnimeModels.push([linearRegression(popularityX,popularityY),"popularityModel"])
    if(popularityX.length>0&&popularityY.length>0){
        tempVar["popularityModel"] = linearRegression(popularityX,popularityY)
    }
    var favouritesX = [], favouritesY = []
    for(let i=0; i<favourites.length;i++){
        favouritesX.push(favourites[i].favourites)
        favouritesY.push(favourites[i].userScore)
    }
    // wellKnownAnimeModels.push([linearRegression(favouritesX,favouritesY),"favouritesModel"])
    if(favouritesX.length>0&&favouritesY.length>0){
        tempVar["favouritesModel"] = linearRegression(favouritesX,favouritesY)
    }
    // var sortedWellKnownAnimeModels = wellKnownAnimeModels.sort(function(a, b) {
    //     return b[0].r2 - a[0].r2;
    // })
    // sortedWellKnownAnimeModels = sortedWellKnownAnimeModels[0]
    // tempVar[sortedWellKnownAnimeModels[1]] = sortedWellKnownAnimeModels[0]
    varScheme = tempVar
    self.postMessage({
        varScheme: varScheme, 
        userListStatus: userListStatus,
        savedUserList: savedUserList,
        alteredVariables: alteredVariables
    })
    // Used Function
    function arrayMean(obj) {
        return (arraySum(obj) / obj.length) || 0
    }
    function arraySum(obj) {
        return obj.reduce((a, b) => a + b, 0)
    }
    function arrayMedian(obj) {
        var sorted = Array.from(obj).sort((a, b) => a - b);
        var middle = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2;
        }
        return sorted[middle];
    }
        // Linear Regression
    function linearRegression(x,y){
        var lr = {};
        var n = y.length;
        var sum_x = 0;
        var sum_y = 0;
        var sum_xy = 0;
        var sum_xx = 0;
        var sum_yy = 0;
        for (var i = 0; i < y.length; i++) {
            sum_x += x[i];
            sum_y += y[i];
            sum_xy += (x[i]*y[i]);
            sum_xx += (x[i]*x[i]);
            sum_yy += (y[i]*y[i]);
        } 
        lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
        lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
        lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);
        return lr;
    }

}