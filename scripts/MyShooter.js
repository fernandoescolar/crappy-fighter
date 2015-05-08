///<reference path='Engine.ts'/>
///<reference path='Shooter.ts'/>
///<reference path='Controllers.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var MyStartScene = (function (_super) {
    __extends(MyStartScene, _super);
    function MyStartScene(canvas) {
        var _this = this;
        _super.call(this, canvas, new TouchJoystick(canvas, false));
        this.resources.loadImage('background', 'images/background.sketch.png');
        this.resources.loadAudio('background-music', 'sound/acapella-start.mp3');
        this.resources.preload(function () {
            _this.createScene();
            _this.start(60);
        });
    }
    MyStartScene.prototype.createScene = function () {
        var _this = this;
        var transitionAnimation = new Engine.FadeInAnimation('transition', '#000000');
        var transitionSprite = new Engine.Sprite('transition', transitionAnimation);
        transitionSprite.position.x = 0;
        transitionSprite.position.y = 0;
        transitionSprite.size.width = this.width;
        transitionSprite.size.height = this.height;
        var bgAnimation = new Engine.StaticImageAnimation('background', this.resources.images.get('background'));
        var bgSprite = new Engine.Sprite('background', bgAnimation);
        bgSprite.position.x = 0;
        bgSprite.position.y = 0;
        bgSprite.size.width = this.width;
        bgSprite.size.height = this.height;
        var animation = new Engine.TextAnimation("title", "Crappy Fighter", "#000000", "90px Sketch");
        var sprite = new Engine.Sprite('title', animation);
        sprite.size.width = 550;
        sprite.size.height = 100;
        sprite.position.x = (this.width - sprite.size.width) / 2;
        sprite.position.y = -100;
        sprite.speed = 90;
        this.things.push(bgSprite);
        this.things.push(sprite);
        this.things.push(transitionSprite);
        transitionAnimation.onEnd = function () { return sprite.move(new Engine.Point((_this.width - sprite.size.width) / 2, (_this.height - sprite.size.height) / 2)); };
    };
    MyStartScene.prototype.ready = function () {
        var animation = new Engine.TextAnimation("title", "Touch screen to start", "#000000", "40px Sketch");
        var sprite = new Engine.Sprite('title', animation);
        sprite.size.width = 550;
        sprite.size.height = 100;
        sprite.position.x = (this.width - sprite.size.width) / 2;
        sprite.position.y = -100;
        sprite.speed = 90;
        this.things.push(sprite);
        sprite.move(new Engine.Point((this.width - sprite.size.width) / 2, (this.height - sprite.size.height) / 2 + 100));
    };
    MyStartScene.prototype.start = function (framesPerSecond) {
        _super.prototype.start.call(this, framesPerSecond);
        this.resources.playAudioLoop('background-music');
    };
    MyStartScene.prototype.stop = function () {
        _super.prototype.stop.call(this);
        this.resources.stopAudioLoop('background-music');
    };
    MyStartScene.prototype.startGame = function () {
        var _this = this;
        var transitionAnimation = new Engine.FadeOutAnimation('transition', '#000000');
        var transitionSprite = new Engine.Sprite('transition', transitionAnimation);
        transitionSprite.position.x = 0;
        transitionSprite.position.y = 0;
        transitionSprite.size.width = this.width;
        transitionSprite.size.height = this.height;
        this.things.push(transitionSprite);
        transitionAnimation.onEnd = function () {
            _super.prototype.startGame.call(_this);
            setTimeout(function () {
                var index = _this.things.indexOf(transitionSprite);
                _this.things.splice(index, 1);
            }, 500);
        };
    };
    return MyStartScene;
})(StartScene);
var MyShooterScenario = (function (_super) {
    __extends(MyShooterScenario, _super);
    function MyShooterScenario(canvas) {
        _super.call(this, canvas, new TouchJoystick(canvas));
        this.resources.loadImage('background', 'images/background.sketch.png');
        this.resources.loadImage('background-paralax', 'images/starfield.png');
        this.resources.loadImage('player', 'images/player.sketch.64x25.png');
        this.resources.loadImage('live', 'images/live.sketch.png');
        this.resources.loadImage('enemy-1', 'images/enemy.sketch.40x30.png');
        this.resources.loadImage('enemy-2', 'images/enemy.sketch.40x30.png');
        this.resources.loadImage('enemy-3', 'images/enemy.sketch.40x30.png');
        this.resources.loadImage('enemy-4', 'images/enemy.sketch.40x30.png');
        this.resources.loadImage('shot', 'images/shot.sketch.png');
        this.resources.loadImage('enemy-shot', 'images/enemy-shot.sketch.png');
        this.resources.loadImage('explosion-enemy', 'images/explosion-enemy.sketch.png');
        this.resources.loadImage('explosion-enemy-destroy', 'images/explosion-enemy-destroy.sketch.png');
        this.resources.loadImage('explosion-player', 'images/explosion-player.sketch.png');
        this.resources.loadImage('explosion-player-destroy', 'images/explosion-player-destroy.sketch.png');
        this.resources.loadAudio('background-music', 'sound/acapella-music.mp3');
        this.resources.loadAudio('laser', 'sound/acapella-shot.mp3');
        this.resources.loadAudio('enemy-laser', 'sound/acapella-enemy-shot.mp3');
        this.resources.loadAudio('explosion', 'sound/acapella-explosion.mp3');
        this.resources.loadAudio('touched', 'sound/acapella-touched.mp3');
        this.resources.loadAudio('gameover', 'sound/acapella-gameover.mp3');
    }
    MyShooterScenario.prototype.createBackgroundLayer = function (imgName, speed) {
        var animation = new Engine.ContinuousImageAnimation(imgName, this.resources.images.get(imgName));
        var sprite = new Engine.Sprite(imgName, animation);
        sprite.position.x = 0;
        sprite.position.y = 0;
        sprite.size.width = this.width;
        sprite.size.height = this.height;
        animation.speed = speed;
        return sprite;
    };
    MyShooterScenario.prototype.createBackground = function (speed) {
        var sprite = this.createBackgroundLayer("background", speed);
        this.things.push(sprite);
        return this.createBackgroundLayer('background-paralax', speed + 20);
    };
    MyShooterScenario.prototype.createScore = function () {
        var animation = new Engine.TextAnimation("score", "", "#000000", "30px Sketch");
        var score = new Engine.Sprite("score", animation);
        score.position.x = 10;
        score.position.y = 30;
        this.things.push(score);
        var joystick = this.pad;
        this.joyPad = joystick;
        this.things.push(this.joyPad);
        return animation;
    };
    MyShooterScenario.prototype.createPlayer = function (x, y) {
        var animation = new Engine.ImageSheetAnimation('player', this.resources.images.get('player'), 4);
        var player = new Player(this.pad, animation, 3, this.width, this.height);
        player.position.x = x || Math.random() * this.width;
        player.position.y = y || Math.random() * this.height;
        player.size.width = 64;
        player.size.height = 25;
        animation.speed = 60;
        return player;
    };
    MyShooterScenario.prototype.createPlayerLive = function () {
        var animation = new Engine.StaticImageAnimation('player-life', this.resources.images.get('live'));
        var sprite = new Engine.Sprite('player-life', animation);
        sprite.size = new Engine.Size(32, 16);
        return sprite;
    };
    MyShooterScenario.prototype.createEnemy = function () {
        var id = parseInt((Math.random() * 3).toFixed(0)) + 1;
        var animation = new Engine.ImageSheetAnimation('enemy', this.resources.images.get('enemy-' + id), 6);
        var sprite = new Enemy(animation, 1);
        sprite.size.width = 40;
        sprite.size.height = 30;
        animation.speed = Math.random() * 50 + 40;
        return sprite;
    };
    MyShooterScenario.prototype.createEnemyShot = function () {
        var animation = new Engine.ImageSheetAnimation('enemy-shoot', this.resources.images.get('enemy-shot'), 8);
        var sprite = new Enemy(animation, 3);
        sprite.size.width = 16;
        sprite.size.height = 16;
        animation.speed = 60;
        if (!this.resources.onlyOneAudio)
            this.resources.playAudio('enemy-laser');
        return sprite;
    };
    MyShooterScenario.prototype.createShot = function () {
        var animation = new Engine.ImageSheetAnimation('shot', this.resources.images.get('shot'), 4, true, true);
        var shot = new Shot(950, animation);
        shot.position.x = this.player.position.x + 60;
        shot.position.y = this.player.position.y + 7;
        shot.size.width = 16;
        shot.size.height = 16;
        this.resources.playAudio('laser');
        return shot;
    };
    MyShooterScenario.prototype.createExplosion = function (explosionType) {
        var sprite;
        if (explosionType === 2 /* Player */) {
            var animation = new Engine.ImageSheetAnimation('explosion', this.resources.images.get('explosion-player'), 4, false, true);
            sprite = new Engine.Sprite('explosion', animation);
            sprite.size.width = 16;
            sprite.size.height = 16;
            animation.speed = 50;
            this.resources.playAudio('touched');
        }
        if (explosionType === 3 /* PlayerDestroyed */) {
            var animation = new Engine.ImageSheetAnimation('explosion', this.resources.images.get('explosion-player-destroy'), 8, false, true);
            sprite = new Engine.Sprite('explosion', animation);
            sprite.size.width = 64;
            sprite.size.height = 20;
            animation.speed = 50;
            this.resources.playAudio('explosion');
        }
        if (explosionType === 0 /* Enemy */) {
            var animation = new Engine.ImageSheetAnimation('explosion', this.resources.images.get('explosion-enemy'), 4, false, true);
            sprite = new Engine.Sprite('explosion', animation);
            sprite.size.width = 16;
            sprite.size.height = 16;
            animation.speed = 50;
            this.resources.playAudio('touched');
        }
        if (explosionType === 1 /* EnemyDestroyed */) {
            var animation = new Engine.ImageSheetAnimation('explosion', this.resources.images.get('explosion-enemy-destroy'), 8, false, true);
            sprite = new Engine.Sprite('explosion', animation);
            sprite.size.width = 60;
            sprite.size.height = 60;
            animation.speed = 50;
            this.resources.playAudio('explosion');
        }
        return sprite;
    };
    MyShooterScenario.prototype.createGameover = function () {
        var animation = new Engine.TextAnimation("gameover", "GAME OVER", "#000000", "80px Sketch");
        var sprite = new Engine.Sprite('gameover', animation);
        sprite.size.width = 380;
        sprite.size.height = 80;
        sprite.position.x = (this.width - sprite.size.width) / 2;
        return sprite;
    };
    MyShooterScenario.prototype.deletePlayerLife = function (sprite, index) {
        var _this = this;
        this.playerLive.splice(index, 1);
        sprite.speed = 90;
        sprite.move(new Engine.Point(sprite.position.x - 16, sprite.position.y - 8));
        sprite.scale(new Engine.Size(64, 32), function () { return _this.deleteThing(sprite); });
    };
    MyShooterScenario.prototype.gameover = function () {
        this.deleteThing(this.joyPad);
        this.resources.stopAudioLoop('background-music');
        this.resources.playAudio('gameover');
        _super.prototype.gameover.call(this);
    };
    return MyShooterScenario;
})(ShooterScenario);
//# sourceMappingURL=MyShooter.js.map