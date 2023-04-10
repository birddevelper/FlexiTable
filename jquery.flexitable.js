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
function ExtractHeaders(list, selector, options) {
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
                 
                // if the column is an object, retrieve its fields and add them below the root column
                if(checkType(row[column])=="Object"){
                    
                    innerHeaderCount = 0;
                    var topLevelHeader = $('<th />');
                    firstHeader.append(topLevelHeader.html(column));
                    for (var j = 0; j < list.length; j++) {
                        
                        for (var innerColumn in list[j][column]) {
                            if (list[j][column].hasOwnProperty(innerColumn)) {
                                
                                if ($.inArray(column + ',' + innerColumn, columns) == -1) {
                                    columns.push(column + ',' + innerColumn);
                                    if(options.columnsTitle[column + '.' + innerColumn])
                                        secondHeader.append($('<th />').html(options.columnsTitle[column + '.' + innerColumn]));
                                    else
                                        secondHeader.append($('<th />').html(innerColumn));
                                    innerHeaderCount++;
                                }
                            
                            }
                        
                        }
                    }
                    removeList.push(column);
                    topLevelHeader.attr("colspan",innerHeaderCount)
                }
                else{
                    if(options.columnsTitle[column])
                        firstHeader.append($('<th rowspan="2" />').html(options.columnsTitle[column]));
                    else
                        firstHeader.append($('<th rowspan="2" />').html(column));

                }
                    
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

// This function builds table by given data 
function buildTable(list,selector, options) {
             
    
    // extract titles from the data and build the header of the table
    var cols = ExtractHeaders(list, selector, options); 

    // Traversing the JSON data
    for (var i = 0; i < list.length; i++) {
        var row = $('<tr/>');  
        for (var colIndex = 0; colIndex < cols.length; colIndex++)
        {
            var val = null;
            if(cols[colIndex].indexOf(',')>0){
                fields = cols[colIndex].split(',');
                if(list[i][fields[0]])
                    val = ArrayItemsSeperator(list[i][fields[0]][fields[1]],options.arraySeparator);
            }
            else
                val = ArrayItemsSeperator(list[i][cols[colIndex]],options.arraySeparator);
             
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

    // if no arraySeparator exist in options object, set default seperator
    if(!options.arraySeparator)
        options.arraySeparator=", ";

    if(!options.columnsTitle)
        options.columnsTitle={};       

    var table = initiateTable(options);
    var jsonData = await loadData(options);
    buildTable(jsonData, table, options);
    
    if(options.verticalHeaders)
        table= transpose(table[0]);

    return table;
}





function transpose(table){

    // get all rows
    const rows = Array.from(table.querySelectorAll("tr"));
    
    const totalRowCount = rows.length;
    var maxColumnsInRows = 0;

    // initiate transposed table
    let transposedTable = table.cloneNode(false);
    let transposedTBody = document.createElement("tbody");
    transposedTable.appendChild(transposedTBody);

    // get header rows count
    let headerRowsCount=0;
    for (let r = 0; r < 2; r++) {
        const row = rows[r];
        const cells = Array.from(row.querySelectorAll("th"));
        if(cells.length>0)
            headerRowsCount++;
    }


    // get max number of cells among the rows
    for (let r = 0; r < totalRowCount; r++) {
        const row = rows[r];
        const cells = Array.from(row.querySelectorAll("td,th"));
        if(cells.length>maxColumnsInRows)
            maxColumnsInRows = cells.length;
    }


    // if there exist more than two header rows, so there exist an embeded object
    // we should align the header columnar 
    if(headerRowsCount>1){

        // initiate aligning array
        var aligningArray= [];

        // initiate align controlling array
        for(let i=0;i<maxColumnsInRows;i++){
            aligningArray.push([0,0]);
            let tr = document.createElement("tr");
            transposedTBody.appendChild(tr);
        }

        // get first level header cells
        var firstHeadercells = Array.from(rows[0].querySelectorAll("th"));
        const rowsInNewTable = Array.from(transposedTable.querySelectorAll("tr"));
        let transposedTableRowIndex = 0;
        for(let i=0;i<firstHeadercells.length;i++){
                // add first level header cells to transposed rows as first cell,
                // having an eye on aligning array
                let td = firstHeadercells[i].cloneNode(true);
                let originRowSpan = firstHeadercells[i].getAttribute("rowspan") || 1;
                let originColSpan = firstHeadercells[i].getAttribute("colspan") || 1;
                td.setAttribute("colspan",originRowSpan);
                td.setAttribute("rowspan",originColSpan);
                rowsInNewTable[transposedTableRowIndex].appendChild(td);
                // if origin rowsapn equals to 2, it means it has no child header, so in aligning array set child header to 1
                // means it's occupied
                if(originRowSpan=="2"){
                    aligningArray[transposedTableRowIndex][0]=1;
                    aligningArray[transposedTableRowIndex][1]=1;
                }
                else{
                        // else, it has child so we should set child in aligning array to 0
                        // and also occupy next n rows for n children
                        for(let j=transposedTableRowIndex;j<transposedTableRowIndex+parseInt(originColSpan);j++){ 
                            console.log(j);
                            aligningArray[j][0]=1;
                        }
                }
               
                // go to n next row
                transposedTableRowIndex+=parseInt(originColSpan);
                    
                   
            
        }

        // get first level header cells
        var secondHeadercells = Array.from(rows[1].querySelectorAll("th"));

        for(let i=0;i<secondHeadercells.length;i++){
    
                let td = secondHeadercells[i].cloneNode(true);
                let originRowSpan = secondHeadercells[i].getAttribute("rowspan") || 1;
                let originColSpan = secondHeadercells[i].getAttribute("colspan") || 1;
                td.setAttribute("colspan",originRowSpan);
                td.setAttribute("rowspan",originColSpan);

                // find eligable row to append the cell
                eligRow=0;
                for(let i=0;i<aligningArray.length;i++){
                    if(aligningArray[i][1]==0)
                        {
                            eligRow = i;
                            aligningArray[i][1]=1;
                            break;
                        }
                }

                // append the cell
                rowsInNewTable[eligRow].appendChild(td);

        }

        // add data to transposed table
        for(let r=0;r<maxColumnsInRows;r++){
            let tr = document.createElement("tr");
            for(let c=2;c<totalRowCount;c++){
                rw = rows[c];
                cels = Array.from(rw.querySelectorAll("td,th"));
          
                if(cels[r]){
                    let td = cels[r].cloneNode(true);
                    let originRowSpan = cels[r].getAttribute("rowspan") || 1;
                    let originColSpan = cels[r].getAttribute("colspan") || 1;
                    td.setAttribute("colspan",originRowSpan);
                    td.setAttribute("rowspan",originColSpan);
                    rowsInNewTable[r].appendChild(td);
    
                }
            }
        }

         return transposedTable;
    }



    // if table has only one header row
    // just transpose simple table    
    for(let r=0;r<maxColumnsInRows;r++){
        let tr = document.createElement("tr");
        transposedTBody.appendChild(tr);
        for(let c=0;c<totalRowCount;c++){
            // get row's cell
            const cels = Array.from(rows[c].querySelectorAll("td,th"));
            if(cels[r]){
                let td = cels[r].cloneNode(true);
                let originRowSpan = cels[r].getAttribute("rowspan") || 1;
                let originColSpan = cels[r].getAttribute("colspan") || 1;
                // swap rowspan with colspan
                td.setAttribute("colspan",originRowSpan);
                td.setAttribute("rowspan",originColSpan);
                tr.appendChild(td);

            }
        }
    }

    return transposedTable;
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
//  arraySeparator : Indicates the character(s) between array items in cells (Strig, Default : ', ')
//  refreshPriod : Time interval to re-fetch data from source. it is in millisecond. (Integer, Default : it is disabled by default. Only applicable for calling the function on a container with selector )
// }
$.flexiTable = $.fn.flexiTable = async function(options) {
    
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


