var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Engine;
(function (Engine) {
    var Utilities = (function () {
        function Utilities() {
        }
        Utilities.collisionDetection = function (a, b) {
            return Utilities.intersect(a.position.x, a.position.y, a.size.width, a.size.height, b.position.x, b.position.y, b.size.width, b.size.height);
        };
        Utilities.isVisibleInCamera = function (cam, thg) {
            return Utilities.intersect(cam.viewPortPosition.x, cam.viewPortPosition.y, cam.viewPortSize.width, cam.viewPortSize.height, thg.position.x, thg.position.y, thg.size.width, thg.size.height);
        };
        Utilities.intersect = function (x1, y1, w1, h1, x2, y2, w2, h2) {
            return x1 <= (x2 + w2) && x2 <= (x1 + w1) && y1 <= (y2 + h2) && y2 <= (y1 + h1);
        };
        Utilities.calculateStep = function (from, to, delta) {
            if (from === to)
                return from;
            else if (from < to)
                return Math.min(from + delta, to);
            else
                return Math.max(from - delta, to);
        };
        Utilities.calculateDelta = function (ticks, speed) {
            return ticks / (100 - speed);
        };
        Utilities.moveThing = function (obj, target, delta) {
            obj.position.x = Utilities.calculateStep(obj.position.x, target.x, delta);
            obj.position.y = Utilities.calculateStep(obj.position.y, target.y, delta);
        };
        Utilities.scaleThing = function (obj, target, delta) {
            obj.size.width = Utilities.calculateStep(obj.size.width, target.width, delta);
            obj.size.height = Utilities.calculateStep(obj.size.height, target.height, delta);
        };
        return Utilities;
    })();
    var NamedCollection = (function () {
        function NamedCollection() {
            this.clear();
        }
        Object.defineProperty(NamedCollection.prototype, "length", {
            get: function () {
                return this.getLength();
            },
            enumerable: true,
            configurable: true
        });
        NamedCollection.prototype.getLength = function () {
            return this.count;
        };
        NamedCollection.prototype.get = function (key) {
            return this.items[key];
        };
        NamedCollection.prototype.add = function (key, element) {
            if (!this.containsKey(key)) {
                this.count++;
            }
            this.items[key] = element;
        };
        NamedCollection.prototype.remove = function (key) {
            if (this.containsKey(key)) {
                delete this.items[key];
                this.count--;
            }
        };
        NamedCollection.prototype.containsKey = function (key) {
            return (typeof this.items[key]) !== 'undefined';
        };
        NamedCollection.prototype.clear = function () {
            this.items = {};
            this.count = 0;
        };
        NamedCollection.prototype.forEach = function (callback) {
            for (var name in this.items) {
                if (this.items.hasOwnProperty(name)) {
                    var element = this.items[name];
                    var ret = callback(name, element);
                    if (ret === false) {
                        return;
                    }
                }
            }
        };
        return NamedCollection;
    })();
    Engine.NamedCollection = NamedCollection;
    var Point = (function () {
        function Point(x, y) {
            this.x = x || 0;
            this.y = y || 0;
        }
        return Point;
    })();
    Engine.Point = Point;
    var Size = (function () {
        function Size(width, height) {
            this.width = width;
            this.height = height;
        }
        return Size;
    })();
    Engine.Size = Size;
    var Resources = (function () {
        function Resources() {
            this.images = new NamedCollection();
            this.audios = new NamedCollection();
            this.filesLoaded = 0;
            this.filesToLoad = 0;
            this.onlyOneAudio = false;
        }
        Resources.prototype.loadImage = function (id, imageSource) {
            var _this = this;
            this.filesToLoad++;
            var image = document.createElement("img");
            var img = new Image();
            img.onload = function (ev) {
                image.width = img.width;
                image.height = img.height;
                image.innerImage = img;
                _this.filesLoaded++;
            };
            image.src = imageSource;
            img.src = imageSource;
            this.images.add(id, image);
        };
        Resources.prototype.loadAudio = function (id, audioSource) {
            var _this = this;
            this.filesToLoad++;
            var audio = document.createElement("audio");
            audio.preload = "auto";
            audio.onload = function (ev) {
                _this.filesLoaded++;
            }; // It doesn't works!
            audio.addEventListener('canplaythrough', function (ev) {
                _this.filesLoaded++;
            }, false); // It works!!
            audio.src = audioSource;
            this.audios.add(id, audio);
        };
        Resources.prototype.playAudio = function (id) {
            try {
                if (this.onlyOneAudio && this.lastAudio) {
                    try {
                        this.lastAudio.pause();
                    }
                    catch (ex) {
                    }
                }
                var audio = this.audios.get(id);
                audio.currentTime = 0;
                audio.play();
                if (this.onlyOneAudio)
                    this.lastAudio = audio;
            }
            catch (ex) {
            }
        };
        Resources.prototype.playAudioLoop = function (id) {
            try {
                var audio = this.audios.get(id);
                audio.loop = true;
                audio.currentTime = 0;
                audio.play();
            }
            catch (ex) {
            }
        };
        Resources.prototype.stopAudioLoop = function (id) {
            try {
                var audio = this.audios.get(id);
                audio.loop = false;
                audio.pause();
            }
            catch (ex) {
            }
        };
        Resources.prototype.preload = function (onPreloaded) {
            var _this = this;
            if (this.filesLoaded === this.filesToLoad) {
                onPreloaded();
            }
            else {
                setTimeout(function () {
                    _this.preload(onPreloaded);
                }, 200);
            }
        };
        return Resources;
    })();
    Engine.Resources = Resources;
    var UpdateContext = (function () {
        function UpdateContext(ticks, fps, screen, resources) {
            this.ticks = ticks;
            this.fps = fps;
            this.screen = screen;
            this.resources = resources;
        }
        return UpdateContext;
    })();
    Engine.UpdateContext = UpdateContext;
    var Thing = (function () {
        function Thing(id, position, size) {
            this.id = id;
            this.position = position || new Point(0, 0);
            this.size = size || new Size(0, 0);
        }
        Thing.prototype.update = function (context) {
        };
        return Thing;
    })();
    Engine.Thing = Thing;
    var SolidThing = (function (_super) {
        __extends(SolidThing, _super);
        function SolidThing() {
            _super.apply(this, arguments);
        }
        SolidThing.prototype.collision = function (obj) {
            return Utilities.collisionDetection(this, obj);
        };
        return SolidThing;
    })(Thing);
    Engine.SolidThing = SolidThing;
    var MovableThing = (function (_super) {
        __extends(MovableThing, _super);
        function MovableThing() {
            _super.apply(this, arguments);
        }
        MovableThing.prototype.move = function (position, onMoved) {
            if (onMoved === void 0) { onMoved = null; }
            this.targetPosition = position;
            this.moveCallback = onMoved;
        };
        MovableThing.prototype.update = function (context) {
            _super.prototype.update.call(this, context);
            var delta = Utilities.calculateDelta(context.ticks, this.speed);
            if (this.targetPosition) {
                Utilities.moveThing(this, this.targetPosition, delta);
                if (this.targetPosition.x === this.position.x && this.targetPosition.y === this.position.y) {
                    this.targetPosition = null;
                    if (this.moveCallback) {
                        this.moveCallback();
                        this.moveCallback = null;
                    }
                }
            }
        };
        return MovableThing;
    })(Thing);
    Engine.MovableThing = MovableThing;
    var ScalableThing = (function (_super) {
        __extends(ScalableThing, _super);
        function ScalableThing() {
            _super.apply(this, arguments);
        }
        ScalableThing.prototype.scale = function (size, onScaled) {
            if (onScaled === void 0) { onScaled = null; }
            this.targetSize = size;
            this.scaleCallback = onScaled;
        };
        ScalableThing.prototype.update = function (context) {
            _super.prototype.update.call(this, context);
            var delta = Utilities.calculateDelta(context.ticks, this.speed);
            if (this.targetSize) {
                Utilities.scaleThing(this, this.targetSize, delta);
                if (this.targetSize.width === this.size.width && this.targetSize.height === this.size.height) {
                    this.targetSize = null;
                    if (this.scaleCallback) {
                        this.scaleCallback();
                        this.scaleCallback = null;
                    }
                }
            }
        };
        return ScalableThing;
    })(Thing);
    Engine.ScalableThing = ScalableThing;
    var ScalableMovableThing = (function (_super) {
        __extends(ScalableMovableThing, _super);
        function ScalableMovableThing() {
            _super.apply(this, arguments);
        }
        ScalableMovableThing.prototype.move = function (position, onMoved) {
            if (onMoved === void 0) { onMoved = null; }
            this.targetPosition = position;
            this.moveCallback = onMoved;
        };
        ScalableMovableThing.prototype.scale = function (size, onScaled) {
            if (onScaled === void 0) { onScaled = null; }
            this.targetSize = size;
            this.scaleCallback = onScaled;
        };
        ScalableMovableThing.prototype.update = function (context) {
            _super.prototype.update.call(this, context);
            var delta = Utilities.calculateDelta(context.ticks, this.speed);
            if (this.targetPosition) {
                Utilities.moveThing(this, this.targetPosition, delta);
                if (this.targetPosition.x === this.position.x && this.targetPosition.y === this.position.y) {
                    this.targetPosition = null;
                    if (this.moveCallback) {
                        this.moveCallback();
                        this.moveCallback = null;
                    }
                }
            }
            if (this.targetSize) {
                Utilities.scaleThing(this, this.targetSize, delta);
                if (this.targetSize.width === this.size.width && this.targetSize.height === this.size.height) {
                    this.targetSize = null;
                    if (this.scaleCallback) {
                        this.scaleCallback();
                        this.scaleCallback = null;
                    }
                }
            }
        };
        return ScalableMovableThing;
    })(Thing);
    Engine.ScalableMovableThing = ScalableMovableThing;
    var SolidScalableMovableThing = (function (_super) {
        __extends(SolidScalableMovableThing, _super);
        function SolidScalableMovableThing() {
            _super.apply(this, arguments);
        }
        SolidScalableMovableThing.prototype.collision = function (obj) {
            return Utilities.collisionDetection(this, obj);
        };
        return SolidScalableMovableThing;
    })(ScalableMovableThing);
    Engine.SolidScalableMovableThing = SolidScalableMovableThing;
    var Camera = (function (_super) {
        __extends(Camera, _super);
        function Camera(id, position, size, vpPosition, vpSize) {
            _super.call(this, id, position, size);
            this.viewPortPosition = vpPosition || new Point(0, 0);
            this.viewPortSize = vpSize || new Size(0, 0);
            this.scale = 1.0;
        }
        Camera.prototype.draw = function (graphics, drawables) {
            for (var i = 0; i < drawables.length; i++) {
                if (Utilities.isVisibleInCamera(this, drawables[i])) {
                    if (drawables[i].draw) {
                        var drawable = drawables[i];
                        drawable.draw(graphics, this);
                    }
                }
            }
        };
        return Camera;
    })(MovableThing);
    Engine.Camera = Camera;
    var StaticColorAnimation = (function () {
        function StaticColorAnimation(id, color) {
            this.id = id;
            this.color = color;
            this.frameIndex = 0;
            this.frameCount = 1;
        }
        StaticColorAnimation.prototype.update = function (context) {
        };
        StaticColorAnimation.prototype.draw = function (graphics, position, size) {
            graphics.save();
            graphics.fillStyle = this.color;
            graphics.fillRect(position.x, position.y, size.width, size.height);
            graphics.restore();
        };
        return StaticColorAnimation;
    })();
    Engine.StaticColorAnimation = StaticColorAnimation;
    var StaticImageAnimation = (function () {
        function StaticImageAnimation(id, image) {
            this.id = id;
            this.image = image;
            this.frameIndex = 0;
            this.frameCount = 1;
        }
        StaticImageAnimation.prototype.update = function (context) {
        };
        StaticImageAnimation.prototype.draw = function (graphics, position, size) {
            this.internalDraw(graphics, this.image, position, size);
        };
        StaticImageAnimation.prototype.internalDraw = function (graphics, image, position, size) {
            graphics.drawImage(image, 0, 0, image.width, image.height, position.x, position.y, size.width, size.height);
        };
        return StaticImageAnimation;
    })();
    Engine.StaticImageAnimation = StaticImageAnimation;
    var ImageSheetAnimation = (function (_super) {
        __extends(ImageSheetAnimation, _super);
        function ImageSheetAnimation(id, image, frameCount, loop, isVertical) {
            _super.call(this, id, image);
            this.frameCount = frameCount;
            this.loop = (typeof loop === 'undefined') ? true : loop;
            this.isVertical = (typeof isVertical === 'undefined') ? true : isVertical;
            this.speed = 50;
            this.ticks = 0;
            this.hasEnd = false;
            var w = this.isVertical ? image.width : image.width / this.frameCount;
            var h = !this.isVertical ? image.height : image.height / this.frameCount;
            this.imageSize = new Size(w, h);
        }
        ImageSheetAnimation.prototype.update = function (context) {
            _super.prototype.update.call(this, context);
            this.ticks += context.ticks;
            if (this.ticks / (100 - this.speed) >= 1) {
                this.ticks = 0;
                if (this.frameIndex < this.frameCount - 1) {
                    this.frameIndex += 1;
                }
                else if (this.loop) {
                    this.frameIndex = 0;
                }
                else {
                    this.hasEnd = true;
                }
            }
        };
        ImageSheetAnimation.prototype.internalDraw = function (graphics, image, position, size) {
            var x = this.isVertical ? 0 : this.imageSize.width * this.frameIndex;
            var y = !this.isVertical ? 0 : this.imageSize.height * this.frameIndex;
            graphics.drawImage(image, x, y, this.imageSize.width, this.imageSize.height, position.x, position.y, size.width, size.height);
        };
        return ImageSheetAnimation;
    })(StaticImageAnimation);
    Engine.ImageSheetAnimation = ImageSheetAnimation;
    var ContinuousImageAnimation = (function (_super) {
        __extends(ContinuousImageAnimation, _super);
        function ContinuousImageAnimation(id, image) {
            _super.call(this, id, image);
            this.speed = 50;
            this.offset = 0;
            var w = image.width;
            var h = image.height;
            this.imageSize = new Size(w, h);
        }
        ContinuousImageAnimation.prototype.update = function (context) {
            _super.prototype.update.call(this, context);
            var delta = context.ticks / (100 - this.speed);
            this.offset += delta;
            if (this.offset > this.imageSize.width) {
                this.offset = 0;
            }
        };
        ContinuousImageAnimation.prototype.internalDraw = function (graphics, image, position, size) {
            if ((this.imageSize.width - this.offset) < size.width) {
                var offsetA = this.imageSize.width - this.offset;
                var offsetB = this.imageSize.width - offsetA;
                graphics.drawImage(image, this.offset, 0, offsetA, size.height, position.x, position.y, offsetA, size.height);
                graphics.drawImage(image, 0, 0, offsetB, size.height, offsetA, 0, offsetB, size.height);
            }
            else {
                graphics.drawImage(image, this.offset, 0, size.width, size.height, position.x, position.y, size.width, size.height);
            }
        };
        return ContinuousImageAnimation;
    })(StaticImageAnimation);
    Engine.ContinuousImageAnimation = ContinuousImageAnimation;
    var TextAnimation = (function () {
        function TextAnimation(id, text, color, font) {
            this.id = id;
            this.frameCount = 0;
            this.frameIndex = 0;
            this.text = text;
            this.font = font;
            this.color = color;
        }
        TextAnimation.prototype.update = function (context) {
        };
        TextAnimation.prototype.draw = function (graphics, position, size) {
            graphics.save();
            if (this.font)
                graphics.font = this.font;
            graphics.fillStyle = this.color;
            graphics.fillText(this.text, position.x, position.y);
            graphics.restore();
        };
        return TextAnimation;
    })();
    Engine.TextAnimation = TextAnimation;
    var FadeAnimation = (function () {
        function FadeAnimation(id, color, out) {
            if (out === void 0) { out = false; }
            this.color = color;
            this.out = out;
            this.id = id;
            this.frameCount = 0;
            this.frameIndex = 0;
            this.color = color;
            this.alpha = out ? 0 : 1;
            this.speed = 50;
            this.ticks = 0;
        }
        FadeAnimation.prototype.update = function (context) {
            if ((!this.out && this.alpha <= 0) || (this.out && this.alpha >= 1))
                return;
            this.ticks += context.ticks;
            if (this.ticks / (100 - this.speed) >= 1) {
                this.ticks = 0;
                this.alpha += this.out ? 0.1 : -0.1;
                if (!this.out && this.alpha <= 0)
                    this.alpha = 0;
                if (this.out && this.alpha >= 1)
                    this.alpha = 1;
                if ((this.alpha === 0 || this.alpha === 1) && this.onEnd)
                    this.onEnd();
            }
        };
        FadeAnimation.prototype.draw = function (graphics, position, size) {
            graphics.save();
            graphics.globalAlpha = this.alpha;
            graphics.fillStyle = this.color;
            graphics.fillRect(position.x, position.y, size.width, size.height);
            graphics.restore();
        };
        return FadeAnimation;
    })();
    var FadeInAnimation = (function (_super) {
        __extends(FadeInAnimation, _super);
        function FadeInAnimation(id, color) {
            _super.call(this, id, color, false);
        }
        return FadeInAnimation;
    })(FadeAnimation);
    Engine.FadeInAnimation = FadeInAnimation;
    var FadeOutAnimation = (function (_super) {
        __extends(FadeOutAnimation, _super);
        function FadeOutAnimation(id, color) {
            _super.call(this, id, color, true);
        }
        return FadeOutAnimation;
    })(FadeAnimation);
    Engine.FadeOutAnimation = FadeOutAnimation;
    var AnimationCollection = (function (_super) {
        __extends(AnimationCollection, _super);
        function AnimationCollection() {
            _super.apply(this, arguments);
        }
        return AnimationCollection;
    })(NamedCollection);
    Engine.AnimationCollection = AnimationCollection;
    var Sprite = (function (_super) {
        __extends(Sprite, _super);
        function Sprite(id) {
            var _this = this;
            var animations = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                animations[_i - 1] = arguments[_i];
            }
            _super.call(this, id);
            this.animations = new AnimationCollection();
            animations = animations || [];
            animations.forEach(function (animation) {
                _this.animations.add(animation.id, animation);
            });
            if (animations.length >= 1) {
                this.currentKey = animations[0].id;
            }
        }
        Object.defineProperty(Sprite.prototype, "currentAnimationKey", {
            get: function () {
                return this.currentKey;
            },
            set: function (key) {
                this.currentKey = key;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "currentAnimation", {
            get: function () {
                return this.animations.get(this.currentKey);
            },
            enumerable: true,
            configurable: true
        });
        Sprite.prototype.update = function (context) {
            _super.prototype.update.call(this, context);
            var currentAnimation = this.currentAnimation;
            if (currentAnimation) {
                currentAnimation.update(context);
            }
        };
        Sprite.prototype.draw = function (graphics, camera) {
            var currentAnimation = this.currentAnimation;
            if (currentAnimation) {
                var x = (this.position.x + camera.position.x - camera.viewPortPosition.x) * camera.scale;
                var y = (this.position.y + camera.position.y - camera.viewPortPosition.y) * camera.scale;
                var w = this.size.width * camera.scale;
                var h = this.size.height * camera.scale;
                currentAnimation.draw(graphics, new Point(x, y), new Size(w, h));
            }
        };
        return Sprite;
    })(SolidScalableMovableThing);
    Engine.Sprite = Sprite;
    var Scenario = (function () {
        function Scenario(canvas) {
            this.canvas = canvas;
            this.graphics = canvas.getContext('2d');
            this.things = [];
            this.cameras = [new Camera('default', new Point(0, 0), new Size(canvas.width, canvas.height), new Point(0, 0), new Size(canvas.width, canvas.height))];
            this.resources = new Resources();
        }
        Scenario.prototype.isRunning = function () {
            return !!this.interval;
        };
        Scenario.prototype.start = function (framesPerSecond) {
            var _this = this;
            if (this.interval)
                this.stop();
            this.fps = framesPerSecond;
            this.lastTime = Date.now();
            this.interval = setInterval(function () { return _this.update(); }, 1000 / framesPerSecond);
        };
        Scenario.prototype.stop = function () {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        };
        Scenario.prototype.update = function (ticks) {
            if (!ticks) {
                var now = Date.now();
                var m = now - this.lastTime;
                m = m <= 0 ? 1 : m;
                this.lastTime = now;
                this.update(m);
            }
            else {
                this.graphics.fillStyle = '#fff';
                this.graphics.fillRect(0, 0, this.canvas.width, this.canvas.height);
                var context = new UpdateContext(ticks, this.fps, new Size(this.canvas.width, this.canvas.height), this.resources);
                this.updateElements(context);
            }
        };
        Scenario.prototype.updateElements = function (context) {
            var _this = this;
            this.things.forEach(function (sprite) {
                sprite.update(context);
            });
            this.cameras.forEach(function (camera) {
                camera.update(context);
                camera.draw(_this.graphics, _this.things);
            });
        };
        return Scenario;
    })();
    Engine.Scenario = Scenario;
})(Engine || (Engine = {}));
//# sourceMappingURL=Engine.js.map