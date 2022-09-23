self.onmessage = (message) => {
    var data = message.data
    var animeEntries = data.animeEntries
    var savedRecScheme = data.savedRecScheme
    var recSchemeIsNew = Object.keys(savedRecScheme).length===0?true:false
    var userListStatus = data.userListStatus
    var varImportance = data.varImportance
    var allFilterInfo = data.allFilterInfo
    var alteredVariables = data.alteredVariables
    //
    for(let i=0; i<animeEntries.length; i++){
        var animeShallUpdate = false
        var anime = animeEntries[i]
        /////
        var title = anime.title.userPreferred || "Title: N/A"
        var animeUrl = anime.siteUrl
        // var type = anime.type || "N/A"
        var format = anime.format || "Format: N/A"
        if(alteredVariables.format_in["Format: "+format]===undefined&&!recSchemeIsNew) continue
        var year = anime.seasonYear || "Year: N/A"
        if(alteredVariables.year_in["Year: "+year]===undefined&&!recSchemeIsNew) continue
        var season = anime.season || "Season: N/A"
        if(alteredVariables.season_in["Season: "+season]===undefined&&!recSchemeIsNew) continue
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
        var score = []
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
        if(!animeShallUpdate) continue
        var xtags = []
        for(let j=0; j<tags.length; j++){
            if((alteredVariables.tags_in["Tag: "+tags[j].name]===undefined&&!animeShallUpdate)||recSchemeIsNew) {
                animeShallUpdate = true
            }
            xtags.push("Tag: "+tags[j].name)
            if(allFilterInfo[(tags[j].name).toLowerCase()]===undefined){
                allFilterInfo[(tags[j].name).toLowerCase()] = true 
                allFilterInfo["!"+(tags[j].name).toLowerCase()] = true
            }
        }
        if(!animeShallUpdate) continue
        var xstudios = []
        for(let j=0; j<studios.length; j++){
            if((alteredVariables.studios_in["Studio: "+studios[j].name]!==undefined&&!animeShallUpdate)||recSchemeIsNew) {
                animeShallUpdate = true
            }
            xstudios.push("Studio: "+studios[j].name)
            if(allFilterInfo[(studios[j].name).toLowerCase()]===undefined){
                allFilterInfo[(studios[j].name).toLowerCase()] = true  
                allFilterInfo["!"+(studios[j].name).toLowerCase()] = true
            }
        }
        if(!animeShallUpdate) continue
        var xstaff = []
        for(let j=0; j<staff.length; j++){
            if((alteredVariables.staff_in["Staff: "+staff[j].name.userPreferred]!==undefined&&!animeShallUpdate)||recSchemeIsNew) {
                animeShallUpdate = true
            }
            xstaff.push("Staff: "+staff[j].name.userPreferred)
            if(allFilterInfo[(staff[j].name.userPreferred).toLowerCase()]===undefined){
                allFilterInfo[(staff[j].name.userPreferred).toLowerCase()] = true
                allFilterInfo["!"+(staff[j].name.userPreferred).toLowerCase()] = true
            }
        }
        if(!animeShallUpdate) continue
        // Add to Show Variable Influence
        var genresIncluded = {}
        var tagsIncluded = {}
        var studiosIncluded = {}
        var staffIncluded = {}
        // Analyze
        var zformat = []
        if(varImportance[xformat]!==undefined) {
            zformat.push(varImportance[xformat])
        }
        var zyear = []
        if(varImportance[xyear]!==undefined) {
            zyear.push(varImportance[xyear])
        }
        var zseason = []
        if(varImportance[xseason]!==undefined) {
            zseason.push(varImportance[xseason])
        }
        var zgenres = []
        for(let j=0; j<xgenres.length; j++){
            if(varImportance[xgenres[j]]!==undefined) {
                zgenres.push(varImportance[xgenres[j]])
                if(varImportance[xgenres[j]]>=varImportance.meanGenres
                    &&genresIncluded[xgenres[j]]===undefined){
                    genresIncluded[xgenres[j]] = [xgenres[j].replace("Genre: ",""),varImportance[xgenres[j]]]
                }
            }
        }
        var ztags = []
        for(let j=0; j<xtags.length; j++){
            if(varImportance[xtags[j]]!==undefined) {
                ztags.push(varImportance[xtags[j]])
                if(varImportance[xtags[j]]>=varImportance.meanTags
                    &&tagsIncluded[xtags[j]]===undefined){
                    tagsIncluded[xtags[j]] = [xtags[j].replace("Tag: ",""),varImportance[xtags[j]]]
                }
            }
        }
        var zstudios = []
        for(let j=0; j<xstudios.length; j++){
            if(varImportance[xstudios[j]]!==undefined) {
                zstudios.push(varImportance[xstudios[j]])
                if(varImportance[xstudios[j]]>=varImportance.meanStudios
                    &&studiosIncluded[xstudios[j]]===undefined){
                    studiosIncluded[xstudios[j]] = [{[xstudios[j].replace("Studio: ","")]: studios[j].siteUrl},varImportance[xstudios[j]]]
                }
            }
        }
        var zstaff = []
        for(let j=0; j<xstaff.length; j++){
            if(varImportance[xstaff[j]]!==undefined) {
                zstaff.push(varImportance[xstaff[j]])
                if(varImportance[xseason]>=varImportance.meanStaff
                    &&staffIncluded[xstaff[j]]===undefined){
                    staffIncluded[xstaff[j]] = [{[xstaff[j].replace("Staff: ","")]: staff[j].siteUrl},varImportance[xstaff[j]]]
                }
            }
        }
        zformat = zformat.length===0?0:arrayMean(zformat)
        zyear = zyear.length===0?0:arrayMean(zyear)
        zseason = zseason.length===0?0:arrayMean(zseason)
        zgenres = zgenres.length===0?0:arrayMean(zgenres)
        ztags = ztags.length===0?0:arrayMean(ztags)
        zstaff = zstaff.length===0?0:arrayMean(zstaff)
        // Linear Models
        var zepisodes = anime.episodes===null?0:LRpredict(varImportance.episodesModel,anime.episodes)
        var zduration = anime.duration===null?0:LRpredict(varImportance.durationModel,anime.duration)
        var zaverageScore = anime.averageScore===null?0:LRpredict(varImportance.averageScoreModel,anime.averageScore)
        var ztrending = anime.trending===null?0:LRpredict(varImportance.trendingModel,anime.trending)
        var zpopularity = anime.popularity===null?0:LRpredict(varImportance.popularityModel,anime.popularity)
        var zfavourites = anime.favourites===null?0:LRpredict(varImportance.favouritesModel,anime.favourites)
          // Variable Count
        var zgenresCount = anime.genresCount===null?0:LRpredict(varImportance.genresCountModel,genresCount)
        var ztagsCount = anime.tagsCount===null?0:LRpredict(varImportance.tagsCountModel,tagsCount)
        var zstudiosCount = anime.studiosCount===null?0:LRpredict(varImportance.studiosCountModel,studiosCount)
        var zstaffCount = anime.staffCount===null?0:LRpredict(varImportance.staffCountModel,staffCount)
        score = arrayMean([
            zformat,zyear,zseason,zgenres,ztags,zstaff,
            zepisodes,zduration,zaverageScore,ztrending,zpopularity,zfavourites,
            zgenresCount,ztagsCount,zstudiosCount,zstaffCount
        ])
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
        var xxstaff = []
        for(let k=0; k<staff.length; k++){
            xxstaff[staff[k].name.userPreferred] = staff[k].siteUrl
        }
        staff = staff.length>0? xxstaff : {}
        // Limit Variables
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
            title: title, animeUrl: animeUrl, score: score,
            status: status, genres: genres, tags: tags, year: year, 
            season: season, format: format, studios: studios, staff: staff,
            variablesIncluded: variablesIncluded
        }
    }
    // Clean Analyzed Recommendations
    var savedRecSchemeEntries = Object.keys(savedRecScheme)
    for(let i=0;i<savedRecSchemeEntries.length;i++){
        var anime = savedRecScheme[savedRecSchemeEntries[i]]
        savedRecScheme[savedRecSchemeEntries[i]].score=anime.score
    }
    self.postMessage({
        savedRecScheme: savedRecScheme,
        allFilterInfo: allFilterInfo
    })
    //
    function arraySum(obj) {
        return obj.reduce((a, b) => a + b, 0)
    }
    function arrayMean(obj) {
        return (arraySum(obj) / obj.length) || 0
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