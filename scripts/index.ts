// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397705
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
module MobileShooter {
    "use strict";

    export module Application {
        export function initialize() {
            document.addEventListener('deviceready', onDeviceReady, false);
        }

        function onDeviceReady() {
            // Handle the Cordova pause and resume events
            document.addEventListener('pause', onPause, false);
            document.addEventListener('resume', onResume, false);
            //document.addEventListener('backbutton', handleBackButton);

            var canvas = <HTMLCanvasElement>document.getElementById('content');
            canvas.height = window.innerHeight;
            canvas.width = window.innerWidth;

            var isLoading = true;
            var start = new MyStartScene(canvas);

            setTimeout(() => { 
                var shooter: MyShooterScenario = new MyShooterScenario(canvas);
                shooter.onEndGame = () => start.start(60);
                shooter.resources.preload(() => {
                    isLoading = false;
                    start.ready();
                });

                start.onStartGame = () => {
                    if (!isLoading) shooter.start(60);
                };
            }, 200);

        }

        function onPause() {
            // TODO: This application has been suspended. Save application state here.
        }

        function onResume() {
            // TODO: This application has been reactivated. Restore application state here.
        }

    }

    window.onload = function () {
        Application.initialize();
    }
}
