class CrappyObjectInstance  {
    instances = {};
    groups = {};
    materialInstances = {};

    constructor(state, typeMap = {}) {
        this.root = new THREE.Group();
        this.state = state;
        this.typeMap = typeMap;
        this.instantiate();
    }

    instantiate() {
        Object.values(this.instances).forEach(inst=>inst.parent.remove(inst));
        this.instances={};
        this.groups={};
        this.materialInstances={};
        // NOTE: Two passes to add support for nested groups
        Object.values(this.state.objs).forEach(obj=>{
            if(typeof obj.group !== "undefined" && !this.groups[obj.group]) {
                this.groups[obj.group] = new THREE.Group();
                this.root.add(this.groups[obj.group]);
            }
        });
        Object.values(this.state.objs).forEach(obj=>{
            this.instantiateObject(obj);
        });
    }

    getMatInstance(id){
        if (!id) id = 'default';
        const mat = this.state.materials[id];

        if (this.typeMap[id]) {
            return this.typeMap[id].material;
        }

        if (!this.materialInstances[id]) this.materialInstances[id]= new THREE.MeshBasicMaterial({ color: mat.color });
        //if (!this.materialInstances[id]) this.materialInstances[id]= new THREE.MeshStandardMaterial({ color: mat.color });
        return this.materialInstances[id];
    }

    instantiateObject(obj){
        let g = this.getGeometryForType(obj.type, obj.args || []);
        let mat = this.getMatInstance(obj.matId);
        let mesh = new THREE.Mesh(g, mat);

        mesh.position.copy(new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z));
        mesh.rotation.copy(new THREE.Euler(obj.rotation.x, obj.rotation.y, obj.rotation.z));
        mesh.scale.copy(new THREE.Vector3(obj.scale.x, obj.scale.y, obj.scale.z));

        mesh.name = obj.id;
        if(obj.group) {
            this.groups[obj.group].add(mesh);
        } else {
            this.root.add(mesh);
        }

        this.instances[obj.id] = mesh;
    }

    getGeometryForType(type, args){
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
