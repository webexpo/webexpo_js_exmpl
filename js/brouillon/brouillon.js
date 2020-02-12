/// <reference path="jstat.js" />
/// <reference path="A.js" />
/// <reference path="B.js" />
/// <reference path="NUM.js" />
/// <reference path="MT.js" />
/// <reference path="O.js" />
/// <reference path="M.js" />
/// <reference path="U.js" />
/// <reference path="S.js" />


zygotine.M.rangeValidation = {};

zygotine.M.rangeValidation.PastData = function() {
    var logN = true;
    var normal = false;
    this.label = "PastDataSummary parameters"
    this.mean = { logN: [-6.908, 4.605], normal: [50, 120] }; 
    this.sd = { logN: [0.405, 2.303], normal : [0.5, 10]}; 
    this.n = [1, 1000]; 
};


zygotine.M.validation = { mcmc: true, measureList: true, specificParameters: true, pastData: true };

/**
* @function
* @param {zygotine.M.SEGInformedVarModelResult} result
* @param {zygotine.M.SEGInformedVarModel} model
*/
zygotine.M.validateModelParameters = function (result, model) {

    var className = model.className;
    var sp = model.specificParameters;
    var ml = model.measureList;

    var addError = function (msg) {
        result.addError(msg);
    };

    var measureListValidator0 = function () {
        var ml = model.measureList;
        var lu = ml.measureCountByType.uncensored;

        if ((lu < 3) || ((lu / ml.n) < 0.3)) {
            if (lu < 3) {
                addError("A measure list must contain at least 3 uncensored measures.");
            } else {
                addError("Uncensored measures must represent at least 30% of all the measures.");
            }
        }

        var logN = sp.logNormalDstrn;

        var limInf = logN ? 0.0001 : 40;
        var limSup = logN ? 1000 : 140;

        var failed = [];
        var some = false;
        var type = "uncensored";
        if (ml.measureByType[type].some(function (el) { return (el.a < limInf) || (el.a > limSup); })) {
            failed.push(type);
        }

        type = "lessThan";
        if (ml.measureByType[type].some(function (el) { return (el.a < limInf) || (el.a > limSup); })) {
            failed.push(type);
        }

        type = "greaterThan";
        if (ml.measureByType[type].some(function (el) { return (el.a < limInf) || (el.a > limSup); })) {
            failed.push(type);
        }

        type = "interval";
        if (ml.measureByType[type].some(function (el) { return (el.a < limInf) || (el.a > limSup) || (el.b < limInf) || (el.b > limSup); })) {
            failed.push(type);
        }

        if (failed.length > 0) {
            addError(zU.fmt("All measures must be contained in the interval [{0}, {1}]. Check for the following categor{2}: [{3}].", limInf, limSup, failed.length > 1 ? "ies" : "y", failed.join(", ")));
        }

        some = ml.measureByType.interval.some(function (el) { return (el.a >= el.b); });
        if (some) {
            addError("For an interval [a, b] to be well defined, b must be greater than a.");
        }
    };

    var mcmcValidator0 = function () {

        /** @type {zygotine.M.McmcParameters} */
        var mcmc = model.mcmcParameters;

        var
            nIter = mcmc.nIter,
            nBurnin = mcmc.nBurnin,
            monitorBurnin = mcmc.monitorBurnin;

        var checkRange = getRangeValidator("MCMC");
        checkRange("nIter", mcmc.nIter, [5000, 150000]);
        checkRange("nBurnin", mcmc.nBurnin, [0, 5000]);
        if (typeof mcmc.monitorBurnin === 'undefined') {
            monitorBurnin = false;
            result.addInfo("MCMC parameter monitorBurnin set to false.");
        }
    };

    var getRangeValidator = function (parameterSet) {
        var format = parameterSet + ": parameter {0}, whose value is {1}, must be contained in the interval {2}";
        var fn = function (paramName, param, range) {
            if ((param < range[0]) || (param > range[1])) {
                addError(zU.fmt(format, paramName, param, zU.fmtArray(range)));
                return false;
            } else {
                return true;
            }
        };

        return fn;
    };

    var infVarSpecificParamsValidator = function () {
        /** @type {zygotine.M.SEGInformedVarModelParameters} */
        var logN = sp.logNormalDstrn;
        var range, param, paramName;
        var checkRange = getRangeValidator("SEGInformedVarModel specific parameters");
        if (checkRange("muLower", sp.muLower, logN ? [-100, -0.5] : [20, 85])) {

            var min = sp.logNormalDstrn ? Math.log(ml.min) : ml.min;
            if (sp.muLower >= min) {
                addError(zU.fmt("Parameter muLower ({0}) must be less than {1}the minimum value ({2}) of the measure list.", sp.muLower, sp.logNormalDstrn ? "the logarithm of " : "", min));
            }
        }

        if (checkRange("muUpper", sp.muUpper, logN ? [0.5, 100] : [85, 140])) {
            var max = sp.logNormalDstrn ? Math.log(ml.max) : ml.max;
            if (sp.muUpper <= max) {
                addError(zU.fmt("Parameter muUpper ({0}) must be greather than {1}the maximum value (={2}) of the measure list.", sp.muUpper, sp.logNormalDstrn ? "the logarithm of " : "", max));
            }
        }

        checkRange("logSigmaMu", sp.logSigmaMu, logN ? [-0.90, 0.48] : [-0.69, 2.30]);
        checkRange("logSigmaPrec", sp.logSigmaPrec, logN ? [0.40, 6.0] : [0.40, 6.0]);
        checkRange("initMu", sp.initMu, logN ? [-6.908, 4.605] : [50, 120]);
        checkRange("initSigma", sp.initSigma, logN ? [0.405, 2.303] : [0.5, 10]);
    };

    var infVarPastDataValidator = function () {
        /** @type {zygotine.M.PastDataSummary} */
        var pds = model.pastData;
        if (pds.defined) {
            var logN = sp.logNormalDstrn;
            var checkRange = getRangeValidator("PastDataSummary parameters");
            checkRange("mean", pds.mean, logN ? [-6.908, 4.605] : [50, 120]); // valeurs identiques à celles de initMu.
            checkRange("sd", pds.sd, logN ? [0.405, 2.303] : [0.5, 10]); // valeurs identiques à celles de initSigma.
            checkRange("n", pds.n, [1, 1000]); 
        } else {
            result.addInfo("Model does not use past data.");
        }
    };

    var infVar = function () {
        /** @type {zygotine.M.SEGInformedVarModelParameters} */
        var valid = zygotine.M.validation;
        if (valid.measureList) {
            measureListValidator0();
        } else {
            result.addWarning("Measure list validation skipped!")
        }

        if (valid.mcmc) {
            mcmcValidator0();
        } else {
            result.addWarning("Mcmc parameters validation skipped!")
        }

        if (valid.specificParameters) {
            infVarSpecificParamsValidator();
        } else {
            result.addWarning("InformedVar model specific parameters skipped!")
        }

        if (valid.pastData) {
            infVarPastDataValidator();
        } else {
            result.addWarning("Pastdata parameters validation skipped!")
        }
    };

    if (model instanceof zygotine.M.SEGInformedVarModel) {
        infVar();
    }
};


zygotine.M.Worker = function (id) {
    this._mean = NaN; // champ privé, facilite le calcul de mu (dans getInits du WorkerDigest), sera mis à NaN lorsque devenu inutile.
    this.mu = NaN;
};

/***** WorkerDigest ***************/

/**
* Represents information on workers organized for the BetweenWorker model.
* @constructor
* @param {zygotine.M.Measure[]} measureArray - un tableau de mesures qui sont dans l'ordre original ...
*
* @property {string} className - le nom de la classe, hérité de BaseModel
* @property {boolean} hasError - vrai si une erreur a été détecté, sinon faux, hérité de LoggingError via BaseModel
* @property {zygotine.M.McmcParameters} mcmcParameters = les paramètres MCMC, hérités de BaseModel
* @property {zygotine.M.MeasureList} measureList - la liste de mesures utilisée, héritée de BaseModel
* @property {zygotine.M.Messages} messages - une liste de messages d'erreurs, de messages d'information ou de mises en garde, héritée de LoggingError via BaseModel
* @property {number} nWorkers - le nombre de travailleurs
* @property {zygotine.M.BetweenWorkerModelParameters} specificParameters  - les paramètres propres à l'exécution du modèle, hérités de BaseModel
*/
zygotine.M.WorkerDigest = function (measureArray) {

    this._measureArray = []; // selon l'ordre de présentation, ie celui de la chaine de caractère ayant servi à définir la MeasureList, ordre que préserve measureArray ...
    this._measureByType = { uncensored: [], greaterThan: [], lessThan: [], interval: [] };
    this._measureByWorker = [];
    //    this.workerInfo = {};
    this._measureOrderedAsR = []; // l'ordre de R, ie "non-censuré" suivi de  ">" suivi de  "<" suivi de [ , ]! Dans chaque groupe l'ordre est donné par celui de la MeasureList
    var m;
    var o;

    for (let i = 0; i < measureArray.length; i++) {
        m = measureArray[i];
        extM = new zygotine.M.ExtendedMeasure(m);

        this._measureArray.push(extM); // l'ordre est celui du paramètre measureArray, donc l'ordre original des mesures.
        this._measureByType[extM.type].push(extM); // pour un type donné, l'ordre est celui du parametre measureArray.
        this._measureByWorker[extM.workerId] = this._measureByWorker[extM.workerId] || [];
        this._measureByWorker[extM.workerId].push(extM); // pour un travailleur, les mesures sont dans l'ordre de measureArray
    }

    this.workerIds = Object.keys(this._measureByWorker).sort(); // pour un travailleur, les mesures sont dans l'ordre de measureArray).sort(); // le tri est alphabétique.
    this.measureCountByWorker = this.workerIds.map(function (id) { return this._measureByWorker[id].length; }, this); // l'ordre sera celui des id triés alphabétiquement

    //this.measureCountByWorker = [];
    //for (let i = 0; i < this.workerIds.length; i ++) {
    //    this.measureCountByWorker.push(this._measureByWorker[this.workerIds[i]].length);
    //}

    this.workerIdsInverted = {};
    for (let i = 0; i < this.workerIds.length; i++) {
        this.workerIdsInverted[this.workerIds[i]] = i;
    }

    this.n = this._measureArray.length;
    this.nWorkers = this.workerIds.length;
    this._measureOrderedAsR = this._measureByType.uncensored.concat(this._measureByType.greaterThan, this._measureByType.lessThan, this._measureByType.interval);
    this.muOverall = NaN;
    this.muWorker = [];
};



zygotine.M.WorkerDigest.prototype = {

    updateMuValues: function (muOverall, muWorker) {
        this.muOverall = muOverall;
        this.muWorker = muWorker.slice(0); // on crée une copie du tableau.
    },

    getAverages: function () {
        var globalSum = 0.0;
        var globalN = 0;
        var wAverages = [];
        for (let i = 0; i < this.workerIds.length; i++) {
            let workerId = this.workerIds[i]; // id d'un travailleur
            let nMeasures = this._measureByWorker[workerId].length; // nombre de mesures associées à un travailleur (workerId)
            let tmpSum = zU.sum(this._measureByWorker[workerId].map(function (o) { return o.generatedValue; })); // somme des mesures pour le travailleur
            wAverages.push(tmpSum / nMeasures);
            globalSum += tmpSum;
            globalN += nMeasures;
        }

        var average = globalSum / globalN;
        return { avg: average, workerAvg: wAverages };
    },

    getInits: function () {
        var wIds = this.workerIds;
        var wId;
        var sum = 0;
        var workerInfo = []; // une entrée pour chaque travailleur
        for (let i = 0; i < wIds.length; i++) {
            wId = wIds[i];
            workerInfo[wId] = new zygotine.M.Worker();
            let currentWInfo = workerInfo[wId];
            currentWInfo._mean = zU.sum(this._measureByWorker[wId].map(function (o) { return o.getInitialValue(); })) / this._measureByWorker[wId].length;
            sum += currentWInfo._mean;
        }

        var inits = {
            muOverall: sum / wIds.length,
            muWorker: [],
            sigmaWithin: NaN
        };

        for (let i = 0; i < wIds.length; i++) {
            wId = wIds[i];
            let currentWInfo = workerInfo[wId];
            let cm = currentWInfo._mean - inits.muOverall;
            inits.muWorker.push(cm);
            currentWInfo.mu = cm;
        }

        var predicted = this._measureOrderedAsR.map(function (m) {
            return m.getInitialValue() - workerInfo[m.workerId]._mean;
        }, this);

        inits.sigmaWithin = Math.sqrt(zygotine.U.variance(predicted));
        return inits;
    },
    /** 
     * @function
     * @param {number} muOverall
     * @param {number[]} muWorker
     * @param {number} sigmaWithin
     * @param {zygotine.M.DataSummary} data
     * @returns {undefined}
     */
    generateValues: function (muOverall, muWorker, sigmaWithin, data) {
        var tmpMuWorker = {};
        for (let i = 0; i < muWorker.length; i++) {
            tmpMuWorker[this.workerIds[i]] = muWorker[i];
        }

        var getMeans = function (corpus) {
            let tmp = corpus.map(function (measure) {
                return tmpMuWorker[measure.workerId] + muOverall;
            }, this);
            return tmp;
        };

        var getGenFunction = function (type) {

            switch (type) {
                case 'lt':
                    return function (corpus, means) {
                        var tmp = [];
                        var len = corpus.length;
                        for (let i = 0; i < len; i++) {
                            let generated = zygotine.O.rNormCensored(means[i], sigmaWithin, [], [data.lt[i]], false)[0];
                            tmp.push(generated);
                            corpus[i].generatedValue = generated;
                        }

                        return tmp;
                    };

                case 'gt':
                    return function (corpus, means) {
                        var tmp = [];
                        var len = corpus.length;
                        if (len > 0) {
                            for (let i = 0; i < len; i++) {
                                let generated = zygotine.O.rNormCensored(means[i], sigmaWithin, [data.gt[i]], [], false)[0];
                                tmp.push(generated);
                                corpus[i].generatedValue = generated;
                            }
                        }

                        return tmp;
                    };

                case 'i':
                    return function (corpus, means) {
                        var tmp = [];
                        var len = corpus.length;
                        if (len > 0) {
                            for (let i = 0; i < len; i++) {
                                let generated = zygotine.O.rNormCensored(means[i], sigmaWithin, [data.i.lower[i]], [data.i.upper[i]], false)[0];
                                tmp.push(generated);
                                corpus[i].generatedValue = generated;
                            }
                        }

                        return tmp;
                    };
            }
        };

        var corpus, tmp;

        corpus = this._measureByType.greaterThan;
        tmp = getGenFunction("gt")(corpus, getMeans.call(this, corpus));

        corpus = this._measureByType.lessThan;
        //zygotine.S.prng.init(12);
        tmp = getGenFunction("lt")(corpus, getMeans.call(this, corpus));

        corpus = this._measureByType.interval;
        tmp = getGenFunction("i")(corpus, getMeans.call(this, corpus));
    },

    getBeta: function (muOverall, muWorker) {
        var residuals = this._measureOrderedAsR.map(
            function (m, i) { return m.generatedValue - muWorker[this.workerIdsInverted[m.workerId]] - muOverall; },
            this);
        var beta = zygotine.U.sumSqr(residuals) / 2.0;
        // le programme appelant n'a pas besoin de residuals, mais fournit un moyen de se comparer à R.
        return { residuals: residuals, beta: beta };
    }
};



zygotine.M.permutation = function (n, perm, nans, ans) {
    var
        //double
        rT, mass, totalmass,
        //int
        i, j, k, n1, p = 1.0 / n;

    /* Record element identities */
    for (i = 0; i < n; i++) {
        perm[i] = i + 1;
    }
    var unif_rand = Math.random;
    /* Sort probabilities into descending order */
    /* Order element identities in parallel */
    //revsort(p, perm, n);

    /* Compute the sample */
    totalmass = 1;
    for (i = 0, n1 = n - 1; i < nans; i++, n1--) {
        rT = unif_rand();
        mass = 0;
        for (j = 0; j < n1; j++) {
            mass += p;
            if (rT <= mass)
                break;
        }

        ans[i] = perm[j];
        totalmass -= p;
        for (k = j; k < n1; k++) {
            //p[k] = p[k + 1];
            perm[k] = perm[k + 1];
        }
    }

    return { ans: ans, perm: perm };
};

zygotine.M.shuffle = function (n, k) {

    if ((typeof (k) === 'undefined') || (k < 1) || (k > n)) {
        k = n;
    }

    var x = new Array(n);
    var ik = new Array(k);
    for (let i = 0; i < n; i++) {
        x[i] = i;
    }

    for (let i = 0; i < k; i++) {
        let j = Math.floor(Math.random() * n);
        ik[i] = x[j] + 1;
        x[j] = x[--n];
    }

    return ik;
};
