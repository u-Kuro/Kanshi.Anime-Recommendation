self.onmessage = (message) => {
    var data = message.data
    var savedAnimeEntries = data.savedAnimeEntries??{}
    var updatedAnimeEntries = data.updatedAnimeEntries??{}
    var updatedAnimeEntriesIDs = Object.keys(updatedAnimeEntries)
    for(let i=0;i<updatedAnimeEntriesIDs.length;i++){
        var updatedAnilistId = updatedAnimeEntriesIDs[i]
        if(updatedAnilistId&&updatedAnimeEntries[updatedAnilistId]){
            savedAnimeEntries[updatedAnilistId] = updatedAnimeEntries[updatedAnilistId]
        }
    }
    self.postMessage({
        savedAnimeEntries: savedAnimeEntries
    })
}