/* eslint 
    valid-jsdoc: 0
    no-extra-parens: 0
*/
/// <reference path="A.js" />
/// <reference path="M0.js" />


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
