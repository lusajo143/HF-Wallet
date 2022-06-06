// Pages
let welcome_page = document.getElementById('welcome-page')
let mode_selection = document.getElementById('mode-selection')
let user_setup = document.getElementById('user-setup')
let connection = document.getElementById('connection')


welcome_page.hidden = true
mode_selection.hidden = true
connection.hidden = true
user_setup.hidden = true


// Set password
document.getElementById('set-password').addEventListener('click', () => {
    let passwordForm = document.querySelector('#password-form')
    let data = new FormData(passwordForm)
    data = [...data.entries()]
    /*
    0 pwd
    1 cpwd
    */
    let password = data[0][1]
    let cpassword = data[1][1]
    if (password === cpassword) {
        var hash = objectHash.sha1({password});
        chrome.storage.sync.set({password: hash}, () => {
            fromTo('welcome-page', 'mode-selection')
        })
    }
})

// Choose mode
document.getElementById('user-mode').addEventListener('click', () => {
    chrome.storage.sync.set({mode: 'user'}, () => {
        fromTo('mode-selection', 'user-setup')
    })
})

document.getElementById('developer-mode').addEventListener('click', () => {
    chrome.storage.sync.set({mode: 'developer'}, () => {
        fromTo('mode-selection', 'developer-setup')
    })
})

// Save user data
document.getElementById('save-user-data-btn').addEventListener('click', function () {
    let userDataForm = document.querySelector('#user-data-form')
    let data = new FormData(userDataForm)
    data = [...data.entries()]
    /*
    data structure
    0 username
    1 identity
    2 ccp
    3 ccn
    4 ca
    */

    // TODO: Validate user inputs
    let username = data[0][1]
    let identity = data[1][1]
    let ccp = data[2][1]
    let ccn = data[3][1]
    let ca = data[4][1]

    data = { username, identity, ccp, ccn, ca }

    chrome.storage.sync.get(['password'], (result) => {
        let cipher = CryptoJS.AES.encrypt(JSON.stringify(data), result.password)
        chrome.storage.sync.set({cipher_data: cipher.toString()}, () => {
            fromTo('user-setup', 'connection')
        })
    })
})


// Handle navigations
function fromTo(from, to) {
    document.getElementById(from).hidden = true
    document.getElementById(to).hidden = false
    setStage(to)
}


// Stage management
function setStage(activeStage) {
    chrome.storage.sync.set({activeStage}, () => {})
    getActiveStage()
}

getActiveStage()

function getActiveStage() {
    chrome.storage.sync.get(['activeStage'], (data) => {
        document.getElementById(data.activeStage).hidden = false
    })
}