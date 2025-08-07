function jsonToMesh(json, typeMap) {
    const mesh = new THREE.Group();
    const materialMap = {};
    if (typeMap && typeMap[json.name]) {
        materialMap[json.name] = typeMap[json.name].material;
    }
    Object.entries(json.materials).forEach(([id, data]) => {
        let mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(data.color),
            metalness: 0,
            roughness: 1,
        });
        // console.log("mat:", mat);
        mat.userData.id = data.id;
        mat.userData.color = data.color;
        mat.userData.name = data.name;
        materialMap[id] = mat;
    });
    Object.entries(json.objs).forEach(([name, obj]) => {
        const geometry = typeToGeometry(obj.type, obj.args ?? []);
        geometry.scale(obj.scale.x, obj.scale.y, obj.scale.z);
        const meshPart = new THREE.Mesh(
            geometry,
            materialMap[obj.matId]
        );
        meshPart.userData.name = name;
        meshPart.userData.id = obj.id;
        meshPart.userData.color = obj.color;
        meshPart.userData.matId = obj.matId;
        meshPart.position.set(obj.position.x, obj.position.y, obj.position.z);
        meshPart.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);

        mesh.add(meshPart);
    });
    return mesh;

    function typeToGeometry(type, [...args]) {
        // console.log("type, args:", type, args);
        switch (type) {
            case 'cube':
                args = args || [1, 1, 1];
                return new THREE.BoxGeometry(...args);
            case 'sphere':
                args = args || [1, 32, 32];
                return new THREE.SphereGeometry(...args);
            case 'cylinder':
                args = args || [1, 1, 1, 32];
                return new THREE.CylinderGeometry(...args);
            case 'cone':
                return new THREE.ConeGeometry(...args);
            case 'torus':
                args = args || [0.5, 0.3, 16, 100];
                return new THREE.TorusGeometry(...args);
            case 'plane':
                args = args || [1, 1, 1, 1];
                return new THREE.PlaneGeometry(...args);
            case 'ring':
                args = args || [0.5, 1, 32];
                return new THREE.RingGeometry(...args);
            case 'dodecahedron':
                args = args || [1, 0];
                return new THREE.DodecahedronGeometry(...args);
            case 'icosahedron':
                args = args || [1, 0];
                return new THREE.IcosahedronGeometry(...args);
            case 'octahedron':
                args = args || [1, 0];
                return new THREE.OctahedronGeometry(...args);
            case 'tetrahedron':
                args = args || [1, 0];
                return new THREE.TetrahedronGeometry(...args);
            // case 'heart': // TODO: Maybe support this type of thing?
            //     return new THREE.ShapeGeometry(new THREE.Shape()
            //         .moveTo(0, 0)
            //         .bezierCurveTo(0, 1, 1, 1, 1, 0)
            //         .bezierCurveTo(1, -1, 0, -1, 0, 0)
            //     );
            default:
                args = args || [1, 1, 1];
                return new THREE.BoxGeometry(...args);
        }
    }
}
function yamlToJson(yamlText, typeMap) {
    const jsonSlim = yamlToJsonSlim(yamlText);
    const json = jsonSlimToJson(jsonSlim);
    // console.log("json:", json);
    // JSON_TA.textContent = JSON.stringify(json, null, 2);
    return json;
}
function yamlToMesh(yamlText, typeMap) {
    const jsonSlim = yamlToJsonSlim(yamlText);
    const json = jsonSlimToJson(jsonSlim);
    console.log("json:", json);
    // JSON_TA.textContent = JSON.stringify(json, null, 2);
    return jsonToMesh(json, typeMap);
}
function jsonSlimToJson(jsonSlim) {
    const json = {
        name: jsonSlim.name,
        objs: {},
        materials: {}
    };

    Object.entries(jsonSlim.objs).forEach(([id, obj]) => {
        // console.log("obj:", obj);
        json.objs[id] = {
            id: id,
            type: obj.g,
            position: {
                x: obj.position[0],
                y: obj.position[1],
                z: obj.position[2]
            },
            rotation: {
                x: obj.rotation[0],
                y: obj.rotation[1],
                z: obj.rotation[2]
            },
            scale: {
                x: obj.scale[0],
                y: obj.scale[1],
                z: obj.scale[2]
            },
            args: obj.args ?? [],
            matId: obj.m
        };
    });

    Object.entries(jsonSlim.materials).forEach(([id, color]) => {
        // console.log("color:", color);
        json.materials[id] = {
            id,
            color: color,
            name: id
        };
    });

    return json;
}
function yamlToJsonSlim(yamlText) {
    const lines = yamlText.split('\n');
    const result = { name: "", objs: {}, materials: {} };
    let currentSection = null;
    let currentObj = null;
    const objKeys = ['g', 'm', 'p', 'r', 's', 'a'];
    let objKeyIndex = 0;

    lines.forEach(rawLine => {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) return;

        const indentLevel = rawLine.search(/\S/);

        if (line.startsWith('name:')) {
            result.name = line.split(':')[1].trim();
        } else if (line === 'objs:') {
            currentSection = 'objs';
        } else if (line === 'materials:') {
            currentSection = 'materials';
        } else if (currentSection === 'objs' && indentLevel === 2 && line.endsWith(':')) {
            currentObj = line.replace(':', '').trim();
            result.objs[currentObj] = {};
            objKeyIndex = 0;
        } else if (currentSection === 'objs' && indentLevel === 4) {
            const key = objKeys[objKeyIndex++];
            result.objs[currentObj][key] = line.split(':')[1].trim();
        } else if (currentSection === 'materials' && line.includes(':')) {
            const [key, value] = line.split(':').map(s => s.trim());
            result.materials[key] = value.replace(/['"]+/g, '');
        }
    });

    // Post-process objs for positions, rotations, scales
    Object.values(result.objs).forEach(obj => {
        if (obj.p) obj.position = obj.p.split(',').map(Number);
        if (obj.r) obj.rotation = obj.r.split(',').map(Number);
        if (obj.s) obj.scale = obj.s.split(',').map(Number);
        if (obj.a) obj.args = obj.a.split(',').map(Number);

        delete obj.p;
        delete obj.r;
        delete obj.s;
        delete obj.a;
    });

    return result;
}

/**
 * Generates a YAML tree using tree type data
 * @param {string} treeType - The type of tree from TREE_TYPES
 * @param {number} treeAge - Age factor from 0.0 (sapling) to 1.0 (full grown)
 * @param {number} treeSeed - Random seed for tree generation (TODO: implement)
 * @returns {string} YAML string representing the tree
 */
function yamlTree(
    treeType,
    treeAge = 0.5, // 0.0 = sappling, 1.0 = full grown
    // treeSeed = 0, // TODO: Add random seed support
) {
    // Math.seedrandom(seed);
    const treeData = TREE_TYPES[treeType];
    if (!treeData) {
        console.error(`Tree type "${treeType}" not found in TREE_TYPES`);
        return '';
    }
    // console.log("treeData:", treeData);
    const heightSpread = treeData.maxTreeHeight - treeData.minTreeHeight;
    const treeAgeFactor = Math.max(0, Math.min(1, treeAge));
    const treeHeight = treeData.minTreeHeight + treeAgeFactor * heightSpread;
    const treeAgeRatio = treeHeight / treeData.maxTreeHeight;
    const th = treeHeight; // Trunk height
    const thh = th / 2; // Half trunk height
    const trb = treeData.radiusTrunkBase; // Trunk radius base from tree data
    const trt = treeData.radiusTrunkTop; // Trunk radius top from tree data
    const canopySegsX = treeData.canopySegsX;
    const canopySegsY = treeData.canopySegsY;
    const canopyCount = treeData.canopyCount;
    const canopyScaleX = treeData.canopyScaleX;
    const canopyScaleY = treeData.canopyScaleY;
    const canopyScaleZ = treeData.canopyScaleZ;
    const canopyScaleXStep = treeData.canopyScaleXStep;
    const canopyScaleYStep = treeData.canopyScaleYStep;
    const canopyScaleZStep = treeData.canopyScaleZStep;

    // Note: treeData.texture contains a canvas element with bark texture
    // This could be used for more advanced rendering systems

    const canopyYO = treeData.canopyYO * th;
    const canopyXO = treeData.canopyXO * trb;
    const canopyZO = treeData.canopyZO * trb;

    const canopyYOStep = treeData.canopyYOStep;
    const canopyXOStep = treeData.canopyXOStep;
    const canopyZOStep = treeData.canopyZOStep;

    // Create canopy array based on available colors
    const canopyArr = treeData.canopyArr;
    const latentMaterials = {};
    const rd = 3; // Random divisor for rotation
    const treeYaml = `\
name: ${treeType}
objs:
  trunk:
    g: cylinder
    m: ${treeType}
    p: 0,${thh},0
    r: 0,0,0
    s: 1,${th},1
    a: ${trt * treeAgeRatio},${trb * treeAgeRatio},1,8
${Array(canopyCount).fill(1).map((_, i) => {
        let randXZ = Math.random();
        return canopyArr.map((n, j) => {
            if (treeData.canopyRandRefresh) {
                randXZ = Math.random();
            }

            let canopyMat = n.mat || 'default';
            if (n.color) {
                if (!latentMaterials[n.color]) latentMaterials[n.color] = {};
                latentMaterials[n.color].id = `color_${n.color.replace('#', '')}`;
                latentMaterials[n.color].color = n.color;
                canopyMat = latentMaterials[n.color].id;
            }

            const startingYOBonus = treeData.startingYOBonus || 0;

            // Convergence factor: closer to 0 as i increases
            const convergenceFactor = 1 - (i / (canopyCount - 1));
            let xm = n.xm || 1.0;
            let ym = n.ym || 1.0;
            let zm = n.zm || 1.0;
            let px = ((canopyXO * xm * treeAgeRatio) + (i * canopyXOStep * treeAgeRatio)) * convergenceFactor;
            let py = (canopyYO * ym * treeAgeRatio) + (i * canopyYOStep * treeAgeRatio) + (j * n.ycm * treeAgeRatio);
            // console.log("i, j, py:", i, j, py);
            let pz = ((canopyZO * zm * treeAgeRatio) + (i * canopyZOStep * treeAgeRatio)) * convergenceFactor;
            let rx = n.rx ?? Math.random() / rd;
            let ry = n.ry ?? Math.random() / rd;
            let rz = n.rz ?? Math.random() / rd;
            let sx = (canopyScaleX * n.sm * treeAgeRatio) + (i * canopyScaleXStep);
            let sy = (canopyScaleY * n.sm * treeAgeRatio) + (i * canopyScaleYStep);
            let sz = (canopyScaleZ * n.sm * treeAgeRatio) + (i * canopyScaleZStep);

            if (randXZ < 0.25) {
                px *= -1;
            } else if (randXZ < 0.5) {
                pz *= -1;
            } else if (randXZ < 0.75) {
                px *= -1;
                pz *= -1;
            }

            py += startingYOBonus - (startingYOBonus * treeAgeRatio);

            px = px.toFixed(3);
            py = py.toFixed(3);
            pz = pz.toFixed(3);
            rx = rx.toFixed(3);
            ry = ry.toFixed(3);
            rz = rz.toFixed(3);
            sx = sx.toFixed(3);
            sy = sy.toFixed(3);
            sz = sz.toFixed(3);

            return `\
  canopy${i + 1}_${j + 1}:
    g: sphere
    m: ${canopyMat}
    p: ${px},${py},${pz}
    r: ${rx},${ry},${rz}
    s: ${sx},${sy},${sz}
    a: 1,${canopySegsX},${canopySegsY}`;
        }).join('\n');
    }).join('\n')
        }
materials:
  default: "#ffffff"
  ${Object.values(latentMaterials).map(mat => {
            return `${mat.id}: ${mat.color}`;
        }).join('\n  ')
        }
`;
    return treeYaml;
}

/**
 * Get list of available tree types
 * @returns {string[]} Array of available tree type names
 */
function getAvailableTreeTypes() {
    return Object.keys(TREE_TYPES);
}

function initTreeGridDemo() {
    let treeZ = 0;
    const treeSpacing = 8;
    const treeCount = 10;
    Object.keys(TREE_TYPES).forEach((key, i) => {
        const tc = textCanvas(key, 256, 128);
        const labelW = treeSpacing * 2; // 10px per character
        const planeMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(labelW, treeSpacing),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(tc), side: THREE.DoubleSide })
        );
        planeMesh.rotation.x = -Math.PI / 3;
        planeMesh.position.set(-labelW - (GRID_SIZE / 2), 1, treeZ - (GRID_SIZE / 2));
        SCENE.add(planeMesh);

        for (let j = 0; j < treeCount; j++) {
            const treeX = j * treeSpacing;
            const treeAge = j / treeCount; // age of the tree, 0.0 to 1.0
            const treeYaml = yamlTree2(
                key, // this must match a key in TREE_TYPES (see TREE_TYPES.js)
                treeAge // age of the tree, 0.0 to 1.0
            );
            const treeMesh = yamlToMesh(treeYaml, TREE_TYPES);
            treeMesh.position.set(treeX - (GRID_SIZE / 2), 0, treeZ - (GRID_SIZE / 2));
            SCENE.add(treeMesh);

        }
        treeZ += treeSpacing;
    });
}