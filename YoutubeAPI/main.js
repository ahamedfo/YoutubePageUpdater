const CLIENT_ID = "686614691612-1nka9hht5k9mmf781foe7igo0qd3tjp3.apps.googleusercontent.com";
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'
];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const videoContainer = document.getElementById('video-container');

const defaultChannel = "PSGofficiel";

//Form submit to update the channel by taking in input value
channelForm.addEventListener('submit', function(e) {
    e.preventDefault(); //Preventing submission of form.

    const channel = channelInput.value;

    getChannel(channel);

})


//Loading auth2 library
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}


//Initializes the API client library and sets the sign in listeners
function initClient() {
  gapi.client.init({
    discoveryDocs: DISCOVERY_DOCS,
    clientId: CLIENT_ID,
    scope: SCOPES
  }).then(() => {
    //listen for sign in state changes
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    //Handling inital sign in readyState | Acquring the initial state of sign in status
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignOutClick;
  })
}


//Update UI Sign in state changes based on user is logged in .
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    content.style.display = 'block';
    videoContainer.style.display = 'block';
    getChannel(defaultChannel);
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
    content.style.display = 'none';
    videoContainer.style.display = 'none';
  }
}


//Handling login section

function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn();
}


//Handling logout section

function handleSignOutClick() {
  gapi.auth2.getAuthInstance().signOut();
}


//Displaying the channel Data in the 6 column div
function showChannelData(data) {
  const channelData = document.getElementById("channel-data");
  channelData.innerHTML = data;
}


//Get the channel from the api
function getChannel(channel) {
  gapi.client.youtube.channels.list({
    part: 'snippet, contentDetails, statistics', //Currently getting items for youtube.
    forUsername: channel
  })
    .then(response => {
      console.log(response);
      const channel = response.result.items[0];

      const output = `
        <ul class="collection">
          <li class="collection-item"> Title: ${channel.snippet.title} </li>
          <li class="collection-item"> ID: ${channel.id} </li>
          <li class="collection-item"> Subscribers: ${numberWithCommas(channel.statistics.subscriberCount)} </li>
          <li class="collection-item"> Views: ${numberWithCommas(channel.statistics.viewCount)} </li>
          <li class="collection-item"> Video Count: ${numberWithCommas(channel.statistics.videoCount)} </li>
        </ul>
        <p style="color:white"> ${channel.snippet.description}</p>
        <hr>
        <a class="btn grey darken-2" target="_blank" href="https://youtube.com/${channel.snippet.customUrl}"> Visit Channel </a>
     `;
     showChannelData(output);

     //Acquring the video information
     const playlistId = channel.contentDetails.relatedPlaylists.uploads;
     requestVideoPlaylist(playlistId);

    })
    .catch(err => alert("No Channel Has That Name"))
}


//Adding commas to numbers
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function requestVideoPlaylist(playlistId) {
  const requestOptions = {
    playlistId: playlistId,
    part: 'snippet',
    maxResults: 6
  }


  const request = gapi.client.youtube.playlistItems.list(requestOptions);

  request.execute(response => {
    console.log(response);
    const playListItems = response.result.items;
    if (playListItems) {
      let output = '<br><h4 class="center-align" style="color:white"> Latest Videos </h4>';

      //Looping through the Videos and appending output
      playListItems.forEach(item => {
        const videoId = item.snippet.resourceId.videoId;

        output += `
          <div class="col s4" style="margin: 2% auto">
            <iframe width="100%" height="225px" src="https://www.youtube.com/embed/${videoId}" frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        `
      });

      //Output video to document
      videoContainer.innerHTML = output;

    } else {
      videoContainer.innerHTML = "No videos have been uploaded";
    }
  });
}
