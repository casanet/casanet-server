/** Get the environments */
let environments = {
  API_URL: "http://127.0.0.1:3000/API",
  DASHBOARD_DOMAIN: "",
};

/** Flag to know if the 'power off' syncing */
let isSync = false;

/** Flag to detect if there is an connection issue, the options 'connection' 'remote-connection' */
let connectionIssue = '';

function domainAlert() {
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

function fetchEnvironments() {
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.onload = () => {
    if (xmlhttp.readyState === 4 && xmlhttp.status == 200) {
      environments = JSON.parse(xmlhttp.responseText);
      domainAlert();

      // After we got the environment URL, start app data fetching and processing
      initApp();
      return;
    }

    if (xmlhttp.status === 401 || xmlhttp.status === 403) {
      alert("GET ENVIRONMENTS FAIL");
      return;
    }

    getMinionsFail(xmlhttp.responseText);
  };
  xmlhttp.open("GET", "/light-app/environments.json");
  xmlhttp.send();
};

/**
 * Redirect to auth page.
 */
function accessFail() {
  alert("ACCESS FORBIDDEN, redirecting to auth page...");
  window.location.href = "/#/login";
};

function getMinionsFail(msg) {
  if (confirm(`GET MINIONS FAIL: \n${msg},\n\n\nPress "OK" to retry`)) {
    fetchMinions();
  }
};

/**
 * Generate HTML button for given minion
 * @param {*} minion A minion
 * @returns A DOM button object for the given minion
 */
function generateMinionButton(minion) {
  /** Create button element */
  const minionButton = document.createElement("a");

  /** Insert name */
  minionButton.innerText = minion.name;

  try {
    /** Set correct class for current status */
    minionButton.className = `button button--ghost button--ghost--${minion.minionStatus[minion.minionType].status
      }`;

    if (!isSync && minion.minionStatus[minion.minionType].status === "on") {
      // In case the minion status are 'on' allow 'power-all-off' button
      setIconView("power-on");
    }

    if (!minion.isProperlyCommunicated) {
      minionButton.className = `button button--ghost button--ghost--err`;
    }
  } catch (error) {
    minion.minionStatus[minion.minionType] = {
      status: "off",
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
function generateMinions(minions) {
  /** Set empty room to the undefined rooms */
  minions = minions.map((m) => {
    m.room = m.room ? m.room : "";
    return m;
  });

  /** Sort minions by room and name */
  minions.sort((m1, m2) => {
    if (m1.room !== m2.room) {
      return m1.room < m2.room ? -1 : 1;
    }
    return m1.name < m2.name ? -1 : 1;
  });

  /** Reduce minions to room groups */
  const rooms = minions.reduce((rooms, minion) => {
    minion.room = minion.room ? minion.room : "";
    rooms[minion.room] = rooms[minion.room] ? rooms[minion.room] : [];
    rooms[minion.room].push(minion);
    return rooms;
  }, {});

  /** Get the list holder element */
  const welcomeElement = document.getElementById("welcome-message");
  welcomeElement.className = "hide";

  /** Get the list holder element */
  const listElement = document.getElementById("minions-container");

  /** Set list empty */
  listElement.innerHTML = "";

  if (!isSync) {
    // If the power off not currently sync, set power off,
    // and in case any of the minion status are 'on' then call to 'setIconView("power-on")'
    setIconView("power-off");
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
function fetchMinions() {
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
function buttonClicked(element, minion) {
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
      fetchMinions();
      return;
    }

    element.className = `button button--ghost button--ghost--${minion.minionStatus[minion.minionType].status
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

/**
 * Power off all minions in the system
 */
function powerAllOff() {
  isSync = true;

  // Mark view as sync
  setIconView("power-sync");

  const xmlhttp = new XMLHttpRequest();
  xmlhttp.withCredentials = true;
  xmlhttp.onload = () => {
    if (xmlhttp.readyState === 4 && xmlhttp.status == 204) {
      isSync = false;
      fetchMinions();
      return;
    }

    alert("POWER OFF FAIL");
    setIconView("power-on");
  };
  xmlhttp.open("PUT", `${environments.API_URL}/minions/power-off`, true);
  xmlhttp.send();
};

function detectConnectionStatus() {
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.withCredentials = true;
  xmlhttp.onload = () => {
    if (xmlhttp.readyState !== 4) {
      return;
    }
    // If response OK
    if (xmlhttp.status === 200) {

      // If currently flag had remote-comm issue, remove it and refetch minions
      if (xmlhttp.responseText !== '"notConfigured"' && xmlhttp.responseText !== '"connectionOK"') {
        // Mark remote connection issue
        connectionIssue = 'remote-connection';
        setIconView("remote-issue")
        return;
      }

      // If currently flag didn't indicate issue, just return
      if (!connectionIssue) {
        return;
      }

      // If flag indicating on issue, remove it, and refetch minions
      connectionIssue = '';
      setIconView("power-on");
      fetchMinions();
    }
  };
  // In case of communication error
  xmlhttp.onerror = () => {
    connectionIssue = 'connection'
    setIconView("connection-issue");
  };
  xmlhttp.open("GET", `${environments.API_URL}/remote/status`, true);
  xmlhttp.send();
}

/**
 * Set the up-left corner icon view to show
 * @param {string} showIconView the icon view to show 
 */
function setIconView(showIconView) {
  const powerOnContainer = document.getElementById("power-on");
  const powerOffContainer = document.getElementById("power-off");
  const powerSyncContainer = document.getElementById("power-sync");
  const remoteIssueContainer = document.getElementById("remote-issue");
  const connectionIssueContainer = document.getElementById("connection-issue");

  powerOnContainer.className = "hide";
  powerOffContainer.className = "hide";
  powerSyncContainer.className = "hide";
  remoteIssueContainer.className = "hide";
  connectionIssueContainer.className = "hide";

  const iconToShowContainer = document.getElementById(showIconView);
  if (iconToShowContainer) {
    iconToShowContainer.className = "";
  }
};

/**
 * Register to the browser service worker, so the assets will kept as offline app. 
 */
function registerSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/light-app/service-worker.js")
      .then(function (registration) {
        console.log("Registration successful, scope is:", registration.scope);
      })
      .catch(function (error) {
        console.warn("Service worker registration failed, error:", error);
      });
  }
};

/**
 * Deregister from the browser service worker, so the assets will removed from the browser apps. 
 */
function unRegisterSW() {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
};

function initApp() {
  /** On app ready to start. get and generate minions */
  fetchMinions();

  /** Create a SSE subscription  */
  var evtSource = new EventSource(`${environments.API_URL}/feed/minions`, {
    withCredentials: true,
  });

  /** Subscribe to the feed message, and on message, refetch minions */
  evtSource.onmessage = (e) => {
    if (e.data === '"init"') {
      return;
    }
    fetchMinions();
  };

  // Interval to get the liveliness and remote connection status
  setInterval(detectConnectionStatus, 15000);
}

/** First of all, fetch the environments URL's */
fetchEnvironments();

// Clock interval
setInterval(() => {
  // get the clock paragraph object
  const dateClockParagraph = document.getElementById("date-clock");
  const now = new Date();
  // update the clock
  dateClockParagraph.innerText = `${now.getDate()}/${now.getMonth() + 1
    }/${now.getFullYear()} ${now
      .getHours()
      .toString()
      .padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
}, 1000);
