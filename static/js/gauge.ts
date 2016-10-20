/**
 * This is a polyfill to have requestAnimationFrame across various browsers.
 * See this gist -> https://gist.github.com/paulirish/1579671
 */
function setupRequestAnimationFrame() {
    var lastTime = 0;
    if(!window.requestAnimationFrame) {
        if(window.mozRequestAnimationFrame) {
            window.requestAnimationFrame = window.mozRequestAnimationFrame;
        } else if(window.webkitRequestAnimationFrame) {
            window.requestAnimationFrame = window.webkitRequestAnimationFrame;
        } else if(window.msRequestAnimationFrame) {
            window.requestAnimationFrame = window.msRequestAnimationFrame;
        } else if(window.oRequestAnimationFrame) {
            window.requestAnimationFrame = window.oRequestAnimationFrame;
        }
    }

    var targetTime = 0;
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback) {
            var currentTime = +new Date;
            targetTime = Math.max(targetTime + 16, currentTime);
            var timeoutCb = function () {
                callback(+new Date);
            };
            return window.setTimeout(timeoutCb, targetTime - currentTime);
        };
    }
}

/**
 * An abstract class containing the most bare and basic methods to draw any kind of gauge.
 */
abstract class BaseGaugeDrawer {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    backgroundLineWidth: number;
    backgroundColor: string;
    gaugeLineWidth: number;
    gaugeColor: string;
    displayFont: boolean;
    fontStyle: string;
    appendText: string;
    minValue: number;
    maxValue: number;
    initialValue: number;

    constructor(idSelector: string, configuration?: any) {
        let element = document.getElementById(idSelector);
        if(element instanceof HTMLCanvasElement) {
            this.canvas = element;
        } else {
            let canvasElements = element.getElementsByTagName("canvas");
            if (canvasElements.length == 1) {
                this.canvas = canvasElements[0];
            } else if (canvasElements.length < 1) {
                throw "No canvas elements found!";
            } else {
                throw "More than one canvas elements found!";
            }
        }
        this.context = this.canvas.getContext("2d");
        this.setConfiguration(configuration);
    }

    static getDefaultConfiguration() {
        return new class {
            backgroundLineWidth = 15;
            gaugeLineWidth = 15;
            backgroundColor = "#f5f5f5";
            gaugeColor = "#cddc39";
            displayFont = false;
            fontStyle = "20pt 'Roboto', 'Verdana', 'sans-serif'";
            appendText: "";
            minValue = 0;
            maxValue = 100;
            initialValue = Math.random() * 100;
        }
    }

    setConfiguration(configuration?: any) {
        var def = BaseGaugeDrawer.getDefaultConfiguration();
        if(configuration == null) {
            configuration = def;
        }

        this.backgroundLineWidth = configuration.backgroundLineWidth || def.backgroundLineWidth;
        this.gaugeLineWidth = configuration.gaugeLineWidth || def.gaugeLineWidth;
        this.backgroundColor = configuration.backgroundColor || def.backgroundColor;
        this.gaugeColor = configuration.gaugeColor || def.gaugeColor;
        this.displayFont = configuration.displayFont || def.displayFont;
        this.fontStyle = configuration.fontStyle || def.fontStyle;
        this.appendText = configuration.appendText || def.appendText;
        this.minValue = configuration.minValue || def.minValue;
        this.maxValue = configuration.maxValue || def.maxValue;
        this.initialValue = configuration.initialValue || this.minValue + Math.random() * this.maxValue;
    }

    /**
     * Let's say we draw horizontally, where east is 0°, south 90°, west 180° and north 270°
     * Since canvas a pretty lousy on angles, we can convert it at this point.
     * @param start (number) end path degree based on description
     * @param end (number) start path degree based on description
     */
    static getAngleDeg(start: number, end: number): [number, number] {
        if(start > end) {
            var temp = start;
            start = end;
            end = temp;
        }
        var stop = (end - start) / 180 * Math.PI;
        var begin = start / 180 * Math.PI;
        return [begin, begin + stop]
    }

    static getAdditiveAngle(start: number, angle: number): [number, number] {
        var begin = start / 180 * Math.PI;
        var stop = begin + (angle / 180) * Math.PI;
        return [begin, stop]
    }

    getValueAngle(value: number): [number, number] {
        var percentage = (value - this.minValue) * 100 / this.maxValue;
        return BaseGaugeDrawer.getAdditiveAngle(180, percentage * 1.8);
    }
}


class HalfGaugeDrawer extends BaseGaugeDrawer {
    constructor(idSelector: string, configuration?: any) {
        configuration = configuration || new class{};
        configuration.displayFont = true;
        super(idSelector, configuration);
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let width = this.canvas.width / 2;
        let height = this.canvas.height * ( 1 - 0.05); //for padding
        this.context.lineCap = "butt";
        this.drawGauge(width, height);
        this.drawMeter(width, height);
        this.drawText(width, height);

    }

    private drawGauge(width: number, height: number) {
        var ctx = this.context;
        ctx.fillStyle = this.backgroundColor;
        ctx.strokeStyle = this.backgroundColor;
        ctx.beginPath();
        var halfArc = BaseGaugeDrawer.getAdditiveAngle(180, 180);
        ctx.arc(width, height, height - 15, halfArc[0], halfArc[1], false);
        ctx.lineWidth = this.backgroundLineWidth;
        ctx.stroke();
    }

    private drawMeter(width: number, height: number) {
        var ctx = this.context;
        ctx.strokeStyle = this.gaugeColor;
        // ctx.fillStyle = "#cddc39";
        ctx.beginPath();
        var gaugeArc = this.getValueAngle(this.initialValue);

        ctx.arc(width, height, height - 15,  gaugeArc[0], gaugeArc[1], false);
        ctx.lineWidth = this.gaugeLineWidth;
        ctx.stroke();
    }

    private drawText(width: number, height: number) {
        if(!this.displayFont) {
            return;
        }
        var ctx = this.context;
        ctx.fillStyle = "#000";
        ctx.font = this.fontStyle;
        ctx.textAlign = "center";
        // -1 because the font renderer smooths sometimes and looks like a bit below than this is
        ctx.fillText(this.initialValue.toFixed(2), width, height - 1);
    }
}

