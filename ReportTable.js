class IrsstReportTable {
  constructor(segModel, infModel, logDstrn) {
    this.isSEGModel = typeof segModel === 'undefined' || segModel
    this.isInfModel = typeof infModel === 'undefined' || infModel
    this.isLogDstrn = typeof logDstrn === 'undefined' || logDstrn
    this.module = this.isSEGModel ? zygotine.SEG : zygotine.BW
    
    this.initEntries()
  }
  
  initEntries() {
    this.module.setDataEntries()
    
    let entries = this.module.dataEntries
    
    // Force validation
    for ( var i in entries ) {
      let entry = entries[i]
      if ( entry.currentValue == "" && entry.initialValue != "" ) {
        entry.currentValue = entry.initialValue
      }
      entry.validation = { ok: true, empty: false }
    }
    
    let modelType = this.isInfModel ? 'inform' : 'unInform'
  
    entries.sigmaPrior.currentValue = this.isInfModel ? 'expostats' : 'uniform'
    entries.dstrn.currentValue = this.isLogDstrn ? 'logN' : 'norm'
    
    let defVals = this.module.defaultEntryValues
    for ( var i in defVals ) {
      entries[i].currentValue = defVals[i][entries.dstrn.currentValue][modelType]
    }
    
    let params = this.getParams()
    for ( var entr in params ) {
      let val = params[entr]
      if ( $.isArray(val) ) {
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
                        model.result.chains.muSample.data,
                        model.result.chains.sdSample.data,
                        model.oel,
                        model.confidenceLevelForCredibileInterval,
                        model.fracThreshold,
                        model.percOfInterest) }
    }
    return false
  }

  fillTableCells() {
    
  }
  
  draw() {
    this.fillTableCells()
    $('#tableTitle').text(this.getTableTitle())
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
  }
  
  getParams() {
    return {
      obsValues: ["24.7", "64.1", "13.8", "43.7", "19.9", "133", "32.1", "15", "53.7"],
      oel: "100"
    }
  }
  
  getTableTitle() {
    return "Exposure metrics point estimates and credible intervals for an example of Bayesian calculation for the lognormal model"
  }
  
  fillTableCells() {
    let c = this.calculate()  
    let numRes = c.numRes
    
    $reportTable.find('.heading').append($('<th>').append("Point estimates and 90% credible interval"))
    let rows = [
      { resType: "gMean", label: "GM" },
      { resType: "gSd", label: "GSD" },
      { resType: "exceedanceFraction", label: "Exceedance fraction (%)", showRisk: true },
      { resType: "percOfInterest", label: "95th percentile", showRisk: true },
      { resType: "aihaBandP95", label: "AIHA band probabilities in % (95th percentile)" },
      { resType: "aMean", label: "Arithmetic mean", showRisk: true },
      { resType: "aihaBandAM", label: "AIHA band probabilities in % (AM)" }
    ]

    rows.forEach(function(row) {
      let res = numRes[row.resType]
      let val = ""
      if ( res.q.length == 3 ) {
        val = `${res.q[1].toFixed(1)} [${res.q[0].toFixed(1)} - ${res.q[2].toFixed(1)}] ${$.inArray(row.showRisk, [undefined, false]) >= 0 ? "" : ("Overexposure Risk: " + res.risk.toFixed(1) + '%')}`
      } else
      if ( res.q.length == 5 ) {
        val = res.risk
      }
      $reportTable.find('tbody').append($('<tr>').append($('<td>').append(row.label)).append($('<td>').append(val)))
    })
  }
}