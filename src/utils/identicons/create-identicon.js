// based on https://github.com/Lobstrco/stellar-identicon-js/blob/master/index.js

const DEFAULT_SIZE = 7;
const {CryptoHelper} = global.kernel.helpers.crypto;

function generateEmptyMatrix(width, height) {
    var matrix = [];

    for (var i = 0; i < height; i ++) {
        var row  = [];
        for (var j = 0; j < width; j ++) {
            row.push(false);
        }

        matrix.push(row);
    }

    return matrix;
}

function getBit(position, bytes) {
    return (bytes[Math.floor(position / 8)] & (1 << (7 - position % 8))) === 0 ? 0 : 1;
}

function generateMatrix(bytes, symmetry) {
    var width = DEFAULT_SIZE,
        height = DEFAULT_SIZE;
    var matrix = generateEmptyMatrix(width, height);

    var columnsToCalculation = (symmetry ? Math.ceil(width / 2) : width);
    for (var column = 0; column < columnsToCalculation ; column ++) {
        for (var row = 0; row < height; row ++) {
            if (getBit(column + row * columnsToCalculation, bytes.slice(1))) {
                matrix[row][column] = true;

                if (symmetry) {
                    matrix[row][width - column - 1] = true;
                }
            }
        }
    }

    return matrix;
}

function drawMatrix(canvas, matrix) {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    const cellSize = canvas.width / matrix.length;
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');

        for (var row = 0; row < matrix.length; row ++) {
            for (var column = 0; column < matrix[row].length; column ++) {
                if (matrix[row][column]) {
                    ctx.fillRect(cellSize * column, cellSize * row, cellSize , cellSize);
                }
            }
        }
    }
}

function HSVtoRGB(h, s, v) {
    // Source https://stackoverflow.com/a/17243070

    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function setFillStyle(canvas, byte) {
    var ctx = canvas.getContext("2d");
    var color = HSVtoRGB(byte / 255, 0.7, 0.8)
    ctx.fillStyle = "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
}

function drawIdenticon(canvas, address ) {

    var bytes = CryptoHelper.dkeccak256(address);

    var matrix = generateMatrix(bytes, true);

    setFillStyle(canvas, bytes[0]);
    drawMatrix(canvas, matrix);
}

/**
 * Function to create canvas with logo generated from stellar address
 *
 * @param {string} stellarAddress - A valid stellar address
 * @param {object} options - Object with options for generated canvas
 * @return {canvas} generated logo
 */
function createIdenticon( address, options = {}) {

    options.width = options.width || 210;
    options.height = options.height || 210;

    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;

    drawIdenticon(canvas, address);

    return canvas;
}

export default createIdenticon;