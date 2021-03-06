import Effect from 'core/Effect';
import BoxBlurShader from 'shaders/BoxBlurShader';
import CircularBlurShader from 'shaders/CircularBlurShader';
import ZoomBlurShader from 'shaders/ZoomBlurShader';
import ShaderPass from 'graphics/ShaderPass';
import GaussianBlurPass from 'graphics/GaussianBlurPass';
import { val2pct } from 'utils/math';

const shaderOptions = {
  Box: BoxBlurShader,
  Circular: CircularBlurShader,
  Zoom: ZoomBlurShader,
};

const BOX_BLUR_MAX = 20;
const CIRCULAR_BLUR_MAX = 10;
const ZOOM_BLUR_MAX = 1;

export default class BlurEffect extends Effect {
  static label = 'Blur';

  static className = 'BlurEffect';

  static defaultProperties = {
    type: 'Gaussian',
    amount: 0.1,
    x: 0,
    y: 0,
  };

  constructor(properties) {
    super(BlurEffect, properties);
  }

  update(properties) {
    const { type } = properties;
    if (type !== undefined && type !== this.properties.type) {
      this.setPass(this.getShaderPass(type));
    }

    return super.update(properties);
  }

  updatePass() {
    const { type, amount, x, y } = this.properties;
    const { width, height } = this.scene.getSize();

    switch (type) {
      case 'Box':
        this.pass.setUniforms({ amount: amount * BOX_BLUR_MAX });
        break;

      case 'Circular':
        this.pass.setUniforms({ amount: amount * CIRCULAR_BLUR_MAX });
        break;

      case 'Gaussian':
        this.pass.setAmount(amount);
        break;

      case 'Zoom':
        this.pass.setUniforms({
          amount: amount * ZOOM_BLUR_MAX,
          center: [val2pct(x, -width / 2, width / 2), val2pct(y, -height / 2, height / 2)],
        });
        break;
    }
  }

  addToScene() {
    this.setPass(this.getShaderPass(this.properties.type));
    this.updatePass();
  }

  removeFromScene() {
    this.pass = null;
  }

  getShaderPass(type) {
    const { width, height } = this.scene.getSize();
    let pass;

    switch (type) {
      case 'Gaussian':
        pass = new GaussianBlurPass();
        break;

      default:
        pass = new ShaderPass(shaderOptions[type]);
    }

    pass.setSize(width, height);

    return pass;
  }
}
