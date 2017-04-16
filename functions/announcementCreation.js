(function() {

    var currentUser;

    

    var groupNum = 1;

    var groups = [];

    $(document).ready(function() {

        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                currentUser = getGlobalUser();
                //populate dynamic checkbox with available groups

                if( !currentUser.isFaculty ){
                    alert("only faculty can access this page");
                    window.location.href = "announcements.html";
                }
                else{
                    populateCheckBox();
                }

            } else {
                // No user is signed in.
                alert("Logging out!");
                window.location.href = "login.html";
            }
        });

         //when the back button is clicked, go back to announcements page    
        $("#back_button").on("click", function() {
            window.location.href = "announcements.html";
        });

        //when the submit button is pressed for the new announcements form,
        //get the data and try to add new announcement to firebase
        $("#announcementEntry_form").on("submit", function(e) {
            if (!e.isDefaultPrevented()) {
                e.preventDefault();
                var priority = $("#announcemet_priority").val();
                var title = $("#announcement_title").val();
                var message = $("#announcement_message").val();
                var user = new User(null, "Jeffery", "Calhoun", "jcd39@mail.umsl.edu", null, true, true, null, null);


                //store checked boxes
                var selectedGroups = new Array();
                $.each($("input[name='group']:checked"), function() {
                    console.log("checked");
                    selectedGroups.push(groups[$(this).val()]);
                });

                //if no groups selected, default to all groups             
                if (selectedGroups.length === 0) {
                    $.each($("input[name='group']:not(:checked"), function() {
                        console.log("reCheck");
                        selectedGroups.push(groups[$(this).val()]);
                    });
                }

                addAnnouncement(user, title, message, priority, selectedGroups);
            }
        });

        


        //bootstrap validator fields/criteria
        $('#announcementEntry_form').bootstrapValidator({
            container: '#messages',
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            fields: {
                announcement_title: {
                    validators: {
                        notEmpty: {
                            message: 'The title is required and cannot be empty'
                        }
                    }
                },
                announcement_message: {
                    validators: {
                        notEmpty: {
                            message: 'An Announcement is required and cannot be empty'
                        }
                    }
                },
                //placeholder if we actually want dynamic form validation
                'group[]': {
                    validators: {
                        notEmpty: {
                            message: 'Please choose one at least'
                        }
                    }

                }
            }

        });

    });




    //function to create checkboxes from groups available to user, or if admin - all groups in firebase DB
    function populateCheckBox() {

        if(currentUser.isAdmin){
            //admin can send announcement to any group
            var groupRef = firebase.database().ref('groups/');

            var checkboxIndex = 0;

            //query firebase group nodes and use 'name' to populate checkbox group
            groupRef.orderByChild('name').on('child_added', function(snapshot) {

                groups.push(snapshot.val());

                $("#groupCheckbox").append(groupHtmlFromObject(snapshot.val(), checkboxIndex));
                checkboxIndex += 1;
                groupNum++;
            });

        }
        else{

            //only populate the current user's groups
            var checkboxIndex = 0;

            currentUser.groups.forEach(function(group){
                $("#groupCheckbox").append(groupHtmlFromObject(group, checkboxIndex));
                checkboxIndex += 1;
                groupNum++;

            });
        }

        

    }


    //create checkbox input dynamically and use 'data-group' attribute to store group name for DB record downstream
    function groupHtmlFromObject(fbGroup, index) {

        var html = '<input type = "checkbox" id = "group' + groupNum + '"class = "checkboxGroups" name = "group" value="' + index + '"';
        html += 'data-group="' + fbGroup.name + '">';
        html += '<label>' + fbGroup.name + '</label></br>';
        return html;
    }




    //Creates a new announcement in Firebase
    function addAnnouncement(faculty, title, message, priority, groups) {

        var announcementsRef = firebase.database().ref('announcements/');
        var newAnnouncementKey = announcementsRef.push().key;
        var newAnnouncement = new Announcement(newAnnouncementKey, faculty, title, message, priority, groups);

        var updates = {};
        updates['/announcements/' + newAnnouncementKey] = newAnnouncement;
        firebase.database().ref().update(updates).then(function() {
            window.location.href = "announcements.html";
        }, function(error) {
            alert("Failed to add announcement!");
        });
    }

}());