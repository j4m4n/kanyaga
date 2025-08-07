(function () {
  function snapshotScene(scene) {
    if (!scene || scene.type !== "Scene") {
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

      if (obj.isLight) stats.lightCount++;
      if (obj.isCamera) stats.cameraCount++;
      if (obj.type === "Group") stats.groupCount++;

      stats.objectList.push({
        name: obj.name || "(unnamed)",
        type: obj.type,
        visible: obj.visible,
      });
    });

    // Convert sets to arrays for easier viewing
    return {
      objectCount: stats.objectCount,
      meshCount: stats.meshCount,
      lightCount: stats.lightCount,
      cameraCount: stats.cameraCount,
      groupCount: stats.groupCount,
      materials: Array.from(stats.materials),
      geometries: Array.from(stats.geometries),
      objectList: stats.objectList,
    };
  }

  function printSceneSnapshot(scene, label = "Scene") {
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

    console.table(snap.objectList);
    console.groupEnd();

    // Attach to window for manual copy/paste across tabs
    window._sceneDebugSnapshot = snap;
  }

  // Expose globally
  window.printSceneSnapshot = printSceneSnapshot;
})();
