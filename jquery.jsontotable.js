var stringConstructor = "test".constructor;
var arrayConstructor = [].constructor;
var objectConstructor = ({}).constructor;

function checkType(object) {
    if (object === null) {
        return "null";
    }
    if (object === undefined) {
        return "undefined";
    }
    if (object.constructor === stringConstructor) {
        return "String";
    }
    if (object.constructor === arrayConstructor) {
        return "Array";
    }
    if (object.constructor === objectConstructor) {
        return "Object";
    }
    
    return "Unknown";
    
}

function getPropertiesCount(object){
    var count = 0;
    for (var k in object) {
        if (object.hasOwnProperty(k)) 
            count++;
    }

    return count;
}

// This function finds keys in the data and add a corresponding headers in the table
function ExtractHeaders(list, selector) {
    var columns = [];
    var firstHeader = $('<tr/>');
    var secondHeader = $('<tr/>');
     
    for (var i = 0; i < list.length; i++) {
        var row = list[i];
         
        for (var column in row) {
            if ($.inArray(column, columns) == -1) {
                columns.push(column);
                 
                // Creating the header
                if(checkType(row[column])=="Object"){
                    innerHeaderCount = getPropertiesCount(row[column]);
                    firstHeader.append($('<th colspan="' + innerHeaderCount + '" />').html(column));
                    for (var innerColumn in row[column]) {
                        if (row[column].hasOwnProperty(innerColumn)) 
                            secondHeader.append($('<th />').html(innerColumn))
                        console.log(secondHeader);
                    }
                    
                }
                else
                firstHeader.append($('<th rowspan="2" />').html(column));
            }
        }
    }
     
    // Appending the header to the table
    $(selector).append(firstHeader);
    $(selector).append(secondHeader);
    return columns;
} 

$.fn.jsonToHtmlTable = function(jsonData, tableCssClass="", headerCssClass="", oddRowCssClass="", evenRowCssClass="") {

    // create root table element
    var table = $('<table/>');
    // add CSS class(es) to table element
    table.addClass(tableCssClass);
    // extract titles from the data and build the header of the table
    ExtractHeaders(jsonData,table,headerCssClass);

    this.html(table);
    
};