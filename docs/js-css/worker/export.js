self.onmessage = async(message) => {
    var data = message.data
    const savedUsername = data.savedUsername
    const savedWarnAnime = data.savedWarnAnime
    const savedHiddenAnimeTitles = data.savedHiddenAnimeTitles
    const savedRecScheme = data.savedRecScheme
    const savedAnimeEntries = data.savedAnimeEntries
    const savedLatestAnimeTitle = data.savedLatestAnimeTitle
    const savedUserList = data.savedUserList
    const savedAnalyzeVariableTime = data.savedAnalyzeVariableTime
    const savedUpdateAnalyzeAnimeTime = data.savedUpdateAnalyzeAnimeTime
    const savedDeepUpdateTime = data.savedDeepUpdateTime
    const lastAnilistPage = data.lastAnilistPage
    const savedAnalyzedVariablesCount = data.savedAnalyzedVariablesCount
    const backup = {
        savedUsername: savedUsername,
        savedWarnAnime: savedWarnAnime,
        savedHiddenAnimeTitles: savedHiddenAnimeTitles,
        savedRecScheme: savedRecScheme,
        savedAnimeEntries: savedAnimeEntries,
        savedLatestAnimeTitle: savedLatestAnimeTitle,
        savedUserList: savedUserList,
        savedAnalyzeVariableTime: savedAnalyzeVariableTime,
        savedUpdateAnalyzeAnimeTime: savedUpdateAnalyzeAnimeTime,
        savedDeepUpdateTime: savedDeepUpdateTime,
        lastAnilistPage: lastAnilistPage,
        savedAnalyzedVariablesCount: savedAnalyzedVariablesCount
    }
    //
    self.postMessage({
        backup: backup
    })
}