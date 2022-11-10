self.onmessage = (message) => {
    const minNumber = 1-6e-17!==1? 6e-17 : 1e-16 // Min Value Javascript
    const data = message.data
    var userEntries = data.userEntries
    var savedUserList = data.savedUserList
    var alteredVariables = {
        format_in: {},
        year_in: {},
        genres_in: {},
        tags_in: {},
        studios_in: {},
        staff_in: {},
    }
    // sort by popularity for unique anime in franchise
    if(userEntries.length>1){
        if(userEntries[0].media!==null&&userEntries[1].media!==null){
            if(userEntries[0].media.popularity!==null&&userEntries[1].media.popularity!==null){
                userEntries.sort((a,b)=>b.media.popularity-a.media.popularity)
            }
        }
    }
    var varScheme = {}
    // Check Watched
    var userListStatus = []
    // For Linear Regression Models
    var episodes = []
    var duration = []
    var averageScore = []
    var trending = []
    var popularity = []
    var favourites = []
    var year = []
    //
    var formatMeanCount = {}
    var genresMeanCount = {}
    var tagsMeanCount = {}
    var studiosMeanCount = {}
    var staffMeanCount = {}
    // For Alert user if Scored List is 0
    // to have a better recommendation
    var userListCount = 0
    // For checking any deleted Anime
    var savedUserListIDs = Object.keys(savedUserList)
    // Analyze each Anime Variable
    var includedAnimeRelations = {}
    for(let i=0; i<userEntries.length; i++){
        var isNewAnime = false
        var anime = userEntries[i].media
        var status = userEntries[i].status        
        var anilistId = anime.id
        // Save every anime status in userlist
        if(status!==null&&anilistId!==null){
            userListStatus.push({
                id: anilistId,
                status: status
            })
        }
        // Check if a related anime is already analyzed
        if(includedAnimeRelations[anilistId]!==undefined) continue
        includedAnimeRelations[anilistId] = null
        if(anime.relations!==null){
            var animeRelations = anime.relations.edges
            for(let j=0;j<animeRelations;j++){
                var animeRelationsNode = animeRelations[j].node
                var animeRelationType = animeRelations[j].relationType
                if(animeRelationsNode!==null&&animeRelationType!==null){
                    // Other characters may cast at a completely different anime
                    if(animeRelationsNode.id!==null&&animeRelationType!=="CHARACTER"){
                        includedAnimeRelations[animeRelationsNode.id] = null
                    }
                }
            }
        }
        // Check Any Changes in User List
        var editedEntry = JSON.parse(JSON.stringify(userEntries[i]))
        if(editedEntry.media!==null){
            delete editedEntry.media.duration
            delete editedEntry.media.trending
            delete editedEntry.media.popularity
            delete editedEntry.media.favourites
        }
        var newAnimeObjStr = JSON.stringify(editedEntry)
        if(savedUserList[anilistId]===undefined){
            isNewAnime = true
            savedUserList[anilistId] = newAnimeObjStr
        } else {
            // Filter Anime not in the savedUserList, if one is deleted in Anilist
            savedUserListIDs = savedUserListIDs.filter((savedID)=>{return savedID!==anilistId})
        }
        if(userEntries[i].score>0){
            ++userListCount
            var userScore = userEntries[i].score
            var format = {}
            var genres = {}
            var tags = {}
            var studios = {}
            var staff = {}
            if(Object.keys(varScheme).length<1){
                // Categories
                if(anime.format!==null){
                    if(format["Format: "+anime.format]===undefined){
                        format["Format: "+anime.format] = {userScore:[userScore],count:1}
                    } else {
                        format["Format: "+anime.format].userScore.push(userScore)
                        format["Format: "+anime.format].count += 1
                    }
                    if(formatMeanCount["Format: "+anime.format]===undefined){
                        formatMeanCount["Format: "+anime.format] = 1
                    } else {
                        formatMeanCount["Format: "+anime.format] += 1
                    }
                }
                if((savedUserList[anilistId]!==newAnimeObjStr||isNewAnime)&&anime.format!==null){
                    savedUserList[anilistId] = newAnimeObjStr
                    if(alteredVariables.format_in["Format: "+anime.format]===undefined){
                        alteredVariables.format_in["Format: "+anime.format] = 1
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
                    if((savedUserList[anilistId]!==newAnimeObjStr||isNewAnime)&&anime.genres[j]!==null){
                        savedUserList[anilistId] = newAnimeObjStr
                        if(alteredVariables.genres_in["Genre: "+anime.genres[j]]===undefined){
                            alteredVariables.genres_in["Genre: "+anime.genres[j]] = 1
                        }
                    }
                }
                for(let j=0; j<anime.tags.length; j++){
                    if(anime.tags[j].name===null && tags[j].rank>=50){
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
                    if((savedUserList[anilistId]!==newAnimeObjStr||isNewAnime)&&anime.tags[j].name!==null){
                        savedUserList[anilistId] = newAnimeObjStr
                        if(alteredVariables.tags_in["Tag: "+anime.tags[j].name]===undefined){
                            alteredVariables.tags_in["Tag: "+anime.tags[j].name] = 1
                        }
                    }
                }
                var includedStudio = {}
                for(let j=0; j<anime.studios.nodes.length; j++){
                    if(!anime.studios.nodes[j].isAnimationStudio) continue
                    if(includedStudio[anime.studios.nodes[j].name]!==undefined) continue
                    else includedStudio[anime.studios.nodes[j].name] = null
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
                    if((savedUserList[anilistId]!==newAnimeObjStr||isNewAnime)&&anime.studios.nodes[j].name!==null){
                        savedUserList[anilistId] = newAnimeObjStr
                        if(alteredVariables.studios_in["Studio: "+anime.studios.nodes[j].name]===undefined){
                            alteredVariables.studios_in["Studio: "+anime.studios.nodes[j].name] = 1
                        }
                    }
                }
                //
                var includedStaff = {}
                for(let j=0; j<anime.staff.edges.length; j++){
                    if(anime.staff.edges[j].node.name.userPreferred!==null){
                        if(includedStaff[anime.staff.edges[j].node.name.userPreferred]!==undefined) continue
                        else includedStaff[anime.staff.edges[j].node.name.userPreferred] = null
                        if(staff["Staff: "+anime.staff.edges[j].node.name.userPreferred]===undefined){
                            staff["Staff: "+anime.staff.edges[j].node.name.userPreferred] = {userScore:[userScore],count:1}
                        } else {
                            staff["Staff: "+anime.staff.edges[j].node.name.userPreferred].userScore.push(userScore)
                            staff["Staff: "+anime.staff.edges[j].node.name.userPreferred].count += 1
                        }
                        if(staffMeanCount["Staff: "+anime.staff.edges[j].node.name.userPreferred]===undefined){
                            staffMeanCount["Staff: "+anime.staff.edges[j].node.name.userPreferred] = 1
                        } else {
                            staffMeanCount["Staff: "+anime.staff.edges[j].node.name.userPreferred] += 1
                        }
                    }
                    if((savedUserList[anilistId]!==newAnimeObjStr||isNewAnime)&&anime.staff.edges[j].node.name.userPreferred!==null){
                        savedUserList[anilistId] = newAnimeObjStr
                        if(alteredVariables.staff_in["Staff: "+anime.staff.edges[j].node.name.userPreferred]===undefined){
                            alteredVariables.staff_in["Staff: "+anime.staff.edges[j].node.name.userPreferred] = 1
                        }
                    }
                }
                varScheme = {
                    format: format, genres: genres, tags: tags, studios: studios, staff: staff
                }
            } else {
                var xformat = anime.format===null? null : "Format: "+anime.format
                if(xformat!==null){
                    if(savedUserList[anilistId]!==newAnimeObjStr||isNewAnime){
                        savedUserList[anilistId] = newAnimeObjStr
                        if(alteredVariables.format_in[xformat]===undefined){
                            alteredVariables.format_in[xformat] = 1
                        }
                    }
                    if(varScheme.format[xformat]!==undefined){
                        varScheme.format[xformat].userScore.push(userScore)
                        varScheme.format[xformat].count += 1
                    }
                    else{
                        varScheme.format[xformat] = {userScore:[userScore],count:1}
                    }
                    if(formatMeanCount[xformat]!==undefined){
                        formatMeanCount[xformat] += 1
                    } else {
                        formatMeanCount[xformat] = 1
                    }
                }
                for(let j=0; j<anime.genres.length; j++){
                    var xgenres = anime.genres[j]===null? null : "Genre: "+anime.genres[j]
                    if(xgenres!==null){
                        if(savedUserList[anilistId]!==newAnimeObjStr||isNewAnime){
                            savedUserList[anilistId] = newAnimeObjStr
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
                var tagRankMean = []
                for(let j=0; j<anime.tags.length; j++){
                    var xTagRank = anime.tags[j].rank
                    if(isaN(xTagRank)){tagRankMean.push(xTagRank)}
                }
                var tempTagRankMean = arrayMean(tagRankMean)
                tagRankMean = tagRankMean.length===0?50:tempTagRankMean<50?50:tempTagRankMean
                for(let j=0; j<anime.tags.length; j++){
                    var xTagRank = anime.tags[j].rank
                    if(xTagRank===null) continue
                    var xtags = anime.tags[j].name===null? null : "Tag: "+anime.tags[j].name
                    if(xtags!==null&&xTagRank>=tagRankMean){
                        if(savedUserList[anilistId]!==newAnimeObjStr||isNewAnime){
                            savedUserList[anilistId] = newAnimeObjStr
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
                var includedStudio = {}
                for(let j=0; j<anime.studios.nodes.length; j++){
                    if(!anime.studios.nodes[j].isAnimationStudio) continue
                    if(includedStudio[anime.studios.nodes[j].name]!==undefined) continue
                    else includedStudio[anime.studios.nodes[j].name] = null
                    var xstudios = anime.studios.nodes[j].name===null? null : "Studio: "+anime.studios.nodes[j].name
                    if(xstudios!==null){
                        if(savedUserList[anilistId]!==newAnimeObjStr||isNewAnime){
                            savedUserList[anilistId] = newAnimeObjStr
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
                var includedStaff = {}
                for(let j=0; j<anime.staff.edges.length; j++){
                    if(includedStaff[anime.staff.edges[j].node.name.userPreferred]!==undefined) continue
                    else includedStaff[anime.staff.edges[j].node.name.userPreferred] = null
                    var xstaff = anime.staff.edges[j].node.name.userPreferred===null?null: "Staff: "+anime.staff.edges[j].node.name.userPreferred
                    if(xstaff!==null){
                        if(savedUserList[anilistId]!==newAnimeObjStr||isNewAnime){
                            savedUserList[anilistId] = newAnimeObjStr
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
            if(isaN(anime.episodes)){
                episodes.push({userScore: userScore, episodes: anime.episodes})
            }
            if(isaN(anime.duration)){
                duration.push({userScore: userScore, duration: anime.duration})
            }
            if(isaN(anime.averageScore)){
                averageScore.push({userScore: userScore, averageScore: anime.averageScore})
            }
            if(isaN(anime.trending)){
                trending.push({userScore: userScore, trending: anime.trending})
            }
            if(isaN(anime.popularity)){
                popularity.push({userScore: userScore, popularity: anime.popularity})
            }
            if(isaN(anime.favourites)){
                favourites.push({userScore: userScore, favourites: anime.favourites})
            }
            if(isaN(parseInt(anime.seasonYear))){
                year.push({userScore: userScore, year: parseInt(anime.seasonYear)})
            }
        }
    }
    // Check and Remove if User Deleted an Anime, and add its variables as altered
    for(let i=0;i<savedUserListIDs.length;i++){
        var entry = JSON.parse(savedUserList[savedUserListIDs[i]])
        var anime = entry.media
        if(alteredVariables.format_in["Format: "+anime.format]===undefined){
            alteredVariables.format_in["Format: "+anime.format] = 1
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
            if(!anime.studios.nodes[j].isAnimationStudio) continue
            if(alteredVariables.studios_in["Studio: "+anime.studios.nodes[j].name]===undefined){
                alteredVariables.studios_in["Studio: "+anime.studios.nodes[j].name] = 1
            }
        }
        for(let j=0; j<anime.staff.edges.length; j++){
            if(alteredVariables.staff_in["Staff: "+anime.staff.edges[j].node.name.userPreferred]===undefined){
                alteredVariables.staff_in["Staff: "+anime.staff.edges[j].node.name.userPreferred] = 1
            }
        }
        // Lastly delete the anime in the savedUserList
        delete savedUserList[savedUserListIDs[i]]
    }
    // Clean Data JSON
    const minSampleSize = 10
    if(Object.values(formatMeanCount).length>0){
        var tempformatMeanCount = arrayMode(Object.values(formatMeanCount))
        formatMeanCount = tempformatMeanCount<minSampleSize?minSampleSize:tempformatMeanCount
    } else {
        formatMeanCount = minSampleSize
    }
    if(Object.values(genresMeanCount).length>0){
        var tempgenresMeanCount = arrayMode(Object.values(genresMeanCount))
        genresMeanCount = tempgenresMeanCount<minSampleSize?minSampleSize:tempgenresMeanCount
    } else {
        genresMeanCount = minSampleSize
    }
    if(Object.values(tagsMeanCount).length>0){
        var temptagsMeanCount = arrayMode(Object.values(tagsMeanCount))
        tagsMeanCount = temptagsMeanCount<minSampleSize?minSampleSize:temptagsMeanCount
    } else {
        tagsMeanCount = minSampleSize
    }
    if(Object.values(studiosMeanCount).length>0){
        var tempstudiosMeanCount = arrayMode(Object.values(studiosMeanCount))
        studiosMeanCount = tempstudiosMeanCount<minSampleSize?minSampleSize:tempstudiosMeanCount
    } else {
        studiosMeanCount = minSampleSize
    }
    if(Object.values(staffMeanCount).length>0){
        var tempstaffMeanCount = arrayMode(Object.values(staffMeanCount))
        staffMeanCount = tempstaffMeanCount<minSampleSize?minSampleSize:tempstaffMeanCount
    } else {
        staffMeanCount = minSampleSize
    }
    //
    if(Object.keys(varScheme).length>0){
        var formatKey = Object.keys(varScheme.format)
        var formatMean = []
        //
        for(let i=0; i<formatKey.length; i++){
            formatMean.push(arrayMean(varScheme.format[formatKey[i]].userScore))
        }
        formatMean = arrayMean(formatMean)
        for(let i=0; i<formatKey.length; i++){
            var tempScore = arrayMean(varScheme.format[formatKey[i]].userScore)
            varScheme.format[formatKey[i]+"Min"] = tempScore
            // Include High Weight or Low scored Variables to avoid High-scored Variables without enough sample
            var count = varScheme.format[formatKey[i]].count
            if(count>=formatMeanCount){//||tempScore<formatMean){ 
                varScheme.format[formatKey[i]] = tempScore
            } else {
                delete varScheme.format[formatKey[i]]
            }
        }
        //
        var genresKey = Object.keys(varScheme.genres)
        var genresMean = []
        for(let i=0; i<genresKey.length; i++){
            genresMean.push(arrayMean(varScheme.genres[genresKey[i]].userScore))
        }
        genresMean = arrayMean(genresMean)
        for(let i=0; i<genresKey.length; i++){
            var tempScore = arrayMean(varScheme.genres[genresKey[i]].userScore)
            varScheme.genres[genresKey[i]+"Min"] = tempScore
            // Include High Weight or Low scored Variables to avoid High-scored Variables without enough sample
            var count = varScheme.genres[genresKey[i]].count
            if(count>=genresMeanCount||tempScore<genresMean){
                varScheme.genres[genresKey[i]] = tempScore
            } else {
                delete varScheme.genres[genresKey[i]]
            }
        }
        //
        var tagsKey = Object.keys(varScheme.tags)
        var tagsMean = []
        for(let i=0; i<tagsKey.length; i++){
            tagsMean.push(arrayMean(varScheme.tags[tagsKey[i]].userScore))
        }
        tagsMean = arrayMean(tagsMean)
        for(let i=0; i<tagsKey.length; i++){
            var tempScore = arrayMean(varScheme.tags[tagsKey[i]].userScore)
            varScheme.tags[tagsKey[i]+"Min"] = tempScore
            // Include High Weight or Low scored Variables to avoid High-scored Variables without enough sample
            var count = varScheme.tags[tagsKey[i]].count
            if(count>=tagsMeanCount||tempScore<tagsMean){
                varScheme.tags[tagsKey[i]] = tempScore
            } else {
                delete varScheme.tags[tagsKey[i]]
            }
        }
        //
        var studiosKey = Object.keys(varScheme.studios)
        var studiosMean = []
        for(let i=0; i<studiosKey.length; i++){
            studiosMean.push(arrayMean(varScheme.studios[studiosKey[i]].userScore))
        }
        studiosMean = arrayMean(studiosMean)
        for(let i=0; i<studiosKey.length; i++){
            var tempScore = arrayMean(varScheme.studios[studiosKey[i]].userScore)
            varScheme.studios[studiosKey[i]+"Min"] = tempScore
            // Include High Weight or Low scored Variables to avoid High-scored Variables without enough sample
            var count = varScheme.studios[studiosKey[i]].count
            if(count>=studiosMeanCount||tempScore<studiosMean){
                varScheme.studios[studiosKey[i]] = tempScore
            } else {
                delete varScheme.studios[studiosKey[i]]
            }
        }
        //
        var staffKey = Object.keys(varScheme.staff)
        var staffMean = []
        for(let i=0; i<staffKey.length; i++){
            staffMean.push(arrayMean(varScheme.staff[staffKey[i]].userScore))
        }
        staffMean = arrayMean(staffMean)
        for(let i=0; i<staffKey.length; i++){
            var tempScore = arrayMean(varScheme.staff[staffKey[i]].userScore)
            varScheme.staff[staffKey[i]+"Min"] = tempScore
            // Include High Weight or Low scored Variables to avoid High-scored Variables without enough sample
            var count = varScheme.staff[staffKey[i]].count
            if(count>=staffMeanCount||tempScore<staffMean){
                varScheme.staff[staffKey[i]] = tempScore
            } else {
                delete varScheme.staff[staffKey[i]]
            }
        }
        // Join Data
        var varSchemeKeys = Object.keys(varScheme)
        var tempVar = {
            meanFormat: formatMean,
            meanGenres: genresMean,
            meanTags: tagsMean,
            meanStudios: studiosMean,
            meanStaff: staffMean,
        }
        for(let i=0; i<varSchemeKeys.length; i++){
            var variables = varScheme[varSchemeKeys[i]]
            for(let j=0; j<Object.keys(variables).length; j++){
                var varEntries = Object.entries(variables)
                tempVar[varEntries[j][0]] = varEntries[j][1]
            }
        }
        // Create Model for Numbers| y is predicted so userscore
        // Average Score Model
        const r2Thresh = 0.1 // Lowered Since Media is Subjective
        const limitSample = 30
        // For Anime Date Model
        var animeDateModel = []
        var yearXY = []
        for(let i=0; i<year.length;i++){
            yearXY.push([year[i].year,year[i].userScore])
        }
        if(yearXY.length>=limitSample){
            var tempLinearReg = linearRegression(yearXY)
            animeDateModel.push([tempLinearReg,"yearModel"])
        }
        var sortedAnimeDateModels = animeDateModel.sort(function(a, b) {
            return b[0].r2 - a[0].r2;
        })
        if(sortedAnimeDateModels.length>0){
            sortedAnimeDateModels = sortedAnimeDateModels[0]
            tempVar[sortedAnimeDateModels[1]] = sortedAnimeDateModels[0]
        }
        // For Anime Length Model
        var animeLengthModels = []
        var episodesXY = []
        for(let i=0; i<episodes.length;i++){
            episodesXY.push([episodes[i].episodes,episodes[i].userScore])
        }
        if(episodesXY.length>=limitSample){
            var tempLinearReg = linearRegression(episodesXY)
            if(tempLinearReg.r2>r2Thresh){
                animeLengthModels.push([tempLinearReg,"episodesModel"])
            }
        }
        var durationXY = []
        for(let i=0; i<duration.length;i++){
            durationXY.push([duration[i].duration,duration[i].userScore])
        }
        if(durationXY.length>=limitSample){
            var tempLinearReg = linearRegression(durationXY)
            if(tempLinearReg.r2>r2Thresh){
                animeLengthModels.push([tempLinearReg,"durationModel"])
            }
        }
        var sortedAnimeLengthModels = animeLengthModels.sort(function(a, b) {
            return b[0].r2 - a[0].r2;
        })
        if(sortedAnimeLengthModels.length>0){
            sortedAnimeLengthModels = sortedAnimeLengthModels[0]
            tempVar[sortedAnimeLengthModels[1]] = sortedAnimeLengthModels[0]
        }
        // For Popularity
        var wellKnownAnimeModels = []
        var averageScoreXY = []
        for(let i=0; i<averageScore.length;i++){
            averageScoreXY.push([averageScore[i].averageScore,averageScore[i].userScore])
        }
        if(averageScoreXY.length>=limitSample){
            var tempLinearReg = linearRegression(averageScoreXY)
            wellKnownAnimeModels.push([tempLinearReg,"averageScoreModel"])
        }
        var trendingXY = []
        for(let i=0; i<trending.length;i++){
            trendingXY.push([trending[i].trending,trending[i].userScore])
        }
        if(trendingXY.length>=limitSample){
            var tempLinearReg = linearRegression(trendingXY)
            wellKnownAnimeModels.push([tempLinearReg,"trendingModel"])
        }
        var popularityXY = []
        for(let i=0; i<popularity.length;i++){
            popularityXY.push([popularity[i].popularity,popularity[i].userScore])
        }
        if(popularityXY.length>=limitSample){
            var tempLinearReg = linearRegression(popularityXY)
            wellKnownAnimeModels.push([tempLinearReg,"popularityModel"])
        }
        var favouritesXY = []
        for(let i=0; i<favourites.length;i++){
            favouritesXY.push([favourites[i].favourites,favourites[i].userScore])
        }
        if(favouritesXY.length>=limitSample){
            var tempLinearReg = linearRegression(favouritesXY)
            wellKnownAnimeModels.push([tempLinearReg,"favouritesModel"])
        }
        var sortedWellKnownAnimeModels = wellKnownAnimeModels.sort(function(a, b) {
            return b[0].r2 - a[0].r2;
        })
        if(sortedWellKnownAnimeModels.length>0){
            sortedWellKnownAnimeModels = sortedWellKnownAnimeModels[0]
            tempVar[sortedWellKnownAnimeModels[1]] = sortedWellKnownAnimeModels[0]
        }
        varScheme = tempVar
    }
    self.postMessage({
        varScheme: varScheme, 
        userListStatus: userListStatus,
        savedUserList: savedUserList,
        alteredVariables: alteredVariables,
        userListCount: userListCount
    })
    // Used Function
    function isaN(num){
        if(num===null){return false
        }else if(typeof num==='string'){if(num.split(' ').join('').length===0){return false}
        }else if(typeof num==='boolean'){return false}
        else return !isNaN(num)
    }
    function arrayMean(obj) {
        return (arraySum(obj) / obj.length) || 0
    }
    function arraySum(obj) {
        return obj.reduce((a, b) => a + b, 0)
    }
    function arrayMode(obj){
        if(obj.length===0){return}
        else if(obj.length===1){return obj[0]}
        else if(obj.length===2){return (obj[0]+obj[1])/2}
        var max = parseFloat(Math.max(...obj))
        var min = parseFloat(Math.min(...obj))
        const boundary = minNumber
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
    function linearRegression(data){
        var lr = {};
        var n = data.length;
        var sum_x = 0;
        var sum_y = 0;
        var sum_xy = 0;
        var sum_xx = 0;
        var sum_yy = 0;
        for (var i = 0; i < data.length; i++) {
            sum_x += data[i][0];
            sum_y += data[i][1];
            sum_xy += (data[i][0]*data[i][1]);
            sum_xx += (data[i][0]*data[i][0]);
            sum_yy += (data[i][1]*data[i][1]);
        } 
        lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
        lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
        lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);
        return lr;
    }
}