class Ray {
  constructor() {
    this.origin = [0, 0, 0];
    this.direction = [0, 0, 0];
  }
}

class GeometricObject {
  constructor(color) {
    this.color = color || [1, 1, 1];
  }

  hit() {
    throw new Error('method hit not supported');
  }
}

class ShadeRect {
  constructor(world) {
    this.world = world;
    this.hitAnObject = false;
    this.localHitPoint = [0, 0, 0];
    this.normal = [0, 0, 0];
    this.color = [];
  }
}

class Plane extends GeometricObject {
  constructor(color, origin, normal) {
    super(color);
    this.point = origin || [0, 0, 0];
    this.normal = normal || [0, 0, 0];
  }

  hit(ray, sr) {
    const t = v3.dot(v3.sub(this.point, ray.origin), this.normal) /
      v3.dot(ray.direction, this.normal);

    if (t > EPSILON) {
      sr.t = t;
      sr.normal = this.normal;
      sr.localHitPoint = v3.add(ray.origin, v3.mul(ray.direction, t));
      return true;
    } else {
      return false;
    }
  }
}

class Sphere extends GeometricObject {
  constructor(color, position, radius) {
    super(color);
    this.center = position || [0, 0, 0];
    this.radius = radius || 10;
  }

  hit(ray, sr) {
    var t = 0;
    const temp = v3.sub(ray.origin, this.center);
    const a = v3.dot(ray.direction, ray.direction);
    const b = 2 * v3.dot(ray.direction, temp);
    const c = v3.dot(temp, temp) - this.radius * this.radius;
    const disc = b * b - 4 * a * c;

    if (disc < 0) {
      return false;
    } else {
      const e = Math.sqrt(disc);
      const denom = 2 * a;
      t = (-b - e) / denom;

      if (t > EPSILON) {
        sr.t = t;
        sr.normal = v3.add(temp, v3.mul(ray.direction, t));
        sr.localHitPoint = v3.add(ray.origin, v3.mul(t, ray.direction));
        return true;
      }

      t = (-b + e) / denom;
      if (t > EPSILON) {
        sr.t = t;
        sr.normal = v3.add(temp, v3.mul(ray.direction, t));
        sr.localHitPoint = v3.add(ray.origin, v3.mul(t, ray.direction));
        return true;
      }
    }

    return false;
  }
}

class ViewPlane {
  constructor() {
    this.hres = 0;
    this.vres = 0;
    this.pixelSize = 0;
    this.gamma = 0;
    this.invGamma = 0;
    this.numberOfSamples = 4;
  }
}

class Tracer {
  constructor(world) {
    this.world = world;
  }

  traceRay(ray) {
    return [0, 0, 0];
  }
}

class SingleSphereTracer extends Tracer {
  constructor(world) {
    super(world);
  }

  traceRay(ray) {
    if (this.world.sphere.hit(ray, 0, {})) {
      return this.world.sphere.color;
    } else {
      return [0, 0, 0];
    }
  }
}

class MultipleObjectsTracer extends Tracer {
  constructor(world) {
    super(world);
  }

  traceRay(ray) {
    const sr = this.world.hitBareBonesObject(ray);
    if (sr.hitAnObject) {
      return sr.color;
    } else {
      return this.world.background;
    }
  }
}

class World {
  constructor(canvas) {
    this.canvas = canvas;
    this.viewPlane = new ViewPlane();
    this.background = [0, 0, 0];
    // this.sphere = new Sphere([1, 0, 0], [0, 0, 0], 85);
    // this.tracer = new SingleSphereTracer(this);
    this.tracer = new MultipleObjectsTracer(this);
    this.objects = [];
  }

  addObject(obj) {
    this.objects.push(obj);
  }

  build(hres, vres) {
    this.viewPlane.hres = hres;
    this.viewPlane.vres = vres;
    this.viewPlane.pixelSize = 1;
    this.viewPlane.gamma = 1;
  }

  hitBareBonesObject(ray) {
    const sr = new ShadeRect(this);
    var tmin = Number.MAX_VALUE;
    for (let obj of this.objects) {
      if (obj.hit(ray, sr)) {
        if (sr.t < tmin) {
          sr.hitAnObject = true;
          tmin = sr.t;
          sr.color = obj.color;
        }
      }
    }

    return sr;
  }

  displayPixel(x, y, color) {
    const ctx = this.canvas;
    let p = ctx.createImageData(1, 1);
    const d = p.data;
    d[0] = Math.round(255 * color[0]);
    d[1] = Math.round(255 * color[1]);
    d[2] = Math.round(255 * color[2]);
    d[3] = 255;
    ctx.putImageData(p, x, y);
  }

  render_regular_sampling() {
    const zw = 100;
    const hres = this.viewPlane.hres;
    const vres = this.viewPlane.vres;
    const pixelSize = this.viewPlane.pixelSize;

    const numSamples = this.viewPlane.numberOfSamples;
    const n = Math.sqrt(numSamples);

    let ray = new Ray();
    ray.direction = [0, 0, -1];
    let x = 0;
    let y = 0;

    for (let r = 0; r < vres; r++) {
      for (let c = 0; c < hres; c++) {
        let color = [0, 0, 0];
        var pixelColor = 0;

        for (let p = 0; p < n; p++) {
          for (let q = 0; q < n; q++) {
            y = pixelSize * (c - 0.5 * (hres - 1) + (q + 0.5) / n);
            x = pixelSize * (r - 0.5 * (vres - 1) + (p + 0.5) / n);
            ray.origin = [x, y, zw];
            var tmp = this.tracer.traceRay(ray);
            color[0] += tmp[0];
            color[1] += tmp[1];
            color[2] += tmp[2];
          }
        }

        color[0] /= numSamples;
        color[1] /= numSamples;
        color[2] /= numSamples;
        this.displayPixel(r, c, color);
       }
     }
  }

  render() {
     const zw = 100;
     const hres = this.viewPlane.hres;
     const vres = this.viewPlane.vres;
     const pixelSize = this.viewPlane.pixelSize;

     let color = [0, 0, 0];
     let ray = new Ray();
     ray.direction = [0, 0, -1];
     let x = 0;
     let y = 0;

     for (let r = 0; r < vres; r++) {
       for (let c = 0; c < hres; c++) {
         y = pixelSize * (c - 0.5 * (hres - 1));
         x = pixelSize * (r - 0.5 * (vres - 1));
         ray.origin = [x, y, zw];
         color = this.tracer.traceRay(ray);
         this.displayPixel(r, c, color);
       }
     }
   }
}

const w = new World(document.getElementById("canvas").getContext("2d"));
w.viewPlane.numberOfSamples = 4;
w.build(200, 200);
w.addObject(new Sphere([1, 0, 0], [0, -25, 0], 80));
w.addObject(new Sphere([1, 1, 0], [0, 30, 0], 60));
w.addObject(new Plane([0, .3, 0], [0, 0, 0], [0, 1, 1]));
//w.render();
w.render_regular_sampling();
