// L O I   N O R M A L E

function updateTxtAreas() {
    $("#muSample").val(X3.A.results.chains.muSample.data.join("\n"));
    $("#muBurnin").val(X3.A.results.chains.muBurnin.data.join("\n"));
    $("#sdSample").val(X3.A.results.chains.sdSample.data.join("\n"));
    $("#sdBurnin").val(X3.A.results.chains.sdBurnin.data.join("\n"));
}

function clearTxtAreas() {
    $("#muSample").val('');
    $("#muBurnin").val('');
    $("#sdSample").val('');
    $("#sdBurnin").val('');
}
X3 = {};





var X3A = function () {
    clearTxtAreas();
    setTimeout(function () {
        // some length calculations
        X3.A = {};
        X3.A.sParameters = new zygotine.M.SEGInformedVarModelParameters(false);
        X3.A.mlStr = "71|<54.2|>108|59.2|101|[80.2,90.2]|<66|74.2|<69.2|<75.1";
        X3.A.ml = new zygotine.M.MeasureList(X3.A.mlStr);
        X3.A.mcmcParam = new zygotine.M.McmcParameters.getDefaults();
        X3.A.mcmcParam.nBurnin = 1000;

        X3.A.infVar = new zygotine.M.SEGInformedVarModel(X3.A.ml, X3.A.sParameters, X3.A.mcmcParam, zygotine.M.PastDataSummary.dummyPDS);

        zygotine.MT.restoreMathRandomFunction();
        zygotine.MT.replaceMathRandomFunction(12)

        X3.A.results = X3.A.infVar.compute();
        updateTxtAreas();
        zz = new zygotine.S.Quantile();
        zzz = zz.compute(X3.A.infVar.result.chains.muSample.data)
    }, 0);

};

var X3B = function () {

    clearTxtAreas();
    setTimeout(function () {
        X3.B = {};
        X3.B.sParameters = new zygotine.M.SEGInformedVarModelParameters(false);
        X3.B.mlStr = "<78.7|<79.5|[80.4,90.4]|<75|<78.7|<79.5|[80.4,90.4]|<77.8|<76.5|>92.8|>92.8|<79.5|<77.9|[81.6,91.6]|<79|86.3|87.4|<77.3|86.8|86.5|86.6|83.5|<79.7|86.2|86.3|<79.5|[80.9,90.9]|[81.5,91.5]|<79.6|<79.4|85.3|84.6|<78.5|87.1|[80.7,90.7]|<77.2|>93.8|<77.7|<78.5|81.5|<78.5|85.7|84.8|<77.6|84|<77.7|86.2|<79.4|<79.4|<78.1|<79.4|82.9|85.4|84.4|<78.4|82.7|<78.5|<79.5|84.7|85.5|[80.2,90.2]|<78.3|87.4|>93.1|>94.6|85.4|<79.1|[80.7,90.7]|<78.5|>92.4|86.5|83.4|<79.6|[81.3,91.3]|87.4|[80.7,90.7]|84.5|<79.8|87|83.7|>92.6|88.1|85.3|85.7|85.7|>93.3|>93|82.3|<79.4|84|82.2|>93.1|<76.5|<79|<78.4|<79.7|85.3|84.1|89.6|<79.6";
        X3.B.ml = new zygotine.M.MeasureList(X3.B.mlStr);
        X3.B.mcmcParam = new zygotine.M.McmcParameters.getDefaults();
        X3.B.mcmcParam.nBurnin = 0;
        X3.B.pds = new zygotine.M.PastDataSummary("90;5;20");

        X3.B.infVar = new zygotine.M.SEGInformedVarModel(X3.B.ml, X3.B.sParameters, X3.B.mcmcParam, X3.B.pds);

        zygotine.MT.restoreMathRandomFunction();
        zygotine.MT.replaceMathRandomFunction(12)

        X3.B.results = X3.B.infVar.compute();
        updateTxtAreas(X3.B.results);
        zz = new zygotine.S.Quantile();
        zzz = zz.compute(X3.B.infVar.result.chains.muSample.data)
    }, 0);

};



var X3C = function () {

    clearTxtAreas();
    setTimeout(function () {

        X3 = {};
        X3.C = {};
        X3.C.sParameters = new zygotine.M.SEGInformedVarModelParameters(false);
        X3.C.mlStr = "<78.7|<79.5|[80.4,90.4]|<75|<78.7|<79.5|[80.4,90.4]|<77.8|<76.5|>92.8|>92.8|<79.5|<77.9|[81.6,91.6]|<79|86.3|87.4|<77.3|86.8|86.5|86.6|83.5|<79.7|86.2|86.3|<79.5|[80.9,90.9]|[81.5,91.5]|<79.6|<79.4|85.3|84.6|<78.5|87.1|[80.7,90.7]|<77.2|>93.8|<77.7|<78.5|81.5|<78.5|85.7|84.8|<77.6|84|<77.7|86.2|<79.4|<79.4|<78.1|<79.4|82.9|85.4|84.4|<78.4|82.7|<78.5|<79.5|84.7|85.5|[80.2,90.2]|<78.3|87.4|>93.1|>94.6|85.4|<79.1|[80.7,90.7]|<78.5|>92.4|86.5|83.4|<79.6|[81.3,91.3]|87.4|[80.7,90.7]|84.5|<79.8|87|83.7|>92.6|88.1|85.3|85.7|85.7|>93.3|>93|82.3|<79.4|84|82.2|>93.1|<76.5|<79|<78.4|<79.7|85.3|84.1|89.6|<79.6";
        X3.C.ml = new zygotine.M.MeasureList(X3.C.mlStr);
        X3.C.mcmcParam = new zygotine.M.McmcParameters.getDefaults();
        X3.C.mcmcParam.nBurnin = 0;

        X3.C.infVar = new zygotine.M.SEGInformedVarModel(X3.C.ml, X3.C.sParameters, X3.C.mcmcParam, zygotine.M.PastDataSummary.dummyPDS);

        zygotine.MT.restoreMathRandomFunction();
        zygotine.MT.replaceMathRandomFunction(12)

        X3.C.results = X3.C.infVar.compute();
        zz = new zygotine.S.Quantile();
        zzz = zz.compute(X3.C.infVar.result.chains.muSample.data)
        updateTxtAreas(X3.C.results);
    }, 0);

};



