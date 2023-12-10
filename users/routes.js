import * as dao from "./dao.js";
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getSpotifyAccessToken() {
    const response = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        params: {
            grant_type: 'client_credentials'
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
        }
    });
    return response.data.access_token;
}

const searchSpotify = async (req, res) => {
    const query = req.query.query;
    try {
        const accessToken = await getSpotifyAccessToken();
        const spotifyResponse = await axios.get(`https://api.spotify.com/v1/search`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            params: {
                q: query,
                type: 'track'
            }
        });
        res.json(spotifyResponse.data);
    } catch (error) {
        console.error('Error searching Spotify:', error);
        res.status(500).send('Error searching Spotify');
    }
};


// let currentUser = null;

function UserRoutes(app) {
  const findAllUsers = async (req, res) => {
    console.log("findAllUsers");
    const users = await dao.findAllUsers();
    res.send(users);
  };
  const findUserById = async (req, res) => {
    const { id } = req.params;
    const user = await dao.findUserById(id);
    res.send(user);
  };
  const findUserByUsername = async (req, res) => {
    const { username } = req.params;
    const user = await dao.findUserByUsername(username);
    res.send(user);
  };
  const findUserByCredentials = async (req, res) => {
    const { username, password } = req.params;
    const user = await dao.findUserByCredentials(username, password);
    res.send(user);
  };
  const createUser = async (req, res) => {
    const { username, password, firstName, lastName } = req.params;
    console.log("create user");
    console.log(req.params);
    let user = null;
    try {
      user = await dao.createUser({
        username,
        password,
        firstName,
        lastName,
      });
    } catch (e) {
      console.log(e);
    }
    res.send(user);
  };
  const updateUser = async (req, res) => {
    const { id } = req.params;
    const user = req.body;
    const status = await dao.updateUser(id, user);
    const currentUser = await dao.findUserById(id);
    req.session["currentUser"] = currentUser;
    res.send(status);
  };

  const signIn = async (req, res) => {
    const { username, password } = req.body;
    const user = await dao.findUserByCredentials(username, password);
    if (user) {
      const currentUser = user;
      req.session["currentUser"] = currentUser;
      res.json(user);
      return;
    } else {
      res.sendStatus(403);
    }
  };
  const signOut = async (req, res) => {
    // currentUser = null;
    req.session.destroy();
    res.sendStatus(200);
  };
  const signUp = async (req, res) => {
    const { username, password, firstName, lastName, role } = req.body;
    const userExists = await dao.findUserByUsername(username);
    if (userExists) {
      res.sendStatus(403);
      return;
    }
    const user = await dao.createUser({ username, password, firstName, lastName, role });
    req.session["currentUser"] = user;
    res.json(user);
  };
  const account = async (req, res) => {
    const currentUser = req.session["currentUser"];
    // if (currentUser) {
    res.json(currentUser);
    // } else {
    //   res.sendStatus(403);
    // }
  };

  const findMostRecentUser = async (req, res) => {
    try {
      const user = await dao.findMostRecentUser();
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching the most recent user');
    }
  };

  const saveSong = async (req, res) => {
    try {
      const songData = req.body;
      const savedSong = await dao.saveSong(songData);
      res.json(savedSong);
    } catch (error) {
      console.error('Error saving song:', error);
      res.status(500).send('Error saving song');
    }
  };
  
  app.post("/api/songs", saveSong);



const saveReview = async (req, res) => {
  try {
      const reviewData = req.body; // This will include userId, songId, reviewText, and userName
      const savedReview = await dao.saveReview(reviewData);
      res.json(savedReview);
  } catch (error) {
      console.error('Error saving review:', error);
      res.status(500).send('Error saving review');
  }
};

const fetchFollowedUserReviews = async (req, res) => {
  try {
    const currentUserId = req.session.currentUser?._id;
    if (!currentUserId) {
      return res.status(403).send('User not authenticated');
    }

    const reviews = await dao.fetchFollowedUserReviews(currentUserId);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching followed user reviews:', error);
    res.status(500).send('Error fetching followed user reviews');
  }
};



app.get("/api/songs/details/:songId", async (req, res) => {
  try {
      const songId = req.params.songId;
      const songDetails = await dao.fetchSongDetails(songId);
      if (!songDetails) {
          return res.status(404).send("Song not found");
      }
      res.json(songDetails);
  } catch (error) {
      console.error('Error fetching song details:', error);
      res.status(500).send('Internal Server Error');
  }
});



app.get("/api/reviews/song/:songId", async (req, res) => {
  try {
      const songId = req.params.songId;
      const songReviews = await dao.fetchSongReviews(songId);
      res.json(songReviews);
  } catch (error) {
      console.error('Error fetching song reviews:', error);
      res.status(500).send('Internal Server Error');
  }
});



app.get("/api/followed-user-reviews", fetchFollowedUserReviews);

app.post("/api/reviews", saveReview);


  app.get("/api/search", searchSpotify);

  app.get("/api/users/most-recent", findMostRecentUser);

  app.post("/api/users/signin", signIn);
  app.post("/api/users/account", account);
  app.post("/api/users/signout", signOut);
  app.post("/api/users/signup", signUp);

  app.get("/api/users", findAllUsers);
  app.get("/api/users/:id", findUserById);
  app.get("/api/users/username/:username", findUserByUsername);

  // DONT DO THIS:
  app.get("/api/users/:username/:password", findUserByCredentials);
  app.get("/api/users/:username/:password/:firstName/:lastName", createUser);
  // app.post("/api/users", createUser);


  const updateUsers = async (req, res) => {
    const { id } = req.params;
    const user = req.body;
    const status = await dao.updateUser(id, user);
    res.send(status);
  };

  app.put("/api/users/:id", updateUser);
  app.put("/api/userss/:id", updateUsers);


  app.get("/api/reviews/user/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const userReviews = await dao.fetchUserReviews(userId);
        res.json(userReviews);
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).send('Internal Server Error');
    }
  });

  // In your UserRoutes function

const fetchAllSongs = async (req, res) => {
  try {
    const songs = await dao.fetchAllSongs();
    res.json(songs);
  } catch (error) {
    console.error('Error fetching all songs:', error);
    res.status(500).send('Internal Server Error');
  }
};

app.get("/api/songs", fetchAllSongs);

  
}

export default UserRoutes;
