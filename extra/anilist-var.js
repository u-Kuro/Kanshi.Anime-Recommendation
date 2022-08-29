const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const readline = require("readline");
const path = require("path");
const jsonfile = require('jsonfile')
////////////////////////////////////////////////////////////////
function arraySum(obj) {
  return obj.reduce((a, b) => a + b, 0)
}
function arrayMean(obj) {
  return (arraySum(obj) / obj.length) || 0
}
// For variable Check
  function setJSON( field, oldvalue, newvalue ) {
      for( var k = 0; k < json.length; ++k ) {
          if( oldvalue == json[k][field] ) {
              json[k][field] = newvalue ;
          }
      }
      return json;
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
          entries {
            media {           
              title {
                userPreferred
              }
              averageScore
              format
              episodes
              genres
              tags {
                category
                name
                rank
              }
              studios {
                nodes {
                  name
                }
              }
              format
              episodes
              seasonYear
              season
              staff {
                edges {
                  role
                  node {
                    name {
                      first
                      last
                    }
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

      var varScheme = {}
      for(let i=0; i<animeEntries.length; i++){
        if(animeEntries[i].score>5){
          var weight = animeEntries[i].score
          var anime = animeEntries[i].media
          var format = {}
          var year = {}
          var season = {}
          var episodes = {}
          var episodetype
          if(anime.episodes<2) episodetype = "Episode: 1"
          else if (anime.episodes>1&&anime.episodes<7) episodetype = "Episode: 2-6"
          else if (anime.episodes>6&&anime.episodes<14) episodetype = "Episode: 7-13"
          else if (anime.episodes>13&&anime.episodes<27) episodetype = "Episode: 14-26"
          else if (anime.episodes>26&&anime.episodes<53) episodetype = "Episode: 27-52"
          else if (anime.episodes>52&&anime.episodes<101) episodetype = "Episode: 53-100"
          else if (anime.episodes>100) episodetype = "Episode: 101+"
          else episodetype = "Episode: null"
          var genres = {}
          var tags = {}
          var tagsCategory = {}
          var studios = {}
          var staff = {}
          var staffRole = {}
          if(Object.keys(varScheme).length<1){
            format = {["Format: "+anime.format]: {
                count: 1,
                weight: [weight]
              }
            }
            episodes = {["Episode: "+episodetype]: {
                count: 1,
                weight: [weight]
              }
            }
            year = {["Year: "+anime.seasonYear]: {
                count: 1,
                weight: [weight]
              }
            }
            season = {["Season: "+anime.season]: {
                count: 1,
                weight: [weight]
              }
            }
            for(let j=0; j<anime.genres.length; j++){
            // if(Object.keys(genres).length<1)
              genres = {
                ["Genre: "+anime.genres[j]]: {
                  count: 1,
                  weight: [weight]
                }
              }
            }
            for(let j=0; j<anime.tags.length; j++){
              tags = {
                ["Tag: "+anime.tags[j].name]: {
                  count: 1,
                  rating: [anime.tags[j].rank],
                  weight: [weight]
                }
              }
              tagsCategory = { 
                ["Tag Category: "+anime.tags[j].category]: {
                  count: 1,
                  rating: [anime.tags[j].rank],//base 100
                  weight: [weight] //base 10
                }
              }
            }
            for(let j=0; j<anime.studios.nodes.length; j++){
              studios = {
                ["Studio: "+anime.studios.nodes[j].name]: {
                  count: 1,
                  weight: [weight]
                }
              }
            }
            for(let j=0; j<anime.staff.edges.length; j++){
              var fullname =
                anime.staff.edges[j].node.name.first==null?"":anime.staff.edges[j].node.name.first
                +" "+
                anime.staff.edges[j].node.name.last==null?"":anime.staff.edges[j].node.name.last
              if(fullname==""||fullname=="null") fullname="null"
              fullname = "Staff: "+fullname
              staff = {["Staff: "+fullname]: {
                count: 1,
                weight: [weight]
              }}
            }
            for(let j=0; j<anime.staff.edges.length; j++){
              staffRole = {
                ["Staff Role: "+anime.staff.edges[j].role]: {
                  count: 1,
                  weight: [weight]
                }
              }
            }
            varScheme = {
              // Key with key
              format: format,
              episodes: episodes,
              year: year,
              season: season,
              genres: genres,
              tags: tags,
              tagsCategory: tagsCategory,
              studios: studios,
              staffRole: staffRole,
              staff: staff,
            }
          }
          else{
            var xformat = anime.format==null? "Format: null" : "Format: "+anime.format
            if(Object.keys(varScheme.format).length<1){
              varScheme.format = {[xformat]: {
                count: 1,
                weight: [weight]
              }}
            }
            else if(Object.keys(varScheme.format).includes(xformat)){
              varScheme.format[xformat].count = ++varScheme.format[xformat].count
              varScheme.format[xformat].weight.push(weight)
            }
            else{
              varScheme.format = {...varScheme.format, [xformat]: {
                count: 1,
                weight: [weight]
              }}
              console.log(varScheme.format)
            }
            if(Object.keys(varScheme.episodes).length<1){
              varScheme.episodes = {[episodetype]: {
                count: 1,
                weight: [weight]
              }}
            }
            else if(Object.keys(varScheme.episodes).includes(episodetype)){
              varScheme.episodes[episodetype].count = ++varScheme.episodes[episodetype].count
              varScheme.episodes[episodetype].weight.push(weight)
            }
            else{
              varScheme.episodes = {...varScheme.episodes, [episodetype]: {
                count: 1,
                weight: [weight]
              }}
            }
            var xseasonYear = anime.seasonYear==null? "Year: null" : "Year: "+anime.seasonYear.toString()
            if(Object.keys(varScheme.year).length<1){
              varScheme.year = {[xseasonYear]: {
                count: 1,
                weight: [weight]
              }}
            }
            else if(Object.keys(varScheme.year).includes(xseasonYear)){
              varScheme.year[xseasonYear].count = ++varScheme.year[xseasonYear].count
              varScheme.year[xseasonYear].weight.push(weight)
            }
            else{
              varScheme.year = {...varScheme.year, [xseasonYear]: {
                count: 1,
                weight: [weight]
              }}
            }
            var xseason = anime.season==null? "Season: null" : "Season: "+anime.season
            if(Object.keys(varScheme.season).length<1){
              varScheme.season = {[xseason]: {
                count: 1,
                weight: [weight]
              }}
            }
            else if(Object.keys(varScheme.season).includes(xseason)){
              varScheme.season[xseason].count = ++varScheme.season[xseason].count
              varScheme.season[xseason].weight.push(weight)
            }
            else{
              varScheme.season = {...varScheme.season, [xseason]: {
                count: 1,
                weight: [weight]
              }}
            }
            for(let j=0; j<anime.genres.length; j++){
              var xgenres = anime.genres[j]==null? "Genre: null" : "Genre: "+anime.genres[j]
              if(Object.keys(varScheme.genres).length<1){
                varScheme.genres = {[xgenres]: {
                  count: 1,
                  weight: [weight]
                }}
              }
              else if(Object.keys(varScheme.genres).includes(xgenres)){
                varScheme.genres[xgenres].count = ++varScheme.genres[xgenres].count
                varScheme.genres[xgenres].weight.push(weight)
              }
              else{
                varScheme.genres = {...varScheme.genres, [xgenres]: {
                  count: 1,
                  weight: [weight]
                }}
              }
            }
            for(let j=0; j<anime.tags.length; j++){
              var xtags = anime.tags[j].name==null? "Tag: null" : "Tag: "+anime.tags[j].name
              if(Object.keys(varScheme.tags).length<1){
                varScheme.tags = { 
                  [xtags]: {
                    count: 1,
                    rating: [anime.tags[j].rank],
                    weight: [weight]
                  }
                }
              }
              else if(Object.keys(varScheme.tags).includes(xtags)){
                varScheme.tags[xtags].count = ++varScheme.tags[xtags].count
                varScheme.tags[xtags].rating.push(anime.tags[j].rank)
                varScheme.tags[xtags].weight.push(weight)
              }
              else {
                varScheme.tags = {...varScheme.tags, 
                [xtags]: {
                  count: 1,
                  rating: [anime.tags[j].rank],
                  weight: [weight]
                }}
              }
              var xtagsCategory = anime.tags[j].category==null? "Tag Category: null" : "Tag Category: "+anime.tags[j].category
              if(Object.keys(varScheme.tagsCategory).length<1){
                varScheme.tagsCategory = { 
                  [xtagsCategory]: {
                    count: 1,
                    rating: [anime.tags[j].rank],
                    weight: [weight]
                  }
                }
              }
              else if(Object.keys(varScheme.tagsCategory).includes(xtagsCategory)){
                varScheme.tagsCategory[xtagsCategory].count = ++varScheme.tagsCategory[xtagsCategory].count
                varScheme.tagsCategory[xtagsCategory].rating.push(anime.tags[j].rank)
                varScheme.tagsCategory[xtagsCategory].weight.push(weight)
              }
              else {
                varScheme.tagsCategory = {...varScheme.tagsCategory, 
                [xtagsCategory]: {
                  count: 1,
                  rating: [anime.tags[j].rank],
                  weight: [weight]
                }}
              }
            }
            for(let j=0; j<anime.studios.nodes.length; j++){
              var xstudios = anime.studios.nodes[j].name==null? "Studio: null" : "Studio: "+anime.studios.nodes[j].name
              if(Object.keys(varScheme.studios).length<1){
                varScheme.studios = { 
                  [xstudios]: {
                    count: 1,
                    weight: [weight]
                  }
                }
              }
              else if(Object.keys(varScheme.studios).includes(xstudios)){
                varScheme.studios[xstudios].count = ++varScheme.studios[xstudios].count
                varScheme.studios[xstudios].weight.push(weight)
              }
              else {
                varScheme.studios = {...varScheme.studios, 
                [xstudios]: {
                  count: 1,
                  weight: [weight]
                }}
              }
            }
            for(let j=0; j<anime.staff.edges.length; j++){
              var fullname =
                anime.staff.edges[j].node.name.first==null?"":anime.staff.edges[j].node.name.first
                +" "+
                anime.staff.edges[j].node.name.last==null?"":anime.staff.edges[j].node.name.last
              if(fullname==""||fullname=="null") fullname="null"
              fullname = "Staff: "+fullname
              if(Object.keys(varScheme.staff).length<1){
                varScheme.staff = {[fullname]: {
                  count: 1,
                  weight: [weight]
                }}
              }
              else if(Object.keys(varScheme.staff).includes(fullname)){
                varScheme.staff[fullname].count = ++varScheme.staff[fullname].count
                varScheme.staff[fullname].weight.push(weight)
              }
              else varScheme.staff = {...varScheme.staff, [fullname]: {
                count: 1,
                weight: [weight]
              }}
              var xstaffRole = anime.staff.edges[j].role==null? "Staff Role: null" : "Staff Role: "+anime.staff.edges[j].role
              if(Object.keys(varScheme.staffRole).length<1){
                varScheme.staffRole = {[xstaffRole]: {
                  count: 1,
                  weight: [weight]
                }}
              }
              else if(Object.keys(varScheme.staffRole).includes(xstaffRole)){
                varScheme.staffRole[xstaffRole].count = ++varScheme.staffRole[xstaffRole].count
                varScheme.staffRole[xstaffRole].weight.push(weight)
              }
              else{
                varScheme.staffRole = {...varScheme.staffRole, [xstaffRole]: {
                  count: 1,
                  weight: [weight]
                }}
              }
            }
         }
        }
      }
      // Fix Data JSON
      for(let i=0; i<Object.keys(varScheme.format).length; i++){
        var formatKey = Object.keys(varScheme.format)
        varScheme.format[formatKey[i]] = {
          Score: arrayMean(varScheme.format[formatKey[i]].weight)*10, 
          Count: varScheme.format[formatKey[i]].count}
      }
      for(let i=0; i<Object.keys(varScheme.episodes).length; i++){
        var episodesKey = Object.keys(varScheme.episodes)
        varScheme.episodes[episodesKey[i]] = {
          Score: arrayMean(varScheme.episodes[episodesKey[i]].weight)*10, 
          Count: varScheme.episodes[episodesKey[i]].count}
      }
      for(let i=0; i<Object.keys(varScheme.year).length; i++){
        var yearKey = Object.keys(varScheme.year)
        varScheme.year[yearKey[i]] = {
          Score: arrayMean(varScheme.year[yearKey[i]].weight)*10, 
          Count: varScheme.year[yearKey[i]].count}
      }
      for(let i=0; i<Object.keys(varScheme.season).length; i++){
        var seasonKey = Object.keys(varScheme.season)
        varScheme.season[seasonKey[i]] = {
          Score: arrayMean(varScheme.season[seasonKey[i]].weight)*10, 
          Count: varScheme.season[seasonKey[i]].count}
      }
      for(let i=0; i<Object.keys(varScheme.genres).length; i++){
        var genresKey = Object.keys(varScheme.genres)
        varScheme.genres[genresKey[i]] = {
          Score: arrayMean(varScheme.genres[genresKey[i]].weight)*10, 
          Count: varScheme.genres[genresKey[i]].count}
      }
      for(let i=0; i<Object.keys(varScheme.tags).length; i++){
        var tagsKey = Object.keys(varScheme.tags)
        varScheme.tags[tagsKey[i]] = {
          Score: (arrayMean(varScheme.tags[tagsKey[i]].weight)*10), 
          Count: varScheme.tags[tagsKey[i]].count}
      }
      for(let i=0; i<Object.keys(varScheme.tagsCategory).length; i++){
        var tagsCategoryKey = Object.keys(varScheme.tagsCategory)
        varScheme.tagsCategory[tagsCategoryKey[i]] = {
          Score: (arrayMean(varScheme.tagsCategory[tagsCategoryKey[i]].weight)*10), 
          Count: varScheme.tagsCategory[tagsCategoryKey[i]].count}
      }
      for(let i=0; i<Object.keys(varScheme.studios).length; i++){
        var studiosKey = Object.keys(varScheme.studios)
        varScheme.studios[studiosKey[i]] = {
          Score: (arrayMean(varScheme.studios[studiosKey[i]].weight)*10), 
          Count: varScheme.studios[studiosKey[i]].count}
      }
      for(let i=0; i<Object.keys(varScheme.staff).length; i++){
        var staffKey = Object.keys(varScheme.staff)
        varScheme.staff[staffKey[i]] = {
          Score: arrayMean(varScheme.staff[staffKey[i]].weight)*10, 
          Count: varScheme.staff[staffKey[i]].count}
      }
      for(let i=0; i<Object.keys(varScheme.staffRole).length; i++){
        var staffRoleKey = Object.keys(varScheme.staffRole)
        varScheme.staffRole[staffRoleKey[i]] = {
          Score: arrayMean(varScheme.staffRole[staffRoleKey[i]].weight)*10, 
          Count: varScheme.staffRole[staffRoleKey[i]].count}
      }
      // Join Data
      var varKeys = Object.keys(varScheme)
      var tempVar = {}
      for(let i=0; i<varKeys.length; i++){
        var scoreVar = varScheme[varKeys[i]]
        for(let j=0; j<Object.keys(scoreVar).length; j++){
          var scoreKeys = Object.keys(scoreVar)
          var scoreVal = Object.values(scoreVar)
          tempVar = {...tempVar, [scoreKeys[j]]:scoreVal[j]}
        }
      }
      varScheme = tempVar
      // Save to JSON
      file = path.resolve(`./data/animeVarJson.json`)
      jsonfile.writeFile(file, varScheme, { spaces: 2 }, function (err) {
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
      // // Fix Data JSON
      // for(let i=0; i<Object.keys(varScheme.format).length; i++){
      //   var formatKey = Object.keys(varScheme.format)
      //   varScheme.format[formatKey[i]] = {Score: arrayMean(varScheme.format[formatKey[i]].weight)*10, Count: varScheme.format[formatKey[i]].count}
      // }
      // for(let i=0; i<Object.keys(varScheme.episodes).length; i++){
      //   var episodesKey = Object.keys(varScheme.episodes)
      //   varScheme.episodes[episodesKey[i]] = {Score: arrayMean(varScheme.episodes[episodesKey[i]].weight)*10, Count: varScheme.episodes[episodesKey[i]].count}
      // }
      // for(let i=0; i<Object.keys(varScheme.year).length; i++){
      //   var yearKey = Object.keys(varScheme.year)
      //   varScheme.year[yearKey[i]] = {Score: arrayMean(varScheme.year[yearKey[i]].weight)*10, Count: varScheme.year[yearKey[i]].count}
      // }
      // for(let i=0; i<Object.keys(varScheme.season).length; i++){
      //   var seasonKey = Object.keys(varScheme.season)
      //   varScheme.season[seasonKey[i]] = {Score: arrayMean(varScheme.season[seasonKey[i]].weight)*10, Count: varScheme.season[seasonKey[i]].count}
      // }
      // for(let i=0; i<Object.keys(varScheme.genres).length; i++){
      //   var genresKey = Object.keys(varScheme.genres)
      //   varScheme.genres[genresKey[i]] = {Score: arrayMean(varScheme.genres[genresKey[i]].weight)*10, Count: varScheme.genres[genresKey[i]].count}
      // }
      // for(let i=0; i<Object.keys(varScheme.tags).length; i++){
      //   var tagsKey = Object.keys(varScheme.tags)
      //   varScheme.tags[tagsKey[i]] = {Score: (arrayMean(varScheme.tags[tagsKey[i]].weight)*10), Count: varScheme.tags[tagsKey[i]].count}
      // }
      // for(let i=0; i<Object.keys(varScheme.tagsCategory).length; i++){
      //   var tagsCategoryKey = Object.keys(varScheme.tagsCategory)
      //   varScheme.tagsCategory[tagsCategoryKey[i]] = {Score: (arrayMean(varScheme.tagsCategory[tagsCategoryKey[i]].weight)*10), Count: varScheme.tagsCategory[tagsCategoryKey[i]].count}
      // }
      // for(let i=0; i<Object.keys(varScheme.studios).length; i++){
      //   var studiosKey = Object.keys(varScheme.studios)
      //   varScheme.studios[studiosKey[i]] = {Score: (arrayMean(varScheme.studios[studiosKey[i]].weight)*10), Count: varScheme.studios[studiosKey[i]].count}
      // }
      // for(let i=0; i<Object.keys(varScheme.staff).length; i++){
      //   var staffKey = Object.keys(varScheme.staff)
      //   varScheme.staff[staffKey[i]] = {Score: arrayMean(varScheme.staff[staffKey[i]].weight)*10, Count: varScheme.staff[staffKey[i]].count}
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