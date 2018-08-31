var mainApp = angular.module('VolunteerSignUp', ['Controllers', 'Services', 'ui.router', 'ngAnimate', 'ui.bootstrap', 'blockUI']);

mainApp.config(function($stateProvider, $urlRouterProvider, blockUIConfig) {
    $stateProvider
        .state({
            name: 'home',
            url: '/VolunteerSignUp',
            templateUrl: 'partials/home.html',
            controller: 'HomeCtrl',
            access: { restricted: true },
            abstract: true
        })
        .state({
            name: 'home.welcome',
            url: '/welcome',
            templateUrl: 'partials/welcome.html',
            access: { restricted: false }
        })
        .state({
            name: 'home.events',
            url: '/events',
            templateUrl: 'partials/events.html',
            controller: 'EventsCtrl',
            access: { restricted: true }
        })
        .state({
            name: 'home.login',
            url: '/login',
            templateUrl: 'partials/login.html',
            controller: 'loginController',
            access: { restricted: false }
        })
        .state({
            name: 'home.forgot',
            url: '/forgot',
            templateUrl: 'partials/forgot.html',
            controller: 'forgotController',
            access: { restricted: false }
        })
        .state({
            name: 'home.register',
            url: '/register',
            templateUrl: 'partials/register.html',
            controller: 'registerController',
            access: { restricted: false }
        })
        .state({
            name: 'home.create',
            url: '/events/create',
            templateUrl: 'partials/create.html',
            controller: 'CreateCtrl',
            access: { restricted: true }
        })
        .state({
            name: 'home.signupSheet',
            url: '/signup/:id',
            templateUrl: 'partials/signupSheet.html',
            controller: 'SignupSheetCtrl',
            access: { restricted: false }
        })
        .state({
            name: 'home.signup',
            url: '/signup/:id/:whatIndex',
            templateUrl: 'partials/signup.html',
            controller: 'SignupCtrl',
            access: { restricted: false }
        })
        .state({
            name: 'home.thanks',
            url: '/signup/:id/:whatIndex/confirmed',
            templateUrl: 'partials/thanks.html',
            controller: 'SignupCtrl',
            access: { restricted: false }
        })
        .state({
            name: 'home.event',
            url: '/events/:id',
            templateUrl: 'partials/eventDetails.html',
            controller: 'EventDetailsCtrl',
            access: { restricted: true }
        })
        .state({
            name: 'home.edit',
            url: '/events/edit/:id',
            templateUrl: 'partials/edit.html',
            controller: 'EditCtrl',
            access: { restricted: true }
        })
        .state({
            name: 'home.profile',
            url: '/profile',
            templateUrl: 'partials/profile.html',
            controller: 'ProfileCtrl',
            access: { restricted: true }
        });

    $urlRouterProvider.otherwise('/VolunteerSignUp/events');

    blockUIConfig.message = "Loading..."
});

mainApp.run(function($rootScope, $state, AuthService) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        AuthService.getUserStatus()
            .then(function() {
                $rootScope.userDetails = AuthService.isLoggedIn();
                if (toState.access && toState.access.restricted && !$rootScope.userDetails) {
                    $state.go('home.welcome', null, { reload: true });
                }
            });
    });
});