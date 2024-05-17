import * as tf from "@tensorflow/tfjs";
import * as use from "@tensorflow-models/universal-sentence-encoder";

export class TensorFlowUtility {
  private static instance: TensorFlowUtility;
  private model!: use.UniversalSentenceEncoder;
  private modelLoadingPromise!: Promise<void>;

  // Make the constructor private to prevent external instantiation
  private constructor() {
    this.loadModel();
  }

  // Static method to get the singleton instance
  public static getInstance(): TensorFlowUtility {
    if (!TensorFlowUtility.instance) {
      TensorFlowUtility.instance = new TensorFlowUtility();
    }
    return TensorFlowUtility.instance;
  }

  // Load the model asynchronously and store the promise to avoid multiple initializations
  private async loadModel(): Promise<void> {
    if (!this.model) {
      this.modelLoadingPromise = use.load().then((model) => {
        this.model = model;
      });
    }
    return this.modelLoadingPromise;
  }

  // Ensure the model is loaded before generating embeddings
  public async generateEmbeddings(texts: string[]): Promise<tf.Tensor2D> {
    await this.loadModel();
    const embedding = await this.model.embed(texts);
    return embedding as unknown as tf.Tensor2D;
  }

  // Cosine similarity calculation remains the same
  public cosineSimilarity(a: tf.Tensor, b: tf.Tensor): number {
    const dotProduct = tf.tidy(() => {
      const aNorm = a.div(tf.norm(a, "euclidean"));
      const bNorm = b.div(tf.norm(b, "euclidean"));
      return aNorm.mul(bNorm).sum();
    });
    return dotProduct.dataSync()[0];
  }
}
