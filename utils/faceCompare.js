class FaceCompare {
  constructor(options = {}) {
    // Default threshold for considering faces a match
    this.threshold = options.threshold || 0.75;

    // Weights for different feature comparisons
    this.weights = {
      landmarks: options.landmarkWeight || 0.5, // Weight for landmark positions
      metrics: options.metricsWeight || 0.3, // Weight for face metrics/ratios
      angles: options.angleWeight || 0.1, // Weight for head angles
      expressions: options.expressionWeight || 0.1, // Weight for facial expressions
    };
  }

  async compareEmbeddings(newEmbeddings, storedEmbeddings) {
    try {
      // Parse the embeddings JSON
      const newData = JSON.parse(newEmbeddings);
      const storedData = JSON.parse(storedEmbeddings);

      // Calculate similarity scores for different aspects of the face
      const landmarkSimilarity = this._compareLandmarks(newData, storedData);
      const metricsSimilarity = this._compareMetrics(newData, storedData);
      const angleSimilarity = this._compareAngles(newData, storedData);
      const expressionSimilarity = this._compareExpressions(
        newData,
        storedData
      );

      // Calculate weighted similarity score
      const weightedSimilarity =
        landmarkSimilarity * this.weights.landmarks +
        metricsSimilarity * this.weights.metrics +
        angleSimilarity * this.weights.angles +
        expressionSimilarity * this.weights.expressions;

      // Determine if it's a match
      const matched = weightedSimilarity >= this.threshold;

      return {
        matched,
        similarity: weightedSimilarity,
        threshold: this.threshold,
        details: {
          landmarkSimilarity,
          metricsSimilarity,
          angleSimilarity,
          expressionSimilarity,
        },
      };
    } catch (error) {
      console.error("Error comparing embeddings:", error);
      throw new Error(`Face comparison failed: ${error.message}`);
    }
  }

  _compareLandmarks(newData, storedData) {
    try {
      if (!newData.landmarks || !storedData.landmarks) {
        return 0;
      }

      // Get common landmarks between the two face data objects
      const newLandmarks = newData.landmarks;
      const storedLandmarks = storedData.landmarks;

      const commonKeys = Object.keys(newLandmarks).filter((key) =>
        storedLandmarks.hasOwnProperty(key)
      );

      if (commonKeys.length < 3) {
        return 0; // Not enough common landmarks
      }

      // Calculate eye distance for normalization in both faces
      const newEyeDistance = this._calculateDistance(
        newLandmarks["leftEye"].x,
        newLandmarks["leftEye"].y,
        newLandmarks["rightEye"].x,
        newLandmarks["rightEye"].y
      );

      const storedEyeDistance = this._calculateDistance(
        storedLandmarks["leftEye"].x,
        storedLandmarks["leftEye"].y,
        storedLandmarks["rightEye"].x,
        storedLandmarks["rightEye"].y
      );

      // Calculate normalized distances for each landmark
      let totalSimilarity = 0;

      for (const key of commonKeys) {
        // Skip the eyes since we used them for normalization
        if (key === "leftEye" || key === "rightEye") continue;

        const newPoint = newLandmarks[key];
        const storedPoint = storedLandmarks[key];

        // Calculate distance between corresponding points, normalized by eye distance
        const newToLeftEye =
          this._calculateDistance(
            newPoint.x,
            newPoint.y,
            newLandmarks["leftEye"].x,
            newLandmarks["leftEye"].y
          ) / newEyeDistance;

        const storedToLeftEye =
          this._calculateDistance(
            storedPoint.x,
            storedPoint.y,
            storedLandmarks["leftEye"].x,
            storedLandmarks["leftEye"].y
          ) / storedEyeDistance;

        const newToRightEye =
          this._calculateDistance(
            newPoint.x,
            newPoint.y,
            newLandmarks["rightEye"].x,
            newLandmarks["rightEye"].y
          ) / newEyeDistance;

        const storedToRightEye =
          this._calculateDistance(
            storedPoint.x,
            storedPoint.y,
            storedLandmarks["rightEye"].x,
            storedLandmarks["rightEye"].y
          ) / storedEyeDistance;

        // Calculate similarity for this landmark (1 = identical, 0 = completely different)
        const leftEyeSimilarity =
          1 - Math.min(Math.abs(newToLeftEye - storedToLeftEye), 1);
        const rightEyeSimilarity =
          1 - Math.min(Math.abs(newToRightEye - storedToRightEye), 1);

        // Average the similarities
        const landmarkSimilarity = (leftEyeSimilarity + rightEyeSimilarity) / 2;
        totalSimilarity += landmarkSimilarity;
      }

      // Average similarity across all landmarks
      return totalSimilarity / (commonKeys.length - 2); // -2 because we skipped the eyes
    } catch (error) {
      console.error("Error comparing landmarks:", error);
      return 0;
    }
  }

  _compareMetrics(newData, storedData) {
    try {
      if (!newData.metrics || !storedData.metrics) {
        return 0.5; // Neutral if metrics aren't available
      }

      const newMetrics = newData.metrics;
      const storedMetrics = storedData.metrics;

      const commonKeys = Object.keys(newMetrics).filter((key) =>
        storedMetrics.hasOwnProperty(key)
      );

      if (commonKeys.length < 2) {
        return 0.5; // Not enough common metrics
      }

      // Calculate similarity for each metric
      let totalSimilarity = 0;

      for (const key of commonKeys) {
        const newValue = newMetrics[key];
        const storedValue = storedMetrics[key];

        // Calculate similarity (1 = identical, 0 = completely different)
        // We cap the difference at 0.3 to avoid extreme penalties for slight variations
        const similarity =
          1 -
          Math.min(
            Math.abs(newValue - storedValue) /
              Math.max(newValue, storedValue, 0.001),
            0.3
          );
        totalSimilarity += similarity;
      }

      // Average similarity across all metrics
      return totalSimilarity / commonKeys.length;
    } catch (error) {
      console.error("Error comparing metrics:", error);
      return 0.5;
    }
  }

  _compareAngles(newData, storedData) {
    try {
      // Compare head orientation angles
      const angles = ["headEulerAngleX", "headEulerAngleY", "headEulerAngleZ"];

      let totalSimilarity = 0;
      let validAngles = 0;

      for (const angle of angles) {
        if (newData[angle] != null && storedData[angle] != null) {
          // Normalize angle differences (angles can be from -180 to 180)
          let diff = Math.abs(newData[angle] - storedData[angle]);
          diff = Math.min(diff, 360 - diff); // Handle wraparound

          // Convert to similarity (max difference is capped at 30 degrees)
          const similarity = 1 - Math.min(diff / 30, 1);
          totalSimilarity += similarity;
          validAngles++;
        }
      }

      // If no valid angles were found, return neutral value
      if (validAngles === 0) return 0.5;

      return totalSimilarity / validAngles;
    } catch (error) {
      console.error("Error comparing angles:", error);
      return 0.5;
    }
  }

  _compareExpressions(newData, storedData) {
    try {
      // Compare facial expressions (smiling, eye openness)
      const expressions = [
        "smilingProbability",
        "leftEyeOpenProbability",
        "rightEyeOpenProbability",
      ];

      let totalSimilarity = 0;
      let validExpressions = 0;

      for (const expr of expressions) {
        if (newData[expr] != null && storedData[expr] != null) {
          // Calculate difference in probability (0-1 range)
          const diff = Math.abs(newData[expr] - storedData[expr]);

          // We're more tolerant of expression differences
          // Even a 0.5 difference only reduces similarity to 0.5
          const similarity = 1 - diff;
          totalSimilarity += similarity;
          validExpressions++;
        }
      }

      // If no valid expressions were found, return neutral value
      if (validExpressions === 0) return 0.5;

      return totalSimilarity / validExpressions;
    } catch (error) {
      console.error("Error comparing expressions:", error);
      return 0.5;
    }
  }

  _calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
}

export default FaceCompare;
