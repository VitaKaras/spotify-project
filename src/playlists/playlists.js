let currentPage = 1;
const itemsPerPage = 12;
let playlistsData = [];

window.onload = async function () {
  const accessToken = localStorage.getItem('accessToken');
  const userId = localStorage.getItem('userId');

  if (!accessToken || !userId) {
    alert('You are not authorized. Please login first.');
    window.location.href = 'index.html';
    return;
  }

  await getPlaylists(accessToken, userId);
}

async function getPlaylists(accessToken, userId) {
  const result = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const playlists = await result.json();
  playlistsData = playlists.items;
  renderPlaylists();
}

function renderPlaylists() {
  const container = document.getElementById('playlists');
  container.innerHTML = '';

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, playlistsData.length);

  for (let i = startIndex; i < endIndex; i++) {
    const playlist = playlistsData[i];

    let playlistDiv = document.createElement('div');
    playlistDiv.classList.add('playlist-item');

    let name = document.createElement("p");
    name.innerText = playlist.name;
    name.classList.add('playlist-name');
    playlistDiv.appendChild(name);

    const playlistsImg = playlist.images?.[0];
    if (playlistsImg) {
      let imgElement = document.createElement("img");
      imgElement.src = playlistsImg.url;
      imgElement.width = 200;
      imgElement.height = 200;
      imgElement.classList.add('playlist-image');
      playlistDiv.appendChild(imgElement);
    }

    let tracksNumber = document.createElement("p");
    tracksNumber.innerText = `Tracks: ${playlist.tracks.total || 0}`;
    tracksNumber.classList.add('playlist-tracks');
    playlistDiv.appendChild(tracksNumber);

    container.appendChild(playlistDiv);
  }

  updatePagination();
}

function updatePagination() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const pageInfo = document.getElementById('page-info');

  pageInfo.innerText = `Page ${currentPage} of ${Math.ceil(playlistsData.length / itemsPerPage)}`;

  if (currentPage === 1) {
    prevBtn.disabled = true;
  } else {
    prevBtn.disabled = false;
  }

  if (currentPage * itemsPerPage >= playlistsData.length) {
    nextBtn.disabled = true;
  } else {
    nextBtn.disabled = false;
  }
}

document.getElementById('prev-btn').onclick = function () {
  if (currentPage > 1) {
    currentPage--;
    renderPlaylists();
  }
}

document.getElementById('next-btn').onclick = function () {
  if (currentPage * itemsPerPage < playlistsData.length) {
    currentPage++;
    renderPlaylists();
  }
}
