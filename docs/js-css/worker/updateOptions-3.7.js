self.onmessage = (message) => {
    var data = message.data
    var savedFilterOptionsJson = []
    var allFilterInfo = data.allFilterInfo 
    ////
    var allSavedFilters = Object.keys(allFilterInfo)
    for(let i=0; i<allSavedFilters.length; i++){
        savedFilterOptionsJson.push({info: allSavedFilters[i]})
    }
    ////
    self.postMessage({
        savedFilterOptionsJson: savedFilterOptionsJson
    })
}