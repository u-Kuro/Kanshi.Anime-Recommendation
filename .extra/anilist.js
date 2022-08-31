const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const readline = require("readline");
const path = require("path");
////////////////////////////////////////////////////////////////
function arraySum(obj) {
  return obj.reduce((a, b) => a + b, 0)
}
function arrayMean(obj) {
  return (arraySum(obj) / obj.length) || 0
}
//////////////////////////////////////////////////////////////
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Your Anilist Username: ", function (answer) {
////////////////////////////////////////////////////////////////////////////////////////////
  userName = answer==""? "xKushiro" : answer
  var query = `
    {
      MediaListCollection(userName: "${userName}", type: ANIME) {
        lists {
          status
          entries {
            media {
              title {
                userPreferred
              }     
              recommendations {
                edges {
                  node {
                    mediaRecommendation {
                      title {
                        userPreferred
                      }
                      averageScore 
                      siteUrl
                      genres
                      tags {
                        name
                      }
                      type
                      format
                      seasonYear
                      season
                      studios {
                        nodes {
                          name
                        }
                      }
                    }
                    rating
                  }
                }
              }
            }
          score
          }
        }
      }
    }
    `;

    // Define the config we'll need for our Api request
    var url = 'https://graphql.anilist.co',
    options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: query
        })
    };

    // Make the HTTP Api request
    fetch(url, options).then(handleResponse)
                      .then(handleData)
                      .catch(handleError);

    function handleResponse(response) {
        return response.json().then(function (json) {
            return response.ok ? json : Promise.reject(json);
        });
    }

    function handleData(data) {
      //Concat Completed, Watching, Drop, etc.
      var animeList = data.data.MediaListCollection.lists
      var animeEntries = []
      for(let i=0; i<animeList.length-1; i++){
        animeEntries = animeList[i].entries.concat(animeList[++i].entries)
      }
      // Save JSON
      const jsonfile = require('jsonfile')
      var file = path.resolve(`./data/animeEntries.json`)
      jsonfile.writeFile(file, animeEntries, { spaces: 2 }, function (err) {
        if (err) console.error(err)
      })
      // For Recommendations
      var recScheme = []
      var userListInfo = []
      // Check Watched
      for(let i=0; i<animeList.length; i++){
        for(let j=0; j<animeList[i].entries.length; j++){ 
          userListInfo.push({
            name: animeList[i].entries[j].media.title.userPreferred,
            status: animeList[i].status
          })
        }
      }
      for(let i=0; i<animeEntries.length; i++){
        if(animeEntries[i].score>1){
          var meanUserScore = animeEntries[i].score*0.1
          var recommended = animeEntries[i].media.recommendations.edges
          for(let j=0; j<recommended.length; j++){
            if(recommended[j].node.mediaRecommendation!==null){
              if(recommended[j].node.mediaRecommendation.title!==null&&recommended[j].node.mediaRecommendation.rating!==null&&recommended[j].node.mediaRecommendation.genres!==null){
                var title = recommended[j].node.mediaRecommendation.title.userPreferred
                var url = `=HYPERLINK("${recommended[j].node.mediaRecommendation.siteUrl}","Link")`
                var type = recommended[j].node.mediaRecommendation.type
                var format = recommended[j].node.mediaRecommendation.format
                var year = recommended[j].node.mediaRecommendation.year
                var season = recommended[j].node.mediaRecommendation.season
                var studios = recommended[j].node.mediaRecommendation.studios.nodes 
                var tags = recommended[j].node.mediaRecommendation.tags
                var genres = recommended[j].node.mediaRecommendation.genres
                var anilistScore = recommended[j].node.mediaRecommendation.averageScore
                var status = ""
                for(let k=0; k<userListInfo.length; k++){
                  if(userListInfo[k].name===title){
                    status = userListInfo[k].status
                    break
                  }
                  else status = "UNWATCHED"
                }
                var info = ","
                for(let k=0; k<genres.length; k++){
                  info = info+genres[k]+","
                }
                genres = info
                info = ","
                for(let k=0; k<tags.length; k++){
                  info = info+tags[k].name+","
                }
                tags = info
                info = ","
                for(let k=0; k<studios.length; k++){
                  info = info+studios[k].name+","
                }
                studios = info
                info = ""
                if(recScheme.length<1){
                  recScheme.push({
                    ["Hide (x)"]: "", title: title, url:url,
                    score: 0, 
                    meanUserScoreWeighted: 0, anilistScoreWeighted: 0, userAnilistScore: 0, 
                    meanUserScore: [meanUserScore],  anilistScore: anilistScore, count: 1,
                    status: status, genres: genres, tags: tags, year: year, 
                    season: season, format: format, studios: studios, type: type
                  })
                }
                else{
                  var hasValue = false
                  for(let k=0; k<recScheme.length; k++){
                    hasValue = recScheme[k].title==title || hasValue;
                    if(hasValue){
                      recScheme[k].count = ++recScheme[k].count
                      recScheme[k].meanUserScore.push(meanUserScore)
                      break
                    }
                  }
                  if(!hasValue){
                    recScheme.push({
                      title: title, url:url,
                      score: 0, 
                      meanUserScoreWeighted: 0, anilistScoreWeighted: 0, userAnilistScore: 0, 
                      meanUserScore: [meanUserScore],  anilistScore: anilistScore, count: 1,
                      status: status, genres: genres, tags: tags, year: year, 
                      season: season, format: format, studios: studios, type: type
                    })
                  }
                }
              } else continue
            } else continue
          }
        }
      }
      var sum = 0 
      var per = 0
      for(let i=0; i<recScheme.length; i++){
        sum = sum + recScheme[i].count
      }
      for(let i=0; i<recScheme.length; i++){
        // UserScore: 1, AnilistScore: 100, countWeight: 1
        var meanUserScore = arrayMean(recScheme[i].meanUserScore)*100
        var anilistScore = recScheme[i].anilistScore*.01
        var countWeight = (1/sum)*recScheme[i].count
        per = per + countWeight
        recScheme[i].score = meanUserScore*anilistScore*countWeight
        recScheme[i].userAnilistScore = meanUserScore*anilistScore
        recScheme[i].meanUserScoreWeighted = meanUserScore*countWeight 
        recScheme[i].anilistScoreWeighted = anilistScore*100*countWeight
        recScheme[i].meanUserScore = meanUserScore 
        recScheme[i].anilistScore = anilistScore*100
        console.log(per)
        delete recScheme[i].userScore
        delete recScheme[i].weight
      }
      var files = path.resolve(`./data/recommendation.json`)
      jsonfile.writeFile(files, recScheme, { spaces: 2 }, function (err) {
        if (err) console.error(err)
      })
    }
////////////////////////////////////////////////////////////////////////////////////////////
    function handleError(error) {
        console.error(error);
    }
  rl.close();
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Extra  
    // For variable Check
    // function setJSON( field, oldvalue, newvalue ) {
    //     for( var k = 0; k < json.length; ++k ) {
    //         if( oldvalue == json[k][field] ) {
    //             json[k][field] = newvalue ;
    //         }
    //     }
    //     return json;
    // }
    // var query = `
    // {
    //   MediaListCollection(userName: "${userName}", type: ANIME) {
    //     lists {
    //       entries {
    //         media {           
    //           title {
    //             userPreferred
    //           }
    //           averageScore
    //           format
    //           episodes
    //           genres
    //           tags {
    //             category
    //             name
    //             rank
    //           }
    //           format
    //           episodes
    //           seasonYear
    //           season
    //           staff {
    //             edges {
    //               role
    //               node {
    //                 name {
    //                   first
    //                   last
    //                 }
    //               }
    //             }
    //           }
    //           recommendations {
    //             edges {
    //               node {
    //                 mediaRecommendation {
    //                   title {
    //                     userPreferred
    //                   }
    //                   siteUrl
    //                   genres
    //                   tags {
    //                     name
    //                   }
    //                   type
    //                   format
    //                   seasonYear
    //                   season
    //                   studios {
    //                     nodes {
    //                       name
    //                     }
    //                   }
    //                 }
    //                 rating
    //               }
    //             }
    //           }
    //         }
    //       score
    //       }
    //     }
    //   }
    // }
    // `;
      // var varScheme = {}
      // for(let i=0; i<animeEntries.length; i++){
      //   if(animeEntries[i].score>5){
      //     var weight = animeEntries[i].score
      //     var anime = animeEntries[i].media
      //     var format = {}
      //     var year = {}
      //     var season = {}
      //     var episodes = {}
      //     var episodetype
      //     if(anime.episodes<2) episodetype = "Episode: 1"
      //     else if (anime.episodes>1&&anime.episodes<7) episodetype = "Episode: 2-6"
      //     else if (anime.episodes>6&&anime.episodes<14) episodetype = "Episode: 7-13"
      //     else if (anime.episodes>13&&anime.episodes<27) episodetype = "Episode: 14-26"
      //     else if (anime.episodes>26&&anime.episodes<53) episodetype = "Episode: 27-52"
      //     else if (anime.episodes>52&&anime.episodes<101) episodetype = "Episode: 53-100"
      //     else if (anime.episodes>100) episodetype = "Episode: 101+"
      //     else episodetype = "Episode: null"
      //     var genres = {}
      //     var tags = {}
      //     var tagsCategory = {}
      //     var staff = {}
      //     if(Object.keys(varScheme).length<1){
      //       format = {["Format: "+anime.format]: {
      //           count: 1,
      //           weight: [weight]
      //         }
      //       }
      //       episodes = {["Episode: "+episodetype]: {
      //           count: 1,
      //           weight: [weight]
      //         }
      //       }
      //       year = {["Year: "+anime.seasonYear]: {
      //           count: 1,
      //           weight: [weight]
      //         }
      //       }
      //       season = {["Season: "+anime.season]: {
      //           count: 1,
      //           weight: [weight]
      //         }
      //       }
      //       for(let j=0; j<anime.genres.length; j++){
      //       if(Object.keys(genres).length<1)
      //         genres = {["Genre: "+anime.genres[j]]: {
      //             count: 1,
      //             weight: [weight]
      //           }
      //         }
      //       }
      //       for(let j=0; j<anime.tags.length; j++){
      //         tags = {
      //           ["Tag: "+anime.tags[j].name]: {
      //             count: 1,
      //             rating: [anime.tags[j].rank],
      //             weight: [weight]
      //           }
      //         }
      //         tagsCategory = { 
      //           ["Tag Category: "+anime.tags[j].category]: {
      //             count: 1,
      //             rating: [anime.tags[j].rank],
      //             weight: [weight]
      //           }
      //         }
      //       }
      //       for(let j=0; j<anime.staff.edges.length; j++){
      //         var fullname =
      //           anime.staff.edges[j].node.name.first==null?"":anime.staff.edges[j].node.name.first
      //           +" "+
      //           anime.staff.edges[j].node.name.last==null?"":anime.staff.edges[j].node.name.last
      //         if(fullname==""||fullname=="null") fullname="null"
      //         fullname = "Staff: "+fullname
      //         staff = {["Staff: "+fullname]: {
      //           count: 1,
      //           weight: [weight]
      //         }}
      //       }
      //       varScheme = {
      //         format: format, 
      //         episodes: episodes,
      //         year: year,
      //         season: season,
      //         genres: genres,
      //         tags: tags,
      //         tagsCategory: tagsCategory,
      //         staff: staff
      //       }
      //     }
      //     else{
      //       var xformat = anime.format==null? "Format: null" : "Format: "+anime.format
      //       if(Object.keys(varScheme.format).length<1){
      //         varScheme.format = {[xformat]: {
      //           count: 1,
      //           weight: [weight]
      //         }}
      //       }
      //       else if(Object.keys(varScheme.format).includes(xformat)){
      //         varScheme.format[xformat].count = ++varScheme.format[xformat].count
      //         varScheme.format[xformat].weight.push(weight)
      //       }
      //       else{
      //         varScheme.format = {...varScheme.format, [xformat]: {
      //           count: 1,
      //           weight: [weight]
      //         }}
      //       }
      //       if(Object.keys(varScheme.episodes).length<1){
      //         varScheme.episodes = {[episodetype]: {
      //           count: 1,
      //           weight: [weight]
      //         }}
      //       }
      //       else if(Object.keys(varScheme.episodes).includes(episodetype)){
      //         varScheme.episodes[episodetype].count = ++varScheme.episodes[episodetype].count
      //         varScheme.episodes[episodetype].weight.push(weight)
      //       }
      //       else{
      //         varScheme.episodes = {...varScheme.episodes, [episodetype]: {
      //           count: 1,
      //           weight: [weight]
      //         }}
      //       }
      //       var xseasonYear = anime.seasonYear==null? "Year: null" : "Year: "+anime.seasonYear.toString()
      //       if(Object.keys(varScheme.year).length<1){
      //         varScheme.year = {[xseasonYear]: {
      //           // count: 1,
      //           weight: [weight]
      //         }}
      //       }
      //       else if(Object.keys(varScheme.year).includes(xseasonYear)){
      //         varScheme.year[xseasonYear].count = ++varScheme.year[xseasonYear].count
      //         varScheme.year[xseasonYear].weight.push(weight)
      //       }
      //       else{
      //         varScheme.year = {...varScheme.year, [xseasonYear]: {
      //           count: 1,
      //           weight: [weight]
      //         }}
      //       }
      //       var xseason = anime.season==null? "Season: null" : "Season: "+anime.season
      //       if(Object.keys(varScheme.season).length<1){
      //         varScheme.season = {[xseason]: {
      //           count: 1,
      //           weight: [weight]
      //         }}
      //       }
      //       else if(Object.keys(varScheme.season).includes(xseason)){
      //         varScheme.season[xseason].count = ++varScheme.season[xseason].count
      //         varScheme.season[xseason].weight.push(weight)
      //       }
      //       else{
      //         varScheme.season = {...varScheme.season, [xseason]: {
      //           count: 1,
      //           weight: [weight]
      //         }}
      //       }
      //       for(let j=0; j<anime.genres.length; j++){
      //         var xgenres = anime.genres[j]==null? "Genre: null" : "Genre: "+anime.genres[j]
      //         if(Object.keys(varScheme.genres).length<1){
      //           varScheme.genres = {[xgenres]: {
      //             count: 1,
      //             weight: [weight]
      //           }}
      //         }
      //         else if(Object.keys(varScheme.genres).includes(xgenres)){
      //           varScheme.genres[xgenres].count = ++varScheme.genres[xgenres].count
      //           varScheme.genres[xgenres].weight.push(weight)
      //         }
      //         else{
      //           varScheme.genres = {...varScheme.genres, [xgenres]: {
      //             count: 1,
      //             weight: [weight]
      //           }}
      //         }
      //       }
      //       for(let j=0; j<anime.tags.length; j++){
      //         var xtags = anime.tags[j].name==null? "Tag: null" : "Tag: "+anime.tags[j].name
      //         if(Object.keys(varScheme.tags).length<1){
      //           varScheme.tags = { 
      //             [xtags]: {
      //               count: 1,
      //               rating: [anime.tags[j].rank],
      //               weight: [weight]
      //             }
      //           }
      //         }
      //         else if(Object.keys(varScheme.tags).includes(xtags)){
      //           varScheme.tags[xtags].count = ++varScheme.tags[xtags].count
      //           varScheme.tags[xtags].rating.push(anime.tags[j].rank)
      //           varScheme.tags[xtags].weight.push(weight)
      //         }
      //         else {
      //           varScheme.tags = {...varScheme.tags, 
      //           [xtags]: {
      //             count: 1,
      //             rating: [anime.tags[j].rank],
      //             weight: [weight]
      //           }}
      //         }
      //         var xtagsCategory = anime.tags[j].category==null? "Tag Category: null" : "Tag Category: "+anime.tags[j].category
      //         if(Object.keys(varScheme.tagsCategory).length<1){
      //           varScheme.tagsCategory = { 
      //             [xtagsCategory]: {
      //               count: 1,
      //               rating: [anime.tags[j].rank],
      //               weight: [weight]
      //             }
      //           }
      //         }
      //         else if(Object.keys(varScheme.tagsCategory).includes(xtagsCategory)){
      //           varScheme.tagsCategory[xtagsCategory].count = ++varScheme.tagsCategory[xtagsCategory].count
      //           varScheme.tagsCategory[xtagsCategory].rating.push(anime.tags[j].rank)
      //           varScheme.tagsCategory[xtagsCategory].weight.push(weight)
      //         }
      //         else {
      //           varScheme.tagsCategory = {...varScheme.tagsCategory, 
      //           [xtagsCategory]: {
      //             count: 1,
      //             rating: [anime.tags[j].rank],
      //             weight: [weight]
      //           }}
      //         }
      //       }
      //       for(let j=0; j<anime.staff.edges.length; j++){
      //         var fullname =
      //           anime.staff.edges[j].node.name.first==null?"":anime.staff.edges[j].node.name.first
      //           +" "+
      //           anime.staff.edges[j].node.name.last==null?"":anime.staff.edges[j].node.name.last
      //         if(fullname==""||fullname=="null") fullname="null"
      //         fullname = "Staff: "+fullname
      //         if(Object.keys(varScheme.staff).length<1){
      //           varScheme.staff = {[fullname]: {
      //             count: 1,
      //             weight: [weight]
      //           }}
      //         }
      //         else if(Object.keys(varScheme.staff).includes(fullname)){
      //           varScheme.staff[fullname].count = ++varScheme.staff[fullname].count
      //           varScheme.staff[fullname].weight.push(weight)
      //         }
      //         else varScheme.staff = {...varScheme.staff, [fullname]: {
      //           count: 1,
      //           weight: [weight]
      //         }}
      //       }
      //    }
      //   }
      // }
      // // Fix Data
      // for(let i=0; i<Object.keys(varScheme.format).length; i++){
      //   var formatKey = Object.keys(varScheme.format)
      //   varScheme.format[formatKey[i]] = [arrayMean(varScheme.format[formatKey[i]].weight)*10, varScheme.format[formatKey[i]].count]
      //   // varScheme.format[formatKey[i]].weight = arrayMean(varScheme.format[formatKey[i]].weight)*0.1
      // }
      // for(let i=0; i<Object.keys(varScheme.episodes).length; i++){
      //   var episodesKey = Object.keys(varScheme.episodes)
      //   varScheme.episodes[episodesKey[i]] = [arrayMean(varScheme.episodes[episodesKey[i]].weight)*10, varScheme.episodes[episodesKey[i]].count]
      //   // varScheme.episodes[episodesKey[i]].weight = arrayMean(varScheme.episodes[episodesKey[i]].weight)*0.1
      // }
      // for(let i=0; i<Object.keys(varScheme.year).length; i++){
      //   var yearKey = Object.keys(varScheme.year)
      //   varScheme.year[yearKey[i]] = [arrayMean(varScheme.year[yearKey[i]].weight)*10, varScheme.year[yearKey[i]].count]
      //   // varScheme.year[yearKey[i]].weight = arrayMean(varScheme.year[yearKey[i]].weight)*0.1
      // }
      // for(let i=0; i<Object.keys(varScheme.season).length; i++){
      //   var seasonKey = Object.keys(varScheme.season)
      //   varScheme.season[seasonKey[i]] = [arrayMean(varScheme.season[seasonKey[i]].weight)*10, varScheme.season[seasonKey[i]].count]
      //   // varScheme.season[seasonKey[i]].weight = arrayMean(varScheme.season[seasonKey[i]].weight)*0.1
      // }
      // for(let i=0; i<Object.keys(varScheme.genres).length; i++){
      //   var genresKey = Object.keys(varScheme.genres)
      //   varScheme.genres[genresKey[i]] = [arrayMean(varScheme.genres[genresKey[i]].weight)*10, varScheme.genres[genresKey[i]].count]
      //   // varScheme.genres[genresKey[i]].weight = arrayMean(varScheme.genres[genresKey[i]].weight)*0.1
      // }
      // for(let i=0; i<Object.keys(varScheme.tags).length; i++){
      //   var tagsKey = Object.keys(varScheme.tags)
      //   varScheme.tags[tagsKey[i]] = [(arrayMean(varScheme.tags[tagsKey[i]].weight)*10)*(arrayMean(varScheme.tags[tagsKey[i]].rating)*.01), varScheme.tags[tagsKey[i]].count]
      //   // varScheme.tags[tagsKey[i]].weight = arrayMean(varScheme.tags[tagsKey[i]].weight)*0.1
      // }
      // for(let i=0; i<Object.keys(varScheme.tagsCategory).length; i++){
      //   var tagsCategoryKey = Object.keys(varScheme.tagsCategory)
      //   varScheme.tagsCategory[tagsCategoryKey[i]] = [(arrayMean(varScheme.tagsCategory[tagsCategoryKey[i]].weight)*10)*(arrayMean(varScheme.tagsCategory[tagsCategoryKey[i]].rating)*.01), , varScheme.tagsCategory[tagsCategoryKey[i]].count]
      //   // varScheme.tagsCategory[tagsCategoryKey[i]].weight = arrayMean(varScheme.tagsCategory[tagsCategoryKey[i]].weight)*0.1
      // }
      // for(let i=0; i<Object.keys(varScheme.staff).length; i++){
      //   var staffKey = Object.keys(varScheme.staff)
      //   varScheme.staff[staffKey[i]] = [arrayMean(varScheme.staff[staffKey[i]].weight)*10, varScheme.staff[staffKey[i]].count]
      //   // varScheme.staff[staffKey[i]].weight = arrayMean(varScheme.staff[staffKey[i]].weight)*0.1
      // }
      // // Join Data
      // var varKeys = Object.keys(varScheme)
      // var tempVar = {}
      // for(let i=0; i<varKeys.length; i++){
      //   var scoreVar = varScheme[varKeys[i]]
      //   for(let j=0; j<Object.keys(scoreVar).length; j++){
      //     var scoreKeys = Object.keys(scoreVar)
      //     var scoreVal = Object.values(scoreVar)
      //     tempVar = {...tempVar, [scoreKeys[j]]:scoreVal[j]}
      //   }
      // }
      // varScheme = tempVar
      // // Save to JSON
      // file = path.resolve(`./data/animeVar.json`)
      // jsonfile.writeFile(file, varScheme, { spaces: 2 }, function (err) {
      //   if (err) console.error(err)
      // })