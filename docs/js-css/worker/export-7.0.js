let request, db;

self.onmessage = async({data}) => {
    if(!db){ await IDBinit() }
    const savedUsername = await retrieveJSON("savedUsername")
    const backUpData = JSON.stringify({
        savedUsername: savedUsername,
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
    if(data==='android'){
        const maxStrLength = 1000000
        const postMessage = chunkString(backUpData, maxStrLength)
        const pmLen = postMessage.length
        for(let i=0; i<pmLen;i++){
            setTimeout(()=>{
                self.postMessage({
                    chunk: postMessage[i],
                    done: i===pmLen-1
                })
            },i*50)
        }
    } else {
        self.postMessage(URL.createObjectURL(new Blob([backUpData], { type:`text/json` })))
    }
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
async function retrieveJSON(name) {
    return await new Promise((resolve)=>{
        try {
            let read = db.transaction("MyObjectStore","readwrite").objectStore("MyObjectStore").get(name)
            read.onsuccess = (event) => {
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
// Android
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
// Android
