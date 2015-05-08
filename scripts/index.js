// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397705
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
var MobileShooter;
(function (MobileShooter) {
    "use strict";
    var Application;
    (function (Application) {
        function initialize() {
            document.addEventListener('deviceready', onDeviceReady, false);
        }
        Application.initialize = initialize;
        function onDeviceReady() {
            // Handle the Cordova pause and resume events
            document.addEventListener('pause', onPause, false);
            document.addEventListener('resume', onResume, false);
            //document.addEventListener('backbutton', handleBackButton);
            var canvas = document.getElementById('content');
            canvas.height = window.innerHeight;
            canvas.width = window.innerWidth;
            var isLoading = true;
            var start = new MyStartScene(canvas);
            setTimeout(function () {
                var shooter = new MyShooterScenario(canvas);
                shooter.onEndGame = function () { return start.start(60); };
                shooter.resources.preload(function () {
                    isLoading = false;
                    start.ready();
                });
                start.onStartGame = function () {
                    if (!isLoading)
                        shooter.start(60);
                };
            }, 200);
        }
        function onPause() {
            // TODO: This application has been suspended. Save application state here.
        }
        function onResume() {
            // TODO: This application has been reactivated. Restore application state here.
        }
    })(Application = MobileShooter.Application || (MobileShooter.Application = {}));
    window.onload = function () {
        Application.initialize();
    };
})(MobileShooter || (MobileShooter = {}));
//# sourceMappingURL=index.js.map