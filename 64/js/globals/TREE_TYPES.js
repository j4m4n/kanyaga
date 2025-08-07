
/**
 * Tree types with their properties and textures.
 * canopyArr objects are documented after canopyArr.
 * @type {object}
 * @property {HTMLCanvasElement[]} trunkCanvas - Array of canvas elements for trunk textures.
 * @property {object[]} canopyArr - Array of objects defining canopy properties.
 * @property {string} canopyArr[].color - Color of the canopy.
 * @property {number} canopyArr[].ycm - Y coefficient multiplier for the canopy.
 * @property {number} canopyArr[].sm - Scale multiplier for the canopy.
 * @property {number} canopyArr[].xm - X coefficient multiplier for the canopy.
 * @property {number} canopyArr[].zm - Z coefficient multiplier for the canopy.
 * @property {number} (optional) canopyArr[].rx - Rotation around the X axis. Randomized if not specified.
 * @property {number} (optional) canopyArr[].rz - Rotation around the Z axis. Randomized if not specified.
 * @property {boolean} [canopyRandRefresh] - Whether to refresh canopy x and z rotation for each canopy.
 * @property {number} minTreeHeight - Minimum height of the tree.
 * @property {number} maxTreeHeight - Maximum height of the tree.
 * @property {number} radiusTrunkBase - Radius of the trunk base.
 * @property {number} radiusTrunkTop - Radius of the trunk top.
 * @property {number} canopyCount - Number of canopy segments.
 * @property {number} canopySegsX - Number of canopy segments in the X direction.
 * @property {number} canopySegsY - Number of canopy segments in the Y direction.
 * @property {number} canopyScaleX - The base scale factor for the canopy in the X direction.
 * @property {number} canopyScaleY - The base scale factor for the canopy in the Y direction.
 * @property {number} canopyScaleZ - The base scale factor for the canopy in the Z direction.
 * @property {number} canopyScaleXStep - Step factor for scaling the canopy in the X direction.
 * @property {number} canopyScaleYStep - Step factor for scaling the canopy in the Y direction.
 * @property {number} canopyScaleZStep - Step factor for scaling the canopy in the Z direction.
 * @property {number} canopyYO - The base offset for the canopy in the Y direction.
 * @property {number} canopyXO - The base offset for the canopy in the X direction.
 * @property {number} canopyZO - The base offset for the canopy in the Z direction.
 * @property {number} canopyYOStep - Step factor for the canopy offset in the Y direction.
 * @property {number} canopyXOStep - Step factor for the canopy offset in the X direction.
 * @property {number} canopyZOStep - Step factor for the canopy offset in the Z direction.
 * @property {number} startingYOBonus - Additional Y offset for the canopy.
 */
const TREE_TYPES = {
    "Alder": {
        canopyArr: [
            {color: "#1e6f50", ycm: 0.4, sm: 0.7, xm: 0.5, zm: 0.5, rx: 0.1, rz: 0.1},
            {color: "#1e6f50", ycm: 0.4, sm: 0.7, xm: 0.5, zm: 0.5, rx: -0.1, rz: 0.1},
            {color: "#1e6f50", ycm: 0.4, sm: 0.5, xm: 0.5, zm: 0.5, rx: -0.1, rz: 0.1},
            {color: "#33984b", ycm: 0.5, sm: 0.7, xm: 0.6, zm: 0.6},
            {color: "#5ac54f", ycm: 0.6, sm: 0.8, xm: 1.0, zm: 1.0}
        ],
        minTreeHeight: 3,
        maxTreeHeight: 10,
        radiusTrunkBase: 0.3,
        radiusTrunkTop: 0.15,
        canopyCount: 3,
        canopySegsX: 5,
        canopySegsY: 6,
        canopyScaleX: 3,
        canopyScaleY: 1.6,
        canopyScaleZ: 3,
        canopyScaleXStep: -0.01,
        canopyScaleYStep: 0.1,
        canopyScaleZStep: -0.01,
        canopyYO: 0.7,
        canopyXO: 4.33,
        canopyZO: 5.45,
        canopyYOStep: 1.86,
        canopyXOStep: 0.15,
        canopyZOStep: 0.14
    },
    "Ash": {
        canopyArr: [
            {color: "#33984b", ycm: 0.7, sm: 0.9, xm: 0.6, zm: 0.6},
            {color: "#33984b", ycm: 0.6, sm: 0.9, xm: 0.6, zm: 0.6},
            {color: "#134c4c", ycm: -0.7, sm: 0.8, xm: 1.0, zm: 1.0},
            {color: "#1e6f50", ycm: -0.5, sm: 0.8, xm: 0.5, zm: 0.5},
            {color: "#134c4c", ycm: -0.5, sm: 0.8, xm: 0.5, zm: 0.5}
        ],
        canopyRandRefresh: true,
        minTreeHeight: 5,
        maxTreeHeight: 15,
        radiusTrunkBase: 0.5,
        radiusTrunkTop: 0.2,
        canopyCount: 4,
        canopySegsX: 5,
        canopySegsY: 6,
        canopyScaleX: 3.5,
        canopyScaleY: 1.6,
        canopyScaleZ: 3.5,
        canopyScaleXStep: -0.01,
        canopyScaleYStep: 0.1,
        canopyScaleZStep: -0.01,
        canopyYO: 0.7,
        canopyXO: 5.33,
        canopyZO: 5.45,
        canopyYOStep: 2.96,
        canopyXOStep: 0.15,
        canopyZOStep: -0.14
    },
    "Aspen": {
        canopyArr: [
            {color: "#ffc825", ycm: 1.5, sm: 0.3, xm: 1.0, zm: 1.0},
            {color: "#ed7614", ycm: 1.7, sm: 0.5, xm: 0.6, zm: 0.6},
            {color: "#ffa214", ycm: 2.1, sm: 0.8, xm: 0.5, zm: 0.5}
        ],
        minTreeHeight: 4,
        maxTreeHeight: 12,
        radiusTrunkBase: 0.1,
        radiusTrunkTop: 0.05,
        canopyCount: 4,
        canopySegsX: 5,
        canopySegsY: 6,
        canopyScaleX: 1.5,
        canopyScaleY: 0.6,
        canopyScaleZ: 1.5,
        canopyScaleXStep: 0.1,
        canopyScaleYStep: 0.1,
        canopyScaleZStep: 0.1,
        canopyYO: 0.9,
        canopyXO: 0.33,
        canopyZO: 0.45,
        canopyYOStep: 0.96,
        canopyXOStep: 0.15,
        canopyZOStep: 0.14
    },
    "DogRose": {
        canopyArr: [
            {color: "#5ac54f", ycm: 0.1, sm: 0.9, xm: 1.0, ym: 1.3, zm: 1.0},
            {color: "#5ac54f", ycm: 0.1, sm: 0.5, xm: 0.6, zm: 0.6},
            {color: "#5ac54f", ycm: 0.1, sm: 0.5, xm: 0.6, zm: 0.6},
            {color: "#33984b", ycm: 0.1, sm: 0.8, xm: 0.5, zm: 0.5}
        ],
        canopyRandRefresh: true,
        minTreeHeight: 2,
        maxTreeHeight: 8,
        radiusTrunkBase: 0.1,
        radiusTrunkTop: 0.05,
        canopyCount: 3,
        canopySegsX: 5,
        canopySegsY: 6,
        canopyScaleX: 1.5,
        canopyScaleY: 0.6,
        canopyScaleZ: 1.5,
        canopyScaleXStep: -0.01,
        canopyScaleYStep: 0.1,
        canopyScaleZStep: -0.01,
        canopyYO: 0.4,
        canopyXO: 10.33,
        canopyZO: 10.45,
        canopyYOStep: 2.96,
        canopyXOStep: 0.15,
        canopyZOStep: 0.14
    },
    "DownyBirch": {
        canopyArr: [
            {color: "#7d5066", ycm: 1.5, sm: 0.7, xm: 1.0, zm: 1.0},
            {color: "#9477a7", ycm: 0.5, sm: 0.7, xm: 1.0, zm: 1.0},
            {color: "#9477a7", ycm: 1.1, sm: 0.75, xm: 1.6, zm: 0.6},
            {color: "#cbabda", ycm: 0.5, sm: 0.7, xm: 1.0, zm: 1.0},
            {color: "#cbabda", ycm: 0.8, sm: 0.65, xm: 0.6, zm: 0.6},
        ],
        minTreeHeight: 3,
        maxTreeHeight: 6,
        radiusTrunkBase: 0.3,
        radiusTrunkTop: 0.05,
        canopyCount: 4,
        canopySegsX: 5,
        canopySegsY: 6,
        canopyScaleX: 1.5,
        canopyScaleY: 1.6,
        canopyScaleZ: 1.5,
        canopyScaleXStep: -0.01,
        canopyScaleYStep: 0.1,
        canopyScaleZStep: -0.01,
        canopyYO: 0.7,
        canopyXO: 0.33,
        canopyZO: 0.45,
        canopyYOStep: 0.36,
        canopyXOStep: 0.15,
        canopyZOStep: 0.14
    },
    "EnglishElm": {
        canopyArr: [
            {color: "#6d0d3e", ycm: 1.1, sm: 0.8, xm: 0.5, zm: 0.5},
            {color: "#ab2027", ycm: 0.7, sm: 0.8, xm: 1.2, zm: 0.6},
            {color: "#f84d47", ycm: 1.5, sm: 0.8, xm: 1.0, zm: 1.0}
        ],
        minTreeHeight: 6,
        maxTreeHeight: 20,
        radiusTrunkBase: 0.3,
        radiusTrunkTop: 0.2,
        canopyCount: 5,
        canopySegsX: 5,
        canopySegsY: 6,
        canopyScaleX: 3,
        canopyScaleY: 1.6,
        canopyScaleZ: 3,
        canopyScaleXStep: -0.01,
        canopyScaleYStep: 0.1,
        canopyScaleZStep: -0.01,
        canopyYO: 0.4,
        canopyXO: 4.93,
        canopyZO: 4.45,
        canopyYOStep: 2.36,
        canopyXOStep: 0.15,
        canopyZOStep: 0.14,
        startingYOBonus: 3
    },
    "Hazel": {
        canopyArr: [
            {color: "#682a19", ycm: 1.2, sm: 0.9, xm: 1.5, zm: 0.5},
            {color: "#834a30", ycm: 1.0, sm: 0.9, xm: 0.5, zm: 0.5},
            {color: "#8a5100", ycm: 0.7, sm: 1.2, xm: 1.6, zm: 0.6},
            {color: "#da9d01", ycm: 0.7, sm: 1.1, xm: 1.0, zm: 1.0, rx: 0.0, rz: 0.0},
        ],
        minTreeHeight: 2,
        maxTreeHeight: 8,
        radiusTrunkBase: 0.05,
        radiusTrunkTop: 0.05,
        canopyCount: 3,
        canopySegsX: 5,
        canopySegsY: 6,
        canopyScaleX: 1.2,
        canopyScaleY: 2.4,
        canopyScaleZ: 1.2,
        canopyScaleXStep: -0.01,
        canopyScaleYStep: 0.1,
        canopyScaleZStep: -0.01,
        canopyYO: 0.7,
        canopyXO: 3.33,
        canopyZO: 3.45,
        canopyYOStep: 0.66,
        canopyXOStep: 0.55,
        canopyZOStep: 0.54
    },
    "Holly": {
        canopyArr: [
            {color: "#0c2e44", ycm: 0.9, sm: 0.3, xm: 0.6, zm: 0.6, rx: 0.0, rz: 0.0},
            {color: "#134c4c", ycm: 0.9, sm: 0.3, xm: 0.6, zm: 0.6, rx: 0.0, rz: 0.0},
            {color: "#1e6f50", ycm: 0.9, sm: 0.3, xm: 0.6, zm: 0.6, rx: 0.0, rz: 0.0},
            {color: "#33984b", ycm: 0.9, sm: 0.3, xm: 0.6, zm: 0.6, rx: 0.0, rz: 0.0},
        ],
        minTreeHeight: 3,
        maxTreeHeight: 8,
        radiusTrunkBase: 0.2,
        radiusTrunkTop: 0.05,
        canopyCount: 6,
        canopySegsX: 5,
        canopySegsY: 6,
        canopyScaleX: 1.5,
        canopyScaleY: 0.2,
        canopyScaleZ: 1.5,
        canopyScaleXStep: 0.1,
        canopyScaleYStep: 0.01,
        canopyScaleZStep: 0.1,
        canopyYO: 0.65,
        canopyXO: 0.33,
        canopyZO: 0.45,
        canopyYOStep: 0.56,
        canopyXOStep: 0.15,
        canopyZOStep: 0.14
    },
    "Hornbeam": {
        canopyArr: [
            {color: "#c1f567", ycm: 0.5, sm: 0.5, xm: 1.0, zm: 1.0},
            {color: "#ffff04", ycm: 0.7, sm: 0.5, xm: 0.6, zm: 0.6},
            {color: "#c1f567", ycm: 0.5, sm: 0.4, xm: 1.0, zm: 1.0},
            {color: "#ffff04", ycm: 0.7, sm: 0.4, xm: -3.6, zm: -3.6},
            {color: "#c1f567", ycm: 0.5, sm: 0.3, xm: -3.0, zm: 3.0},
            {color: "#ffff04", ycm: 0.7, sm: 0.3, xm: 3.6, zm: -3.6},
        ],
        minTreeHeight: 4,
        maxTreeHeight: 12,
        radiusTrunkBase: 0.2,
        radiusTrunkTop: 0.1,
        canopyCount: 5,
        canopySegsX: 5,
        canopySegsY: 6,
        canopyScaleX: 5,
        canopyScaleY: 3,
        canopyScaleZ: 5,
        canopyScaleXStep: 0.05,
        canopyScaleYStep: 0.1,
        canopyScaleZStep: 0.05,
        canopyYO: 0.75,
        canopyXO: 1.63,
        canopyZO: 1.45,
        canopyYOStep: 1.76,
        canopyXOStep: 1.15,
        canopyZOStep: 1.14
    },
    "LombardyPoplar": {
        canopyArr: [
            {color: "#718063", ycm: 0.7, sm: 0.5, xm: 1.0, zm: 1.0, rx: 0.0, rz: 0.0},
            {color: "#6b9557", ycm: 0.7, sm: 0.5, xm: 0.6, zm: 0.6, rx: 0.1, rz: 0.0}
        ],
        minTreeHeight: 5,
        maxTreeHeight: 15,
        radiusTrunkBase: 0.1,
        radiusTrunkTop: 0.05,
        canopyCount: 4,
        canopySegsX: 4,
        canopySegsY: 4,
        canopyScaleX: 1.5,
        canopyScaleY: 3.5,
        canopyScaleZ: 1.5,
        canopyScaleXStep: -0.01,
        canopyScaleYStep: 0.3,
        canopyScaleZStep: -0.01,
        canopyYO: 0.45,
        canopyXO: 0.33,
        canopyZO: 0.45,
        canopyYOStep: 2.86,
        canopyXOStep: -0.15,
        canopyZOStep: 0.14
    },
    "Magnolia": {
        canopyArr: [
            {color: "#0c2e44", ycm: 0.5, sm: 0.9, xm: 1.0, zm: 1.0},
            {color: "#1e6f50", ycm: 0.7, sm: 0.8, xm: 0.6, zm: 0.6},
            {color: "#0c2e44", ycm: 1.1, sm: 0.5, xm: -0.5, zm: -0.5},
            {color: "#134c4c", ycm: 0.8, sm: 0.5, xm: 0.5, zm: -0.5},
            {color: "#1e6f50", ycm: 0.7, sm: 0.5, xm: -0.5, zm: 0.5},
        ],
        minTreeHeight: 4,
        maxTreeHeight: 12,
        radiusTrunkBase: 0.5,
        radiusTrunkTop: 0.25,
        canopyCount: 5,
        canopySegsX: 5,
        canopySegsY: 6,
        canopyScaleX: 2.5,
        canopyScaleY: 1.6,
        canopyScaleZ: 2.5,
        canopyScaleXStep: -0.01,
        canopyScaleYStep: 0.1,
        canopyScaleZStep: -0.01,
        canopyYO: 0.6,
        canopyXO: 0.33,
        canopyZO: 0.45,
        canopyYOStep: 0.86,
        canopyXOStep: 2.15,
        canopyZOStep: 0.14,
        startingYOBonus: 3
    },
    "MountainAsh": {
        canopyArr: [
            {color: "#5ac54f", ycm: 0.9, sm: 0.8, xm: 0.6, zm: 0.6},
            {color: "#72482b", ycm: 0.8, sm: 0.1, xm: 5, zm: -5},
            {color: "#99e65f", ycm: 0.9, sm: 0.5, xm: 0.6, zm: 0.6},
            {color: "#682a19", ycm: 0.5, sm: 0.1, xm: 5, zm: 0},
            {color: "#834a30", ycm: 0.3, sm: 0.1, xm: 5, zm: 5},
        ],
        minTreeHeight: 3,
        maxTreeHeight: 8,
        radiusTrunkBase: 0.2,
        radiusTrunkTop: 0.05,
        canopyCount: 4,
        canopySegsX: 5,
        canopySegsY: 6,
        canopyScaleX: 2.5,
        canopyScaleY: 2.1,
        canopyScaleZ: 2.5,
        canopyScaleXStep: 0.0,
        canopyScaleYStep: 0.0,
        canopyScaleZStep: 0.0,
        canopyYO: 0.55,
        canopyXO: 1.63,
        canopyZO: 1.55,
        canopyYOStep: 0.56,
        canopyXOStep: 0.15,
        canopyZOStep: 0.14,
        startingYOBonus: 2
    },
    "SweetChestnut": {
        canopyArr: [
            {color: "#65b580", ycm: 1.1, sm: 0.4, xm: 1.0, zm: 1.0},
            {color: "#c1f567", ycm: 0.7, sm: 0.4, xm: 6, zm: 6},
            {color: "#ab2027", ycm: 0.5, sm: 0.05, xm: 15, zm: 15},
            {color: "#ab2027", ycm: 0.5, sm: 0.05, xm: 15, zm: 15},
        ],
        minTreeHeight: 2,
        maxTreeHeight: 7,
        radiusTrunkBase: 0.2,
        radiusTrunkTop: 0.05,
        canopyCount: 5,
        canopySegsX: 5,
        canopySegsY: 6,
        canopyScaleX: 2,
        canopyScaleY: 1.6,
        canopyScaleZ: 2,
        canopyScaleXStep: -0.01,
        canopyScaleYStep: 0.01,
        canopyScaleZStep: -0.01,
        canopyYO: 0.5,
        canopyXO: 0.23,
        canopyZO: 0.35,
        canopyYOStep: 0.66,
        canopyXOStep: 0.45,
        canopyZOStep: 0.44,
        startingYOBonus: 2
    },
    "Sycamore": {
        canopyArr: [
            {color: "#509883", ycm: 0.5, sm: 0.5, xm: 5, zm: 5},
            {color: "#8cd590", ycm: 0.7, sm: 0.5, xm: 6, zm: 6},
            {color: "#509883", ycm: 0.5, sm: 0.5, xm: 5, zm: 5},
            {color: "#8cd590", ycm: 0.7, sm: 0.5, xm: 6, zm: 6},
            {color: "#509883", ycm: 0.5, sm: 0.5, xm: 5, zm: 5},
            {color: "#8cd590", ycm: 0.7, sm: 0.5, xm: 6, zm: 6},
        ],
        minTreeHeight: 5,
        maxTreeHeight: 15,
        radiusTrunkBase: 0.3,
        radiusTrunkTop: 0.1,
        canopyCount: 4,
        canopySegsX: 5,
        canopySegsY: 6,
        canopyScaleX: 3,
        canopyScaleY: 2,
        canopyScaleZ: 3,
        canopyScaleXStep: -0.01,
        canopyScaleYStep: 0.1,
        canopyScaleZStep: -0.01,
        canopyYO: 0.7,
        canopyXO: 0.93,
        canopyZO: 0.95,
        canopyYOStep: 0.86,
        canopyXOStep: 0.15,
        canopyZOStep: 0.14,
        startingYOBonus: 3
    },
    "TurkeyOak": {
        canopyArr: [
            {color: "#99e65f", ycm: 0.0, sm: 0.8, xm: 1.6, zm: 1.6}, 
            {color: "#d3fc7e", ycm: 0.5, sm: 0.8, xm: 1.6, zm: 1.6}
        ],
        canopyRandRefresh: true,
        minTreeHeight: 6,
        maxTreeHeight: 20,
        radiusTrunkBase: 0.5,
        radiusTrunkTop: 0.4,
        canopyCount:5,
        canopySegsX: 5,
        canopySegsY: 5,
        canopyScaleX: 5,
        canopyScaleY: 5,
        canopyScaleZ: 5,
        canopyScaleXStep: -0.01,
        canopyScaleYStep: 0.1,
        canopyScaleZStep: -0.01,
        canopyYO: 0.4,
        canopyXO: 3.33,
        canopyZO: 3.45,
        canopyYOStep: 2.86,
        canopyXOStep: 0.15,
        canopyZOStep: 0.14,
        startingYOBonus: 3
    }
};
for (const treeName in TREE_TYPES) {
    for(let i = 0; i < 10; i++) {
        const yaml = yamlTree(treeName, i/10);
        // console.log("yaml:", yaml);
        const json = yamlToJson(yaml);
        // console.log("json:", json);

        MODELS_CONFIG[`tree_${treeName}_` + i] = json;
    }
}

function initTreeMaterials(img) {
    const barkCanvasArr = sliceCanvas(
        img, // Image element
        35, // Slice width
        150 // Slice height
    );
    // document.body.append(...BARK_CANVAS_ARR);
    // console.log("BARK_CANVAS_ARR:", BARK_CANVAS_ARR);
    Object.entries(TREE_TYPES).forEach(([key, value], i) => {
        TREE_TYPES[key].trunkCanvas = barkCanvasArr[i];
        // Create a material for each tree type using its texture
        // console.log("value.trunkCanvas:", value.trunkCanvas);
        const leftCanvas = value.trunkCanvas;
        const rightCanvas = flipCanvas(value.trunkCanvas, true); // horizontally flipped
        const _canvas = concatHorizCanvas(leftCanvas, rightCanvas);
        value.material = new THREE.MeshStandardMaterial({
            map: new THREE.CanvasTexture(
                scaleCanvas(_canvas, 8)
            ),
            // displacementMap: new THREE.CanvasTexture(value.texture),
            // color: 0xffffff,
            roughness: 0.5,
            metalness: 0.1
        });
        // make the material really crisp pixel art style
        value.material.map.magFilter = THREE.NearestFilter;
        value.material.map.minFilter = THREE.NearestFilter;
        value.material.map.anisotropy = 16; // Increase anisotropy for better texture quality
        value.material.map.needsUpdate = true; // Ensure the texture is updated
    });
}