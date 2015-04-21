'use strict';

var Class = require('../core/Class.js');
var DisplayComponent = require('./DisplayComponent.js');
var _ = require('lodash');

var defaults = {
    src: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    fixed: true,
    rotation: 0,
    opacity: 1.0
};

var id = 0;

var ImageDisplay = function(canvas, options) {
    DisplayComponent.call(this, id++, 'ImageDisplay', '2d', canvas);

    this.image = new Image();
    this.options = _.assign({}, defaults);

    this.init(options);
};

Class.extend(ImageDisplay, DisplayComponent, {
    init: function(options) {
        this._super.init.call(this, options);

        if (this.image.src !== this.options.src) {
            this.image.src = this.options.src;
        }
    },

    render: function() {
        var width, height,
            canvas = this.canvas,
            context = this.context,
            options = this.options,
            img = this.image;

        if (!options.src) return;

        // Reset canvas
        canvas.width = options.width;
        canvas.height = options.height;
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Get original dimensions
        width = img.naturalWidth;
        height = img.naturalHeight;

        // Resize smaller
        if (options.width < width && options.height < height) {
            var buffer = document.createElement('canvas'),
                bufferContext = buffer.getContext('2d');

            // Draw image at original size
            buffer.width = width;
            buffer.height = height;
            bufferContext.drawImage(img, 0, 0, width, height);

            width /= 2;
            height /= 2;

            // Step down
            while (width >= 1 && height >= 1 && width > options.width && height > options.height) {
                bufferContext.drawImage(buffer, 0, 0, buffer.width, buffer.height, 0, 0, buffer.width/2, buffer.height/2);
                width /= 2;
                height /= 2;
            }

            context.globalAlpha = options.opacity;
            context.drawImage(buffer, 0, 0, width*2, height*2, 0, 0, options.width, options.height);;
        }
        // Draw normally
        else {
            context.globalAlpha = options.opacity;
            context.drawImage(img, 0, 0, options.width, options.height);
        }
    },

    renderToCanvas: function(context) {
        if (this.options.src) {
            var options = this.options,
                width = options.width / 2,
                height = options.height / 2;

            if (options.rotation % 360 !== 0) {
                context.save();
                context.translate(options.x, options.y);
                context.translate(width, height);
                context.rotate(options.rotation * Math.PI / 180);
                context.drawImage(this.canvas, -width, -height);
                context.restore();
            }
            else {
                context.drawImage(this.canvas, options.x, options.y);
            }
        }
    },

    toString: function() {
        return this.name + '' + this.id;
    },

    toJSON: function() {
        return {
            name: this.name,
            values: this.options
        };
    }
});

function sharpen(ctx, w, h, mix) {
    var x, sx, sy, r, g, b, a, dstOff, srcOff, wt, cx, cy, scy, scx,
        weights = [0, -1, 0, -1, 5, -1, 0, -1, 0],
        katet = Math.round(Math.sqrt(weights.length)),
        half = (katet * 0.5) | 0,
        dstData = ctx.createImageData(w, h),
        dstBuff = dstData.data,
        srcBuff = ctx.getImageData(0, 0, w, h).data,
        y = h;

    while (y--) {
        x = w;
        while (x--) {
            sy = y;
            sx = x;
            dstOff = (y * w + x) * 4;
            r = 0;
            g = 0;
            b = 0;
            a = 0;

            for (cy = 0; cy < katet; cy++) {
                for (cx = 0; cx < katet; cx++) {
                    scy = sy + cy - half;
                    scx = sx + cx - half;

                    if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
                        srcOff = (scy * w + scx) * 4;
                        wt = weights[cy * katet + cx];

                        r += srcBuff[srcOff] * wt;
                        g += srcBuff[srcOff + 1] * wt;
                        b += srcBuff[srcOff + 2] * wt;
                        a += srcBuff[srcOff + 3] * wt;
                    }
                }
            }

            dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
            dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
            dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix);
            dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
        }
    }

    ctx.putImageData(dstData, 0, 0);
}

module.exports = ImageDisplay;