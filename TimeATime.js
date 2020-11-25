
//Movement keys (Controls for the game)
let keysDown = {
    "KeyA":false,
    "KeyD":false,
    "KeyG":false,
    "KeyH":false,
    "KeyM":false,
    "ArrowLeft":false,
    "ArrowRight":false,
    "Space":false
};

class Turtle
{
    constructor(){} 

    async loadObj(objModelUrl, group)
    {

        const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

        try {
            const object = await objPromiseLoader.load(objModelUrl.obj);

            let texture = objModelUrl.hasOwnProperty('map') ? new THREE.TextureLoader().load(objModelUrl.map) : null;

            
            
            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.map = texture;
                }
            });

            group.add(object);

            object.scale.set(0.5, 0.5, 0.5);
            object.position.y = 0;
            object.name = "Turtle";


            console.log(object);
            group.add(object);
            
        }catch(err){
            return onError(err);
        }


    }


}

//Class for the character that the player controls
class Player
{
    constructor(body, root)
    {
        this.body = body;
        this.speed = 0.1;
        this.canJump = true;
        this.root = root;
        this.playerObject = null;
    }
    
    load3dModel(objModelUrl, mtlModelUrl)
    {
        mtlLoader = new THREE.MTLLoader();

        mtlLoader.load(mtlModelUrl, materials =>{
            
            materials.preload();
            console.log(materials);

            objLoader = new THREE.OBJLoader();
            
            objLoader.setMaterials(materials);

            objLoader.load(objModelUrl, object=>{
                objectList.push(object);
                object.position.y = 0;
                object.scale.set(0.2, 0.2, 0.2);
                this.playerObject = object;
                console.log(object);
                pivot.add(this.root);
                scene.add(object);

                this.playerObject.add(pivot);
            });

        });
    }
    

    //Move position of the player to the left
    moveLeft()
    {
        this.body.position.x -= this.speed;
    }

    //Move position of the player to the right
    moveRight()
    {
        this.body.position.x += this.speed;
    }

    //Add velocity in 'y' to the player so they jump
    jump(){
        this.body.velocity.y += 20;
    }

    //The player character is updated according to the keys that the player is pressing
    update(){
        // console.log(world.contacts)
        if(keysDown["KeyA"] || keysDown["ArrowLeft"])
            this.moveLeft();
        if(keysDown["KeyD"] || keysDown["ArrowRight"])
            this.moveRight();
        if(keysDown["Space"]){
            //If the player is not currently jumping
            if(this.canJump){
                this.jump();
                this.canJump = false;
            }
        }

    }
}

const onError = ( ( err ) => { console.error( err ); } );

let renderer = null,    // Object in charge of drawing a scene
scene = null,           
camera = null,
uniforms = null,
mtlLoader = null,
objLoader = null,
objectList = [],
orbitControls = null;
canvas = null;
player = null; //Object for the player
root = null;
playerBody = null; //Object for the cannon body of the player
pivot = null;
world = null; //Object for the cannon world
sphereShape = null;
physicsMaterial = null;
testPortal = null;
testPortalBody = null;
testGround = null;
testGroundBody = null;
//Test moving cube
testCube = null;
testCubeBody = null;

testmaterials = {
    shadow: new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.5
    }),
    solid: new THREE.MeshNormalMaterial({}),
    colliding: new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.5
    }),
    dot: new THREE.MeshBasicMaterial({
        color: 0x0000ff
    })
};

let duration = 5000; // ms
let currentTime = Date.now();

//Listeners for the movement of the player
function keyEvents(){

    document.addEventListener("keyup", event=>{
        keysDown[event.code] = false;
    });
       
    document.addEventListener("keydown", event=>{
        keysDown[event.code] = true;  
    }); 
} 

//Promise to load the 3d object
function promisifyLoader ( loader, onProgress ) 
{
    function promiseLoader ( url ) {
  
      return new Promise( ( resolve, reject ) => {
  
        loader.load( url, resolve, onProgress, reject );
  
      } );
    }
  
    return {
      originalLoader: loader,
      load: promiseLoader,
    };
}

//Animate function
function animate() 
{
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
   
    //uniforms.time.value += fract;

    world.step(1/60);

    // console.log(world.contacts);

    world.contacts.forEach(function (contact) {
        // console.log(contact);
        // console.log("BI", contact.bi.id)
        // console.log("BJ", contact.bj.id)
        // if(contact.bi.id == 2 ){
        //     player.body.position.set(17,1,0)
        // }
        // if (contact.bi.id == 1){
        //     console.log("Bi: 11111111111111111111")
        // } else if (contact.bi.id == 2){
        //     console.log("Bi: 222222222222222222")
        // } else if (contact.bi.id == 0){
        //     console.log("Bi: 000000000000000000")
        // } else if (contact.bi.id == 3){
        //     console.log("Bi: 333333333333333")
        // } 
        // contact.bi.mesh.material = this.materials.shadow;
        // contact.bj.mesh.material = this.materials.colliding;
        
    })

}

//Run function
function run() {

    requestAnimationFrame(function() { run(); });
    
    if(camera != null){
        // Render the scene
        renderer.render( scene, camera );
    }

    //Update the player character
    player.update();
    testCube.update();
    
    if(player.playerObject != null){
        //The position of the player character needs to be the same as the position of their cannon body
        player.playerObject.position.copy(playerBody.position);
        //The position of the portal character needs to be the same as the position of their cannon body
        testGround.position.copy(testGroundBody.position);
        //The position of the player character needs to be the same as the position of their cannon body
        testCube.mesh.position.copy(testCubeBody.position);
    }

    // Spin
    animate();

}

//Function that creates the scene
async function scene_setup(canvas)
{

    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.BasicShadowMap;

    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add light
    // Add a directional light to show off the object
    let directionalLight = new THREE.DirectionalLight( 0xffffff, 1);
    directionalLight.position.set(0, 1, 2);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    //Activate the key listeners
    keyEvents();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(20, 3, 150);

    //Create the player character
    await load_ghost();
    await load_turtle();
    await load_cube();

    //Create a pivot and add it to the mesh of the player
    pivot = new THREE.Object3D;

    //Add the camera to the pivot so it follows the player
    pivot.add(camera);

    /* Cannon test */

    // Create a plane for the floor
    // let PlaneGeometry = new THREE.PlaneGeometry(10,10,15,15);
    // let material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
    // let ground = new THREE.Mesh(PlaneGeometry, material);
    // ground.rotation.x = -Math.PI / 2;
    // ground.position.set(1,-1,0);

    // let material2 = new THREE.MeshBasicMaterial( {color: 0x888431} );
    // let ground2 = new THREE.Mesh(PlaneGeometry, material2);
    // ground2.rotation.x = -Math.PI / 2;
    // ground2.position.set(15,-1,0);
    // scene.add(ground);
    // scene.add(ground2);
    
    //Create planes for the floor 1st Level
    const groundGeometry1 = new THREE.BoxGeometry(10, 2, 5 );
    const materialG1 = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    testGround = new THREE.Mesh( groundGeometry1, materialG1 );
    testGround.position.set(0,-2,0);

    // var halfExtents = new CANNON.Vec3(1,1,1);
    // var boxShape = new CANNON.Box(halfExtents);
    // var boxGeometry = new THREE.BoxGeometry(halfExtents.x*2,halfExtents.y*2,halfExtents.z*2);
    testGroundBody = addPhysicalBody(testGround, {mass: 0}); 
    scene.add( testGround );

    let geometry = new THREE.SphereGeometry(2, 36, 36);
    let testSphere = new THREE.Mesh(geometry, materialG1);
    testSphere.position.set( -7, 0, 0 );
    testSphere.rotation.x = Math.PI/1.7;

    //Create cannon body
    addPhysicalBody(testSphere, {mass: 0});

    // world.addBody(portalBody);
    scene.add(testSphere);

}

//Attempt #1
//Function to innit the physics engine
function innitCannon(){
    world = new CANNON.World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;

    var solver = new CANNON.GSSolver();

    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRelaxation = 4;

    solver.iterations = 7;
    solver.tolerance = 0.1;
    var split = true;
    if(split)
        world.solver = new CANNON.SplitSolver(solver);
    else
        world.solver = solver;

    world.gravity.set(0,-9.81,0);
    world.broadphase = new CANNON.NaiveBroadphase();

    // Create a slippery material (friction coefficient = 0.0)
    // physicsMaterial = new CANNON.Material();
    // var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
    //                                                         physicsMaterial,
    //                                                         0.0, // friction coefficient
    //                                                         0.3  // restitution
    //                                                         );
    // We must add the contact materials to the world
    // world.addContactMaterial(physicsContactMaterial);

    // Create a plane for the floor

    //Create a shape
    // var groundShape = new CANNON.Box(new CANNON.Vec3(5, 1, 1));
    // //Create a cannon body without mass
    // var groundBody = new CANNON.Body({ mass: 0 });
    // //Add the shape to the body
    // groundBody.addShape(groundShape);
    // //Set the position and rotation of the body
    // groundBody.position.set(1, -1, 0);
    // groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);


    //Create a shape of second ground
    // var ground2Shape = new CANNON.Box(new CANNON.Vec3(5, 1, 1));
    // //Create a cannon body without mass
    // var ground2Body = new CANNON.Body({ mass: 0 });
    // //Add the shape to the body
    // ground2Body.addShape(ground2Shape);
    // //Set the position and rotation of the body
    // ground2Body.position.set(15,-1,0);
    // ground2Body.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
        
    //Add it to the world
    // world.addBody(groundBody);
    // world.addBody(ground2Body);
}

function load_turtle()
{
    group = new THREE.Object3D();
    turtle = new Turtle();
    turtle.loadObj("models/Turtle.obj", group);
    scene.add(group);
}

function load_ghost()
{ 
    root = new THREE.Object3D;

    //TEST
    //Create cannon bodya
    // var halfExtents = new CANNON.Vec3(1,0,0);
    // var boxShape = new CANNON.Box(halfExtents);
    var boxShape = new CANNON.Box(new CANNON.Vec3(0.4 , 0.4, 0));
    playerBody = new CANNON.Body({ mass: 2 });

    playerBody.addShape(boxShape);

    playerBody.position.set( -3, 7  , 0 );

    // playerBody.collisionResponse = true;
    

    body2mesh(playerBody, true);
    //Create player object
    player = new Player(playerBody, root);

    // body2mesh(playerBody, true);
    // player.playerObject.position.copy(playerBody.position);
    player.body.computeAABB();
    //Create player object
    player = new Player(playerBody, root);

    world.addBody(player.body);

    //load ghost object
    let objModelUrl = "models/Ghost.obj";
    let mtlModelUrl = "models/Ghost.mtl";

    player.load3dModel(objModelUrl, mtlModelUrl);

    player.body.addEventListener("collide",function(e){
        console.log("EEEEEEEEEEEEEEE",  e)  
        if(e.body.id == 0 || e.body.id == 1){
            // console.log("The sphere just collided with the ground!", e);
            player.canJump = true;
        }
        // } else {
        //     console.log("COLLIDED WITH ANOTHER THING")
        // }
    });

   
}

function create_portal()
{
    //create shadermaterial for the portal 
    let COLORMAP = new THREE.TextureLoader().load("images/whirlpool.jpg");
    let NOISEMAP = new THREE.TextureLoader().load("images/color_clouds.jpg");

    
    uniforms = 
    {
        time: { type: "f", value: 0.1 },
        noiseTexture: { type: "t", value: NOISEMAP },
        glowTexture: { type: "t", value: COLORMAP }
    };

    uniforms.noiseTexture.value.wrapS = uniforms.noiseTexture.value.wrapT = THREE.RepeatWrapping;
    uniforms.glowTexture.value.wrapS = uniforms.glowTexture.value.wrapT = THREE.RepeatWrapping;


    //Create Portal mesh
    let material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
        transparent: false
    } );
    
    let geometry = new THREE.SphereGeometry(2, 36, 36);
    let portal = new THREE.Mesh(geometry, material);
    portal.position.set( -3, 3, 0 );
    portal.rotation.x = Math.PI/1.7;

    //Create cannon body
    addPhysicalBody(portal, {mass: 0});

    // world.addBody(portalBody);
    scene.add(portal);

    testPortal = portal;

}

addPhysicalBody = function (mesh, bodyOptions) {
    var shape;
    // create a Sphere shape for spheres and thorus knots,
    // a Box shape otherwise
    if (mesh.geometry.type === 'SphereGeometry' ||
    mesh.geometry.type === 'ThorusKnotGeometry') {
        mesh.geometry.computeBoundingSphere();
        shape = new CANNON.Sphere(mesh.geometry.boundingSphere.radius);
    }
    else {
        mesh.geometry.computeBoundingBox();
        var box = mesh.geometry.boundingBox;
        shape = new CANNON.Box(new CANNON.Vec3(
            (box.max.x - box.min.x) / 2,
            (box.max.y - box.min.y) / 2,
            (box.max.z - box.min.z) / 2
        ));
        console.log("THE SHAPE", shape)
    }

    var body = new CANNON.Body(bodyOptions);
    body.addShape(shape);
    body.position.copy(mesh.position);
    body.computeAABB();
    // disable collision response so objects don't move when they collide
    // against each other
    body.collisionResponse = true;
    // keep a reference to the mesh so we can update its properties later
    body.mesh = mesh;

    world.addBody(body);
    
    console.log(body);

    // body2mesh(body, true)
    return body;
};

//Class for the character that the player controls
class Cube
{
    constructor(mesh, body, speed = 0.1)
    {
        this.mesh = mesh;
        this.body = body;
        this.speed = speed;
        this.canJump = true;
    }

    async load_model(objModeUrl)
    {
    
    }

    //Move position of the player to the left
    moveLeft()
    {
        this.body.position.x -= this.speed;
    }

    //Move position of the player to the right
    moveRight()
    {
        this.body.position.x += this.speed;
    }

    //Add velocity in 'y' to the player so they jump
    jump(){
        this.body.velocity.y += 20;
    }

    //The player character is updated according to the keys that the player is pressing
    update(){
        if(keysDown["KeyG"]){
            console.log("G")
            this.moveLeft();
        }
        if(keysDown["KeyH"])
            this.moveRight();
        if(keysDown["KeyM"]){
            //If the player is not currently jumping
            if(this.canJump){
                this.jump();
                this.canJump = false;
            }
        }
    }
}

function load_cube()
{
    let box_geometry = new THREE.BoxGeometry(1, 1, 1);
    let material = new THREE.MeshBasicMaterial( {color: 0x00fff0} );
    
    let cubeMesh = new THREE.Mesh(box_geometry, material);


    //TEST
    //Create cannon body
    // var halfExtents = new CANNON.Vec3(0,0,0);
    // var boxShape = new CANNON.Box(halfExtents);
    // testCubeBody = new CANNON.Body({ mass: 5 });
    // testCubeBody.addShape(boxShape);

    //Create player object
    testCubeBody = addPhysicalBody(cubeMesh, {mass: 5})
    testCube = new Cube(cubeMesh, testCubeBody, 0.1);

    testCubeBody.position.set( 0, 1, 0 );
    cubeMesh.position.set( 0, 1, 0 );

    // world.addBody(testCube.body);
    scene.add(testCube.mesh);

    testCube.body.addEventListener("collide",function(e){
        
        if(e.body.id == 0){
            testCube.canJump = true;
        }
    });

   
}

let uno = [0, 6, 12]
let lai = 0;

function body2mesh(body, wireframe) {
    console.log("CALCULANDO")
    var wireframe = wireframe || true;
    var obj = new THREE.Object3D();
  
    for (var l = 0; l < body.shapes.length; l++) {
      var shape = body.shapes[l];
  
      var mesh;
  
      switch(shape.type){
  
      case CANNON.Shape.types.SPHERE:
        var sphere_geometry = new THREE.SphereGeometry( shape.radius, 8, 8);
        mesh = new THREE.Mesh( sphere_geometry, this.currentMaterial );
        break;
  
      case CANNON.Shape.types.PARTICLE:
        mesh = new THREE.Mesh( this.particleGeo, this.particleMaterial );
        var s = this.settings;
        mesh.scale.set(s.particleSize,s.particleSize,s.particleSize);
        break;
  
      case CANNON.Shape.types.PLANE:
        var geometry = new THREE.PlaneGeometry(10, 10, 4, 4);
        mesh = new THREE.Object3D();
        var submesh = new THREE.Object3D();
        var ground = new THREE.Mesh( geometry, this.currentMaterial );
        ground.scale.set(100, 100, 100);
        submesh.add(ground);
  
        ground.castShadow = true;
        ground.receiveShadow = true;
  
        mesh.add(submesh);
        break;
  
      case CANNON.Shape.types.BOX:
        var box_geometry = new THREE.BoxGeometry(  shape.halfExtents.x*2,
                              shape.halfExtents.y*2,
                              shape.halfExtents.z*2 );
        mesh = new THREE.Mesh( box_geometry, this.currentMaterial );
        break;
  
      case CANNON.Shape.types.CONVEXPOLYHEDRON:
        var geo = new THREE.Geometry();
  
        // Add vertices
        for (var i = 0; i < shape.vertices.length; i++) {
          var v = shape.vertices[i];
          geo.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
        }
  
        for(var i=0; i < shape.faces.length; i++){
          var face = shape.faces[i];
  
          // add triangles
          var a = face[0];
          for (var j = 1; j < face.length - 1; j++) {
            var b = face[j];
            var c = face[j + 1];
            geo.faces.push(new THREE.Face3(a, b, c));
          }
        }
        geo.computeBoundingSphere();
        geo.computeFaceNormals();
        mesh = new THREE.Mesh( geo, this.currentMaterial );
        break;
  
      case CANNON.Shape.types.HEIGHTFIELD:
        var geometry = new THREE.Geometry();
  
        var v0 = new CANNON.Vec3();
        var v1 = new CANNON.Vec3();
        var v2 = new CANNON.Vec3();
        for (var xi = 0; xi < shape.data.length - 1; xi++) {
          for (var yi = 0; yi < shape.data[xi].length - 1; yi++) {
            for (var k = 0; k < 2; k++) {
              shape.getConvexTrianglePillar(xi, yi, k===0);
              v0.copy(shape.pillarConvex.vertices[0]);
              v1.copy(shape.pillarConvex.vertices[1]);
              v2.copy(shape.pillarConvex.vertices[2]);
              v0.vadd(shape.pillarOffset, v0);
              v1.vadd(shape.pillarOffset, v1);
              v2.vadd(shape.pillarOffset, v2);
              geometry.vertices.push(
                new THREE.Vector3(v0.x, v0.y, v0.z),
                new THREE.Vector3(v1.x, v1.y, v1.z),
                new THREE.Vector3(v2.x, v2.y, v2.z)
              );
              var i = geometry.vertices.length - 3;
              geometry.faces.push(new THREE.Face3(i, i+1, i+2));
            }
          }
        }
        geometry.computeBoundingSphere();
        geometry.computeFaceNormals();
        mesh = new THREE.Mesh(geometry, this.currentMaterial);
        break;
  
      case CANNON.Shape.types.TRIMESH:
        var geometry = new THREE.Geometry();
  
        var v0 = new CANNON.Vec3();
        var v1 = new CANNON.Vec3();
        var v2 = new CANNON.Vec3();
        for (var i = 0; i < shape.indices.length / 3; i++) {
          shape.getTriangleVertices(i, v0, v1, v2);
          geometry.vertices.push(
            new THREE.Vector3(v0.x, v0.y, v0.z),
            new THREE.Vector3(v1.x, v1.y, v1.z),
            new THREE.Vector3(v2.x, v2.y, v2.z)
          );
          var j = geometry.vertices.length - 3;
          geometry.faces.push(new THREE.Face3(j, j+1, j+2));
        }
        geometry.computeBoundingSphere();
        geometry.computeFaceNormals();
        mesh = new THREE.Mesh(geometry, this.currentMaterial);
        break;
  
      default:
        throw "Visual type not recognized: "+shape.type;
      }
  
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      if(mesh.children){
        for(var i=0; i<mesh.children.length; i++){
          mesh.children[i].castShadow = true;
          mesh.children[i].receiveShadow = true;
          if(mesh.children[i]){
            for(var j=0; j<mesh.children[i].length; j++){
              mesh.children[i].children[j].castShadow = true;
              mesh.children[i].children[j].receiveShadow = true;
            }
          }
        }
      }
  
      var o = body.shapeOffsets[l];
      var q = body.shapeOrientations[l];
      mesh.position.set(3, 1  , 0);
      mesh.quaternion.set(q.x, q.y, q.z, q.w);
  
      obj.add(mesh);
    }

    lai++;
    scene.add(obj)
  
    return obj;
   };
