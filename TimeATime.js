//Movement keys (Controls for the game)
let keysDown = {
    "KeyA":false,
    "KeyD":false,
    "ArrowLeft":false,
    "ArrowRight":false,
    "Space":false,
    "keyG" : false,
};

//Class for the character that the player controls
class Player
{
    constructor()
    {
        this.speed = 0.1;
        this.playerObject = null;
    }
    
    load3dModel(objModelUrl, mtlModelUrl)
    {
        mtlLoader = new THREE.MTLLoader();

        mtlLoader.load(mtlModelUrl, materials =>{
            
            materials.preload();
            //console.log(materials);

            objLoader = new THREE.OBJLoader();
            
            objLoader.setMaterials(materials);

            objLoader.load(objModelUrl, object=>{
                object.position.y = 0;
                object.rotation.y = Math.PI/2;
                object.scale.set(0.2, 0.2, 0.2);
                this.playerObject = object;
                //console.log("Player", this.playerObject);
                scene.add(object);
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
        this.body.velocity.y += 10;
    }

    //The player character is updated according to the keys that the player is pressing
    // update(){
    //     // console.log(world.contacts)
    //     if(keysDown["KeyA"] || keysDown["ArrowLeft"])
    //         this.moveLeft();
    //     if(keysDown["KeyD"] || keysDown["ArrowRight"])
    //         this.moveRight();
    //     if(keysDown["Space"]){
    //         //If the player is not currently jumping
    //         if(this.canJump){
    //             this.jump();
    //             this.canJump = false;
    //         }
    //     }

    // }
}

class Turtle
{
    constructor(mesh, body, speed = 0.1)
    {
        this.mesh = mesh;
        this.body = body;
        this.speed = speed;
        this.grabbed = false;
        this.turtleObject = null;
    }


    load3dModel(objModelUrl, mtlModelUrl)
    {
        mtlLoader = new THREE.MTLLoader();

        mtlLoader.load(mtlModelUrl, materials =>{
            
            materials.preload();
            // console.log(materials);

            objLoader = new THREE.OBJLoader();
            
            objLoader.setMaterials(materials);

            objLoader.load(objModelUrl, object=>{
                object.position.y = -0.8;
                object.scale.set(1, 1, 1);
                object.rotation.y = Math.PI/2;
                this.turtleObject = object;
                scene.add(object);
            });
        });
    }

    grab(){
        this.body.position.y += 0.1;
        this.body.mass = 0;
        turtle.grabbed = true;
    }

    ungrab(){
        this.body.position.y -= 0;
        this.body.mass = 1;
        turtle.grabbed = false;
    }
}



let renderer = null,    // Object in charge of drawing a scene
scene = null,           
camera = null,
uniforms = null,
mtlLoader = null,
objLoader = null,
canvas = null;
player = null; //Object for the player
playerBody = null; //Object for the cannon body of the player
world = null; //Object for the cannon world
sphereShape = null;
physicsMaterial = null;
testPortal = null;
testPortalBody = null;
//Test moving cube
testCube = null;
testCubeBody = null;
//turtle
turtle = null; //Object for the turtle
turtleBody = null;

//Level 1 Ground 1
level1Grounds = [];

//Materials to be used on meshes
materials = {
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
    }),
    level1: new THREE.MeshBasicMaterial({
        color: 0x00ff00
    }),
    water: new THREE.MeshBasicMaterial({
        color: 0x33DEF9
    }),
    orange: new THREE.MeshBasicMaterial({
        color: 0xFFB841
    })
};

let duration = 5000; // ms
let currentTime = Date.now();

function init(canvas) //Make canvas full length of screen
{
    canvas.width = document.body.clientWidth; 
    canvas.height = document.body.clientHeight;
    canvasW = canvas.width;
    canvasH = canvas.height;
}

//Listeners for the movement of the player
function keyEvents(){

    var keyhandler = true;

    document.addEventListener("keyup", event=>{
        keysDown[event.code] = false;

        //When user releases 'G' letter, the key handler is set to true
        if(event.code == "KeyG"){
            keyhandler = true;
        }

    });
       
    document.addEventListener("keydown", event=>{
        keysDown[event.code] = true;  
    }); 

    document.addEventListener("keypress", event=>{

        if(event.code == "KeyG"){

            //If key handler is true
            if(keyhandler){

                //Set it to false
                keyhandler = false;
                
                //Grab or ungrab the turtle
                if(turtle != null){
                    if(!turtle.grabbed){
                        turtle.grab();
                    }
                    else{
                        turtle.ungrab();
                    }
                }
                
            }
        }

        
    }); 
} 

//Animate function
function animate() 
{
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
   
    uniforms.time.value += fract;

    world.step(1/60);

    // console.log(world.contacts);
    //console.log(testCube.canJump)

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
        // } else if (contact.bi.id == 4){
        //     console.log("Bi: 4444444444444444444")
        // } 
        
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
    // player.update();
    testCube.update();

    if(player.playerObject != null){
        //make camera follow the player
        camera.lookAt(player.playerObject.position);
        camera.position.x = player.playerObject.position.x;
        //The position of the player character needs to be the same as the position of their cannon body
        player.playerObject.position.copy(testCubeBody.position);
        //The position of the player character needs to be the same as the position of their cannon body
        testCube.mesh.position.copy(testCubeBody.position);
        console.log("GHOST X", testCube.mesh.position.x);
    }
    

    if(turtle.turtleObject != null){
        console.log(turtle.grabbed);
        console.log("TURTLE X", turtle.mesh.position.x);
        turtle.body.velocity.z = 0;
        distance = Math.abs(turtleBody.position.x - testCubeBody.position.x);
        console.log(distance);
        if(turtle.grabbed && turtleBody.position.x > testCubeBody.position.x && distance < 3){
            turtleBody.position.x = testCubeBody.position.x + 1;
            turtleBody.position.y = testCubeBody.position.y;
            turtleBody.position.z = testCubeBody.position.z;
        } else if (turtle.grabbed && turtleBody.position.x < testCubeBody.position.x && distance < 3){
            turtleBody.position.x = testCubeBody.position.x - 1;
            turtleBody.position.y = testCubeBody.position.y;
            turtleBody.position.z = testCubeBody.position.z;
        }
        //The position of the player character needs to be the same as the position of their cannon body
        turtle.turtleObject.position.copy(turtleBody.position);
        //The position of the player character needs to be the same as the position of their cannon body
        turtle.mesh.position.copy(turtleBody.position);
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
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 1000 );
    camera.position.set(0, 0, 30);

    //Create a pivot and add it to the mesh of the player
    pivot = new THREE.Object3D;
    //Add the camera to the pivot so it follows the player
    

    //Create the player character
    await load_ghost();
    //Create turtle character
    await load_turtle();

    //Create physics body for both the turtle and the ghost
    await load_cube();

    
    //Create planes for the floor 1st Level
    const groundGeometry1 = new THREE.BoxGeometry(10, 2, 5 );
    const materialG1 = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    testGround = new THREE.Mesh( groundGeometry1, materialG1 );
    testGround.position.set(0,-2,0);

    load_map()

}

function load_map(){ //Load level plane grounds (boxes)

    //Create planes for the floor 1st Level
    //Call function with parameters (Geometry, Position, Material) to Create Meshes
    create_ground({x: 8, y: 2, z: 5}, {x: -4, y: -2, z: 0}, materials.level1);
    create_ground({x: 12, y: 2, z: 5}, {x: 6, y: -2, z: 0}, materials.water); //Water
    create_ground({x: 6, y: 2, z: 5}, {x: 15, y: -2, z: 0}, materials.level1);
    create_ground({x: 2, y: 1, z: 5}, {x: 26, y: 3, z: 0}, materials.level1);
    create_ground({x: 2, y: 1, z: 5}, {x: 37, y: 3, z: 0}, materials.level1);
    create_ground({x: 32, y: 2, z: 5}, {x: 34, y: -2, z: 0}, materials.water); //Water
    create_ground({x: 10, y: 2, z: 5}, {x: 55, y: -2, z: 0}, materials.level1);
    create_ground({x: 8, y: 2, z: 5}, {x: 64, y: -2, z: 0}, materials.orange);
    create_ground({x: 4, y: 2, z: 5}, {x: 81, y: -2, z: 0}, materials.orange);
    create_ground({x: 4, y: 2, z: 5}, {x: 93, y: -2, z: 0}, materials.orange);

    //Add physical body to each mesh and add mesh to scene
    for(let i = 0; i<level1Grounds.length; i++){
        addPhysicalBody(level1Grounds[i], {mass: 0});
        scene.add(level1Grounds[i]);
    }
}

function create_ground(groundGeometry, groundPosition, material){

    let gGeometry = new THREE.BoxGeometry(groundGeometry.x, groundGeometry.y, groundGeometry.z);
    ground = new THREE.Mesh( gGeometry, material );
    ground.position.set(groundPosition.x, groundPosition.y, groundPosition.z);
    level1Grounds.push(ground);
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
    // solver.tolerance = 0.1;
    var split = true;
    if(split)
        world.solver = new CANNON.SplitSolver(solver);
    else
        world.solver = solver;

    world.gravity.set(0,-9.81,0);
    world.broadphase = new CANNON.NaiveBroadphase();
}

function load_turtle()
{
    objurl = "models/Turtle.obj";
    mtlurl = "models/Turtle.mtl";

    //Create turtle mesh
    let turtleGeometry = new THREE.BoxGeometry(1, 0.5, 1);
    let turtleMaterial = new THREE.MeshBasicMaterial( {color: 0x00fff0, opacity: 0.0} );
    let turtleMesh = new THREE.Mesh(turtleGeometry, turtleMaterial);

    //Create turtle object
    turtleBody = addPhysicalBody(turtleMesh, {mass: 1})
    turtle = new Turtle(turtleMesh, turtleBody, 0.1);

    turtle.load3dModel(objurl, mtlurl);

    turtleMesh.position.set( 1, 1, 0 );
    turtleBody.position.set( 1, 1, 0 );
    scene.add(turtle.mesh);
}

function load_ghost()
{ 
    //Create player object
    player = new Player();

    //load ghost object
    let objModelUrl = "models/Ghost.obj";
    let mtlModelUrl = "models/Ghost.mtl";

    player.load3dModel(objModelUrl, mtlModelUrl);

    let ghostGeometry = new THREE.BoxGeometry(1, 1, 1);
    let ghostMaterial = new THREE.MeshBasicMaterial( {color: 0xF145FF, opacity: 0.0} );
    let ghostMesh = new THREE.Mesh(ghostGeometry , ghostMaterial);
    //Create player object
    testCubeBody = addPhysicalBody(ghostMesh, {mass: 1})
    testCube = new Cube(ghostMesh, testCubeBody, 0.1);
    
    ghostMesh.position.set( 0, 1, 0 );
    testCubeBody.position.set( 0, 1, 0 );

    testCube.body.addEventListener("collide",function(e){
        // console.log("HOLAAAAAAAAAAAAAAAAAAAAAAAA", console.log(e.body.id))
        if(e.body.id > 1){
            testCube.canJump = true;
        }
        // if(e.body.id == 1){
        //     console.log(1);
        //     testCube.canJump = true;
        // } else if (e.body.id == 2){
        //     console.log(2);
        //     testCube.canJump = true;
        // } else if (e.body.id == 3){
        //     console.log(3);
        //     testCube.canJump = true;
        // } else if (e.body.id == 4){
        //     console.log(4);
        //     testCube.canJump = true;
        // } else if (e.body.id == 5){
        //     console.log(5);
        //     testCube.canJump = true;
        // } else if (e.body.id == 6){
        //     console.log(6);
        //     testCube.canJump = true;
        // } else if (e.body.id == 7){
        //     console.log(7);
        //     testCube.canJump = true;
        // } else if (e.body.id == 8){
        //     console.log(8);
        //     testCube.canJump = true;
        // } else if (e.body.id == 9){
        //     console.log(9);
        //     testCube.canJump = true;
        // } else if (e.body.id == 10){
        //     console.log(10);
        //     testCube.canJump = true;
        // } else if (e.body.id == 11){
        //     console.log(11);
        //     testCube.canJump = true;
        // } else if (e.body.id == 12){
        //     console.log(12);
        //     testCube.canJump = true;
        // } else if (e.body.id == 13){
        //     console.log(13);
        //     testCube.canJump = true;
        // } else if (e.body.id == 14){
        //     console.log(14);
        //     testCube.canJump = true;
        // }
    });

    scene.add(testCube.mesh);

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
        this.body.velocity.y += 10;
    }

    //The player character is updated according to the keys that the player is pressing
    update(){
        this.body.velocity.z = 0;
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
        /*if(keysDown["KeyG"]){
            //If the player is not currently jumping
            if(!turtle.grabbed){
                turtle.grab();
            } else if (turtle.grabbed) {
                turtle.ungrab();
            }
        }*/
    }
}




function load_cube()
{
    


}

// let uno = [0, 6, 12]
// let lai = 0;

// function body2mesh(body, wireframe) {
//     console.log("CALCULANDO")
//     var wireframe = wireframe || true;
//     var obj = new THREE.Object3D();
  
//     for (var l = 0; l < body.shapes.length; l++) {
//       var shape = body.shapes[l];
  
//       var mesh;
  
//       switch(shape.type){
  
//       case CANNON.Shape.types.SPHERE:
//         var sphere_geometry = new THREE.SphereGeometry( shape.radius, 8, 8);
//         mesh = new THREE.Mesh( sphere_geometry, this.currentMaterial );
//         break;
  
//       case CANNON.Shape.types.PARTICLE:
//         mesh = new THREE.Mesh( this.particleGeo, this.particleMaterial );
//         var s = this.settings;
//         mesh.scale.set(s.particleSize,s.particleSize,s.particleSize);
//         break;
  
//       case CANNON.Shape.types.PLANE:
//         var geometry = new THREE.PlaneGeometry(10, 10, 4, 4);
//         mesh = new THREE.Object3D();
//         var submesh = new THREE.Object3D();
//         var ground = new THREE.Mesh( geometry, this.currentMaterial );
//         ground.scale.set(100, 100, 100);
//         submesh.add(ground);
  
//         ground.castShadow = true;
//         ground.receiveShadow = true;
  
//         mesh.add(submesh);
//         break;
  
//       case CANNON.Shape.types.BOX:
//         var box_geometry = new THREE.BoxGeometry(  shape.halfExtents.x*2,
//                               shape.halfExtents.y*2,
//                               shape.halfExtents.z*2 );
//         mesh = new THREE.Mesh( box_geometry, this.currentMaterial );
//         break;
  
//       case CANNON.Shape.types.CONVEXPOLYHEDRON:
//         var geo = new THREE.Geometry();
  
//         // Add vertices
//         for (var i = 0; i < shape.vertices.length; i++) {
//           var v = shape.vertices[i];
//           geo.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
//         }
  
//         for(var i=0; i < shape.faces.length; i++){
//           var face = shape.faces[i];
  
//           // add triangles
//           var a = face[0];
//           for (var j = 1; j < face.length - 1; j++) {
//             var b = face[j];
//             var c = face[j + 1];
//             geo.faces.push(new THREE.Face3(a, b, c));
//           }
//         }
//         geo.computeBoundingSphere();
//         geo.computeFaceNormals();
//         mesh = new THREE.Mesh( geo, this.currentMaterial );
//         break;
  
//       case CANNON.Shape.types.HEIGHTFIELD:
//         var geometry = new THREE.Geometry();
  
//         var v0 = new CANNON.Vec3();
//         var v1 = new CANNON.Vec3();
//         var v2 = new CANNON.Vec3();
//         for (var xi = 0; xi < shape.data.length - 1; xi++) {
//           for (var yi = 0; yi < shape.data[xi].length - 1; yi++) {
//             for (var k = 0; k < 2; k++) {
//               shape.getConvexTrianglePillar(xi, yi, k===0);
//               v0.copy(shape.pillarConvex.vertices[0]);
//               v1.copy(shape.pillarConvex.vertices[1]);
//               v2.copy(shape.pillarConvex.vertices[2]);
//               v0.vadd(shape.pillarOffset, v0);
//               v1.vadd(shape.pillarOffset, v1);
//               v2.vadd(shape.pillarOffset, v2);
//               geometry.vertices.push(
//                 new THREE.Vector3(v0.x, v0.y, v0.z),
//                 new THREE.Vector3(v1.x, v1.y, v1.z),
//                 new THREE.Vector3(v2.x, v2.y, v2.z)
//               );
//               var i = geometry.vertices.length - 3;
//               geometry.faces.push(new THREE.Face3(i, i+1, i+2));
//             }
//           }
//         }
//         geometry.computeBoundingSphere();
//         geometry.computeFaceNormals();
//         mesh = new THREE.Mesh(geometry, this.currentMaterial);
//         break;
  
//       case CANNON.Shape.types.TRIMESH:
//         var geometry = new THREE.Geometry();
  
//         var v0 = new CANNON.Vec3();
//         var v1 = new CANNON.Vec3();
//         var v2 = new CANNON.Vec3();
//         for (var i = 0; i < shape.indices.length / 3; i++) {
//           shape.getTriangleVertices(i, v0, v1, v2);
//           geometry.vertices.push(
//             new THREE.Vector3(v0.x, v0.y, v0.z),
//             new THREE.Vector3(v1.x, v1.y, v1.z),
//             new THREE.Vector3(v2.x, v2.y, v2.z)
//           );
//           var j = geometry.vertices.length - 3;
//           geometry.faces.push(new THREE.Face3(j, j+1, j+2));
//         }
//         geometry.computeBoundingSphere();
//         geometry.computeFaceNormals();
//         mesh = new THREE.Mesh(geometry, this.currentMaterial);
//         break;
  
//       default:
//         throw "Visual type not recognized: "+shape.type;
//       }
  
//       mesh.receiveShadow = true;
//       mesh.castShadow = true;
//       if(mesh.children){
//         for(var i=0; i<mesh.children.length; i++){
//           mesh.children[i].castShadow = true;
//           mesh.children[i].receiveShadow = true;
//           if(mesh.children[i]){
//             for(var j=0; j<mesh.children[i].length; j++){
//               mesh.children[i].children[j].castShadow = true;
//               mesh.children[i].children[j].receiveShadow = true;
//             }
//           }
//         }
//       }
  
//       var o = body.shapeOffsets[l];
//       var q = body.shapeOrientations[l];
//       mesh.position.set(3, 1  , 0);
//       mesh.quaternion.set(q.x, q.y, q.z, q.w);
  
//       obj.add(mesh);
//     }

//     lai++;
//     scene.add(obj)
  
//     return obj;
//    };
