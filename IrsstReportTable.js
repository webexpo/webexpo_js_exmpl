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
      var numRes
      if ( this.isSEGModel ) {
        numRes = zygotine.X.getNumericalResult(
          model.logN,
          model.result.chains.muSample.data,
          model.result.chains.sdSample.data,
          model.oel,
          model.confidenceLevelForCredibileInterval,
          model.fracThreshold,
          model.percOfInterest)
        }
        else {
          numRes = this.module.getGlobalResult(
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
            
          var workerIds = model.result.workerIds
          this.module._createWorkerNumResTables(workerIds)
          let workerResults = {}
          workerIds.forEach(function(wid) {
            let muWorkerChainId = `mu_${wid}Sample`
            let muWrkrChain = model.result.chains[muWorkerChainId].data
            let res = zygotine.X.getNumericalResult(
              model.logN,
              muWrkrChain,
              model.result.chains.sigmaWithinSample.data,
              model.oel, 
              model.confidenceLevelForCredibileInterval, 
              model.fracThreshold, 
              model.percOfInterest)
            workerResults[wid] = res
          })
          numRes.workerResults = workerResults
        }
      lastNumRes = numRes
      return { modelRes: model.result, numRes }
    }
    return false
  }

  translateTableLabel(lbl) {
    let k = 0, l = 0, tokens = [], match = null
    if ( lbl.indexOf(')') >= 0 ) {
      while ( (l = lbl.indexOf(')', k)) >= 0 ) {
        let substr = lbl.substring(k, l+1)
        match = substr.match(/^(\s?)(.*[^\s])(\s?)\(([^)]+)\)/)
        if ( $.isArray(match) ) {
          tokens.push(`${match[1]}${$.i18n(match[2])}${match[3]}(${$.i18n(match[4])})`)
        }
        k = l+1
      }
      lbl = tokens.join('')
    } else {
      match = lbl.match(/(^.+)\s([a-zA-Z]*)(>)([0-9.%]+)$/)
      if ( $.isArray(match) && match.length == 5 ) {
        lbl = `${$.i18n(match[1])} ${match[2]}${match[2].length > 0 ? " " : ""}${$.i18n(match[3])} ${match[4]}`
      } else {
        lbl = $.i18n(lbl)
      }
    }
    
    return lbl
  }
  
  defineTableCells() {
    return { title: "--", numericalResults: [], headers: [], rows: [] }
  }
  
  draw() {
    let cells = this.defineTableCells()
    $('#tableTitle').text($.i18n(`table${cells.tableNo}-title`))
      .width($('#reportTable').width()*.95)
    
    let ths = this
    cells.headers.forEach(function(header) {
      let headerTxt = typeof header == "string" ? header : header.header
      let attr = typeof header == "string" ? "" : header.elemAttrs
      $reportTable.find('.heading')
        .append($(`<th ${attr}>`).append(ths.translateTableLabel(headerTxt)))
    })
    
    if ( typeof cells.subheaders !== 'undefined' ) {
      cells.subheaders.forEach(function(subheader) {
      $reportTable.find('.sub-heading')
        .append($(`<th>`).append(ths.translateTableLabel(subheader)))
      })
      $reportTable.find('.sub-heading').addClass('show')
    }
    
    cells.rows.forEach(function(row) {
      let $tr = $("<tr>").append($("<td>").append(ths.translateTableLabel(row.label)))
      cells.numericalResults.forEach(function(numRes) {
        let res = numRes[row.resType]
        let val = ""
        if ( $.inArray(row.showRisk, [undefined, false]) >= 0 ) {
          val = showEstimateWInterval(res, 2, row.appendRisk === true)
        } else {
          val = showRisk(res, row.riskIdx)
        }
        
        /* Decimal separator */
        val = val.replace(/(\d+).(\d+)/g, "$1,$2")
        
        $tr.append($("<td>").append(val))
      })
      $reportTable.find('tbody').append($tr)
    })
    $(".table-div").show('fast', function() {
      $('#tableTitle').width($('#reportTable').width()*.95)
    })
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
    let tableNo = '3'
  
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
    return { tableNo, numericalResults: [numRes], headers, rows }
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
    let tableNo = '4'
      
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
    
    return { numericalResults: allRes, tableNo, headers, rows }
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
    
    let tableNo = '6'
    let headers = [ "Low within-worker correlation (rho=0.06)", "High within-worker correlation (rho=0.66)"]
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
    return { numericalResults: [numResLowRho, numResHighRho], tableNo, headers, rows }
  }
}

class Table7 extends IrsstReportTable {
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
    let cLow = this.calculate()
    let lowRhoExposed = findExposerWorkers(cLow.numRes.workerResults)
    let numResLowRhoLeastExposed = cLow.numRes.workerResults[lowRhoExposed.leastExposed]
    let numResLowRhoMostExposed = cLow.numRes.workerResults[lowRhoExposed.mostExposed]
  
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
    
    let cHigh = this.calculate()  
    let highRhoExposed = findExposerWorkers(cHigh.numRes.workerResults)
    let numResHighRhoLeastExposed = cHigh.numRes.workerResults[highRhoExposed.leastExposed]
    let numResHighRhoMostExposed = cHigh.numRes.workerResults[highRhoExposed.mostExposed]
    
    let tableNo = '7'
    let headers = [ { header: "Least exposed worker (GM)", elemAttrs: "colspan='2'" }, { header: "Most exposed worker (GM)", elemAttrs: "colspan='2'" } ]
    let subheaders = [ "Least exposed worker (rho=0.06)", "Most exposed worker (rho=0.06)", "Least exposed worker (rho=0.66)", "Most exposed worker (rho=0.66)" ]
    let rows = [
      { resType: "gMean", label: "GM" },
      { resType: "gSd", label: "GSD" },
      { resType: "exceedanceFraction", label: "Exceedance fraction (%)" },
      { resType: "percOfInterest", label: "95th percentile" },
      { resType: "aMean", label: "AM" }
    ]
    return { numericalResults: [numResLowRhoLeastExposed, numResLowRhoMostExposed, numResHighRhoLeastExposed, numResHighRhoMostExposed], tableNo, headers, subheaders, rows }
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
  
    let tableNo = '8'
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
    return { numericalResults: [numRes], tableNo, headers, rows }
  }
}

class TableC2 extends IrsstReportTable {
  constructor() {
    super(true, false)
    this.initEntries({
      obsValues: [ 81, 79.5, 80.7, 78.1, 80.1, 74.8, 74.8, 79.8, 79.8 ],
      oel: 85
    }, false)
  }
    
  defineTableCells() {
    let c = this.calculate()  
    let numRes = c.numRes
  
    let tableNo = 'C2'
    let headers = [ "Point estimates and 90% credible interval" ]
    let rows = [
      { resType: "aMean", label: "Arithmetic mean" },
      { resType: "aSd", label: "Arithmetic standard deviation" },
      { resType: "exceedanceFraction", label: "Exceedance fraction (%)" },
      { resType: "percOfInterest", label: "95th percentile" }
    ]
    return { numericalResults: [numRes], tableNo, headers, rows }
  }
}

class TableC3 extends IrsstReportTable {
  constructor() {
    super(false, false)
    this.initEntries({
      obsValues: [
        { "worker-1" : [76.2, 82.3, 81.7, 73.7, 79.4, 79.1, 80.2, 71, 86.9, 75.6] },
        { "worker-2" : [ 70.6, 78.7, 77.6, 76.9, 79.5, 84.8, 77.6, 65.5, 74.1, 69.9 ] },
        { "worker-3" : [ 79.2, 77.7, 73.5, 78.9, 81.6, 83.1, 85.1, 84.2, 79.8, 84.1 ] },
        { "worker-4" : [ 79.1, 77.6, 81.2, 82.6, 81.6, 82.4, 76.9, 87.6, 80.4, 79.7 ] },
        { "worker-5" : [ 85.3, 92.2, 75.8, 84.1, 76.1, 84.6, 78.9, 75.8, 89, 87.1] },
        { "worker-6" : [ 77.8, 89, 81.9, 80.4, 88.5, 87, 85, 88.1, 81.3, 90.6 ] },
        { "worker-7" : [ 79.1, 80.7, 85.8, 84.8, 88.5, 82.6, 78.6, 90.1, 82.9, 83 ] },
        { "worker-8" : [ 80, 76.6, 84.6, 77.1, 81.5, 77.4, 73.5, 82.2, 74.4, 77.6 ] },
        { "worker-9" : [ 80, 81.2, 73.8, 80.7, 76.9, 77.5, 74.6, 70.6, 82.3, 66.4 ] },
        { "worker-10" : [ 89.1, 85.4, 81.8, 88.1, 86.4, 81.6, 86.8, 81.4, 86.7, 83.6 ] }
      ],
      oel: 85
    })
  }
    
  defineTableCells() {
    let c = this.calculate()
    let numRes = c.numRes
  
    let tableNo = 'C3'
    let headers = [ "Point estimates and 90% credible interval" ]
    let rows = [
      { resType: "groupMean", label: "Group AM (90% CrI)" },
      { resType: "aSdB", label: "Between-worker arithmetic standard deviation (90% CrI)" },
      { resType: "aSdW", label: "Within-worker arithmetic standard deviation (90% CrI)" },
      { resType: "rho", label: "Within-worker correlation (rho) (90% CrI)" },
      { resType: "rho", label: "Probability that rho>0.2", showRisk: true },
      { resType: "rDiff", label: "R.difference (90% CrI)" },
      { resType: "probIndOverXPerc", label: "Probability of individual overexposure (95th percentile) in % (90% CrI)" },
      { resType: "probIndOverXPerc", label: "Chances that the above probability is >20%", showRisk: true },
      { resType: "probIndOverXAMean", label: "Probability of individual overexposure (arithmetic mean) in % (90% CrI)" },
      { resType: "probIndOverXAMean", label: "Chances that the above probability is >20%", showRisk: true }
    ]
    return { numericalResults: [numRes], tableNo, headers, rows }
  }
}