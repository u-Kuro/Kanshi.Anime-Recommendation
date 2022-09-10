self.onmessage = (message) => {
    var data = message.data
    var animeEntries = data.animeEntries
    var recScheme = data.recScheme
    var userListInfo = data.userListInfo
    var varImportance = data.varImportance
    var sum = 0
    //
    for(let i=0; i<animeEntries.length; i++){
        var anime = animeEntries[i]
        var count = 0
        /////
        var title = anime.title.userPreferred || "Title: N/A"
        var url = anime.siteUrl
        // var type = anime.type || "N/A"
        var format = anime.format || "Format: N/A"
        var year = anime.seasonYear || "Year: N/A"
        var season = anime.season || "Season: N/A"
        var studios = anime.studios.nodes
        var tags = anime.tags
        var genres = anime.genres
        // var anilistScore = anime.averageScore
        var status = "UNWATCHED"
        var score = []
        // Arrange
        var xformat = format!=="Format: N/A"?`Format: ${format}`:`${Math.random()}`
        var xepisodetype = `${Math.random()}`
        if(anime.episodes===1) xepisodetype = "Episode: 1"
        else if (anime.episodes>1&&anime.episodes<7) xepisodetype = "Episode: 2-6"
        else if (anime.episodes>6&&anime.episodes<14) xepisodetype = "Episode: 7-13"
        else if (anime.episodes>13&&anime.episodes<27) xepisodetype = "Episode: 14-26"
        else if (anime.episodes>26&&anime.episodes<53) xepisodetype = "Episode: 27-52"
        else if (anime.episodes>52&&anime.episodes<101) xepisodetype = "Episode: 53-100"
        else if (anime.episodes>100) xepisodetype = "Episode: 101+"
        //
        var xyear = year!=="Year: N/A"?"Year: "+year:`x${Math.random()}`
        var xseason = season!=="Season: N/A"?"Season: "+season:`${Math.random()}`
        var xgenres = []
        for(let j=0; j<genres.length; j++){
            xgenres.push("Genre: "+genres[j])
        }
        var xtags = []
        for(let j=0; j<tags.length; j++){
            xtags.push("Tag: "+tags[j].name)
        }
        var xstudios = []
        for(let j=0; j<studios.length; j++){
            xstudios.push("Studio: "+studios[j].name)
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
        if(typeof varImportance[xformat]!=="undefined"){
            score.push(varImportance[xformat])
            sum += 1
            count+=1
            console.log("Format Item: ",xformat)
        }
        if(typeof varImportance[xepisodetype]!=="undefined") {
            score.push(varImportance[xepisodetype])
            sum += 1
            count+=1
            console.log("Episode Item: ",xepisodetype)
        }
        if(typeof varImportance[xyear]!=="undefined") {
            score.push(varImportance[xyear])
            sum += 1
            count+=1
            console.log("Year Item: ",xyear)
        }
        if(typeof varImportance[xseason]!=="undefined") {
            score.push(varImportance[xseason])
            sum+=1
            count+=1
            console.log("Season Item: ",xseason)
        }
        for(let j=0; j<xgenres.length; j++){
            if(typeof varImportance[xgenres[j]]!=="undefined") {
                score.push(varImportance[xgenres[j]])
                sum+=1
                count+=1
                console.log("Genre Item: ",xgenres[j])
            }
        }
        for(let j=0; j<xtags.length; j++){
            if(typeof varImportance[xtags[j]]!=="undefined") {
                score.push(varImportance[xtags[j]])
                sum+=1
                count+=1
                console.log("Tag Item: ",xtags[j])
            }
        }
        for(let j=0; j<xstudios.length; j++){
            if(typeof varImportance[xstudios[j]]!=="undefined") {
                score.push(varImportance[xstudios[j]])
                sum+=1
                count+=1
                console.log("Studio Item: ",xstudios[j])
            }
        }
        for(let j=0; j<xstaff.length; j++){
            if(typeof varImportance[xstaff[j]]!=="undefined") {
                score.push(varImportance[xstaff[j]])
                sum+=1
                count+=1
                console.log("Staff Item: ",xstaff[j])
            }
        }
        score = score.length===0?0:arrayMean(score)
        //
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
        // Add Recommendation Scheme
        if(!recScheme.some((rec)=>rec.title===title)){
            recScheme.push({
                title: title, url: url, score: score, count: count,
                status: status, genres: genres, tags: tags, year: year, 
                season: season, format: format, studios: studios
            })
        }
    }
    self.postMessage({
        recScheme: recScheme, 
        sum: sum
    })
    //
    function arraySum(obj) {
        return obj.reduce((a, b) => a + b, 0)
    }
    function arrayMean(obj) {
        return (arraySum(obj) / obj.length) || 0
    }
}