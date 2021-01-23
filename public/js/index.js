var totalComments = 0;
function init() {
    // messaging.requestPermission().then(function() {
    //     console.log('Notification permission granted.');
    //     // TODO(developer): Retrieve an Instance ID token for use with FCM.
    //     // ...
    //   }).catch(function(err) {
    //     console.log('Unable to get permission to notify.', err);
    //   });

    firebase.auth().onAuthStateChanged(function(user) {
        var userInfo = document.getElementById('userInfo');
        var loginout = document.getElementById('loginout');
        var toolbar = document.getElementById('toolbar');
        var jumbotron = document.getElementById('jumbotron');
        var profileBtn = document.getElementById('profileBtn');
        var permiumInfo = document.getElementById('permiumInfo');
        var usersRef = firebase.database().ref('user_list');
        var commentsRef = firebase.database().ref('com_list');
        var groupRef = firebase.database().ref('group_list');
        var targetUser = "";
        var targetUID = "";
        if (user) {
            // User is signed in.
            console.log(user.email);

            // Check if the user email is pushed. If not, it's a third party account.
            usersRef.once('value')
                .then(function(snapshot) {
                    var obj = snapshot.val();
                    var userExist = false;
                    for(var key in obj) {
                        if(obj[key].email === user.email){
                            userExist = true;
                            break;
                        }
                    }
                    if(!userExist){
                        usersRef.push({
                            email: user.email,
                            password: "",
                            card: "",
                            security: ["", ""],
                            uid: user.uid
                        });
                    } 
                })
                .catch(e => console.log(e.message));

            // Check accessable groups of the user.
            var groups = [];
            groupRef.once('value')
                .then(function(snapshot) {
                    var obj = snapshot.val();
                    for(var key in obj) {
                        if(obj[key].users.indexOf(user.uid) !== -1){
                            // console.log(obj[key].groupname);
                            groups.push(obj[key].groupname);
                        }
                    }
                    console.log(groups);
                })
                .catch(e => console.log(e.message));

            // Count the number of comments.
            commentsRef.once('value')
                .then(function(snapshot) {
                    var obj = snapshot.val();
                    for(var key in obj) {
                        totalComments += 1;
                    }
                    console.log(totalComments);

                    var flag = 0;
                    commentsRef.on('value', function(snapshot){
                        if(flag == 0){
                            // Do nothing for the first time.
                            flag = 1;
                        } else {
                            var obj = snapshot.val();
                            var count = 0;
                            for(var key in obj) {
                                if(count == totalComments){
                                    if(obj[key].accessor[1] === user.uid){
                                        // One-on-one.
                                        console.log('sendNotification');
                                        console.log(obj[key].message);
                                        sendNotification(obj[key].message, obj[key].senderemail);
                                    } else if(obj[key].accessor[0] !== user.uid && groups.indexOf(obj[key].accessor[1]) != -1) {
                                        // Group.
                                        console.log('sendNotification');
                                        console.log(obj[key].message);
                                        sendNotification(obj[key].message, obj[key].accessor[1]);
                                    }
                                }
                                count++;
                            }
                            totalComments += 1;
                        }
                    });
                })
                .catch(e => console.log(e.message));

            // Find the user's key in user_list.
            var curCard;
            var curSecQuestion;
            var curSecAnswer;
            usersRef.once('value')
            .then(function(snapshot) {
                var obj = snapshot.val();
                for(var key in obj) {
                    if(obj[key].email === user.email){
                        console.log(obj[key]);
                        curCard = obj[key].card;
                        curSecQuestion = obj[key].security[0];
                        curSecAnswer = obj[key].security[1];
                        break;
                    }
                }
            })
            .then(function(){
                if(curCard !== ""){
                    console.log('You are premium now!');
                    permiumInfo.innerHTML = `<h2 id="info2">You are premium now!</h2>`;
                    document.body.style.background = "#FADA5E";
                    var goldSearchBtn = document.getElementById('searchBtn');
                    goldSearchBtn.style.backgroundColor = "gold";
                    goldSearchBtn.style.borderColor = "goldenrod";
                    var goldAddGroupBtn = document.getElementById('addGroupBtn');
                    goldAddGroupBtn.style.backgroundColor = "goldenrod";
                    goldAddGroupBtn.style.borderColor = "darkgoldenrod";
                } else {
                    permiumInfo.innerHTML = `<h2 id="info2">Get Premium $1.99/month.</h2>`;
                }
            })
            .catch(e => console.log(e.message));

            profileBtn.innerHTML = `<p id="btn1" class="btn btn-primary btn-lg" role="button" style="cursor: pointer;">Set profile</p>`;
            // Set profile.
            profileBtn.addEventListener("click", function(){
                jumbotron.innerHTML = `
                    <div id="messagebox" style="height: 450px; background-color: #666666; border: 1px solid #000000; border-radius: 8px; opacity: 0.9; position: relative; animation: slide2 1s">
                        <div style="height: 50px; background-color: #111111; border-top-left-radius: 4px; border-top-right-radius: 4px; opacity: 0.9; text-align: center; font-size: 20px;">
                            Profile
                        </div>
                        <div style="height: 340px; background-color: #000000; overflow-y: scroll; -webkit-overflow-scrolling: touch;">
                            <div style="margin-left: 10px;">
                                <p style="margin-bottom: 0px; margin-left: 5px; margin-right: 5px;">UID</p>
                                <input class="form-control" placeholder="User ID" style="width: 70%; background-color: #cccccc;" id="input1" value=` + user.uid + ` readonly></input>
                                <p style="margin-bottom: 0px; margin-left: 5px; margin-right: 5px;">Email</p>
                                <input type="email" class="form-control" placeholder="User email" style="width: 70%; margin-top: 5px;" id="input2" value=` + user.email + `></input>
                                <p style="margin-bottom: 0px; margin-left: 5px; margin-right: 5px;">Credit Card(to get premium)</p>
                                <input class="form-control" placeholder="xxxx-xxxx-xxxx-xxxx" style="width: 70%; margin-top: 5px;" id="input3"></input>
                                <p style="margin-bottom: 0px; margin-left: 5px; margin-right: 5px;">Security Setting</p>
                                <input class="form-control" placeholder="Question(Ex: What's your favorite movie?)" style="width: 70%; margin-top: 5px;" id="security1"></input>
                                <input class="form-control" placeholder="Answer(Ex: Avengers4)" style="width: 70%; margin-top: 5px;" id="security2"></input>
                            </div>
                        </div>
                        <div style="display: flex; position: absolute; bottom: 10px; width: 100%; justify-content: center;">
                            <button class="btn btn-light" onclick="homepage()">Cancel</button>
                            <button class="btn btn-dark" id="saveChangeBtn">Save&nbsp;Change</button>
                        </div>
                    </div>
                `;

                var input3 = document.getElementById('input3');
                input3.value = curCard;
                var security1 = document.getElementById('security1');
                security1.value = curSecQuestion;
                var security2 = document.getElementById('security2');
                security2.value = curSecAnswer;

                // Save change.
                var saveChangeBtn = document.getElementById('saveChangeBtn');
                var newUserEmail = document.getElementById('input2');
                var creditCard = document.getElementById('input3');
                var secQuestion = document.getElementById('security1');
                var secAnswer = document.getElementById('security2');
                saveChangeBtn.addEventListener("click", function(){
                    usersRef.once('value')
                        .then(function (snapshot) {
                            var obj = snapshot.val();
                            var userExist = false;
                            for(var key in obj) {
                                if(obj[key].email === newUserEmail.value){
                                    userExist = true;
                                    break;
                                }
                            }
                            
                            if(!userExist || newUserEmail.value === user.email) {
                                var oldUserEmail = user.email;
                                user.updateEmail(newUserEmail.value)
                                    .then(function() {
                                        // Update user info in user_list.
                                        var userkey = "";

                                        for(var key in obj) {
                                            if(obj[key].email === oldUserEmail){
                                                userkey = key;
                                                break;
                                            }
                                        }
                                        // console.log(obj[userkey]);
                                        firebase.database().ref('user_list/' + userkey).update({
                                            email: newUserEmail.value,
                                            card: creditCard.value,
                                            security: [secQuestion.value, secAnswer.value]
                                        });

                                        alert('Updated successfully.');
                                        // homepage();
                                    })
                                    .catch(function(error) {
                                        alert('Failed to update email.');
                                    });
                            } else {
                                alert('The email address has already exist.');
                            }

                            // homepage();
                        })
                        .catch(e => console.log(e.message));
                });
            });

            userInfo.innerHTML = "<h1 id='info1'>Welcome " + user.email + "!</h1>";
            loginout.innerHTML = "Log out";
            loginout.addEventListener("click", async function(){
                await firebase.auth().signOut().then(function() {
                    window.location.assign('./index.html');
                }).catch(function(error) {
                    alert("Failed to log out.");
                });
            });
            toolbar.style.display = "initial";
            var inputUser = document.getElementById('inputUser');
            var addGroupBtn = document.getElementById('addGroupBtn');
            var searchBtn = document.getElementById('searchBtn');

            // Add group.
            addGroupBtn.addEventListener("click", function(){
                jumbotron.innerHTML = `
                    <div id="messagebox" style="height: 450px; background-color: #666666; border: 1px solid #000000; border-radius: 8px; opacity: 0.9; position: relative; animation: slide2 1s">
                        <div style="height: 50px; background-color: #111111; border-top-left-radius: 4px; border-top-right-radius: 4px; opacity: 0.9; text-align: center; display: flex; align-items: center;">
                            <p style="margin-bottom: 0px; margin-left: 5px; margin-right: 5px;">Group Name</p>
                            <input class="form-control" placeholder="Group name" style="width: 70%; margin-right: 10px;" id="inputGroupName"></input>
                        </div>
                        <div style="height: 340px; background-color: #000000;" id="message">
                            <div style="margin-left: 10px;">
                                <p style="margin-bottom: 0px; margin-left: 5px; margin-right: 5px;">*Group member1</p>
                                <input type="email" class="form-control" placeholder="User email" style="width: 70%;" id="inputEmail1"></input>
                                <p style="margin-bottom: 0px; margin-left: 5px; margin-right: 5px;">*Group member2</p>
                                <input type="email" class="form-control" placeholder="User email" style="width: 70%;" id="inputEmail2"></input>
                                <p style="margin-bottom: 0px; margin-left: 5px; margin-right: 5px;">Group member3</p>
                                <input type="email" class="form-control" placeholder="User email(optional)" style="width: 70%;" id="inputEmail3"></input>
                                <p style="margin-bottom: 0px; margin-left: 5px; margin-right: 5px;">Group member4</p>
                                <input type="email" class="form-control" placeholder="User email(optional)" style="width: 70%;" id="inputEmail4"></input>
                                <p style="margin-bottom: 0px; margin-left: 5px; margin-right: 5px;">Group member5</p>
                                <input type="email" class="form-control" placeholder="User email(optional)" style="width: 70%;" id="inputEmail5"></input>
                            </div>
                        </div>
                        <div style="display: flex; position: absolute; bottom: 10px; width: 100%; justify-content: center;">
                            <button class="btn btn-light" onclick="homepage()">Cancel</button>
                            <button class="btn btn-dark" id="createGroupBtn">Create&nbsp;Group</button>
                        </div>
                    </div>
                `;

                // Create group.
                var createGroupBtn = document.getElementById('createGroupBtn');
                var inputGroupName = document.getElementById('inputGroupName');
                var inputEmail1 = document.getElementById('inputEmail1');
                var inputEmail2 = document.getElementById('inputEmail2');
                var inputEmail3 = document.getElementById('inputEmail3');
                var inputEmail4 = document.getElementById('inputEmail4');
                var inputEmail5 = document.getElementById('inputEmail5');
                createGroupBtn.addEventListener("click", function(){
                    var inputEmails = [];
                    if(inputEmail1.value === "" || inputEmail2.value === "") {
                        alert('A group should contain at least 2 other users.');
                    } else {
                        inputEmails.push(user.email);
                        inputEmails.push(inputEmail1.value);
                        inputEmails.push(inputEmail2.value);
                        if(inputEmail3.value !== "") inputEmails.push(inputEmail3.value);
                        if(inputEmail4.value !== "") inputEmails.push(inputEmail4.value);
                        if(inputEmail5.value !== "") inputEmails.push(inputEmail5.value);
                        console.log(inputEmails);

                        var validUIDs = [];
                        usersRef.once('value')
                            .then(function(snapshot){
                                var obj = snapshot.val();
                                for(var key in obj) {
                                    for(var i=0; i<inputEmails.length; i++){
                                        if(obj[key].email === inputEmails[i]){
                                            validUIDs.push(obj[key].uid);
                                            break;
                                        }
                                    }
                                }
                                console.log(validUIDs);
                            })
                            .catch(e => console.log(e.message));

                        groupRef.once('value')
                            .then(function(snapshot) {
                                var obj = snapshot.val();
                                var groupExist = false;
                                for(var key in obj) {
                                    if(obj[key].groupname === inputGroupName.value){
                                        groupExist = true;
                                        break;
                                    }
                                }
                                if(!groupExist){
                                    groupRef.push({
                                        groupname: inputGroupName.value,
                                        users: validUIDs
                                    });

                                    alert('Group created successfully!');
                                    homepage();
                                } else {
                                    alert('The group has already exist.');
                                }
                            })
                            .catch(e => console.log(e.message));
                    }
                });
            });

            // Search user.
            searchBtn.addEventListener("click", function(){
                if(inputUser.value === user.email){
                    alert("That's you!");
                    inputUser.value = "";
                } else {
                    usersRef.once('value')
                        .then(function (snapshot) {
                            var obj = snapshot.val();
                            var userExist = false;
                            for(var key in obj) {
                                if(obj[key].email === inputUser.value){
                                    targetUID = obj[key].uid;
                                    // console.log(targetUID);
                                    userExist = true;
                                    break;
                                }
                            }
                            if(userExist){
                                targetUser = inputUser.value;
                                // console.log('User does exist.');
                                jumbotron.innerHTML = `
                                    <div id="messagebox" style="height: 450px; background-color: #666666; border: 1px solid #000000; border-radius: 8px; opacity: 0.9; position: relative; animation: slide2 1s">
                                        <div style="height: 50px; background-color: #111111; border-top-left-radius: 4px; border-top-right-radius: 4px; opacity: 0.9; text-align: center;">`
                                            + targetUser +
                                        `</div>
                                        <div>
                                            <div style="height: 340px; overflow-x: scroll; overflow-y: scroll; -webkit-overflow-scrolling: touch; background-color: #000000;" id="message"></div>
                                            <div style="display: flex; position: absolute; bottom: 10px; width: 100%; justify-content: center;">
                                                <input class="form-control" placeholder="Type something..." style="width: 80%;" id="inputMessage"></input>
                                                <button class="btn btn-dark" id="sendBtn">Send</button>
                                            </div>
                                        </div>
                                    </div>
                                `;
                                
                                // Showing messages.
                                commentsRef.once('value')
                                    .then(function (snapshot) {
                                        var obj = snapshot.val();

                                        // Sending message.
                                        var sendBtn = document.getElementById('sendBtn');
                                        var inputMessage = document.getElementById('inputMessage');
                                        sendBtn.addEventListener("click", function(){
                                            if(inputMessage.value === ""){
                                                alert('You should type something!');
                                            } else {
                                                console.log(inputMessage.value);
                                                var currentdate = new Date();
                                                var datetime = currentdate.getFullYear() + "/"
                                                    + (currentdate.getMonth()+1)  + "/" 
                                                    + currentdate.getDate() + " "  
                                                    + currentdate.getHours() + ":"  
                                                    + currentdate.getMinutes() + ":" 
                                                    + currentdate.getSeconds();
                                                // console.log(targetUID);
                                                commentsRef.push({
                                                    message: htmlspecialchars(inputMessage.value),
                                                    accessor: [user.uid, targetUID],
                                                    date: datetime,
                                                    senderemail: user.email
                                                });
                                            }
                                            inputMessage.value = "";
                                        });
                                    })
                                    .then(function(){
                                        // Update messages.
                                        commentsRef.on('value', function(snapshot){
                                            var obj = snapshot.val();

                                            document.getElementById("message").innerHTML = '';
                                            for(var key in obj) {
                                                if(obj[key].accessor[0] === user.uid && obj[key].accessor[1] === targetUID){
                                                    document.getElementById("message").innerHTML += `
                                                        <div style="background-color: #3578e5; border: 0.5px solid #000000; border-radius: 10px; margin-left: 50px; margin-top: 1px;">
                                                            <div style="margin-left: 10px;">
                                                                <p style="word-wrap: break-word; margin-left: 2px; margin-top: 2px; margin-bottom: 0px;">` + obj[key].message + `</p>
                                                            </div>
                                                            <div style="margin-left: 10px;">
                                                                <p style="margin-bottom: 0px; margin-top: 5px; font-size:12px;">` + obj[key].date + `</p>
                                                            </div>
                                                        </div>
                                                    `;
                                                }
                                                if(obj[key].accessor[0] === targetUID && obj[key].accessor[1] === user.uid){
                                                    document.getElementById("message").innerHTML += `
                                                        <div style="font-size: small;">` + targetUser + ": " + `
                                                        </div>
                                                        <div style="background-color: #cccccc; border: 0.5px solid #000000; border-radius: 10px; margin-right: 50px; margin-top: 1px;">
                                                            <div style="margin-left: 10px;">
                                                                <p class="targetMessage">` + obj[key].message + `</p>
                                                            </div>
                                                            <div style="margin-left: 10px;">
                                                                <p class="targetMessageDate">` + obj[key].date + `</p>
                                                            </div>
                                                        </div>
                                                    `;
                                                    // sendNotification();
                                                }
                                            }
                                            document.getElementById('message').scrollTop = document.getElementById('message').scrollHeight;
                                        });
                                    })
                                    .catch(e => console.log(e.message));

                                inputUser.value = "";
                            } else {
                                // Find group.
                                groupRef.once('value')
                                    .then(function (snapshot) {
                                        var obj = snapshot.val();
                                        var userExist = false;
                                        for(var key in obj) {
                                            if(obj[key].groupname === inputUser.value){
                                                userExist = true;
                                                break;
                                            }
                                        }

                                        var accessable = false;
                                        for(var key in obj) {
                                            // TODO
                                            if(obj[key].groupname === inputUser.value && obj[key].users.indexOf(user.uid) !== -1){
                                                accessable = true;
                                                break;
                                            }
                                        }

                                        if(userExist && accessable){
                                            targetUser = inputUser.value;
                                            jumbotron.innerHTML = `
                                                <div id="messagebox" style="height: 450px; background-color: #666666; border: 1px solid #000000; border-radius: 8px; opacity: 0.9; position: relative; animation: slide2 1s">
                                                    <div style="height: 50px; background-color: #111111; border-top-left-radius: 4px; border-top-right-radius: 4px; opacity: 0.9; text-align: center;">`
                                                        + targetUser +
                                                    `</div>
                                                    <div>
                                                        <div style="height: 340px; overflow-x: scroll; overflow-y: scroll; -webkit-overflow-scrolling: touch; background-color: #000000;" id="message"></div>
                                                        <div style="display: flex; position: absolute; bottom: 10px; width: 100%; justify-content: center;">
                                                            <input class="form-control" placeholder="Type something..." style="width: 80%;" id="inputMessage"></input>
                                                            <button class="btn btn-dark" id="sendBtn">Send</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            `;

                                            // Showing messages.
                                            commentsRef.once('value')
                                            .then(function (snapshot) {
                                                var obj = snapshot.val();

                                                // Sending message.
                                                var sendBtn = document.getElementById('sendBtn');
                                                var inputMessage = document.getElementById('inputMessage');
                                                sendBtn.addEventListener("click", function(){
                                                    if(inputMessage.value === ""){
                                                        alert('You should type something!');
                                                    } else {
                                                        console.log(inputMessage.value);
                                                        var currentdate = new Date();
                                                        var datetime = currentdate.getFullYear() + "/"
                                                            + (currentdate.getMonth()+1)  + "/" 
                                                            + currentdate.getDate() + " "  
                                                            + currentdate.getHours() + ":"  
                                                            + currentdate.getMinutes() + ":" 
                                                            + currentdate.getSeconds();
                                                        commentsRef.push({
                                                            message: htmlspecialchars(inputMessage.value),
                                                            accessor: [user.uid, targetUser],
                                                            date: datetime,
                                                            senderemail: user.email
                                                        });
                                                    }
                                                    inputMessage.value = "";
                                                });
                                            })
                                            .then(function(){
                                                // Update messages.
                                                commentsRef.on('value', function(snapshot){
                                                    var obj = snapshot.val();
        
                                                    document.getElementById("message").innerHTML = '';
                                                    for(var key in obj) {
                                                        if(obj[key].accessor[0] === user.uid && obj[key].accessor[1] === targetUser){
                                                            document.getElementById("message").innerHTML += `
                                                                <div style="background-color: #3578e5; border: 0.5px solid #000000; border-radius: 10px; margin-left: 50px; margin-top: 1px;">
                                                                    <div style="margin-left: 10px;">
                                                                        <p style="word-wrap: break-word; margin-left: 2px; margin-top: 2px; margin-bottom: 0px;">` + obj[key].message + `</p>
                                                                    </div>
                                                                    <div style="margin-left: 10px;">
                                                                        <p style="margin-bottom: 0px; margin-top: 5px; font-size:12px;">` + obj[key].date + `</p>
                                                                    </div>
                                                                </div>
                                                            `;
                                                        }
                                                        else if(obj[key].accessor[0] !== user.uid && obj[key].accessor[1] === targetUser) {
                                                            document.getElementById("message").innerHTML += `
                                                                <div style="font-size: small;">` + obj[key].senderemail + ": " + `
                                                                </div>
                                                                <div style="background-color: #cccccc; border: 0.5px solid #000000; border-radius: 10px; margin-right: 50px; margin-top: 1px;">
                                                                    <div style="margin-left: 10px;">
                                                                        <p class="targetMessage">` + obj[key].message + `</p>
                                                                    </div>
                                                                    <div style="margin-left: 10px;">
                                                                        <p class="targetMessageDate">` + obj[key].date + `</p>
                                                                    </div>
                                                                </div>
                                                            `;
                                                            // sendNotification();
                                                        }
                                                    }
                                                    document.getElementById('message').scrollTop = document.getElementById('message').scrollHeight;
                                                });
                                            })
                                            .catch(e => console.log(e.message));

                                            inputUser.value = "";
                                        } else {
                                            if(!userExist) alert('The email address/group name does not exist.');
                                            else if(!accessable) alert('The email address/group name is unaccessable.');
                                            inputUser.value = "";
                                        }
                                    })
                                    .catch(e => console.log(e.message));
                            }
                        })
                        .catch(e => console.log(e.message));
                }
            });
        } else {
          // No user is signed in.
          userInfo.innerHTML = `<h1 id="info1">Sign in to get more information...</h1>`;
          permiumInfo.innerHTML = `<h2 id="info2">Get Premium $1.99/month.</h2>`;
          profileBtn.innerHTML = `<p id="btn1"><a class="btn btn-primary btn-lg" href="./signin.html" role="button">Learn more</a></p>`;
        }
      });
}
function homepage(){
    var tmp = document.createElement('a');
    tmp.href = './index.html';
    tmp.click();
    tmp.remove();
}
function developerIgPage(){
    var tmp = document.createElement('a');
    tmp.href = 'https://www.instagram.com/zhengyen0528/';
    tmp.target = 'popup';
    tmp.click();
    tmp.remove();
}
function developerFbPage(){
    var tmp = document.createElement('a');
    tmp.href = 'https://www.facebook.com/profile.php?id=100000511362151';
    tmp.target = 'popup';
    tmp.click();
    tmp.remove();
}
function htmlspecialchars(ch) {
    if (ch === null) return '';
    ch = ch.replace(/&/g,"&amp;");
    ch = ch.replace(/\"/g,"&quot;");
    ch = ch.replace(/\'/g,"&#039;");
    ch = ch.replace(/</g,"&lt;");
    ch = ch.replace(/>/g,"&gt;");
    return ch;
}
function popNotice (message, sender) {
    var notification = new Notification("You have a new message from " + sender, {
        body: message,
        icon: ''
    });
};
function sendNotification(message, sender){
    if (window.Notification) {
        if (Notification.permission == "granted") {
            popNotice(message, sender);
        } else if (Notification.permission != "denied") {
            Notification.requestPermission(function (permission) {
            popNotice(message, sender);
            });
        }
    } else {
        // alert('Your browser does not support chrome notification.');
    }
}
window.onload = function () {
    init();
};