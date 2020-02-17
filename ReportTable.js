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
    let modelType = isInfModel ? 'inform' : 'unInform'
    
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
    for ( var i in defVals ) {
      entries[i].currentValue = defVals[i][entries.dstrn.currentValue][modelType]
    }
    
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