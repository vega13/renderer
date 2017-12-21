class GuaMesh extends GuaObject {
    // 表示三维物体的类
    constructor() {
        super()

        this.position = GuaVector.new(0, 0, 0)
        this.rotation = GuaVector.new(0, 0, 0)
        this.scale = GuaVector.new(1, 1, 1)
        this.vertices = null
        this.indices = null
    }
    // 返回一个正方体
    static cube() {
        // 8 points
        let points = [
            -1, 1,  -1,     // 0
            1,  1,  -1,     // 1
            -1, -1, -1,     // 2
            1,  -1, -1,     // 3
            -1, 1,  1,      // 4
            1,  1,  1,      // 5
            -1, -1, 1,      // 6
            1,  -1, 1,      // 7
        ]

        let vertices = []
        for (let i = 0; i < points.length; i += 3) {
            let v = GuaVector.new(points[i], points[i+1], points[i+2])
            let c = GuaColor.randomColor()
            // let c = GuaColor.red()
            // vertices.push(GuaVertex.new(v, c))
        }

        // 12 triangles * 3 vertices each = 36 vertex indices
        let indices = [
            // 12
            [0, 1, 2],
            [1, 3, 2],
            [1, 7, 3],
            [1, 5, 7],
            [5, 6, 7],
            [5, 4, 6],
            [4, 0, 6],
            [0, 2, 6],
            [0, 4, 5],
            [5, 1, 0],
            [2, 3, 7],
            [2, 7, 6],
        ]
        let m = this.new()
        m.vertices = vertices
        m.indices = indices
        return m
    }
    static fromGua3d(gua3dString) {
        let str = gua3dString.split('\n')
        let vs = parseInt(str[3].split(' ')[1])
        let ts = parseInt(str[4].split(' ')[1])
        let vertices = []
        let indices = []
        for (var i = 5; i < 5 + vs; i++) {
            let s = str[i].split(' ')
            let x = s[0]
            let y = s[1]
            let z = s[2]
            let u = s[6]
            let v = s[7]
            let vector = GuaVector.new(x, y, z, u, v)
            // let c = GuaColor.randomColor()
            let c = GuaColor.red()
            vertices.push(GuaVertex.new(vector, c))
        }
        for (var i = 5 + vs; i < str.length; i++) {
            let s = str[i].split(' ')
            let v1 = s[0]
            let v2 = s[1]
            let v3 = s[2]
            indices.push([v1, v2, v3])
        }
        let m = this.new()
        m.vertices = vertices
        m.indices = indices
        return m
    }
    fromGuaImage(guaImageString) {
        let pixels = []
        let str = guaImageString.split('\n')
        let w = parseInt(str[3])
        let h = parseInt(str[4])
        // log(str)
        for (var i = 5; i < str.length; i++) {
            let s = str[i].split(' ')
            for (var j = 0; j < s.length; j++) {
                let rgba = s[j]
                // log(rgba)
                let r = ((rgba & 0xff000000) >>> 24)
                let g = ((rgba & 0x00ff0000) >>> 16)
                let b = ((rgba & 0x0000ff00) >>> 8)
                let a = (rgba & 0x000000ff)
                let color = GuaColor.new(r, g, b, a)
                pixels.push(color)
            }
        }
        this.w = w
        this.h = h
        this.pixels = pixels
        log(this.pixels)
    }
}
