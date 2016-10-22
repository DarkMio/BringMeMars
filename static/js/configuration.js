document.addEventListener("DOMContentLoaded", function () {
    setupFPSListener();
    function setupFPSListener() {
        var field = document.getElementById("fpsInput");
        var slider = document.getElementById("fpsSlider");
        if (field instanceof HTMLInputElement && slider instanceof HTMLInputElement) {
            field.value = slider.value;
            field.addEventListener("input", function () {
                if (slider.MaterialSlider) {
                    slider.MaterialSlider.change(this.value);
                }
                else {
                    slider.value = this.value; // this looks shit, but it works.
                }
            });
            slider.addEventListener("input", function () {
                field.value = this.value;
            });
        }
    }
});
//# sourceMappingURL=configuration.js.map