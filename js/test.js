import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";
import { DragControls } from "https://cdn.jsdelivr.net/npm/three@0.115/examples/jsm/controls/DragControls.js";

var dragControls, orbitControls;
var scene, renderer, camera;
var objects = [];
var dragObject = [];
var boardObjects = [];
var raycaster = new THREE.Raycaster();
var INTERSECTED, intersects;
var tableHeight = 8.2;
var gui, board, mouse;


const greyMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
const whiteMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
const brownMaterial = new THREE.MeshPhongMaterial({ color: 0xa52a2a });
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xb5b2b2 });


//Camera
// Instanciar la camara
function createCamera() {
  camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    1,
    100
  );
  camera.position.z = -5;
  camera.position.y =50;
  camera.position.x = -15;
}

function createScene() {
  //Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8e8e8e);
}

function createRenderer() {
  //Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);
}

//Light
function createLight() {
  const ambiental = new THREE.AmbientLight(0x222222);
  scene.add(ambiental);

  const direccional = new THREE.DirectionalLight(0xffffff, 0.4);
  direccional.position.set(0, 30, 0);
  direccional.castShadow = true;
  scene.add(direccional);
  // scene.add(new THREE.CameraHelper(direccional.shadow.camera));

  const focal = new THREE.SpotLight(0xffffff, 0.4);
  focal.position.set(-12, 15, 2);40,40,40,40
  focal.target.position.set(5, 10, 3);
  focal.angle = Math.PI / 7;
  focal.penumbra = 0.3;
  focal.castShadow = true;
  focal.shadow.camera.far = 20;
  focal.shadow.camera.fov = 80;
  scene.add(focal);
  scene.add(focal.target);
  // scene.add(new THREE.CameraHelper(focal.shadow.camera));
}

//create floor
function createRoom() {
  var wallImage = new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    map: new THREE.TextureLoader().load(
      "./hell.avif"
    ),
  });

  var floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100,100,100,100),
    wallImage
  );
  floor.rotation.x = Math.PI / 2;
  floor.position.y = -0.2;
  floor.castShadow = floor.receiveShadow = true;
  scene.add(floor);

  var roof = new THREE.Mesh(
    new THREE.PlaneGeometry(100,100,100,100),
    wallImage
  );
  roof.rotation.x = -Math.PI / 2;
  roof.position.y = 100;
  roof.castShadow = floor.receiveShadow = true;
  scene.add(roof);

  const walls = [];
  
  walls.push(wallImage);
  walls.push(wallImage);
  walls.push(wallImage);
  walls.push(wallImage);

  const room = new THREE.Mesh( new THREE.BoxGeometry(100,100,100,100), walls)
  room.rotation.y = Math.PI
  room.rotation.x = Math.PI/2
  room.rotation.z = Math.PI/2
  room.position.y = 50
  scene.add(room)
}

function mapTexture(texturePath) {
  var texture = new THREE.TextureLoader().load(
    texturePath
  );
  const material = new THREE.MeshStandardMaterial({
    map: texture
  })
  return material;
}

//create chess board
function createChessBoard() {

  const glloader = new GLTFLoader();
  glloader.load("models/chess-table/scene.gltf", function (gltf) {
    gltf.scene.position.set(3.5,7.5,3.5);
    gltf.scene.scale.set(0.4, 0.5, 0.4)
    const material = mapTexture("models/chess-board/textures/lambert3SG_baseColor.png")
    gltf.scene.traverse((o) => {
      if (o.isObject3D) {
        o.castShadow = o.receiveShadow = true;
        o.material = material
      }
    });
    scene.add(gltf.scene);
    board = gltf.scene;
  });

}

function loadPiece(object, position, material) {
  var loader = new GLTFLoader();
  loader.load(object, function (gltf) {
    gltf.scene.position.set(position.x, position.y, position.z);
    gltf.scene.traverse((o) => {
      if (o.isMesh) {
        o.material = material;
      }
      if (o.isObject3D) {
        o.castShadow = o.receiveShadow = true;
      }
    });
    scene.add(gltf.scene);
    objects.push(gltf.scene);
  });
}

//Animation
var animate = function () {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

//create drag controls
function createDragControls() {
  dragControls = new DragControls(dragObject, camera, renderer.domElement);

  //hold shift to move object
  window.addEventListener("keydown", function (event) {
    console.log(event.key);
    if (event.key == "Shift") {
      orbitControls.enabled = false;
    }
  });

  window.addEventListener("keyup", function (event) {
    if (event.key == "Shift") {
      orbitControls.enabled = true;
    }
  });
}

window.addEventListener("mousedown", raycast, false);
window.addEventListener("mousemove", onMouseMove, false);

function raycast(event) {
  dragObject = [];

  let x = event.clientX;
  let y = event.clientY;
  x = (x / window.innerWidth) * 2 - 1;
  y = -(y / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

  objects.forEach((object) => {
    intersects = raycaster.intersectObjects(object.children, true);
    if (intersects.length > 0) {
      INTERSECTED = intersects[0].object;
      dragObject.push(INTERSECTED);
      createDragControls();
    }
  });
}

function loadPawns(material, row) {
  for (let column = 0; column < 8; column++) {
    loadPiece(
      "models/checker/scene.gltf",
      new THREE.Vector3(column, tableHeight, row),
      material
    );
  }
}

function onMouseMove(event) {
  mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(mouse, camera);
  intersects = raycaster.intersectObjects([building]);

  if (intersects.length == 0 || !dragging) return;

  normalMatrix.getNormalMatrix(intersects[0].object.matrixWorld);
  worldNormal.copy(intersects[0].face.normal).applyMatrix3(normalMatrix).normalize();
  _window.position.copy(intersects[0].point.setY(-0.5)); // -0.5 = bottom of the wall - half height of the window
  _window.lookAt(lookAtVector.copy(intersects[0].point).add(worldNormal));
}



function loadPieces() {
  loadPawns(greyMaterial, 1);
  loadPawns(whiteMaterial, 6);
  loadPawns(greyMaterial, 0);
  loadPawns(whiteMaterial, 7);
}

function loadWorld() {
  createRoom();

  loadPieces();
  boardObjects = createChessBoard();
}

function createGUI() {
  gui = new dat.GUI();

  var controls = {
    restart: function () {
      objects.forEach((element) => {
        console.log(element);
        scene.remove(element);
      });
      loadPieces();
    },
    addClock: true,
  };

  gui.add(controls, "restart");

  var wallpaperOptions = gui.addFolder('Wallpaper Options')
  
}

function init() {
  //basicScene
  createScene();
  createRenderer();
  createLight();
  createCamera();

  //controls
  orbitControls = new OrbitControls(camera, renderer.domElement);
  createDragControls();
  createGUI();

  loadWorld();

  animate();
}

init();
