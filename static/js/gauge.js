var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
    function BaseGaugeDrawer(idSelector, configuration) {
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
        this.setConfiguration(configuration);
        var ob = this;
    }
    BaseGaugeDrawer.prototype.render = function () {
        this.canvas.height = this.canvas.offsetHeight;
        this.canvas.width = this.canvas.offsetWidth;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.draw();
    };
    BaseGaugeDrawer.prototype.set = function (value) {
        this.value = value;
        this.frame = window.requestAnimationFrame(setDraw);
        var obj = this;
        function setDraw(timestamp) {
            if (Math.abs(obj.value - obj.current) < 0.005) {
                window.cancelAnimationFrame(timestamp);
                return;
            }
            var distance = obj.value - obj.current;
            obj.current = obj.current + distance / 10;
            obj.render();
            window.requestAnimationFrame(setDraw);
        }
    };
    BaseGaugeDrawer.getDefaultConfiguration = function () {
        return new (function () {
            function class_1() {
                this.backgroundLineWidth = 15;
                this.gaugeLineWidth = 15;
                this.backgroundColor = "#f5f5f5";
                this.gaugeColor = "#cddc39";
                this.displayFont = false;
                this.fontStyle = "20pt 'Roboto', 'Verdana', 'sans-serif'";
                this.minValue = 0;
                this.maxValue = 100;
                this.initialValue = Math.random() * 100;
            }
            return class_1;
        }());
    };
    BaseGaugeDrawer.prototype.setConfiguration = function (configuration) {
        var def = BaseGaugeDrawer.getDefaultConfiguration();
        if (configuration == null) {
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
        this.value = configuration.value || this.minValue + Math.random() * this.maxValue;
        this.current = this.value;
    };
    /**
     * Let's say we draw horizontally, where east is 0°, south 90°, west 180° and north 270°
     * Since canvas a pretty lousy on angles, we can convert it at this point.
     * @param start (number) end path degree based on description
     * @param end (number) start path degree based on description
     */
    BaseGaugeDrawer.getAngleDeg = function (start, end) {
        if (start > end) {
            var temp = start;
            start = end;
            end = temp;
        }
        var stop = (end - start) / 180 * Math.PI;
        var begin = start / 180 * Math.PI;
        return [begin, begin + stop];
    };
    BaseGaugeDrawer.getAdditiveAngle = function (start, angle) {
        var begin = start / 180 * Math.PI;
        var stop = begin + (angle / 180) * Math.PI;
        return [begin, stop];
    };
    BaseGaugeDrawer.prototype.getValueAngle = function (value, fullDegree) {
        var percentage = (value - this.minValue) * 100 / this.maxValue;
        fullDegree /= 100;
        return BaseGaugeDrawer.getAdditiveAngle(180, percentage * fullDegree);
    };
    return BaseGaugeDrawer;
}());
var HalfGaugeMeter = (function (_super) {
    __extends(HalfGaugeMeter, _super);
    function HalfGaugeMeter(idSelector, configuration) {
        configuration = configuration || new (function () {
            function class_2() {
            }
            return class_2;
        }());
        configuration.displayFont = true;
        _super.call(this, idSelector, configuration);
    }
    HalfGaugeMeter.prototype.draw = function () {
        var width = this.canvas.width / 2;
        var height = this.canvas.height; // * ( 1 - 0.05); //for padding
        var smaller = width > height ? height : width;
        this.context.lineCap = "butt";
        this.drawGauge(width, height, smaller);
        this.drawMeter(width, height, smaller);
        this.drawText(width, height);
    };
    HalfGaugeMeter.prototype.drawGauge = function (width, height, smaller) {
        var ctx = this.context;
        ctx.fillStyle = this.backgroundColor;
        ctx.strokeStyle = this.backgroundColor;
        ctx.beginPath();
        var halfArc = BaseGaugeDrawer.getAdditiveAngle(180, 180);
        ctx.arc(width, height, smaller - this.gaugeLineWidth, halfArc[0], halfArc[1], false);
        ctx.lineWidth = this.backgroundLineWidth;
        ctx.stroke();
    };
    HalfGaugeMeter.prototype.drawMeter = function (width, height, smaller) {
        var ctx = this.context;
        ctx.strokeStyle = this.gaugeColor;
        // ctx.fillStyle = "#cddc39";
        ctx.beginPath();
        var gaugeArc = this.getValueAngle(this.current, 180);
        ctx.arc(width, height, smaller - this.gaugeLineWidth, gaugeArc[0], gaugeArc[1], false);
        ctx.lineWidth = this.gaugeLineWidth;
        ctx.stroke();
    };
    HalfGaugeMeter.prototype.drawText = function (width, height) {
        if (!this.displayFont) {
            return;
        }
        var ctx = this.context;
        ctx.fillStyle = "#000";
        ctx.font = this.fontStyle;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        // -1 because the font renderer smooths sometimes and looks like a bit below than this is
        ctx.fillText(this.current.toFixed(2) + this.appendText, width, height);
    };
    return HalfGaugeMeter;
}(BaseGaugeDrawer));
var FullGaugeMeter = (function (_super) {
    __extends(FullGaugeMeter, _super);
    function FullGaugeMeter(idSelector, configuration) {
        configuration = configuration || new (function () {
            function class_3() {
            }
            return class_3;
        }());
        configuration.displayFont = true;
        _super.call(this, idSelector, configuration);
    }
    FullGaugeMeter.prototype.draw = function () {
        var width = this.canvas.width / 2;
        var height = this.canvas.height / 2;
        var smaller = width > height ? height : width;
        this.context.lineCap = "butt";
        this.drawGauge(width, height, smaller);
        this.drawMeter(width, height, smaller);
        this.drawText(width, height);
    };
    FullGaugeMeter.prototype.drawGauge = function (width, height, smaller) {
        var ctx = this.context;
        ctx.fillStyle = this.backgroundColor;
        ctx.strokeStyle = this.backgroundColor;
        ctx.beginPath();
        var arc = BaseGaugeDrawer.getAngleDeg(0, 360);
        var radius = (smaller - this.gaugeLineWidth);
        ctx.arc(width, height, radius, arc[0], arc[1], false);
        ctx.lineWidth = this.backgroundLineWidth;
        ctx.stroke();
    };
    FullGaugeMeter.prototype.drawMeter = function (width, height, smaller) {
        var ctx = this.context;
        ctx.strokeStyle = this.gaugeColor;
        ctx.beginPath();
        var gaugeArc = this.getValueAngle(this.current, 360);
        ctx.arc(width, height, smaller - this.gaugeLineWidth, gaugeArc[0], gaugeArc[1], false);
        ctx.lineWidth = this.gaugeLineWidth;
        ctx.stroke();
    };
    FullGaugeMeter.prototype.drawText = function (width, height) {
        if (!this.displayFont) {
            return;
        }
        var ctx = this.context;
        ctx.fillStyle = "#000";
        ctx.font = this.fontStyle;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // -1 because the font renderer smooths sometimes and looks like a bit below than this is
        ctx.fillText(this.current.toFixed(2) + this.appendText, width, height - 1);
    };
    return FullGaugeMeter;
}(BaseGaugeDrawer));
//# sourceMappingURL=gauge.js.map