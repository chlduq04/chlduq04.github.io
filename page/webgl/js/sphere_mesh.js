function setupSphereMesh(n, options, gl) {
	if(!gl){
		alert(" gl로드 실패")
		return false;
	}	
	var options = options || {}; //ensures that we have a JSON object
	var GL = gl.gl;
	var color = (typeof options.color !== 'undefined') ? options.color : [1.0, 0.0, 0.0, 1.0];
	var translation = (typeof options.translation !== 'undefined') ? options.translation : [0.0, 0.0, 0.0];
	var radius = (typeof options.radius !== 'undefined') ? options.radius : 1.0;
	var divisions = (typeof options.divisions !== 'undefined') ? options.divisions : 30;
	var smooth_shading = (typeof options.smooth_shading !== 'undefined') ? options.smooth_shading : true;
	var textured = (typeof options.textured !== 'undefined') ? options.textured : false;

	var latitudeBands = divisions, longitudeBands = divisions;

	var vertexPositionData = [], normalData = [], colorData = [], indexData = [], textureData = [];

	//modified from http://learningwebgl.com/cookbook/index.php/How_to_draw_a_sphere
	for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
		var theta = latNumber * Math.PI / latitudeBands;
		var sinTheta = Math.sin(theta);
		var cosTheta = Math.cos(theta);

		for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
			var phi = longNumber * 2 * Math.PI / longitudeBands;
			var sinPhi = Math.sin(phi);
			var cosPhi = Math.cos(phi);

			var x = cosPhi * sinTheta;
			var y = cosTheta;
			var z = sinPhi * sinTheta;
			var u = 1 - (longNumber / longitudeBands);
			var v = latNumber / latitudeBands;

			textureData.push((x + 1.0) * .5);
			textureData.push((y + 1.0) * .5);

			normalData.push(x);
			normalData.push(y);
			normalData.push(z);
			colorData.push(color[0]);
			colorData.push(color[1]);
			colorData.push(color[2]);
			colorData.push(color[3]);
			vertexPositionData.push(radius * x + translation[0]);
			vertexPositionData.push(radius * y + translation[1]);
			vertexPositionData.push(radius * z + translation[2]);
		}
	}

	for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
		for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
			var first = (latNumber * (longitudeBands + 1)) + longNumber;
			var second = first + longitudeBands + 1;
			indexData.push(first);
			indexData.push(second);
			indexData.push(first + 1);

			indexData.push(second);
			indexData.push(second + 1);
			indexData.push(first + 1);
		}
	}
	
	//
	if (!smooth_shading) {
		vertexPositionData = calculateFlattenedVertices(vertexPositionData, indexData);
		colorData = [];
		for (var i = 0; i < indexData.length; ++i) {
			colorData.push(color[0]);
			colorData.push(color[1]);
			colorData.push(color[2]);
			colorData.push(color[3]);
		}
		normalData = calculatePerFaceNormals(normalData, indexData);
	}

	gl.trianglesNormalBuffers[n] = GL.createBuffer();
	GL.bindBuffer(GL.ARRAY_BUFFER, gl.trianglesNormalBuffers[n]);
	GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(normalData), GL.STATIC_DRAW);
	gl.trianglesNormalBuffers[n].itemSize = 3;
	gl.trianglesNormalBuffers[n].numItems = normalData.length / 3;

	gl.trianglesColorBuffers[n] = GL.createBuffer();
	GL.bindBuffer(GL.ARRAY_BUFFER, gl.trianglesColorBuffers[n]);
	GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(colorData), GL.STATIC_DRAW);
	gl.trianglesColorBuffers[n].itemSize = 4;
	gl.trianglesColorBuffers[n].numItems = colorData.length / 4;

	gl.trianglesVerticeBuffers[n] = GL.createBuffer();
	GL.bindBuffer(GL.ARRAY_BUFFER, gl.trianglesVerticeBuffers[n]);
	GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertexPositionData), GL.STATIC_DRAW);
	gl.trianglesVerticeBuffers[n].itemSize = 3;
	gl.trianglesVerticeBuffers[n].numItems = vertexPositionData.length / 3;

	if (textured) {
		gl.trianglesTexCoordBuffers[n] = GL.createBuffer();
		GL.bindBuffer(GL.ARRAY_BUFFER, gl.trianglesTexCoordBuffers[n]);
		GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(textureData), GL.STATIC_DRAW);
		gl.trianglesTexCoordBuffers[n].itemSize = 2;
		gl.trianglesTexCoordBuffers[n].numItems = textureData.length / 2;
	}

	gl.vertexIndexBuffers[n] = GL.createBuffer();
	GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, gl.vertexIndexBuffers[n]);
	GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), GL.STREAM_DRAW);
	gl.vertexIndexBuffers[n].itemSize = 3;
	gl.vertexIndexBuffers[n].numItems = indexData.length;
}

function calculateFlattenedVertices(origVertices, indices) {
	var vertices = [];
	for (var i = 0; i < indices.length; ++i) {
		a = indices[i] * 3;
		vertices.push(origVertices[a]);
		vertices.push(origVertices[a + 1]);
		vertices.push(origVertices[a + 2]);
	}
	return vertices;
}

function calculatePerFaceNormals(origNormals, indices) {
	var normals = [];
	for (var i = 0; i < indices.length; i += 3) {
		var a = indices[i] * 3;
		var b = indices[i + 1] * 3;
		var c = indices[i + 2] * 3;

		n1 = new Vector3(origNormals[a], origNormals[a + 1], origNormals[a + 2]);
		n2 = new Vector3(origNormals[b], origNormals[b + 1], origNormals[b + 2]);
		n3 = new Vector3(origNormals[c], origNormals[c + 1], origNormals[c + 2]);

		nx = (n1.x + n2.x + n3.x) / 3;
		ny = (n1.y + n2.y + n3.y) / 3;
		nz = (n1.z + n2.z + n3.z) / 3;

		v3 = new Vector3(nx, ny, nz);
		normals.push(v3.x);
		normals.push(v3.y);
		normals.push(v3.z);

		normals.push(v3.x);
		normals.push(v3.y);
		normals.push(v3.z);

		normals.push(v3.x);
		normals.push(v3.y);
		normals.push(v3.z);
	}
	return normals;
}