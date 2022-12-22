self.onmessage = (message) => {
    const data = message.data
    var savedFilterOptionsJson = []
    var allFilterInfo = data.allFilterInfo??{}
    ////
    Object.keys(allFilterInfo).forEach((filter)=>{
        savedFilterOptionsJson.push({info: filter})
    })
    ////
    self.postMessage({
        savedFilterOptionsJson: savedFilterOptionsJson
    })
}
