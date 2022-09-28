self.onmessage = (message) => {
    const data = message.data
    const userList = data.userList.data
    var savedUserList = data.savedUserList
    var alteredVariables = {
        format_in: {},
        year_in: {},
        season_in: {},
        genres_in: {},
        tags_in: {},
        studios_in: {},
        staff_in: {}
    }
    //Concat Completed, Watching, Drop, etc.
    var animeList = userList.MediaListCollection.lists
    var animeEntries = []
    for(let i=0; i<animeList.length-1; i++){
        animeEntries = animeList[i].entries.concat(animeList[++i].entries)
    }
    var varScheme = {}
    // Check Watched
    var userListStatus = []
    for(let i=0; i<animeList.length; i++){
        for(let j=0; j<animeList[i].entries.length; j++){ 
            userListStatus.push({
                title: animeList[i].entries[j].media.title.userPreferred,
                status: animeList[i].status
            })
        }
    }
    // For Linear Regression Models
    var episodes = []
    var duration = []
    var averageScore = []
    var trending = []
    var popularity = []
    var favourites = []
    //
    var genresCount = []
    var tagsCount = []
    var studiosCount = []
    var staffCount = []
    //
    var formatMedianCount = {}
    var yearMedianCount = {}
    var seasonMedianCount = {}
    var genresMedianCount = {}
    var tagsMedianCount = {}
    var studiosMedianCount = {}
    var staffMedianCount = {}
    // For checking any deleted Anime
    var savedUserListTitles = Object.keys(savedUserList)
    // Analyze each Anime Variable
    for(let i=0; i<animeEntries.length; i++){
        // Check Any Changes in User List
        var isNewAnime = false
        var anime = animeEntries[i].media
        var title = anime.title.userPreferred
        var editedEntry = JSON.parse(JSON.stringify(animeEntries[i]))
        delete editedEntry.media.duration
        delete editedEntry.media.trending
        delete editedEntry.media.popularity
        delete editedEntry.media.favourites
        var newAnimeObjStr = JSON.stringify(editedEntry)
        if(savedUserList[title]===undefined){
            isNewAnime = true
            savedUserList[title] = newAnimeObjStr
        } else {
            // Filter Anime not in the savedUserList, if one is deleted in Anilist
            savedUserListTitles = savedUserListTitles.filter((savedTitle)=>{return savedTitle!==title})
        }
        if(animeEntries[i].score>0){
            var userScore = animeEntries[i].score
            var format = {}
            var year = {}
            var season = {}
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
                    if(formatMedianCount["Format: "+anime.format]===undefined){
                        formatMedianCount["Format: "+anime.format] = 1
                    } else {
                        formatMedianCount["Format: "+anime.format] += 1
                    }
                }
                if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&anime.format!==null){
                    savedUserList[title] = newAnimeObjStr
                    if(alteredVariables.format_in["Format: "+anime.format]===undefined){
                        alteredVariables.format_in["Format: "+anime.format] = 1
                    }
                }
                if(anime.seasonYear!==null){
                    if(year["Year: "+anime.seasonYear]===undefined){
                        year["Year: "+anime.seasonYear] = {userScore:[userScore],count:1}
                    } else {
                        year["Year: "+anime.seasonYear].userScore.push(userScore)
                        year["Year: "+anime.seasonYear].count += 1
                    }
                    if(yearMedianCount["Year: "+anime.seasonYear]===undefined){
                        yearMedianCount["Year: "+anime.seasonYear] = 1
                    } else {
                        yearMedianCount["Year: "+anime.seasonYear] += 1
                    }
                }
                if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&anime.seasonYear!==null){
                    savedUserList[title] = newAnimeObjStr
                    if(alteredVariables.year_in["Year: "+anime.seasonYear]===undefined){
                        alteredVariables.year_in["Year: "+anime.seasonYear]=1
                    }
                }
                if(anime.season!==null){
                    if(season["Season: "+anime.season]===undefined){
                        season["Season: "+anime.season] = {userScore:[userScore],count:1}
                    } else {
                        season["Season: "+anime.season].userScore.push(userScore)
                        season["Season: "+anime.season].count += 1
                    }
                    if(seasonMedianCount["Season: "+anime.season]===undefined){
                        seasonMedianCount["Season: "+anime.season] = 1
                    } else {
                        seasonMedianCount["Season: "+anime.season] += 1
                    }
                }
                if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&anime.season!==null){
                    savedUserList[title] = newAnimeObjStr
                    if(alteredVariables.season_in["Season: "+anime.season]===undefined){
                        alteredVariables.season_in["Season: "+anime.season] = 1
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
                        if(genresMedianCount["Genre: "+anime.genres[j]]===undefined){
                            genresMedianCount["Genre: "+anime.genres[j]] = 1
                        } else {
                            genresMedianCount["Genre: "+anime.genres[j]] += 1
                        }
                    }
                    if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&anime.genres[j]!==null){
                        savedUserList[title] = newAnimeObjStr
                        if(alteredVariables.genres_in["Genre: "+anime.genres[j]]===undefined){
                            alteredVariables.genres_in["Genre: "+anime.genres[j]] = 1
                        }
                    }
                }
                for(let j=0; j<anime.tags.length; j++){
                    if(anime.tags[j].name===null){
                        if(tags["Tag: "+anime.tags[j].name]===undefined){
                            tags["Tag: "+anime.tags[j].name] = {userScore:[userScore],count:1}
                        } else {
                            tags["Tag: "+anime.tags[j].name].userScore.push(userScore)
                            tags["Tag: "+anime.tags[j].name].count += 1
                        }
                        if(tagsMedianCount["Tag: "+anime.tags[j].name]===undefined){
                            tagsMedianCount["Tag: "+anime.tags[j].name] = 1
                        } else {
                            tagsMedianCount["Tag: "+anime.tags[j].name] += 1
                        }
                    }
                    if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&anime.tags[j].name!==null){
                        savedUserList[title] = newAnimeObjStr
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
                        if(studiosMedianCount["Studio: "+anime.studios.nodes[j].name]===undefined){
                            studiosMedianCount["Studio: "+anime.studios.nodes[j].name] = 1
                        } else {
                            studiosMedianCount["Studio: "+anime.studios.nodes[j].name] += 1
                        }
                    }
                    if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&anime.studios.nodes[j].name!==null){
                        savedUserList[title] = newAnimeObjStr
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
                        if(staffMedianCount["Staff: "+anime.staff.edges[j].node.name.userPreferred]===undefined){
                            staffMedianCount["Staff: "+anime.staff.edges[j].node.name.userPreferred] = 1
                        } else {
                            staffMedianCount["Staff: "+anime.staff.edges[j].node.name.userPreferred] += 1
                        }
                    }
                    if((savedUserList[title]!==newAnimeObjStr||isNewAnime)&&anime.staff.edges[j].node.name.userPreferred!==null){
                        savedUserList[title] = newAnimeObjStr
                        if(alteredVariables.staff_in["Staff: "+anime.staff.edges[j].node.name.userPreferred]===undefined){
                            alteredVariables.staff_in["Staff: "+anime.staff.edges[j].node.name.userPreferred] = 1
                        }
                    }
                }
                //
                // for(let j=0; j<anime.staff.edges.length; j++){
                //     var name = anime.staff.edges[j].node.name.userPreferred
                //         if(name!==null){
                //             if(staff["Role: "+role]===undefined){
                //                 staff["Role: "+role] = {["Staff: "+name]: {userScore:[userScore],count:1}}
                //             } else {
                //                 if(staff["Role: "+role]["Staff: "+name]===undefined){
                //                     staff["Role: "+role]["Staff: "+name] = {userScore:[userScore],count:1}
                //                 } else {
                //                     staff["Role: "+role]["Staff: "+name].userScore.push(userScore)
                //                     staff["Role: "+role]["Staff: "+name].count += 1
                //                 }
                //             }
                //             if(staffMedianCount["Staff: "+name]===undefined){
                //                 staffMedianCount["Staff: "+name] = 1
                //             } else {
                //                 staffMedianCount["Staff: "+name] += 1
                //             }
                //             if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                //                 savedUserList[title] = newAnimeObjStr
                //                 if(alteredVariables.staff_in["Staff: "+name]===undefined){
                //                     alteredVariables.staff_in["Staff: "+name] = 1
                //                 }
                //             }
                //         }
                //     }
                // }
                varScheme = {
                    format: format, year: year, season: season, genres: genres, tags: tags, studios: studios, staff: staff,
                }
            } else {
                var xformat = anime.format===null? null : "Format: "+anime.format
                if(xformat!==null){
                    if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                        savedUserList[title] = newAnimeObjStr
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
                    if(formatMedianCount[xformat]!==undefined){
                        formatMedianCount[xformat] += 1
                    } else {
                        formatMedianCount[xformat] = 1
                    }
                }
                var xyear = anime.seasonYear===null? null : "Year: "+anime.seasonYear.toString()
                if(xyear!==null){
                    if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                        savedUserList[title] = newAnimeObjStr
                        if(alteredVariables.year_in[xyear]===undefined){
                            alteredVariables.year_in[xyear] = 1
                        }
                    }
                    if(varScheme.year[xyear]!==undefined){
                        varScheme.year[xyear].userScore.push(userScore)
                        varScheme.year[xyear].count += 1
                    }
                    else{
                        varScheme.year[xyear] = {userScore:[userScore],count:1}
                    }
                    if(yearMedianCount[xyear]!==undefined){
                        yearMedianCount[xyear] += 1
                    } else {
                        yearMedianCount[xyear] = 1
                    }
                }
                var xseason = anime.season===null? null : "Season: "+anime.season
                if(xseason!==null){
                    if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                        savedUserList[title] = newAnimeObjStr
                        if(alteredVariables.season_in[xseason]===undefined){
                            alteredVariables.season_in[xseason] = 1
                        }
                    }
                    if(varScheme.season[xseason]!==undefined){
                        varScheme.season[xseason].userScore.push(userScore)
                        varScheme.season[xseason].count += 1
                    }
                    else{
                        varScheme.season[xseason] = {userScore:[userScore],count:1}
                    }
                    if(seasonMedianCount[xseason]!==undefined){
                        seasonMedianCount[xseason] += 1
                    } else {
                        seasonMedianCount[xseason] = 1
                    }
                }
                for(let j=0; j<anime.genres.length; j++){
                    var xgenres = anime.genres[j]===null? null : "Genre: "+anime.genres[j]
                    if(xgenres!==null){
                        if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                            savedUserList[title] = newAnimeObjStr
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
                        if(genresMedianCount[xgenres]!==undefined){
                            genresMedianCount[xgenres] += 1
                        } else {
                            genresMedianCount[xgenres] = 1
                        }
                    }
                }
                for(let j=0; j<anime.tags.length; j++){
                    var xtags = anime.tags[j].name===null? null : "Tag: "+anime.tags[j].name
                    if(xtags!==null){
                        if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                            savedUserList[title] = newAnimeObjStr
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
                        if(tagsMedianCount[xtags]!==undefined){
                            tagsMedianCount[xtags] += 1
                        } else {
                            tagsMedianCount[xtags] = 1
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
                        if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                            savedUserList[title] = newAnimeObjStr
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
                        if(studiosMedianCount[xstudios]!==undefined){
                            studiosMedianCount[xstudios] += 1
                        } else {
                            studiosMedianCount[xstudios] = 1
                        }
                    }
                }
                var includedStaff = {}
                for(let j=0; j<anime.staff.edges.length; j++){
                    if(includedStaff[anime.staff.edges[j].node.name.userPreferred]!==undefined) continue
                    else includedStaff[anime.staff.edges[j].node.name.userPreferred] = null
                    var xstaff = anime.staff.edges[j].node.name.userPreferred===null?null: "Staff: "+anime.staff.edges[j].node.name.userPreferred
                    if(xstaff!==null){
                        if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                            savedUserList[title] = newAnimeObjStr
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
                        if(staffMedianCount[xstaff]!==undefined){
                            staffMedianCount[xstaff] += 1
                        } else {
                            staffMedianCount[xstaff] = 1
                        }
                    }
                }
                // for(let j=0; j<anime.staff.edges.length; j++){
                //     var staff = anime.staff.edges[j]
                //     var xrole = staff.role===null?null:"Role: "+staff.role.split(" (")[0] //i.e Animator (Ep 1,2 etc)
                //     var xstaff = staff.node.name.userPreferred===null?null:"Staff: "+staff.node.name.userPreferred
                //     if(role!==null){
                //         if(xstaff!==null){
                //             if(savedUserList[title]!==newAnimeObjStr||isNewAnime){
                //                 savedUserList[title] = newAnimeObjStr
                //                 if(alteredVariables.staff_in[xstaff]===undefined){
                //                     alteredVariables.staff_in[xstaff] = 1
                //                 }
                //             }
                //             if(varScheme.staff[xrole]!==undefined){
                //                 if(varScheme.staff[xrole][xstaff]!==undefined){
                //                     varScheme.staff[xrole][xstaff].userScore.push(userScore)
                //                     varScheme.staff[xrole][xstaff].count += 1
                //                 } else {
                //                     varScheme.staff[xrole][xstaff] = {userScore:[userScore], count:1}     
                //                 }
                //             } else {
                //                 varScheme.staff[xrole] = {[xstaff]: {userScore:[userScore], count:1}}
                //             }
                //             if(staffMedianCount[xstaff]!==undefined){
                //                 staffMedianCount[xstaff] += 1
                //             } else {
                //                 staffMedianCount[xstaff] = 1
                //             }
                //         }
                //     }
                // }
            }
            // Number
            if(anime.episodes!==null){
                episodes.push({userScore: userScore, episodes: anime.episodes})
            }
            if(anime.duration!==null){
                duration.push({userScore: userScore, duration: anime.duration})
            }
            if(anime.averageScore!==null){
                averageScore.push({userScore: userScore, averageScore: anime.averageScore})
            }
            if(anime.trending!==null){
                trending.push({userScore: userScore, trending: anime.trending})
            }
            if(anime.popularity!==null){
                popularity.push({userScore: userScore, popularity: anime.popularity})
            }
            if(anime.favourites!==null){
                favourites.push({userScore: userScore, favourites: anime.favourites})
            }
            //
            if(anime.genres!==null){
                genresCount.push({userScore: userScore, genresCount: anime.genres.length})
            }
            if(anime.tags!==null){
                tagsCount.push({userScore: userScore, tagsCount: anime.tags.length})
            }
            if(anime.studios.nodes!==null){
                var studioLength = 0
                for(let i=0;i<anime.studios.nodes.length;i++){
                    if(!anime.studios.nodes[i].isAnimationStudio) continue
                    studioLength++
                }
                studiosCount.push({userScore: userScore, studiosCount: studioLength})
            }
            if(anime.staff.edges!==null){
                staffCount.push({userScore: userScore, staffCount: anime.staff.edges.length})
            }
        }
    }
    // Check and Remove if User Deleted an Anime, and add its variables as altered
    for(let i=0;i<savedUserListTitles.length;i++){
        var entry = JSON.parse(savedUserList[savedUserListTitles[i]])
        var anime = entry.media
        if(alteredVariables.format_in["Format: "+anime.format]===undefined){
            alteredVariables.format_in["Format: "+anime.format] = 1
        }
        if(alteredVariables.year_in["Year: "+anime.seasonYear]===undefined){
            alteredVariables.year_in["Year: "+anime.seasonYear]=1
        }
        if(alteredVariables.season_in["Season: "+anime.season]===undefined){
            alteredVariables.season_in["Season: "+anime.season] = 1
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
        delete savedUserList[savedUserListTitles[i]]
    }
    // Clean Data JSON
    formatMedianCount = Object.values(formatMedianCount).length>0 ? arrayMedian(Object.values(formatMedianCount)) : 0
    yearMedianCount = Object.values(yearMedianCount).length>0 ? arrayMedian(Object.values(yearMedianCount)) : 0
    seasonMedianCount = Object.values(seasonMedianCount).length>0 ? arrayMedian(Object.values(seasonMedianCount)) : 0
    genresMedianCount = Object.values(genresMedianCount).length>0 ? arrayMedian(Object.values(genresMedianCount)) : 0
    tagsMedianCount = Object.values(tagsMedianCount).length>0 ? arrayMedian(Object.values(tagsMedianCount)) : 0
    studiosMedianCount = Object.values(studiosMedianCount).length>0 ? arrayMedian(Object.values(studiosMedianCount)) : 0
    staffMedianCount = Object.values(staffMedianCount).length>0 ? arrayMedian(Object.values(staffMedianCount)) : 0
    //
    var formatKey = Object.keys(varScheme.format)
    var formatMean = []
    //
    for(let i=0; i<formatKey.length; i++){
        formatMean.push(arrayMean(varScheme.format[formatKey[i]].userScore))
    }
    formatMean = arrayMean(formatMean)
    for(let i=0; i<formatKey.length; i++){
        var tempScore = arrayMean(varScheme.format[formatKey[i]].userScore)
        var count = varScheme.format[formatKey[i]].count
        // Include High Weight or Low scored Variables to avoid High-scored Variables without enough sample
        if(count>=formatMedianCount||tempScore<formatMean){ 
            varScheme.format[formatKey[i]+"Dense"] = tempScore
        }
        varScheme.format[formatKey[i]] = tempScore
    }
    //
    var yearKey = Object.keys(varScheme.year)
    var yearMean = []
    for(let i=0; i<yearKey.length; i++){
        yearMean.push(arrayMean(varScheme.year[yearKey[i]].userScore))
    }
    yearMean = arrayMean(yearMean)
    for(let i=0; i<yearKey.length; i++){
        var tempScore = arrayMean(varScheme.year[yearKey[i]].userScore)
        var count = varScheme.year[yearKey[i]].count
        // Include High Weight or Low scored Variables to avoid High-scored Variables without enough sample
        if(count>=yearMedianCount||tempScore<yearMean){
            varScheme.year[yearKey[i]+"Dense"] = tempScore
        }
        varScheme.year[yearKey[i]] = tempScore
    }
    //
    var seasonKey = Object.keys(varScheme.season)
    var seasonMean = []
    for(let i=0; i<seasonKey.length; i++){
        seasonMean.push(arrayMean(varScheme.season[seasonKey[i]].userScore))
    }
    seasonMean = arrayMean(seasonMean)
    for(let i=0; i<seasonKey.length; i++){
        var tempScore = arrayMean(varScheme.season[seasonKey[i]].userScore)
        var count = varScheme.season[seasonKey[i]].count
        if(count>=seasonMedianCount||tempScore<seasonMean){
            varScheme.season[seasonKey[i]+"Dense"] = tempScore
        }
        varScheme.season[seasonKey[i]] = tempScore
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
        var count = varScheme.genres[genresKey[i]].count
        if(count>=genresMedianCount||tempScore<genresMean){
            varScheme.genres[genresKey[i]+"Dense"] = tempScore
        }
        varScheme.genres[genresKey[i]] = tempScore
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
        var count = varScheme.tags[tagsKey[i]].count
        if(count>=tagsMedianCount||tempScore<tagsMean){
            varScheme.tags[tagsKey[i]+"Dense"] = tempScore
        }
        varScheme.tags[tagsKey[i]] = tempScore
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
        var count = varScheme.studios[studiosKey[i]].count
        if(count>=studiosMedianCount||tempScore<studiosMean){
            varScheme.studios[studiosKey[i]+"Dense"] = tempScore
        }
        varScheme.studios[studiosKey[i]] = tempScore
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
        var count = varScheme.staff[staffKey[i]].count
        if(count>=staffMedianCount||tempScore<staffMean){
            varScheme.staff[staffKey[i]+"Dense"] = tempScore
        }
        varScheme.staff[staffKey[i]] = tempScore
    }
    //
    // var roleKey = Object.keys(varScheme.staff)
    // var staffMean = []
    // for(let i=0; i<roleKey.length; i++){
    //     var staffKey = Object.keys(varScheme.staff[roleKey[i]])
    //     for(let j=0;j<staffKey.length;j++){
    //         if(i==0&&j==0)console.log(varScheme.staff[roleKey[i]][staffKey[j]])
    //         staffMean.push(arrayMean(varScheme.staff[roleKey[i]][staffKey[j]].userScore))
    //     }
    // }
    // staffMean = arrayMean(staffMean)
    // for(let i=0; i<roleKey.length; i++){
    //     var staffKey = Object.keys(varScheme.staff[roleKey[i]])
    //     for(let j=0;j<staffKey.length;j++){
    //         var tempScore = arrayMean(varScheme.staff[roleKey[i]][staffKey[j]].userScore)
    //         var count = varScheme.staff[roleKey[i]][staffKey[j]].count
    //         if(count>=staffMedianCount||tempScore<staffMean){
    //             varScheme.staff[roleKey[i]][staffKey[j]+"Dense"] = tempScore
    //         }
    //         varScheme.staff[roleKey[i]][staffKey[j]] = tempScore
    //     }
    // }
    // Join Data
    var varSchemeKeys = Object.keys(varScheme)
    var tempVar = {
        meanGenres: genresMean,
        meanTags: tagsMean,
        meanStudios: studiosMean,
        meanStaff: staffMean
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
    var averageScoreX = [], averageScoreY = []
    for(let i=0; i<averageScore.length;i++){
        averageScoreX.push(averageScore[i].averageScore)
        averageScoreY.push(averageScore[i].userScore)
    }
    if(averageScoreX.length>0&&averageScoreY.length>0){
        tempVar["averageScoreModel"] = linearRegression(averageScoreX,averageScoreY)
    }
    // For Anime Length Model
    var animeLengthModels = []
    var episodesX = [], episodesY = []
    for(let i=0; i<episodes.length;i++){
        episodesX.push(episodes[i].episodes)
        episodesY.push(episodes[i].userScore)
    }
    animeLengthModels.push([linearRegression(episodesX,episodesY),"episodesModel"])
    var durationX = [], durationY = []
    for(let i=0; i<duration.length;i++){
        durationX.push(duration[i].duration)
        durationY.push(duration[i].userScore)
    }
    animeLengthModels.push([linearRegression(durationX,durationY),"durationModel"])
    var sortedAnimeLengthModels = animeLengthModels.sort(function(a, b) {
        return b[0].r2 - a[0].r2;
    })
    sortedAnimeLengthModels = sortedAnimeLengthModels[0]
    tempVar[sortedAnimeLengthModels[1]] = sortedAnimeLengthModels[0]
    // For Variable Count Model
    var wellKnownAnimeModels = []
    var trendingX = [], trendingY = []
    for(let i=0; i<trending.length;i++){
        trendingX.push(trending[i].trending)
        trendingY.push(trending[i].userScore)
    }
    wellKnownAnimeModels.push([linearRegression(trendingX,trendingY),"trendingModel"])
    var popularityX = [], popularityY = []
    for(let i=0; i<popularity.length;i++){
        popularityX.push(popularity[i].popularity)
        popularityY.push(popularity[i].userScore)
    }
    wellKnownAnimeModels.push([linearRegression(popularityX,popularityY),"popularityModel"])
    var favouritesX = [], favouritesY = []
    for(let i=0; i<favourites.length;i++){
        favouritesX.push(favourites[i].favourites)
        favouritesY.push(favourites[i].userScore)
    }
    wellKnownAnimeModels.push([linearRegression(favouritesX,favouritesY),"favouritesModel"])
    sortedWellKnownAnimeModels
    var sortedWellKnownAnimeModels = wellKnownAnimeModels.sort(function(a, b) {
        return b[0].r2 - a[0].r2;
    })
    sortedWellKnownAnimeModels = sortedWellKnownAnimeModels[0]
    tempVar[sortedWellKnownAnimeModels[1]] = sortedWellKnownAnimeModels[0]
    // // For Variable Count Model
    // var variableCountModels = []
    // var genresCountX = [], genresCountY = []
    // for(let i=0; i<genresCount.length;i++){
    //     genresCountX.push(genresCount[i].genresCount)
    //     genresCountY.push(genresCount[i].userScore)
    // }
    // variableCountModels.push([linearRegression(genresCountX,genresCountY),"genresCountModel"])
    // var tagsCountX = [], tagsCountY = []
    // for(let i=0; i<tagsCount.length;i++){
    //     tagsCountX.push(tagsCount[i].tagsCount)
    //     tagsCountY.push(tagsCount[i].userScore)
    // }
    // variableCountModels.push([linearRegression(tagsCountX,tagsCountY),"tagsCountModel"])
    // var studiosCountX = [], studiosCountY = []
    // for(let i=0; i<studiosCount.length;i++){
    //     studiosCountX.push(studiosCount[i].studiosCount)
    //     studiosCountY.push(studiosCount[i].userScore)
    // }
    // variableCountModels.push([linearRegression(studiosCountX,studiosCountY),"studiosCountModel"])
    // var staffCountX = [], staffCountY = []
    // for(let i=0; i<staffCount.length;i++){
    //     staffCountX.push(staffCount[i].staffCount)
    //     staffCountY.push(staffCount[i].userScore)
    // }
    // variableCountModels.push([linearRegression(staffCountX,staffCountY),"staffCountModel"])
    // var sortedVariableCountModels = variableCountModels.sort(function(a, b) {
    //     return b[0].r2 - a[0].r2;
    // })
    // sortedVariableCountModels = sortedVariableCountModels[0]
    // tempVar[sortedVariableCountModels[1]] = sortedVariableCountModels[0]
    varScheme = tempVar
    // var meanR2 = arrayMedian([varScheme.episodesModel.r2,varScheme.durationModel.r2,varScheme.averageScoreModel.r2,
    //     varScheme.trendingModel.r2,varScheme.popularityModel.r2,varScheme.favouritesModel.r2,varScheme.genresCountModel.r2,
    //     varScheme.tagsCountModel.r2,varScheme.studiosCountModel.r2,varScheme.staffCountModel.r2])
    // var models = ["episodesModel","durationModel","averageScoreModel","trendingModel","popularityModel",
    //     "favouritesModel","genresCountModel","tagsCountModel","studiosCountModel","staffCountModel"]
    // for(let i=0;i<models.length;i++){
    //     if(varScheme[models[i]].r2>=meanR2){
    //         varScheme[models[i]+"Dense"] = varScheme[models[i]]
    //     }
    // }
    self.postMessage({
        varScheme: varScheme, 
        userListStatus: userListStatus,
        savedUserList: savedUserList,
        alteredVariables: alteredVariables
    })
    // Used Function
    function arrayMean(obj) {
        return (arraySum(obj) / obj.length) || 0
    }
    function arraySum(obj) {
        return obj.reduce((a, b) => a + b, 0)
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
    function linearRegression(x,y){
        var lr = {};
        var n = y.length;
        var sum_x = 0;
        var sum_y = 0;
        var sum_xy = 0;
        var sum_xx = 0;
        var sum_yy = 0;
        for (var i = 0; i < y.length; i++) {
            sum_x += x[i];
            sum_y += y[i];
            sum_xy += (x[i]*y[i]);
            sum_xx += (x[i]*x[i]);
            sum_yy += (y[i]*y[i]);
        } 
        lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
        lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
        lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);
        return lr;
    }
}