var fs = require("fs");
const path = require("path");
var genres = "Action, Adventure, Comedy, Drama, Ecchi, Fantasy, Horror, Mahou Shoujo, Mecha, Music, Mystery, Psychological, Romance, Sci-Fi, Slice of Life, Sports, Supernatural, Thriller"
var tags = "4-koma, Achronological Order, Afterlife, Age Gap, Airsoft, Aliens, Alternate Universe, American Football, Amnesia, Anti-Hero, Archery, Assassins, Athletics, Augmented Reality, Aviation, Badminton, Band, Bar, Baseball, Basketball, Battle Royale, Biographical, Bisexual, Body Swapping, Boxing, Bullying, Calligraphy, Card Battle, Cars, CGI, Chibi, Chuunibyou, Classic Literature, College, Coming of Age, Cosplay, Crossdressing, Crossover, Cultivation, Cute Girls Doing Cute Things, Cyberpunk, Cycling, Dancing, Delinquents, Demons, Development, Dragons, Drawing, Dystopian, Economics, Educational, Ensemble Cast, Environmental, Episodic, Espionage, Fairy Tale, Family Life, Fashion, Female Protagonist, Fishing, Fitness, Flash, Food, Football, Foreign, Fugitive, Full CGI, Full Colour, Gambling, Gangs, Gender Bending, Gender Neutral, Ghost, Gods, Gore, Guns, Gyaru, Harem, Henshin, Hikikomori, Historical, Ice Skating, Idol, Isekai, Iyashikei, Josei, Kaiju, Karuta, Kemonomimi, Kids, Love Triangle, Mafia, Magic, Mahjong, Maids, Male Protagonist, Martial Arts, Memory Manipulation, Meta, Military, Monster Girl, Mopeds, Motorcycles, Musical, Mythology, Nekomimi, Ninja, No Dialogue, Noir, Nudity, Otaku Culture, Outdoor, Parody, Philosophy, Photography, Pirates, Poker, Police, Politics, Post-Apocalyptic, Primarily Adult Cast, Primarily Female Cast, Primarily Male Cast, Puppetry, Real Robot, Rehabilitation, Reincarnation, Revenge, Reverse Harem, Robots, Rugby, Rural, Samurai, Satire, School, School Club, Seinen, Ships, Shogi, Shoujo, Shoujo Ai, Shounen, Shounen Ai, Slapstick, Slavery, Space, Space Opera, Steampunk, Stop Motion, Super Power, Super Robot, Superhero, Surreal Comedy, Survival, Swimming, Swordplay, Table Tennis, Tanks, Teacher, Tennis, Terrorism, Time Manipulation, Time Skip, Tragedy, Trains, Triads, Tsundere, Urban Fantasy, Vampire, Video Games, Virtual World, Volleyball, War, Witch, Work, Wrestling, Writing, Wuxia, Yakuza, Yandere, Youkai, Zombie"
var status = "UNWATCHED, COMPLETED, DROPPED, PLANNING TO WATCH"
var season = "FALL, WINTER, SUMMER, SPRING"
var format = "TV, TV_SHORT, OVA, ONA, MOVIE, SPECIAL"
var year = [1940, 2023]
var studios
// var type = "ANIME, MANGA"
///////////////////////////////////
var yearDifference = year[1]-year[0]+1
var startYear = year[0]
year = ""
for(let i=0; i<yearDifference; i++) {
  if(i<yearDifference-1) year = `${year}${startYear+i}, ` 
  else year = `${year}${startYear+i}` 
}
var allInfo = genres+", "+tags+", "+status+", "+season+", "+format+", "+year
var x = allInfo.split(", ")
//////////////////////////////////////
//Multiple
// var genres = genres.split(", ")
// var tags = tags.split(", ")
// var status = status.split(", ")
// var season = season.split(", ")
// var format = format.split(", ")
// var year = year.split(", ")
// for(let i=0; i<genres.length; i++){
//   genres[i] = `Genre: ${genres[i]}`
// }
// for(let i=0; i<tags.length; i++){
//   tags[i] = `Tag: ${tags[i]}`
// }
// for(let i=0; i<status.length; i++){
//   status[i] = `Status: ${status[i]}`
// }
// for(let i=0; i<season.length; i++){
//   season[i] = `Season: ${season[i]}`
// }
// for(let i=0; i<format.length; i++){
//   format[i] = `Format: ${format[i]}`
// }
// for(let i=0; i<year.length; i++){
//   year[i] = `Year: ${year[i]}`
// }
// var x = genres.concat(tags).concat(status).concat(season).concat(format).concat(year)

var temp = x
x = []
for(let i=0; i<temp.length; i++){
  x.push("!"+temp[i])
}
x = temp.concat(x)
var allInfo = []
for(let i=0; i<x.length; i++){
  allInfo.push({info: x[i]})
}
const jsonfile = require('jsonfile')
var file = path.resolve(`./Options.json`)
var file2 = path.resolve(`./data/Options.json`)
jsonfile.writeFile(file, allInfo, { spaces: 2 }, function (err) {
  if (err) console.error(err)
})
jsonfile.writeFile(file2, allInfo, { spaces: 2 }, function (err) {
  if (err) console.error(err)
})
// fs.writeFile(path.resolve("./data/text.txt"), out, err => {
//   if (err) {
//     console.error(err)
//     return
//   }
//   //file written successfully
// })

// <input type='text'
//        placeholder='Write your country name'
//        class='flexdatalist'
//        data-data='countries.json'
//        data-search-in='name'
//        data-min-length='1'
//        name='country_name_suggestion'>
// ////
// <input type='text'
//        placeholder='Programming language name'
//        class='flexdatalist'
//        data-min-length='1'
//        multiple=''
//        data-selection-required='1'
//        list='languages'
//        name='language22'>

// <datalist id="languages">
//     <option value="PHP">PHP</option>
//     <option value="JavaScript">JavaScript</option>
//     <option value="Cobol">Cobol</option>
//     <option value="C#">C#</option>
//     <option value="C++">C++</option>
//     <option value="Java">Java</option>
//     <option value="Pascal">Pascal</option>
//     <option value="FORTRAN">FORTRAN</option>
//     <option value="Lisp">Lisp</option>
//     <option value="Swift">Swift</option>
// </datalist>