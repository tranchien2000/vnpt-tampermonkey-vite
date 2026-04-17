import {
  Component,
  FirebaseError,
  LogLevel,
  Logger,
  SDK_VERSION,
  _getProvider,
  _isFirebaseServerApp,
  _registerComponent,
  _removeServiceInstance,
  createMockUserToken,
  deepEqual,
  getApp,
  getDefaultEmulatorHostnameAndPort,
  getModularInstance,
  isCloudWorkstation,
  pingServer,
  registerVersion
} from "/vendor/.vite-deps-chunk-L2J4APC6.js__v--2dbe45b8.js";
import "/vendor/.vite-deps-chunk-BUSYA2B4.js__v--2dbe45b8.js";

// node_modules/@firebase/webchannel-wrapper/dist/bloom-blob/esm/bloom_blob_es2018.js
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var bloom_blob_es2018 = {};
var Integer;
var Md5;
(function() {
  var h;
  function k2(d2, a) {
    function c() {
    }
    c.prototype = a.prototype;
    d2.F = a.prototype;
    d2.prototype = new c();
    d2.prototype.constructor = d2;
    d2.D = function(f2, e, g2) {
      for (var b2 = Array(arguments.length - 2), r = 2; r < arguments.length; r++) b2[r - 2] = arguments[r];
      return a.prototype[e].apply(f2, b2);
    };
  }
  function l() {
    this.blockSize = -1;
  }
  function m2() {
    this.blockSize = -1;
    this.blockSize = 64;
    this.g = Array(4);
    this.C = Array(this.blockSize);
    this.o = this.h = 0;
    this.u();
  }
  k2(m2, l);
  m2.prototype.u = function() {
    this.g[0] = 1732584193;
    this.g[1] = 4023233417;
    this.g[2] = 2562383102;
    this.g[3] = 271733878;
    this.o = this.h = 0;
  };
  function n(d2, a, c) {
    c || (c = 0);
    const f2 = Array(16);
    if (typeof a === "string") for (var e = 0; e < 16; ++e) f2[e] = a.charCodeAt(c++) | a.charCodeAt(c++) << 8 | a.charCodeAt(c++) << 16 | a.charCodeAt(c++) << 24;
    else for (e = 0; e < 16; ++e) f2[e] = a[c++] | a[c++] << 8 | a[c++] << 16 | a[c++] << 24;
    a = d2.g[0];
    c = d2.g[1];
    e = d2.g[2];
    let g2 = d2.g[3], b2;
    b2 = a + (g2 ^ c & (e ^ g2)) + f2[0] + 3614090360 & 4294967295;
    a = c + (b2 << 7 & 4294967295 | b2 >>> 25);
    b2 = g2 + (e ^ a & (c ^ e)) + f2[1] + 3905402710 & 4294967295;
    g2 = a + (b2 << 12 & 4294967295 | b2 >>> 20);
    b2 = e + (c ^ g2 & (a ^ c)) + f2[2] + 606105819 & 4294967295;
    e = g2 + (b2 << 17 & 4294967295 | b2 >>> 15);
    b2 = c + (a ^ e & (g2 ^ a)) + f2[3] + 3250441966 & 4294967295;
    c = e + (b2 << 22 & 4294967295 | b2 >>> 10);
    b2 = a + (g2 ^ c & (e ^ g2)) + f2[4] + 4118548399 & 4294967295;
    a = c + (b2 << 7 & 4294967295 | b2 >>> 25);
    b2 = g2 + (e ^ a & (c ^ e)) + f2[5] + 1200080426 & 4294967295;
    g2 = a + (b2 << 12 & 4294967295 | b2 >>> 20);
    b2 = e + (c ^ g2 & (a ^ c)) + f2[6] + 2821735955 & 4294967295;
    e = g2 + (b2 << 17 & 4294967295 | b2 >>> 15);
    b2 = c + (a ^ e & (g2 ^ a)) + f2[7] + 4249261313 & 4294967295;
    c = e + (b2 << 22 & 4294967295 | b2 >>> 10);
    b2 = a + (g2 ^ c & (e ^ g2)) + f2[8] + 1770035416 & 4294967295;
    a = c + (b2 << 7 & 4294967295 | b2 >>> 25);
    b2 = g2 + (e ^ a & (c ^ e)) + f2[9] + 2336552879 & 4294967295;
    g2 = a + (b2 << 12 & 4294967295 | b2 >>> 20);
    b2 = e + (c ^ g2 & (a ^ c)) + f2[10] + 4294925233 & 4294967295;
    e = g2 + (b2 << 17 & 4294967295 | b2 >>> 15);
    b2 = c + (a ^ e & (g2 ^ a)) + f2[11] + 2304563134 & 4294967295;
    c = e + (b2 << 22 & 4294967295 | b2 >>> 10);
    b2 = a + (g2 ^ c & (e ^ g2)) + f2[12] + 1804603682 & 4294967295;
    a = c + (b2 << 7 & 4294967295 | b2 >>> 25);
    b2 = g2 + (e ^ a & (c ^ e)) + f2[13] + 4254626195 & 4294967295;
    g2 = a + (b2 << 12 & 4294967295 | b2 >>> 20);
    b2 = e + (c ^ g2 & (a ^ c)) + f2[14] + 2792965006 & 4294967295;
    e = g2 + (b2 << 17 & 4294967295 | b2 >>> 15);
    b2 = c + (a ^ e & (g2 ^ a)) + f2[15] + 1236535329 & 4294967295;
    c = e + (b2 << 22 & 4294967295 | b2 >>> 10);
    b2 = a + (e ^ g2 & (c ^ e)) + f2[1] + 4129170786 & 4294967295;
    a = c + (b2 << 5 & 4294967295 | b2 >>> 27);
    b2 = g2 + (c ^ e & (a ^ c)) + f2[6] + 3225465664 & 4294967295;
    g2 = a + (b2 << 9 & 4294967295 | b2 >>> 23);
    b2 = e + (a ^ c & (g2 ^ a)) + f2[11] + 643717713 & 4294967295;
    e = g2 + (b2 << 14 & 4294967295 | b2 >>> 18);
    b2 = c + (g2 ^ a & (e ^ g2)) + f2[0] + 3921069994 & 4294967295;
    c = e + (b2 << 20 & 4294967295 | b2 >>> 12);
    b2 = a + (e ^ g2 & (c ^ e)) + f2[5] + 3593408605 & 4294967295;
    a = c + (b2 << 5 & 4294967295 | b2 >>> 27);
    b2 = g2 + (c ^ e & (a ^ c)) + f2[10] + 38016083 & 4294967295;
    g2 = a + (b2 << 9 & 4294967295 | b2 >>> 23);
    b2 = e + (a ^ c & (g2 ^ a)) + f2[15] + 3634488961 & 4294967295;
    e = g2 + (b2 << 14 & 4294967295 | b2 >>> 18);
    b2 = c + (g2 ^ a & (e ^ g2)) + f2[4] + 3889429448 & 4294967295;
    c = e + (b2 << 20 & 4294967295 | b2 >>> 12);
    b2 = a + (e ^ g2 & (c ^ e)) + f2[9] + 568446438 & 4294967295;
    a = c + (b2 << 5 & 4294967295 | b2 >>> 27);
    b2 = g2 + (c ^ e & (a ^ c)) + f2[14] + 3275163606 & 4294967295;
    g2 = a + (b2 << 9 & 4294967295 | b2 >>> 23);
    b2 = e + (a ^ c & (g2 ^ a)) + f2[3] + 4107603335 & 4294967295;
    e = g2 + (b2 << 14 & 4294967295 | b2 >>> 18);
    b2 = c + (g2 ^ a & (e ^ g2)) + f2[8] + 1163531501 & 4294967295;
    c = e + (b2 << 20 & 4294967295 | b2 >>> 12);
    b2 = a + (e ^ g2 & (c ^ e)) + f2[13] + 2850285829 & 4294967295;
    a = c + (b2 << 5 & 4294967295 | b2 >>> 27);
    b2 = g2 + (c ^ e & (a ^ c)) + f2[2] + 4243563512 & 4294967295;
    g2 = a + (b2 << 9 & 4294967295 | b2 >>> 23);
    b2 = e + (a ^ c & (g2 ^ a)) + f2[7] + 1735328473 & 4294967295;
    e = g2 + (b2 << 14 & 4294967295 | b2 >>> 18);
    b2 = c + (g2 ^ a & (e ^ g2)) + f2[12] + 2368359562 & 4294967295;
    c = e + (b2 << 20 & 4294967295 | b2 >>> 12);
    b2 = a + (c ^ e ^ g2) + f2[5] + 4294588738 & 4294967295;
    a = c + (b2 << 4 & 4294967295 | b2 >>> 28);
    b2 = g2 + (a ^ c ^ e) + f2[8] + 2272392833 & 4294967295;
    g2 = a + (b2 << 11 & 4294967295 | b2 >>> 21);
    b2 = e + (g2 ^ a ^ c) + f2[11] + 1839030562 & 4294967295;
    e = g2 + (b2 << 16 & 4294967295 | b2 >>> 16);
    b2 = c + (e ^ g2 ^ a) + f2[14] + 4259657740 & 4294967295;
    c = e + (b2 << 23 & 4294967295 | b2 >>> 9);
    b2 = a + (c ^ e ^ g2) + f2[1] + 2763975236 & 4294967295;
    a = c + (b2 << 4 & 4294967295 | b2 >>> 28);
    b2 = g2 + (a ^ c ^ e) + f2[4] + 1272893353 & 4294967295;
    g2 = a + (b2 << 11 & 4294967295 | b2 >>> 21);
    b2 = e + (g2 ^ a ^ c) + f2[7] + 4139469664 & 4294967295;
    e = g2 + (b2 << 16 & 4294967295 | b2 >>> 16);
    b2 = c + (e ^ g2 ^ a) + f2[10] + 3200236656 & 4294967295;
    c = e + (b2 << 23 & 4294967295 | b2 >>> 9);
    b2 = a + (c ^ e ^ g2) + f2[13] + 681279174 & 4294967295;
    a = c + (b2 << 4 & 4294967295 | b2 >>> 28);
    b2 = g2 + (a ^ c ^ e) + f2[0] + 3936430074 & 4294967295;
    g2 = a + (b2 << 11 & 4294967295 | b2 >>> 21);
    b2 = e + (g2 ^ a ^ c) + f2[3] + 3572445317 & 4294967295;
    e = g2 + (b2 << 16 & 4294967295 | b2 >>> 16);
    b2 = c + (e ^ g2 ^ a) + f2[6] + 76029189 & 4294967295;
    c = e + (b2 << 23 & 4294967295 | b2 >>> 9);
    b2 = a + (c ^ e ^ g2) + f2[9] + 3654602809 & 4294967295;
    a = c + (b2 << 4 & 4294967295 | b2 >>> 28);
    b2 = g2 + (a ^ c ^ e) + f2[12] + 3873151461 & 4294967295;
    g2 = a + (b2 << 11 & 4294967295 | b2 >>> 21);
    b2 = e + (g2 ^ a ^ c) + f2[15] + 530742520 & 4294967295;
    e = g2 + (b2 << 16 & 4294967295 | b2 >>> 16);
    b2 = c + (e ^ g2 ^ a) + f2[2] + 3299628645 & 4294967295;
    c = e + (b2 << 23 & 4294967295 | b2 >>> 9);
    b2 = a + (e ^ (c | ~g2)) + f2[0] + 4096336452 & 4294967295;
    a = c + (b2 << 6 & 4294967295 | b2 >>> 26);
    b2 = g2 + (c ^ (a | ~e)) + f2[7] + 1126891415 & 4294967295;
    g2 = a + (b2 << 10 & 4294967295 | b2 >>> 22);
    b2 = e + (a ^ (g2 | ~c)) + f2[14] + 2878612391 & 4294967295;
    e = g2 + (b2 << 15 & 4294967295 | b2 >>> 17);
    b2 = c + (g2 ^ (e | ~a)) + f2[5] + 4237533241 & 4294967295;
    c = e + (b2 << 21 & 4294967295 | b2 >>> 11);
    b2 = a + (e ^ (c | ~g2)) + f2[12] + 1700485571 & 4294967295;
    a = c + (b2 << 6 & 4294967295 | b2 >>> 26);
    b2 = g2 + (c ^ (a | ~e)) + f2[3] + 2399980690 & 4294967295;
    g2 = a + (b2 << 10 & 4294967295 | b2 >>> 22);
    b2 = e + (a ^ (g2 | ~c)) + f2[10] + 4293915773 & 4294967295;
    e = g2 + (b2 << 15 & 4294967295 | b2 >>> 17);
    b2 = c + (g2 ^ (e | ~a)) + f2[1] + 2240044497 & 4294967295;
    c = e + (b2 << 21 & 4294967295 | b2 >>> 11);
    b2 = a + (e ^ (c | ~g2)) + f2[8] + 1873313359 & 4294967295;
    a = c + (b2 << 6 & 4294967295 | b2 >>> 26);
    b2 = g2 + (c ^ (a | ~e)) + f2[15] + 4264355552 & 4294967295;
    g2 = a + (b2 << 10 & 4294967295 | b2 >>> 22);
    b2 = e + (a ^ (g2 | ~c)) + f2[6] + 2734768916 & 4294967295;
    e = g2 + (b2 << 15 & 4294967295 | b2 >>> 17);
    b2 = c + (g2 ^ (e | ~a)) + f2[13] + 1309151649 & 4294967295;
    c = e + (b2 << 21 & 4294967295 | b2 >>> 11);
    b2 = a + (e ^ (c | ~g2)) + f2[4] + 4149444226 & 4294967295;
    a = c + (b2 << 6 & 4294967295 | b2 >>> 26);
    b2 = g2 + (c ^ (a | ~e)) + f2[11] + 3174756917 & 4294967295;
    g2 = a + (b2 << 10 & 4294967295 | b2 >>> 22);
    b2 = e + (a ^ (g2 | ~c)) + f2[2] + 718787259 & 4294967295;
    e = g2 + (b2 << 15 & 4294967295 | b2 >>> 17);
    b2 = c + (g2 ^ (e | ~a)) + f2[9] + 3951481745 & 4294967295;
    d2.g[0] = d2.g[0] + a & 4294967295;
    d2.g[1] = d2.g[1] + (e + (b2 << 21 & 4294967295 | b2 >>> 11)) & 4294967295;
    d2.g[2] = d2.g[2] + e & 4294967295;
    d2.g[3] = d2.g[3] + g2 & 4294967295;
  }
  m2.prototype.v = function(d2, a) {
    a === void 0 && (a = d2.length);
    const c = a - this.blockSize, f2 = this.C;
    let e = this.h, g2 = 0;
    for (; g2 < a; ) {
      if (e == 0) for (; g2 <= c; ) n(this, d2, g2), g2 += this.blockSize;
      if (typeof d2 === "string") for (; g2 < a; ) {
        if (f2[e++] = d2.charCodeAt(g2++), e == this.blockSize) {
          n(this, f2);
          e = 0;
          break;
        }
      }
      else for (; g2 < a; ) if (f2[e++] = d2[g2++], e == this.blockSize) {
        n(this, f2);
        e = 0;
        break;
      }
    }
    this.h = e;
    this.o += a;
  };
  m2.prototype.A = function() {
    var d2 = Array((this.h < 56 ? this.blockSize : this.blockSize * 2) - this.h);
    d2[0] = 128;
    for (var a = 1; a < d2.length - 8; ++a) d2[a] = 0;
    a = this.o * 8;
    for (var c = d2.length - 8; c < d2.length; ++c) d2[c] = a & 255, a /= 256;
    this.v(d2);
    d2 = Array(16);
    a = 0;
    for (c = 0; c < 4; ++c) for (let f2 = 0; f2 < 32; f2 += 8) d2[a++] = this.g[c] >>> f2 & 255;
    return d2;
  };
  function p2(d2, a) {
    var c = q2;
    return Object.prototype.hasOwnProperty.call(c, d2) ? c[d2] : c[d2] = a(d2);
  }
  function t(d2, a) {
    this.h = a;
    const c = [];
    let f2 = true;
    for (let e = d2.length - 1; e >= 0; e--) {
      const g2 = d2[e] | 0;
      f2 && g2 == a || (c[e] = g2, f2 = false);
    }
    this.g = c;
  }
  var q2 = {};
  function u(d2) {
    return -128 <= d2 && d2 < 128 ? p2(d2, function(a) {
      return new t([a | 0], a < 0 ? -1 : 0);
    }) : new t([d2 | 0], d2 < 0 ? -1 : 0);
  }
  function v2(d2) {
    if (isNaN(d2) || !isFinite(d2)) return w2;
    if (d2 < 0) return x2(v2(-d2));
    const a = [];
    let c = 1;
    for (let f2 = 0; d2 >= c; f2++) a[f2] = d2 / c | 0, c *= 4294967296;
    return new t(a, 0);
  }
  function y2(d2, a) {
    if (d2.length == 0) throw Error("number format error: empty string");
    a = a || 10;
    if (a < 2 || 36 < a) throw Error("radix out of range: " + a);
    if (d2.charAt(0) == "-") return x2(y2(d2.substring(1), a));
    if (d2.indexOf("-") >= 0) throw Error('number format error: interior "-" character');
    const c = v2(Math.pow(a, 8));
    let f2 = w2;
    for (let g2 = 0; g2 < d2.length; g2 += 8) {
      var e = Math.min(8, d2.length - g2);
      const b2 = parseInt(d2.substring(g2, g2 + e), a);
      e < 8 ? (e = v2(Math.pow(a, e)), f2 = f2.j(e).add(v2(b2))) : (f2 = f2.j(c), f2 = f2.add(v2(b2)));
    }
    return f2;
  }
  var w2 = u(0), z = u(1), A2 = u(16777216);
  h = t.prototype;
  h.m = function() {
    if (B2(this)) return -x2(this).m();
    let d2 = 0, a = 1;
    for (let c = 0; c < this.g.length; c++) {
      const f2 = this.i(c);
      d2 += (f2 >= 0 ? f2 : 4294967296 + f2) * a;
      a *= 4294967296;
    }
    return d2;
  };
  h.toString = function(d2) {
    d2 = d2 || 10;
    if (d2 < 2 || 36 < d2) throw Error("radix out of range: " + d2);
    if (C2(this)) return "0";
    if (B2(this)) return "-" + x2(this).toString(d2);
    const a = v2(Math.pow(d2, 6));
    var c = this;
    let f2 = "";
    for (; ; ) {
      const e = D2(c, a).g;
      c = F2(c, e.j(a));
      let g2 = ((c.g.length > 0 ? c.g[0] : c.h) >>> 0).toString(d2);
      c = e;
      if (C2(c)) return g2 + f2;
      for (; g2.length < 6; ) g2 = "0" + g2;
      f2 = g2 + f2;
    }
  };
  h.i = function(d2) {
    return d2 < 0 ? 0 : d2 < this.g.length ? this.g[d2] : this.h;
  };
  function C2(d2) {
    if (d2.h != 0) return false;
    for (let a = 0; a < d2.g.length; a++) if (d2.g[a] != 0) return false;
    return true;
  }
  function B2(d2) {
    return d2.h == -1;
  }
  h.l = function(d2) {
    d2 = F2(this, d2);
    return B2(d2) ? -1 : C2(d2) ? 0 : 1;
  };
  function x2(d2) {
    const a = d2.g.length, c = [];
    for (let f2 = 0; f2 < a; f2++) c[f2] = ~d2.g[f2];
    return new t(c, ~d2.h).add(z);
  }
  h.abs = function() {
    return B2(this) ? x2(this) : this;
  };
  h.add = function(d2) {
    const a = Math.max(this.g.length, d2.g.length), c = [];
    let f2 = 0;
    for (let e = 0; e <= a; e++) {
      let g2 = f2 + (this.i(e) & 65535) + (d2.i(e) & 65535), b2 = (g2 >>> 16) + (this.i(e) >>> 16) + (d2.i(e) >>> 16);
      f2 = b2 >>> 16;
      g2 &= 65535;
      b2 &= 65535;
      c[e] = b2 << 16 | g2;
    }
    return new t(c, c[c.length - 1] & -2147483648 ? -1 : 0);
  };
  function F2(d2, a) {
    return d2.add(x2(a));
  }
  h.j = function(d2) {
    if (C2(this) || C2(d2)) return w2;
    if (B2(this)) return B2(d2) ? x2(this).j(x2(d2)) : x2(x2(this).j(d2));
    if (B2(d2)) return x2(this.j(x2(d2)));
    if (this.l(A2) < 0 && d2.l(A2) < 0) return v2(this.m() * d2.m());
    const a = this.g.length + d2.g.length, c = [];
    for (var f2 = 0; f2 < 2 * a; f2++) c[f2] = 0;
    for (f2 = 0; f2 < this.g.length; f2++) for (let e = 0; e < d2.g.length; e++) {
      const g2 = this.i(f2) >>> 16, b2 = this.i(f2) & 65535, r = d2.i(e) >>> 16, E2 = d2.i(e) & 65535;
      c[2 * f2 + 2 * e] += b2 * E2;
      G(c, 2 * f2 + 2 * e);
      c[2 * f2 + 2 * e + 1] += g2 * E2;
      G(c, 2 * f2 + 2 * e + 1);
      c[2 * f2 + 2 * e + 1] += b2 * r;
      G(c, 2 * f2 + 2 * e + 1);
      c[2 * f2 + 2 * e + 2] += g2 * r;
      G(c, 2 * f2 + 2 * e + 2);
    }
    for (d2 = 0; d2 < a; d2++) c[d2] = c[2 * d2 + 1] << 16 | c[2 * d2];
    for (d2 = a; d2 < 2 * a; d2++) c[d2] = 0;
    return new t(c, 0);
  };
  function G(d2, a) {
    for (; (d2[a] & 65535) != d2[a]; ) d2[a + 1] += d2[a] >>> 16, d2[a] &= 65535, a++;
  }
  function H(d2, a) {
    this.g = d2;
    this.h = a;
  }
  function D2(d2, a) {
    if (C2(a)) throw Error("division by zero");
    if (C2(d2)) return new H(w2, w2);
    if (B2(d2)) return a = D2(x2(d2), a), new H(x2(a.g), x2(a.h));
    if (B2(a)) return a = D2(d2, x2(a)), new H(x2(a.g), a.h);
    if (d2.g.length > 30) {
      if (B2(d2) || B2(a)) throw Error("slowDivide_ only works with positive integers.");
      for (var c = z, f2 = a; f2.l(d2) <= 0; ) c = I2(c), f2 = I2(f2);
      var e = J(c, 1), g2 = J(f2, 1);
      f2 = J(f2, 2);
      for (c = J(c, 2); !C2(f2); ) {
        var b2 = g2.add(f2);
        b2.l(d2) <= 0 && (e = e.add(c), g2 = b2);
        f2 = J(f2, 1);
        c = J(c, 1);
      }
      a = F2(d2, e.j(a));
      return new H(e, a);
    }
    for (e = w2; d2.l(a) >= 0; ) {
      c = Math.max(1, Math.floor(d2.m() / a.m()));
      f2 = Math.ceil(Math.log(c) / Math.LN2);
      f2 = f2 <= 48 ? 1 : Math.pow(2, f2 - 48);
      g2 = v2(c);
      for (b2 = g2.j(a); B2(b2) || b2.l(d2) > 0; ) c -= f2, g2 = v2(c), b2 = g2.j(a);
      C2(g2) && (g2 = z);
      e = e.add(g2);
      d2 = F2(d2, b2);
    }
    return new H(e, d2);
  }
  h.B = function(d2) {
    return D2(this, d2).h;
  };
  h.and = function(d2) {
    const a = Math.max(this.g.length, d2.g.length), c = [];
    for (let f2 = 0; f2 < a; f2++) c[f2] = this.i(f2) & d2.i(f2);
    return new t(c, this.h & d2.h);
  };
  h.or = function(d2) {
    const a = Math.max(this.g.length, d2.g.length), c = [];
    for (let f2 = 0; f2 < a; f2++) c[f2] = this.i(f2) | d2.i(f2);
    return new t(c, this.h | d2.h);
  };
  h.xor = function(d2) {
    const a = Math.max(this.g.length, d2.g.length), c = [];
    for (let f2 = 0; f2 < a; f2++) c[f2] = this.i(f2) ^ d2.i(f2);
    return new t(c, this.h ^ d2.h);
  };
  function I2(d2) {
    const a = d2.g.length + 1, c = [];
    for (let f2 = 0; f2 < a; f2++) c[f2] = d2.i(f2) << 1 | d2.i(f2 - 1) >>> 31;
    return new t(c, d2.h);
  }
  function J(d2, a) {
    const c = a >> 5;
    a %= 32;
    const f2 = d2.g.length - c, e = [];
    for (let g2 = 0; g2 < f2; g2++) e[g2] = a > 0 ? d2.i(g2 + c) >>> a | d2.i(g2 + c + 1) << 32 - a : d2.i(g2 + c);
    return new t(e, d2.h);
  }
  m2.prototype.digest = m2.prototype.A;
  m2.prototype.reset = m2.prototype.u;
  m2.prototype.update = m2.prototype.v;
  Md5 = bloom_blob_es2018.Md5 = m2;
  t.prototype.add = t.prototype.add;
  t.prototype.multiply = t.prototype.j;
  t.prototype.modulo = t.prototype.B;
  t.prototype.compare = t.prototype.l;
  t.prototype.toNumber = t.prototype.m;
  t.prototype.toString = t.prototype.toString;
  t.prototype.getBits = t.prototype.i;
  t.fromNumber = v2;
  t.fromString = y2;
  Integer = bloom_blob_es2018.Integer = t;
}).apply(typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});

// node_modules/@firebase/firestore/dist/lite/common-8f39af0f.esm.js
var User = class {
  constructor(e) {
    this.uid = e;
  }
  isAuthenticated() {
    return null != this.uid;
  }
  /**
   * Returns a key representing this user, suitable for inclusion in a
   * dictionary.
   */
  toKey() {
    return this.isAuthenticated() ? "uid:" + this.uid : "anonymous-user";
  }
  isEqual(e) {
    return e.uid === this.uid;
  }
};
User.UNAUTHENTICATED = new User(null), // TODO(mikelehen): Look into getting a proper uid-equivalent for
// non-FirebaseAuth providers.
User.GOOGLE_CREDENTIALS = new User("google-credentials-uid"), User.FIRST_PARTY = new User("first-party-uid"), User.MOCK_USER = new User("mock-user");
var f = "12.12.0";
function __PRIVATE_setSDKVersion(e) {
  f = e;
}
var d = new Logger("@firebase/firestore");
function setLogLevel(e) {
  d.setLogLevel(e);
}
function __PRIVATE_logDebug(e, ...t) {
  if (d.logLevel <= LogLevel.DEBUG) {
    const r = t.map(__PRIVATE_argToString);
    d.debug(`Firestore (${f}): ${e}`, ...r);
  }
}
function __PRIVATE_logError(e, ...t) {
  if (d.logLevel <= LogLevel.ERROR) {
    const r = t.map(__PRIVATE_argToString);
    d.error(`Firestore (${f}): ${e}`, ...r);
  }
}
function __PRIVATE_logWarn(e, ...t) {
  if (d.logLevel <= LogLevel.WARN) {
    const r = t.map(__PRIVATE_argToString);
    d.warn(`Firestore (${f}): ${e}`, ...r);
  }
}
function __PRIVATE_argToString(e) {
  if ("string" == typeof e) return e;
  try {
    return function __PRIVATE_formatJSON(e2) {
      return JSON.stringify(e2);
    }(e);
  } catch (t) {
    return e;
  }
}
function fail(e, t, r) {
  let n = "Unexpected state";
  "string" == typeof t ? n = t : r = t, __PRIVATE__fail(e, n, r);
}
function __PRIVATE__fail(e, t, r) {
  let n = `FIRESTORE (${f}) INTERNAL ASSERTION FAILED: ${t} (ID: ${e.toString(16)})`;
  if (void 0 !== r) try {
    n += " CONTEXT: " + JSON.stringify(r);
  } catch (e2) {
    n += " CONTEXT: " + r;
  }
  throw __PRIVATE_logError(n), new Error(n);
}
function __PRIVATE_hardAssert(e, t, r, n) {
  let i = "Unexpected state";
  "string" == typeof r ? i = r : n = r, e || __PRIVATE__fail(t, i, n);
}
function __PRIVATE_debugCast(e, t) {
  return e;
}
var E = {
  // Causes are copied from:
  // https://github.com/grpc/grpc/blob/bceec94ea4fc5f0085d81235d8e1c06798dc341a/include/grpc%2B%2B/impl/codegen/status_code_enum.h
  /** Not an error; returned on success. */
  OK: "ok",
  /** The operation was cancelled (typically by the caller). */
  CANCELLED: "cancelled",
  /** Unknown error or an error from a different error domain. */
  UNKNOWN: "unknown",
  /**
   * Client specified an invalid argument. Note that this differs from
   * FAILED_PRECONDITION. INVALID_ARGUMENT indicates arguments that are
   * problematic regardless of the state of the system (e.g., a malformed file
   * name).
   */
  INVALID_ARGUMENT: "invalid-argument",
  /**
   * Deadline expired before operation could complete. For operations that
   * change the state of the system, this error may be returned even if the
   * operation has completed successfully. For example, a successful response
   * from a server could have been delayed long enough for the deadline to
   * expire.
   */
  DEADLINE_EXCEEDED: "deadline-exceeded",
  /** Some requested entity (e.g., file or directory) was not found. */
  NOT_FOUND: "not-found",
  /**
   * Some entity that we attempted to create (e.g., file or directory) already
   * exists.
   */
  ALREADY_EXISTS: "already-exists",
  /**
   * The caller does not have permission to execute the specified operation.
   * PERMISSION_DENIED must not be used for rejections caused by exhausting
   * some resource (use RESOURCE_EXHAUSTED instead for those errors).
   * PERMISSION_DENIED must not be used if the caller cannot be identified
   * (use UNAUTHENTICATED instead for those errors).
   */
  PERMISSION_DENIED: "permission-denied",
  /**
   * The request does not have valid authentication credentials for the
   * operation.
   */
  UNAUTHENTICATED: "unauthenticated",
  /**
   * Some resource has been exhausted, perhaps a per-user quota, or perhaps the
   * entire file system is out of space.
   */
  RESOURCE_EXHAUSTED: "resource-exhausted",
  /**
   * Operation was rejected because the system is not in a state required for
   * the operation's execution. For example, directory to be deleted may be
   * non-empty, an rmdir operation is applied to a non-directory, etc.
   *
   * A litmus test that may help a service implementor in deciding
   * between FAILED_PRECONDITION, ABORTED, and UNAVAILABLE:
   *  (a) Use UNAVAILABLE if the client can retry just the failing call.
   *  (b) Use ABORTED if the client should retry at a higher-level
   *      (e.g., restarting a read-modify-write sequence).
   *  (c) Use FAILED_PRECONDITION if the client should not retry until
   *      the system state has been explicitly fixed. E.g., if an "rmdir"
   *      fails because the directory is non-empty, FAILED_PRECONDITION
   *      should be returned since the client should not retry unless
   *      they have first fixed up the directory by deleting files from it.
   *  (d) Use FAILED_PRECONDITION if the client performs conditional
   *      REST Get/Update/Delete on a resource and the resource on the
   *      server does not match the condition. E.g., conflicting
   *      read-modify-write on the same resource.
   */
  FAILED_PRECONDITION: "failed-precondition",
  /**
   * The operation was aborted, typically due to a concurrency issue like
   * sequencer check failures, transaction aborts, etc.
   *
   * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
   * and UNAVAILABLE.
   */
  ABORTED: "aborted",
  /**
   * Operation was attempted past the valid range. E.g., seeking or reading
   * past end of file.
   *
   * Unlike INVALID_ARGUMENT, this error indicates a problem that may be fixed
   * if the system state changes. For example, a 32-bit file system will
   * generate INVALID_ARGUMENT if asked to read at an offset that is not in the
   * range [0,2^32-1], but it will generate OUT_OF_RANGE if asked to read from
   * an offset past the current file size.
   *
   * There is a fair bit of overlap between FAILED_PRECONDITION and
   * OUT_OF_RANGE. We recommend using OUT_OF_RANGE (the more specific error)
   * when it applies so that callers who are iterating through a space can
   * easily look for an OUT_OF_RANGE error to detect when they are done.
   */
  OUT_OF_RANGE: "out-of-range",
  /** Operation is not implemented or not supported/enabled in this service. */
  UNIMPLEMENTED: "unimplemented",
  /**
   * Internal errors. Means some invariants expected by underlying System has
   * been broken. If you see one of these errors, Something is very broken.
   */
  INTERNAL: "internal",
  /**
   * The service is currently unavailable. This is a most likely a transient
   * condition and may be corrected by retrying with a backoff.
   *
   * See litmus test above for deciding between FAILED_PRECONDITION, ABORTED,
   * and UNAVAILABLE.
   */
  UNAVAILABLE: "unavailable",
  /** Unrecoverable data loss or corruption. */
  DATA_LOSS: "data-loss"
};
var FirestoreError = class extends FirebaseError {
  /** @hideconstructor */
  constructor(e, t) {
    super(e, t), this.code = e, this.message = t, // HACK: We write a toString property directly because Error is not a real
    // class and so inheritance does not work correctly. We could alternatively
    // do the same "back-door inheritance" trick that FirebaseError does.
    this.toString = () => `${this.name}: [code=${this.code}]: ${this.message}`;
  }
};
var __PRIVATE_OAuthToken = class {
  constructor(e, t) {
    this.user = t, this.type = "OAuth", this.headers = /* @__PURE__ */ new Map(), this.headers.set("Authorization", `Bearer ${e}`);
  }
};
var __PRIVATE_EmptyAuthCredentialsProvider = class {
  getToken() {
    return Promise.resolve(null);
  }
  invalidateToken() {
  }
  start(e, t) {
    e.enqueueRetryable(() => t(User.UNAUTHENTICATED));
  }
  shutdown() {
  }
};
var __PRIVATE_EmulatorAuthCredentialsProvider = class {
  constructor(e) {
    this.token = e, /**
     * Stores the listener registered with setChangeListener()
     * This isn't actually necessary since the UID never changes, but we use this
     * to verify the listen contract is adhered to in tests.
     */
    this.changeListener = null;
  }
  getToken() {
    return Promise.resolve(this.token);
  }
  invalidateToken() {
  }
  start(e, t) {
    this.changeListener = t, // Fire with initial user.
    e.enqueueRetryable(() => t(this.token.user));
  }
  shutdown() {
    this.changeListener = null;
  }
};
var __PRIVATE_LiteAuthCredentialsProvider = class {
  constructor(e) {
    this.auth = null, e.onInit((e2) => {
      this.auth = e2;
    });
  }
  getToken() {
    return this.auth ? this.auth.getToken().then((e) => e ? (__PRIVATE_hardAssert("string" == typeof e.accessToken, 42297, {
      t: e
    }), new __PRIVATE_OAuthToken(e.accessToken, new User(this.auth.getUid()))) : null) : Promise.resolve(null);
  }
  invalidateToken() {
  }
  start(e, t) {
  }
  shutdown() {
  }
};
var __PRIVATE_FirstPartyToken = class {
  constructor(e, t, r) {
    this.i = e, this.o = t, this.u = r, this.type = "FirstParty", this.user = User.FIRST_PARTY, this.l = /* @__PURE__ */ new Map();
  }
  /**
   * Gets an authorization token, using a provided factory function, or return
   * null.
   */
  h() {
    return this.u ? this.u() : null;
  }
  get headers() {
    this.l.set("X-Goog-AuthUser", this.i);
    const e = this.h();
    return e && this.l.set("Authorization", e), this.o && this.l.set("X-Goog-Iam-Authorization-Token", this.o), this.l;
  }
};
var __PRIVATE_FirstPartyAuthCredentialsProvider = class {
  constructor(e, t, r) {
    this.i = e, this.o = t, this.u = r;
  }
  getToken() {
    return Promise.resolve(new __PRIVATE_FirstPartyToken(this.i, this.o, this.u));
  }
  start(e, t) {
    e.enqueueRetryable(() => t(User.FIRST_PARTY));
  }
  shutdown() {
  }
  invalidateToken() {
  }
};
var AppCheckToken = class {
  constructor(e) {
    this.value = e, this.type = "AppCheck", this.headers = /* @__PURE__ */ new Map(), e && e.length > 0 && this.headers.set("x-firebase-appcheck", this.value);
  }
};
var __PRIVATE_LiteAppCheckTokenProvider = class {
  constructor(e, t) {
    this.m = t, this.appCheck = null, this.P = null, _isFirebaseServerApp(e) && e.settings.appCheckToken && (this.P = e.settings.appCheckToken), t.onInit((e2) => {
      this.appCheck = e2;
    });
  }
  getToken() {
    return this.P ? Promise.resolve(new AppCheckToken(this.P)) : this.appCheck ? this.appCheck.getToken().then((e) => e ? (__PRIVATE_hardAssert("string" == typeof e.token, 3470, {
      tokenResult: e
    }), new AppCheckToken(e.token)) : null) : Promise.resolve(null);
  }
  invalidateToken() {
  }
  start(e, t) {
  }
  shutdown() {
  }
};
var DatabaseInfo = class {
  /**
   * Constructs a DatabaseInfo using the provided host, databaseId and
   * persistenceKey.
   *
   * @param databaseId - The database to use.
   * @param appId - The Firebase App Id.
   * @param persistenceKey - A unique identifier for this Firestore's local
   * storage (used in conjunction with the databaseId).
   * @param host - The Firestore backend host to connect to.
   * @param ssl - Whether to use SSL when connecting.
   * @param forceLongPolling - Whether to use the forceLongPolling option
   * when using WebChannel as the network transport.
   * @param autoDetectLongPolling - Whether to use the detectBufferingProxy
   * option when using WebChannel as the network transport.
   * @param longPollingOptions - Options that configure long-polling.
   * @param useFetchStreams - Whether to use the Fetch API instead of
   * XMLHTTPRequest
   */
  constructor(e, t, r, n, i, s, o, a, u, _, c) {
    this.databaseId = e, this.appId = t, this.persistenceKey = r, this.host = n, this.ssl = i, this.forceLongPolling = s, this.autoDetectLongPolling = o, this.longPollingOptions = a, this.useFetchStreams = u, this.isUsingEmulator = _, this.apiKey = c;
  }
};
var m = "(default)";
var DatabaseId = class _DatabaseId {
  constructor(e, t) {
    this.projectId = e, this.database = t || m;
  }
  static empty() {
    return new _DatabaseId("", "");
  }
  get isDefaultDatabase() {
    return this.database === m;
  }
  isEqual(e) {
    return e instanceof _DatabaseId && e.projectId === this.projectId && e.database === this.database;
  }
};
function __PRIVATE_databaseIdFromApp(e, t) {
  if (!Object.prototype.hasOwnProperty.apply(e.options, ["projectId"])) throw new FirestoreError(E.INVALID_ARGUMENT, '"projectId" not provided in firebase.initializeApp.');
  return new DatabaseId(e.options.projectId, t);
}
function __PRIVATE_randomBytes(e) {
  const t = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "undefined" != typeof self && (self.crypto || self.msCrypto)
  ), r = new Uint8Array(e);
  if (t && "function" == typeof t.getRandomValues) t.getRandomValues(r);
  else
    for (let t2 = 0; t2 < e; t2++) r[t2] = Math.floor(256 * Math.random());
  return r;
}
var __PRIVATE_AutoId = class {
  static newId() {
    const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", t = 62 * Math.floor(256 / 62);
    let r = "";
    for (; r.length < 20; ) {
      const n = __PRIVATE_randomBytes(40);
      for (let i = 0; i < n.length; ++i)
        r.length < 20 && n[i] < t && (r += e.charAt(n[i] % 62));
    }
    return r;
  }
};
function __PRIVATE_primitiveComparator(e, t) {
  return e < t ? -1 : e > t ? 1 : 0;
}
function __PRIVATE_compareUtf8Strings(e, t) {
  const r = Math.min(e.length, t.length);
  for (let n = 0; n < r; n++) {
    const r2 = e.charAt(n), i = t.charAt(n);
    if (r2 !== i) return __PRIVATE_isSurrogate(r2) === __PRIVATE_isSurrogate(i) ? __PRIVATE_primitiveComparator(r2, i) : __PRIVATE_isSurrogate(r2) ? 1 : -1;
  }
  return __PRIVATE_primitiveComparator(e.length, t.length);
}
var P = 55296;
var T = 57343;
function __PRIVATE_isSurrogate(e) {
  const t = e.charCodeAt(0);
  return t >= P && t <= T;
}
function __PRIVATE_arrayEquals(e, t, r) {
  return e.length === t.length && e.every((e2, n) => r(e2, t[n]));
}
var R = "__name__";
var BasePath = class _BasePath {
  constructor(e, t, r) {
    void 0 === t ? t = 0 : t > e.length && fail(637, {
      offset: t,
      range: e.length
    }), void 0 === r ? r = e.length - t : r > e.length - t && fail(1746, {
      length: r,
      range: e.length - t
    }), this.segments = e, this.offset = t, this.len = r;
  }
  get length() {
    return this.len;
  }
  isEqual(e) {
    return 0 === _BasePath.comparator(this, e);
  }
  child(e) {
    const t = this.segments.slice(this.offset, this.limit());
    return e instanceof _BasePath ? e.forEach((e2) => {
      t.push(e2);
    }) : t.push(e), this.construct(t);
  }
  /** The index of one past the last segment of the path. */
  limit() {
    return this.offset + this.length;
  }
  popFirst(e) {
    return e = void 0 === e ? 1 : e, this.construct(this.segments, this.offset + e, this.length - e);
  }
  popLast() {
    return this.construct(this.segments, this.offset, this.length - 1);
  }
  firstSegment() {
    return this.segments[this.offset];
  }
  lastSegment() {
    return this.get(this.length - 1);
  }
  get(e) {
    return this.segments[this.offset + e];
  }
  isEmpty() {
    return 0 === this.length;
  }
  isPrefixOf(e) {
    if (e.length < this.length) return false;
    for (let t = 0; t < this.length; t++) if (this.get(t) !== e.get(t)) return false;
    return true;
  }
  isImmediateParentOf(e) {
    if (this.length + 1 !== e.length) return false;
    for (let t = 0; t < this.length; t++) if (this.get(t) !== e.get(t)) return false;
    return true;
  }
  forEach(e) {
    for (let t = this.offset, r = this.limit(); t < r; t++) e(this.segments[t]);
  }
  toArray() {
    return this.segments.slice(this.offset, this.limit());
  }
  /**
   * Compare 2 paths segment by segment, prioritizing numeric IDs
   * (e.g., "__id123__") in numeric ascending order, followed by string
   * segments in lexicographical order.
   */
  static comparator(e, t) {
    const r = Math.min(e.length, t.length);
    for (let n = 0; n < r; n++) {
      const r2 = _BasePath.compareSegments(e.get(n), t.get(n));
      if (0 !== r2) return r2;
    }
    return __PRIVATE_primitiveComparator(e.length, t.length);
  }
  static compareSegments(e, t) {
    const r = _BasePath.isNumericId(e), n = _BasePath.isNumericId(t);
    return r && !n ? -1 : !r && n ? 1 : r && n ? _BasePath.extractNumericId(e).compare(_BasePath.extractNumericId(t)) : __PRIVATE_compareUtf8Strings(e, t);
  }
  // Checks if a segment is a numeric ID (starts with "__id" and ends with "__").
  static isNumericId(e) {
    return e.startsWith("__id") && e.endsWith("__");
  }
  static extractNumericId(e) {
    return Integer.fromString(e.substring(4, e.length - 2));
  }
};
var ResourcePath = class _ResourcePath extends BasePath {
  construct(e, t, r) {
    return new _ResourcePath(e, t, r);
  }
  canonicalString() {
    return this.toArray().join("/");
  }
  toString() {
    return this.canonicalString();
  }
  /**
   * Returns a string representation of this path
   * where each path segment has been encoded with
   * `encodeURIComponent`.
   */
  toUriEncodedString() {
    return this.toArray().map(encodeURIComponent).join("/");
  }
  /**
   * Creates a resource path from the given slash-delimited string. If multiple
   * arguments are provided, all components are combined. Leading and trailing
   * slashes from all components are ignored.
   */
  static fromString(...e) {
    const t = [];
    for (const r of e) {
      if (r.indexOf("//") >= 0) throw new FirestoreError(E.INVALID_ARGUMENT, `Invalid segment (${r}). Paths must not contain // in them.`);
      t.push(...r.split("/").filter((e2) => e2.length > 0));
    }
    return new _ResourcePath(t);
  }
  static emptyPath() {
    return new _ResourcePath([]);
  }
};
var V = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
var FieldPath$1 = class _FieldPath$1 extends BasePath {
  construct(e, t, r) {
    return new _FieldPath$1(e, t, r);
  }
  /**
   * Returns true if the string could be used as a segment in a field path
   * without escaping.
   */
  static isValidIdentifier(e) {
    return V.test(e);
  }
  canonicalString() {
    return this.toArray().map((e) => (e = e.replace(/\\/g, "\\\\").replace(/`/g, "\\`"), _FieldPath$1.isValidIdentifier(e) || (e = "`" + e + "`"), e)).join(".");
  }
  toString() {
    return this.canonicalString();
  }
  /**
   * Returns true if this field references the key of a document.
   */
  isKeyField() {
    return 1 === this.length && this.get(0) === R;
  }
  /**
   * The field designating the key of a document.
   */
  static keyField() {
    return new _FieldPath$1([R]);
  }
  /**
   * Parses a field string from the given server-formatted string.
   *
   * - Splitting the empty string is not allowed (for now at least).
   * - Empty segments within the string (e.g. if there are two consecutive
   *   separators) are not allowed.
   *
   * TODO(b/37244157): we should make this more strict. Right now, it allows
   * non-identifier path components, even if they aren't escaped.
   */
  static fromServerFormat(e) {
    const t = [];
    let r = "", n = 0;
    const __PRIVATE_addCurrentSegment = () => {
      if (0 === r.length) throw new FirestoreError(E.INVALID_ARGUMENT, `Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);
      t.push(r), r = "";
    };
    let i = false;
    for (; n < e.length; ) {
      const t2 = e[n];
      if ("\\" === t2) {
        if (n + 1 === e.length) throw new FirestoreError(E.INVALID_ARGUMENT, "Path has trailing escape character: " + e);
        const t3 = e[n + 1];
        if ("\\" !== t3 && "." !== t3 && "`" !== t3) throw new FirestoreError(E.INVALID_ARGUMENT, "Path has invalid escape sequence: " + e);
        r += t3, n += 2;
      } else "`" === t2 ? (i = !i, n++) : "." !== t2 || i ? (r += t2, n++) : (__PRIVATE_addCurrentSegment(), n++);
    }
    if (__PRIVATE_addCurrentSegment(), i) throw new FirestoreError(E.INVALID_ARGUMENT, "Unterminated ` in path: " + e);
    return new _FieldPath$1(t);
  }
  static emptyPath() {
    return new _FieldPath$1([]);
  }
};
var DocumentKey = class _DocumentKey {
  constructor(e) {
    this.path = e;
  }
  static fromPath(e) {
    return new _DocumentKey(ResourcePath.fromString(e));
  }
  static fromName(e) {
    return new _DocumentKey(ResourcePath.fromString(e).popFirst(5));
  }
  static empty() {
    return new _DocumentKey(ResourcePath.emptyPath());
  }
  get collectionGroup() {
    return this.path.popLast().lastSegment();
  }
  /** Returns true if the document is in the specified collectionId. */
  hasCollectionId(e) {
    return this.path.length >= 2 && this.path.get(this.path.length - 2) === e;
  }
  /** Returns the collection group (i.e. the name of the parent collection) for this key. */
  getCollectionGroup() {
    return this.path.get(this.path.length - 2);
  }
  /** Returns the fully qualified path to the parent collection. */
  getCollectionPath() {
    return this.path.popLast();
  }
  isEqual(e) {
    return null !== e && 0 === ResourcePath.comparator(this.path, e.path);
  }
  toString() {
    return this.path.toString();
  }
  static comparator(e, t) {
    return ResourcePath.comparator(e.path, t.path);
  }
  static isDocumentKey(e) {
    return e.length % 2 == 0;
  }
  /**
   * Creates and returns a new document key with the given segments.
   *
   * @param segments - The segments of the path to the document
   * @returns A new instance of DocumentKey
   */
  static fromSegments(e) {
    return new _DocumentKey(new ResourcePath(e.slice()));
  }
};
function __PRIVATE_validateNonEmptyArgument(e, t, r) {
  if (!r) throw new FirestoreError(E.INVALID_ARGUMENT, `Function ${e}() cannot be called with an empty ${t}.`);
}
function __PRIVATE_validateDocumentPath(e) {
  if (!DocumentKey.isDocumentKey(e)) throw new FirestoreError(E.INVALID_ARGUMENT, `Invalid document reference. Document references must have an even number of segments, but ${e} has ${e.length}.`);
}
function __PRIVATE_validateCollectionPath(e) {
  if (DocumentKey.isDocumentKey(e)) throw new FirestoreError(E.INVALID_ARGUMENT, `Invalid collection reference. Collection references must have an odd number of segments, but ${e} has ${e.length}.`);
}
function __PRIVATE_isPlainObject(e) {
  return "object" == typeof e && null !== e && (Object.getPrototypeOf(e) === Object.prototype || null === Object.getPrototypeOf(e));
}
function __PRIVATE_valueDescription(e) {
  if (void 0 === e) return "undefined";
  if (null === e) return "null";
  if ("string" == typeof e) return e.length > 20 && (e = `${e.substring(0, 20)}...`), JSON.stringify(e);
  if ("number" == typeof e || "boolean" == typeof e) return "" + e;
  if ("object" == typeof e) {
    if (e instanceof Array) return "an array";
    {
      const t = (
        /** try to get the constructor name for an object. */
        function __PRIVATE_tryGetCustomObjectType(e2) {
          if (e2.constructor) return e2.constructor.name;
          return null;
        }(e)
      );
      return t ? `a custom ${t} object` : "an object";
    }
  }
  return "function" == typeof e ? "a function" : fail(12329, {
    type: typeof e
  });
}
function __PRIVATE_cast(e, t) {
  if ("_delegate" in e && // Unwrap Compat types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (e = e._delegate), !(e instanceof t)) {
    if (t.name === e.constructor.name) throw new FirestoreError(E.INVALID_ARGUMENT, "Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");
    {
      const r = __PRIVATE_valueDescription(e);
      throw new FirestoreError(E.INVALID_ARGUMENT, `Expected type '${t.name}', but it was: ${r}`);
    }
  }
  return e;
}
function __PRIVATE_validatePositiveNumber(e, t) {
  if (t <= 0) throw new FirestoreError(E.INVALID_ARGUMENT, `Function ${e}() requires a positive number, but it was: ${t}.`);
}
function __PRIVATE_cloneLongPollingOptions(e) {
  const t = {};
  return void 0 !== e.timeoutSeconds && (t.timeoutSeconds = e.timeoutSeconds), t;
}
var A = null;
function __PRIVATE_generateUniqueDebugId() {
  return null === A ? A = function __PRIVATE_generateInitialUniqueDebugId() {
    return 268435456 + Math.round(2147483648 * Math.random());
  }() : A++, "0x" + A.toString(16);
}
function __PRIVATE_isNullOrUndefined(e) {
  return null == e;
}
function __PRIVATE_isNegativeZero(e) {
  return 0 === e && 1 / e == -1 / 0;
}
var I = "RestConnection";
var p = {
  BatchGetDocuments: "batchGet",
  Commit: "commit",
  RunQuery: "runQuery",
  RunAggregationQuery: "runAggregationQuery",
  ExecutePipeline: "executePipeline"
};
var __PRIVATE_RestConnection = class {
  get T() {
    return false;
  }
  constructor(e) {
    this.databaseInfo = e, this.databaseId = e.databaseId;
    const t = e.ssl ? "https" : "http", r = encodeURIComponent(this.databaseId.projectId), n = encodeURIComponent(this.databaseId.database);
    this.R = t + "://" + e.host, this.V = `projects/${r}/databases/${n}`, this.A = this.databaseId.database === m ? `project_id=${r}` : `project_id=${r}&database_id=${n}`;
  }
  I(e, r, n, i, s) {
    const o = __PRIVATE_generateUniqueDebugId(), a = this.p(e, r.toUriEncodedString());
    __PRIVATE_logDebug(I, `Sending RPC '${e}' ${o}:`, a, n);
    const u = {
      "google-cloud-resource-prefix": this.V,
      "x-goog-request-params": this.A
    };
    this.F(u, i, s);
    const { host: _ } = new URL(a), c = isCloudWorkstation(_);
    return this.v(e, a, u, n, c).then((t) => (__PRIVATE_logDebug(I, `Received RPC '${e}' ${o}: `, t), t), (t) => {
      throw __PRIVATE_logWarn(I, `RPC '${e}' ${o} failed with error: `, t, "url: ", a, "request:", n), t;
    });
  }
  D(e, t, r, n, i, s) {
    return this.I(e, t, r, n, i);
  }
  /**
   * Modifies the headers for a request, adding any authorization token if
   * present and any additional headers for the request.
   */
  F(e, t, r) {
    e["X-Goog-Api-Client"] = // SDK_VERSION is updated to different value at runtime depending on the entry point,
    // so we need to get its value when we need it in a function.
    function __PRIVATE_getGoogApiClientValue() {
      return "gl-js/ fire/" + f;
    }(), // Content-Type: text/plain will avoid preflight requests which might
    // mess with CORS and redirects by proxies. If we add custom headers
    // we will need to change this code to potentially use the $httpOverwrite
    // parameter supported by ESF to avoid triggering preflight requests.
    e["Content-Type"] = "text/plain", this.databaseInfo.appId && (e["X-Firebase-GMPID"] = this.databaseInfo.appId), t && t.headers.forEach((t2, r2) => e[r2] = t2), r && r.headers.forEach((t2, r2) => e[r2] = t2);
  }
  p(e, t) {
    const r = p[e];
    let n = `${this.R}/v1/${t}:${r}`;
    return this.databaseInfo.apiKey && (n = `${n}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`), n;
  }
  /**
   * Closes and cleans up any resources associated with the connection. This
   * implementation is a no-op because there are no resources associated
   * with the RestConnection that need to be cleaned up.
   */
  terminate() {
  }
};
var y;
var w;
function __PRIVATE_isPermanentError(e) {
  switch (e) {
    case E.OK:
      return fail(64938);
    case E.CANCELLED:
    case E.UNKNOWN:
    case E.DEADLINE_EXCEEDED:
    case E.RESOURCE_EXHAUSTED:
    case E.INTERNAL:
    case E.UNAVAILABLE:
    case E.UNAUTHENTICATED:
      return false;
    case E.INVALID_ARGUMENT:
    case E.NOT_FOUND:
    case E.ALREADY_EXISTS:
    case E.PERMISSION_DENIED:
    case E.FAILED_PRECONDITION:
    case E.ABORTED:
    case E.OUT_OF_RANGE:
    case E.UNIMPLEMENTED:
    case E.DATA_LOSS:
      return true;
    default:
      return fail(15467, {
        code: e
      });
  }
}
function __PRIVATE_mapCodeFromHttpStatus(e) {
  if (void 0 === e) return __PRIVATE_logError("RPC_ERROR", "HTTP error has no status"), E.UNKNOWN;
  switch (e) {
    case 200:
      return E.OK;
    case 400:
      return E.FAILED_PRECONDITION;
    case 401:
      return E.UNAUTHENTICATED;
    case 403:
      return E.PERMISSION_DENIED;
    case 404:
      return E.NOT_FOUND;
    case 409:
      return E.ABORTED;
    case 416:
      return E.OUT_OF_RANGE;
    case 429:
      return E.RESOURCE_EXHAUSTED;
    case 499:
      return E.CANCELLED;
    case 500:
      return E.UNKNOWN;
    case 501:
      return E.UNIMPLEMENTED;
    case 503:
      return E.UNAVAILABLE;
    case 504:
      return E.DEADLINE_EXCEEDED;
    default:
      return e >= 200 && e < 300 ? E.OK : e >= 400 && e < 500 ? E.FAILED_PRECONDITION : e >= 500 && e < 600 ? E.INTERNAL : E.UNKNOWN;
  }
}
(w = y || (y = {}))[w.OK = 0] = "OK", w[w.CANCELLED = 1] = "CANCELLED", w[w.UNKNOWN = 2] = "UNKNOWN", w[w.INVALID_ARGUMENT = 3] = "INVALID_ARGUMENT", w[w.DEADLINE_EXCEEDED = 4] = "DEADLINE_EXCEEDED", w[w.NOT_FOUND = 5] = "NOT_FOUND", w[w.ALREADY_EXISTS = 6] = "ALREADY_EXISTS", w[w.PERMISSION_DENIED = 7] = "PERMISSION_DENIED", w[w.UNAUTHENTICATED = 16] = "UNAUTHENTICATED", w[w.RESOURCE_EXHAUSTED = 8] = "RESOURCE_EXHAUSTED", w[w.FAILED_PRECONDITION = 9] = "FAILED_PRECONDITION", w[w.ABORTED = 10] = "ABORTED", w[w.OUT_OF_RANGE = 11] = "OUT_OF_RANGE", w[w.UNIMPLEMENTED = 12] = "UNIMPLEMENTED", w[w.INTERNAL = 13] = "INTERNAL", w[w.UNAVAILABLE = 14] = "UNAVAILABLE", w[w.DATA_LOSS = 15] = "DATA_LOSS";
var __PRIVATE_FetchConnection = class extends __PRIVATE_RestConnection {
  S(e, t) {
    throw new Error("Not supported by FetchConnection");
  }
  async v(e, t, r, n, i) {
    var _a;
    const s = JSON.stringify(n);
    let o;
    try {
      const e2 = {
        method: "POST",
        headers: r,
        body: s
      };
      i && (e2.credentials = "include"), o = await fetch(t, e2);
    } catch (e2) {
      const t2 = e2;
      throw new FirestoreError(__PRIVATE_mapCodeFromHttpStatus(t2.status), "Request failed with error: " + t2.statusText);
    }
    if (!o.ok) {
      let e2 = await o.json();
      Array.isArray(e2) && (e2 = e2[0]);
      const t2 = (_a = e2 == null ? void 0 : e2.error) == null ? void 0 : _a.message;
      throw new FirestoreError(__PRIVATE_mapCodeFromHttpStatus(o.status), `Request failed with error: ${t2 ?? o.statusText}`);
    }
    return o.json();
  }
};
function __PRIVATE_objectSize(e) {
  let t = 0;
  for (const r in e) Object.prototype.hasOwnProperty.call(e, r) && t++;
  return t;
}
function forEach(e, t) {
  for (const r in e) Object.prototype.hasOwnProperty.call(e, r) && t(r, e[r]);
}
function __PRIVATE_mapToArray(e, t) {
  const r = [];
  for (const n in e) Object.prototype.hasOwnProperty.call(e, n) && r.push(t(e[n], n, e));
  return r;
}
var __PRIVATE_Base64DecodeError = class extends Error {
  constructor() {
    super(...arguments), this.name = "Base64DecodeError";
  }
};
var ByteString = class _ByteString {
  constructor(e) {
    this.binaryString = e;
  }
  static fromBase64String(e) {
    const t = function __PRIVATE_decodeBase64(e2) {
      try {
        return atob(e2);
      } catch (e3) {
        throw "undefined" != typeof DOMException && e3 instanceof DOMException ? new __PRIVATE_Base64DecodeError("Invalid base64 string: " + e3) : e3;
      }
    }(e);
    return new _ByteString(t);
  }
  static fromUint8Array(e) {
    const t = (
      /**
      * Helper function to convert an Uint8array to a binary string.
      */
      function __PRIVATE_binaryStringFromUint8Array(e2) {
        let t2 = "";
        for (let r = 0; r < e2.length; ++r) t2 += String.fromCharCode(e2[r]);
        return t2;
      }(e)
    );
    return new _ByteString(t);
  }
  [Symbol.iterator]() {
    let e = 0;
    return {
      next: () => e < this.binaryString.length ? {
        value: this.binaryString.charCodeAt(e++),
        done: false
      } : {
        value: void 0,
        done: true
      }
    };
  }
  toBase64() {
    return function __PRIVATE_encodeBase64(e) {
      return btoa(e);
    }(this.binaryString);
  }
  toUint8Array() {
    return function __PRIVATE_uint8ArrayFromBinaryString(e) {
      const t = new Uint8Array(e.length);
      for (let r = 0; r < e.length; r++) t[r] = e.charCodeAt(r);
      return t;
    }(this.binaryString);
  }
  approximateByteSize() {
    return 2 * this.binaryString.length;
  }
  compareTo(e) {
    return __PRIVATE_primitiveComparator(this.binaryString, e.binaryString);
  }
  isEqual(e) {
    return this.binaryString === e.binaryString;
  }
};
ByteString.EMPTY_BYTE_STRING = new ByteString("");
var g = new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);
function __PRIVATE_normalizeTimestamp(e) {
  if (__PRIVATE_hardAssert(!!e, 39018), "string" == typeof e) {
    let t = 0;
    const r = g.exec(e);
    if (__PRIVATE_hardAssert(!!r, 46558, {
      timestamp: e
    }), r[1]) {
      let e2 = r[1];
      e2 = (e2 + "000000000").substr(0, 9), t = Number(e2);
    }
    const n = new Date(e);
    return {
      seconds: Math.floor(n.getTime() / 1e3),
      nanos: t
    };
  }
  return {
    seconds: __PRIVATE_normalizeNumber(e.seconds),
    nanos: __PRIVATE_normalizeNumber(e.nanos)
  };
}
function __PRIVATE_normalizeNumber(e) {
  return "number" == typeof e ? e : "string" == typeof e ? Number(e) : 0;
}
function __PRIVATE_normalizeByteString(e) {
  return "string" == typeof e ? ByteString.fromBase64String(e) : ByteString.fromUint8Array(e);
}
function property(e, t) {
  const r = {
    typeString: e
  };
  return t && (r.value = t), r;
}
function __PRIVATE_validateJSON(e, t) {
  if (!__PRIVATE_isPlainObject(e)) throw new FirestoreError(E.INVALID_ARGUMENT, "JSON must be an object");
  let r;
  for (const n in t) if (t[n]) {
    const i = t[n].typeString, s = "value" in t[n] ? {
      value: t[n].value
    } : void 0;
    if (!(n in e)) {
      r = `JSON missing required field: '${n}'`;
      break;
    }
    const o = e[n];
    if (i && typeof o !== i) {
      r = `JSON field '${n}' must be a ${i}.`;
      break;
    }
    if (void 0 !== s && o !== s.value) {
      r = `Expected '${n}' field to equal '${s.value}'`;
      break;
    }
  }
  if (r) throw new FirestoreError(E.INVALID_ARGUMENT, r);
  return true;
}
var F = -62135596800;
var v = 1e6;
var Timestamp = class _Timestamp {
  /**
   * Creates a new timestamp with the current date, with millisecond precision.
   *
   * @returns a new timestamp representing the current date.
   */
  static now() {
    return _Timestamp.fromMillis(Date.now());
  }
  /**
   * Creates a new timestamp from the given date.
   *
   * @param date - The date to initialize the `Timestamp` from.
   * @returns A new `Timestamp` representing the same point in time as the given
   *     date.
   */
  static fromDate(e) {
    return _Timestamp.fromMillis(e.getTime());
  }
  /**
   * Creates a new timestamp from the given number of milliseconds.
   *
   * @param milliseconds - Number of milliseconds since Unix epoch
   *     1970-01-01T00:00:00Z.
   * @returns A new `Timestamp` representing the same point in time as the given
   *     number of milliseconds.
   */
  static fromMillis(e) {
    const t = Math.floor(e / 1e3), r = Math.floor((e - 1e3 * t) * v);
    return new _Timestamp(t, r);
  }
  /**
   * Creates a new timestamp.
   *
   * @param seconds - The number of seconds of UTC time since Unix epoch
   *     1970-01-01T00:00:00Z. Must be from 0001-01-01T00:00:00Z to
   *     9999-12-31T23:59:59Z inclusive.
   * @param nanoseconds - The non-negative fractions of a second at nanosecond
   *     resolution. Negative second values with fractions must still have
   *     non-negative nanoseconds values that count forward in time. Must be
   *     from 0 to 999,999,999 inclusive.
   */
  constructor(e, t) {
    if (this.seconds = e, this.nanoseconds = t, t < 0) throw new FirestoreError(E.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + t);
    if (t >= 1e9) throw new FirestoreError(E.INVALID_ARGUMENT, "Timestamp nanoseconds out of range: " + t);
    if (e < F) throw new FirestoreError(E.INVALID_ARGUMENT, "Timestamp seconds out of range: " + e);
    if (e >= 253402300800) throw new FirestoreError(E.INVALID_ARGUMENT, "Timestamp seconds out of range: " + e);
  }
  /**
   * Converts a `Timestamp` to a JavaScript `Date` object. This conversion
   * causes a loss of precision since `Date` objects only support millisecond
   * precision.
   *
   * @returns JavaScript `Date` object representing the same point in time as
   *     this `Timestamp`, with millisecond precision.
   */
  toDate() {
    return new Date(this.toMillis());
  }
  /**
   * Converts a `Timestamp` to a numeric timestamp (in milliseconds since
   * epoch). This operation causes a loss of precision.
   *
   * @returns The point in time corresponding to this timestamp, represented as
   *     the number of milliseconds since Unix epoch 1970-01-01T00:00:00Z.
   */
  toMillis() {
    return 1e3 * this.seconds + this.nanoseconds / v;
  }
  _compareTo(e) {
    return this.seconds === e.seconds ? __PRIVATE_primitiveComparator(this.nanoseconds, e.nanoseconds) : __PRIVATE_primitiveComparator(this.seconds, e.seconds);
  }
  /**
   * Returns true if this `Timestamp` is equal to the provided one.
   *
   * @param other - The `Timestamp` to compare against.
   * @returns true if this `Timestamp` is equal to the provided one.
   */
  isEqual(e) {
    return e.seconds === this.seconds && e.nanoseconds === this.nanoseconds;
  }
  /** Returns a textual representation of this `Timestamp`. */
  toString() {
    return "Timestamp(seconds=" + this.seconds + ", nanoseconds=" + this.nanoseconds + ")";
  }
  /**
   * Returns a JSON-serializable representation of this `Timestamp`.
   */
  toJSON() {
    return {
      type: _Timestamp._jsonSchemaVersion,
      seconds: this.seconds,
      nanoseconds: this.nanoseconds
    };
  }
  /**
   * Builds a `Timestamp` instance from a JSON object created by {@link Timestamp.toJSON}.
   */
  static fromJSON(e) {
    if (__PRIVATE_validateJSON(e, _Timestamp._jsonSchema)) return new _Timestamp(e.seconds, e.nanoseconds);
  }
  /**
   * Converts this object to a primitive string, which allows `Timestamp` objects
   * to be compared using the `>`, `<=`, `>=` and `>` operators.
   */
  valueOf() {
    const e = this.seconds - F;
    return String(e).padStart(12, "0") + "." + String(this.nanoseconds).padStart(9, "0");
  }
};
Timestamp._jsonSchemaVersion = "firestore/timestamp/1.0", Timestamp._jsonSchema = {
  type: property("string", Timestamp._jsonSchemaVersion),
  seconds: property("number"),
  nanoseconds: property("number")
};
function __PRIVATE_isServerTimestamp(e) {
  var _a, _b;
  const t = (_b = (((_a = e == null ? void 0 : e.mapValue) == null ? void 0 : _a.fields) || {}).__type__) == null ? void 0 : _b.stringValue;
  return "server_timestamp" === t;
}
function __PRIVATE_getPreviousValue(e) {
  const t = e.mapValue.fields.__previous_value__;
  return __PRIVATE_isServerTimestamp(t) ? __PRIVATE_getPreviousValue(t) : t;
}
function __PRIVATE_getLocalWriteTime(e) {
  const t = __PRIVATE_normalizeTimestamp(e.mapValue.fields.__local_write_time__.timestampValue);
  return new Timestamp(t.seconds, t.nanos);
}
var b = "__type__";
var D = "__max__";
var S = {
  fields: {
    __type__: {
      stringValue: D
    }
  }
};
var C = "__vector__";
var N = "value";
function __PRIVATE_typeOrder(e) {
  return "nullValue" in e ? 0 : "booleanValue" in e ? 1 : "integerValue" in e || "doubleValue" in e ? 2 : "timestampValue" in e ? 3 : "stringValue" in e ? 5 : "bytesValue" in e ? 6 : "referenceValue" in e ? 7 : "geoPointValue" in e ? 8 : "arrayValue" in e ? 9 : "mapValue" in e ? __PRIVATE_isServerTimestamp(e) ? 4 : (
    /** Returns true if the Value represents the canonical {@link #MAX_VALUE} . */
    function __PRIVATE_isMaxValue(e2) {
      return (((e2.mapValue || {}).fields || {}).__type__ || {}).stringValue === D;
    }(e) ? 9007199254740991 : (
      /** Returns true if `value` is a VetorValue. */
      function __PRIVATE_isVectorValue(e2) {
        var _a, _b;
        const t = (_b = (((_a = e2 == null ? void 0 : e2.mapValue) == null ? void 0 : _a.fields) || {})[b]) == null ? void 0 : _b.stringValue;
        return t === C;
      }(e) ? 10 : 11
    )
  ) : fail(28295, {
    value: e
  });
}
function __PRIVATE_valueEquals(e, t) {
  if (e === t) return true;
  const r = __PRIVATE_typeOrder(e);
  if (r !== __PRIVATE_typeOrder(t)) return false;
  switch (r) {
    case 0:
    case 9007199254740991:
      return true;
    case 1:
      return e.booleanValue === t.booleanValue;
    case 4:
      return __PRIVATE_getLocalWriteTime(e).isEqual(__PRIVATE_getLocalWriteTime(t));
    case 3:
      return function __PRIVATE_timestampEquals(e2, t2) {
        if ("string" == typeof e2.timestampValue && "string" == typeof t2.timestampValue && e2.timestampValue.length === t2.timestampValue.length)
          return e2.timestampValue === t2.timestampValue;
        const r2 = __PRIVATE_normalizeTimestamp(e2.timestampValue), n = __PRIVATE_normalizeTimestamp(t2.timestampValue);
        return r2.seconds === n.seconds && r2.nanos === n.nanos;
      }(e, t);
    case 5:
      return e.stringValue === t.stringValue;
    case 6:
      return function __PRIVATE_blobEquals(e2, t2) {
        return __PRIVATE_normalizeByteString(e2.bytesValue).isEqual(__PRIVATE_normalizeByteString(t2.bytesValue));
      }(e, t);
    case 7:
      return e.referenceValue === t.referenceValue;
    case 8:
      return function __PRIVATE_geoPointEquals(e2, t2) {
        return __PRIVATE_normalizeNumber(e2.geoPointValue.latitude) === __PRIVATE_normalizeNumber(t2.geoPointValue.latitude) && __PRIVATE_normalizeNumber(e2.geoPointValue.longitude) === __PRIVATE_normalizeNumber(t2.geoPointValue.longitude);
      }(e, t);
    case 2:
      return function __PRIVATE_numberEquals(e2, t2) {
        if ("integerValue" in e2 && "integerValue" in t2) return __PRIVATE_normalizeNumber(e2.integerValue) === __PRIVATE_normalizeNumber(t2.integerValue);
        if ("doubleValue" in e2 && "doubleValue" in t2) {
          const r2 = __PRIVATE_normalizeNumber(e2.doubleValue), n = __PRIVATE_normalizeNumber(t2.doubleValue);
          return r2 === n ? __PRIVATE_isNegativeZero(r2) === __PRIVATE_isNegativeZero(n) : isNaN(r2) && isNaN(n);
        }
        return false;
      }(e, t);
    case 9:
      return __PRIVATE_arrayEquals(e.arrayValue.values || [], t.arrayValue.values || [], __PRIVATE_valueEquals);
    case 10:
    case 11:
      return function __PRIVATE_objectEquals(e2, t2) {
        const r2 = e2.mapValue.fields || {}, n = t2.mapValue.fields || {};
        if (__PRIVATE_objectSize(r2) !== __PRIVATE_objectSize(n)) return false;
        for (const e3 in r2) if (r2.hasOwnProperty(e3) && (void 0 === n[e3] || !__PRIVATE_valueEquals(r2[e3], n[e3]))) return false;
        return true;
      }(e, t);
    default:
      return fail(52216, {
        left: e
      });
  }
}
function __PRIVATE_arrayValueContains(e, t) {
  return void 0 !== (e.values || []).find((e2) => __PRIVATE_valueEquals(e2, t));
}
function __PRIVATE_valueCompare(e, t) {
  if (e === t) return 0;
  const r = __PRIVATE_typeOrder(e), n = __PRIVATE_typeOrder(t);
  if (r !== n) return __PRIVATE_primitiveComparator(r, n);
  switch (r) {
    case 0:
    case 9007199254740991:
      return 0;
    case 1:
      return __PRIVATE_primitiveComparator(e.booleanValue, t.booleanValue);
    case 2:
      return function __PRIVATE_compareNumbers(e2, t2) {
        const r2 = __PRIVATE_normalizeNumber(e2.integerValue || e2.doubleValue), n2 = __PRIVATE_normalizeNumber(t2.integerValue || t2.doubleValue);
        return r2 < n2 ? -1 : r2 > n2 ? 1 : r2 === n2 ? 0 : (
          // one or both are NaN.
          isNaN(r2) ? isNaN(n2) ? 0 : -1 : 1
        );
      }(e, t);
    case 3:
      return __PRIVATE_compareTimestamps(e.timestampValue, t.timestampValue);
    case 4:
      return __PRIVATE_compareTimestamps(__PRIVATE_getLocalWriteTime(e), __PRIVATE_getLocalWriteTime(t));
    case 5:
      return __PRIVATE_compareUtf8Strings(e.stringValue, t.stringValue);
    case 6:
      return function __PRIVATE_compareBlobs(e2, t2) {
        const r2 = __PRIVATE_normalizeByteString(e2), n2 = __PRIVATE_normalizeByteString(t2);
        return r2.compareTo(n2);
      }(e.bytesValue, t.bytesValue);
    case 7:
      return function __PRIVATE_compareReferences(e2, t2) {
        const r2 = e2.split("/"), n2 = t2.split("/");
        for (let e3 = 0; e3 < r2.length && e3 < n2.length; e3++) {
          const t3 = __PRIVATE_primitiveComparator(r2[e3], n2[e3]);
          if (0 !== t3) return t3;
        }
        return __PRIVATE_primitiveComparator(r2.length, n2.length);
      }(e.referenceValue, t.referenceValue);
    case 8:
      return function __PRIVATE_compareGeoPoints(e2, t2) {
        const r2 = __PRIVATE_primitiveComparator(__PRIVATE_normalizeNumber(e2.latitude), __PRIVATE_normalizeNumber(t2.latitude));
        if (0 !== r2) return r2;
        return __PRIVATE_primitiveComparator(__PRIVATE_normalizeNumber(e2.longitude), __PRIVATE_normalizeNumber(t2.longitude));
      }(e.geoPointValue, t.geoPointValue);
    case 9:
      return __PRIVATE_compareArrays(e.arrayValue, t.arrayValue);
    case 10:
      return function __PRIVATE_compareVectors(e2, t2) {
        var _a, _b, _c, _d;
        const r2 = e2.fields || {}, n2 = t2.fields || {}, i = (_a = r2[N]) == null ? void 0 : _a.arrayValue, s = (_b = n2[N]) == null ? void 0 : _b.arrayValue, o = __PRIVATE_primitiveComparator(((_c = i == null ? void 0 : i.values) == null ? void 0 : _c.length) || 0, ((_d = s == null ? void 0 : s.values) == null ? void 0 : _d.length) || 0);
        if (0 !== o) return o;
        return __PRIVATE_compareArrays(i, s);
      }(e.mapValue, t.mapValue);
    case 11:
      return function __PRIVATE_compareMaps(e2, t2) {
        if (e2 === S && t2 === S) return 0;
        if (e2 === S) return 1;
        if (t2 === S) return -1;
        const r2 = e2.fields || {}, n2 = Object.keys(r2), i = t2.fields || {}, s = Object.keys(i);
        n2.sort(), s.sort();
        for (let e3 = 0; e3 < n2.length && e3 < s.length; ++e3) {
          const t3 = __PRIVATE_compareUtf8Strings(n2[e3], s[e3]);
          if (0 !== t3) return t3;
          const o = __PRIVATE_valueCompare(r2[n2[e3]], i[s[e3]]);
          if (0 !== o) return o;
        }
        return __PRIVATE_primitiveComparator(n2.length, s.length);
      }(e.mapValue, t.mapValue);
    default:
      throw fail(23264, {
        C: r
      });
  }
}
function __PRIVATE_compareTimestamps(e, t) {
  if ("string" == typeof e && "string" == typeof t && e.length === t.length) return __PRIVATE_primitiveComparator(e, t);
  const r = __PRIVATE_normalizeTimestamp(e), n = __PRIVATE_normalizeTimestamp(t), i = __PRIVATE_primitiveComparator(r.seconds, n.seconds);
  return 0 !== i ? i : __PRIVATE_primitiveComparator(r.nanos, n.nanos);
}
function __PRIVATE_compareArrays(e, t) {
  const r = e.values || [], n = t.values || [];
  for (let e2 = 0; e2 < r.length && e2 < n.length; ++e2) {
    const t2 = __PRIVATE_valueCompare(r[e2], n[e2]);
    if (t2) return t2;
  }
  return __PRIVATE_primitiveComparator(r.length, n.length);
}
function __PRIVATE_refValue(e, t) {
  return {
    referenceValue: `projects/${e.projectId}/databases/${e.database}/documents/${t.path.canonicalString()}`
  };
}
function isArray(e) {
  return !!e && "arrayValue" in e;
}
function __PRIVATE_isNullValue(e) {
  return !!e && "nullValue" in e;
}
function __PRIVATE_isNanValue(e) {
  return !!e && "doubleValue" in e && isNaN(Number(e.doubleValue));
}
function __PRIVATE_isMapValue(e) {
  return !!e && "mapValue" in e;
}
function __PRIVATE_deepClone(e) {
  if (e.geoPointValue) return {
    geoPointValue: {
      ...e.geoPointValue
    }
  };
  if (e.timestampValue && "object" == typeof e.timestampValue) return {
    timestampValue: {
      ...e.timestampValue
    }
  };
  if (e.mapValue) {
    const t = {
      mapValue: {
        fields: {}
      }
    };
    return forEach(e.mapValue.fields, (e2, r) => t.mapValue.fields[e2] = __PRIVATE_deepClone(r)), t;
  }
  if (e.arrayValue) {
    const t = {
      arrayValue: {
        values: []
      }
    };
    for (let r = 0; r < (e.arrayValue.values || []).length; ++r) t.arrayValue.values[r] = __PRIVATE_deepClone(e.arrayValue.values[r]);
    return t;
  }
  return {
    ...e
  };
}
var Bound = class {
  constructor(e, t) {
    this.position = e, this.inclusive = t;
  }
};
function __PRIVATE_boundEquals(e, t) {
  if (null === e) return null === t;
  if (null === t) return false;
  if (e.inclusive !== t.inclusive || e.position.length !== t.position.length) return false;
  for (let r = 0; r < e.position.length; r++) {
    if (!__PRIVATE_valueEquals(e.position[r], t.position[r])) return false;
  }
  return true;
}
var Filter = class {
};
var FieldFilter = class _FieldFilter extends Filter {
  constructor(e, t, r) {
    super(), this.field = e, this.op = t, this.value = r;
  }
  /**
   * Creates a filter based on the provided arguments.
   */
  static create(e, t, r) {
    return e.isKeyField() ? "in" === t || "not-in" === t ? this.createKeyFieldInFilter(e, t, r) : new __PRIVATE_KeyFieldFilter(e, t, r) : "array-contains" === t ? new __PRIVATE_ArrayContainsFilter(e, r) : "in" === t ? new __PRIVATE_InFilter(e, r) : "not-in" === t ? new __PRIVATE_NotInFilter(e, r) : "array-contains-any" === t ? new __PRIVATE_ArrayContainsAnyFilter(e, r) : new _FieldFilter(e, t, r);
  }
  static createKeyFieldInFilter(e, t, r) {
    return "in" === t ? new __PRIVATE_KeyFieldInFilter(e, r) : new __PRIVATE_KeyFieldNotInFilter(e, r);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return "!=" === this.op ? null !== t && void 0 === t.nullValue && this.matchesComparison(__PRIVATE_valueCompare(t, this.value)) : null !== t && __PRIVATE_typeOrder(this.value) === __PRIVATE_typeOrder(t) && this.matchesComparison(__PRIVATE_valueCompare(t, this.value));
  }
  matchesComparison(e) {
    switch (this.op) {
      case "<":
        return e < 0;
      case "<=":
        return e <= 0;
      case "==":
        return 0 === e;
      case "!=":
        return 0 !== e;
      case ">":
        return e > 0;
      case ">=":
        return e >= 0;
      default:
        return fail(47266, {
          operator: this.op
        });
    }
  }
  isInequality() {
    return [
      "<",
      "<=",
      ">",
      ">=",
      "!=",
      "not-in"
      /* Operator.NOT_IN */
    ].indexOf(this.op) >= 0;
  }
  getFlattenedFilters() {
    return [this];
  }
  getFilters() {
    return [this];
  }
};
var CompositeFilter = class _CompositeFilter extends Filter {
  constructor(e, t) {
    super(), this.filters = e, this.op = t, this.N = null;
  }
  /**
   * Creates a filter based on the provided arguments.
   */
  static create(e, t) {
    return new _CompositeFilter(e, t);
  }
  matches(e) {
    return function __PRIVATE_compositeFilterIsConjunction(e2) {
      return "and" === e2.op;
    }(this) ? void 0 === this.filters.find((t) => !t.matches(e)) : void 0 !== this.filters.find((t) => t.matches(e));
  }
  getFlattenedFilters() {
    return null !== this.N || (this.N = this.filters.reduce((e, t) => e.concat(t.getFlattenedFilters()), [])), this.N;
  }
  // Returns a mutable copy of `this.filters`
  getFilters() {
    return Object.assign([], this.filters);
  }
};
function __PRIVATE_filterEquals(e, t) {
  return e instanceof FieldFilter ? function __PRIVATE_fieldFilterEquals(e2, t2) {
    return t2 instanceof FieldFilter && e2.op === t2.op && e2.field.isEqual(t2.field) && __PRIVATE_valueEquals(e2.value, t2.value);
  }(e, t) : e instanceof CompositeFilter ? function __PRIVATE_compositeFilterEquals(e2, t2) {
    if (t2 instanceof CompositeFilter && e2.op === t2.op && e2.filters.length === t2.filters.length) {
      return e2.filters.reduce((e3, r, n) => e3 && __PRIVATE_filterEquals(r, t2.filters[n]), true);
    }
    return false;
  }(e, t) : void fail(19439);
}
var __PRIVATE_KeyFieldFilter = class extends FieldFilter {
  constructor(e, t, r) {
    super(e, t, r), this.key = DocumentKey.fromName(r.referenceValue);
  }
  matches(e) {
    const t = DocumentKey.comparator(e.key, this.key);
    return this.matchesComparison(t);
  }
};
var __PRIVATE_KeyFieldInFilter = class extends FieldFilter {
  constructor(e, t) {
    super(e, "in", t), this.keys = __PRIVATE_extractDocumentKeysFromArrayValue("in", t);
  }
  matches(e) {
    return this.keys.some((t) => t.isEqual(e.key));
  }
};
var __PRIVATE_KeyFieldNotInFilter = class extends FieldFilter {
  constructor(e, t) {
    super(e, "not-in", t), this.keys = __PRIVATE_extractDocumentKeysFromArrayValue("not-in", t);
  }
  matches(e) {
    return !this.keys.some((t) => t.isEqual(e.key));
  }
};
function __PRIVATE_extractDocumentKeysFromArrayValue(e, t) {
  var _a;
  return (((_a = t.arrayValue) == null ? void 0 : _a.values) || []).map((e2) => DocumentKey.fromName(e2.referenceValue));
}
var __PRIVATE_ArrayContainsFilter = class extends FieldFilter {
  constructor(e, t) {
    super(e, "array-contains", t);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return isArray(t) && __PRIVATE_arrayValueContains(t.arrayValue, this.value);
  }
};
var __PRIVATE_InFilter = class extends FieldFilter {
  constructor(e, t) {
    super(e, "in", t);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return null !== t && __PRIVATE_arrayValueContains(this.value.arrayValue, t);
  }
};
var __PRIVATE_NotInFilter = class extends FieldFilter {
  constructor(e, t) {
    super(e, "not-in", t);
  }
  matches(e) {
    if (__PRIVATE_arrayValueContains(this.value.arrayValue, {
      nullValue: "NULL_VALUE"
    })) return false;
    const t = e.data.field(this.field);
    return null !== t && void 0 === t.nullValue && !__PRIVATE_arrayValueContains(this.value.arrayValue, t);
  }
};
var __PRIVATE_ArrayContainsAnyFilter = class extends FieldFilter {
  constructor(e, t) {
    super(e, "array-contains-any", t);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return !(!isArray(t) || !t.arrayValue.values) && t.arrayValue.values.some((e2) => __PRIVATE_arrayValueContains(this.value.arrayValue, e2));
  }
};
var OrderBy = class {
  constructor(e, t = "asc") {
    this.field = e, this.dir = t;
  }
};
function __PRIVATE_orderByEquals(e, t) {
  return e.dir === t.dir && e.field.isEqual(t.field);
}
var SnapshotVersion = class _SnapshotVersion {
  static fromTimestamp(e) {
    return new _SnapshotVersion(e);
  }
  static min() {
    return new _SnapshotVersion(new Timestamp(0, 0));
  }
  static max() {
    return new _SnapshotVersion(new Timestamp(253402300799, 999999999));
  }
  constructor(e) {
    this.timestamp = e;
  }
  compareTo(e) {
    return this.timestamp._compareTo(e.timestamp);
  }
  isEqual(e) {
    return this.timestamp.isEqual(e.timestamp);
  }
  /** Returns a number representation of the version for use in spec tests. */
  toMicroseconds() {
    return 1e6 * this.timestamp.seconds + this.timestamp.nanoseconds / 1e3;
  }
  toString() {
    return "SnapshotVersion(" + this.timestamp.toString() + ")";
  }
  toTimestamp() {
    return this.timestamp;
  }
};
var SortedMap = class _SortedMap {
  constructor(e, t) {
    this.comparator = e, this.root = t || LLRBNode.EMPTY;
  }
  // Returns a copy of the map, with the specified key/value added or replaced.
  insert(e, t) {
    return new _SortedMap(this.comparator, this.root.insert(e, t, this.comparator).copy(null, null, LLRBNode.BLACK, null, null));
  }
  // Returns a copy of the map, with the specified key removed.
  remove(e) {
    return new _SortedMap(this.comparator, this.root.remove(e, this.comparator).copy(null, null, LLRBNode.BLACK, null, null));
  }
  // Returns the value of the node with the given key, or null.
  get(e) {
    let t = this.root;
    for (; !t.isEmpty(); ) {
      const r = this.comparator(e, t.key);
      if (0 === r) return t.value;
      r < 0 ? t = t.left : r > 0 && (t = t.right);
    }
    return null;
  }
  // Returns the index of the element in this sorted map, or -1 if it doesn't
  // exist.
  indexOf(e) {
    let t = 0, r = this.root;
    for (; !r.isEmpty(); ) {
      const n = this.comparator(e, r.key);
      if (0 === n) return t + r.left.size;
      n < 0 ? r = r.left : (
        // Count all nodes left of the node plus the node itself
        (t += r.left.size + 1, r = r.right)
      );
    }
    return -1;
  }
  isEmpty() {
    return this.root.isEmpty();
  }
  // Returns the total number of nodes in the map.
  get size() {
    return this.root.size;
  }
  // Returns the minimum key in the map.
  minKey() {
    return this.root.minKey();
  }
  // Returns the maximum key in the map.
  maxKey() {
    return this.root.maxKey();
  }
  // Traverses the map in key order and calls the specified action function
  // for each key/value pair. If action returns true, traversal is aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  inorderTraversal(e) {
    return this.root.inorderTraversal(e);
  }
  forEach(e) {
    this.inorderTraversal((t, r) => (e(t, r), false));
  }
  toString() {
    const e = [];
    return this.inorderTraversal((t, r) => (e.push(`${t}:${r}`), false)), `{${e.join(", ")}}`;
  }
  // Traverses the map in reverse key order and calls the specified action
  // function for each key/value pair. If action returns true, traversal is
  // aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  reverseTraversal(e) {
    return this.root.reverseTraversal(e);
  }
  // Returns an iterator over the SortedMap.
  getIterator() {
    return new SortedMapIterator(this.root, null, this.comparator, false);
  }
  getIteratorFrom(e) {
    return new SortedMapIterator(this.root, e, this.comparator, false);
  }
  getReverseIterator() {
    return new SortedMapIterator(this.root, null, this.comparator, true);
  }
  getReverseIteratorFrom(e) {
    return new SortedMapIterator(this.root, e, this.comparator, true);
  }
};
var SortedMapIterator = class {
  constructor(e, t, r, n) {
    this.isReverse = n, this.nodeStack = [];
    let i = 1;
    for (; !e.isEmpty(); ) if (i = t ? r(e.key, t) : 1, // flip the comparison if we're going in reverse
    t && n && (i *= -1), i < 0)
      e = this.isReverse ? e.left : e.right;
    else {
      if (0 === i) {
        this.nodeStack.push(e);
        break;
      }
      this.nodeStack.push(e), e = this.isReverse ? e.right : e.left;
    }
  }
  getNext() {
    let e = this.nodeStack.pop();
    const t = {
      key: e.key,
      value: e.value
    };
    if (this.isReverse) for (e = e.left; !e.isEmpty(); ) this.nodeStack.push(e), e = e.right;
    else for (e = e.right; !e.isEmpty(); ) this.nodeStack.push(e), e = e.left;
    return t;
  }
  hasNext() {
    return this.nodeStack.length > 0;
  }
  peek() {
    if (0 === this.nodeStack.length) return null;
    const e = this.nodeStack[this.nodeStack.length - 1];
    return {
      key: e.key,
      value: e.value
    };
  }
};
var LLRBNode = class _LLRBNode {
  constructor(e, t, r, n, i) {
    this.key = e, this.value = t, this.color = null != r ? r : _LLRBNode.RED, this.left = null != n ? n : _LLRBNode.EMPTY, this.right = null != i ? i : _LLRBNode.EMPTY, this.size = this.left.size + 1 + this.right.size;
  }
  // Returns a copy of the current node, optionally replacing pieces of it.
  copy(e, t, r, n, i) {
    return new _LLRBNode(null != e ? e : this.key, null != t ? t : this.value, null != r ? r : this.color, null != n ? n : this.left, null != i ? i : this.right);
  }
  isEmpty() {
    return false;
  }
  // Traverses the tree in key order and calls the specified action function
  // for each node. If action returns true, traversal is aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  inorderTraversal(e) {
    return this.left.inorderTraversal(e) || e(this.key, this.value) || this.right.inorderTraversal(e);
  }
  // Traverses the tree in reverse key order and calls the specified action
  // function for each node. If action returns true, traversal is aborted.
  // Returns the first truthy value returned by action, or the last falsey
  // value returned by action.
  reverseTraversal(e) {
    return this.right.reverseTraversal(e) || e(this.key, this.value) || this.left.reverseTraversal(e);
  }
  // Returns the minimum node in the tree.
  min() {
    return this.left.isEmpty() ? this : this.left.min();
  }
  // Returns the maximum key in the tree.
  minKey() {
    return this.min().key;
  }
  // Returns the maximum key in the tree.
  maxKey() {
    return this.right.isEmpty() ? this.key : this.right.maxKey();
  }
  // Returns new tree, with the key/value added.
  insert(e, t, r) {
    let n = this;
    const i = r(e, n.key);
    return n = i < 0 ? n.copy(null, null, null, n.left.insert(e, t, r), null) : 0 === i ? n.copy(null, t, null, null, null) : n.copy(null, null, null, null, n.right.insert(e, t, r)), n.fixUp();
  }
  removeMin() {
    if (this.left.isEmpty()) return _LLRBNode.EMPTY;
    let e = this;
    return e.left.isRed() || e.left.left.isRed() || (e = e.moveRedLeft()), e = e.copy(null, null, null, e.left.removeMin(), null), e.fixUp();
  }
  // Returns new tree, with the specified item removed.
  remove(e, t) {
    let r, n = this;
    if (t(e, n.key) < 0) n.left.isEmpty() || n.left.isRed() || n.left.left.isRed() || (n = n.moveRedLeft()), n = n.copy(null, null, null, n.left.remove(e, t), null);
    else {
      if (n.left.isRed() && (n = n.rotateRight()), n.right.isEmpty() || n.right.isRed() || n.right.left.isRed() || (n = n.moveRedRight()), 0 === t(e, n.key)) {
        if (n.right.isEmpty()) return _LLRBNode.EMPTY;
        r = n.right.min(), n = n.copy(r.key, r.value, null, null, n.right.removeMin());
      }
      n = n.copy(null, null, null, null, n.right.remove(e, t));
    }
    return n.fixUp();
  }
  isRed() {
    return this.color;
  }
  // Returns new tree after performing any needed rotations.
  fixUp() {
    let e = this;
    return e.right.isRed() && !e.left.isRed() && (e = e.rotateLeft()), e.left.isRed() && e.left.left.isRed() && (e = e.rotateRight()), e.left.isRed() && e.right.isRed() && (e = e.colorFlip()), e;
  }
  moveRedLeft() {
    let e = this.colorFlip();
    return e.right.left.isRed() && (e = e.copy(null, null, null, null, e.right.rotateRight()), e = e.rotateLeft(), e = e.colorFlip()), e;
  }
  moveRedRight() {
    let e = this.colorFlip();
    return e.left.left.isRed() && (e = e.rotateRight(), e = e.colorFlip()), e;
  }
  rotateLeft() {
    const e = this.copy(null, null, _LLRBNode.RED, null, this.right.left);
    return this.right.copy(null, null, this.color, e, null);
  }
  rotateRight() {
    const e = this.copy(null, null, _LLRBNode.RED, this.left.right, null);
    return this.left.copy(null, null, this.color, null, e);
  }
  colorFlip() {
    const e = this.left.copy(null, null, !this.left.color, null, null), t = this.right.copy(null, null, !this.right.color, null, null);
    return this.copy(null, null, !this.color, e, t);
  }
  // For testing.
  checkMaxDepth() {
    const e = this.check();
    return Math.pow(2, e) <= this.size + 1;
  }
  // In a balanced RB tree, the black-depth (number of black nodes) from root to
  // leaves is equal on both sides.  This function verifies that or asserts.
  check() {
    if (this.isRed() && this.left.isRed()) throw fail(43730, {
      key: this.key,
      value: this.value
    });
    if (this.right.isRed()) throw fail(14113, {
      key: this.key,
      value: this.value
    });
    const e = this.left.check();
    if (e !== this.right.check()) throw fail(27949);
    return e + (this.isRed() ? 0 : 1);
  }
};
LLRBNode.EMPTY = null, LLRBNode.RED = true, LLRBNode.BLACK = false;
LLRBNode.EMPTY = new // Represents an empty node (a leaf node in the Red-Black Tree).
class LLRBEmptyNode {
  constructor() {
    this.size = 0;
  }
  get key() {
    throw fail(57766);
  }
  get value() {
    throw fail(16141);
  }
  get color() {
    throw fail(16727);
  }
  get left() {
    throw fail(29726);
  }
  get right() {
    throw fail(36894);
  }
  // Returns a copy of the current node.
  copy(e, t, r, n, i) {
    return this;
  }
  // Returns a copy of the tree, with the specified key/value added.
  insert(e, t, r) {
    return new LLRBNode(e, t);
  }
  // Returns a copy of the tree, with the specified key removed.
  remove(e, t) {
    return this;
  }
  isEmpty() {
    return true;
  }
  inorderTraversal(e) {
    return false;
  }
  reverseTraversal(e) {
    return false;
  }
  minKey() {
    return null;
  }
  maxKey() {
    return null;
  }
  isRed() {
    return false;
  }
  // For testing.
  checkMaxDepth() {
    return true;
  }
  check() {
    return 0;
  }
}();
var SortedSet = class _SortedSet {
  constructor(e) {
    this.comparator = e, this.data = new SortedMap(this.comparator);
  }
  has(e) {
    return null !== this.data.get(e);
  }
  first() {
    return this.data.minKey();
  }
  last() {
    return this.data.maxKey();
  }
  get size() {
    return this.data.size;
  }
  indexOf(e) {
    return this.data.indexOf(e);
  }
  /** Iterates elements in order defined by "comparator" */
  forEach(e) {
    this.data.inorderTraversal((t, r) => (e(t), false));
  }
  /** Iterates over `elem`s such that: range[0] &lt;= elem &lt; range[1]. */
  forEachInRange(e, t) {
    const r = this.data.getIteratorFrom(e[0]);
    for (; r.hasNext(); ) {
      const n = r.getNext();
      if (this.comparator(n.key, e[1]) >= 0) return;
      t(n.key);
    }
  }
  /**
   * Iterates over `elem`s such that: start &lt;= elem until false is returned.
   */
  forEachWhile(e, t) {
    let r;
    for (r = void 0 !== t ? this.data.getIteratorFrom(t) : this.data.getIterator(); r.hasNext(); ) {
      if (!e(r.getNext().key)) return;
    }
  }
  /** Finds the least element greater than or equal to `elem`. */
  firstAfterOrEqual(e) {
    const t = this.data.getIteratorFrom(e);
    return t.hasNext() ? t.getNext().key : null;
  }
  getIterator() {
    return new SortedSetIterator(this.data.getIterator());
  }
  getIteratorFrom(e) {
    return new SortedSetIterator(this.data.getIteratorFrom(e));
  }
  /** Inserts or updates an element */
  add(e) {
    return this.copy(this.data.remove(e).insert(e, true));
  }
  /** Deletes an element */
  delete(e) {
    return this.has(e) ? this.copy(this.data.remove(e)) : this;
  }
  isEmpty() {
    return this.data.isEmpty();
  }
  unionWith(e) {
    let t = this;
    return t.size < e.size && (t = e, e = this), e.forEach((e2) => {
      t = t.add(e2);
    }), t;
  }
  isEqual(e) {
    if (!(e instanceof _SortedSet)) return false;
    if (this.size !== e.size) return false;
    const t = this.data.getIterator(), r = e.data.getIterator();
    for (; t.hasNext(); ) {
      const e2 = t.getNext().key, n = r.getNext().key;
      if (0 !== this.comparator(e2, n)) return false;
    }
    return true;
  }
  toArray() {
    const e = [];
    return this.forEach((t) => {
      e.push(t);
    }), e;
  }
  toString() {
    const e = [];
    return this.forEach((t) => e.push(t)), "SortedSet(" + e.toString() + ")";
  }
  copy(e) {
    const t = new _SortedSet(this.comparator);
    return t.data = e, t;
  }
};
var SortedSetIterator = class {
  constructor(e) {
    this.iter = e;
  }
  getNext() {
    return this.iter.getNext().key;
  }
  hasNext() {
    return this.iter.hasNext();
  }
};
var FieldMask = class _FieldMask {
  constructor(e) {
    this.fields = e, // TODO(dimond): validation of FieldMask
    // Sort the field mask to support `FieldMask.isEqual()` and assert below.
    e.sort(FieldPath$1.comparator);
  }
  static empty() {
    return new _FieldMask([]);
  }
  /**
   * Returns a new FieldMask object that is the result of adding all the given
   * fields paths to this field mask.
   */
  unionWith(e) {
    let t = new SortedSet(FieldPath$1.comparator);
    for (const e2 of this.fields) t = t.add(e2);
    for (const r of e) t = t.add(r);
    return new _FieldMask(t.toArray());
  }
  /**
   * Verifies that `fieldPath` is included by at least one field in this field
   * mask.
   *
   * This is an O(n) operation, where `n` is the size of the field mask.
   */
  covers(e) {
    for (const t of this.fields) if (t.isPrefixOf(e)) return true;
    return false;
  }
  isEqual(e) {
    return __PRIVATE_arrayEquals(this.fields, e.fields, (e2, t) => e2.isEqual(t));
  }
};
var ObjectValue = class _ObjectValue {
  constructor(e) {
    this.value = e;
  }
  static empty() {
    return new _ObjectValue({
      mapValue: {}
    });
  }
  /**
   * Returns the value at the given path or null.
   *
   * @param path - the path to search
   * @returns The value at the path or null if the path is not set.
   */
  field(e) {
    if (e.isEmpty()) return this.value;
    {
      let t = this.value;
      for (let r = 0; r < e.length - 1; ++r) if (t = (t.mapValue.fields || {})[e.get(r)], !__PRIVATE_isMapValue(t)) return null;
      return t = (t.mapValue.fields || {})[e.lastSegment()], t || null;
    }
  }
  /**
   * Sets the field to the provided value.
   *
   * @param path - The field path to set.
   * @param value - The value to set.
   */
  set(e, t) {
    this.getFieldsMap(e.popLast())[e.lastSegment()] = __PRIVATE_deepClone(t);
  }
  /**
   * Sets the provided fields to the provided values.
   *
   * @param data - A map of fields to values (or null for deletes).
   */
  setAll(e) {
    let t = FieldPath$1.emptyPath(), r = {}, n = [];
    e.forEach((e2, i2) => {
      if (!t.isImmediateParentOf(i2)) {
        const e3 = this.getFieldsMap(t);
        this.applyChanges(e3, r, n), r = {}, n = [], t = i2.popLast();
      }
      e2 ? r[i2.lastSegment()] = __PRIVATE_deepClone(e2) : n.push(i2.lastSegment());
    });
    const i = this.getFieldsMap(t);
    this.applyChanges(i, r, n);
  }
  /**
   * Removes the field at the specified path. If there is no field at the
   * specified path, nothing is changed.
   *
   * @param path - The field path to remove.
   */
  delete(e) {
    const t = this.field(e.popLast());
    __PRIVATE_isMapValue(t) && t.mapValue.fields && delete t.mapValue.fields[e.lastSegment()];
  }
  isEqual(e) {
    return __PRIVATE_valueEquals(this.value, e.value);
  }
  /**
   * Returns the map that contains the leaf element of `path`. If the parent
   * entry does not yet exist, or if it is not a map, a new map will be created.
   */
  getFieldsMap(e) {
    let t = this.value;
    t.mapValue.fields || (t.mapValue = {
      fields: {}
    });
    for (let r = 0; r < e.length; ++r) {
      let n = t.mapValue.fields[e.get(r)];
      __PRIVATE_isMapValue(n) && n.mapValue.fields || (n = {
        mapValue: {
          fields: {}
        }
      }, t.mapValue.fields[e.get(r)] = n), t = n;
    }
    return t.mapValue.fields;
  }
  /**
   * Modifies `fieldsMap` by adding, replacing or deleting the specified
   * entries.
   */
  applyChanges(e, t, r) {
    forEach(t, (t2, r2) => e[t2] = r2);
    for (const t2 of r) delete e[t2];
  }
  clone() {
    return new _ObjectValue(__PRIVATE_deepClone(this.value));
  }
};
var MutableDocument = class _MutableDocument {
  constructor(e, t, r, n, i, s, o) {
    this.key = e, this.documentType = t, this.version = r, this.readTime = n, this.createTime = i, this.data = s, this.documentState = o;
  }
  /**
   * Creates a document with no known version or data, but which can serve as
   * base document for mutations.
   */
  static newInvalidDocument(e) {
    return new _MutableDocument(
      e,
      0,
      /* version */
      SnapshotVersion.min(),
      /* readTime */
      SnapshotVersion.min(),
      /* createTime */
      SnapshotVersion.min(),
      ObjectValue.empty(),
      0
      /* DocumentState.SYNCED */
    );
  }
  /**
   * Creates a new document that is known to exist with the given data at the
   * given version.
   */
  static newFoundDocument(e, t, r, n) {
    return new _MutableDocument(
      e,
      1,
      /* version */
      t,
      /* readTime */
      SnapshotVersion.min(),
      /* createTime */
      r,
      n,
      0
      /* DocumentState.SYNCED */
    );
  }
  /** Creates a new document that is known to not exist at the given version. */
  static newNoDocument(e, t) {
    return new _MutableDocument(
      e,
      2,
      /* version */
      t,
      /* readTime */
      SnapshotVersion.min(),
      /* createTime */
      SnapshotVersion.min(),
      ObjectValue.empty(),
      0
      /* DocumentState.SYNCED */
    );
  }
  /**
   * Creates a new document that is known to exist at the given version but
   * whose data is not known (e.g. a document that was updated without a known
   * base document).
   */
  static newUnknownDocument(e, t) {
    return new _MutableDocument(
      e,
      3,
      /* version */
      t,
      /* readTime */
      SnapshotVersion.min(),
      /* createTime */
      SnapshotVersion.min(),
      ObjectValue.empty(),
      2
      /* DocumentState.HAS_COMMITTED_MUTATIONS */
    );
  }
  /**
   * Changes the document type to indicate that it exists and that its version
   * and data are known.
   */
  convertToFoundDocument(e, t) {
    return !this.createTime.isEqual(SnapshotVersion.min()) || 2 !== this.documentType && 0 !== this.documentType || (this.createTime = e), this.version = e, this.documentType = 1, this.data = t, this.documentState = 0, this;
  }
  /**
   * Changes the document type to indicate that it doesn't exist at the given
   * version.
   */
  convertToNoDocument(e) {
    return this.version = e, this.documentType = 2, this.data = ObjectValue.empty(), this.documentState = 0, this;
  }
  /**
   * Changes the document type to indicate that it exists at a given version but
   * that its data is not known (e.g. a document that was updated without a known
   * base document).
   */
  convertToUnknownDocument(e) {
    return this.version = e, this.documentType = 3, this.data = ObjectValue.empty(), this.documentState = 2, this;
  }
  setHasCommittedMutations() {
    return this.documentState = 2, this;
  }
  setHasLocalMutations() {
    return this.documentState = 1, this.version = SnapshotVersion.min(), this;
  }
  setReadTime(e) {
    return this.readTime = e, this;
  }
  get hasLocalMutations() {
    return 1 === this.documentState;
  }
  get hasCommittedMutations() {
    return 2 === this.documentState;
  }
  get hasPendingWrites() {
    return this.hasLocalMutations || this.hasCommittedMutations;
  }
  isValidDocument() {
    return 0 !== this.documentType;
  }
  isFoundDocument() {
    return 1 === this.documentType;
  }
  isNoDocument() {
    return 2 === this.documentType;
  }
  isUnknownDocument() {
    return 3 === this.documentType;
  }
  isEqual(e) {
    return e instanceof _MutableDocument && this.key.isEqual(e.key) && this.version.isEqual(e.version) && this.documentType === e.documentType && this.documentState === e.documentState && this.data.isEqual(e.data);
  }
  mutableCopy() {
    return new _MutableDocument(this.key, this.documentType, this.version, this.readTime, this.createTime, this.data.clone(), this.documentState);
  }
  toString() {
    return `Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`;
  }
};
var __PRIVATE_TargetImpl = class {
  constructor(e, t = null, r = [], n = [], i = null, s = null, o = null) {
    this.path = e, this.collectionGroup = t, this.orderBy = r, this.filters = n, this.limit = i, this.startAt = s, this.endAt = o, this.O = null;
  }
};
function __PRIVATE_newTarget(e, t = null, r = [], n = [], i = null, s = null, o = null) {
  return new __PRIVATE_TargetImpl(e, t, r, n, i, s, o);
}
var __PRIVATE_QueryImpl = class {
  /**
   * Initializes a Query with a path and optional additional query constraints.
   * Path must currently be empty if this is a collection group query.
   */
  constructor(e, t = null, r = [], n = [], i = null, s = "F", o = null, a = null) {
    this.path = e, this.collectionGroup = t, this.explicitOrderBy = r, this.filters = n, this.limit = i, this.limitType = s, this.startAt = o, this.endAt = a, this.q = null, // The corresponding `Target` of this `Query` instance, for use with
    // non-aggregate queries.
    this.L = null, // The corresponding `Target` of this `Query` instance, for use with
    // aggregate queries. Unlike targets for non-aggregate queries,
    // aggregate query targets do not contain normalized order-bys, they only
    // contain explicit order-bys.
    this.B = null, this.startAt, this.endAt;
  }
};
function __PRIVATE_isCollectionGroupQuery(e) {
  return null !== e.collectionGroup;
}
function __PRIVATE_queryNormalizedOrderBy(e) {
  const t = __PRIVATE_debugCast(e);
  if (null === t.q) {
    t.q = [];
    const e2 = /* @__PURE__ */ new Set();
    for (const r2 of t.explicitOrderBy) t.q.push(r2), e2.add(r2.field.canonicalString());
    const r = t.explicitOrderBy.length > 0 ? t.explicitOrderBy[t.explicitOrderBy.length - 1].dir : "asc", n = (
      // Returns the sorted set of inequality filter fields used in this query.
      function __PRIVATE_getInequalityFilterFields(e3) {
        let t2 = new SortedSet(FieldPath$1.comparator);
        return e3.filters.forEach((e4) => {
          e4.getFlattenedFilters().forEach((e5) => {
            e5.isInequality() && (t2 = t2.add(e5.field));
          });
        }), t2;
      }(t)
    );
    n.forEach((n2) => {
      e2.has(n2.canonicalString()) || n2.isKeyField() || t.q.push(new OrderBy(n2, r));
    }), // Add the document key field to the last if it is not explicitly ordered.
    e2.has(FieldPath$1.keyField().canonicalString()) || t.q.push(new OrderBy(FieldPath$1.keyField(), r));
  }
  return t.q;
}
function __PRIVATE_queryToTarget(e) {
  const t = __PRIVATE_debugCast(e);
  return t.L || (t.L = __PRIVATE__queryToTarget(t, __PRIVATE_queryNormalizedOrderBy(e))), t.L;
}
function __PRIVATE__queryToTarget(e, t) {
  if ("F" === e.limitType) return __PRIVATE_newTarget(e.path, e.collectionGroup, t, e.filters, e.limit, e.startAt, e.endAt);
  {
    t = t.map((e2) => {
      const t2 = "desc" === e2.dir ? "asc" : "desc";
      return new OrderBy(e2.field, t2);
    });
    const r = e.endAt ? new Bound(e.endAt.position, e.endAt.inclusive) : null, n = e.startAt ? new Bound(e.startAt.position, e.startAt.inclusive) : null;
    return __PRIVATE_newTarget(e.path, e.collectionGroup, t, e.filters, e.limit, r, n);
  }
}
function __PRIVATE_queryWithAddedFilter(e, t) {
  const r = e.filters.concat([t]);
  return new __PRIVATE_QueryImpl(e.path, e.collectionGroup, e.explicitOrderBy.slice(), r, e.limit, e.limitType, e.startAt, e.endAt);
}
function __PRIVATE_queryEquals(e, t) {
  return function __PRIVATE_targetEquals(e2, t2) {
    if (e2.limit !== t2.limit) return false;
    if (e2.orderBy.length !== t2.orderBy.length) return false;
    for (let r = 0; r < e2.orderBy.length; r++) if (!__PRIVATE_orderByEquals(e2.orderBy[r], t2.orderBy[r])) return false;
    if (e2.filters.length !== t2.filters.length) return false;
    for (let r = 0; r < e2.filters.length; r++) if (!__PRIVATE_filterEquals(e2.filters[r], t2.filters[r])) return false;
    return e2.collectionGroup === t2.collectionGroup && !!e2.path.isEqual(t2.path) && !!__PRIVATE_boundEquals(e2.startAt, t2.startAt) && __PRIVATE_boundEquals(e2.endAt, t2.endAt);
  }(__PRIVATE_queryToTarget(e), __PRIVATE_queryToTarget(t)) && e.limitType === t.limitType;
}
function __PRIVATE_toDouble(e, t) {
  if (e.useProto3Json) {
    if (isNaN(t)) return {
      doubleValue: "NaN"
    };
    if (t === 1 / 0) return {
      doubleValue: "Infinity"
    };
    if (t === -1 / 0) return {
      doubleValue: "-Infinity"
    };
  }
  return {
    doubleValue: __PRIVATE_isNegativeZero(t) ? "-0" : t
  };
}
function toNumber(e, t) {
  return function isSafeInteger(e2) {
    return "number" == typeof e2 && Number.isInteger(e2) && !__PRIVATE_isNegativeZero(e2) && e2 <= Number.MAX_SAFE_INTEGER && e2 >= Number.MIN_SAFE_INTEGER;
  }(t) ? function __PRIVATE_toInteger(e2) {
    return {
      integerValue: "" + e2
    };
  }(t) : __PRIVATE_toDouble(e, t);
}
var TransformOperation = class {
  constructor() {
    this._ = void 0;
  }
};
var __PRIVATE_ServerTimestampTransform = class extends TransformOperation {
};
var __PRIVATE_ArrayUnionTransformOperation = class extends TransformOperation {
  constructor(e) {
    super(), this.elements = e;
  }
};
var __PRIVATE_ArrayRemoveTransformOperation = class extends TransformOperation {
  constructor(e) {
    super(), this.elements = e;
  }
};
var __PRIVATE_NumericIncrementTransformOperation = class extends TransformOperation {
  constructor(e, t) {
    super(), this.serializer = e, this.$ = t;
  }
};
var FieldTransform = class {
  constructor(e, t) {
    this.field = e, this.transform = t;
  }
};
var Precondition = class _Precondition {
  constructor(e, t) {
    this.updateTime = e, this.exists = t;
  }
  /** Creates a new empty Precondition. */
  static none() {
    return new _Precondition();
  }
  /** Creates a new Precondition with an exists flag. */
  static exists(e) {
    return new _Precondition(void 0, e);
  }
  /** Creates a new Precondition based on a version a document exists at. */
  static updateTime(e) {
    return new _Precondition(e);
  }
  /** Returns whether this Precondition is empty. */
  get isNone() {
    return void 0 === this.updateTime && void 0 === this.exists;
  }
  isEqual(e) {
    return this.exists === e.exists && (this.updateTime ? !!e.updateTime && this.updateTime.isEqual(e.updateTime) : !e.updateTime);
  }
};
var Mutation = class {
};
var __PRIVATE_SetMutation = class extends Mutation {
  constructor(e, t, r, n = []) {
    super(), this.key = e, this.value = t, this.precondition = r, this.fieldTransforms = n, this.type = 0;
  }
  getFieldMask() {
    return null;
  }
};
var __PRIVATE_PatchMutation = class extends Mutation {
  constructor(e, t, r, n, i = []) {
    super(), this.key = e, this.data = t, this.fieldMask = r, this.precondition = n, this.fieldTransforms = i, this.type = 1;
  }
  getFieldMask() {
    return this.fieldMask;
  }
};
var __PRIVATE_DeleteMutation = class extends Mutation {
  constructor(e, t) {
    super(), this.key = e, this.precondition = t, this.type = 2, this.fieldTransforms = [];
  }
  getFieldMask() {
    return null;
  }
};
var __PRIVATE_VerifyMutation = class extends Mutation {
  constructor(e, t) {
    super(), this.key = e, this.precondition = t, this.type = 3, this.fieldTransforms = [];
  }
  getFieldMask() {
    return null;
  }
};
var O = /* @__PURE__ */ (() => {
  const e = {
    asc: "ASCENDING",
    desc: "DESCENDING"
  };
  return e;
})();
var q = /* @__PURE__ */ (() => {
  const e = {
    "<": "LESS_THAN",
    "<=": "LESS_THAN_OR_EQUAL",
    ">": "GREATER_THAN",
    ">=": "GREATER_THAN_OR_EQUAL",
    "==": "EQUAL",
    "!=": "NOT_EQUAL",
    "array-contains": "ARRAY_CONTAINS",
    in: "IN",
    "not-in": "NOT_IN",
    "array-contains-any": "ARRAY_CONTAINS_ANY"
  };
  return e;
})();
var L = /* @__PURE__ */ (() => {
  const e = {
    and: "AND",
    or: "OR"
  };
  return e;
})();
var JsonProtoSerializer = class {
  constructor(e, t) {
    this.databaseId = e, this.useProto3Json = t;
  }
};
function toTimestamp(e, t) {
  if (e.useProto3Json) {
    return `${new Date(1e3 * t.seconds).toISOString().replace(/\.\d*/, "").replace("Z", "")}.${("000000000" + t.nanoseconds).slice(-9)}Z`;
  }
  return {
    seconds: "" + t.seconds,
    nanos: t.nanoseconds
  };
}
function __PRIVATE_toBytes(e, t) {
  return e.useProto3Json ? t.toBase64() : t.toUint8Array();
}
function __PRIVATE_toVersion(e, t) {
  return toTimestamp(e, t.toTimestamp());
}
function __PRIVATE_fromVersion(e) {
  return __PRIVATE_hardAssert(!!e, 49232), SnapshotVersion.fromTimestamp(function fromTimestamp(e2) {
    const t = __PRIVATE_normalizeTimestamp(e2);
    return new Timestamp(t.seconds, t.nanos);
  }(e));
}
function __PRIVATE_toResourceName(e, t) {
  return __PRIVATE_toResourcePath(e, t).canonicalString();
}
function __PRIVATE_toResourcePath(e, t) {
  const r = function __PRIVATE_fullyQualifiedPrefixPath(e2) {
    return new ResourcePath(["projects", e2.projectId, "databases", e2.database]);
  }(e).child("documents");
  return void 0 === t ? r : r.child(t);
}
function __PRIVATE_toName(e, t) {
  return __PRIVATE_toResourceName(e.databaseId, t.path);
}
function fromName(e, t) {
  const r = function __PRIVATE_fromResourceName(e2) {
    const t2 = ResourcePath.fromString(e2);
    return __PRIVATE_hardAssert(__PRIVATE_isValidResourceName(t2), 10190, {
      key: t2.toString()
    }), t2;
  }(t);
  if (r.get(1) !== e.databaseId.projectId) throw new FirestoreError(E.INVALID_ARGUMENT, "Tried to deserialize key from different project: " + r.get(1) + " vs " + e.databaseId.projectId);
  if (r.get(3) !== e.databaseId.database) throw new FirestoreError(E.INVALID_ARGUMENT, "Tried to deserialize key from different database: " + r.get(3) + " vs " + e.databaseId.database);
  return new DocumentKey(function __PRIVATE_extractLocalPathFromResourceName(e2) {
    return __PRIVATE_hardAssert(e2.length > 4 && "documents" === e2.get(4), 29091, {
      key: e2.toString()
    }), e2.popFirst(5);
  }(r));
}
function __PRIVATE_toMutationDocument(e, t, r) {
  return {
    name: __PRIVATE_toName(e, t),
    fields: r.value.mapValue.fields
  };
}
function __PRIVATE_fromBatchGetDocumentsResponse(e, t) {
  return "found" in t ? function __PRIVATE_fromFound(e2, t2) {
    __PRIVATE_hardAssert(!!t2.found, 43571), t2.found.name, t2.found.updateTime;
    const r = fromName(e2, t2.found.name), n = __PRIVATE_fromVersion(t2.found.updateTime), i = t2.found.createTime ? __PRIVATE_fromVersion(t2.found.createTime) : SnapshotVersion.min(), s = new ObjectValue({
      mapValue: {
        fields: t2.found.fields
      }
    });
    return MutableDocument.newFoundDocument(r, n, i, s);
  }(e, t) : "missing" in t ? function __PRIVATE_fromMissing(e2, t2) {
    __PRIVATE_hardAssert(!!t2.missing, 3894), __PRIVATE_hardAssert(!!t2.readTime, 22933);
    const r = fromName(e2, t2.missing), n = __PRIVATE_fromVersion(t2.readTime);
    return MutableDocument.newNoDocument(r, n);
  }(e, t) : fail(7234, {
    result: t
  });
}
function toMutation(e, t) {
  let r;
  if (t instanceof __PRIVATE_SetMutation) r = {
    update: __PRIVATE_toMutationDocument(e, t.key, t.value)
  };
  else if (t instanceof __PRIVATE_DeleteMutation) r = {
    delete: __PRIVATE_toName(e, t.key)
  };
  else if (t instanceof __PRIVATE_PatchMutation) r = {
    update: __PRIVATE_toMutationDocument(e, t.key, t.data),
    updateMask: __PRIVATE_toDocumentMask(t.fieldMask)
  };
  else {
    if (!(t instanceof __PRIVATE_VerifyMutation)) return fail(16599, {
      U: t.type
    });
    r = {
      verify: __PRIVATE_toName(e, t.key)
    };
  }
  return t.fieldTransforms.length > 0 && (r.updateTransforms = t.fieldTransforms.map((e2) => function __PRIVATE_toFieldTransform(e3, t2) {
    const r2 = t2.transform;
    if (r2 instanceof __PRIVATE_ServerTimestampTransform) return {
      fieldPath: t2.field.canonicalString(),
      setToServerValue: "REQUEST_TIME"
    };
    if (r2 instanceof __PRIVATE_ArrayUnionTransformOperation) return {
      fieldPath: t2.field.canonicalString(),
      appendMissingElements: {
        values: r2.elements
      }
    };
    if (r2 instanceof __PRIVATE_ArrayRemoveTransformOperation) return {
      fieldPath: t2.field.canonicalString(),
      removeAllFromArray: {
        values: r2.elements
      }
    };
    if (r2 instanceof __PRIVATE_NumericIncrementTransformOperation) return {
      fieldPath: t2.field.canonicalString(),
      increment: r2.$
    };
    throw fail(20930, {
      transform: t2.transform
    });
  }(0, e2))), t.precondition.isNone || (r.currentDocument = function __PRIVATE_toPrecondition(e2, t2) {
    return void 0 !== t2.updateTime ? {
      updateTime: __PRIVATE_toVersion(e2, t2.updateTime)
    } : void 0 !== t2.exists ? {
      exists: t2.exists
    } : fail(27497);
  }(e, t.precondition)), r;
}
function __PRIVATE_toQueryTarget(e, t) {
  const r = {
    structuredQuery: {}
  }, n = t.path;
  let i;
  null !== t.collectionGroup ? (i = n, r.structuredQuery.from = [{
    collectionId: t.collectionGroup,
    allDescendants: true
  }]) : (i = n.popLast(), r.structuredQuery.from = [{
    collectionId: n.lastSegment()
  }]), r.parent = function __PRIVATE_toQueryPath(e2, t2) {
    return __PRIVATE_toResourceName(e2.databaseId, t2);
  }(e, i);
  const s = function __PRIVATE_toFilters(e2) {
    if (0 === e2.length) return;
    return __PRIVATE_toFilter(CompositeFilter.create(
      e2,
      "and"
      /* CompositeOperator.AND */
    ));
  }(t.filters);
  s && (r.structuredQuery.where = s);
  const o = function __PRIVATE_toOrder(e2) {
    if (0 === e2.length) return;
    return e2.map((e3) => (
      // visible for testing
      function __PRIVATE_toPropertyOrder(e4) {
        return {
          field: __PRIVATE_toFieldPathReference(e4.field),
          direction: __PRIVATE_toDirection(e4.dir)
        };
      }(e3)
    ));
  }(t.orderBy);
  o && (r.structuredQuery.orderBy = o);
  const a = function __PRIVATE_toInt32Proto(e2, t2) {
    return e2.useProto3Json || __PRIVATE_isNullOrUndefined(t2) ? t2 : {
      value: t2
    };
  }(e, t.limit);
  return null !== a && (r.structuredQuery.limit = a), t.startAt && (r.structuredQuery.startAt = function __PRIVATE_toStartAtCursor(e2) {
    return {
      before: e2.inclusive,
      values: e2.position
    };
  }(t.startAt)), t.endAt && (r.structuredQuery.endAt = function __PRIVATE_toEndAtCursor(e2) {
    return {
      before: !e2.inclusive,
      values: e2.position
    };
  }(t.endAt)), {
    M: r,
    parent: i
  };
}
function __PRIVATE_toDirection(e) {
  return O[e];
}
function __PRIVATE_toOperatorName(e) {
  return q[e];
}
function __PRIVATE_toCompositeOperatorName(e) {
  return L[e];
}
function __PRIVATE_toFieldPathReference(e) {
  return {
    fieldPath: e.canonicalString()
  };
}
function __PRIVATE_toFilter(e) {
  return e instanceof FieldFilter ? function __PRIVATE_toUnaryOrFieldFilter(e2) {
    if ("==" === e2.op) {
      if (__PRIVATE_isNanValue(e2.value)) return {
        unaryFilter: {
          field: __PRIVATE_toFieldPathReference(e2.field),
          op: "IS_NAN"
        }
      };
      if (__PRIVATE_isNullValue(e2.value)) return {
        unaryFilter: {
          field: __PRIVATE_toFieldPathReference(e2.field),
          op: "IS_NULL"
        }
      };
    } else if ("!=" === e2.op) {
      if (__PRIVATE_isNanValue(e2.value)) return {
        unaryFilter: {
          field: __PRIVATE_toFieldPathReference(e2.field),
          op: "IS_NOT_NAN"
        }
      };
      if (__PRIVATE_isNullValue(e2.value)) return {
        unaryFilter: {
          field: __PRIVATE_toFieldPathReference(e2.field),
          op: "IS_NOT_NULL"
        }
      };
    }
    return {
      fieldFilter: {
        field: __PRIVATE_toFieldPathReference(e2.field),
        op: __PRIVATE_toOperatorName(e2.op),
        value: e2.value
      }
    };
  }(e) : e instanceof CompositeFilter ? function __PRIVATE_toCompositeFilter(e2) {
    const t = e2.getFilters().map((e3) => __PRIVATE_toFilter(e3));
    if (1 === t.length) return t[0];
    return {
      compositeFilter: {
        op: __PRIVATE_toCompositeOperatorName(e2.op),
        filters: t
      }
    };
  }(e) : fail(54877, {
    filter: e
  });
}
function __PRIVATE_toDocumentMask(e) {
  const t = [];
  return e.fields.forEach((e2) => t.push(e2.canonicalString())), {
    fieldPaths: t
  };
}
function __PRIVATE_isValidResourceName(e) {
  return e.length >= 4 && "projects" === e.get(0) && "databases" === e.get(2);
}
function __PRIVATE_isProtoValueSerializable(e) {
  return !!e && "function" == typeof e._toProto && "ProtoValue" === e._protoValueType;
}
function __PRIVATE_newSerializer(e) {
  return new JsonProtoSerializer(
    e,
    /* useProto3Json= */
    true
  );
}
var Datastore = class {
};
var __PRIVATE_DatastoreImpl = class extends Datastore {
  constructor(e, t, r, n) {
    super(), this.authCredentials = e, this.appCheckCredentials = t, this.connection = r, this.serializer = n, this.k = false;
  }
  j() {
    if (this.k) throw new FirestoreError(E.FAILED_PRECONDITION, "The client has already been terminated.");
  }
  /** Invokes the provided RPC with auth and AppCheck tokens. */
  I(e, t, r, n) {
    return this.j(), Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()]).then(([i, s]) => this.connection.I(e, __PRIVATE_toResourcePath(t, r), n, i, s)).catch((e2) => {
      throw "FirebaseError" === e2.name ? (e2.code === E.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), this.appCheckCredentials.invalidateToken()), e2) : new FirestoreError(E.UNKNOWN, e2.toString());
    });
  }
  /** Invokes the provided RPC with streamed results with auth and AppCheck tokens. */
  D(e, t, r, n, i) {
    return this.j(), Promise.all([this.authCredentials.getToken(), this.appCheckCredentials.getToken()]).then(([s, o]) => this.connection.D(e, __PRIVATE_toResourcePath(t, r), n, s, o, i)).catch((e2) => {
      throw "FirebaseError" === e2.name ? (e2.code === E.UNAUTHENTICATED && (this.authCredentials.invalidateToken(), this.appCheckCredentials.invalidateToken()), e2) : new FirestoreError(E.UNKNOWN, e2.toString());
    });
  }
  terminate() {
    this.k = true, this.connection.terminate();
  }
};
async function __PRIVATE_invokeCommitRpc(e, t) {
  const r = __PRIVATE_debugCast(e), n = {
    writes: t.map((e2) => toMutation(r.serializer, e2))
  };
  await r.I("Commit", r.serializer.databaseId, ResourcePath.emptyPath(), n);
}
async function __PRIVATE_invokeBatchGetDocumentsRpc(e, t) {
  const r = __PRIVATE_debugCast(e), n = {
    documents: t.map((e2) => __PRIVATE_toName(r.serializer, e2))
  }, i = await r.D("BatchGetDocuments", r.serializer.databaseId, ResourcePath.emptyPath(), n, t.length), s = /* @__PURE__ */ new Map();
  i.forEach((e2) => {
    const t2 = __PRIVATE_fromBatchGetDocumentsResponse(r.serializer, e2);
    s.set(t2.key.toString(), t2);
  });
  const o = [];
  return t.forEach((e2) => {
    const t2 = s.get(e2.toString());
    __PRIVATE_hardAssert(!!t2, 55234, {
      key: e2
    }), o.push(t2);
  }), o;
}
async function __PRIVATE_invokeRunQueryRpc(e, t) {
  const r = __PRIVATE_debugCast(e), { M: n, parent: i } = __PRIVATE_toQueryTarget(r.serializer, __PRIVATE_queryToTarget(t));
  return (await r.D("RunQuery", r.serializer.databaseId, i, {
    structuredQuery: n.structuredQuery
  })).filter((e2) => !!e2.document).map((e2) => function __PRIVATE_fromDocument(e3, t2, r2) {
    const n2 = fromName(e3, t2.name), i2 = __PRIVATE_fromVersion(t2.updateTime), s = t2.createTime ? __PRIVATE_fromVersion(t2.createTime) : SnapshotVersion.min(), o = new ObjectValue({
      mapValue: {
        fields: t2.fields
      }
    }), a = MutableDocument.newFoundDocument(n2, i2, s, o);
    return r2 && a.setHasCommittedMutations(), r2 ? a.setHasCommittedMutations() : a;
  }(r.serializer, e2.document, void 0));
}
async function __PRIVATE_invokeRunAggregationQueryRpc(e, t, r) {
  var _a;
  const n = __PRIVATE_debugCast(e), { request: i, K: s, parent: o } = function __PRIVATE_toRunAggregationQueryRequest(e2, t2, r2, n2) {
    const { M: i2, parent: s2 } = __PRIVATE_toQueryTarget(e2, t2), o2 = {}, a2 = [];
    let u2 = 0;
    return r2.forEach((e3) => {
      const t3 = n2 ? e3.alias : "aggregate_" + u2++;
      o2[t3] = e3.alias, "count" === e3.aggregateType ? a2.push({
        alias: t3,
        count: {}
      }) : "avg" === e3.aggregateType ? a2.push({
        alias: t3,
        avg: {
          field: __PRIVATE_toFieldPathReference(e3.fieldPath)
        }
      }) : "sum" === e3.aggregateType && a2.push({
        alias: t3,
        sum: {
          field: __PRIVATE_toFieldPathReference(e3.fieldPath)
        }
      });
    }), {
      request: {
        structuredAggregationQuery: {
          aggregations: a2,
          structuredQuery: i2.structuredQuery
        },
        parent: i2.parent
      },
      K: o2,
      parent: s2
    };
  }(n.serializer, function __PRIVATE_queryToAggregateTarget(e2) {
    const t2 = __PRIVATE_debugCast(e2);
    return t2.B || // Do not include implicit order-bys for aggregate queries.
    (t2.B = __PRIVATE__queryToTarget(t2, e2.explicitOrderBy)), t2.B;
  }(t), r);
  n.connection.T || delete i.parent;
  const a = (await n.D(
    "RunAggregationQuery",
    n.serializer.databaseId,
    o,
    i,
    /*expectedResponseCount=*/
    1
  )).filter((e2) => !!e2.result);
  __PRIVATE_hardAssert(1 === a.length, 64727);
  const u = (_a = a[0].result) == null ? void 0 : _a.aggregateFields;
  return Object.keys(u).reduce((e2, t2) => (e2[s[t2]] = u[t2], e2), {});
}
var B = "ComponentProvider";
var $ = /* @__PURE__ */ new Map();
function __PRIVATE_getDatastore(e) {
  if (e._terminated) throw new FirestoreError(E.FAILED_PRECONDITION, "The client has already been terminated.");
  if (!$.has(e)) {
    __PRIVATE_logDebug(B, "Initializing Datastore");
    const t = function __PRIVATE_newConnection(e2) {
      return new __PRIVATE_FetchConnection(e2);
    }(function __PRIVATE_makeDatabaseInfo(e2, t2, r2, n2, i) {
      return new DatabaseInfo(e2, t2, r2, i.host, i.ssl, i.experimentalForceLongPolling, i.experimentalAutoDetectLongPolling, __PRIVATE_cloneLongPollingOptions(i.experimentalLongPollingOptions), i.useFetchStreams, i.isUsingEmulator, n2);
    }(e._databaseId, e.app.options.appId || "", e._persistenceKey, e.app.options.apiKey, e._freezeSettings())), r = __PRIVATE_newSerializer(e._databaseId), n = function __PRIVATE_newDatastore(e2, t2, r2, n2) {
      return new __PRIVATE_DatastoreImpl(e2, t2, r2, n2);
    }(e._authCredentials, e._appCheckCredentials, t, r);
    $.set(e, n);
  }
  return $.get(e);
}
var Q = 1048576;
var U = "firestore.googleapis.com";
var M = true;
var FirestoreSettingsImpl = class {
  constructor(e) {
    if (void 0 === e.host) {
      if (void 0 !== e.ssl) throw new FirestoreError(E.INVALID_ARGUMENT, "Can't provide ssl option if host option is not set");
      this.host = U, this.ssl = M;
    } else this.host = e.host, this.ssl = e.ssl ?? M;
    if (this.isUsingEmulator = void 0 !== e.emulatorOptions, this.credentials = e.credentials, this.ignoreUndefinedProperties = !!e.ignoreUndefinedProperties, this.localCache = e.localCache, void 0 === e.cacheSizeBytes) this.cacheSizeBytes = 41943040;
    else {
      if (-1 !== e.cacheSizeBytes && e.cacheSizeBytes < Q) throw new FirestoreError(E.INVALID_ARGUMENT, "cacheSizeBytes must be at least 1048576");
      this.cacheSizeBytes = e.cacheSizeBytes;
    }
    !function __PRIVATE_validateIsNotUsedTogether(e2, t, r, n) {
      if (true === t && true === n) throw new FirestoreError(E.INVALID_ARGUMENT, `${e2} and ${r} cannot be used together.`);
    }("experimentalForceLongPolling", e.experimentalForceLongPolling, "experimentalAutoDetectLongPolling", e.experimentalAutoDetectLongPolling), this.experimentalForceLongPolling = !!e.experimentalForceLongPolling, this.experimentalForceLongPolling ? this.experimentalAutoDetectLongPolling = false : void 0 === e.experimentalAutoDetectLongPolling ? this.experimentalAutoDetectLongPolling = true : (
      // For backwards compatibility, coerce the value to boolean even though
      // the TypeScript compiler has narrowed the type to boolean already.
      // noinspection PointlessBooleanExpressionJS
      this.experimentalAutoDetectLongPolling = !!e.experimentalAutoDetectLongPolling
    ), this.experimentalLongPollingOptions = __PRIVATE_cloneLongPollingOptions(e.experimentalLongPollingOptions ?? {}), function __PRIVATE_validateLongPollingOptions(e2) {
      if (void 0 !== e2.timeoutSeconds) {
        if (isNaN(e2.timeoutSeconds)) throw new FirestoreError(E.INVALID_ARGUMENT, `invalid long polling timeout: ${e2.timeoutSeconds} (must not be NaN)`);
        if (e2.timeoutSeconds < 5) throw new FirestoreError(E.INVALID_ARGUMENT, `invalid long polling timeout: ${e2.timeoutSeconds} (minimum allowed value is 5)`);
        if (e2.timeoutSeconds > 30) throw new FirestoreError(E.INVALID_ARGUMENT, `invalid long polling timeout: ${e2.timeoutSeconds} (maximum allowed value is 30)`);
      }
    }(this.experimentalLongPollingOptions), this.useFetchStreams = !!e.useFetchStreams;
  }
  isEqual(e) {
    return this.host === e.host && this.ssl === e.ssl && this.credentials === e.credentials && this.cacheSizeBytes === e.cacheSizeBytes && this.experimentalForceLongPolling === e.experimentalForceLongPolling && this.experimentalAutoDetectLongPolling === e.experimentalAutoDetectLongPolling && function __PRIVATE_longPollingOptionsEqual(e2, t) {
      return e2.timeoutSeconds === t.timeoutSeconds;
    }(this.experimentalLongPollingOptions, e.experimentalLongPollingOptions) && this.ignoreUndefinedProperties === e.ignoreUndefinedProperties && this.useFetchStreams === e.useFetchStreams;
  }
};
var Firestore = class {
  /** @hideconstructor */
  constructor(e, t, r, n) {
    this._authCredentials = e, this._appCheckCredentials = t, this._databaseId = r, this._app = n, /**
     * Whether it's a Firestore or Firestore Lite instance.
     */
    this.type = "firestore-lite", this._persistenceKey = "(lite)", this._settings = new FirestoreSettingsImpl({}), this._settingsFrozen = false, this._emulatorOptions = {}, // A task that is assigned when the terminate() is invoked and resolved when
    // all components have shut down. Otherwise, Firestore is not terminated,
    // which can mean either the FirestoreClient is in the process of starting,
    // or restarting.
    this._terminateTask = "notTerminated";
  }
  /**
   * The {@link @firebase/app#FirebaseApp} associated with this `Firestore` service
   * instance.
   */
  get app() {
    if (!this._app) throw new FirestoreError(E.FAILED_PRECONDITION, "Firestore was not initialized using the Firebase SDK. 'app' is not available");
    return this._app;
  }
  get _initialized() {
    return this._settingsFrozen;
  }
  get _terminated() {
    return "notTerminated" !== this._terminateTask;
  }
  _setSettings(e) {
    if (this._settingsFrozen) throw new FirestoreError(E.FAILED_PRECONDITION, "Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");
    this._settings = new FirestoreSettingsImpl(e), this._emulatorOptions = e.emulatorOptions || {}, void 0 !== e.credentials && (this._authCredentials = function __PRIVATE_makeAuthCredentialsProvider(e2) {
      if (!e2) return new __PRIVATE_EmptyAuthCredentialsProvider();
      switch (e2.type) {
        case "firstParty":
          return new __PRIVATE_FirstPartyAuthCredentialsProvider(e2.sessionIndex || "0", e2.iamToken || null, e2.authTokenFactory || null);
        case "provider":
          return e2.client;
        default:
          throw new FirestoreError(E.INVALID_ARGUMENT, "makeAuthCredentialsProvider failed due to invalid credential type");
      }
    }(e.credentials));
  }
  _getSettings() {
    return this._settings;
  }
  _getEmulatorOptions() {
    return this._emulatorOptions;
  }
  _freezeSettings() {
    return this._settingsFrozen = true, this._settings;
  }
  _delete() {
    return "notTerminated" === this._terminateTask && (this._terminateTask = this._terminate()), this._terminateTask;
  }
  async _restart() {
    "notTerminated" === this._terminateTask ? await this._terminate() : this._terminateTask = "notTerminated";
  }
  /** Returns a JSON-serializable representation of this `Firestore` instance. */
  toJSON() {
    return {
      app: this._app,
      databaseId: this._databaseId,
      settings: this._settings
    };
  }
  /**
   * Terminates all components used by this client. Subclasses can override
   * this method to clean up their own dependencies, but must also call this
   * method.
   *
   * Only ever called once.
   */
  _terminate() {
    return function __PRIVATE_removeComponents(e) {
      const t = $.get(e);
      t && (__PRIVATE_logDebug(B, "Removing Datastore"), $.delete(e), t.terminate());
    }(this), Promise.resolve();
  }
};
function initializeFirestore(e, t, r) {
  r || (r = m);
  const n = _getProvider(e, "firestore/lite");
  if (n.isInitialized(r)) throw new FirestoreError(E.FAILED_PRECONDITION, "Firestore can only be initialized once per app.");
  return n.initialize({
    options: t,
    instanceIdentifier: r
  });
}
function getFirestore(e, t) {
  const n = "object" == typeof e ? e : getApp(), i = "string" == typeof e ? e : t || "(default)", s = _getProvider(n, "firestore/lite").getImmediate({
    identifier: i
  });
  if (!s._initialized) {
    const e2 = getDefaultEmulatorHostnameAndPort("firestore");
    e2 && connectFirestoreEmulator(s, ...e2);
  }
  return s;
}
function connectFirestoreEmulator(e, r, o, a = {}) {
  var _a;
  e = __PRIVATE_cast(e, Firestore);
  const u = isCloudWorkstation(r), _ = e._getSettings(), c = {
    ..._,
    emulatorOptions: e._getEmulatorOptions()
  }, l = `${r}:${o}`;
  u && pingServer(`https://${l}`), _.host !== U && _.host !== l && __PRIVATE_logWarn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");
  const h = {
    ..._,
    host: l,
    ssl: u,
    emulatorOptions: a
  };
  if (!deepEqual(h, c) && (e._setSettings(h), a.mockUserToken)) {
    let t, r2;
    if ("string" == typeof a.mockUserToken) t = a.mockUserToken, r2 = User.MOCK_USER;
    else {
      t = createMockUserToken(a.mockUserToken, (_a = e._app) == null ? void 0 : _a.options.projectId);
      const n = a.mockUserToken.sub || a.mockUserToken.user_id;
      if (!n) throw new FirestoreError(E.INVALID_ARGUMENT, "mockUserToken must contain 'sub' or 'user_id' field!");
      r2 = new User(n);
    }
    e._authCredentials = new __PRIVATE_EmulatorAuthCredentialsProvider(new __PRIVATE_OAuthToken(t, r2));
  }
}
function terminate(e) {
  return e = __PRIVATE_cast(e, Firestore), _removeServiceInstance(e.app, "firestore/lite"), e._delete();
}
var Query = class _Query {
  // This is the lite version of the Query class in the main SDK.
  /** @hideconstructor protected */
  constructor(e, t, r) {
    this.converter = t, this._query = r, /** The type of this Firestore reference. */
    this.type = "query", this.firestore = e;
  }
  withConverter(e) {
    return new _Query(this.firestore, e, this._query);
  }
};
var DocumentReference = class _DocumentReference {
  /** @hideconstructor */
  constructor(e, t, r) {
    this.converter = t, this._key = r, /** The type of this Firestore reference. */
    this.type = "document", this.firestore = e;
  }
  get _path() {
    return this._key.path;
  }
  /**
   * The document's identifier within its collection.
   */
  get id() {
    return this._key.path.lastSegment();
  }
  /**
   * A string representing the path of the referenced document (relative
   * to the root of the database).
   */
  get path() {
    return this._key.path.canonicalString();
  }
  /**
   * The collection this `DocumentReference` belongs to.
   */
  get parent() {
    return new CollectionReference(this.firestore, this.converter, this._key.path.popLast());
  }
  withConverter(e) {
    return new _DocumentReference(this.firestore, e, this._key);
  }
  /**
   * Returns a JSON-serializable representation of this `DocumentReference` instance.
   *
   * @returns a JSON representation of this object.
   */
  toJSON() {
    return {
      type: _DocumentReference._jsonSchemaVersion,
      referencePath: this._key.toString()
    };
  }
  static fromJSON(e, t, r) {
    if (__PRIVATE_validateJSON(t, _DocumentReference._jsonSchema)) return new _DocumentReference(e, r || null, new DocumentKey(ResourcePath.fromString(t.referencePath)));
  }
};
DocumentReference._jsonSchemaVersion = "firestore/documentReference/1.0", DocumentReference._jsonSchema = {
  type: property("string", DocumentReference._jsonSchemaVersion),
  referencePath: property("string")
};
var CollectionReference = class _CollectionReference extends Query {
  /** @hideconstructor */
  constructor(e, t, r) {
    super(e, t, function __PRIVATE_newQueryForPath(e2) {
      return new __PRIVATE_QueryImpl(e2);
    }(r)), this._path = r, /** The type of this Firestore reference. */
    this.type = "collection";
  }
  /** The collection's identifier. */
  get id() {
    return this._query.path.lastSegment();
  }
  /**
   * A string representing the path of the referenced collection (relative
   * to the root of the database).
   */
  get path() {
    return this._query.path.canonicalString();
  }
  /**
   * A reference to the containing `DocumentReference` if this is a
   * subcollection. If this isn't a subcollection, the reference is null.
   */
  get parent() {
    const e = this._path.popLast();
    return e.isEmpty() ? null : new DocumentReference(
      this.firestore,
      /* converter= */
      null,
      new DocumentKey(e)
    );
  }
  withConverter(e) {
    return new _CollectionReference(this.firestore, e, this._path);
  }
};
function collection(e, t, ...r) {
  if (e = getModularInstance(e), __PRIVATE_validateNonEmptyArgument("collection", "path", t), e instanceof Firestore) {
    const n = ResourcePath.fromString(t, ...r);
    return __PRIVATE_validateCollectionPath(n), new CollectionReference(
      e,
      /* converter= */
      null,
      n
    );
  }
  {
    if (!(e instanceof DocumentReference || e instanceof CollectionReference)) throw new FirestoreError(E.INVALID_ARGUMENT, "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
    const n = e._path.child(ResourcePath.fromString(t, ...r));
    return __PRIVATE_validateCollectionPath(n), new CollectionReference(
      e.firestore,
      /* converter= */
      null,
      n
    );
  }
}
function collectionGroup(e, t) {
  if (e = __PRIVATE_cast(e, Firestore), __PRIVATE_validateNonEmptyArgument("collectionGroup", "collection id", t), t.indexOf("/") >= 0) throw new FirestoreError(E.INVALID_ARGUMENT, `Invalid collection ID '${t}' passed to function collectionGroup(). Collection IDs must not contain '/'.`);
  return new Query(
    e,
    /* converter= */
    null,
    function __PRIVATE_newQueryForCollectionGroup(e2) {
      return new __PRIVATE_QueryImpl(ResourcePath.emptyPath(), e2);
    }(t)
  );
}
function doc(e, t, ...r) {
  if (e = getModularInstance(e), // We allow omission of 'pathString' but explicitly prohibit passing in both
  // 'undefined' and 'null'.
  1 === arguments.length && (t = __PRIVATE_AutoId.newId()), __PRIVATE_validateNonEmptyArgument("doc", "path", t), e instanceof Firestore) {
    const n = ResourcePath.fromString(t, ...r);
    return __PRIVATE_validateDocumentPath(n), new DocumentReference(
      e,
      /* converter= */
      null,
      new DocumentKey(n)
    );
  }
  {
    if (!(e instanceof DocumentReference || e instanceof CollectionReference)) throw new FirestoreError(E.INVALID_ARGUMENT, "Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
    const n = e._path.child(ResourcePath.fromString(t, ...r));
    return __PRIVATE_validateDocumentPath(n), new DocumentReference(e.firestore, e instanceof CollectionReference ? e.converter : null, new DocumentKey(n));
  }
}
function refEqual(e, t) {
  return e = getModularInstance(e), t = getModularInstance(t), (e instanceof DocumentReference || e instanceof CollectionReference) && (t instanceof DocumentReference || t instanceof CollectionReference) && (e.firestore === t.firestore && e.path === t.path && e.converter === t.converter);
}
function queryEqual(e, t) {
  return e = getModularInstance(e), t = getModularInstance(t), e instanceof Query && t instanceof Query && (e.firestore === t.firestore && __PRIVATE_queryEquals(e._query, t._query) && e.converter === t.converter);
}
var Bytes = class _Bytes {
  /** @hideconstructor */
  constructor(e) {
    this._byteString = e;
  }
  /**
   * Creates a new `Bytes` object from the given Base64 string, converting it to
   * bytes.
   *
   * @param base64 - The Base64 string used to create the `Bytes` object.
   */
  static fromBase64String(e) {
    try {
      return new _Bytes(ByteString.fromBase64String(e));
    } catch (e2) {
      throw new FirestoreError(E.INVALID_ARGUMENT, "Failed to construct data from Base64 string: " + e2);
    }
  }
  /**
   * Creates a new `Bytes` object from the given Uint8Array.
   *
   * @param array - The Uint8Array used to create the `Bytes` object.
   */
  static fromUint8Array(e) {
    return new _Bytes(ByteString.fromUint8Array(e));
  }
  /**
   * Returns the underlying bytes as a Base64-encoded string.
   *
   * @returns The Base64-encoded string created from the `Bytes` object.
   */
  toBase64() {
    return this._byteString.toBase64();
  }
  /**
   * Returns the underlying bytes in a new `Uint8Array`.
   *
   * @returns The Uint8Array created from the `Bytes` object.
   */
  toUint8Array() {
    return this._byteString.toUint8Array();
  }
  /**
   * Returns a string representation of the `Bytes` object.
   *
   * @returns A string representation of the `Bytes` object.
   */
  toString() {
    return "Bytes(base64: " + this.toBase64() + ")";
  }
  /**
   * Returns true if this `Bytes` object is equal to the provided one.
   *
   * @param other - The `Bytes` object to compare against.
   * @returns true if this `Bytes` object is equal to the provided one.
   */
  isEqual(e) {
    return this._byteString.isEqual(e._byteString);
  }
  /**
   * Returns a JSON-serializable representation of this `Bytes` instance.
   *
   * @returns a JSON representation of this object.
   */
  toJSON() {
    return {
      type: _Bytes._jsonSchemaVersion,
      bytes: this.toBase64()
    };
  }
  /**
   * Builds a `Bytes` instance from a JSON object created by {@link Bytes.toJSON}.
   *
   * @param json - a JSON object represention of a `Bytes` instance
   * @returns an instance of {@link Bytes} if the JSON object could be parsed. Throws a
   * {@link FirestoreError} if an error occurs.
   */
  static fromJSON(e) {
    if (__PRIVATE_validateJSON(e, _Bytes._jsonSchema)) return _Bytes.fromBase64String(e.bytes);
  }
};
Bytes._jsonSchemaVersion = "firestore/bytes/1.0", Bytes._jsonSchema = {
  type: property("string", Bytes._jsonSchemaVersion),
  bytes: property("string")
};
var FieldPath = class {
  /**
   * Creates a `FieldPath` from the provided field names. If more than one field
   * name is provided, the path will point to a nested field in a document.
   *
   * @param fieldNames - A list of field names.
   */
  constructor(...e) {
    for (let t = 0; t < e.length; ++t) if (0 === e[t].length) throw new FirestoreError(E.INVALID_ARGUMENT, "Invalid field name at argument $(i + 1). Field names must not be empty.");
    this._internalPath = new FieldPath$1(e);
  }
  /**
   * Returns true if this `FieldPath` is equal to the provided one.
   *
   * @param other - The `FieldPath` to compare against.
   * @returns true if this `FieldPath` is equal to the provided one.
   */
  isEqual(e) {
    return this._internalPath.isEqual(e._internalPath);
  }
};
function documentId() {
  return new FieldPath(R);
}
var FieldValue = class {
  /**
   * @param _methodName - The public API endpoint that returns this class.
   * @hideconstructor
   */
  constructor(e) {
    this._methodName = e;
  }
};
var GeoPoint = class _GeoPoint {
  /**
   * Creates a new immutable `GeoPoint` object with the provided latitude and
   * longitude values.
   * @param latitude - The latitude as number between -90 and 90.
   * @param longitude - The longitude as number between -180 and 180.
   */
  constructor(e, t) {
    if (!isFinite(e) || e < -90 || e > 90) throw new FirestoreError(E.INVALID_ARGUMENT, "Latitude must be a number between -90 and 90, but was: " + e);
    if (!isFinite(t) || t < -180 || t > 180) throw new FirestoreError(E.INVALID_ARGUMENT, "Longitude must be a number between -180 and 180, but was: " + t);
    this._lat = e, this._long = t;
  }
  /**
   * The latitude of this `GeoPoint` instance.
   */
  get latitude() {
    return this._lat;
  }
  /**
   * The longitude of this `GeoPoint` instance.
   */
  get longitude() {
    return this._long;
  }
  /**
   * Returns true if this `GeoPoint` is equal to the provided one.
   *
   * @param other - The `GeoPoint` to compare against.
   * @returns true if this `GeoPoint` is equal to the provided one.
   */
  isEqual(e) {
    return this._lat === e._lat && this._long === e._long;
  }
  /**
   * Actually private to JS consumers of our API, so this function is prefixed
   * with an underscore.
   */
  _compareTo(e) {
    return __PRIVATE_primitiveComparator(this._lat, e._lat) || __PRIVATE_primitiveComparator(this._long, e._long);
  }
  /**
   * Returns a JSON-serializable representation of this `GeoPoint` instance.
   *
   * @returns a JSON representation of this object.
   */
  toJSON() {
    return {
      latitude: this._lat,
      longitude: this._long,
      type: _GeoPoint._jsonSchemaVersion
    };
  }
  /**
   * Builds a `GeoPoint` instance from a JSON object created by {@link GeoPoint.toJSON}.
   *
   * @param json - a JSON object represention of a `GeoPoint` instance
   * @returns an instance of {@link GeoPoint} if the JSON object could be parsed. Throws a
   * {@link FirestoreError} if an error occurs.
   */
  static fromJSON(e) {
    if (__PRIVATE_validateJSON(e, _GeoPoint._jsonSchema)) return new _GeoPoint(e.latitude, e.longitude);
  }
};
GeoPoint._jsonSchemaVersion = "firestore/geoPoint/1.0", GeoPoint._jsonSchema = {
  type: property("string", GeoPoint._jsonSchemaVersion),
  latitude: property("number"),
  longitude: property("number")
};
var VectorValue = class _VectorValue {
  /**
   * @private
   * @internal
   */
  constructor(e) {
    this._values = (e || []).map((e2) => e2);
  }
  /**
   * Returns a copy of the raw number array form of the vector.
   */
  toArray() {
    return this._values.map((e) => e);
  }
  /**
   * Returns `true` if the two `VectorValue` values have the same raw number arrays, returns `false` otherwise.
   */
  isEqual(e) {
    return function __PRIVATE_isPrimitiveArrayEqual(e2, t) {
      if (e2.length !== t.length) return false;
      for (let r = 0; r < e2.length; ++r) if (e2[r] !== t[r]) return false;
      return true;
    }(this._values, e._values);
  }
  /**
   * Returns a JSON-serializable representation of this `VectorValue` instance.
   *
   * @returns a JSON representation of this object.
   */
  toJSON() {
    return {
      type: _VectorValue._jsonSchemaVersion,
      vectorValues: this._values
    };
  }
  /**
   * Builds a `VectorValue` instance from a JSON object created by {@link VectorValue.toJSON}.
   *
   * @param json - a JSON object represention of a `VectorValue` instance.
   * @returns an instance of {@link VectorValue} if the JSON object could be parsed. Throws a
   * {@link FirestoreError} if an error occurs.
   */
  static fromJSON(e) {
    if (__PRIVATE_validateJSON(e, _VectorValue._jsonSchema)) {
      if (Array.isArray(e.vectorValues) && e.vectorValues.every((e2) => "number" == typeof e2)) return new _VectorValue(e.vectorValues);
      throw new FirestoreError(E.INVALID_ARGUMENT, "Expected 'vectorValues' field to be a number array");
    }
  }
};
VectorValue._jsonSchemaVersion = "firestore/vectorValue/1.0", VectorValue._jsonSchema = {
  type: property("string", VectorValue._jsonSchemaVersion),
  vectorValues: property("object")
};
var x = /^__.*__$/;
var ParsedSetData = class {
  constructor(e, t, r) {
    this.data = e, this.fieldMask = t, this.fieldTransforms = r;
  }
  toMutation(e, t) {
    return null !== this.fieldMask ? new __PRIVATE_PatchMutation(e, this.data, this.fieldMask, t, this.fieldTransforms) : new __PRIVATE_SetMutation(e, this.data, t, this.fieldTransforms);
  }
};
var ParsedUpdateData = class {
  constructor(e, t, r) {
    this.data = e, this.fieldMask = t, this.fieldTransforms = r;
  }
  toMutation(e, t) {
    return new __PRIVATE_PatchMutation(e, this.data, this.fieldMask, t, this.fieldTransforms);
  }
};
function __PRIVATE_isWrite(e) {
  switch (e) {
    case 0:
    case 2:
    case 1:
      return true;
    case 3:
    case 4:
      return false;
    default:
      throw fail(40011, {
        dataSource: e
      });
  }
}
var __PRIVATE_ParseContextImpl = class ___PRIVATE_ParseContextImpl {
  /**
   * Initializes a ParseContext with the given source and path.
   *
   * @param settings - The settings for the parser.
   * @param databaseId - The database ID of the Firestore instance.
   * @param serializer - The serializer to use to generate the Value proto.
   * @param ignoreUndefinedProperties - Whether to ignore undefined properties
   * rather than throw.
   * @param fieldTransforms - A mutable list of field transforms encountered
   * while parsing the data.
   * @param fieldMask - A mutable list of field paths encountered while parsing
   * the data.
   *
   * TODO(b/34871131): We don't support array paths right now, so path can be
   * null to indicate the context represents any location within an array (in
   * which case certain features will not work and errors will be somewhat
   * compromised).
   */
  constructor(e, t, r, n, i, s) {
    this.settings = e, this.databaseId = t, this.serializer = r, this.ignoreUndefinedProperties = n, // Minor hack: If fieldTransforms is undefined, we assume this is an
    // external call and we need to validate the entire path.
    void 0 === i && this.G(), this.fieldTransforms = i || [], this.fieldMask = s || [];
  }
  get path() {
    return this.settings.path;
  }
  get dataSource() {
    return this.settings.dataSource;
  }
  /** Returns a new context with the specified settings overwritten. */
  ne(e) {
    return new ___PRIVATE_ParseContextImpl({
      ...this.settings,
      ...e
    }, this.databaseId, this.serializer, this.ignoreUndefinedProperties, this.fieldTransforms, this.fieldMask);
  }
  J(e) {
    var _a;
    const t = (_a = this.path) == null ? void 0 : _a.child(e), r = this.ne({
      path: t,
      arrayElement: false
    });
    return r.H(e), r;
  }
  Y(e) {
    var _a;
    const t = (_a = this.path) == null ? void 0 : _a.child(e), r = this.ne({
      path: t,
      arrayElement: false
    });
    return r.G(), r;
  }
  X(e) {
    return this.ne({
      path: void 0,
      arrayElement: true
    });
  }
  Z(e) {
    return __PRIVATE_createError(e, this.settings.methodName, this.settings.hasConverter || false, this.path, this.settings.targetDoc);
  }
  /** Returns 'true' if 'fieldPath' was traversed when creating this context. */
  contains(e) {
    return void 0 !== this.fieldMask.find((t) => e.isPrefixOf(t)) || void 0 !== this.fieldTransforms.find((t) => e.isPrefixOf(t.field));
  }
  G() {
    if (this.path) for (let e = 0; e < this.path.length; e++) this.H(this.path.get(e));
  }
  H(e) {
    if (0 === e.length) throw this.Z("Document fields must not be empty");
    if (__PRIVATE_isWrite(this.dataSource) && x.test(e)) throw this.Z('Document fields cannot begin and end with "__"');
  }
};
var __PRIVATE_UserDataReader = class {
  constructor(e, t, r) {
    this.databaseId = e, this.ignoreUndefinedProperties = t, this.serializer = r || __PRIVATE_newSerializer(e);
  }
  /** Creates a new top-level parse context. */
  Ee(e, t, r, n = false) {
    return new __PRIVATE_ParseContextImpl({
      dataSource: e,
      methodName: t,
      targetDoc: r,
      path: FieldPath$1.emptyPath(),
      arrayElement: false,
      hasConverter: n
    }, this.databaseId, this.serializer, this.ignoreUndefinedProperties);
  }
};
function __PRIVATE_newUserDataReader(e) {
  const t = e._freezeSettings(), r = __PRIVATE_newSerializer(e._databaseId);
  return new __PRIVATE_UserDataReader(e._databaseId, !!t.ignoreUndefinedProperties, r);
}
function __PRIVATE_parseSetData(e, t, r, n, i, s = {}) {
  const o = e.Ee(s.merge || s.mergeFields ? 2 : 0, t, r, i);
  __PRIVATE_validatePlainObject("Data must be an object, but it was:", o, n);
  const a = __PRIVATE_parseObject(n, o);
  let u, _;
  if (s.merge) u = new FieldMask(o.fieldMask), _ = o.fieldTransforms;
  else if (s.mergeFields) {
    const e2 = [];
    for (const n2 of s.mergeFields) {
      const i2 = __PRIVATE_fieldPathFromArgument(t, n2, r);
      if (!o.contains(i2)) throw new FirestoreError(E.INVALID_ARGUMENT, `Field '${i2}' is specified in your field mask but missing from your input data.`);
      __PRIVATE_fieldMaskContains(e2, i2) || e2.push(i2);
    }
    u = new FieldMask(e2), _ = o.fieldTransforms.filter((e3) => u.covers(e3.field));
  } else u = null, _ = o.fieldTransforms;
  return new ParsedSetData(new ObjectValue(a), u, _);
}
var __PRIVATE_DeleteFieldValueImpl = class ___PRIVATE_DeleteFieldValueImpl extends FieldValue {
  _toFieldTransform(e) {
    if (2 !== e.dataSource) throw 1 === e.dataSource ? e.Z(`${this._methodName}() can only appear at the top level of your update data`) : e.Z(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);
    return e.fieldMask.push(e.path), null;
  }
  isEqual(e) {
    return e instanceof ___PRIVATE_DeleteFieldValueImpl;
  }
};
function __PRIVATE_createSentinelChildContext(e, t, r) {
  return new __PRIVATE_ParseContextImpl({
    dataSource: 3,
    targetDoc: t.settings.targetDoc,
    methodName: e._methodName,
    arrayElement: r
  }, t.databaseId, t.serializer, t.ignoreUndefinedProperties);
}
var __PRIVATE_ServerTimestampFieldValueImpl = class ___PRIVATE_ServerTimestampFieldValueImpl extends FieldValue {
  _toFieldTransform(e) {
    return new FieldTransform(e.path, new __PRIVATE_ServerTimestampTransform());
  }
  isEqual(e) {
    return e instanceof ___PRIVATE_ServerTimestampFieldValueImpl;
  }
};
var __PRIVATE_ArrayUnionFieldValueImpl = class ___PRIVATE_ArrayUnionFieldValueImpl extends FieldValue {
  constructor(e, t) {
    super(e), this.te = t;
  }
  _toFieldTransform(e) {
    const t = __PRIVATE_createSentinelChildContext(
      this,
      e,
      /*array=*/
      true
    ), r = this.te.map((e2) => __PRIVATE_parseData(e2, t)), n = new __PRIVATE_ArrayUnionTransformOperation(r);
    return new FieldTransform(e.path, n);
  }
  isEqual(e) {
    return e instanceof ___PRIVATE_ArrayUnionFieldValueImpl && deepEqual(this.te, e.te);
  }
};
var __PRIVATE_ArrayRemoveFieldValueImpl = class ___PRIVATE_ArrayRemoveFieldValueImpl extends FieldValue {
  constructor(e, t) {
    super(e), this.te = t;
  }
  _toFieldTransform(e) {
    const t = __PRIVATE_createSentinelChildContext(
      this,
      e,
      /*array=*/
      true
    ), r = this.te.map((e2) => __PRIVATE_parseData(e2, t)), n = new __PRIVATE_ArrayRemoveTransformOperation(r);
    return new FieldTransform(e.path, n);
  }
  isEqual(e) {
    return e instanceof ___PRIVATE_ArrayRemoveFieldValueImpl && deepEqual(this.te, e.te);
  }
};
var __PRIVATE_NumericIncrementFieldValueImpl = class ___PRIVATE_NumericIncrementFieldValueImpl extends FieldValue {
  constructor(e, t) {
    super(e), this.re = t;
  }
  _toFieldTransform(e) {
    const t = new __PRIVATE_NumericIncrementTransformOperation(e.serializer, toNumber(e.serializer, this.re));
    return new FieldTransform(e.path, t);
  }
  isEqual(e) {
    return e instanceof ___PRIVATE_NumericIncrementFieldValueImpl && this.re === e.re;
  }
};
function __PRIVATE_parseUpdateData(e, t, r, n) {
  const i = e.Ee(1, t, r);
  __PRIVATE_validatePlainObject("Data must be an object, but it was:", i, n);
  const s = [], a = ObjectValue.empty();
  forEach(n, (e2, n2) => {
    const u2 = __PRIVATE_fieldPathFromDotSeparatedString(t, e2, r);
    n2 = getModularInstance(n2);
    const _ = i.Y(u2);
    if (n2 instanceof __PRIVATE_DeleteFieldValueImpl)
      s.push(u2);
    else {
      const e3 = __PRIVATE_parseData(n2, _);
      null != e3 && (s.push(u2), a.set(u2, e3));
    }
  });
  const u = new FieldMask(s);
  return new ParsedUpdateData(a, u, i.fieldTransforms);
}
function __PRIVATE_parseUpdateVarargs(e, t, r, n, i, s) {
  const a = e.Ee(1, t, r), u = [__PRIVATE_fieldPathFromArgument(t, n, r)], _ = [i];
  if (s.length % 2 != 0) throw new FirestoreError(E.INVALID_ARGUMENT, `Function ${t}() needs to be called with an even number of arguments that alternate between field names and values.`);
  for (let e2 = 0; e2 < s.length; e2 += 2) u.push(__PRIVATE_fieldPathFromArgument(t, s[e2])), _.push(s[e2 + 1]);
  const c = [], l = ObjectValue.empty();
  for (let e2 = u.length - 1; e2 >= 0; --e2) if (!__PRIVATE_fieldMaskContains(c, u[e2])) {
    const t2 = u[e2];
    let r2 = _[e2];
    r2 = getModularInstance(r2);
    const n2 = a.Y(t2);
    if (r2 instanceof __PRIVATE_DeleteFieldValueImpl)
      c.push(t2);
    else {
      const e3 = __PRIVATE_parseData(r2, n2);
      null != e3 && (c.push(t2), l.set(t2, e3));
    }
  }
  const h = new FieldMask(c);
  return new ParsedUpdateData(l, h, a.fieldTransforms);
}
function __PRIVATE_parseQueryValue(e, t, r, n = false) {
  return __PRIVATE_parseData(r, e.Ee(n ? 4 : 3, t));
}
function __PRIVATE_parseData(e, t) {
  if (__PRIVATE_looksLikeJsonObject(
    // Unwrap the API type from the Compat SDK. This will return the API type
    // from firestore-exp.
    e = getModularInstance(e)
  )) return __PRIVATE_validatePlainObject("Unsupported field value:", t, e), __PRIVATE_parseObject(e, t);
  if (e instanceof FieldValue)
    return function __PRIVATE_parseSentinelFieldValue(e2, t2) {
      if (!__PRIVATE_isWrite(t2.dataSource)) throw t2.Z(`${e2._methodName}() can only be used with update() and set()`);
      if (!t2.path) throw t2.Z(`${e2._methodName}() is not currently supported inside arrays`);
      const r = e2._toFieldTransform(t2);
      r && t2.fieldTransforms.push(r);
    }(e, t), null;
  if (void 0 === e && t.ignoreUndefinedProperties)
    return null;
  if (
    // If context.path is null we are inside an array and we don't support
    // field mask paths more granular than the top-level array.
    t.path && t.fieldMask.push(t.path), e instanceof Array
  ) {
    if (t.settings.arrayElement && 4 !== t.dataSource) throw t.Z("Nested arrays are not supported");
    return function __PRIVATE_parseArray(e2, t2) {
      const r = [];
      let n = 0;
      for (const i of e2) {
        let e3 = __PRIVATE_parseData(i, t2.X(n));
        null == e3 && // Just include nulls in the array for fields being replaced with a
        // sentinel.
        (e3 = {
          nullValue: "NULL_VALUE"
        }), r.push(e3), n++;
      }
      return {
        arrayValue: {
          values: r
        }
      };
    }(e, t);
  }
  return function __PRIVATE_parseScalarValue(e2, t2) {
    if (null === (e2 = getModularInstance(e2))) return {
      nullValue: "NULL_VALUE"
    };
    if ("number" == typeof e2) return toNumber(t2.serializer, e2);
    if ("boolean" == typeof e2) return {
      booleanValue: e2
    };
    if ("string" == typeof e2) return {
      stringValue: e2
    };
    if (e2 instanceof Date) {
      const r = Timestamp.fromDate(e2);
      return {
        timestampValue: toTimestamp(t2.serializer, r)
      };
    }
    if (e2 instanceof Timestamp) {
      const r = new Timestamp(e2.seconds, 1e3 * Math.floor(e2.nanoseconds / 1e3));
      return {
        timestampValue: toTimestamp(t2.serializer, r)
      };
    }
    if (e2 instanceof GeoPoint) return {
      geoPointValue: {
        latitude: e2.latitude,
        longitude: e2.longitude
      }
    };
    if (e2 instanceof Bytes) return {
      bytesValue: __PRIVATE_toBytes(t2.serializer, e2._byteString)
    };
    if (e2 instanceof DocumentReference) {
      const r = t2.databaseId, n = e2.firestore._databaseId;
      if (!n.isEqual(r)) throw t2.Z(`Document reference is for database ${n.projectId}/${n.database} but should be for database ${r.projectId}/${r.database}`);
      return {
        referenceValue: __PRIVATE_toResourceName(e2.firestore._databaseId || t2.databaseId, e2._key.path)
      };
    }
    if (e2 instanceof VectorValue)
      return function __PRIVATE_parseVectorValue(e3, t3) {
        const r = e3 instanceof VectorValue ? e3.toArray() : e3, n = {
          fields: {
            [b]: {
              stringValue: C
            },
            [N]: {
              arrayValue: {
                values: r.map((e4) => {
                  if ("number" != typeof e4) throw t3.Z("VectorValues must only contain numeric values.");
                  return __PRIVATE_toDouble(t3.serializer, e4);
                })
              }
            }
          }
        };
        return {
          mapValue: n
        };
      }(e2, t2);
    if (__PRIVATE_isProtoValueSerializable(e2)) return e2._toProto(t2.serializer);
    throw t2.Z(`Unsupported field value: ${__PRIVATE_valueDescription(e2)}`);
  }(e, t);
}
function __PRIVATE_parseObject(e, t) {
  const r = {};
  return !function isEmpty(e2) {
    for (const t2 in e2) if (Object.prototype.hasOwnProperty.call(e2, t2)) return false;
    return true;
  }(e) ? forEach(e, (e2, n) => {
    const i = __PRIVATE_parseData(n, t.J(e2));
    null != i && (r[e2] = i);
  }) : (
    // If we encounter an empty object, we explicitly add it to the update
    // mask to ensure that the server creates a map entry.
    t.path && t.path.length > 0 && t.fieldMask.push(t.path)
  ), {
    mapValue: {
      fields: r
    }
  };
}
function __PRIVATE_looksLikeJsonObject(e) {
  return !("object" != typeof e || null === e || e instanceof Array || e instanceof Date || e instanceof Timestamp || e instanceof GeoPoint || e instanceof Bytes || e instanceof DocumentReference || e instanceof FieldValue || e instanceof VectorValue || __PRIVATE_isProtoValueSerializable(e));
}
function __PRIVATE_validatePlainObject(e, t, r) {
  if (!__PRIVATE_looksLikeJsonObject(r) || !__PRIVATE_isPlainObject(r)) {
    const n = __PRIVATE_valueDescription(r);
    throw "an object" === n ? t.Z(e + " a custom object") : t.Z(e + " " + n);
  }
}
function __PRIVATE_fieldPathFromArgument(e, t, r) {
  if (
    // If required, replace the FieldPath Compat class with the firestore-exp
    // FieldPath.
    (t = getModularInstance(t)) instanceof FieldPath
  ) return t._internalPath;
  if ("string" == typeof t) return __PRIVATE_fieldPathFromDotSeparatedString(e, t);
  throw __PRIVATE_createError(
    "Field path arguments must be of type string or ",
    e,
    /* hasConverter= */
    false,
    /* path= */
    void 0,
    r
  );
}
var k = new RegExp("[~\\*/\\[\\]]");
function __PRIVATE_fieldPathFromDotSeparatedString(e, t, r) {
  if (t.search(k) >= 0) throw __PRIVATE_createError(
    `Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,
    e,
    /* hasConverter= */
    false,
    /* path= */
    void 0,
    r
  );
  try {
    return new FieldPath(...t.split("."))._internalPath;
  } catch (n) {
    throw __PRIVATE_createError(
      `Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,
      e,
      /* hasConverter= */
      false,
      /* path= */
      void 0,
      r
    );
  }
}
function __PRIVATE_createError(e, t, r, n, i) {
  const s = n && !n.isEmpty(), o = void 0 !== i;
  let a = `Function ${t}() called with invalid data`;
  r && (a += " (via `toFirestore()`)"), a += ". ";
  let u = "";
  return (s || o) && (u += " (found", s && (u += ` in field ${n}`), o && (u += ` in document ${i}`), u += ")"), new FirestoreError(E.INVALID_ARGUMENT, a + e + u);
}
function __PRIVATE_fieldMaskContains(e, t) {
  return e.some((e2) => e2.isEqual(t));
}
var DocumentSnapshot = class {
  // Note: This class is stripped down version of the DocumentSnapshot in
  // the legacy SDK. The changes are:
  // - No support for SnapshotMetadata.
  // - No support for SnapshotOptions.
  /** @hideconstructor protected */
  constructor(e, t, r, n, i) {
    this._firestore = e, this._userDataWriter = t, this._key = r, this._document = n, this._converter = i;
  }
  /** Property of the `DocumentSnapshot` that provides the document's ID. */
  get id() {
    return this._key.path.lastSegment();
  }
  /**
   * The `DocumentReference` for the document included in the `DocumentSnapshot`.
   */
  get ref() {
    return new DocumentReference(this._firestore, this._converter, this._key);
  }
  /**
   * Signals whether or not the document at the snapshot's location exists.
   *
   * @returns true if the document exists.
   */
  exists() {
    return null !== this._document;
  }
  /**
   * Retrieves all fields in the document as an `Object`. Returns `undefined` if
   * the document doesn't exist.
   *
   * @returns An `Object` containing all fields in the document or `undefined`
   * if the document doesn't exist.
   */
  data() {
    if (this._document) {
      if (this._converter) {
        const e = new QueryDocumentSnapshot(
          this._firestore,
          this._userDataWriter,
          this._key,
          this._document,
          /* converter= */
          null
        );
        return this._converter.fromFirestore(e);
      }
      return this._userDataWriter.convertValue(this._document.data.value);
    }
  }
  /**
   * @internal
   * @private
   *
   * Retrieves all fields in the document as a proto Value. Returns `undefined` if
   * the document doesn't exist.
   *
   * @returns An `Object` containing all fields in the document or `undefined`
   * if the document doesn't exist.
   */
  _fieldsProto() {
    var _a;
    return ((_a = this._document) == null ? void 0 : _a.data.clone().value.mapValue.fields) ?? void 0;
  }
  /**
   * Retrieves the field specified by `fieldPath`. Returns `undefined` if the
   * document or field doesn't exist.
   *
   * @param fieldPath - The path (for example 'foo' or 'foo.bar') to a specific
   * field.
   * @returns The data at the specified field location or undefined if no such
   * field exists in the document.
   */
  // We are using `any` here to avoid an explicit cast by our users.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(e) {
    if (this._document) {
      const t = this._document.data.field(__PRIVATE_fieldPathFromArgument("DocumentSnapshot.get", e));
      if (null !== t) return this._userDataWriter.convertValue(t);
    }
  }
};
var QueryDocumentSnapshot = class extends DocumentSnapshot {
  /**
   * Retrieves all fields in the document as an `Object`.
   *
   * @override
   * @returns An `Object` containing all fields in the document.
   */
  data() {
    return super.data();
  }
};
var QuerySnapshot = class {
  /** @hideconstructor */
  constructor(e, t) {
    this._docs = t, this.query = e;
  }
  /** An array of all the documents in the `QuerySnapshot`. */
  get docs() {
    return [...this._docs];
  }
  /** The number of documents in the `QuerySnapshot`. */
  get size() {
    return this.docs.length;
  }
  /** True if there are no documents in the `QuerySnapshot`. */
  get empty() {
    return 0 === this.docs.length;
  }
  /**
   * Enumerates all of the documents in the `QuerySnapshot`.
   *
   * @param callback - A callback to be called with a `QueryDocumentSnapshot` for
   * each document in the snapshot.
   * @param thisArg - The `this` binding for the callback.
   */
  forEach(e, t) {
    this._docs.forEach(e, t);
  }
};
function snapshotEqual(e, t) {
  return e = getModularInstance(e), t = getModularInstance(t), e instanceof DocumentSnapshot && t instanceof DocumentSnapshot ? e._firestore === t._firestore && e._key.isEqual(t._key) && (null === e._document ? null === t._document : e._document.isEqual(t._document)) && e._converter === t._converter : e instanceof QuerySnapshot && t instanceof QuerySnapshot && (queryEqual(e.query, t.query) && __PRIVATE_arrayEquals(e.docs, t.docs, snapshotEqual));
}
var AppliableConstraint = class {
};
var QueryConstraint = class extends AppliableConstraint {
};
function query(e, t, ...r) {
  let n = [];
  t instanceof AppliableConstraint && n.push(t), n = n.concat(r), function __PRIVATE_validateQueryConstraintArray(e2) {
    const t2 = e2.filter((e3) => e3 instanceof QueryCompositeFilterConstraint).length, r2 = e2.filter((e3) => e3 instanceof QueryFieldFilterConstraint).length;
    if (t2 > 1 || t2 > 0 && r2 > 0) throw new FirestoreError(E.INVALID_ARGUMENT, "InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.");
  }(n);
  for (const t2 of n) e = t2._apply(e);
  return e;
}
var QueryFieldFilterConstraint = class _QueryFieldFilterConstraint extends QueryConstraint {
  /**
   * @internal
   */
  constructor(e, t, r) {
    super(), this._field = e, this._op = t, this._value = r, /** The type of this query constraint */
    this.type = "where";
  }
  static _create(e, t, r) {
    return new _QueryFieldFilterConstraint(e, t, r);
  }
  _apply(e) {
    const t = this._parse(e);
    return __PRIVATE_validateNewFieldFilter(e._query, t), new Query(e.firestore, e.converter, __PRIVATE_queryWithAddedFilter(e._query, t));
  }
  _parse(e) {
    const t = __PRIVATE_newUserDataReader(e.firestore), r = function __PRIVATE_newQueryFilter(e2, t2, r2, n, i, s, o) {
      let a;
      if (i.isKeyField()) {
        if ("array-contains" === s || "array-contains-any" === s) throw new FirestoreError(E.INVALID_ARGUMENT, `Invalid Query. You can't perform '${s}' queries on documentId().`);
        if ("in" === s || "not-in" === s) {
          __PRIVATE_validateDisjunctiveFilterElements(o, s);
          const t3 = [];
          for (const r3 of o) t3.push(__PRIVATE_parseDocumentIdValue(n, e2, r3));
          a = {
            arrayValue: {
              values: t3
            }
          };
        } else a = __PRIVATE_parseDocumentIdValue(n, e2, o);
      } else "in" !== s && "not-in" !== s && "array-contains-any" !== s || __PRIVATE_validateDisjunctiveFilterElements(o, s), a = __PRIVATE_parseQueryValue(
        r2,
        t2,
        o,
        /* allowArrays= */
        "in" === s || "not-in" === s
      );
      const u = FieldFilter.create(i, s, a);
      return u;
    }(e._query, "where", t, e.firestore._databaseId, this._field, this._op, this._value);
    return r;
  }
};
function where(e, t, r) {
  const n = t, i = __PRIVATE_fieldPathFromArgument("where", e);
  return QueryFieldFilterConstraint._create(i, n, r);
}
var QueryCompositeFilterConstraint = class _QueryCompositeFilterConstraint extends AppliableConstraint {
  /**
   * @internal
   */
  constructor(e, t) {
    super(), this.type = e, this._queryConstraints = t;
  }
  static _create(e, t) {
    return new _QueryCompositeFilterConstraint(e, t);
  }
  _parse(e) {
    const t = this._queryConstraints.map((t2) => t2._parse(e)).filter((e2) => e2.getFilters().length > 0);
    return 1 === t.length ? t[0] : CompositeFilter.create(t, this._getOperator());
  }
  _apply(e) {
    const t = this._parse(e);
    return 0 === t.getFilters().length ? e : (function __PRIVATE_validateNewFilter(e2, t2) {
      let r = e2;
      const n = t2.getFlattenedFilters();
      for (const e3 of n) __PRIVATE_validateNewFieldFilter(r, e3), r = __PRIVATE_queryWithAddedFilter(r, e3);
    }(e._query, t), new Query(e.firestore, e.converter, __PRIVATE_queryWithAddedFilter(e._query, t)));
  }
  _getQueryConstraints() {
    return this._queryConstraints;
  }
  _getOperator() {
    return "and" === this.type ? "and" : "or";
  }
};
function or(...e) {
  return e.forEach((e2) => __PRIVATE_validateQueryFilterConstraint("or", e2)), QueryCompositeFilterConstraint._create("or", e);
}
function and(...e) {
  return e.forEach((e2) => __PRIVATE_validateQueryFilterConstraint("and", e2)), QueryCompositeFilterConstraint._create("and", e);
}
var QueryOrderByConstraint = class _QueryOrderByConstraint extends QueryConstraint {
  /**
   * @internal
   */
  constructor(e, t) {
    super(), this._field = e, this._direction = t, /** The type of this query constraint */
    this.type = "orderBy";
  }
  static _create(e, t) {
    return new _QueryOrderByConstraint(e, t);
  }
  _apply(e) {
    const t = function __PRIVATE_newQueryOrderBy(e2, t2, r) {
      if (null !== e2.startAt) throw new FirestoreError(E.INVALID_ARGUMENT, "Invalid query. You must not call startAt() or startAfter() before calling orderBy().");
      if (null !== e2.endAt) throw new FirestoreError(E.INVALID_ARGUMENT, "Invalid query. You must not call endAt() or endBefore() before calling orderBy().");
      const n = new OrderBy(t2, r);
      return n;
    }(e._query, this._field, this._direction);
    return new Query(e.firestore, e.converter, function __PRIVATE_queryWithAddedOrderBy(e2, t2) {
      const r = e2.explicitOrderBy.concat([t2]);
      return new __PRIVATE_QueryImpl(e2.path, e2.collectionGroup, r, e2.filters.slice(), e2.limit, e2.limitType, e2.startAt, e2.endAt);
    }(e._query, t));
  }
};
function orderBy(e, t = "asc") {
  const r = t, n = __PRIVATE_fieldPathFromArgument("orderBy", e);
  return QueryOrderByConstraint._create(n, r);
}
var QueryLimitConstraint = class _QueryLimitConstraint extends QueryConstraint {
  /**
   * @internal
   */
  constructor(e, t, r) {
    super(), this.type = e, this._limit = t, this._limitType = r;
  }
  static _create(e, t, r) {
    return new _QueryLimitConstraint(e, t, r);
  }
  _apply(e) {
    return new Query(e.firestore, e.converter, function __PRIVATE_queryWithLimit(e2, t, r) {
      return new __PRIVATE_QueryImpl(e2.path, e2.collectionGroup, e2.explicitOrderBy.slice(), e2.filters.slice(), t, r, e2.startAt, e2.endAt);
    }(e._query, this._limit, this._limitType));
  }
};
function limit(e) {
  return __PRIVATE_validatePositiveNumber("limit", e), QueryLimitConstraint._create(
    "limit",
    e,
    "F"
    /* LimitType.First */
  );
}
function limitToLast(e) {
  return __PRIVATE_validatePositiveNumber("limitToLast", e), QueryLimitConstraint._create(
    "limitToLast",
    e,
    "L"
    /* LimitType.Last */
  );
}
var QueryStartAtConstraint = class _QueryStartAtConstraint extends QueryConstraint {
  /**
   * @internal
   */
  constructor(e, t, r) {
    super(), this.type = e, this._docOrFields = t, this._inclusive = r;
  }
  static _create(e, t, r) {
    return new _QueryStartAtConstraint(e, t, r);
  }
  _apply(e) {
    const t = __PRIVATE_newQueryBoundFromDocOrFields(e, this.type, this._docOrFields, this._inclusive);
    return new Query(e.firestore, e.converter, function __PRIVATE_queryWithStartAt(e2, t2) {
      return new __PRIVATE_QueryImpl(e2.path, e2.collectionGroup, e2.explicitOrderBy.slice(), e2.filters.slice(), e2.limit, e2.limitType, t2, e2.endAt);
    }(e._query, t));
  }
};
function startAt(...e) {
  return QueryStartAtConstraint._create(
    "startAt",
    e,
    /*inclusive=*/
    true
  );
}
function startAfter(...e) {
  return QueryStartAtConstraint._create(
    "startAfter",
    e,
    /*inclusive=*/
    false
  );
}
var QueryEndAtConstraint = class _QueryEndAtConstraint extends QueryConstraint {
  /**
   * @internal
   */
  constructor(e, t, r) {
    super(), this.type = e, this._docOrFields = t, this._inclusive = r;
  }
  static _create(e, t, r) {
    return new _QueryEndAtConstraint(e, t, r);
  }
  _apply(e) {
    const t = __PRIVATE_newQueryBoundFromDocOrFields(e, this.type, this._docOrFields, this._inclusive);
    return new Query(e.firestore, e.converter, function __PRIVATE_queryWithEndAt(e2, t2) {
      return new __PRIVATE_QueryImpl(e2.path, e2.collectionGroup, e2.explicitOrderBy.slice(), e2.filters.slice(), e2.limit, e2.limitType, e2.startAt, t2);
    }(e._query, t));
  }
};
function endBefore(...e) {
  return QueryEndAtConstraint._create(
    "endBefore",
    e,
    /*inclusive=*/
    false
  );
}
function endAt(...e) {
  return QueryEndAtConstraint._create(
    "endAt",
    e,
    /*inclusive=*/
    true
  );
}
function __PRIVATE_newQueryBoundFromDocOrFields(e, t, r, n) {
  if (r[0] = getModularInstance(r[0]), r[0] instanceof DocumentSnapshot) return function __PRIVATE_newQueryBoundFromDocument(e2, t2, r2, n2, i) {
    if (!n2) throw new FirestoreError(E.NOT_FOUND, `Can't use a DocumentSnapshot that doesn't exist for ${r2}().`);
    const s = [];
    for (const r3 of __PRIVATE_queryNormalizedOrderBy(e2)) if (r3.field.isKeyField()) s.push(__PRIVATE_refValue(t2, n2.key));
    else {
      const e3 = n2.data.field(r3.field);
      if (__PRIVATE_isServerTimestamp(e3)) throw new FirestoreError(E.INVALID_ARGUMENT, 'Invalid query. You are trying to start or end a query using a document for which the field "' + r3.field + '" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');
      if (null === e3) {
        const e4 = r3.field.canonicalString();
        throw new FirestoreError(E.INVALID_ARGUMENT, `Invalid query. You are trying to start or end a query using a document for which the field '${e4}' (used as the orderBy) does not exist.`);
      }
      s.push(e3);
    }
    return new Bound(s, i);
  }(e._query, e.firestore._databaseId, t, r[0]._document, n);
  {
    const i = __PRIVATE_newUserDataReader(e.firestore);
    return function __PRIVATE_newQueryBoundFromFields(e2, t2, r2, n2, i2, s) {
      const o = e2.explicitOrderBy;
      if (i2.length > o.length) throw new FirestoreError(E.INVALID_ARGUMENT, `Too many arguments provided to ${n2}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);
      const a = [];
      for (let s2 = 0; s2 < i2.length; s2++) {
        const u = i2[s2];
        if (o[s2].field.isKeyField()) {
          if ("string" != typeof u) throw new FirestoreError(E.INVALID_ARGUMENT, `Invalid query. Expected a string for document ID in ${n2}(), but got a ${typeof u}`);
          if (!__PRIVATE_isCollectionGroupQuery(e2) && -1 !== u.indexOf("/")) throw new FirestoreError(E.INVALID_ARGUMENT, `Invalid query. When querying a collection and ordering by documentId(), the value passed to ${n2}() must be a plain document ID, but '${u}' contains a slash.`);
          const r3 = e2.path.child(ResourcePath.fromString(u));
          if (!DocumentKey.isDocumentKey(r3)) throw new FirestoreError(E.INVALID_ARGUMENT, `Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${n2}() must result in a valid document path, but '${r3}' is not because it contains an odd number of segments.`);
          const i3 = new DocumentKey(r3);
          a.push(__PRIVATE_refValue(t2, i3));
        } else {
          const e3 = __PRIVATE_parseQueryValue(r2, n2, u);
          a.push(e3);
        }
      }
      return new Bound(a, s);
    }(e._query, e.firestore._databaseId, i, t, r, n);
  }
}
function __PRIVATE_parseDocumentIdValue(e, t, r) {
  if ("string" == typeof (r = getModularInstance(r))) {
    if ("" === r) throw new FirestoreError(E.INVALID_ARGUMENT, "Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");
    if (!__PRIVATE_isCollectionGroupQuery(t) && -1 !== r.indexOf("/")) throw new FirestoreError(E.INVALID_ARGUMENT, `Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${r}' contains a '/' character.`);
    const n = t.path.child(ResourcePath.fromString(r));
    if (!DocumentKey.isDocumentKey(n)) throw new FirestoreError(E.INVALID_ARGUMENT, `Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${n}' is not because it has an odd number of segments (${n.length}).`);
    return __PRIVATE_refValue(e, new DocumentKey(n));
  }
  if (r instanceof DocumentReference) return __PRIVATE_refValue(e, r._key);
  throw new FirestoreError(E.INVALID_ARGUMENT, `Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${__PRIVATE_valueDescription(r)}.`);
}
function __PRIVATE_validateDisjunctiveFilterElements(e, t) {
  if (!Array.isArray(e) || 0 === e.length) throw new FirestoreError(E.INVALID_ARGUMENT, `Invalid Query. A non-empty array is required for '${t.toString()}' filters.`);
}
function __PRIVATE_validateNewFieldFilter(e, t) {
  const r = function __PRIVATE_findOpInsideFilters(e2, t2) {
    for (const r2 of e2) for (const e3 of r2.getFlattenedFilters()) if (t2.indexOf(e3.op) >= 0) return e3.op;
    return null;
  }(e.filters, function __PRIVATE_conflictingOps(e2) {
    switch (e2) {
      case "!=":
        return [
          "!=",
          "not-in"
          /* Operator.NOT_IN */
        ];
      case "array-contains-any":
      case "in":
        return [
          "not-in"
          /* Operator.NOT_IN */
        ];
      case "not-in":
        return [
          "array-contains-any",
          "in",
          "not-in",
          "!="
          /* Operator.NOT_EQUAL */
        ];
      default:
        return [];
    }
  }(t.op));
  if (null !== r)
    throw r === t.op ? new FirestoreError(E.INVALID_ARGUMENT, `Invalid query. You cannot use more than one '${t.op.toString()}' filter.`) : new FirestoreError(E.INVALID_ARGUMENT, `Invalid query. You cannot use '${t.op.toString()}' filters with '${r.toString()}' filters.`);
}
function __PRIVATE_validateQueryFilterConstraint(e, t) {
  if (!(t instanceof QueryFieldFilterConstraint || t instanceof QueryCompositeFilterConstraint)) throw new FirestoreError(E.INVALID_ARGUMENT, `Function ${e}() requires AppliableConstraints created with a call to 'where(...)', 'or(...)', or 'and(...)'.`);
}
var AbstractUserDataWriter = class {
  convertValue(e, t = "none") {
    switch (__PRIVATE_typeOrder(e)) {
      case 0:
        return null;
      case 1:
        return e.booleanValue;
      case 2:
        return __PRIVATE_normalizeNumber(e.integerValue || e.doubleValue);
      case 3:
        return this.convertTimestamp(e.timestampValue);
      case 4:
        return this.convertServerTimestamp(e, t);
      case 5:
        return e.stringValue;
      case 6:
        return this.convertBytes(__PRIVATE_normalizeByteString(e.bytesValue));
      case 7:
        return this.convertReference(e.referenceValue);
      case 8:
        return this.convertGeoPoint(e.geoPointValue);
      case 9:
        return this.convertArray(e.arrayValue, t);
      case 11:
        return this.convertObject(e.mapValue, t);
      case 10:
        return this.convertVectorValue(e.mapValue);
      default:
        throw fail(62114, {
          value: e
        });
    }
  }
  convertObject(e, t) {
    return this.convertObjectMap(e.fields, t);
  }
  /**
   * @internal
   */
  convertObjectMap(e, t = "none") {
    const r = {};
    return forEach(e, (e2, n) => {
      r[e2] = this.convertValue(n, t);
    }), r;
  }
  /**
   * @internal
   */
  convertVectorValue(e) {
    var _a, _b, _c;
    const t = (_c = (_b = (_a = e.fields) == null ? void 0 : _a[N].arrayValue) == null ? void 0 : _b.values) == null ? void 0 : _c.map((e2) => __PRIVATE_normalizeNumber(e2.doubleValue));
    return new VectorValue(t);
  }
  convertGeoPoint(e) {
    return new GeoPoint(__PRIVATE_normalizeNumber(e.latitude), __PRIVATE_normalizeNumber(e.longitude));
  }
  convertArray(e, t) {
    return (e.values || []).map((e2) => this.convertValue(e2, t));
  }
  convertServerTimestamp(e, t) {
    switch (t) {
      case "previous":
        const r = __PRIVATE_getPreviousValue(e);
        return null == r ? null : this.convertValue(r, t);
      case "estimate":
        return this.convertTimestamp(__PRIVATE_getLocalWriteTime(e));
      default:
        return null;
    }
  }
  convertTimestamp(e) {
    const t = __PRIVATE_normalizeTimestamp(e);
    return new Timestamp(t.seconds, t.nanos);
  }
  convertDocumentKey(e, t) {
    const r = ResourcePath.fromString(e);
    __PRIVATE_hardAssert(__PRIVATE_isValidResourceName(r), 9688, {
      name: e
    });
    const n = new DatabaseId(r.get(1), r.get(3)), i = new DocumentKey(r.popFirst(5));
    return n.isEqual(t) || // TODO(b/64130202): Somehow support foreign references.
    __PRIVATE_logError(`Document ${i} contains a document reference within a different database (${n.projectId}/${n.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`), i;
  }
};
function __PRIVATE_applyFirestoreDataConverter(e, t, r) {
  let n;
  return n = e ? r && (r.merge || r.mergeFields) ? e.toFirestore(t, r) : e.toFirestore(t) : t, n;
}
var __PRIVATE_LiteUserDataWriter = class extends AbstractUserDataWriter {
  constructor(e) {
    super(), this.firestore = e;
  }
  convertBytes(e) {
    return new Bytes(e);
  }
  convertReference(e) {
    const t = this.convertDocumentKey(e, this.firestore._databaseId);
    return new DocumentReference(
      this.firestore,
      /* converter= */
      null,
      t
    );
  }
};
function getDoc(e) {
  const t = __PRIVATE_getDatastore((e = __PRIVATE_cast(e, DocumentReference)).firestore), r = new __PRIVATE_LiteUserDataWriter(e.firestore);
  return __PRIVATE_invokeBatchGetDocumentsRpc(t, [e._key]).then((t2) => {
    __PRIVATE_hardAssert(1 === t2.length, 15618);
    const n = t2[0];
    return new DocumentSnapshot(e.firestore, r, e._key, n.isFoundDocument() ? n : null, e.converter);
  });
}
function getDocs(e) {
  (function __PRIVATE_validateHasExplicitOrderByForLimitToLast(e2) {
    if ("L" === e2.limitType && 0 === e2.explicitOrderBy.length) throw new FirestoreError(E.UNIMPLEMENTED, "limitToLast() queries require specifying at least one orderBy() clause");
  })((e = __PRIVATE_cast(e, Query))._query);
  const t = __PRIVATE_getDatastore(e.firestore), r = new __PRIVATE_LiteUserDataWriter(e.firestore);
  return __PRIVATE_invokeRunQueryRpc(t, e._query).then((t2) => {
    const n = t2.map((t3) => new QueryDocumentSnapshot(e.firestore, r, t3.key, t3, e.converter));
    return "L" === e._query.limitType && // Limit to last queries reverse the orderBy constraint that was
    // specified by the user. As such, we need to reverse the order of the
    // results to return the documents in the expected order.
    n.reverse(), new QuerySnapshot(e, n);
  });
}
function setDoc(e, t, r) {
  const n = __PRIVATE_applyFirestoreDataConverter((e = __PRIVATE_cast(e, DocumentReference)).converter, t, r), i = __PRIVATE_parseSetData(__PRIVATE_newUserDataReader(e.firestore), "setDoc", e._key, n, null !== e.converter, r);
  return __PRIVATE_invokeCommitRpc(__PRIVATE_getDatastore(e.firestore), [i.toMutation(e._key, Precondition.none())]);
}
function updateDoc(e, t, r, ...n) {
  const i = __PRIVATE_newUserDataReader((e = __PRIVATE_cast(e, DocumentReference)).firestore);
  let s;
  s = "string" == typeof (t = getModularInstance(t)) || t instanceof FieldPath ? __PRIVATE_parseUpdateVarargs(i, "updateDoc", e._key, t, r, n) : __PRIVATE_parseUpdateData(i, "updateDoc", e._key, t);
  return __PRIVATE_invokeCommitRpc(__PRIVATE_getDatastore(e.firestore), [s.toMutation(e._key, Precondition.exists(true))]);
}
function deleteDoc(e) {
  return __PRIVATE_invokeCommitRpc(__PRIVATE_getDatastore((e = __PRIVATE_cast(e, DocumentReference)).firestore), [new __PRIVATE_DeleteMutation(e._key, Precondition.none())]);
}
function addDoc(e, t) {
  const r = doc(e = __PRIVATE_cast(e, CollectionReference)), n = __PRIVATE_applyFirestoreDataConverter(e.converter, t), i = __PRIVATE_parseSetData(__PRIVATE_newUserDataReader(e.firestore), "addDoc", r._key, n, null !== r.converter, {});
  return __PRIVATE_invokeCommitRpc(__PRIVATE_getDatastore(e.firestore), [i.toMutation(r._key, Precondition.exists(false))]).then(() => r);
}
function deleteField() {
  return new __PRIVATE_DeleteFieldValueImpl("deleteField");
}
function serverTimestamp() {
  return new __PRIVATE_ServerTimestampFieldValueImpl("serverTimestamp");
}
function arrayUnion(...e) {
  return new __PRIVATE_ArrayUnionFieldValueImpl("arrayUnion", e);
}
function arrayRemove(...e) {
  return new __PRIVATE_ArrayRemoveFieldValueImpl("arrayRemove", e);
}
function increment(e) {
  return new __PRIVATE_NumericIncrementFieldValueImpl("increment", e);
}
function vector(e) {
  return new VectorValue(e);
}

// node_modules/@firebase/firestore/dist/lite/index.browser.esm.js
var _t = "4.14.0";
var __PRIVATE_Deferred = class {
  constructor() {
    this.promise = new Promise((t, e) => {
      this.resolve = t, this.reject = e;
    });
  }
};
var __PRIVATE_AggregateImpl = class {
  constructor(t, e, i) {
    this.alias = t, this.aggregateType = e, this.fieldPath = i;
  }
};
var __PRIVATE_ExponentialBackoff = class {
  constructor(t, e, i = 1e3, r = 1.5, a = 6e4) {
    this.t = t, this.timerId = e, this.i = i, this.o = r, this.h = a, this.u = 0, this.l = null, /** The last backoff attempt, as epoch milliseconds. */
    this._ = Date.now(), this.reset();
  }
  /**
   * Resets the backoff delay.
   *
   * The very next backoffAndWait() will have no delay. If it is called again
   * (i.e. due to an error), initialDelayMs (plus jitter) will be used, and
   * subsequent ones will increase according to the backoffFactor.
   */
  reset() {
    this.u = 0;
  }
  /**
   * Resets the backoff delay to the maximum delay (e.g. for use after a
   * RESOURCE_EXHAUSTED error).
   */
  m() {
    this.u = this.h;
  }
  /**
   * Returns a promise that resolves after currentDelayMs, and increases the
   * delay for any subsequent attempts. If there was a pending backoff operation
   * already, it will be canceled.
   */
  A(t) {
    this.cancel();
    const e = Math.floor(this.u + this.p()), i = Math.max(0, Date.now() - this._), r = Math.max(0, e - i);
    r > 0 && __PRIVATE_logDebug("ExponentialBackoff", `Backing off for ${r} ms (base delay: ${this.u} ms, delay with jitter: ${e} ms, last attempt: ${i} ms ago)`), this.l = this.t.enqueueAfterDelay(this.timerId, r, () => (this._ = Date.now(), t())), // Apply backoff factor to determine next delay and ensure it is within
    // bounds.
    this.u *= this.o, this.u < this.i && (this.u = this.i), this.u > this.h && (this.u = this.h);
  }
  T() {
    null !== this.l && (this.l.skipDelay(), this.l = null);
  }
  cancel() {
    null !== this.l && (this.l.cancel(), this.l = null);
  }
  /** Returns a random value in the range [-currentBaseMs/2, currentBaseMs/2] */
  p() {
    return (Math.random() - 0.5) * this.u;
  }
};
var AggregateField = class {
  /**
   * Create a new AggregateField<T>
   * @param aggregateType - Specifies the type of aggregation operation to perform.
   * @param _internalFieldPath - Optionally specifies the field that is aggregated.
   * @internal
   */
  constructor(t = "count", e) {
    this._internalFieldPath = e, /** A type string to uniquely identify instances of this class. */
    this.type = "AggregateField", this.aggregateType = t;
  }
};
var AggregateQuerySnapshot = class {
  /** @hideconstructor */
  constructor(t, e, i) {
    this._userDataWriter = e, this._data = i, /** A type string to uniquely identify instances of this class. */
    this.type = "AggregateQuerySnapshot", this.query = t;
  }
  /**
   * Returns the results of the aggregations performed over the underlying
   * query.
   *
   * The keys of the returned object will be the same as those of the
   * `AggregateSpec` object specified to the aggregation method, and the values
   * will be the corresponding aggregation result.
   *
   * @returns The results of the aggregations performed over the underlying
   * query.
   */
  data() {
    return this._userDataWriter.convertObjectMap(this._data);
  }
  /**
   * @internal
   * @private
   *
   * Retrieves all fields in the snapshot as a proto value.
   *
   * @returns An `Object` containing all fields in the snapshot.
   */
  _fieldsProto() {
    return new ObjectValue({
      mapValue: {
        fields: this._data
      }
    }).clone().value.mapValue.fields;
  }
};
function getCount(t) {
  return getAggregate(t, {
    count: count()
  });
}
function getAggregate(t, e) {
  const i = __PRIVATE_cast(t.firestore, Firestore), r = __PRIVATE_getDatastore(i), a = __PRIVATE_mapToArray(e, (t2, e2) => new __PRIVATE_AggregateImpl(e2, t2.aggregateType, t2._internalFieldPath));
  return __PRIVATE_invokeRunAggregationQueryRpc(r, t._query, a).then((e2) => function __PRIVATE_convertToAggregateQuerySnapshot(t2, e3, i2) {
    const r2 = new __PRIVATE_LiteUserDataWriter(t2), a2 = new AggregateQuerySnapshot(e3, r2, i2);
    return a2;
  }(i, t, e2));
}
function sum(t) {
  return new AggregateField("sum", __PRIVATE_fieldPathFromArgument("sum", t));
}
function average(t) {
  return new AggregateField("avg", __PRIVATE_fieldPathFromArgument("average", t));
}
function count() {
  return new AggregateField("count");
}
function aggregateFieldEqual(t, e) {
  var _a, _b;
  return t instanceof AggregateField && e instanceof AggregateField && t.aggregateType === e.aggregateType && ((_a = t._internalFieldPath) == null ? void 0 : _a.canonicalString()) === ((_b = e._internalFieldPath) == null ? void 0 : _b.canonicalString());
}
function aggregateQuerySnapshotEqual(t, e) {
  return queryEqual(t.query, e.query) && deepEqual(t.data(), e.data());
}
var WriteBatch = class {
  /** @hideconstructor */
  constructor(t, e) {
    this._firestore = t, this._commitHandler = e, this._mutations = [], this._committed = false, this._dataReader = __PRIVATE_newUserDataReader(t);
  }
  set(t, e, i) {
    this._verifyNotCommitted();
    const r = __PRIVATE_validateReference(t, this._firestore), a = __PRIVATE_applyFirestoreDataConverter(r.converter, e, i), o = __PRIVATE_parseSetData(this._dataReader, "WriteBatch.set", r._key, a, null !== r.converter, i);
    return this._mutations.push(o.toMutation(r._key, Precondition.none())), this;
  }
  update(t, e, i, ...r) {
    this._verifyNotCommitted();
    const a = __PRIVATE_validateReference(t, this._firestore);
    let o;
    return o = "string" == typeof (e = getModularInstance(e)) || e instanceof FieldPath ? __PRIVATE_parseUpdateVarargs(this._dataReader, "WriteBatch.update", a._key, e, i, r) : __PRIVATE_parseUpdateData(this._dataReader, "WriteBatch.update", a._key, e), this._mutations.push(o.toMutation(a._key, Precondition.exists(true))), this;
  }
  /**
   * Deletes the document referred to by the provided {@link DocumentReference}.
   *
   * @param documentRef - A reference to the document to be deleted.
   * @returns This `WriteBatch` instance. Used for chaining method calls.
   */
  delete(t) {
    this._verifyNotCommitted();
    const e = __PRIVATE_validateReference(t, this._firestore);
    return this._mutations = this._mutations.concat(new __PRIVATE_DeleteMutation(e._key, Precondition.none())), this;
  }
  /**
   * Commits all of the writes in this write batch as a single atomic unit.
   *
   * The result of these writes will only be reflected in document reads that
   * occur after the returned promise resolves. If the client is offline, the
   * write fails. If you would like to see local modifications or buffer writes
   * until the client is online, use the full Firestore SDK.
   *
   * @returns A `Promise` resolved once all of the writes in the batch have been
   * successfully written to the backend as an atomic unit (note that it won't
   * resolve while you're offline).
   */
  commit() {
    return this._verifyNotCommitted(), this._committed = true, this._mutations.length > 0 ? this._commitHandler(this._mutations) : Promise.resolve();
  }
  _verifyNotCommitted() {
    if (this._committed) throw new FirestoreError(E.FAILED_PRECONDITION, "A write batch can no longer be used after commit() has been called.");
  }
};
function __PRIVATE_validateReference(t, e) {
  if ((t = getModularInstance(t)).firestore !== e) throw new FirestoreError(E.INVALID_ARGUMENT, "Provided document reference is from a different Firestore instance.");
  return t;
}
function writeBatch(t) {
  t = __PRIVATE_cast(t, Firestore);
  const e = __PRIVATE_getDatastore(t);
  return new WriteBatch(t, (t2) => __PRIVATE_invokeCommitRpc(e, t2));
}
var Transaction$1 = class {
  constructor(t) {
    this.datastore = t, // The version of each document that was read during this transaction.
    this.readVersions = /* @__PURE__ */ new Map(), this.mutations = [], this.committed = false, /**
     * A deferred usage error that occurred previously in this transaction that
     * will cause the transaction to fail once it actually commits.
     */
    this.lastTransactionError = null, /**
     * Set of documents that have been written in the transaction.
     *
     * When there's more than one write to the same key in a transaction, any
     * writes after the first are handled differently.
     */
    this.writtenDocs = /* @__PURE__ */ new Set();
  }
  async lookup(t) {
    if (this.ensureCommitNotCalled(), this.mutations.length > 0) throw this.lastTransactionError = new FirestoreError(E.INVALID_ARGUMENT, "Firestore transactions require all reads to be executed before all writes."), this.lastTransactionError;
    const e = await __PRIVATE_invokeBatchGetDocumentsRpc(this.datastore, t);
    return e.forEach((t2) => this.recordVersion(t2)), e;
  }
  set(t, e) {
    this.write(e.toMutation(t, this.precondition(t))), this.writtenDocs.add(t.toString());
  }
  update(t, e) {
    try {
      this.write(e.toMutation(t, this.preconditionForUpdate(t)));
    } catch (t2) {
      this.lastTransactionError = t2;
    }
    this.writtenDocs.add(t.toString());
  }
  delete(t) {
    this.write(new __PRIVATE_DeleteMutation(t, this.precondition(t))), this.writtenDocs.add(t.toString());
  }
  async commit() {
    if (this.ensureCommitNotCalled(), this.lastTransactionError) throw this.lastTransactionError;
    const t = this.readVersions;
    this.mutations.forEach((e) => {
      t.delete(e.key.toString());
    }), // For each document that was read but not written to, we want to perform
    // a `verify` operation.
    t.forEach((t2, e) => {
      const i = DocumentKey.fromPath(e);
      this.mutations.push(new __PRIVATE_VerifyMutation(i, this.precondition(i)));
    }), await __PRIVATE_invokeCommitRpc(this.datastore, this.mutations), this.committed = true;
  }
  recordVersion(t) {
    let e;
    if (t.isFoundDocument()) e = t.version;
    else {
      if (!t.isNoDocument()) throw fail(50498, {
        R: t.constructor.name
      });
      e = SnapshotVersion.min();
    }
    const i = this.readVersions.get(t.key.toString());
    if (i) {
      if (!e.isEqual(i))
        throw new FirestoreError(E.ABORTED, "Document version changed between two reads.");
    } else this.readVersions.set(t.key.toString(), e);
  }
  /**
   * Returns the version of this document when it was read in this transaction,
   * as a precondition, or no precondition if it was not read.
   */
  precondition(t) {
    const e = this.readVersions.get(t.toString());
    return !this.writtenDocs.has(t.toString()) && e ? e.isEqual(SnapshotVersion.min()) ? Precondition.exists(false) : Precondition.updateTime(e) : Precondition.none();
  }
  /**
   * Returns the precondition for a document if the operation is an update.
   */
  preconditionForUpdate(t) {
    const e = this.readVersions.get(t.toString());
    if (!this.writtenDocs.has(t.toString()) && e) {
      if (e.isEqual(SnapshotVersion.min()))
        throw new FirestoreError(E.INVALID_ARGUMENT, "Can't update a document that doesn't exist.");
      return Precondition.updateTime(e);
    }
    return Precondition.exists(true);
  }
  write(t) {
    this.ensureCommitNotCalled(), this.mutations.push(t);
  }
  ensureCommitNotCalled() {
  }
};
var ft = {
  maxAttempts: 5
};
var __PRIVATE_TransactionRunner = class {
  constructor(t, e, i, r, a) {
    this.asyncQueue = t, this.datastore = e, this.options = i, this.updateFunction = r, this.deferred = a, this.I = i.maxAttempts, this.P = new __PRIVATE_ExponentialBackoff(
      this.asyncQueue,
      "transaction_retry"
      /* TimerId.TransactionRetry */
    );
  }
  /** Runs the transaction and sets the result on deferred. */
  V() {
    this.I -= 1, this.D();
  }
  D() {
    this.P.A(async () => {
      const t = new Transaction$1(this.datastore), e = this.F(t);
      e && e.then((e2) => {
        this.asyncQueue.enqueueAndForget(() => t.commit().then(() => {
          this.deferred.resolve(e2);
        }).catch((t2) => {
          this.v(t2);
        }));
      }).catch((t2) => {
        this.v(t2);
      });
    });
  }
  F(t) {
    try {
      const e = this.updateFunction(t);
      return !__PRIVATE_isNullOrUndefined(e) && e.catch && e.then ? e : (this.deferred.reject(Error("Transaction callback must return a Promise")), null);
    } catch (t2) {
      return this.deferred.reject(t2), null;
    }
  }
  v(t) {
    this.I > 0 && this.B(t) ? (this.I -= 1, this.asyncQueue.enqueueAndForget(() => (this.D(), Promise.resolve()))) : this.deferred.reject(t);
  }
  B(t) {
    if ("FirebaseError" === (t == null ? void 0 : t.name)) {
      const e = t.code;
      return "aborted" === e || "failed-precondition" === e || "already-exists" === e || !__PRIVATE_isPermanentError(e);
    }
    return false;
  }
};
function getDocument() {
  return "undefined" != typeof document ? document : null;
}
var DelayedOperation = class _DelayedOperation {
  constructor(t, e, i, r, a) {
    this.asyncQueue = t, this.timerId = e, this.targetTimeMs = i, this.op = r, this.removalCallback = a, this.deferred = new __PRIVATE_Deferred(), this.then = this.deferred.promise.then.bind(this.deferred.promise), // It's normal for the deferred promise to be canceled (due to cancellation)
    // and so we attach a dummy catch callback to avoid
    // 'UnhandledPromiseRejectionWarning' log spam.
    this.deferred.promise.catch((t2) => {
    });
  }
  get promise() {
    return this.deferred.promise;
  }
  /**
   * Creates and returns a DelayedOperation that has been scheduled to be
   * executed on the provided asyncQueue after the provided delayMs.
   *
   * @param asyncQueue - The queue to schedule the operation on.
   * @param id - A Timer ID identifying the type of operation this is.
   * @param delayMs - The delay (ms) before the operation should be scheduled.
   * @param op - The operation to run.
   * @param removalCallback - A callback to be called synchronously once the
   *   operation is executed or canceled, notifying the AsyncQueue to remove it
   *   from its delayedOperations list.
   *   PORTING NOTE: This exists to prevent making removeDelayedOperation() and
   *   the DelayedOperation class public.
   */
  static createAndSchedule(t, e, i, r, a) {
    const o = Date.now() + i, h = new _DelayedOperation(t, e, o, r, a);
    return h.start(i), h;
  }
  /**
   * Starts the timer. This is called immediately after construction by
   * createAndSchedule().
   */
  start(t) {
    this.timerHandle = setTimeout(() => this.handleDelayElapsed(), t);
  }
  /**
   * Queues the operation to run immediately (if it hasn't already been run or
   * canceled).
   */
  skipDelay() {
    return this.handleDelayElapsed();
  }
  /**
   * Cancels the operation if it hasn't already been executed or canceled. The
   * promise will be rejected.
   *
   * As long as the operation has not yet been run, calling cancel() provides a
   * guarantee that the operation will not be run.
   */
  cancel(t) {
    null !== this.timerHandle && (this.clearTimeout(), this.deferred.reject(new FirestoreError(E.CANCELLED, "Operation cancelled" + (t ? ": " + t : ""))));
  }
  handleDelayElapsed() {
    this.asyncQueue.enqueueAndForget(() => null !== this.timerHandle ? (this.clearTimeout(), this.op().then((t) => this.deferred.resolve(t))) : Promise.resolve());
  }
  clearTimeout() {
    null !== this.timerHandle && (this.removalCallback(this), clearTimeout(this.timerHandle), this.timerHandle = null);
  }
};
var dt = "AsyncQueue";
var __PRIVATE_AsyncQueueImpl = class {
  constructor(t = Promise.resolve()) {
    this.k = [], // Is this AsyncQueue being shut down? Once it is set to true, it will not
    // be changed again.
    this.q = false, // Operations scheduled to be queued in the future. Operations are
    // automatically removed after they are run or canceled.
    this.O = [], // visible for testing
    this.S = null, // Flag set while there's an outstanding AsyncQueue operation, used for
    // assertion sanity-checks.
    this.C = false, // Enabled during shutdown on Safari to prevent future access to IndexedDB.
    this.M = false, // List of TimerIds to fast-forward delays for.
    this.N = [], // Backoff timer used to schedule retries for retryable operations
    this.P = new __PRIVATE_ExponentialBackoff(
      this,
      "async_queue_retry"
      /* TimerId.AsyncQueueRetry */
    ), // Visibility handler that triggers an immediate retry of all retryable
    // operations. Meant to speed up recovery when we regain file system access
    // after page comes into foreground.
    this.L = () => {
      const t2 = getDocument();
      t2 && __PRIVATE_logDebug(dt, "Visibility state changed to " + t2.visibilityState), this.P.T();
    }, this.W = t;
    const e = getDocument();
    e && "function" == typeof e.addEventListener && e.addEventListener("visibilitychange", this.L);
  }
  get isShuttingDown() {
    return this.q;
  }
  /**
   * Adds a new operation to the queue without waiting for it to complete (i.e.
   * we ignore the Promise result).
   */
  enqueueAndForget(t) {
    this.enqueue(t);
  }
  enqueueAndForgetEvenWhileRestricted(t) {
    this.U(), // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.$(t);
  }
  enterRestrictedMode(t) {
    if (!this.q) {
      this.q = true, this.M = t || false;
      const e = getDocument();
      e && "function" == typeof e.removeEventListener && e.removeEventListener("visibilitychange", this.L);
    }
  }
  enqueue(t) {
    if (this.U(), this.q)
      return new Promise(() => {
      });
    const e = new __PRIVATE_Deferred();
    return this.$(() => this.q && this.M ? Promise.resolve() : (t().then(e.resolve, e.reject), e.promise)).then(() => e.promise);
  }
  enqueueRetryable(t) {
    this.enqueueAndForget(() => (this.k.push(t), this.j()));
  }
  /**
   * Runs the next operation from the retryable queue. If the operation fails,
   * reschedules with backoff.
   */
  async j() {
    if (0 !== this.k.length) {
      try {
        await this.k[0](), this.k.shift(), this.P.reset();
      } catch (t) {
        if (!function __PRIVATE_isIndexedDbTransactionError(t2) {
          return "IndexedDbTransactionError" === t2.name;
        }(t)) throw t;
        __PRIVATE_logDebug(dt, "Operation failed with retryable error: " + t);
      }
      this.k.length > 0 && // If there are additional operations, we re-schedule `retryNextOp()`.
      // This is necessary to run retryable operations that failed during
      // their initial attempt since we don't know whether they are already
      // enqueued. If, for example, `op1`, `op2`, `op3` are enqueued and `op1`
      // needs to  be re-run, we will run `op1`, `op1`, `op2` using the
      // already enqueued calls to `retryNextOp()`. `op3()` will then run in the
      // call scheduled here.
      // Since `backoffAndRun()` cancels an existing backoff and schedules a
      // new backoff on every call, there is only ever a single additional
      // operation in the queue.
      this.P.A(() => this.j());
    }
  }
  $(t) {
    const e = this.W.then(() => (this.C = true, t().catch((t2) => {
      this.S = t2, this.C = false;
      const e2 = __PRIVATE_getMessageOrStack(t2);
      throw __PRIVATE_logError("INTERNAL UNHANDLED ERROR: ", e2), t2;
    }).then((t2) => (this.C = false, t2))));
    return this.W = e, e;
  }
  enqueueAfterDelay(t, e, i) {
    this.U(), // Fast-forward delays for timerIds that have been overridden.
    this.N.indexOf(t) > -1 && (e = 0);
    const r = DelayedOperation.createAndSchedule(this, t, e, i, (t2) => this.G(t2));
    return this.O.push(r), r;
  }
  U() {
    this.S && fail(47125, {
      H: __PRIVATE_getMessageOrStack(this.S)
    });
  }
  verifyOperationInProgress() {
  }
  /**
   * Waits until all currently queued tasks are finished executing. Delayed
   * operations are not run.
   */
  async J() {
    let t;
    do {
      t = this.W, await t;
    } while (t !== this.W);
  }
  /**
   * For Tests: Determine if a delayed operation with a particular TimerId
   * exists.
   */
  K(t) {
    for (const e of this.O) if (e.timerId === t) return true;
    return false;
  }
  /**
   * For Tests: Runs some or all delayed operations early.
   *
   * @param lastTimerId - Delayed operations up to and including this TimerId
   * will be drained. Pass TimerId.All to run all delayed operations.
   * @returns a Promise that resolves once all operations have been run.
   */
  X(t) {
    return this.J().then(() => {
      this.O.sort((t2, e) => t2.targetTimeMs - e.targetTimeMs);
      for (const e of this.O) if (e.skipDelay(), "all" !== t && e.timerId === t) break;
      return this.J();
    });
  }
  /**
   * For Tests: Skip all subsequent delays for a timer id.
   */
  Y(t) {
    this.N.push(t);
  }
  /** Called once a DelayedOperation is run or canceled. */
  G(t) {
    const e = this.O.indexOf(t);
    this.O.splice(e, 1);
  }
};
function __PRIVATE_getMessageOrStack(t) {
  let e = t.message || "";
  return t.stack && (e = t.stack.includes(t.message) ? t.stack : t.message + "\n" + t.stack), e;
}
var Transaction = class {
  /** @hideconstructor */
  constructor(t, e) {
    this._firestore = t, this._transaction = e, this._dataReader = __PRIVATE_newUserDataReader(t);
  }
  /**
   * Reads the document referenced by the provided {@link DocumentReference}.
   *
   * @param documentRef - A reference to the document to be read.
   * @returns A `DocumentSnapshot` with the read data.
   */
  get(t) {
    const e = __PRIVATE_validateReference(t, this._firestore), i = new __PRIVATE_LiteUserDataWriter(this._firestore);
    return this._transaction.lookup([e._key]).then((t2) => {
      if (!t2 || 1 !== t2.length) return fail(24041);
      const r = t2[0];
      if (r.isFoundDocument()) return new DocumentSnapshot(this._firestore, i, r.key, r, e.converter);
      if (r.isNoDocument()) return new DocumentSnapshot(this._firestore, i, e._key, null, e.converter);
      throw fail(18433, {
        doc: r
      });
    });
  }
  set(t, e, i) {
    const r = __PRIVATE_validateReference(t, this._firestore), a = __PRIVATE_applyFirestoreDataConverter(r.converter, e, i), o = __PRIVATE_parseSetData(this._dataReader, "Transaction.set", r._key, a, null !== r.converter, i);
    return this._transaction.set(r._key, o), this;
  }
  update(t, e, i, ...r) {
    const a = __PRIVATE_validateReference(t, this._firestore);
    let o;
    return o = "string" == typeof (e = getModularInstance(e)) || e instanceof FieldPath ? __PRIVATE_parseUpdateVarargs(this._dataReader, "Transaction.update", a._key, e, i, r) : __PRIVATE_parseUpdateData(this._dataReader, "Transaction.update", a._key, e), this._transaction.update(a._key, o), this;
  }
  /**
   * Deletes the document referred to by the provided {@link DocumentReference}.
   *
   * @param documentRef - A reference to the document to be deleted.
   * @returns This `Transaction` instance. Used for chaining method calls.
   */
  delete(t) {
    const e = __PRIVATE_validateReference(t, this._firestore);
    return this._transaction.delete(e._key), this;
  }
};
function runTransaction(t, e, i) {
  t = __PRIVATE_cast(t, Firestore);
  const r = __PRIVATE_getDatastore(t), a = {
    ...ft,
    ...i
  };
  !function __PRIVATE_validateTransactionOptions(t2) {
    if (t2.maxAttempts < 1) throw new FirestoreError(E.INVALID_ARGUMENT, "Max attempts must be at least 1");
  }(a);
  const o = new __PRIVATE_Deferred();
  return new __PRIVATE_TransactionRunner(function __PRIVATE_newAsyncQueue() {
    return new __PRIVATE_AsyncQueueImpl();
  }(), r, a, (i2) => e(new Transaction(t, i2)), o).V(), o.promise;
}
!function __PRIVATE_registerFirestore() {
  __PRIVATE_setSDKVersion(`${SDK_VERSION}_lite`), _registerComponent(new Component("firestore/lite", (t, { instanceIdentifier: e, options: i }) => {
    const r = t.getProvider("app").getImmediate(), a = new Firestore(new __PRIVATE_LiteAuthCredentialsProvider(t.getProvider("auth-internal")), new __PRIVATE_LiteAppCheckTokenProvider(r, t.getProvider("app-check-internal")), __PRIVATE_databaseIdFromApp(r, e), r);
    return i && a._setSettings(i), a;
  }, "PUBLIC").setMultipleInstances(true)), // RUNTIME_ENV and BUILD_TARGET are replaced by real values during the compilation
  registerVersion("firestore-lite", _t, ""), registerVersion("firestore-lite", _t, "esm2020");
}();
export {
  AggregateField,
  AggregateQuerySnapshot,
  Bytes,
  CollectionReference,
  DocumentReference,
  DocumentSnapshot,
  FieldPath,
  FieldValue,
  Firestore,
  FirestoreError,
  GeoPoint,
  Query,
  QueryCompositeFilterConstraint,
  QueryConstraint,
  QueryDocumentSnapshot,
  QueryEndAtConstraint,
  QueryFieldFilterConstraint,
  QueryLimitConstraint,
  QueryOrderByConstraint,
  QuerySnapshot,
  QueryStartAtConstraint,
  Timestamp,
  Transaction,
  VectorValue,
  WriteBatch,
  addDoc,
  aggregateFieldEqual,
  aggregateQuerySnapshotEqual,
  and,
  arrayRemove,
  arrayUnion,
  average,
  collection,
  collectionGroup,
  connectFirestoreEmulator,
  count,
  deleteDoc,
  deleteField,
  doc,
  documentId,
  endAt,
  endBefore,
  getAggregate,
  getCount,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  initializeFirestore,
  limit,
  limitToLast,
  or,
  orderBy,
  query,
  queryEqual,
  refEqual,
  runTransaction,
  serverTimestamp,
  setDoc,
  setLogLevel,
  snapshotEqual,
  startAfter,
  startAt,
  sum,
  terminate,
  updateDoc,
  vector,
  where,
  writeBatch
};
/*! Bundled license information:

@firebase/webchannel-wrapper/dist/bloom-blob/esm/bloom_blob_es2018.js:
  (** @license
  Copyright The Closure Library Authors.
  SPDX-License-Identifier: Apache-2.0
  *)
  (** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  *)

@firebase/firestore/dist/lite/common-8f39af0f.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/lite/common-8f39af0f.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2025 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/lite/common-8f39af0f.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2018 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/lite/common-8f39af0f.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/lite/common-8f39af0f.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/lite/common-8f39af0f.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
  * @license
  * Copyright 2017 Google LLC
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *   http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *)

@firebase/firestore/dist/lite/common-8f39af0f.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/lite/index.browser.esm.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
*/
//# sourceMappingURL=firebase_firestore_lite.js.map
