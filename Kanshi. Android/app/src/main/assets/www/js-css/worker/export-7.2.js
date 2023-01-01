importScripts('../jsonBufferize.js')
let request, db;

self.onmessage = async({data}) => {
    if(!db){ await IDBinit() }
    if(data==='android'){
        self.postMessage({status:0}) // Start Deleting Existing File
    }
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
    if(data==='android'){
        let chunkStr = '';
        function stringify(x){
            if(!validSize(chunkStr)){
                self.postMessage({
                    chunk: chunkStr,
                    status: 1
                })
                chunkStr = ''
            }
            let first = true;
            if(isJson(x)){
                chunkStr+='{';
                for(let k in x){
                    if(isJson(x[k])||x[k] instanceof Array){
                        if(first) first = false;
                        else {
                            chunkStr+=','
                        }
                        chunkStr+='"'+k.replace(/"/g,"'")+'":'
                        stringify(x[k])
                    } else {
                        if(first) first = false;
                        else {
                            chunkStr+=','
                        }
                        if(typeof x[k]==='string'){
                            chunkStr+='"'+k.replace(/"/g,"'")+'":"'+x[k].replace(/"/g,"'")+'"'
                        } else {
                            chunkStr+='"'+k.replace(/"/g,"'")+'":'+(JSON.stringify(x[k])??'null')
                        }
                    }
                }
                chunkStr+='}'
                return
            } else if(x instanceof Array){
                chunkStr+='[';
                for(let v of x){
                    if(isJson(v)||v instanceof Array){
                        if(first) first = false;
                        else {
                            chunkStr+=','
                        }
                        stringify(v)
                    } else {
                        if(first) first = false;
                        else {
                            chunkStr+=','
                        }
                        if(typeof v==='string'){
                            chunkStr+='"'+v.replace(/"/g,"'")+'"'
                        } else {
                            chunkStr+=(JSON.stringify(v)??'null')
                        }
                    }
                }
                chunkStr+=']';
                return;
            }
        }
        stringify(backUpData)
        self.postMessage({
            chunk: chunkStr,
            status: 2
        })
    } else {
        console.log(JSON.bufferize(backUpData).length)
        // self.postMessage(URL.createObjectURL(new Blob([JSON.bufferize(backUpData)], { type:`application/octet-stream` })))
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
function isJson(j){
    try{return(j?.constructor.name==='Object'&&`${j}`==='[object Object]')}
    catch(e){return false}
}
function validSize(obj, maxByteSize = 1024*128){
    const constructor = obj?.constructor.name
    if(!obj){ return true; }
    else if(constructor==="Uint8Array"){ return new TextEncoder().encode(obj).length<maxByteSize; }
    else if(obj instanceof Array){ return JSON.stringify(obj).replace(/[\[\]\,\"]/g,'').length<maxByteSize; }
    else if(constructor==="Blob"){ return obj.size<maxByteSize }
    else if(typeof obj==="string"){ return obj.length<maxByteSize; }
    else{ return new Blob([JSON.stringify(obj)]).size<maxByteSize; }
}
// function mergeUint8Array(_old,_new){
//     const mergedArray = new Uint8Array(_old.length + _new.length);
//     mergedArray.set(_old);
//     return mergedArray.set(_new, _old.length);
// }