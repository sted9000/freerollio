// Parts of Main:
// 1 - Search (6:388)
// 2 - Modals (389:)


// *** Variables ***
var blocks_per_search = 5000; // search area
var done_search_switch = false; // flips when startblock has been reached
var start_block = 4449994; // block of factory deployment
var end_block = null; // block to search until
var num_logs_to_display = 4; // defauls of displayed logs
var logs_displayed = 0; // count of logs displayed
var logs_array_all = []; // all logs
var queue = null; // logs gathered but not displayed
var timestamp_counter = 0;


// *** Gets block and starts search (called after web3 checks)
function fireUponPageLoad() {
    console.log("Factory Address: " + factoryAddress); // Log
    web3.eth.getBlockNumber(function(err, block) { // Get last block
        console.log("Current Block Number: " + block); // Log
        end_block = block; // Set end_block global variable
        queryBlockchainLogs(); // Start search from last block
    });
}

// STILL NEED TO TEST
// *** Clears display and varibles upon user filter change
function fireUponFilterChange() {

    $('.single-result-container').remove(); // Clear html display
    logs_displayed = 0; // Clear display counter
    queue = 0; // Clear queue
    $('.loadmore-button-container').hide(); // Hide show more
    $('.no-search-results-category').hide(); // Hide no results
    $('.no-more-results-category').hide(); // Hide no more results

    determineFilter(); // Continue process
}

// *** Call blockchain event log
function queryBlockchainLogs() {

    var event_logs = factoryInstance.allEvents( // Set web3 events object
        {fromBlock: end_block - blocks_per_search, toBlock: end_block});
    event_logs.get(function(err, event_query_result) { // Get events (callback)
        if (!err) {
            getTimeStamp(event_query_result); // Get timestamps of events

        } else {console.error(err);} // Log error
    });
}

// *** Call blockchain event log for timestamps
// Note: Non-traditional 'loop function' (due to callbacks)
function getTimeStamp(_event_query_results) {

    if (timestamp_counter < _event_query_results.length) { // 'Loop entry'
        web3.eth.getBlock( // Get timestamps
            _event_query_results[timestamp_counter].blockNumber, function(err,res) {
            if (!err) {

                logs_array_all.push( // Push (logs,timestamp) to global array
                    [_event_query_results[timestamp_counter], res.timestamp]);
                timestamp_counter +=1; // Increment counter
                getTimeStamp(_event_query_results); // Rerun function ('loop')
            }

            else {console.error(err);} // Log error
        });
    }

    else { // Update variables and continue processing
        timestamp_counter = 0; // Clear counter
        console.log('Events & Timestamps for end_blocks: ' + end_block);
        end_block = end_block - blocks_per_search; // Decrease search area
        if (end_block < start_block) {done_search_switch = true;} // Flip switch
        determineFilter(); // Continue process
    }
}

// *** Proesses users filters (calls filterLogs())
function determineFilter() {

    var filters_array = [];

    // if all filters selected call desplay() immediately
    if ($(".filter-button-middle.unselected").length == 0) {
        displayLogs(logs_array_all);
    }
    // else collect all non-selected filters and pass them to filter()
    else {
        $(".filter-button-middle.unselected").each(function(){
             filters_array.push($(this).attr('id'));
        });

        filterLogs(filters_array); // pass filter_array to filterLogs()
    }
}

function filterLogs(_filter_array) {

    var filtered_logs = []; // Array to hold logs that meet filter criteria
    for (var i=0; i<logs_array_all.length; i++) { // Loop dataLogs
        for (var j=0; j<_filter_array.length; j++) { // Loop filters (unselected)

            if (_filter_array[j] == "filter-active") { // The filter
                var d = new Date(); // Create Date object
                var current_time_secs = Math.trunc(d / 1000); // Turn to secs with decimals
                if ((logs_array_all[i][1] + logs_array_all[i][0].args['_duration'].toNumber()) <= current_time_secs) { // Expired
                    if (j < (_filter_array.length - 1)) {continue;} // Not last filter (unselected) then continue
                    else {filtered_logs.push(logs_array_all[i]);} // Is last filter item then push to filtered_logs
                } else {break;} // If not pass filter (unselected) discard this event
            }

            else if (_filter_array[j] == "filter-expired") { // See 9 rows above (same format)
                var d = new Date(); // Create Date object
                var current_time_secs = Math.trunc(d / 1000); // Turn to secs with decimals
                if ((logs_array_all[i][1] + logs_array_all[i][0].args['_duration'].toNumber()) >= current_time_secs) {
                    if (j < (_filter_array.length - 1)) {continue;}
                    else {filtered_logs.push(logs_array_all[i]);}
                } else {break;}
            }

            else if (_filter_array[i] == "filter-community") {
                console.log('user account: ' + web3.eth.defaultAccount);
                console.log('poster account: ' + logs_array_all[i][0].args['_poster']);
                if (logs_array_all[i][0].args['_poster'] == web3.eth.defaultAccount) {
                    if (j < (_filter_array.length - 1)) {continue;}
                    else {filtered_logs.push(logs_array_all[i]);}
                } else {break;}
            }

            else if (_filter_array[i] == "filter-you") {
                if (logs_array_all[i][0].args['_poster'] != web3.eth.defaultAccount) {
                    if (j < (_filter_array.length - 1)) {continue;}
                    else {filtered_logs.push(logs_array_all[i]);}
                } else {break;}
            }

            else if (_filter_array[i] == "filter-high") {
                if (web3.fromWei(logs_array_all[i][0].args['_value'].toNumber(), 'ether') < .5) {
                    if (j < (_filter_array.length - 1)) {continue;}
                    else {filtered_logs.push(logs_array_all[i]);}
                } else {break;}
            }

            else if (_filter_array[i] == "filter-low") {
            if (web3.fromWei(logs_array_all[i][0].args['_value'].toNumber(), 'ether') >= .5) {
                    if (j < (_filter_array.length - 1)) {continue;}
                    else {filtered_logs.push(logs_array_all[i]);}
                } else {break;}
            }

            else if (_filter_array[i] == "filter-charity") {
                if (logs_array_all[i][0].args['_charity'] == false) {
                    if (j < (_filter_array.length - 1)) {continue;}
                    else {filtered_logs.push(logs_array_all[i]);}
                } else {break;}
            }

            else if (_filter_array[i] == "filter-noncharity") {
                if (logs_array_all[i][0].args['_charity'] == true) {
                    if (j < (_filter_array.length - 1)) {continue;}
                    else {filtered_logs.push(logs_array_all[i]);}
                } else {break;}
            }

            else if (_filter_array[i] == "filter-health") {
                if (logs_array_all[i][0].args['_categroy'].toNumber() != 0) {
                    if (j < (_filter_array.length - 1)) {continue;}
                    else {filtered_logs.push(logs_array_all[i]);}
                } else {break;}
            }

            else if (_filter_array[i] == "filter-newskill") {
                if (logs_array_all[i][0].args['_category'].toNumber() != 1) {
                    if (j < (_filter_array.length - 1)) {continue;}
                    else {filtered_logs.push(logs_array_all[i]);}
                } else {break;}
            }

            else if (_filter_array[i] == "filter-workschool") {
                if (logs_array_all[i][0].args['_category'].toNumber() != 2) {
                    if (j < (_filter_array.length - 1)) {continue;}
                    else {filtered_logs.push(logs_array_all[i]);}
                } else {break;}
            }

            else if (_filter_array[i] == "filter-othercat") {
                if (logs_array_all[i][0].args['_category'].toNumber() != 3) {
                    if (j < (_filter_array.length - 1)) {continue;}
                    else {filtered_logs.push(logs_array_all[i]);}
                } else {break;}
            }
        }
    }

    displayLogs(filtered_logs);
}

// *** Displays filtered_data
// Note: Increments currently_displayed
// Calls errorsAndMessages
function displayLogs(_logs_to_display) {


    logs_to_display_now = _logs_to_display.slice(logs_displayed); // Removing the logs already displayed
    for (var i=0; i<logs_to_display_now.length; i++) { // Start loop
        if (logs_displayed < num_logs_to_display) { // Not over display 'max'
            var unique_id = logs_to_display_now[i][0].transactionHash.substring(0,9) // Create unique identifier

            // .single-results-container
            jQuery('<div/>', {
                id: unique_id,
                class: 'single-result-container',
                onClick: 'fireUponDetailsClick(this)'
            }).appendTo('#query-results');

            // .tooltiptext
            $('#' + unique_id).append(
                '<div id="results-container-tooltiptext">Click to view details</div>');

            // .search-result-title-row
            jQuery('<div/>', {
                id: unique_id + '_title_row',
                class: 'search-result-title-row'
            }).appendTo('#' + unique_id);

            // // Script
            // $('#' + unique_id).append(
            //     '<script type="text/javascript"></script>');

            // .result-title (_description)
            jQuery('<span/>', {
                id: 'descr-span',
                class: 'result-title'
            }).appendTo('#' + unique_id + '_title_row');
            $('#' + unique_id + ' #descr-span').text(
                logs_to_display_now[i][0].args['_description']);

            // .search-result-footer-row
            jQuery('<div/>', {
                id: unique_id + '_footer_div',
                class: 'search-result-footer-row'
            }).appendTo('#' + unique_id);

            // .status-footer
            jQuery('<span/>', {
                id: 'status-span',
                class: 'status-footer'
            }).appendTo('#' + unique_id + '_footer_div');
            var date_time = Date.now(); // Now in milliseconds
            var current_second = Math.trunc(date_time/1000); // Now in seconds w/o decimals
            var freeroll_expiration = (
                logs_to_display_now[i][1] + // Trasaction timestamp
                logs_to_display_now[i][0].args['_duration'].toNumber()); // Duration
            if (current_second < freeroll_expiration) { // Ongoing
                $('#' + unique_id  + ' #status-span').append('Active');
            } else { // Expired
                $('#' + unique_id  + ' #status-span').append('Expired');
            }

            // .icons *******************************
            // #location-span
            console.log(logs_to_display_now[i][0].args);
            jQuery('<span/>', {
                id: 'location-span',
                class: 'icon'
            }).appendTo('#' + unique_id + '_title_row');
            if (logs_to_display_now[i][0].args['_location'] == "") { // No location
                $('#' + unique_id + '_title_row' + ' #location-span').append(
                    '<img src="../images/www_grey_24px.png" />'); // black coin
            } else { // Location
                $('#' + unique_id + '_title_row' + ' #location-span').append(
                    '<img src="../images/www_black_24px.png" />'); // gold coin
            }

            // #freeroll-value-span
            jQuery('<span/>', {
                id: 'freeroll-value-span',
                class: 'icon'
            }).appendTo('#' + unique_id + '_title_row');
            if (web3.fromWei(logs_to_display_now[i][0].args['_value'], 'ether') < .5) { // < 0.5 ETH
                $('#' + unique_id + '_title_row' + ' #freeroll-value-span').append(
                    '<img src="../images/black_coin_24px.png" />'); // black coin
            } else { // > 0.5 ETH
                $('#' + unique_id + '_title_row' + ' #freeroll-value-span').append(
                    '<img src="../images/coin_gold_24px.png" />'); // gold coin
            }

            // #charity-span
            jQuery('<span/>', {
                id: 'charity-span',
                class: 'icon'
            }).appendTo('#' + unique_id + '_title_row');
            if (logs_to_display_now[i][0].args['_charity']) { // charity (bool)
                $('#' + unique_id + '_title_row' + ' #charity-span').append( // Dark image
                    '<img id="moneybag-img" src="../images/charityhand_dark_24px.png" />');
            } else { // no charity (bool)
                $('#' + unique_id + '_title_row' + ' #charity-span').append( // Light image
                    '<img id="moneybag-img" src="../images/charityhand_light_24px.png" />');
            }

            // #category-span
            jQuery('<span/>', {
                id: 'category-span',
                class: 'icon'
            }).appendTo('#' + unique_id + '_title_row');
            if (logs_to_display_now[i][0].args['_category'] == 0) { // Health
                $('#' + unique_id + '_title_row' + ' #category-span').append(
                    '<img id="moneybag-img" src="../images/runner_24px.png" />');
            }

            else if (logs_to_display_now[i][0].args['_category'] == 1) { // Skill
                $('#' + unique_id + '_title_row' + ' #category-span').append(
                    '<img id="moneybag-img" src="../images/music_24px.png" />');
            }

            else if (logs_to_display_now[i][0].args['_category'] == 2) { // School/work
                $('#' + unique_id + '_title_row' + ' #category-span').append(
                    '<img id="moneybag-img" src="../images/book24px.png" />');
            }

            else if (logs_to_display_now[i][0].args['_category'] == 3) { // Other
                $('#' + unique_id + '_title_row' + ' #category-span').append(
                    '<img id="moneybag-img" src="../images/new_24px.png" />');
            }

            logs_displayed += 1; // Increment number_shown

        } else { // Increment queue
            queue += 1;
        }
    } // End _display_array loop

    errorsAndMessages(logs_to_display_now.length); // Call errors and messages passing length

}

function errorsAndMessages(_length_just_displayed) {
    // Note #spinner is on by default on page load

    if (done_search_switch) {

        $('#searching-blockchain').hide(); // Hide searching
        console.log('here in done, queue is: ' + queue);
        if (queue > 0) { // Show loadmore button
            $('#loadmore-button-container').show();
        } else { // Show no results
            if (logs_displayed == null || logs_displayed == 0) {
                $('.no-search-results-category').show(); // Show no results
            } else {
                $('.loadmore-button-container').hide(); // Hide show more
                $('#no-more-results-category').show(); // Show no more results
            }
        }
    } // End of query_done


    // // Stop Loop due to user changing sub-nav filter
    // if (stop_loop) {
    //     $('.single-result-container').remove(); // Clear display
    //     currently_displayed = 0; // Clear 'number_shown'
    //     max_display = 5; // Set max display
    //     queue = 0; // Clear queue
    //     stop_loop = null; // Reset stop_loop
    //     determineFilter(query_data); // Pass data to filter
    //     return null // To stop the dataQuery loop
    // }

    // Continue the loop incrementing towards begining
    else {
        queryBlockchainLogs();
    }
}

// User requests to load more logs
function loadmoreButton() {
        num_logs_to_display += 5; // increment logs_to_display
        queue = 0; // clear queue
        determineFilter(); // run displayLogs()
        $("#loadmore-button-container").hide(); // loadmore.hide()
}


// Modals **********************************************************************************************************************

// Freeroll Detail Modal .........................................................
function fireUponDetailsClick(_this) {
    // Fire modal (with search message as default)
    console.log('here in details');

    // Open the modal
    $("#details-modal").css('display', 'block');

    // Get information for modal
    for (var i=0; i<logs_array_all.length; i++) { // Loop all local events
        if ($(_this).attr('id').substring(0,9) == logs_array_all[i][0].transactionHash.substring(0,9)) { // Get txHash that user clicked on
            var modal_event = logs_array_all[i];
            var modal_args = modal_event[0].args;

            // Call freeroll for recipient and status/balance
            freerollInstance = freerollABI.at(modal_args['_freeroll_addr']);
            freerollInstance.receiver.call(function(err,receiver) {
                if (!err) {
                    web3.eth.getBalance(modal_args['_freeroll_addr'], function(err,balance) {
                        if (!err) {

                            // Append modal divs w/ information
                            $("#details-sub-header").text(modal_args['_freeroll_addr']); // Address in title
                            $("#details-address-container").attr('id', modal_args['_freeroll_addr']); // Address as id for buttons
                            $("#details-sub-header").attr('href', ('https://ropsten.etherscan.io/address/' + modal_args['_freeroll_addr'])); // Address etherscan
                            $("#details-sub-header").attr('target', '_blank'); // In new tab
                            $(".modal-poster").text(modal_args['_poster']); // Add poster address
                            $(".modal-poster").attr('id', modal_args['_poster']); // Add poster address
                            $(".modal-poster").attr('href', ('https://ropsten.etherscan.io/address/' + modal_args['_poster'])); // Poster etherscan
                            $(".modal-poster").attr('target', '_blank'); // In new tab

                            var modal_start_object = new Date(modal_event[1] * 1000);
                            var modal_start_date = modal_start_object.toDateString();
                            var modal_start_time = modal_start_object.toLocaleTimeString();
                            $("#modal-dateposted").text(modal_start_date + ' at ' + modal_start_time); // Add expir date




                            $("#modal-description").text(modal_args['_description']); // Add description
                            var delta = Math.abs(modal_args['_duration']); // get total seconds between the times
                            var days = Math.floor(delta / 86400); // calculate whole days
                            delta -= days * 86400; // subtract
                            var hours = Math.floor(delta / 3600) % 24; // calculate whole hours
                            delta -= hours * 3600; // subtract
                            var minutes = Math.floor(delta / 60) % 60; // calculate whole minutes
                            delta -= minutes * 60; // subtract
                            var seconds = delta % 60;  // // what's left is seconds
                            $("#modal-duration").text(days + ' Days, ' + hours + ' Hours, ' + minutes + ' Minutes ' + 'of the contract creation'); // Add duration

                            var modal_expir = new Date((modal_args['_duration'].toNumber() + modal_event[1]) * 1000);
                            var modal_expir_date = modal_expir.toDateString();
                            var modal_expir_time = modal_expir.toLocaleTimeString();
                            $("#modal-expiration").text(modal_expir_date + ' at ' + modal_expir_time); // Add expir date
                            $("#modal-value").text(web3.fromWei(modal_args['_value'], 'ether') + ' ETH'); // Add freeroll value
                            $("#modal-receiver").text(receiver); // Add receiver address
                            $("#modal-receiver").attr('href', ('https://ropsten.etherscan.io/address/' + receiver)); // Receiver etherscan
                            $("#modal-receiver").attr('target', '_blank'); // In new tab

                            if (modal_args['_location'] == "") {
                                $('#modal-location-avail').text('Poster has chosen not to verify results.')
                            }
                            else {
                                $("#modal-location").text(modal_args['_location']); // Add location text
                                $("#modal-location").attr('href', ('https://' + modal_args['_location'])); // Location href
                                $("#modal-location").attr('target', '_blank'); // In new tab
                            }

                            $("#modal-trust").text('Honor');




                            // Logic for status of contract
                            if (((modal_args['_duration'].toNumber() + modal_event[1]) * 1000) <  Date.now()) { // expired
                                if (web3.fromWei(balance, 'ether') == 0) { // Paid out winner (100%)
                                    $("#modal-deadline").text(' Passed');
                                    $("#modal-outcome").text(' Victory Claimed');
                                    $("#modal-remaining-balance").text(' ' + web3.fromWei(balance, 'ether'));
                                    $("#claim-victory").hide();
                                    $("#payout").hide();
                                    $("#claim-victory-grey").show();
                                    $("#payout-grey").show();


                                }
                                else if (balance == 1) { // Paid out receiver (all but 1 wei)
                                    $("#modal-deadline").text(' Passed');
                                    $("#modal-outcome").text(' Unsuccessful');
                                    $("#modal-remaining-balance").text(' ' + web3.fromWei(balance, 'ether'));
                                    $("#claim-victory").hide();
                                    $("#payout").hide();
                                    $("#claim-victory-grey").show();
                                    $("#payout-grey").show();

                                }
                                else {
                                    $("#modal-deadline").text(' Passed');
                                    $("#modal-outcome").text(' Unsucessful');
                                    $("#modal-remaining-balance").text(' ' + web3.fromWei(balance, 'ether'));
                                    $("#payout-grey").hide();
                                    $("#claim-victory").hide();
                                    $("#claim-victory-grey").show();
                                    $("#payout").show();
                                }

                            }
                            else { // active
                                if (web3.fromWei(balance, 'ether') == 0) { // Paid out winner (100%)
                                    $("#modal-deadline").text(' Active');
                                    $("#modal-outcome").text(' Victory Claimed');
                                    $("#modal-remaining-balance").text(' ' + web3.fromWei(balance, 'ether'));
                                    $("#claim-victory").hide();
                                    $("#payout").hide();
                                    $("#claim-victory-grey").show();
                                    $("#payout-grey").show();

                                }

                                else {
                                    $("#modal-deadline").text(' Active'); // Ongoing
                                    $("#modal-outcome").text(' TBD');
                                    $("#modal-remaining-balance").text(' ' + web3.fromWei(balance, 'ether'));
                                    $("#payout").hide();
                                    $("#payout-grey").show();

                                    if (web3.eth.defaultAccount == modal_args['_poster']) {
                                        $("#claim-victory").show();
                                        $("#claim-victory-grey").hide();
                                    }
                                    else {
                                        $("#claim-victory").hide();
                                        $("#claim-victory-grey").show();
                                    }




                                }
                            }

                            $("#modal-load-message").hide();
                            $("#details-sub-header").show();
                            $("#details-body-data").show();

                        } else {console.error(err);}
                    });
                }
                else {console.error(err);}
            });

        }
    }
}

function payoutFreeroll() {
    var vic_freeroll_addr = $(".modal-address-container").attr('id'); // get address
    var freerollInstance = freerollABI.at(vic_freeroll_addr);
    freerollInstance.posterLost(function(err,result) {
        if (!err) {
            console.log(result); // Transaction Hash
        }
        else {
            console.error(err);
        }
    });
}

function claimVictory() {
    var vic_freeroll_addr = $(".modal-header-address").attr('id'); // get address
    var vic_poster = $(".modal-poster").attr('id') // get poster address
    var freerollInstance = freerollABI.at(vic_freeroll_addr);
    freerollInstance.posterWon(function(err,result) {
        if (!err) {
            console.log(result); // Transaction Hash
        }
        else {
            console.error(err);
        }
    });
}

function closeModal() {
    $(".modal").css('display', 'none');
    $("#modal-load-message").show();
    $("#review-load-message").show();
    $("#details-body-data").hide();
    $("#details-sub-header").hide();
}

// Review before posting Modal ...................................................
/* Freeroll Detail Modal ***********************************************************************/
function fireUponReviewClick() {

    // // Make sure all inputs are filled
    // if (($("#user-description").val() == "") ||
    // ($("#user-receiver").val() == "") ||
    // ($("#user-amount").val() == "") ||
    // ($("#user-duration").val() == "") ||
    // ($("#user-category").val() == "")) {
    //     // error
    //     alert('You missed required(s) field');
    //     return;
    // }


    $("#post-container").slideToggle("slow"); // Close post dropdown
    $("#review-modal").show(); // Show the modal


    // Populate Modal ..........................................................

    // Poster address
    $("#review-poster").text(web3.eth.defaultAccount); // Add poster address
    $("#review-poster").attr('href', ('https://ropsten.etherscan.io/address/' + web3.eth.defaultAccount)); // Poster etherscan
    $("#review-poster").attr('target', '_blank'); // In new tab

    // Freeroll description
    console.log($("#user-description"));
    $("#review-description").text($("#user-description").val()); // Add description

    // Duration
    var usr_dur_secs = ($("#user-duration").val() * 60 * 60 * 24);
    var delta = Math.abs(usr_dur_secs); // get total seconds between the times
    var days = Math.floor(delta / 86400); // calculate whole days
    delta -= days * 86400; // subtract
    var hours = Math.floor(delta / 3600) % 24; // calculate whole hours
    delta -= hours * 3600; // subtract
    var minutes = Math.floor(delta / 60) % 60; // calculate whole minutes
    delta -= minutes * 60; // subtract
    var seconds = delta % 60;  // // what's left is seconds
    $("#review-duration").text(days + ' Days, ' + hours + ' Hours, ' + minutes + ' Minutes '); // Add duration

    // Balance
    $("#review-amount").text($("#user-amount-eth").val() + ' ETH'); // Add description

    // Receiver
    if ($("#user-receiver").val() == 2) {
        $("#review-receiver").text($("#user-input-receiver").val()); // Add description
        $("#review-receiver").attr('href', ("https://ropsten.etherscan.io/address/" + $("#user-input-receiver").val())); // Add description
        $("#review-receiver").attr('target', '_blank'); // Add description
    }
    else {
        // NEED TO ADD LOGIC FOR CHARITY ADDRESSES HERE
        $("#review-receiver").text($("#user-receiver").val()); // Add description
        $("#review-receiver").attr('href', ("https://ropsten.etherscan.io/address/" + $("#user-input-receiver").val())); // Add description
        $("#review-receiver").attr('target', '_blank'); // Add description
    }

    // Location
    if ($("#user-location").val() == "") {
        $("#review-location-mess").text("You DO NOT intend to verify your results");
    }
    else {
        $("#review-location-mess").text("You agree to verifiy your results at: ");
        $("#review-location").text(' ' + $("#user-location").val());
    }

    // Trust system
    $("#review-trust").text("Honor");

    // Show modal body
    $("#review-body-data").show();


    // API promises ......................
    var ethPrice = null;
    var gasPrice = null;

    // Ethereum price
    fetch('https://api.etherscan.io/api?module=stats&action=ethprice&apikey=9NFYURHUKFZ46AIXCEKQRBYR727C5KFIW5')
    .then((resp) => resp.json())  // Turn into json data
    .then(function(data) { //
        ethPrice = data.result.ethusd;
    })

    // Gas prices
    .then(fetch('https://www.ethgasstationapi.com/api/standard')
        .then(function(data){
            gasPrice = data;
        }))

    // .then(function(){
    //
    //     // Estimated Freeroll Deadline
    //     // var est_deadline = new Date((usr_dur_secs * 1000) + (Date.now()) + (60 * 1000));
    //     // var est_deadline_date = est_deadline.toDateString();
    //     // var est_deadline_time = est_deadline.toLocaleTimeString();
    //     // $("#modal-est-deadline").text(est_deadline_date + ' at ' + est_deadline_time);









    .catch(function(error){
        console.log('here error');
        console.log(error);
    });

    console.log('ethPrice: ' + ethPrice);
    console.log('gasPrice: ' + gasPrice);
}



function populateEstimates(_this) {

    if ($(_this).val() == 'low') { // Low
        // Set time estimate
        // Set deployment cost
        // Set claim victory cost
    }
    else if ($(_this).val() == 'standard') {

    }
    else if ($(_this).val() == 'high') {

    }
    else {
        null
    }


}
