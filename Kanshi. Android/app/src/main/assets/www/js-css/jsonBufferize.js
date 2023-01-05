const encoder = new TextEncoder;
let chunkBuffer, chunkStr, maxByteSize;
JSON.bufferize = async(obj, byteSize=1024*1024) =>{
    chunkBuffer = new Uint8Array;
    chunkStr = ''
    maxByteSize = byteSize
    _bufferize(obj)
    chunkBuffer = _mergeUint8Array(chunkBuffer,encoder.encode(chunkStr))
    return chunkBuffer
}
function _bufferize(x){
    let first = true;
    if(chunkStr.length>=maxByteSize){
        chunkBuffer = _mergeUint8Array(chunkBuffer,encoder.encode(chunkStr))
        chunkStr = ''
    }
    if(isJson(x)){
        chunkStr+='{'
        for(let [k,v] of Object.entries(x)){
            if(v===undefined) continue
            if(isJson(v)||v instanceof Array){
                if(first){
                    first = false
                    chunkStr+=`${JSON.stringify(k)}:`
                } else {
                    chunkStr+=`,${JSON.stringify(k)}:`
                }
                _bufferize(v)
            } else {
                if(first){
                    first = false
                    chunkStr+=`${JSON.stringify(k)}:${JSON.stringify(v)}`
                } else {
                    chunkStr+=`,${JSON.stringify(k)}:${JSON.stringify(v)}`
                }
            }
        }
        chunkStr+='}'
        return
    } else if(x instanceof Array){
        chunkStr+='['
        for(let i=0;i<x.length;i++){
            let v = x[i]
            if(isJson(v)||v instanceof Array){
                if(first){ first = false }
                else { chunkStr+=',' }
                _bufferize(v)
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
function _mergeUint8Array(_old,_new){
    const mergedArray = new Uint8Array(_old.length + _new.length);
    mergedArray.set(_old);
    mergedArray.set(_new, _old.length);
    return mergedArray;
}
function isJson(j){
    try{return(j?.constructor.name==='Object'&&`${j}`==='[object Object]')}
    catch(e){return false}
}