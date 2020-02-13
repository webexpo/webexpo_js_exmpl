var modelResult
var numRes

$(document).ready(function() {
  $reportTable = $('#reportTable')
  zygotine.SEG.setDataEntries(true)
})

function drawTable()
{
  $('#loader').show()
  resetTable()
  let tableType = $('#table2Display').val()
  if ( tableType == "3" ) {
    setTimeout(drawTable3, 50)
  }
}

function doCalc()
{
  let model = new zygotine.SEG.Model()
  model.validate()
  if (!model.hasError) {
    model.doCalculation()
    modelResult = model.result
    numRes = zygotine.X.getNumericalResult(model.logN,
                                           modelResult.chains.muSample.data,
                                           modelResult.chains.sdSample.data,
                                           model.oel,
                                           model.confidenceLevelForCredibileInterval,
                                           model.fracThreshold,
                                           model.percOfInterest)
  }
}

function drawTable3() {
  zygotine.SEG.initDataEntries(true, true)
  zygotine.SEG.setDataVal({
    obsValues: ["24.7", "64.1", "13.8", "43.7", "19.9", "133", "32.1", "15", "53.7"],
    oel: "100"
  })
  doCalc()

  $reportTable.find('.heading').append($('<th>').append("Point estimates and 90% credible interval"))
  let rows = [
    { resType: "gMean", label: "GM", showRisk: false },
    { resType: "gSd", label: "GSD", showRisk: false },
    { resType: "exceedanceFraction", label: "Exceedance fraction (%)", showRisk: true },
    { resType: "percOfInterest", label: "95th percentile", showRisk: true },
    { resType: "aihaBandP95", label: "AIHA band probabilities in % (95th percentile)", showRisk: false },
    { resType: "aMean", label: "Arithmetic mean", showRisk: true },
    { resType: "aihaBandAM", label: "AIHA band probabilities in % (AM)", showRisk: false }
  ]
  
  rows.forEach(function(row) {
    let res = numRes[row.resType]
    let val = ""
    if ( res.q.length == 3 ) {
      val = `${res.q[1].toFixed(1)} [${res.q[0].toFixed(1)} - ${res.q[2].toFixed(1)}] ${row.showRisk ? "Overexposure Risk: " + res.risk.toFixed(1) + '%' : ""}`
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