const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
module.exports = app;
//Get Movies_List
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
  SELECT movie_name FROM movie`;
  const moviesArray = await db.all(getMoviesQuery);
  let count = 0;
  for (let each of moviesArray) {
    moviesArray[count] = { movieName: each.movie_name };
    count = count + 1;
  }

  response.send(moviesArray);
});

//GET MOVIE
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
  SELECT * FROM movie WHERE movie_id=${movieId}`;
  const movieObject = convertDbObjectToResponseObject(
    await db.get(getMovieQuery)
  );

  response.send(movieObject);
});

//POST MOVIE
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieDetails = `
    INSERT INTO
      movie (director_id,movie_name,lead_actor)
    VALUES
      (
        '${directorId}',
         '${movieName}',
        '${leadActor}'
      );`;

  const dbResponse = await db.run(addMovieDetails);

  response.send("Movie Successfully Added");
});

//UPDATE MOVIE
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieDetails = `
    UPDATE
      movie
    SET
    director_id='${directorId}',
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE movie_id=${movieId};`;

  const dbResponse = await db.run(updateMovieDetails);

  response.send("Movie Details Updated");
});

//DELETE MOVIE

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//GET DIRECTORS

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
  SELECT director_id,director_name FROM director`;
  const directorsArray = await db.all(getDirectorsQuery);
  let count = 0;
  for (let each of directorsArray) {
    directorsArray[count] = {
      directorId: each.director_id,
      directorName: each.director_name,
    };
    count = count + 1;
  }

  response.send(directorsArray);
});

//GET MOVIES OF DIRECTOR

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesQuery = `
  SELECT movie_name FROM movie WHERE director_id=${directorId}`;
  const moviesArray = await db.all(getMoviesQuery);
  let count = 0;
  for (let each of moviesArray) {
    moviesArray[count] = { movieName: each.movie_name };
    count = count + 1;
  }

  response.send(moviesArray);
});
