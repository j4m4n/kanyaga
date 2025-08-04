var boidbox;
let width = 4;
let height = 4;
const numBoids = 20;
const visualRange = 30;
var boids = [];
var boids3D = [];
const speedLimit = 1;

function startup() {
	boidsgroup = new THREE.Group();
	scene.add( boidsgroup );
	
	// grid
	var size = width*25;
	var divisions = 1;
	var gridHelper = new THREE.GridHelper( size, divisions );
	scene.add( gridHelper );	

	// boid [replace with any 3D object]
	const map = new THREE.TextureLoader().load( 'sprite.png' );
	const material = new THREE.SpriteMaterial( { map: map, transparent:true, opacity:0.5 } );
	boidbox = new THREE.Sprite( material );
	//
	boidsgroup.add( boidbox );
	boidbox.visible = false;

	// boids
	initBoids();
}


// create boids
function initBoids() {
	for (var i = 0; i < numBoids; i += 1) {
		var boidclone = boidbox.clone();
		boidclone.visible = true;
		scene.add(boidclone);
		boids3D.push(boidclone)
		//
		boids[boids.length] = {
			x: Math.random() * width,
			y: Math.random() * height,
			z: Math.random() * height,
			dx: Math.random() * 10 - 5,
			dy: Math.random() * 10 - 5,
			dz: Math.random() * 10 - 5
		};
	}
}

// get distance helper
function distance(boid1, boid2) {
	return Math.sqrt(
		(boid1.x - boid2.x) * (boid1.x - boid2.x) +
		(boid1.y - boid2.y) * (boid1.y - boid2.y) +
		(boid1.z - boid2.z) * (boid1.z - boid2.z),
		);
}


// Constrain. If it gets too close to an edge,
// nudge it back in and reverse its direction.
function keepWithinBounds(boid) {
	const margin = 200;
	const turnFactor = 1;

	if (boid.x < margin) {
		boid.dx += turnFactor;
	}
	if (boid.x > width - margin) {
		boid.dx -= turnFactor
	}
	if (boid.y < margin) {
		boid.dy += turnFactor;
	}
	if (boid.y > height - margin) {
		boid.dy -= turnFactor;
	}
	if (boid.z < margin) {
		boid.dz += turnFactor;
	}
	if (boid.z > width - margin) {
		boid.dz -= turnFactor
	}
}

// Find the center of mass of the other boids and adjust velocity slightly to
// point towards the center of mass.
function flyTowardsCenter(boid) {
	const centeringFactor = 0.005; // adjust velocity by this %

	let centerX = 0;
	let centerY = 0;
	let numNeighbors = 0;

	for (let otherBoid of boids) {
		if (distance(boid, otherBoid) < visualRange) {
			centerX += otherBoid.x;
			centerY += otherBoid.y;
			numNeighbors += 1;
		}
	}

	if (numNeighbors) {
		centerX = centerX / numNeighbors;
		centerY = centerY / numNeighbors;

		boid.dx += (centerX - boid.x) * centeringFactor;
		boid.dy += (centerY - boid.y) * centeringFactor;
	}
}

// Move away from other boids that are too close to avoid colliding
function avoidOthers(boid) {
	const minDistance = 20; // The distance to stay away from other boids
	const avoidFactor = 0.05; // Adjust velocity by this %
	let moveX = 0;
	let moveY = 0;
	let moveZ = 0;

	for (let otherBoid of boids) {
		if (otherBoid !== boid) {
			if (distance(boid, otherBoid) < minDistance) {
				moveX += boid.x - otherBoid.x;
				moveY += boid.y - otherBoid.y;
				moveZ += boid.z - otherBoid.z;
			}
		}
	}

	boid.dx += moveX * avoidFactor;
	boid.dy += moveY * avoidFactor;
	boid.dz += moveZ * avoidFactor;
}

// Find the average velocity (speed and direction) of the other boids and
// adjust velocity slightly to match.
function matchVelocity(boid) {
	const matchingFactor = 0.05; // Adjust by this % of average velocity

	let avgDX = 0;
	let avgDY = 0;
	let avgDZ = 0;
	let numNeighbors = 0;

	for (let otherBoid of boids) {
		if (distance(boid, otherBoid) < visualRange) {
			avgDX += otherBoid.dx;
			avgDY += otherBoid.dy;
			avgDZ += otherBoid.dz;
			numNeighbors += 1;
		}
	}

	if (numNeighbors) {
		avgDX = avgDX / numNeighbors;
		avgDY = avgDY / numNeighbors;
		avgDZ = avgDZ / numNeighbors;

		boid.dx += (avgDX - boid.dx) * matchingFactor;
		boid.dy += (avgDY - boid.dy) * matchingFactor;
		boid.dz += (avgDZ - boid.dz) * matchingFactor;
	}
}

// Speed will naturally vary in flocking behavior, but real animals can't go
// arbitrarily fast.
function limitSpeed(boid) {
	const speed = Math.sqrt(boid.dx * boid.dx + boid.dy * boid.dy + boid.dz * boid.dz);
	if (speed > speedLimit) {
		boid.dx = (boid.dx / speed) * speedLimit;
		boid.dy = (boid.dy / speed) * speedLimit;
		boid.dz = (boid.dz / speed) * speedLimit;
	}
}


// Main animation loop
function animationLoop() {
// Update each boid
for (let boid of boids) {
	// Update the velocities according to each rule
	flyTowardsCenter(boid);
	avoidOthers(boid);
	matchVelocity(boid);
	limitSpeed(boid);
	keepWithinBounds(boid);

	// Update the position based on the current velocity
	boid.x += boid.dx;
	boid.y += boid.dy;
	boid.z += boid.dz;
}

// move/rotate the boids via lerp
for ( var i = 0; i < boids3D.length; i ++ ) {
	boids3D[i].position.x += (((boids[i].x/4)-(width-10))-boids3D[i].position.x)*0.2; 
	boids3D[i].position.z += (((boids[i].y/4)-(height-10))-boids3D[i].position.z)*0.2;
	boids3D[i].position.y += (((boids[i].z/4)-(height-10)+(width*10))-boids3D[i].position.y)*0.2;
	// rotate 
	// boids3D[i].rotation.z = Math.atan(boids[i].dx,boids[i].dy)/2;
	// boids3D[i].rotation.x = -Math.atan(boids[i].dz,boids[i].dy)/2;
}

}

// testing
function tend_to_place(place, boid) {
	return (place - boid.position) / 100;
}

// START <<<<<<
startup();
