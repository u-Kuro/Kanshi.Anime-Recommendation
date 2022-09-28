self.onmessage = (message) => {
    var data = message.data
    var animeEntries = data.animeEntries
    var savedRecScheme = data.savedRecScheme
    var recSchemeIsNew = Object.keys(savedRecScheme).length===0?true:false
    var userListStatus = data.userListStatus
    var varImportance = data.varImportance
    var allFilterInfo = data.allFilterInfo
    var alteredVariables = data.alteredVariables
    var savedAnalyzedVariablesCount = data.savedAnalyzedVariablesCount || {}
    //
    for(let i=0; i<animeEntries.length; i++){
        var animeShallUpdate = false
        var anime = animeEntries[i]
        /////
        var title = anime.title.userPreferred || "Title: N/A"
        var animeUrl = anime.siteUrl
        // var type = anime.type || "N/A"
        var format = anime.format || "Format: N/A"
        if(alteredVariables.format_in["Format: "+format]!==undefined||recSchemeIsNew) animeShallUpdate=true
        var year = anime.seasonYear || "Year: N/A"
        if((alteredVariables.year_in["Year: "+year]!==undefined&&!animeShallUpdate)||recSchemeIsNew) animeShallUpdate=true
        var season = anime.season || "Season: N/A"
        if((alteredVariables.season_in["Season: "+season]!==undefined&&!animeShallUpdate)||recSchemeIsNew) animeShallUpdate=true
        var genres = anime.genres
        var tags = anime.tags
        var studios = anime.studios.nodes
        var staff = anime.staff.nodes
        var genresCount = genres.length
        var tagsCount = tags.length
        var studiosCount = studios.length
        var staffCount = staff.length
        var status = "UNWATCHED"
        if(allFilterInfo[title.toLowerCase()]===undefined){
            allFilterInfo[title.toLowerCase()] = true
        }
        if(allFilterInfo[format.toLowerCase()]===undefined){
            allFilterInfo[format.toLowerCase()] = true
            allFilterInfo["!"+format.toLowerCase()] = true
        }
        if(allFilterInfo[year]===undefined){
            allFilterInfo[year] = true  
            allFilterInfo[`!${year}`] = true
        }
        if(allFilterInfo[season.toLowerCase()]===undefined){
            allFilterInfo[season.toLowerCase()] = true
            allFilterInfo["!"+season.toLowerCase()] = true
        }
        // Arrange
        var xformat = format!=="Format: N/A"?`Format: ${format}`:`${Math.random()}`
        var xyear = year!=="Year: N/A"?"Year: "+year:`x${Math.random()}`
        var xseason = season!=="Season: N/A"?"Season: "+season:`${Math.random()}`
        var xgenres = []
        for(let j=0; j<genres.length; j++){
            if((alteredVariables.genres_in["Genre: "+genres[j]]!==undefined&&!animeShallUpdate)||recSchemeIsNew) {
                animeShallUpdate = true
            }
            xgenres.push("Genre: "+genres[j])
            if(allFilterInfo[genres[j].toLowerCase()]===undefined){
                allFilterInfo[genres[j].toLowerCase()] = true 
                allFilterInfo["!"+genres[j].toLowerCase()] = true
            }
        }
        var xtags = []
        for(let j=0; j<tags.length; j++){
            if((alteredVariables.tags_in["Tag: "+tags[j].name]!==undefined&&!animeShallUpdate)||recSchemeIsNew) {
                animeShallUpdate = true
            }
            xtags.push("Tag: "+tags[j].name)
            if(allFilterInfo[(tags[j].name).toLowerCase()]===undefined){
                allFilterInfo[(tags[j].name).toLowerCase()] = true 
                allFilterInfo["!"+(tags[j].name).toLowerCase()] = true
            }
        }
        var xstudios = []
        for(let j=0; j<studios.length; j++){
            if((alteredVariables.studios_in["Studio: "+studios[j].name]!==undefined&&!animeShallUpdate)||recSchemeIsNew) {
                animeShallUpdate = true
            }
            xstudios.push("Studio: "+studios[j].name)
            // Remove Since It's Lagging on Too Much Filters
            // if(allFilterInfo[(studios[j].name).toLowerCase()]===undefined){
            //     allFilterInfo[(studios[j].name).toLowerCase()] = true  
            //     allFilterInfo["!"+(studios[j].name).toLowerCase()] = true
            // }
        }
        var xstaff = []
        for(let j=0; j<staff.length; j++){
            if((alteredVariables.staff_in["Staff: "+staff[j].name.userPreferred]!==undefined&&!animeShallUpdate)||recSchemeIsNew) {
                animeShallUpdate = true
            }
            xstaff.push("Staff: "+staff[j].name.userPreferred)
            // Remove Since It's Lagging on Too Much Filters
            // if(allFilterInfo[(staff[j].name.userPreferred).toLowerCase()]===undefined){
            //     allFilterInfo[(staff[j].name.userPreferred).toLowerCase()] = true
            //     allFilterInfo["!"+(staff[j].name.userPreferred).toLowerCase()] = true
            // }
        }
        // Check if any variable is Altered, and continue
        if(!animeShallUpdate) continue
        // Continue Analyzing Affected Anime
        // Reset Anime Weights
        savedAnalyzedVariablesCount[title] = 0
        var analyzedVariableCount = 0
        var genresIncluded = {}
        var tagsIncluded = {}
        var studiosIncluded = {}
        var staffIncluded = {}
        // Analyze
        var zformat = []
        var zformatDense = []
        if(varImportance[xformat]!==undefined) {
            zformat.push(varImportance[xformat])
        }
        if(varImportance[xformat+"Dense"]!==undefined) {
            zformatDense.push(varImportance[xformat+"Dense"])
            savedAnalyzedVariablesCount[title] += 1
            analyzedVariableCount += 1
        }
        var zyear = []
        var zyearDense = []
        if(varImportance[xyear]!==undefined) {
            zyear.push(varImportance[xyear])
        }
        if(varImportance[xyear+"Dense"]!==undefined) {
            zyearDense.push(varImportance[xyear+"Dense"])
            savedAnalyzedVariablesCount[title] += 1
            analyzedVariableCount += 1
        }
        var zseason = []
        var zseasonDense = []
        if(varImportance[xseason]!==undefined) {
            zseason.push(varImportance[xseason])
        }
        if(varImportance[xseason+"Dense"]!==undefined) {
            zseasonDense.push(varImportance[xseason+"Dense"])
            savedAnalyzedVariablesCount[title] += 1
            analyzedVariableCount += 1
        }
        var zgenres = []
        var zgenresDense = []
        for(let j=0; j<xgenres.length; j++){
            if(varImportance[xgenres[j]]!==undefined) {
                zgenres.push(varImportance[xgenres[j]])
                if(varImportance[xgenres[j]]>=varImportance.meanGenres
                    &&genresIncluded[xgenres[j]]===undefined){
                    genresIncluded[xgenres[j]] = [xgenres[j].replace("Genre: ",""),varImportance[xgenres[j]]]
                }
            }
            if(varImportance[xgenres[j]+"Dense"]!==undefined) {
                savedAnalyzedVariablesCount[title] += 1
                analyzedVariableCount += 1
                zgenresDense.push(varImportance[xgenres[j]+"Dense"])
            }
        }
        var ztags = []
        var ztagsDense = []
        for(let j=0; j<xtags.length; j++){
            if(varImportance[xtags[j]]!==undefined) {
                ztags.push(varImportance[xtags[j]])
                if(varImportance[xtags[j]]>=varImportance.meanTags
                    &&tagsIncluded[xtags[j]]===undefined){
                    tagsIncluded[xtags[j]] = [xtags[j].replace("Tag: ",""),varImportance[xtags[j]]]
                }
            }
            if(varImportance[xtags[j]+"Dense"]!==undefined) {
                ztagsDense.push(varImportance[xtags[j]+"Dense"])
                savedAnalyzedVariablesCount[title] += 1
                analyzedVariableCount += 1
            }
        }
        var zstudios = []
        var zstudiosDense = []
        for(let j=0; j<xstudios.length; j++){
            if(varImportance[xstudios[j]]!==undefined) {
                zstudios.push(varImportance[xstudios[j]])
                if(varImportance[xstudios[j]]>=varImportance.meanStudios
                    &&studiosIncluded[xstudios[j]]===undefined){
                    studiosIncluded[xstudios[j]] = [{[xstudios[j].replace("Studio: ","")]: studios[j].siteUrl},varImportance[xstudios[j]]]
                }
            }
            if(varImportance[xstudios[j]+"Dense"]!==undefined) {
                zstudiosDense.push(varImportance[xstudios[j]+"Dense"])
                savedAnalyzedVariablesCount[title] += 1
                analyzedVariableCount += 1
            }
        }
        var zstaff = []
        var zstaffDense = []
        for(let j=0; j<xstaff.length; j++){
            if(varImportance[xstaff[j]]!==undefined) {
                zstaff.push(varImportance[xstaff[j]])
                if(varImportance[xstaff[j]]>=varImportance.meanStaff
                    &&staffIncluded[xstaff[j]]===undefined){
                    staffIncluded[xstaff[j]] = [{[xstaff[j].replace("Staff: ","")]: staff[j].siteUrl},varImportance[xstaff[j]]]
                }
            }
            if(varImportance[xstaff[j]+"Dense"]!==undefined) {
                zstaffDense.push(varImportance[xstaff[j]+"Dense"])
                savedAnalyzedVariablesCount[title] += 1
                analyzedVariableCount += 1
            }
        }
        // Original Scores
          // Categorical
        var categoricalOSArray = []
        if(zformat.length>0){
            categoricalOSArray.push(arrayMean(zformat))
        }
        if(zyear.length>0){
            categoricalOSArray.push(arrayMean(zyear))
        }
        if(zseason.length>0){
            categoricalOSArray.push(arrayMean(zseason))
        }
        if(zgenres.length>0){
            categoricalOSArray.push(arrayMean(zgenres))
        }
        if(ztags.length>0){
            categoricalOSArray.push(arrayMean(ztags))
        }
        if(zstudios.length>0){
            categoricalOSArray.push(arrayMean(zstudios))
        }
        if(zstaff.length>0){
            categoricalOSArray.push(arrayMean(zstaff))
        }
        // Weighted
          // Categorical
        var categoricalWSArray = []
        if(zformatDense.length>0){
            categoricalWSArray.push(arrayMean(zformatDense))
        }
        if(zyearDense.length>0){
            categoricalWSArray.push(arrayMean(zyearDense))
        }
        if(zseasonDense.length>0){
            categoricalWSArray.push(arrayMean(zseasonDense))
        }
        if(zgenresDense.length>0){
            categoricalWSArray.push(arrayMean(zgenresDense))
        }
        if(ztagsDense.length>0){
            categoricalWSArray.push(arrayMean(ztagsDense))
        }
        if(zstudiosDense.length>0){
            categoricalWSArray.push(arrayMean(zstudiosDense))
        }
        if(zstaffDense.length>0){
            categoricalWSArray.push(arrayMean(zstaffDense))
        }
        // Original Scores
          // Linear Models
        var modelsArray = []
            // Average Score
        if(!isNaN(anime.averageScore)&&varImportance.averageScoreModel!==undefined){
            modelsArray.push(LRpredict(varImportance.averageScoreModel,anime.averageScore))
        }
            // Anime Length
        if(!isNaN(anime.episodes)&&varImportance.episodesModel!==undefined){
            modelsArray.push(LRpredict(varImportance.episodesModel,anime.episodes))
        }
        if(!isNaN(anime.duration)&&varImportance.durationModel!==undefined){
            modelsArray.push(LRpredict(varImportance.durationModel,anime.duration))
        }
            // Popularity
        if(!isNaN(anime.trending)&&varImportance.trendingModel!==undefined){
            modelsArray.push(LRpredict(varImportance.trendingModel,anime.trending))
        }
        if(!isNaN(anime.popularity)&&varImportance.popularityModel!==undefined){
            modelsArray.push(LRpredict(varImportance.popularityModel,anime.popularity))
        }
        if(!isNaN(anime.favourites)&&varImportance.favouritesModel!==undefined){
            modelsArray.push(LRpredict(varImportance.favouritesModel,anime.favourites))
        }
          // Variable Count
        if(!isNaN(genresCount)&&varImportance.genresCountModel!==undefined){
            modelsArray.push(LRpredict(varImportance.genresCountModel,genresCount))
        }
        if(!isNaN(tagsCount)&&varImportance.tagsCountModel!==undefined){
            modelsArray.push(LRpredict(varImportance.tagsCountModel,tagsCount))
        }
        if(!isNaN(studiosCount)&&varImportance.studiosCountModel!==undefined){
            modelsArray.push(LRpredict(varImportance.studiosCountModel,studiosCount))
        }
        if(!isNaN(staffCount)&&varImportance.staffCountModel!==undefined){
            modelsArray.push(LRpredict(varImportance.staffCountModel,staffCount))
        }
            //
        // var modelsDenseArray = []
        // if(varImportance.episodesModelDense!==undefined){
        //     modelsDenseArray.push(zepisodes)
        // }
        // if(varImportance.durationModelDense!==undefined){
        //     modelsDenseArray.push(zduration)
        // }
        // if(varImportance.averageScoreModelDense!==undefined){
        //     modelsDenseArray.push(zaverageScore)
        // }
        // if(varImportance.trendingModelDense!==undefined){
        //     modelsDenseArray.push(ztrending)
        // }
        // if(varImportance.popularityModelDense!==undefined){
        //     modelsDenseArray.push(zpopularity)
        // }
        // if(varImportance.favouritesModelDense!==undefined){
        //     modelsDenseArray.push(zfavourites)
        // }
        // if(varImportance.genresCountModelDense!==undefined){
        //     modelsDenseArray.push(zgenresCount)
        // }
        // if(varImportance.tagsCountModelDense!==undefined){
        //     modelsDenseArray.push(ztagsCount)
        // }
        // if(varImportance.studiosCountModelDense!==undefined){
        //     modelsDenseArray.push(zstudiosCount)
        // }
        // if(varImportance.staffCountModelDense!==undefined){
        //     modelsDenseArray.push(zstaffCount)
        // }
        // zepisodes,zduration,zaverageScore,ztrending,zpopularity,zfavourites,
        // zgenresCount,ztagsCount,zstudiosCount,zstaffCount
        // Scores
        score = arrayMean(categoricalOSArray.concat(modelsArray))
        weightedScore = arrayMean(categoricalWSArray.concat(modelsArray))
        // Other Anime Recommendation Info
        for(let k=0; k<userListStatus.length; k++){
            if(userListStatus[k].title===title){
                status = userListStatus[k].status
                break
            }
        }
        genres = genres.length>0?genres.join(", "):"Genres: N/A"
        var tempTags = []
        for(let k=0; k<tags.length; k++){
            tempTags.push(tags[k].name)
        }
        tags = tempTags.length>0?tempTags.join(", "):"Tags: N/A"
        var xxstudios = {}
        for(let k=0; k<studios.length; k++){
            xxstudios[studios[k].name] = studios[k].siteUrl
        }
        studios = studios.length>0? xxstudios : {}
        var xxstaff = {}
        for(let k=0; k<staff.length; k++){
            xxstaff[staff[k].name.userPreferred] = staff[k].siteUrl
        }
        staff = staff.length>0? xxstaff : {}
        genresIncluded = Object.values(genresIncluded) || []
        tagsIncluded = Object.values(tagsIncluded) || []
        studiosIncluded = Object.values(studiosIncluded) || []
        staffIncluded = Object.values(staffIncluded) || []
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
        savedRecScheme[title] = {
            title: title, animeUrl: animeUrl, score: score, weightedScore: weightedScore, 
            status: status, genres: genres, tags: tags, year: year, 
            season: season, format: format, studios: studios, staff: staff,
            variablesIncluded: variablesIncluded, analyzedVariableCount: analyzedVariableCount,
        }
    }
    var savedRecSchemeEntries = Object.keys(savedRecScheme)
    var analyzedVariableSum = arraySum(Object.values(savedAnalyzedVariablesCount))
    var analyzedVariableMean = arrayMean(Object.values(savedAnalyzedVariablesCount))
    for(let i=0;i<savedRecSchemeEntries.length;i++){
        var anime = savedRecScheme[savedRecSchemeEntries[i]]
        if(anime.analyzedVariableCount<analyzedVariableMean){
            savedRecScheme[savedRecSchemeEntries[i]].weightedScore = (
                (anime.analyzedVariableCount/analyzedVariableSum)*anime.weightedScore
            )
        }
    }
    self.postMessage({
        savedRecScheme: savedRecScheme,
        allFilterInfo: allFilterInfo,
        savedAnalyzedVariablesCount: savedAnalyzedVariablesCount
    })
    //
    function arraySum(obj) {
        return obj.reduce((a, b) => a + b, 0)
    }
    function arrayMean(obj) {
        return (arraySum(obj) / obj.length) || 0
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
    function LRpredict(modelObj, x){
        if(modelObj===undefined) return null
        if(modelObj.slope===undefined||modelObj.intercept===undefined) return null
        if(isNaN(modelObj.slope)||isNaN(modelObj.intercept)) return null
        return (parseFloat(modelObj.slope)*x)+parseFloat(modelObj.intercept)
    }
    // function sortObj(obj,sort){
    //     let sortable = [];
    //     let newObj = {};
    //     for (var x in obj) {
    //         sortable.push([x, obj[x]]);
    //     }
    //     if("descending".includes(sort)){
    //         sortable.sort((a, b)=>{
    //             return b[1] - a[1];
    //         });
    //     } else {
    //         sortable.sort((a, b)=>{
    //             return a[1] - b[1];
    //         });
    //     }
    //     sortable.forEach(([k,v])=>{newObj[k] = v}})
    //     return newObj
    // }
}