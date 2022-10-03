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
        // del
        var studios = anime.studios.nodes.filter((studio)=>{return studio.isAnimationStudio})
        //
        var staff = anime.staff.edges
        // var genresCount = genres.length
        // var tagsCount = tags.length
        // var studiosCount = studios.length
        // var staffCount = staff.length
        var status = "UNWATCHED"
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
                allFilterInfo[genres[j].toLowerCase()] = 0 
                allFilterInfo["!"+genres[j].toLowerCase()] = 0
            }
        }
        var xtags = []
        for(let j=0; j<tags.length; j++){
            if((alteredVariables.tags_in["Tag: "+tags[j].name]!==undefined&&!animeShallUpdate)||recSchemeIsNew) {
                animeShallUpdate = true
            }
            xtags.push("Tag: "+tags[j].name)
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
            // Remove Since It's Lagging on Too Much Filters
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
            // Remove Since It's Lagging on Too Much Filters
            // if(allFilterInfo[(staff[j].name.userPreferred).toLowerCase()]===undefined){
            //     allFilterInfo[(staff[j].name.userPreferred).toLowerCase()] = 0
            //     allFilterInfo["!"+(staff[j].name.userPreferred).toLowerCase()] = 0
            // }
        }
        // Check if any variable is Altered, and continue
        if(!animeShallUpdate) continue
        // Continue Analyzing Affected Anime
        // Reset Anime Weights
        if(savedAnalyzedVariablesCount.all===undefined){
            savedAnalyzedVariablesCount.all = {}    
        }
        savedAnalyzedVariablesCount.all[title] = 0
        if(savedAnalyzedVariablesCount.format===undefined){
            savedAnalyzedVariablesCount.format = {}    
        }
        savedAnalyzedVariablesCount.format[title] = 0
        if(savedAnalyzedVariablesCount.season===undefined){
            savedAnalyzedVariablesCount.season = {}    
        }
        savedAnalyzedVariablesCount.season[title] = 0
        if(savedAnalyzedVariablesCount.year===undefined){
            savedAnalyzedVariablesCount.year = {}    
        }
        savedAnalyzedVariablesCount.year[title] = 0
        if(savedAnalyzedVariablesCount.genres===undefined){
            savedAnalyzedVariablesCount.genres = {}    
        }
        savedAnalyzedVariablesCount.genres[title] = 0
        if(savedAnalyzedVariablesCount.tags===undefined){
            savedAnalyzedVariablesCount.tags = {}    
        }
        savedAnalyzedVariablesCount.tags[title] = 0
        if(savedAnalyzedVariablesCount.studios===undefined){
            savedAnalyzedVariablesCount.studios = {}    
        }
        savedAnalyzedVariablesCount.studios[title] = 0
        if(savedAnalyzedVariablesCount.staff===undefined){
            savedAnalyzedVariablesCount.staff = {}    
        }
        savedAnalyzedVariablesCount.staff[title] = 0
        var analyzedVariableCount = {
            format: 0,
            season: 0,
            year: 0,
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
        if(varImportance[xformat]!==undefined) {
            zformat.push(varImportance[xformat])
            savedAnalyzedVariablesCount.format[title] += 1
            savedAnalyzedVariablesCount.all[title] += 1
            analyzedVariableCount.format += 1
        } else {
            zformat.push(0)
        }
        var zyear = []
        if(varImportance[xyear]!==undefined) {
            zyear.push(varImportance[xyear])
            savedAnalyzedVariablesCount.year[title] += 1
            savedAnalyzedVariablesCount.all[title] += 1
            analyzedVariableCount.year += 1
        } else {
            zyear.push(0)
        }
        var zseason = []
        if(varImportance[xseason]!==undefined) {
            zseason.push(varImportance[xseason])
            savedAnalyzedVariablesCount.season[title] += 1
            savedAnalyzedVariablesCount.all[title] += 1
            analyzedVariableCount.season += 1
        } else {
            zseason.push(0)
        }
        var zgenres = []
        for(let j=0; j<xgenres.length; j++){
            if(varImportance[xgenres[j]]!==undefined) {
                zgenres.push(varImportance[xgenres[j]])
                savedAnalyzedVariablesCount.genres[title] += 1
                savedAnalyzedVariablesCount.all[title] += 1
                analyzedVariableCount.genres += 1
                if(varImportance[xgenres[j]]>=varImportance.meanGenres
                    &&genresIncluded[xgenres[j]]===undefined){
                    genresIncluded[xgenres[j]] = [xgenres[j].replace("Genre: ",""),varImportance[xgenres[j]]]
                }
            } else {
                zgenres.push(0)
            }
        }
        var ztags = []
        for(let j=0; j<xtags.length; j++){
            if(varImportance[xtags[j]]!==undefined) {
                ztags.push(varImportance[xtags[j]])
                savedAnalyzedVariablesCount.tags[title] += 1
                savedAnalyzedVariablesCount.all[title] += 1
                analyzedVariableCount.tags += 1
                if(varImportance[xtags[j]]>=varImportance.meanTags
                    &&tagsIncluded[xtags[j]]===undefined){
                    tagsIncluded[xtags[j]] = [xtags[j].replace("Tag: ",""),varImportance[xtags[j]]]
                }
            } else {
                ztags.push(0)
            }
        }
        var zstudios = []
        var includedStudio = {}
        for(let j=0; j<xstudios.length; j++){
            if(includedStudio[xstudios[j].name]!==undefined) continue
            else includedStudio[xstudios[j].name] = null
            if(varImportance[xstudios[j].name]!==undefined) {
                zstudios.push(varImportance[xstudios[j].name])
                savedAnalyzedVariablesCount.studios[title] += 1
                savedAnalyzedVariablesCount.all[title] += 1
                analyzedVariableCount.studios += 1
                if(varImportance[xstudios[j].name]>=varImportance.meanStudios
                    &&studiosIncluded[xstudios[j].name]===undefined){
                    studiosIncluded[xstudios[j].name] = [{[xstudios[j].name.replace("Studio: ","")]: xstudios[j].siteUrl},varImportance[xstudios[j].name]]
                }
            } else {
                zstudios.push(0)
            }
        }
        // var zstaff = {}
        // var includedStaff = {}
        // for(let j=0; j<xstaff.length; j++){
        //     if(includedStaff[xstaff[j].staff]!==undefined) continue
        //     else includedStaff[xstaff[j].staff] = null
        //     if(varImportance[xstaff[j].staff]!==undefined) {
        //         savedAnalyzedVariablesCount[title] += 1
        //         analyzedVariableCount += 1
        //         if(zstaff[xstaff[j].role]===undefined){
        //             zstaff[xstaff[j].role] = [varImportance[xstaff[j].staff]]
        //         } else {
        //             zstaff[xstaff[j].role].push(varImportance[xstaff[j].staff])
        //         }
        //         if(varImportance[xstaff[j].staff]>=varImportance.meanStaff
        //             &&staffIncluded[xstaff[j].staff]===undefined){
        //             staffIncluded[xstaff[j].staff] = [{[xstaff[j].staff.replace("Staff: ","")]: xstaff[j].siteUrl},varImportance[xstaff[j].staff]]
        //         }
        //     } else {
        //         if(zstaff[xstaff[j].role]===undefined){
        //             zstaff[xstaff[j].role] = [0]
        //         } else {
        //             zstaff[xstaff[j].role].push(0)
        //         }
        //     }
        // }
        var zstaff = []
        var includedStaff = {}
        for(let j=0; j<xstaff.length; j++){
            if(includedStaff[xstaff[j].staff]!==undefined) continue
            else includedStaff[xstaff[j].staff] = null
            if(varImportance[xstaff[j].staff]!==undefined){
                zstaff.push(varImportance[xstaff[j].staff])
                savedAnalyzedVariablesCount.staff[title] += 1
                savedAnalyzedVariablesCount.all[title] += 1
                analyzedVariableCount.staff += 1
                if(varImportance[xstaff[j].staff]>=varImportance.meanStaff
                    &&staffIncluded[xstaff[j].staff]===undefined){
                    staffIncluded[xstaff[j].staff] = [{[xstaff[j].staff.replace("Staff",xstaff[j].role)]: xstaff[j].siteUrl},varImportance[xstaff[j].staff]]
                }
            } else {
                zstaff.push(0)
            }
        }
        // Original Scores
        // Anime Length
        var animeLengthOS = []
        if(zformat.length>0){
            animeLengthOS.push(...zformat)
        }
        if(!isNaN(anime.episodes)&&varImportance.episodesModel!==undefined){
            animeLengthOS.push(LRpredict(varImportance.episodesModel,anime.episodes))
        }
        if(!isNaN(anime.duration)&&varImportance.durationModel!==undefined){
            animeLengthOS.push(LRpredict(varImportance.durationModel,anime.duration))
        }
        // Anime Time
        var animeTimeOS = []
        if(zyear.length>0){
            animeTimeOS.push(...zyear)
        }
        if(zseason.length>0){
            animeTimeOS.push(...zseason)
        }
        // Anime Type
        var animeTypeOS = []
        if(zgenres.length>0){
            animeTypeOS.push(...zgenres)
        }
        if(ztags.length>0){
            animeTypeOS.push(...ztags)
        }
        // Anime Production
        var animeProductionOS = []
        if(zstudios.length>0){
            animeProductionOS.push(...zstudios)
        }
        if(zstaff.length>0){
            animeProductionOS.push(...zstaff)
        }
        // Get mean of every Available Staff Roles
        // var zstaffRolesArray = Object.values(zstaff)
        // for(let i=0;i<zstaffRolesArray.length;i++){
        //     zstaffRolesArray[i] = arrayMean(zstaffRolesArray[i])
        // }
        // if(zstaffRolesArray.length>0){
        //     animeProductionOS.push(...zstaffRolesArray)
        // }
        // General Opinion 
        var animeGeneralOpinionOS = []
            // Average Score
        if(!isNaN(anime.averageScore)&&varImportance.averageScoreModel!==undefined){
            animeGeneralOpinionOS.push(LRpredict(varImportance.averageScoreModel,anime.averageScore))
        }
            // Popularity
        if(!isNaN(anime.trending)&&varImportance.trendingModel!==undefined){
            animeGeneralOpinionOS.push(LRpredict(varImportance.trendingModel,anime.trending))
        }
        if(!isNaN(anime.popularity)&&varImportance.popularityModel!==undefined){
            animeGeneralOpinionOS.push(LRpredict(varImportance.popularityModel,anime.popularity))
        }
        if(!isNaN(anime.favourites)&&varImportance.favouritesModel!==undefined){
            animeGeneralOpinionOS.push(LRpredict(varImportance.favouritesModel,anime.favourites))
        }
        // Scores
        // OG&&UC
        score = arrayMean([
            ...animeLengthOS,
            ...animeTimeOS,
            ...animeTypeOS,
            ...animeProductionOS,
            ...animeGeneralOpinionOS
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
            if(!studios[k].isAnimationStudio) continue
            xxstudios[studios[k].name] = studios[k].siteUrl
        }
        studios = studios.length>0? xxstudios : {}
        var xxstaff = {}
        for(let k=0; k<staff.length; k++){
            xxstaff[staff[k].node.name.userPreferred] = staff[k].node.siteUrl
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
            title: title, animeUrl: animeUrl, score: score, weightedScore: score, 
            status: status, genres: genres, tags: tags, year: year, 
            season: season, format: format, studios: studios, staff: staff,
            variablesIncluded: variablesIncluded, analyzedVariableCount: analyzedVariableCount
        }
    }
    // Add Weight to Scores
    // var analyzedFormatMean = arrayMean(Object.values(savedAnalyzedVariablesCount.format))
    // var analyzedYearMean = arrayMean(Object.values(savedAnalyzedVariablesCount.year))
    // var analyzedSeasonMean = arrayMean(Object.values(savedAnalyzedVariablesCount.season))
    var analyzedGenresMean = arrayMean(Object.values(savedAnalyzedVariablesCount.genres))
    var analyzedTagsMean = arrayMean(Object.values(savedAnalyzedVariablesCount.tags))
    // var analyzedStudiosMean = arrayMean(Object.values(savedAnalyzedVariablesCount.studios))
    var analyzedStaffMean = arrayMean(Object.values(savedAnalyzedVariablesCount.staff))
    var analyzedVariableMean = arrayMean(Object.values(savedAnalyzedVariablesCount.all))
    var analyzedVariableSum = arraySum(Object.values(savedAnalyzedVariablesCount.all))
    var savedRecSchemeEntries = Object.keys(savedRecScheme)
    for(let i=0;i<savedRecSchemeEntries.length;i++){
        var anime = savedRecScheme[savedRecSchemeEntries[i]]
        var analyzedVariableCount = arraySum(Object.values(anime.analyzedVariableCount))
        if( analyzedVariableCount<analyzedVariableMean
            || anime.analyzedVariableCount.genres<analyzedGenresMean
            || anime.analyzedVariableCount.tags<analyzedTagsMean
            || anime.analyzedVariableCount.staff<analyzedStaffMean ){
            savedRecScheme[savedRecSchemeEntries[i]].weightedScore = (
                analyzedVariableCount===0? (0.000001/analyzedVariableSum)*anime.weightedScore
                : (analyzedVariableCount/analyzedVariableSum)*anime.weightedScore                
            )
        }
    }
    self.postMessage({
        savedRecScheme: savedRecScheme,
        allFilterInfo: allFilterInfo,
        savedAnalyzedVariablesCount: savedAnalyzedVariablesCount
    })
    // Used Functions
    function isaN(num){
        if(num===null){return false
        }else if(typeof num==='string'){if(num.split(' ').join('').length===0){return false}
        }else if(typeof num==='boolean'){return false}
        else return !isNaN(num)
    }
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
    function arrayMode(obj){
        if(obj.length===0){return console.error(`Error: Empty array`)}
        else if(obj.length===1){return obj[0]}
        else if(obj.length===2){return (obj[0]+obj[1])/2}
        var max = parseFloat(Math.max(...obj))
        var min = parseFloat(Math.min(...obj))
        // var maxNumOfDec = obj.join(',').match(/((?<=\.)\d+)/g)?.reduce((acc,el)=>acc>=el.length?acc:el.length,0)??0
        var boundary = Number.MIN_VALUE
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