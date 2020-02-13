var modelResult
var numRes

$(document).ready(function() {
  $reportTable = $('#reportTable')
  zygotine.SEG.setDataEntries(true)
  for ( var i = 0; i < 10; i++ ) {
    if ( $.isFunction(window[`drawTable${i}`]) ) {
      $('#table2Display').append($(`<option value=${i}>`).append(`Table ${i}`))
    }
  }
})

function drawTable()
{
  $('#loader').show()
  resetTable()
  let tableType = $('#table2Display').val()
  setTimeout(window[`drawTable${tableType}`], 50)
}

function doCalc()
{
  let model = new zygotine.SEG.Model()
  model.validate()
  if (!model.hasError) {
    model.doCalculation()
    return { modelRes: model.result, 
             numRes: zygotine.X.getNumericalResult(model.logN,
                                           model.result.chains.muSample.data,
                                           model.result.chains.sdSample.data,
                                           model.oel,
                                           model.confidenceLevelForCredibileInterval,
                                           model.fracThreshold,
                                           model.percOfInterest) }
  }
  return false
}

function drawTable3() {
  zygotine.SEG.initDataEntries(true, true)
  zygotine.SEG.setDataVal({
    obsValues: ["24.7", "64.1", "13.8", "43.7", "19.9", "133", "32.1", "15", "53.7"],
    oel: "100"
  })
  let c = doCalc()
  modelRes = c.modelRes
  numRes = c.numRes

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
  
function drawTable4() {
  zygotine.SEG.initDataEntries(true, true)
  zygotine.SEG.setDataVal({
    obsValues: ["24.7", "64.1", "13.8", "43.7", "19.9", "133", "32.1", "15", "53.7"],
    oel: "100"
  })
  let cInf = doCalc()
  let numResInf = cInf.numRes
  
  zygotine.SEG.initDataEntries(false, true)
  let cUninf = doCalc()
  let numResUninf = cUninf.numRes

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
    let res = numResInf[row.resType]
    let val = ""
    if ( res.q.length == 3 ) {
      val = `${res.q[1].toFixed(1)} [${res.q[0].toFixed(1)} - ${res.q[2].toFixed(1)}] ${$.inArray(row.showRisk, [undefined, false]) >= 0 ? "" : ("Overexposure Risk: " + res.risk.toFixed(1) + '%')}`
    } else
    if ( res.q.length == 5 ) {
      val = res.risk
    }
    $reportTable.find('tbody').append($('<tr>').append($('<td>').append(row.label)).append($('<td>').append(val)))
  })
  
  $reportTable.show()
  $('#loader').hide()
}

function resetTable()
{
  $reportTable.hide()
  $reportTable.find('th:not(:first)').remove()
  $reportTable.find('tbody tr').remove()
}