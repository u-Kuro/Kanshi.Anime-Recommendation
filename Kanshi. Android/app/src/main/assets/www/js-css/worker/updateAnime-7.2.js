importScripts( "../ajax.js" );
let g = {}, request, db;

self.onmessage = async({data}) => {
    if(!db){ await IDBinit() }
    g = await data
    await preWorker().then(async()=>{
        return await mainWorker()
    }).then(async()=>{
        return await postWorker()
    }).then(()=>{
        if(g.returnInfo==='getAnime'){
            self.postMessage({status:'analyzeVariables',returnInfo:'getAnime'})
        } else if(g.returnInfo==='updateAnime'){
            self.postMessage({status:'analyzeAnime',returnInfo:'updateAnime'})
        } else if(g.returnInfo==='notAnUpdate'){
            self.postMessage({status:'notAnUpdate'})
        }
    })
}
async function preWorker(){
    return await new Promise(async(resolve)=>{
        g.savedAnimeEntries = await retrieveJSON('savedAnimeEntries') ?? {}
        if(g.returnInfo==='updateAnime'){
            g.lastSavedUpdateTime = await retrieveJSON('lastSavedUpdateTime') ?? 0
        }
        g.requestCount = await retrieveJSON('requestCount') ?? 4000
        if(g.returnInfo==='getAnime'){
            g.savedAnimeIDs = Object.keys(g.savedAnimeEntries??{}).reduce((result,id)=>{
                if(isInt(id)){
                    result.push(id)
                }
                return result
            },[]).join(",")
        }
        return resolve()
    })
}
async function mainWorker(){
    return await new Promise(async(resolve)=>{
        const animeEntries = {}
        const maxAnimePerPage = 50
        const maxStaffPerPage = 25
        const lastSavedUpdateTime = g.lastSavedUpdateTime
        g.newRequestCount = 0
        async function recallUPAN(page, staffPage, staffHasNextPage){
            $.ajax({
                type: 'POST',
                url: 'https://graphql.anilist.co',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'max-age=31536000, immutable'
                },
                dataType: 'json',
                data:  JSON.stringify({query:
                    `{
                        Page(page: ${page}, perPage: ${maxAnimePerPage}) {
                            pageInfo{
                                hasNextPage
                            }
                            media(
                                type: ANIME,
                                genre_not_in: ["Hentai"],
                                format_not_in:[MUSIC,MANGA,NOVEL,ONE_SHOT],
                                ${  g.returnInfo==='updateAnime'? 'sort: [UPDATED_AT_DESC]'
                                    : g.returnInfo==='getAnime'&&g.getUnfinishedAnime? `id_in: [${g.savedAnimeIDs}], status: FINISHED`
                                    : `id_not_in: [${g.savedAnimeIDs}]`
                                }
                                ) {
                                id
                                updatedAt
                                ${staffHasNextPage?'':`
                                title {
                                    userPreferred
                                }
                                relations {
                                    edges {
                                        relationType
                                        node{
                                            id
                                            popularity
                                        }
                                    }
                                }
                                siteUrl
                                averageScore
                                episodes
                                duration
                                trending
                                popularity
                                favourites
                                format
                                genres
                                status
                                tags {
                                    name
                                    rank
                                    category
                                }
                                studios {
                                    nodes {
                                        name
                                        siteUrl
                                        isAnimationStudio
                                    }
                                }
                                seasonYear
                                season`}
                                staff(perPage:${maxStaffPerPage}, page:${staffPage}, sort:[RELEVANCE]) {
                                    pageInfo{
                                        hasNextPage
                                    }
                                    edges {
                                        node {
                                            name {
                                                userPreferred
                                            }
                                            siteUrl
                                        }
                                        role
                                    }
                                }
                            }
                        }
                    }`
                }),
                beforeSend: ()=> {
                    const usDn = g.requestCount>g.newRequestCount?g.requestCount:g.newRequestCount+1
                    const usUp = g.newRequestCount
                    const loadPerc = (Math.min(99.99,(usUp/usDn)*100)).toFixed(2)
                    let message;
                    if(g.returnInfo==='updateAnime'){
                        message='Updating Anime from Anilist:'
                    } else {
                        message='Getting Anime from Anilist:'
                    }
                    message = `<span style="white-space:nowrap;">${message}⠀</span><span style="white-space:nowrap;"><progress style="vertical-align:revert;" value="${usUp}" max="${usDn}"></progress>⠀${loadPerc}%</span>`
                    self.postMessage({
                        status:'notify',
                        updateStatus: {
                            message: message,
                            info: 'normal'
                        }
                    })
                },
                success: (result,status,xhr)=>{
                    ++g.newRequestCount
                    const responseHeaders = xhr.getAllResponseHeaders()
                    let resAnimeEntries = result?.data?.Page?.media ?? []
                    let hasNextPage = result?.data?.Page?.hasNextPage ?? (resAnimeEntries?.length??0)>0
                    let isLastNewUpdateTime;
                    if(g.returnInfo==='updateAnime'){
                        isLastNewUpdateTime = true
                    }
                    if(staffHasNextPage&&!jsonIsEmpty(animeEntries)){
                        for(let i=0; i<resAnimeEntries.length;i++){
                            let anime = resAnimeEntries[i]
                            if(anime?.id&&animeEntries[anime?.id]?.staff?.edges?.length&&anime?.staff?.edges?.length){
                                animeEntries[anime.id].staff.edges = animeEntries[anime.id].staff.edges.concat(anime.staff.edges)
                            }
                            if(g.returnInfo==='updateAnime'){
                                if(anime?.updatedAt){
                                    if(anime.updatedAt>=lastSavedUpdateTime){
                                        isLastNewUpdateTime = false
                                    }
                                } else {
                                    isLastNewUpdateTime = false
                                }
                            }
                        }
                    } else {
                        for(let i=0; i<resAnimeEntries.length;i++){
                            let anime = resAnimeEntries[i]
                            if(isaN(anime.id)){
                                animeEntries[anime.id] = anime
                            }
                            if(g.returnInfo==='updateAnime'){
                                if(anime?.updatedAt){
                                    if(anime.updatedAt>g.lastSavedUpdateTime){
                                        g.lastSavedUpdateTime = anime.updatedAt
                                    }
                                    if(anime.updatedAt>=lastSavedUpdateTime){
                                        isLastNewUpdateTime = false
                                    }
                                } else {
                                    isLastNewUpdateTime = false
                                }
                            }
                        }
                    }
                    // Check Staff
                    staffHasNextPage = resAnimeEntries?.some((anime)=>anime?.staff?.pageInfo?.hasNextPage??false)??false
                    if(staffHasNextPage){
                        if(responseHeaders?.['x-ratelimit-remaining']??1>0){
                            return recallUPAN(page,++staffPage,staffHasNextPage)
                        } else {
                            const usDn = g.requestCount>g.newRequestCount?g.requestCount:g.newRequestCount+1
                            const usUp = g.newRequestCount
                            const loadPerc = (Math.min(99.99,(usUp/usDn)*100)).toFixed(2)
                            self.postMessage({
                                status:'notify',
                                updateStatus: {
                                    message: {
                                        loadPerc: loadPerc,
                                        usDn: usDn,
                                        usUp: usUp
                                    },
                                    info: 'rateLimit'
                                }
                            })
                            setTimeout(()=>{
                                return recallUPAN(page,++staffPage,staffHasNextPage)
                            },60000)
                        }
                    } else {
                        for(let id in animeEntries){
                            if(isaN(id)){
                                g.savedAnimeEntries[id] = animeEntries[id]
                            }
                        }
                        saveJSON(g.savedAnimeEntries,"savedAnimeEntries")
                        // Non Sorted Query
                        if((hasNextPage&&g.returnInfo!=='updateAnime')
                        // Sorted Query
                          ||(hasNextPage&&g.returnInfo==='updateAnime'&&!isLastNewUpdateTime)){
                            if(responseHeaders?.['x-ratelimit-remaining']??1>0){
                                return recallUPAN(++page,1,staffHasNextPage)
                            } else {
                                const usDn = g.requestCount>g.newRequestCount?g.requestCount:g.newRequestCount+1
                                const usUp = g.newRequestCount
                                const loadPerc = (Math.min(99.99,(usUp/usDn)*100)).toFixed(2)
                                self.postMessage({
                                    status:'notify',
                                    updateStatus: {
                                        message: {
                                            loadPerc: loadPerc,
                                            usDn: usDn,
                                            usUp: usUp
                                        },
                                        info: 'rateLimit'
                                    }
                                })
                                setTimeout(()=>{
                                    return recallUPAN(++page,1,staffHasNextPage)
                                },60000)
                            }
                        } else {
                            let message;
                            if(g.returnInfo==='updateAnime'){
                                message='Updating Anime from Anilist:'
                            } else {
                                message='Getting Anime from Anilist:'
                            }
                            message = `<span style="white-space:nowrap;">${message}⠀</span><span style="white-space:nowrap;"><progress value="100" max="100"></progress>⠀100%</span>`
                            self.postMessage({
                                status:'notify',
                                updateStatus: {
                                    message: message,
                                    info: 'normal'
                                }
                            })
                            // Update Unfinished Anime, if there are any
                            if(!g.getUnfinishedAnime&&g.returnInfo==='getAnime'){
                                g.savedAnimeIDs = Object.values(g.savedAnimeEntries??{}).reduce((result,anime)=>{
                                    let id = anime.id
                                    if(isInt(id)&&!equalsNCS(anime.status,'finished')){
                                        result.push(id)
                                    }
                                    return result
                                },[]).join(",")
                                g.getUnfinishedAnime = true
                                if(responseHeaders?.['x-ratelimit-remaining']??1>0){
                                    return recallUPAN(1,1,false)
                                } else {
                                    const usDn = g.requestCount>g.newRequestCount?g.requestCount:g.newRequestCount+1
                                    const usUp = g.newRequestCount
                                    const loadPerc = (Math.min(99.99,(usUp/usDn)*100)).toFixed(2)
                                    self.postMessage({
                                        status:'notify',
                                        updateStatus: {
                                            message: {
                                                loadPerc: loadPerc,
                                                usDn: usDn,
                                                usUp: usUp
                                            },
                                            info: 'rateLimit'
                                        }
                                    })
                                    setTimeout(()=>{
                                        return recallUPAN(1,1,false)
                                    },60000)
                                }
                            }
                            setTimeout(()=>{
                                return resolve()
                            },100)
                        }
                    }
                },
                error: function(xhr) {
                    const responseHeaders = xhr.getAllResponseHeaders()
                    const error = xhr?.responseJSON?.errors?.[0]?.message || 'Oops... something wen\'t wrong, please try again...'
                    try {
                        if(responseHeaders?.['x-ratelimit-remaining']??0>0){
                            return recallUPAN(page,staffPage,staffHasNextPage)
                        } else {
                            const usDn = g.requestCount>g.newRequestCount?g.requestCount:g.newRequestCount+1
                            const usUp = g.newRequestCount
                            const loadPerc = (Math.min(99.99,(usUp/usDn)*100)).toFixed(2)
                            self.postMessage({
                                status:'notify',
                                updateStatus: {
                                    message: {
                                        loadPerc: loadPerc,
                                        usDn: usDn,
                                        usUp: usUp
                                    },
                                    info: 'rateLimit'
                                }
                            })
                            setTimeout(()=>{
                                return recallUPAN(page,staffPage,staffHasNextPage)
                            },60000)
                        }
                    } catch(ex) {
                        self.postMessage({status:'error',error:error})
                    }
                }
            })
        }
        recallUPAN(1,1,false)
    })
}
async function postWorker(){
    return await new Promise(async(resolve)=>{
        self.postMessage({
            status:'update',
            haveSavedAnimeEntries: !jsonIsEmpty(g.savedAnimeEntries)
        })
        if(g.returnInfo==='updateAnime'){
            await saveJSON(g.lastSavedUpdateTime,"lastSavedUpdateTime")
            self.postMessage({status:'update', lastSavedUpdateTime: g.lastSavedUpdateTime})
            await saveJSON(Math.max(g.requestCount,g.newRequestCount),"requestCount")
        }
        return resolve()
    })
}
async function IDBinit(){
    return await new Promise((resolve)=>{
        request = indexedDB.open("Kanshi.Anime.Recommendations.Anilist.W~uPtWCq=vG$TR:Zl^#t<vdS]I~N70", 1)
        request.onerror = (error) => {
            console.error(error)
        }
        request.onsuccess = (event) => {
            db = event.target.result
            return resolve()
        }
        request.onupgradeneeded = (event) => {
            db = event.target.result
            db.createObjectStore("MyObjectStore")
            return resolve()
        }
    })
}
async function saveJSON(data, name) {
    return await new Promise(async(resolve)=>{
        try {
            let write = db.transaction("MyObjectStore","readwrite").objectStore("MyObjectStore").openCursor()
            write.onsuccess = async(event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if(cursor.key===name){
                        await cursor.update(data)
                        return resolve()
                    }
                    await cursor.continue()
                } else {
                    await db.transaction("MyObjectStore","readwrite").objectStore("MyObjectStore").add(data, name)
                    return resolve()
                }
            }
            write.onerror = async(error) => {
                console.error(error)
                await db.transaction("MyObjectStore","readwrite").objectStore("MyObjectStore").add(data, name)
                return resolve()
            }
        } catch(ex) {
            try{
                console.error(ex)
                await db.transaction("MyObjectStore","readwrite").objectStore("MyObjectStore").add(data, name)
                return resolve()
            } catch(ex2) {
                console.error(ex2)
                return resolve()
            }
        }
    })
}
async function retrieveJSON(name) {
    return await new Promise((resolve)=>{
        try {
            let read = db.transaction("MyObjectStore","readwrite").objectStore("MyObjectStore").get(name)
            read.onsuccess = () => {
                return resolve(read.result)
            }
            read.onerror = (error) => {
                console.error(error)
                return resolve()
            }
        } catch(ex){
            console.error(ex)
            return resolve()
        }
    })
}
function equalsNCS(str1, str2) {
    let s1 = str1
    let s2 = str2
    if(typeof s1==="number") s1 = s1.toString()
    if(typeof s2==="number") s2 = s2.toString()
    if(typeof s1==="string") s1 = s1.trim().toLowerCase()
    if(typeof s2==="string") s2 = s2.trim().toLowerCase()
    return s1 === s2
}
function isaN(num){
    if(!num&&num!==0){return false}
    else if(typeof num==='boolean'){return false}
    else if(typeof num==='string'&&!num){return false}
    return !isNaN(num)
}
function isInt(num) {
    if (isNaN(num)) return false;
    x = parseFloat(num);
    return (x | 0) === x;
}
function isJson(j){ 
    try{return(j?.constructor.name==='Object'&&`${j}`==='[object Object]')}
    catch(e){return false}
}
function jsonIsEmpty(obj){
    if(isJson(obj)){
        for(let i in obj) return false
        return true
    }
    console.error(`Error: Expected Object Constructor (reading '${obj?.constructor.name}' - ${JSON.stringify(obj)})`)
    return true /// Temporarily Added for Past Conditions to Work
}
