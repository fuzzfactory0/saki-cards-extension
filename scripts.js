let main = document.getElementById('full');
const apiURL = 'http://ec2-54-147-176-194.compute-1.amazonaws.com:3000';

document.onkeydown = showBigCard;
document.onkeyup = hideBigCard;

//TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO
//TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO
//TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO
//TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO
//TODO                                                                                     TODO
//TODO          code to play card, receive such data, show played cards on screen          TODO
//TODO              code to keep played cards hidden until admin reveals them              TODO
//TODO                   code to return a card to the deck and shuffle it                  TODO
//TODO              the game is playable as long as all of this is implemented             TODO
//TODO                                                                                     TODO
//TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO
//TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO
//TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO
//TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO //TODO TODO TODO TODO TODO TODO

let sessionid = null;
let playerid = '';
let sanmaSelected = false;
let sessionState = '';
let callInterval;

let html = `
  <div id="saki-sidebar">
    <h2>Saki Cards</h2>
    <h3 id="room-number"></h2>
    <h3 id="room-admin"></h2>
    <div id="game-controls">
      <button id="hide-button" class="btn btn-secondary btn-sm w-100">Toggle UI</button>
      <button id="reveal-button" class="btn btn-warning btn-sm w-100">Reveal cards</button>
      <button id="reset-button" class="btn btn-warning btn-sm w-100">New round</button>
      <button id="draw-button" class="btn btn-warning btn-sm w-100">Draw 1</button>

      <p id="disclaimer">Very early alpha. This code is so jank and fragile it will break as soon as you do something too fancy. Please be patient
        <p>Developed by Umeboshi (Discord: @Fuzz#7915)</p>
        <p>Original game by Anton00, KlorofinMaster & DramaTheurgist</p>
        <p>Saki 咲 Fan Community</p>
      </p>
    </div>
    <div id="join-controls"> 
      <h3>Create Room</h2>
      <form id="create-form">
        <select id="sanma-input" class="dark-select form-control form-control-sm mt-2">
          <option value="false">Suuma</option>
          <option value="true">Sanma</option>
        </select>
        <label for="admin-input">Nickname:</label>
        <input type="text" id="admin-input" class="form-control form-control-sm" minlength=2 maxlength=24 pattern="^[a-zA-Z0-9]{2,24}$" required></input>
        <button id="create-button" type="button" class="btn btn-warning btn-sm w-100">CREATE</button>
      </form>

      <h3>Join Room</h2>
      <form id="join-form">
        <label for="session-input">Room ID:</label>
        <input type="tel" id="session-input" class="form-control form-control-sm" minlength=4 maxlength=4 required pattern="^[0-9]{2,24}$"></input>
        <label for="nickname-input">Nickname:</label>
        <input type="text" id="nickname-input" class="form-control form-control-sm" minlength=2 maxlength=24 pattern="^[a-zA-Z0-9\-_]{2,24}$" required></input>
        <button id="join-button" type="button" class="btn btn-warning btn-sm w-100">JOIN</button>
      </form>
    </div>
  </div>
  
  <div id="saki-player-hand" style="bottom: -12vh;">
  </div>

  <div class="opponent-area">
    <div id="kamicha-player-hand" class="opponent-hand" style="left: -16vw;">
    </div>

    <div id="toimen-player-hand" class="opponent-hand" style="top: -12vh;">
    </div>

    <div id="shimocha-player-hand" class="opponent-hand" style="right: -16vw;">
    </div>
  </div>

  <div id="big-card" style="display: none">
    <img id="big-saki-card-img" class="saki-card-img" src="" alt="" draggable="false">
  </div>

  <div id="player-card" class="played-card" style="bottom: 10vh">
    <img id="player-img" class="played-saki-card-img" src="${chrome.runtime.getURL('assets/cardback.png')}" alt="" draggable="false">
  </div>
  <div id="kamicha-card" class="played-card" style="left: 14vw">
    <img id="kamicha-img" class="played-saki-card-img" src="${chrome.runtime.getURL('assets/cardback.png')}" alt="" draggable="false">
  </div>
  <div id="toimen-card" class="played-card" style="top: 2vh">
    <img id="toimen-img" class="played-saki-card-img" src="${chrome.runtime.getURL('assets/cardback.png')}" alt="" draggable="false">
  </div>
  <div id="shimocha-card" class="played-card" style="right: 14vw">
    <img id="shimocha-img" class="played-saki-card-img" src="${chrome.runtime.getURL('assets/cardback.png')}" alt="" draggable="false">
  </div>
`;
 
main.insertAdjacentHTML('beforeend', html);

const playerHand = document.getElementById('saki-player-hand');
const kamichaHand = document.getElementById('kamicha-player-hand');
const toimenHand = document.getElementById('toimen-player-hand');
const shimochaHand = document.getElementById('shimocha-player-hand');
const bigCard = document.getElementById('big-card');

for (let el of document.getElementsByName('input')) {
  el.addEventListener("keypress", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
    }
  });
}

addCardListeners(document.getElementById('player-card'));
addCardListeners(document.getElementById('kamicha-card'));
addCardListeners(document.getElementById('toimen-card'));
addCardListeners(document.getElementById('shimocha-card'));


document.getElementById("hide-button").addEventListener("click", () => {
  playerHand.style.bottom = playerHand.style.bottom == '-12vh' ? '-500px' : '-12vh';
  kamichaHand.style.left = kamichaHand.style.left == '-16vw' ? '-500px' : '-16vw';
  toimenHand.style.top = toimenHand.style.top == '-12vh' ? '-500px' : '-12vh';
  shimochaHand.style.right = shimochaHand.style.right == '-16vw' ? '-500px' : '-16vw';
  document.getElementById('player-card').style.bottom = document.getElementById('player-card').style.bottom == '10vh' ? '-500px' : '10vh'
  document.getElementById('kamicha-card').style.left = document.getElementById('kamicha-card').style.left == '14vw' ? '-500px' : '14vw';
  document.getElementById('toimen-card').style.top = document.getElementById('toimen-card').style.top == '2vh' ? '-500px' : '2vh';
  document.getElementById('shimocha-card').style.right = document.getElementById('shimocha-card').style.right == '14vw' ? '-500px' : '14vw';
});

document.getElementById("create-button").addEventListener("click", () => {  
  playerid = document.getElementById('admin-input').value;
  sanmaSelected = document.getElementById('sanma-input').value;
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

document.getElementById("reset-button").addEventListener("click", () => {
  resetTable();
});

const newCard = (name, parent) => {

  let img = document.createElement('img');
  img.src = chrome.runtime.getURL('assets/'+name+'.png');
  img.className = 'saki-card-img';
  img.alt = name;
  img.draggable = false;

  let div = document.createElement('div');
  div.className = 'card-actions';
  div.title = name;

  let button1 = document.createElement('button');
  button1.type = 'button';
  button1.className = 'btn btn-success btn-sm w-100';
  button1.title = 'Play this card';
  button1.textContent = '🡇';
  button1.addEventListener("click", () => {
    //! handle play card if table is open
    playCard(name);
  });

  let button2 = document.createElement('button');
  button2.type = 'button';
  button2.className = 'btn btn-danger btn-sm w-100';
  button2.title = 'Shuffle back to deck';
  button2.textContent = '🡅';
  
  button2.addEventListener("click", () => {
    //! handle return card if table is open
    returnCard(name);
  });

  div.insertAdjacentElement('beforeend', button1);
  div.insertAdjacentElement('beforeend', button2);
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

function addCardListeners(card) {
  card.addEventListener("mouseover",function() {
    let element = document.getElementById('big-saki-card-img');
    element.style.display = 'block';
    element.src = chrome.runtime.getURL(`assets/${card.title}.png`);
  });
  
  card.addEventListener("mouseout",function() {
    let element = document.getElementById('big-saki-card-img');
    element.style.display = 'none';
  });
}

function receiveData(session) {
  if (JSON.stringify(session) != JSON.stringify(sessionState)) {
    console.log(session);
    sessionid = session.id;

    let player = session.players.find(p => p.nickname == playerid);
    let incomingHand = player.hand || [];
    let currentHand = sessionState.players?.find(p => p.nickname == playerid).hand || [];

    let equal = incomingHand.length != currentHand.length ? false : JSON.stringify(incomingHand) == JSON.stringify(currentHand);

    if (!equal) {  
      playerHand.textContent = '';
      incomingHand.forEach(card => {
        let newcard = document.createElement('div');
        newcard.title = card.name;
        newcard.className = 'own-card';
        newCard(card.name, newcard);
        addCardListeners(newcard);
        playerHand.insertAdjacentElement('beforeend', newcard);
      });
    }

    if (player.playedCard != null) {
      document.getElementById('player-card').style.display = 'block';
      document.getElementById('player-img').src = chrome.runtime.getURL(`assets/${player.playedCard.name}.png`);
      document.getElementById('player-card').title = player.playedCard.name;
      if (session.revealed) {
        document.getElementById('player-img').style.filter = 'grayscale(0)';
        document.getElementById('player-card').title = player.playedCard.name;
      } else {
        document.getElementById('player-img').style.filter = 'grayscale(1)';
      }
    } else {
      document.getElementById('player-card').style.display = 'none';
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

    kamichaHand.textContent = '';
    toimenHand.textContent = '';
    shimochaHand.textContent = '';


    if (session.players.some(p => p.seat == kamicha)) {
      let thisPlayer = session.players.find(p => p.seat == kamicha);
      if (thisPlayer.playedCard != null) {
        document.getElementById('kamicha-card').style.display = 'block';
        if (session.revealed) {
          document.getElementById('kamicha-img').src = chrome.runtime.getURL(`assets/${thisPlayer.playedCard.name}.png`);
          document.getElementById('kamicha-card').title = thisPlayer.playedCard.name;
        } else {
          document.getElementById('kamicha-img').src = chrome.runtime.getURL('assets/cardback.png');
          document.getElementById('kamicha-card').title = 'cardback';
        }
      } else {
        document.getElementById('kamicha-card').style.display = 'none';
      }

      for (let i = 0; i < thisPlayer.hand.length; i++) {
        let newcard = document.createElement('div');
        newcard.className = 'opponent-card';
        newcard.innerHTML = `<img class="saki-card-img" src="${chrome.runtime.getURL('assets/cardback.png')}" alt="Unknown card" draggable="false">`;
        kamichaHand.insertAdjacentElement('beforeend', newcard);
      }
    }

    if (session.players.some(p => p.seat == toimen)) {
      let thisPlayer = session.players.find(p => p.seat == toimen);
      if (thisPlayer.playedCard != null) {
        document.getElementById('toimen-card').style.display = 'block';
        if (session.revealed) {
          document.getElementById('toimen-img').src = chrome.runtime.getURL(`assets/${thisPlayer.playedCard.name}.png`);
          document.getElementById('toimen-card').title = thisPlayer.playedCard.name;
        } else {
          document.getElementById('toimen-img').src = chrome.runtime.getURL('assets/cardback.png');
          document.getElementById('toimen-card').title = 'cardback';
        }
      } else {
        document.getElementById('toimen-card').style.display = 'none';
      }

      for (let i = 0; i < thisPlayer.hand.length; i++) {
        let newcard = document.createElement('div');
        newcard.className = 'opponent-card';
        newcard.innerHTML = `<img class="saki-card-img" src="${chrome.runtime.getURL('assets/cardback.png')}" alt="Unknown card" draggable="false">`;
        toimenHand.insertAdjacentElement('beforeend', newcard);
      }
    }

    if (session.players.some(p => p.seat == shimocha)) {
      let thisPlayer = session.players.find(p => p.seat == shimocha);
      if (thisPlayer.playedCard != null) {
        document.getElementById('shimocha-card').style.display = 'block';
        if (session.revealed) {
          document.getElementById('shimocha-img').src = chrome.runtime.getURL(`assets/${thisPlayer.playedCard.name}.png`);
          document.getElementById('shimocha-card').title = thisPlayer.playedCard.name;
        } else {
          document.getElementById('shimocha-img').src = chrome.runtime.getURL('assets/cardback.png');
          document.getElementById('shimocha-card').title = 'cardback';
        }
      } else {
        document.getElementById('shimocha-card').style.display = 'none';
      }

      for (let i = 0; i < thisPlayer.hand.length; i++) {
        let newcard = document.createElement('div');
        newcard.className = 'opponent-card';
        newcard.innerHTML = `<img class="saki-card-img" src="${chrome.runtime.getURL('assets/cardback.png')}" alt="Unknown card" draggable="false">`;
        shimochaHand.insertAdjacentElement('beforeend', newcard);
      }
    }
    


    sessionState = session;
  }
}

//let messages;
init = function() {
  callInterval = setInterval(() => {
    fetch(`${apiURL}/session?sessionid=${sessionid}&playerid=${playerid}`, {
      method: 'GET',
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
        const error = response.status || (data && data.message);
        return Promise.reject(error);
      }

      receiveData(data);
    })
    .catch(error => {
      //todo element.parentElement.innerHTML = `Error: ${error}`;
      if (error == 404 || error == 500) {
        clearInterval(callInterval);
        
        document.getElementById('join-controls').style.display = 'flex';
        document.getElementById('game-controls').style.display = 'none';
        document.getElementById('room-number').textContent = '';
        document.getElementById('room-admin').textContent = '';

        // todo todo todo todo todo todo todo todo todo todo todo todo todo
        // todo todo todo todo todo todo todo todo todo todo todo todo todo
        // todo     activate a reconnect button and add the logic      todo
        // todo todo todo todo todo todo todo todo todo todo todo todo todo
        // todo todo todo todo todo todo todo todo todo todo todo todo todo

      }
      console.error('There was an error!', error);
    });
  }, 500);
}

createRoom = () => {
  fetch(`${apiURL}/session`, {
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
      tenpaiRedraw: false
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

    document.getElementById('room-number').textContent = 'Room: ' + data.id;
    document.getElementById('room-admin').textContent = 'Admin: ' + data.owner;
    document.getElementById("reveal-button").style.display = 'block';
    document.getElementById("reset-button").style.display = 'block';
    receiveData(data);
    init();
    
    activateButtons();
  })
  .catch(error => {
    //todo element.parentElement.innerHTML = `Error: ${error}`;
    console.error('There was an error!', error);
  });
}

joinRoom = () => {
  // initialize websocket connection
  fetch(`${apiURL}/join?sessionid=${sessionid}&playerid=${playerid}`, {
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

    document.getElementById('room-number').textContent = 'Room: ' + data.id;
    document.getElementById('room-admin').textContent = 'Admin: ' + data.owner;
    document.getElementById("reveal-button").style.display = 'none';
    document.getElementById("reset-button").style.display = 'none';
    
    receiveData(data);
    init();
    
    activateButtons();
  })
  .catch(error => {
    //todo element.parentElement.innerHTML = `Error: ${error}`;
    console.error('There was an error!', error);
  });
}

activateButtons = () => {
  document.getElementById('join-controls').style.display = 'none';
  document.getElementById('game-controls').style.display = 'flex';
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
}

playCard = (card) => {
  let element = document.getElementById('big-saki-card-img');
  element.style.display = 'none';
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
  element.style.display = 'none';
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