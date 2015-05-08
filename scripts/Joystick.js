///<reference path='Engine.ts'/>
var Joystick = (function () {
    function Joystick(canvas) {
        var _this = this;
        this.up = false;
        this.down = false;
        this.left = false;
        this.rigth = false;
        this.position = new Engine.Point(0, 0);
        this.size = new Engine.Size(canvas.width, canvas.height);
        this.halfWidth = canvas.width / 2;
        this.leftTouchID = -1;
        this.leftTouchPos = new Engine.Point(0, 0);
        this.leftTouchStartPos = new Engine.Point(0, 0);
        this.leftVector = new Engine.Point(0, 0);
        this.touches = [];
        if (window.navigator.msPointerEnabled) {
            canvas.addEventListener("MSPointerDown", function (e) { return _this.onTouchStart(e); }, false);
            canvas.addEventListener("MSPointerMove", function (e) { return _this.onTouchMove(e); }, false);
            canvas.addEventListener("MSPointerUp", function (e) { return _this.onTouchEnd(e); }, false);
        }
        canvas.addEventListener('touchstart', function (e) { return _this.onTouchStart(e); }, false);
        canvas.addEventListener('touchmove', function (e) { return _this.onTouchMove(e); }, false);
        canvas.addEventListener('touchend', function (e) { return _this.onTouchEnd(e); }, false);
    }
    Joystick.prototype.update = function (context) {
        this.up = Math.abs(this.leftVector.y) >= 10 && this.leftVector.y < 0;
        this.down = Math.abs(this.leftVector.y) >= 10 && this.leftVector.y > 0;
        this.left = Math.abs(this.leftVector.x) >= 10 && this.leftVector.x < 0;
        this.rigth = Math.abs(this.leftVector.x) >= 10 && this.leftVector.x > 0;
    };
    Joystick.prototype.draw = function (graphics) {
        for (var i = 0; i < this.touches.length; i++) {
            var touch = this.touches[i];
            if (touch.identifier == this.leftTouchID) {
                graphics.beginPath();
                graphics.strokeStyle = "cyan";
                graphics.lineWidth = 6;
                graphics.arc(this.leftTouchStartPos.x, this.leftTouchStartPos.y, 40, 0, Math.PI * 2, true);
                graphics.stroke();
                graphics.beginPath();
                graphics.strokeStyle = "cyan";
                graphics.lineWidth = 2;
                graphics.arc(this.leftTouchStartPos.x, this.leftTouchStartPos.y, 60, 0, Math.PI * 2, true);
                graphics.stroke();
                graphics.beginPath();
                graphics.strokeStyle = "cyan";
                graphics.arc(this.leftTouchPos.x, this.leftTouchPos.y, 40, 0, Math.PI * 2, true);
                graphics.stroke();
            }
            else {
                graphics.beginPath();
                graphics.fillStyle = "white";
                //graphics.fillText("touch id : " + touch.identifier + " x:" + touch.clientX + " y:" + touch.clientY, touch.clientX + 30, touch.clientY - 30);
                graphics.beginPath();
                graphics.strokeStyle = "red";
                graphics.lineWidth = 6;
                graphics.arc(touch.clientX, touch.clientY, 40, 0, Math.PI * 2, true);
                graphics.stroke();
            }
        }
    };
    Joystick.prototype.getWindowsPhoneTouchEvent = function (e) {
        return {
            identifier: e.pointerId,
            clientX: e.clientX,
            clientY: e.clientY
        };
    };
    Joystick.prototype.getWindowsPhoneStartTouchEvent = function (e) {
        if (!this.touches)
            this.touches = [];
        var event = this.getWindowsPhoneTouchEvent(e);
        if (this.leftTouchID >= 0 && event.clientX < this.halfWidth) {
            this.touches = [];
            this.leftTouchID = -1;
        }
        this.touches.push(event);
        return event;
    };
    Joystick.prototype.getWindowsPhoneEndTouchEvent = function (e) {
        var _this = this;
        var event = this.getWindowsPhoneTouchEvent(e);
        this.touches.forEach(function (touch, index) {
            if (touch.identifier == event.identifier) {
                _this.touches.splice(index, 1);
                return false;
            }
        });
        return event;
    };
    Joystick.prototype.onTouchStart = function (e) {
        var changedTouches = e.changedTouches || [this.getWindowsPhoneStartTouchEvent(e)];
        for (var i = 0; i < changedTouches.length; i++) {
            var touch = changedTouches[i];
            if ((this.leftTouchID < 0) && (touch.clientX < this.halfWidth)) {
                this.leftTouchID = touch.identifier;
                this.leftTouchStartPos = new Engine.Point(touch.clientX, touch.clientY);
                this.leftTouchPos = new Engine.Point(touch.clientX, touch.clientY);
                this.leftVector = new Engine.Point(0, 0);
                continue;
            }
            if (this.onfire)
                this.onfire();
        }
        this.touches = e.touches || this.touches;
    };
    Joystick.prototype.onTouchMove = function (e) {
        e.preventDefault();
        var changedTouches = e.changedTouches || [this.getWindowsPhoneTouchEvent(e)];
        for (var i = 0; i < changedTouches.length; i++) {
            var touch = changedTouches[i];
            if (this.leftTouchID == touch.identifier) {
                this.leftTouchPos = new Engine.Point(touch.clientX, touch.clientY);
                this.leftVector = new Engine.Point(touch.clientX, touch.clientY);
                this.leftVector.x -= this.leftTouchStartPos.x;
                this.leftVector.y -= this.leftTouchStartPos.y;
                break;
            }
        }
        this.touches = e.touches || this.touches;
    };
    Joystick.prototype.onTouchEnd = function (e) {
        this.touches = e.touches || this.touches;
        var changedTouches = e.changedTouches || [this.getWindowsPhoneEndTouchEvent(e)];
        for (var i = 0; i < changedTouches.length; i++) {
            var touch = changedTouches[i];
            if (this.leftTouchID == touch.identifier) {
                this.leftTouchID = -1;
                this.leftVector = new Engine.Point(0, 0);
                break;
            }
        }
    };
    return Joystick;
})();
//# sourceMappingURL=Joystick.js.map