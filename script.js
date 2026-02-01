const canvas = document.querySelector(".canvas");
const inputSize = document.querySelector(".input-size");
const inputColor = document.querySelector(".input-color");
const usedColors = document.querySelector(".used-colors");
const buttonSave = document.querySelector(".button-save");
const main = document.querySelector("main");
const referenceInputs = document.querySelectorAll(".reference-input");
const referenceImages = document.querySelectorAll(".reference-preview img");

const MIN_CANVAS_SIZE = 4;
const RESIZE_STEP = 20;
const CANVAS_MIN_WIDTH = 200;

let isPainting = false;

const createElement = (tag, className = "") => {
    const element = document.createElement(tag);
    element.className = className;
    return element;
};

const setPixelColor = (pixel) => {
    pixel.style.backgroundColor = inputColor.value;
};

const createPixel = () => {
    const pixel = createElement("div", "pixel");

    pixel.addEventListener("mousedown", (event) => {
        if (event.altKey) return;
        setPixelColor(pixel);
    });
    pixel.addEventListener("mouseover", () => {
        if (isPainting) setPixelColor(pixel);
    });

    return pixel;
};

const loadCanvas = () => {
    const length = inputSize.value;
    canvas.innerHTML = "";

    for (let i = 0; i < length; i += 1) {
        const row = createElement("div", "row");

        for (let j = 0; j < length; j += 1) {
            row.append(createPixel());
        }

        canvas.append(row);
    }
};

const updateCanvasSize = () => {
    if (inputSize.value >= MIN_CANVAS_SIZE) {
        loadCanvas();
    }
};

const changeColor = () => {
    const button = createElement("button", "button-color");
    const currentColor = inputColor.value;

    button.style.backgroundColor = currentColor;
    button.setAttribute("data-color", currentColor);
    button.addEventListener("click", () => (inputColor.value = currentColor));

    const savedColors = Array.from(usedColors.children);

    const check = (btn) => btn.getAttribute("data-color") != currentColor;

    if (savedColors.every(check)) {
        usedColors.append(button);
    }
};

const getResizeMaxWidth = () => {
    const mainRect = main.getBoundingClientRect();
    const leftPanel = document.querySelector(".reference-panel.left");
    const rightPanel = document.querySelector(".reference-panel.right");
    const leftRect = leftPanel.getBoundingClientRect();
    const rightRect = rightPanel.getBoundingClientRect();
    const gutter = 48;

    return Math.max(
        200,
        mainRect.width - leftRect.width - rightRect.width - gutter
    );
};

const getCanvasMaxWidth = () => {
    const value = canvas.style.maxWidth || "";
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    return canvas.getBoundingClientRect().width || CANVAS_MIN_WIDTH;
};

const resizeCanvasByScroll = (direction) => {
    const maxWidth = getResizeMaxWidth();
    const currentWidth = getCanvasMaxWidth();
    const desiredWidth = Math.max(
        CANVAS_MIN_WIDTH,
        currentWidth + direction * RESIZE_STEP
    );
    const clampedWidth = Math.min(desiredWidth, maxWidth);

    canvas.style.maxWidth = `${clampedWidth}px`;
};

const saveCanvas = () => {
    html2canvas(canvas, {
        onrendered: (image) => {
            const img = image.toDataURL("image/png");
            const link = createElement("a");

            link.href = img;
            link.download = "pixelart.png";

            link.click();
        },
    });
};

canvas.addEventListener("mousedown", (event) => {
    if (event.button === 0) {
        isPainting = true;
    }
});
canvas.addEventListener("mouseup", () => (isPainting = false));

inputSize.addEventListener("change", updateCanvasSize);
inputColor.addEventListener("change", changeColor);

document.addEventListener("mouseup", () => {
    isPainting = false;
});
canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    resizeCanvasByScroll(direction);
});

buttonSave.addEventListener("click", saveCanvas);

referenceInputs.forEach((input, index) => {
    input.addEventListener("change", ({ target }) => {
        const file = target.files && target.files[0];
        const image = referenceImages[index];

        if (!file || !image) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            image.src = event.target.result;
            image.classList.add("is-loaded");
        };
        reader.readAsDataURL(file);
    });
});

loadCanvas();
