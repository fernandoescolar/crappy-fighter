module Engine {
    export interface INamedCollection<T> {
        getLength(): number;
        get(key: string): T;
        add(key: string, element: T): void;
        remove(key: string): void;
        containsKey(key: string): boolean;
        clear(): void;
        forEach(callback: (key: string, value: T) => any): void;
    }

    export interface IPoint {
        x: number;
        y: number;
    }

    export interface ISize {
        width: number;
        height: number;
    }

    export interface IResources {
        images: INamedCollection<HTMLImageElement>;
        audios: INamedCollection<HTMLAudioElement>;
        onlyOneAudio: boolean;

        loadImage(id: string, imageSource: string): void;
        loadAudio(id: string, audioSource: string): void;

        playAudio(id: string): void;
        playAudioLoop(id: string): void;
        stopAudioLoop(id: string): void;

        preload(onPreloaded: () => void): void;
    }

    export interface IUpdateContext {
        ticks: number;
        fps: number;
        screen: ISize;
        resources: IResources;
    }

    export interface IDrawable {
        draw(graphics: CanvasRenderingContext2D, camera: ICamera): void;
    }

    export interface IThing {
        id: string;
        position: IPoint;
        size: ISize;

        update(context: IUpdateContext): void;
    }

    export interface ISolidThing extends IThing {
        collision(obj: IThing): boolean;
    }

    export interface IMovableThing extends IThing {
        speed: number;
        move(position: IPoint): void;
        move(position: IPoint, onMoved: () => void): void;
    }

    export interface IScalableThing extends IThing {
        speed: number;
        scale(size: ISize): void;
        scale(size: ISize, onScaled: () => void): void;
    }

    export interface IScalableMovableThing extends IScalableThing, IMovableThing{
    }

    export interface ISolidScalableMovableThing extends ISolidThing, IScalableMovableThing {
    }

    export interface IAnimation {
        id: string;
        frameIndex: number;
        frameCount: number;
        update(context: IUpdateContext): void;
        draw(graphics: CanvasRenderingContext2D, position: IPoint, size: ISize): void;
    }

    export interface IAnimationCollection extends INamedCollection<IAnimation> {
    }

    export interface ICamera extends IMovableThing {
        viewPortPosition: IPoint;
        viewPortSize: ISize;
        scale: number;
        draw(graphics: CanvasRenderingContext2D, drawables: Array<any>): void;
    }

    export interface ISprite extends ISolidScalableMovableThing, IDrawable {
        animations: IAnimationCollection;
        currentAnimationKey: string;
    }

    export interface IScenario {
        resources: IResources;
        things: Array<IThing>;

        start(framesPerSecond: number): void;
        stop(): void;
    }

    class Utilities {
        static collisionDetection(a: IThing, b: IThing): boolean {
            return Utilities.intersect(
                a.position.x, a.position.y, a.size.width, a.size.height,
                b.position.x, b.position.y, b.size.width, b.size.height);
        }

        static isVisibleInCamera(cam: ICamera, thg: IThing): boolean {
            return Utilities.intersect(
                cam.viewPortPosition.x, cam.viewPortPosition.y, cam.viewPortSize.width, cam.viewPortSize.height,
                thg.position.x, thg.position.y, thg.size.width, thg.size.height);
        }

        static intersect(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number) : boolean {
            return x1 <= (x2 + w2)
                && x2 <= (x1 + w1)
                && y1 <= (y2 + h2)
                && y2 <= (y1 + h1);
        }

        static calculateStep(from: number, to: number, delta: number): number {
            if (from === to)
                return from;
            else if (from < to)
                return Math.min(from + delta, to);
            else
                return Math.max(from - delta, to);
        }

        static calculateDelta(ticks: number, speed: number) {
            return ticks / (100 - speed);
        }

        static moveThing(obj: IMovableThing, target: IPoint, delta: number) {
            obj.position.x = Utilities.calculateStep(obj.position.x, target.x, delta);
            obj.position.y = Utilities.calculateStep(obj.position.y, target.y, delta);
        }

        static scaleThing(obj: IScalableThing, target: ISize, delta: number) {
            obj.size.width = Utilities.calculateStep(obj.size.width, target.width, delta);
            obj.size.height = Utilities.calculateStep(obj.size.height, target.height, delta);
        }
    }

    export class NamedCollection<T> implements INamedCollection<T> {
        private items: { [key: string]: T };
        private count: number;

        constructor() {
            this.clear();
        }

        public get length() {
            return this.getLength();
        }

        public getLength(): number {
            return this.count;
        }

        public get(key: string): T {
            return this.items[key];
        }

        public add(key: string, element: T): void {
            if (!this.containsKey(key)) {
                this.count++;
            }

            this.items[key] = element;
        }

        public remove(key: string): void {
            if (this.containsKey(key)) {
                delete this.items[key];
                this.count--;
            }
        }

        public containsKey(key: string): boolean {
            return (typeof this.items[key]) !== 'undefined';
        }

        public clear(): void {
            this.items = {};
            this.count = 0;
        }

        public forEach(callback: (key: string, value: T) => any): void {
            for (var name in this.items) {
                if (this.items.hasOwnProperty(name)) {
                    var element: T = this.items[name];
                    var ret = callback(name, element);
                    if (ret === false) {
                        return;
                    }
                }
            }
        }
    }

    export class Point implements IPoint {

        public x: number;
        public y: number;

        constructor();
        constructor(x: number, y: number);
        constructor(x?: any, y?: any) {
            this.x = x || 0;
            this.y = y || 0;
        }
    }

    export class Size implements ISize {
        constructor(public width: number, public height: number) {
        }
    }

    export class Resources implements IResources {
        public images: INamedCollection<HTMLImageElement>;
        public audios: INamedCollection<HTMLAudioElement>;
        public onlyOneAudio: boolean;

        private filesToLoad: number;
        private filesLoaded: number;
        private lastAudio: HTMLAudioElement;
        
        constructor() {
            this.images = new NamedCollection<HTMLImageElement>();
            this.audios = new NamedCollection<HTMLAudioElement>();
            this.filesLoaded = 0;
            this.filesToLoad = 0;
            this.onlyOneAudio = false;
        }

        public loadImage(id: string, imageSource: string): void {
            this.filesToLoad++;

            var image = <HTMLImageElement>document.createElement("img");
            var img = new Image();
            img.onload = ev => { image.width = img.width; image.height = img.height; (<any>image).innerImage = img; this.filesLoaded++; };
            image.src = imageSource;
            img.src = imageSource;

            this.images.add(id, image);
        }

        public loadAudio(id: string, audioSource: string): void {
            this.filesToLoad++;

            var audio = <HTMLAudioElement>document.createElement("audio");
            audio.preload = "auto";
            audio.onload = ev => { this.filesLoaded++; }; // It doesn't works!
            audio.addEventListener('canplaythrough', ev => { this.filesLoaded++; }, false); // It works!!
            audio.src = audioSource;

            this.audios.add(id, audio);
        }

        public playAudio(id: string): void {
            try {
                if (this.onlyOneAudio && this.lastAudio) {
                    try { this.lastAudio.pause(); } catch (ex) { }
                }

                var audio = this.audios.get(id);
                audio.currentTime = 0;
                audio.play();

                if (this.onlyOneAudio)
                    this.lastAudio = audio;
            } catch (ex) { }
        }

        public playAudioLoop(id: string): void {
            try {
                var audio = this.audios.get(id);
                audio.loop = true;
                audio.currentTime = 0;
                audio.play();
            } catch (ex) { }
        }

        public stopAudioLoop(id: string): void {
            try {
                var audio = this.audios.get(id);
                audio.loop = false;
                audio.pause();
            } catch (ex) { }
        }

        public preload(onPreloaded: () => void): void {
            if (this.filesLoaded === this.filesToLoad) {
                onPreloaded();
            } else {
                setTimeout(() => { this.preload(onPreloaded); }, 200);
            }
        }
    }

    export class UpdateContext implements IUpdateContext {

        constructor(public ticks: number, public fps: number, public screen: ISize, public resources: IResources) {
        }
    }

    export class Thing implements IThing {
        public id: string;
        public position: IPoint;
        public size: ISize;

        constructor(id: string, position: IPoint, size: ISize);
        constructor(id: string);
        constructor(id: string, position?: any, size?: any) {
            this.id = id;
            this.position = position || new Point(0, 0);
            this.size = size || new Size(0, 0);
        }

        update(context: IUpdateContext) {

        }
    }

    export class SolidThing extends Thing implements ISolidThing {
        collision(obj: IThing): boolean {
            return Utilities.collisionDetection(this, obj);
        }
    }

    export class MovableThing extends Thing implements IMovableThing {

        public speed: number;
        private targetPosition: IPoint;
        private moveCallback: () => void;

        move(position: IPoint, onMoved: () => void = null): void {
            this.targetPosition = position;
            this.moveCallback = onMoved;
        }

        update(context: IUpdateContext) {
            super.update(context);

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
        }
    }

    export class ScalableThing extends Thing implements IScalableThing {
        private scaleCallback: () => void;

        public speed: number;
        private targetSize: ISize;

        scale(size: ISize, onScaled: () => void = null): void {
            this.targetSize = size;
            this.scaleCallback = onScaled;
        }

        update(context: IUpdateContext) {
            super.update(context);

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
        }
    }

    export class ScalableMovableThing extends Thing implements IScalableMovableThing {

        public speed: number;
        private targetSize: ISize;
        private targetPosition: IPoint;
        private scaleCallback: () => void;
        private moveCallback: () => void;

        move(position: IPoint, onMoved: () => void = null): void {
            this.targetPosition = position;
            this.moveCallback = onMoved;
        }

        scale(size: ISize, onScaled: () => void = null): void {
            this.targetSize = size;
            this.scaleCallback = onScaled;
        }

        update(context: IUpdateContext) {
            super.update(context);

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
        }
    }

    export class SolidScalableMovableThing extends ScalableMovableThing implements ISolidScalableMovableThing {
        collision(obj: IThing): boolean {
            return Utilities.collisionDetection(this, obj);
        }
    }

    export class Camera extends MovableThing implements ICamera {
        public viewPortPosition: IPoint;
        public viewPortSize: ISize;
        public scale: number;

        constructor(id: string);
        constructor(id: string, position: IPoint, size: ISize);
        constructor(id: string, position: IPoint, size: ISize, vpPosition: IPoint, vpSize: ISize);
        constructor(id: string, position?: any, size?: any, vpPosition?: any, vpSize?: any) {
            super(id, position, size);
            this.viewPortPosition = vpPosition || new Point(0, 0);
            this.viewPortSize = vpSize || new Size(0, 0);
            this.scale = 1.0;
        }

        public draw(graphics: CanvasRenderingContext2D, drawables: Array<any>) {
            for (var i: number = 0; i < drawables.length; i++) {
                if (Utilities.isVisibleInCamera(this, drawables[i])) {
                    if (drawables[i].draw) {
                        var drawable: IDrawable = <IDrawable>drawables[i];
                        drawable.draw(graphics, this);
                    }
                }
            }
        }
    }

    export class StaticColorAnimation implements IAnimation {
        public id: string;
        public color: string;
        public frameIndex: number;
        public frameCount: number;

        constructor(id: string, color: string) {
            this.id = id;
            this.color = color;
            this.frameIndex = 0;
            this.frameCount = 1;
        }

        public update(context: IUpdateContext): void {
        }

        public draw(graphics: CanvasRenderingContext2D, position: IPoint, size: ISize): void {
            graphics.save();
            graphics.fillStyle = this.color;
            graphics.fillRect(position.x, position.y, size.width, size.height);
            graphics.restore();
        }
    }

    export class StaticImageAnimation implements IAnimation {
        public id: string;
        public frameIndex: number;
        public frameCount: number;

        private image: HTMLImageElement;

        constructor(id: string, image: HTMLImageElement) {
            this.id = id;
            this.image = image;
            this.frameIndex = 0;
            this.frameCount = 1;
        }

        public update(context: IUpdateContext): void {
        }

        public draw(graphics: CanvasRenderingContext2D, position: IPoint, size: ISize): void {
            this.internalDraw(graphics, this.image, position, size);
        }

        internalDraw(graphics: CanvasRenderingContext2D, image: HTMLImageElement, position: IPoint, size: ISize) {
            graphics.drawImage(image,
                0,
                0,
                image.width,
                image.height,
                position.x,
                position.y,
                size.width,
                size.height);
        }
    }

    export class ImageSheetAnimation extends StaticImageAnimation implements IAnimation {
        public loop: boolean;
        public isVertical: boolean
        public imageSize: ISize;
        public speed: number;
        public hasEnd: boolean;

        private ticks: number;

        constructor(id: string, image: HTMLImageElement, frameCount: number, loop?: boolean, isVertical?: boolean) {
            super(id, image);

            this.frameCount = frameCount;
            this.loop = (typeof loop === 'undefined') ? true : loop;
            this.isVertical = (typeof isVertical === 'undefined') ? true : isVertical;
            this.speed = 50;
            this.ticks = 0;
            this.hasEnd = false;

            var w: number = this.isVertical ? image.width : image.width / this.frameCount;
            var h: number = !this.isVertical ? image.height : image.height / this.frameCount;
            this.imageSize = new Size(w, h);
        }

        public update(context: IUpdateContext): void {
            super.update(context);
            this.ticks += context.ticks;
            if (this.ticks / (100 - this.speed) >= 1) {
                this.ticks = 0;
                if (this.frameIndex < this.frameCount - 1) {
                    this.frameIndex += 1;
                } else if (this.loop) {
                    this.frameIndex = 0;
                } else {
                    this.hasEnd = true;
                }
            }
        }

        internalDraw(graphics: CanvasRenderingContext2D, image: HTMLImageElement, position: IPoint, size: ISize) {
            var x: number = this.isVertical ? 0 : this.imageSize.width * this.frameIndex;
            var y: number = !this.isVertical ? 0 : this.imageSize.height * this.frameIndex;

            graphics.drawImage(image,
                x,
                y,
                this.imageSize.width,
                this.imageSize.height,
                position.x,
                position.y,
                size.width,
                size.height);
        }
    }

    export class ContinuousImageAnimation extends StaticImageAnimation implements IAnimation {
        public speed: number;
        public imageSize: ISize;

        private offset: number;

        constructor(id: string, image: HTMLImageElement) {
            super(id, image);
            this.speed = 50;
            this.offset = 0;
            var w: number = image.width;
            var h: number = image.height;
            this.imageSize = new Size(w, h);
        }

        public update(context: IUpdateContext): void {
            super.update(context);
            var delta = context.ticks / (100 - this.speed);
            this.offset += delta;
            if (this.offset > this.imageSize.width) {
                this.offset = 0;
            }
        }

        internalDraw(graphics: CanvasRenderingContext2D, image: HTMLImageElement, position: IPoint, size: ISize) {
            if ((this.imageSize.width - this.offset) < size.width) {
                var offsetA: number = this.imageSize.width - this.offset;
                var offsetB: number = this.imageSize.width - offsetA;
                graphics.drawImage(image,
                    this.offset,
                    0,
                    offsetA,
                    size.height,
                    position.x,
                    position.y,
                    offsetA,
                    size.height);

                graphics.drawImage(image,
                    0,
                    0,
                    offsetB,
                    size.height,
                    offsetA,
                    0,
                    offsetB,
                    size.height);
            }
            else {
                graphics.drawImage(image,
                    this.offset,
                    0,
                    size.width,
                    size.height,
                    position.x,
                    position.y,
                    size.width,
                    size.height);
            }
        }
    }

    export class TextAnimation implements IAnimation {
        public id: string;
        public text: string;
        public color: string;
        public font: string;
        public frameIndex: number;
        public frameCount: number;

        constructor(id: string, text: string, color: string, font?: string) {
            this.id = id;
            this.frameCount = 0;
            this.frameIndex = 0;
            this.text = text;
            this.font = font;
            this.color = color;
        }

        public update(context: IUpdateContext): void {
        }

        public draw(graphics: CanvasRenderingContext2D, position: IPoint, size: ISize): void {
            graphics.save();
            if (this.font)
                graphics.font = this.font;

            graphics.fillStyle = this.color;
            graphics.fillText(this.text, position.x, position.y);
            graphics.restore();
        }
    }

    class FadeAnimation implements IAnimation {
        public id: string;
        public frameIndex: number;
        public frameCount: number;
        public speed: number;

        public onEnd: () => void;

        private alpha: number;
        private ticks: number;

        constructor(id: string, public color: string, private out: boolean = false) {
            this.id = id;
            this.frameCount = 0;
            this.frameIndex = 0;
            this.color = color;
            this.alpha = out ? 0 : 1;
            this.speed = 50;
            this.ticks = 0;
        }

        public update(context: IUpdateContext): void {
            if ((!this.out && this.alpha <= 0) || (this.out && this.alpha >= 1)) return;

            this.ticks += context.ticks;
            if (this.ticks / (100 - this.speed) >= 1) {
                this.ticks = 0;
                this.alpha += this.out ? 0.1 : -0.1;
                if (!this.out && this.alpha <= 0) this.alpha = 0;
                if (this.out && this.alpha >= 1) this.alpha = 1;
                if ((this.alpha === 0 || this.alpha === 1) && this.onEnd) this.onEnd();
            }
        }

        public draw(graphics: CanvasRenderingContext2D, position: IPoint, size: ISize): void {
            graphics.save();
            graphics.globalAlpha = this.alpha;
            graphics.fillStyle = this.color;
            graphics.fillRect(position.x, position.y, size.width, size.height);
            graphics.restore();
        }
    }

    export class FadeInAnimation extends FadeAnimation {
      
        constructor(id: string, color: string) {
            super(id, color, false);
        }
    }

    export class FadeOutAnimation extends FadeAnimation {

        constructor(id: string, color: string) {
            super(id, color, true);
        }
    }

    export class AnimationCollection extends NamedCollection<IAnimation> implements IAnimationCollection {
    }

    export class Sprite extends SolidScalableMovableThing implements ISprite {

        public animations: IAnimationCollection;

        private currentKey: string;

        constructor(id: string, ...animations: Array<IAnimation>) {
            super(id);

            this.animations = new AnimationCollection();
            animations = animations || [];
            animations.forEach(animation => { this.animations.add(animation.id, animation); });

            if (animations.length >= 1) {
                this.currentKey = animations[0].id;
            }
        }

        public get currentAnimationKey(): string {
            return this.currentKey;
        }

        public set currentAnimationKey(key: string) {
            this.currentKey = key;
        }

        public get currentAnimation(): IAnimation {
            return this.animations.get(this.currentKey);
        }

        update(context: IUpdateContext) {
            super.update(context);

            var currentAnimation = this.currentAnimation;
            if (currentAnimation) {
                currentAnimation.update(context);
            }
        }

        draw(graphics: CanvasRenderingContext2D, camera: ICamera) {
            var currentAnimation = this.currentAnimation;
            if (currentAnimation) {
                var x: number = (this.position.x + camera.position.x - camera.viewPortPosition.x) * camera.scale;
                var y: number = (this.position.y + camera.position.y - camera.viewPortPosition.y) * camera.scale;
                var w: number = this.size.width * camera.scale;
                var h: number = this.size.height * camera.scale;
                
                currentAnimation.draw(graphics, new Point(x, y), new Size(w, h));
            }
        }
    }

    export class Scenario implements IScenario {

        public resources: IResources;
        public things: Array<IThing>;
        public cameras: Array<ICamera>;
        private graphics: CanvasRenderingContext2D;
        private canvas: HTMLCanvasElement;
        private fps: number;
        private lastTime: number;
        private interval: number;

        constructor(canvas: HTMLCanvasElement) {
            this.canvas = canvas;
            this.graphics = canvas.getContext('2d');
            this.things = [];
            this.cameras = [new Camera('default', new Point(0, 0), new Size(canvas.width, canvas.height), new Point(0, 0), new Size(canvas.width, canvas.height))];
            this.resources = new Resources();
        }

        public isRunning(): boolean {
            return !!this.interval;
        }

        start(framesPerSecond: number): void {
            if (this.interval)
                this.stop();

            this.fps = framesPerSecond;
            this.lastTime = Date.now();
            this.interval = setInterval(() => this.update(), 1000 / framesPerSecond);
        }

        stop(): void {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        }

        update(): void;
        update(ticks: number): void;
        update(ticks?: any): void {
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
        }

        updateElements(context: IUpdateContext): void {
            this.things.forEach(sprite => {
                sprite.update(context);
            });
            this.cameras.forEach(camera => {
                camera.update(context);
                camera.draw(this.graphics, this.things);
            });
        }
    }
}