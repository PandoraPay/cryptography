const {BN} = global.kernel.utils;
const {BufferHelper} = global.kernel.helpers;

const EC = require('elliptic')

const FIELD_MODULUS = new BN("21888242871839275222246405745257275088696311157297823662689037894645226208583", 10);
const UNITY_MODULUS = new BN("9334303377689037989442018753807510978357674015322511348041267794643984346845", 10);
const GROUP_MODULUS = new BN("21888242871839275222246405745257275088548364400416034343698204186575808495617", 10);
const B_MAX = 4294967295;

const bn128 = {};

// The elliptic.js curve object
bn128.curve = new EC.curve.short({
    a: '0',
    b: '3',
    p: FIELD_MODULUS.toString(16),
    n: GROUP_MODULUS.toString(16),
    gRed: false,
    g: ['77da99d806abd13c9f15ece5398525119d11e11e9836b2ee7d23f6159ad87d4', '1485efa927f2ad41bff567eec88f32fb0a0f706588b4e41a8d587d008b7f875'],
});

bn128.FIELD_MODULUS = FIELD_MODULUS;
bn128.UNITY_MODULUS = UNITY_MODULUS;
bn128.GROUP_MODULUS = GROUP_MODULUS;


bn128.zero = bn128.curve.g.mul(0);

bn128.p = BN.red(new BN(bn128.curve.p.toString(16), 16)); // temporary workaround due to
bn128.q = BN.red(new BN(bn128.curve.n.toString(16), 16)); // https://github.com/indutny/elliptic/issues/191

bn128.B_MAX = B_MAX;
bn128.B_MAX_BN = new BN(B_MAX).toRed(bn128.q);

// Get a random BN in the bn128 curve group's reduction context
bn128.randomScalar = () => {
    return new BN(BufferHelper.generateRandomBuffer(32), 16).toRed(bn128.q);
};

bn128.bytes = (i) => { // i is a BN (red)
    return "0x" + i.toString(16, 64);
};

bn128.serialize = (point) => {
    if (point.x == null && point.y == null)
        return ["0x0000000000000000000000000000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000000000000000000000000000"];
    return [bn128.bytes(point.getX()), bn128.bytes(point.getY())];
};

bn128.unserialize = (serialization) => {
    if (serialization[0] == "0x0000000000000000000000000000000000000000000000000000000000000000" && serialization[1] == "0x0000000000000000000000000000000000000000000000000000000000000000")
        return bn128.zero;

    const point = bn128.curve.point(serialization[0].slice(2), serialization[1].slice(2)); // no check if valid curve point?
    point.toJSON = () => bn128.serialize(point);
    point.serialize = () => bn128.serialize(point);

    return point;
};

bn128.toVector = (point) => {
    return [ new BN( point.getX().toString() ).toRed(bn128.q),new BN( point.getY().toString() ).toRed(bn128.q) ];
};


bn128.representation = (point) => {
    var temp = bn128.serialize(point);
    return temp[0] + temp[1].slice(2);
};

bn128.B_MAX = B_MAX;

module.exports = bn128;