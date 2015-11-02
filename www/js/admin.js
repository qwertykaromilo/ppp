DateTimePickerFormat = "YYYY.MM.DD HH:mm:ss";

function onObjectEditorCreateEdit(that, action) {
    var data = ObjectEditor.getEditorBlockData();
    $(that).attr("disabled", "disabled");
    $.ajax({
        url: "/admin/objectEditor.jsp",
        dataType: "json",
        method: "post",
        data: $.extend(data, {
            action: action
        }),
        success: function(response) {
            Alerts.success("obj "+("create" == action ? "created" : "edited")+". id = " + response.id);
        },
        error: function(response) {

        },
        complete: function() {
            $(that).removeAttr("disabled");
        }
    });
}
function onObjectDelete(that) {
    var data = ObjectEditor.getEditorBlockData();
    if (confirm("Are you sure, you want to delete obj #" + data.id)) {
        $(that).attr("disabled", "disabled");
        $.ajax({
            url: "/admin/objectEditor.jsp",
            dataType: "json",
            method: "post",
            data: {
                id: data.id,
                action: "delete"
            },
            success: function(response) {
                Alerts.success("obj deleted. id = " + data.id);
                ObjectEditor.onCreateClick(data.typeId);
            },
            error: function(response) {

            },
            complete: function() {
                $(that).removeAttr("disabled");
            }
        });
    }
}
function getObjectByID(objId, callbackSuccess, callbackError) {
    $.ajax({
        url: "/admin/objectEditor.jsp",
        dataType: "json",
        data: {
            action: "getObjectByID",
            id: objId
        },
        success: function(response) {
            callbackSuccess(response.obj)
        },
        error: callbackError
    });
}
window.ObjectEditor = {
    onCreateClick: function(typeId) {
        makeObjectCreationBlock(typeId);
        showObjectCreationBlockToolbar(typeId);
    },
    onEditClick: function(objID) {
        getObjectByID(objID, function(obj){
            makeObjectEditingBlock(obj);
            showObjectEditingBlockToolbar(obj);
        });
    },
    onFindAllClick: function(typeId) {
        alert('findall' + typeId);
    },
    onCreate: function(that){
        onObjectEditorCreateEdit(that, "create")
    },
    onEdit: function(that){
        onObjectEditorCreateEdit(that, "edit")
    },
    onDelete: function(that) {
        onObjectDelete(that);
    },
    getEditorBlockData: function() {
        return FormHelper.getFormData($(".editor-block"));
    }
};
window.ObjectSearcher = {
    params: {
        id: "",
        name: "",
        description: "",
        typeIds: ""
    },
    onSearchClick: function() {
        ObjectSearcher.processSearch(ObjectSearcher.params);
    },
    processSearch: function(params) {
        ObjectSearcher.showResultsTable(params);
    },
    createResultTable: function() {
        var tableHTML = "<table></table>";
        return tableHTML;
    },
    showResultsTable: function(searchQueryParams) {
        var resCont = $(".searchResults");
        resCont.html(ObjectSearcher.createResultTable());
        var columns = [];
        if (searchQueryParams.typeIds != null && searchQueryParams.typeIds != "" && searchQueryParams.typeIds.indexOf(",") == -1) {

        }
        resCont.find("table").bootstrapTable({
            queryParams: function(params) {
                params = $.extend(params, searchQueryParams);
                return params;
            },
            onDblClickRow: function (row, $element) {
                ObjectEditor.onEditClick(row.id);
            },
            height: 500,
            sidePagination: "server",
            pagination: true,
            cache: true,
            showRefresh: true,
            showColumns: true,
            showToggle: true,
            pageList: [5, 10, 20, 50, 100, 500],
            pageSize: 20,
            striped: true,
            url: "/admin/search.jsp",
            clickToSelect: true,
            columns: [{
                field: 'state',
                checkbox: true
            }, {
                field: 'id',
                title: 'ID',
                align: 'left',
                valign: 'top'
            }, {
                field: 'type',
                title: 'Type',
                align: 'left',
                valign: 'top'
            }, {
                field: 'name',
                title: 'Name',
                align: 'left',
                valign: 'top'
            }, {
                field: 'description',
                title: 'Description',
                align: 'left',
                valign: 'top'
            }]
        });
    },
    onIdChanged: function(input) {
        ObjectSearcher.params.id = $(input).val();
        ObjectSearcher.onParamsChanged();
    },
    onNameChanged: function(input) {
        ObjectSearcher.params.name = $(input).val();
        ObjectSearcher.onParamsChanged();
    },
    onDescriptionChanged: function(input) {
        ObjectSearcher.params.description = $(input).val();
        ObjectSearcher.onParamsChanged();
    },
    onTypeChanged: function(select) {
        var val = $(select).val();
        if (val && val != null) {
            ObjectSearcher.params.typeIds = val.join(",");
        } else {
            ObjectSearcher.params.typeIds = undefined;
        }

        ObjectSearcher.onParamsChanged();
    },
    onParamsChanged: function() {
        ObjectSearcher.processSearch(ObjectSearcher.params);
    }
};
function makeParamItem() {
    var item = $('<div class="row">');
    var head = $('<div class="col-sm-2 editor-block-label"><label></label></div>');
    var input = $('<div class="col-sm-10 editor-block-input">');
    return item.append(head).append(input);
}
function makeParamItemAddable(isFirst) {
    var item = $('<div class="row">');
    var head = $('<div class="col-sm-2 editor-block-label"><label></label></div>');
    var input = $('<div class="col-sm-9 editor-block-input">');
    var addRemove = $('<div class="col-sm-1 editor-block-addRemove">');
    if (isFirst) {
        addRemove.append($('<button class="btn btn-success editor-add-btn" onclick="editorAddAttrParam(this);"><i class="fa fa-plus"></i></button>'));
    } else {
        addRemove.append($('<button class="btn btn-danger editor-remove-btn" onclick="editorRemoveAttrParam(this);"><i class="fa fa-minus"></i></button>'));
    }
    return item.append(head).append(input).append(addRemove);
}
function getAVByObjectTypeId(attrInfo, typeIds, callbackSuccess, callbackError) {
    $.ajax({
        url: "/admin/objectEditor.jsp",
        dataType: "json",
        data: {
            action: "getAVByObjectTypeId",
            typeIds: typeIds
        },
        success: function(response) {
            callbackSuccess(attrInfo, response.objects)
        },
        error: callbackError
    });
}
function editorAddAttrParam(that) {
    var editorBlock = $(that).closest(".editor-block");
    var typeInfo = XObjectTypes[editorBlock.attr("typeId")];
    var attrDiv = $(that).closest(".attr_cont");
    var attrId = attrDiv.attr("attrId");
    for (var i = 0; i < typeInfo.attributes.length; ++i) {
        if (typeInfo.attributes[i].id == attrId) {
            var attrInfo = typeInfo.attributes[i];
            var valueType = attrInfo.valueType;
            var currentCount = parseInt(attrDiv.find('[name="attr_'+attrInfo.id+'_count"]').val());
            var description = (typeof attrInfo.description != "undefined" && attrInfo.description.length > 0) ? (" <small>("+attrInfo.description+")</small>") : "";
            var valueType = attrInfo.valueType;

            if ("java.lang.String" == valueType.className ||
                "java.lang.Double" == valueType.className) {
                if (valueType.availableValues.length > 0) {
                    var avItem = makeAVParamItemAddable(attrInfo.name, "", "attr_"+attrInfo.id+"_"+currentCount, false, attrInfo.valueType.availableValues, attrInfo.valueType.availableValues);
                    attrDiv.append(avItem);
                    avItem.find("select").selectpicker();
                } else {
                    var avItem = makeTextParamItemAddable(attrInfo.name, "", "attr_"+attrInfo.id+"_"+currentCount, false, "java.lang.String" == valueType.className);
                    attrDiv.append(avItem);
                }

            } else if ("java.sql.Timestamp" == valueType.className) {
                if (valueType.availableValues.length > 0) {
                    var avItem = makeAVParamItemAddable(attrInfo.name, "", "attr_"+attrInfo.id+"_"+currentCount, false, attrInfo.valueType.availableValues, attrInfo.valueType.availableValues);
                    attrDiv.append(avItem);
                    avItem.find("select").selectpicker();
                } else {
                    var avItem = makeTextParamItemAddable(attrInfo.name, "", "attr_"+attrInfo.id+"_"+currentCount, false);
                    editorBlock.append(attrDiv.append(avItem));
//                    avItem.find("input").datetimepicker({
//                        format: DateTimePickerFormat
//                    });
                }
            } else if ("java.math.BigInteger" == valueType.className) {
                if (valueType.availableValues.length > 0) {
                    var objects = getAVByObjectTypeId(attrInfo, valueType.availableValues.join(","), function(attrInfo, objects) {
                        var titles = [];
                        var values = [];
                        var description = (typeof attrInfo.description != "undefined" && attrInfo.description.length > 0) ? (" <small>("+attrInfo.description+")</small>") : "";
                        var valueType = attrInfo.valueType;
                        var currentCount = parseInt(attrDiv.find('[name="attr_'+attrInfo.id+'_count"]').val());
                        for (var j = 0; j < objects.length; ++j) {
                            titles.push(objects[j].name + "(" + objects[j].id + ")");
                            values.push(objects[j].id);
                        }
                        var avItem = makeAVParamItemAddable(attrInfo.name, "", "attr_"+attrInfo.id+"_"+currentCount, false, titles, values);
                        attrDiv.append(avItem);
                        avItem.find("select").selectpicker();
                    });
                } else {
                    var avItem = makeTextParamItemAddable(attrInfo.name, "", "attr_"+attrInfo.id+"_"+currentCount, false, false);
                    attrDiv.append(avItem);
                }
            }

            attrDiv.find('[name="attr_'+attrInfo.id+'_count"]').val(currentCount+1);
        }
    }
}
function editorRemoveAttrParam(that) {
    var attrDiv = $(that).closest(".attr_cont");
    var attrId = attrDiv.attr("attrId");
    $(that).closest(".row").remove();
    var currentCount = parseInt(attrDiv.find('[name="attr_'+attrId+'_count"]').val());
    attrDiv.find('[name="attr_'+attrId+'_count"]').val(currentCount-1);
    var vals = attrDiv.find("select.attr-value, input.attr-value, textarea.attr-value");
    for (var i = 0; i < vals.length; ++i) {
        $(vals[i]).attr("name", "attr_"+attrId+"_"+i);
    }
}

function createTextInput(isMultiline) {
    return isMultiline ? $('<textarea class="form-control" placeholder="">') : $('<input class="form-control" placeholder="" type="text" />');
}
function createSelectInput(titles, values) {
    var select = $('<select class="selectpicker" data-size="4">');
    select.append($('<option>'));
    for (var i = 0; i < titles.length; ++i) {
        var option = $('<option>');
        option.attr('value', values[i]);
        option.html(titles[i]);
        select.append(option);
    }
    return select;
}

function createHiddenInput(name, value) {
    var res = $('<input class="form-control" placeholder="" type="hidden" />');
    res.attr("name", name);
    res.val(value);
    return res;
}

function makeSingleTextParamItem(title, name, isMultiline) {
    var paramItem = makeParamItem();
    paramItem.find(".editor-block-label label").html(title);
    var textInput = createTextInput(isMultiline);
    if (typeof name != "undefined") {
        textInput.attr("name", name).attr("placeholder", title)
    } else {
        textInput.removeAttr("name");
    }
    paramItem.find(".editor-block-input").append(textInput);
    return paramItem;
}

function makeTextParamItemAddable(title, description, name, isFirst, isMultiline) {
    var paramItem = makeParamItemAddable(isFirst);
    if (isFirst) paramItem.find(".editor-block-label label").html(title+' ' + description);
    var textInput = createTextInput(isMultiline);
    if (typeof name != "undefined") {
        textInput.attr("name", name).attr("placeholder", title)
    } else {
        textInput.removeAttr("name");
    }
    textInput.addClass("attr-value");
    paramItem.find(".editor-block-input").append(textInput);
    return paramItem;
}
function makeAVParamItemAddable(title, description, name, isFirst, titles, values) {
    var paramItem = makeParamItemAddable(isFirst);
    if (isFirst)  paramItem.find(".editor-block-label label").html(title+' ' + description);
    var selectInput = createSelectInput(titles, values);
    if (typeof name != "undefined") {
        selectInput.attr("name", name).attr("placeholder", title)
    } else {
        selectInput.removeAttr("name");
    }
    selectInput.addClass("attr-value");
    paramItem.find(".editor-block-input").append(selectInput);
    return paramItem;
}
function makeSingleTextParamItemReadOnly(title, name, value, isMultiline) {
    var res = makeSingleTextParamItem(title, name, isMultiline);
    res.find(".editor-block-input input, .editor-block-input textarea").attr("disabled", "disabled").val(value);
    return res;
}
function showObjectCreationBlockToolbar(typeID) {
    var typeInfo = XObjectTypes[typeID];
    var toolbar = $(".editor-toolbar");
    toolbar.find(".create").html(toolbar.find(".create").attr("titletemplate").replace("{type}", typeInfo.name)).show();
    toolbar.find(".edit").hide();
    toolbar.find(".delete").hide();
}
function makeObjectCreationBlock(typeID){
    var typeInfo = XObjectTypes[typeID];
    var editorBlock = $(".editor-block").html("").attr("typeId", typeID);
    var attrDiv = $('<div class="attr_cont attr_name_cont">');
    editorBlock.append(attrDiv.append(makeSingleTextParamItem("Name", "name")));
    attrDiv = $('<div class="attr_cont attr_description_cont">');
    editorBlock.append(attrDiv.append(makeSingleTextParamItem("Description", "description")));
    attrDiv = $('<div class="attr_cont attr_type_cont">');
    editorBlock.append(attrDiv.append(makeSingleTextParamItemReadOnly("Type", "type", typeInfo.name)));
    editorBlock.append(createHiddenInput("typeId", typeID));
    for (var i = 0; i < typeInfo.attributes.length; ++i) {
        var attrInfo = typeInfo.attributes[i];
        var description = (typeof attrInfo.description != "undefined" && attrInfo.description.length > 0) ? (" <small>("+attrInfo.description+")</small>") : "";
        var valueType = attrInfo.valueType;
        attrDiv = $('<div attrId="'+attrInfo.id+'" class="attr_cont attr_'+attrInfo.id+'_cont">');
        if ("java.lang.String" == valueType.className ||
            "java.lang.Double" == valueType.className) {
            if (valueType.availableValues.length > 0) {
                var avItem = makeAVParamItemAddable(attrInfo.name, description, "attr_"+attrInfo.id+"_0", true, attrInfo.valueType.availableValues, attrInfo.valueType.availableValues);
                editorBlock.append(attrDiv.append(avItem));
                avItem.find("select").selectpicker();
                attrDiv.append(createHiddenInput("attr_"+attrInfo.id+"_count", "1"));
            } else {
                var avItem = makeTextParamItemAddable(attrInfo.name, description, "attr_"+attrInfo.id+"_0", true, "java.lang.String" == valueType.className);
                editorBlock.append(attrDiv.append(avItem));
                attrDiv.append(createHiddenInput("attr_"+attrInfo.id+"_count", "1"));
            }

        } else if ("java.sql.Timestamp" == valueType.className) {
            if (valueType.availableValues.length > 0) {
                var avItem = makeAVParamItemAddable(attrInfo.name, description, "attr_"+attrInfo.id+"_0", true, attrInfo.valueType.availableValues, attrInfo.valueType.availableValues);
                editorBlock.append(attrDiv.append(avItem));
                avItem.find("select").selectpicker();
                attrDiv.append(createHiddenInput("attr_"+attrInfo.id+"_count", "1"));
            } else {
                var avItem = makeTextParamItemAddable(attrInfo.name, description, "attr_"+attrInfo.id+"_0", true);
                editorBlock.append(attrDiv.append(avItem));
//                avItem.find("input").datetimepicker({
//                    format: DateTimePickerFormat
//                });
                attrDiv.append(createHiddenInput("attr_"+attrInfo.id+"_count", "1"));
            }
        } else if ("java.math.BigInteger" == valueType.className) {
            if (valueType.availableValues.length > 0) {
                var objects = getAVByObjectTypeId(attrInfo, valueType.availableValues.join(","), function(attrInfo, objects) {
                    var titles = [];
                    var values = [];
                    var description = (typeof attrInfo.description != "undefined" && attrInfo.description.length > 0) ? (" <small>("+attrInfo.description+")</small>") : "";
                    var valueType = attrInfo.valueType;
                    var attrDiv1 = $('<div attrId="'+attrInfo.id+'" class="attr_cont attr_'+attrInfo.id+'_cont">');
                    for (var j = 0; j < objects.length; ++j) {
                        titles.push(objects[j].name + "(" + objects[j].id + ")");
                        values.push(objects[j].id);
                    }
                    var avItem = makeAVParamItemAddable(attrInfo.name, description, "attr_"+attrInfo.id+"_0", true, titles, values);
                    editorBlock.append(attrDiv1.append(avItem));
                    avItem.find("select").selectpicker();
                    attrDiv1.append(createHiddenInput("attr_"+attrInfo.id+"_count", "1"));
                });
            } else {
                var avItem = makeTextParamItemAddable(attrInfo.name, description, "attr_"+attrInfo.id+"_0", true, false);
                editorBlock.append(attrDiv.append(avItem));
                attrDiv.append(createHiddenInput("attr_"+attrInfo.id+"_count", "1"));
            }
        }
    }
}
function showObjectEditingBlockToolbar(obj) {
    var toolbar = $(".editor-toolbar");
    toolbar.find(".edit").html(toolbar.find(".edit").attr("titletemplate").replace("{name}", obj.name).replace("{id}", obj.id)).show();
    toolbar.find(".create").html(toolbar.find(".create").attr("titletemplate").replace("{type}", XObjectTypes[obj.typeId].name)).show();
    toolbar.find(".delete").html(toolbar.find(".delete").attr("titletemplate").replace("{name}", obj.name).replace("{id}", obj.id)).show();
}
function makeObjectEditingBlock(obj){
    var typeID = obj.typeId;
    var typeInfo = XObjectTypes[typeID];
    if (typeof obj.name == "undefined" || obj.name == null) obj.name = "";
    if (typeof obj.description == "undefined" || obj.description == null) obj.description = "";
    var editorBlock = $(".editor-block").html("").attr("objId", obj.id).attr("typeId", typeID);
    var attrDiv = $('<div class="attr_cont attr_name_cont">');
    editorBlock.append(attrDiv.append(makeSingleTextParamItem("Name", "name")));
    attrDiv = $('<div class="attr_cont attr_description_cont">');
    editorBlock.append(attrDiv.append(makeSingleTextParamItem("Description", "description")));
    attrDiv = $('<div class="attr_cont attr_type_cont">');
    editorBlock.append(attrDiv.append(makeSingleTextParamItemReadOnly("Type", "type", typeInfo.name)));
    editorBlock.append(createHiddenInput("id", obj.id));
    editorBlock.append(createHiddenInput("typeId", typeID));
    $(".attr_name_cont .editor-block-input input").val(obj.name);
    $(".attr_description_cont .editor-block-input input").val(obj.description);
    for (var i = 0; i < typeInfo.attributes.length; ++i) {
        var attrInfo = typeInfo.attributes[i];
        var description = (typeof attrInfo.description != "undefined" && attrInfo.description.length > 0) ? (" <small>("+attrInfo.description+")</small>") : "";
        var valueType = attrInfo.valueType;
        attrDiv = $('<div attrId="'+attrInfo.id+'" class="attr_cont attr_'+attrInfo.id+'_cont">');
        if ("java.lang.String" == valueType.className ||
            "java.lang.Double" == valueType.className) {
            if (valueType.availableValues.length > 0) {
                var avItem = makeAVParamItemAddable(attrInfo.name, description, "attr_"+attrInfo.id+"_0", true, attrInfo.valueType.availableValues, attrInfo.valueType.availableValues);
                editorBlock.append(attrDiv.append(avItem));
                avItem.find("select").selectpicker();
                attrDiv.append(createHiddenInput("attr_"+attrInfo.id+"_count", "1"));
            } else {
                var avItem = makeTextParamItemAddable(attrInfo.name, description, "attr_"+attrInfo.id+"_0", true, "java.lang.String" == valueType.className);
                editorBlock.append(attrDiv.append(avItem));
                attrDiv.append(createHiddenInput("attr_"+attrInfo.id+"_count", "1"));
            }

        } else if ("java.sql.Timestamp" == valueType.className) {
            if (valueType.availableValues.length > 0) {
                var avItem = makeAVParamItemAddable(attrInfo.name, description, "attr_"+attrInfo.id+"_0", true, attrInfo.valueType.availableValues, attrInfo.valueType.availableValues);
                editorBlock.append(attrDiv.append(avItem));
                avItem.find("select").selectpicker();
                attrDiv.append(createHiddenInput("attr_"+attrInfo.id+"_count", "1"));
            } else {
                var avItem = makeTextParamItemAddable(attrInfo.name, description, "attr_"+attrInfo.id+"_0", true);
                editorBlock.append(attrDiv.append(avItem));
//                avItem.find("input").datetimepicker({
//                    format: DateTimePickerFormat
//                });
                attrDiv.append(createHiddenInput("attr_"+attrInfo.id+"_count", "1"));
            }
        } else if ("java.math.BigInteger" == valueType.className) {
            if (valueType.availableValues.length > 0) {
                var objects = getAVByObjectTypeId(attrInfo, valueType.availableValues.join(","), function(attrInfo, objects) {
                    var titles = [];
                    var values = [];
                    var description = (typeof attrInfo.description != "undefined" && attrInfo.description.length > 0) ? (" <small>("+attrInfo.description+")</small>") : "";
                    var valueType = attrInfo.valueType;
                    var attrDiv1 = $('<div attrId="'+attrInfo.id+'" class="attr_cont attr_'+attrInfo.id+'_cont">');
                    for (var j = 0; j < objects.length; ++j) {
                        titles.push(objects[j].name + "(" + objects[j].id + ")");
                        values.push(objects[j].id);
                    }
                    var avItem = makeAVParamItemAddable(attrInfo.name, description, "attr_"+attrInfo.id+"_0", true, titles, values);
                    editorBlock.append(attrDiv1.append(avItem));
                    avItem.find("select").selectpicker();
                    attrDiv1.append(createHiddenInput("attr_"+attrInfo.id+"_count", "1"));
                });
            } else {
                var avItem = makeTextParamItemAddable(attrInfo.name, description, "attr_"+attrInfo.id+"_0", true, false);
                editorBlock.append(attrDiv.append(avItem));
                attrDiv.append(createHiddenInput("attr_"+attrInfo.id+"_count", "1"));
            }
        }
        if (typeof obj.attributes[attrInfo.id] != "undefined" && obj.attributes[attrInfo.id].length > 0) {
            $('[name="attr_'+attrInfo.id+'_0"').attr("valueId", obj.attributes[attrInfo.id][0].valueId).val(obj.attributes[attrInfo.id][0].value);
            for (var j = 1; j < obj.attributes[attrInfo.id].length; ++j) {
                attrDiv.find(".editor-add-btn").click();
                $('[name="attr_'+attrInfo.id+'_'+j+'"').attr("valueId", obj.attributes[attrInfo.id][j].valueId).val(obj.attributes[attrInfo.id][j].value);
            }
        }

    }
}

(function ($) {

    $('.selectpicker').selectpicker();
//    $('#example').dataTable();
}(jQuery));
