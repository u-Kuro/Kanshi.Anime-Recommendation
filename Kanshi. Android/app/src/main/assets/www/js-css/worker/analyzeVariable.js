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
                format = anime.format==null?{}:{["Format: "+anime.format]: [userScore]}
                if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&anime.format!==null){
                    savedUserList[title] = newAnimeObjStr
                    if(alteredVariables.format_in["Format: "+anime.format]===undefined){
                        alteredVariables.format_in["Format: "+anime.format] = 1
                    }
                }
                year = anime.seasonYear===null?{}:{["Year: "+anime.seasonYear]: [userScore]}
                if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&anime.seasonYear!==null){
                    savedUserList[title] = newAnimeObjStr
                    if(alteredVariables.year_in["Year: "+anime.seasonYear]===undefined){
                        alteredVariables.year_in["Year: "+anime.seasonYear]=1
                    }
                }
                season = anime.season===null?{}:{["Season: "+anime.season]: [userScore]}
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
                for(let j=0; j<anime.studios.nodes.length; j++){
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
                for(let j=0; j<anime.staff.nodes.length; j++){
                    if(anime.staff.nodes[j].name.userPreferred!==null){
                        if(staff["Staff: "+anime.staff.nodes[j].name.userPreferred]===undefined){
                            staff["Staff: "+anime.staff.nodes[j].name.userPreferred] = {userScore:[userScore],count:1}
                        } else {
                            staff["Staff: "+anime.staff.nodes[j].name.userPreferred].userScore.push(userScore)
                            staff["Staff: "+anime.staff.nodes[j].name.userPreferred].count += 1
                        }
                        if(staffMeanCount["Staff: "+anime.staff.nodes[j].name.userPreferred]===undefined){
                            staffMeanCount["Staff: "+anime.staff.nodes[j].name.userPreferred] = 1
                        } else {
                            staffMeanCount["Staff: "+anime.staff.nodes[j].name.userPreferred] += 1
                        }
                    }
                    if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&anime.staff.nodes[j].name.userPreferred!==null){
                        savedUserList[title] = newAnimeObjStr
                        if(alteredVariables.staff_in["Staff: "+anime.staff.nodes[j].name.userPreferred]===undefined){
                            alteredVariables.staff_in["Staff: "+anime.staff.nodes[j].name.userPreferred] = 1
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
                        varScheme.format[xformat].push(userScore)
                    }
                    else{
                        varScheme.format[xformat] = [userScore]
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
                        varScheme.year[xyear].push(userScore)
                    }
                    else{
                        varScheme.year[xyear] = [userScore]
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
                        varScheme.season[xseason].push(userScore)
                    }
                    else{
                        varScheme.season[xseason] = [userScore]
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
                for(let j=0; j<anime.studios.nodes.length; j++){
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
                for(let j=0; j<anime.staff.nodes.length; j++){
                    var xstaff = anime.staff.nodes[j].name.userPreferred===null?null: "Staff: "+anime.staff.nodes[j].name.userPreferred
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
                studiosCount.push({userScore: userScore, studiosCount: anime.studios.nodes.length})
            }
            if(anime.staff.nodes!==null){
                staffCount.push({userScore: userScore, staffCount: anime.staff.nodes.length})
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
            if(alteredVariables.studios_in["Studio: "+anime.studios.nodes[j].name]===undefined){
                alteredVariables.studios_in["Studio: "+anime.studios.nodes[j].name] = 1
            }
        }
        for(let j=0; j<anime.staff.nodes.length; j++){
            if(alteredVariables.staff_in["Staff: "+anime.staff.nodes[j].name.userPreferred]===undefined){
                alteredVariables.staff_in["Staff: "+anime.staff.nodes[j].name.userPreferred] = 1
            }
        }
        // Lastly delete the anime in the savedUserList
        delete savedUserList[savedUserListTitles[i]]
    }
    // Clean Data JSON
    genresMeanCount = Object.values(genresMeanCount).length>0 ? arrayMean(Object.values(genresMeanCount)) : 0
    tagsMeanCount = Object.values(tagsMeanCount).length>0 ? arrayMean(Object.values(tagsMeanCount)) : 0
    studiosMeanCount = Object.values(studiosMeanCount).length>0 ? arrayMean(Object.values(studiosMeanCount)) : 0
    staffMeanCount = Object.values(staffMeanCount).length>0 ? arrayMean(Object.values(staffMeanCount)) : 0
    var meanGenres = []
    var meanTags = []
    var meanStaff = []
    var meanStudios = []
    for(let i=0; i<Object.keys(varScheme.format).length; i++){
        var formatKey = Object.keys(varScheme.format)
        var tempScore =  arrayMean(varScheme.format[formatKey[i]])*10
        varScheme.format[formatKey[i]] = tempScore
    }
    for(let i=0; i<Object.keys(varScheme.year).length; i++){
        var yearKey = Object.keys(varScheme.year)
        var tempScore = arrayMean(varScheme.year[yearKey[i]])*10
        varScheme.year[yearKey[i]] = tempScore
    }
    for(let i=0; i<Object.keys(varScheme.season).length; i++){
        var seasonKey = Object.keys(varScheme.season)
        var tempScore = arrayMean(varScheme.season[seasonKey[i]])*10
        varScheme.season[seasonKey[i]] = tempScore
    }
    var genresKey = Object.keys(varScheme.genres)
    for(let i=0; i<genresKey.length; i++){
        var tempScore = arrayMean(varScheme.genres[genresKey[i]].userScore)*10
        meanGenres.push(tempScore)
        var count = varScheme.genres[genresKey[i]].count
        if(count>=genresMeanCount){
            varScheme.genres[genresKey[i]+"-Dense"] = tempScore
        }
        varScheme.genres[genresKey[i]] = tempScore
    }
    var tagsKey = Object.keys(varScheme.tags)
    for(let i=0; i<tagsKey.length; i++){
        var tempScore = arrayMean(varScheme.tags[tagsKey[i]].userScore)*10
        meanTags.push(tempScore)
        var count = varScheme.tags[tagsKey[i]].count
        if(count>=tagsMeanCount){
            varScheme.tags[tagsKey[i]+"-Dense"] = tempScore
        }
        varScheme.tags[tagsKey[i]] = tempScore
    }
    var studiosKey = Object.keys(varScheme.studios)
    for(let i=0; i<studiosKey.length; i++){
        var tempScore = arrayMean(varScheme.studios[studiosKey[i]].userScore)*10
        meanStudios.push(tempScore)
        var count = varScheme.studios[studiosKey[i]].count
        if(count>=studiosMeanCount){
            varScheme.studios[studiosKey[i]+"-Dense"] = tempScore
        }
        varScheme.studios[studiosKey[i]] = tempScore
    }
    var staffKey = Object.keys(varScheme.staff)
    for(let i=0; i<staffKey.length; i++){
        var tempScore = arrayMean(varScheme.staff[staffKey[i]].userScore)*10
        meanStaff.push(tempScore)
        var count = varScheme.staff[staffKey[i]].count
        if(count>=staffMeanCount){
            varScheme.staff[staffKey[i]+"-Dense"] = tempScore
        }
        varScheme.staff[staffKey[i]] = tempScore
    }
    // Join Data
    var varSchemeKeys = Object.keys(varScheme)
    var tempVar = {
        meanGenres: arrayMean(meanGenres),
        meanTags: arrayMean(meanTags),
        meanStaff: arrayMean(meanStaff),
        meanStudios: arrayMean(meanStudios),
    }
    for(let i=0; i<varSchemeKeys.length; i++){
        var variables = varScheme[varSchemeKeys[i]]
        for(let j=0; j<Object.keys(variables).length; j++){
            var varEntries = Object.entries(variables)
            tempVar[varEntries[j][0]] = varEntries[j][1]
        }
    }
    // Create Model for Numbers| y is predicted so userscore
    var episodesX = [], episodesY = []
    for(let i=0; i<episodes.length;i++){
        episodesX.push(episodes[i].episodes)
        episodesY.push(episodes[i].userScore)
    }
    tempVar["episodesModel"] = linearRegression(episodesX,episodesY)
    var durationX = [], durationY = []
    for(let i=0; i<duration.length;i++){
        durationX.push(duration[i].duration)
        durationY.push(duration[i].userScore)
    }
    tempVar["durationModel"] = linearRegression(durationX,durationY)
    var averageScoreX = [], averageScoreY = []
    for(let i=0; i<averageScore.length;i++){
        averageScoreX.push(averageScore[i].averageScore)
        averageScoreY.push(averageScore[i].userScore)
    }
    tempVar["averageScoreModel"] = linearRegression(averageScoreX,averageScoreY)
    var trendingX = [], trendingY = []
    for(let i=0; i<trending.length;i++){
        trendingX.push(trending[i].trending)
        trendingY.push(trending[i].userScore)
    }
    tempVar["trendingModel"] = linearRegression(trendingX,trendingY)
    var popularityX = [], popularityY = []
    for(let i=0; i<popularity.length;i++){
        popularityX.push(popularity[i].popularity)
        popularityY.push(popularity[i].userScore)
    }
    tempVar["popularityModel"] = linearRegression(popularityX,popularityY)
    var favouritesX = [], favouritesY = []
    for(let i=0; i<favourites.length;i++){
        favouritesX.push(favourites[i].favourites)
        favouritesY.push(favourites[i].userScore)
    }
    tempVar["favouritesModel"] = linearRegression(favouritesX,favouritesY)
    var genresCountX = [], genresCountY = []
    for(let i=0; i<favourites.length;i++){
        genresCountX.push(genresCount[i].genresCount)
        genresCountY.push(genresCount[i].userScore)
    }
    tempVar["genresCountModel"] = linearRegression(genresCountX,genresCountY)
    var tagsCountX = [], tagsCountY = []
    for(let i=0; i<tagsCount.length;i++){
        tagsCountX.push(tagsCount[i].tagsCount)
        tagsCountY.push(tagsCount[i].userScore)
    }
    tempVar["tagsCountModel"] = linearRegression(tagsCountX,tagsCountY)
    var studiosCountX = [], studiosCountY = []
    for(let i=0; i<favourites.length;i++){
        studiosCountX.push(studiosCount[i].studiosCount)
        studiosCountY.push(studiosCount[i].userScore)
    }
    tempVar["studiosCountModel"] = linearRegression(studiosCountX,studiosCountY)
    var staffCountX = [], staffCountY = []
    for(let i=0; i<favourites.length;i++){
        staffCountX.push(staffCount[i].staffCount)
        staffCountY.push(staffCount[i].userScore)
    }
    tempVar["staffCountModel"] = linearRegression(staffCountX,staffCountY)
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