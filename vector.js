class GuaVector extends GuaObject {
    // 表示二维点的类
    constructor(x, y, z, u, v) {
        super()
        this.x = x
        this.y = y
        this.z = z
        this.u = u
        this.v = v
    }
    interpolate(other, factor) {
        let p1 = this
        let p2 = other
        let p1u = round(p1.u)
        let p1v = round(p1.v)
        let p2u = round(p2.u)
        let p2v = round(p2.v)
        let x = p1.x + (p2.x - p1.x) * factor
        let y = p1.y + (p2.y - p1.y) * factor
        let z = p1.z + (p2.z - p1.z) * factor
        let u = p1u + (p2u - p1u) * factor
        let v = p1v + (p2v - p1v) * factor

        return GuaVector.new(x, y, z, u, v)
    }
    toString() {
        let s = ''
        s += this.x.toFixed(3)
        s += this.y.toFixed(3)
        s += this.z.toFixed(3)
        return s
    }
    multi_num(n) {
        return GuaVector.new(this.x * n, this.y * n, this.z * n)
    }
    sub(v) {
        let x = this.x - v.x
        let y = this.y - v.y
        let z = this.z - v.z
        return GuaVector.new(x, y, z)
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    }
    normalize() {
        let l = this.length()
        if (l == 0) {
            return this
        }
        let factor = 1 / l

        return this.multi_num(factor)
    }
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z
    }
    cross(v) {
        let x = this.y * v.z - this.z * v.y
        let y = this.z * v.x - this.x * v.z
        let z = this.x * v.y - this.y * v.x
        return GuaVector.new(x, y, z)
    }
}
