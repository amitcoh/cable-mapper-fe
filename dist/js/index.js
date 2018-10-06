const apiHost = "http://127.0.0.1:5000"

$(document).ready(function () {

    // Change navbar background on scroll
    $(document).scroll(function () {
        var $nav = $(".fixed-top");
        $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
    });


    // Assign select elements to Select2
    $("#sourceRackName").select2({
        placeholder: "Source Rack"
    });
    $("#destinationRackName").select2({
        placeholder: "Destination Rack"
    });
    $("#mediaType").select2({
        placeholder: "Media Type"
    });
    $("#deleteRackId").select2({
        placeholder: "Select a rack to delete"
    });
    $("#createPanelSourceRack").select2({
        placeholder: "Source Rack"
    })
    $("#createPanelDestinationRack").select2({
        placeholder: "Destination Rack"
    })
    $("#createPanelMediaType").select2({
        placeholder: "Media Type"
    })
    $("#createPanelConnector").select2({
        placeholder: "Connector Type"
    })

    // Load rack contents for shortest path form
    function loadData() {
        $("#sourceRackName").empty()
        $("#destinationRackName").empty()
        $("#deleteRackId").empty()
        $("#createPanelSourceRack").empty()
        $("#createPanelDestinationRack").empty()
        $("#sourceRackName").append("<option value=\"\"></option>")
        $("#destinationRackName").append("<option value=\"\"></option>")
        $("#deleteRackId").append("<option value=\"\"></option>")
        $("#createPanelSourceRack").append("<option value=\"\"></option>")
        $("#createPanelDestinationRack").append("<option value=\"\"></option>")
        $.ajax({
            method: "GET",
            url: apiHost + "/rack"
        }).done(function (msg) {
            console.log(msg);
            msg.forEach(element => {
                let optionText = element.site + "/" + element.building + "/" + element.room + "/" + element.name;
                $("#sourceRackName").append("<option value=\"" + element.id + "\">" + optionText + "</option");
                $("#destinationRackName").append("<option value=\"" + element.id + "\">" + optionText + "</option");
                $("#deleteRackId").append("<option value=\"" + element.id + "\">" + optionText + "</option");
                $("#createPanelSourceRack").append("<option value=\"" + element.id + "\">" + optionText + "</option");
                $("#createPanelDestinationRack").append("<option value=\"" + element.id + "\">" + optionText + "</option");
            });
        });
    }

    loadData()

    $("#shortestPathProgress").hide();

    // Handle shortest path form
    $("#findShortestPathForm").submit(function (event) {
        event.preventDefault();
        let indexedData = {};
        let unindexedData = $(this).serializeArray();
        unindexedData.forEach(element => {
            indexedData[element.name] = element.value;
        });
        let requestData = {};
        requestData["rack1"] = { id: indexedData["sourceRackName"] };
        requestData["rack2"] = { id: indexedData["destinationRackName"] };
        requestData["mediaType"] = indexedData["mediaType"]
        console.log(requestData);
        $.ajax({
            method: "POST",
            url: apiHost + "/shortest-path",
            data: JSON.stringify(requestData),
            contentType: "application/json"
        })
            .done(function (msg) {
                $("#shortestPathUl").empty();
                console.log(msg);
                if (msg.length > 0) {
                    msg[0].forEach((element, i) => {
                        console.log(typeof (msg));
                        $("#shortestPathUl").append("<li class=\"nav-item\" id=\"" + element.id + "\"><a href=\"#" + element.id + "\" class=\"nav-link\">" + element.name + "</a></li>").hide().fadeIn();
                    });
                    $("#shortestPathProgress").show();
                    $("#shortestPathProgressBar").removeClass("bg-danger")
                    $("#shortestPathProgressBar").animate({ width: "100%" }, 400);
                }
                else {
                    $("#shortestPathUl").append("<li class=\"nav-item\" id=\"pathNotFound\"><a href=\"#\" class=\"nav-link text-danger\">Path Not Found</a></li>")
                    $("#shortestPathProgress").show();
                    $("#shortestPathProgressBar").addClass("bg-danger")
                    $("#shortestPathProgressBar").animate({ width: "100%" }, 400);
                }
            })
            .fail(function (msg) {
                console.log(msg);
            });
    });

    // Handle smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            /*document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'start'
            });*/

            var hash = this.hash;

            // animate
            $('html, body').animate({
                scrollTop: $(hash).offset().top - 100
            }, 600, function () {

                // when done, add hash to url
                // (default click behaviour)
                window.location.hash = hash;
            });
        });
    });

    // Handle create rack form
    $("#createRackForm").submit(function (event) {
        event.preventDefault();
        let indexedData = {};
        let unindexedData = $(this).serializeArray();
        unindexedData.forEach(element => {
            indexedData[element.name] = element.value;
        });
        let requestData = {};
        requestData["name"] = indexedData["createRackName"];
        requestData["building"] = indexedData["createRackBuilding"];
        requestData["site"] = indexedData["createRackSite"];
        requestData["room"] = indexedData["createRackRoom"];
        console.log(requestData);
        $.ajax({
            url: apiHost + "/rack",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(requestData)
        })
            .done(function (msg) {
                console.log(msg);
                let successMsg = msg.name + " successfully created with ID: " + msg.id;
                $("#createRackLeadText").text(successMsg);
                loadData();
            })
            .fail(function () {
                let errMsg = "Something went wrong."
                $("#createRackLeadText").text(errMsg);
            });
    });

    // Handle delete rack form
    $("#deleteRackForm").submit(function (event) {
        event.preventDefault();
        let indexedData = {};
        let unindexedData = $(this).serializeArray();
        unindexedData.forEach(element => {
            indexedData[element.name] = element.value;
        });
        $.ajax({
            url: apiHost + "/rack/" + indexedData["deleteRackId"],
            method: "DELETE"
        })
            .done(function (msg) {
                $("#deleteRackLeadText").text("Deleted successfully")
                console.log("Rack " + indexedData["deleteRackId"] + " deleted.")
                loadData();
            });
    });

    // Handle create panel form
    $("#createPanelForm").submit(function (event) {
        event.preventDefault();
        let indexedData = {};
        let unindexedData = $(this).serializeArray();
        unindexedData.forEach(element => {
            indexedData[element.name] = element.value;
        });
        if (indexedData["createPanelSourceRack"] === indexedData["createPanelDestinationRack"]) {
            alert('Source and Destination must be different racks!');
            return false
        }
        else {
            let requestData = {};
            requestData["source_id"] = indexedData["createPanelSourceRack"];
            requestData["destination_id"] = indexedData["createPanelDestinationRack"];
            requestData["name"] = indexedData["createPanelName"];
            requestData["panel_type"] = indexedData["createPanelMediaType"];
            requestData["num_of_ports"] = parseInt(indexedData["createPanelNumOfPorts"]);
            requestData["connector"] = indexedData["createPanelConnector"];
            console.log(requestData);
            $.ajax({
                url: apiHost + "/panel",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(requestData)
            })
                .done(function (msg) {
                    console.log(msg);
                    $("#createPanelLeadText").text("Panel created successfully")
                })
                .fail(function () {
                    alert('Something went wrong.');
                })
        }
    })
});


