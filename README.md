# Kanshi.-Anime-Recommendation
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;An anime recommendation system using current Anilist account, calculations were based on User Score, Amount of Anilist Recommendations for a Specific Anime, and Recommeded Animes' Anilist General Ratings.

## Starting Up
  Installation
  1. Install the Kanshi. application.
  2. Run the app and enter an exsting Anilist Username (account with properly rated scores is recommended).
  
  Additional Features
  1. Filters are available, both include and exclude(adding !filterword) for Genre/Tags/Status/Format/Year/Season/Studios.
  2. Sort by Scores/Status/Year/etc. to the desired order.
  3. Hidden/Unhidden List to hide an Anime from the list or show it back to your list (Show all for immediate retrieval).
  4. Anilist website in the app to show a more detailed information (Click the title of an Anime).

## Recommendation Algorithm
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; The recommendation score is weighted equally based on three things, (User Score, Most recommended, and General Ratings). Recommended Animes are retrieved from Anilist recommendation system in which Anilist Users recommend an Anime similar to others (i.e. Gintama is a comedy Anime similar to Level E, Daily Lives of High School Boys). Further, based on ones' User List, those recommendations are gathered to be analyzed.
  
  1. User Score - User's scores for each Anime in ones' list is added to each of its own recommended anime, and each recommended Anime with all its user score ratings are averaged.
  2. Most Recommended - Acts as a weight for popularity for the Users' most watched similarity cluster (1/SumofCountforAllRecommendedAnime)*CountfortheSpecificAnime.
  3. General Ratings - General Mean score of an recommended Anime in Anilist Database.

  These three are then multiplied (UserScore * MostRecommendedWeight * GeneralRatings) instead of averaged to calculate while avoiding low scores for each.
  
## Requirements
   - Anilist Account ([Anilist Website](https://anilist.co/home)).
   - Anilist with list of Scored Anime (A properly rated list for the account is Necessary for Analysis).
