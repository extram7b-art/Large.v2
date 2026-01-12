// ===== SCENE =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 1.7, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// ===== LIGHT =====
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(10, 20, 10);
scene.add(sun);

// ===== FLOOR =====
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(300, 300),
  new THREE.MeshStandardMaterial({ color: 0x444444 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// ===== PLAYER =====
let health = 100;
let ammo = 30;
const maxAmmo = 30;
let reloading = false;

const uiHealth = document.getElementById("health");
const uiAmmo = document.getElementById("ammo");
const blood = document.getElementById("blood");

// ===== POINTER LOCK =====
document.body.addEventListener("click", () => {
  document.body.requestPointerLock();
});

let yaw = 0, pitch = 0;
document.addEventListener("mousemove", e => {
  if (document.pointerLockElement !== document.body) return;
  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
  camera.rotation.set(pitch, yaw, 0);
});

// ===== WASD =====
const keys = {};
addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ===== AUDIO (NO FILES) =====
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function gunSound() {
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = "square";
  o.frequency.setValueAtTime(200, audioCtx.currentTime);
  o.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.1);
  g.gain.setValueAtTime(0.3, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  o.connect(g).connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + 0.12);
}

function hitSound() {
  const o = audioCtx.createOscillator();
  o.type = "sawtooth";
  o.frequency.value = 80;
  o.connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + 0.05);
}

// ===== GUN =====
const gun = new THREE.Group();
const gunBody = new THREE.Mesh(
  new THREE.BoxGeometry(0.25, 0.2, 1),
  new THREE.MeshStandardMaterial({ color: 0x222222 })
);
const barrel = new THREE.Mesh(
  new THREE.CylinderGeometry(0.05, 0.05, 0.8),
  new THREE.MeshStandardMaterial({ color: 0x444444 })
);
barrel.rotation.x = Math.PI / 2;
barrel.position.z = -0.9;
gun.add(gunBody, barrel);
gun.position.set(0.4, -0.4, -1);
camera.add(gun);
scene.add(camera);

// ===== ENEMIES =====
const enemies = [];

function createEnemy() {
  const enemy = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.4, 1.2, 6, 8),
    new THREE.MeshStandardMaterial({ color: 0x550000 })
  );

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xaa0000 })
  );
  head.position.y = 1.1;

  enemy.add(body, head);
  enemy.position.set(
    (Math.random() - 0.5) * 60,
    1,
    (Math.random() - 0.5) * 60
  );

  enemy.userData = { hp: 8, cooldown: 0 };
  enemies.push(enemy);
  scene.add(enemy);
}

for (let i = 0; i < 10; i++) createEnemy();

// ===== SHOOT =====
document.addEventListener("mousedown", () => {
  if (reloading) return;
  if (ammo <= 0) return reload();

  ammo--;
  uiAmmo.textContent = ammo;
  gunSound();

  gun.position.z = -0.8;
  setTimeout(() => gun.position.z = -1, 80);

  const bullet = new THREE.Mesh(
    new THREE.SphereGeometry(0.05),
    new THREE.MeshStandardMaterial({ color: 0xffff00 })
  );
  bullet.position.copy(camera.position);
  scene.add(bullet);

  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);

  function move() {
    bullet.position.add(dir.clone().multiplyScalar(0.9));

    enemies.forEach((e, i) => {
      if (bullet.position.distanceTo(e.position) < 1.2) {
        e.userData.hp--;
        // ===== LOOP =====
function animate() {
  requestAnimationFrame(animate);

  const speed = 0.12;
  if (keys["w"]) camera.translateZ(-speed);
  if (keys["s"]) camera.translateZ(speed);
  if (keys["a"]) camera.translateX(-speed);
  if (keys["d"]) camera.translateX(speed);

  enemies.forEach(enemyLogic);
  renderer.render(scene, camera);
}
animate();

// ===== RESIZE =====
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
leng
