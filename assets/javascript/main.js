
// Initialize Firebase
var config = {
    apiKey: "AIzaSyD_oxjnO0tySJNiJT3zRp1eIZ5gvRjznbU",
    authDomain: "trainscheduler-c8dea.firebaseapp.com",
    databaseURL: "https://trainscheduler-c8dea.firebaseio.com",
    projectId: "trainscheduler-c8dea",
    storageBucket: "trainscheduler-c8dea.appspot.com",
    messagingSenderId: "192623369209"
};
firebase.initializeApp(config);
let database = firebase.database();


function calculateNextArrivalTime(minAway) {

    let minutesAway = minAway;
    let arrivalTime = moment().add(minutesAway, "minutes").format('hh:mm a');
    return arrivalTime;
}
function calculateMinutesAway(first, freq) {
    let firstTime = first;
    let frequency = freq;
    let firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "days");
    let diffTime = moment().diff(moment(firstTimeConverted), "minutes")
    let minutesAway = frequency - diffTime % frequency;
    return minutesAway;
}



let isEditing = false;
let editBtn = `<button class="btn edit-button" title="Edit"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></button>`
let deleteBtn = `<button class="btn delete-button"title="Delete"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>`
let editDeleteBtns = editBtn + deleteBtn;
let submitBtn = `<button type="submit" class="btn btn-primary submit-edit-button" title="Submit"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></button>`
let cancelBtn = `<button class="btn btn-danger cancel-button" title="Cancel"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>`
let submitCancelBtns = submitBtn + cancelBtn;

function populateTableData(snapshot) {
    let firstTrainTime = snapshot.val().firstTrainTime;
    let frequency = snapshot.val().frequency;
    let minutesAway = calculateMinutesAway(firstTrainTime, frequency);
    let nextArrivalTime = calculateNextArrivalTime(minutesAway);


    let nameTd = `<td> ${snapshot.val().trainName} </td>`;
    let destinationTd = `<td> ${snapshot.val().destination} </td>`;
    let firstTrainTimeTd = `<td class="first-train-time time" style="display: none;"> ${firstTrainTime} </td>`;
    let frequencyTd = `<td> ${frequency} </td>`;
    let nextArrivalTd = `<td> ${nextArrivalTime} </td>`;
    let minutesAwayTd = `<td> ${minutesAway} </td>`;

    let btnTd = `<td>${editDeleteBtns}</td>`;
    let tr = nameTd + destinationTd + firstTrainTimeTd + frequencyTd + nextArrivalTd + minutesAwayTd + btnTd;
    return tr;
}


function currentValues() {
    console.log("1 min has passed");
    database.ref().on('value', function (snapshot) {
        for (let obj in snapshot.val()) {
            database.ref(obj).on('value', function (snapshot) {
                $(`#${obj}`).html(populateTableData(snapshot))
            })
        }

    })
}
setInterval(currentValues, 60000);

database.ref().on('child_added', function (snapshot) {
    let tr = populateTableData(snapshot);
    let $tr = $(`<tr id=${snapshot.key}>`).html(tr)
    $('#trainScheduleTable').append($tr);
})

database.ref().on('child_changed', function (snapshot) {
    let tr = populateTableData(snapshot);
    $(`#${snapshot.key}`).html(tr)
    $('.first-train-time').css('display', 'none');
    $('.time').css('visibility', 'collapse');
})

$(document).on('click', '.edit-button', function () {

    if (!isEditing) {
        isEditing = true;
        let row = $(this).parent().parent().children();

        $('.first-train-time').css('display', 'table-cell');
        $('.time').css('visibility', 'collapse');
        for (let i = 0; i < row.length - 3; i++) {
            if (i === 2) {
                $(row[i]).css('visibility', 'visible')
            }
            let value = $(row[i]).html();
            $(row[i]).html(`<input class="form-control" value="${value}">`);
        }
        $(row[row.length - 1]).html(submitCancelBtns)
    }

})

$(document).on('click', '.delete-button', function () {
    if (confirm("Are you sure you want to delete this schedule?")) {
        $('.first-train-time').css('display', 'none');
        $('.time').css('visibility', 'collapse');
        isEditing = false;
        database.ref($(this).parent().parent().attr('id')).remove();
        $(this).parent().parent().remove();
    }
})

$(document).on('click', '.submit-edit-button', function (event) {

    isEditing = false;
    let row = $(this).parent().parent().children();
    database.ref($(this).parent().parent().attr('id')).update({
        trainName: $(row[0].children[0]).val().trim(),
        destination: $(row[1].children[0]).val().trim(),
        firstTrainTime: $(row[2].children[0]).val().trim(),
        frequency: $(row[3].children[0]).val().trim()
    })
    event.preventDefault();
})


$(document).on('click', '.cancel-button', function () {
    $('.first-train-time').css('display', 'none');
    $('.time').css('visibility', 'collapse');
    let currentRow = $(this).parent().parent();
    isEditing = false;
    database.ref(currentRow.attr('id')).on('value', function (snapshot) {
        $(currentRow).html(populateTableData(snapshot));
    })
})


$(document).on('click', '#trainSubmit', function (event) {

    let name = $('#trainNameInput').val().trim();
    let destination = $('#destinationInput').val().trim();
    let trainTime = $('#trainTimeInput').val().trim();
    let frequency = $('#frequencyInput').val().trim();

    if (moment(trainTime, "HH:mm").isValid() && moment(trainTime, 'HH:mm').format('HH:mm') === trainTime) {
        event.preventDefault();
        database.ref().push({
            trainName: name,
            destination: destination,
            firstTrainTime: trainTime,
            frequency: frequency
        })
        $('#trainForm').trigger("reset");
    } else {
        $("#trainTimeInput")[0].setCustomValidity("Please enter a valid military time. (e.g. 13:00 for 1:00 PM)");

    }


})

var modal = document.getElementById('id-01');

$(document).on('click', window, function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
})

$(document).on('click', '#submit-login-btn', function (event) {
    event.preventDefault();
    let email = $("input[name='username']").val()
    let password = $("input[name='pw']").val()
    console.log(email + " : " + password)
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        console.log(errorCode);
        var errorMessage = error.message;
        console.log(errorMessage);
        // ...
    });
})



// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

var uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
            alert('You signed in successful.')
            console.log("Auth Result: " + authResult);
            console.log("Redirect Url: " + redirectUrl)
            // User successfully signed in.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            return true;
        },
        uiShown: function () {
            // The widget is rendered.
            // Hide the loader.
            document.getElementById('loader').style.display = 'none';
        }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: '<url-to-redirect-to-on-success>',
    signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    tosUrl: '<your-tos-url>'
};


// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);
