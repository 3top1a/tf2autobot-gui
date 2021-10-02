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
        items = []

        //Weird way to put all JSON items into an array
        for (let index = 0; index < Object.entries(json).length; index++) {
            const element = Object.entries(json)[index]
            items.push(element[1])
        }
    }

    //Delete previous nodes
    listings_list.innerHTML = '';

    //Get all the different groups
    groups = []
    items.forEach(element => {
        var eq_json_item = items.indexOf(element)
        if (!groups.includes(items[eq_json_item].group))
            groups.push(items[eq_json_item].group)
    });

    //Make the datalist for the groups
    _group_html = "<datalist id=\"groups\">"
    groups.forEach(group => {
        _group_html += "<option>" + group + "</option>"
    });

    listings_list.innerHTML += _group_html

    //Sort so the page stays same after refreshing
    items = items.sort(function(a, b) {
        return a.sku.replace(/\D/g, "") - b.sku.replace(/\D/g, "");
    });

    //Make a listing for all items
    items.forEach(element => {
        //Clone the example element
        let ex = document.getElementById("example-listing").cloneNode(true)
        //Equivalent json item
        var eq_json_item = items.indexOf(element)
        //For consistency, we set the listings html id as the item's SKU
        ex.id = items[eq_json_item].sku

        if (items[eq_json_item].enabled == false)
            ex.style = "background-color: red !important;"
        else
            ex.style = ""

        //For each of it's children, set their respective values
        for (let index = 0; index < ex.childNodes.length; index++) {
            //Get the child
            const child_of_element = ex.childNodes.item(index);
            switch (child_of_element.className) {
                case "Title":
                    child_of_element.innerText = items[eq_json_item].name
                    break;
                case "Sku":
                    child_of_element.innerText = items[eq_json_item].sku
                    break;
                case "Buy":
                    var price = ""
                    if (items[eq_json_item].buy.keys > 0)
                        price = items[eq_json_item].buy.keys + " K "
                    if (items[eq_json_item].buy.metal > 0)
                        price += items[eq_json_item].buy.metal + " M"
                    child_of_element.innerText = price + " ⬅️"
                    break;
                case "Sell":
                    var price = ""
                    if (items[eq_json_item].sell.keys > 0)
                        price = items[eq_json_item].sell.keys + " K "
                    if (items[eq_json_item].sell.metal > 0)
                        price += items[eq_json_item].sell.metal + " M"
                    child_of_element.innerText = price + " ➡️"
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

                        //Get the entry in `items`
                        var result = items.filter(obj => {
                            return obj.sku == src.parentNode.parentNode.parentNode.id
                        })[0]

                        //Remove item
                        items.splice(items.indexOf(result), 1);

                        //Redraw
                        applyJsonToPage()
                    });

                    break;
                case "Group":
                    var html = "<input autocomplete=off type=\"text\" list=\"groups\">"
                    child_of_element.innerHTML = html
                    child_of_element.id = items[eq_json_item].sku
                    child_of_element.childNodes[0].value = items[eq_json_item].group
                    child_of_element.addEventListener('change', (event) => {
                        //Get the event's source
                        var src = event.target || event.srcElement;

                        //Get the entry in `items`
                        var result = items.filter(obj => {
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