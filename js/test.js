/**
  test.js
  Ejemplo Three.js_r140: Cubo RGB con iluminacion y textura

  Cubo con color por vertice y mapa de uvs usando la clase BufferGeometry.
  La textura es una unica imagen en forma de cubo desplegado en cruz horizontal.
  Cada cara se textura segun mapa uv en la textura.
  En sentido antihorario las caras son:
    Delante:   7,0,3,4
    Derecha:   0,1,2,3
    Detras:    1,6,5,2
    Izquierda: 6,7,4,5
    Arriba:    3,2,5,4
    Abajo:     0,7,6,1
  Donde se han numerado de 0..7 los vertices del cubo.
  Los atributos deben darse por vertice asi que necesitamos 8x3=24 vertices pues
  cada vertice tiene 3 atributos de normal, color y uv al ser compartido por 3 caras. 

  @author Maria Moreno
*/

import * as THREE from "../lib/three.module.js";
import {GLTFLoader} from "../lib/GLTFLoader.module.js";
import {OrbitControls} from "../lib/OrbitControls.module.js";
import {TWEEN} from "../lib/tween.module.min.js";
import {GUI} from "../lib/lil-gui.module.min.js";

var renderer, scene, camera, cubo;
var cameraControls;

init();
loadScene();
setupGUI();
render();

function init()
{
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( new THREE.Color(0xFFFFFF) );
  document.getElementById('container').appendChild( renderer.domElement );

  scene = new THREE.Scene();

  var aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera( 50, aspectRatio , 0.1, 100 );
  camera.position.set(0.5,2,7);
  cameraControls = new OrbitControls( camera, renderer.domElement );
  cameraControls.target.set(0,1,0);
  camera.lookAt(0,1,0);
  window.addEventListener('resize', updateAspectRatio );
}

function loadScene()
{
    const material = new THREE.MeshBasicMaterial( { color: 'yellow', wireframe: true } );

    const geoCubo = new THREE.BoxGeometry( 2,2,2 );

    // Objetos dibujables
    const cubo = new THREE.Mesh( geoCubo, material );
    cubo.position.x = -1;

    // Suelo
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry(10,10, 10,10), material );
    suelo.rotation.x = -Math.PI / 2;
    suelo.position.y = -0.1;
    scene.add(suelo);
/*
    // Importar un modelo en json
    const loader = new THREE.ObjectLoader();

    loader.load( 'models/soldado/soldado.json', 
        function(objeto){
            cubo.add(objeto);
            objeto.position.y = 1;
        }
    )

    // Importar un modelo en gltf
    const glloader = new GLTFLoader();

    glloader.load( 'models/robota/scene.gltf', function ( gltf ) {
        gltf.scene.position.y = 1;
        gltf.scene.rotation.y = -Math.PI/2;
        esfera.add( gltf.scene );
    
    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );
*/
    // Objeto contenedor
    esferaCubo = new THREE.Object3D();
    esferaCubo.position.y = 1.5;

    // Organizacion del grafo
    scene.add( esferaCubo);
    esferaCubo.add( cubo );
    cubo.add( new THREE.AxesHelper(1) );
    scene.add( new THREE.AxesHelper(3) );

}

function setupGUI()
{
	// Definicion de los controles
	effectController = {
		mensaje: 'Prueba',
		giroY: 0.0,
		separacion: 0,
		colorsuelo: "rgb(150,150,150)"
	};

	// Creacion interfaz
	const gui = new GUI();

	// Construccion del menu
	const h = gui.addFolder("Control cubo");
	h.add(effectController, "mensaje").name("Aplicacion");
	h.add(effectController, "giroY", -180.0, 180.0, 0.025).name("Giro en Y");
  h.addColor(effectController, "colorsuelo").name("Color alambres");

}

function updateAspectRatio()
{
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function update()
{

  // Lectura de controles en GUI (es mejor hacerlo con onChange)
	cubo.material.setValues( { color: effectController.colorsuelo } );
  TWEEN.update();

}

function render()
{
	requestAnimationFrame( render );
	update();
	renderer.render( scene, camera );
}