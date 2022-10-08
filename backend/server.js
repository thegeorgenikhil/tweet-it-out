const { TwitterApi } = require("twitter-api-v2");
const express = require("express");
const cors = require("cors");
const app = express();
const port = 8000;

require("dotenv").config();
app.use(cors());
app.use(express.json());

app.get("/authenticate", async (req, res) => {
  // creating a new instance of the TwitterApi using app key and secret
  const requestClient = new TwitterApi({
    appKey: process.env.APP_KEY,
    appSecret: process.env.APP_KEY_SECRET,
  });
  // how to reduce the permission of the auth link 

  const modifiedClient = requestClient.readOnly


  // we need to generate a url to redirect the user to twitter authentication page
  const authLink = await modifiedClient.generateAuthLink(
    process.env.CALLBACK_URL
  );
  const {
    url,
    oauth_token: savedToken,
    oauth_token_secret: savedSecret,
  } = authLink;
  // we need to save the token and secret for use in the next part
  return res.json({ url, savedToken, savedSecret });
});

app.post("/tweet", async (req, res) => {
  try {
    // after successful authentication, twitter will redirect the user to the callback url we provided, with query params containing the oauth_verifier and oauth_token which we then pass back to the server to get the access token along with the saved token and secret
    const { token, verifier, savedToken, savedSecret, tweet } = req.body;

    if (!savedToken || !savedSecret || savedToken !== token) {
      return res.status(400).json({
        error:
          "OAuth token is not known or invalid. Your request may have expire. Please renew the auth process.",
      });
    }
    const client = new TwitterApi({
      appKey: process.env.APP_KEY,
      appSecret: process.env.APP_KEY_SECRET,
      accessToken: token,
      accessSecret: savedSecret,
    });
    // now we are getting the user's access token and secret which we will use to make requests on behalf of the user 
    const { accessToken, accessSecret, screenName, userId } =
      await client.login(verifier);
    // we are creating an instance for the user using the access token and secret 
    const user = new TwitterApi({
      appKey: process.env.APP_KEY,
      appSecret: process.env.APP_KEY_SECRET,
      accessToken,
      accessSecret,
    });
    // now we can make a request to twitter to post a tweet from the user account
    const tweeting = await user.v2.tweet(tweet);
    return res.status(200).json({ tweetStatus: "success", tweeting });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ err: err });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


// What does /tweet endpoint do?
// 1. It takes the oauth_verifier, oauth_token the saved token and secret from the request body
// 2. It creates an instance of the TwitterApi using the app key and secret
// 3. It uses the login method to get the user's access token and secret
// 4. It creates an instance of the TwitterApi using the app key and secret and the user's access token and secret
// 5. It uses the tweet method to post a tweet from the user's account

