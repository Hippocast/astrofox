import * as THREE from 'three';
import ComposerPass from 'graphics/ComposerPass';

export default class SpritePass extends ComposerPass {
    static defaults = {
        opacity: 1.0,
        transparent: true,
        needsSwap: false,
        needsUpdate: true,
        forceClear: true,
        width: 854,
        height: 480,
    }

    constructor(texture, options) {
        super(Object.assign({}, SpritePass.defaults, options));

        const {
            height,
            width,
        } = this.options;

        this.texture = texture;

        this.material = new THREE.SpriteMaterial({
            color: this.options.color,
            map: texture,
            transparent: this.options.transparent,
        });

        this.sprite = new THREE.Sprite(this.material);
        this.sprite.scale.set(width, height, 0);

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0, 1);

        this.scene.add(this.sprite);
    }

    render(renderer, writeBuffer, readBuffer) {
        const { scene, camera, texture } = this;
        const { needsUpdate } = this.options;

        texture.needsUpdate = needsUpdate;

        super.render(renderer, scene, camera, readBuffer);
    }
}