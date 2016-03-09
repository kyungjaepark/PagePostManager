var gpe_status = {
    stopRequested: false  
};
function wireEvents_gpe() {
    $('#btn-group-post-extract-show').click(function(){showGpe();});
    $('#gpe-stop').click(function(){gpeStop();});
    $('#gpe-excel').click(function(){gpeExcel();});
    $('#gpe-new').click(function(){gpeNew();});
    $('#gpe-close').click(function(){gpeClose();});
    // $('#btnLoadSummary').click(function () { getLikes(); });
    // $('#btnLoadLikes').click(function () { getLikes(); });
    // $('#btnLoadComments').click(function () { getComments(); });
    // $('#btnExportResultTable').click(function () { tableToExcel(tblResultTable.outerHTML, 'Results', 'results_pagepostmanager.xls'); });
    // $('#btnShowResultTable').click(function () { $('#tblResultTable').removeClass('hidden'); });
    // $('#btnShowResultTableNewWindow').click(function () { writeToNewTable(); });
}

function showGpe()
{
    $("#group-post-extractor").removeClass('hidden');
    $("#group-post-start").removeClass('hidden');
    $("#gpe-progress").text('...');
    $("#group-post-extract").addClass('hidden');
    gpe_status.stopRequested = false;
}

function gpeStop()
{
    alert('기능 미구현.');
    stopRequested = true;
}

function gpeExcel()
{
    alert('기능 미구현.');
    stopRequested = true;
}

function gpeNew()
{
    alert('기능 미구현.');
    stopRequested = true;
}

function gpeClose()
{
    $('#group-post-extractor').addClass('hidden');
}
