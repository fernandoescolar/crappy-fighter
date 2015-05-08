///<reference path='Engine.ts'/>
///<reference path='Controllers.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var StartScene = (function (_super) {
    __extends(StartScene, _super);
    function StartScene(canvas, pad) {
        var _this = this;
        _super.call(this, canvas);
        this.pad = pad;
        this.width = canvas.width;
        this.height = canvas.height;
        setTimeout(function () {
            _this.pad.onfire = function () { return _this.startGame(); };
        }, 2000);
    }
    StartScene.prototype.start = function (framesPerSecond) {
        _super.prototype.start.call(this, framesPerSecond);
        this.pad.start();
    };
    StartScene.prototype.stop = function () {
        _super.prototype.stop.call(this);
        this.pad.stop();
    };
    StartScene.prototype.ready = function () {
    };
    StartScene.prototype.startGame = function () {
        this.stop();
        if (this.onStartGame)
            this.onStartGame();
    };
    return StartScene;
})(Engine.Scenario);
var ShooterScenario = (function (_super) {
    __extends(ShooterScenario, _super);
    function ShooterScenario(canvas, pad) {
        var _this = this;
        _super.call(this, canvas);
        this.width = canvas.width;
        this.height = canvas.height;
        this.pad = pad;
        this.pad.onfire = function () {
            _this.shoot();
        };
    }
    ShooterScenario.prototype.start = function (framesPerSecond) {
        var _this = this;
        _super.prototype.start.call(this, framesPerSecond);
        this.pad.start();
        this.playerLive = [];
        this.things = [];
        this.shots = [];
        this.enemies = [];
        this.explosions = [];
        this.enemyCounter = 0;
        this.score = 0;
        var bg = this.createBackground(30);
        if (bg)
            this.things.push(bg);
        this.scoreText = this.createScore();
        this.player = this.createPlayer(20, 100);
        if (this.player)
            this.things.push(this.player);
        for (var i = 0; i < this.player.livePoints; i++) {
            var liveBlock = this.createPlayerLive();
            liveBlock.position.x = 10 + liveBlock.size.width * i;
            liveBlock.position.y = this.height - liveBlock.size.height - 10;
            this.playerLive.push(liveBlock);
            this.things.push(liveBlock);
        }
        this.resources.playAudioLoop('background-music');
        this.score = 0;
        Shot.counter = 0;
        setTimeout(function () {
            _this.addEnemy();
        }, Math.random() * 2000);
    };
    ShooterScenario.prototype.stop = function () {
        _super.prototype.stop.call(this);
        this.pad.stop();
        this.resources.stopAudioLoop('background-music');
    };
    ShooterScenario.prototype.createBackground = function (speed) {
        return null;
    };
    ShooterScenario.prototype.createScore = function () {
        return null;
    };
    ShooterScenario.prototype.createPlayer = function (x, y) {
        return null;
    };
    ShooterScenario.prototype.createPlayerLive = function () {
        return null;
    };
    ShooterScenario.prototype.createEnemy = function () {
        return null;
    };
    ShooterScenario.prototype.createEnemyShot = function () {
        return null;
    };
    ShooterScenario.prototype.createShot = function () {
        return null;
    };
    ShooterScenario.prototype.createExplosion = function (explosionType) {
        return null;
    };
    ShooterScenario.prototype.createGameover = function () {
        return null;
    };
    ShooterScenario.prototype.addEnemy = function () {
        var _this = this;
        if (!this.isRunning())
            return;
        setTimeout(function () {
            _this.addEnemy();
        }, Math.random() * 3000);
        var enemy = this.createEnemy();
        if (enemy) {
            enemy.position.x = this.width + enemy.size.width;
            enemy.position.y = Math.random() * (this.height - enemy.size.height);
            enemy.speed = Math.random() * 50 + 40;
            this.enemies.push(enemy);
            this.things.push(enemy);
        }
    };
    ShooterScenario.prototype.enemyShot = function (enemy) {
        var enemyShot = this.createEnemyShot();
        enemyShot.position.x = enemy.position.x;
        enemyShot.position.y = enemy.position.y;
        enemyShot.speed = 95;
        enemyShot.id = '_#' + enemyShot.id;
        this.enemies.push(enemyShot);
        this.things.push(enemyShot);
    };
    ShooterScenario.prototype.shoot = function () {
        if (!this.isRunning()) {
            this.start(60);
            return;
        }
        var shot = this.createShot();
        if (shot) {
            this.shots.push(shot);
            this.things.push(shot);
        }
        this.score--;
    };
    ShooterScenario.prototype.explote = function (explosionType, x, y) {
        var sprite = this.createExplosion(explosionType);
        if (sprite) {
            sprite.position.x = x;
            sprite.position.y = y;
            this.explosions.push(sprite);
            this.things.push(sprite);
        }
    };
    ShooterScenario.prototype.gameover = function () {
        var _this = this;
        this.explote(3 /* PlayerDestroyed */, this.player.position.x, this.player.position.y);
        this.player.position.x = -1000;
        this.deleteThing(this.player);
        this.pad.stop();
        setTimeout(function () {
            var sprite = _this.createGameover();
            sprite.position.y = _this.height;
            sprite.move(new Engine.Point((_this.width - sprite.size.width) / 2, (_this.height - sprite.size.height) / 2));
            sprite.speed = 90;
            _this.things.push(sprite);
        }, 400);
        setTimeout(function () { return _this.stop(); }, 2000);
        setTimeout(function () {
            if (_this.onEndGame)
                _this.onEndGame();
        }, 5000);
    };
    ShooterScenario.prototype.deleteThing = function (obj) {
        var index = this.things.indexOf(obj);
        this.things.splice(index, 1);
    };
    ShooterScenario.prototype.deletePlayerLife = function (sprite, index) {
        this.playerLive.splice(index, 1);
        this.deleteThing(sprite);
    };
    ShooterScenario.prototype.deleteEnemy = function (enemy, index) {
        this.enemies.splice(index, 1);
        this.deleteThing(enemy);
    };
    ShooterScenario.prototype.deleteShot = function (shot, index) {
        this.shots.splice(index, 1);
        this.deleteThing(shot);
    };
    ShooterScenario.prototype.deleteExplosion = function (explosion, index) {
        this.explosions.splice(index, 1);
        this.deleteThing(explosion);
    };
    ShooterScenario.prototype.update = function (ticks) {
        this.updateGame();
        _super.prototype.update.call(this, ticks);
    };
    ShooterScenario.prototype.updateGame = function () {
        this.updateScore();
        this.updateCollisions();
        this.updateShots();
        this.updateEnemies();
        this.updateExplosions();
    };
    ShooterScenario.prototype.updateScore = function () {
        this.scoreText.text = "Score: " + (this.score < 0 ? 0 : this.score);
    };
    ShooterScenario.prototype.updateShots = function () {
        var _this = this;
        this.shots.forEach(function (shot, index) {
            if (shot.shouldDelete) {
                _this.deleteShot(shot, index);
            }
        });
    };
    ShooterScenario.prototype.updateExplosions = function () {
        var _this = this;
        this.explosions.forEach(function (explosion, index) {
            var sprite = explosion;
            var animation = sprite.currentAnimation;
            if (animation.hasEnd) {
                _this.deleteExplosion(explosion, index);
            }
        });
    };
    ShooterScenario.prototype.updateEnemies = function () {
        var _this = this;
        this.enemies.forEach(function (enemy, index) {
            if (enemy.shouldDelete) {
                _this.deleteEnemy(enemy, index);
            }
            else if (Math.random() * 100000 > 99900) {
                _this.enemyShot(enemy);
            }
        });
    };
    ShooterScenario.prototype.updateCollisions = function () {
        var _this = this;
        this.enemies.forEach(function (enemy, eindex) {
            if (enemy.shouldDelete)
                return true;
            if (_this.player.collision(enemy)) {
                _this.player.livePoints--;
                if (_this.playerLive.length > 0)
                    _this.deletePlayerLife(_this.playerLive[_this.playerLive.length - 1], _this.playerLive.length - 1);
                enemy.livePoints = 0;
                enemy.shouldDelete = true;
                _this.explote(2 /* Player */, enemy.position.x, enemy.position.y);
                if (_this.player.livePoints <= 0) {
                    _this.gameover();
                }
                else {
                    _this.score--;
                }
            }
            _this.shots.forEach(function (shot, sindex) {
                if (shot.collision(enemy) && !shot.shouldDelete) {
                    shot.shouldDelete = true;
                    enemy.livePoints--;
                    _this.explote(0 /* Enemy */, shot.position.x, shot.position.y);
                    if (enemy.livePoints <= 0) {
                        if (enemy.id.indexOf('_#') === 0)
                            _this.explote(0 /* Enemy */, enemy.position.x, enemy.position.y);
                        else
                            _this.explote(1 /* EnemyDestroyed */, enemy.position.x, enemy.position.y);
                        _this.score += 10;
                    }
                    else {
                        _this.score++;
                    }
                }
            });
        });
    };
    return ShooterScenario;
})(Engine.Scenario);
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(pad, animation, livePoints, maxWidth, maxHeight) {
        _super.call(this, "player", animation);
        this.pad = pad;
        this.livePoints = livePoints;
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
        this.speed = 95;
    }
    Player.prototype.update = function (context) {
        _super.prototype.update.call(this, context);
        this.updatePosition();
    };
    Player.prototype.updatePosition = function () {
        var x = this.position.x;
        var y = this.position.y;
        if (this.pad.up) {
            y -= 30;
        }
        if (this.pad.down) {
            y += 30;
        }
        if (this.pad.rigth) {
            x += 30;
        }
        if (this.pad.left) {
            x -= 30;
        }
        var w = this.maxWidth - this.size.width;
        var h = this.maxHeight - this.size.height;
        if (x < 0)
            x = 0;
        if (y < 0)
            y = 0;
        if (x > w)
            x = w;
        if (y > h)
            y = h;
        this.move(new Engine.Point(x, y));
    };
    return Player;
})(Engine.Sprite);
var Shot = (function (_super) {
    __extends(Shot, _super);
    function Shot(maxWidth, animation) {
        _super.call(this, "shoot-" + (Shot.counter++), animation);
        this.shouldDelete = false;
        this.speed = 100;
        this.maxWidth = maxWidth;
    }
    Shot.prototype.update = function (context) {
        this.updatePosition();
        _super.prototype.update.call(this, context);
    };
    Shot.prototype.updatePosition = function () {
        this.move(new Engine.Point(this.position.x + 30, this.position.y));
        if (this.position.x >= this.maxWidth) {
            this.shouldDelete = true;
        }
    };
    Shot.counter = 0;
    return Shot;
})(Engine.Sprite);
var Enemy = (function (_super) {
    __extends(Enemy, _super);
    function Enemy(animation, livePoints) {
        _super.call(this, "enemy-" + (Enemy.counter++), animation);
        this.livePoints = livePoints;
        this.livePoints = livePoints;
        this.shouldDelete = false;
    }
    Enemy.prototype.update = function (context) {
        this.updatePosition();
        _super.prototype.update.call(this, context);
    };
    Enemy.prototype.updatePosition = function () {
        this.move(new Engine.Point(this.position.x - Math.random() * 40, this.position.y));
        if (this.position.x < -this.size.width || this.livePoints <= 0) {
            this.shouldDelete = true;
        }
    };
    Enemy.counter = 0;
    return Enemy;
})(Engine.Sprite);
var ExplosionType;
(function (ExplosionType) {
    ExplosionType[ExplosionType["Enemy"] = 0] = "Enemy";
    ExplosionType[ExplosionType["EnemyDestroyed"] = 1] = "EnemyDestroyed";
    ExplosionType[ExplosionType["Player"] = 2] = "Player";
    ExplosionType[ExplosionType["PlayerDestroyed"] = 3] = "PlayerDestroyed";
})(ExplosionType || (ExplosionType = {}));
//# sourceMappingURL=Shooter.js.map