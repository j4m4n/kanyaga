class SceneTransition {
    constructor(duration, type, subType) {
        this.duration = duration;
        this.type = type;
        this.subType = subType;
        this.startTime = TIME;

        let canvas = this.canvas = document.createElement('canvas');
        canvas.width = canvas.height = 64;
        this.ctx = canvas.getContext('2d');
        canvas.className = 'scene-transition';
        document.body.append(canvas);
    }

    update() {
        let t = (TIME - this.startTime) / this.duration;

        if (t > 1) {
            this.canvas.remove();
            this.isDone = true;
            return;
        }

        if (this.type == 'noise') this.updateNoise(t);
        if (this.type == 'circle') this.updateCircle(t);
    }

    updateCircle(t) {
        let direction = this.subType;
        if (direction == 'in') t = 1 - t;

        t = Ease.inOutCubic(t);

        let ctx = this.ctx;

        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        let r = t * Math.SQRT2 * 0.5 * ctx.canvas.width;
        if (r < 0) r = 0;

        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(0.5 * ctx.canvas.width, 0.5 * ctx.canvas.height, r, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.restore();
    }

    updateNoise(t) {
        function noise(ctx) {
          if (!ctx) return;
          const w = ctx.canvas.width,
            h = ctx.canvas.height,
            iData = ctx.createImageData(w, h),
            buffer32 = new Uint32Array(iData.data.buffer),
            len = buffer32.length;
          let i = 0;
          for (; i < len; i++) {
            if (Math.random() < 0.5) buffer32[i] = 0xffffffff;
            //else buffer32[i] = 0x222222;
          }
          //for (; i < len; i++) buffer32[i] = Math.random() * 0xffffff;
          ctx.putImageData(iData, 0, 0);
        }

        noise(this.ctx);
        this.canvas.style.opacity = 1 - t;
    }

}
