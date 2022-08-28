<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kanshi. - Anime Recommendation</title>
    <link rel="shortcut icon" type="image/x-icon" href="./public/logo.png" />
    <script src="https://www.kryogenix.org/code/browser/sorttable/sorttable.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script src="http://code.jquery.com/jquery-1.8.3.min.js"></script>
    <script src="./js-css/jquery.flexdatalist.js"></script>
    <link rel="stylesheet" href="./js-css/jquery.flexdatalist.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"/>
    <style>
        *,
        ::after,
        ::before{
            margin:0;
            padding:0;
            box-sizing:border-box
        }
        html {
           font-size: calc( (100vw - 480px)/(1280 - 480) * (24 - 16) + 16px);
        }
        button,
        button *{
            cursor:pointer
        }
        dialog{
            border:0
        }
        img{
            max-width:100%
        }
        input,
        textarea{
            outline:0
        }
        input[type=text]{
            width:0
        }
        h1 {
            font-size: calc(100% * calc( (100vw - 480px)/(1280 - 480) * (24 - 16) + 16px));
        }
        h2 {
            font-size: calc(85% * calc( (100vw - 480px)/(1280 - 480) * (24 - 16) + 16px));
        }
        h3 {
            font-size: calc(71% * calc( (100vw - 480px)/(1280 - 480) * (24 - 16) + 16px));
        }
        h4 {
            font-size: calc(57% * calc( (100vw - 480px)/(1280 - 480) * (24 - 16) + 16px));
        }
        h5 {
            font-size: calc(42% * calc( (100vw - 480px)/(1280 - 480) * (24 - 16) + 16px));;
        }
        p{
            font-size: calc(14% * calc( (100vw - 480px)/(1280 - 480) * (24 - 16) + 16px));
        }
        h6 {
            font-size: calc(28% * calc( (100vw - 480px)/(1280 - 480) * (24 - 16) + 16px));
        }
        /*  */
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
        };
        /*  */
        html,body,.home{
            width: 100%;
            min-height: 100%;
            height: 100%;
        }
        label{margin: 0}
        .searchData,.table-responsive{
            margin-block: 15px;
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
        .userInput{
            padding-inline: 13px;
            min-height: 34px;
            border-color: rgb(118, 118, 118);
            border-width: 2px;
            border-style: inset;
            border-radius: 0px;
            background-color: rgb(255, 255, 255);
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
            height: 230px;
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
    <?php include_once("index.html"); ?>
</body>
</html>

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
// }) -->