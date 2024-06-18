let main = document.getElementById('full');
const apiURL = 'http://150.136.136.166:3000';
const wssURL = 'ws://150.136.136.166:3001'
//const apiURL = 'http://localhost:3000';
//const wssURL = 'ws://localhost:3001';
const EXT_VERSION = '4';
document.onkeydown = showBigCard;
document.onkeyup = hideBigCard;

//TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO
//TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO
//TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO
//TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO
//TODO                                                                                     TODO
//TODO                               option to quit the room                               TODO
//TODO            try to remember what the fuck forceRotation and tenpaiRedraw are         TODO
//TODO                                                                                     TODO
//TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO
//TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO
//TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO
//TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO

let sessionid = null;
let playerid = '';
let sanmaSelected = false;
let isBetaSession = false;
let sessionState = '';
let callInterval;
let hiddenUI = false;
let hiddenCards = false;
let hiddenSidebar = false;
let arrangeMode = false;
let ws;
let spectatorMode = false;

let html = `
  <div class="d-flex align-items-center" id="saki-sidebar-container">
    <h2 class="text-light px-2" id="toggle-saki-sidebar">›</h2>
    <div id="saki-sidebar">
      <h2>Saki Cards</h2>
      <h3 id="room-number" style="user-select: auto;"></h3>
      <h6 id="room-admin"></h6>
      <h5 id="spectating-name"></h5>
      <div id="game-controls">
        <div class="mt-2 d-flex" style="width:100%;">
          <button id="hide-button" class="btn btn-secondary btn-sm w-100" style="margin-right: 8px">Toggle UI</button>
          <button id="hide-cards-button" class="btn btn-secondary btn-sm w-100" style="margin-right:0">Hide cards</button>
        </div>
        <div id="spectator-controls" style="display: none;">
          <button id="spectate-left" class="btn btn-warning btn-sm w-100">🡄</button>
          <button id="spectate-right" class="btn btn-warning btn-sm w-100">🡆</button>
        </div>
        <button id="reveal-button" class="btn btn-warning btn-sm w-100">Reveal cards</button>
        <button id="reset-button" class="btn btn-warning btn-sm w-100">New round</button>
        <button id="draw-button" class="btn btn-warning btn-sm w-100">Draw 1</button>
        <button id="arrange-button" class="btn btn-dark btn-sm w-100">Arrange seats</button>
        <button id="return-all-cards" class="btn btn-danger btn-sm w-100">Return all cards</button>

        <div class="mt-2 d-flex" style="width:100%;">
          <h3 class="seat-select" style="display: none; margin: 6px 6px 0 0;">🡄</h3>
          <select id="select-kamicha" class="dark-select form-control form-control-sm mt-2 seat-select seat-select-element" style="display: none">
          </select>
        </div>

        <div class="mt-2 d-flex" style="width:100%;">
          <h3 class="seat-select" style="display: none; margin: 6px 6px 0 0;">🡅</h3>
          <select id="select-toimen" class="dark-select form-control form-control-sm mt-2 seat-select seat-select-element" style="display: none">
          </select>
        </div>

        <div class="mt-2 d-flex" style="width:100%;">
          <h3 class="seat-select" style="display: none; margin: 6px 6px 0 0;">🡆</h3>
          <select id="select-shimocha" class="dark-select form-control form-control-sm mt-2 seat-select seat-select-element" style="display: none">
          </select>
        </div>

        <div id="disclaimer">
          <p>Press shift while hovering over a card to zoom in.</p>
          <p class="grey">Developed by Umeboshi (Discord: @fuzzwasalreadytaken)</p>
          <p class="grey">Original game by Anton00, KlorofinMaster & DramaTheurgist</p>
          <p class="grey">Saki 咲 Fan Community</p>
        </div>
      </div>
      <div id="join-controls"> 
        <h3>Create Room</h2>
        <form id="create-form" autocomplete="off">
          <select id="sanma-input" class="dark-select form-control form-control-sm mt-2">
            <option value="false">Suuma</option>
            <option value="true">Sanma</option>
          </select>
          <div class="beta-field">
            <label for="beta-input">Use beta cards?</label>
            <input type="checkbox" id="beta-input">
          </div>
          <label for="admin-input">Nickname:</label>
          <input type="text" id="admin-input" class="form-control form-control-sm" minlength=2 maxlength=24 pattern="^[a-zA-Z0-9]{2,24}$" required></input>
          <button id="create-button" type="button" class="btn btn-warning btn-sm w-100">CREATE</button>
        </form>

        <h3>Join Room</h2>
        <form id="join-form" autocomplete="off">
          <label for="session-input">Room ID:</label>
          <input type="tel" id="session-input" class="form-control form-control-sm" minlength=4 maxlength=4 required pattern="^[0-9]{2,24}$"></input>
          <label for="nickname-input">Nickname:</label>
          <input type="text" id="nickname-input" class="form-control form-control-sm" minlength=2 maxlength=24 pattern="^[a-zA-Z0-9\-_]{2,24}$" required></input>
          <button id="join-button" type="button" class="btn btn-warning btn-sm w-100">JOIN</button>
        </form>
      </div>
    </div>
  </div>

  <div id="saki-player-hand" >
  </div>

  <div class="opponent-area">
    <div id="kamicha-player-hand" class="opponent-hand">
    </div>

    <div id="toimen-player-hand" class="opponent-hand">
    </div>

    <div id="shimocha-player-hand" class="opponent-hand">
    </div>
  </div>

  <div id="big-card" style="display: none">
    <img id="big-saki-card-img" class="saki-card-img" src="" alt="" draggable="false">
  </div>

  <h3 class="player-name" id="kamicha-name" style="top: 48vh; left: 29vw;"></h3>
  <h3 class="player-name" id="toimen-name" style="top: 22vh; left: 48vw;"></h3>
  <h3 class="player-name" id="shimocha-name" style="top: 48vh; right: 29vw;"></h3>

  <div id="player-card" class="played-card">
    <img id="player-img" class="played-saki-card-img" src="${chrome.runtime.getURL('assets/cardback.png')}" alt="" draggable="false">
    <button id="flip-button" class="btn btn-success btn-sm w-100"><b>⮏</b></button>
  </div>
  <div id="kamicha-card" class="played-card">
    <img id="kamicha-img" class="played-saki-card-img" src="${chrome.runtime.getURL('assets/cardback.png')}" alt="" draggable="false">
  </div>
  <div id="toimen-card" class="played-card">
    <img id="toimen-img" class="played-saki-card-img" src="${chrome.runtime.getURL('assets/cardback.png')}" alt="" draggable="false">
  </div>
  <div id="shimocha-card" class="played-card">
    <img id="shimocha-img" class="played-saki-card-img" src="${chrome.runtime.getURL('assets/cardback.png')}" alt="" draggable="false">
  </div>
`;
 
main.insertAdjacentHTML('beforeend', html);

const playerHand = document.getElementById('saki-player-hand');
const kamichaHand = document.getElementById('kamicha-player-hand');
const toimenHand = document.getElementById('toimen-player-hand');
const shimochaHand = document.getElementById('shimocha-player-hand');
const bigCard = document.getElementById('big-card');
const pcard = document.getElementById('player-card');
const kcard = document.getElementById('kamicha-card');
const tcard = document.getElementById('toimen-card');
const scard = document.getElementById('shimocha-card');

for (let el of document.getElementsByName('input')) {
  el.addEventListener("keypress", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
    }
  });
}

addCardListeners(pcard);
addCardListeners(kcard);
addCardListeners(tcard);
addCardListeners(scard);


document.getElementById("hide-button").addEventListener("click", () => {
  hiddenUI = !hiddenUI;

  if (hiddenUI) {
    playerHand.style.bottom = '-500px';
    kamichaHand.style.left = '-500px';
    toimenHand.style.top = '-500px';
    shimochaHand.style.right = '-500px';
  
    pcard.style.bottom = '1vh';
    pcard.style.right = '0vw';
    pcard.style.height = '31vh';
    
    kcard.style.top = '57vh';
    kcard.style.left = '34.5vw';
    kcard.style.height = '20vh';
    kcard.style.width = '7vw';
    kcard.style.transform = 'rotate(90deg)';

    tcard.style.top = '20.5vh';
    tcard.style.left = '36vw';
    tcard.style.height = '20vh';
    tcard.style.width = '7vw';
    tcard.style.transform = 'rotate(180deg)';

    scard.style.top = '22.5vh';
    scard.style.right = '34.5vw';
    scard.style.height = '20vh';
    scard.style.width = '7vw';
    scard.style.transform = 'rotate(-90deg)';
  } else {
    playerHand.style.bottom = null;
    kamichaHand.style.left = null;
    toimenHand.style.top = null;
    shimochaHand.style.right = null;
  
    pcard.style.bottom = null;
    pcard.style.right = null;
    pcard.style.height = null;
    
    kcard.style.top = null;
    kcard.style.left = null;
    kcard.style.height = null;
    kcard.style.width = null;
    kcard.style.transform = null;

    tcard.style.top = null;
    tcard.style.left = null;
    tcard.style.height = null;
    tcard.style.width = null;
    tcard.style.transform = null;

    scard.style.top = null;
    scard.style.right = null;
    scard.style.height = null;
    scard.style.width = null;
    scard.style.transform = null;
  }
  
});

document.getElementById("hide-cards-button").addEventListener("click", (event) => {
  hiddenCards = !hiddenCards;

  if (hiddenCards) {  
    event.target.textContent = 'Show cards';
  } else {
    event.target.textContent = 'Hide cards';
  }
  receiveData(sessionState);
});

document.getElementById("toggle-saki-sidebar").addEventListener("click", (event) => {
  hiddenSidebar = !hiddenSidebar;
  let container = document.getElementById('saki-sidebar-container');

  if (hiddenSidebar) {  
    container.style.right = '-220px';
    event.target.textContent = '‹';
  } else {
    container.style.right = '0';
    event.target.textContent = '›';
  }  
});

document.getElementById("arrange-button").addEventListener("click", (event) => {
  if (sessionState.players.length > 0) {
    if (arrangeMode) {
      arrangeMode = false;
      for (let element of document.getElementsByClassName('seat-select')) {
        element.style.display = 'none';
      }
      event.target.textContent = 'Arrange seats';
      event.target.className = 'btn btn-dark btn-sm w-100';
    } else {
      arrangeMode = true;
      
      for (let element of document.getElementsByClassName('seat-select')) {
        element.style.display = 'block';
      }
      event.target.textContent = 'Confirm';
      event.target.className = 'btn btn-danger btn-sm w-100';
    }
  }
});

document.getElementById("select-kamicha").addEventListener("change", (event) => {
  let value = event.target.value;
  if (value != null) arrangeSeats(4, value);
});

document.getElementById("select-toimen").addEventListener("change", (event) => {
  let value = event.target.value;
  if (value != null) arrangeSeats(3, value);
});

document.getElementById("select-shimocha").addEventListener("change", (event) => {
  let value = event.target.value;
  if (value != null) arrangeSeats(2, value);
});

document.getElementById("create-button").addEventListener("click", () => {  
  playerid = document.getElementById('admin-input').value;
  sanmaSelected = document.getElementById('sanma-input').value;
  isBetaSession = document.getElementById('beta-input').checked;
  let form = document.getElementById('create-form');
  if (form.checkValidity() && playerid != '') createRoom();
});

document.getElementById("join-button").addEventListener("click", () => {
  playerid = document.getElementById('nickname-input').value;
  sessionid = document.getElementById('session-input').value;
  let form = document.getElementById('join-form');
  if (form.checkValidity() && playerid != '') joinRoom();
});

document.getElementById("reveal-button").addEventListener("click", () => {
  revealTable();
});

document.getElementById("flip-button").addEventListener("click", () => {
  flipCard();
});

document.getElementById("reset-button").addEventListener("click", () => {
  resetTable();
});

const getCardImgUrl = (card) => {
  return card && (card.isBeta ? chrome.runtime.getURL('assets/beta/'+card.name+'.png') : chrome.runtime.getURL('assets/'+card.name+'.png'));
}

const newCard = (card, parent) => {
  let img = document.createElement('img');
  img.src = getCardImgUrl(card);
  img.className = 'saki-card-img';
  img.alt = card.name;
  img.draggable = false;
  
  let div = document.createElement('div');
  div.className = 'card-actions';
  div.title = card.name;

  if (!spectatorMode) {
    let button1 = document.createElement('button');
    button1.type = 'button';
    button1.className = 'btn btn-success btn-sm w-100';
    button1.title = 'Play this card';
    button1.textContent = '✔️';
    button1.addEventListener("click", () => {
      //! handle play card if table is open
      playCard(card.name);
    });

    let button2 = document.createElement('button');
    button2.type = 'button';
    button2.className = 'btn btn-danger btn-sm w-100';
    button2.title = 'Shuffle back to deck';
    button2.textContent = '♻️';
    
    button2.addEventListener("click", () => {
      //! handle return card if table is open
      returnCard(card.name);
    });

    div.insertAdjacentElement('beforeend', button1);
    div.insertAdjacentElement('beforeend', button2);
  }
  
  parent.insertAdjacentElement('beforeend', div);
  parent.insertAdjacentElement('beforeend', img);
}

function showBigCard(e){
  if (e.which == 16)  {
    bigCard.style.display = 'block';
  }
}

function hideBigCard(e){
  if (e.which == 16)  {
    bigCard.style.display = 'none';
  }
}

function addCardListeners(cardElement, card) {
  cardElement.addEventListener("mouseover",function() {
    let element = document.getElementById('big-saki-card-img');
    element.style.display = 'block';
    element.src = getCardImgUrl(card);
  });
  
  cardElement.addEventListener("mouseout",function() {
    let element = document.getElementById('big-saki-card-img');
    element.style.display = null;
  });
}

function receiveData(session) {
  if (/*JSON.stringify(*/session/*) != JSON.stringify(sessionState)*/) {
    console.log(session);
    sessionid = session.id;

    let player = session.players.find(p => p.nickname == playerid);
    if (spectatorMode) {
      console.log('Spectator mode');
      let spec = session.spectators.find(s => s.nickname == playerid);
      player = session.players.find(p => p.seat == spec.seat);
      
      console.log('spec:', player, spec);
      let specLabel = document.getElementById('spectating-name')
      specLabel.innerHTML = 'Spectating: ' + player.nickname;
      specLabel.style.display = 'block';
    }

    let incomingHand = player.hand || [];
    let currentHand = sessionState.players?.find(p => p.nickname == player.nickname).hand || [];

    let equal = incomingHand.length != currentHand.length ? false : JSON.stringify(incomingHand) == JSON.stringify(currentHand);

    if (!equal || spectatorMode) {  
      playerHand.textContent = '';
      incomingHand.forEach(card => {
        let newcard = document.createElement('div');
        newcard.title = card.name;
        newcard.className = card.isBeta || card.betaHimeko ? 'own-card own-card-beta' : 'own-card';
        newCard(card, newcard);
        addCardListeners(newcard, card);
        playerHand.insertAdjacentElement('beforeend', newcard);
      });
    }

    if (player.playedCard != null  && !hiddenCards) {
      addCardListeners(pcard, player.playedCard);
      document.getElementById('player-card').style.display = 'block';
      document.getElementById('player-img').src = getCardImgUrl(player.playedCard);
      document.getElementById('player-card').title = player.playedCard.name;
      if (player.playedCard.name == "Shirouzu_Mairu") {
        document.getElementById('flip-button').style.display = 'block';
        if (player.flippedOver) {
          document.getElementById('player-img').src = player.playedCard.betaHimeko ? chrome.runtime.getURL(`assets/beta/Tsuruta_Himeko.png`) : chrome.runtime.getURL(`assets/Tsuruta_Himeko.png`);
          document.getElementById('player-card').title = 'Tsuruta_Himeko';
        }
      } else {
        document.getElementById('flip-button').style.display = 'none';
      }
      if (session.revealed) {
        document.getElementById('player-img').style.filter = null;
        document.getElementById('player-card').title = player.playedCard.name;
      } else {
        document.getElementById('player-img').style.filter = 'grayscale(1)';
      }
    } else {
      document.getElementById('player-card').style.display = 'none';
      addCardListeners(pcard, {name: 'cardback'});
    }

    let kamicha, toimen, shimocha;

    switch (player.seat) {
      case 1:
        shimocha = 2;
        toimen = 3;
        kamicha = 4;
      break;
      case 2:
        shimocha = 3;
        toimen = 4;
        kamicha = 1;
      break;
      case 3:
        shimocha = 4;
        toimen = 1;
        kamicha = 2;
      break;
      case 4:
        shimocha = 1;
        toimen = 2;
        kamicha = 3;
      break;
    }

    // Setup for admin rearrange seats options
    if (JSON.stringify(session.players) != JSON.stringify(sessionState.players) && session.owner == player.nickname) {
      for (let element of document.getElementsByClassName('seat-select-element')) {
        element.innerHTML = '<option value> None </option>';
      }
      session.players.forEach(p => {
        if (p.nickname != player.nickname) {
          let option = `<option value="${p.nickname}">${p.nickname}</option>`;
            
          document.getElementById('select-kamicha').innerHTML += option;
          document.getElementById('select-toimen').innerHTML += option;
          document.getElementById('select-shimocha').innerHTML += option;
        }
      });
      session.players.forEach(p => {
        switch(p.seat) {
          case 4: 
            document.getElementById('select-kamicha').value = p.nickname;
          break;
          case 3:
            document.getElementById('select-toimen').value = p.nickname;
          break;
          case 2:
            document.getElementById('select-shimocha').value = p.nickname;
          break;
        }
      });
    }

    kamichaHand.textContent = '';
    toimenHand.textContent = '';
    shimochaHand.textContent = '';

    var setHand = (seat, seatName, seatHand) => {
      if (session.players.some(p => p.seat == seat)) {
        let thisPlayer = session.players.find(p => p.seat == seat);
        document.getElementById(`${seatName}-name`).textContent = thisPlayer.nickname;
        if (thisPlayer.playedCard != null && !hiddenCards) {
          let cardElement = document.getElementById(`${seatName}-card`);
          cardElement.style.display = 'block';
          addCardListeners(cardElement, session.revealed ? thisPlayer.playedCard : {name: 'cardback'});
          if (session.revealed) {
            document.getElementById(`${seatName}-img`).src = getCardImgUrl(thisPlayer.playedCard);
            document.getElementById(`${seatName}-card`).title = thisPlayer.playedCard.name;
            if (thisPlayer.playedCard.name == "Shirouzu_Mairu" && thisPlayer.flippedOver) {
              document.getElementById(`${seatName}-img`).src = thisPlayer.playedCard.betaHimeko ? chrome.runtime.getURL(`assets/beta/Tsuruta_Himeko.png`) : chrome.runtime.getURL(`assets/Tsuruta_Himeko.png`);
              document.getElementById(`${seatName}-card`).title = 'Tsuruta_Himeko';
            }
          } else {
            document.getElementById(`${seatName}-img`).src = chrome.runtime.getURL('assets/cardback.png');
            document.getElementById(`${seatName}-card`).title = 'cardback';
          }
        } else {
          let cardElement = document.getElementById(`${seatName}-card`)
          cardElement.style.display = 'none';
          addCardListeners(cardElement, {name: 'cardback'});
        }
  
        for (let i = 0; i < thisPlayer.hand.length; i++) {
          let newcard = document.createElement('div');
          newcard.className = 'opponent-card';
          newcard.innerHTML = `<img class="saki-card-img" src="${chrome.runtime.getURL('assets/cardback.png')}" alt="Unknown card" draggable="false">`;
          seatHand.insertAdjacentElement('beforeend', newcard);
        }
      } 
      else {
        document.getElementById(`${seatName}-name`).textContent = '';
        document.getElementById(`${seatName}-card`).style.display = 'none';
      }
    }

    setHand(kamicha, 'kamicha', kamichaHand);
    setHand(toimen, 'toimen', toimenHand);
    setHand(shimocha, 'shimocha', shimochaHand);

    sessionState = session;
  }
  if (ws && ws.readyState == 1) ws.send(JSON.stringify({sessionid: sessionid, playerid: playerid}));
}


// Backend functions ///////////////////////////////////////////////////////////////////////////////////////

init = function(sessionid, playerid) {
  ws = new WebSocket(`${wssURL}/?sessionid=${sessionid}&playerid=${playerid}`);
  ws.binaryType = 'arraybuffer';

  ws.onopen = function() {
    console.log('Connected to WSS');
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data) {
      receiveData(data);
    }
    else {
      console.error('There was an error!', error);
      ws.close();
    }
  };

  ws.onclose = () => {
    console.log('Disconnected from WSS');
    alert('Disconnected from the room... Maybe your connection is unstable?');
    resetView();
  }
}

createRoom = () => {
  fetch(`${apiURL}/session?version=${EXT_VERSION}`, {
    method: 'POST',
    rejectUnauthorized: false,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      owner: playerid,
      sanma: sanmaSelected,
      mode: "normal",
      length: "east",
      forcedRotation: false,
      tenpaiRedraw: false,
      betaSession: isBetaSession
    })
  })
  .then(async response => {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    // check for error response
    if (!response.ok) {
      // get error message from body or default to response status
      const error = (data && data.message) || response.status;
      return Promise.reject(error);
    }

    console.log(data);
    if (data.alert == 'VERSION_MISMATCH') {
      alert("You're using an outdated version of the extension! Please update to the latest version from the repo.");
      return;
    }
    document.getElementById('room-number').textContent = 'Room: ' + data.id;
    document.getElementById('room-admin').textContent = 'Admin: ' + data.owner;
    document.getElementById("reveal-button").style.display = 'block';
    document.getElementById("reset-button").style.display = 'block';
    receiveData(data);
    init(data.id, playerid);
    
    activateButtons();
  })
  .catch(error => {
    //todo element.parentElement.innerHTML = `Error: ${error}`;
    console.error('There was an error!', error);
    if (error.message.includes('Failed to fetch')) {
      alert('Failed to reach server\nCheck your internet connection and don\'t forget this step:\nhttps://github.com/fuzzfactory0/saki-cards-extension#config-your-browser-so-its-able-to-reach-the-saki-cards-server')
    }
  });
}

joinRoom = () => {
  // initialize websocket connection
  fetch(`${apiURL}/join?version=${EXT_VERSION}&sessionid=${sessionid}&playerid=${playerid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .then(async response => {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    // check for error response
    if (!response.ok) {
      if (response.status == 404) {
        alert('Room not found!');
      } else if (response.status == 500) {
        alert('There was an error... Please refresh and try again');
      }
      // get error message from body or default to response status
      const error = (data && data.message) || response.status;
      return Promise.reject(error);
    }

    if (data.alert == 'VERSION_MISMATCH') {
      alert("You're using an outdated version of the extension! Please update to the latest version from the repo.");
      return;
    }

    if (data.spectatorMode) {
      alert("You're spectating this match!");
      spectatorMode = true;
    }

    document.getElementById('room-number').textContent = 'Room: ' + data.id;
    document.getElementById('room-admin').textContent = 'Admin: ' + data.owner;
    document.getElementById("reveal-button").style.display = 'none';
    document.getElementById("reset-button").style.display = 'none';
    document.getElementById("arrange-button").style.display = 'none';
    document.getElementById("return-all-cards").style.display = 'none';
    
    receiveData(data);
    init(data.id, playerid);
    
    activateButtons();
  })
  .catch(error => {
    //todo element.parentElement.innerHTML = `Error: ${error}`;
    console.error('There was an error!', error);
    if (error.message.includes('Failed to fetch')) {
      alert('Failed to reach server\nCheck your internet connection and don\'t forget this step:\nhttps://github.com/fuzzfactory0/saki-cards-extension#config-your-browser-so-its-able-to-reach-the-saki-cards-server')
    }
  });
}

activateButtons = () => {
  document.getElementById('join-controls').style.display = 'none';
  document.getElementById('game-controls').style.display = 'flex';
  if (!spectatorMode) {
    document.getElementById("draw-button").addEventListener("click", () => {
      fetch(`${apiURL}/draw?sessionid=${sessionid}&playerid=${playerid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then(async response => {
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;
    
        // check for error response
        if (!response.ok) {
          // get error message from body or default to response status
          const error = (data && data.message) || response.status;
          return Promise.reject(error);
        }
    
        receiveData(data);
      })
      .catch(error => {
        //todo element.parentElement.innerHTML = `Error: ${error}`;
        console.error('There was an error!', error);
      });
    });

    document.getElementById("return-all-cards").addEventListener("click", () => {
      fetch(`${apiURL}/returnAll?sessionid=${sessionid}&playerid=${playerid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then(async response => {
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;
    
        // check for error response
        if (!response.ok) {
          // get error message from body or default to response status
          const error = (data && data.message) || response.status;
          return Promise.reject(error);
        }
    
        receiveData(data);
      })
      .catch(error => {
        //todo element.parentElement.innerHTML = `Error: ${error}`;
        console.error('There was an error!', error);
      });
    });
  } else {
    document.getElementById('draw-button').style.display = 'none';
    document.getElementById('spectator-controls').style.display = 'flex';
    var changeSeatFunction = (direction) => {
      fetch(`${apiURL}/spectateSeat?sessionid=${sessionid}&playerid=${playerid}&direction=${direction}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then(async response => {
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;
    
        // check for error response
        if (!response.ok) {
          // get error message from body or default to response status
          const error = (data && data.message) || response.status;
          return Promise.reject(error);
        }
    
        receiveData(data);
      })
      .catch(error => {
        //todo element.parentElement.innerHTML = `Error: ${error}`;
        console.error('There was an error!', error);
      });
    }
    document.getElementById("spectate-left").addEventListener("click", () => changeSeatFunction('left'));
    document.getElementById("spectate-right").addEventListener("click", () => changeSeatFunction('right'));
  }
}

playCard = (card) => {
  let element = document.getElementById('big-saki-card-img');
  element.style.display = null;
  fetch(`${apiURL}/play?sessionid=${sessionid}&playerid=${playerid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      card: card
    })
  })
  .then(async response => {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    // check for error response
    if (!response.ok) {
      // get error message from body or default to response status
      const error = (data && data.message) || response.status;
      return Promise.reject(error);
    }
    
    receiveData(data);
  })
  .catch(error => {
    //todo element.parentElement.innerHTML = `Error: ${error}`;
    console.error('There was an error!', error);
  });
}

returnCard = (card) => {
  let element = document.getElementById('big-saki-card-img');
  element.style.display = null;
  fetch(`${apiURL}/return?sessionid=${sessionid}&playerid=${playerid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      card: card
    })
  })
  .then(async response => {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    // check for error response
    if (!response.ok) {
      // get error message from body or default to response status
      const error = (data && data.message) || response.status;
      return Promise.reject(error);
    }
    
    receiveData(data);
  })
  .catch(error => {
    //todo element.parentElement.innerHTML = `Error: ${error}`;
    console.error('There was an error!', error);
  });
}

revealTable = () => {
  fetch(`${apiURL}/reveal?sessionid=${sessionid}&playerid=${playerid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(async response => {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    // check for error response
    if (!response.ok) {
      // get error message from body or default to response status
      const error = (data && data.message) || response.status;
      return Promise.reject(error);
    }
    
    receiveData(data);
  })
  .catch(error => {
    //todo element.parentElement.innerHTML = `Error: ${error}`;
    console.error('There was an error!', error);
  });
}

resetTable = () => {
  fetch(`${apiURL}/reset?sessionid=${sessionid}&playerid=${playerid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(async response => {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    // check for error response
    if (!response.ok) {
      // get error message from body or default to response status
      const error = (data && data.message) || response.status;
      return Promise.reject(error);
    }
    
    receiveData(data);
  })
  .catch(error => {
    //todo element.parentElement.innerHTML = `Error: ${error}`;
    console.error('There was an error!', error);
  });
}

arrangeSeats = (seat, player) => {
  fetch(`${apiURL}/arrange?seat=${seat}&target=${player}&playerid=${playerid}&sessionid=${sessionid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(async response => {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    // check for error response
    if (!response.ok) {
      // get error message from body or default to response status
      const error = (data && data.message) || response.status;
      return Promise.reject(error);
    }
    
    receiveData(data);
  })
  .catch(error => {
    //todo element.parentElement.innerHTML = `Error: ${error}`;
    console.error('There was an error!', error);
  });
}

flipCard = () => {
  fetch(`${apiURL}/flip?sessionid=${sessionid}&playerid=${playerid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .then(async response => {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    // check for error response
    if (!response.ok) {
      // get error message from body or default to response status
      const error = (data && data.message) || response.status;
      return Promise.reject(error);
    }
    
    receiveData(data);
  })
  .catch(error => {
    //todo element.parentElement.innerHTML = `Error: ${error}`;
    console.error('There was an error!', error);
  });
}

resetView = () => {
  const p = sessionState.players.find(p => p.nickname == playerid);
  p.hand = [];
  p.playedCard = null;
  sessionState.players = [p];
  receiveData(sessionState);
}