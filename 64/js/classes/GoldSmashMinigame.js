class GoldSmashMinigame {
    constructor(canvas, onQuit) {
        this.canvas = canvas; 
        this.onQuit = onQuit;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
        this.camera.position.z = 6;

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, canvas });
        this.renderer.setPixelRatio( 64/64 );
        this.renderer.setSize( 64, 64 );

        this.hero = new THREE.Group();
        this.scene.add( this.hero );

        var geometry = new THREE.BoxGeometry( 0.8, 0.8, 0.8 );
        var material = new THREE.MeshBasicMaterial({});
        this.ship = new THREE.Mesh( geometry, material );
        this.ship.position.z = 1;
        this.scene.add( this.ship );

        this.cubes = [];
        for (let x = 0; x < 4; x++) {
            for (let y = 0; y < 4; y++) {
                let g = new THREE.SphereGeometry();
                let m = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffff00) });
                let mesh = new THREE.Mesh(g, m);
                this.scene.add(mesh);
                mesh.position.x = (x - 2) * 2 + 1;
                mesh.position.y = (y - 2) * 2 + 1;
                this.cubes.push(mesh)
            }
        }

        this.particles = [];
        this.explodeParticles = (position) => {
            let g = new THREE.SphereGeometry(0.1, 6, 4);	// low poly sphere
                
                
            // Comment this next line out for strictly yellow particles
            //m = new THREE.MeshBasicMaterial({ color: new THREE.Color(Math.random() * 0xffffff) });

            let amount = 500;
            for (let i =0; i < amount; i++) {
                let m = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffff00 + 250 * Math.random()) });
                let mesh = new THREE.Mesh(g, m);
                //mesh.scale.multiplyScalar(0.1);
                this.scene.add(mesh);
                mesh.position.copy(position);
                this.particles.push({
                    mesh,
                    birthTime: TIME,
                    direction: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
                });
            }
        }

        let particleSpeed = 0.5;
        this.updateParticles = () => {
            for (let i = 0; i < this.particles.length; i++) {
                let particle = this.particles[i];
                particle.mesh.position.add(particle.direction.clone().multiplyScalar(particleSpeed));
                
                if (TIME - particle.birthTime > 1000) {
                    particle.dead = true;
                    this.scene.remove(particle.mesh);
                }
            }
            this.particles = this.particles.filter(p => !p.dead);
        }

        this.smash = () => {
            let getDistance = (a, b) => Math.abs(a.position.x - b.position.x ) + Math.abs(a.position.y - b.position.y);
            let removedCubes = [];
            let smashedCubes = this.cubes.find(c => {
                let dist = getDistance(this.ship, c);
                if (dist < 1) {
                    this.scene.remove(c);
                    removedCubes.push(c);
                    this.explodeParticles(c.position);
                }
            })
            this.cubes = this.cubes.filter(c => !removedCubes.includes(c));
        }
        // end of constructor
    }

    update(time, keyboard) {
        if (this.cubes.length == 0) {
            this.onQuit();
            return;
        }

        let hero = this.hero;
        let ship = this.ship;
        let player = { speed: 0.5 };

        if (keyboard.isDown(keyboard.UP) && hero.position.y < 3 ) {    
          hero.position.y += player.speed;
        }
        if (keyboard.isDown(keyboard.DOWN) && hero.position.y > -3) {
          hero.position.y -= player.speed;  
        } 
        if (keyboard.isDown(keyboard.LEFT) && hero.position.x > -3)   {
          hero.position.x -= player.speed;
        }
        if (keyboard.isDown(keyboard.RIGHT) && hero.position.x < 3)   {
          hero.position.x += player.speed;
        }
        
        //if (keyboard.isDown(keyboard.SPACE)) {
            // Activate smashing mode
            ship.material.color = new THREE.Color(0xFFFFFF);
            this.smash();
        //} else {
        //    // Non-smashing mode
        //    ship.material.color = new THREE.Color(0x00FF00);
        //}

        // ship lerp position
        ship.position.x += (hero.position.x - ship.position.x)*0.2;
        ship.position.y += (hero.position.y - ship.position.y)*0.2;

        ship.lookAt(hero.position)
        this.updateParticles();

        this.renderer.render( this.scene, this.camera );
    }
};