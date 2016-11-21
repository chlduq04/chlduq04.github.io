var Web3DGL ;
window.onload = function() {
	Web3DGL = new DrawWebGL();
	Web3DGL.init();
};

function DrawWebGL( opt ){
	
	/* ----- WebGL Global Variables ----- */

	this.container;
	this.scene;
	this.renderer;
	this.controls;
	this.stats;	
	this.keyboard = new THREEx.KeyboardState();
	this.clock = new THREE.Clock();
	this.pointLight;
	this.spotLight;
	this.projector;
	this.raycaster;
	this.mouse;
	this.INTERSECTED;
	
	/* ----- Player View, Sky View ----- */

	this.chasePlayer;
	this.chaseCamera;
	this.topPlayer;
	this.topCamera;

	/* ----- Objects ----- */
	
	this.overObj;
	this.clickedObj;
	this.house ;
	this.funiture = {};
	this.elsething = {};
	this.rocks = [];
	this.fire = [];
	this.goal = parseFloat((Math.random()*0.5 - 0.25).toFixed(2));
	this.goalCount = 0;
	
	/* ----- Basic Setting ----- */
	
	this.defaults = {
			SCREEN_WIDTH : window.innerWidth,
			SCREEN_HEIGHT : window.innerHeight,
			VIEW_ANGLE : 45, 
			ASPECT : window.innerWidth / window.innerHeight, 
			NEAR : 0.1, 
			FAR : 20000,
			
			MOVE_LEFT : "A",
			MOVE_RIGHT : "D",
			MOVE_UP : "W",
			MOVE_DOWN : "S",
			VIEW_SWITCH : "Q",
			MOVE_DOWN : "S",
//			OPACITY_SWITCH : "Z",
			OPACITY_MODE : 1,
			VIEW_MODE : 1,
			
			HOUSE_POSX : 0,
			HOUSE_POSY : 0,
			HOUSE_POSZ : 0,
			PLAYER_POSX : 0,
			PLAYER_POSY : 200,
			PLAYER_POSZ : 0 ,
			
			OPACITY : 1,
			OPACITY_LENGTH : 1000
	};
	$.extend(this.defaults, opt);
	
	this.keyPress = false;
	
	
}

DrawWebGL.prototype = {
		
		/** --------- Initialize DrawWebGL --------- */
		
		init : function(){
			this.initRender();
			this.initScene();
			this.initTopCamera();
			this.initChaseCamera();
			this.initLight();
			this.initControl();
			this.initState();
			this.initElse();
			this.loadPlayer( this.defaults.HOUSE_POSX, this.defaults.HOUSE_POSY, this.defaults.HOUSE_POSZ );
			this.loadRock(10,210,10)
			this.loadHouse( "./OBJ/rocket.obj", "", this.defaults.HOUSE_POSX, this.defaults.HOUSE_POSY, this.defaults.HOUSE_POSZ, 10, 10, 10 ,0, 0, 0 );
			this.loadFire(-40,-50, 8);
			this.animationScene();
		},
		
		/** --------- Initialize Rendering --------- */
		
		initRender : function(){
			if ( Detector.webgl ){
				this.renderer = new THREE.WebGLRenderer( {antialias:true, logarithmicDepthBuffer: true} );
			}else{
				this.renderer = new THREE.CanvasRenderer(); 
			}
			this.renderer.setSize(this.defaults.SCREEN_WIDTH, this.defaults.SCREEN_HEIGHT);
		},
		
		/** --------- Initialize Scene --------- */
		
		initScene : function(){
			this.scene = new THREE.Scene();
		},
		
		/** --------- Initialize PointLight --------- */
		
		initLight : function(){
			this.pointLight = new THREE.PointLight(0xffffff);
			this.pointLight.position.set(100,150,100);
			this.scene.add(this.pointLight);
		},
		
		/** --------- Initialize Top Camera --------- */
		
		initTopCamera : function(){
			this.topCamera = new THREE.PerspectiveCamera( this.defaults.VIEW_ANGLE, this.defaults.ASPECT, this.defaults.NEAR, this.defaults.FAR);
			this.topCamera.position.set(0,150,400);
			this.topCamera.lookAt(this.scene.position);	
			this.scene.add(this.topCamera);
		},
		
		/** --------- Initialize Chase Camera --------- */
		
		initChaseCamera : function(){
			this.chaseCamera = new THREE.PerspectiveCamera( this.defaults.VIEW_ANGLE, this.defaults.ASPECT, this.defaults.NEAR, this.defaults.FAR);
			this.chaseCamera.position.set(0,150,400);
			this.chaseCamera.lookAt(this.scene.position);	
			this.scene.add(this.chaseCamera);			
		},
		
		/** --------- Initialize Control --------- */
		
		initControl : function(){
			this.mouse = new THREE.Vector2();
			document.addEventListener( 'mousemove', this.onDocumentMouseMove, false );
			document.addEventListener( 'mousedown', this.onDocumentMouseDown, false );
			this.controls = new THREE.OrbitControls( this.topCamera, this.renderer.domElement );
			this.projector = new THREE.Projector();
			this.raycaster = new THREE.Raycaster();
		},
		
		/** --------- Initialize State( rendering speed, rendering state... ) --------- */
		
		initState : function(){
			this.stats = new Stats();
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.bottom = '0px';
			this.stats.domElement.style.zIndex = 100;
		},
				
		/** --------- Initialize Else --------- */
		
		initElse : function(){
			THREEx.WindowResize(this.renderer, this.topCamera);
			THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
			this.container = document.getElementById( '3DModeling' );
			this.container.appendChild( this.renderer.domElement );
			this.container.appendChild( this.stats.domElement );
		},
		
		/** --------- Update Scene --------- */
		
		updateScene : function(){
			this.goalCount++;
			/* ----- Player View, Sky View Move ----- */
			var delta = this.clock.getDelta();
			var rotateAngle = Math.PI / 3 * delta;
			var moveDistance = 500 * delta;
		
			for(var i=0;i<100;i++){
				this.rocks[i].translateX( -moveDistance * 2 );
				this.rocks[i].translateY( -moveDistance * 2 );
				if(this.rocks[i].position.x < -2000 || this.rocks[i].position.y < -2000){
					var xPos = Math.floor(Math.random() * (1000)) - 200
					var yPos = Math.floor(Math.random() * (1000)) - 200
					var zPos= Math.floor(Math.random() * (1000)) - 200

					this.rocks[i].position.set( 10 + xPos, 20 + yPos, 10+ zPos );
				}
			}
			
			
			if(this.goalCount > 50){
				this.goalCount = 0;
				this.goal = parseFloat((Math.random()*0.5 - 0.25).toFixed(2));
			}

			for(var i=0;i<8;i++){
				this.fire[i].translateX( this.goal );
			}
			this.house.translateX( this.goal );
			
			if ( this.defaults.VIEW_MODE == 1 ) {
				if( this.keyboard.pressed( this.defaults.MOVE_LEFT ) ){
					this.chasePlayer.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle );
				}
				if( this.keyboard.pressed( this.defaults.MOVE_RIGHT ) ){
					this.chasePlayer.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle );
				}
			}
			
			this.controls.update();
			this.stats.update();
		},
		
		/** --------- Rendering Scene --------- */
		
		renderScene : function( camera ){
			this.renderer.render( this.scene, camera );
		},
		
		/** --------- Mouse Picking Object --------- */
		
		mouseScene : function(){
			var vector = new THREE.Vector3( this.mouse.x, this.mouse.y, 1 );
			this.projector.unprojectVector( vector, this.topCamera );
			this.raycaster.set( this.topCamera.position, vector.sub( this.topCamera.position ).normalize() );
			var intersects = this.raycaster.intersectObjects( this.house.children );
			if ( intersects.length > 0 ) {
				if ( this.INTERSECTED != intersects[ 0 ].object ) {
					if ( this.INTERSECTED ) this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );
					this.INTERSECTED = intersects[ 0 ].object;
					this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
					this.INTERSECTED.material.emissive.setHex( 0xff0000 );
					this.overObj = intersects[ 0 ].object;
				}
			} else {
				if ( this.INTERSECTED ) this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );
				
				this.INTERSECTED = null;
			}
			
		},
		
		/** --------- Chase Camera Scene --------- */
		
		chaseScene : function(){
			var relativeCameraOffset = new THREE.Vector3(0,50,500);
			var cameraOffset = relativeCameraOffset.applyMatrix4( this.chasePlayer.matrixWorld );
			
			this.chaseCamera.position.x = cameraOffset.x;
			this.chaseCamera.position.y = cameraOffset.y;
			this.chaseCamera.position.z = cameraOffset.z;
			this.chaseCamera.lookAt( this.chasePlayer.position );
		},
		
		/** --------- Loop For Lendering --------- */
		
		animationScene : function(){
			if(Web3DGL.house){
				this.updateScene();
				if( this.defaults.VIEW_MODE == 1 ){
					this.chaseScene();
					this.renderScene( this.chaseCamera );
				}else{
//					this.mouseScene();					
					this.renderScene( this.topCamera );
				}
				
				if( this.defaults.OPACITY_MODE == 1 ){
					
				}else{
					this.setOpacity( this.chaseCamera.position.x, this.chaseCamera.position.y, this.chaseCamera.position.z );
				}
			}
			setTimeout(function(){
				Web3DGL.animationScene();
			},10);
		},
		
		/** --------- Loading Models --------- */
		
		/* ----- Loading House ----- */
		loadHouse : function( obj, mtl, posx, posy, posz, scalex, scaley, scalez, rotx, roty, rotz ){
			var self = this;
			var loader = new THREE.OBJMTLLoader();
			loader.addEventListener('load',function(event){
				self.house = event.content;
				for(k in self.house.children){
					self.house.children[k].castShadow = true;
					self.house.children[k].material.transparent = true;
					self.house.children[k].material.depthWrite = false;
//					self.house.children[k].material.depthTest = false;	
					self.house.children[k].material.opacity = self.defaults.OPACITY;
				}
				self.scene.add(self.setModelDetail(self.house, posx, posy, posz, scalex, scaley, scalez, rotx, roty, rotz ));
			});
			loader.load( obj, mtl );
		},
		
		/* ----- Loading Furniture ----- */
		loadFurniture : function( obj, mtl, name ){
			var loader = new THREE.OBJMTLLoader();
			loader.addEventListener('load',function(event){
				var obj = event.content;
				for(k in obj.children){
					obj.children[k].castShadow = true;
				}
				this.elsething[name] = obj;
			});
			loader.load( obj, mtl );			
		},
		
		/* ----- Loading Else ----- */
		loadElse : function(){
			var loader = new THREE.OBJMTLLoader();
			loader.addEventListener('load',function(event){
				var obj = event.content;
				for(k in obj.children){
					obj.children[k].castShadow = true;
				}
				this.funiture[name] = obj;
			});
			loader.load( obj, mtl );
		},
		
		/* ----- Loading Player ----- */
		loadPlayer : function( posx, posy, posz ){
			var sphereGeometry = new THREE.SphereGeometry( 1, 2, 1 ); 
			var sphereMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff} ); 
			this.chasePlayer = new THREE.Mesh(sphereGeometry, sphereMaterial);
			this.chasePlayer.position.set( posx, posy, posz );
			this.scene.add(this.chasePlayer);
		},
		
		/* ----- Loading Rock ----- */
		loadRock : function( posx, posy, posz ){
			var sphereGeometry = new THREE.SphereGeometry( 50, 32, 16 ); 
			var sphereMaterial = new THREE.MeshLambertMaterial( {color: 0xfffff0} ); 
			for(var i=0;i<100;i++){
				if(i % 10 == 0){
					var xScale = Math.floor(Math.random() * (10 - 1 + 1)) + 1
					var yScale = Math.floor(Math.random() * (10 - 1 + 1)) + 1
					var zScale = Math.floor(Math.random() * (10 - 1 + 1)) + 1
					
					sphereGeometry = new THREE.SphereGeometry( 5 + xScale, 5 + yScale, 5 + zScale ); 
					sphereMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff} ); 
				}
				
				var xPos = Math.floor(Math.random() * (1000)) - 500
				var yPos = Math.floor(Math.random() * (1000)) - 500
				var zPos= Math.floor(Math.random() * (1000)) - 500

				this.rocks[i] = new THREE.Mesh(sphereGeometry, sphereMaterial);
				this.rocks[i].position.set( posx + xPos, posy + yPos, posz + zPos );
				this.scene.add(this.rocks[i]);
			}
		},

		loadFire : function( posx, posy, posz ){
			var locate = 4;
			for(var i=0;i<8;i++){
				var sphereGeometry = new THREE.SphereGeometry( 5 - i*0.5, 32, 16 ); 
				var sphereMaterial = new THREE.MeshLambertMaterial( {color: 0xff0000} ); 
				this.fire[i] = new THREE.Mesh(sphereGeometry, sphereMaterial);
				this.fire[i].position.set( posx - locate, posy - locate, posz );
				this.scene.add(this.fire[i]);
				locate += 4;
			}
		},

		/**--------- Setting Mouse ---------**/
	
		onDocumentMouseMove : function( event ) {
			event.preventDefault();
			Web3DGL.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			Web3DGL.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

		},
		
		onDocumentMouseDown : function( event ){
			Web3DGL.clickedObj = Web3DGL.overObj;
		},
		
		/**--------- Setting Else ---------**/

		setModelDetail : function( obj, posx, posy, posz, scalex, scaley, scalez, rotx, roty, rotz ){
			obj.position.x = posx;
			obj.position.y = posy;
			obj.position.z = posz;
			obj.scale.x = scalex;
			obj.scale.y = scaley;
			obj.scale.z = scalez;
			obj.rotation.x = rotx;
			obj.rotation.y = roty;
			obj.rotation.z = rotz;
			return obj;
		},
		
		setOpacity : function( posx, posy, posz ) {
			var length = this.house.children.length;
			for( var i = 0 ; i < length ; i++ ){
				var position = new THREE.Vector3();
				var target = this.house.children[i];
				var sphere;
				if( !( target.geometry.boundingBox ) ){
					target.geometry.computeBoundingBox();					
				}
				sphere = target.geometry.boundingBox;
				
				position.subVectors( sphere.max, sphere.min );
				position.multiplyScalar( 0.5 );
				position.add( sphere.min );
				position.applyMatrix4( target.matrixWorld );
				
				if( Math.pow(position.x - posx,2) + Math.pow(position.z - posz,2) < Math.pow( this.defaults.OPACITY_LENGTH,2 ) ){
					target.material.transparent = true;
					target.material.depthWrite = false;
					target.material.opacity = 0.2;					
				}else{
					target.material.transparent = false;
					target.material.depthWrite = true;
					target.material.opacity = 1;
				}
			}
		}
};