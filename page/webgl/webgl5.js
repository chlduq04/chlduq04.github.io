function getE(id) {
	return document.getElementById(id);
}
var webgl3;
window.onload = function () {
	webgl3 = new WebGL();
	webgl3.initGl();
};

var WebGL = function () {
	// 캔버스
	this.canvas = null,
	this.gl = null;

	// 프로그램
	this.glProgram = null;

	// 셰이더
	this.fragmentShader = null,
	this.vertexShader = null;

	// 정점을 그리기 위한 var
	this.vertexPositionAttribute = null, this.trianglesVerticeBuffer = null;

	// 광원을 위한 normal 
	this.vertexNormalAttribute = null, this.trianglesNormalBuffer = null,

	// 텍스쳐를 쓰지 않았을 경우 사용할 색 
	this.vertexColorAttribute  = null, this.trianglesColorBuffer = null;
	
	// 텍스쳐 좌표 어트리뷰트
	this.vertexTexCoordAttribute = null, this.trianglesTexCoordBuffer = null;

	// 모델 뷰와 투영 매트릭스를 위한 두 변수
	this.mvMatrix = mat4.create(),
	this.pMatrix = mat4.create();
	this.normalMatrix = mat3.create();

	// 텍스처 개체 로드
	this.STONE_TEXTURE = 0, this.WEBGL_LOGO_TEXTURE = 1, 
	this.texture = [], this.textureImage = [];
	
	// 회전각
	this.angle = 0.01;

	this.toggle = {
		paused : false,
		useTexture : false,
		useLighting : false
	}
}

WebGL.prototype.initGl = function () {
	try {
		this.canvas = getE("webgl_z");
		this.gl = this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl");
	} catch (e) {
		alert("gl을 지원하지 않습니다.")
	}

	if (this.gl != null) {
		// 키 입력
		this.setKeyDown();
		// 셰이더 초기화
		this.initShaders();
		// 물체에 대한 버퍼
		this.setupDynamicBuffers();
		// 매트릭스의 uniform 얻기
		this.getMatrixUniforms();
		// 텍스쳐 로드
		this.loadTexture();
		// 애니메이션 시작
		this.animation();
	}
}

WebGL.prototype.setKeyDown = function () {
	var self = this;
	document.addEventListener("keydown", function(e){
		var keyCode = e.keyCode;
		if (keyCode == 80) { //p
			self.toggle.paused  = !self.toggle.paused;
		} else  if(keyCode == 84){ //t
			self.toggle.useTexture  = !self.toggle.useTexture;
			if(self.toggle.useTexture){
				self.gl.uniform1i(self.glProgram.uDoTexturing, 1);
			} else{
				self.gl.uniform1i(self.glProgram.uDoTexturing, 0);				
			}
		} else  if(keyCode == 76){ //t
			self.toggle.useLighting = !self.toggle.useLighting;
		}		
	}, false);
}

WebGL.prototype.getMatrixUniforms = function () {
	// 셰이더에서 uPMatrix와 uMVMatrix의 값을 불러온다. 셰이더 코드에 명시되어 있어야 한다.
	this.glProgram.pMatrixUniform = this.gl.getUniformLocation(this.glProgram, "uPMatrix");
	this.glProgram.mvMatrixUniform = this.gl.getUniformLocation(this.glProgram, "uMVMatrix");  
	
	this.glProgram.normalMatrixUniform = this.gl.getUniformLocation(this.glProgram, "uNormalMatrix");          
	this.glProgram.samplerUniform = this.gl.getUniformLocation(this.glProgram, "uSampler");
	this.glProgram.samplerUniform2 = this.gl.getUniformLocation(this.glProgram, "uSampler2");
}

WebGL.prototype.setMatrixUniforms = function () {
	// 
	this.gl.uniformMatrix4fv(this.glProgram.pMatrixUniform, false, this.pMatrix);
	this.gl.uniformMatrix4fv(this.glProgram.mvMatrixUniform, false, this.mvMatrix);
	this.gl.uniformMatrix3fv(this.glProgram.normalMatrixUniform, false, this.normalMatrix);
}

WebGL.prototype.loadTexture = function () {
	//
	var self = this;
	this.textureImage[this.STONE_TEXTURE] = new Image();
	this.textureImage[this.STONE_TEXTURE].onload = function () {
		self.setupTexture(self.STONE_TEXTURE);
		self.gl.uniform1i(self.glProgram.samplerUniform, self.STONE_TEXTURE);
	}
	this.textureImage[this.STONE_TEXTURE].src = "brick.jpg";
	
	//
	this.textureImage[this.WEBGL_LOGO_TEXTURE] = new Image();
	this.textureImage[this.WEBGL_LOGO_TEXTURE].onload = function () {
		self.setupTexture(self.WEBGL_LOGO_TEXTURE);
		self.gl.uniform1i(self.glProgram.samplerUniform2, self.WEBGL_LOGO_TEXTURE);
	}
	this.textureImage[this.WEBGL_LOGO_TEXTURE].src = "webgl_logo-512px.png";
	
	this.glProgram.uDoTexturing = this.gl.getUniformLocation(this.glProgram, "uDoTexturing");          		
	this.gl.uniform1i(this.glProgram.uDoTexturing, 1);
}

WebGL.prototype.setupTexture = function (i) {
	// 텍스쳐 active 
	this.gl.activeTexture(this.gl.TEXTURE0 + i);
	// 텍스쳐 만들기
	this.texture[i] =  this.gl.createTexture();
	// 텍스쳐를 바인드
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture[i]);
	// 텍스쳐 데이터 저장방식 : 지금은 수직뒤집기
	this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
	// 
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.textureImage[i]);
	// 텍스처의 확장을 설정
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
	// 텍스쳐의 축소를 설정
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
	// 이 경우 NEAREST를 사용 : 가장 가까운 텍스쳐점을 선택해서 빠르지만 부드럽지 못함
	// LINEAR등 다른 옵션이 존재한다.

	if (!this.gl.isTexture(this.texture[i])) {
		alert("Error : Texture is invalid");
	}
}

WebGL.prototype.initShaders = function () {
	// 프로그램 생성
	this.glProgram = this.gl.createProgram();
	// 각 버텍스 셰이더와 픽셸 세이더를 만드는 API호출
	var vertexShader = this.makeShader(getE("shader-vs-z").innerHTML.trim(), this.gl.VERTEX_SHADER);
	var pixelShader = this.makeShader(getE("shader-fs-z").innerHTML.trim(), this.gl.FRAGMENT_SHADER);
	//셰이더를 붙이고
	this.gl.attachShader(this.glProgram, vertexShader);
	this.gl.attachShader(this.glProgram, pixelShader);
	//셰이더를 gl이 사용할 수 있도록 link한 후
	this.gl.linkProgram(this.glProgram);

	if (!this.gl.getProgramParameter(this.glProgram, this.gl.LINK_STATUS)) {
		alert("program 실패");
	}
	//사용
	this.gl.useProgram(this.glProgram);
}

WebGL.prototype.setupDynamicBuffers = function () {

	var triangleVerticesOriginal = [ 
		//front face
		//bottom left to right,  to top
		0.0, 0.0, 0.0,
		1.0, 0.0, 0.0,
		2.0, 0.0, 0.0,
		0.5, 1.0, 0.0,
		1.5, 1.0, 0.0,
		1.0, 2.0, 0.0,
		
		//rear face
		0.0, 0.0, -2.0,
		1.0, 0.0, -2.0,
		2.0, 0.0, -2.0,
		0.5, 1.0, -2.0,
		1.5, 1.0, -2.0,
		1.0, 2.0, -2.0,
	];

	//16 triangless
	var triangleVertexIndices = [
		//front face
		0, 1, 3,
		1, 4, 3,
		1, 2, 4,
		3, 4, 5,
		//rear face
		6, 7, 9,
		7, 10, 9,
		7, 8, 10,
		9, 10, 11,
		//left side
		0, 6, 3,
		3, 6, 9,
		3, 9, 5,
		5, 9, 11,
		//right side
		2, 8, 4,
		4, 8, 10,
		4, 10, 5,
		5, 10, 11,
	];
	
	var triangleVertices = [];
	var triangleVerticeColors = [];	
	var triangleNormals = [];
	var triangleTexCoords = [];
	
	for (var i = 0; i < triangleVertexIndices.length; ++i) {
		var a = triangleVertexIndices[i];
		triangleVertices.push(triangleVerticesOriginal[a * 3]);
		triangleVertices.push(triangleVerticesOriginal[a * 3 + 1]);
		triangleVertices.push(triangleVerticesOriginal[a * 3 + 2]);
		if (i >= 24) {
			triangleTexCoords.push(triangleVerticesOriginal[a * 3 + 1]);
			triangleTexCoords.push(triangleVerticesOriginal[a * 3 + 2]);
		} else {
			triangleTexCoords.push(triangleVerticesOriginal[a * 3]);
			triangleTexCoords.push(triangleVerticesOriginal[a * 3 + 1]);
		}
		triangleVerticeColors.push(0.8);
		triangleVerticeColors.push(0.1);
		triangleVerticeColors.push(0.1);
	}

	
	// 버퍼를 만들어서
	this.trianglesVerticeBuffer = this.gl.createBuffer();
	// 버퍼에 우리가 만든 정점을 추가한다.
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.trianglesVerticeBuffer);
	// 그리고 STATIC_DRAW, DYNAMIC_DRAW, STREAM_DRAW의 세가지 방법으로 버퍼에 사용법을 명시해주는데
	// (변경을 하지 않음 , 그릴때마다 재설정 , STATIC과 유사하나 자주 사용하지 않음)이라는 특징을 가지고 있다.
	// 그리고 위에서와 달리 dinamic으로 위치가 변하는 것을 적용한다.
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(triangleVertices), this.gl.STATIC_DRAW);

	this.trianglesColorBuffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.trianglesColorBuffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(triangleVerticeColors), this.gl.STATIC_DRAW);
				
	this.trianglesTexCoordBuffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.trianglesTexCoordBuffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(triangleTexCoords), this.gl.STATIC_DRAW);

	for(var i=0; i<triangleVertexIndices.length; i+=3){
		var a = triangleVertexIndices[i];
		var b = triangleVertexIndices[i + 1];
		var c = triangleVertexIndices[i + 2];
		// 법선은 외적
		var v1 = [
			triangleVerticesOriginal[a*3] - triangleVerticesOriginal[b*3],
			triangleVerticesOriginal[a*3 + 1] - triangleVerticesOriginal[b*3 + 1],
			triangleVerticesOriginal[a*3 + 2] - triangleVerticesOriginal[b*3 + 2],
		];
		var v2 = [
			triangleVerticesOriginal[a*3] - triangleVerticesOriginal[c*3],
			triangleVerticesOriginal[a*3 + 1] - triangleVerticesOriginal[c*3 + 1],
			triangleVerticesOriginal[a*3 + 2] - triangleVerticesOriginal[c*3 + 2],
		];
		var cross = [
			v1[1]*v2[2] - v1[1]*v2[2],
			v1[2]*v2[0] - v1[0]*v2[2],
			v1[0]*v2[1] - v1[0]*v2[1],
		];	
		//same value for each of the three vertices
		triangleNormals.push.apply(triangleNormals, cross);
		triangleNormals.push.apply(triangleNormals, cross);
		triangleNormals.push.apply(triangleNormals, cross);
	}	
	
	this.trianglesNormalBuffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.trianglesNormalBuffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(triangleNormals), this.gl.STATIC_DRAW);		
	
}

WebGL.prototype.drawScene = function () {
	// glProgram에서 aVertexPosition의 값을 얻어온다
	this.vertexPositionAttribute = this.gl.getAttribLocation(this.glProgram, "aVertexPosition");
	this.gl.enableVertexAttribArray(this.vertexPositionAttribute);
	//그리고 버퍼에 바인드 시킨다.
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.trianglesVerticeBuffer);
	this.gl.vertexAttribPointer(this.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);

	this.vertexColorAttribute = this.gl.getAttribLocation(this.glProgram, "aVertexColor");
	this.gl.enableVertexAttribArray(this.vertexColorAttribute);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.trianglesColorBuffer);
	this.gl.vertexAttribPointer(this.vertexColorAttribute, 3, this.gl.FLOAT, false, 0, 0);
				
	this.vertexNormalAttribute = this.gl.getAttribLocation(this.glProgram, "aVertexNormal");
	this.gl.enableVertexAttribArray(this.vertexNormalAttribute);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.trianglesNormalBuffer);
	this.gl.vertexAttribPointer(this.vertexNormalAttribute, 3, this.gl.FLOAT, false, 0, 0);
	
	this.vertexTexCoordAttribute = this.gl.getAttribLocation(this.glProgram, "aVertexTexCoord");
	this.gl.enableVertexAttribArray(this.vertexTexCoordAttribute);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.trianglesTexCoordBuffer);
	this.gl.vertexAttribPointer(this.vertexTexCoordAttribute, 2, this.gl.FLOAT, false, 0, 0);

	this.gl.drawArrays(this.gl.TRIANGLES, 0, 16 * 3)
	//gl에 그린다.
}

WebGL.prototype.makeShader = function (src, type) {
	var shader = this.gl.createShader(type);
	// 셰이더에 소스 붙이기
	this.gl.shaderSource(shader, src);
	// 컴파일
	this.gl.compileShader(shader);
	if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
		alert("shader 실패");
	}
	return shader;
}

WebGL.prototype.setupWebGL = function () {
	this.gl.clearColor(0.1, 0.5, 0.1, 1.0); 	
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); 	
	this.gl.enable(this.gl.DEPTH_TEST);
				
	this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	mat4.perspective(45, this.canvas.width / this.canvas.height, 0.1, 100.0, this.pMatrix);
	mat4.identity(this.mvMatrix);
	mat4.translate(this.mvMatrix, [0.0, -1.0, -5.5]);              
	mat4.rotate(this.mvMatrix, this.angle, [0.0, 1.0, 0.0]);              
	mat4.toInverseMat3(this.mvMatrix, this.normalMatrix);
	mat3.transpose(this.normalMatrix);
	this.angle += 0.005;
}

WebGL.prototype.animation = function () {
	if(!this.toggle.paused){
		this.setupWebGL();
		this.setMatrixUniforms();
		this.drawScene();		
	}
	requestAnimationFrame(this.animation.bind(this), this.canvas);
	// 여기서 쓰인 bind함수는 나중에 불려지는 animLoop에서 this에 접근할 수 있게 한다. 단 JavaScript 1.8 가 지원되는 브라우져만 가능하다.
	// 이를 사용하지 않는다면 다른 방법으로 코드를 만들어야 한다.
}
