// ===== SCENE =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
camera.position.set(0, 1.7, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ===== LIGHT =====
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.DirectionalLight(0xffffff, 0.8);
light.position.set(10, 20, 10);
scene.add(light);

// ===== FLOOR =====
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(300, 300),
  new THREE.MeshStandardMaterial({ color: 0x444444 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// ===== UI =====
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

// ===== MOUSE LOOK =====
let yaw = 0;
let pitch = 0;

document.addEventListener("mousemove", e => {
  if (document.pointerLockElement !== document.body) return;

  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

  camera.rotation.set(pitch, yaw, 0);
});

// ===== WASD =====
const keys = {};
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ===== SIMPLE AUDIO (NO FILES) =====
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playShootSound() {
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = "square";
  o.frequency.value = 180;
  g.gain.value = 0.2;
  o.connect(g).connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + 0.1);
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
  const enemy = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.4, 1.2, 6, 8),
    new THREE.MeshStandardMaterial({ color: 0xaa0000 })
  );

  enemy.position.set(
    (Math.random() - 0.5) * 80,
    1,
    (Math.random() - 0.5) * 80
  );

  enemy.userData = { hp: 5, cooldown: 0 };
  enemies.push(enemy);
  scene.add(enemy);
}

for (let i = 0; i < 8; i++) createEnemy();

// ===== SHOOT =====
window.addEventListener("mousedown", () => {
  if (reloading) return;
  if (ammo <= 0) return reload();

  ammo--;
  uiAmmo.textContent = ammo;
  playShootSound();

  const bullet = new THREE.Mesh(
    new THREE.SphereGeometry(0.05),
    new THREE.MeshStandardMaterial({ color: 0xffff00 })
  );
  bullet.position.copy(camera.position);
  scene.add(bullet);

  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);

  function moveBullet() {
    bullet.position.add(dir.clone().multiplyScalar(1));

    enemies.forEach((e, i) => {
      if (bullet.position.distanceTo(e.position) < 1) {
        e.userData.hp--;
        scene.remove(bullet);

        if (e.userData.hp <= 0) {
          scene.remove(e);
          enemies.splice(i, 1);
        }
      }
    });

    if (bullet.position.length() < 300) {
      requestAnimationFrame(moveBullet);
    } else {
      scene.remove(bullet);
    }
  }

  moveBullet();
});

// ===== RELOAD =====
function reload() {
  reloading = true;
  setTimeout(() => {
    ammo = maxAmmo;
    uiAmmo.textContent = ammo;
    reloading = false;
  }, 1200);
}

// ===== DAMAGE =====
function takeDamage(d) {
  health -= d;
  uiHealth.textContent = health;
  blood.style.opacity = 1;
  setTimeout(() => blood.style.opacity = 0, 150);

  if (health <= 0) {
    alert("GAME OVER");
    location.reload();
  }
}

// ===== ENEMY AI =====
function enemyAI(enemy) {
  const dir = camera.position.clone().sub(enemy.position);
  const dist = dir.length();
  dir.normalize();

  if (dist > 2) {
    enemy.position.add(dir.multiplyScalar(0.03));
  }

  enemy.lookAt(camera.position);

  if (enemy.userData.cooldown > 0) {
    enemy.userData.cooldown--;
  } else if (dist < 20) {
    enemy.userData.cooldown = 120;
    takeDamage(5);
  }
}

// ===== MAIN LOOP =====
function animate() {
  requestAnimationFrame(animate);

  const speed = 0.12;
  if (keys["w"]) camera.translateZ(-speed);
  if (keys["s"]) camera.translateZ(speed);
  if (keys["a"]) camera.translateX(-speed);
  if (keys["d"]) camera.translateX(speed);

  enemies.forEach(enemyAI);

  renderer.render(scene, camera);
}
animate();

// ===== RESIZE =====
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
