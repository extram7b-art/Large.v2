const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 1.7, 5);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1));

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x444444 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// ===== WASD =====
let yaw = 0;
let pitch = 0;
const sensitivity = 0.002;

document.addEventListener("mousemove", e => {
  if (document.pointerLockElement !== document.body) return;

  yaw -= e.movementX * sensitivity;
  pitch -= e.movementY * sensitivity;

  pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
  camera.rotation.set(pitch, yaw, 0);
});

const keys = {};
addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ===== ENEMY =====
const enemies = [];

function createEnemy() {
  const e = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1),
    new THREE.MeshStandardMaterial({ color: 0xaa0000 })
  );
  e.position.set((Math.random() - 0.5) * 50, 1, (Math.random() - 0.5) * 50);
  enemies.push(e);
  scene.add(e);
}
for (let i = 0; i < 5; i++) createEnemy();

// ===== LOOP =====
function animate() {
  requestAnimationFrame(animate);

  const speed = 0.12;
  if (keys["w"]) camera.translateZ(-speed);
  if (keys["s"]) camera.translateZ(speed);
  if (keys["a"]) camera.translateX(-speed);
  if (keys["d"]) camera.translateX(speed);

  enemies.forEach(e => e.lookAt(camera.position));

  renderer.render(scene, camera);
}
animate(const speed = 0.12;
let moving = false;

if (keys["w"]) { camera.translateZ(-speed); moving = true; }
if (keys["s"]) { camera.translateZ(speed);  moving = true; }
if (keys["a"]) { camera.translateX(-speed); moving = true; }
if (keys["d"]) { camera.translateX(speed);  moving = true; }

if (moving) {
  bobTime += 0.15;
  camera.position.y = 1.7 + Math.sin(bobTime) * 0.05;
} else {
  bobTime = 0;
  camera.position.y += (1.7 - camera.position.y) * 0.1;
}
);

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  document.body.addEventListener("click", () => {
  document.body.requestPointerLock();
});
});

