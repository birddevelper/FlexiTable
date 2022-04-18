# jQueryJsonToTable
jQueryJsonToTable is a professional jQuery plugin that convert JSON array list into HTML table

## Features 

- Accepts Json data
- Accepts url to fetch json data
- Supports nested object up to 1 level
- Css class
- Both LTR and RTL direction is supported
- supports arrays as a table's column

## How to use

This plugin is compatible with jquery-2.2.4 and later versions (earlier versions are not tested).Import the plugin as following code :

```html
<script src="https://code.jquery.com/jquery-2.2.4.min.js" integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=" crossorigin="anonymous"></script>
<script src="jquery.jsontotable.js" ></script>
```

Then the plugin function can be called on any container element such as Div. See the example below :

```html

<div id="mydiv"></div>

<script>
var data = [
{
    "Id" : 1,
    "Name" : "Alex Xia",
    "Age" : 27,
    "Grades" : {
        "Physics" : 12,
        "Mathematics" : 19,
        "Computer Lab" : 20
    },
    "Year" : 2022
},
{
    "Id" : 2,
    "Name" : "Saba Tailorson",
    "Age" : 29,
    "Grades" : {
        "Physics" : 10,
        "Mathematics" : 20,
        "Computer Lab" : 18
    },
    "Year" : 2022,
    "Absents" : ['10th Mar','21st Jan','4th Feb']
}
];

$("#mydiv").jsonToHtmlTable({
    data : data,
    tableCssClass : 'mytable',
    tableId : 'studentsTable'
});
</script>


```

Output for [sampleData](https://github.com/birddevelper/jQueryJsonToTable/blob/master/sampleData.js) :

![output](https://m-shaeri.ir/blog/wp-content/uploads/2022/04/jquery_json_to_table3.jpg)