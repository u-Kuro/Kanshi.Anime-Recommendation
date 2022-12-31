let g = {}, reader, request, db;

self.onmessage = async({data}) => {
    if(!db){ await IDBinit() }
    g = await data
    await mainWorker().then(async()=>{
        return await postWorker()
    }).then(async()=>{
        self.postMessage({status:'LoadData'})
        self.postMessage({status:'notify',doneImporting:true})
        self.postMessage({status:'Update'})
    })
}

async function mainWorker(){
    return await new Promise(async(resolve)=>{
        // Delete Old
        await deleteJSON('varScheme')
        await deleteJSON('userEntriesStatus')
        await deleteJSON('savedUserEntries')
        await deleteJSON('deepUpdateStartTime')
        // Update New
        const reader = new FileReader()
        reader.onload = async() => {
            await new Promise(async(resolve,reject)=>{
                try{
                    self.postMessage({status:'notify',fileLoaded:true})
                    g.fileContent = await JSON.parse(reader.result);
                } catch(error) {
                    console.error(error)
                    return reject('Error: Invalid Backup File')
                }
                if(!g.fileContent.savedUsername){
                    return reject('Error: Backup file does not Have a Username')
                } else {
                    self.postMessage({status:'notify',validFile:true})
                    return resolve()
                }
            }).then(async()=>{
                g.importedBackUpVersion = await g.fileContent.backUpVersion
                if(g.importedBackUpVersion>=g.backUpVersion){
                    await saveJSON(g.importedBackUpVersion, "backUpVersion")
                }
                return
            }).then(async()=>{
                g.savedUsername = await g.fileContent.savedUsername || ""
                self.postMessage({status:'update',savedUsername:g.savedUsername})
                await saveJSON(g.savedUsername,"savedUsername")
                return
            }).then(async()=>{
                g.savedHiddenAnimeIDs = await g.fileContent.savedHiddenAnimeIDs || {}
                self.postMessage({
                    status:'update',
                    savedHiddenAnimeIDs: jsonIsEmpty(g.savedHiddenAnimeIDs),
                    noHiddenAnime: jsonIsEmpty(g.savedHiddenAnimeIDs)
                })
                await saveJSON(g.savedHiddenAnimeIDs,"savedHiddenAnimeIDs")
                return
            }).then(async()=>{
                g.savedRecScheme = await g.fileContent.savedRecScheme || {}
                self.postMessage({status:'update',haveSavedRecScheme:!jsonIsEmpty(g.savedRecScheme)})
                await saveJSON(g.savedRecScheme,"savedRecScheme")
                return
            }).then(async()=>{
                if(g.importedBackUpVersion>=g.backUpVersion){
                    g.savedAnimeEntries = await g.fileContent.savedAnimeEntries || {}
                    self.postMessage({status:'update',haveSavedAnimeEntries:!jsonIsEmpty(g.savedAnimeEntries)})
                    await saveJSON(g.savedAnimeEntries,"savedAnimeEntries")
                }
                return
            }).then(async()=>{
                if(g.importedBackUpVersion>=g.backUpVersion){
                    g.lastSavedUpdateTime = await g.fileContent.lastSavedUpdateTime || 0
                    self.postMessage({status:'update',lastSavedUpdateTime:g.lastSavedUpdateTime})
                    await saveJSON(g.lastSavedUpdateTime,"lastSavedUpdateTime")
                }
                return
            }).then(async()=>{
                if(g.importedBackUpVersion>=g.backUpVersion){
                    g.savedAnimeFranchises = await g.fileContent.savedAnimeFranchises || []
                    await saveJSON(g.savedAnimeFranchises,"savedAnimeFranchises") || []
                }
                return
            }).then(async()=>{
                g.savedUserEntries = await g.fileContent.savedUserEntries || []
                await saveJSON(g.savedUserEntries,"savedUserEntries")
                return
            }).then(async()=>{
                if(g.importedBackUpVersion>=g.backUpVersion){
                    g.savedAnalyzeVariableTime = await g.fileContent.savedAnalyzeVariableTime || [15]
                    self.postMessage({status:'update',savedAnalyzeVariableTime:g.savedAnalyzeVariableTime})
                    await saveJSON(g.savedAnalyzeVariableTime,"savedAnalyzeVariableTime")
                }
                return
            }).then(async()=>{
                if(g.importedBackUpVersion>=g.backUpVersion){
                    g.savedUpdateAnalyzeAnimeTime = await g.fileContent.savedUpdateAnalyzeAnimeTime || [15]
                    self.postMessage({status:'update',savedUpdateAnalyzeAnimeTime:g.savedUpdateAnalyzeAnimeTime})
                    await saveJSON(g.savedUpdateAnalyzeAnimeTime,"savedUpdateAnalyzeAnimeTime")
                }
                return
            }).then(async()=>{
                if(g.importedBackUpVersion>=g.backUpVersion){
                    g.savedDeepUpdateTime = await g.fileContent.savedDeepUpdateTime || [15]
                    self.postMessage({status:'update',savedDeepUpdateTime:g.savedDeepUpdateTime})
                    await saveJSON(g.savedDeepUpdateTime,"savedDeepUpdateTime")
                }
                return
            }).then(async()=>{
                g.requestCount = await g.fileContent.requestCount || 1000
                await saveJSON(g.requestCount,"requestCount")
                return
            }).then(async()=>{
                g.savedWarnAnime = await g.fileContent.savedWarnAnime || [ "!genre: ecchi","tag: boys' love","tag: cgi","!tag: ero guro","!tag: female harem",
                                                                        "tag: full cgi","!tag: male harem","!tag: mixed gender harem",
                                                                        "!tag: nudity","!tag: slavery","!tag: suicide","!tag: yuri","!tag: netorare", "!tag: rape"
                                                                        ]
                self.postMessage({status:'update',savedWarnAnime:g.savedWarnAnime})
                await saveJSON(g.savedWarnAnime,"savedWarnAnime")
                return
            }).then(async()=>{
                g.savedFilterAlgo = await g.fileContent.savedFilterAlgo || ["minimum sample size: 2","include unknown variables: false"]
                self.postMessage({status:'update',savedFilterAlgo:g.savedFilterAlgo})
                await saveJSON(g.savedFilterAlgo,"savedFilterAlgo")
                return resolve()
            }).catch((error)=>{
                self.postMessage({status:'error',error:error})
            })
        }
        reader.onerror = (error) => {
            self.postMessage({status:'error',error:error})
        }
        if(reader.readyState!==1){// Not Loaded
            reader.readAsText(g.importedFile);
        } else {
            reader.onabort = () => {
                reader.readAsText(g.importedFile);
            }
            reader.abort();
        }
    })
}
async function postWorker(){
    return await new Promise((resolve)=>{
        if(g.importedBackUpVersion<g.backUpVersion){
            g.versionUpdate = true
            self.postMessage({status:'update',versionUpdate:g.versionUpdate})
            saveJSON(g.versionUpdate,"versionUpdate")
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
async function deleteJSON(name) {
    return await new Promise((resolve)=>{
        try {
            let read = db.transaction("MyObjectStore","readwrite").objectStore("MyObjectStore").delete(name)
            read.onsuccess = (event) => {
                return resolve()
            }
            read.onerror = (error) => {
                console.error(error)
                return resolve()
            }
        } catch(ex) {
            console.error(ex)
            return resolve()
        }
    })
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
    return true // Temporarily Added for Past Conditions to Work
}