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
    // Analyze each Anime Variable
    for(let i=0; i<animeEntries.length; i++){
        if(animeEntries[i].score>0){
            var isNewAnime = false
            var userScore = animeEntries[i].score
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
                savedUserList = {...savedUserList, [title]: newAnimeObjStr}
            }//sUL = {sUL}
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
                    alteredVariables.format_in = {...alteredVariables.format_in, ["Format: "+anime.format]:1}
                }
                year = anime.seasonYear===null?{}:{["Year: "+anime.seasonYear]: [userScore]}
                if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&anime.seasonYear!==null){
                    savedUserList[title] = newAnimeObjStr
                    alteredVariables.year_in = {...alteredVariables.year_in, ["Year: "+anime.seasonYear]:1}
                }
                season = anime.season===null?{}:{["Season: "+anime.season]: [userScore]}
                if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&anime.season!==null){
                    savedUserList[title] = newAnimeObjStr
                    alteredVariables.season_in = {...alteredVariables.season_in, ["Season: "+anime.season]:1}
                }
                for(let j=0; j<anime.genres.length; j++){
                    genres = anime.genres[j]===null?{}:{["Genre: "+anime.genres[j]]: [userScore]}
                    if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&anime.genres[j]!==null){
                        savedUserList[title] = newAnimeObjStr
                        alteredVariables.genres_in = {...alteredVariables.genres_in, ["Genre: "+anime.genres[j]]:1}
                    }
                }
                for(let j=0; j<anime.tags.length; j++){
                    tags = anime.tags[j].name===null?{}:{["Tag: "+anime.tags[j].name]: [userScore]}
                    if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&anime.tags[j].name!==null){
                        savedUserList[title] = newAnimeObjStr
                        alteredVariables.tags_in = {...alteredVariables.tags_in, ["Tag: "+anime.tags[j].name]:1}
                    }
                }
                for(let j=0; j<anime.studios.nodes.length; j++){
                    studios = anime.studios.nodes[j].name===null?{}:{["Studio: "+anime.studios.nodes[j].name]: [userScore]}
                    if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&anime.studios.nodes[j].name!==null){
                        savedUserList[title] = newAnimeObjStr
                        alteredVariables.studios_in = {...alteredVariables.studios_in, ["Studio: "+anime.studios.nodes[j].name]:1}
                    }
                }
                for(let j=0; j<anime.staff.edges.length; j++){
                    var firstname = anime.staff.edges[j].node.name.first
                    var lastname = anime.staff.edges[j].node.name.last
                    var fullname = []
                    if(firstname==null&&lastname==null){
                        fullname = null
                    } else {
                        if(firstname!==null) fullname.push(firstname)
                        if(lastname!==null) fullname.push(lastname)
                        fullname = fullname.join(" ")
                        fullname = "Staff: "+fullname
                        if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&fullname!==null){
                            savedUserList[title] = newAnimeObjStr
                            alteredVariables.staff_in = {...alteredVariables.staff_in, [fullname]:1}
                        }
                    }
                    staff = fullname===null?{}:{[fullname]: [userScore]}
                }
                varScheme = {
                    format: format, year: year, season: season, genres: genres, tags: tags, studios: studios, staff: staff,
                }
            } else {
                var xformat = anime.format===null? null : "Format: "+anime.format
                if(xformat!==null){
                    if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                        savedUserList[title] = newAnimeObjStr
                        alteredVariables.format_in = {...alteredVariables.format_in, [xformat]:1}
                    }
                    if(Object.keys(varScheme.format).includes(xformat)){
                        varScheme.format[xformat].push(userScore)
                    }
                    else{
                        varScheme.format = {...varScheme.format, [xformat]: [userScore]}
                    }
                }
                var xyear = anime.seasonYear===null? null : "Year: "+anime.seasonYear.toString()
                if(xyear!==null){
                    if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                        savedUserList[title] = newAnimeObjStr
                        alteredVariables.year_in = {...alteredVariables.year_in, [xyear]:1}
                    }
                    if(Object.keys(varScheme.year).includes(xyear)){
                        varScheme.year[xyear].push(userScore)
                    }
                    else{
                        varScheme.year = {...varScheme.year, [xyear]: [userScore]}
                    }
                }
                var xseason = anime.season===null? null : "Season: "+anime.season
                if(xseason!==null){
                    if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                        savedUserList[title] = newAnimeObjStr
                        alteredVariables.season_in = {...alteredVariables.season_in, [xseason]:1}
                    }
                    if(Object.keys(varScheme.season).includes(xseason)){
                        varScheme.season[xseason].push(userScore)
                    }
                    else{
                        varScheme.season = {...varScheme.season, [xseason]: [userScore]}
                    }
                }
                for(let j=0; j<anime.genres.length; j++){
                    var xgenres = anime.genres[j]===null? null : "Genre: "+anime.genres[j]
                    if(xgenres!==null){
                        if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                            savedUserList[title] = newAnimeObjStr
                            alteredVariables.genres_in = {...alteredVariables.genres_in, [xgenres]:1}
                        }
                        if(Object.keys(varScheme.genres).includes(xgenres)){
                            varScheme.genres[xgenres].push(userScore)
                        }
                        else{
                            varScheme.genres = {...varScheme.genres, [xgenres]: [userScore]}
                        }
                    }
                }
                for(let j=0; j<anime.tags.length; j++){
                    var xtags = anime.tags[j].name===null? null : "Tag: "+anime.tags[j].name
                    if(xtags!==null){
                        if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                            savedUserList[title] = newAnimeObjStr
                            alteredVariables.tags_in = {...alteredVariables.tags_in, [xtags]:1}
                        }
                        if(Object.keys(varScheme.tags).includes(xtags)){
                            varScheme.tags[xtags].push(userScore)
                        }
                        else {
                            varScheme.tags = {...varScheme.tags, [xtags]: [userScore]}
                        }
                    }
                }
                for(let j=0; j<anime.studios.nodes.length; j++){
                    var xstudios = anime.studios.nodes[j].name===null? null : "Studio: "+anime.studios.nodes[j].name
                    if(xstudios!==null){
                        if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                            savedUserList[title] = newAnimeObjStr
                            alteredVariables.studios_in = {...alteredVariables.studios_in, [xstudios]:1}
                        }
                        if(Object.keys(varScheme.studios).includes(xstudios)){
                            varScheme.studios[xstudios].push(userScore)
                        }
                        else {
                            varScheme.studios = {...varScheme.studios, [xstudios]: [userScore]}
                        }
                    }
                }
                for(let j=0; j<anime.staff.edges.length; j++){
                    var firstname = anime.staff.edges[j].node.name.first
                    var lastname = anime.staff.edges[j].node.name.last
                    var fullname = []
                    if(firstname==null&&lastname==null){
                        fullname = null
                    } else {
                        if(firstname!==null) fullname.push(firstname)
                        if(lastname!==null) fullname.push(lastname)
                        fullname = fullname.join(" ")
                        fullname = "Staff: "+fullname
                    }
                    var xstaff = fullname===null?null:fullname
                    if(xstaff!==null){
                        if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                            savedUserList[title] = newAnimeObjStr
                            alteredVariables.staff_in = {...alteredVariables.staff_in, [xstaff]:1}
                        }
                        if(Object.keys(varScheme.staff).includes(xstaff)){
                            varScheme.staff[xstaff].push(userScore)
                        }
                        else varScheme.staff = {...varScheme.staff, [xstaff]: [userScore]}
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
        }
    }
    // Clean Data JSON
    // var meanFormat = []
    // var meanYear = []
    // var meanSeason = []
    // var meanGenres = []
    // var meanTags = []
    // var meanStaff = []
    // var meanStudios = []
    for(let i=0; i<Object.keys(varScheme.format).length; i++){
        var formatKey = Object.keys(varScheme.format)
        var tempScore =  arrayMean(varScheme.format[formatKey[i]])*10
        // meanFormat.push(tempScore)
        varScheme.format[formatKey[i]] = tempScore
    }
    for(let i=0; i<Object.keys(varScheme.year).length; i++){
        var yearKey = Object.keys(varScheme.year)
        var tempScore = arrayMean(varScheme.year[yearKey[i]])*10
        // meanYear.push(tempScore)
        varScheme.year[yearKey[i]] = tempScore
    }
    for(let i=0; i<Object.keys(varScheme.season).length; i++){
        var seasonKey = Object.keys(varScheme.season)
        var tempScore = arrayMean(varScheme.season[seasonKey[i]])*10
        // meanSeason.push(tempScore)
        varScheme.season[seasonKey[i]] = tempScore
    }
    for(let i=0; i<Object.keys(varScheme.genres).length; i++){
        var genresKey = Object.keys(varScheme.genres)
        var tempScore = arrayMean(varScheme.genres[genresKey[i]])*10
        // meanGenres.push(tempScore)
        varScheme.genres[genresKey[i]] = tempScore
    }
    for(let i=0; i<Object.keys(varScheme.tags).length; i++){
        var tagsKey = Object.keys(varScheme.tags)
        var tempScore = arrayMean(varScheme.tags[tagsKey[i]])*10
        // meanTags.push(tempScore)
        varScheme.tags[tagsKey[i]] = tempScore
    }
    for(let i=0; i<Object.keys(varScheme.studios).length; i++){
        var studiosKey = Object.keys(varScheme.studios)
        var tempScore = arrayMean(varScheme.studios[studiosKey[i]])*10
        // meanStudios.push(tempScore)
        varScheme.studios[studiosKey[i]] = tempScore
    }
    for(let i=0; i<Object.keys(varScheme.staff).length; i++){
        var staffKey = Object.keys(varScheme.staff)
        var tempScore = arrayMean(varScheme.staff[staffKey[i]])*10
        // meanStaff.push(tempScore)
        varScheme.staff[staffKey[i]] = tempScore
    }
    // Join Data
    var varSchemeKeys = Object.keys(varScheme)
    var tempVar = {}//{
    //     meanFormat: arrayMean(meanFormat),
    //     meanYear: arrayMean(meanYear),
    //     meanSeason: arrayMean(meanSeason),
    //     meanGenres: arrayMean(meanGenres),
    //     meanTags: arrayMean(meanTags),
    //     meanStaff: arrayMean(meanStaff),
    //     meanStudios: arrayMean(meanStudios),
    // }
    for(let i=0; i<varSchemeKeys.length; i++){
        var variables = varScheme[varSchemeKeys[i]]
        for(let j=0; j<Object.keys(variables).length; j++){
            var varEntries = Object.entries(variables)

            tempVar = {...tempVar, [varEntries[j][0]]:varEntries[j][1]}
        }
    }
    // Create Model for Numbers| y is predicted so userscore
    var episodesX = [], episodesY = []
    for(let i=0; i<episodes.length;i++){
        episodesX.push(episodes[i].episodes)
        episodesY.push(episodes[i].userScore)
    }
    tempVar = {...tempVar, episodesModel:linearRegression(episodesX,episodesY)}
    var durationX = [], durationY = []
    for(let i=0; i<duration.length;i++){
        durationX.push(duration[i].duration)
        durationY.push(duration[i].userScore)
    }
    tempVar = {...tempVar, durationModel:linearRegression(durationX,durationY)}
    var averageScoreX = [], averageScoreY = []
    for(let i=0; i<averageScore.length;i++){
        averageScoreX.push(averageScore[i].averageScore)
        averageScoreY.push(averageScore[i].userScore)
    }
    tempVar = {...tempVar, averageScoreModel:linearRegression(averageScoreX,averageScoreY)}
    var trendingX = [], trendingY = []
    for(let i=0; i<trending.length;i++){
        trendingX.push(trending[i].trending)
        trendingY.push(trending[i].userScore)
    }
    tempVar = {...tempVar, trendingModel:linearRegression(trendingX,trendingY)}
    var popularityX = [], popularityY = []
    for(let i=0; i<popularity.length;i++){
        popularityX.push(popularity[i].popularity)
        popularityY.push(popularity[i].userScore)
    }
    tempVar = {...tempVar, popularityModel:linearRegression(popularityX,popularityY)}
    var favouritesX = [], favouritesY = []
    for(let i=0; i<favourites.length;i++){
        favouritesX.push(favourites[i].favourites)
        favouritesY.push(favourites[i].userScore)
    }
    tempVar = {...tempVar, favouritesModel:linearRegression(favouritesX,favouritesY)}
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