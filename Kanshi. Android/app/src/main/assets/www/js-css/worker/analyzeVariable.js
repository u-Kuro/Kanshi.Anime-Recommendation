self.onmessage = (message) => {
    const data = message.data
    //Concat Completed, Watching, Drop, etc.
    var animeList = data.data.MediaListCollection.lists
    var animeEntries = []
    for(let i=0; i<animeList.length-1; i++){
        animeEntries = animeList[i].entries.concat(animeList[++i].entries)
    }
    var varScheme = {}
    // Check Watched
    var userListInfo = []
    for(let i=0; i<animeList.length; i++){
        for(let j=0; j<animeList[i].entries.length; j++){ 
            userListInfo.push({
                title: animeList[i].entries[j].media.title.userPreferred,
                status: animeList[i].status
            })
        }
    }
    // Analyze each Anime Variable
    for(let i=0; i<animeEntries.length; i++){
        if(animeEntries[i].score>0){
            var userScore = animeEntries[i].score
            var anime = animeEntries[i].media
            var format = {}
            var year = {}
            var season = {}
            var episodes = {}
            var xepisodetype
            if(anime.episodes===1) xepisodetype = "Episode: 1"
            else if (anime.episodes>1&&anime.episodes<7) xepisodetype = "Episode: 2-6"
            else if (anime.episodes>6&&anime.episodes<14) xepisodetype = "Episode: 7-13"
            else if (anime.episodes>13&&anime.episodes<27) xepisodetype = "Episode: 14-26"
            else if (anime.episodes>26&&anime.episodes<53) xepisodetype = "Episode: 27-52"
            else if (anime.episodes>52&&anime.episodes<101) xepisodetype = "Episode: 53-100"
            else if (anime.episodes>100) xepisodetype = "Episode: 101+"
            else xepisodetype = null
            var genres = {}
            var tags = {}
            var studios = {}
            var staff = {}
            if(Object.keys(varScheme).length<1){
                format = anime.format==null?{}:{["Format: "+anime.format]: [userScore]}
                episodes = xepisodetype===null?{}:{[xepisodetype]: [userScore]}
                year = anime.seasonYear===null?{}:{["Year: "+anime.seasonYear]: [userScore]}
                season = anime.season===null?{}:{["Season: "+anime.season]: [userScore]}
                for(let j=0; j<anime.genres.length; j++){
                    genres = anime.genres[j]===null?{}:{["Genre: "+anime.genres[j]]: [userScore]}
                }
                for(let j=0; j<anime.studios.nodes.length; j++){
                    studios = anime.studios.nodes[j].name===null?{}:{["Studio: "+anime.studios.nodes[j].name]: [userScore]}
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
                    staff = fullname===null?{}:{[fullname]: [userScore]}
                }
                varScheme = {
                    // Key with userScores Array
                    format: format, episodes: episodes, 
                    year: year, season: season, genres: genres, tags: tags,
                    studios: studios, staff: staff,
                }
            } else {
                var xformat = anime.format===null? null : "Format: "+anime.format
                if(xformat!==null){
                    if(Object.keys(varScheme.format).includes(xformat)){
                        varScheme.format[xformat].push(userScore)
                    }
                    else{
                        varScheme.format = {...varScheme.format, [xformat]: [userScore]}
                    }
                }
                if(xepisodetype!==null){
                    if(Object.keys(varScheme.episodes).includes(xepisodetype)){
                        varScheme.episodes[xepisodetype].push(userScore)
                    }
                    else{
                        varScheme.episodes = {...varScheme.episodes, [xepisodetype]: [userScore]}
                    }
                }
                var xyear = anime.seasonYear===null? null : "Year: "+anime.seasonYear.toString()
                if(xyear!==null){
                    if(Object.keys(varScheme.year).includes(xyear)){
                        varScheme.year[xyear].push(userScore)
                    }
                    else{
                        varScheme.year = {...varScheme.year, [xyear]: [userScore]}
                    }
                }
                var xseason = anime.season===null? null : "Season: "+anime.season
                if(xseason!==null){
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
                        if(Object.keys(varScheme.staff).includes(xstaff)){
                            varScheme.staff[xstaff].push(userScore)
                        }
                        else varScheme.staff = {...varScheme.staff, [xstaff]: [userScore]}
                    }
                }
            }
        }
    }
    // Clean Data JSON
    var meanFormat = []
    var meanEpisodetype = []
    var meanYear = []
    var meanSeason = []
    var meanGenres = []
    var meanTags = []
    var meanStaff = []
    var meanStudios = []
    for(let i=0; i<Object.keys(varScheme.format).length; i++){
        var formatKey = Object.keys(varScheme.format)
        var tempScore =  arrayMean(varScheme.format[formatKey[i]])*10
        meanFormat.push(tempScore)
        varScheme.format[formatKey[i]] = tempScore
    }
    for(let i=0; i<Object.keys(varScheme.episodes).length; i++){
        var episodesKey = Object.keys(varScheme.episodes)
        var tempScore = arrayMean(varScheme.episodes[episodesKey[i]])*10
        meanEpisodetype.push(tempScore)
        varScheme.episodes[episodesKey[i]] = tempScore
    }
    for(let i=0; i<Object.keys(varScheme.year).length; i++){
        var yearKey = Object.keys(varScheme.year)
        var tempScore = arrayMean(varScheme.year[yearKey[i]])*10
        meanYear.push(tempScore)
        varScheme.year[yearKey[i]] = tempScore
    }
    for(let i=0; i<Object.keys(varScheme.season).length; i++){
        var seasonKey = Object.keys(varScheme.season)
        var tempScore = arrayMean(varScheme.season[seasonKey[i]])*10
        meanSeason.push(tempScore)
        varScheme.season[seasonKey[i]] = tempScore
    }
    for(let i=0; i<Object.keys(varScheme.genres).length; i++){
        var genresKey = Object.keys(varScheme.genres)
        var tempScore = arrayMean(varScheme.genres[genresKey[i]])*10
        meanGenres.push(tempScore)
        var eto = varScheme.genres[genresKey[i]]
        varScheme.genres[genresKey[i]] = tempScore
    }
    for(let i=0; i<Object.keys(varScheme.tags).length; i++){
        var tagsKey = Object.keys(varScheme.tags)
        var tempScore = arrayMean(varScheme.tags[tagsKey[i]])*10
        meanTags.push(tempScore)
        varScheme.tags[tagsKey[i]] = tempScore
    }
    for(let i=0; i<Object.keys(varScheme.studios).length; i++){
        var studiosKey = Object.keys(varScheme.studios)
        var tempScore = arrayMean(varScheme.studios[studiosKey[i]])*10
        meanStudios.push(tempScore)
        varScheme.studios[studiosKey[i]] = tempScore
    }
    for(let i=0; i<Object.keys(varScheme.staff).length; i++){
        var staffKey = Object.keys(varScheme.staff)
        var tempScore = arrayMean(varScheme.staff[staffKey[i]])*10
        meanStaff.push(tempScore)
        varScheme.staff[staffKey[i]] = tempScore
    }
    // Join Data
    var varSchemeKeys = Object.keys(varScheme)
    var tempVar = {
        meanFormat: arrayMean(meanFormat),
        meanEpisodetype: arrayMean(meanEpisodetype),
        meanYear: arrayMean(meanYear),
        meanSeason: arrayMean(meanSeason),
        meanGenres: arrayMean(meanGenres),
        meanTags: arrayMean(meanTags),
        meanStaff: arrayMean(meanStaff),
        meanStudios: arrayMean(meanStudios),
    }
    for(let i=0; i<varSchemeKeys.length; i++){
            var variables = varScheme[varSchemeKeys[i]]
            for(let j=0; j<Object.keys(variables).length; j++){
            var varEntries = Object.entries(variables)
            tempVar = {...tempVar, [varEntries[j][0]]:varEntries[j][1]}
        }
    }
    varScheme = tempVar
    self.postMessage({
        varScheme: varScheme, 
        userListInfo: userListInfo
    })
    // Used Function
    function arrayMean(obj) {
        return (arraySum(obj) / obj.length) || 0
    }
    function arraySum(obj) {
        return obj.reduce((a, b) => a + b, 0)
    }
}