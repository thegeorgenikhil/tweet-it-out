const tweetInput = document.getElementById("tweet-input");
const tweetButton = document.getElementById("btn-tweet");
const tweetResult = document.getElementById("tweet-result");

tweetButton.addEventListener("click", async () => {
  try {
    const tweet = tweetInput.value;
    if (!tweet.length) return alert("Please enter a tweet");
    const { token, verifier } = getURLParams();
    // Fetching the token and secret from the local storage that we saved earlier
    const savedToken = localStorage.getItem("savedToken");
    const savedSecret = localStorage.getItem("savedSecret");
    const res = await fetch("http://localhost:8000/tweet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        verifier,
        savedToken,
        savedSecret,
        tweet,
      }),
    });
    if (res.status === 200) {
      tweetResult.innerHTML = `You just tweeted: ${tweet}`;
    }
  } catch (err) {
    console.log("There is some issue with the API" + err);
  }
});


// get the oauth_token and oauth_verifier from the URL that need to be sent to the server
function getURLParams() {
  const params = new URLSearchParams(window.location.search);
  const params_obj = {};
  for (const param of params) {
    if (param[0] === "oauth_token") {
      params_obj.token = param[1];
    }
    if (param[0] === "oauth_verifier") {
      params_obj.verifier = param[1];
    }
  }
  return params_obj;
}
