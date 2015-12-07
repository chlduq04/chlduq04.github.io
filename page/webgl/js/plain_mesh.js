function setupPlaneMesh(n, options, gl) {
	if(!gl){
		alert("gl 로드 실패");
		return false;
	}
	var GL = gl.gl;
	var options = options || {}; //ensures that we have a JSON object
	var size = (typeof options.size !== 'undefined') ? options.size : 10.0;
	var color = (typeof options.color !== 'undefined') ? options.color : [0.5, 0.5, 1.0, 1.0];
	var translation = (typeof options.translation !== 'undefined') ? options.translation : [0.0, 0.0, 0.0];
	var textured = (typeof options.textured !== 'undefined') ? options.textured : false;

	var vertexPositionData = [], normalData = [], colorData = [], indexData = [], textureData = [];

	//plane
	for (var i = 0; i < 5; ++i) {
		normalData.push(0.0);
		normalData.push(1.0);
		normalData.push(0.0);
		colorData.push(color[0]);
		colorData.push(color[1]);
		colorData.push(color[2]);
		colorData.push(color[3]);
	}

	vertexPositionData = [
		0.0, 0.0, 0.0,
		-size, 0.0, -size,
		size, 0.0, -size,
		size, 0.0, size,
		-size, 0.0, size
	];

	textureData = [
		0.0, 0.0,
		-size, -size,
		size, -size,
		size, size,
		-size, size
	];

	for (var j = 0; j < vertexPositionData.length; j += 3) {
		vertexPositionData[j] += translation[0];
		vertexPositionData[j + 1] += translation[1];
		vertexPositionData[j + 2] += translation[2];
	}

	indexData = [0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1];

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