/* eslint valid-jsdoc: 0 */
/// <reference path="A.js" />
/// <reference path="U.js" />
/// <reference path="S.js" />

zygotine.M = {};
var zM = zygotine.M;

/**
* Represents a message (error message or warning)
* @constructor
* @param {string} msg - the message
* @param {string} level - "info" | "warning" | "error"
* @param {string} src - the message src
*
* @property {string} level - "info" | "warning" | "error"
* @property {string} msgText - the message
* @property {string} src - object class name from which originates the message
*/
zygotine.M.Message = function (msg, level, src) {
    // msg and src are string, error is a boolean( true for error, false for warning)
    this.msgText = msg;
    this.level = level;
    this.source = src;
};

zygotine.M.Message.prototype = {
    toString: function () {
        return zU.fmt("{0}: {1}", this.level, this.msgText);
    }
};

/*****  Messages  **********/

/**
* Represents a list of messages
* @constructor
* @param {string} errSrc - default error source
*
* @property {boolean} hasError - by default it is false
* @property {zygotine.M.Message[]} msgList - an array of Message 
* @property {string} errorSrc; 
*/
zygotine.M.Messages = function (errSrc) {
    this.hasError = false;
    this.msgList = [];
    this.errorSrc = errSrc;
};

zygotine.M.Messages.prototype = {


    /**
     * add a warning Message. The method returns nothing
     * @method
     * @param {zygotine.O.Message} msgObject - a message object
     * @returns {undefined}
     */
    addMessage: function (msgObject) {
        this.msgList[this.msgList.length] = msgObject;
        if (msgObject.level === "error") {
            this.hasError = true;
        }
    },

    /**
    * create an error Message and add it. The method returns nothing.
    * @method
    * @param {string} msgText - string representing the message
    * @returns {undefined}
    */
    addError: function (msgText) {
        this.addMessage(new zygotine.M.Message(msgText, "error", this.errorSrc));
    },

    /**
    * create a warning Message and add it. The method returns nothing.
    * @method
    * @param {string} msgText - string representing the message
    * @returns {undefined}
    */
    addWarning: function (msgText) {
        this.addMessage(new zygotine.M.Message(msgText, "warning", this.errorSrc));
    },

    /**
    * create an informative Message and add it. The method returns nothing.
    * @method
    * @param {string} msgText - string representing the message
    * @returns {undefined}
    */
    addInfo: function (msgText) {
        this.addMessage(new zygotine.M.Message(msgText, "info", this.errorSrc));
    },

    toString: function () {
        let rep = [];
        rep.push(zU.fmt("hasError: {0}", this.hasError));
        rep.push(this.msgList.map(z => z.toString()).join("\n"));
        rep = rep.join("\n");
        return rep;
    }

};

/*******************************************/



/*****  Measure  **********/

/**
* Represents a Measure.
* @constructor
* @property {number} a - double
* @property {number} b - double
* @property {number} ordinal - int
* @property {string} type - measure type
* @property {string} workerId - the id of the worker, if available, to which the measure is associated
*/
zygotine.M.Measure = function () {
    // s a string
    this.a = Number.NaN;
    this.b = Number.NaN;
    this.ordinal = 0;
    this.type = undefined;
    this.workerId = "";
};

/**
 * gives a representation of a Measure.
 * @method toString 
 * @returns {string} - a string that represents the Measure
 */
zygotine.M.Measure.prototype.toString = function () {

    var rep = [];
    switch (this.type) {
        case 'uncensored':
            rep[0] = this.a;
            break;

        case 'greaterThan':
        case 'lessThan':
            rep[0] = (this.type === 'lessThan') ? "<" : ">";
            rep[1] = this.a;
            break;

        case 'interval':
            rep[0] = "[";
            rep[1] = this.a;
            rep[2] = ",";
            rep[3] = this.b;
            rep[4] = "]";
            break;
    }

    var ret = rep.join("");
    if (this.workerId !== "") {
        ret += ";" + this.workerId;
    }

    return ret;
};

zygotine.M.Measure.prototype.clone = function () {
    var m = new zygotine.M.Measure();
    m.a = this.a;
    m.b = this.b;
    m.ordinal = this.ordinal;
    m.type = this.type;
    m.workerId = this.workerId;
    return m;
};

/*******************************************/


/*****  ExtendedMeasure  **********/

/**
* Represents a Measure.
* @constructor
* @param {zygotine.M.Measure} m - all properties of m will be duplicated
*
* @property {number} a - double
* @property {number} b - double
* @property {number} currentValue - a generated value
* @property {number} ordinal - int
* @property {string} type - measure type
* @property {string} workerId - the id of the worker, if available, to which the measure is associated

*/
zygotine.M.ExtendedMeasure = function (m) {
    // s a string
    this.a = m.a;
    this.b = m.b;
    this.ordinal = m.ordinal;
    this.type = m.type;
    this.workerId = m.workerId;
    this.generatedValue = this.getInitialValue();
};

zygotine.M.ExtendedMeasure.prototype.getInitialValue = function () {
    return this.type === 'interval' ? (this.a + this.b) / 2.0 : this.a;
}

/**
 * gives a representation of a ExtendedMeasure.
 * @method toString 
 * @returns {string} - a string that represents the Measure
 */
zygotine.M.ExtendedMeasure.prototype.toString = function () {

    var rep = [];
    switch (this.type) {
        case 'uncensored':
            rep[0] = this.a;
            break;

        case 'greaterThan':
        case 'lessThan':
            rep[0] = (this.type === 'lessThan') ? "<" : ">";
            rep[1] = this.a;
            break;

        case 'interval':
            rep[0] = "[";
            rep[1] = this.a;
            rep[2] = ",";
            rep[3] = this.b;
            rep[4] = "]";
            break;
    }
    rep.push(" => ");
    rep.push(this.generatedValue);
    rep.push("(");
    rep.push(this.workerId);
    rep.push(")");
    return rep.join("; ");
};


/*******************************************/




/*****  ErrorLogging  **********/

zygotine.M.ErrorLogging = function () {
    this.messages = new zygotine.M.Messages(this.className); // no message, either warning or error
    this.hasError = false;
};

zygotine.M.ErrorLogging.prototype = {

    /**
    * used to add an error Message to the property messages. The method returns nothing
    * @method 
    * @param {string} msgText - string representing the message
    * @returns {undefined}
    */
    addError: function (msgText) {
        this.messages.addError(msgText);
        this.hasError = true;
    },

    /**
     * used to add a warning (Message) to the property messages. The method returns nothing
     * @method
     * @param {string} msgText - string representing the message
     * @returns {undefined}
     */
    addWarning: function (msgText) {
        this.messages.addWarning(msgText);
    },

    addInfo: function (msgText) {
        this.messages.addInfo(msgText);
    },

    /**
 * add each message contained in msgs using method addMessage 
 * @method
 * @param {zygotine.M.Messages} msgs - the Messages that contains the individual messages to be merged
 * @param {boolean} takeCopy - doit être un véritable booléen true ou false!
 *
 * @returns {undefined}
 */
    mergeMessagesFrom: function (msgs) {
        var i;

        var /** @type {zygotine.M.Message} */ msg;
        for (i = 0; i < msgs.msgList.length; i++) {
            msg = msgs.msgList[i];
            this.messages.addMessage(new zygotine.M.Message(msg.msgText, msg.level, msg.source));
            if (msg.level === 'error') {
                this.hasError = true;
            }
        }
    }
};

/*******************************************/



/*****  MeasureList  **********/

/**
* @description Represents a list of measures.
* @constructor
* @param {string} s - une chaine représantant les mesures sans 'erreur de mesure'
* @param {string} withWorkerInfo - un booléen - par défaut 'false'
* @property {boolean} anyCensored
* @property {boolean} hasError
* @property {boolean} hasME
* @property {zygotine.M.Messages} messages
* @property {object} measureByType
* @property {object} measureCountByType
* @property {zygotine.M.Measure[]} measureList
* @property {string} METext
* @property {number} n
* @property {RegExp} rgxME
*/
zygotine.M.MeasureList = function (s, withWorkerInfo) {

    zygotine.M.ErrorLogging.call(this);
    if (zygotine.isUndefined(withWorkerInfo)) {
        withWorkerInfo = false;
    }

    this.withWorkerInfo = withWorkerInfo;
    this.anyCensored = false;
    this.hasME = false;
    this.measureByType = { 'interval': [], 'lessThan': [], 'greaterThan': [], 'uncensored': [] };
    this.measureCountByType = { 'interval': 0, 'lessThan': 0, 'greaterThan': 0, 'uncensored': 0 };
    this.measureByWorker = {};
    this.measureList = [];
    this.METext = "";
    this.n = 0; // aucune mesure reconnue.
    this.nWAssigned = 0; // aucune mesure n'a un travailleur associé
    this.min = Infinity;
    this.max = -Infinity;

    var fmt = zygotine.U.fmt;

    if (!s) {
        this.addError("Parameter \"s\" is required.");
        return;
    }

    s = s.replace(/ /g, "");
    var records = this.splitRecords(s);
    if (records.length === 0) {
        this.addError(fmt("No measure found in string '{0}'!", s));
        return;
    }

    var i;
    /*@type {zygotine.M.Measure} */
    var m;

    this.hasME = this.rgxME.test(records[0]);
    if (this.hasME) {
        this.METext = records[0];
        this.addWarming("Measurement error not supported, it will be ignored. First record skipped!");
    }

    for (i = this.hasME ? 1 : 0; i < records.length; i++) {
        //parseMeasure retourne une mesure
        let fields = this.splitFields(records[i]);
        if (fields.length === 0) {
            // on passe à l'enregistrement suivant
            continue;
        }

        m = this.parseMeasure(fields[0]);

        if (m.invalid) {
            this.addError(fmt("Invalid measure '{0}' : record {1}.", records[i], i + 1));
            //break //*** on ne s'occupe pas de la suite en sortant de la boucle for.
            continue;
        } else if ((fields.length > 1) && (fields[1] !== "")) {
            m.workerId = fields[1];
        }

        this.addMeasure(m);
    } // for

    //On vérifie n
    if (!this.hasError) {
        this.n = this.measureCountByType.uncensored + this.measureCountByType.interval + this.measureCountByType.lessThan + this.measureCountByType.greaterThan;

        if ((this.n === 0)) {
            this.addError("No measure recognized.");
        } else {
            var aOrB;
            for (let i = 0; i < this.measureList.length; i++) {
                m = this.measureList[i];
                if (m.a < this.min) {
                    this.min = m.a;
                }

                let aOrB = (m.type === "interval") ? m.b : m.a;
                if (aOrB > this.max) {
                    this.max = aOrB;
                }
            }

            if (this.min <= 0) {
                this.addError("All values must be stricly positive!");
            }

            if (this.withWorkerInfo && (this.nWAssigned !== this.n)) {
                this.addError('All measures must be assigned to a worker.')
            }

        }
    }
}; // zygotine.M.MeasureList

zygotine.M.MeasureList.prototype = Object.create(zygotine.M.ErrorLogging.prototype);

zygotine.M.MeasureList.prototype.className = "MeasureList";

zygotine.M.MeasureList.prototype.rgxME = new RegExp("(sd|cv)\(.*\)", 'i');

// s is a string
// return an array of strings
zygotine.M.MeasureList.prototype.splitRecords = function (s) {
    var tmp = s.split(/[|\r\n]+/);
    tmp = tmp.filter(e => e !== "");
    return tmp;
};

/**
* @function - split string based on ';', '\t'
* @param {string} s - string to be splitted into fields.
* @returns {string[]} - the input string splitted
*/
zygotine.M.MeasureList.prototype.splitFields = function (s) {
    return s.split(/[;\t]+/);
};

/**
* Add a Measure. No test is made to check if for the measure to be added,  m.invalid is true.
* @method
* @param {Measure} m - a measure
* @returns {undefined}
*/
zygotine.M.MeasureList.prototype.addMeasure = function (/** @type  {zygotine.M.Measure}*/ m) {
    m.ordinal = this.measureList.length;
    this.measureList[this.measureList.length] = m;
    if (m.type !== 'uncensored') {
        this.anyCensored = true;
    }
    //Update collections
    this.measureCountByType[m.type] = this.measureCountByType[m.type] + 1;
    /** @type {number[]} */
    this.n++;
    if (m.workerId !== "") {
        this.nWAssigned++;
        this.measureByWorker[m.workerId] = this.measureByWorker[m.workerId] || [];
        this.measureByWorker[m.workerId].push(m);
    }

    this.measureByType[m.type].push(m);
};

/**
* parse a string and try to convert it to a measure. If the parsing fail, the invalid property of the returned measure is  set to true.
* @method
* @param {string} str
* @returns {zygotine.M.Measure} - a measure. 
*/
zygotine.M.MeasureList.prototype.parseMeasure = function (str) {
    // str is a string
    var pm = new zygotine.M.Measure();
    switch (str[0]) {
        case '[':
            pm.invalid = str.slice(-1) !== ']';
            if (!pm.invalid) {
                //tout ce qu'il y a entre les 2 crochets
                str = str.substring(1, str.length - 1);
                var numbers = str.split(',');
                if (numbers.length === 2) {
                    pm.type = "interval";
                    pm.a = Number(numbers[0]);
                    pm.invalid = !isFinite(pm.a);
                    if (!pm.invalid) {
                        pm.b = Number(numbers[1]);
                        pm.invalid = !isFinite(pm.b);
                        if (!pm.invalid) {
                            pm.invalid = pm.a >= pm.b;
                        }
                    }
                }
            }

            break;

        case '<':
            pm.type = "lessThan";
            pm.a = Number(str.substring(1, str.length));
            pm.invalid = !isFinite(pm.a);
            break;

        case '>':
            pm.type = "greaterThan";
            pm.a = Number(str.substring(1, str.length));
            pm.invalid = !isFinite(pm.a);
            break;

        default:
            pm.type = "uncensored";
            pm.a = Number(str);
            pm.invalid = !isFinite(pm.a);
            break;
    }

    return pm;
};

zygotine.M.MeasureList.prototype.transform = function (xFunction) {

    var ml = new zygotine.M.MeasureList(this.toString());
    for (let iM = 0; iM < ml.measureList.length; iM++) {
        /** type {zygotine.M.Measure} */
        m = ml.measureList[iM];
        m.a = xFunction(m.a);
        if (!isNaN(m.b)) {
            m.b = xFunction(m.b);
        }
    }
    // la chaine ml n'est pas cohérente; entre autres, le min et le max n'ont pas été ajustés.
    ml = new zygotine.M.MeasureList(ml.toString());
    return ml;
};

/**
* 
* @method toString - gives a representation of the MeasureList.
* @returns {string}
*/
zygotine.M.MeasureList.prototype.toString = function (recSep) {
    /** @type {zygotine.M.MeasureList} */
    if (zygotine.isUndefined(recSep)) {
        recSep = '|';
    }

    var self = this;
    if (self.messages.invalid) {
        return "Invalid measure list!";
    }

    /** @type {Measure[]} */
    var x = self.measureList;
    var a = x.map(function (x) { return x.toString(); });
    var ret = a.join(recSep);
    if (self.METext !== '') {
        ret = self.METext + " | " + ret;
    }

    return ret;
};



zygotine.M.MeasureList.divideByElv = function (measureList, elv) {
    //permet de créer des données compatibles avec ce qu'attend les modèles de McGill.
    var ml = new zygotine.M.MeasureList(measureList.toString());
    if (elv !== 1.0) {
        for (let iM = 0; iM < ml.measureList.length; iM++) {
            /** type {zygotine.M.Measure} */
            m = ml.measureList[iM];
            m.a = m.a / elv;
            if (!isNaN(m.b)) {
                m.b = m.b / elv;
            }
        }
    }
    // la chaine ml n'est pas cohérente; entre autres, le min et le max n'ont pas été ajustés.
    ml = new zygotine.M.MeasureList(ml.toString());
    return ml;
};

/*******************************************/



/*****  RawMeasures  **********/

/**
* Represents the measures in a simplified manner
* @constructor
*
* @property {number[]} gt
* @property {number[]} intervalGt
* @property {number[]} intervalLt
* @property {number[]} lt
* @property {number} uncensoredSum
* @property {number} uncensoredSum2
* @property {number[]} y
*/
zygotine.M.RawMeasures =
    function () {
        this.y = [];
        this.uncensoredSum = NaN;
        this.uncensoredSum2 = NaN;
        this.lt = [];
        this.gt = [];
        this.intervalGt = [];
        this.intervalLt = [];
        this.uncensoredSum = NaN;
        this.uncensoredSum2 = NaN;
    };

/*******************************************/



/*****  Range  **********/

/**
* un couple de nombres définissant un interval
* @param {number} l - la valeur à donner à la borne inférieure
* @param {number} u - la borne supérieure
* @constructor
* @property {number} lower - la borne inférieure
* @property {number} upper - la borne supérieure
*/
zygotine.M.Range = function (l, u) {
    this.lower = l;
    this.upper = u;
};

/*******************************************/



/***** DataSummary  ***********/

/**
* Represents the data provided by the user
* @constructor
* @param {zygotine.M.MeasureList} ml - a MeasureList
* @param {boolean} logNormalDistrn - either true, log normal or false, normal.
*
* @property {boolean} anyCensored - true if there is at least one censored measure
* @property {number[]} gt - number array for the "greater than" measures (>)
* @property {boolean} hasError - at least one error messages is an error.
* @property {zygotine.M.Range} i - un couple de nombres composé de lower et upper définissant les bornes d'un interval 
* @property {zygotine.M.RawMeasures} logTakenData - the log taken data as opposed to the origninal data.
* @property {boolean} logNormalDistrn - either true, log normal or false, normal. Same as the parameter of the same name
* @property {number[]} lt - an array of numbers for the "less than" measures (<)
* @property {zygotine.M.Measure[]} measureList - array of measures, these are duplicata of the measureList fiel of parameter ml.
* @property {zygotine.M.Messages} messages -  a container for warning or error messages
* @property {number} n - the number of measures
* @property {zygotine.M.RawMeasures} originalData - the original data as opposed to log taken data.
*/
zygotine.M.DataSummary = function (ml, logNormalDistrn) {

    zygotine.M.ErrorLogging.call(this);
    this.anyCensored = ml.anyCensored;
    this.logNormalDistrn = logNormalDistrn;
    this.n = ml.measureList.length; //nombre de mesures

    var f = logNormalDistrn ?
        function (m) {
            /** @type {zygotine.M.Measure} */
            var mc = m.clone();
            mc.a = Math.log(m.a);
            if (mc.type === 'interval') {
                mc.b = Math.log(m.b);
            }

            return mc;
        } :
        function (m) {
            /** @type {zygotine.M.Measure} */
            return m.clone();
        };

    this.measureList = ml.measureList.map(function (m) {
        /** @type {zygotine.M.Measure} */
        return f(m);
    });

    //DATA
    this.y = ml.measureByType["uncensored"].map(function (mes) { return mes.a; });
    this.gt = ml.measureByType["greaterThan"].map(function (mes) { return mes.a; });
    this.lt = ml.measureByType["lessThan"].map(function (mes) { return mes.a; });
    this.intervalGt = ml.measureByType["interval"].map(function (mes) { return mes.a; });
    this.intervalLt = ml.measureByType["interval"].map(function (mes) { return mes.b; });
    if (logNormalDistrn) {
        let f = function (a) {
            let l = a.length;
            for (let i = 0; i < l; i++) {
                a[i] = Math.log(a[i]);
            }
        };

        f(this.y);
        f(this.gt);
        f(this.lt);
        f(this.intervalGt);
        f(this.intervalLt);
    }

    var sumFun = zU.sum;
    var sumSqrFun = zU.sumSqr;
    this.i = new zygotine.M.Range(this.intervalGt, this.intervalLt);
    this.uncensoredSum = sumFun(this.y); //.reduce(function (accu, currentValue) { return accu + currentValue.a; }, 0.0);
    this.uncensoredSum2 = sumSqrFun(this.y); // .reduce(function (accu, currentValue) { return accu + (currentValue.a * currentValue.a); }, 0.0);
};


zygotine.M.DataSummary.prototype = Object.create(zygotine.M.ErrorLogging.prototype);
zygotine.M.DataSummary.prototype.className = "DataSummary";

/*******************************************/



/***** McmcParameters    *************/

/**
* Represents MCMC parameters to be used when running a model
* Tous les paramètres sont requis et doivent être du type attendu
* @constructor
* @param {number} nIter - sample size!
* @param {number} nBurnin - burnin size
* xparam {number} nThin - thinning parameter (1 no thinning, 2 means that 1 of 2 is retained ...)
* @param {boolean} monitorBurnin
*
* @property {boolean} hasError
* @property {zygotine.M.Messages} messages
* @property {boolean} monitorBurnin
* @property {number} nBurnin
* @property {number} nIter
* @property {number} nThin
*/
zygotine.M.McmcParameters = function (nIter, nBurnin, monitorBurnin) {
    zygotine.M.ErrorLogging.call(this);
    this.monitorBurnin = false;
    // this.nThin = 1;
    this.nBurnin = 500;
    this.nIter = 15000;

    if (typeof (monitorBurnin) === "boolean") {
        this.monitorBurnin = monitorBurnin;
    } else {
        this.monitorBurnin = false;
    }


    if (!this.messages.hasError && (typeof nBurnin !== "undefined")) {
        this.nBurnin = parseInt(nBurnin);
        if (isNaN(this.nBurnin) || this.nBurnin < 0) {
            this.addError("Parameter nBurnin is not well defined!");
        }
    } 

    if (!this.messages.hasError && (typeof nIter !== "undefined")) {
        this.nIter = parseInt(nIter);
        if (isNaN(this.nIter) || this.nIter < 0) {
            this.addError("Parameter nIter is not well defined!");
        }
    }
};

zygotine.M.McmcParameters.prototype = Object.create(zygotine.M.ErrorLogging.prototype);
zygotine.M.McmcParameters.prototype.className = "McmcParameters";
zygotine.M.McmcParameters.prototype.toString = function () {
    return zygotine.U.fmt("nBurnin={0}, nIter={1}, nThin={2}, monitorBurnin={3}", this.nBurnin, this.nIter, /* this.nThin,*/this.monitorBurnin);
};

zygotine.M.McmcParameters.getDefaults = function () {
    return new zygotine.M.McmcParameters(15000, 500, false);
};

/*******************************************/


/***** PastDataSummary *************/

/**
* Represents past data (from the litterature ...)
* @constructor
* @param {string} def chaine d'entrée
*
* @property {boolean} hasError
* @property {boolean} defined
* @property {number} logSigmaMu
* @property {number} logSigmaSd
* @property {number} mean
* @property {zygotine.M.Messages} messages
* @property {number} n
* @property {number} ns2
* @property {number} sd
* @property {number} shape
*/
zygotine.M.PastDataSummary =
    function (/** string */ def) {
        zygotine.M.ErrorLogging.call(this);
        this.defined = false; // a priori l'objet est bidon
        if (typeof def === "undefined") {
            return this;
        }

        //valeurs fournies à l'entrée
        this.sd = this.mean = this.n = NaN;
        //valeurs calculés
        this.ns2 = NaN;

        def = def.replace(/ /g, "");
        var parameters = def.split(/[;\t]+/);
        if (parameters.length < 3) {
            this.addError("Invalid data. 3 parameters are expected: 'mean, sd and n'.");
        }
        else {
            this.mean = Number(parameters[0]);
            if (!isFinite(this.mean)) {
                this.addError("Invalid data. Mean can not be parsed to a finite float.");
            }

            this.sd = Number(parameters[1]);
            if (!isFinite(this.sd) || this.sd <= 0) {
                this.addError("Invalid data. sd can not be parsed to a finite positive float.");
            }

            this.n = Number(parameters[2]);
            if (!isFinite(this.n) || !Number.isInteger(this.n)) {
                this.addError("Invalid data. n can not be parsed to an integer.");
            } else if (this.n < 2) {
                this.addError("Invalid data. n must be greater or equal to 2.");
            }

            if (!this.hasError) {
                this.defined = true;
                this.ns2 = (this.n - 1) * (this.sd * this.sd);
            }
        }
    };

zygotine.M.PastDataSummary.prototype = Object.create(zygotine.M.ErrorLogging.prototype);

zygotine.M.PastDataSummary.prototype.className = "PastDataSummary";
zygotine.M.PastDataSummary.prototype.level = 0.95;

zygotine.M.PastDataSummary.prototype.toString = function () {

    return zygotine.U.fmt(
        "mean={0}, sd={1}, n={2}, ns2={3}, defined={4}",
        this.mean,
        this.sd,
        this.n,
        this.ns2,
        this.defined);
};

zygotine.M.PastDataSummary.dummyPDS = new zygotine.M.PastDataSummary();

/*******************************************/



/****** Chain    **************/

/**
* @constructor
* @param {string} label étiquette permettant d'identifier la chaine
* @param {number[]} data un tableau donnant les valeurs de la chaine
* @property {string} label
* @property {number[]} data
*/
zygotine.M.Chain = function (label, data) {
    this.label = label;
    this.data = data;
    this._quantile = [];
    this.quantileProbs = [];
};


/*******************************************/

/****** Iteration *******************/
/**
* Donne le résultat obtenu lors de l'exécution d'un modèle
* @constructor
*
* @property {number} n donne la position dans la suite partant de 0 et se terminant à burnin.length + sample.length - 1;
* @property {number} mu
* @property {boolena} burnin 
* @property {number} sd
* @property {number} when
*/
zygotine.M.Iteration = function () {
    this.n = -1;
    this.mu = NaN;
    this.sd = NaN;
    this.when = null;
    this.burnin = null; // true pour burnin
};

zygotine.M.Iteration.prototype = {
    set: function (n, mu, sd, burnin) {
        this.n = n;
        this.mu = mu;
        this.sd = sd;
        this.burnin = burnin;
        this.when = Date.now();
    }
};
/*******************************************/



/****** ModelLogger ************************/

/**
* Permet de suivre l'exécution (compute) d'un modèle
* @constructor
* @param {number} delay 
* @param {number} step 
* @param {function} callback 
* 
* @property {zygotine.M.Iteration} iteration
* @property {number} delay
* @property {number} step
* @property {number} endTime
* @property {number} lastCallTime
* @property {number} startTime result
* @property {function} callback 
*/

zygotine.M.ModelLogger = function (delay, step, callback) {
    this.iteration = new zygotine.M.Iteration();
    this.delay = zygotine.isUndefined(delay) ? 80 : delay;
    this.step = zygotine.isUndefined(step) ? 100 : step;
    this.lastCallTime = this.startTime = this.endTime = NaN;
    this.callback = callback;
};

zygotine.M.ModelLogger.prototype = {
    init: function () {
        this.lastCallTime = this.startTime = performance.now();
    },

    setEndTime: function () {
        this.endTime = performance.now();
    },

    display: function () {
        this.callback(this.iteration);
        this.lastCallTime = performance.now();
    }
};


/*******************************************/

/***** ModelResult *************************/

/**
* Represents result for the SEGInformedVar model
* @constructor
* @param {zygotine.M.SEGInformedVarModel} model 
*
* @property {zygotine.M.Chain[]} chains;
* @property {string} mcmcParameters
* @property {string} measureList
* @property {zygotine.M.Messages} messages
* @property {zygotine.M.SEGInformedVarModel} model 
* @property {zygotine.M.ModelLogger} modelLogger
* @property {string} specificParameters
* @property {number} totalNumberOfIterations
* @property {number} elapsedRunTime
*/
zygotine.M.ModelResult = function (model) {
    // Un ModelResult doit être instancié dans la méthode compute du Model.
    // Il faut lorsqu'on sort de compute mettre à jour la propriété hasError.
    // 
    zygotine.M.ErrorLogging.call(this);
    this.modelClassName = model.className;
    //this.modelLogger = model.logger;
    this.specificParameters = model.specificParameters.toString();
    this.logN = model.specificParameters.logNormalDstrn;
    this.mcmcParameters = model.mcmcParameters.toString();
    this.measureList = model.measureList.toString();
    this.chains = {};
    this.chainByType = { burnin: [], sample: [] };
    this.totalNumberOfIterations = 0;
    this.prngSeed = NaN;
    this.elapsedRunTime = NaN;
    this.quantileProbs = [.025, .05, .1, .25, .5, .75, .9, .95, .975];
};

zygotine.M.ModelResult.prototype = Object.create(zygotine.M.ErrorLogging.prototype);
/** function
* @param {string[]} names - les prefixes des noms de chaines, par ex. mu ou sd.
* @param {number} burninMonitoringLength - doit être 0, si le monitorBurnin est faux.
* @param {number} nIter - la taille de l'échantillon retenue
*/
zygotine.M.ModelResult.prototype.initChains = function (namePrefixes, burninMonitoringLength, nIter) {
    let ln = namePrefixes.length;
    var label, prefix, arr;
    for (let i = 0; i < ln; i++) {
        prefix = namePrefixes[i];
        label = prefix + "Burnin";
        arr = new Array(burninMonitoringLength);
        arr.fill(NaN);
        this.chains[label] = new zygotine.M.Chain(label, arr);
        this.chainByType.burnin.push(this.chains[label]);
        label = prefix + "Sample";
        arr = new Array(nIter);
        arr.fill(NaN);
        this.chains[label] = new zygotine.M.Chain(label, arr);
        this.chainByType.sample.push(this.chains[label]);
    }
};

zygotine.M.ModelResult.prototype.addLogElvToMuChains = function (elv) {
    var wPrefixes = this.workerChainLabelPrefixes;
    var logElv = Math.log(elv);
    var chain;

    chain = this.chains["muBurnin"].data;
    for (let ic = 0; ic < chain.length; ic++) {
        chain[ic] += logElv;
    }

    chain = this.chains["muSample"].data;
    for (let ic = 0; ic < chain.length; ic++) {
        chain[ic] += logElv;
    }
};


zygotine.M.ModelResult.prototype.computeQuantiles = function (probs) {
    var q = new zygotine.S.Quantile(typeof probs !== 'undefined' ? probs : this._quantileProbs);
    var burnin = this.chainByType.burnin;
    for (let i = 0; i < burnin.length; i++) {
        if (burnin[i].data.length === 0) {
            break;
        }

        burnin[i].quantile = q.compute(burnin[i].data);
    }

    var sample = this.chainByType.sample;
    for (let i = 0; i < burnin.length; i++) {
        sample[i].quantile = q.compute(sample[i].data);
    }
};

zygotine.M.ModelResult.prototype.getQuantileArray = function () {
    var rep = [].concat.apply([], this.chainByType.burnin.map(o => o.quantile));
    var rep2 = [].concat.apply([], this.chainByType.sample.map(o => o.quantile));
    rep = rep.concat(rep2);
    return rep;
};


/*******************************************/



/***** BaseModel ***************************/

/**
* Represents a model
* @constructor
* @param {zygotine.M.MeasureList} measureList - la liste de mesures 
* @param {zygotine.M.SEGInformedVarModelParameters} specificParameters - les paramètres spécifiques au modèle
* @param {zygotine.M.McmcParameters} mcmcParameters - MCMC parameters
*
* @property {string} className - at the prototype level
* @property {boolean} hasError - inherits from zygotine.M.ErrorLogging
* @property {zygotine.M.ModelLogger} logger -
* @property {zygotine.M.McmcParameters} mcmcParameters - MCMC parameters
* @property {zygotine.M.MeasureList} measureList - list of measures
* @property {zygotine.M.Messages} messages - inherits from zygotine.M.ErrorLogging
* @property {zygotine.M.PastDataSummary} pastData - past data summary
* @property {zygotine.M.SEGInformedVarModelParameters} specificParameters - parameters that are specific to the SEGInformedVarModel
*/
zygotine.M.BaseModel =
    function (
        measureList,
        specificParameters,
        mcmcParameters,
        pds) {

        this.className = "BaseModel";
        //        this.logger = null;
        zygotine.M.ErrorLogging.call(this);

        if ((typeof measureList === 'undefined') || (typeof specificParameters === 'undefined') || (typeof mcmcParameters === 'undefined')) {
            this.addError(this.paramMissing);
        } else {
            this.measureList = measureList;
            if (this.measureList.hasError) {
                this.addError("Syntax error: parameter measureList is not valid.");
            }

            this.specificParameters = specificParameters;
            this.mcmcParameters = mcmcParameters;
            if (this.specificParameters.logN) {
                this.measureList = zygotine.M.MeasureList.divideByElv(ml, this.specificParameters.elv);
            }
        }

        this.logN = this.specificParameters.logNormalDstrn;
        this.elv = this.specificParameters.elv;
    };

zygotine.M.BaseModel.prototype = Object.create(zygotine.M.ErrorLogging.prototype);

//zygotine.M.BaseModel.prototype.createLogger = function (delay, step, callBackFunction) {
//    this.logger = new zygotine.M.ModelLogger(delay, step, callBackFunction);
//    return this.logger;
//};

zygotine.M.BaseModel.prototype.validateParameters__ = function (result) {
    // Il se peut que nous ayons des erreurs aient été confirmées lors de l'analyse et la conversion des chaines servant à
    // définir les mesures.
    if (this.hasError) {
        result.addError("Model contains errors.");
        /** @type {zygotine.M.Message[]} msgList} */
        var msgList = this.messages.msgList;
        /** @type {zygotine.M.Message} msgList} */
        var message;
        for (let i = 0; i < msgList.length; i++) {
            /** @type {zygotine.M.Message} msgList} */
            message = msgList[i];
            if (message.level === 'error') {
                result.addError(message.msgText);
            }
        }

        result.addInfo(zU.fmt("{0}: execution aborted. No further validation will be performed.", this.className));
        return;
    }

    zygotine.M.validateModelParameters(result, this);
};


zygotine.M.BaseModel.prototype.doParameterValidation = function () {
    var
        prngSeed = 1,
        validationOnly = true;
    return this.run(prngSeed, validationOnly);
};

zygotine.M.BaseModel.prototype.compute = function (prngSeed) {
    if (typeof prngSeed === 'undefined') {
        prngSeed = (Math.random() * Math.pow(2, 31)) | 0;
    }

    var validationOnly = false;
    return this.run(prngSeed, validationOnly);
};

/***** SEGInformedVarModel *****************/

/**
* Represents a model
* @constructor
* @param {zygotine.M.MeasureList} measureList - la liste des mesures
* @param {zygotine.M.SEGInformedVarModelParameters} specificParameters  - les paramètres propres au modèle
* @param {zygotine.M.McmcParameters} mcmcParameters - MCMC parameters
* @param {zygotine.M.PastDataSummary} pds - past data summary
*
* @property {boolean} hasError - inherits from zygotine.M.ErrorLogging
* @property {zygotine.M.McmcParameters} mcmcParameters - MCMC parameters
* @property {zygotine.M.MeasureList} measureList - list of measures
* @property {zygotine.M.Messages} messages - inherits from zygotine.M.ErrorLogging
* @property {zygotine.M.PastDataSummary} pastData - past data summary
* @property {zygotine.M.SEGInformedVarModelParameters} specificParameters - parameters that are specific to the SEGInformedVarModel
*/
zygotine.M.SEGInformedVarModel =
    function (
        measureList,
        specificParameters,
        mcmcParameters,
        pds) {

        zygotine.M.BaseModel.call(this, measureList, specificParameters, mcmcParameters);
        this.className = "SEGInformedVarModel";
        if (typeof pds === 'undefined') {
            pds = zygotine.M.PastDataSummary.dummyPDS;
        }

        if (pds.hasError) {
            this.addError("Syntax error: parameter pds is not valid.");
        }

        this.pastData = pds;
    };


zygotine.M.SEGInformedVarModel.prototype = Object.create(zygotine.M.BaseModel.prototype);

zygotine.M.SEGInformedVarModel.prototype.paramMissing = "SEGInformedVar model constructor: the following parameters are required:  measureList, specificParameters, mcmcParameters.";

zygotine.M.SEGInformedVarModel.prototype.MEAny = false;




/**
* méthode privée, ne devrait être appelée que de doParameterValidation ou de compute.
* les deux paramètres doivent être présents et bien définits. Le premier est un entier et le second un booléen.
* @method
*
* @returns {SEGInformedVarModelResult}
*/
zygotine.M.SEGInformedVarModel.prototype.run = function (prngSeed, validationOnly) {
    /** @type {zygotine.M.SEGInformedVarModelResult} */
    var result = new zygotine.M.SEGInformedVarModelResult(this);
    this.validateParameters__(result); // Méthode de BaseModel
    //var logger = result.modelLogger;
    //logger.startTime = performance.now();
    //if (zygotine.isUndefined(validationOnly) || !zygotine.isABoolean(validationOnly)) {
    //    validationOnly = false;
    //}

    if (validationOnly) {
        result.addInfo("Parameters validation performed.");
    }

    if (result.hasError || validationOnly) {
        return result;
    }

    // L'objectif n'était pas que de valider les paramètres.
    // De plus les paramètres sont valides.
    // On poursuit donc avec le calcul des chaines.



    result.prngSeed = prngSeed;
    zygotine.S.prng.init(result.prngSeed);

    /** @type {zygotine.M.McmcParameters} */
    var mcmc = this.mcmcParameters;
    var // mcmc
        monitorBurnin = mcmc.monitorBurnin,
        nBurnin = mcmc.nBurnin,
        nIter = mcmc.nIter,
        nThin = 1; // mcmc.nThin;

    result.initChains(["mu", "sd"], mcmc.monitorBurnin ? mcmc.nBurnin : 0, nIter);

    var
        burninMu = result.chains.muBurnin.data,
        burninSd = result.chains.sdBurnin.data,
        sampleMu = result.chains.muSample.data,
        sampleSd = result.chains.sdSample.data;

    /** @type {zygotine.M.SEGInformedVarModelParameters} */
    var sp = this.specificParameters;
    var logN = sp.logNormalDstrn;
    var data = new zygotine.M.DataSummary(this.measureList, sp.logNormalDstrn);
    /** @type {zygotine.O.YGen} */
    var genY = new zO.YGen(sp.logNormalDstrn);

    var
        combinedN = data.n,
        mu = sp.initMu,
        muLim = [sp.muLower, sp.muUpper],
        sigma = sp.initSigma,
        logSigmaMu = sp.logSigmaMu,
        logSigmaSd = 1.0 / Math.sqrt(sp.logSigmaPrec); // ok pour 0.16 de PatrickB


    if (this.pastData.defined) {
        combinedN += this.pastData.n;
    }

    var
        muCondMean,
        muCondSd,
        p,
        pLim = [],
        sigmaBeta,
        u,
        yBar;

    var // int
        iter = 0,
        nIterations = nBurnin + (nIter * nThin),
        savedIter = 0;

    for (iter = 0; iter < nIterations; iter++) {

        if (data.anyCensored) {
            genY = zygotine.O.YGen.inits(data, mu, sigma, logN);
        }

        sigmaBeta = (data.uncensoredSum2 + genY.sum2 - 2.0 * mu * (data.uncensoredSum + genY.sum) + data.n * Math.pow(mu, 2.0)) / 2.0;
        if (this.pastData.defined) {
            sigmaBeta += this.pastData.n / 2.0 * Math.pow(this.pastData.mean - mu, 2) + this.pastData.ns2 / 2.0;
        }

        u = zS.uniform.sample(1, 0, 1);
        sigma = zygotine.O.sigmaGenICdf4InformedVar(combinedN, sigmaBeta, logSigmaMu, logSigmaSd, u);

        muCondMean = this.pastData.defined ?
            (data.uncensoredSum + genY.sum + this.pastData.n * this.pastData.mean) / combinedN :
            (data.uncensoredSum + genY.sum) / data.n;

        muCondSd = sigma / Math.sqrt(combinedN); // mu.cond.sd <- sigma/sqrt(data$N)
        pLim = [zygotine.S.normal.cdf((muLim[0] - muCondMean) / muCondSd, 0, 1, true, false),
        zygotine.S.normal.cdf((muLim[1] - muCondMean) / muCondSd, 0, 1, true, false)]; //  pnorm((mu.lim - mu.cond.mean) / mu.cond.sd)
        p = zS.uniform.sample(1, pLim[0], pLim[1]);
        mu = zS.normal.icdf(p, muCondMean, muCondSd, true, false);
        //if (logger) {
        //    if ((iter % logger.step) === 0) {
        //        logger.iteration.set(iter, mu, sigma, iter < nBurnin);
        //        logger.display();
        //    }
        //}

        //if (isNaN(mu) || isNaN(sigma)) {
        //    result.addError('NaN values generated : mu = {0}, sd={1}.', mu, sigma);
        //    logger.endTime = performance.now();
        //    return result;
        //}

        if (iter < nBurnin) {
            if (monitorBurnin) {
                burninMu[iter] = mu;
                burninSd[iter] = sigma;
            }
        }
        else if ((iter - nBurnin) % nThin === 0) {
            sampleMu[savedIter] = mu;
            sampleSd[savedIter] = sigma;
            savedIter++;
        }
    }// for( int iter = 1 ...

    if (this.logN) {
        result.addLogElvToMuChains(this.elv);
    }
    //logger.endTime = performance.now();
    result.totalNumberOfIterations = iter;
    return result;
};

/*******************************************/


/***** ModelParameters *******/


/**
* Represents parameters for a Model
* @constructor
* @param {boolean} logNormalDstrn - true for lognormal distribution, false for normal distribution
*
* @property {boolean} logNormalDstrn - true for lognormal distribution, false for normal distribution
*/
zygotine.M.ModelParameters = function (logNormalDstrn, elv) {
    this.logNormalDstrn = logNormalDstrn;
    this.elv = elv;
};

zygotine.M.ModelParameters.prototype = {
    toString: function () {
        return zU.toString(this);
    }
};




/***** SEGInformedVarModelParameters *******/

/**
* Represents parameters for the SEGInformedVarModel
* @constructor
* @param {boolean} logNormalDstrn - true for lognormal distribution, false for normal distribution
*
* @property {number} muLower - lower bound for mu
* @property {number} muUpper - upper bound for mu
* @property {number} logSigmaMu 
* @property {number} logSigmaPrec
* @property {number} initMu
* @property {number} initSigma
*/
zygotine.M.SEGInformedVarModelParameters = function (logNormalDstrn, elv) {
    //    zygotine.M.ErrorLogging.call(this);
    zygotine.M.ModelParameters.call(this, logNormalDstrn, elv);
    this.muLower = -20;
    this.muUpper = 20;
    this.logSigmaMu = -0.1744;
    this.logSigmaPrec = 2.5523;
    this.initMu = -1.2039728043259361; // log(0.3) 
    this.initSigma = 0.91629073187415511; //log(2.5)

    if (!logNormalDstrn) {
        this.muLower = 40;
        this.muUpper = 125;
        this.logSigmaMu = 1.0986122886681098; //#(GM = 3) // corrigé le 31 mai log(3)
        this.logSigmaPrec = 1.191059; //(GSD=2.5)
        this.initMu = 85;
        this.initSigma = 3;
    }
};

zygotine.M.SEGInformedVarModelParameters.prototype = Object.create(zygotine.M.ModelParameters.prototype);

//zygotine.M.SEGInformedVarModelParameters.prototype = {
//    toString: function () {
//        return zygotine.U.fmt("distribution={0}, muLower={1}, muUpper={2}, logSigmaMu={3}, logSigmaPrec={4}, initMu={5}, initSigma={6}",
//            this.logNormalDstrn ? "LogNormal" : "Normal", this.muLower, this.muUpper, this.logSigmaMu, this.logSigmaPrec, this.initMu, this.initSigma);
//    }
//};

/*******************************************/


/****** SEGInformedVarModelResult **********/

/**
* Represents result for the SEGInformedVar model
* @constructor
* @param {zygotine.M.SEGInformedVarModel} model - le modèle qui produira les résultats seront affichés
*
* @property {string} mcmcParameters
* @property {string} measureList
* @property {zygotine.M.Messages} messages
* @property {zygotine.M.SEGInformedVarModel} model 
* @property {zygotine.M.PastDataSummary} pastData 
* @property {string} specificParameters
* @property {number} totalNumberOfIterations
*/
zygotine.M.SEGInformedVarModelResult = function (model) {
    zygotine.M.ModelResult.call(this, model);
    this.pastDataSummary = model.pastData.toString();
};

zygotine.M.SEGInformedVarModelResult.prototype = Object.create(zygotine.M.ModelResult.prototype);
zygotine.M.SEGInformedVarModelResult.prototype.className = "SEGInformedVarModelResult";


/*******************************************/



/***** SEGUninformativeModel ***************/

/**
* Represents a model
* @constructor
* @param {zygotine.M.MeasureList} measureList - une liste de mesures
* @param {zygotine.M.SEGInformedVarModelParameters} specificParameters - des paramètres propres au modèle en balisant l'exécution
* @param {zygotine.M.McmcParameters} mcmcParameters - les paramètres MCMC 
*
* @property {string} className - le nom de la classe, hérité de BaseModel
* @property {boolean} hasError - vrai si une erreur a été détecté, sinon faux, hérité de LoggingError via BaseModel
* @property {zygotine.M.McmcParameters} mcmcParameters = les paramètres MCMC, hérités de BaseModel
* @property {zygotine.M.MeasureList} measureList - la liste de mesures utilisée, héritée de BaseModel
* @property {zygotine.M.Messages} messages - une liste de messages d'erreurs ou de mises en garde, hérités de LoggingError via BaseModel
* @property {zygotine.M.SEGInformedVarModelParameters} specificParameters  - les paramètres propres à l'exécution du modèle, hérités de BaseModel
*/
zygotine.M.SEGUninformativeModel =
    function (
        measureList,
        specificParameters,
        mcmcParameters) {
        zygotine.M.BaseModel.call(this, measureList, specificParameters, mcmcParameters);
    };

zygotine.M.SEGUninformativeModel.prototype = Object.create(zygotine.M.BaseModel.prototype);
zygotine.M.SEGUninformativeModel.prototype.className = "SEGUninformativeModel";
zygotine.M.SEGUninformativeModel.prototype.paramMissing = "SEGUninformativeModel constructor: the following parameters are required:  measureList, specificParameters, mcmcParameters.";
zygotine.M.SEGUninformativeModel.prototype.MEAny = false;
zygotine.M.SEGUninformativeModel.prototype.run = function (prngSeed, validationOnly) {

    /** @type {zygotine.M.SEGUninformativeModelParameters} */
    var result = new zygotine.M.SEGUninformativeModelParameters(this);
    this.validateParameters__(result); // Méthode de BaseModel

    if (validationOnly) {
        result.addInfo("Parameters validation performed.");
    }

    if (result.hasError || validationOnly) {
        return result;
    }

    //les paramètres d'entrée sont valides. On sauvegarde la racine du générateur de nbr aléatoires.
    if (typeof prngSeed === 'undefined') {
        prngSeed = (Math.random() * Math.pow(2, 31)) | 0;
    }

    zygotine.S.prng.init(prngSeed);
    result.prngSeed = prngSeed;

    /** @type {zygotine.M.McmcParameters} */
    var mcmc = this.mcmcParameters;
    var // mcmc
        nIter = mcmc.nIter,
        nThin = 1; //mcmc.nThin,
    nBurnin = mcmc.nBurnin,
        monitorBurnin = mcmc.nBurnin;

    result.initChains(["mu", "sd"], mcmc.monitorBurnin ? mcmc.nBurnin : 0, nIter);
    var
        burninMu = result.chains.muBurnin.data,
        burninSd = result.chains.sdBurnin.data,
        sampleMu = result.chains.muSample.data,
        sampleSd = result.chains.sdSample.data;

    var
        pnorm = function (x) {
            return zygotine.S.normal.cdf(x, 0, 1, true, false);
        },
        iter = 0,
        nIterations = nBurnin + (nIter * nThin),
        savedIter = 0;

    /** @type {zygotine.M.SEGUninformativeModelParameters} */
    var sp = this.specificParameters;
    var logN = sp.logNormalDstrn;
    /** @type {zygotine.M.DataSummary} */
    var data = new zygotine.M.DataSummary(this.measureList, logN);
    /** @type {zygotine.O.YGen} */
    var genY = new zygotine.O.YGen(sp.logNormalDstrn);

    var
        mu = sp.initMu,
        muLim = [sp.muLower, sp.muUpper],
        sdRange = [sp.sdRange[0], sp.sdRange[1]],
        tauCondAlpha = data.n / 2 - 1,
        tauBeta = 0.0,
        tauRange = [1.0 / (sp.sdRange[1] * sp.sdRange[1]), 1.0 / (sp.sdRange[0] * sp.sdRange[0])],
        tau = 1.0 / (sp.initSd * sp.initSd);

 

    var
        muCondMean,
        muCondSd,
        p,
        pLim = [],
        tauCondBeta;

    for (iter = 0; iter < nIterations; iter++) {

        if (data.anyCensored) {
            genY = zygotine.O.YGen.inits(data, mu, 1 / Math.sqrt(tau), logN);
            muCondMean = (data.uncensoredSum + genY.sum) / data.n;
        } else {
            muCondMean = zU.mean(data.y);
        }

        tauCondBeta = tauBeta + (data.uncensoredSum2 + genY.sum2 - 2 * mu * (data.uncensoredSum + genY.sum) + data.n * mu * mu) / 2.0;
        if (tauCondBeta < 1e-6) {
            tauCondBeta = 0.0; // protection against numeric imprecision
        }

        if (tauCondBeta === 0.0) {
            let tmpRange = this.sdRange;
            if (tmpRange[0] === 0.0) {
                tmpRange[0] = 0.001;
            }

            let sigma = zO.randomPow(data.n, tmpRange);
            tau = 1.0 / (sigma * sigma);
        } else {
            // sample from a truncated gamma distribution  
            tau = zygotine.O.rGammaTruncated(tauCondAlpha, tauCondBeta, tauRange);
        }

        // Sample from f(mu | tau)
        muCondSd = 1 / Math.sqrt(data.n * tau);
        plim = [pnorm((muLim[0] - muCondMean) / muCondSd), pnorm((muLim[1] - muCondMean) / muCondSd)];
        p = zygotine.S.uniform.sample(1, plim[0], plim[1]);
        mu = zygotine.S.normal.icdf(p, muCondMean, muCondSd, true, false);
        if (iter < nBurnin) {
            if (monitorBurnin) {
                burninMu[iter] = mu;
                burninSd[iter] = 1 / Math.sqrt(tau);
            }
        }
        else if ((iter - nBurnin) % nThin === 0) {
            sampleMu[savedIter] = mu;
            sampleSd[savedIter] = 1 / Math.sqrt(tau);
            savedIter++;
        }
    } // for (iter = 0; iter < nIterations; iter++) 

    if (this.logN) {
        result.addLogElvToMuChains(this.elv);
    }

    result.totalNumberOfIterations = iter;
    return result;
}; // compute

/*******************************************/



/** SEGUninformativeModelParameters ********/

/**
* Represents parameters for the SEGInformedVar model
* @constructor
* @param {boolean} logNormalDstrn : true for the lognormal distribution and false for the normal distribution
* @property {number} muLower
* @property {number} muUpper
* @property {number} initMu
* @property {number} initSd
* @property {number[]} sdRange
*/
zygotine.M.SEGUninformativeModelParameters = function (logNormalDstrn, elv) {
    zygotine.M.ModelParameters.call(this, logNormalDstrn, elv);
    if (logNormalDstrn) {
        this.logNormalDstrn = logNormalDstrn;
        this.muLower = -20;
        this.muUpper = 20;
        this.initMu = -1.2039728043259361; // log(0.3) 
        this.initSd = 0.91629073187415511;  // log(2.5)
        this.sdRange = [0.095, 2.3];
    } else {
        this.muLower = 40;
        this.muUpper = 125;
        this.initMu = 85;
        this.initSd = 3;
        this.sdRange = [0.1, 20];
    }
};

zygotine.M.SEGUninformativeModelParameters.prototype = Object.create(zygotine.M.ModelParameters.prototype);




/****** SEGInformedVarModelResult *******/

/**
* Represents result for the SEGUninformativeModel model
* @constructor
* @param {zygotine.M.SEGUninformativeModel} model - le modèle auquel sont rattachés les résultats
*
* @property {string} mcmcParameters
* @property {string} measureList
* @property {zygotine.M.Messages} messages
* @property {zygotine.M.SEGInformedVarModel} model 
* @property {zygotine.M.PastDataSummary} pastData 
* @property {string} specificParameters
* @property {number} totalNumberOfIterations
*/
zygotine.M.SEGUninformativeModelResult = function (model) {
    zygotine.M.ModelResult.call(this, model);
};

zygotine.M.SEGUninformativeModelResult.prototype = Object.create(zygotine.M.ModelResult.prototype);
zygotine.M.SEGUninformativeModelResult.prototype.className = "SEGUninformativeModelResult";


/*******************************************/

/***** BetweenWorkerModel ***************/

/**
* Represents a model
* @constructor
* @param {zygotine.M.MeasureList} measureList - une liste de mesures
* @param {zygotine.M.BetweenWorkerModelParameters} specificParameters - des paramètres propres au modèle qui en balisent l'exécution
* @param {zygotine.M.McmcParameters} mcmcParameters - les paramètres MCMC 
*
* @property {string} className - le nom de la classe, hérité de BaseModel
* @property {boolean} hasError - vrai si une erreur a été détecté, sinon faux, hérité de LoggingError via BaseModel
* @property {zygotine.M.McmcParameters} mcmcParameters = les paramètres MCMC, hérités de BaseModel
* @property {zygotine.M.MeasureList} measureList - la liste de mesures utilisée, héritée de BaseModel
* @property {zygotine.M.Messages} messages - une liste de messages d'erreurs, de messages d'information ou de mises en garde, héritée de LoggingError via BaseModel
* @property {zygotine.M.BetweenWorkerModelParameters} specificParameters  - les paramètres propres à l'exécution du modèle, hérités de BaseModel
*/
zygotine.M.BetweenWorkerModel =
    function (
        measureList,
        specificParameters,
        mcmcParameters) {

        zygotine.M.BaseModel.call(this, measureList, specificParameters, mcmcParameters);
        this.className = "BetweenWorkerModel";
    };

zygotine.M.BetweenWorkerModel.prototype = Object.create(zygotine.M.BaseModel.prototype);
zygotine.M.BetweenWorkerModel.prototype.betaMin = 1.0E-8;
zygotine.M.BetweenWorkerModel.prototype.paramMissing = "BetweenWorkerModel constructor: the following parameters are required:  measureList, specificParameters, mcmcParameters.";
zygotine.M.BetweenWorkerModel.prototype.calcSigma = function (n, sigmaRange, u) {
    if (typeof u === 'undefined') {
        u = zygotine.S.uniform.sample(1, 0, 1);
    }

    let a = 1 - n;
    let f1 = [Math.pow(sigmaRange[0], a), Math.pow(sigmaRange[0], a)];
    a = 1.0 / a;
    let f2 = [Math.pow(1 - u, a), Math.pow(u, a)];
    return zygotine.U.sumProduct(f1, f2);
};



zygotine.M.BetweenWorkerModel.prototype.run = function (prngSeed, validationOnly) {
    var result = new zygotine.M.BetweenWorkerModelResult(this);
    this.validateParameters__(result); // Méthode de BaseModel
    if (validationOnly) {
        result.addInfo("Parameters validation performed.");
    }

    if (result.hasError || validationOnly) {
        return result;
    }


    // L'objectif n'était pas que de valider les paramètres.
    // De plus les paramètres sont valides.
    // On poursuit donc avec le calcul des chaines.

    result.prngSeed = prngSeed;
    zygotine.S.prng.init(result.prngSeed);

    /** @type {zygotine.M.McmcParameters} */
    var mcmc = this.mcmcParameters;
    var // mcmc
        nIter = mcmc.nIter,
        nThin = 1; // mcmc.nThin,
    nBurnin = mcmc.nBurnin,
        monitorBurnin = mcmc.monitorBurnin;

    /** @type {zygotine.M.BetweenWorkerModelParameters} */
    var sp = this.specificParameters;
    var uupOnSds = sp.uupOnSds;
    var logN = sp.logNormalDstrn;
    /** @type {zygotine.M.DataSummary} */
    var data = new zygotine.M.DataSummary(this.measureList, logN);
    /** @type {zygotine.M.WorkerDigest} */
    var workerDigest = new zygotine.M.WorkerDigest(data.measureList);
    result.workerIds = workerDigest.workerIds;

    //On initialise les chainesm, burnin et sample
    result.workerChainLabelPrefixes = workerDigest.workerIds.map(function (w) { return "mu_" + w; }); // workerDigest.workerIds est ordonné alphabétiquement
    var chainLabelPrefixes = ["muOverall", "sigmaWithin", "sigmaBetween"].concat(result.workerChainLabelPrefixes);
    result.initChains(chainLabelPrefixes, mcmc.monitorBurnin ? mcmc.nBurnin : 0, nIter);
    result.workers = { ids: workerDigest.workerIds.slice(0), invertedIds: Object.assign({}, workerDigest.workerIdsInverted) };
    //les valeurs initiales
    var
        tmpObj = workerDigest.getInits();
    var
        muOverall = tmpObj.muOverall,
        muWorker = tmpObj.muWorker,
        sigmaWithin = tmpObj.sigmaWithin,
        sigmaBetween;


    workerDigest.updateMuValues(muOverall, muWorker);
    // Averages contient une moyenne d'ensemble des mesures (avg) et un tableau de moyennes par travailleur (workerAvg).
    // En autant qu'il y ait des données censurées, on mettra à jour ces infos à chaque itération
    // sinon les valeurs calculées ci-bas demeureront inchangées.
    var
        averages = workerDigest.getAverages();

    /** @type {zygotine.O.YGen} */
    var genY = new zygotine.O.YGen(sp.logNormalDstrn);


    // Rapplelons que logSigmaWithinSd et logSigmaBetweenSd ne seront utilisés que si uupOnSds est faux!
    var
        logSigmaWithinSd = NaN,
        logSigmaBetweenSd = NaN;

    if (!sp.uupOnSds) {
        logSigmaBetweenSd = 1 / Math.sqrt(sp.logSigmaBetweenPrec);
        logSigmaWithinSd = 1 / Math.sqrt(sp.logSigmaWithinPrec)
    }

    var
        beta, // b dans le code R de PB
        iter = 0,
        nIterations = nBurnin + (nIter * nThin),
        savedIter = 0;

    // 2 variables qui ne seront utilisées ssi uupOnSds est vrai, autremenent elles demeureront de type undefined.
    var tauWithinRange, tauBetweenRange;

    if (uupOnSds) {
        tauWithinRange = [1.0 / (sp.sigmaWithinRange[1] * sp.sigmaWithinRange[1]), 1.0 / (sp.sigmaWithinRange[0] * sp.sigmaWithinRange[0])];
        tauBetweenRange = [1.0 / (sp.sigmaBetweenRange[1] * sp.sigmaBetweenRange[1]), 1.0 / (sp.sigmaBetweenRange[0] * sp.sigmaBetweenRange[0])]; // il se peut que  sp.sigmaWihtinRange soit 0, alors la borne supérieure sera Infinity.
    }

    var // des doubles
        tmpMean,
        tmpSd,
        sw2,
        sb2;
    var // des tableaux de doubles
        muA,
        sigma2A,
        tmpArr,
        tmpVariance;

    for (iter = 0; iter < nIterations; iter++) {

        if (data.anyCensored) {
            workerDigest.generateValues(muOverall, muWorker, sigmaWithin, data);
            //On prend les moyennes qui varient en compte les valeurs générées associées aux mesures censurées
            averages = workerDigest.getAverages();
        }

        let tmp = workerDigest.getBeta(muOverall, muWorker);
        beta = tmp.beta;

        // Sample from f(sigma.within | other parms)
        if (uupOnSds) {
            if (beta < this.betaMin) {
                let u = zygotine.S.uniform.sample(1, 0, 1);
                sigmaWithin = this.calcSigma(data.n, sp.sigmaWithinRange, u);
            }
            else {
                let tau = zygotine.O.rGammaTruncated((data.n / 2.0) - 1.0, beta, tauWithinRange);
                sigmaWithin = 1.0 / Math.sqrt(tau);
            }
        } else {
            sigmaWithin = zygotine.O.sigmaGenICdf4InformedVar(data.n, beta, sp.logSigmaWithinMu, logSigmaWithinSd)
        } //if (uupOnSds)

        // Sample from f(sigma.between | other parms)
        beta = zygotine.U.sumSqr(muWorker) / 2.0;
        if (uupOnSds) {
            if (beta < this.betaMin) {
                let u = zygotine.S.uniform.sample(1, 0, 1);
                sigmaBetween = this.calcSigma(workerDigest.nWorkers, sp.sigmaBetweenRange, u);
            }
            else {
                let tau = zygotine.O.rGammaTruncated((workerDigest.nWorkers / 2.0) - 1.0, beta, tauBetweenRange);
                sigmaBetween = 1.0 / Math.sqrt(tau);
            }
        } else {
            sigmaBetween = zygotine.O.sigmaGenICdf4InformedVar(workerDigest.nWorkers, beta, sp.logSigmaBetweenMu, logSigmaBetweenSd);
        }



        // Sample from from f(mu.overall | other parms)
        tmpMean = averages.avg - zU.sumProduct(workerDigest.measureCountByWorker, muWorker) / data.n;
        tmpSd = sigmaWithin / Math.sqrt(data.n);
        muOverall = zygotine.O.rNormCensored(tmpMean, tmpSd, [sp.muOverallLower], [sp.muOverallUpper], false)[0];
        muA = zygotine.U.substract(averages.workerAvg, muOverall);

        // Sample from f(mu.worker's | other parms)
        sw2 = sigmaWithin * sigmaWithin;
        sigma2A = workerDigest.measureCountByWorker.map(function (n) { return sw2 / n; });
        sb2 = sigmaBetween * sigmaBetween;
        tmpMean = muA.map(function (x, i) { return (x * sb2) / (sigma2A[i] + sb2); });
        tmpVar = sigma2A.map(function (x) { return (x * sb2) / (x + sb2); });
        muWorker = tmpMean.map(function (mean, i) { return zygotine.S.normal.sample(1, mean, Math.sqrt(tmpVar[i])); });
        workerDigest.updateMuValues(muOverall, muWorker);

        if (iter < nBurnin) {
            if (monitorBurnin) {
                result.updateChains(muOverall, sigmaWithin, sigmaBetween, muWorker, true, iter);
            }
        } else {
            if ((iter - nBurnin) % nThin === 0) {
                result.updateChains(muOverall, sigmaWithin, sigmaBetween, muWorker, false, savedIter);
                savedIter++;
            }
        }
    } // for (iter = 0; iter < nIterations; iter++) 

    if (this.logN) {
        result.addLogElvToMuChains(this.elv);
    }

    result.totalNumberOfIterations = iter;
    return result;
}; // compute

/*******************************************/


/****** BetweenWorkerModelResult **********/

/**
* Represents result for the BetweenWorkerModel model
* @constructor
* @param {zygotine.M.BetweenWorkerModel} model - an instance of BetweenWorkerModel for which the result is built.
*
* @property {string} mcmcParameters
* @property {string} measureList
* @property {zygotine.M.Messages} messages
* @property {zygotine.M.BetweenWorkerModel} model 
* @property {string} specificParameters
* @property {number} totalNumberOfIterations
*/
zygotine.M.BetweenWorkerModelResult = function (model) {
    zygotine.M.ModelResult.call(this, model);
    this.workerIds = [];
};

zygotine.M.BetweenWorkerModelResult.prototype = Object.create(zygotine.M.ModelResult.prototype);
zygotine.M.BetweenWorkerModelResult.prototype.className = "BetweenWorkerModelResult";

zygotine.M.BetweenWorkerModelResult.prototype.updateChains = function (muOverall, sigmaWithin, sigmaBetween, muWorker, burnin, position) {
    var wPrefixes = this.workerChainLabelPrefixes;
    var burninOrSample = burnin ? "Burnin" : "Sample";
    var burninMuWorker = [], sampleMuWorker = [];
    wPrefixes.map(function (prefix, i) { this.chains[prefix + burninOrSample].data[position] = muWorker[i]; }, this);
    this.chains["muOverall" + burninOrSample].data[position] = muOverall;
    this.chains["sigmaWithin" + burninOrSample].data[position] = sigmaWithin;
    this.chains["sigmaBetween" + burninOrSample].data[position] = sigmaBetween;
};

zygotine.M.BetweenWorkerModelResult.prototype.addLogElvToMuChains = function (elv) {
    var wPrefixes = this.workerChainLabelPrefixes;
    var logElv = Math.log(elv);
    var chain;
    for (let ip = 0; ip < wPrefixes.length; ip++) {
        chain = this.chains[wPrefixes[ip] + 'Burnin'].data;
        for (let ic = 0; ic < chain.length; ic++) {
            chain[ic] += logElv;
        }

        chain = this.chains[wPrefixes[ip] + 'Sample'].data;
        for (let ic = 0; ic < chain.length; ic++) {
            chain[ic] += logElv;
        }
    }

    chain = this.chains["muOverallBurnin"].data; 
    for (let ic = 0; ic < chain.length; ic++) {
        chain[ic] += logElv;
    }

    chain = this.chains["muOverallSample"].data;
    for (let ic = 0; ic < chain.length; ic++) {
        chain[ic] += logElv;
    }
};



/*******************************************/


/***** BetweenWorkerModelParameters *******/

/**
* Représente les paramètres de départ du modèle BetweenWorkerModel
* @constructor
* @property {boolean} logNormalDstrn - un booléen, vrai pour la loi log-normale et faux pour la loi normale
* @property {number} logSigmaBetweenMu - un nombre, pertinent ssi uupOnSds est faux
* @property {number} logSigmaBetweenPrec - un nombre, pertinent ssi uupOnSds est faux
* @property {number} logSigmaWithinMu - un nombre, pertinent ssi uupOnSds est faux
* @property {number} logSigmaWithinPrec - un nombre, pertinent ssi uupOnSds est faux
* @property {number} muOverallLower - paramètre commun au 2 types de priors possibles (uupOnSds)
* @property {number} muOverallUpper - paramètre commun au 2 types de priors possibles (uupOnSds)
* @property {number[]} sigmaBetweenRange - un interval, pertinent ssi uupOnSds est vrai
* @property {number[]} sigmaWithinRange - un interval, pertinent ssi uupOnSds est vrai
* @property {boolean} uupOnSds -  un booléen, vrai si l'on utilise une prior uniforme, faux sinon ...
*/
zygotine.M.BetweenWorkerModelParameters = function (logNormalDstrn, uupOnSds, elv) {
    zygotine.M.ModelParameters.call(this, logNormalDstrn, elv);
    this.uupOnSds = uupOnSds;

    //les 2 premiers paramètres, balisant muOverall, sont présents quelle que soit la valeur de uupOnSds
    if (logNormalDstrn) {
        this.muOverallLower = -20;
        this.muOverallUpper = 20;
    } else {
        this.muOverallLower = 40;
        this.muOverallUpper = 125;
    }

    // les 6 paramètres suivants sont divisés en 2 groupes selon la valeur de uupOnSds
    if (uupOnSds) {
        if (logNormalDstrn) {
            this.sigmaBetweenRange = [0, 2.3];
            this.sigmaWithinRange = [0.095, 2.3];
        } else {
            this.sigmaBetweenRange = [0, 20];
            this.sigmaWithinRange = [0.1, 20];
        }
    } else {
        if (logNormalDstrn) {
            this.logSigmaBetweenMu = -0.8786;
            this.logSigmaBetweenPrec = 1.634;
            this.logSigmaWithinMu = -0.4106;
            this.logSigmaWithinPrec = 1.9002;
        } else {
            this.logSigmaBetweenMu = 1.098612;
            this.logSigmaBetweenPrec = 1.191059;
            this.logSigmaWithinMu = 1.098612;
            this.logSigmaWithinPrec = 1.191059;
        }
    }
};

zygotine.M.BetweenWorkerModelParameters.prototype = Object.create(zygotine.M.ModelParameters.prototype);


/*******************************************/
