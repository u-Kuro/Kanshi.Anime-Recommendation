let request, db;

self.onmessage = async(message) => {
    if(!db){ await IDBinit() }
    self.postMessage(URL.createObjectURL(new Blob([
        JSON.stringify({
            savedUsername: await retrieveJSON("savedUsername"),
            savedWarnAnime: await retrieveJSON("savedWarnAnime"),
            savedFilterAlgo: await retrieveJSON("savedFilterAlgo"),
            savedHiddenAnimeIDs: await retrieveJSON("savedHiddenAnimeIDs"),
            savedRecScheme: await retrieveJSON("savedRecScheme"),
            savedAnimeEntries: await retrieveJSON("savedAnimeEntries"),
            savedUserList: await retrieveJSON("savedUserList"),
            savedUserScores: await retrieveJSON("savedUserScores"),
            savedAnimeFranchises: await retrieveJSON("savedAnimeFranchises"),
            savedAnalyzeVariableTime: await retrieveJSON("savedAnalyzeVariableTime"),
            savedUpdateAnalyzeAnimeTime: await retrieveJSON("savedUpdateAnalyzeAnimeTime"),
            savedDeepUpdateTime: await retrieveJSON("savedDeepUpdateTime"),
            requestCount: await retrieveJSON("requestCount"),
            lastSavedUpdateTime: await retrieveJSON("lastSavedUpdateTime"),
            backUpVersion: await retrieveJSON("backUpVersion")
        })
    ], { type:`text/json` })))
}
async function IDBinit(){
    return await new Promise((resolve)=>{
        request = indexedDB.open("Kanshi.Anime.Recommendations.Anilist.W~uPtWCq=vG$TR:Zl^#t<vdS]I~N70", 1)
        request.onerror = (error) => {
            console.error(error)
        }
        request.onsuccess = (event) => {
            db = event.target.result
            resolve()
        }
        request.onupgradeneeded = (event) => {
            db = event.target.result
            db.createObjectStore("MyObjectStore")
            resolve()
        }
    })
}
async function retrieveJSON(name) {
    return new Promise((resolve)=>{
        try {
            let read = db.transaction("MyObjectStore","readwrite").objectStore("MyObjectStore").get(name)
            read.onsuccess = (event) => {
                resolve(read.result)
            }
            read.onerror = (error) => {
                console.error(error)
                resolve()
            }
        } catch(ex){
            console.error(ex)
            resolve()
        }
    })
}
function chunkString(str, chunkSize) {
    const chunks = []
    while (str) {
        if (str.length < chunkSize) {
            chunks.push(str);
            break;
        } else {
            chunks.push(str.substr(0, chunkSize));
            str = str.substr(chunkSize);
        }
    }
    return chunks
}