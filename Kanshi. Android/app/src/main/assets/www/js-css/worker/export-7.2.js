//importScripts('../jsonBufferize.js')
let request, db;

self.onmessage = async({data}) => {
    if(!db){ await IDBinit() }
//    if(data==='android'){
        self.postMessage({status:0}) // Start Deleting Existing File
//    }
    const savedUsername = await retrieveJSON("savedUsername")
    const backUpData = {
        savedUsername: savedUsername,
        savedWarnAnime: await retrieveJSON("savedWarnAnime"),
        savedFilterAlgo: await retrieveJSON("savedFilterAlgo"),
        savedHiddenAnimeIDs: await retrieveJSON("savedHiddenAnimeIDs"),
        savedRecScheme: await retrieveJSON("savedRecScheme"),
        savedAnimeEntries: await retrieveJSON("savedAnimeEntries"),
        savedUserEntries: await retrieveJSON("savedUserEntries"),
        savedAnimeFranchises: await retrieveJSON("savedAnimeFranchises"),
        savedAnalyzeVariableTime: await retrieveJSON("savedAnalyzeVariableTime"),
        savedUpdateAnalyzeAnimeTime: await retrieveJSON("savedUpdateAnalyzeAnimeTime"),
        savedDeepUpdateTime: await retrieveJSON("savedDeepUpdateTime"),
        requestCount: await retrieveJSON("requestCount"),
        lastSavedUpdateTime: await retrieveJSON("lastSavedUpdateTime"),
        backUpVersion: await retrieveJSON("backUpVersion")
    }
//    if(data==='android'){
        const byteSize = 1024*1024
        let chunkStr = ''
        function stringify(x){
            if(chunkStr.length>=byteSize){
                self.postMessage({
                    chunk: chunkStr,
                    status: 1
                })
                chunkStr = ''
            }
            let first = true;
            if(isJson(x)){
                chunkStr+='{'
                for(const [k,v] of Object.entries(x)){
                    if(v===undefined) continue
                    if(isJson(v)||v instanceof Array){
                        if(first){
                            first = false
                            chunkStr+=`${JSON.stringify(k)}:`
                        } else {
                            chunkStr+=`,${JSON.stringify(k)}:`
                        }
                        stringify(v)
                    } else {
                        if(first){
                            first = false
                            chunkStr+=`${JSON.stringify(k)}:${JSON.stringify(v)}`
                        } else{
                            chunkStr+=`,${JSON.stringify(k)}:${JSON.stringify(v)}`
                        }
                    }
                }
                chunkStr+='}'
                return
            } else if(x instanceof Array){
                chunkStr+='[';
                for(let i=0;i<x.length;i++){
                    let v = x[i]
                    if(isJson(v)||v instanceof Array){
                        if(first){ first = false }
                        else { chunkStr+=',' }
                        stringify(v)
                    } else {
                        if(first){
                            first = false
                            chunkStr+=JSON.stringify(v)
                        } else {
                            chunkStr+=`,${JSON.stringify(v)}`
                        }
                    }
                }
                chunkStr+=']'
                return
            }
        }
        stringify(backUpData)
        self.postMessage({
            chunk: chunkStr,
            status: 2
        })
//    }
//    else {
//        let buffer = await JSON.bufferize(backUpData)
//        let blob = new Blob([buffer], { type:'text/json' })
//        let url = URL.createObjectURL(blob)
//        self.postMessage(url)
//    }
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
function isJson(j){
    try{return(j?.constructor.name==='Object'&&`${j}`==='[object Object]')}
    catch(e){return false}
}