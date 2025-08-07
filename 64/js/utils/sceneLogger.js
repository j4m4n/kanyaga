function sceneLogger(scene, label = "Scene") {
  const snap = snapshotScene(scene);
  if (!snap) return;

  console.group(`📊 ${label} Snapshot`);

  console.table({
    Objects: snap.objectCount,
    Meshes: snap.meshCount,
    Lights: snap.lightCount,
    Cameras: snap.cameraCount,
    Groups: snap.groupCount,
    Materials: snap.materials.join(", "),
    Geometries: snap.geometries.join(", "),
  });

  console.group("🎭 Object List");
  console.table(snap.objectList);
  console.groupEnd();

  console.group("💡 Lights");
  console.table(snap.lights);
  console.groupEnd();

  console.group("📷 Cameras");
  console.table(snap.cameras);
  console.groupEnd();

  console.groupEnd();

  // Expose the snapshot for copy-pasting or external inspection
  window.SCENE_LOG = snap;
}

function snapshotScene(scene) {
  if (!scene || !scene.type) {
    console.error("Provided scene is invalid or missing.");
    return null;
  }

  const stats = {
    objectCount: 0,
    meshCount: 0,
    lightCount: 0,
    cameraCount: 0,
    groupCount: 0,
    materials: new Set(),
    geometries: new Set(),
    objectList: [],
    lights: [],
    cameras: [],
  };

  scene.traverse(obj => {
    stats.objectCount++;

    if (obj.isMesh) {
      stats.meshCount++;
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(mat => stats.materials.add(mat.type));
      }
      if (obj.geometry) {
        stats.geometries.add(obj.geometry.type);
      }
    }

    if (obj.isLight) {
      stats.lightCount++;
      stats.lights.push({
        name: obj.name || "(unnamed)",
        type: obj.type,
        color: obj.color?.getHexString?.() || "N/A",
        intensity: obj.intensity ?? "N/A",
        castShadow: obj.castShadow ?? false,
        position: obj.position ? `(${obj.position.x.toFixed(2)}, ${obj.position.y.toFixed(2)}, ${obj.position.z.toFixed(2)})` : "N/A",
      });
    }

    if (obj.type === "Group") stats.groupCount++;

    stats.objectList.push({
      name: obj.name || "(unnamed)",
      type: obj.type,
      parentName: obj.parent?.name || "(unnamed)",
      // visible: obj.visible,
      position: obj.position ? `(${obj.position.x.toFixed(2)}, ${obj.position.y.toFixed(2)}, ${obj.position.z.toFixed(2)})` : "N/A",
    });
  });
  stats.cameraCount = 1;
  let cameraObj;
  if(typeof GAME !== "undefined" && GAME.camera) {
    cameraObj = GAME.camera;
  } else if (camera) {
    cameraObj = camera;
  }
  stats.cameras.push({
    name: cameraObj.name || "(unnamed)",
    // type: cameraObj.type,
    // fov: cameraObj.fov ?? "N/A",
    // near: cameraObj.near ?? "N/A",
    // far: cameraObj.far ?? "N/A",
    // zoom: cameraObj.zoom ?? "N/A",
    aspect: cameraObj.aspect ?? "N/A",
    position: cameraObj.position ? `(${cameraObj.position.x.toFixed(2)}, ${cameraObj.position.y.toFixed(2)}, ${cameraObj.position.z.toFixed(2)})` : "N/A",
  });

  // sort objects by name
  stats.objectList.sort((a, b) => a.name.localeCompare(b.name));
  stats.lights.sort((a, b) => a.name.localeCompare(b.name));
  stats.cameras.sort((a, b) => a.name.localeCompare(b.name));

  return {
    objectCount: stats.objectCount,
    meshCount: stats.meshCount,
    lightCount: stats.lightCount,
    cameraCount: stats.cameraCount,
    groupCount: stats.groupCount,
    materials: Array.from(stats.materials),
    geometries: Array.from(stats.geometries),
    objectList: stats.objectList,
    lights: stats.lights,
    cameras: stats.cameras,
  };
}