self.onmessage = (message) => {
    const minNumber = 1-6e-17!==1? 6e-17 : 1e-16 // Min Value Javascript
    var data = message.data
    var animeEntries = data.animeEntries
    var savedRecScheme = data.savedRecScheme
    var recSchemeIsNew = Object.keys(savedRecScheme).length===0?true:false
    var userListStatus = data.userListStatus
    var varImportance = data.varImportance
    var allFilterInfo = data.allFilterInfo
    var alteredVariables = data.alteredVariables
    var savedAnalyzedVariablesCount = data.savedAnalyzedVariablesCount || {}
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
    //    
    if(!jsonIsEmpty(varImportance)){
        for(let i=0; i<animeEntries.length; i++){
            var animeShallUpdate = false
            var anime = animeEntries[i]
            /////
            var title = anime.title.userPreferred || "Title: N/A"
            var anilistId = anime.id
            var animeUrl = anime.siteUrl
            // var type = anime.type || "N/A"
            var format = anime.format || "Format: N/A"
            if(alteredVariables.format_in["Format: "+format]!==undefined||recSchemeIsNew) animeShallUpdate=true
            var year = anime.seasonYear || "Year: N/A"
            var season = anime.season || "Season: N/A"
            var genres = anime.genres
            var tags = anime.tags
            var studios = anime.studios.nodes.filter((studio)=>{return studio.isAnimationStudio})
            //
            var staff = anime.staff.edges
            var status = anime.status || "Status: N/A"
            var userStatus = "UNWATCHED"
            if(allFilterInfo[title.toLowerCase()]===undefined){
                allFilterInfo[title.toLowerCase()] = 0
            }
            if(allFilterInfo[format.toLowerCase()]===undefined){
                allFilterInfo[format.toLowerCase()] = 0
                allFilterInfo["!"+format.toLowerCase()] = 0
            }
            if(allFilterInfo[year]===undefined){
                allFilterInfo[year] = 0  
                allFilterInfo[`!${year}`] = 0
            }
            if(allFilterInfo[season.toLowerCase()]===undefined){
                allFilterInfo[season.toLowerCase()] = 0
                allFilterInfo["!"+season.toLowerCase()] = 0
            }
            if(allFilterInfo[status.toLowerCase()]===undefined){
                allFilterInfo[status.toLowerCase()] = 0
                allFilterInfo["!"+status.toLowerCase()] = 0
            }
            // Arrange
            var xformat = format!=="Format: N/A"?`Format: ${format}`:`${Math.random()}`
            var xgenres = []
            for(let j=0; j<genres.length; j++){
                if((alteredVariables.genres_in["Genre: "+genres[j]]!==undefined&&!animeShallUpdate)||recSchemeIsNew) {
                    animeShallUpdate = true
                }
                xgenres.push("Genre: "+genres[j])
                if(allFilterInfo[genres[j].toLowerCase()]===undefined){
                    allFilterInfo[genres[j].toLowerCase()] = 0 
                    allFilterInfo["!"+genres[j].toLowerCase()] = 0
                }
            }
            var xtags = []
            for(let j=0; j<tags.length; j++){
                if((alteredVariables.tags_in["Tag: "+tags[j].name]!==undefined&&!animeShallUpdate)||recSchemeIsNew) {
                    animeShallUpdate = true
                }
                xtags.push({name:"Tag: "+tags[j].name,rank:tags[j].rank})
                if(allFilterInfo[(tags[j].name).toLowerCase()]===undefined){
                    allFilterInfo[(tags[j].name).toLowerCase()] = 0 
                    allFilterInfo["!"+(tags[j].name).toLowerCase()] = 0
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
                // Removed Since It's Lagging on Too Much Filters
                // if(allFilterInfo[(studios[j].name).toLowerCase()]===undefined){
                //     allFilterInfo[(studios[j].name).toLowerCase()] = 0  
                //     allFilterInfo["!"+(studios[j].name).toLowerCase()] = 0
                // }
            }
            var xstaff = []
            var includedStaff = {}
            for(let j=0; j<staff.length; j++){
                if(includedStaff[staff[j].node.name.userPreferred]!==undefined) continue
                else includedStaff[staff[j].node.name.userPreferred] = null
                if((alteredVariables.staff_in["Staff: "+staff[j].node.name.userPreferred]!==undefined&&!animeShallUpdate)||recSchemeIsNew) {
                    animeShallUpdate = true
                }
                xstaff.push({staff:"Staff: "+staff[j].node.name.userPreferred, role:staff[j].role.split(" (")[0], siteUrl:staff[j].node.siteUrl})
                // Removed Since It's Lagging on Too Much Filters
                // if(allFilterInfo[(staff[j].name.userPreferred).toLowerCase()]===undefined){
                //     allFilterInfo[(staff[j].name.userPreferred).toLowerCase()] = 0
                //     allFilterInfo["!"+(staff[j].name.userPreferred).toLowerCase()] = 0
                // }
            }
            // Check if any variable is Altered, and continue
            if(!animeShallUpdate) continue
            // Check Status
            for(let k=0; k<userListStatus.length; k++){
                if(userListStatus[k].id===anilistId && userListStatus[k].id!==null && userListStatus[k].status!==null){
                    userStatus = userListStatus[k].status
                    if(allFilterInfo[userStatus.toLowerCase()]===undefined){
                        allFilterInfo[userStatus.toLowerCase()] = 0
                        allFilterInfo["!"+userStatus.toLowerCase()] = 0
                    }
                    break
                }
            }
            // Continue Analyzing Affected Anime
            // Reset Anime Weights
            if(savedAnalyzedVariablesCount.all===undefined){
                savedAnalyzedVariablesCount.all = {}    
            }
            savedAnalyzedVariablesCount.all[anilistId] = 0
            if(savedAnalyzedVariablesCount.format===undefined){
                savedAnalyzedVariablesCount.format = {}    
            }
            savedAnalyzedVariablesCount.format[anilistId] = 0
            if(savedAnalyzedVariablesCount.genres===undefined){
                savedAnalyzedVariablesCount.genres = {}    
            }
            savedAnalyzedVariablesCount.genres[anilistId] = 0
            if(savedAnalyzedVariablesCount.tags===undefined){
                savedAnalyzedVariablesCount.tags = {}    
            }
            savedAnalyzedVariablesCount.tags[anilistId] = 0
            if(savedAnalyzedVariablesCount.studios===undefined){
                savedAnalyzedVariablesCount.studios = {}    
            }
            savedAnalyzedVariablesCount.studios[anilistId] = 0
            if(savedAnalyzedVariablesCount.staff===undefined){
                savedAnalyzedVariablesCount.staff = {}    
            }
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
            var zformatMin = []
            if(varImportance[xformat]!==undefined) {
                zformatMin.push(varImportance[xformat])
            } else {
                zformatMin.push(varImportance.meanFormat-minNumber)
            }
            savedAnalyzedVariablesCount.format[anilistId] += 1
            savedAnalyzedVariablesCount.all[anilistId] += 1
            analyzedVariableCount.all += 1
            analyzedVariableCount.format += 1
            //
            var zgenresMin = []
            for(let j=0; j<xgenres.length; j++){
                savedAnalyzedVariablesCount.genres[anilistId] += 1
                savedAnalyzedVariablesCount.all[anilistId] += 1
                analyzedVariableCount.all += 1
                analyzedVariableCount.genres += 1
                if(varImportance[xgenres[j]]!==undefined) {
                    zgenresMin.push(varImportance[xgenres[j]])
                } else {
                    zgenresMin.push(varImportance.meanGenres-minNumber)
                }
                if(varImportance[xgenres[j]]!==undefined) {
                    if(varImportance[xgenres[j]]>=varImportance.meanGenres
                        &&genresIncluded[xgenres[j]]===undefined){
                        genresIncluded[xgenres[j]] = [xgenres[j].replace("Genre: ",""),varImportance[xgenres[j]]]
                    }
                }
            }
            var ztagsMin = []
            for(let j=0; j<xtags.length; j++){
                savedAnalyzedVariablesCount.tags[anilistId] += 1
                savedAnalyzedVariablesCount.all[anilistId] += 1
                analyzedVariableCount.all += 1
                analyzedVariableCount.tags += 1
                if(varImportance[xtags[j].name]!==undefined){
                    if(xtags[j].rank>=50 || varImportance[xtags[j].name]<varImportance.meanTags){
                        ztagsMin.push(varImportance[xtags[j].name])
                    } else {
                        ztagsMin.push(varImportance.meanTags-minNumber)
                    }
                }
                if(varImportance[xtags[j].name]!==undefined && xtags[j].rank>=50){
                    if(varImportance[xtags[j].name]>=varImportance.meanTags
                        &&tagsIncluded[xtags[j].name]===undefined){
                        tagsIncluded[xtags[j].name] = [xtags[j].name.replace("Tag: ",""),varImportance[xtags[j].name]]
                    }
                }
            }
            var zstudiosMin = []
            var includedStudio = {}
            for(let j=0; j<xstudios.length; j++){
                if(includedStudio[xstudios[j].name]!==undefined) continue
                else includedStudio[xstudios[j].name] = null
                savedAnalyzedVariablesCount.studios[anilistId] += 1
                savedAnalyzedVariablesCount.all[anilistId] += 1
                analyzedVariableCount.all += 1
                analyzedVariableCount.studios += 1
                if(varImportance[xstudios[j].name]!==undefined){
                    zstudiosMin.push(varImportance[xstudios[j].name])
                } else {
                    zstudiosMin.push(varImportance.meanStudios-minNumber)
                }
                if(varImportance[xstudios[j].name]!==undefined) {
                    if(varImportance[xstudios[j].name]>=varImportance.meanStudios
                        &&studiosIncluded[xstudios[j].name]===undefined){
                        studiosIncluded[xstudios[j].name] = [{[xstudios[j].name.replace("Studio: ","")]: xstudios[j].siteUrl},varImportance[xstudios[j].name]]
                    }
                }
            }
            var zstaffMin = {}
            var includedStaff = {}
            for(let j=0; j<xstaff.length; j++){
                if(includedStaff[xstaff[j].staff+xstaff[j].role]!==undefined) continue
                else includedStaff[xstaff[j].staff+xstaff[j].role] = null
                savedAnalyzedVariablesCount.staff[anilistId] += 1
                savedAnalyzedVariablesCount.all[anilistId] += 1
                analyzedVariableCount.all += 1
                analyzedVariableCount.staff += 1
                if(varImportance[xstaff[j].staff]!==undefined){
                    if(zstaffMin[xstaff[j].role]===undefined){
                        zstaffMin[xstaff[j].role] = [varImportance[xstaff[j].staff]]
                    } else {
                        zstaffMin[xstaff[j].role].push(varImportance[xstaff[j].staff])
                    }
                } else {
                    if(zstaffMin[xstaff[j].role]===undefined){
                        zstaffMin[xstaff[j].role] = [varImportance.meanStaff-minNumber]
                    } else {
                        zstaffMin[xstaff[j].role].push(varImportance.meanStaff-minNumber)
                    }
                }
                if(varImportance[xstaff[j].staff]!==undefined) {
                    if(varImportance[xstaff[j].staff]>=varImportance.meanStaff
                        &&staffIncluded[xstaff[j].staff]===undefined){
                        staffIncluded[xstaff[j].staff] = [{[xstaff[j].staff.replace("Staff",xstaff[j].role)]: xstaff[j].siteUrl},varImportance[xstaff[j].staff]]
                    }
                }
            }
            // Original Scores
            // Anime Type
            var animeTypeOSMin = []
            if(zformatMin.length>0){
                animeTypeOSMin.push(arrayMean(zformatMin))
            }
            if(isaN(anime.episodes)&&varImportance.episodesModel!==undefined){
                var tempLRPredict = LRpredict(varImportance.episodesModel,anime.episodes)
                animeTypeOSMin.push(tempLRPredict)
            }
            if(isaN(anime.duration)&&varImportance.durationModel!==undefined){
                var tempLRPredict = LRpredict(varImportance.durationModel,anime.duration)
                animeTypeOSMin.push(tempLRPredict)
            }
            if(isaN(anime.seasonYear)&&varImportance.yearModel!==undefined){
                var tempLRPredict = LRpredict(varImportance.yearModel,anime.seasonYear)
                animeTypeOSMin.push(tempLRPredict)
            }
                // Average Score
            if(isaN(anime.averageScore)&&varImportance.averageScoreModel!==undefined){
                var tempLRPredict = LRpredict(varImportance.averageScoreModel,anime.averageScore)
                animeTypeOSMin.push(tempLRPredict)
            }
                // Popularity
            if(isaN(anime.trending)&&varImportance.trendingModel!==undefined){
                var tempLRPredict = LRpredict(varImportance.trendingModel,anime.trending)
                animeTypeOSMin.push(tempLRPredict)
            }
            if(isaN(anime.popularity)&&varImportance.popularityModel!==undefined){
                var tempLRPredict = LRpredict(varImportance.popularityModel,anime.popularity)
                animeTypeOSMin.push(tempLRPredict)
            }
            if(isaN(anime.favourites)&&varImportance.favouritesModel!==undefined){
                var tempLRPredict = LRpredict(varImportance.favouritesModel,anime.favourites)
                animeTypeOSMin.push(tempLRPredict)
            }
            // Anime Type
            var animeContentOSMin = []
            if(zgenresMin.length>0){
                animeContentOSMin.push(arrayMean(zgenresMin))
            }
            if(ztagsMin.length>0){
            
            }
            // Anime Production
            var animeProductionOSMin = []
            if(zstudiosMin.length>0){
                animeProductionOSMin.push(arrayMean(zstudiosMin))
            }
            var zstaffRolesArrayMin = Object.values(zstaffMin)
            for(let i=0;i<zstaffRolesArrayMin.length;i++){
                zstaffRolesArrayMin[i] = arrayMean(zstaffRolesArrayMin[i])
            }
            if(zstaffRolesArrayMin.length>0){
                animeProductionOSMin.push(arrayMean(zstaffRolesArrayMin))
            }
            // Scores
            var score = arrayMean([
                arrayMean(animeTypeOSMin),
                arrayMean(animeContentOSMin),
                arrayMean(animeProductionOSMin),
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
            // del
            var studios = anime.studios.nodes.filter((studio)=>{return studio.isAnimationStudio})
            //
            var staff = anime.staff.edges
            var status = anime.status || "Status: N/A"
            var userStatus = "UNWATCHED"
            if(allFilterInfo[title.toLowerCase()]===undefined){
                allFilterInfo[title.toLowerCase()] = 0
            }
            if(allFilterInfo[format.toLowerCase()]===undefined){
                allFilterInfo[format.toLowerCase()] = 0
                allFilterInfo["!"+format.toLowerCase()] = 0
            }
            if(allFilterInfo[year]===undefined){
                allFilterInfo[year] = 0  
                allFilterInfo[`!${year}`] = 0
            }
            if(allFilterInfo[season.toLowerCase()]===undefined){
                allFilterInfo[season.toLowerCase()] = 0
                allFilterInfo["!"+season.toLowerCase()] = 0
            }
            if(allFilterInfo[status.toLowerCase()]===undefined){
                allFilterInfo[status.toLowerCase()] = 0
                allFilterInfo["!"+status.toLowerCase()] = 0
            }
            if(allFilterInfo[userStatus.toLowerCase()]===undefined){
                allFilterInfo[userStatus.toLowerCase()] = 0
                allFilterInfo["!"+userStatus.toLowerCase()] = 0
            }
            // Arrange
            for(let j=0; j<genres.length; j++){
                if(allFilterInfo[genres[j].toLowerCase()]===undefined){
                    allFilterInfo[genres[j].toLowerCase()] = 0 
                    allFilterInfo["!"+genres[j].toLowerCase()] = 0
                }
            }
            for(let j=0; j<tags.length; j++){
                if(allFilterInfo[(tags[j].name).toLowerCase()]===undefined){
                    allFilterInfo[(tags[j].name).toLowerCase()] = 0 
                    allFilterInfo["!"+(tags[j].name).toLowerCase()] = 0
                }
            }
            //
            // Continue Analyzing Affected Anime
            // Reset Anime Weights
            if(savedAnalyzedVariablesCount.all===undefined){
                savedAnalyzedVariablesCount.all = {}    
            }
            savedAnalyzedVariablesCount.all[anilistId] = 0
            if(savedAnalyzedVariablesCount.format===undefined){
                savedAnalyzedVariablesCount.format = {}    
            }
            savedAnalyzedVariablesCount.format[anilistId] = 0
            if(savedAnalyzedVariablesCount.genres===undefined){
                savedAnalyzedVariablesCount.genres = {}    
            }
            savedAnalyzedVariablesCount.genres[anilistId] = 0
            if(savedAnalyzedVariablesCount.tags===undefined){
                savedAnalyzedVariablesCount.tags = {}    
            }
            savedAnalyzedVariablesCount.tags[anilistId] = 0
            if(savedAnalyzedVariablesCount.studios===undefined){
                savedAnalyzedVariablesCount.studios = {}    
            }
            savedAnalyzedVariablesCount.studios[anilistId] = 0
            if(savedAnalyzedVariablesCount.staff===undefined){
                savedAnalyzedVariablesCount.staff = {}    
            }
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
        allFilterInfo: allFilterInfo,
        savedAnalyzedVariablesCount: savedAnalyzedVariablesCount
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