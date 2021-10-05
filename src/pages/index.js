const reader = new FileReader()
var json = []
var groups = []
var listings_list

function file_changed() {
    const input = document.getElementById("pricelist-upload")
    if ('files' in input && input.files.length > 0) {
        reader.readAsText(input.files[0])
        reader.onload = event => applyJsonToPage(reader.result) // desired file content
        reader.onerror = error => reject(error)
    }
}

function applyJsonToPage(out) {
    //If this is the first time parsing a file, the file's contents will be put into `out`.
    //Thus triggering this parsing stuff below
    if (out != null) {
        listings_list = document.getElementById("listings-list")
        json = JSON.parse(out)
    }

    //Delete previous nodes
    listings_list.innerHTML = '';

    //Get all the different groups
    groups = []
    Object.values(json).forEach(element => {
        var eq_json_item = Object.values(json).indexOf(element)
        if (!groups.includes(Object.values(json)[eq_json_item].group))
            groups.push(Object.values(json)[eq_json_item].group)
    });

    //Make the datalist for the groups
    _group_html = "<datalist id=\"groups\">"
    groups.forEach(group => {
        _group_html += "<option>" + group + "</option>"
    });

    listings_list.innerHTML += _group_html

    //Make a listing for all items
    Object.values(json).forEach(element => {
        //Clone the example element
        let ex = document.getElementById("example-listing").cloneNode(true)
        //Equivalent json item
        var eq_json_item = Object.values(json).indexOf(element)
        //For consistency, we set the listings html id as the item's SKU
        ex.id = Object.values(json)[eq_json_item].sku

        if (Object.values(json)[eq_json_item].enabled == false)
            ex.style = "background-color: red !important;"
        else
            ex.style = ""

        //For each of it's children, set their respective values
        for (let index = 0; index < ex.childNodes.length; index++) {
            //Get the child
            const child_of_element = ex.childNodes.item(index);
            switch (child_of_element.className) {
                case "Title":
                    child_of_element.innerText = Object.values(json)[eq_json_item].name
                    break;
                case "Sku":
                    child_of_element.innerText = Object.values(json)[eq_json_item].sku
                    break;
                case "Buy":
                    child_of_element.querySelector(".keys").value = parseInt(Object.values(json)[eq_json_item].buy.keys)
                    child_of_element.querySelector(".metal").value = parseFloat(Object.values(json)[eq_json_item].buy.metal).toFixed(2)

                    // Snap the number of metal to the nearest of .05, .11 etc.
                    /*child_of_element.querySelector(".metal").addEventListener('change', (event) => {
                        //Get the event's source
                        var src = event.target || event.srcElement;
                        val = parseFloat(src.value).toFixed(2)

                        if ((val % 0.11).toFixed(2) == 0.10) {
                            // The number is x.y0 and y is > 1
                            src.value = parseFloat(parseFloat(src.value) + 0.01)
                        }
                    });*/
                    break;
                case "Sell":
                    child_of_element.querySelector(".keys").value = parseInt(Object.values(json)[eq_json_item].sell.keys)
                    child_of_element.querySelector(".metal").value = parseFloat(Object.values(json)[eq_json_item].sell.metal).toFixed(2)
                    break;
                case "Buttons":
                    //Backpack.tf
                    // TODO Backpack.tf link
                    //<img src="images/bptf_icon.webp" style="width: 24px; height: 24px;">

                    //Trash
                    //Delete the current item
                    //Icons made by Freepik from www.flaticon.com

                    //Stupid for loop because there's no `filter`
                    trash_node = null
                    child_of_element.childNodes.forEach(_node => {
                        if (_node.className == "delete")
                            trash_node = _node
                    })
                    if (trash_node == null) break;


                    trash_node.addEventListener('click', (event) => {
                        //Get the event's source
                        var src = event.target || event.srcElement;

                        //Get the entry in `json`
                        delete json[src.parentNode.parentNode.parentNode.id]

                        //Redraw
                        applyJsonToPage()
                    });

                    break;
                case "Group":
                    var html = "<input autocomplete=off type=\"text\" list=\"groups\">"
                    child_of_element.innerHTML = html
                    child_of_element.id = Object.values(json)[eq_json_item].sku
                    child_of_element.childNodes[0].value = Object.values(json)[eq_json_item].group
                    child_of_element.addEventListener('change', (event) => {
                        //Get the event's source
                        var src = event.target || event.srcElement;

                        //Get the entry in `json`
                        var result = Object.values(json).filter(obj => {
                            return obj.sku == src.parentNode.id
                        })[0]

                        //Change group
                        result.group = src.value

                        //Redraw
                        applyJsonToPage()
                    });
                    break;
            }
        }

        document.getElementById("listings-list").appendChild(ex)
    });
}

function export_pricelist() {
    _json = JSON.stringify(json);
    var blob = new Blob([_json], {
        type: "application/json"
    });
    var url = URL.createObjectURL(blob);


    var link = document.createElement("a");
    link.download = "pricelist.js";
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
    navigator.clipboard.writeText(_json);
}