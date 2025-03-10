const clientId = "dc5089b30ca2410098d69f1b41b65a14";
const searchParams = new URLSearchParams(window.location.search);
const code = searchParams.get("code");
const profile = JSON.parse(localStorage.getItem("profile"));

if (!code && !profile) {
  document.getElementById("login-btn").style.display = "block";
  document.getElementById("logout-btn").style.display = "none";
  document.getElementById("header").style.display = "none";

  document.getElementById("login-btn").onclick = function () {
    redirectToAuthCodeFlow(clientId);
  };
} else {
  document.getElementById("start-header").style.display = "none";

  if (profile) {
    populateUI(profile);
  } else {
    getAccessToken(clientId, code).then((accessToken) => {
      localStorage.setItem("accessToken", accessToken);
      fetchProfile(accessToken).then((profile) => {
        localStorage.setItem("profile", JSON.stringify(profile));
        localStorage.setItem("userId", profile.id);
        populateUI(profile);
      });
    });
  }

  document.getElementById("logout-btn").onclick = function () {
    localStorage.clear();
    window.location.href = "index.html";
  };
}

export async function getAccessToken(clientId, code) {
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "http://127.0.0.1:5173/callback");
  params.append("code_verifier", verifier);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const { access_token } = await result.json();
  return access_token;
}
async function fetchProfile(token) {
  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  return await result.json();
}

function populateUI(profile) {
  document.getElementById("displayName").innerText = profile.display_name;
  if (profile.images[0]) {
    document.getElementById("avatar").src = profile.images[0].url;
  }
  document.getElementById("id").innerText = profile.id;
  document.getElementById("country").innerText = profile.country;
  document.getElementById("email").innerText = profile.email;
  document.getElementById("uri").innerText = profile.uri;
  document
    .getElementById("uri")
    .setAttribute("href", profile.external_urls.spotify);

  setTimeout(function () {
    document.getElementById("profile").removeAttribute("hidden");
    document.getElementById("logout-btn").style.display = "block";
    document.getElementById("playlists-btn").style.display = "block";
  }, 100);
}
export async function redirectToAuthCodeFlow(clientId) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", "http://127.0.0.1:5173/callback");
  params.append("scope", "user-read-private user-read-email");
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
