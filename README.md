# Kanshi. Anime Recommendation Android (VI and R) and Static Web (VI)
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Anime Recommendation Apps that uses existing Anilist account analyzed based through User. Kanshi.VI is based on User's Likeability and Variable Importance while Kanshi.R is based on User's Likeability and Other Anilist User Recommendations.

## Starting Up
#### ____Installation____
  1. Install the [Kanshi.VI](https://github.com/u-Kuro/Kanshi.Anime-Recommendation/raw/main/Kanshi.VI.apk) or [Kanshi.R](https://github.com/u-Kuro/Kanshi.Anime-Recommendation/raw/main/Kanshi.R.apk) application in an Android mobile or visit the website [Kanshi.WebOne](https://u-kuro.github.io/Kanshi.Anime-Recommendation/) or [Kanshi.WebTwo](http://kanshi.rf.gd/).
  2. Run/Visit the app and Enter a username of an Exsting anilist account (A properly rated list is highly recommended). If you don't have one, you can easily Create an account in their website ([Anilist](https://anilist.co/home)) or Export your List from MAL (MyAnimeList) if you have one ([MAL export](https://myanimelist.net/panel.php?go=export)) then Import the XML file in the Anilist settings ([Anilist Import](https://anilist.co/settings/import)).
  
#### ____Features/Usage Instructions____
  1. Settings can be found by clicking the bar at the top.  
  2. Sort by Scores/Status/Popularity/etc. to the desired order.  
  3. Auto Recommendation updates and Exports every hour are available in the settings.  
  4. Dark/Light Theme in the settings (If this lags rendering, follow the suggestion below to have better performance).   
  5. Update button in the settings to update your recommendation list (Used when you change an anime in your list in anilist).
  6. Deep Update button in the settings to reset all data in the app (This will take a longer time to finish).
  7. Import/Export your user data recommendation in the settings (This is recommended, a backup will be useful when Anilist is Down or the API had a problem with the Tool).
  8. Hide Unwatched Sequel button in the settings will only show the first season for each anime franchise or the very first unwatched sequel (For example it shows standalone movies / specials / etc., or if you already completed / currently rewatching an anime season only the next unwatched sequel will show [If there's a case where {prequel-popularity<sequel-popularity} the sequel will also be included in the list]).
  9. Table/List Filter Anime is used to filter the list shown in the table by adding Title/Genres/Tags/User Status/Anime Status/Format/Year/Season/Studios/Staff to include and/or exclude an anime in your recommendation list. Numeric Filters >,<,>=,<= for numeric columns including WScore, Score, User Score, Average Score in anilist, Popularity, and Year.   
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;a) To only see the Unwatched Anime, type [user status: unwatched] or [unwatched] in the filter  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;b) To remove the Completed or Dropped anime, type [!user status: completed] or [!user status: !dropped] or just type [!dropped] (Type what you want to, the first two variations are more specific than the last).  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;c) To only allow Weighted SCORES of 7-10, type wscore>=7.  
  10. Hidden/Unhidden List to hide an Anime in the apps list or show to bring it back.  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;a) Click the black button named Unhidden or Hidden on the left side of the Wscore table header to change the list to Hidden or Unhidden respectively (you can also type hidden in the filters).  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;b) Click the Hide or Show button to transfer an Anime to the Hidden list or Unhidden list respectively.  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;c) In the settings, the 'Show All' button can be used to Unhide all your Hidden Anime in the app, it transfers all Hidden anime to Unhidden list.  
  11. Content Warning in the settings allows users to select Anime Content like Netorare, Nudity, etc. that will show a Warning Icon to Avoid any Undesired Content. You can also see the Warned Content by Clicking the Warning Icon Shown beside Wscore. Set custom warnings in the settings by clicking 'Choose Content Warn' Button.  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;a) Similar to Table/List filters, To have a Yellow Icon Semi-Warning for Netorare, type [tag: netorare] or [netorare].  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;b) Similar to Table/List filters, To have a Red Icon Warning for Netorare, type [!tag: !netorare] or [!tag: netorare] or [!netorare].  
  12. Filtering Algorithm Contents in the settings allows the user to include and exclude contents in calculating the recommendation and prediction. The currently available fIlters are Formats, Genres, Tags, Tag Categories, Studios, Staff, and Staff Roles. You can use this as follows:  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;a) In the settings click the button to filter the algorithm, which works similarly to table/list filters in instruction number 7.  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;b) The filters in this need to be specific (adding staff: etc), In order to exclude all the staff or staff roles in the algorithm, type [!staff: all] or [!staff role: all].  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;c) The filters in this need to be specific (adding staff: etc), In order to only include directors or original creators in staff, type [staff role: director] or [staff role: original creator].  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;d) To change the minimum sample size for the algorithm, type [sample size: N], the default is adaptive (each has its own sample size equals to its mean count).  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;e) Measure allows custom average (only Grouped Mode, and Mean), e.g., type [measure: mode] (the default is Mean).   
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;f) To exclude/include unknown predictors or simply the anime contents you haven't seen yet, in the algorithm, type [include unknown variables: false] (the default is true).  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;g) To set a custom threshold for both popularity and average scores in anilist, type [minimum popularity: 3000] or [minimum averagescore: 50] (the default for popularity is 33% of the mean popularity of all anime, while the default for average score is 49.67).  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;h) Algorithm Filter Indicators are as follows are [sample size: ], [measure: ], [format: ], [genre: ], [tag: ], [tag category: ], [studio: ], [staff: ], [staff role: ], and add ! as the first character to exclude.  

## Kanshi.VI (Recommended)
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;An Anime Recommendation App that uses existing Anilist account analyzed based through User Score Variable Importance including Genres, Tags, Format, Studios, and Staffs by Role as Categorical. Each variables or variable component are averaged. Numeric variables including Anilist Average-Score, Popularity, Year, Favourites, Episodes, Trending, Duration have their own Linear Regression Model to be predicted and accepted at 0.1 r-squared. Finally, all anime in Anilist are then analyzed based on the Variable Importance Schema from ones' rating.

### Recommendation Algorithm
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The recommendation score is averaged through different variables based on user score to get each percent of Likeability. All anime are then analyzed based on the Variable Importance Schema from ones' anime list. Anime recommendation score will be high if most variable from an anime are liked by the user and a low score if most variables in it are disliked by the user.
  
#### ____Steps for Calculation:____
  
  1. Getting Variable Importance Schema from User - User's scores for each Anime in ones' list is added to each of its own categoric variable all and of it are averaged, while Numeric Variables are built with Linear Regression Model to predict each scores later.
  2. Analyzing Anime for Initial Recommendation Score - Each available variable in the Variable Importance Schema that is in an Anime from Anilist are then averaged by the scores from variables' scores or Predicted by the created Models given in the analyzed Schema.
  3. The Initial Score Calculation is then calculated by dividing it into three group e.g., Anime Contents (Genres and Tags), Anime Production (Staff by Roles and Studio), and Other Minimal Influences (Anilist Average Score/Anime Popularity, Format [TV, Movie, etc.], Length/Duration, and Year), then getting the average of the three.
  4. Lastly weight is added for Accuracy (Wscore) - In order to avoid bias to every anime with very Few variables, a weight is added for each shows calculated by [(SumOfAnalyzedVariableFromSpecificAnime/SumOfAllAnalyzedVariableFromAllAnime)].

  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The Final Score for recommendation is WScore, calculated by multiplying the Weight and the Initial Score [InitialScore * Weight]. Unweighted Score is still included in the app to see if there were any Highly recommended  Anime that was put within the margin of error.

### ____Website Preview____

#### ____Dark Theme____
[<img src="https://i.imgur.com/6AfKrZM.png">](https://i.imgur.com/6AfKrZM.png)
[<img src="https://i.imgur.com/s0oUVO3.png">](https://i.imgur.com/s0oUVO3.png)

### ____Light Theme____
[<img src="https://i.imgur.com/VrQkVYe.png">](https://i.imgur.com/VrQkVYe.png)
[<img src="https://i.imgur.com/mxLBME4.png">](https://i.imgur.com/mxLBME4.png)

### ____Android Preview____

#### ____Dark Theme____
[<img src="https://i.imgur.com/pOH8ZsW.png" width="300">](https://i.imgur.com/pOH8ZsW.png) [<img src="https://i.imgur.com/EjTqgU1.png" width="300">](https://i.imgur.com/EjTqgU1.png)

#### ____Light Theme____
[<img src="https://i.imgur.com/y4cAEEo.png" width="300">](https://i.imgur.com/y4cAEEo.png) [<img src="https://i.imgur.com/gvthnlE.png" width="300">](https://i.imgur.com/gvthnlE.png)

## Kanshi.R
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;An Anime Recommendation App that also uses existing Anilist account analyzed based on three factors. The User Score to evaluate ones' Likability, the Amount of recommendations for a specific anime to Improve recommendation Accuracy, and the General ratings for a recommended anime to Identify a well-received Show.

### Recommendation Algorithm
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The recommendation score is weighted equally based on three things, (User Score, Most recommended, and General Ratings). Recommended Animes are retrieved from Anilist recommendation system in which Anilist Users recommend an Anime similar to others (i.e. Gintama is a comedy Anime similar to Level E, Daily Lives of High School Boys). Further, based on ones' User List, those recommendations are gathered and used for the Anime recommendations' Scores.
  
  1. User Score - User's scores for each Anime in ones' list is added to each of its own recommended anime, and each recommended Anime with all its user score ratings are averaged.
  2. Most Recommended - Acts as a weight for the Users' most watched Anime cluster [(CountfortheSpecificAnime/SumofCountforAllRecommendedAnime)] to avoid high score for such low recommendation.
  3. General Ratings - The general Mean score of an recommended Anime in the Anilist Database, and helps to increase the rates for a well received anime.

  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The Final Score for recommendation was then calculated by multiplying the three factors [(UserScore * MostRecommendedWeight * GeneralRatings)] instead of averaged to estimate and avoid low scores for each.
 
## Requirements
   - Anilist Account - [Anilist Website](https://anilist.co/home).
   - Anilist with list of Scored Anime (A properly rated list for the account is Necessary for Analysis).

## Current Limitations
   - The Android app only runs on WebView for the moment so update pauses when app is not visible.
   - The Web page is static so updates may also stop when the tab is closed.
   - Anilist Request Limits to 50 anime per page/request might slow down update when getting all available anime information.
   - App Kanshi.VI can also be slow due to the Amount of Anime 10000+ being Loaded. (This can be temporarily fixed by adding filters i.e wscore>=N to limit visible anime)
