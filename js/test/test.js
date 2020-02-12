/// <reference path="A.js" />
/// <reference path="M0.js" />
/// <reference path="M.js" />
/// <reference path="MT.js" />
/// <reference path="O.js" />
/// <reference path="x.js" />
/// <reference path="NUM.js" />
/// <reference path="jstat.js" />

var qnorm = [];
qnorm[qnorm.length] = jStat.normal.inv((1.0 + 0.95) / 2.0, 0, 1);
var pds = new zygotine.M.PastDataSummary("0.345; 0.001;100");
/* dans C#

pds
{0.345; 0.001; 100}
    ClassName: "PastDataSummary"
    Defined: true
    Error: {Zygotine.WebExpo.Messages}
    LogSigmaMu: -6.9026877695580016
    LogSigmaSD: 0.07142070973808462
    Mean: 0.345
    N: 100
    NS2: 9.9E-05
    SD: 0.001
*/

var t1 = {
    ml: {},
    m: {},
    asString: "",
}
t1.ml = new zygotine.M.MeasureList("cV( 1 , 2.111)|1 2 ; b1|13.2;  a|[1.4,6];  b1||<24.541|> 22.3|a12");
t1.m = t1.ml.parseMeasure(">3.1416");
if (!t1.m.invalid) {
    t1.m.worker = "moiMême"
    t1.ml.addMeasure(t1.m);
}

//Appel a jStat
t1.asString = t1.ml.toString();
var shape = 2; scale = 1;

function getGammaInvCdf(shape, scale) {
    return function (p) { return jStat.gamma.inv(p, shape, scale) }
};

var t2 = {};
t2.sParameters = new zygotine.M.SEGInformedVarModelParameters(true);
t2.mlStr = "0.172;10|0.513;10|0.308;10|0.578;10|<0.169;10|0.217;10|0.282;10|0.287;10|0.257;10|0.105;10|0.182;10|0.12;10|0.119;10|0.39;10|0.363;10|[0.2,0.45];10|0.249;10|0.339;10|0.446;10|0.295;10|0.23;10|0.113;10|0.388;10|0.588;10|0.289;10|0.349;10|0.329;10|0.256;10|0.514;10|0.44;10|<0.18;10|0.581;10|0.414;10|0.312;10|<0.158;10|0.566;10|0.235;10|>0.409;10|0.765;10|>0.432;10|0.167;10|0.368;10|0.245;10|0.241;10|0.614;10|0.372;10|0.188;10|0.327;10|[0.178,0.4];10|0.648;10|0.163;10|0.992;10|0.265;10|0.228;10|0.307;10|0.278;10|0.184;10|0.339;10|0.309;10|0.328;10|0.49;10|0.422;10|0.311;10|<0.167;10|0.245;10|0.151;10|<0.178;10|0.162;10|0.363;10|0.309;10|[0.245,0.551];10|0.364;10|0.169;10|0.282;10|0.35;10|0.305;10|0.283;10|0.273;10|>0.417;10|0.276;10|0.518;10|0.407;10|0.58;10|0.284;10|0.431;10|0.336;10|0.226;10|0.625;10|0.251;10|0.18;10|0.33;10|>0.51;10|0.112;10|0.189;10|[0.112,0.251];10|[0.282,0.634];10|0.297;10|0.142;10|>0.661;10|0.34;10";
t2.ml = new zygotine.M.MeasureList(t2.mlStr);
t2.ds = new zygotine.M.DataSummary(t2.ml, true);
t2.mt = new zygotine.MT.MersenneTwister(19937);

//zygotine.MT.replaceMathRandomFunction.call(Math, 1993819937);
t2.yGen = zygotine.O.YGen.inits(t2.ds, t2.sParameters.initMu, t2.sParameters.initSigma, true);

t2.mcmcParam1 = new zygotine.M.McmcParameters(1500, 200, 1, false);
t2.infVar1 = new zygotine.M.SEGInformedVarModel(t2.ml, t2.sParameters, t2.mcmcParam1, zygotine.M.PastDataSummary.emptyPDS);
t2.compute1 = t2.infVar1.compute();
t2.mcmcParam2 = new zygotine.M.McmcParameters(1500, 200, 1, true);
t2.infVar2 = new zygotine.M.SEGInformedVarModel(t2.ml, t2.sParameters, t2.mcmcParam2, zygotine.M.PastDataSummary.emptyPDS);
t2.compute2 = t2.infVar2.compute();
t2.mcmcParam3 = new zygotine.M.McmcParameters(1500, 200, 3, true);
t2.infVar3 = new zygotine.M.SEGInformedVarModel(t2.ml, t2.sParameters, t2.mcmcParam3, zygotine.M.PastDataSummary.emptyPDS);
t2.compute3 = t2.infVar3.compute(); 0.0000000000000000e+00
1.8629290759630119e-16
0.0000000000000000e+00
3.5904107917512588e-16
0.0000000000000000e+00
0.0000000000000000e+00
0.0000000000000000e+00
6.2713513912880475e-16
1.7597669250193449e-16
7.0499095390838306e-15
1.7201830498772933e-16
8.3533634332412481e-14
0.0000000000000000e+00
1.0561246110976827e-12
0.0000000000000000e+00
9.4028012756114671e-08
1.7168393144142227e-16

t2.mlStr2 = "!|" + t2.mlStr;
t2.ml2 = new zygotine.M.MeasureList(t2.mlStr2);
var t3 = {}
t3[1] = zygotine.O.rUnifLogP1([3, 4], true, .333);

var t4 = {};

t4.lNormMu=-0.1744;
t4.lNormSd=2.5523;
t4.range = [0, Infinity];
t4.n = 100;
t4.initMu=Math.log(0.3);
t4.mu = t4.initMu;
t4.uncensoredSum = 28.156999999999996;
t4.uncensoredSum2 = 11.403376999999999;
t4.beta = (t4.uncensoredSum2 + 0 - 2.0 * t4.mu * (t4.uncensoredSum + 0) + t4.n * Math.pow(t4.mu, 2)) / 2.0;
t4.funs = new zygotine.O.SigmaGenObject(t4.n, t4.beta, t4.lNormMu, t4.lNormSd);
/** @type {zygotine.O.SigmaGenObject} */
var t = t4.funs;
t.k = 1e-52;
t4.resInt = t.fCum(1, 2);

//zygotine.MT.restoreMathRandomFunction.call(Math);
//zygotine.MT.replaceMathRandomFunction.call(Math, 1993819937);
t5 = {}
//sigma, data$N, beta, log.sigma.mu, log.sigma.sd, u
//1.0760487 10.0000000  4.4953095 -0.1744000  0.6259421  0.3643665
t5.sigmaGIcdf = zO.sigmaGenICdf4InformedVar(10, 4.4953095, -0.1744000, 0.6259421, 0.3643665);
O = function (a) {
    this.a = a;
    this.k = NaN;
};

O.prototype = {

    f_a: function (x) { return this.a * x; },

    f: function (x) { return Math.cos(Math.pow(this.k, 6.09104 /*9.6*/) * Math.sin(x)); },

    fCum: function (lowerBound, upperBound) {
        if (isNaN(this.k))
        {
            return NaN;
        }

        var self = this;
        var F = function (xA) { return xA.map(self.f, self) }
        return new zNum.NumericIntegration(F, lowerBound, upperBound).compute();
    }
};

o = new O(2);


