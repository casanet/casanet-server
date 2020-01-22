/** Get the environments */
let environments = {
  API_URL: "http://127.0.0.1:3000/API",
  DASHBOARD_DOMAIN: ""
};

/** Flag to know if the 'power off' syncing */
let isSync = false;

let domainAlert = () => {
  if (document.baseURI.includes(environments.DASHBOARD_DOMAIN)) {
    return;
  }

  const result = confirm(
    `The address of the service has changed and you will soon get off the air, please move to our new address!\n\n${environments.DASHBOARD_DOMAIN}\n\nPress 'OK' to move the new home`
  );
  if (!result) {
    return;
  }
  window.location.href = `${environments.DASHBOARD_DOMAIN}/light-app/index.html`;
};

let fetchEnvironments = () => {
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.onload = () => {
    if (xmlhttp.readyState === 4 && xmlhttp.status == 200) {
      environments = JSON.parse(xmlhttp.responseText);
      domainAlert();
      return;
    }

    if (xmlhttp.status === 401 || xmlhttp.status === 403) {
      alert("GET ENVIRONMENTS FAIL");
      return;
    }

    getMinionsFail(xmlhttp.responseText);
  };
  xmlhttp.open("GET", "/light-app/environments.json", false);
  xmlhttp.send();
};

/** Fetch the environments, sync */
fetchEnvironments();

/**
 * Redirect to auth page.
 */
let accessFail = () => {
  alert("ACCESS FORBIDDEN, redirecting to auth page...");
  window.location.href = "/#/login";
};

let getMinionsFail = msg => {
  if (confirm(`GET MINIONS FAIL: \n${msg},\n\n\nPress "OK" to retry`)) {
    petchMinions();
  }
};

/**
 * Generate HTML button for given minion
 * @param {*} minion A minion
 * @returns A DOM button object for the given minion
 */
let generateMinionButton = minion => {
  /** Create button element */
  const minionButton = document.createElement("a");

  /** Insert name */
  minionButton.innerText = minion.name;

  try {
    /** Set correct class for current status */
    minionButton.className = `button button--ghost button--ghost--${
      minion.minionStatus[minion.minionType].status
    }`;

    if (!isSync && minion.minionStatus[minion.minionType].status === "on") {
      // In case the minion status are 'on' allow 'power-all-off' button
      setViewPowerOn();
    }

    if (!minion.isProperlyCommunicated) {
      minionButton.className = `button button--ghost button--ghost--err`;
    }
  } catch (error) {
    minion.minionStatus[minion.minionType] = {
      status: "off"
    };
    minionButton.className = `button button--ghost button--ghost--err`;
  }

  /** Toggle status on click */
  minionButton.onclick = () => {
    buttonClicked(minionButton, minion);
  };

  return minionButton;
};

/**
 * Generate buttons of each minion.
 * @param {*} minions Minions array
 */
let generateMinions = minions => {
  minions.sort((m1, m2) => {
    if (m1.room !== m2.room) {
      return m1.room < m2.room ? -1 : 1;
    }
    return m1.name < m2.name ? -1 : 1;
  });

  const rooms = minions.reduce((rooms, minion) => {
    minion.room = minion.room ? minion.room : "";
    rooms[minion.room] = rooms[minion.room] ? rooms[minion.room] : [];
    rooms[minion.room].push(minion);
    return rooms;
  }, {});

  /** Get the list holder element */
  const welcomeElement = document.getElementById("welcome-message");
  welcomeElement.innerHTML = "";

  /** Get the list holder element */
  const listElement = document.getElementById("minions-container");

  /** Set list empty */
  listElement.innerHTML = "";

  if (!isSync) {
    // If the power off not currently sync, set power off,
    // and in case any of the minion status are 'on' then call to 'setViewPowerOn()'
    setViewPowerOff();
  }

  for (const [roomName, roomMinions] of Object.entries(rooms)) {
    const roomDiv = document.createElement("div");
    roomDiv.className = "room";

    const roomTitle = document.createElement("h3");
    roomTitle.className = "room-name";
    roomTitle.innerText = roomName;

    roomDiv.appendChild(roomTitle);

    for (const minion of roomMinions) {
      roomDiv.appendChild(generateMinionButton(minion));
    }

    /** Add it to buttons list */
    listElement.appendChild(roomDiv);
  }
};

/** Get minions from server */
let petchMinions = () => {
  // compatible with IE7+, Firefox, Chrome, Opera, Safari
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.withCredentials = true;
  xmlhttp.onload = () => {
    if (xmlhttp.readyState === 4 && xmlhttp.status == 200) {
      generateMinions(JSON.parse(xmlhttp.responseText));
      return;
    }

    if (xmlhttp.status === 401 || xmlhttp.status === 403) {
      accessFail();
      return;
    }

    getMinionsFail(xmlhttp.responseText);
  };
  xmlhttp.open("GET", `${environments.API_URL}/minions`, true);
  xmlhttp.send();
};

/** Toggle minion status on click */
let buttonClicked = (element, minion) => {
  if (minion.sync || isSync) {
    return;
  }

  minion.sync = true;
  element.className = element.className + " button--slicein--sync";

  const setStatus = JSON.parse(JSON.stringify(minion.minionStatus));
  setStatus[minion.minionType].status =
    setStatus[minion.minionType].status === "on" ? "off" : "on";

  // compatible with IE7+, Firefox, Chrome, Opera, Safari
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.withCredentials = true;

  xmlhttp.onload = () => {
    if (xmlhttp.readyState !== 4) {
      return;
    }

    if (xmlhttp.status === 204) {
      petchMinions();
      return;
    }

    element.className = `button button--ghost button--ghost--${
      minion.minionStatus[minion.minionType].status
    }`;

    if (xmlhttp.status === 401 || xmlhttp.status === 403) {
      accessFail();
    }
  };

  xmlhttp.open(
    "PUT",
    `${environments.API_URL}/minions/${minion.minionId}`,
    true
  );
  xmlhttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xmlhttp.send(JSON.stringify(setStatus));
};

let setViewPowerOn = () => {
  const powerOnContainer = document.getElementById("power-on");
  const powerOffContainer = document.getElementById("power-off");
  const powerSyncContainer = document.getElementById("power-sync");

  powerOnContainer.className = "";
  powerOffContainer.className = "hide";
  powerSyncContainer.className = "hide";
};

let setViewPowerOff = () => {
  const powerOnContainer = document.getElementById("power-on");
  const powerOffContainer = document.getElementById("power-off");
  const powerSyncContainer = document.getElementById("power-sync");

  powerOnContainer.className = "hide";
  powerOffContainer.className = "";
  powerSyncContainer.className = "hide";
};

let setViewPowerSync = () => {
  const powerOnContainer = document.getElementById("power-on");
  const powerOffContainer = document.getElementById("power-off");
  const powerSyncContainer = document.getElementById("power-sync");

  powerOnContainer.className = "hide";
  powerOffContainer.className = "hide";
  powerSyncContainer.className = "";
};

let powerAllOff = () => {
  isSync = true;

  // Mark view as sync
  setViewPowerSync();

  const xmlhttp = new XMLHttpRequest();
  xmlhttp.withCredentials = true;
  xmlhttp.onload = () => {
    if (xmlhttp.readyState === 4 && xmlhttp.status == 204) {
      isSync = false;
      petchMinions();
      return;
    }

    alert("POWER OFF FAIL");
  };
  xmlhttp.open("PUT", `${environments.API_URL}/minions/power-off`, true);
  xmlhttp.send();
};

/** On start. get and generate minions */
petchMinions();

/** SSE */
var evtSource = new EventSource(`${environments.API_URL}/feed/minions`, {
  withCredentials: true
});

evtSource.onmessage = e => {
  if (e.data === '"init"') {
    return;
  }
  petchMinions();
};

let unRegisterSW = () => {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
};

let registerSW = () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/light-app/service-worker.js")
      .then(function(registration) {
        console.log("Registration successful, scope is:", registration.scope);
      })
      .catch(function(error) {
        console.warn("Service worker registration failed, error:", error);
      });
  }
};
