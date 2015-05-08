///<reference path='Engine.ts'/>
var KeyboardPad = (function () {
    function KeyboardPad() {
        var _this = this;
        this.keyDownEventHandler = function (ev) {
            _this.onKeyDown(ev);
        };
        this.keyUpEventHandler = function (ev) {
            _this.onKeyUp(ev);
        };
        this.up = false;
        this.down = false;
        this.left = false;
        this.rigth = false;
        this.space = false;
    }
    KeyboardPad.prototype.start = function () {
        document.addEventListener('keydown', this.keyDownEventHandler, true);
        document.addEventListener('keyup', this.keyUpEventHandler, true);
    };
    KeyboardPad.prototype.stop = function () {
        document.removeEventListener('keydown', this.keyDownEventHandler, true);
        document.removeEventListener('keyup', this.keyUpEventHandler, true);
    };
    KeyboardPad.prototype.onKeyDown = function (ev) {
        ev.preventDefault();
        if (ev.keyCode === 38) {
            this.up = true;
        }
        else if (ev.keyCode === 40) {
            this.down = true;
        }
        else if (ev.keyCode === 39) {
            this.rigth = true;
        }
        else if (ev.keyCode === 37) {
            this.left = true;
        }
        else if (ev.keyCode === 32) {
            if (!this.space) {
                if (this.onfire) {
                    this.onfire();
                }
            }
            this.space = true;
        }
        return false;
    };
    KeyboardPad.prototype.onKeyUp = function (ev) {
        ev.preventDefault();
        if (ev.keyCode === 38) {
            this.up = false;
        }
        else if (ev.keyCode === 40) {
            this.down = false;
        }
        else if (ev.keyCode === 39) {
            this.rigth = false;
        }
        else if (ev.keyCode === 37) {
            this.left = false;
        }
        else if (ev.keyCode === 32) {
            this.space = false;
        }
        return false;
    };
    return KeyboardPad;
})();
var TouchJoystick = (function () {
    function TouchJoystick(canvas, joystick) {
        var _this = this;
        if (joystick === void 0) { joystick = true; }
        this.up = false;
        this.down = false;
        this.left = false;
        this.rigth = false;
        this.position = new Engine.Point(0, 0);
        this.size = new Engine.Size(canvas.width, canvas.height);
        this.halfWidth = joystick ? canvas.width / 2 : 0;
        this.activeTouchID = -1;
        this.leftTouchID = -1;
        this.leftTouchPos = new Engine.Point(0, 0);
        this.leftTouchStartPos = new Engine.Point(0, 0);
        this.leftVector = new Engine.Point(0, 0);
        this.touches = [];
        this.canvas = canvas;
        this.touchStartEventHandler = function (e) { return _this.onTouchStart(e); };
        this.touchMoveEventHandler = function (e) { return _this.onTouchMove(e); };
        this.touchEndEventHandler = function (e) { return _this.onTouchEnd(e); };
    }
    TouchJoystick.prototype.start = function () {
        if (window.navigator.msPointerEnabled) {
            this.canvas.addEventListener("MSPointerDown", this.touchStartEventHandler, false);
            this.canvas.addEventListener("MSPointerMove", this.touchMoveEventHandler, false);
            this.canvas.addEventListener("MSPointerUp", this.touchEndEventHandler, false);
        }
        this.canvas.addEventListener('touchstart', this.touchStartEventHandler, false);
        this.canvas.addEventListener('touchmove', this.touchMoveEventHandler, false);
        this.canvas.addEventListener('touchend', this.touchEndEventHandler, false);
    };
    TouchJoystick.prototype.stop = function () {
        if (window.navigator.msPointerEnabled) {
            this.canvas.removeEventListener("MSPointerDown", this.touchStartEventHandler, false);
            this.canvas.removeEventListener("MSPointerMove", this.touchMoveEventHandler, false);
            this.canvas.removeEventListener("MSPointerUp", this.touchEndEventHandler, false);
        }
        this.canvas.removeEventListener('touchstart', this.touchStartEventHandler, false);
        this.canvas.removeEventListener('touchmove', this.touchMoveEventHandler, false);
        this.canvas.removeEventListener('touchend', this.touchEndEventHandler, false);
    };
    TouchJoystick.prototype.update = function (context) {
        this.up = Math.abs(this.leftVector.y) >= 10 && this.leftVector.y < 0;
        this.down = Math.abs(this.leftVector.y) >= 10 && this.leftVector.y > 0;
        this.left = Math.abs(this.leftVector.x) >= 10 && this.leftVector.x < 0;
        this.rigth = Math.abs(this.leftVector.x) >= 10 && this.leftVector.x > 0;
    };
    TouchJoystick.prototype.draw = function (graphics) {
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
    TouchJoystick.prototype.getWindowsPhoneTouchEvent = function (e) {
        return {
            identifier: e.pointerId,
            clientX: e.clientX,
            clientY: e.clientY
        };
    };
    TouchJoystick.prototype.getWindowsPhoneStartTouchEvent = function (e) {
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
    TouchJoystick.prototype.getWindowsPhoneEndTouchEvent = function (e) {
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
    TouchJoystick.prototype.onTouchStart = function (e) {
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
            if (this.onfire) {
                this.position = new Engine.Point(touch.clientX, touch.clientY);
                this.size = new Engine.Size(1, 1);
                this.activeTouchID = touch.identifier;
                this.onfire();
            }
        }
        this.touches = e.touches || this.touches;
    };
    TouchJoystick.prototype.onTouchMove = function (e) {
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
    TouchJoystick.prototype.onTouchEnd = function (e) {
        this.touches = e.touches || this.touches;
        var changedTouches = e.changedTouches || [this.getWindowsPhoneEndTouchEvent(e)];
        for (var i = 0; i < changedTouches.length; i++) {
            var touch = changedTouches[i];
            if (this.leftTouchID === touch.identifier) {
                this.leftTouchID = -1;
                this.leftVector = new Engine.Point(0, 0);
            }
            if (this.activeTouchID === touch.identifier) {
                this.activeTouchID = -1;
                this.position = new Engine.Point(0, 0);
                this.size = new Engine.Size(0, 0);
            }
        }
    };
    return TouchJoystick;
})();
//# sourceMappingURL=Controllers.js.map