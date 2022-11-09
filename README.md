# Kanshi. Anime Recommendation Android (VI and R) and Static Web (VI)
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Anime Recommendation Apps that uses existing Anilist account analyzed based through User. Kanshi.VI is based on User's Likeability and Variable Importance while Kanshi.R is based on User's Likeability and Other Anilist User Recommendations.

## Starting Up
  Installation
  1. Install the [Kanshi.VI](https://github.com/u-Kuro/Kanshi.Anime-Recommendation/raw/main/Kanshi.VI.apk) or [Kanshi.R](https://github.com/u-Kuro/Kanshi.Anime-Recommendation/raw/main/Kanshi.R.apk) application in an Android mobile or visit the website [Kanshi.WebOne](https://u-kuro.github.io/Kanshi.Anime-Recommendation/) or [Kanshi.WebTwo](http://kanshi.rf.gd/).
  2. Run/Visit the app and Enter a username of an Exsting anilist account (A properly rated list is highly recommended). If you don't have one, you can easily Create an account in their website ([Anilist](https://anilist.co/home)) or Export your List from MAL (MyAnimeList) if you have one ([MAL export](https://myanimelist.net/panel.php?go=export)) then Import the XML file in the Anilist settings ([Anilist Import](https://anilist.co/settings/import)).
  
  Additional Features
  1. Settings can be shown by clicking the small icon or the logo at the top.
  2. Sort by Scores/Status/Year/etc. to the desired order.
  3. Update is available in the settings (used when you updated anime score in your list).
  4. Deep Update is available to reset all data in the app (this will take a longer time).
  5. Import/Export your user data recommendation (this is recommended, a backup will be useful when anilist API had problem with the app).
  6. Auto Recommendation Updates and Auto Export every 1 hour in the settings.   
  7. Filters are available, insert Title/Genres/Tags/User Status/Anime Status/Format/Year/Season/Studios/Staff to include and/or exclude an anime in your recommendation list. Numeric Filters >,<,>=,<= for numbered column including WScore, Score and Year.  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;a) To only see Unwatched Anime type unwatched in filter.  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;b) To remove completed anime type !completed.  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;c) To only allow wscores 7-10 type wscore>=7.  
  8. Hidden/Unhidden List to hide an Anime from ones' list or show it back to your recommendations list.  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;a) Click the black unhidden button to change list to hidden and vice versa.  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;b) Click the hide or show button to transfer to hidden list or unhidden list respectively.  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;c) In the settings, click show all to transfer all hidden anime to unhidden list.
  9. Content Warn in the settings (only for VI and Web) allows user to select Anime Information like Nudity, Harem, etc. to show a warning beside a anime recommendation in order to be alerted by any undesired content. User can also see the warned anime content by clicking the warn icon shown.  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;a) To have a yellow warning for netorare type netorare.  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;b) To have a red warning for netorare type !netorare.

## Kanshi.VI (Recommended)
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;An Anime Recommendation App that uses existing Anilist account analyzed based through User Score Variable Importance including Genres, Tags, Format, Studios, and Staffs by Role as Categorical. Each variables or variable component are averaged. Numeric variables including Anilist Average-Score, Popularity, Year, Favourites, Episodes, Trending, Duration have their own Linear Regression Model to be predicted and accepted at 0.1 r-squared. Finally, all anime in Anilist are then analyzed based on the Variable Importance Schema from ones' rating.

### Recommendation Algorithm
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The recommendation score is averaged through different variables based on user score to get each percent of Likeability. All anime are then analyzed based on the Variable Importance Schema from ones' anime list. Anime recommendation score will be high if most variable from an anime are liked by the user and a low score if most variables in it are disliked by the user.
  
  Steps for Calculation:
  
  1. Getting Variable Importance Schema from User - User's scores for each Anime in ones' list is added to each of its own categoric variable all and of it are averaged, while Numeric Variables are built with Linear Regression Model to predict each scores later.
  2. Analyzing Anime for Initial Recommendation Score - Each available variable in the Variable Importance Schema that is in an Anime from Anilist are then averaged by the scores from variables' scores or Predicted by the created Models given in the analyzed Schema.
  3. Adding Weight (Wscore) for Accuracy - In order to avoid bias to every anime with very Few variables, a weight is added for each shows calculated by [(SumOfAnalyzedVariableFromSpecificAnime/SumOfAllAnalyzedVariableFromAllAnime)].

  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The Final Score for recommendation is WScore, calculated by multiplying the Weight and the Initial Score [InitialScore * Weight]. Unweighted Score is still included in the app to see if there were any Highly recommended  Anime that was put within the margin of error.

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
