// Pages
let welcome_page = document.getElementById('welcome-page')
let mode_selection = document.getElementById('mode-selection')
let user_setup_1 = document.getElementById('user-setup-1')
let user_setup_2 = document.getElementById('user-setup-2')
let connection = document.getElementById('connection')


welcome_page.hidden = true
mode_selection.hidden = true
connection.hidden = true
user_setup_1.hidden = true
user_setup_2.hidden = true


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
        var hash = objectHash.sha1({ password });
        chrome.storage.sync.set({ password: hash }, () => {
            fromTo('welcome-page', 'mode-selection')
        })
    }
})

// Choose mode
document.getElementById('user-mode').addEventListener('click', () => {
    chrome.storage.sync.set({ mode: 'user' }, () => {
        fromTo('mode-selection', 'user-setup-1')
    })
})

document.getElementById('developer-mode').addEventListener('click', () => {
    chrome.storage.sync.set({ mode: 'developer' }, () => {
        fromTo('mode-selection', 'developer-setup')
    })
})

// Save user data
document.getElementById('save-user-data-next').addEventListener('click', function () {
    let userDataForm = document.querySelector('#user-data-form')
    let data = new FormData(userDataForm)
    data = [...data.entries()]
    /*
    data structure
    0 username
    1 identity
    3 ccn
    4 ca
    */

    // TODO: Validate user inputs
    let username = data[0][1]
    let identity = data[1][1]
    let ccn = data[2][1]
    let ca = data[3][1]

    data = { username, identity, ccn, ca }

    chrome.storage.sync.get(['password'], (result) => {
        let cipher = CryptoJS.AES.encrypt(JSON.stringify(data), result.password)
        chrome.storage.sync.set({ cipher_data: cipher.toString() }, () => {
            fromTo('user-setup-1', 'user-setup-2')
        })
    })
})

document.getElementById('ccp-btn').addEventListener('click', function () {
    let userDataForm = document.querySelector('#ccp-form')
    let data = new FormData(userDataForm)
    data = [...data.entries()]
    /*
    data structure
    0 ccp
    */

    // TODO: Validate user inputs
    let ccp = data[0][1]

    data = { ccp }

    chrome.storage.sync.get(['password'], (result) => {
        let cipher = CryptoJS.AES.encrypt(JSON.stringify(data), result.password)
        chrome.storage.sync.set({ cipher_ccp: cipher.toString() }, () => {
            fromTo('user-setup-2', 'connection')
        })
    })
})

// Handle connections
document.getElementById('connect-btn').addEventListener('click', () => {

    let connect_form = document.querySelector('#connect-form')
    let data = new FormData(connect_form)
    data = [...data.entries()]
    let password = data[0][1]
    if (password) {
        document.getElementById('empty-pwd').hidden = true
        chrome.storage.sync.get(['cipher_data'], (result) => {
            chrome.storage.sync.get(['password'], (passwordResult) => {
                chrome.storage.sync.get(['cipher_ccp'], (ccpResult) => {
                    var hash = objectHash.sha1({ password });
                    if (hash == passwordResult.password) {
                        document.getElementById('wrong-password').hidden = true
                        let decryptedData = CryptoJS.AES.decrypt(result.cipher_data.toString(), passwordResult.password)
                        let decryptedCcp = CryptoJS.AES.decrypt(ccpResult.cipher_ccp.toString(), passwordResult.password)

                        try {
                            decryptedData = JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8))
                            decryptedCcp = decryptedCcp.toString(CryptoJS.enc.Utf8)
                            // console.log(JSON.parse(JSON.parse(decryptedData).identity));

                            document.getElementById('username-unlocked').innerHTML = decryptedData.username
                            document.getElementById('ccn-unlocked').innerHTML = decryptedData.ccn
                            document.getElementById('ca-unlocked').innerHTML = decryptedData.ca

                            // Save unlocked
                            fromTo('connection', 'unlocked')

                            // Send request to content script for 
                            // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                            //     chrome.tabs.sendMessage(tabs[0].id, { greeting: "hello" }, function () {
                            //     });
                            // });
                        } catch (e) {
                            console.log(e);
                        }
                    } else {
                        document.getElementById('wrong-password').hidden = false
                    }
                })
            })
        })
    } else {
        document.getElementById('empty-pwd').hidden = false
    }

})

document.getElementById('lock').addEventListener('click', () => {
    fromTo('unlocked', 'connection')
})

document.getElementById('resetWallet').addEventListener('click', () => {
    fromTo('connection', 'welcome-page')
})


// Handle navigations
function fromTo(from, to) {
    document.getElementById(from).hidden = true
    document.getElementById(to).hidden = false
    setStage(to)
}


// Stage management
fromTo('unlocked', 'connection')
function setStage(activeStage) {
    chrome.storage.sync.set({ activeStage }, () => { })
    getActiveStage()
}

getActiveStage()

function getActiveStage() {
    chrome.storage.sync.get(['activeStage'], (data) => {
        document.getElementById(data.activeStage).hidden = false
    })
}