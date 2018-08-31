var appServices = angular.module('Services', []);

appServices.factory('AuthService', ['$q', '$http', function($q, $http) {

    var user = null;

    function isLoggedIn() {
        return user;
    }

    function getUserStatus() {
        return $http.get('/user/status')
            .success(function(data) {
                user = data.user;
            })
            .error(function(data) {
                user = null;
            });
    }

    function forgotPassword(json) {

        var deferred = $q.defer();

        $http.post('/user/forgotPassword', json)
            .success(function(data) {
                deferred.resolve(data);
            })
            .error(function(data) {
                deferred.reject(data);
            });

        return deferred.promise;
    }

    function setPassword(json) {

        var deferred = $q.defer();

        $http.post('/user/setPassword', json)
            .success(function(data) {
                deferred.resolve(data);
            })
            .error(function(data) {
                deferred.reject(data);
            });

        return deferred.promise;
    }

    function getUserDetails() {
        var deferred = $q.defer();

        if (user) {
            $http.get('/user/userDetails')
                .success(function(data) {
                    deferred.resolve(data);
                });
        } else {
            deferred.resolve('');
        }

        return deferred.promise;
    }

    function login(email, password) {

        var deferred = $q.defer();

        $http.post('/user/login', { email: email, password: password })
            .success(function(data, status) {
                if (status === 200 && data.status) {
                    user = true;
                    deferred.resolve();
                } else {
                    user = false;
                    deferred.reject();
                }
            })
            .error(function(data) {
                user = false;
                deferred.reject();
            });

        return deferred.promise;

    }

    function changePassword(json) {

        var deferred = $q.defer();

        $http.post('/user/changePassword', json)
            .success(function(data) {
                deferred.resolve(data);
            })
            .error(function(data) {
                deferred.reject(data);
            });

        return deferred.promise;

    }

    function changeName(json) {

        var deferred = $q.defer();

        $http.post('/user/changeName', json)
            .success(function(data) {
                deferred.resolve(data);
            })
            .error(function(data) {
                deferred.reject(data);
            });

        return deferred.promise;

    }

    function logout() {

        var deferred = $q.defer();

        $http.get('/user/logout')
            .success(function(data) {
                user = false;
                deferred.resolve();
            })
            .error(function(data) {
                user = false;
                deferred.reject();
            });

        return deferred.promise;

    }

    function register(firstname, lastname, organization, email, password, question, answer) {

        var deferred = $q.defer();

        $http.post('/user/register', { firstname: firstname, lastname: lastname, organization: organization, email: email, password: password, securityQuestion: question, securityAnswer: answer })
            .success(function(data, status) {
                if (status === 200 && data.status) {
                    deferred.resolve();
                } else {
                    deferred.reject();
                }
            })
            .error(function(data) {
                deferred.reject(data.err);
            });

        return deferred.promise;

    }

    return ({
        isLoggedIn: isLoggedIn,
        getUserStatus: getUserStatus,
        getUserDetails: getUserDetails,
        login: login,
        forgotPassword: forgotPassword,
        setPassword: setPassword,
        changePassword: changePassword,
        changeName: changeName,
        logout: logout,
        register: register
    });

}]);


appServices.factory('ModalService', ['$uibModal', function($uibModal) {

    function openAlertModal(data) {
        $uibModal.open({
            templateUrl: 'partials/alertModal.html',
            controller: 'alertModalInstanceCtrl',
            backdrop: 'static',
            keyboard: false,
            size: "md",
            resolve: {
                text: function() {
                    return data;
                }
            }
        });
    }

    return ({
        openAlertModal: openAlertModal
    });

}]);



appServices.factory('EventService', ['$q', '$http', function($q, $http) {

    function downloadCSV(payload, name) {
        $http.post('/api/events/downloadCSV', { payload: payload })
            .success(function(data, status, headers, config) {
                var hiddenElement = document.createElement('a');
                hiddenElement.href = 'data:attachment/csv;charset=utf-8,' + encodeURI(data);
                hiddenElement.target = '_blank';
                hiddenElement.download = name + '_signups.csv';
                hiddenElement.click();
            })
            .error(function(data, status, headers, config) {

            });
    }

    function allEvents(username) {
        var deferred = $q.defer();

        $http.post('/api/events/allEvents', username)
            .success(function(data) {
                deferred.resolve(data);
            })
            .error(function(data) {
                deferred.reject(data.err);
            });

        return deferred.promise;
    }

    function createEvent(event) {
        var deferred = $q.defer();

        $http.post('/api/events/createEvent', event)
            .success(function(data) {
                deferred.resolve(data);
            })
            .error(function(data) {
                deferred.reject(data.err);
            });

        return deferred.promise;
    }

    function getEventDetails(id) {
        var deferred = $q.defer();

        $http.post('api/events/eventDetails', id)
            .success(function(data) {
                deferred.resolve(data);
            })
            .error(function(err) {
                deferred.reject(err);
            });

        return deferred.promise;
    }

    function getSecureEventDetails(id) {
        var deferred = $q.defer();

        $http.post('api/events/secureEventDetails', id)
            .success(function(data) {
                deferred.resolve(data);
            })
            .error(function(err) {
                deferred.reject(err);
            });

        return deferred.promise;
    }

    function signUp(json) {
        var deferred = $q.defer();

        $http.post('api/events/signUp', json)
            .success(function(data) {
                deferred.resolve(data);
            })
            .error(function(err) {
                deferred.reject(err);
            });

        return deferred.promise;
    }

    function removeVolunteer(json) {
        var deferred = $q.defer();

        $http.post('api/events/removeVolunteer', json)
            .success(function(data) {
                deferred.resolve(data);
            })
            .error(function(err) {
                deferred.reject(err);
            });

        return deferred.promise;
    }

    function editDetails(json) {
        var deferred = $q.defer();

        $http.post('api/events/editDetails', json)
            .success(function(data) {
                deferred.resolve(data);
            })
            .error(function(err) {
                deferred.reject(err);
            });

        return deferred.promise;
    }

    function changeEventStatus(json) {
        var deferred = $q.defer();

        $http.post('api/events/changeEventStatus', json)
            .success(function(data) {
                deferred.resolve(data);
            })
            .error(function(err) {
                deferred.reject(err);
            });

        return deferred.promise;
    }

    function deleteEvent(id) {
        var deferred = $q.defer();

        $http.post('api/events/deleteEvent', id)
            .success(function(data) {
                deferred.resolve(data);
            })
            .error(function(err) {
                deferred.reject(err);
            });

        return deferred.promise;
    }

    function sendEmail(json) {
        var deferred = $q.defer();

        $http.post('api/events/sendEmail', json)
            .success(function(data) {
                deferred.resolve(data);
            })
            .error(function(err) {
                deferred.reject(err);
            });

        return deferred.promise;
    }

    return ({
        downloadCSV: downloadCSV,
        createEvent: createEvent,
        allEvents: allEvents,
        getEventDetails: getEventDetails,
        getSecureEventDetails: getSecureEventDetails,
        removeVolunteer: removeVolunteer,
        editDetails: editDetails,
        changeEventStatus: changeEventStatus,
        deleteEvent: deleteEvent,
        signUp: signUp,
        sendEmail: sendEmail
    });

}]);