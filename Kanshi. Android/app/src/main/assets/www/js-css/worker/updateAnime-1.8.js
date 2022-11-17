self.onmessage = (message) => {
    var data = message.data
    var savedAnimeEntries = data.savedAnimeEntries
    var updatedAnimeEntries = data.updatedAnimeEntries
    var newAnimeEntries = []
    for(let i=0;i<updatedAnimeEntries.length;i++){
        var updatedAnilistId = updatedAnimeEntries[i].id
        for(let j=0;j<savedAnimeEntries.length;j++){
            var anilistId = savedAnimeEntries[j].id
            if(anilistId===updatedAnilistId&&j===savedAnimeEntries.length-1){
                newAnimeEntries.push(updatedAnimeEntries[i])
            } else if(anilistId===updatedAnilistId){
                savedAnimeEntries[j] = updatedAnimeEntries[i]
            }
        }
        if(newAnimeEntries>0){
            savedAnimeEntries.concat(newAnimeEntries)
        }
    }
    //
    self.postMessage({
        animeEntries: savedAnimeEntries
    })
}