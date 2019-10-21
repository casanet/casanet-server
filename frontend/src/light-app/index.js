/** Get the environments */
let environments = {
    API_URL: "http://127.0.0.1:3000/API"
}

let fetchEnvironments = () => {
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.onload = () => {

        if (xmlhttp.readyState === 4 && xmlhttp.status == 200) {
            environments = JSON.parse(xmlhttp.responseText);
            return;
        }

        if (xmlhttp.status === 401 || xmlhttp.status === 403) {
            alert('GET ENVIRONMENTS FAIL')
            return;
        }

        getMinionsFail(xmlhttp.responseText);
    }
    xmlhttp.open("GET", '/light-app/environments.json', false);
    xmlhttp.send();
}

/** Fetch the environments, sync */
fetchEnvironments();

/**
 * Redirect to auth page.
 */
let accessFail = () => {
    alert('ACCESS FORBIDDEN, redirecting to auth page...')
    window.location.href = "/#/login";
}

let getMinionsFail = (msg) => {
    if (confirm(`GET MINIONS FAIL: \n${msg},\n\n\nPress "OK" to retry`)) {
        patchMinions();
    }
}

/**
 * Generate buttons of each minion.
 * @param {*} minions Minions array
 */
let generateMinions = (minions) => {
    minions.sort((m1, m2) => {
        return m1.name < m2.name ? -1 : 1;
    });

    /** Get the list holder element */
    const listElement = document.getElementById('minions-list');

    /** Set list empty */
    listElement.innerHTML = '';

    for (const minion of minions) {
        /** Create button element */
        const minionButton = document.createElement('button');

        /** Inaert name */
        minionButton.innerText = minion.name;

        try {
            /** Set correct class for current status */
            minionButton.className = `minion-button minion-${minion.minionStatus[minion.minionType].status}`;
        } catch (error) {
            minion.minionStatus[minion.minionType] = {
                status: 'off'
            };
            minionButton.className = `minion-button minion-unknown`;
        }

        /** Toggle status on click */
        minionButton.onclick = () => { buttonClicked(minionButton, minion); };

        /** Add it to buttons list */
        const item = document.createElement('li');
        item.appendChild(minionButton);
        listElement.appendChild(item);
    }
}

/** Get minions from server */
let patchMinions = () => {
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
    }
    xmlhttp.open("GET", `${environments.API_URL}/minions`, true);
    xmlhttp.send();
}

/** Toggle minion status on click */
let buttonClicked = (element, minion) => {

    element.className = 'minion-button minion-sync';

    const setStatus = JSON.parse(JSON.stringify(minion.minionStatus));
    setStatus[minion.minionType].status =
        setStatus[minion.minionType].status === 'on'
            ? 'off'
            : 'on';


    // compatible with IE7+, Firefox, Chrome, Opera, Safari
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.withCredentials = true;

    xmlhttp.onload = () => {
        if (xmlhttp.readyState !== 4) {
            return;
        }

        if (xmlhttp.status === 204) {
            patchMinions();
            return;
        }

        element.className = `minion-button minion-${minion.minionStatus[minion.minionType].status}`;

        if (xmlhttp.status === 401 || xmlhttp.status === 403) {
            accessFail();
        }
    }

    xmlhttp.open("PUT", `${environments.API_URL}/minions/${minion.minionId}`, true);
    xmlhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xmlhttp.send(JSON.stringify(setStatus));
}

/** On start. get and generate minions */
patchMinions();

/** SSE */
var evtSource = new EventSource(`${environments.API_URL}/feed/minions`, {
    withCredentials: true
});

evtSource.onmessage = (e) => {
    patchMinions();
}

/** PWA */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/light-app/service-worker.js')
        .then(function (registration) {
            console.log('Registration successful, scope is:', registration.scope);
        })
        .catch(function (error) {
            console.warn('Service worker registration failed, error:', error);
        });
}