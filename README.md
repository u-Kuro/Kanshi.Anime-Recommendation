# Kanshi. Anime Recommendation (Kanshi.VI and Kanshi.R)
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Anime Recommendation Apps that uses existing Anilist account analyzed based through User. Kanshi.VI is based on User's Likeability and Variable Importance while Kanshi.R is based on User's Likeability and Other Anilist User Recommendations.

## Starting Up
  Installation
  1. Install the [Kanshi.VI](https://github.com/u-Kuro/Kanshi.Anime-Recommendation/raw/main/Kanshi.VI.apk) or [Kanshi.R](https://github.com/u-Kuro/Kanshi.Anime-Recommendation/raw/main/Kanshi.R.apk) application in an Android mobile.
  2. Run the app and Enter a username of an Exsting anilist account (A properly rated list is highly recommended). If you don't have one, you can easily Create an account in their website ([Anilist](https://anilist.co/home)) or Export your List from MAL (MyAnimeList) if you have one ([MAL export](https://myanimelist.net/panel.php?go=export)) then Import the XML file in the Anilist settings ([Anilist Import](https://anilist.co/settings/import)).
  
  Additional Features
  1. Filters are available, insert Genres/Tags/Status/Format/Year/Season/Studios to include and/or exclude (adding !filterword) an anime in your recommendation list.
  2. Sort by Scores/Status/Year/etc. to the desired order.
  3. Hidden/Unhidden List to hide an Anime from ones' list or show it back to your list (Click Show All for immediate retrieval).
  4. The Anilist website in the app is available to show a more detailed information about a recommended Anime (Click the title of an Anime).

## Kanshi.VI
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;An Anime Recommendation App that uses existing Anilist account analyzed based through User Score Variable Importance including Genres, Tags, Year, Season, Episode Count, Format, and Studios. Each variables or variable component are averaged and then all anime in Anilist are analyzed based on the Variable Importance Schema from ones' rating.

### Recommendation Algorithm
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The recommendation score is averaged through different variables based on user score to get each percent of Likeability. All anime are then analyzed based on the Variable Importance Schema from ones' anime list. Anime recommendation score will be high if most variable from an anime are liked by the user and a low score if most variables in it are disliked by the user. 
  
  Steps for Calculation:
  
  1. Getting Variable Importance Schema from User - User's scores for each Anime in ones' list is added to each of its own variable, and all of it are averaged.
  2. Analyzing Anime for Initial Recommendation Score - Each available variable in the Variable Importance Schema that is in an Anime from Anilist are then averaged by the scores from variables' scores given in the analyzed Schema.
  3. Adding Weight for Accuracy - In order to avoid bias to every anime with Few variable, a weight is added for each shows calculated by [(1/SumOfAllVariableCountFromAllAnime)*SumOfAllVariableCountFromSpecificAnime].

  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The Final Score for recommendation was then calculated by multiplying the Anime Weight to the Initial Score [InitialScore * AnimeWeight].

## Kanshi.R
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;An Anime Recommendation App that also uses existing Anilist account analyzed based on three factors. The User Score to evaluate ones' Likability, the Amount of recommendations for a specific anime to Improve recommendation Accuracy, and the General ratings for a recommended anime to Identify a well-received Show.

### Recommendation Algorithm
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The recommendation score is weighted equally based on three things, (User Score, Most recommended, and General Ratings). Recommended Animes are retrieved from Anilist recommendation system in which Anilist Users recommend an Anime similar to others (i.e. Gintama is a comedy Anime similar to Level E, Daily Lives of High School Boys). Further, based on ones' User List, those recommendations are gathered and used for the Anime recommendations' Scores.
  
  1. User Score - User's scores for each Anime in ones' list is added to each of its own recommended anime, and each recommended Anime with all its user score ratings are averaged.
  2. Most Recommended - Acts as a weight for the Users' most watched Anime cluster [(1/SumofCountforAllRecommendedAnime)*CountfortheSpecificAnime] to avoid high score for such low recommendation.
  3. General Ratings - The general Mean score of an recommended Anime in the Anilist Database, and helps to increase the rates for a well received anime.

  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The Final Score for recommendation was then calculated by multiplying the three factors [(UserScore * MostRecommendedWeight * GeneralRatings)] instead of averaged to estimate and avoid low scores for each.
 
## Requirements
   - Anilist Account - [Anilist Website](https://anilist.co/home).
   - Anilist with list of Scored Anime (A properly rated list for the account is Necessary for Analysis).
