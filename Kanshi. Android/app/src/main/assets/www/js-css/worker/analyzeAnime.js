self.onmessage = (message) => {
    var data = message.data
    var animeEntries = data.animeEntries
    var recScheme = data.recScheme
    var userListInfo = data.userListInfo
    var varImportance = data.varImportance
    var allFilterInfo = data.allFilterInfo
    var sumForWeight = 0
    //
    for(let i=0; i<animeEntries.length; i++){
        var anime = animeEntries[i]
        var countForWeight = 0
        /////
        var title = anime.title.userPreferred || "Title: N/A"
        var animeUrl = anime.siteUrl
        // var type = anime.type || "N/A"
        var format = anime.format || "Format: N/A"
        var year = anime.seasonYear || "Year: N/A"
        var season = anime.season || "Season: N/A"
        var studios = anime.studios.nodes
        var tags = anime.tags
        var genres = anime.genres
        var status = "UNWATCHED"
        allFilterInfo = allFilterInfo = {
            ...allFilterInfo,
            [title.toLowerCase()]: true,
            [format.toLowerCase()]: true, ["!"+format.toLowerCase()]: true,
            [year]: true,  [`!${year}`]: true,
            [season.toLowerCase()]: true, ["!"+season.toLowerCase()]: true
        }
        var score = []
        // Arrange
        var xformat = format!=="Format: N/A"?`Format: ${format}`:`${Math.random()}`
        var xyear = year!=="Year: N/A"?"Year: "+year:`x${Math.random()}`
        var xseason = season!=="Season: N/A"?"Season: "+season:`${Math.random()}`
        var xgenres = []
        for(let j=0; j<genres.length; j++){
            xgenres.push("Genre: "+genres[j])
            allFilterInfo = allFilterInfo = {
                ...allFilterInfo,
                [genres[j].toLowerCase()]: true, ["!"+genres[j].toLowerCase()]: true
            }
        }
        var xtags = []
        for(let j=0; j<tags.length; j++){
            xtags.push("Tag: "+tags[j].name)
            allFilterInfo = allFilterInfo = {
                ...allFilterInfo,
                [(tags[j].name).toLowerCase()]: true, ["!"+(tags[j].name).toLowerCase()]: true
            }
        }
        var xstudios = []
        for(let j=0; j<studios.length; j++){
            xstudios.push("Studio: "+studios[j].name)
            allFilterInfo = allFilterInfo = {
                ...allFilterInfo,
                [(studios[j].name).toLowerCase()]: true,  ["!"+(studios[j].name).toLowerCase()]: true
            }
        }
        var xstaff = []
        for(let j=0; j<anime.staff.edges.length; j++){
            var firstname = anime.staff.edges[j].node.name.first
            var lastname = anime.staff.edges[j].node.name.last
            var fullname = []
            if(firstname===null&&lastname===null)
                fullname = `sgdjuvdhgd${Math.random()}`
            else{
                if(firstname!==null) fullname.push(firstname)
                if(lastname!==null) fullname.push(lastname)
                fullname = fullname.join(" ")
            }
            xstaff.push("Staff: "+fullname)
        }
        // Analyze
        var formatsIncluded = []
        var yearsIncluded = []
        var seasonsIncluded = []
        var genresIncluded = []
        var tagsIncluded = []
        var studiosIncluded = []
        var staffsIncluded = []
        var variablesIncluded = []
        //
        var zformat = []
        if(typeof varImportance[xformat]!=="undefined"){
            zformat.push(varImportance[xformat])
            if(varImportance[xformat]>=varImportance.meanFormat
                &&!formatsIncluded.includes(xformat)){
                formatsIncluded.push(xformat)
            }
        }
        var zyear = []
        if(typeof varImportance[xyear]!=="undefined") {
            zyear.push(varImportance[xyear])
            if(varImportance[xyear]>=varImportance.meanYear
                &&!yearsIncluded.includes(xyear)){
                yearsIncluded.push(xyear)
            }
        }
        var zseason = []
        if(typeof varImportance[xseason]!=="undefined") {
            zseason.push(varImportance[xseason])
            if(varImportance[xseason]>=varImportance.meanSeason
                &&!seasonsIncluded.includes(xseason)){
                seasonsIncluded.push(xseason)
            }
        }
        var zgenres = []
        for(let j=0; j<xgenres.length; j++){
            if(typeof varImportance[xgenres[j]]!=="undefined") {
                zgenres.push(varImportance[xgenres[j]])
                if(varImportance[xgenres[j]]>=varImportance.meanGenres
                    &&!variablesIncluded.includes([xgenres[j],varImportance[xgenres[j]]])){
                    variablesIncluded.push([
                        xgenres[j],
                        varImportance[xgenres[j]]
                    ])
                }
                if(varImportance[xgenres[j]]>=varImportance.meanGenres
                    &&!genresIncluded.includes(xgenres[j])){
                    genresIncluded.push(xgenres[j])
                }
            }
        }
        var ztags = []
        for(let j=0; j<xtags.length; j++){
            if(typeof varImportance[xtags[j]]!=="undefined") {
                ztags.push(varImportance[xtags[j]])
                if(varImportance[xtags[j]]>=varImportance.meanTags
                    &&!variablesIncluded.includes([xtags[j],varImportance[xtags[j]]])){
                    variablesIncluded.push([
                        xtags[j],
                        varImportance[xtags[j]]
                    ])
                }
                if(varImportance[xtags[j]]>=varImportance.meanTags
                    &&!tagsIncluded.includes(xtags[j])){
                    tagsIncluded.push(xtags[j])
                }
            }
        }
        var zstudios = []
        for(let j=0; j<xstudios.length; j++){
            if(typeof varImportance[xstudios[j]]!=="undefined") {
                zstudios.push(varImportance[xstudios[j]])
                if(varImportance[xstudios[j]]>=varImportance.meanStudios
                    &&!variablesIncluded.includes([xstudios[j],varImportance[xstudios[j]]])){
                    variablesIncluded.push([
                        xstudios[j],
                        varImportance[xstudios[j]]
                    ])
                }
                if(varImportance[xstudios[j]]>=varImportance.meanStudios
                    &&!studiosIncluded.includes(xstudios[j])){
                    studiosIncluded.push(xstudios[j])
                }
            }
        }
        var zstaff = []
        for(let j=0; j<xstaff.length; j++){
            if(typeof varImportance[xstaff[j]]!=="undefined") {
                zstaff.push(varImportance[xstaff[j]])
                if(varImportance[xseason]>=varImportance.meanStaff
                    &&!staffsIncluded.includes(xstaff[j])){
                    staffsIncluded.push(xstaff[j])
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
        zepisodes = anime.episodes===null?0:LRpredict(varImportance.episodesModel,anime.episodes)
        zduration = anime.duration===null?0:LRpredict(varImportance.durationModel,anime.duration)
        zaverageScore = anime.averageScore===null?0:LRpredict(varImportance.averageScoreModel,anime.averageScore)
        ztrending = anime.trending===null?0:LRpredict(varImportance.trendingModel,anime.trending)
        zpopularity = anime.popularity===null?0:LRpredict(varImportance.popularityModel,anime.popularity)
        zfavourites = anime.favourites===null?0:LRpredict(varImportance.favouritesModel,anime.favourites)
        score = arrayMean([
            zformat,zyear,zseason,zgenres,ztags,zstaff,
            zepisodes,zduration,zaverageScore,ztrending,zpopularity,zfavourites
        ])
        // Other Anime Recommendation Info
        for(let k=0; k<userListInfo.length; k++){
            if(userListInfo[k].title===title){
                status = userListInfo[k].status
                break
            }
        }
        genres = genres.length>0?genres.join(", "):"Genres: N/A"
        var tempTags = []
        for(let k=0; k<tags.length; k++){
            tempTags.push(tags[k].name)
        }
        tags = tempTags.length>0?tempTags.join(", "):"Tags: N/A"
        var tempStudios = []
        for(let k=0; k<studios.length; k++){
            tempStudios.push(studios[k].name)
        }
        studios = tempStudios.length>0?tempStudios.join(", "):"Studios: N/A"
        variablesIncluded.sort((a, b)=>{
            return b[1] - a[1];
        })
        var tempVariablesIncluded = []
        for(let i=0;i<variablesIncluded.length;i++){
            tempVariablesIncluded.push(variablesIncluded[i][0])
        }
        formatsIncluded = formatsIncluded.length
        yearsIncluded = yearsIncluded.length
        seasonsIncluded = seasonsIncluded.length
        genresIncluded = genresIncluded.length
        tagsIncluded = tagsIncluded.length
        studiosIncluded = studiosIncluded.length
        staffsIncluded = staffsIncluded.length
        variablesIncluded = variablesIncluded.length
        sumForWeight += arrayMean([
            formatsIncluded,
            yearsIncluded,
            seasonsIncluded,
            genresIncluded,
            tagsIncluded,
            studiosIncluded,
            staffsIncluded,
            variablesIncluded,
        ])
        countForWeight = arrayMean([
            formatsIncluded,
            yearsIncluded,
            seasonsIncluded,
            genresIncluded,
            tagsIncluded,
            studiosIncluded,
            staffsIncluded,
            variablesIncluded,
        ])
        variablesIncluded = tempVariablesIncluded.length>0?tempVariablesIncluded.join(", "):"Top Similarities: N/A"
        // Add Recommendation Scheme
        if(!recScheme.some((rec)=>rec.title===title)){
            recScheme.push({
                title: title, animeUrl: animeUrl, score: score, weightedScore: 0,
                countForWeight: countForWeight,
                status: status, genres: genres, tags: tags, year: year, 
                season: season, format: format, studios: studios,
                variablesIncluded: variablesIncluded
            })
        }
    }
    // Clean Analyzed Recommendations
    for(let i=0;i<recScheme.length;i++){
        var anime = recScheme[i]
        if(anime.countForWeight<(sumForWeight/animeEntries.length)){
            var weight = (1/sumForWeight)*anime.countForWeight
            recScheme[i].weightedScore=anime.score*weight
        } else {
            recScheme[i].weightedScore=anime.score
        }
    }
    self.postMessage({
        recScheme: recScheme,
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
    //     sortable.forEach(([k,v])=>{newObj={...newObj,[k]:v}})
    //     return newObj
    // }
}