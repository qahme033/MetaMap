

function pca(rawData){
	var covarianceMatrix;
	var samplesMatrix;
	console.log(rawData)
	// localStorage.clear();
	// if(!localStorage.getItem("covarianceMatrix")){
		var samplesMatrix = genSampleMatrix2(rawData);
		var meansPerDims = getAveragesPerDim2(samplesMatrix)
		var meanSubbed = substractMean(samplesMatrix, meansPerDims)
		var covarianceMatrix = genCovarianceMatrix(meanSubbed)
		localStorage.setItem('covarianceMatrix', covarianceMatrix);	
	// }
	// else{
	// 	covarianceMatrix = localStorage.getItem("covarianceMatrix") 
	// }

	// for(var row = 0; row < 32; row++){
	// 	for(var col = 0; col < 32; col++){
	// 		covarianceMatrix[row][col] = Math.random() *200000 * Math.random()
	// 	}
	// }
	var eigs = numeric.eig(covarianceMatrix)
	var eigenVectorsTransposed = numeric.transpose(eigs.E.x)
	var rowFeatureVector = [eigenVectorsTransposed[0], eigenVectorsTransposed[1]]
	var rowDataAdjusted = numeric.transpose(meanSubbed)
	var coordinates = numeric.mul(rowFeatureVector, rowDataAdjusted)
	var sampleIDs = Object.keys(rawData) 
	// var finalCoordinates = {}
	// finalCoordinates.x = coordinates[0]
	// finalCoordinates.y = coordinates[1] 
	// finalCoordinates.id = Object.keys(rawData) 
	var finalCoordinates = d3.range(coordinates[0].length).map((d, i) => ({
	  x: coordinates[0][i],
	  y: coordinates[1][i],
	  id: sampleIDs[i],
	  r: rawData[sampleIDs[i]][0].value,
	}));
	return finalCoordinates;


}

function getMaxIndex(eigenValueArray, num){
	var maxIndexes = [];
	for(var n = 0;  n <= num; n++){
		var max = 0;
		for(var i = 0; i < eigenValueArray.length; i++){
			if(eigenValueArray[i] > max && !maxIndexes.includes(i)){
				max = eigenValueArray[i]
				maxIndexes[n] = i
				console.log(i)
			}
		}
	}

	return maxIndexes
}

function genCovarianceMatrix(matrix){
	//console.log(mat)
	var covarianceMatrix = [];
	var sampleMeans = getSampleMeans(matrix)
	//console.log(sampleMeans)
	for(var sampleA = 0; sampleA < matrix.length; sampleA++){
		covarianceMatrix[sampleA] = [];
		for(var sampleB = 0; sampleB < matrix.length; sampleB++){
			var covSum = 0;
			for(var i = 0; i < matrix[sampleA].length; i++){
				covSum += (matrix[sampleA][i] - sampleMeans[sampleA])*(matrix[sampleB][i] - sampleMeans[sampleB])
				//console.log(covSum)
			}
			covarianceMatrix[sampleA][sampleB] = covSum/(matrix[sampleA].length-1)
		}
	}
	return covarianceMatrix
}

function getSampleMeans(samplesMatrix){
	var sampleMeans = []
	for(var sample in samplesMatrix){
		sampleMeans[sample] = getArrayMean(samplesMatrix[sample])
	}
	return sampleMeans
}


function getArrayMean(array){
	var sum = 0;
	for(var i in array){
		sum += array[i]
	}
	return sum/array.length
}

function substractMean(samplesMatrix, meansPerDims){
	var meanSubbed = [];

	for(var sample in samplesMatrix){
		meanSubbed[sample] = numeric.sub(samplesMatrix[sample], meansPerDims)
	}
	return meanSubbed
}

function genSampleMatrix(rawData){
	var samplesMatrix = [];

	for(var taxon in rawData[Object.keys(rawData)[0]]){
		samplesMatrix[taxon] = []
		var sampleIDCount = 0;
		for(var sampleID in rawData){
			samplesMatrix[taxon][sampleIDCount] = rawData[sampleID][taxon].value
			sampleIDCount++;
		}
	}
	//console.log(samplesMatrix)
	return samplesMatrix;
}

function genSampleMatrix2(rawData){
	var samplesMatrix = [];
	var sampleIDCount = 0;
	for(var sampleID in rawData){
		samplesMatrix[sampleIDCount] = []
		for(var row in rawData[sampleID]){
			samplesMatrix[sampleIDCount][row] = rawData[sampleID][row].value
		}
		sampleIDCount++;
	}
	return samplesMatrix
}

function getAveragesPerDim(samplesMatrix){
	var averagesPerDim = []
	for(var taxon = 0; taxon < samplesMatrix.length; taxon++){
		var taxonSum = 0;
		for(var sample = 0; sample < samplesMatrix[taxon].length; sample++){
			taxonSum += samplesMatrix[taxon][sample]
		}
		averagesPerDim[taxon] = taxonSum/samplesMatrix[taxon].length
	}
	return averagesPerDim
}

function getAveragesPerDim2(samplesMatrix){
	var averagesPerDim = []
	for(var taxon = 0; taxon < samplesMatrix[0].length; taxon++){
		var taxonSum = 0;
		for(var sample = 0; sample < samplesMatrix.length; sample++){
			taxonSum += samplesMatrix[sample][taxon]
		}
		averagesPerDim[taxon] = taxonSum/samplesMatrix[0].length
	}
	return averagesPerDim
}

