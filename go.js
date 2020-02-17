var tableObj

$(document).ready(function() {
  $reportTable = $('#reportTable')
  let tableNos = [3,4]
  tableNos.forEach(function(i) {
    $('#table2Display').append($(`<option value=${i}>`).append(`Table ${i}`))
  })
})

function drawTable()
{
  $('#loader').show()
  resetTable()
  let tableType = $('#table2Display').val()
  switch(tableType) {
    case '3' :
      tableObj = new Table3()
      break
    case '4' :
      tableObj = new Table4()
      break
  }
  setTimeout( function() { tableObj.draw() }, 50)
}
 
function drawTable4() {
  zygotine.SEG.initDataEntries(true, true)
  zygotine.SEG.setDataVal({
    obsValues: ["24.7", "64.1", "13.8", "43.7", "19.9", "133", "32.1", "15", "53.7"],
    oel: "100"
  })
  let cInf = doCalc()
  let numResInf = cInf.numRes
  zygotine.SEG.reset()
  
  zygotine.SEG.initDataEntries(false, true)
  zygotine.SEG.setDataVal({
    sdRangeInf: "0",
    sdRangeSup: "2.3"
  })
  let cUninf = doCalc()
  let numResUninf = cUninf.numRes
  zygotine.SEG.reset()
  
  zygotine.SEG.initDataEntries(true, true)
  zygotine.SEG.setDataVal({
    withPastData: true,
    pdMean: Math.log(5),
    pdSd: Math.log(2.4),
    pdN: 5
  })
  let cPd = doCalc()
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
    $tr = $("<tr>").append($("<td>").append(row.label))
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
  
  $('#tableTitle').text("Exposure metrics point estimates and credible intervals for 3 choices of prior distribution")
  
  $(".table-div").show()
  $('#loader').hide()
}


function resetTable()
{
  $(".table-div").hide()
  $reportTable.find('th:not(:first)').remove()
  $reportTable.find('tbody tr').remove()
}

function showEstimateWInterval(res, numDigitsAfterDecimal = 1)
{
  return `${res.q[1].toFixed(numDigitsAfterDecimal)} [${res.q[0].toFixed(numDigitsAfterDecimal)} - ${res.q[2].toFixed(numDigitsAfterDecimal)}]`
}