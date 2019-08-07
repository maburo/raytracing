const EPSILON = 0.000001;

const v3 = {
  sub(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  },

  subS(v, s) {
    return [v[0] - s, v[1] - s, v[2] - s];
  },

  add(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  },

  mul(v, s) {
    return [v[0] * s, v[1] * s, v[2] * s];
  },

  dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  },

  normilize(vec) {
    const len = v3.mag(vec)
    return [vec[0] / len, vec[1] / len, vec[2] / len];
  },

  mag(vec) {
    return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
  },

  cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[0] * b[2] - a[2] * b[0],
      a[0] * b[1] - a[1] * b[0]
    ];
  }
}
