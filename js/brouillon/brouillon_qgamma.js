/// <reference path="A.js" />
/// <reference path="B.js" />
/// <reference path="NUM.js" />
/// <reference path="M.js" />
/// <reference path="U.js" />
/// <reference path="S.js" />
/// <reference path="brouillon.js" />


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

/**
* Represents a model
* @constructor
* @param {zygotine.M.MeasureList} measureList 
* @param {zygotine.M.SEGInformedVarModelParameters} specificParameters 
* @param {zygotine.M.McmcParameters} mcmcParameters - MCMC parameters
* @param {zygotine.M.PastDataSummary} pds - past data summary
*
* @property {zygotine.M.DataSummary} data
* @property {boolean} hasError
* @property {number} initMu
* @property {number} initSigma
* @property {number} logSigmaMu
* @property {number} logSigmaPrec
* @property {zygotine.M.McmcParameters} mcmcParameters 
* @property {zygotine.M.MeasureList} measureList 
* @property {zygotine.M.Messages} messages 
* @property {number} muLower
* @property {number} muUpper
* @property {boolean} outcomeIsLogNormallyDistributed 
* @property {zygotine.M.PastDataSummary} pastData - past data summary
* @property {zygotine.M.SEGInformedVarModelResult} result
* @property {zygotine.M.SEGInformedVarModelParameters} specificParameters 
*/
zygotine.M.Model =
    function (
       measureList
       ) {

        this.className = "Model";
        zygotine.M.ErrorLogging.call(this);
        // Les 3 premiers paramètres doivent être présents.
        // pds peut-être absent

        this.messages.addWarning("allo");
        if (typeof measureList === 'undefined') {
            this.messages.addError(this.paramMissing);
            return this;
        }

        this.measureList = measureList;
        this.mergeMessages(measureList.messages);
        if (this.messages.hasError) {
            return this;
        }
    };


zygotine.M.Model.prototype = Object.create(zygotine.M.ErrorLogging.prototype);

zygotine.M.Model.prototype.className = "MODEL";
zygotine.M.Model.prototype.paramMissing = "SEGInformedVarModel constructor: the following parameters are required:  measureList, specificParameters, mcmcParameters.";
zygotine.M.Model.prototype.MEAny = false;
zygotine.M.Model.prototype.compute = function () { return 1; };


/**
* add an error Message to the property messages. The method return nothing
* @method
*
* @returns {SEGInformedVarModelResult}
*/
zygotine.M.Model.prototype.mergeMessages = function () {

    this.mergeMessagesFrom(this.measureList.messages);
};
var model = new zygotine.M.Model(new zygotine.M.MeasureList("98|97"))
