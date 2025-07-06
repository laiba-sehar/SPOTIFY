
let currentSong = new Audio();
let Song;
let currFolder;
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  // Pad with leading zeros if needed
  const formattedMins = mins.toString().padStart(2, "0");
  const formattedSecs = secs.toString().padStart(2, "0");

  return `${formattedMins}:${formattedSecs}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  Song = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3") || element.href.endsWith(".mp4")) {
      Song.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // Show all songs in the playlist
  let songUl = document.querySelector(".songlists ul");
  songUl.innerHTML = "";
  for (const element of Song) {
    songUl.innerHTML += `
      <li>
        <img class="music invert" src="images/music.png" alt="" />
        <div class="info">
          <div> ${element.replaceAll("%20", " ")}</div>
          <div>Artist Name</div>
        </div>
        <div class="playnow"><span>Play now</span></div>
        <img class="invert playButton" src="images/playButt.png" alt="">
      </li>`;
  }

  // Attach click events for newly created playlist items
  Array.from(document.querySelector(".songlists").getElementsByTagName("li"))
    .forEach((li, index) => {
      li.addEventListener("click", () => {
        playMusic(Song[index]);
      });
    });

  return Song;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    playS.src = "pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

  //  Update duration after metadata is loaded
  currentSong.addEventListener("loadedmetadata", () => {
    document.querySelector(".songtime").innerHTML = `00:00 / ${formatTime(
      currentSong.duration
    )}`;
  });
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;

  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");

  let cardPromises = Array.from(anchors).map(async (e) => {
    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      // Proper folder extraction
      let url = new URL(e.href);
      let folder = url.pathname.split("/").filter(Boolean).pop();

      try {
        // Fetch info.json from the correct folder
        let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
        let response = await a.json();
        console.log(response);

        // Append card to container
        cardContainer.innerHTML += `
          <div data-folder="${folder}" class="card">
            <div class="play">
              <img src="images/blackplay.png" alt="Play Icon" />
            </div>
            <img src="/songs/${folder}/cover.jfif" alt="" />
            <h2>${response.title}</h2>
            <p>${response.description}</p>
          </div>`;
      } catch (err) {
        console.error(`Failed to fetch info.json for folder "${folder}"`, err);
      }
    }
  });

  // Wait for all cards to be added before attaching event listeners
  await Promise.all(cardPromises);

  // Now attach click event listeners to the newly added cards
  document.querySelectorAll(".card").forEach((e) => {
    e.addEventListener("click", async (item) => {
      let folder = item.currentTarget.dataset.folder;
      console.log("Fetching Songs from:", folder);

      let songs = await getSongs(`songs/${folder}`);
      playMusic(songs[0]); // Play first song

      // Add click handlers to each song in the playlist


    });
  });
}

async function main() {
  //get the list of all songs
 await getSongs("songs/cs");
  playMusic(Song[0], true);

  //display all albums on the page
  displayAlbums();



  //Attach event listener to each song
Array.from(
  document.querySelector(".songlists").getElementsByTagName("li")
).forEach((e, index) => {
  e.addEventListener("click", () => {
    playMusic(Song[index]);
  });
});


  //Attach event listeren to play next and previous song

  playS.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      playS.src = "pause.svg";
    } else {
      currentSong.pause();
      playS.src = "play.svg";
    }
  });
  // listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentSong.currentTime
    )} / ${formatTime(currentSong.duration)}`;
     document.querySelector('.circle').style.left=(currentSong.currentTime/currentSong.duration)*100 + '%';
  });

  // add event listener to seekbar
  document.querySelector('.seekbar').addEventListener("click", e=>{
    let percent=(e.offsetX/e.target.getBoundingClientRect().width) * 100
document.querySelector(".circle").style.left=percent + "%";
currentSong.currentTime=((currentSong.duration)* percent)/100
  })

  //add event listener to hamburger

  document.querySelector('.hamburger').addEventListener("click",()=>{
    document.querySelector(".left").style.left="0"
  })
   //add event listener to closebutton
  document.querySelector('.close').addEventListener("click",()=>{
    document.querySelector('.left').style.left="-120%"
  })
  // add an event listener for previous and next
  prev.addEventListener("click",()=>{
     let index=Song.indexOf(currentSong.src.split("/").slice(-1) [0])
    if(index-1>=0)
    {
      playMusic(Song[index-1])
    }
  })
    next.addEventListener("click",()=>{
currentSong.pause()

    let index=Song.indexOf(currentSong.src.split("/").slice(-1) [0])
    if(index+1 <= Song.length-1)
    {
      playMusic(Song[index+1])
    }
  })
  // Add event to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
currentSong.volume=parseInt(e.target.value)/100
  })

  //add eventlistener to mute the track
document.querySelector(".volume>img").addEventListener("click",e=>{
  console.log(e.target)
if(e.target.src.includes("volume.svg")){
   e.target.src= e.target.src.replace("volume.svg","mute.svg")
  currentSong.volume=0
    document.querySelector(".range").getElementsByTagName("input")[0].value=0
}
else{
   e.target.src= e.target.src.replace("mute.svg","volume.svg")
  currentSong.volume=.10
    document.querySelector(".range").getElementsByTagName("input")[0].value=10
}
})

}
main();

