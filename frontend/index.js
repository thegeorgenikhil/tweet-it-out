const linkTag = document.getElementById("authenticate-link");

window.addEventListener("click", async () => {
  const res = await fetch("http://localhost:8000/authenticate");
  const data = await res.json();
  // A link to the Twitter authentication page is returned, we need to redirect the user to that page
  const { url, savedToken, savedSecret } = data;
  // We need to save the token and secret in the local storage, we need them later
  localStorage.setItem("savedToken", savedToken);
  localStorage.setItem("savedSecret", savedSecret);
  window.location.replace(url);
});
