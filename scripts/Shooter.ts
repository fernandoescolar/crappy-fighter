///<reference path='Engine.ts'/>
///<reference path='Controllers.ts'/>

class StartScene extends Engine.Scenario {
    public width: number;
    public height: number;

    public onStartGame: () => void;

    constructor(canvas: HTMLCanvasElement, public pad: IPad) {
        super(canvas);

        this.width = canvas.width;
        this.height = canvas.height;

        setTimeout(() => {
            this.pad.onfire = () => this.startGame();
        }, 2000);
    }

    start(framesPerSecond: number): void {
        super.start(framesPerSecond);
        this.pad.start();
    }

    stop(): void {
        super.stop();
        this.pad.stop();
    }

    ready(): void {

    }

    startGame(): void {
        this.stop();
        if (this.onStartGame) this.onStartGame();
    }
}

class ShooterScenario extends Engine.Scenario {
    private scoreText: Engine.TextAnimation;
    private score: number;

    public onEndGame: () => void;

    public width: number;
    public height: number;
    public pad: IPad;
    public player: Player;
    public playerLive: Array<Engine.ISprite>;
    public shots: Array<Shot>;
    public enemies: Array<Enemy>;
    public explosions: Array<Engine.ISprite>;
    public enemyCounter: number;

    constructor(canvas: HTMLCanvasElement, pad: IPad) {
        super(canvas);

        this.width = canvas.width;
        this.height = canvas.height;

        this.pad = pad;
        this.pad.onfire = () => { this.shoot(); };
    }

    start(framesPerSecond: number): void {
        super.start(framesPerSecond);

        this.pad.start();
        this.playerLive = [];
        this.things = [];
        this.shots = [];
        this.enemies = [];
        this.explosions = [];
        this.enemyCounter = 0;
        this.score = 0;

        var bg = this.createBackground(30);
        if (bg) this.things.push(bg);

        this.scoreText = this.createScore();
        this.player = this.createPlayer(20, 100);
        if (this.player) this.things.push(this.player);

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

        setTimeout(() => { this.addEnemy(); }, Math.random() * 2000);
    }

    stop(): void {
        super.stop();
        this.pad.stop();
        this.resources.stopAudioLoop('background-music');
    }

    createBackground(speed: number): Engine.Sprite {
        return null;
    }

    createScore(): Engine.TextAnimation {
        return null;
    }

    createPlayer(x?: number, y?: number): Player {
        return null;
    }

    createPlayerLive(): Engine.ISprite {
        return null;
    }

    createEnemy(): Enemy {
        return null;
    }

    createEnemyShot(): Enemy {
        return null;
    }

    createShot(): Shot {
        return null;
    }

    createExplosion(explosionType: ExplosionType): Engine.Sprite {
        return null;
    }

    createGameover(): Engine.Sprite {
        return null;
    }

    addEnemy(): void {
        if (!this.isRunning()) return;

        setTimeout(() => { this.addEnemy(); }, Math.random() * 3000);
        var enemy = this.createEnemy();
        if (enemy) {
            enemy.position.x = this.width + enemy.size.width;
            enemy.position.y = Math.random() * (this.height - enemy.size.height);

            enemy.speed = Math.random() * 50 + 40;

            this.enemies.push(enemy);
            this.things.push(enemy);
        }
    }

    enemyShot(enemy: Enemy): void {
        var enemyShot = this.createEnemyShot();
        enemyShot.position.x = enemy.position.x;
        enemyShot.position.y = enemy.position.y;
        enemyShot.speed = 95;
        enemyShot.id = '_#' + enemyShot.id;

        this.enemies.push(enemyShot);
        this.things.push(enemyShot);
    }

    shoot(): void {
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
    }

    explote(explosionType: ExplosionType, x: number, y: number) {
        var sprite = this.createExplosion(explosionType);
        if (sprite) {
            sprite.position.x = x;
            sprite.position.y = y;

            this.explosions.push(sprite);
            this.things.push(sprite);
        }
    }

    gameover(): void {
        this.explote(ExplosionType.PlayerDestroyed, this.player.position.x, this.player.position.y);
        this.player.position.x = -1000;
        this.deleteThing(this.player);
        this.pad.stop();

        setTimeout(() => {
            var sprite = this.createGameover();
            sprite.position.y = this.height;
            sprite.move(new Engine.Point((this.width - sprite.size.width) / 2, (this.height - sprite.size.height) / 2));
            sprite.speed = 90;
            this.things.push(sprite);
        }, 400);
        setTimeout(() => this.stop(), 2000);
        setTimeout(() => { if (this.onEndGame) this.onEndGame(); }, 5000);
    }

    deleteThing(obj: Engine.IThing) {
        var index: number = this.things.indexOf(obj);
        this.things.splice(index, 1);
    }

    deletePlayerLife(sprite: Engine.ISprite, index: number) {
        this.playerLive.splice(index, 1);
        this.deleteThing(sprite);
    }

    deleteEnemy(enemy: Enemy, index: number) {
        this.enemies.splice(index, 1);
        this.deleteThing(enemy);
    }

    deleteShot(shot: Shot, index: number) {
        this.shots.splice(index, 1);
        this.deleteThing(shot);
    }

    deleteExplosion(explosion: Engine.ISprite, index: number) {
        this.explosions.splice(index, 1);
        this.deleteThing(explosion);
    }

    update(): void;
    update(ticks: number): void;
    update(ticks?: any): void {
        this.updateGame();
        super.update(ticks);
    }

    updateGame(): void {
        this.updateScore();
        this.updateCollisions();
        this.updateShots();
        this.updateEnemies();
        this.updateExplosions();
    }

    updateScore(): void {
        this.scoreText.text = "Score: " + (this.score < 0 ? 0 : this.score);
    }

    updateShots(): void {
        this.shots.forEach((shot, index) => {
            if (shot.shouldDelete) {
                this.deleteShot(shot, index);
            }
        });
    }

    updateExplosions(): void {
        this.explosions.forEach((explosion, index) => {
            var sprite = <Engine.Sprite>explosion;
            var animation = <Engine.ImageSheetAnimation>sprite.currentAnimation;
            if (animation.hasEnd) {
                this.deleteExplosion(explosion, index);
            }
        });
    }

    updateEnemies(): void {
        this.enemies.forEach((enemy, index) => {
            if (enemy.shouldDelete) {
                this.deleteEnemy(enemy, index);
            } else if (Math.random() * 100000 > 99900) {
                this.enemyShot(enemy);
            }
        });
    }

    updateCollisions(): void {

        this.enemies.forEach((enemy, eindex) => {
            if (enemy.shouldDelete) return true;
            if (this.player.collision(enemy)) {
                this.player.livePoints--;
                if (this.playerLive.length > 0)
                    this.deletePlayerLife(this.playerLive[this.playerLive.length - 1], this.playerLive.length - 1);

                enemy.livePoints = 0;
                enemy.shouldDelete = true;
                
                this.explote(ExplosionType.Player, enemy.position.x, enemy.position.y);
                if (this.player.livePoints <= 0) {
                    this.gameover();
                } else { this.score--; }
            }

            this.shots.forEach((shot, sindex) => {
                if (shot.collision(enemy) && !shot.shouldDelete) {
                    shot.shouldDelete = true;
                    enemy.livePoints--;
                    this.explote(ExplosionType.Enemy, shot.position.x, shot.position.y);
                    if (enemy.livePoints <= 0) {
                        if (enemy.id.indexOf('_#') === 0)
                            this.explote(ExplosionType.Enemy, enemy.position.x, enemy.position.y);
                        else
                            this.explote(ExplosionType.EnemyDestroyed, enemy.position.x, enemy.position.y);

                        this.score += 10;
                    } else { this.score++; }
                }
            });
        });
    }
}

class Player extends Engine.Sprite {
    constructor(private pad: IPad, animation: Engine.IAnimation, public livePoints: number, private maxWidth: number, private maxHeight: number) {
        super("player", animation);

        this.speed = 95;
    }

    public update(context: Engine.IUpdateContext) {
        super.update(context);
        this.updatePosition();
    }

    private updatePosition(): void {
        var x: number = this.position.x;
        var y: number = this.position.y;
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

        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x > w) x = w;
        if (y > h) y = h;

        this.move(new Engine.Point(x, y));
    }
}

class Shot extends Engine.Sprite {
    public static counter: number = 0;

    public shouldDelete: boolean;
    private maxWidth: number;

    constructor(maxWidth: number, animation: Engine.IAnimation) {
        super("shoot-" + (Shot.counter++), animation);

        this.shouldDelete = false;
        this.speed = 100;
        this.maxWidth = maxWidth;
    }

    public update(context: Engine.IUpdateContext) {
        this.updatePosition();
        super.update(context);
    }

    private updatePosition(): void {
        this.move(new Engine.Point(this.position.x + 30, this.position.y));
        if (this.position.x >= this.maxWidth) {
            this.shouldDelete = true;
        }

    }
}

class Enemy extends Engine.Sprite {
    public static counter: number = 0;

    public shouldDelete: boolean;

    constructor(animation: Engine.IAnimation, public livePoints: number) {
        super("enemy-" + (Enemy.counter++), animation);

        this.livePoints = livePoints;
        this.shouldDelete = false;
    }

    public update(context: Engine.IUpdateContext) {
        this.updatePosition();
        super.update(context);
    }

    private updatePosition(): void {
        this.move(new Engine.Point(this.position.x - Math.random() * 40, this.position.y));
        if (this.position.x < -this.size.width || this.livePoints <= 0) {
            this.shouldDelete = true;
        }
    }
}

enum ExplosionType {
    Enemy,
    EnemyDestroyed,
    Player,
    PlayerDestroyed
}