class GuaCamera extends GuaObject {
    constructor() {
        super()
        this.position = GuaVector.new(0, 0, -10)
        this.target = GuaVector.new(0, 0, 0)
        this.up = GuaVector.new(0, 1, 0)
    }
}

class GuaCanvas extends GuaObject {
    constructor(selector) {
        super()
        let canvas = _e(selector)
        this.canvas = canvas
        this.context = canvas.getContext('2d')
        this.w = canvas.width
        this.h = canvas.height
        this.pixels = this.context.getImageData(0, 0, this.w, this.h)
        this.bytesPerPixel = 4
        this.depthBuffer = {}
        // this.pixelBuffer = this.pixels.data
        this.camera = GuaCamera.new()
    }
    render() {
        // 执行这个函数后, 才会实际地把图像画出来
        let {pixels, context} = this
        context.putImageData(pixels, 0, 0)
    }
    clear(color=GuaColor.transparent()) {
        // 遍历每个像素点, 设置像素点的颜色
        let {w, h} = this
        let z = -10
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                this._setPixel(x, y, z, color)

                let i = y * this.w + x
                this.depthBuffer[i] = 999
            }
        }
        this.render()
    }
    _getPixel(x, y) {
        let int = Math.floor
        x = int(x)
        y = int(y)
        let i = (y * this.w + x) * this.bytesPerPixel
        // 设置像素
        let p = this.pixels.data
        return GuaColor.new(p[i], p[i+1], p[i+2], p[i+3])
    }
    _setPixel(x, y, z, color) {
        // 浮点转 int
        x = int(x)
        y = int(y)

        // 被覆盖的部分直接返回
        let index = this.w * y + x
        let depth = this.depthBuffer[index]
        if (depth < z) {
            return;
        }
        this.depthBuffer[index] = z

        // 用坐标算像素下标
        let i = (y * this.w + x) * this.bytesPerPixel

        // 设置像素
        let p = this.pixels.data
        let {r, g, b, a} = color
        p[i] = int(r)
        p[i+1] = int(g)
        p[i+2] = int(b)
        p[i+3] = int(a)
    }
    drawPoint(point, color=GuaColor.black()) {
        let {w, h} = this
        let p = point
        if (p.x >= 0 && p.x <= w) {
            if (p.y >= 0 && p.y <= h) {
                this._setPixel(p.x, p.y, p.z, color)
            }
        }
    }
    drawLine(v1, v2, color=GuaColor.black()) {
        // v1 v2 分别是起点和终点
        let [x1, y1, x2, y2, z1, z2] = [v1.x, v1.y, v2.x, v2.y, v1.z, v2.z]
        let dx = x2 - x1
        let dy = y2 - y1
        let dz = z2 - z1
        // color = GuaColor.randomColor()
        // color = GuaColor.red()
        if (Math.abs(dx) > Math.abs(dy)) {
            let xmin = Math.min(x1, x2)
            let xmax = Math.max(x1, x2)
            let ratio = dx == 0 ? 0 : dy / dx
            let ratio2 = dx == 0 ? 0 : dz / dx
            for(let x = xmin; x < xmax; x++) {
                let y = y1 + (x - x1) * ratio
                let z = z1 + (x - x1) * ratio2
                this.drawPoint(GuaVector.new(x, y, z), color)
            }
        } else {
            let ymin = Math.min(y1, y2)
            let ymax = Math.max(y1, y2)
            let ratio = dy == 0 ? 0 : dx / dy
            let ratio2 = dy == 0 ? 0 : dz / dy
            for(let y = ymin; y < ymax; y++) {
                let x = x1 + (y - y1) * ratio
                let z = z1 + (y - y1) * ratio2
                this.drawPoint(GuaVector.new(x, y, z), color)
            }
        }
    }
    drawScanline(v1, v2) {
        let [a, b] = [v1, v2].sort((va, vb) => va.position.x - vb.position.x)
        let y = a.position.y
        let x1 = a.position.x
        let x2 = b.position.x
        for (let x = x1; x <= x2; x++) {
            let factor = 0
            if (x2 != x1) {
                factor = (x - x1) / (x2 - x1);
            }
            let v = v1.interpolate(v2, factor)
            let color = null
            if (v.position.u) {
                let tu = int(v.position.u * this.image.w)
                let tv = int(v.position.v * this.image.h)
                let index = tv * this.image.h + tu
                index = int(index)
                // log(index)
                color = this.image.pixels[index]
            } else {
                color = a.color.interpolate(b.color, factor)
            }
            this.drawPoint(v.position, color)
        }
    }
    drawTriangle(v1, v2, v3) {
        let [a, b, c] = [v1, v2, v3].sort((va, vb) => va.position.y - vb.position.y)
        // log(a, b, c)
        let middle_factor = 0
        if (c.position.y - a.position.y != 0) {
            middle_factor = (b.position.y - a.position.y) / (c.position.y - a.position.y)
        }
        middle_factor = round(middle_factor)
        let middle = a.interpolate(c, middle_factor)
        let start_y = a.position.y
        let end_y = b.position.y
        for (let y = start_y; y <= end_y; y++) {
            let factor = 0
            if (end_y != start_y) {
                factor = (y - start_y) / (end_y - start_y)
            }
            let va = a.interpolate(middle, factor)
            let vb = a.interpolate(b, factor)
            this.drawScanline(va, vb)
        }
        start_y = b.position.y
        end_y = c.position.y
        for (let y = start_y; y <= end_y; y++) {
            let factor = 0
            if (end_y != start_y) {
                factor = (y - start_y) / (end_y - start_y)
                factor = round(factor)
            }
            let va = middle.interpolate(c, factor)
            let vb = b.interpolate(c, factor)
            this.drawScanline(va, vb)
        }
    }
    project(coordVector, transformMatrix) {
        let {w, h} = this
        let [w2, h2] = [w/2, h/2]
        let point = transformMatrix.transform(coordVector.position)
        let x = point.x * w2 + w2
        let y = - point.y * h2 + h2
        // let z = coordVector.position.z
        let z = point.z
        let pu = coordVector.position.u
        let pv = coordVector.position.v

        let v = GuaVector.new(x, y, z, pu, pv)
        return GuaVertex.new(v, coordVector.color)
    }
    drawMesh(mesh) {
        let self = this
        // camera
        let {w, h} = this
        let {position, target, up} = self.camera
        const view = Matrix.lookAtLH(position, target, up)
        const projection = Matrix.perspectiveFovLH(0.8, w / h, 0.1, 1)

        const rotation = Matrix.rotation(mesh.rotation)
        const translation = Matrix.translation(mesh.position)

        const world = rotation.multiply(translation)
        const transform = world.multiply(view).multiply(projection)

        for (let t of mesh.indices) {
            let [a, b, c] = t.map(i => mesh.vertices[i])
            let [v1, v2, v3] = [a, b, c].map(v => self.project(v, transform))
            // self.drawTriangle(v1, v2, v3)
            self.drawLine(v1.position, v2.position)
            self.drawLine(v1.position, v3.position)
            self.drawLine(v2.position, v3.position)
        }
    }
    drawImage(guaimage) {
        let [w, h, pixels] = [guaimage[0], guaimage[1], guaimage[2]]
        let z = 0

        for (var x = 0; x < w; x++) {
            for (var y = 0; y < h; y++) {
                let i = (y * w + x)
                this._setPixel(x, y, z, pixels[i])
            }
        }
    }
}
