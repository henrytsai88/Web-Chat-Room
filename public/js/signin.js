function initApp() {
    // Login with Email/Password
    var txtEmail = document.getElementById('inputEmail');
    var txtPassword = document.getElementById('inputPassword');
    var btnLogin = document.getElementById('btnLogin');
    var btnGoogle = document.getElementById('btngoogle');
    var btnSignUp = document.getElementById('btnSignUp');
    var usersRef = firebase.database().ref('user_list');

    // Sign in
    btnLogin.addEventListener('click', async function () {
        try{
            await firebase.auth().signInWithEmailAndPassword(txtEmail.value, txtPassword.value);
            // sessionStorage.setItem('Email', txtEmail.value);
            // sessionStorage.setItem('Password', txtPassword.value);
            window.location.assign('./index.html');
        } catch(error) {
            create_alert("error", "Failed to log in.");
            // txtEmail.value = "";
            txtPassword.value = "";
        }
    });

    // Sign in/up with Google
    btnGoogle.addEventListener('click', async function () {
        var provider = new firebase.auth.GoogleAuthProvider();
        try{
            await firebase.auth().signInWithPopup(provider);
            window.location.assign('./index.html');
        } catch(error) {
            create_alert("error", "Access denied.");
        }
    });

    // Sign up
    btnSignUp.addEventListener('click', async function () {
        try{
            await firebase.auth().createUserWithEmailAndPassword(txtEmail.value, txtPassword.value);
            usersRef.push({
                email: txtEmail.value,
                password: txtPassword.value,
                card: "",
                security: ["", ""],
                uid: firebase.auth().currentUser.uid
            });
            create_alert("success", "Signed up successfully!");
            // txtEmail.value = "";
            txtPassword.value = "";
        } catch(error) {
            create_alert("error", "Failed to register.");
            // txtEmail.value = "";
            txtPassword.value = "";
        }
    });
}

// Custom alert
function create_alert(type, message) {
    var alertarea = document.getElementById('custom-alert');
    if (type == "success") {
        str_html = "<div class='alert alert-success alert-dismissible fade show' role='alert'><strong>Success! </strong>" + message + "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>";
        alertarea.innerHTML = str_html;
    } else if (type == "error") {
        str_html = "<div class='alert alert-danger alert-dismissible fade show' role='alert'><strong>Error! </strong>" + message + "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>";
        alertarea.innerHTML = str_html;
    }
}

function homepage(){
    var tmp = document.createElement('a');
    tmp.href = './index.html';
    tmp.click();
    tmp.remove();
}
function showSecurityDiv(){
    console.log('showSecurityDiv');
    var signinDiv = document.getElementById('signinDiv');
    signinDiv.style.display = "none";
    var securityDiv = document.getElementById('securityDiv');
    securityDiv.style.display = "";
    var borderDiv = document.getElementById('borderDiv');
    borderDiv.style.height = "350px";
    var emailAddress = document.getElementById('forgotEmail');
    var btnNext = document.getElementById('btnNext');
    btnNext.addEventListener('click', async function () {
        firebase.auth().sendPasswordResetEmail(emailAddress.value).then(function() {
            create_alert("success", "Email sent!");
          }).catch(function(error) {
            create_alert("error", "Invalid email address.");
          });
    });
    
}
window.onload = function () {
    initApp();
};