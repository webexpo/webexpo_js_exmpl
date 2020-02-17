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
    this.initEntries({
      obsValues: ["24.7", "64.1", "13.8", "43.7", "19.9", "133", "32.1", "15", "53.7"],
      oel: "100"
    })
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
class Table4 extends IrsstReportTable {
  constructor() {
    super()
    this.initEntries({
      obsValues: ["24.7", "64.1", "13.8", "43.7", "19.9", "133", "32.1", "15", "53.7"],
      oel: "100"
    })
  }
  
  getTableTitle() {
    return "Exposure metrics point estimates and credible intervals for 3 choices of prior distribution"
  }
  
  fillTableCells() {
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

    $reportTable.find('.heading')
                .append($('<th>').append("Informedvar"))
                .append($('<th>').append("Uninformative"))
                .append($('<th>').append("Past.data"))
    let rows = [
      { resType: "gMean", label: "GM (90% CrI)" },
      { resType: "gSd", label: "GSD (90% CrI)" },
      { resType: "exceedanceFraction", label: "Exceedance fraction (%)(90% CrI)" },
      { resType: "percOfInterest", label: "95th percentile (90% CrI)" },
      { resType: "percOfInterest", label: "Overexposure risk (%, P95)", showRisk: true },
      { resType: "aMean", label: "AM (90% CrI)" },
      { resType: "aMean", label: "Overexposure risk (%, AM)", showRisk: true }
    ]

    rows.forEach(function(row) {
      let $tr = $("<tr>").append($("<td>").append(row.label))
      allRes.forEach(function(numRes) {
        let res = numRes[row.resType]
        let val = ""
        if ( $.inArray(row.showRisk, [undefined, false]) >= 0 ) {
          val = showEstimateWInterval(res, 2)
        } else {
          val = `${res.risk.toFixed(1)}%`
        }
        $tr.append($("<td>").append(val))
      })
      $reportTable.find('tbody').append($tr)
    })
  }
}