var stringConstructor = "test".constructor;
var arrayConstructor = [].constructor;
var objectConstructor = ({}).constructor;

function removeItemFromArray(arr, item){
    return arr.filter(f => f !== item)
   }

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

function getPropertiesCount(object, list){
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
    var removeList = [];
    for (var i = 0; i < list.length; i++) {
        var row = list[i];
         
        for (var column in row) {
            if ($.inArray(column, columns) == -1) {
                columns.push(column);
                 
                // Creating the header
                if(checkType(row[column])=="Object"){
                    
                    //columns.pop();
                    innerHeaderCount = 0;//getPropertiesCount(row[column])+1;
                    var topLevelHeader = $('<th />');
                    firstHeader.append(topLevelHeader.html(column));
                    for (var j = 0; j < list.length; j++) {
                        
                        for (var innerColumn in list[j][column]) {
                            if (list[j][column].hasOwnProperty(innerColumn)) {
                                
                                if ($.inArray(column + ',' + innerColumn, columns) == -1) {
                                    columns.push(column + ',' + innerColumn);
                                    secondHeader.append($('<th />').html(innerColumn));
                                    innerHeaderCount++;
                                }
                            
                            }
                        
                        }
                    }
                    removeList.push(column);
                    topLevelHeader.attr("colspan",innerHeaderCount)
                }
                else
                    firstHeader.append($('<th rowspan="2" />').html(column));
            }
        }
    }
    for(var index in removeList){
        columns =removeItemFromArray(columns, removeList[index]);
    }
    // Appending the header to the table
    $(selector).append(firstHeader);
    $(selector).append(secondHeader);
    //console.log(removeList)
    console.log(columns)
    return columns;
} 

function ArrayItemsSeperator(object,seperator){
    if(checkType(object)=="Array"){
        return object.join(seperator);
    }

    return object;
}

function buildTable(list,selector, arraySeperator) {
             
    
    // extract titles from the data and build the header of the table
    var cols = ExtractHeaders(list, selector); 

    // Traversing the JSON data
    for (var i = 0; i < list.length; i++) {
        var row = $('<tr/>');  
        for (var colIndex = 0; colIndex < cols.length; colIndex++)
        {
            var val = null;
            if(cols[colIndex].indexOf(',')>0){
                fields = cols[colIndex].split(',');
                val = ArrayItemsSeperator(list[i][fields[0]][fields[1]],arraySeperator);
            }
            else
                val = ArrayItemsSeperator(list[i][cols[colIndex]],arraySeperator);
             
            // If there is any key, which is matching
            // with the column name
            if (val == null) val = ""; 
                row.append($('<td/>').html(val));
        }
         
        // Adding each row to the table
        $(selector).append(row);
    }
}



$.fn.jsonToHtmlTable = function(jsonData, tableCssClass="", rtl=false, arraySeperator=", ") {

    // create root table element
    var table = $('<table/>');
    // if rtl is true change direction of the table to RightToLeft
    if(rtl)
        table.attr("dir","rtl");

    // add CSS class(es) to table element
    table.addClass(tableCssClass);
    
    buildTable(jsonData,table, arraySeperator);
    this.html(table);
    
};