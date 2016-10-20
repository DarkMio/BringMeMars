/**
 * This is a polyfill to have requestAnimationFrame across various browsers.
 * See this gist -> https://gist.github.com/paulirish/1579671
 */
function setupRequestAnimationFrame() {
    var lastTime = 0;
    if (!window.requestAnimationFrame) {
        if (window.mozRequestAnimationFrame) {
            window.requestAnimationFrame = window.mozRequestAnimationFrame;
        }
        else if (window.webkitRequestAnimationFrame) {
            window.requestAnimationFrame = window.webkitRequestAnimationFrame;
        }
        else if (window.msRequestAnimationFrame) {
            window.requestAnimationFrame = window.msRequestAnimationFrame;
        }
        else if (window.oRequestAnimationFrame) {
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
var BaseGaugeDrawer = (function () {
    function BaseGaugeDrawer(idSelector) {
        var element = document.getElementById(idSelector);
        if (element instanceof HTMLCanvasElement) {
            this.canvas = element;
        }
        else {
            var canvasElements = element.getElementsByTagName("canvas");
            if (canvasElements.length == 1) {
                this.canvas = canvasElements[0];
            }
            else if (canvasElements.length < 1) {
                throw "No canvas elements found!";
            }
            else {
                throw "More than one canvas elements found!";
            }
        }
        this.context = this.canvas.getContext("2d");
    }
    /**
     * Let's say we draw horizontally, where east is 0*, south 90°, west 180° and north 270°
     * Since canvas a pretty lousy on angles, we can convert it at this point.
     * @param start (number) end path degree based on description
     * @param end (number) start path degree based on description
     */
    BaseGaugeDrawer.prototype.getAngleDeg = function (start, end) {
        var begin = start / 360 * Math.PI;
        return [begin, begin + end / 360 * Math.PI];
    };
    return BaseGaugeDrawer;
}());
var Config = (function () {
    function Config() {
    }
    return Config;
}());
var HalfGaugeDrawer = (function () {
    function HalfGaugeDrawer(idSelector) {
        this.startAngle = 0;
        var element = document.getElementById(idSelector);
        if (element instanceof HTMLCanvasElement) {
            this.canvas = element;
        }
        else {
            var canvasElements = element.getElementsByTagName("canvas");
            if (canvasElements.length == 1) {
                this.canvas = canvasElements[0];
            }
            else if (canvasElements.length < 1) {
                throw "No canvas elements found!";
            }
            else {
                throw "More than one canvas elements found!";
            }
        }
        this.context = this.canvas.getContext("2d");
    }
    HalfGaugeDrawer.prototype.render = function () {
        var width = this.canvas.width / 2;
        var height = this.canvas.height * (1 - 0.05); //for padding
        this.context.lineCap = "butt";
        this.context.fillStyle = "#f5f5f5";
        this.context.strokeStyle = "#f5f5f5";
        this.context.beginPath();
        this.context.arc(width, height, height - 15, Math.PI, Math.PI * 2, false);
        this.context.lineWidth = 15;
        this.context.stroke();
        this.context.strokeStyle = "#cddc39";
        // this.context.fillStyle = "#cddc39";
        this.context.beginPath();
        this.context.arc(width, height, height - 15, Math.PI, Math.PI * 1.5, false);
        this.context.lineWidth = 15;
        this.context.stroke();
        this.context.beginPath();
        this.context.fillStyle = "#000";
        this.context.font = "30px Verdana";
        this.context.textAlign = "center";
        // -1 because the font renderer smooths sometimes and looks like a bit below than this is
        this.context.fillText("90", width, height - 1);
        this.context.stroke();
    };
    return HalfGaugeDrawer;
}());
//# sourceMappingURL=gauge.js.map