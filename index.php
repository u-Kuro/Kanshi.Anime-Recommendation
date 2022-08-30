<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kanshi. - Anime Recommendation</title>
        <link rel="shortcut icon" type="image/x-icon" href="./public/logo.png" />
        <!-- Jquery -->
        <!-- <script src="jquery-3.6.0.min.js"></script> -->
        <script src="http://code.jquery.com/jquery-1.8.3.min.js"></script>
        <!-- Table Sort -->
        <link rel="stylesheet" href="./js-css/jquery tablesorter/theme.default.min.css">
        <script type="text/javascript" src="./js-css/jquery tablesorter/jquery.tablesorter.js"></script>
        <script src="./js-css/jquery tablesorter/jquery.metadata.min.js"></script>
        <!--  -->
        
        <!-- Datalist Search Code -->
        <link rel="stylesheet" href="./js-css/flexdatalist/jquery.flexdatalist.css">
        <script src="./js-css/flexdatalist/jquery.flexdatalist.js"></script>
        <!--  -->
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"/>
        <!-- <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script> -->
        <style>
            /* Re-edit */
                /* Change For Text Size */
            :root{
                font-size: 0.9rem !important;
            }
                /* Change/Add to Class/Tag of desired division for Padding */
            .Home,
            .overlay{
                padding-inline: clamp(0px, 5vw, 75px) !important;
            }
            /* Default */
            :root{
                font-size: 0.9rem;
                background-color: #fff;
                font-family: sans-serif;
                z-index: 0;
                min-width: 100%;
                min-height: 100%;
            }
            :root>*{
                background-color: #fff;
                min-width: inherit;
                min-height: inherit;
            }
            *,
            ::after,
            ::before{
                margin: 0;
                padding: 0;
                text-indent: 0;
                box-sizing: border-box;
            }
            /* Scrollbar */
            ::-webkit-scrollbar{
                width: 0.75rem;
                height: 0.75rem;
            }
            ::-webkit-scrollbar-track{
                background: #fff;
                border-radius: .3em;
            }

            ::-webkit-scrollbar-thumb{
                border-radius: .3em;
                background: #bcc0c4;
            }
            /* Text */
            .textLogo{
                font-size: clamp(1.6rem, 2vw,1.6rem) !important;
            }
            h1{
                font-size: clamp(1.3rem, 2vw,1.3rem);
            }
            h2{
                font-size: clamp(1.05rem, 2vw,1.05rem);
            }
            h3{
                font-size: clamp(1.05rem, 2vw,1.05rem);
            }
            p,
            label,
            input[type="text"]{
                font-size: clamp(0.95rem, 2vw,0.95rem);
            }
            h4{
                font-size: clamp(1rem, 2vw,1rem);
            }
            h5{
                font-size: clamp(0.9rem, 2vw,0.9rem);
            }
            h6{
                font-size: clamp(0.8rem, 2vw,0.8rem);
            }
            h1,
            h2,
            h3,
            h4,
            h5,
            h6,
            p,
            input,
            textarea,
            .textLogo{
                cursor:default;
                hyphens:manual;
                white-space:pre-wrap;
                word-break:break-word;
                overflow-wrap:break-word;
                transform-origin: left;
            }
            h1,
            h2,
            h3,
            h4,
            h5,
            h6,
            p,
            .textLogo{
                max-width: min-content;
                min-width: fit-content;
            }
            /* Forms */
            input,
            textarea{
                outline: 0;
            }
            input[type=text]{
                width: 0;
            }
            button,
            button>*{
                cursor: pointer;
            }
            dialog{
                border: 0;
            }
            img{
                max-width: 100%;
            }
            /* Additional */
            button {
                background-color: black !important;
                color: white !important;
            }
            input {
                padding: 0.5em;
            }
            .userInput {
                width: min-content;
                border-color: rgb(118, 118, 118);
                border-width: 2px;
                border-style: inset;
                border-radius: 0px;
                background-color: rgb(255, 255, 255);
            }
            .loader {
                position: fixed;
                left: 0px;
                top: 0px;
                width: 100%;
                height: 100%;
                z-index: 9999;
                background: url('./public/loading.gif') 
                    50% 50% no-repeat 
                    rgb(0, 0, 0)
            }
            .loader > * {
                justify-content: center;
                min-height: 100%;
                align-items: center;
                display: flex;
                margin-top: 150px;
                color: wheat;
            }
            html,body,.home{
                width: 100%;
                min-height: 100%;
                height: 100%;
            }
            label{margin: 0}
            .searchData,.table-responsive{
                margin-block: 15px;
            }
            .flexdatalist-multiple > .value {
                max-width: min-content;
            }
            .userInputContainer,.filter-container,.btn-container{
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                align-items: center;
                margin-block: 15px;
                gap: 15px;
            }
            .userInputContainer>:not(label),.filter-container>:not(label),.btn-container>:not(label){
                flex-grow: 1;
            }
            .flexdatalist-multiple{
                display: flex;
                flex-wrap: wrap;
                max-height: 120px;
                overflow-y: scroll;
            }
            .flexdatalist-multiple>.flexdatalist-multiple-value{
                flex-grow: 1;
                display: flex !important; 
            }
            .flexdatalist-multiple>.flexdatalist-multiple-value>.flexdatalist-alias{
                outline: none;
                flex-grow: 1;
            }
            .tableLoadingContainer{
                display: flex;
                justify-content: center;
                align-items: center;
            }
            header {
                background: url('./public/header.png');
                text-align: left;
                width: 100%;
                height: 165px;
                background-size: contain;
                position: relative;
                overflow: hidden;
                border-radius: 0 0 50% 50% / 5%;
            }
            header .overlay{
                width: 100%;
                height: 100%;
                padding: 1.75em;
                color: #FFF;
                background-image: linear-gradient( 135deg, #39343c69 10%, #6d00006b 100%);
            }
            header .overlay>*{
                padding-right: 50%;
            }
            button {
                border: none;
                outline: none;
                padding: 10px 20px;
                border-radius: 50px;
                color: #333;
                background: #fff;
                margin-bottom: 50px;
                box-shadow: 0 3px 20px 0 #0000003b;
            }
            button:hover{
                cursor: pointer;
            }
        </style>
    </head>
    <body>
        <header>
            <div class="overlay">
                <h1 class="textLogo">Kanshi.</h1>
                <h3>Anime - Anilist</h3>
                <h3>Recommendation</h3>
            </div>
        </header>
        <div class="Home">
            <div class="searchData">
                <div class="userInputContainer">
                    <input class="userInput" placeholder="Anilist Username" name="username" id="username" type="text">
                </div>
                <div class="filter-container">
                    <input type="text"
                        placeholder="Filter Genre/Tags/Status/etc. (Exclude - add !)"
                        class="flexdatalist"
                        data-data="Options.json"
                        data-search-in="info"
                        multiple="multiple"
                        data-min-length="1"
                        name="filter">
                </div>
                <div class="btn-container">
                    <button id="btn" class="btn" type="submit">Search</button>
                </div>
            </div>
            <div class="table-responsive">
                <table id="anime-table" class="tablesorter {sortlist: [[1,1]]} table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Hide</th>
                            <th>Score</th>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Genres</th>
                            <th>Tags</th>
                            <th>Season</th>
                            <th>Format</th>
                            <th>Studios</th>
                        </tr>
                    </thead>
                    <tbody id="animeRecommendationList">
                    </tbody>
                </table>
            </div>
        </div>
        <div class="loader">
            <span><h1>Loading...</h1></span>
        </div>

        <script defer>
            // Load Saved Data
            var savedData = retrieveJSON("savedJSON")
            var savedUsername = retrieveJSON("savedUsername")
            var savedFilters = retrieveJSON("savedFilters")
            // Reload Saved Data
            $(window).load(function() {
                // Reload Name
                if(typeof savedUsername==="string")
                    $("#username").val(savedUsername)
                // Reload Filters
                var filterData = ""
                if(savedFilters instanceof Array){
                    let x = setInterval(() => {
                        if($(".flexdatalist-multiple-value > .flexdatalist-alias").length){
                            clearInterval(x)
                            var filterInput
                            for(let i=0; i<savedFilters.length; i++) {
                                filterInput = $(".flexdatalist-multiple-value > .flexdatalist-alias")
                                filterInput.val(savedFilters[i])
                                var e = $.Event( "keyup", { keyCode: 13 } );
                                filterInput.trigger(e)
                            }
                        }   
                    }, 1);
                }
                // Reload Data Table
                if(savedData!==null && typeof savedData==="object"){
                    var includes = []
                    var excludes = []
                    if(savedFilters instanceof Array){
                        for(let i=0; i<savedFilters.length; i++){
                            if(savedFilters[i].charAt(0)==="!") excludes.push(savedFilters[i].slice(1))
                            else includes.push(savedFilters[i])
                        }
                    }
                    LoadData(includes, excludes, savedData)
                    // Check for new Data
                    retrieveAnalyze(savedUsername, includes, excludes)
                }
                // Load Functions    
                $("#anime-table").tablesorter({
                    sortInitialOrder: "asc",
                    headers: {
                        0:{sortInitialOrder: "desc"}
                    }
                });
                $('#anime-table').delegate('button.remove', 'click' ,function() {
                    var t = $('#anime-table');
                    // disabling the pager will restore all table rows
                    // t.trigger('disablePager');
                    // remove chosen row
                    $(this).closest('tr').remove();
                    // restore pager
                    // t.trigger('enablePager');
                    t.trigger('update');
                    return false;
                });
                // Remove Loader
                $(".loader").fadeOut("slow");
            });
            // Event Listeners
            $("#username").on('keypress',(e)=>{if(e.which==13){Search()}})
            $("#btn").on('click', ()=>Search())
            // Search Function
            function Search(){
                var filterInput = $(".filter-container > ul > .flexdatalist-multiple-value > input")
                var username = $("#username").val()
                var filter = filterInput.val()
                // Check Input Validity
                if(username===""||username===null||typeof username==="undefined"){
                    $("#username")[0].setCustomValidity("Anilist Username is Required!")
                    $("#username")[0].reportValidity()
                }if($(".flexdatalist-multiple").children("li").length<2&&filterInput.val()!=""){
                    filterInput.val("")
                    filterInput[0].setCustomValidity("Select or Enter a word to Filter!")
                    filterInput[0].reportValidity()
                } else {
                    // Saved New Data
                    saveJSON(username,"savedUsername")
                    savedUsername = username
                    var filterInputs = $(".flexdatalist-multiple > .value").children(".text")
                    var filters = []
                    var includes = []
                    var excludes = []
                    for(let i=0; i<filterInputs.length; i++){
                        var data = filterInputs[i].textContent
                        if(data.charAt(0)==="!") excludes.push(data.slice(1))
                        else includes.push(data)
                        filters.push(data)
                    }
                    saveJSON(filters, "savedFilters")
                    savedFilters = filters
                    // Load Current Data
                    LoadData(includes, excludes, savedData)
                    // Search New Data
                    retrieveAnalyze(username, includes, excludes)
                }
            }

            function retrieveAnalyze(username, includes, excludes) {
                // Check Parameters
                if(typeof username==="string" && includes instanceof Array && excludes instanceof Array) {
                    // Initialize Anilist Graphql Data
                    var query = `
                    {
                        MediaListCollection(userName: "${username}", type: ANIME) {
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
                    // Request API
                    $.ajax({
                        type: 'POST',
                        url: 'https://graphql.anilist.co',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                        dataType: 'json',
                        data: JSON.stringify({
                            query: query
                        }),
                        success: (data)=> {
                            //Concat Completed, Watching, Drop, etc.
                            var animeList = data.data.MediaListCollection.lists
                            var animeEntries = []
                            for(let i=0; i<animeList.length-1; i++){
                                animeEntries = animeList[i].entries.concat(animeList[++i].entries)
                            }
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
                                            if(recommended[j].node.mediaRecommendation.title!==null
                                                &&recommended[j].node.mediaRecommendation.rating!==null
                                                &&recommended[j].node.mediaRecommendation.genres!==null){
                                                var title = recommended[j].node.mediaRecommendation.title.userPreferred
                                                var url = recommended[j].node.mediaRecommendation.siteUrl
                                                var type = recommended[j].node.mediaRecommendation.type
                                                var format = recommended[j].node.mediaRecommendation.format
                                                var year = recommended[j].node.mediaRecommendation.seasonYear
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
                                                var info = ""
                                                for(let k=0; k<genres.length; k++){
                                                    if(k<genres.length-1) info = info+genres[k]+", "
                                                    else info = info+genres[k]
                                                }
                                                genres = info
                                                info = ""
                                                for(let k=0; k<tags.length; k++){
                                                    if(k<genres.length-1) info = info+tags[k].name+", "
                                                    else info = info+tags[k].name
                                                }
                                                tags = info
                                                info = ""
                                                for(let k=0; k<studios.length; k++){
                                                    if(k<genres.length-1) info = info+studios[k].name+", "
                                                    else info = info+studios[k].name
                                                }
                                                studios = info
                                                info = ""
                                                // Add Recommendation Scheme
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
                            for(let i=0; i<recScheme.length; i++){
                                sum = sum + recScheme[i].count
                            }
                            for(let i=0; i<recScheme.length; i++){
                                // UserScore: 1, AnilistScore: 100, countWeight: 1
                                var meanUserScore = arrayMean(recScheme[i].meanUserScore)*100
                                var anilistScore = recScheme[i].anilistScore*.01
                                var countWeight = (1/sum)*recScheme[i].count
                                recScheme[i].score = meanUserScore*anilistScore*countWeight
                                recScheme[i].userAnilistScore = meanUserScore*anilistScore
                                recScheme[i].meanUserScoreWeighted = meanUserScore*countWeight 
                                recScheme[i].anilistScoreWeighted = anilistScore*100*countWeight
                                recScheme[i].meanUserScore = meanUserScore 
                                recScheme[i].anilistScore = anilistScore*100
                                delete recScheme[i].userScore
                                delete recScheme[i].weight
                            }
                            // Save new JSON
                            saveJSON(recScheme, "savedJSON")
                            savedData = recScheme
                            // Reload new Data
                            LoadData(includes, excludes, recScheme)
                        }, error: (error) => {
                            console.log(error)
                        }
                    })
                }
            }

            function LoadData(includes, excludes, data){
                if(data!==null && typeof data==="object") {
                // FilterOut User Includes and Excludes
                    // Include
                    var tempRecScheme = []
                    for(let i=0; i<includes.length; i++){
                        for(let j=0; j<data.length; j++){
                            var hasValue = false
                            if(equalsNCS(includes[i],data[j].type)
                            ||equalsNCS(includes[i],data[j].format)
                            ||equalsNCS(includes[i],data[j].year)
                            ||equalsNCS(includes[i],data[j].season)
                            ||equalsNCS(includes[i],data[j].status))
                            {
                                tempRecScheme.push(data[j])
                                continue
                            }
                            var temp = data[j].studios.split(", ")
                            for(let k=0; k<temp.length; k++){
                                if(equalsNCS(includes[i],temp[k])){
                                    tempRecScheme.push(data[j])
                                    hasValue = true
                                    break
                                }
                            }
                            if(hasValue) continue
                            temp = data[j].genres.split(", ")
                            for(let k=0; k<temp.length; k++){
                                if(equalsNCS(includes[i],temp[k])){
                                    tempRecScheme.push(data[j])
                                    hasValue = true
                                    break
                                }
                            }
                            if(hasValue) continue
                            temp = data[j].tags.split(", ")
                            for(let k=0; k<temp.length; k++){
                                if(equalsNCS(includes[i],temp[k])){
                                    tempRecScheme.push(data[j])
                                    hasValue = true
                                    break
                                }
                            }
                        }
                        data = tempRecScheme
                        tempRecScheme = []
                    }
                    // Exclude
                    for(let i=0; i<excludes.length; i++){
                        for(let j=0; j<data.length; j++){
                            var hasValue = false
                            if(equalsNCS(excludes[i],data[j].type)
                            ||equalsNCS(excludes[i],data[j].format)
                            ||equalsNCS(excludes[i],data[j].year)
                            ||equalsNCS(excludes[i],data[j].season)
                            ||equalsNCS(excludes[i],data[j].status))
                            {
                                continue
                            }
                            temp = data[j].studios.split(", ")
                            for(let k=0; k<temp.length; k++){
                                if(equalsNCS(excludes[i],temp[k])){
                                    hasValue = true
                                    break
                                }
                            }
                            if(hasValue) continue
                            temp = data[j].genres.split(", ")
                            for(let k=0; k<temp.length; k++){
                                if(equalsNCS(excludes[i],temp[k])){
                                    hasValue = true
                                    break
                                }
                            }
                            if(hasValue) continue
                            temp = data[j].tags.split(", ")
                            for(let k=0; k<temp.length; k++){
                                if(equalsNCS(excludes[i],temp[k])){
                                    hasValue = true
                                    break
                                }
                            }
                            if(hasValue==false)
                                tempRecScheme.push(data[j])
                        }
                        data = tempRecScheme
                        tempRecScheme = []
                    }
                    // Show Table
                    var animeData = ""
                    $.each(data, (key, value) => {
                        animeData += `<tr class="item" role="row">`
                        animeData += `<td style="vertical-align:middle;">
                                        <button style="margin:auto;padding: 5px 13px;" type="button" class="remove" title="Remove this row">X</button>
                                      </td>`
                        animeData += `<td>${value.score.toFixed(4)}</td>`
                        animeData += `<td><a href="${value.url}">${value.title}</a></td>`
                        animeData += `<td>${value.status}</td>`
                        animeData += `<td>${value.genres}</td>`
                        animeData += `<td>${value.tags}</td>`
                        animeData += `<td>${value.season}</td>`
                        animeData += `<td>${value.format}</td>`
                        animeData += `<td>${value.studios}</td>`
                        animeData += `</tr>`
                    })
                    $("#animeRecommendationList").empty()
                    $("#animeRecommendationList").append(animeData)
                    $("#anime-table").trigger("update");
                }
            }
            //////////////////////////////////////////////////////////////////
            // Extra
            function saveJSON(data, name) {
                localStorage.setItem(name, JSON.stringify(data));       
            }
            function retrieveJSON(name) {
                var retrievedObject = localStorage.getItem(name);
                return JSON.parse(retrievedObject)
            }
            function equalsNCS(str1, str2) {
                var s1 = str1
                var s2 = str2
                if(typeof str1=="number") s1 = str1.toString()
                if(typeof str2=="number") s2 = str2.toString()
                if(typeof str1=="string"&&typeof str2=="string")
                    return str1.toLowerCase() == str2.toLowerCase()
                else return s1==s2
                
            }
            function arraySum(obj) {
                return obj.reduce((a, b) => a + b, 0)
            }
            function arrayMean(obj) {
                return (arraySum(obj) / obj.length) || 0
            }
        </script>
    </body>
</html>
<!-- <script defer>       
    // $(".flexdatalist").flexdatalist({
    //     minLength: 1,
    //     searchIn: "info",
    //     data: "Options.json"
    // });
</script> -->
<!-- ///////////////////////////////////////////////////////////////////////////////////////////////////////////////// -->
<!-- // var allTitle = []
// var allType = []
// var allFormat = []
// var allYear = []
// var allSeason = []
// var allStudios = []
// var allGenres = []
// var allTags = []
// var allStatus = [] -->
<!-- // Get All Available Info
// if(!allType.includes("Type: "+type)&&type!=null&&type!="null"&&type!=""){
//     allType.push("Type: "+type)
//     allType.push("Type: "+type+"!")
// }
// if(!allFormat.includes(format)&&format!=null&&format!="null"&&format!="") {
//     allFormat.push(format)
//     allFormat.push("!"+format)
// }
// if(!allYear.includes(year)&&year!=null&&year!="null"&&year!="") {
//     allYear.push(year)
//     allYear.push("!"+year)
// }
// if(!allSeason.includes(season)&&season!=null&&season!="null"&&season!="") {
//     allSeason.push("!"+season)
// }
// if(!allStudios.includes(studios)&&studios!=null&&studios!="null"&&studios!=""){
//     allStudios.push(studios)
//     allStudios.push("!"+studios)
// }
// if(!allGenres.includes(genres)&&genres!=null&&genres!="null"&&genres!="") {
//     allGenres.push(genres)
//     allGenres.push("!"+genres)
// }
// if(!allTags.includes(tags)&&tags!=null&&tags!="null"&&tags!="") {
//     allTags.push(tags)
//     allTags.push("!"+tags)
// }
// if(!allStatus.includes(status)&&status!=null&&status!="null"&&status!="") {
//     allStatus.push(status)
//     allStatus.push("!"+status)
// }    -->

<!-- // var Options = []
// for(let i=0; i<allTitle.length; i++){
//     Options.push({info: allTitle[i]})
// }
// for(let i=0; i<allType.length; i++){
//     Options.push({info: allType[i]})
// }
// for(let i=0; i<allFormat.length; i++){
//     Options.push({info: allFormat[i]})
// }
// for(let i=0; i<allYear.length; i++){
//     Options.push({info: allYear[i]})
// }
// for(let i=0; i<allSeason.length; i++){
//     Options.push({info: allSeason[i]})
// }
// for(let i=0; i<allStudios.length; i++){
//     Options.push({info: allStudios[i]})
// }
// for(let i=0; i<allGenres.length; i++){
//     Options.push({info: allGenres[i]})
// }
// for(let i=0; i<allTags.length; i++){
//     Options.push({info: allTags[i]})
// }
// for(let i=0; i<allStatus.length; i++){
//     Options.push({info: allStatus[i]})
// }                   
// // Filter Options
// $('.flexdatalist').flexdatalist({
//     minLength: 1,
//     selectionRequired: 1,
//     searchIn: 'info',
//     data: Options
// })