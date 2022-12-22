self.onmessage = (message) => {
    const data = message.data
    const savedAnimeEntries = data.savedAnimeEntries??{}
    const updatedAnimeEntries = data.updatedAnimeEntries??{}
    for(let id in updatedAnimeEntries){
        if(isaN(id)){
            savedAnimeEntries[id] = updatedAnimeEntries[id]             
        }
    }
    self.postMessage({
        savedAnimeEntries: savedAnimeEntries
    })
    function isaN(num){
        if(!num&&num!==0){return false}
        else if(typeof num==='string'){return num.split(' ').join('').length}
        else if(typeof num==='boolean'){return false}
        return !isNaN(num)
    }
}
