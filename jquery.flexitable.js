var stringConstructor = "test".constructor;
var arrayConstructor = [].constructor;
var objectConstructor = ({}).constructor;

// This function remove item from array by its value
function removeItemFromArray(arr, item){
    return arr.filter(f => f !== item)
   }

// This function returns the given object's type
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


// This function finds keys in the data and add a corresponding headers in the table
function ExtractHeaders(list, selector) {
    var columns = [];
    var firstHeader = $('<tr/>');
    var secondHeader = $('<tr/>');
    var removeList = [];

    // iterate over the data list
    for (var i = 0; i < list.length; i++) {
        var row = list[i];
        // travers over the row columns 
        for (var column in row) {
            // skip if the column is already addded to header
            if ($.inArray(column, columns) == -1) {
                columns.push(column);
                 
                // if the column is an object retrieve its fields and add them below the root column
                if(checkType(row[column])=="Object"){
                    
                    innerHeaderCount = 0;
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
                if(list[i][fields[0]])
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

async function loadData(options){
    jsonData = null;

    // if data is not defined or it is an empty string return null
    if(!options.data || options.data=="")
        return null;

    // if data is given as json array, no proccess needed
    if(checkType(options.data)=="Array"){
        jsonData = options.data;
    }
    // if data is given as url, call the url and retrieve json data
    else if(checkType(options.data)=="String") {
        // call the url and wait for its response
        jsonData = await  $.getJSON(options.data, function(data) {
            console.log("Data retrieved from url ")
          })
          .fail(function() {
            console.error( "Can not retrieve json data from " + options.data );
          });
    }

    return jsonData;
}


function initiateTable(options){

        // create root table element
        var table = $('<table/>');
        // if rtl is true change direction of the table to RightToLeft
        if(options.rtl)
            table.attr("dir","rtl");
    
        if(options.tableId)
            table.attr("id",options.tableId);
        // add CSS class(es) to table element
        table.addClass(options.tableCssClass);
        
        return table;
}


async function generateTable(options) {
    if(!options.tableCssClass)
    options.tableCssClass = "";

    // if no arraySeperator exist in options object, set default seperator
    if(!options.arraySeperator)
        arraySeperator=", ";

    var table = initiateTable(options);
    var jsonData = await loadData(options);
    buildTable(jsonData, table, options.arraySeperator);
    return table;
}


async function embedJsonTableToContainer(selector,options){
    var table = await generateTable(options);
    selector.html(table);
}






// options : 
// {
//  data : Json array (Json Array) , or url to retrieve json array (String) *Required
//  tableCssClass : Css classes to be set for table (String)
//  tableId : id attribute of the table tag (Strig)
//  rtl : Indicates right to left direction. (Boolean, Default : false)
//  arraySeperator : Indicates the character(s) between array items in cells (Strig, Default : ', ')
//  refreshPriod : Time interval to re-fetch data from source. it is in millisecond. (Integer, Default : it is disabled by default. Only applicable for calling the function on a container with selector )
// }
$.jsonToHtmlTable = $.fn.jsonToHtmlTable = async function(options) {
    
    if(this.jquery){
        if(options.refreshPriod){
            var selector = this;
            embedJsonTableToContainer(selector,options);
            setInterval( function (selectr) {embedJsonTableToContainer(selector,options);}, options.refreshPriod);
        }
        else {
            embedJsonTableToContainer(this,options);
        }
    }
    else
    {
        return generateTable(options);
    }
        
    
};


