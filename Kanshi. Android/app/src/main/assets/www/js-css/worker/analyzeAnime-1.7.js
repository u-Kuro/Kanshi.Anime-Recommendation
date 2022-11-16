self.onmessage = (message) => {
    const minNumber = 1-6e-17!==1? 6e-17 : 1e-16 // Min Value Javascript
    var data = message.data
    var animeEntries = data.animeEntries
    var savedRecScheme = data.savedRecScheme
    var recSchemeIsNew = Object.keys(savedRecScheme).length===0?true:false
    var userListStatus = data.userListStatus
    var varScheme = data.varScheme
    var allFilterInfo = data.allFilterInfo || {}
    var alteredVariables = data.alteredVariables
    var savedAnalyzedVariablesCount = {
        all: {},
        format: {},
        genres: {},
        tags: {},
        studios: {},
        staff: {}
    }
    // Add Popularity Weight
    var popularityMode = []
    var averageScoreMode = []
    for(let i=0; i<animeEntries.length; i++){
        var anime = animeEntries[i]
        var popularity = anime.popularity
        if(isaN(popularity)){
            popularityMode.push(popularity)
        }
        var score = anime.averageScore
        if(isaN(score)){
            averageScoreMode.push(score)
        }
    }
    var popularitySum = popularityMode.length>0?arraySum(popularityMode):0
    popularityMode = popularityMode.length>0?arrayMode(popularityMode):0
    averageScoreMode = averageScoreMode.length>0?arrayMode(averageScoreMode):0
    
    if(!jsonIsEmpty(varScheme)){
        for(let i=0; i<animeEntries.length; i++){
            var animeShallUpdate = false
            var anime = animeEntries[i]

            var title = anime.title.userPreferred || "Title: N/A"
            var anilistId = anime.id
            var animeUrl = anime.siteUrl
            var format = anime.format || "Format: N/A"
            var year = anime.seasonYear || "Year: N/A"
            var season = anime.season || "Season: N/A"
            var genres = anime.genres
            var tags = anime.tags
            var studios = anime.studios.nodes.filter((studio)=>{return studio.isAnimationStudio})
            var staff = anime.staff.edges
            var status = anime.status || "Status: N/A"
            var userStatus = "UNWATCHED"

            if(allFilterInfo["title: "+title.toLowerCase()]===undefined){
                allFilterInfo["title: "+title.toLowerCase()] = 0
            }
            if(allFilterInfo["format: "+format.toLowerCase()]===undefined&&allFilterInfo["!format: "+format.toLowerCase()]===undefined){
                allFilterInfo["format: "+format.toLowerCase()] = 0
                allFilterInfo["!format: "+format.toLowerCase()] = 0
            }
            if(allFilterInfo[`year: ${year}`.toLowerCase()]===undefined&&allFilterInfo[`!year: ${year}`.toLowerCase()]===undefined){
                allFilterInfo[`year: ${year}`.toLowerCase()] = 0  
                allFilterInfo[`!year: ${year}`.toLowerCase()] = 0
            }
            if(allFilterInfo["season: "+season.toLowerCase()]===undefined&&allFilterInfo["!season: "+season.toLowerCase()]===undefined){
                allFilterInfo["season: "+season.toLowerCase()] = 0
                allFilterInfo["!season: "+season.toLowerCase()] = 0
            }
            if(allFilterInfo["status: "+status.toLowerCase()]===undefined&&allFilterInfo["!status: "+status.toLowerCase()]===undefined){
                allFilterInfo["status: "+status.toLowerCase()] = 0
                allFilterInfo["!status: "+status.toLowerCase()] = 0
            }

            // Arrange
            var xformat = format!=="Format: N/A"?`Format: ${format}`:`${Math.random()}`
            if(alteredVariables.format_in["Format: "+format]!==undefined||recSchemeIsNew) animeShallUpdate=true
            var xgenres = []
            for(let j=0; j<genres.length; j++){
                if((alteredVariables.genres_in["Genre: "+genres[j]]!==undefined&&!animeShallUpdate)||recSchemeIsNew) {
                    animeShallUpdate = true
                }
                xgenres.push("Genre: "+genres[j])
                if(allFilterInfo["genre: "+genres[j].toLowerCase()]===undefined&&allFilterInfo["!genre: "+genres[j].toLowerCase()]===undefined){
                    allFilterInfo["genre: "+genres[j].toLowerCase()] = 0 
                    allFilterInfo["!genre: "+genres[j].toLowerCase()] = 0
                }
            }
            var xtags = []
            for(let j=0; j<tags.length; j++){
                if((alteredVariables.tags_in["Tag: "+tags[j].name]!==undefined&&!animeShallUpdate)||recSchemeIsNew) {
                    animeShallUpdate = true
                }
                xtags.push({name:"Tag: "+tags[j].name,rank:tags[j].rank,category:tags[j].category})
                if(allFilterInfo[("tag category: "+tags[j].category).toLowerCase()]===undefined&&allFilterInfo[("!tag category: "+tags[j].category).toLowerCase()]===undefined){
                    allFilterInfo["tag category: "+tags[j].category.toLowerCase()] = 0 
                    allFilterInfo["!tag category: "+tags[j].category.toLowerCase()] = 0
                }
                if(allFilterInfo[("tag: "+tags[j].name).toLowerCase()]===undefined){
                    allFilterInfo["tag: "+tags[j].name.toLowerCase()] = 0 
                    allFilterInfo["!tag: "+tags[j].name.toLowerCase()] = 0
                }
            }
            var xstudios = []
            var includedStudio = {}
            for(let j=0; j<studios.length; j++){
                if(!studios[j].isAnimationStudio) continue
                if(includedStudio[studios[j].name]!==undefined) continue
                else includedStudio[studios[j].name] = null
                if((alteredVariables.studios_in["Studio: "+studios[j].name]!==undefined&&!animeShallUpdate)||recSchemeIsNew) {
                    animeShallUpdate = true
                }
                xstudios.push({name:"Studio: "+studios[j].name,siteUrl:studios[j].siteUrl})
                // Should Remove Since It's Lagging on Too Much Filters
                if(allFilterInfo[("studio: "+studios[j].name).toLowerCase()]===undefined&&allFilterInfo[("!studio: "+studios[j].name).toLowerCase()]===undefined){
                    allFilterInfo["studio: "+studios[j].name.toLowerCase()] = 0  
                    allFilterInfo["!studio: "+studios[j].name.toLowerCase()] = 0
                }
            }
            var xstaff = []
            var includedStaff = {}
            for(let j=0; j<staff.length; j++){
                if(includedStaff[staff[j].node.name.userPreferred]!==undefined) continue
                else includedStaff[staff[j].node.name.userPreferred] = null
                if((alteredVariables.staff_in["Staff: "+staff[j].node.name.userPreferred]!==undefined&&!animeShallUpdate)||recSchemeIsNew) {
                    animeShallUpdate = true
                }
                xstaff.push({staff:"Staff: "+staff[j].node.name.userPreferred, role:"Role: "+staff[j].role.split(" (")[0], siteUrl:staff[j].node.siteUrl})
                if(allFilterInfo[("staff role: "+staff[j].role.split(" (")[0]).toLowerCase()]===undefined&&allFilterInfo[("!staff role: "+staff[j].role.split(" (")[0]).toLowerCase()]===undefined){
                    allFilterInfo["staff role: "+staff[j].role.split(" (")[0].toLowerCase()] = 0
                    allFilterInfo["!staff role: "+staff[j].role.split(" (")[0].toLowerCase()] = 0
                }
                // Removed Since It's Lagging on Too Much Filters
                // if(allFilterInfo[("staff: "+staff[j].node.name.userPreferred).toLowerCase()]===undefined&&allFilterInfo[("!staff: "+staff[j].node.name.userPreferred).toLowerCase()]===undefined){
                //     allFilterInfo[("staff: "+staff[j].node.name.userPreferred).toLowerCase()] = 0
                //     allFilterInfo["!staff: "+(staff[j].node.name.userPreferred).toLowerCase()] = 0
                // }
            }
            // Check if any variable is Altered, and continue
            if(!animeShallUpdate) continue
            // Check Status
              // For Unwatched
            if(allFilterInfo["user status: "+userStatus.toLowerCase()]===undefined&&allFilterInfo["!user status: "+userStatus.toLowerCase()]===undefined){
                allFilterInfo["user status: "+userStatus.toLowerCase()] = 0
                allFilterInfo["!user status: "+userStatus.toLowerCase()] = 0
            }
            for(let k=0; k<userListStatus.length; k++){
                if(userListStatus[k].id===anilistId && userListStatus[k].id!==null && userListStatus[k].status!==null){
                    userStatus = userListStatus[k].status
                    if(allFilterInfo["user status: "+userStatus.toLowerCase()]===undefined&&allFilterInfo["!user status: "+userStatus.toLowerCase()]===undefined){
                        allFilterInfo["user status: "+userStatus.toLowerCase()] = 0
                        allFilterInfo["!user status: "+userStatus.toLowerCase()] = 0
                    }
                    break
                }
            }
            // Continue Analyzing Affected Anime
            // Reset Anime Weights
            savedAnalyzedVariablesCount.all[anilistId] = 0
            savedAnalyzedVariablesCount.format[anilistId] = 0
            savedAnalyzedVariablesCount.genres[anilistId] = 0
            savedAnalyzedVariablesCount.tags[anilistId] = 0
            savedAnalyzedVariablesCount.studios[anilistId] = 0
            savedAnalyzedVariablesCount.staff[anilistId] = 0
            var analyzedVariableCount = {
                all: 0,
                format: 0,
                genres: 0,
                tags: 0,
                studios: 0,
                staff: 0
            }
            var genresIncluded = {}
            var tagsIncluded = {}
            var studiosIncluded = {}
            var staffIncluded = {}
            // Analyze
            var zformat = []
            if(varScheme.format[xformat]!==undefined) {
                zformat.push(varScheme.format[xformat])
            } else {
                zformat.push(varScheme.meanFormat-minNumber)
            }
            savedAnalyzedVariablesCount.format[anilistId] += 1
            savedAnalyzedVariablesCount.all[anilistId] += 1
            analyzedVariableCount.all += 1
            analyzedVariableCount.format += 1
            //
            var zgenres = []
            for(let j=0; j<xgenres.length; j++){
                savedAnalyzedVariablesCount.genres[anilistId] += 1
                savedAnalyzedVariablesCount.all[anilistId] += 1
                analyzedVariableCount.all += 1
                analyzedVariableCount.genres += 1
                if(varScheme.genres[xgenres[j]]!==undefined) {
                    zgenres.push(varScheme.genres[xgenres[j]])
                } else {
                    zgenres.push(varScheme.meanGenres-minNumber)
                }
                if(varScheme.genres[xgenres[j]]!==undefined) {
                    if(varScheme.genres[xgenres[j]]>=varScheme.meanGenres
                        &&genresIncluded[xgenres[j]]===undefined){
                        genresIncluded[xgenres[j]] = [xgenres[j].replace("Genre: ",""),varScheme.genres[xgenres[j]]]
                    }
                }
            }
            var ztags = []
            for(let j=0; j<xtags.length; j++){
                savedAnalyzedVariablesCount.tags[anilistId] += 1
                savedAnalyzedVariablesCount.all[anilistId] += 1
                analyzedVariableCount.all += 1
                analyzedVariableCount.tags += 1
                if(varScheme.tags[xtags[j].name]!==undefined && varScheme.categories[xtags[j].category]!==undefined){
                    if(xtags[j].rank>=50 || varScheme.tags[xtags[j].name]<varScheme.meanTags){
                        ztags.push(varScheme.tags[xtags[j].name])
                    } else {
                        ztags.push(varScheme.meanTags-minNumber)
                    }
                }
                if(varScheme.tags[xtags[j].name]!==undefined && xtags[j].rank>=50 && varScheme.categories[xtags[j].category]!==undefined){
                    if(varScheme.tags[xtags[j].name]>=varScheme.meanTags
                        &&tagsIncluded[xtags[j].name]===undefined){
                        tagsIncluded[xtags[j].name] = [xtags[j].name.replace("Tag: ",""),varScheme.tags[xtags[j].name]]
                    }
                }
            }
            var zstudios = []
            var includedStudio = {}
            for(let j=0; j<xstudios.length; j++){
                if(includedStudio[xstudios[j].name]!==undefined) continue
                else includedStudio[xstudios[j].name] = null
                savedAnalyzedVariablesCount.studios[anilistId] += 1
                savedAnalyzedVariablesCount.all[anilistId] += 1
                analyzedVariableCount.all += 1
                analyzedVariableCount.studios += 1
                if(varScheme.studios[xstudios[j].name]!==undefined){
                    zstudios.push(varScheme.studios[xstudios[j].name])
                } else {
                    zstudios.push(varScheme.meanStudios-minNumber)
                }
                if(varScheme.studios[xstudios[j].name]!==undefined) {
                    if(varScheme.studios[xstudios[j].name]>=varScheme.meanStudios
                        &&studiosIncluded[xstudios[j].name]===undefined){
                        studiosIncluded[xstudios[j].name] = [{[xstudios[j].name.replace("Studio: ","")]: xstudios[j].siteUrl},varScheme.studios[xstudios[j].name]]
                    }
                }
            }
            var zstaff = {}
            var includedStaff = {}
            for(let j=0; j<xstaff.length; j++){
                if(includedStaff[xstaff[j].staff+xstaff[j].role]!==undefined) continue
                else includedStaff[xstaff[j].staff+xstaff[j].role] = null
                savedAnalyzedVariablesCount.staff[anilistId] += 1
                savedAnalyzedVariablesCount.all[anilistId] += 1
                analyzedVariableCount.all += 1
                analyzedVariableCount.staff += 1
                if(varScheme.staff[xstaff[j].staff]!==undefined && varScheme.roles[xstaff[j].role]!==undefined){
                    if(zstaff[xstaff[j].role]===undefined){
                        zstaff[xstaff[j].role] = [varScheme.staff[xstaff[j].staff]]
                    } else {
                        zstaff[xstaff[j].role].push(varScheme.staff[xstaff[j].staff])
                    }
                } else {
                    if(zstaff[xstaff[j].role]===undefined){
                        zstaff[xstaff[j].role] = [varScheme.meanStaff-minNumber]
                    } else {
                        zstaff[xstaff[j].role].push(varScheme.meanStaff-minNumber)
                    }
                }
                if(varScheme.staff[xstaff[j].staff]!==undefined && varScheme.roles[xstaff[j].role]!==undefined) {
                    if(varScheme.staff[xstaff[j].staff]>=varScheme.meanStaff
                        &&staffIncluded[xstaff[j].staff]===undefined){
                        staffIncluded[xstaff[j].staff] = [{[xstaff[j].staff.replace("Staff",xstaff[j].role.replace("Role: ",""))]: xstaff[j].siteUrl},varScheme.staff[xstaff[j].staff]]
                    }
                }
            }
            // Original Scores
            // Anime Type
            var animeTypeOS = []
            if(zformat.length>0){
                animeTypeOS.push(arrayMean(zformat))
            }
            if(isaN(anime.episodes)&&varScheme.episodesModel!==undefined){
                var tempLRPredict = LRpredict(varScheme.episodesModel,anime.episodes)
                animeTypeOS.push(tempLRPredict)
            }
            if(isaN(anime.duration)&&varScheme.durationModel!==undefined){
                var tempLRPredict = LRpredict(varScheme.durationModel,anime.duration)
                animeTypeOS.push(tempLRPredict)
            }
            if(isaN(anime.seasonYear)&&varScheme.yearModel!==undefined){
                var tempLRPredict = LRpredict(varScheme.yearModel,anime.seasonYear)
                animeTypeOS.push(tempLRPredict)
            }
                // Average Score
            if(isaN(anime.averageScore)&&varScheme.averageScoreModel!==undefined){
                var tempLRPredict = LRpredict(varScheme.averageScoreModel,anime.averageScore)
                animeTypeOS.push(tempLRPredict)
            }
                // Popularity
            if(isaN(anime.trending)&&varScheme.trendingModel!==undefined){
                var tempLRPredict = LRpredict(varScheme.trendingModel,anime.trending)
                animeTypeOS.push(tempLRPredict)
            }
            if(isaN(anime.popularity)&&varScheme.popularityModel!==undefined){
                var tempLRPredict = LRpredict(varScheme.popularityModel,anime.popularity)
                animeTypeOS.push(tempLRPredict)
            }
            if(isaN(anime.favourites)&&varScheme.favouritesModel!==undefined){
                var tempLRPredict = LRpredict(varScheme.favouritesModel,anime.favourites)
                animeTypeOS.push(tempLRPredict)
            }
            // Anime Type
            var animeContentOS = []
            if(zgenres.length>0){
                animeContentOS.push(arrayMean(zgenres))
            }
            if(ztags.length>0){
                animeContentOS.push(arrayMean(ztags))
            }
            // Anime Production
            var animeProductionOS = []
            if(zstudios.length>0){
                animeProductionOS.push(arrayMean(zstudios))
            }
            var zstaffRolesArray = Object.values(zstaff)
            for(let i=0;i<zstaffRolesArray.length;i++){
                zstaffRolesArray[i] = arrayMean(zstaffRolesArray[i])
            }
            if(zstaffRolesArray.length>0){
                animeProductionOS.push(arrayMean(zstaffRolesArray))
            }
            // Scores
            var score = arrayMean([
                arrayMean(animeTypeOS),
                arrayMean(animeContentOS),
                arrayMean(animeProductionOS),
            ])
            var weightedScore = score
            // Low Average
            if(isaN(anime.averageScore)){
                if(anime.averageScore<averageScoreMode){
                    var AVmul = anime.averageScore*0.01
                    weightedScore = weightedScore*(AVmul>=1?1:AVmul)
                }
            }
            // Other Anime Recommendation Info
            genres = genres.length>0?genres.join(", "):"Genres: N/A"
            var tempTags = []
            for(let k=0; k<tags.length; k++){
                tempTags.push(tags[k].name)
            }
            tags = tempTags.length>0?tempTags.join(", "):"Tags: N/A"
            var xxstudios = {}
            for(let k=0; k<studios.length; k++){
                if(!studios[k].isAnimationStudio) continue
                xxstudios[studios[k].name] = studios[k].siteUrl
            }
            studios = studios.length>0? xxstudios : {}
            var xxstaff = {}
            for(let k=0; k<staff.length; k++){
                xxstaff[staff[k].node.name.userPreferred] = staff[k].node.siteUrl
            }
            staff = staff.length>0? xxstaff : {}
            genresIncluded = Object.values(genresIncluded)
                .sort((a,b)=>{
                    return b[1] - a[1]
                }) || []
            tagsIncluded = Object.values(tagsIncluded)
                .sort((a,b)=>{
                    return b[1] - a[1]
                }) || []
            studiosIncluded = Object.values(studiosIncluded)
                .sort((a,b)=>{
                    return b[1] - a[1]
                }) || []
            staffIncluded = Object.values(staffIncluded)
                .sort((a,b)=>{
                    return b[1] - a[1]
                }) || []
            const limit = 3
            var variablesIncluded = 
                genresIncluded.slice(0,limit)
                .concat(tagsIncluded.slice(0,limit))
                .concat(studiosIncluded.slice(0,limit))
                .concat(staffIncluded.slice(0,limit))
            // Sort Variable Influence
            variablesIncluded.sort((a,b)=>{
                return b[1] - a[1]
            })
            var tempVariablesIncluded = []
            for(let i=0;i<variablesIncluded.length;i++){
                tempVariablesIncluded.push(variablesIncluded[i][0])
            }
            const limitShown = 10
            variablesIncluded = tempVariablesIncluded.length>0?tempVariablesIncluded.slice(0,limitShown) : []
            savedRecScheme[anilistId] = {
                id: anilistId, title: title, animeUrl: animeUrl, score: score, weightedScore: weightedScore, 
                userStatus: userStatus, status: status, genres: genres, tags: tags, year: year, 
                season: season, format: format, studios: studios, staff: staff,
                variablesIncluded: variablesIncluded, analyzedVariableCount: analyzedVariableCount,
                popularity: anime.popularity,
            }
        }
        // Add Weight to Scores
        var analyzedVariableMean = arrayMean(Object.values(savedAnalyzedVariablesCount.all)) || 0
        var analyzedVariableSum = arraySum(Object.values(savedAnalyzedVariablesCount.all)) || 0
        var savedRecSchemeEntries = Object.keys(savedRecScheme)
        for(let i=0;i<savedRecSchemeEntries.length;i++){
            var anime = savedRecScheme[savedRecSchemeEntries[i]]
            if( (anime.analyzedVariableCount.all||0)<analyzedVariableMean
                ){
                savedRecScheme[savedRecSchemeEntries[i]].weightedScore = (
                    (anime.analyzedVariableCount.all||0)===0? (minNumber/analyzedVariableSum)*anime.weightedScore
                    : (anime.analyzedVariableCount.all/analyzedVariableSum)*anime.weightedScore                
                )
            } else if(anime.popularity<popularityMode) {
                savedRecScheme[savedRecSchemeEntries[i]].weightedScore = (
                    (anime.popularity||0)===0? (minNumber/popularitySum)*anime.weightedScore
                    : (anime.popularity/popularitySum)*anime.weightedScore
                )
            }
        }
    } else {
        for(let i=0; i<animeEntries.length; i++){
            var animeShallUpdate = false
            var anime = animeEntries[i]
            /////
            var title = anime.title.userPreferred
            var anilistId = anime.id
            var animeUrl = anime.siteUrl
            var format = anime.format
            var year = anime.seasonYear || "Year: N/A"
            var season = anime.season || "Season: N/A"
            var genres = anime.genres
            var tags = anime.tags
            var studios = anime.studios.nodes.filter((studio)=>{return studio.isAnimationStudio})
            var staff = anime.staff.edges
            var status = anime.status || "Status: N/A"
            var userStatus = "UNWATCHED"
            
            if(allFilterInfo["title: "+title.toLowerCase()]===undefined){
                allFilterInfo["title: "+title.toLowerCase()] = 0
            }
            if(allFilterInfo["format: "+format.toLowerCase()]===undefined&&allFilterInfo["!format: "+format.toLowerCase()]===undefined){
                allFilterInfo["format: "+format.toLowerCase()] = 0
                allFilterInfo["!format: "+format.toLowerCase()] = 0
            }
            if(allFilterInfo["year: "+year]===undefined&&allFilterInfo["year: "+year]===undefined){
                allFilterInfo["year: "+year] = 0  
                allFilterInfo[`!year: ${year}`] = 0
            }
            if(allFilterInfo["season: "+season.toLowerCase()]===undefined&&allFilterInfo["!season: "+season.toLowerCase()]===undefined){
                allFilterInfo["season: "+season.toLowerCase()] = 0
                allFilterInfo["!season: "+season.toLowerCase()] = 0
            }
            if(allFilterInfo["status: "+status.toLowerCase()]===undefined&&allFilterInfo["!status: "+status.toLowerCase()]===undefined){
                allFilterInfo["status: "+status.toLowerCase()] = 0
                allFilterInfo["!status: "+status.toLowerCase()] = 0
            }
            if(allFilterInfo["user status: "+userStatus.toLowerCase()]===undefined&&allFilterInfo["!user status: "+userStatus.toLowerCase()]===undefined){
                allFilterInfo["user status: "+userStatus.toLowerCase()] = 0
                allFilterInfo["!user status: "+userStatus.toLowerCase()] = 0
            }
            // Arrange
            for(let j=0; j<genres.length; j++){
                if(allFilterInfo["genre: "+genres[j].toLowerCase()]===undefined&&allFilterInfo["!genre: "+genres[j].toLowerCase()]===undefined){
                    allFilterInfo["genre: "+genres[j].toLowerCase()] = 0 
                    allFilterInfo["!genre: "+genres[j].toLowerCase()] = 0
                }
            }
            for(let j=0; j<tags.length; j++){
                if(allFilterInfo[("tag category: "+tags[j].category).toLowerCase()]===undefined&&allFilterInfo[("!tag category: "+tags[j].category).toLowerCase()]===undefined){
                    allFilterInfo["tag category: "+tags[j].category.toLowerCase()] = 0 
                    allFilterInfo["!tag category: "+tags[j].category.toLowerCase()] = 0
                }
                if(allFilterInfo[("tag: "+tags[j].name).toLowerCase()]===undefined&&allFilterInfo[("!tag: "+tags[j].name).toLowerCase()]===undefined){
                    allFilterInfo["tag: "+tags[j].name.toLowerCase()] = 0 
                    allFilterInfo["!tag: "+tags[j].name.toLowerCase()] = 0
                }
            }
            for(let j=0; j<studios.length; j++){
                // Should Remove Since It's Lagging on Too Much Filters
                if(allFilterInfo[("studio: "+studios[j].name).toLowerCase()]===undefined&&allFilterInfo[("!studio: "+studios[j].name).toLowerCase()]===undefined){
                    allFilterInfo["studio: "+studios[j].name.toLowerCase()] = 0  
                    allFilterInfo["!studio: "+studios[j].name.toLowerCase()] = 0
                }
            }
            for(let j=0; j<staff.length; j++){
                if(allFilterInfo[("staff role: "+staff[j].role.split(" (")[0]).toLowerCase()]===undefined&&allFilterInfo[("!staff role: "+staff[j].role.split(" (")[0]).toLowerCase()]===undefined){
                    allFilterInfo["staff role: "+staff[j].role.split(" (")[0].toLowerCase()] = 0
                    allFilterInfo["!staff role: "+staff[j].role.split(" (")[0].toLowerCase()] = 0
                }
                // Removed Since It's Lagging on Too Much Filters
                // if(allFilterInfo[("staff: "+staff[j].node.name.userPreferred).toLowerCase()]===undefined&&allFilterInfo[("!staff: "+staff[j].node.name.userPreferred).toLowerCase()]===undefined){
                //     allFilterInfo[("staff: "+staff[j].node.name.userPreferred).toLowerCase()] = 0
                //     allFilterInfo["!staff: "+(staff[j].node.name.userPreferred).toLowerCase()] = 0
                // }
            }
            // Continue Analyzing Affected Anime
            // Reset Anime Weights
            savedAnalyzedVariablesCount.all[anilistId] = 0
            savedAnalyzedVariablesCount.format[anilistId] = 0
            savedAnalyzedVariablesCount.genres[anilistId] = 0
            savedAnalyzedVariablesCount.tags[anilistId] = 0
            savedAnalyzedVariablesCount.studios[anilistId] = 0
            savedAnalyzedVariablesCount.staff[anilistId] = 0
            var analyzedVariableCount = {
                all: 0,
                format: 0,
                genres: 0,
                tags: 0,
                studios: 0,
                staff: 0
            }
            savedAnalyzedVariablesCount.format[anilistId] += 1
            savedAnalyzedVariablesCount.all[anilistId] += 1
            analyzedVariableCount.all += 1
            analyzedVariableCount.format += 1
            savedAnalyzedVariablesCount.genres[anilistId] += genres.length
            savedAnalyzedVariablesCount.all[anilistId] += genres.length
            analyzedVariableCount.all += genres.length
            analyzedVariableCount.genres += genres.length
            savedAnalyzedVariablesCount.tags[anilistId] += tags.length
            savedAnalyzedVariablesCount.all[anilistId] += tags.length
            analyzedVariableCount.all += tags.length
            analyzedVariableCount.tags += tags.length
            savedAnalyzedVariablesCount.studios[anilistId] += studios.length
            savedAnalyzedVariablesCount.all[anilistId] += studios.length
            analyzedVariableCount.all += studios.length
            analyzedVariableCount.studios += studios.length
            savedAnalyzedVariablesCount.staff[anilistId] += staff.length
            savedAnalyzedVariablesCount.all[anilistId] += staff.length
            analyzedVariableCount.all += staff.length
            analyzedVariableCount.staff += staff.length
            var score = weightedScore = 0
            if(anime.averageScore!==null&&anime.favourites!==null&&anime.popularity!==null&&anime.averageScore>0&&anime.favourites>0&&anime.popularity>0){
                var favOverpop = 1
                if(anime.favourites<anime.popularity) {
                    favOverpop = anime.favourites/anime.popularity
                }
                var AVmul = anime.averageScore*0.01
                score = weightedScore = (favOverpop)*(AVmul>=1?1:AVmul)
            }
            // Other Anime Recommendation Info
            genres = genres.length>0?genres.join(", "):"Genres: N/A"
            var tempTags = []
            for(let k=0; k<tags.length; k++){
                tempTags.push(tags[k].name)
            }
            tags = tempTags.length>0?tempTags.join(", "):"Tags: N/A"
            var xxstudios = {}
            for(let k=0; k<studios.length; k++){
                if(!studios[k].isAnimationStudio) continue
                xxstudios[studios[k].name] = studios[k].siteUrl
            }
            studios = studios.length>0? xxstudios : {}
            var xxstaff = {}
            for(let k=0; k<staff.length; k++){
                xxstaff[staff[k].node.name.userPreferred] = staff[k].node.siteUrl
            }
            staff = staff.length>0? xxstaff : {}
            variablesIncluded = []
            savedRecScheme[anilistId] = {
                id: anilistId, title: title, animeUrl: animeUrl, score: score, weightedScore: weightedScore, 
                userStatus: userStatus, status: status, genres: genres, tags: tags, year: year, 
                season: season, format: format, studios: studios, staff: staff,
                variablesIncluded: variablesIncluded, analyzedVariableCount: analyzedVariableCount,
                popularity: anime.popularity
            }
        }
        // Add Weight to Scores
        var analyzedVariableMean = arrayMean(Object.values(savedAnalyzedVariablesCount.all))
        var analyzedVariableSum = arraySum(Object.values(savedAnalyzedVariablesCount.all))
        var savedRecSchemeEntries = Object.keys(savedRecScheme)
        for(let i=0;i<savedRecSchemeEntries.length;i++){
            var anime = savedRecScheme[savedRecSchemeEntries[i]]
            if( (anime.analyzedVariableCount.all||0)<analyzedVariableMean
                ){
                savedRecScheme[savedRecSchemeEntries[i]].weightedScore = (
                    (anime.analyzedVariableCount.all||0)===0? (minNumber/analyzedVariableSum)*anime.weightedScore
                    : (anime.analyzedVariableCount.all/analyzedVariableSum)*anime.weightedScore                
                )
            } else if(anime.popularity<popularityMode) {
                savedRecScheme[savedRecSchemeEntries[i]].weightedScore = (
                    (anime.popularity||0)===0? (minNumber/popularitySum)*anime.weightedScore
                    : (anime.popularity/popularitySum)*anime.weightedScore
                )
            }
        }
    }
    self.postMessage({
        savedRecScheme: savedRecScheme,
        allFilterInfo: allFilterInfo
    })
    // Used Functions
    function isaN(num){
        if(num===null){return false}
        else if(typeof num==='string'){if(num.split(' ').join('').length===0){return false}}
        else if(typeof num==='boolean'){return false}
        else return !isNaN(num)
    }
    function jsonIsEmpty(obj){
        for(var i in obj) return false
        return true
    }
    function arraySum(obj) {
        return obj.reduce((a, b) => a + b, 0)
    }
    function arrayMean(obj) {
        return (arraySum(obj) / obj.length) || 0
    }
    function arrayMode(obj){
        if(obj.length===0){return}
        else if(obj.length===1){return obj[0]}
        else if(obj.length===2){return (obj[0]+obj[1])/2}
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
        var modPreFreq = classIs[modeIdx-1]===undefined?0:classIs[modeIdx-1].freq
        var modSucFreq = classIs[modeIdx+1]===undefined?0:classIs[modeIdx+1].freq
        return modLowLim+(((modFreq-modPreFreq)/((2*modFreq)-modPreFreq-modSucFreq))*classW)
    }
    // Linear Regression
    function LRpredict(modelObj, x){
        if(modelObj===undefined) return null
        if(modelObj.slope===undefined||modelObj.intercept===undefined) return null
        if(isNaN(modelObj.slope)||isNaN(modelObj.intercept)) return null
        return (parseFloat(modelObj.slope)*x)+parseFloat(modelObj.intercept)
    }
}