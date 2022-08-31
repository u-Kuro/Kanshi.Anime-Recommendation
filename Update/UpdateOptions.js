const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const path = require("path");
const jsonfile = require('jsonfile')
////////////////////
/// Query for Studios
var query = `
    {
      MediaListCollection(userName: "xKushiro", type: ANIME) {
        lists {
          entries {
            media {
              studios {
                nodes {
                  name
                }
              }
              recommendations {
                edges {
                  node {
                    mediaRecommendation {
                      studios {
                        nodes {
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
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
      var genres = "Action, Adventure, Comedy, Drama, Ecchi, Fantasy, Horror, Mahou Shoujo, Mecha, Music, Mystery, Psychological, Romance, Sci-Fi, Slice of Life, Sports, Supernatural, Thriller"
      var tags = `4-koma, Achromatic, Achronological Order, Acting, Adoption, Advertisement, Afterlife, Age Gap, Age Regression, Agender, Agriculture, Airsoft, Alchemy, Aliens, Alternate Universe, American Football, Amnesia, Anachronism, Angels, Animals,
      Anthology, Anthropomorphism, Anti-Hero, Archery, Artificial Intelligence, Asexual, Assassins, Astronomy, Athletics, Augmented Reality, Autobiographical, Aviation, Badminton, Band, Bar, Baseball, Basketball, Battle Royale, Biographical, Bisexual, Body Horror, Body Swapping, Boxing, Boys' Love, Bullying, Butler, Calligraphy, Cannibalism, Card Battle, Cars, Centaur, CGI, Cheerleading, Chibi, Chimera, Chuunibyou, Circus, Classic Literature, Clone, College, Coming of Age, Conspiracy, Cosmic Horror, Cosplay, Crime, Crossdressing, Crossover, Cult, Cultivation, Cute Boys Doing Cute Things, Cute Girls Doing Cute Things, Cyberpunk,
      Cyborg, Cycling, Dancing, Death Game, Delinquents, Demons, Denpa, Detective, Dinosaurs, Disability, Dissociative Identities, Dragons, Drawing, Drugs, Dullahan, Dungeon, Dystopian, E-Sports, Economics, Educational, Elf, Ensemble Cast, Environmental, Episodic, Ero Guro, Espionage, Fairy Tale, Family Life, Fashion, Female Harem, Female Protagonist, Fencing, Firefighters, Fishing, Fitness, Flash, Food, Football, Foreign, Found Family, Fugitive, Full CGI, Full Color, Gambling, Gangs, Gender Bending,
      Ghost, Go, Goblin, Gods, Golf, Gore, Guns, Gyaru, Handball, Henshin, Heterosexual, Hikikomori, Historical, Homeless, Ice Skating, Idol, Isekai, Iyashikei, Josei, Judo, Kaiju, Karuta, Kemonomimi, Kids, Kuudere, Lacrosse, Language Barrier, LGBTQ+ Themes, Lost Civilization, Love Triangle, Mafia, Magic, Mahjong, Maids, Makeup, Male Harem, Male Protagonist, Martial Arts, Medicine, Memory Manipulation, Mermaid, Meta, Military, Mixed Gender Harem, Monster Boy, Monster Girl, Mopeds, Motorcycles, Musical, Mythology, Necromancy, Nekomimi, Ninja, No Dialogue, Noir, Non-fiction, Nudity, Nun, Office Lady, Oiran, Ojou-sama, Orphan, Otaku Culture, Outdoor, Pandemic, Parkour, Parody,
      Philosophy, Photography, Pirates, Poker, Police, Politics, Post-Apocalyptic, POV, Primarily Adult Cast, Primarily Child Cast, Primarily Female Cast, Primarily Male Cast, Primarily Teen Cast, Puppetry, Rakugo, Real Robot, Rehabilitation, Reincarnation, Religion, Revenge, Robots, Rotoscoping, Rugby, Rural, Samurai, Satire, School, School Club, Scuba Diving, Seinen, Shapeshifting, Ships, Shogi, Shoujo, Shounen, Shrine Maiden, Skateboarding, Skeleton, Slapstick, Slavery, Software Development, Space, Space Opera, Spearplay, Steampunk, Stop Motion, Succubus, Suicide, Sumo, Super Power, Super Robot, Superhero, Surfing, Surreal Comedy, Survival, Swimming, Swordplay, Table Tennis, Tanks, Tanned Skin, Teacher,
      Teens' Love, Tennis, Terrorism, Time Manipulation, Time Skip, Tokusatsu, Tomboy, Torture, Tragedy, Trains, Transgender, Travel, Triads, Tsundere, Twins, Urban, Urban Fantasy, Vampire, Video Games, Vikings, Villainess, Virtual World, Volleyball, VTuber, War, Werewolf, Witch, Work, Wrestling, Writing, Wuxia, Yakuza, Yandere, Youkai, Yuri, Zombie`
      var status = "UNWATCHED, COMPLETED, DROPPED, PLANNING TO WATCH"
      var season = "FALL, WINTER, SUMMER, SPRING"
      var format = "TV, TV_SHORT, OVA, ONA, MOVIE, SPECIAL"
      var year = [1940, 2023]
      var studios
      //Concat Completed, Watching, Drop, etc.
      var animeList = data.data.MediaListCollection.lists
      var animeEntries = []
      var studiosArray = []
      for(let i=0; i<animeList.length-1; i++){
        animeEntries = animeList[i].entries.concat(animeList[++i].entries)
      }
      for(let i=0; i<animeEntries.length; i++){
        var anime = animeEntries[i].media
        for(let j=0; j<anime.studios.nodes.length; j++){
          var name = anime.studios.nodes[j].name
          if(!studiosArray.includes(name)){
            studiosArray.push(name)
          }
        }
        //  
        var recommended = anime.recommendations.edges
        for(let j=0; j<recommended.length; j++){
          if(recommended[j].node.mediaRecommendation!==null){
            var studiosx = recommended[j].node.mediaRecommendation.studios.nodes 
            for(let k=0; k<studiosx.length; k++){
              var name = studiosx[k].name
              if(!studiosArray.includes(name)){
                studiosArray.push(name)
              }
            }
          } else continue
        }
      }
      var yearDifference = year[1]-year[0]+1
      var startYear = year[0]
      year = ""
      for(let i=0; i<yearDifference; i++) {
        if(i<yearDifference-1) year = `${year}${startYear+i}, ` 
        else year = `${year}${startYear+i}` 
      }
      studios = ""
      console.log(studiosArray)
      for(let i=0; i<studiosArray.length; i++){
        console.log(studiosArray.length, i)
        if(i==0){
          studios = studiosArray[i]
        }else{
          studios = studios+", "+studiosArray[i]
        }
      }
      var allInfo = genres+", "+tags+", "+status+", "+season+", "+format+", "+year+", "+studios
      var x = allInfo.split(", ")

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
      var file = path.resolve(`../Options.json`)
      jsonfile.writeFile(file, allInfo, { spaces: 2 }, function (err) {
        if (err) console.error(err)
      })
    }
    function handleError(error) {
        console.error(error);
    }