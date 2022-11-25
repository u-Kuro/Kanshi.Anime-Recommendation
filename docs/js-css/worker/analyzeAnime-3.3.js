self.onmessage = (message) => {
    const minNumber = 1-6e-17!==1? 6e-17 : 1e-16 // Min Value Javascript
    const mediaRelationTypes = ["adaptation","prequel","sequel","parent","side_story","summary","alternative","spin_off"]
    var data = message.data
    var animeEntries = data.animeEntries
    var savedRecScheme = data.savedRecScheme
    var recSchemeIsNew = Object.keys(savedRecScheme).length===0?true:false
    var userListStatus = data.userListStatus
    var varScheme = data.varScheme
    var allFilterInfo = data.allFilterInfo || {}
    var alteredVariables = data.alteredVariables
    var animeFranchises = []
    const hideUnwatchedSequels = data.hideUnwatchedSequels || undefined
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
    popularityMode = popularityMode.length>0?Math.min(arrayMean(popularityMode),arrayMode(popularityMode)):0
    averageScoreMode = averageScoreMode.length>0?Math.min(arrayMean(averageScoreMode),arrayMode(averageScoreMode)):0
    if(!jsonIsEmpty(varScheme)){
        for(let i=0; i<animeEntries.length; i++){
            var animeShallUpdate = false
            var anime = animeEntries[i]
            var title = anime.title.userPreferred
            var anilistId = anime.id
            var animeUrl = anime.siteUrl
            var format = anime.format
            var year = anime.seasonYear
            var season = anime.season
            var genres = anime.genres
            var tags = anime.tags
            var studios = anime.studios.nodes.filter((studio)=>{return studio.isAnimationStudio})
            var staff = anime.staff.edges
            var status = anime.status
            var popularity = anime.popularity
            // Check Status
              // For Unwatched
            var userStatus = "UNWATCHED"
            if(allFilterInfo["user status: "+userStatus.toLowerCase()]===undefined&&allFilterInfo["!user status: "+userStatus.toLowerCase()]===undefined){
                allFilterInfo["user status: "+userStatus.toLowerCase()] = 0
                allFilterInfo["!user status: "+userStatus.toLowerCase()] = 0
            }
            if(typeof userListStatus[anilistId]==="string"){
                userStatus = userListStatus[anilistId]
                if(allFilterInfo["user status: "+userStatus.toLowerCase()]===undefined&&allFilterInfo["!user status: "+userStatus.toLowerCase()]===undefined){
                    allFilterInfo["user status: "+userStatus.toLowerCase()] = 0
                    allFilterInfo["!user status: "+userStatus.toLowerCase()] = 0
                }
            }
            // Update Anime Franchises
            var afIdxs = animeFranchises.reduce((result,e,idx)=>{if(e.includes(anilistId)){result.push(idx);}return result},[])
            var afIdx
            if(afIdxs.length>1||afIdxs.length<1){
                // Union if there are duplicate franchise
                if(afIdxs.length>1){
                    var newFranchise = animeFranchises[afIdxs[0]]
                    for(let j=1;j<afIdxs.length;j++){
                        newFranchise = [...new Set([...newFranchise, ...animeFranchises[afIdxs[j]]])]
                    }
                    // Remove Old Duplicates
                    afIdxs.sort((a,b)=>b-a)
                    for(let j=0;j<afIdxs.length;j++){
                        animeFranchises.splice(afIdxs[j],1)
                    }
                    // Add New Unioned Franchise
                    animeFranchises.push(newFranchise)
                // If its a New Franchise
                } else {
                    animeFranchises.push([anilistId])
                }
                // Get the index of the New Franchise
                afIdx = animeFranchises.length-1
            } 
            // else if there is only one
            else {
                // Index of Franchise
                afIdx = animeFranchises.findIndex((e)=>e.includes(anilistId))
            }
            // Next add each Anime relations to its franchise
            if(anime.relations!==null){
                var animeRelations = anime.relations.edges
                if(animeRelations instanceof Array){
                    animeRelations.forEach((e)=>{
                        var animeRelationType = typeof e.relationType==="string"? e.relationType: ""
                        var animeRelationNode = e.node
                        var relationID =  animeRelationNode!==null? animeRelationNode.id : undefined
                        if(typeof relationID==="number"&&(mediaRelationTypes.includes(animeRelationType.toLowerCase()))){
                            if(!animeFranchises[afIdx].includes(relationID)){
                                animeFranchises[afIdx].push(relationID)
                            }
                        }
                    })
                }
            }
            // Hide Unwatched Sequels
            if(anime.relations!==null&&hideUnwatchedSequels){
                var animeRelations = anime.relations.edges
                // Conditions
                var isUnwatchedSequel = 
                  // No Prequel
                !animeRelations.some((e)=>{
                    var animeRelationType = e.relationType
                    if(typeof animeRelationType==="string"){
                        if(animeRelationType.toLowerCase()==="prequel"){
                            return true
                        }
                    }
                }) 
                ||  
                  // or Have Prequel but...
                (animeRelations.some((e)=>{
                    var animeRelationType = e.relationType
                    var animeRelationNode = e.node
                    if(typeof animeRelationType==="string"&&animeRelationNode!==undefined){
                        if(animeRelationNode!==null){
                            var animeRelationPopularity = animeRelationNode.popularity
                            if(animeRelationType.toLowerCase()==="prequel"){
                                // ...Prequel is Watched
                                if(typeof userListStatus[animeRelationNode.id]==="string"){
                                    if(( userListStatus[animeRelationNode.id].toLowerCase()==="completed"
                                        ||userListStatus[animeRelationNode.id].toLowerCase()==="repeating")){
                                        return true
                                    }
                                // ...Prequel is a Small/Unpopular Anime
                                } else if(userListStatus[animeRelationNode.id]===undefined&&typeof animeRelationPopularity==="number"&&typeof popularity==="number"){
                                    if(animeRelationPopularity<=popularity){
                                        return true
                                    }
                                }
                            }
                        }
                    }
                }))
                // Don't Include if Anime Entry 
                if(!isUnwatchedSequel){
                    delete savedRecScheme[anilistId]
                    continue
                }
            }
            if(allFilterInfo["staff: "]===undefined&&allFilterInfo["!staff: "]===undefined){
                allFilterInfo["staff: "] = 0
                allFilterInfo["!staff: "] = 0
            }
            //
            if(allFilterInfo["format: all"]===undefined&&allFilterInfo["!format: all"]===undefined){
                allFilterInfo["format: all"] = 0
                allFilterInfo["!format: all"] = 0
            }
            if(allFilterInfo["genre: all"]===undefined&&allFilterInfo["!genre: all"]===undefined){
                allFilterInfo["genre: all"] = 0 
                allFilterInfo["!genre: all"] = 0
            }
            if(allFilterInfo["tag category: all"]===undefined&&allFilterInfo["!tag category: all"]===undefined){
                allFilterInfo["tag category: all"] = 0 
                allFilterInfo["!tag category: all"] = 0
            }
            if(allFilterInfo["tag: all"]===undefined&&allFilterInfo["!tag: all"]===undefined){
                allFilterInfo["tag: all"] = 0 
                allFilterInfo["!tag: all"] = 0
            }
            if(allFilterInfo["studio: all"]===undefined&&allFilterInfo["!studio: all"]===undefined){
                allFilterInfo["studio: all"] = 0  
                allFilterInfo["!studio: all"] = 0
            }
            if(allFilterInfo["staff role: all"]===undefined&&allFilterInfo["!staff role: all"]===undefined){
                allFilterInfo["staff role: all"] = 0
                allFilterInfo["!staff role: all"] = 0
            }
            if(allFilterInfo["staff: all"]===undefined&&allFilterInfo["!staff: all"]===undefined){
                allFilterInfo["staff: all"] = 0
                allFilterInfo["!staff: all"] = 0
            }
            //
            if(allFilterInfo["title: "+(title||"n/a").toString().toLowerCase()]===undefined){
                allFilterInfo["title: "+(title||"n/a").toString().toLowerCase()] = 0
            }
            if(allFilterInfo["format: "+(format||"n/a").toString().toLowerCase()]===undefined&&allFilterInfo["!format: "+(format||"n/a").toString().toLowerCase()]===undefined){
                allFilterInfo["format: "+(format||"n/a").toString().toLowerCase()] = 0
                allFilterInfo["!format: "+(format||"n/a").toString().toLowerCase()] = 0
            }
            if(allFilterInfo[`year: ${(year||"n/a")}`.toLowerCase()]===undefined&&allFilterInfo[`!year: ${(year||"n/a")}`.toLowerCase()]===undefined){
                allFilterInfo[`year: ${(year||"n/a")}`.toLowerCase()] = 0  
                allFilterInfo[`!year: ${(year||"n/a")}`.toLowerCase()] = 0
            }
            if(allFilterInfo["season: "+(season||"n/a").toString().toLowerCase()]===undefined&&allFilterInfo["!season: "+(season||"n/a").toString().toLowerCase()]===undefined){
                allFilterInfo["season: "+(season||"n/a").toString().toLowerCase()] = 0
                allFilterInfo["!season: "+(season||"n/a").toString().toLowerCase()] = 0
            }
            if(allFilterInfo["status: "+(status||"n/a").toString().toLowerCase()]===undefined&&allFilterInfo["!status: "+(status||"n/a").toString().toLowerCase()]===undefined){
                allFilterInfo["status: "+(status||"n/a").toString().toLowerCase()] = 0
                allFilterInfo["!status: "+(status||"n/a").toString().toLowerCase()] = 0
            }

            // Arrange
            var xformat = format?`format: ${format.toLowerCase()}`:Math.random()
            if(alteredVariables.format_in["format: "+xformat]!==undefined||recSchemeIsNew) animeShallUpdate=true
            var xgenres = []
            for(let j=0; j<genres.length; j++){
                if(typeof genres[j]!=="string") continue
                if((alteredVariables.genres_in["genre: "+genres[j].toLowerCase()]!==undefined&&!animeShallUpdate)||recSchemeIsNew) {
                    animeShallUpdate = true
                }
                xgenres.push("genre: "+genres[j].toLowerCase())
                if(allFilterInfo["genre: "+genres[j].toLowerCase()]===undefined&&allFilterInfo["!genre: "+genres[j].toLowerCase()]===undefined){
                    allFilterInfo["genre: "+genres[j].toLowerCase()] = 0 
                    allFilterInfo["!genre: "+genres[j].toLowerCase()] = 0
                }
            }
            var xtags = []
            for(let j=0; j<tags.length; j++){
                if(typeof tags[j].name!=="string"&&typeof tags[j].category!=="string"&&typeof tags[j].rank!=="number") continue
                if((alteredVariables.tags_in["tag: "+tags[j].name.toLowerCase()]!==undefined&&!animeShallUpdate)||recSchemeIsNew) {
                    animeShallUpdate = true
                }
                xtags.push({name:"tag: "+tags[j].name.toLowerCase(),rank:tags[j].rank,category:"category: "+tags[j].category.toLowerCase()})
                if(allFilterInfo["tag category: "+tags[j].category.toLowerCase()]===undefined&&allFilterInfo["!tag category: "+tags[j].category.toLowerCase()]===undefined){
                    allFilterInfo["tag category: "+tags[j].category.toLowerCase()] = 0 
                    allFilterInfo["!tag category: "+tags[j].category.toLowerCase()] = 0
                }
                if(allFilterInfo["tag: "+tags[j].name.toLowerCase()]===undefined&&allFilterInfo["!tag: "+tags[j].name.toLowerCase()]===undefined){
                    allFilterInfo["tag: "+tags[j].name.toLowerCase()] = 0 
                    allFilterInfo["!tag: "+tags[j].name.toLowerCase()] = 0
                }
            }
            var xstudios = []
            var includedStudio = {}
            for(let j=0; j<studios.length; j++){
                if(typeof studios[j].name!=="string") continue
                if(!studios[j].isAnimationStudio) continue
                if(includedStudio[studios[j].name.toLowerCase()]!==undefined) continue
                else includedStudio[studios[j].name.toLowerCase()] = null
                if((alteredVariables.studios_in["studio: "+studios[j].name.toLowerCase()]!==undefined&&!animeShallUpdate)||recSchemeIsNew) {
                    animeShallUpdate = true
                }
                xstudios.push({name:"studio: "+studios[j].name.toLowerCase(),siteUrl:studios[j].siteUrl})
                // Should Remove Since It's Lagging on Too Much Filters
                if(allFilterInfo["studio: "+studios[j].name.toLowerCase()]===undefined&&allFilterInfo["!studio: "+studios[j].name.toLowerCase()]===undefined){
                    allFilterInfo["studio: "+studios[j].name.toLowerCase()] = 0  
                    allFilterInfo["!studio: "+studios[j].name.toLowerCase()] = 0
                }
            }
            var xstaff = []
            var includedStaff = {}
            for(let j=0; j<staff.length; j++){
                if(!staff[j].node&&typeof staff[j].role!=="string") continue
                if(!staff[j].node.name) continue
                if(typeof staff[j].node.name.userPreferred!=="string") continue
                if(includedStaff[staff[j].node.name.userPreferred.toLowerCase()]!==undefined) continue
                else includedStaff[staff[j].node.name.userPreferred.toLowerCase()] = null
                if((alteredVariables.staff_in["staff: "+staff[j].node.name.userPreferred.toLowerCase()]!==undefined&&!animeShallUpdate)||recSchemeIsNew) {
                    animeShallUpdate = true
                }
                xstaff.push({staff:"staff: "+staff[j].node.name.userPreferred.toLowerCase(), role:"role: "+staff[j].role.split("(")[0].trim().toLowerCase(), siteUrl:staff[j].node.siteUrl})
                if(allFilterInfo["staff role: "+staff[j].role.split("(")[0].trim().toLowerCase()]===undefined&&allFilterInfo["!staff role: "+staff[j].role.split("(")[0].trim().toLowerCase()]===undefined){
                    allFilterInfo["staff role: "+staff[j].role.split("(")[0].trim().toLowerCase()] = 0
                    allFilterInfo["!staff role: "+staff[j].role.split("(")[0].trim().toLowerCase()] = 0
                }
                // Removed Since It's Lagging on Too Much Filters
                // if(allFilterInfo[("staff: "+staff[j].node.name.userPreferred).toLowerCase()]===undefined&&allFilterInfo[("!staff: "+staff[j].node.name.userPreferred).toLowerCase()]===undefined){
                //     allFilterInfo[("staff: "+staff[j].node.name.userPreferred).toLowerCase()] = 0
                //     allFilterInfo["!staff: "+(staff[j].node.name.userPreferred).toLowerCase()] = 0
                // }
            }
            // Check if any variable is Altered, and continue
            if(!animeShallUpdate) continue
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
            var zgenres = []
            for(let j=0; j<xgenres.length; j++){
                if(varScheme.genres[xgenres[j]]!==undefined) {
                    zgenres.push(varScheme.genres[xgenres[j]])
                } else {
                    zgenres.push(varScheme.meanGenres-minNumber)
                }
                if(varScheme.genres[xgenres[j]]!==undefined) {
                    if(varScheme.genres[xgenres[j]]>=varScheme.meanGenres
                        &&genresIncluded[xgenres[j]]===undefined){
                        var tmpscore = varScheme.genres[xgenres[j]]
                        genresIncluded[xgenres[j]] = [xgenres[j].replace("genre: ","").trim()+" ("+tmpscore.toFixed(2)+")",tmpscore]
                    }
                }
            }
            var ztags = []
            for(let j=0; j<xtags.length; j++){
                if(!jsonIsEmpty(varScheme.includeCategories)){
                    if(varScheme.includeCategories[xtags[j].category]!==undefined){
                        if(varScheme.tags[xtags[j].name]!==undefined){
                            if(xtags[j].rank>=50 || varScheme.tags[xtags[j].name]<varScheme.meanTags){
                                ztags.push(varScheme.tags[xtags[j].name])
                            } else {
                                ztags.push(varScheme.meanTags-minNumber)
                            }
                        }
                        if(varScheme.tags[xtags[j].name]!==undefined && xtags[j].rank>=50){
                            if(varScheme.tags[xtags[j].name]>=varScheme.meanTags
                                &&tagsIncluded[xtags[j].name]===undefined){
                                var tmpscore = varScheme.tags[xtags[j].name]
                                tagsIncluded[xtags[j].name] = [xtags[j].name.replace("tag: ","").trim()+" ("+tmpscore.toFixed(2)+")",tmpscore]
                            }
                        }
                    }
                } else {
                    if(varScheme.excludeCategories[xtags[j].category]===undefined){
                        if(varScheme.tags[xtags[j].name]!==undefined){
                            if(xtags[j].rank>=50 || varScheme.tags[xtags[j].name]<varScheme.meanTags){
                                ztags.push(varScheme.tags[xtags[j].name])
                            } else {
                                ztags.push(varScheme.meanTags-minNumber)
                            }
                        }
                        if(varScheme.tags[xtags[j].name]!==undefined && xtags[j].rank>=50){
                            if(varScheme.tags[xtags[j].name]>=varScheme.meanTags
                                &&tagsIncluded[xtags[j].name]===undefined){
                                var tmpscore = varScheme.tags[xtags[j].name]
                                tagsIncluded[xtags[j].name] = [xtags[j].name.replace("tag: ","").trim()+" ("+tmpscore.toFixed(2)+")",tmpscore]
                            }
                        }
                    }
                }
            }
            var zstudios = []
            var includedStudio = {}
            for(let j=0; j<xstudios.length; j++){
                if(includedStudio[xstudios[j].name]!==undefined) continue
                else includedStudio[xstudios[j].name] = null
                if(varScheme.studios[xstudios[j].name]!==undefined){
                    zstudios.push(varScheme.studios[xstudios[j].name])
                } else {
                    zstudios.push(varScheme.meanStudios-minNumber)
                }
                if(varScheme.studios[xstudios[j].name]!==undefined) {
                    if(varScheme.studios[xstudios[j].name]>=varScheme.meanStudios
                        &&studiosIncluded[xstudios[j].name]===undefined){
                        var tmpscore = varScheme.studios[xstudios[j].name]
                        studiosIncluded[xstudios[j].name] = [{[xstudios[j].name.replace("studio: ","").trim()+" ("+tmpscore.toFixed(2)+")"]: xstudios[j].siteUrl},tmpscore]
                    }
                }
            }
            var zstaff = {}
            var includedStaff = {}
            for(let j=0; j<xstaff.length; j++){
                if(includedStaff[xstaff[j].staff+xstaff[j].role]!==undefined) continue
                else includedStaff[xstaff[j].staff+xstaff[j].role] = null
                if(!jsonIsEmpty(varScheme.includeRoles)){
                    if(varScheme.includeRoles[xstaff[j].role]!==undefined){
                        if(varScheme.staff[xstaff[j].staff]!==undefined){
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
                        if(varScheme.staff[xstaff[j].staff]!==undefined) {
                            if(varScheme.staff[xstaff[j].staff]>=varScheme.meanStaff
                                &&staffIncluded[xstaff[j].staff]===undefined){
                                var tmpscore = varScheme.staff[xstaff[j].staff]
                                staffIncluded[xstaff[j].staff] = [{[xstaff[j].staff.replace("staff",xstaff[j].role.replace("role: ","")).trim()+" ("+tmpscore.toFixed(2)+")"]: xstaff[j].siteUrl},tmpscore]
                            }
                        }
                    }
                } else {
                    if(varScheme.excludeRoles[xstaff[j].role]===undefined){
                        if(varScheme.staff[xstaff[j].staff]!==undefined){
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
                        if(varScheme.staff[xstaff[j].staff]!==undefined) {
                            if(varScheme.staff[xstaff[j].staff]>=varScheme.meanStaff
                                &&staffIncluded[xstaff[j].staff]===undefined){
                                var tmpscore = varScheme.staff[xstaff[j].staff]
                                staffIncluded[xstaff[j].staff] = [{[xstaff[j].staff.replace("staff",xstaff[j].role.replace("role: ","")).trim()+" ("+tmpscore.toFixed(2)+")"]: xstaff[j].siteUrl},tmpscore]
                            }
                        }
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
            if(isaN(popularity)&&varScheme.popularityModel!==undefined){
                var tempLRPredict = LRpredict(varScheme.popularityModel,popularity)
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
                arrayMean(animeProductionOS)
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
            genres = genres.length>0?genres.join(", "):[]
            var tempTags = []
            for(let k=0; k<tags.length; k++){
                tempTags.push(tags[k].name)
            }
            tags = tempTags.length>0?tempTags.join(", "):[]
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
            //
            var variablesIncluded = Object.values(genresIncluded)
                .concat(Object.values(tagsIncluded))
                .concat(Object.values(studiosIncluded))
                .concat(Object.values(staffIncluded))
            // Sort Variable Influence
            variablesIncluded.sort((a,b)=>{
                return b[1] - a[1]
            })
            var tempVariablesIncluded = []
            for(let i=0;i<variablesIncluded.length;i++){
                tempVariablesIncluded.push(variablesIncluded[i][0])
            }
            variablesIncluded = tempVariablesIncluded.length>0?tempVariablesIncluded : []
            savedRecScheme[anilistId] = {
                id: anilistId, title: title, animeUrl: animeUrl, score: score, weightedScore: weightedScore, 
                userStatus: userStatus, status: status, genres: genres, tags: tags, year: year, 
                season: season, format: format, studios: studios, staff: staff,
                variablesIncluded: variablesIncluded, analyzedVariableCount: analyzedVariableCount,
                popularity: popularity,
            }
        }
        // Add Weight to Scores
        var savedRecSchemeEntries = Object.keys(savedRecScheme)
        for(let i=0;i<savedRecSchemeEntries.length;i++){
            var anime = savedRecScheme[savedRecSchemeEntries[i]]
            if(anime.popularity<popularityMode) {
                savedRecScheme[savedRecSchemeEntries[i]].weightedScore = (
                    (anime.popularity||0)===0? (minNumber/popularitySum)*anime.weightedScore
                    : (anime.popularity/popularitySum)*anime.weightedScore
                )
            }
            if(!anime.weightedScore||!isFinite(anime.weightedScore)){
                savedRecScheme[savedRecSchemeEntries[i]].weightedScore = 0
            }
            if(!anime.score||!isFinite(anime.score)){
                savedRecScheme[savedRecSchemeEntries[i]].score = 0
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
            var year = anime.seasonYear
            var season = anime.season
            var genres = anime.genres
            var tags = anime.tags
            var studios = anime.studios.nodes.filter((studio)=>{return studio.isAnimationStudio})
            var staff = anime.staff.edges
            var status = anime.status
            var userStatus = "UNWATCHED"
            
            //
            if(allFilterInfo["staff: "]===undefined&&allFilterInfo["!staff: "]===undefined){
                allFilterInfo["staff: "] = 0
                allFilterInfo["!staff: "] = 0
            }
            //
            if(allFilterInfo["format: all"]===undefined&&allFilterInfo["!format: all"]===undefined){
                allFilterInfo["format: all"] = 0
                allFilterInfo["!format: all"] = 0
            }
            if(allFilterInfo["genre: all"]===undefined&&allFilterInfo["!genre: all"]===undefined){
                allFilterInfo["genre: all"] = 0 
                allFilterInfo["!genre: all"] = 0
            }
            if(allFilterInfo["tag category: all"]===undefined&&allFilterInfo["!tag category: all"]===undefined){
                allFilterInfo["tag category: all"] = 0 
                allFilterInfo["!tag category: all"] = 0
            }
            if(allFilterInfo["tag: all"]===undefined&&allFilterInfo["!tag: all"]===undefined){
                allFilterInfo["tag: all"] = 0 
                allFilterInfo["!tag: all"] = 0
            }
            if(allFilterInfo["studio: all"]===undefined&&allFilterInfo["!studio: all"]===undefined){
                allFilterInfo["studio: all"] = 0  
                allFilterInfo["!studio: all"] = 0
            }
            if(allFilterInfo["staff role: all"]===undefined&&allFilterInfo["!staff role: all"]===undefined){
                allFilterInfo["staff role: all"] = 0
                allFilterInfo["!staff role: all"] = 0
            }
            if(allFilterInfo["staff: all"]===undefined&&allFilterInfo["!staff: all"]===undefined){
                allFilterInfo["staff: all"] = 0
                allFilterInfo["!staff: all"] = 0
            }
            //
            if(allFilterInfo["title: "+(title||"n/a").toString().toLowerCase()]===undefined){
                allFilterInfo["title: "+(title||"n/a").toString().toLowerCase()] = 0
            }
            if(allFilterInfo["format: "+(format||"n/a").toString().toLowerCase()]===undefined&&allFilterInfo["!format: "+(format||"n/a").toString().toLowerCase()]===undefined){
                allFilterInfo["format: "+(format||"n/a").toString().toLowerCase()] = 0
                allFilterInfo["!format: "+(format||"n/a").toString().toLowerCase()] = 0
            }
            if(allFilterInfo[`year: ${(year||"n/a")}`.toLowerCase()]===undefined&&allFilterInfo[`!year: ${(year||"n/a")}`.toLowerCase()]===undefined){
                allFilterInfo[`year: ${(year||"n/a")}`.toLowerCase()] = 0  
                allFilterInfo[`!year: ${(year||"n/a")}`.toLowerCase()] = 0
            }
            if(allFilterInfo["season: "+(season||"n/a").toString().toLowerCase()]===undefined&&allFilterInfo["!season: "+(season||"n/a").toString().toLowerCase()]===undefined){
                allFilterInfo["season: "+(season||"n/a").toString().toLowerCase()] = 0
                allFilterInfo["!season: "+(season||"n/a").toString().toLowerCase()] = 0
            }
            if(allFilterInfo["status: "+(status||"n/a").toString().toLowerCase()]===undefined&&allFilterInfo["!status: "+(status||"n/a").toString().toLowerCase()]===undefined){
                allFilterInfo["status: "+(status||"n/a").toString().toLowerCase()] = 0
                allFilterInfo["!status: "+(status||"n/a").toString().toLowerCase()] = 0
            }
            // Arrange
            for(let j=0; j<genres.length; j++){
                if(typeof genres[j]!=="string") continue
                if(allFilterInfo["genre: "+genres[j].toLowerCase()]===undefined&&allFilterInfo["!genre: "+genres[j].toLowerCase()]===undefined){
                    allFilterInfo["genre: "+genres[j].toLowerCase()] = 0 
                    allFilterInfo["!genre: "+genres[j].toLowerCase()] = 0
                }
            }
            for(let j=0; j<tags.length; j++){
                if(typeof tags[j].category!=="string"&&typeof tags[j].name!=="string") continue
                if(allFilterInfo["tag category: "+tags[j].category.toLowerCase()]===undefined&&allFilterInfo["!tag category: "+tags[j].category.toLowerCase()]===undefined){
                    allFilterInfo["tag category: "+tags[j].category.toLowerCase()] = 0 
                    allFilterInfo["!tag category: "+tags[j].category.toLowerCase()] = 0
                }
                if(allFilterInfo["tag: "+tags[j].name.toLowerCase()]===undefined&&allFilterInfo["!tag: "+tags[j].name.toLowerCase()]===undefined){
                    allFilterInfo["tag: "+tags[j].name.toLowerCase()] = 0 
                    allFilterInfo["!tag: "+tags[j].name.toLowerCase()] = 0
                }
            }
            for(let j=0; j<studios.length; j++){
                if(typeof studios[j].name!=="string") continue
                // Should Remove Since It's Lagging on Too Much Filters
                if(allFilterInfo["studio: "+studios[j].name.toLowerCase()]===undefined&&allFilterInfo["!studio: "+studios[j].name.toLowerCase()]===undefined){
                    allFilterInfo["studio: "+studios[j].name.toLowerCase()] = 0  
                    allFilterInfo["!studio: "+studios[j].name.toLowerCase()] = 0
                }
            }
            for(let j=0; j<staff.length; j++){
                if(typeof staff[j].role!=="string") continue//&&!staff[j].node) continue
                //if(!staff[j].node.name) continue
                //if(typeof staff[j].node.name.userPreferred!=="string") continue
                if(allFilterInfo["staff role: "+staff[j].role.split("(")[0].trim().toLowerCase()]===undefined&&allFilterInfo["!staff role: "+staff[j].role.split("(")[0].trim().toLowerCase()]===undefined){
                    allFilterInfo["staff role: "+staff[j].role.split("(")[0].trim().toLowerCase()] = 0
                    allFilterInfo["!staff role: "+staff[j].role.split("(")[0].trim().toLowerCase()] = 0
                }
                // Removed Since It's Lagging on Too Much Filters
                // if(allFilterInfo[("staff: "+staff[j].node.name.userPreferred).toLowerCase()]===undefined&&allFilterInfo[("!staff: "+staff[j].node.name.userPreferred).toLowerCase()]===undefined){
                //     allFilterInfo[("staff: "+staff[j].node.name.userPreferred).toLowerCase()] = 0
                //     allFilterInfo["!staff: "+(staff[j].node.name.userPreferred).toLowerCase()] = 0
                // }
            }
            var analyzedVariableCount = {
                all: 0,
                format: 0,
                genres: 0,
                tags: 0,
                studios: 0,
                staff: 0
            }
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
            genres = genres.length>0?genres.join(", "):[]
            var tempTags = []
            for(let k=0; k<tags.length; k++){
                tempTags.push(tags[k].name)
            }
            tags = tempTags.length>0?tempTags.join(", "):[]
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
        var savedRecSchemeEntries = Object.keys(savedRecScheme)
        for(let i=0;i<savedRecSchemeEntries.length;i++){
            var anime = savedRecScheme[savedRecSchemeEntries[i]]
            if(anime.popularity<popularityMode) {
                savedRecScheme[savedRecSchemeEntries[i]].weightedScore = (
                    (anime.popularity||0)===0? (minNumber/popularitySum)*anime.weightedScore
                    : (anime.popularity/popularitySum)*anime.weightedScore
                )
            }
            if(!anime.weightedScore||!isFinite(anime.weightedScore)){
                savedRecScheme[savedRecSchemeEntries[i]].weightedScore = 0
            }
            if(!anime.score||!isFinite(anime.score)){
                savedRecScheme[savedRecSchemeEntries[i]].score = 0
            }
        }
    }
    self.postMessage({
        savedRecScheme: savedRecScheme,
        allFilterInfo: allFilterInfo,
        animeFranchises: animeFranchises
    })
    // Used Functions
    function isaN(num){
        if(num===null){return false}
        else if(typeof num==='string'){if(num.split(' ').join('').length===0){return false}}
        else if(typeof num==='boolean'){return false}
        else return !isNaN(num)
    }
    function isJson(j){
        if(j instanceof Array||typeof j==="string") return false
        for(e in j) return true
        return false
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