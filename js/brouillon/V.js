/// <reference path="A.js" />
/// <reference path="G.js" />
/// <reference path="M.js" />
/// <reference path="MT.js" />


zygotine.V = {};

zV = zygotine.V;

/**
@function zygotine.V.mapMeasureListNorm2LogN
@param {zygotine.M.MeasureList} ml 
@returns {zygotine.M.MeasureList}
*/
zV.mapMeasureListNorm2LogN = function(ml)
{
    zygotine.M.MeasureList
    var m = 9.999999;
    var p = -399.99986;

    var map = function (a) {


    };

    var mlStr = ml.toString();
    var ml2 = new zygotine.M.MeasureList(mlStr);

    var i;
    var set;
    set = ml2.measureByType.uncensored;
    for (i = 0; i < set.length; i++) {
        set[i].a = m * set[i].a + p;
    }

    set = ml2.measureByType.lessThan;
    for (i = 0; i < set.length; i++) {
        set[i].a = m * set[i].a + p;
    }

    set = ml2.measureByType.greaterThan;
    for (i = 0; i < set.length; i++) {
        set[i].a = m * set[i].a + p;
    }

    set = ml2.measureByType.interval;
    for (i = 0; i < set.length; i++) {
        set[i].a = m * set[i].a + p;
        set[i].b = m * set[i].b + p;
    }

    return ml2;
}