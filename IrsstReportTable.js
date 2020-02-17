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
            return workerObs.map(function(obs) { return `${obs}\t${workerId}` })
          })
        }
        val = val.join("\n")
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
      return { modelRes: model.result, 
               numRes: zygotine.X.getNumericalResult(
                        model.logN,
                        model.result.chains[`mu${this.isSEGModel ? "" : "Overall"}Sample`].data,
                        model.result.chains[`${this.isSEGModel ? "sd" : "sigma"}${this.isSEGModel ? "" : "Between"}Sample`].data,
                        model.oel,
                        model.confidenceLevelForCredibileInterval,
                        model.fracThreshold,
                        model.percOfInterest) }
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
          val = showRisk(res)
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