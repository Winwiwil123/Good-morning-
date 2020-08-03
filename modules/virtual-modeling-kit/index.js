var scene, camera, renderer, clock, deltaTime, totalTime;

var arToolkitSource, arToolkitContext;

var patternArray, markerRootArray, markerGroupArray;
var sceneGroup;

initialize();
animate();

function initialize() {
  scene = new THREE.Scene();

  let ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);
  scene.add(ambientLight);

  camera = new THREE.Camera();
  scene.add(camera);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setClearColor(new THREE.Color("lightgrey"), 0);
  renderer.setSize(640, 480);
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0px";
  renderer.domElement.style.left = "0px";
  document.body.appendChild(renderer.domElement);

  clock = new THREE.Clock();
  deltaTime = 0;
  totalTime = 0;

  ////////////////////////////////////////////////////////////
  // setup arToolkitSource
  ////////////////////////////////////////////////////////////

  arToolkitSource = new THREEx.ArToolkitSource({
    sourceType: "webcam",
  });

  function onResize() {
    arToolkitSource.onResize();
    arToolkitSource.copySizeTo(renderer.domElement);
    if (arToolkitContext.arController !== null) {
      arToolkitSource.copySizeTo(arToolkitContext.arController.canvas);
    }
  }

  arToolkitSource.init(function onReady() {
    onResize();
  });

  // handle resize event
  window.addEventListener("resize", function () {
    onResize();
  });

  ////////////////////////////////////////////////////////////
  // setup arToolkitContext
  ////////////////////////////////////////////////////////////

  // create atToolkitContext
  arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: "data/camera_para.dat",
    detectionMode: "mono",
  });

  // copy projection matrix to camera when initialization complete
  arToolkitContext.init(function onCompleted() {
    camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
  });

  ////////////////////////////////////////////////////////////
  // setup markerRoots
  ////////////////////////////////////////////////////////////

  markerRootArray = [];
  markerGroupArray = [];
  patternArray = [
    "letterA",
    "letterB",
    "letterC",
    "letterD",
    "letterF",
    "kanji",
  ];

  let rotationArray = [
    new THREE.Vector3(-Math.PI / 2, 0, 0),
    new THREE.Vector3(0, -Math.PI / 2, Math.PI / 2),
    new THREE.Vector3(Math.PI / 2, 0, Math.PI),
    new THREE.Vector3(-Math.PI / 2, Math.PI / 2, 0),
    new THREE.Vector3(Math.PI, 0, 0),
    new THREE.Vector3(0, 0, 0),
  ];

  for (let i = 0; i < 6; i++) {
    let markerRoot = new THREE.Group();
    markerRootArray.push(markerRoot);
    scene.add(markerRoot);
    let markerControls = new THREEx.ArMarkerControls(
      arToolkitContext,
      markerRoot,
      {
        type: "pattern",
        patternUrl: "data/" + patternArray[i] + ".patt",
      }
    );

    let markerGroup = new THREE.Group();
    markerGroupArray.push(markerGroup);
    markerGroup.position.y = -1.25 / 2;
    markerGroup.rotation.setFromVector3(rotationArray[i]);

    markerRoot.add(markerGroup);
  }

  ////////////////////////////////////////////////////////////
  // setup scene
  ////////////////////////////////////////////////////////////

  sceneGroup = new THREE.Group();
  // a 1x1x1 cube model with scale factor 1.25 fills up the physical cube
  sceneGroup.scale.set(1.25 / 2, 1.25 / 2, 1.25 / 2);

  let loader = new THREE.TextureLoader();

  /*
	// a simple cube
	let materialArray = [
		new THREE.MeshBasicMaterial( { map: loader.load("images/xpos.png") } ),
		new THREE.MeshBasicMaterial( { map: loader.load("images/xneg.png") } ),
		new THREE.MeshBasicMaterial( { map: loader.load("images/ypos.png") } ),
		new THREE.MeshBasicMaterial( { map: loader.load("images/yneg.png") } ),
		new THREE.MeshBasicMaterial( { map: loader.load("images/zpos.png") } ),
		new THREE.MeshBasicMaterial( { map: loader.load("images/zneg.png") } ),
	];
	let mesh = new THREE.Mesh( new THREE.CubeGeometry(1,1,1), materialArray );
	sceneGroup.add( mesh );
	*/

  let tileTexture = loader.load("images/tiles.jpg");

  // reversed cube
  sceneGroup.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshBasicMaterial({
        map: tileTexture,
        side: THREE.BackSide,
      })
    )
  );

  // cube vertices

  let sphereGeometry = new THREE.SphereGeometry(0.2, 6, 6);

  let sphereCenters = [
    new THREE.Vector3(-1, -1, -1),
    new THREE.Vector3(-1, -1, 1),
    new THREE.Vector3(-1, 1, -1),
    new THREE.Vector3(-1, 1, 1),
    new THREE.Vector3(1, -1, -1),
    new THREE.Vector3(1, -1, 1),
    new THREE.Vector3(1, 1, -1),
    new THREE.Vector3(1, 1, 1),
  ];

  let sphereColors = [
    0x444444,
    0x0000ff,
    0x00ff00,
    0x00ffff,
    0xff0000,
    0xff00ff,
    0xffff00,
    0xffffff,
  ];

  for (let i = 0; i < 8; i++) {
    let sphereMesh = new THREE.Mesh(
      sphereGeometry,
      new THREE.MeshLambertMaterial({
        map: tileTexture,
        color: sphereColors[i],
      })
    );
    sphereMesh.position.copy(sphereCenters[i]);
    sceneGroup.add(sphereMesh);
  }

  // cube edges

  let edgeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 32);

  let edgeCenters = [
    new THREE.Vector3(0, -1, -1),
    new THREE.Vector3(0, 1, -1),
    new THREE.Vector3(0, -1, 1),
    new THREE.Vector3(0, 1, 1),
    new THREE.Vector3(-1, 0, -1),
    new THREE.Vector3(1, 0, -1),
    new THREE.Vector3(-1, 0, 1),
    new THREE.Vector3(1, 0, 1),
    new THREE.Vector3(-1, -1, 0),
    new THREE.Vector3(1, -1, 0),
    new THREE.Vector3(-1, 1, 0),
    new THREE.Vector3(1, 1, 0),
  ];

  let edgeRotations = [
    new THREE.Vector3(0, 0, Math.PI / 2),
    new THREE.Vector3(0, 0, Math.PI / 2),
    new THREE.Vector3(0, 0, Math.PI / 2),
    new THREE.Vector3(0, 0, Math.PI / 2),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(Math.PI / 2, 0, 0),
    new THREE.Vector3(Math.PI / 2, 0, 0),
    new THREE.Vector3(Math.PI / 2, 0, 0),
    new THREE.Vector3(Math.PI / 2, 0, 0),
  ];

  let edgeColors = [
    0x880000,
    0x880000,
    0x880000,
    0x880000,
    0x008800,
    0x008800,
    0x008800,
    0x008800,
    0x000088,
    0x000088,
    0x000088,
    0x000088,
  ];

  for (let i = 0; i < 12; i++) {
    let edge = new THREE.Mesh(
      edgeGeometry,
      new THREE.MeshLambertMaterial({
        map: tileTexture,
        color: edgeColors[i],
      })
    );
    edge.position.copy(edgeCenters[i]);
    edge.rotation.setFromVector3(edgeRotations[i]);

    sceneGroup.add(edge);
  }

  sceneGroup.add(
    new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.5, 0.1),
      new THREE.MeshNormalMaterial()
    )
  );

  let pointLight = new THREE.PointLight(0xffffff, 1, 50);
  pointLight.position.set(0.5, 3, 2);
  scene.add(pointLight);
}

function update() {
  // update artoolkit on every frame
  if (arToolkitSource.ready !== false)
    arToolkitContext.update(arToolkitSource.domElement);

  for (let i = 0; i < 6; i++) {
    if (markerRootArray[i].visible) {
      markerGroupArray[i].add(sceneGroup);
      console.log("visible: " + patternArray[i]);
      break;
    }
  }
}

function render() {
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  deltaTime = clock.getDelta();
  totalTime += deltaTime;
  update();
  render();
}
