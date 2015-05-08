///<reference path='Engine.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Shadow = (function () {
    function Shadow() {
    }
    return Shadow;
})();
var Utilities = (function () {
    function Utilities() {
    }
    Utilities.createShadow = function (color) {
        var shadows = [];
        Utilities.neonShadows.forEach(function (shadow, index) {
            shadows.push({ blur: shadow.blur, color: shadow.color ? shadow.color : color });
        });
        return shadows;
    };
    Utilities.neonShadows = [
        { blur: 40, color: '' },
        { blur: 20, color: '' },
        { blur: 80, color: '' },
        { blur: 100, color: '' },
        { blur: 200, color: '' }
    ];
    return Utilities;
})();
var ParanoidTextAnimation = (function (_super) {
    __extends(ParanoidTextAnimation, _super);
    function ParanoidTextAnimation(id, text, color, font) {
        _super.call(this, id, text, color, font);
        this.jilterCount = 3;
        this.jilterSize = 10;
        this.countDelta = 0;
        this.shadows = Utilities.createShadow(color);
    }
    ParanoidTextAnimation.prototype.update = function (context) {
        _super.prototype.update.call(this, context);
        this.countDelta += context.ticks / (100 - this.speed);
        if (this.countDelta > 5 || !this.jilterX || !this.jilterY) {
            this.countDelta = 0;
            this.jilterX = [];
            this.jilterY = [];
            for (var i = 0; i < this.jilterCount; i++) {
                this.jilterX.push(this.jilterSize / 2 - Math.random() * this.jilterSize);
                this.jilterY.push(this.jilterSize / 2 - Math.random() * this.jilterSize);
            }
        }
    };
    ParanoidTextAnimation.prototype.draw = function (graphics, position, size) {
        var offsetX = this.jilterSize;
        var offsetY = this.jilterSize;
        var blur = 100;
        graphics.save();
        if (this.font)
            graphics.font = this.font;
        graphics.fillStyle = "#fff";
        if (Math.random() * 2 > 1 && this.countDelta == 0) {
            offsetX += this.jilterSize / 2 - Math.random() * this.jilterSize;
            offsetY += this.jilterSize / 2 - Math.random() * this.jilterSize;
        }
        for (var i = 0; i < this.shadows.length; i++) {
            graphics.shadowColor = this.shadows[i].color;
            graphics.shadowOffsetX = 0;
            graphics.shadowOffsetY = 0;
            graphics.shadowBlur = this.shadows[i].blur;
            graphics.fillText(this.text, offsetX + position.x, offsetY + position.y + parseInt(graphics.font));
        }
        graphics.lineWidth = 0.80;
        graphics.strokeStyle = "rgba(255,255,255,0.25)";
        var i = this.jilterCount;
        while (i--) {
            var left = this.jilterX[i];
            var top = this.jilterY[i];
            graphics.strokeText(this.text, left + offsetX + position.x, top + offsetY + position.y + parseInt(graphics.font));
        }
        graphics.restore();
    };
    return ParanoidTextAnimation;
})(Engine.TextAnimation);
var NeonImageAnimation = (function (_super) {
    __extends(NeonImageAnimation, _super);
    function NeonImageAnimation(id, color, image) {
        _super.call(this, id, image);
        this.offsetX = 0;
        this.offsetY = 0;
        this.shadows = Utilities.createShadow(color);
        this.countDelta = 0;
        this.jilterSize = 10;
    }
    NeonImageAnimation.prototype.update = function (context) {
        _super.prototype.update.call(this, context);
        this.countDelta += context.ticks / (100 - this.speed);
        if (this.countDelta > 5) {
            this.countDelta = 0;
        }
    };
    NeonImageAnimation.prototype.internalDraw = function (graphics, image, position, size) {
        graphics.fillStyle = "#fff";
        if (Math.random() * 4 > 3)
            if (this.countDelta == 0) {
                this.offsetX += this.jilterSize / 2 - Math.random() * this.jilterSize;
                this.offsetY += this.jilterSize / 2 - Math.random() * this.jilterSize;
            }
            else {
                this.offsetX = 0;
                this.offsetY = 0;
            }
        for (var i = 0; i < this.shadows.length; i++) {
            graphics.shadowColor = this.shadows[i].color;
            graphics.shadowOffsetX = 0;
            graphics.shadowOffsetY = 0;
            graphics.shadowBlur = this.shadows[i].blur;
            graphics.drawImage(image, 0, 0, image.width, image.height, position.x + this.offsetX, position.y + this.offsetY, size.width, size.height);
        }
        graphics.restore();
    };
    return NeonImageAnimation;
})(Engine.StaticImageAnimation);
//# sourceMappingURL=Neon.js.map