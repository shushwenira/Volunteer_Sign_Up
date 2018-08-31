var appControllers = angular.module('Controllers', []);


appControllers.controller('HomeCtrl', ['$scope', '$rootScope', '$state', 'AuthService', function($scope, $rootScope, $state, AuthService) {
    AuthService.getUserDetails()
        .then(function(data) {
            $rootScope.userDetails = data;
        });

    $scope.logout = function() {
        AuthService.logout()
            .then(function() {
                $state.go('home.welcome', null, { reload: true });
            });
    };

}]);

appControllers.controller('loginController', ['$scope', '$rootScope', '$state', 'AuthService', function($scope, $rootScope, $state, AuthService) {

    $scope.login = function() {

        $scope.error = false;
        $scope.disabled = true;

        AuthService.login($scope.loginForm.email, $scope.loginForm.password)
            .then(function() {
                $scope.disabled = false;
                $scope.loginForm = {};
                AuthService.getUserStatus()
                    .then(function() {
                        $rootScope.userDetails = AuthService.isLoggedIn();
                        $state.go('home.events', null, { reload: true });
                    });

            })
            .catch(function() {
                $scope.error = true;
                $scope.errorMessage = "Invalid credentials";
                $scope.disabled = false;
                $scope.loginForm = {};
            });

    };

    $scope.forgot = function() {
        $state.go('home.forgot', null, { reload: true });
    }

}]);

appControllers.controller('forgotController', ['$scope', 'AuthService', '$rootScope','$state', function($scope, AuthService,$rootScope, $state) {
    $scope.user = {};
    $scope.errorMessage = "";
    $scope.isAuthenticated = false;
    $scope.authenticate = function() {
        AuthService.forgotPassword({ username: $scope.user.username, securityQuestion: $scope.user.question, securityAnswer: $scope.user.answer })
            .then(function(data) {
                $scope.success = data;
                $scope.errorMessage = "";
                $scope.isAuthenticated = true;
            })
            .catch(function(info) {
                $scope.errorMessage = info.err;
            });
    }

    $scope.setPassword = function() {
        AuthService.setPassword({ username: $scope.user.username, password: $scope.user.password })
            .then(function(data) {
                $scope.success = data;
                $scope.errorMessage = "";
                $scope.isAuthenticated = true;
                AuthService.login($scope.user.username, $scope.user.password)
                    .then(function() {
                        $scope.user = {};
                        $rootScope.userDetails = AuthService.isLoggedIn();
                        $state.go('home.events', null, { reload: true });
                    });
            })
            .catch(function(info) {
                $scope.errorMessage = info.err;
            });
    }


}]);

appControllers.controller('registerController', ['$scope', '$rootScope', '$state', 'AuthService', function($scope, $rootScope, $state, AuthService) {

    $scope.register = function() {

        $scope.error = false;
        $scope.disabled = true;

        AuthService.register($scope.registerForm.firstname, $scope.registerForm.lastname, $scope.registerForm.organization, $scope.registerForm.email, $scope.registerForm.password, $scope.registerForm.question, $scope.registerForm.answer)
            .then(function() {
                $scope.disabled = false;
                AuthService.login($scope.registerForm.email, $scope.registerForm.password)
                    .then(function() {
                        $scope.registerForm = {};
                        $rootScope.userDetails = AuthService.isLoggedIn();
                        $state.go('home.events', null, { reload: true });
                    });

            })
            .catch(function(err) {
                $scope.error = true;
                if (err.name == 'UserExistsError') {
                    $scope.errorMessage = "Email already registered";
                } else {
                    $scope.errorMessage = err.message;
                }
                $scope.disabled = false;
                $scope.registerForm = {};
            });

    };

}]);


appControllers.controller('ProfileCtrl', ['$scope', '$rootScope', 'AuthService', function($scope, $rootScope, AuthService) {

    $scope.error = null;

    $scope.user = {
        oldPassword: null,
        newPassword: null,
        confirmNewPassword: null,
        username: $rootScope.userDetails.username,
        organization: $rootScope.userDetails.organization,
        firstname: $rootScope.userDetails.firstname,
        lastname: $rootScope.userDetails.lastname
    }

    $scope.changePassword = function() {

        if ($scope.user.newPassword != $scope.user.confirmNewPassword) {
            $scope.error = "New and Corfirm password do not match";
            $scope.success = null;
        } else {
            AuthService.changePassword({ username: $scope.user.username, oldPassword: $scope.user.oldPassword, newPassword: $scope.user.newPassword })
                .then(function(data) {
                    $scope.success = data.message;
                    $scope.user.oldPassword = $scope.user.newPassword = $scope.user.confirmNewPassword = null;
                    $scope.error = null;
                })
                .catch(function(info) {
                    $scope.error = info.err;
                    $scope.success = null;
                });
        }

    };

    $scope.changeName = function() {

        AuthService.changeName({ username: $scope.user.username, firstname: $scope.user.firstname, lastname: $scope.user.lastname })
            .then(function(data) {
                $scope.success = data.message;
                $scope.error = null;
            })
            .catch(function(info) {
                $scope.error = info.err;
                $scope.success = null;
            });

    };

}]);


appControllers.controller('EventsCtrl', ['$scope', '$rootScope', 'EventService', '$uibModal', function($scope, $rootScope, EventService, $uibModal) {

    EventService.allEvents({ username: $rootScope.userDetails.username })
        .then(function(data) {
            $scope.allEvents = data;
            for (var i = 0; i < $scope.allEvents.length; i++) {
                $scope.allEvents[i].total_volunteers = 0;
                for (var j = 0; j < $scope.allEvents[i].what.length; j++) {
                    $scope.allEvents[i].total_volunteers += $scope.allEvents[i].what[j].people_signedup.length;
                }
            }

        })
        .catch(function(err) {
            $scope.error = err.message;
        })

    $scope.cancel = function(event) {
        $uibModal.open({
            templateUrl: 'partials/statusChangeModal.html',
            controller: 'statusChangeModalInstanceCtrl',
            backdrop: 'static',
            keyboard: false,
            size: "md",
            resolve: {
                event: function() {
                    return event;
                }
            }
        });
    }

    $scope.copy = function(event) {
        $uibModal.open({
            templateUrl: 'partials/copy.html',
            controller: 'copyModalInstanceCtrl',
            backdrop: 'static',
            keyboard: false,
            size: "md",
            resolve: {
                event: function() {
                    return event;
                }
            }
        });
    }

}]);


appControllers.controller('SignupSheetCtrl', ['$scope', '$state', '$stateParams', 'EventService', function($scope, $state, $stateParams, EventService) {

    EventService.getSecureEventDetails({ _id: $stateParams.id })
        .then(function(data) {
            if (data) {
                $scope.event = data;
                $scope.deactivated = $scope.event.isDeactivated;
            } else {
                $scope.notFound = true;
            }

        })
        .catch(function(err) {
            $scope.notFound = true;
        });

    $scope.signUp = function(index) {
        $state.go('home.signup', { id: $stateParams.id, whatIndex: index });
    }

}]);

appControllers.controller('SignupCtrl', ['$scope', '$state', '$stateParams', 'EventService', function($scope, $state, $stateParams, EventService) {

    EventService.getSecureEventDetails({ _id: $stateParams.id })
        .then(function(data) {
            if (data) {
                $scope.event = data;
                $scope.task = $scope.event.what[$stateParams.whatIndex];
                if ($scope.event.isDeactivated) {
                    $scope.deactivated = true;
                }
                if ($scope.task.people_needed - $scope.task.people_signedup.length == 0) {
                    $scope.event_full = true;
                }
                $scope.emailBody = "<div>Volunteer Confirmation</div><br/><div><b>Event name:</b> " +
                    $scope.event.title + "</div><div>  <b>Signup page:</b> <a href='http://localhost:3000/#/VolunteerSignUp/signup/" +
                    $scope.event._id + "'>VolunteerSignUp/signup/" +
                    $scope.event._id + "</a></div><div><b>Task:</b> " +
                    $scope.task.name + "</div>";

                if ($scope.task.when) {
                    $scope.emailBody += "<div><b>When:</b> " +
                        $scope.task.when + "</div>";
                }

                $scope.emailBody += "<br/><div>Please mark your calendar now.</div><br/><div>In case of inquiries or cancellation, please contact event manager. </div><div><b>Manager Email:</b> <a href='mailto:" +
                    $scope.event.owner + "' target='_top'>" +
                    $scope.event.owner + "</a></div><br/><div>Register to create your own free signup sheet here: <a href='http://localhost:3000/#/VolunteerSignUp/register'>VolunteerSignUp/register</a></div>";
            } else {
                $scope.notFound = true;
            }

        })
        .catch(function(err) {
            $scope.notFound = true;
        });

    $scope.volunteer = {
        firstname: "",
        lastname: "",
        email: "",
        phone: null
    };




    $scope.signUp = function() {

        EventService.getSecureEventDetails({ _id: $stateParams.id })
            .then(function(data) {
                if (data) {
                    $scope.event = data;
                    $scope.task = $scope.event.what[$stateParams.whatIndex];
                    if ($scope.event.isDeactivated) {
                        $scope.deactivated = true;
                    } else if ($scope.task.people_needed - $scope.task.people_signedup.length == 0) {
                        $scope.event_full = true;
                    } else {
                        EventService.signUp({ people: $scope.volunteer, eventId: $stateParams.id, whatId: $scope.task._id })
                            .then(function(data) {

                                EventService.sendEmail({ to: $scope.volunteer.email, subject: 'Thank you for volunteering', message: $scope.emailBody, bcc: [] })
                                    .then(function(data) {
                                        $state.go('home.thanks', { id: $stateParams.id, whatIndex: $stateParams.whatIndex });
                                    })
                                    .catch(function(err) {
                                        $scope.error = err;
                                    });

                            })
                            .catch(function(err) {
                                $scope.error = err;
                            })
                    }

                } else {
                    $scope.notFound = true;
                }

            })
            .catch(function(err) {
                $scope.notFound = true;
            });
    }

}]);


appControllers.controller('EventDetailsCtrl', ['$scope', '$state', '$stateParams', 'EventService', 'ModalService', function($scope, $state, $stateParams, EventService, ModalService) {

    EventService.getEventDetails({ _id: $stateParams.id })
        .then(function(data) {
            $scope.event = data;
        })
        .catch(function(err) {
            $state.go('home.events', null, { reload: true });
        });

    $scope.range = function(n) {
        return new Array(n);
    };

    $scope.download = function() {
        $scope.payload = [];
        for (var i = 0; i < $scope.event.what.length; i++) {

            for (var j = 0; j < $scope.event.what[i].people_needed; j++) {
                var obj = {};
                obj.Task = $scope.event.what[i].name;
                obj.When = $scope.event.what[i].when;
                obj.Volunteer = "";
                obj.Email = "";
                obj.Phone = "";
                if ($scope.event.what[i].people_signedup[j]) {
                    obj.Volunteer = $scope.event.what[i].people_signedup[j].firstname + " " + $scope.event.what[i].people_signedup[j].lastname;
                    obj.Email = $scope.event.what[i].people_signedup[j].email;
                    obj.Phone = $scope.event.what[i].people_signedup[j].phone;
                }
                $scope.payload.push(obj);
            }
        }
        EventService.downloadCSV($scope.payload, $scope.event.title);
    }

    $scope.clearSlot = function(whatIndex, volunteerIndex) {
        EventService.removeVolunteer({
                eventId: $stateParams.id,
                whatId: $scope.event.what[whatIndex]._id,
                volunteerId: $scope.event.what[whatIndex].people_signedup[volunteerIndex]._id
            })
            .then(function(data) {
                $scope.temp = data;
                $scope.emailBody = "<div>Your slot has been cleared from the below volunteering event</div><br/><div><b>Event name:</b> " +
                    $scope.event.title + "</div><div>  <b>Signup page:</b> <a href='http://localhost:3000/#/VolunteerSignUp/signup/" +
                    $scope.event._id + "'>VolunteerSignUp/signup/" +
                    $scope.event._id + "</a></div><div><b>Task:</b> " +
                    $scope.event.what[whatIndex].name + "</div>";

                if ($scope.event.what[whatIndex].when) {
                    $scope.emailBody += "<div><b>When:</b> " +
                        $scope.event.what[whatIndex].when + "</div>";
                }

                $scope.emailBody += "<br/><div>In case of inquiries, please contact event manager. </div><div><b>Manager Email:</b> <a href='mailto:" +
                    $scope.event.owner + "' target='_top'>" +
                    $scope.event.owner + "</a></div><br/><div>Register to create your own free signup sheet here: <a href='http://localhost:3000/#/VolunteerSignUp/register'>VolunteerSignUp/register</a></div>";



                EventService.sendEmail({ bcc: [], to: $scope.event.what[whatIndex].people_signedup[volunteerIndex].email, subject: 'Volunteering slot cleared', message: $scope.emailBody })
                    .then(function(data) {
                        $scope.event = $scope.temp;
                        ModalService.openAlertModal("Slot cleared and volunteer has been notified via email");
                        $state.go($state.current, { id: $stateParams.id }, { reload: true })
                    })
                    .catch(function(err) {
                        $scope.error = err;
                    });


            })
            .catch(function(err) {
                $scope.error = err;
            });
    }

}]);



appControllers.controller('CreateCtrl', ['$scope', '$rootScope', '$state', 'EventService', function($scope, $rootScope, $state, EventService) {

    $scope.error = "";

    $scope.event = {
        title: "",
        owner: $rootScope.userDetails.username,
        description: "",
        isDeactivated: false,
        what: [{
            name: "",
            when: "",
            people_needed: 1,
            people_signedup: []
        }]
    };

    $scope.$watch('event.title', function() {
        $scope.error = "";
    }, true)

    $scope.addTask = function(index) {
        var what = {
            name: "",
            when: "",
            people_needed: "",
            people_signedup: []
        };

        $scope.event.what.splice(index + 1, 0, what);
    }

    $scope.deleteTask = function(index) {
        $scope.event.what.splice(index, 1);
    }

    $scope.create = function() {
        EventService.createEvent({ event: $scope.event })
            .then(function(data) {
                if (data.code && data.code == 11000) {
                    $scope.error = "Event with same name already exists";
                } else {
                    $state.go('home.events', null, { reload: true });
                }

            })
            .catch(function(err) {
                $scope.error = err.message;
            })
    }

}]);


appControllers.controller('EditCtrl', ['$scope', '$state', '$stateParams', 'EventService', 'ModalService', function($scope, $state, $stateParams, EventService, ModalService) {

    EventService.getEventDetails({ _id: $stateParams.id })
        .then(function(data) {
            $scope.event = data;
        })
        .catch(function(err) {
            $state.go('home.events', null, { reload: true });
        });

    $scope.addTask = function(index) {
        var what = {
            name: "",
            when: "",
            people_needed: 1,
            people_signedup: []
        };

        $scope.event.what.splice(index + 1, 0, what);
    }

    $scope.save = function() {
        EventService.editDetails({ event: $scope.event })
            .then(function(data) {
                ModalService.openAlertModal("Changes saved successfully");
                $state.go("home.events", null, { reload: true });
            })
            .catch(function(err) {
                $scope.error = err;
            });
    }

    $scope.deleteTask = function(index) {
        if ($scope.event.what[index].people_signedup.length > 0) {
            $scope.alert = "Before deleting this task, you must 'clear slots' first (ie, remove all volunteers).";
            ModalService.openAlertModal($scope.alert);
        } else {
            $scope.event.what.splice(index, 1);
        }


    }

    $scope.$watch('event', function() {
        if ($scope.event) {
            for (var i = 0; i < $scope.event.what.length; i++) {
                var task = $scope.event.what[i];
                if (task.people_needed && task.people_needed < task.people_signedup.length) {
                    $scope.alert = "You can't reduce the number of people needed below " + $scope.event.what[i].people_signedup.length +
                        " because there are currently that many people signed up for the task. You will need to 'clear slots' first (ie, remove volunteers).";
                    ModalService.openAlertModal($scope.alert);
                    $scope.event.what[i].people_needed = $scope.event.what[i].people_signedup.length;
                } else if (!task.people_needed) {
                    $scope.alert = "You can't reduce the number of people needed below 1";
                    ModalService.openAlertModal($scope.alert);
                    $scope.event.what[i].people_needed = 1;
                }
            }
        }

    }, true);
}]);

appControllers.controller('alertModalInstanceCtrl', function($scope, $uibModalInstance, text) {

    $scope.text = text;

    $scope.ok = function() {
        $uibModalInstance.close($scope.text);
    };

});


appControllers.controller('copyModalInstanceCtrl', ['$scope', '$state', 'event', 'EventService', '$uibModalInstance', function($scope, $state, event, EventService, $uibModalInstance) {

    $scope.newEvent = {};
    $scope.event = event;

    angular.copy($scope.event, $scope.newEvent);
    $scope.newEvent.title = "";
    $scope.newEvent.isDeactivated = false;
    delete $scope.newEvent._id;
    delete $scope.newEvent.__v;

    for (var i = 0; i < $scope.newEvent.what.length; i++) {
        delete $scope.newEvent.what[i]._id;
        $scope.newEvent.what[i].people_signedup = [];
    }


    $scope.copy = function() {
        if ($scope.newEvent.title.trim()) {
            EventService.createEvent({ event: $scope.newEvent })
                .then(function(data) {
                    if (data.code && data.code == 11000) {
                        $scope.error = "Event with same title already exists";
                        $scope.success = null;
                    } else {
                        $scope.success = "Sheet copied successfully";
                        $scope.copied = true;
                        $scope.error = null;
                    }
                })
                .catch(function(err) {
                    $scope.error = err;
                });
        } else {
            $scope.error = "Please provide new sheet title";
        }

    }

    $scope.close = function() {
        $state.go("home.events", null, { reload: true });
        $uibModalInstance.close();
    };

}]);


appControllers.controller('statusChangeModalInstanceCtrl', function($scope, $uibModalInstance, event, EventService, $state) {

    $scope.event = event;
    $scope.deactivated = false;

    $scope.close = function() {
        $uibModalInstance.close($scope.text);
    };

    $scope.confirmDeactivation = function() {
        EventService.changeEventStatus({ _id: $scope.event._id, isDeactivated: true })
            .then(function(data) {
                $scope.deactivated = true;

                $scope.emails = [];

                for (var i = 0; i < $scope.event.what.length; i++) {
                    var task = $scope.event.what[i];
                    for (var j = 0; j < task.people_signedup.length; j++) {
                        var volunteer = task.people_signedup[j];
                        $scope.emails.push(volunteer.email);
                    }
                }

                $scope.emails = $scope.emails.join(",");

                $scope.emailBody = "<div>Following event and all its tasks have been cancelled</div><br/><div><b>Event name:</b> " +
                    $scope.event.title + "</div><div>  <b>Signup page:</b> <a href='http://localhost:3000/#/VolunteerSignUp/signup/" +
                    $scope.event._id + "'>VolunteerSignUp/signup/" +
                    $scope.event._id + "</a></div>";

                $scope.emailBody += "<br/><div>Thank you for your interest.</div><br/><div>In case of inquiries, please contact event manager. </div><div><b>Manager Email:</b> <a href='mailto:" +
                    $scope.event.owner + "' target='_top'>" +
                    $scope.event.owner + "</a></div><br/><div>Register to create your own free signup sheet here: <a href='http://localhost:3000/#/VolunteerSignUp/register'>VolunteerSignUp/register</a></div>";

                EventService.sendEmail({ bcc: $scope.emails, subject: 'Volunteering event cancelled', message: $scope.emailBody, to: [] })
                    .then(function(data) {
                        $state.go("home.events", null, { reload: true });
                    })
                    .catch(function(err) {
                        $scope.error = err;
                    });

            })
            .catch(function(err) {
                $scope.error = err;
            });
    }

});