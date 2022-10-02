import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Color } from 'three'


//let windSound = new Audio('/sound/Wind/Wind.wav');
let boomSound = new Audio('/sound/Boom/Boom.wav');
let boomOK = false
//windSound.volume = 1;
//windSound.play();

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()

/**
 * Base
 */
// Debug
//const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Fog
 */
const fog = new THREE.Fog('#262837', 1, 15)
scene.fog = fog

/**
 * EnvMap
 */
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/4/px.jpg',
    '/textures/environmentMaps/5/nx.jpg',
    '/textures/environmentMaps/4/py.jpg',
    '/textures/environmentMaps/5/ny.jpg',
    '/textures/environmentMaps/4/pz.jpg',
    '/textures/environmentMaps/5/nz.jpg'
])
 
/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#049ef4"),
    roughness: 0,
    metalness: 0.9,
    envMap: environmentMapTexture,
    //emissive: new THREE.Color("#049ef4"),
})

const materialPlane = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#049ef4"),
    roughness: 1,
})

/**
 * Update all materials
 */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            child.castShadow = true
            child.receiveShadow = true
        }
    }) 
}

/**
 * Objects
 */
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(window.innerWidth, window.innerHeight/2),
    materialPlane
)
plane.rotation.x = - Math.PI * 0.5
plane.rotation.z = - Math.PI * 0.25
plane.position.y = - 2.5
plane.receiveShadow = true

scene.add(plane)

/**
 * Models
 */
let globalGltf;
gltfLoader.load(
    '/models/propulscode_logo.glb',
    (gltf) =>
    {
        globalGltf = gltf
        gltf.scene.scale.set(1.5, 1.5, 1.5)
        gltf.scene.position.set(0, - 4.5, 0)
        gltf.scene.rotation.y = Math.PI * 0.5
        scene.add(gltf.scene)
        gltf.scene.traverse((o) => {
            if (o.isMesh) o.material = material;
          });
        updateAllMaterials()

        //gui.add(gltf.scene.rotation, 'y').min(- Math.PI).max(Math.PI).step(0.001).name('rotation')
    }
)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 20)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.normalBias = 0.05
directionalLight.shadow.radius = 10
directionalLight.position.set(0.33, 1.5, - 2.2)
scene.add(directionalLight)

/*
gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('lightIntensity')
gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001).name('lightX')
gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001).name('lightY')
gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001).name('lightZ')
*/

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
//renderer.toneMapping = THREE.ReinhardToneMapping
//renderer.toneMappingExposure = 1.5
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor('#262837') //Couleur de fond

/*
gui
    .add(renderer, 'toneMapping', {
        No: THREE.NoToneMapping,
        Linear: THREE.LinearToneMapping,
        Reinhard: THREE.ReinhardToneMapping,
        Cineon: THREE.CineonToneMapping,
        ACESFilmic: THREE.ACESFilmicToneMapping
    })
gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001)
*/

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(20, 1, - 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Animate
*/
const clock = new THREE.Clock()

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()

    // Zoom camera Begin
    if(camera.position.x > 3.5){
        camera.position.x -= 0.25 * elapsedTime
    }else if(!boomOK){
        boomOK = true
        //windSound.pause();
        boomSound.play();
    }

    // Update objects
    if(globalGltf){
        globalGltf.scene.rotation.y = 0.3 * elapsedTime
    }
    
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()