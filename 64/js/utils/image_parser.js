function imageToCanvas(img) {
    if (img.tagName === "CANVAS") return img;
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return canvas;
}

function imageToCanvasCtx(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return ctx;
}

function imageToImageData(img) {
    const canvas = imageToCanvas(img);
    const ctx = canvas.getContext("2d");
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function analyzeImage(image) {
    return analyzeCanvas(imageToCanvas(image));
}

function analyzeCanvas(canvas, debugMode = false) {
    const ctx = canvas.getContext("2d");
    const analysis = analyzeImageDataColors(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (debugMode) {
        console.log('analysis === ', analysis);
        const analysisColorMap = analysis.colors.reduce((r, n, i) => {
            r[n] = 1;
            return r;
        }, {});
        console.log('analysisColorMap === ', JSON.stringify(analysisColorMap, null, 4));
    }
    return analysis;
}
function textCanvas(text, w = 100, h = 100) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    return canvas;
}

function analyzeImageData(imageData) { //alias
    return analyzeImageDataColors(imageData);
}

function analyzeImageDataColors(imageData) {
    const ret = {
        colors: ["transparent"],
        // colors: [],
        transparents: {},
        colorMap: {},
        grid: [],
        categories: {},
        islands: {},
        colorIndexMap: {},
        edgeMap: {},
        colorRamp: [],
        edges: {
            top: [],
            right: [],
            bottom: [],
            left: [],
        }
    };

    ret.grid = [...Array(imageData.height)].map(n => [...Array(imageData.width)].map(n => 0));
    for (let x = 0; x < imageData.width; x++) {
        for (let y = 0; y < imageData.height; y++) {
            const i = (x + y * imageData.width) * 4;
            if (imageData.data[i + 3] !== 0) {
                const r = imageData.data[i];
                const g = imageData.data[i + 1];
                const b = imageData.data[i + 2];
                const color = `rgb(${r},${g},${b})`;
                let colorIdx = ret.colors.indexOf(color);
                if (colorIdx === -1) {
                    colorIdx = ret.colors.length;
                    ret.colors.push(color);
                }
                ret.colorMap[`${x}_${y}`] = colorIdx;
                if (x === 0 && y === 0) {
                    //console.log('colorIdx === ',colorIdx);
                }
                ret.grid[y][x] = colorIdx;
            } else {
                // const color = `transparent`;
                // let colorIdx = ret.colors.indexOf(color);
                // if (colorIdx === -1) {
                //     colorIdx = ret.colors.length;
                //     ret.colors.push(color);
                // }
                ret.transparents[`${x}_${y}`] = 1;
                ret.grid[y][x] = 0;
            }
        }
    }

    const grid = ret.grid;
    ret.colors.forEach((rgbStr, i) => {
        ret.colorIndexMap[rgbStr] = i;
        // //console.log(rgbStr,i);
        // const [r,g,b] = rgbStr.split("(")[1].split(")")[0].split(",").map(n=>Number(n));
        // if( rgbStr === "rgb(56,56,56)" )//console.log(JSON.stringify(_grid,null,4));
        const locs = [];
        const _grid = JSON.parse(JSON.stringify(ret.grid));
        //console.log('_grid === ',_grid);
        _grid.forEach((row, y) => {
            row.forEach((v, x) => {
                // if( rgbStr === "rgb(56,56,56)" )//console.log('v === ',v);
                if (v !== i) {
                    _grid[y][x] = 0;
                } else {
                    const n = _grid[y - 1] && _grid[y - 1][x] === v;
                    const e = _grid[y][x + 1] === v;
                    const s = _grid[y + 1] && _grid[y + 1][x] === v;
                    const w = _grid[y][x - 1] === v;
                    const nw = _grid[y - 1] && _grid[y - 1][x - 1] === v;
                    const ne = _grid[y - 1] && _grid[y - 1][x + 1] === v;
                    const sw = _grid[y + 1] && _grid[y + 1][x - 1] === v;
                    const se = _grid[y + 1] && _grid[y + 1][x + 1] === v;
                    const neighbors = {
                        n,
                        e,
                        s,
                        w,
                        nw,
                        ne,
                        sw,
                        se
                    };
                    const n2 = grid[y - 1] && grid[y - 1][x] === 0;
                    const e2 = grid[y][x + 1] === 0;
                    const s2 = grid[y + 1] && grid[y + 1][x] === 0;
                    const w2 = grid[y][x - 1] === 0;
                    const nw2 = grid[y - 1] && grid[y - 1][x - 1] === 0;
                    const ne2 = grid[y - 1] && grid[y - 1][x + 1] === 0;
                    const sw2 = grid[y + 1] && grid[y + 1][x - 1] === 0;
                    const se2 = grid[y + 1] && grid[y + 1][x + 1] === 0;
                    const trans = {
                        n: n2,
                        e: e2,
                        s: s2,
                        w: w2,
                        nw: nw2,
                        ne: ne2,
                        sw: sw2,
                        se: se2
                    };
                    const tileIdx = getTileIdx(neighbors);
                    const neighborMap = {};
                    ret.colors.forEach((_rgbStr, _i) => {
                        const n = grid[y - 1] && grid[y - 1][x] === _i;
                        const e = grid[y][x + 1] === _i;
                        const s = grid[y + 1] && grid[y + 1][x] === _i;
                        const w = grid[y][x - 1] === _i;
                        const nw = grid[y - 1] && grid[y - 1][x - 1] === _i;
                        const ne = grid[y - 1] && grid[y - 1][x + 1] === _i;
                        const sw = grid[y + 1] && grid[y + 1][x - 1] === _i;
                        const se = grid[y + 1] && grid[y + 1][x + 1] === _i;
                        neighborMap[_rgbStr] = {
                            n,
                            e,
                            s,
                            w,
                            nw,
                            ne,
                            sw,
                            se
                        };
                    });
                    locs.push({
                        x,
                        y,
                        neighbors,
                        trans,
                        neighborMap,
                        tileIdx
                    });
                }
            });
        });
        // //console.log('locs === ',locs);
        const islands = gridToIslandsMeta(_grid, 1);
        ret.islands[rgbStr] = islands;
        ret.categories[rgbStr] = locs;
    });

    Object.keys(ret.categories)
        .filter(k => k !== "transparent")
        .forEach(k => {
            ret.categories[k].forEach(n => {
                let isEdge = false;
                if (n.trans.n || n.y === 0) {
                    ret.edges.top.push({
                        x: n.x,
                        y: n.y
                    });
                    isEdge = true;
                }
                if (n.trans.e || n.x === (grid[0].length - 1)) {
                    ret.edges.right.push({
                        x: n.x,
                        y: n.y
                    });
                    isEdge = true;
                }
                if (n.trans.s || n.y === (grid.length - 1)) {
                    ret.edges.bottom.push({
                        x: n.x,
                        y: n.y
                    });
                    isEdge = true;
                }
                if (n.trans.w || n.x === 0) {
                    ret.edges.left.push({
                        x: n.x,
                        y: n.y
                    });
                    isEdge = true;
                }
                if (isEdge) {
                    ret.edgeMap[`${n.x}_${n.y}`] = true;
                }
            });
        });

    ret.colorRamp = [...ret.colors].filter(n => n !== "transparent");
    ret.colorRamp.sort((a, b) => {
        const _a = a.replace("rgb(", "").replace(")", "").split(",").map(Number).reduce((r, n, i) => {
            r += n;
            return r;
        }, 0);
        const _b = b.replace("rgb(", "").replace(")", "").split(",").map(Number).reduce((r, n, i) => {
            r += n;
            return r;
        }, 0);
        return _a > _b ? 1 : -1;
    });

    Object.keys(ret.islands).forEach(color => {

        // console.log('color === ', color);

        Object.keys(ret.islands[color].islands).forEach(k => {
            const island = ret.islands[color].islands[k];
            // console.log('island === ',island);
            let edgeCount = 0;
            let edgeCountN = 0;
            let edgeCountE = 0;
            let edgeCountS = 0;
            let edgeCountW = 0;
            let outerEdgeCount = 0;
            let outerEdgeCountN = 0;
            let outerEdgeCountE = 0;
            let outerEdgeCountS = 0;
            let outerEdgeCountW = 0;
            for (let x = island.minX - 2; x <= island.maxX + 2; x++) {
                for (let y = island.minY - 2; y <= island.maxY + 2; y++) {
                    if (ret.transparents[`${x}_${y}`]) {
                        if (
                            x <= (island.maxX + 1) && x >= (island.minX - 1) &&
                            y <= (island.maxY + 1) && y >= (island.minY - 1)
                        ) {
                            edgeCount++;
                        }
                        if (y === (island.minY - 1)) edgeCountN++;
                        if (x === (island.maxX + 1)) edgeCountE++;
                        if (y === (island.maxY + 1)) edgeCountS++;
                        if (x === (island.minX - 1)) edgeCountW++;
                        if (y === (island.minY - 2)) outerEdgeCountN++;
                        if (x === (island.maxX + 2)) outerEdgeCountE++;
                        if (y === (island.maxY + 2)) outerEdgeCountS++;
                        if (x === (island.minX - 2)) outerEdgeCountW++;
                        outerEdgeCount++;
                    }
                }
            }
            island.edgeCount = edgeCount;
            island.edgeCountN = edgeCountN;
            island.edgeCountE = edgeCountE;
            island.edgeCountS = edgeCountS;
            island.edgeCountW = edgeCountW;
            island.outerEdgeCount = outerEdgeCount;
            island.outerEdgeCountN = outerEdgeCountN;
            island.outerEdgeCountE = outerEdgeCountE;
            island.outerEdgeCountS = outerEdgeCountS;
            island.outerEdgeCountW = outerEdgeCountW;
        })

    });

    ret.rgbMap = [];
    ret.colors.forEach(colorStr => {
        if (colorStr !== 'transparent') {
            const {
                r,
                g,
                b
            } = colorArrToRGBArr([colorStr])[0];
            ret.rgbMap.push({
                r,
                g,
                b
            });
        } else {
            ret.rgbMap.push({});
        }
    })

    return ret;

    function getTileIdx(n) {

        if (!n.n && !n.e && !n.s && !n.w) return 0;
        if (!n.n && !n.e && n.s && !n.w) return 1;
        if (!n.n && n.e && n.s && !n.w) return 2;
        if (!n.n && n.e && n.s && n.w) return 3;
        if (!n.n && !n.e && n.s && n.w) return 4;

        if (n.n && n.e && !n.s && !n.w) return 5;
        if (n.n && n.e && !n.s && n.w) return 6;
        if (n.n && !n.e && !n.s && n.w) return 7;

        // if(!n.n &&  n.e &&  n.s && !n.w)return 8;
        // if(!n.n && !n.e &&  n.s &&  n.w)return 9;

        if (n.n && !n.e && !n.s && !n.w) return 10;
        if (n.n && !n.e && n.s && !n.w) return 11;

        if (n.n && n.e && n.s && !n.w) return 12;
        if (n.n && n.e && n.s && n.w) return 13;
        if (n.n && !n.e && n.s && n.w) return 14;

        if (!n.n && n.e && !n.s && !n.w) return 15;
        if (!n.n && n.e && !n.s && n.w) return 16;
        if (!n.n && !n.e && !n.s && n.w) return 17;

        if (n.n && !n.e && !n.s && !n.w) return 11;
    }
}

function getColorCounts(imageData) {
    const ret = {};
    for (let x = 0; x < imageData.width; x++) {
        for (let y = 0; y < imageData.height; y++) {
            const i = (x + y * imageData.width) * 4;
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const a = imageData.data[i + 3];
            if (a > 0) {
                if (!ret[`rgb(${r},${g},${b})`]) ret[`rgb(${r},${g},${b})`] = 0;
                ret[`rgb(${r},${g},${b})`]++;
            }
        }
    }
    return ret;
}

function getColorNeighborCounts(imageData) {
    const ret = {};
    for (let x = 0; x < imageData.width; x++) {
        for (let y = 0; y < imageData.height; y++) {
            const i = (x + y * imageData.width) * 4;
            const i2 = ((x - 1) + y * imageData.width) * 4;
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const a = imageData.data[i + 3];
            const k0 = `rgb(${r},${g},${b})`;
            if (a > 0) {
                let k1 = "";
                if (i2 > 0) {
                    const r2 = imageData.data[i2];
                    const g2 = imageData.data[i2 + 1];
                    const b2 = imageData.data[i2 + 2];
                    const a2 = imageData.data[i2 + 3];
                    if (a2 > 0) {
                        k1 = `rgb(${r2},${g2},${b2})`;
                        const k = `${k0}_${k1}`;
                        if (!ret[k]) ret[k] = 0;
                        ret[k]++;
                    }
                }
            }
        }
    }
    return ret;
}

function getImageDataTilemap(imageData, colorArr) {
    if (!colorArr) {
        colorArr = Object.keys(countImageDataColors(imageData)).map(n => {
            return n.replace("rgba(", "").split(",").slice(0, -1).join(":");
        });
    }
    // //console.log('colorArr === ',colorArr);
    const ret = [];
    const w = imageData.width;
    const h = imageData.height;
    for (let y = 0; y < h; y++) {
        const row = [];
        for (let x = 0; x < w; x++) {
            const i = (x + y * w) * 4;
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const a = imageData.data[i + 3];
            let id = 0;
            if (a > 0) {
                const idx = colorArr.indexOf(`${r}:${g}:${b}`);
                // //console.log('idx === ', idx);
                id = idx + 1;
            }
            row.push(id);
        }
        ret.push(row);
    }
    return ret;
}

function getImageDataGrid(imgOrCanvas, cw = 32, ch = 32, xo = 0, yo = 0, accessor) {
    const ret = {};
    const canvas = imageToCanvas(imgOrCanvas);
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, imgOrCanvas.width, imgOrCanvas.height);
    const w = imageData.width;
    const h = imageData.height;
    let _x = 0;
    let _y = 0;
    for (let x = xo; x < w; x += cw) {
        for (let y = yo; y < h; y += ch) {
            const _imageData = ctx.getImageData(x, y, cw, ch);
            if (accessor) {
                accessor(_imageData);
            }
            ret[`${_x}_${_y}`] = _imageData;
            _y++;
        }
        _x++;
        _y = 0;
    }
    return ret;
}

function getLinearImageDataGrid(imgOrCanvas, cw = 32, ch = 32, xo = 0, yo = 0, accessor = undefined, g = 0) {
    const ret = [];
    const canvas = imageToCanvas(imgOrCanvas);
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, imgOrCanvas.width, imgOrCanvas.height);
    const w = imageData.width;
    const h = imageData.height;
    for (let y = yo; y < h; y += (ch + g)) {
        for (let x = xo; x < w; x += (cw + g)) {
            const _imageData = ctx.getImageData(x, y, cw, ch);
            if (accessor) {
                accessor(_imageData);
            }
            ret.push(_imageData);
        }
    }
    return ret;
}

function imageDataGridToImageData(arr) {
    const ret = [];
    // const p = arr[0].width;
    const maxW = Math.max(...arr.map(n => n.width));
    const maxH = Math.max(...arr.map(n => n.height));
    const sqrt = Math.sqrt(arr.length);
    const canvas = document.createElement('canvas');
    const w = canvas.width = sqrt * maxW;
    const h = canvas.height = sqrt * maxH;
    const ctx = canvas.getContext('2d');
    //console.log('sqrt === ',sqrt);
    // const imageData = ctx.getImageData(0, 0, img.width, img.height);
    let i = 0;
    for (let x = 0; x < w; x += maxW) {
        for (let y = 0; y < h; y += maxH) {
            ctx.putImageData(arr[i], x, y);
            i++;
        }
    }
    return canvasToImageData(canvas);
}

function imageDataGridToCanvas(arr, cw = 1, ch = 1) {
    const ret = [];
    // const p = arr[0].width;
    cw = Math.max(...arr.map(n => n.width));
    ch = Math.max(...arr.map(n => n.height));
    const sqrt = Math.ceil(Math.sqrt(arr.length));
    const canvas = document.createElement('canvas');
    const w = canvas.width = sqrt * cw;
    const h = canvas.height = sqrt * ch;
    const ctx = canvas.getContext('2d');
    //console.log('sqrt === ',sqrt);
    // const imageData = ctx.getImageData(0, 0, img.width, img.height);
    let i = 0;
    for (let x = 0; x < w; x += cw) {
        for (let y = 0; y < h; y += ch) {
            if (arr[i]) {
                ctx.putImageData(arr[i], x, y);
                i++;
            } else {
                break;
            }
        }
    }
    return canvas;
}

function sliceCanvas(...args) {
    const imgDataArr = getLinearImageDataGrid(...args);
    // console.log("imgDataArr:", imgDataArr);
    return imgDataArr.map(imageData => {
        return imageDataToCanvas(imageData);
    });
}

function getBoundedLinearImageDataGrid(img, cw = 32, ch = 32, xo = 0, yo = 0, accessor = undefined, g = 0) {
    const ret = [];
    const canvas = imageToCanvas(img);
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const w = imageData.width;
    const h = imageData.height;
    for (let y = yo; y < h; y += (ch + g)) {
        for (let x = xo; x < w; x += (cw + g)) {
            const _imageData = trimImageData(
                ctx.getImageData(x, y, cw, ch)
            );
            if (accessor) {
                accessor(_imageData);
            }
            ret.push(_imageData);
        }
    }
    return ret;
}

function flipImageData(imageData, horiz = false, vert = false) {
    const w = imageData.width;
    const h = imageData.height;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const flippedImageData = ctx.createImageData(w, h);
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = _i(x, y);
            const i2 = _i(
                horiz ? w - x - 1 : x,
                vert ? h - y - 1 : y,
            );
            flippedImageData.data[i2] = imageData.data[i];
            flippedImageData.data[i2 + 1] = imageData.data[i + 1];
            flippedImageData.data[i2 + 2] = imageData.data[i + 2];
            flippedImageData.data[i2 + 3] = imageData.data[i + 3];
        }
    }
    return flippedImageData;

    function _i(x, y) {
        return (x + y * imageData.width) * 4;
    }
}

function flipCanvas(canvas, horiz = false, vert = false) {
    return imageDataToCanvas(
        flipImageData(
            canvasToImageData(canvas),
            horiz,
            vert
        )
    );
}

function rotateImageData(imageData, radians) {
    const w = imageData.width;
    const h = imageData.height;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    const flippedImageData = ctx.createImageData(w, h);

    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = _i(x, y);
            const i2 = _i(
                (x * Math.cos(radians)) - (y * Math.sin(radians)),
                (x * Math.sin(radians)) - (y * Math.cos(radians)),
            );
            flippedImageData.data[i2] = imageData.data[i];
            flippedImageData.data[i2 + 1] = imageData.data[i + 1];
            flippedImageData.data[i2 + 2] = imageData.data[i + 2];
            flippedImageData.data[i2 + 3] = imageData.data[i + 3];
        }
    }
    return flippedImageData;

    function _i(x, y) {
        return (x + y * imageData.width) * 4;
    }
}

function countImageDataColors(imageData) {
    const w = imageData.width;
    const h = imageData.height;
    const colorCounts = {};
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * w) * 4;
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const a = imageData.data[i + 3];
            const key = `rgba(${r},${g},${b},${a})`;
            if (!colorCounts[key]) colorCounts[key] = 0;
            colorCounts[key]++;
        }
    }
    return colorCounts;
}

function hex2rgb(hex, opacity) {
    var h = hex.replace('#', '');
    h = h.match(new RegExp('(.{' + h.length / 3 + '})', 'g'));

    for (var i = 0; i < h.length; i++)
        h[i] = parseInt(h[i].length == 1 ? h[i] + h[i] : h[i], 16);

    if (typeof opacity != 'undefined') h.push(opacity);

    return {
        r: h[0],
        g: h[1],
        b: h[2],
        a: 255
    };
}

function replaceImageDataColor(imageData, rgba, rgba2, softAlpha = false) {
    if (typeof rgba2 === "string") {
        rgba2 = hex2rgb(rgba2);
    }
    const w = imageData.width;
    const h = imageData.height;
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * w) * 4;
            const r = rgba.r === imageData.data[i];
            const g = rgba.g === imageData.data[i + 1];
            const b = rgba.b === imageData.data[i + 2];
            const a = imageData.data[i + 3] && softAlpha || rgba.a === imageData.data[i + 3];
            if (r && g && b && a) {
                imageData.data[i] = rgba2.r;
                imageData.data[i + 1] = rgba2.g;
                imageData.data[i + 2] = rgba2.b;
                imageData.data[i + 3] = rgba2.a;
            }
        }
    }
}

function replaceImageDataColors(imageData, colorMap, preserveAlpha = true) {
    if (typeof colorMap[Object.keys(colorMap)[0]] === "string") {
        const colorArr = Object.keys(colorMap).map(k => {
            return colorMap[k];
        });
        const rgbArr = colorArrToRGBArr(colorArr);
        Object.keys(colorMap).forEach((k, i) => {
            colorMap[k] = rgbArr[i];
        });
    }
    const w = imageData.width;
    const h = imageData.height;
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * w) * 4;
            const r0 = imageData.data[i];
            const g0 = imageData.data[i + 1];
            const b0 = imageData.data[i + 2];
            const a0 = imageData.data[i + 3];
            const colorKey = `rgb(${r0},${g0},${b0})`;
            if (colorMap[colorKey]) {
                const {
                    r,
                    g,
                    b
                } = colorMap[colorKey];
                imageData.data[i] = r;
                imageData.data[i + 1] = g;
                imageData.data[i + 2] = b;
                imageData.data[i + 3] = preserveAlpha ? a0 : 255;
            }
        }
    }
    return imageData;
}

function replaceCanvasColors(canvas, colorMap, preserveAlpha = true) {
    const imageData = canvasToImageData(canvas);
    return imageDataToCanvas(
        replaceImageDataColors(imageData, colorMap)
    );
}

function removeImageDataColor(imageData, rgba) {
    replaceImageDataColor(imageData, rgba, {
        r: 0,
        g: 0,
        b: 0,
        a: 0
    });
}

function whiteListImageDataColors(imageData, rgbaArr) {
    const w = imageData.width;
    const h = imageData.height;
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * w) * 4;
            let remove = true;
            rgbaArr.forEach(rgba => {
                const r = rgba.r === imageData.data[i];
                const g = rgba.g === imageData.data[i + 1];
                const b = rgba.b === imageData.data[i + 2];
                const a = rgba.a === imageData.data[i + 3];
                if (r && g && b && a) {
                    imageData.data[i] = rgba2.r;
                    imageData.data[i + 1] = rgba2.g;
                    imageData.data[i + 2] = rgba2.b;
                    imageData.data[i + 3] = rgba2.a;
                    remove = false;
                }
            });
            if (remove) {
                imageData.data[i] = 0;
                imageData.data[i + 1] = 0;
                imageData.data[i + 2] = 0;
                imageData.data[i + 3] = 0;
            }
        }
    }
}

function fullAlphaImageData(imageData) {
    const w = imageData.width;
    const h = imageData.height;
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * w) * 4;
            if (imageData.data[i + 3] > 0) {
                imageData.data[i + 3] = 255;
            }
        }
    }
    return imageData;
}

function filterAlphaImageData(imageData, filter) {
    const w = imageData.width;
    const h = imageData.height;
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * w) * 4;
            if (filter(imageData.data[i + 3])) {
                imageData.data[i + 3] = 255;
            } else {
                imageData.data[i + 3] = 0;
            }
        }
    }
    return imageData;
}

function getPixelsFromImageData(imageData, rgba) {
    const w = imageData.width;
    const h = imageData.height;
    const points = [];
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * w) * 4;
            const r = rgba.r === imageData.data[i];
            const g = rgba.g === imageData.data[i + 1];
            const b = rgba.b === imageData.data[i + 2];
            const a = !rgba.a || rgba.a === imageData.data[i + 3];
            if (r && g && b && a) {
                points.push([x, y]);
            }
        }
    }
    return points;
}

function fillTransparentNeighbors(imageData, ignoreRGBAArr, fillRGBA) {
    const w = imageData.width;
    const h = imageData.height;
    const cache = {};
    const filledCache = {};
    for (let x = 0; x < w; x++) {
        if (!filledCache[x]) filledCache[x] = {};
        for (let y = 0; y < h; y++) {
            const i = (x + y * w) * 4;
            // //console.log('ignore(i), x, y === ',ignore(i), x, y);
            if (imageData.data[i + 3] > 0 && !ignore(i) && !filledCache[x][y]) {
                maybeFillNeighbor(x, y - 1); //n
                maybeFillNeighbor(x, y + 1); //s
                maybeFillNeighbor(x + 1, y); //e
                maybeFillNeighbor(x - 1, y); //w
            }
        }
    }

    function maybeFillNeighbor(x, y) {
        const _i = (x + y * w) * 4;
        if (!cache[x]) cache[x] = {};
        if (!cache[x][y]) {
            cache[x][y] = {
                r: imageData.data[_i],
                g: imageData.data[_i + 1],
                b: imageData.data[_i + 2],
                a: imageData.data[_i + 3]
            }
        }
        if (cache[x][y].a === 0) {
            if (!filledCache[x]) filledCache[x] = {};
            filledCache[x][y] = 1;
            cache[x][y].r = imageData.data[_i] = fillRGBA.r;
            cache[x][y].g = imageData.data[_i + 1] = fillRGBA.g;
            cache[x][y].b = imageData.data[_i + 2] = fillRGBA.b;
            cache[x][y].a = imageData.data[_i + 3] = fillRGBA.a;
        }
    }

    function ignore(_i) {
        let count = 0;
        ignoreRGBAArr.forEach(rgba => {
            if (rgba.r === imageData.data[_i] &&
                rgba.g === imageData.data[_i + 1] &&
                rgba.b === imageData.data[_i + 2] &&
                rgba.a === imageData.data[_i + 3]) {
                // //console.log(`${rgba.r} === ${imageData.data[_i]}
                // || ${rgba.g} === ${imageData.data[_i + 1]}
                // || ${rgba.b} === ${imageData.data[_i + 2]}
                // || ${rgba.a} === ${imageData.data[_i + 3]}`);
                count++;
            }
        });
        return count > 0;
    }
}

function outlineImageData(imageData, ignoreRGBAArr, fillRGBA, sides = {
    n: true,
    s: true,
    e: true,
    w: true,
    nw: true,
    ne: true,
    sw: true,
    se: true
}) {
    const w = imageData.width;
    const h = imageData.height;
    const cache = {};
    const filledCache = {};
    for (let x = 0; x < w; x++) {
        if (!filledCache[x]) filledCache[x] = {};
        for (let y = 0; y < h; y++) {
            const i = (x + y * w) * 4;

            if (imageData.data[i + 3] > 0 && !ignore(i) && !filledCache[x][y]) {
                if (sides.n) maybeFillNeighbor(x, y - 1); //n
                if (sides.s) maybeFillNeighbor(x, y + 1); //s
                if (sides.e) maybeFillNeighbor(x + 1, y); //e
                if (sides.w) maybeFillNeighbor(x - 1, y); //w
                if (sides.nw) maybeFillNeighbor(x - 1, y - 1); //nw
                if (sides.ne) maybeFillNeighbor(x + 1, y - 1); //ne
                if (sides.sw) maybeFillNeighbor(x - 1, y + 1); //sw
                if (sides.se) maybeFillNeighbor(x + 1, y + 1); //se
            }
        }
    }

    function maybeFillNeighbor(x, y) {
        const _i = (x + y * w) * 4;
        if (!cache[x]) cache[x] = {};
        if (!cache[x][y]) {
            cache[x][y] = {
                r: imageData.data[_i],
                g: imageData.data[_i + 1],
                b: imageData.data[_i + 2],
                a: imageData.data[_i + 3]
            }
        }
        if (cache[x][y].a === 0) {
            if (!filledCache[x]) filledCache[x] = {};
            filledCache[x][y] = 1;
            cache[x][y].r = imageData.data[_i] = fillRGBA.r;
            cache[x][y].g = imageData.data[_i + 1] = fillRGBA.g;
            cache[x][y].b = imageData.data[_i + 2] = fillRGBA.b;
            cache[x][y].a = imageData.data[_i + 3] = fillRGBA.a;
        }
    }

    function ignore(_i) {
        let count = 0;
        ignoreRGBAArr.forEach(rgba => {
            if (rgba.r === imageData.data[_i] &&
                rgba.g === imageData.data[_i + 1] &&
                rgba.b === imageData.data[_i + 2] &&
                rgba.a === imageData.data[_i + 3]) {
                // //console.log(`${rgba.r} === ${imageData.data[_i]}
                // || ${rgba.g} === ${imageData.data[_i + 1]}
                // || ${rgba.b} === ${imageData.data[_i + 2]}
                // || ${rgba.a} === ${imageData.data[_i + 3]}`);
                count++;
            }
        });
        return count > 0;
    }
}

function gridToCollisionCanvas(grid, scale = 1, zeroColor = {
    r: 0,
    g: 0,
    b: 0,
    a: 255
}, nonZeroColor = {
    r: 255,
    g: 255,
    b: 255,
    a: 255
}) {
    // this assumes grid cell values are integers
    const canvas = document.createElement('canvas');
    const w = canvas.width = grid[0].length;
    const h = canvas.height = grid.length;
    const ctx = canvas.getContext("2d");
    const imageData = canvasToImageData(canvas);
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * w) * 4;
            const rgba = grid[y][x] === 0 ? zeroColor : nonZeroColor;
            imageData.data[i] = rgba.r;
            imageData.data[i + 1] = rgba.g;
            imageData.data[i + 2] = rgba.b;
            imageData.data[i + 3] = rgba.a;
        }
    }
    if (scale === 1) {
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    } else {
        return imageDataToCanvas(scaleImageData(imageData, scale));
    }
}

function colorCanvas(color, w = 10, h = 10) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);
    return canvas;
}

function powerCanvas(canvas, power) {
    const n = power * power;
    return stitchCanvas([...Array(n)].map(n => canvas));
}

function horizontalPowerCanvas(canvas, power) {
    const n = power * power;
    return stitchCanvas([...Array(n)].map(n => canvas));
}

function stretchCanvas(canvas, w, h) {
    const _canvas = document.createElement('canvas');
    _canvas.width = w;
    _canvas.height = h;
    const _ctx = _canvas.getContext('2d');
    const ctx = canvas.getContext('2d');
    const _data = ctx.getImageData(0, 0, 1, canvas.height);
    const _data2 = ctx.getImageData(canvas.width - 1, 0, 1, canvas.height);
    const hw = Math.round(w / 2);
    const hh = Math.round(h / 2);
    for (let x = 0; x < w; x++) {
        if (x >= hw) {
            _ctx.putImageData(_data2, x, 0);
        } else {
            _ctx.putImageData(_data, x, 0);
        }
    }
    const _x = hw - Math.round(canvas.width / 2);
    const _y = hh - Math.round(canvas.height / 2);
    _ctx.drawImage(
        canvas,
        _x,
        _y
    );
    return _canvas;
}

function stitchHorizontalCanvas(arr) {
    const canvas = document.createElement('canvas');
    const cw = arr[0].width;
    const ch = arr[0].height;
    canvas.width = cw * arr.length;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    let i = 0;
    for (let x = 0; x < arr.length; x++) {
        if (arr[i]) ctx.drawImage(arr[i], x * cw, 0);
        i++;
    }
    return canvas;
}

function stitchCanvas(arr, cols, rows) {
    const sqrt = Math.ceil(Math.sqrt(arr.length));
    if (!cols) cols = sqrt;
    if (!rows) rows = sqrt;
    const canvas = document.createElement('canvas');
    const cw = arr[0].width;
    const ch = arr[0].height;
    canvas.width = cw * cols;
    canvas.height = ch * rows;
    const ctx = canvas.getContext('2d');
    let i = 0;
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (arr[i]) ctx.drawImage(arr[i], x * cw, y * ch);
            i++;
        }
    }
    return canvas;
}

function randCanvas(arr, w, h) {
    const canvas = document.createElement('canvas');
    const cw = arr[0].width;
    const ch = arr[0].height;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    for (let y = 0; y < h; y += ch) {
        for (let x = 0; x < w; x += cw) {
            const i = Math.floor(Math.random() * arr.length);
            ctx.drawImage(arr[i], x, y);
        }
    }
    return canvas;
}

function rotateCanvas(canvas) {
    const imgData = canvasToImageData(canvas);
    return imageDataToCanvas(
        rotateImageDataCounterClockwise(imgData)
    );
}

function rotateImageDataCounterClockwise(imageData) {
    const w = imageData.width;
    const h = imageData.height;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    const flippedImageData = ctx.createImageData(w, h);
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = _i(x, y);
            const x2 = y;
            const y2 = h - x - 1;
            const i2 = _i(
                x2,
                y2
            );
            flippedImageData.data[i2] = imageData.data[i];
            flippedImageData.data[i2 + 1] = imageData.data[i + 1];
            flippedImageData.data[i2 + 2] = imageData.data[i + 2];
            flippedImageData.data[i2 + 3] = imageData.data[i + 3];
        }
    }
    return flippedImageData;
    // return flipImageData(flippedImageData, true);

    function _i(x, y) {
        return (x + y * imageData.width) * 4;
    }
}

function copyCanvas(canvas) {
    const id = canvasToImageData(canvas);
    return imageDataToCanvas(id);
}

function cloneCanvas(canvas) {
    return copyCanvas(canvas);
}

function cloneImageData(imageData, xo = 0, yo = 0, wo = 0, ho = 0) {
    return copyImageData(...arguments);
}

function copyImageData(imageData, xo = 0, yo = 0, wo = 0, ho = 0) {
    const canvas = document.createElement('canvas');
    const w = canvas.width = imageData.width + wo;
    const h = canvas.height = imageData.height + ho;
    const ctx = canvas.getContext('2d');
    const imageData2 = ctx.createImageData(w, h);
    for (let x = 0; x < w - wo; x++) {
        for (let y = 0; y < h - ho; y++) {
            const i = (x + y * imageData.width) * 4;
            if (imageData.data[i + 3] > 0) {
                const i2 = ((x + xo) + (y + yo) * imageData2.width) * 4;
                imageData2.data[i2] = imageData.data[i];
                imageData2.data[i2 + 1] = imageData.data[i + 1];
                imageData2.data[i2 + 2] = imageData.data[i + 2];
                imageData2.data[i2 + 3] = imageData.data[i + 3];
            }
        }
    }
    return imageData2;
}

function padCanvas(canvas, padding = 1) {
    const imageData = canvasToImageData(canvas);
    const paddedImageData = padImageData(imageData, padding);
    return imageDataToCanvas(paddedImageData);
}

function padImageData(imageData, padding = 1) {
    const canvas = document.createElement('canvas');
    const w = canvas.width = imageData.width + (padding * 2);
    const h = canvas.height = imageData.height + (padding * 2);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, padding, padding);
    const imageData2 = ctx.getImageData(0, 0, w, h);
    return imageData2;
}

function cloneImageDataByColor(imageData, rgb) {
    return copyImageDataByColor(...arguments);
}

function copyImageDataByColor(imageData, rgb) {
    const canvas = document.createElement('canvas');
    const w = canvas.width = imageData.width;
    const h = canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    const imageData2 = ctx.createImageData(w, h);
    for (let x = 0; x < w - wo; x++) {
        for (let y = 0; y < h - ho; y++) {
            const i = (x + y * imageData.width) * 4;
            if (imageData.data[i + 3] > 0) {
                const {
                    r,
                    g,
                    b
                } = rgb;
                if (imageData.data[i] === r && imageData.data[i + 1] === g && imageData.data[i + 2] === b) {
                    const i2 = ((x) + (y) * imageData2.width) * 4;
                    imageData2.data[i2] = imageData.data[i];
                    imageData2.data[i2 + 1] = imageData.data[i + 1];
                    imageData2.data[i2 + 2] = imageData.data[i + 2];
                    imageData2.data[i2 + 3] = imageData.data[i + 3];
                }
            }
        }
    }
    return imageData2;
}

function cropCanvas(canvas, xo, yo, w, h) {
    const imageData = canvasToImageData(canvas);
    return imageDataToCanvas(cropImageData(imageData, xo, yo, w, h));
}

function cropImageData(imageData, xo, yo, w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    const imageData2 = ctx.createImageData(w, h);
    for (let x = xo; x < w + xo; x++) {
        for (let y = yo; y < h + yo; y++) {
            const i = (x + y * imageData.width) * 4;
            const i2 = ((x - xo) + (y - yo) * w) * 4;
            if (imageData.data[i + 3] > 0) {
                imageData2.data[i2] = imageData.data[i];
                imageData2.data[i2 + 1] = imageData.data[i + 1];
                imageData2.data[i2 + 2] = imageData.data[i + 2];
                imageData2.data[i2 + 3] = imageData.data[i + 3];
            }
        }
    }
    return imageData2;
}

function cropImageToCanvas(image, xo, yo, w, h) {
    const ctx = imageToCanvasCtx(image);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const canvas2 = document.createElement('canvas');
    canvas2.width = w;
    canvas2.height = h;
    const ctx2 = canvas2.getContext('2d');
    const imageData2 = ctx2.createImageData(w, h);
    for (let x = xo; x < w + xo; x++) {
        for (let y = yo; y < h + yo; y++) {
            const i = (x + y * imageData.width) * 4;
            const i2 = ((x - xo) + (y - yo) * w) * 4;
            if (imageData.data[i + 3] > 0) {
                imageData2.data[i2] = imageData.data[i];
                imageData2.data[i2 + 1] = imageData.data[i + 1];
                imageData2.data[i2 + 2] = imageData.data[i + 2];
                imageData2.data[i2 + 3] = imageData.data[i + 3];
            }
        }
    }
    ctx2.putImageData(imageData2, 0, 0);
    return canvas2;
}

function createImageData(width, height, colors = {}) {
    const canvas = document.createElement('canvas');
    const w = canvas.width = width;
    const h = canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(w, h);
    Object.keys(colors).forEach(color => {
        const [r, g, b, a] = color.split("_").map(n => Number(n));
        const points = colors[color];
        points.forEach(point => {
            const [x, y] = point;
            const i = (x + y * w) * 4;
            imageData.data[i] = r;
            imageData.data[i + 1] = g;
            imageData.data[i + 2] = b;
            imageData.data[i + 3] = a === undefined ? 255 : a;
        })
    })
    return imageData;
}

function maskImageData(imageData, imageData2, xo, yo) {
    const w = imageData.width;
    const h = imageData.height;
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * imageData.width) * 4;
            const x2 = x - xo;
            const y2 = y - yo;
            const i2 = (x2 + y2 * imageData2.width) * 4;
            const visible = imageData.data[i + 3] && imageData.data[i + 3] > 0;
            const visible2 = imageData2.data[i2 + 3] && imageData2.data[i2 + 3] > 0;
            if (visible && visible2) {
                imageData.data[i] = imageData2.data[i2];
                imageData.data[i + 1] = imageData2.data[i2 + 1];
                imageData.data[i + 2] = imageData2.data[i2 + 2];
                imageData.data[i + 3] = imageData2.data[i2 + 3];
            }
        }
    }
}
function concatHorizCanvas(canvas1, canvas2) {
    const imageData1 = canvasToImageData(canvas1);
    const imageData2 = canvasToImageData(canvas2);
    const imageData = concatHorizImageData(imageData1, imageData2);
    return imageDataToCanvas(imageData);
}
function concatHorizImageData(imageData1, imageData2) {
    const imageData = createImageData(imageData1.width + imageData2.width, imageData1.height);
    mergeImageData(imageData, imageData1);
    mergeImageData(imageData, imageData2, imageData1.width);
    return imageData;
}

function concatVertImageData(imageData1, imageData2) {
    const imageData = createImageData(imageData1.width, imageData1.height + imageData2.height);
    mergeImageData(imageData, imageData1);
    mergeImageData(imageData, imageData2, 0, imageData1.height);
    return imageData;
}

function mergeImageData(imageData, imageData2, xo = 0, yo = 0) {
    if (!imageData.data) {
        imageData = canvasToImageData(imageData);
    }
    if (!imageData2.data) {
        imageData2 = canvasToImageData(imageData2);
    }
    const w = imageData2.width;
    const h = imageData2.height;
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * imageData2.width) * 4;
            const x0 = x + xo;
            const y0 = y + yo;
            const i0 = (x0 + y0 * imageData.width) * 4;
            if (imageData2.data[i + 3] > 0 && x0 >= 0 && y0 >= 0 && x0 < imageData.width && y0 < imageData.height) {
                imageData.data[i0] = imageData2.data[i];
                imageData.data[i0 + 1] = imageData2.data[i + 1];
                imageData.data[i0 + 2] = imageData2.data[i + 2];
                imageData.data[i0 + 3] = imageData2.data[i + 3];
            }
        }
    }
    return imageData;
}

function mixImageData(imageData, imageData2, xo = 0, yo = 0) {
    // merge and average
    const w = imageData2.width;
    const h = imageData2.height;
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * imageData2.width) * 4;
            const x0 = x + xo;
            const y0 = y + yo;
            const i0 = (x0 + y0 * imageData.width) * 4;
            if (imageData2.data[i + 3] > 0 && x0 >= 0 && y0 >= 0 && x0 < imageData.width && y0 < imageData.height) {
                if (imageData.data[i0 + 3]) {
                    imageData.data[i0] = Math.ceil((imageData.data[i0] + imageData2.data[i]) / 2);
                    imageData.data[i0 + 1] = Math.ceil((imageData.data[i0 + 1] + imageData2.data[i + 1]) / 2);
                    imageData.data[i0 + 2] = Math.ceil((imageData.data[i0 + 2] + imageData2.data[i + 2]) / 2);
                    imageData.data[i0 + 3] = Math.ceil((imageData.data[i0 + 3] + imageData2.data[i + 3]) / 2);
                } else {
                    imageData.data[i0] = imageData2.data[i];
                    imageData.data[i0 + 1] = imageData2.data[i + 1];
                    imageData.data[i0 + 2] = imageData2.data[i + 2];
                    imageData.data[i0 + 3] = imageData2.data[i + 3];
                }
            }
        }
    }
    return imageData;
}

function trimImageData(imageData) {
    const b = imageDataBounds(imageData);
    // //console.log('b === ', b);
    return cropImageData(
        imageData,
        b.minX,
        b.minY,
        b.maxX - b.minX + 1,
        b.maxY - b.minY + 1
    );
}

function imageDataBounds(imageData) {
    const w = imageData.width;
    const h = imageData.height;
    const ret = {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * imageData.width) * 4;
            if (imageData.data[i + 3] > 0) {
                if (ret.minX > x) ret.minX = x;
                if (ret.maxX < x) ret.maxX = x;
                if (ret.minY > y) ret.minY = y;
                if (ret.maxY < y) ret.maxY = y;
            }
        }
    }
    // if(ret.maxY !== -Infinity) {
    //     for (let x = ret.minX; x <= ret.maxX; x++) {
    //         const y = ret.maxY;
    //         const i = (x + y * imageData.width) * 4;
    //         if(imageData.data[i + 3] > 0) {
    //             if (typeof ret.maxYminX === "undefined") {//TODO - wtf was I doing here??
    //                 ret.maxYminX = x;
    //             }
    //             if (typeof ret.maxYmaxX === "undefined" || ret.maxYmaxX < x) {//TODO - wtf was I doing here??
    //                 ret.maxYmaxX = x;
    //             }
    //         }
    //     }
    // }
    return ret;
}

function onionImageData(imageData, imageData2, xo, yo, alpha) {
    const w = imageData2.width;
    const h = imageData2.height;
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            const i = (x + y * imageData2.width) * 4;
            const x0 = x + xo;
            const y0 = y + yo;
            const i0 = (x0 + y0 * imageData.width) * 4;
            if (imageData2.data[i + 3] > 0) {
                imageData.data[i0] = imageData2.data[i];
                imageData.data[i0 + 1] = imageData2.data[i + 1];
                imageData.data[i0 + 2] = imageData2.data[i + 2];
                imageData.data[i0 + 3] = imageData2.data[i + 3];
            } else if (imageData.data[i0 + 3] > 0) {
                imageData.data[i0 + 3] = alpha;
            }
        }
    }
}

function partImageData(part, w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const _part = part.part ? part.part : part;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(
        _part.data,
        (w / 2) - (_part.cw / 2),
        (h / 2) - (_part.ch / 2)
    );
    return ctx.getImageData(0, 0, w, h);
}

function shiftImageData(imageData, x = 0, y = 0) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, x, y);
    return ctx.getImageData(0, 0, imageData.width, imageData.height);
}

function imageDataToCanvasScaled(imageData, scale, x = 0, y = 0) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width * scale;
    canvas.height = imageData.height * scale;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(scaleImageData(imageData, scale), x, y);
    return canvas;
}

function canvasToImageData(canvas) {
    if (!canvas.getContext) {
        canvas = imageToCanvas(canvas);
    }
    const ctx = canvas.getContext("2d");
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function imageDataToCanvas(imageData, x = 0, y = 0) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, x, y);
    return canvas;
}
function scaleDownCanvas(canvas, scale){
    const _scaledImageData = scaleDownImageData(
        canvasToImageData(canvas),
        1 / scale
    );
    return imageDataToCanvas(
        _scaledImageData
    );
}
function scaleCanvas(canvas, scale) {
    let _scaledImageData;
    if (scale < 1 && scale > 0) {
        _scaledImageData = scaleDownImageData(
            canvasToImageData(canvas),
            1 / scale
        );
    } else {
        _scaledImageData = scaleImageData(
            canvasToImageData(canvas),
            scale
        );
    }

    return imageDataToCanvas(
        _scaledImageData
    );
}

function scaleImageData(imageData, scale) {
    if (scale === 1) return imageData;
    var scaledImageData = document.createElement("canvas").getContext("2d").createImageData(imageData.width * scale, imageData.height * scale);
    for (var row = 0; row < imageData.height; row++) {
        for (var col = 0; col < imageData.width; col++) {
            var sourcePixel = [
                imageData.data[(row * imageData.width + col) * 4 + 0],
                imageData.data[(row * imageData.width + col) * 4 + 1],
                imageData.data[(row * imageData.width + col) * 4 + 2],
                imageData.data[(row * imageData.width + col) * 4 + 3]
            ];
            for (var y = 0; y < scale; y++) {
                var destRow = row * scale + y;
                for (var x = 0; x < scale; x++) {
                    var destCol = col * scale + x;
                    for (var i = 0; i < 4; i++) {
                        scaledImageData.data[(destRow * scaledImageData.width + destCol) * 4 + i] =
                            sourcePixel[i];
                    }
                }
            }
        }
    }
    return scaledImageData;
}

function scaleDownImageData(imageData, scale) {
    if (scale === 1) return imageData;
    var scaledImageData = document.createElement("canvas").getContext("2d").createImageData(
        Math.floor(imageData.width / scale),
        Math.floor(imageData.height / scale)
    );
    let y = 0;
    let x = 0;
    for (var row = 0; row < imageData.height; row += scale) {
        x = 0;
        for (var col = 0; col < imageData.width; col += scale) {
            var sourcePixel = [
                imageData.data[(row * imageData.width + col) * 4 + 0],
                imageData.data[(row * imageData.width + col) * 4 + 1],
                imageData.data[(row * imageData.width + col) * 4 + 2],
                imageData.data[(row * imageData.width + col) * 4 + 3]
            ];
            scaledImageData.data[(y * scaledImageData.width + x) * 4] = sourcePixel[0];
            scaledImageData.data[(y * scaledImageData.width + x) * 4 + 1] = sourcePixel[1];
            scaledImageData.data[(y * scaledImageData.width + x) * 4 + 2] = sourcePixel[2];
            scaledImageData.data[(y * scaledImageData.width + x) * 4 + 3] = sourcePixel[3];
            x++;
        }
        y++;
    }
    return scaledImageData;
}

function transformImageData(imageData, arr, padding = 0) {
    let scale = 1;
    arr.forEach(row => {
        switch (row.type) {
            case "replace":
                replaceImageDataColor(imageData, row.rgba, row.rgba2);
                break;
            case "scale":
                scale = row.scale;
                console.log('imageData === ',imageData);
                imageData = scaleImageData(imageData, row.scale);
                console.log('imageData === ',imageData);
                break;
            case "outline":
                fillTransparentNeighbors(
                    imageData,
                    row.ignore ?? [],
                    row.rgba
                );
                break;
            case "gradient":
                const canvas = document.createElement('canvas');
                const w = canvas.width = imageData.width;
                const h = canvas.height = imageData.height;
                const ctx = canvas.getContext('2d');
                const gradient = ctx.createLinearGradient(0, 0, 0, h);
                row.colors.forEach(n => {
                    gradient.addColorStop(...n);
                });
                ctx.fillStyle = gradient;
                ctx.fillRect(scale - 1, scale - 1, w, h);
                const imageData2 = ctx.getImageData(0, 0, w + 2, h + 2);
                maskImageData(imageData, imageData2, 0, 0);

                break;
            case "full-outline":
                const bounds = imageDataBounds(imageData);
                if (bounds.minX === 0 || bounds.minY === 0) {
                    imageData = copyImageData(
                        imageData,
                        1,
                        1,
                        2,
                        2
                    );
                    //console.log('imageData.width === ',imageData.width);
                    //console.log('imageData.height === ',imageData.height);
                }
                outlineImageData( //TODO - add room for the outline if it doesnt exist
                    imageData,
                    row.ignore ?? [],
                    row.rgba
                );
                break;
            case "partial-outline":
                const bounds2 = imageDataBounds(imageData);
                if (bounds2.minX === 0 || bounds2.minY === 0) {
                    imageData = copyImageData(
                        imageData,
                        1,
                        1,
                        2,
                        2
                    )

                    const bounds2b = imageDataBounds(imageData);

                    //console.log('bounds2b === ',bounds2b);
                }
                outlineImageData( //TODO - add room for the outline if it doesnt exist
                    imageData,
                    row.ignore ?? [],
                    row.rgba,
                    row.sides
                );
                break;
        }
    })
    return imageData;
}

function gradientTopDown(ctx, height, colors) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    colors.forEach(n => {
        gradient.addColorStop(...n);
    });
    return gradient;
}

function append_alpha(color, aa) {
    if (color && color[0] === "#" && color.length === 7) {
        return color + aa;
    }
    return color;
}
// function tilemapToTypedTilemap(tileMap, columnCount) {
//     return tileMap.map((arr,x)=>{
//         return arr.map((_,y)=>{
//             return getTileType(x, y);
//         })
//     })
//     function getTileType(x, y) {
//         const type = tileMap[x][y];

//         // LNE
//         /*****//*****/
//         /**6**//*[1]*/
//         /*****//*****/
//         /*****//*****/
//         /**5**//**7**/
//         /*****//*****/
//         // OSW
//         /*****//*****/
//         /**1**//*[1]*/
//         /*****//*****/
//         /*****//*****/
//         /**5**//**1**/
//         /*****//*****/
//         const _LNE = tileMap[x-1] && tileMap[x][y+1] !== type && tileMap[x-1][y] !== type && tileMap[x-1][y+1] !== type;
//         const _LNW = tileMap[x+1] && tileMap[x][y+1] !== type && tileMap[x+1][y] !== type && tileMap[x+1][y+1] !== type;
//         const _LSW = tileMap[x+1] && tileMap[x][y-1] !== type && tileMap[x+1][y] !== type && tileMap[x+1][y-1] !== type;
//         const _LSE = tileMap[x-1] && tileMap[x][y-1] !== type && tileMap[x-1][y] !== type && tileMap[x-1][y-1] !== type;
//         const _ONE = tileMap[x+1] && tileMap[x][y-1] === type && tileMap[x+1][y] === type && tileMap[x+1][y-1] !== type;
//         const _ONW = tileMap[x-1] && tileMap[x][y-1] === type && tileMap[x-1][y] === type && tileMap[x-1][y-1] !== type;
//         const _OSW = tileMap[x-1] && tileMap[x][y+1] === type && tileMap[x-1][y] === type && tileMap[x-1][y+1] !== type;
//         const _OSE = tileMap[x+1] && tileMap[x][y+1] === type && tileMap[x+1][y] === type && tileMap[x+1][y+1] !== type;
//         const _N = tileMap[x][y-1] !== type;
//         const _E = tileMap[x+1] && tileMap[x+1][y] !== type;
//         const _S = tileMap[x][y+1] !== type;
//         const _W = tileMap[x-1] && tileMap[x-1][y] !== type;

//         if(_LNE)return type + (columnCount * 10);
//         if(_LNW)return type + (columnCount * 11);
//         if(_LSE)return type + (columnCount * 4);
//         if(_LSW)return type + (columnCount * 5);
//         if(_ONW)return type + (columnCount * 23);
//         if(_ONE)return type + (columnCount * 25);
//         if(_OSE)return type + (columnCount * 26);
//         if(_OSW)return type + (columnCount * 24);
//         if(_N)return type + (columnCount * 1);
//         if(_S)return type + (columnCount * 9);
//         if(_E)return type + (columnCount * 3);
//         if(_W)return type + (columnCount * 2);
//         return type;
//     }
// }
function tilemapToTypedTilemap(tileMap, columnCount) {
    return tileMap.map((arr, y) => {
        return arr.map((_, x) => {
            return getTileType(x, y);
        })
    })

    function getTileType(_x, _y) {
        const type = tileMap[_y][_x];
        if (type === 0) return type;

        const no_N = tileMap[_y - 1] && typeof tileMap[_y - 1][_x] !== "undefined" && tileMap[_y - 1][_x] !== type;
        const no_E = typeof tileMap[_y][_x + 1] !== "undefined" && tileMap[_y][_x + 1] !== type;
        const no_S = tileMap[_y + 1] && typeof tileMap[_y + 1][_x] !== "undefined" && tileMap[_y + 1][_x] !== type;
        const no_W = typeof tileMap[_y][_x - 1] !== "undefined" && tileMap[_y][_x - 1] !== type;
        const no_NE = tileMap[_y - 1] && typeof tileMap[_y - 1][_x + 1] !== "undefined" && tileMap[_y - 1][_x + 1] !== type;
        const no_SE = tileMap[_y + 1] && typeof tileMap[_y + 1][_x + 1] !== "undefined" && tileMap[_y + 1][_x + 1] !== type;
        const no_SW = tileMap[_y + 1] && typeof tileMap[_y + 1][_x - 1] !== "undefined" && tileMap[_y + 1][_x - 1] !== type;
        const no_NW = tileMap[_y - 1] && typeof tileMap[_y - 1][_x - 1] !== "undefined" && tileMap[_y - 1][_x - 1] !== type;

        const typeMap = {
            "N_E_S_W": no_N && no_E && no_S && no_W,
            "NE_SE_SW_NW": (no_NE && !no_N && !no_E) && (no_SE && !no_S && !no_E) && (no_SW && !no_S && !no_W) && (no_NW && !no_N && !no_W),
            "N_E_S": no_N && no_E && no_S,
            "N_E_W": no_N && no_E && no_W,
            "N_E_SW": no_N && no_E && (no_SW && !no_S && !no_W),
            "N_S_W": no_N && no_S && no_W,
            "N_W_SE": no_N && no_W && (no_SE && !no_S && !no_E),
            "N_SE_SW": no_N && (no_SE && !no_S && !no_E) && (no_SW && !no_S && !no_W),
            "E_S_W": no_E && no_S && no_W,
            "E_S_NW": no_E && no_S && (no_NW && !no_N && !no_W),
            "E_SW_NW": no_E && (no_SW && !no_S && !no_W) && (no_NW && !no_N && !no_W),
            "S_W_NE": no_S && no_W && (no_NE && !no_N && !no_E),
            "S_NE_NW": no_S && (no_NE && !no_N && !no_E) && (no_NW && !no_N && !no_W),
            "W_NE_SE": no_W && (no_NE && !no_N && !no_E) && (no_SE && !no_S && !no_E),
            "NE_SW_NW": (no_NE && !no_N && !no_E) && (no_SW && !no_S && !no_W) && (no_NW && !no_N && !no_W),
            "NE_SE_SW": (no_NE && !no_N && !no_E) && (no_SE && !no_S && !no_E) && (no_SW && !no_S && !no_W),
            "NE_SE_NW": (no_NE && !no_N && !no_E) && (no_SE && !no_S && !no_E) && (no_NW && !no_N && !no_W),
            "SE_SW_NW": (no_SE && !no_S && !no_E) && (no_SW && !no_S && !no_W) && (no_NW && !no_N && !no_W),
            "N_E": no_N && no_E,
            "N_S": no_N && no_S,
            "N_W": no_N && no_W,
            "N_SE": no_N && (no_SE && !no_S && !no_E),
            "N_SW": no_N && (no_SW && !no_S && !no_W),
            "E_S": no_E && no_S,
            "E_W": no_E && no_W,
            "E_SW": no_E && (no_SW && !no_S && !no_W),
            "E_NW": no_E && (no_NW && !no_N && !no_W),
            "S_W": no_S && no_W,
            "S_NE": no_S && (no_NE && !no_N && !no_E),
            "S_NW": no_S && (no_NW && !no_N && !no_W),
            "W_NE": no_W && (no_NE && !no_N && !no_E),
            "W_SE": no_W && (no_SE && !no_S && !no_E),
            "NE_SE": (no_NE && !no_N && !no_E) && (no_SE && !no_S && !no_E),
            "NE_SW": (no_NE && !no_N && !no_E) && (no_SW && !no_S && !no_W),
            "NE_NW": (no_NE && !no_N && !no_E) && (no_NW && !no_N && !no_W),
            "SE_SW": (no_SE && !no_S && !no_E) && (no_SW && !no_S && !no_W),
            "SE_NW": (no_SE && !no_S && !no_E) && (no_NW && !no_N && !no_W),
            "SW_NW": (no_SW && !no_S && !no_W) && (no_NW && !no_N && !no_W),
            "NE": (no_NE && !no_N && !no_E),
            "SE": (no_SE && !no_S && !no_E),
            "SW": (no_SW && !no_S && !no_W),
            "NW": (no_NW && !no_N && !no_W),
            "N": no_N,
            "E": no_E,
            "S": no_S,
            "W": no_W,
            "SOLID": Math.random() > 0.62,
            "SOLID_ALT": Math.random() > 0.62,
            "SOLID_ALT2": Math.random() > 0.62,
            "SOLID_ALT3": true,
        };
        let idx = 0;
        const typeMapKeys = Object.keys(typeMap);
        for (const k of typeMapKeys) {
            if (typeMap[k]) {
                break;
            }
            idx++;
        }
        const ret = type + (columnCount * idx);
        // //console.log('_x, _y, ret === ',_x, _y, ret);
        // if(_x === 9 && _y === 8){
        //     debugger;
        // }
        return ret;
    }
}

function testingTileTypes() {
    // const a = [
    //     "N_E_S_W",
    //     "NE_SE_SW_NW",
    //     "N_E_S",
    //     "N_E_W",
    //     "N_E_SW",
    //     "N_S_W",
    //     "N_W_SE",
    //     "N_SE_SW",
    //     "E_S_W",
    //     "E_S_NW",
    //     "E_SW_NW",
    //     "S_W_NE",
    //     "S_NE_NW",
    //     "W_NE_SE",
    //     "NE_SW_NW",
    //     "NE_SE_SW",
    //     "NE_SE_NW",
    //     "SE_SW_NW",
    //     "N_E",
    //     "N_S",
    //     "N_W",
    //     "N_SE",
    //     "N_SW",
    //     "E_S",
    //     "E_W",
    //     "E_SW",
    //     "E_NW",
    //     "S_W",
    //     "S_NE",
    //     "S_NW",
    //     "W_NE",
    //     "W_SE",
    //     "NE_SE",
    //     "NE_SW",
    //     "NE_NW",
    //     "SE_SW",
    //     "SE_NW",
    //     "SW_NW",
    //     "NE",
    //     "SE",
    //     "SW",
    //     "NW",
    //     "N",
    //     "E",
    //     "S",
    //     "W",
    // ];

    var b = ['{'];
    var c = {};
    a.forEach(n => {
        const arr = n.split("_");
        if (c[n]) {
            console.error(n + "already exists");
        }
        c[n] = 1;
        b.push(`"${n}": ${
                arr.map(str=>{
                    if(str.length === 2) { // NE, SE, SW, NW
                        const [_a, _b] = str.split("");
                        return `(no_${str} && !no_${_a} && !no_${_b})`;
                    } else {
                        return `
            no_$ {
                str
            }
            `;
                    }
                }).join(" && ")
            },`);
    });
    b.push('}');
    //console.log(b.join("\n"));

    function calcNeighbors() {
        const [_n, _e, _s, _w, _ne, _se, _sw, _nw] = [...Array(8)].map(() => [0, 1]);
        let count = 0;

        _n.forEach(n => {
            _e.forEach(e => {
                _s.forEach(s => {
                    _w.forEach(w => {
                        _ne.forEach(ne => {
                            _se.forEach(se => {
                                _sw.forEach(sw => {
                                    _nw.forEach(nw => {
                                        if (n && e) count++;
                                    })
                                })
                            })
                        })
                        _se.forEach(se => {
                            _sw.forEach(sw => {
                                _nw.forEach(nw => {
                                    if (s && e) count++;
                                })
                            })
                        })
                        _sw.forEach(sw => {
                            _nw.forEach(nw => {
                                if (s && w) count++;
                            })
                        })
                        _nw.forEach(nw => {
                            if (n && w) count++;
                        })
                    })
                })
            })
        })
        //console.log('count === ', count);
    }
}

function fragmentsToTilesetCanvas(tileSize, fragmentsImage) {

    const xo = tileSize;

    const fragMap = {
        "N_E_S_W": [],
        "NE_SE_SW_NW": [],
        "N_E_S": [],
        "N_E_W": [], // no_N && no_E && no_W,
        "N_E_SW": [], // no_N && no_E && (no_SW && !no_S && !no_W),
        "N_S_W": [], // no_N && no_S && no_W,
        "N_W_SE": [], // no_N && no_W && (no_SE && !no_S && !no_E),
        "N_SE_SW": [], // no_N && (no_SE && !no_S && !no_E) && (no_SW && !no_S && !no_W),
        "E_S_W": [], // no_E && no_S && no_W,
        "E_S_NW": [], // no_E && no_S && (no_NW && !no_N && !no_W),
        "E_SW_NW": [], // no_E && (no_SW && !no_S && !no_W) && (no_NW && !no_N && !no_W),
        "S_W_NE": [], // no_S && no_W && (no_NE && !no_N && !no_E),
        "S_NE_NW": [], // no_S && (no_NE && !no_N && !no_E) && (no_NW && !no_N && !no_W),
        "W_NE_SE": [], // no_W && (no_NE && !no_N && !no_E) && (no_SE && !no_S && !no_E),
        "NE_SW_NW": [], // (no_NE && !no_N && !no_E) && (no_SW && !no_S && !no_W) && (no_NW && !no_N && !no_W),
        "NE_SE_SW": [], // (no_NE && !no_N && !no_E) && (no_SE && !no_S && !no_E) && (no_SW && !no_S && !no_W),
        "NE_SE_NW": [], // (no_NE && !no_N && !no_E) && (no_SE && !no_S && !no_E) && (no_NW && !no_N && !no_W),
        "SE_SW_NW": [], // (no_SE && !no_S && !no_E) && (no_SW && !no_S && !no_W) && (no_NW && !no_N && !no_W),
        "N_E": [], // no_N && no_E,
        "N_S": [], // no_N && no_S,
        "N_W": [], // no_N && no_W,
        "N_SE": [], // no_N && (no_SE && !no_S && !no_E),
        "N_SW": [], // no_N && (no_SW && !no_S && !no_W),
        "E_S": [], // no_E && no_S,
        "E_W": [], // no_E && no_W,
        "E_SW": [], // no_E && (no_SW && !no_S && !no_W),
        "E_NW": [], // no_E && (no_NW && !no_N && !no_W),
        "S_W": [], // no_S && no_W,
        "S_NE": [], // no_S && (no_NE && !no_N && !no_E),
        "S_NW": [], // no_S && (no_NW && !no_N && !no_W),
        "W_NE": [], // no_W && (no_NE && !no_N && !no_E),
        "W_SE": [], // no_W && (no_SE && !no_S && !no_E),
        "NE_SE": [], // (no_NE && !no_N && !no_E) && (no_SE && !no_S && !no_E),
        "NE_SW": [], // (no_NE && !no_N && !no_E) && (no_SW && !no_S && !no_W),
        "NE_NW": [], // (no_NE && !no_N && !no_E) && (no_NW && !no_N && !no_W),
        "SE_SW": [], // (no_SE && !no_S && !no_E) && (no_SW && !no_S && !no_W),
        "SE_NW": [], // (no_SE && !no_S && !no_E) && (no_NW && !no_N && !no_W),
        "SW_NW": [], // (no_SW && !no_S && !no_W) && (no_NW && !no_N && !no_W),
        "NE": [], // (no_NE && !no_N && !no_E),
        "SE": [], // (no_SE && !no_S && !no_E),
        "SW": [], // (no_SW && !no_S && !no_W),
        "NW": [], // (no_NW && !no_N && !no_W),
        "N": [], // no_N,
        "E": [], // no_E,
        "S": [], // no_S,
        "W": [], // no_W,
        "SOLID": [], // Math.random() > 0.62,
        "SOLID_ALT": [], // Math.random() > 0.62,
        "SOLID_ALT2": [], // Math.random() > 0.62,
        "SOLID_ALT3": [], // true,
    };

    const canvas2 = document.createElement('canvas');
    const ctx = canvas2.getContext("2d");
    const w2 = canvas2.width = fragmentsImage.width;
    const h2 = canvas2.height = fragmentsImage.height;

    ctx.drawImage(fragmentsImage, 0, 0);

    const canvas = document.createElement('canvas');
    canvas.width = fragmentsImage.width + tileSize;
    canvas.height = Object.keys(fragMap).length * tileSize;
    const _ctx = canvas.getContext('2d');

    const fragW = tileSize / 2;
    const fragH = tileSize / 2;

    _fragments_to_tilemap();

    return canvas;

    function _fragments_to_tilemap() {

        const fragData = [];

        [...Array(canvas.width / fragW)].forEach((_, i2) => {
            fragData.push([]);
            [...Array(canvas.height / fragH)].forEach((_, i) => {
                const _y = i * fragH;
                const _x = i2 * fragW;
                const imageData = ctx.getImageData(_x, _y, fragW, fragH);
                fragData[i2].push(imageData);
            })
        })

        const sideMap = {
            "N": [1, 0],
            "E": [1, 4],
            "S": [0, 4],
            "W": [0, 0],
            "NE": [1, 1],
            "SE": [1, 6],
            "SW": [0, 6],
            "NW": [0, 1]
        };
        [...Array(4)].forEach((_, _i) => {
            Object.keys(fragMap).forEach(k => {
                const sides = k.split("_");
                let ne_set = false;
                let se_set = false;
                let sw_set = false;
                let nw_set = false;
                const arr = [
                    [0, 0],
                    [0, 0],
                    [0, 0],
                    [0, 0]
                ];

                const _n = sides.indexOf("N") === -1;
                const _e = sides.indexOf("E") === -1;
                const _s = sides.indexOf("S") === -1;
                const _w = sides.indexOf("W") === -1;
                const _ne = sides.indexOf("NE") === -1;
                const _se = sides.indexOf("SE") === -1;
                const _sw = sides.indexOf("SW") === -1;
                const _nw = sides.indexOf("NW") === -1;

                const _0 = 0 + (2 * _i);
                const _1 = 1 + (2 * _i);

                // set north east fragment
                if (!_n && !_e) arr[0] = [_1, 0];
                else if (!_n && _e) arr[0] = [_1, 2];
                else if (_n && !_e) arr[0] = [_1, 3];
                else if (_n && _e && _ne) arr[0] = [_1, 8];
                else if (_n && _e) arr[0] = [_1, 1];

                // set south east fragment
                if (!_s && !_e) arr[1] = [_1, 4];
                else if (!_s && _e) arr[1] = [_1, 7];
                else if (_s && !_e) arr[1] = [_1, 5];
                else if (_s && _e && _se) arr[1] = [_1, 9];
                else if (_s && _e) arr[1] = [_1, 6];

                // set south west fragment
                if (!_s && !_w) arr[2] = [_0, 4];
                else if (!_s && _w) arr[2] = [_0, 7];
                else if (_s && !_w) arr[2] = [_0, 5];
                else if (_s && _w && _sw) arr[2] = [_0, 9];
                else if (_s && _w) arr[2] = [_0, 6];

                // set north west fragment
                if (!_n && !_w) arr[3] = [_0, 0];
                else if (!_n && _w) arr[3] = [_0, 2];
                else if (_n && !_w) arr[3] = [_0, 3];
                else if (_n && _w && _nw) arr[3] = [_0, 8];
                else if (_n && _w) arr[3] = [_0, 1];

                fragMap[k] = arr;
            });

            const col = 0;

            Object.keys(fragMap).forEach((k, i) => {
                const y = (i * (fragH * 2));
                const x = (col * (fragW * 2)) + (_i * (fragW * 2)) + xo;
                _ctx.putImageData(fragData[fragMap[k][0][0]][fragMap[k][0][1]], x + fragW, y);
                _ctx.putImageData(fragData[fragMap[k][1][0]][fragMap[k][1][1]], x + fragW, y + fragH);
                _ctx.putImageData(fragData[fragMap[k][2][0]][fragMap[k][2][1]], x, y + fragH);
                _ctx.putImageData(fragData[fragMap[k][3][0]][fragMap[k][3][1]], x, y);
            });
        });
    }
}

function mapImageData(mapImage, colorMap) {

    const analysis = analyzeImageData(mapImage);
    //console.log('analysis === ',analysis);

    //console.log('tileset === ',tileset);
    const w = tilemap[0].length * tileSize;
    const h = tilemap.length * tileSize;
    //console.log('w === ',w);
    //console.log('h === ',h);
    const grid = getLinearImageDataGrid(tileset, tileSize, tileSize);
    //console.log('grid === ',grid);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    //console.log('tilemap === ',tilemap);
    tilemap.forEach((n, y) => {
        n.forEach((v, x) => {
            const _x = x * tileSize;
            const _y = y * tileSize;
            ctx.putImageData(grid[v], _x, _y);
        })
    })
    return canvas;
}

function tilemapToCanvas(tilemap, tileset, tileSize) {
    //console.log('tileset === ',tileset);
    const w = tilemap[0].length * tileSize;
    const h = tilemap.length * tileSize;
    //console.log('w === ',w);
    //console.log('h === ',h);
    const grid = getLinearImageDataGrid(tileset, tileSize, tileSize);
    //console.log('grid === ',grid);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    //console.log('tilemap === ',tilemap);
    tilemap.forEach((n, y) => {
        n.forEach((v, x) => {
            const _x = x * tileSize;
            const _y = y * tileSize;
            ctx.putImageData(grid[v], _x, _y);
        })
    })
    return canvas;
}

function tilemapToDebugCanvas(tilemap, tileset, tileSize) {
    //console.log('tileset === ',tileset);
    const w = tilemap[0].length * tileSize;
    const h = tilemap.length * tileSize;
    //console.log('w === ',w);
    //console.log('h === ',h);
    const grid = getLinearImageDataGrid(tileset, tileSize, tileSize);
    //console.log('grid === ',grid);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    tilemap.forEach((n, y) => {
        n.forEach((v, x) => {
            const _x = x * tileSize;
            const _y = y * tileSize;
            ctx.fillText("" + v, _x, _y);
            // ctx.putImageData(grid[v], _x, _y);
        })
    })
    return canvas;
}

function splitIntoColumns(imageData) {
    const w = imageData.width;
    const h = imageData.height;
    const locs = [];
    for (let x = 0; x < w; x++) {
        let visibleCount = 0;
        for (let y = 0; y < h; y++) {
            const i = (x + y * w) * 4;
            const a = imageData.data[i + 3];
            if (a > 0) {
                visibleCount++;
            }
        }
        if (visibleCount === 0) {
            locs.push(x);
        }
    }
    return locs;
}

function imageDataBrightnessMap(imageData, maxZ, mode) {
    const grid = [];
    const brightMap = {};
    const analysis = analyzeImageData(imageData);
    let maxBrightness = -Infinity;
    //console.log('analysis.grid === ',analysis.grid);
    analysis.grid.forEach((row, y) => {
        grid.push(Array(imageData.width).fill(1));
        return row.forEach((v, x) => {
            const colorIdx = v;
            if (typeof brightMap[colorIdx] === "undefined") {
                brightMap[colorIdx] = analysis.colors[colorIdx] === "transparent" ? 0 : brightness(analysis.colors[colorIdx]);
            }
            if (maxBrightness < brightMap[colorIdx]) {
                maxBrightness = brightMap[colorIdx];
            }
        });
    });
    //console.log('brightMap === ',brightMap);
    analysis.grid.forEach((row, y) => {
        return row.forEach((colorIdx, x) => {
            grid[y][x] = Math.floor(brightMap[colorIdx] / maxBrightness * maxZ);
        });
    });
    return grid;

    function brightness(rgbStr) {
        const [r, g, b] = rgbStr.split("(")[1].split(")")[0].split(",").map(n => Number(n.trim()));
        if (mode === "all") {
            return r + g + b;
        } else if (mode === "r") {
            return r;
        } else if (mode === "g") {
            return g;
        } else if (mode === "b") {
            return b;
        }
    }
}

function addDataToImageData(imageData, str, charSize = 8, charSizeSize = 8, lenSizeSize = 64) {
    let binStr = str2bin(charSize, charSizeSize);
    binStr += str2bin(str.length, lenSizeSize);
    binStr += str2bin(str, charSize);
    binStr.split("").forEach((n, i) => {
        if (n === "1") {
            if (!(imageData.data[i] % 2)) {
                imageData.data[i] += imageData.data[i] === 0 ? 1 : -1;
            }
        } else {
            if ((imageData.data[i] % 2)) {
                imageData.data[i] += imageData.data[i] === 0 ? 1 : -1;
            }
        }
    });
    return imageData;
}

function getDataFromImageData(imageData, charSizeSize = 8, lenSizeSize = 62) {
    const fullBinStr = imageData.data.map(n => !(n % 2) ? "1" : "0").join("");
    const slicedBinStr = fullBinStr.slice(charSizeSize + lenSizeSize);
    const charBinStr = fullBinStr.slice(0, charSizeSize);
    const lenBinStr = fullBinStr.slice(charSizeSize, lenSizeSize);
    console.log('lenBinStr === ', lenBinStr);
    const charSize = str2bin(charBinStr, charBinStr.length);
    const lenSize = str2bin(lenBinStr, lenBinStr.length);
    console.log('lenSize === ', lenSize);
    return imageData;
}

function testDataStoreThing(str = `{"test":"foobar lol whatever"}`) {
    const canvas = document.createElement('canvas');
    const w = canvas.width = 122;
    const h = canvas.height = 122;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(10, 10, 20, 20);
    const imageData = ctx.getImageData(0, 0, w, h);
    addDataToImageData(imageData, str);
    document.body.appendChild(canvas);
    canvas.onclick = () => {
        const _ctx = canvas.getContext("2d");
        const _imgData = _ctx.getImageData(0, 0, canvas.width, canvas.height);
        getDataFromImageData(_imgData);
    }
}

function createCanvas(w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return canvas;
}

function str2bin(str, size = 8) {
    return ("" + str).split('').map(function (char) {
        return char.charCodeAt(0).toString(2).padStart(size, "0");
    }).join("");
}

function bin2str(binStr, size = 8) {
    const regex = new RegExp(`.{1,${size}}`, "g");
    //return binStr.match(regex);
    return binStr.match(regex).map(str => String.fromCharCode(parseInt(str, 2))).join("");
}

function load_image(url, callback) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
        callback(img);
    }
    img.src = url;
}

function parse_image(img, options = {
    format: "rgb"
}) {
    const locationColors = {};
    const colorCounts = {};
    const canvas = imageToCanvas(img);
    const ctx = canvas.getContext("2d");
    if (options.ctxOnly) {
        return ctx;
    }
    const data = ctx.getImageData(0, 0, img.width, img.height).data;
    if (options.dataOnly) {
        return {
            width: canvas.width,
            height: canvas.height,
            data
        };
    }
    for (var x = 0; x < canvas.width; x++) {
        for (var y = 0; y < canvas.height; y++) {
            if (!locationColors[x]) {
                locationColors[x] = {};
            }
            const i = (x + y * canvas.width) * 4;
            let colorKey;
            if (options.format === "rgb") {
                colorKey = rgbToHex(
                    data[i],
                    data[i + 1],
                    data[i + 2]
                );
                locationColors[x][y] = colorKey;
            } else {
                locationColors[x][y] = {
                    r: data[i],
                    g: data[i + 1],
                    b: data[i + 2],
                    a: data[i + 3]
                };
                colorKey = `${
                    locationColors[x][y].r
                }_${
                    locationColors[x][y].g
                }_${
                    locationColors[x][y].b
                }_${
                    locationColors[x][y].a
                }`;
            }
            if (!colorCounts[colorKey]) colorCounts[colorKey] = 0;
            colorCounts[colorKey]++;
        }
    }
    return {
        locationColors,
        colorCounts,
        width: canvas.width,
        height: canvas.height,
        data
    };

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
}

function imageToIslandsMeta(image, minArea = 4) {

    const imageData = imageToImageData(image);

    const analysis = analyzeImageData(imageData);

    const ret = gridToIslandsMeta(analysis.grid, minArea);

    ret.imageData = imageData;
    ret.analysis = analysis;

    return ret;
}

function imageDataToIslandsMeta(imageData, minArea = 4) {

    const analysis = analyzeImageData(imageData);

    const ret = gridToIslandsMeta(analysis.grid, minArea);

    ret.imageData = imageData;
    ret.analysis = analysis;

    return ret;
}

function gridToIslandsMeta(grid, minArea = 4) {

    // console.groupCollapsed('gridToIslands');
    // console.groupCollapsed('Before 1st pass:');
    // console.table(grid);
    // console.groupEnd();

    const ret = assignIslands(grid);

    // console.groupCollapsed('After 1st pass:');
    // console.table(ret);
    // console.groupEnd();


    const exploredGrid = lowNeighborOverride(ret);

    // console.groupCollapsed('After 2nd pass:');
    // console.table(exploredGrid);
    // console.groupEnd();

    const islands = {};

    exploredGrid.forEach((row, y) => {
        row.forEach((v, x) => {
            if (v > 0) {
                if (!islands[v]) {
                    islands[v] = {
                        minX: x,
                        maxX: x,
                        minY: y,
                        maxY: y,
                    };
                }
                if (islands[v].minX > x) islands[v].minX = x;
                if (islands[v].minY > y) islands[v].minY = y;
                if (islands[v].maxX < x) islands[v].maxX = x;
                if (islands[v].maxY < y) islands[v].maxY = y;
            }
        });
    });
    Object.keys(islands).forEach(id => {
        const island = islands[id];
        island.width = island.maxX - island.minX + 1;
        island.height = island.maxY - island.minY + 1;
        island.area = island.height * island.width;
        island.avgX = (island.maxX + island.minX) / 2;
        island.avgY = (island.maxY + island.minY) / 2;
    });
    const largeEnough = Object.keys(islands)
        .filter(id => {
            const island = islands[id];
            return island.area >= minArea;
        });
    const tooSmall = Object.keys(islands)
        .filter(id => {
            const island = islands[id];
            return island.area < minArea;
        });
    tooSmall.forEach(id => {
        const x = islands[id].avgX;
        const y = islands[id].avgY;
        const sorted = largeEnough.sort((a, b) => {
            const aDiffX = Math.abs(islands[a].avgX - x);
            const aDiffY = Math.abs(islands[a].avgY - y);
            const aDiffAvg = (aDiffX + aDiffY) / 2;
            const bDiffX = Math.abs(islands[b].avgX - x);
            const bDiffY = Math.abs(islands[b].avgY - y);
            const bDiffAvg = (bDiffX + bDiffY) / 2;
            if (aDiffAvg > bDiffAvg) {
                return 1;
            }
            return -1;
        });
        const _island = islands[sorted[0]];
        if (_island.minX > islands[id].minX) _island.minX = islands[id].minX;
        if (_island.minY > islands[id].minY) _island.minY = islands[id].minY;
        if (_island.maxX < islands[id].maxX) _island.maxX = islands[id].maxX;
        if (_island.maxY < islands[id].maxY) _island.maxY = islands[id].maxY;
        _island.avgX = (_island.maxX + _island.minX) / 2;
        _island.avgY = (_island.maxY + _island.minY) / 2;
        _island.width = _island.maxX - _island.minX + 1;
        _island.height = _island.maxY - _island.minY + 1;
        _island.area = _island.height * _island.width;
    });
    tooSmall.forEach(id => {
        delete islands[id];
    })

    console.groupEnd();
    let islandAreaArr = largeEnough.map(id => {
        return islands[id].area;
    });
    const avgIslandSize = islandAreaArr.reduce((ret, n) => {
        ret += n;
        return ret;
    }, 0) / islandAreaArr.length;
    return {
        grid,
        exploredGrid: exploredGrid,
        avgIslandSize,
        islands
    };

    function assignIslands(arr) {
        const ret = JSON.parse(JSON.stringify(arr));
        let id = 1;
        ret.forEach((row, y) => {
            row.forEach((v, x) => {
                if (v > 0) { // land was found

                    ret[y][x] = id; // give it the current id

                    if (y > 0 && ret[y - 1][x] > 0) {
                        ret[y][x] = ret[y - 1][x]; // inherit north neighbor id
                    } else if (x > 0 && ret[y][x - 1] > 0) {
                        ret[y][x] = ret[y][x - 1]; // inherit west neighbor id
                    }

                } else { // water was found
                    if (x <= 0 || ret[y][x - 1] > 0) {
                        id++;
                    }
                }
            });
        });
        return ret;
    }

    function lowNeighborOverride(arr) {
        const ret = JSON.parse(JSON.stringify(arr));
        let count = 0;
        const limit = 1000000000;
        const h = arr.length;
        const w = arr[0].length;
        let stillNotReady = true;
        while (limit > count && stillNotReady) {
            let badPairCount = 0;
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    const v = ret[y][x];
                    const lowestNeighbor = findLowestNeighbor(x, y);
                    if (lowestNeighbor < v) {
                        ret[y][x] = lowestNeighbor;
                        badPairCount++;
                    }
                    count++; //preventing runaway loops while developing
                }
            }
            if (badPairCount === 0) {
                stillNotReady = false;
            }
        }
        // console.log('count === ',count);
        // console.log('ret === ',ret);
        return ret;

        function findLowestNeighbor(x, y) {
            return Math.min(
                ...[
                    y === 0 ? Infinity : ret[y - 1][x],
                    x >= w - 1 ? Infinity : ret[y][x + 1],
                    y >= h - 1 ? Infinity : ret[y + 1][x],
                    x === 0 ? Infinity : ret[y][x - 1]
                ].filter(n => n)
            );
        }
    }
}

function imageToIslandsMeta2(image, minArea = 4) {

    const imageData = imageToImageData(image);

    const analysis = analyzeImageData(imageData);

    const ret = gridToIslandsMeta1(analysis.grid, minArea);

    ret.imageData = imageData;
    ret.analysis = analysis;

    return ret;
}

function gridToIslandsMeta2(grid, minArea = 4) {

    console.groupCollapsed('gridToIslands');
    console.groupCollapsed('Before 1st pass:');
    console.table(grid);
    console.groupEnd();

    const ret = assignIslands(grid);

    console.groupCollapsed('After 1st pass:');
    console.table(ret);
    console.groupEnd();


    const exploredGrid = lowNeighborOverride(ret);

    console.groupCollapsed('After 2nd pass:');
    console.table(exploredGrid);
    console.groupEnd();

    const islands = {};

    exploredGrid.forEach((row, y) => {
        row.forEach((v, x) => {
            if (v > 0) {
                if (!islands[v]) {
                    islands[v] = {
                        minX: x,
                        maxX: x,
                        minY: y,
                        maxY: y,
                    };
                }
                if (islands[v].minX > x) islands[v].minX = x;
                if (islands[v].minY > y) islands[v].minY = y;
                if (islands[v].maxX < x) islands[v].maxX = x;
                if (islands[v].maxY < y) islands[v].maxY = y;
            }
        });
    });
    Object.keys(islands).forEach(id => {
        const island = islands[id];
        island.width = island.maxX - island.minX + 1;
        island.height = island.maxY - island.minY + 1;
        island.area = island.height * island.width;
        island.avgX = (island.maxX + island.minX) / 2;
        island.avgY = (island.maxY + island.minY) / 2;
    });
    const largeEnough = Object.keys(islands)
        .filter(id => {
            const island = islands[id];
            return island.area >= minArea;
        });
    const tooSmall = Object.keys(islands)
        .filter(id => {
            const island = islands[id];
            return island.area < minArea;
        });
    tooSmall.forEach(id => {
        const x = islands[id].avgX;
        const y = islands[id].avgY;
        const sorted = largeEnough.sort((a, b) => {
            const aDiffX = Math.abs(islands[a].avgX - x);
            const aDiffY = Math.abs(islands[a].avgY - y);
            const aDiffAvg = (aDiffX + aDiffY) / 2;
            const bDiffX = Math.abs(islands[b].avgX - x);
            const bDiffY = Math.abs(islands[b].avgY - y);
            const bDiffAvg = (bDiffX + bDiffY) / 2;
            if (aDiffAvg > bDiffAvg) {
                return 1;
            }
            return -1;
        });
        const _island = islands[sorted[0]];
        if (_island.minX > islands[id].minX) _island.minX = islands[id].minX;
        if (_island.minY > islands[id].minY) _island.minY = islands[id].minY;
        if (_island.maxX < islands[id].maxX) _island.maxX = islands[id].maxX;
        if (_island.maxY < islands[id].maxY) _island.maxY = islands[id].maxY;
        _island.avgX = (_island.maxX + _island.minX) / 2;
        _island.avgY = (_island.maxY + _island.minY) / 2;
        _island.width = _island.maxX - _island.minX + 1;
        _island.height = _island.maxY - _island.minY + 1;
        _island.area = _island.height * _island.width;
    });
    tooSmall.forEach(id => {
        delete islands[id];
    })

    console.groupEnd();
    let islandAreaArr = largeEnough.map(id => {
        return islands[id].area;
    });
    const avgIslandSize = islandAreaArr.reduce((ret, n) => {
        ret += n;
        return ret;
    }, 0) / islandAreaArr.length;
    return {
        grid,
        exploredGrid: exploredGrid,
        avgIslandSize,
        islands
    };

    function assignIslands(arr) {
        const ret = JSON.parse(JSON.stringify(arr));
        let id = 1;
        ret.forEach((row, y) => {
            row.forEach((v, x) => {
                if (v > 0) { // land was found

                    ret[y][x] = id; // give it the current id

                    if (y > 0 && ret[y - 1][x] > 0) {
                        ret[y][x] = ret[y - 1][x]; // inherit north neighbor id
                    } else if (x > 0 && ret[y][x - 1] > 0) {
                        ret[y][x] = ret[y][x - 1]; // inherit west neighbor id
                    }

                } else { // water was found
                    if (x <= 0 || ret[y][x - 1] > 0) {
                        id++;
                    }
                }
            });
        });
        return ret;
    }

    function lowNeighborOverride(arr) {
        const ret = JSON.parse(JSON.stringify(arr));
        let count = 0;
        const limit = 1000000000;
        let hasLowerNeighbor;
        const h = arr.length;
        const w = arr[0].length;
        while (limit > count && (count === 0 || hasLowerNeighbor)) {
            if (hasLowerNeighbor) {
                ret[hasLowerNeighbor.y][hasLowerNeighbor.x] = hasLowerNeighbor.lowestNeighbor;
                hasLowerNeighbor = undefined;
            }
            loop1:
                for (let y = 0; y < h; y++) {
                    for (let x = 0; x < w; x++) {
                        const v = ret[y][x];
                        const lowestNeighbor = findLowestNeighbor(x, y);
                        if (lowestNeighbor < v) {
                            hasLowerNeighbor = {
                                x,
                                y,
                                v,
                                lowestNeighbor
                            };
                            break loop1;
                        }
                        count++; //preventing runaway loops while developing
                    }
                }
        }
        console.log('count === ', count);
        console.log('ret === ', ret);
        return ret;

        function findLowestNeighbor(x, y) {
            return Math.min(
                ...[
                    y === 0 ? Infinity : ret[y - 1][x],
                    x >= w - 1 ? Infinity : ret[y][x + 1],
                    y >= h - 1 ? Infinity : ret[y + 1][x],
                    x === 0 ? Infinity : ret[y][x - 1]
                ].filter(n => n)
            );
        }
    }
}

function imageChopper(img, tileWidth, tileHeight) {
    if (!tileWidth || !tileHeight) {
        if (img.src) {
            const seg1 = img.src.split("/").pop().split(".")[0].split("_").pop();
            if (seg1.includes("x")) {
                const [_w, _h] = seg1.split("x").map(Number);
                tileWidth = _w;
                tileHeight = _h;
            }
        }
    }
    const c = imageToCanvas(img);
    const w = img.width;
    const h = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const arr = [];
    for (let y = 0; y < h; y += tileHeight) {
        for (let x = 0; x < w; x += tileWidth) {
            const imageData = ctx.getImageData(x, y, tileWidth, tileHeight);
            const tileCanvas = document.createElement('canvas');
            tileCanvas.width = tileWidth;
            tileCanvas.height = tileHeight;
            const tileCtx = tileCanvas.getContext('2d');
            tileCtx.putImageData(imageData, 0, 0);
            arr.push(tileCanvas);
        }
    }
    return arr;

    function imageToCanvas(img) {
        if (img.tagName === "CANVAS") return img;
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return canvas;
    }
}

function tileizeCanvas(c, horiz = true, vert = true) {
    const retCanvas = document.createElement('canvas');
    const w = c.width * (horiz ? 2 : 1);
    const h = c.height * (vert ? 2 : 1);
    retCanvas.width = w;
    retCanvas.height = h;
    const ctx = retCanvas.getContext('2d');

    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(c, 0, c.height, -c.width, c.height);
    ctx.restore();

    // ctx.scale(-1,-1);
    // ctx.drawImage(c,0,c.height,-c.width,c.height);
    // ctx.restore();

    ctx.drawImage(c, c.width, c.height);

    return retCanvas;
}

function cloverCanvas(c) {
    const retCanvas = document.createElement('canvas');
    const w = c.width * 2;
    const h = c.height * 2;
    retCanvas.width = w;
    retCanvas.height = h;
    const ctx = retCanvas.getContext('2d');

    ctx.scale(-1, 1);
    ctx.drawImage(c, 0, c.height, -c.width, c.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.drawImage(c, c.width, c.height);

    ctx.scale(-1, -1);
    ctx.drawImage(c, 0, -c.height, -c.width, c.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.scale(1, -1);
    ctx.drawImage(c, c.width, 0, c.width, -c.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    return retCanvas;
}

function clover8Canvas(c) {
    const cloverCanv = cloverCanvas(c);

    const ctx = cloverCanv.getContext('2d');

    ctx.drawImage(cloverCanv, 0, 0, cloverCanv.width, cloverCanv.height);

    const rotCanv = rotateCanvas(cloverCanv);

    ctx.drawImage(rotCanv, 0, 0, rotCanv.width, rotCanv.height);

    return cloverCanv;
}

function mirrorHorizCanvas(canvas) {
    const retCanvas = document.createElement('canvas');
    const w = canvas.width * 2;
    const h = canvas.height;
    retCanvas.width = w;
    retCanvas.height = h;
    const ctx = retCanvas.getContext('2d');
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(canvas, 0, 0, -canvas.width, canvas.height);
    ctx.restore();
    // ctx.scale(1,1);
    ctx.drawImage(canvas, canvas.width, 0);
    return retCanvas;
}

function mirrorVertCanvas(canvas) {
    const retCanvas = document.createElement('canvas');
    const w = canvas.width;
    const h = canvas.height * 2;
    retCanvas.width = w;
    retCanvas.height = h;
    const ctx = retCanvas.getContext('2d');
    ctx.save();
    ctx.scale(1, -1);
    ctx.drawImage(canvas, 0, 0, canvas.width, -canvas.height);
    ctx.restore();
    // ctx.scale(1,1);
    ctx.drawImage(canvas, 0, canvas.height);
    return retCanvas;
}

class PixelCircle {
    constructor(options = {}) {
        this.radius = 7.5;
        this.color = "black";
        this.x = 0;
        this.y = 0;
        this.ff = true;
        this.cf = true;
        this.fc = true;
        this.cc = true;
        Object.assign(this, options);
    }
    draw(ctx) {
        const x = this.x;
        const y = this.y;
        const r = this.radius;
        const arr = [];
        [...Array(360)].forEach((n, i) => {
            const t = (i / 360) * Math.PI * 2;
            const xy = polar2Cartesian(r, t);
            if (this.ff) arr.push([Math.floor(xy.x), Math.floor(xy.y)]);
            if (this.cf) arr.push([Math.ceil(xy.x), Math.floor(xy.y)]);
            if (this.fc) arr.push([Math.floor(xy.x), Math.ceil(xy.y)]);
            if (this.cc) arr.push([Math.ceil(xy.x), Math.ceil(xy.y)]);
        });
        ctx.fillStyle = this.color;
        arr.forEach(point => {
            ctx.fillRect(
                point[0] + x,
                point[1] + y,
                1,
                1
            );
        });
        if (this.highlightColor) {
            ctx.strokeStyle = this.highlightColor;
            ctx.beginPath();
            ctx.arc(
                x,
                y,
                r,
                this.lightAngle - this.lightSpread,
                this.lightAngle + this.lightSpread
            );
            ctx.closePath();
            ctx.stroke();
        }
        if (this.shadeColor) {
            ctx.strokeStyle = this.shadeColor;
            ctx.beginPath();
            ctx.arc(
                x,
                y,
                r,
                Math.PI * 0.0,
                Math.PI * 0.8
            );
            ctx.closePath();
            ctx.stroke();
        }
        if (this.fill) {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }
    imageData() {
        const canvas = document.createElement('canvas');
        const w = canvas.width = (this.radius * 2) + 1;
        const h = canvas.height = (this.radius * 2) + 1;
        const ctx = canvas.getContext('2d');
        this.draw(ctx);
        return ctx.getImageData(0, 0, w, h);
    }
}
const TEMP_CANV = document.createElement("canvas");
TEMP_CANV.width = 1;
TEMP_CANV.height = 1;
const TEMP_CTX = TEMP_CANV.getContext('2d');

function colorArrToRGBArr(colorArr) {
    return colorArr.map(color => {
        TEMP_CTX.fillStyle = color;
        TEMP_CTX.fillRect(0, 0, 1, 1);
        const data = TEMP_CTX.getImageData(0, 0, 1, 1);
        return {
            r: data.data[0],
            g: data.data[1],
            b: data.data[2],
        }
    });
}

function polar2Cartesian(r, t) {
    return {
        x: r * Math.cos(t),
        y: r * Math.sin(t)
    };
}

function cartesian2Polar(x, y) {
    distance = Math.sqrt(x * x + y * y)
    radians = Math.atan2(y, x) //This takes y first
    polarCoor = {
        distance: distance,
        radians: radians
    }
    return polarCoor
}

function advmameCanvas(imageData, arr = [2]) {
    if (imageData.tagName) {
        // is most likely a canvas element
        imageData = canvasToImageData(imageData);
    }
    arr.forEach(m => {
        imageData = window[`advmame_x${m}`](imageData);
    });
    return imageDataToCanvas(imageData);
}

function advmame(imageData, arr = [2]) {
    if (imageData.tagName) {
        // is most likely a canvas element
        imageData = canvasToImageData(imageData);
    }
    arr.forEach(m => {
        imageData = window[`advmame_x${m}`](imageData);
    });
    return imageData;
}

function advmame_x2(imageData) {
    const canvas = document.createElement('canvas');
    const _w = imageData.width;
    const _h = imageData.height;
    const w = _w * 2;
    const h = _h * 2;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    const retImageData = ctx.getImageData(0, 0, w, h);
    for (let x = 0; x < _w; x++) {
        for (let y = 0; y < _h; y++) {
            const _x = x * 2;
            const _y = y * 2;
            const N = getColorStr(x, y - 1, _w, imageData);
            const E = getColorStr(x + 1, y, _w, imageData);
            const S = getColorStr(x, y + 1, _w, imageData);
            const W = getColorStr(x - 1, y, _w, imageData);
            let E0, E1, E2, E3;
            E0 = E1 = E2 = E3 = getColorStr(x, y, _w, imageData);
            if (N != S && W != E) {
                if (W == N) E0 = W;
                if (N == E) E1 = E;
                if (W == S) E2 = W;
                if (S == E) E3 = E;
            }
            setColorStr(E0, _x + 0, _y + 0, w, retImageData);
            setColorStr(E1, _x + 1, _y + 0, w, retImageData);
            setColorStr(E2, _x + 0, _y + 1, w, retImageData);
            setColorStr(E3, _x + 1, _y + 1, w, retImageData);
        }
    }
    return retImageData;
}

function advmame_x3(imageData) {
    const canvas = document.createElement('canvas');
    const _w = imageData.width;
    const _h = imageData.height;
    const w = _w * 3;
    const h = _h * 3;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    const retImageData = ctx.getImageData(0, 0, w, h);
    for (let x = 0; x < _w; x++) {
        for (let y = 0; y < _h; y++) {

            const neighborArr = [];
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    neighborArr.push(getColorStr(x + dx, y + dy, _w, imageData));
                }
            }
            // const [A,B,C,D,E,F,G,H,I] = rangeInclusive(-1, 1).flatMap(dy => rangeInclusive(-1, 1).map(dx => getColorStr(x + dx, y + dy, _w, _h)));//P35
            const [NW, N, NE, W, V, E, SW, S, SE] = neighborArr;

            let E0, E1, E2, E3, E4, E5, E6, E7, E8;
            E0 = E1 = E2 = E3 = E4 = E5 = E6 = E7 = E8 = V;
            if (W == N && N != E && W != S) E0 = W;
            if ((W == N && N != E && W != S && V != NE) || (N == E && N != W && E != S && V != NW)) E1 = N;
            if (N == E && N != W && E != S) E2 = E;
            if ((W == N && N != E && W != S && V != SW) || (W == S && W != N && S != E && V != NW)) E3 = W;
            E4 = V;
            if ((N == E && N != W && E != S && V != SE) || (S == E && W != S && N != E && V != NE)) E5 = E;
            if (W == S && W != N && S != E) E6 = W;
            if ((W == S && W != N && S != E && V != SE) || (S == E && W != S && N != E && V != SW)) E7 = S;
            if (S == E && W != S && N != E) E8 = E;
            const _x = x * 3;
            const _y = y * 3;
            setColorStr(E0, _x - 1, _y - 1, w, retImageData);
            setColorStr(E1, _x - 0, _y - 1, w, retImageData);
            setColorStr(E2, _x + 1, _y - 1, w, retImageData);
            setColorStr(E3, _x - 1, _y - 0, w, retImageData);
            setColorStr(E4, _x - 0, _y - 0, w, retImageData);
            setColorStr(E5, _x + 1, _y - 0, w, retImageData);
            setColorStr(E6, _x - 1, _y + 1, w, retImageData);
            setColorStr(E7, _x - 0, _y + 1, w, retImageData);
            setColorStr(E8, _x + 1, _y + 1, w, retImageData);
        }
    }
    return retImageData;
}

function getColorStr(x, y, w, imageData) {
    const i = (w * 4) + (w * y * 4) + (x * 4);
    return imageData.data.slice(i, i + 4).join('_');
}

function setColorStr(colorStr, x, y, w, imageData) {
    const i = (w * 4) + (w * y * 4) + (x * 4);
    const [r, g, b, a] = colorStr.split("_").map(Number);
    imageData.data[i + 0] = r;
    imageData.data[i + 1] = g;
    imageData.data[i + 2] = b;
    imageData.data[i + 3] = a;
}

function combineCanvasArr(canvasArr) {
    const canvas = document.createElement('canvas');
    let maxX = 0;
    let maxY = 0;
    canvasArr.forEach(row => {
        const [canvas, xo, yo] = row;
        if (maxX < xo + canvas.width) {
            maxX = xo + canvas.width;
        }
        if (maxY < yo + canvas.height) {
            maxY = yo + canvas.height;
        }
    });
    canvas.width = maxX;
    canvas.height = maxY;
    const ctx = canvas.getContext('2d');
    canvasArr.forEach(row => {
        const [canvas, xo, yo] = row;
        ctx.drawImage(canvas, xo, yo);
    });

    return canvas;
}


function buttonCanvas(
    baseImage,
    hoveredImage,
    pressedImage,
    labelImage,
    callback = () => {
        console.log('the button has been clicked!')
    },
    labelXO = 4,
    labelYO = 4,
    labelYO2 = 1
) {
    const canvas = document.createElement('canvas');
    const w = baseImage.width;
    const h = baseImage.height;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    _drawBase()

    canvas.onmouseenter = () => {
        ctx.clearRect(0, 0, baseImage.width, baseImage.height);
        ctx.drawImage(hoveredImage, 0, 0);
        ctx.drawImage(labelImage, labelXO, labelYO);
    }
    canvas.onmouseleave = () => {
        ctx.clearRect(0, 0, baseImage.width, baseImage.height);
        _drawBase();
    }
    canvas.onmousedown = (event) => {
        ctx.clearRect(0, 0, baseImage.width, baseImage.height);
        ctx.drawImage(pressedImage, 0, 0);
        ctx.drawImage(labelImage, labelXO, labelYO + labelYO2);
        callback(event);
    }
    canvas.onmouseup = (event) => {
        ctx.drawImage(hoveredImage, 0, 0);
        ctx.drawImage(labelImage, labelXO, labelYO);
    }

    canvas.style.cursor = "pointer";

    return canvas;

    function _drawBase() {
        ctx.drawImage(baseImage, 0, 0);
        ctx.drawImage(labelImage, labelXO, labelYO);
    }
}

function imageLoader(urlArr, func) {
    const uni = {};
    urlArr.forEach(url => {
        if (!uni[url]) {
            uni[url] = new Image();
        }
    });
    const imgCount = Object.keys(uni).length;
    let loadedCount = 0;
    const _tick = () => {
        loadedCount++;
        if (loadedCount === imgCount) {
            func(uni);
        }
    };
    console.log('imgCount === ', imgCount);
    Object.keys(uni)
        .forEach(src => {
            uni[src].onload = _tick;
            uni[src].onerror = _tick;
            uni[src].src = src;
        });
}

function backgroundMeta(canvas) {
    const w = canvas.width;
    const h = canvas.height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, w, h);

}

function removeBackgroundCanvas(canvas) {
    const w = canvas.width;
    const h = canvas.height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, w, h);

    return transformCanvas(canvas);

    function transformCanvas(canvas) {
        const colorStepSize = 64;
        const testArr = [{
            diff: 30,
            colorStepSize: 16,
            counts: {},
        }, ];

        const w = canvas.width;
        const h = canvas.height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, w, h);

        const startTime = performance.now();

        const badIslands = [];

        testArr.forEach((n, testIdx) => {
            const _canvas = document.createElement('canvas');
            const _canvas2 = document.createElement('canvas');
            _canvas.width = w;
            _canvas.height = h;
            _canvas2.width = w;
            _canvas2.height = h;
            if (testIdx > 0) {
                n.imageData = testArr[testIdx - 1].canvas.getContext('2d').getImageData(0, 0, w, h);
                n.imageData2 = testArr[testIdx - 1].canvas2.getContext('2d').getImageData(0, 0, w, h);
            } else {
                n.imageData = ctx.getImageData(0, 0, w, h);
                n.imageData2 = ctx.getImageData(0, 0, w, h);
            }

            n.canvas = _canvas;
            n.canvas2 = _canvas2;
        });
        const diffMap = {};
        imageData.data.forEach((n, i) => { // TODO: perf test this: 'forEach' vs 'for'
            if ((i % 4) === 0) {
                const _y = Math.floor(i / 4 / imageData.width);
                if (!diffMap[_y]) {
                    diffMap[_y] = [];
                }
                testArr.forEach((test, testIdx) => {
                    const d = test.colorStepSize;
                    const r = Math.floor(imageData.data[0] / d) * d;
                    const g = Math.floor(imageData.data[1] / d) * d;
                    const b = Math.floor(imageData.data[2] / d) * d;
                    const rgbStr = `rgb(${r},${g},${b})`;
                    let _r, _g, _b, rgbStr2;
                    if (testIdx === 0) {
                        _r = Math.floor(imageData.data[i] / d) * d;
                        _g = Math.floor(imageData.data[i + 1] / d) * d;
                        _b = Math.floor(imageData.data[i + 2] / d) * d;
                        rgbStr2 = `rgb(${_r},${_g},${_b})`;
                    } else {
                        const prevTest = testArr[testIdx - 1];
                        if (prevTest.imageData2.data[i + 3] === 0) return;
                        _r = Math.floor(prevTest.imageData2.data[i] / d) * d;
                        _g = Math.floor(prevTest.imageData2.data[i + 1] / d) * d;
                        _b = Math.floor(prevTest.imageData2.data[i + 2] / d) * d;
                        rgbStr2 = `rgb(${_r},${_g},${_b})`;
                    }

                    const startScore = similarColors(rgbStr, rgbStr2);
                    const westScore = scoreNeighbor(rgbStr, i - 4);
                    diffMap[_y].push(Math.round(westScore));
                    if (startScore > test.diff) {
                        test.imageData.data[i + 3] = 255;
                        const [r, g, b] = [
                            Math.floor(test.imageData.data[i] / d) * d,
                            Math.floor(test.imageData.data[i + 1] / d) * d,
                            Math.floor(test.imageData.data[i + 2] / d) * d
                        ];
                        test.imageData2.data[i + 0] = r;
                        test.imageData2.data[i + 1] = g;
                        test.imageData2.data[i + 2] = b;
                        test.imageData2.data[i + 3] = 255;
                        const str = `rgb(${r},${g},${b})`;
                        if (!test.counts[str]) {
                            test.counts[str] = 0;
                        }
                        test.counts[str]++;
                    } else {
                        test.imageData.data[i + 0] = 0;
                        test.imageData.data[i + 1] = 0;
                        test.imageData.data[i + 2] = 0;
                        test.imageData.data[i + 3] = 0;
                        test.imageData2.data[i + 0] = 0;
                        test.imageData2.data[i + 1] = 0;
                        test.imageData2.data[i + 2] = 0;
                        test.imageData2.data[i + 3] = 0;
                    }
                });
            }
        });

        const endTime = performance.now();

        const uni = {};
        const colorAvgArr = [];
        testArr.forEach(n => {
            n.canvas.getContext('2d').putImageData(n.imageData, 0, 0);
            const ctx2 = n.canvas2.getContext('2d');
            ctx2.putImageData(n.imageData2, 0, 0);

            n.canvas3 = document.createElement('canvas');
            n.canvas3.width = n.canvas2.width;
            n.canvas3.height = n.canvas2.height;
            n.ctx3 = n.canvas3.getContext('2d');
            n.imageData3 = ctx2.getImageData(0, 0, n.canvas2.width, n.canvas2.height);

            n.analysis = analyzeCanvas(n.canvas2);
            console.log('n.analysis === ', n.analysis);
            Object.keys(n.analysis.islands).forEach(color => {

                Object.keys(n.analysis.islands[color].islands).forEach(k => {
                    const island = n.analysis.islands[color].islands[k];
                    // if(island.edgeCount > island.area) {
                    if (island.area === 1) {
                        // debugger;
                    }
                    if (
                        island.edgeCount > (island.area * 3) &&
                        island.outerEdgeCount > (island.area * 20)
                    ) {
                        badIslands.push({
                            color,
                            islandMeta: n.analysis.islands[color],
                            island,
                            k: Number(k)
                        });
                    }
                })

            });
            let removedCount = 0;
            badIslands.forEach(bad => {
                const {
                    islandMeta,
                    island,
                    k
                } = bad;
                const w = n.canvas2.width;
                const exploredGrid = islandMeta.exploredGrid;

                for (let y = island.minY; y <= island.maxY; y++) {
                    for (let x = island.minX; x <= island.maxX; x++) {
                        const v = exploredGrid[y][x];
                        if (v == k) {
                            const i = (x * 4) + (y * w * 4);
                            n.imageData3.data[i] = 0;
                            n.imageData3.data[i + 1] = 0;
                            n.imageData3.data[i + 2] = 0;
                            n.imageData3.data[i + 3] = 0;
                            removedCount++;
                        }
                    }
                }

            });
            console.log('removedCount === ', removedCount);
            n.ctx3.putImageData(n.imageData3, 0, 0);

            const d = n.colorStepSize;
            const r = Math.floor(imageData.data[0] / d) * d;
            const g = Math.floor(imageData.data[1] / d) * d;
            const b = Math.floor(imageData.data[2] / d) * d;
            const rgbStr = `rgb(${r},${g},${b})`;

            let avgR = 0;
            let avgG = 0;
            let avgB = 0;
            Object.keys(uni).forEach(k => {
                const rgb = colorToRGB(k);
                // console.log('rgb === ',rgb);
                avgR += rgb.r;
                avgG += rgb.g;
                avgB += rgb.b;
            });
            avgR /= Object.keys(uni).length;
            avgG /= Object.keys(uni).length;
            avgB /= Object.keys(uni).length;
        });

        return canvas;

        function scoreNeighbor(colorStr, _i) {
            if (!imageData.data[_i]) return 0;
            const _r = imageData.data[_i];
            const _g = imageData.data[_i + 1];
            const _b = imageData.data[_i + 2];
            const colorStr2 = `rgb(${_r},${_g},${_b})`;
            return similarColors(colorStr, colorStr2);
        }

    }
}

function colorToRGB(color) {
    if (window.colorCache && window.colorCache[color]) {
        return window.colorCache[color];
    }
    if (!window.cachedCtx) {
        window.cachedCtx = document.createElement("canvas").getContext("2d");
        window.colorCache = {};
    }
    let ctx = window.cachedCtx;
    ctx.fillStyle = color === "transparent" ? "#ff0000" : color;
    return hexToRgb(ctx.fillStyle);

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        };
    }
}

function calcDivisors(n) {
    const arr = [];
    mod = n;
    while (mod > 0) {
        if (n % mod === 0) {
            arr.push(mod);
        }
        mod--;
    }
    return arr;
}

function calcColumnsRows(n) {
    const arr = calcDivisors(n);
    const mid = arr[Math.floor(arr.length / 2)];
    const v = n / mid;
    return {
        cols: mid,
        rows: v
    };
}

function initImageDrop(elm, callback) {
    elm.ondrop = ev => {
        console.log('dropHandler');
        console.log('ev === ', ev);
        console.log('File(s) dropped');
        ev.preventDefault();
        if (ev.dataTransfer.items) {
            for (let i = 0; i < ev.dataTransfer.items.length; i++) {
                if (ev.dataTransfer.items[i].kind === 'file') {
                    const file = ev.dataTransfer.items[i].getAsFile();
                    const img = new Image();
                    img.onload = e => {
                        callback(img);
                    };
                    const reader = new FileReader();
                    reader.onload = (function (aImg) {
                        return function (e) {
                            aImg.src = e.target.result;
                        };
                    })(img);
                    reader.readAsDataURL(file);
                }
            }
        } else {
            for (var i = 0; i < ev.dataTransfer.files.length; i++) {
                console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
                console.log('ev.dataTransfer.files[i] === ', ev.dataTransfer.files[i]);
            }
        }
    }
    elm.ondragover = ev => {
        console.log('File(s) in drop zone');
        ev.preventDefault();
    }
}