class IrsstReportTable {
  constructor(segModel, logDstrn) {
    this.isSEGModel = typeof segModel === 'undefined' || segModel
    this.isLogDstrn = typeof logDstrn === 'undefined' || logDstrn
    this.module = this.isSEGModel ? zygotine.SEG : zygotine.BW
    this.module.setDataEntries()
  }
  
  initEntries(params, isInfModel) {
    entries = this.module.dataEntries
    if ( typeof isInfModel === 'undefined' ) {
      isInfModel = true
    }
    
    // Force validation
    for ( var i in entries ) {
      let entry = entries[i]
      if ( entry.currentValue == "" && entry.initialValue != "" ) {
        entry.currentValue = entry.initialValue
      }
      entry.validation = { ok: true, empty: false }
    }
  
    entries.sigmaPrior.currentValue = isInfModel ? 'expostats' : 'uniform'
    entries.dstrn.currentValue = this.isLogDstrn ? 'logN' : 'norm'
    
    let defVals = this.module.defaultEntryValues
    let modelType = isInfModel ? (this.isSEGModel ? 'inform' : 'expostats') : (this.isSEGModel ? 'unInform' : 'uupOnSds')
    for ( var i in defVals ) {
      entries[i].currentValue = defVals[i][entries.dstrn.currentValue][modelType]
    }
    
    for ( var entr in params ) {
      let val = params[entr]
      if ( $.isArray(val) ) {
        if ( val.length && typeof(val[0]) === 'object' ) {
          val = val.map(function(v) {
            let workerId = Object.keys(v)[0]
            let workerObs = v[workerId]
            return workerObs.map(function(obs) { return `${obs}\t${workerId}` }).join('\r\n')
          })
        }
        val = val.join("\r\n")
      }
      entries[entr].currentValue = val
    }
  }
  
  getParams() {
    return {}
  }
  
  calculate() {
    let model = new this.module.Model()
    model.validate()
    if (!model.hasError) {
      model.doCalculation()
      this.module.lastModel = model
      let numRes = this.isSEGModel ?
        zygotine.X.getNumericalResult(
          model.logN,
          model.result.chains.muSample.data,
          model.result.chains.sdSample.data,
          model.oel,
          model.confidenceLevelForCredibileInterval,
          model.fracThreshold,
          model.percOfInterest) :
        this.module.getGlobalResult(
          model.logN,
          model.result.chains.sigmaWithinSample.data,
          model.result.chains.sigmaBetweenSample.data,
          model.result.chains.muOverallSample.data,
          model.oel,
          model.confidenceLevelForCredibileInterval,
          model.fracThreshold,
          model.percOfInterest,
          model.wwct,
          model.rAppapCoverage,
          model.probIndOverXThreshold)
      lastNumres = numRes
      return { modelRes: model.result, numRes }
    }
    return false
  }

  defineTableCells() {
    return { title: "--", numericalResults: [], headers: [], rows: [] }
  }
  
  draw() {
    let cells = this.defineTableCells()
    $('#tableTitle').text(cells.title)
    cells.headers.forEach(function(header) {
      $reportTable.find('.heading')
        .append($('<th>').append(header))
    })
    
    cells.rows.forEach(function(row) {
      let $tr = $("<tr>").append($("<td>").append(row.label))
      cells.numericalResults.forEach(function(numRes) {
        let res = numRes[row.resType]
        let val = ""
        if ( $.inArray(row.showRisk, [undefined, false]) >= 0 ) {
          val = showEstimateWInterval(res, 2, row.appendRisk === true)
        } else {
          val = showRisk(res, row.riskIdx)
        }
        $tr.append($("<td>").append(val))
      })
      $reportTable.find('tbody').append($tr)
    })
    $(".table-div").show()
    $('#loader').hide()
  }
  
  getTableTitle() {
    return "--"
  }
}

class Table3 extends IrsstReportTable {
  constructor() {
    super()
    this.initEntries({
      obsValues: ["24.7", "64.1", "13.8", "43.7", "19.9", "133", "32.1", "15", "53.7"],
      oel: "100"
    })
  }
    
  defineTableCells() {
    let c = this.calculate()  
    let numRes = c.numRes
  
    let title = "Exposure metrics point estimates and credible intervals for an example of Bayesian calculation for the lognormal model"
    let headers = [ "Point estimates and 90% credible interval" ]
    let rows = [
      { resType: "gMean", label: "GM" },
      { resType: "gSd", label: "GSD" },
      { resType: "exceedanceFraction", label: "Exceedance fraction (%)", appendRisk: true },
      { resType: "percOfInterest", label: "95th percentile", appendRisk: true },
      { resType: "aihaBandP95", label: "AIHA band probabilities in % (95th percentile)", showRisk: true },
      { resType: "aMean", label: "Arithmetic mean", appendRisk: true },
      { resType: "aihaBandAM", label: "AIHA band probabilities in % (AM)", showRisk: true }
    ]
    return { numericalResults: [numRes], title, headers, rows }
  }
}

class Table4 extends IrsstReportTable {
  constructor() {
    super()
    this.initEntries({
      obsValues: ["24.7", "64.1", "13.8", "43.7", "19.9", "133", "32.1", "15", "53.7"],
      oel: "100"
    })
  }
  
  defineTableCells() {
    let cInf = this.calculate()
    let numResInf = cInf.numRes
      
    this.initEntries({
      sdRangeInf: "0",
      sdRangeSup: "2.3"
    }, false)
    let cUninf = this.calculate()
    let numResUninf = cUninf.numRes
    
    this.initEntries({
      withPastData: true,
      pdMean: Math.log(5),
      pdSd: Math.log(2.4),
      pdN: 5
    })
    let cPd = this.calculate()
    let numResPd = cPd.numRes
  
    let allRes = [numResInf, numResUninf, numResPd]

    let title = "Exposure metrics point estimates and credible intervals for 3 choices of prior distribution"
    let headers = ["Informedvar", "Uninformative", "Past.data"]
    let rows = [
      { resType: "gMean", label: "GM (90% CrI)" },
      { resType: "gSd", label: "GSD (90% CrI)" },
      { resType: "exceedanceFraction", label: "Exceedance fraction (%)(90% CrI)" },
      { resType: "percOfInterest", label: "95th percentile (90% CrI)" },
      { resType: "percOfInterest", label: "Overexposure risk (%, P95)", showRisk: true },
      { resType: "aMean", label: "AM (90% CrI)" },
      { resType: "aMean", label: "Overexposure risk (%, AM)", showRisk: true }
    ]
    
    return { numericalResults: allRes, title, headers, rows }
  }
}

class Table6 extends IrsstReportTable {
  constructor() {
    super(false)
    this.initEntries({
      obsValues: [ { "worker-01" : [185, 34.8, 16.7, 12.4, 18.6, 47.4, 52.6, 15.3, 27.6, 26.3] },
                   { "worker-02" : [4.79, 23, 7.54, 62.3, 8.55, 9.28, 43.6, 94.2, 44.6, 66.6] },
                   { "worker-03" : [8.85, 31.7, 15.8, 89.6, 164, 40.5, 47.6, 75.5, 10.7, 62.3] },
                   { "worker-04" : [16.4, 6.91, 87.4, 20, 16.8, 7.12, 6.99, 16.4, 12.6, 63.9] },
                   { "worker-05" : [14.7, 59.6, 15, 21.8, 20.6, 96.1, 16.8, 15.8, 8.02, 26.7] },
                   { "worker-06" : [37.9, 96.9, 40.8, 106, 21.7, 25.8, 51.3, 23, 18.9, 20.2] },
                   { "worker-07" : [22, 44.8, 37.5, 16.6, 30.7, 7.07, 7.18, 80.9, 44.5, 135] },
                   { "worker-08" : [69.9, 30.5, 33.4, 53, 70.7, 78.3, 18, 45.2, 51.4, 33.7] },
                   { "worker-09" : [28.1, 7.49, 16, 23, 99.9, 12, 11.8, 57.4, 8.79, 24] },
                   { "worker-10" : [113, 7.68, 85.6, 196, 35, 17.6, 60.7, 15.5, 34.3, 12.1] } ],
        oel: "150"
    })
  }
    
  defineTableCells() {
    let c = this.calculate()  
    let numResLowRho = c.numRes
  
    this.initEntries({
      obsValues: [
        { "worker-01": [ 66.8, 46, 61.1, 54.6, 31.7, 74.3, 60.9, 53.4, 38.9, 27.5 ] },
        { "worker-02": [ 14.2, 53.9, 21.8, 47.8, 48.8, 76.5, 41.3, 20.4, 31.9, 31.1 ] },
        { "worker-03": [ 186, 84.6, 94.4, 218, 189, 130, 107, 80.6, 288, 173 ] },
        { "worker-04": [ 23.5, 16.2, 40.2, 130, 42.2, 25.7, 35.4, 40.8, 109, 40.9 ] },
        { "worker-05": [ 43.8, 31.1, 13.1, 24.1, 27.7, 23.9, 40.2, 60.3, 29.8, 37.2 ] },
        { "worker-06": [ 41, 11.4, 4.44, 12.9, 22.7, 20.5, 12.6, 8.35, 13.6, 28.1 ] },
        { "worker-07": [ 6.56, 9.5, 6.97, 5.92, 2.42, 14, 12.3, 3.07, 7.01, 6.49 ] },
        { "worker-08": [ 9.21, 9.42, 28.7, 72.9, 35.6, 17.2, 20.2, 13.4, 10.5, 26.3 ] },
        { "worker-09": [ 19.6, 14.3, 22.8, 35.1, 28.9, 36.9, 13, 13.3, 13.6, 37 ] },
        { "worker-10": [ 78.7, 28.2, 41.3, 14.4, 72.9, 10.2, 16.2, 15.8, 42.2, 61 ] },
      ]
    })
    
    let c2 = this.calculate()  
    let numResHighRho = c2.numRes
    
    let title = "Exposure metrics point estimates and credible intervals for an example of Bayesian calculation for the lognormal model (between-worker difference analyses"
    let headers = [ "Low within-worker correlation (rho=0.06)", "High within-worker correlation (rho=0.66)"]
    let rows = [
      { resType: "gMean", label: "GM" },
      { resType: "gSd", label: "GSD" }
    ]
    return { numericalResults: [numResLowRho, numResHighRho], title, headers, rows }
  }
}

class Table8 extends IrsstReportTable {
  constructor() {
    super(false)
    this.initEntries({
      obsValues: [
        { "worker-1": [31, 60.1, 133, 27.1 ] },
        { "worker-2" : [61.1, 5.27, 30.4, 31.7] },
        { "worker-3": [20.5, 16.5, 15.5, 71.5] }
      ],
      oel: 150
    })
  }
    
  defineTableCells() {
    let c = this.calculate()  
    let numRes = c.numRes
  
    let title = "Exposure metrics point estimates and credible intervals for an example of Bayesian calculation for the lognormal model (between-worker difference analyses) with realistic sample size"
    let headers = [ "Point estimate and 90% credible interval" ]
    let rows = [
      { resType: "groupGMean", label: "Group GM (90% CrI)" },
      { resType: "gSdB", label: "Between-worker GSD (90% CrI)" },
      { resType: "gSdW", label: "Within-worker GSD (90% CrI)" },
      { resType: "rho", label: "Within-worker correlation (rho) (90% CrI)" },
      { resType: "rho", label: "Probability that rho>0.2", showRisk: true },
      { resType: "rRatio", label: "R.ratio (90% CrI)" },
      { resType: "rRatio", label: "Probability that R>2", showRisk: true, riskIdx: 0 },
      { resType: "rRatio", label: "Probability that R>10", showRisk: true, riskIdx: 1 },
      { resType: "probIndOverXPerc", label: "Probability of individual overexposure (95th percentile) in % (90% CrI)" },
      { resType: "probIndOverXPerc", label: "Chances that the above probability is >20%", showRisk: true },
      { resType: "probIndOverXAMean", label: "Probability of individual overexposure (arithmetic mean) in % (90% CrI)" },
      { resType: "probIndOverXAMean", label: "Chances that the above probability is >20%", showRisk: true }
    ]
    return { numericalResults: [numRes], title, headers, rows }
  }
}