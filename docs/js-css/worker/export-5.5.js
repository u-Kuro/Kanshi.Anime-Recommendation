self.onmessage = async(message) => {
    var data = message.data
    const savedUsername = data.savedUsername
    const savedWarnAnime = data.savedWarnAnime
    const savedFilterAlgo = data.savedFilterAlgo
    const savedHiddenAnimeIDs = data.savedHiddenAnimeIDs
    const savedRecScheme = data.savedRecScheme
    const savedAnimeEntries = data.savedAnimeEntries
    const savedUserList = data.savedUserList
    const savedAnimeFranchises = data.savedAnimeFranchises
    const savedAnalyzeVariableTime = data.savedAnalyzeVariableTime
    const savedUpdateAnalyzeAnimeTime = data.savedUpdateAnalyzeAnimeTime
    const savedDeepUpdateTime = data.savedDeepUpdateTime
    const lastAnilistPage = data.lastAnilistPage
    const lastSavedUpdateTime = data.lastSavedUpdateTime
    const backUpVersion = data.backUpVersion
    const backupStr = JSON.stringify({
        savedUsername: savedUsername,
        savedWarnAnime: savedWarnAnime,
        savedFilterAlgo: savedFilterAlgo,
        savedHiddenAnimeIDs: savedHiddenAnimeIDs,
        savedRecScheme: savedRecScheme,
        savedAnimeEntries: savedAnimeEntries,
        savedUserList: savedUserList,
        savedAnimeFranchises: savedAnimeFranchises,
        savedAnalyzeVariableTime: savedAnalyzeVariableTime,
        savedUpdateAnalyzeAnimeTime: savedUpdateAnalyzeAnimeTime,
        savedDeepUpdateTime: savedDeepUpdateTime,
        lastAnilistPage: lastAnilistPage,
        lastSavedUpdateTime: lastSavedUpdateTime,
        backUpVersion: backUpVersion
    })
    //
    self.postMessage({
        backupStr: backupStr
    })
}