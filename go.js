var tableObj
var entries
var lastNumRes
var tableClasses = [
  Table3,
  Table4,
  Table6,
  Table7,
  Table8,
  TableC2,
  TableC3
]
var lang = 'fr'

$(document).ready(function() {
  initElems();
  translateHtml();
  $reportTable = $('#reportTable')
  
  for ( var i = 0; i < tableClasses.length; i++ ) {
    $('#table2Display').append($(`<option value=${i}>`).append(`Table ${tableClasses[i].name.replace(/[A-Z][a-z]+/, "")}`))
  }
})

function initElems()
{
  let lng = getUrlParam('lang')
  if ( lng != null ) {
    lang = lng
  }
  $('.lang-chooser .lang').each(function() {
    let l = $(this).data('lang')
    $(this).text(l.toUpperCase())
    if ( l == lang ) {
      $(this).addClass('active')
    }
  })
  $('.lang-chooser .lang:not(.active)').each(function() {
    $(this).attr('href', window.location.href.replace(/[a-z.?=]*$/, `?lang=${$(this).data('lang')}`))
    $(this)[0].outerHTML = $(this)[0].outerHTML.replace(/(<\/?)span/g, "$1a")
  })
}
function translateHtml() {
  var i18n = $.i18n({locale: lang})
  $('body').attr('data-lang', $.i18n.locale)
  $.i18n().load( 'i18n/trans-' + i18n.locale + '.json', i18n.locale ).done(function(x) {
    $('html').i18n()
  })
}

function getUrlParam(sParam) {
  var sPageURL = window.location.search.substring(1),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=')

    if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1])
    }
  }
  
  return null
}

function drawTable()
{
  $('#loader').show()
  resetTable()
  let tableType = $('#table2Display').val()
  var tableObj = new tableClasses[tableType]()
  setTimeout( function() { tableObj.draw() }, 50)
}
 
function resetTable()
{
  $(".table-div").hide()
  $reportTable.find('th:not(:first)').remove()
  $reportTable.find('tbody tr').remove()
}

function showEstimateWInterval(res, numDigitsAfterDecimal = 1, appendRisk = false)
{
  return `${res.q[1].toFixed(numDigitsAfterDecimal)} [${res.q[0].toFixed(numDigitsAfterDecimal)} - ${res.q[2].toFixed(numDigitsAfterDecimal)}]${appendRisk ? ` Overexposure risk: ${showRisk(res)}` : ""}`
}

function showRisk(res, idx = undefined) {
  if ( res.q.length == 3 ) {
    let risk = typeof idx === 'undefined' ? res.risk : res.risk[idx]
    return `${risk.toFixed(1)}%`
  } else {
     return res.risk
  }
}

function findExposerWorkers(workerResults)
{
  let minGm = Number.POSITIVE_INFINITY
  let leastExposed = null
  let maxGm = Number.NEGATIVE_INFINITY
  let mostExposed = null
  for ( var wid in workerResults ) {
    var gm = workerResults[wid].gMean.q[1]
    if ( gm < minGm ) {
      minGm = gm
      leastExposed = wid
    } else
    if ( gm > maxGm ) {
      maxGm = gm
      mostExposed = wid
    }
  }
  return { leastExposed, mostExposed }
}