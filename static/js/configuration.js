document.addEventListener("DOMContentLoaded", function () {
    (function () {
        'use strict';
        var snackbarContainer = document.querySelector('#demo-toast-example');
        var showSnackbarButton = document.querySelector('#demo-show-toast');
        var handler = function (event) {
            showSnackbarButton.style.backgroundColor = '';
        };
        showSnackbarButton.addEventListener('click', function () {
            'use strict';
            showSnackbarButton.style.backgroundColor = '#' +
                Math.floor(Math.random() * 0xFFFFFF).toString(16);
            var data = {
                message: 'Button color changed.',
                timeout: 2000,
                actionHandler: handler,
                actionText: 'Undo'
            };
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
        });
    }());
    setupFPSListener();
    function setupFPSListener() {
        var field = document.getElementById("fpsInput");
        var slider = document.getElementById("fpsSlider");
        var timer = document.getElementById("frameTime");
        if (field instanceof HTMLInputElement && slider instanceof HTMLInputElement) {
            var timeCalc = function () { return (1000 / slider.value).toFixed(1); };
            timer.innerText = timeCalc();
            field.value = slider.value;
            field.addEventListener("input", function () {
                if (slider.MaterialSlider) {
                    slider.MaterialSlider.change(this.value);
                }
                else {
                    slider.value = this.value; // this looks shit, but it works.
                }
                timer.innerText = timeCalc();
            });
            slider.addEventListener("input", function () {
                field.value = this.value;
                timer.innerText = timeCalc();
            });
        }
    }
});
//# sourceMappingURL=configuration.js.map