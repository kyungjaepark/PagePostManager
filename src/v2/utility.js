
// http://stackoverflow.com/questions/1744310/how-to-fix-array-indexof-in-javascript-for-internet-explorer-browsers
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, start) {
         for (var i = (start || 0), j = this.length; i < j; i++) {
             if (this[i] === obj) { return i; }
         }
         return -1;
    }
}

// utility functions
jQuery.fn.extend({
	_k_makeHyperLink: function(fn) {
		var ret = this.css("textDecoration", "underline").css("cursor", "pointer");
		if (is_defined(fn))
			ret = ret.click(fn);
		return ret;
	},
	
	_k_progressBarValue: function(value) {
		var ret = this.attr('aria-valuenow', value);
		recalcProgressBar(this);
		return ret;
	},
	
	_k_progressBarMax: function(value) {
		var ret = this.attr('aria-valuemax', value);
		recalcProgressBar(this);
		return ret;
	},
	
	_k_debugVisualizeObj: function(obj) {
		var _tbl = $('<table border=1>');
		this.append(_tbl);

		for (var t in obj)
		{
			var _tr = $('<tr>');
			_tbl.append(_tr);
			
			_tr.append($('<td>').text(t));
			var _valueTd = $('<td>');
			_tr.append(_valueTd);
			if (typeof obj[t] == "object")
				_valueTd._k_debugVisualizeObj(obj[t]);
			else
				_valueTd.text(obj[t]);
		}
		return this;
	}
});

// http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
if (!String.format) {
  String.format = function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number] 
        : match
      ;
    });
  };
}

// http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function is_defined(obj)
{
	return (typeof obj !== 'undefined');
}

function stringify(obj)
{
	if (is_defined(obj) && obj !== null)
		return new String(obj);
	return "";
}

// example : isPropertyExists(response, ["paging", "next"]);
function isPropertyExists(obj, propList)
{
	for (var i = 0; i < propList.length; i++)
	{
		if (is_defined(obj) == false)
			return false;
		obj = obj[propList[i]];
		if (is_defined(obj) == false)
			return false;
	}
	return true;
}

function getDateTimeString(dateTime)
{
	return String.format("{0}-{1}-{2} {3}:{4}:{5}"
		, dateTime.getFullYear()
		, dateTime.getMonth() + 1
		, dateTime.getDate()
		, dateTime.getHours()
		, dateTime.getMinutes()
		, dateTime.getSeconds()
	);
}

http://stackoverflow.com/questions/17126453/html-table-to-excel-javascript
var tableToExcel = (function () {
        var uri = 'data:application/vnd.ms-excel;charset=UTF-8;base64,'
        , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' + 
        	'<head><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>' +
        	'<body>{table_outer_html}</body></html>'
        , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
        , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
        return function (tableouterHTML, name, filename) {
            var ctx = { worksheet: name || 'Worksheet', table_outer_html: tableouterHTML }

			// try blob first http://stackoverflow.com/questions/20048399/is-there-any-way-to-export-html-table-into-excel-working-in-all-browsers
			window.URL = window.URL || window.webkitURL;
			var blob = new Blob([format(template, ctx)]);
			var blobURL = window.URL.createObjectURL(blob);
			if (blobURL) {
				$("#dlink")
				.attr("href", blobURL)
				.attr("download", filename)
				document.getElementById("dlink").click();
				return;
			}
            document.getElementById("dlink").href = uri + base64(format(template, ctx));
            document.getElementById("dlink").download = filename;
            document.getElementById("dlink").click();

        }
    })();

function getParamMap()
{
	var ret = {};
	var searchStr = window.location.search;
	if (searchStr.length < 2)
	{
		return ret;
	}
	var paramArray = searchStr.substring(1).split('&');
	$.each(paramArray, function(){
		var nameValue = this.split('=');
		ret[nameValue[0]] = nameValue[1];
	});
	return ret;
}

