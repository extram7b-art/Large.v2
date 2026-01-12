// ===== BASIC SETUP =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.7, 5);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ===== LIGHT =====
scene.add(new THREE.AmbientLight(0xffffff, 1));

// ===== FLOOR =====
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x555555 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// ===== POINTER LOCK =====
document.body.addEventListener("click", () => {
  document.body.requestPointerLock();
});

// ===== MOUSE LOOK =====
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

// ===== WASD MOVEMENT =====
const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ===== HEAD BOB =====
let bobTime = 0;
const baseHeight = 1.7;

// ===== MAIN LOOP =====
function animate() {
  requestAnimationFrame(animate);

  const speed = 0.12;
  let moving = false;

  if (keys["w"]) { camera.translateZ(-speed); moving = true; }
  if (keys["s"]) { camera.translateZ(speed);  moving = true; }
  if (keys["a"]) { camera.translateX(-speed); moving = true; }
  if (keys["d"]) { camera.translateX(speed);  moving = true; }

  if (moving) {
    bobTime += 0.15;
    camera.position.y = baseHeight + Math.sin(bobTime) * 0.05;
  } else {
    bobTime = 0;
    camera.position.y += (baseHeight - camera.position.y) * 0.1;
  }

  renderer.render(scene, camera);
}

animate();

// ===== RESIZE =====
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
