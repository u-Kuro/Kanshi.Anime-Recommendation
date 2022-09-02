# Kanshi.-Anime-Recommendation
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;An Anime Recommendation App that uses existing Anilist account analyzed based on three factors. The User Score to evaluate ones' Likability, the Amount of recommendations for a specific anime to Improve recommendation Accuracy, and the General ratings for a recommended anime to Identify a well-received Show.

## Starting Up
  Installation
  1. Install the [Kanshi.](https://github.com/u-Kuro/Kanshi.Anime-Recommendation/raw/main/Kanshi..apk) application in an Android mobile.
  2. Run the app and Enter a username of an Exsting anilist account (A properly rated list is highly recommended). If you don't have one, you can easily Create an account in their website ([Anilist](https://anilist.co/home)) or Export your List from MAL (MyAnimeList) if you have one ([MAL export](https://myanimelist.net/panel.php?go=export)) then Import the XML file in the Anilist settings ([Anilist Import](https://anilist.co/settings/import)).
  
  Additional Features
  1. Filters are available, insert Genres/Tags/Status/Format/Year/Season/Studios to include and/or exclude (adding !filterword) an anime in your recommendation list.
  2. Sort by Scores/Status/Year/etc. to the desired order.
  3. Hidden/Unhidden List to hide an Anime from ones' list or show it back to your list (Click Show All for immediate retrieval).
  4. The Anilist website in the app is available to show a more detailed information about a recommended Anime (Click the title of an Anime).

## Recommendation Algorithm
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The recommendation score is weighted equally based on three things, (User Score, Most recommended, and General Ratings). Recommended Animes are retrieved from Anilist recommendation system in which Anilist Users recommend an Anime similar to others (i.e. Gintama is a comedy Anime similar to Level E, Daily Lives of High School Boys). Further, based on ones' User List, those recommendations are gathered and used for the Anime recommendations' Scores.
  
  1. User Score - User's scores for each Anime in ones' list is added to each of its own recommended anime, and each recommended Anime with all its user score ratings are averaged.
  2. Most Recommended - Acts as a weight for the Users' most watched Anime cluster [(1/SumofCountforAllRecommendedAnime)*CountfortheSpecificAnime] to avoid high score for such low recommendation.
  3. General Ratings - The general Mean score of an recommended Anime in the Anilist Database, and helps to increase the rates for a well received anime.

  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The Final Score for recommendation was then calculated by multiplying the three factors [(UserScore * MostRecommendedWeight * GeneralRatings)] instead of averaged to estimate and avoid low scores for each.
  
## Requirements
   - Anilist Account - [Anilist Website](https://anilist.co/home).
   - Anilist with list of Scored Anime (A properly rated list for the account is Necessary for Analysis).
