// Contents:
// 1 - Variables (11:31)
// 2 - Blockchain search and Display Logic
// 3 - Freeroll Details Modal
// 4 - New Freeroll Review Modal
// 5 - Button click and mics functions


// *** Variables *******************************************************************************************************************************************
// Search and display variables
const blocks_per_search = 10000; // search area
var done_search_switch = false; // flips when startblock has been reached
const start_block = 6771111; // block of factory deployment
var end_block = null; // block to search until
var num_logs_to_display = 4; // defauls of displayed logs
var logs_displayed = 0; // count of logs displayed
var logs_array_all = []; // all logs
var queue = null; // logs gathered but not displayed
var timestamp_counter = 0;
const charity_list = ['0xc7464dbcA260A8faF033460622B23467Df5AEA42', '0xD3F81260a44A1df7A7269CF66Abd9c7e4f8CdcD1', '0x631bE4762a3d5c2fe2D9166e530F74AdDFCb1567']; // [GiveDirectly, Heifer International, My address]
// Modal variables
const proxy_url = 'https://cors-anywhere.herokuapp.com/';
var ethPrice = null;
var gasInfo = null;
var web3_description = null;
var web3_receiver = null;
var web3_charity_bool = null;
var web3_amount_wei = null;
var web3_duration_sec = null;
var web3_location = null;
var web3_category = null;


// *** Blockchain search and Display Logic *************************************************************************************************************
// *** Gets block and starts search (called after web3 checks)
function fireUponPageLoad() {
    console.log("Factory Address: " + factoryAddress); // Log
    web3.eth.getBlockNumber(function(err, block) { // Get last block
        console.log("Current Block Number: " + block); // Log
        end_block = block; // Set end_block global variable
        queryBlockchainLogs(); // Start search from last block
    });
}


// *** Clears display and varibles upon user filter change
function fireUponFilterChange() {

    $('.single-result-container').remove(); // Clear html display
    logs_displayed = 0; // Clear display counter
    queue = 0; // Clear queue
    $('#loadmore-button-container').hide(); // Hide show more
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
        if (end_block < start_block) {
            done_search_switch = true; // Flip switch
            console.log('Done with events search');
        }
        determineFilter(); // Continue process
    }
}


// *** Proccesses search filters (calls filterLogs())
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

        console.log(filters_array);
        filterLogs(filters_array); // pass filter_array to filterLogs()
    }
}


// *** Filters event arrays (passes 'passing' events to displayLogs())
function filterLogs(_filter_array) {

    var filtered_logs = []; // Array to hold logs that meet filter criteria

    for (var i=0; i<logs_array_all.length; i++) { // Loop dataLogs
        console.log('how many outerloops');
        for (var j=0; j<_filter_array.length; j++) { // Loop filters (unselected)
            console.log('howmany inner loops')


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

            else if (_filter_array[j] == "filter-community") {
                if (logs_array_all[i][0].args['_poster'] == web3.eth.defaultAccount) {
                    if (j < (_filter_array.length - 1)) {continue;}
                    else {filtered_logs.push(logs_array_all[i]);}
                } else {break;}
            }

            else if (_filter_array[j] == "filter-you") {
                if (logs_array_all[i][0].args['_poster'] != web3.eth.defaultAccount) {
                    if (j < (_filter_array.length - 1)) {continue;}
                    else {filtered_logs.push(logs_array_all[i]);}
                } else {break;}
            }

            else if (_filter_array[j] == "filter-high") {
                if (web3.fromWei(logs_array_all[i][0].args['_value'].toNumber(), 'ether') < .5) {
                    if (j < (_filter_array.length - 1)) {continue;}
                    else {filtered_logs.push(logs_array_all[i]);}
                } else {break;}
            }

            else if (_filter_array[j] == "filter-low") {
            if (web3.fromWei(logs_array_all[i][0].args['_value'].toNumber(), 'ether') >= .5) {
                    if (j < (_filter_array.length - 1)) {continue;}
                    else {filtered_logs.push(logs_array_all[i]);}
                } else {break;}
            }

            else if (_filter_array[j] == "filter-charity") {
                if (logs_array_all[i][0].args['_charity'] == false) {
                    if (j < (_filter_array.length - 1)) {continue;}
                    else {filtered_logs.push(logs_array_all[i]);}
                } else {break;}
            }

            else if (_filter_array[j] == "filter-noncharity") {
                if (logs_array_all[i][0].args['_charity'] == true) {
                    if (j < (_filter_array.length - 1)) {continue;}
                    else {filtered_logs.push(logs_array_all[i]);}
                } else {break;}
            }

            else if (_filter_array[j] == "filter-health") {
                if (logs_array_all[i][0].args['_category'].toNumber() != 0) {
                    if (j < (_filter_array.length - 1)) {continue;}
                    else {filtered_logs.push(logs_array_all[i]);}
                } else {break;}
            }

            else if (_filter_array[j] == "filter-newskill") {
                if (logs_array_all[i][0].args['_category'].toNumber() != 1) {
                    if (j < (_filter_array.length - 1)) {continue;}
                    else {filtered_logs.push(logs_array_all[i]);}
                } else {break;}
            }

            else if (_filter_array[j] == "filter-workschool") {
                if (logs_array_all[i][0].args['_category'].toNumber() != 2) {
                    if (j < (_filter_array.length - 1)) {continue;}
                    else {filtered_logs.push(logs_array_all[i]);}
                } else {break;}
            }

            else if (_filter_array[j] == "filter-othercat") {
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
// Calls errorsAndMessages()
function displayLogs(_logs_to_display) {

    var logs_to_display_now = _logs_to_display.slice(logs_displayed); // Removing the logs already displayed
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

            // .icons ********************
            // #location-span
            jQuery('<span/>', {
                id: 'location-span',
                class: 'icon'
            }).appendTo('#' + unique_id + '_title_row');
            if (logs_to_display_now[i][0].args['_location'] == "") { // No location
                $('#' + unique_id + '_title_row' + ' #location-span').append(
                    '<img src="/images/www_grey_24px.png" />'); // black coin
            } else { // Location
                $('#' + unique_id + '_title_row' + ' #location-span').append(
                    '<img src="/images/www_black_24px.png" />'); // gold coin
            }

            // #freeroll-value-span
            jQuery('<span/>', {
                id: 'freeroll-value-span',
                class: 'icon'
            }).appendTo('#' + unique_id + '_title_row');
            if (web3.fromWei(logs_to_display_now[i][0].args['_value'], 'ether') < .5) { // < 0.5 ETH
                $('#' + unique_id + '_title_row' + ' #freeroll-value-span').append(
                    '<img src="/images/black_coin_24px.png" />'); // black coin
            } else { // > 0.5 ETH
                $('#' + unique_id + '_title_row' + ' #freeroll-value-span').append(
                    '<img src="/images/coin_gold_24px.png" />'); // gold coin
            }

            // #charity-span
            jQuery('<span/>', {
                id: 'charity-span',
                class: 'icon'
            }).appendTo('#' + unique_id + '_title_row');
            if (logs_to_display_now[i][0].args['_charity']) { // charity (bool)
                $('#' + unique_id + '_title_row' + ' #charity-span').append( // Dark image
                    '<img id="moneybag-img" src="/images/charityhand_dark_24px.png" />');
            } else { // no charity (bool)
                $('#' + unique_id + '_title_row' + ' #charity-span').append( // Light image
                    '<img id="moneybag-img" src="/images/charityhand_light_24px.png" />');
            }

            // #category-span
            jQuery('<span/>', {
                id: 'category-span',
                class: 'icon'
            }).appendTo('#' + unique_id + '_title_row');
            if (logs_to_display_now[i][0].args['_category'] == 0) { // Health
                $('#' + unique_id + '_title_row' + ' #category-span').append(
                    '<img id="moneybag-img" src="/images/runner_24px.png" />');
            }

            else if (logs_to_display_now[i][0].args['_category'] == 1) { // Skill
                $('#' + unique_id + '_title_row' + ' #category-span').append(
                    '<img id="moneybag-img" src="/images/music_24px.png" />');
            }

            else if (logs_to_display_now[i][0].args['_category'] == 2) { // School/work
                $('#' + unique_id + '_title_row' + ' #category-span').append(
                    '<img id="moneybag-img" src="/images/book24px.png" />');
            }

            else if (logs_to_display_now[i][0].args['_category'] == 3) { // Other
                $('#' + unique_id + '_title_row' + ' #category-span').append(
                    '<img id="moneybag-img" src="/images/new_24px.png" />');
            }

            logs_displayed += 1; // Increment number_shown

        } else { // Increment queue
            queue += 1;
        }
    } // End _display_array loop

    errorsAndMessages(logs_to_display_now.length); // Call errors and messages passing length

}

// *** Continue or cuts queryBlockchainLogs loop
// Hides and Displays search messages
function errorsAndMessages(_length_just_displayed) {

    if (done_search_switch) {

        $('#searching-blockchain').hide(); // Hide searching
        // Note #spinner is on by default on page load

        if (queue > 0) { // Show loadmore button
            $('#loadmore-button-container').show();
        }
        else if (logs_displayed == null || logs_displayed == 0) { // Show no results
            $('#loadmore-button-container').hide(); // Hide show more
            $('.no-search-results-category').show(); // Show no results
        }
        else {
                $('#loadmore-button-container').hide(); // Hide show more
                $('#no-more-results-category').show(); // Show no more results
            }
    } // End of query_done

    else {
        queryBlockchainLogs();
    }
}


// User requests to load more logs
function loadmoreButton() {
        num_logs_to_display += 4; // increment logs_to_display
        queue = 0; // clear queue
        determineFilter(); // run displayLogs()
}


// Modals **********************************************************************************************************************

// Freeroll Detail Modal .........................................................
function fireUponDetailsClick(_this) { // Need this to know what freeroll was clicked

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
                            $(".details-address-container").attr('id', modal_args['_freeroll_addr']); // Address as id for buttons
                            $("#details-sub-header").attr('href', ('https://etherscan.io/address/' + modal_args['_freeroll_addr'])); // Address etherscan
                            $("#details-sub-header").attr('target', '_blank'); // In new tab
                            $("#modal-poster").text(modal_args['_poster']); // Add poster address
                            $("#modal-poster").attr('id', modal_args['_poster']); // Add poster address
                            $("#modal-poster").attr('href', ('https://etherscan.io/address/' + modal_args['_poster'])); // Poster etherscan
                            $("#modal-poster").attr('target', '_blank'); // In new tab

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
                            $("#modal-receiver").attr('href', ('https://etherscan.io/address/' + receiver)); // Receiver etherscan
                            $("#modal-receiver").attr('target', '_blank'); // In new tab

                            if (modal_args['_location'] == "") {
                                $('#modal-location-avail').text('Poster has chosen not to verify results.')
                            }
                            else {
                                $('#modal-location-avail').text('The poster agrees to verify this accomplish at:');
                                $("#modal-location").text(' ' + modal_args['_location']); // Add location text
                                $("#modal-location").attr('href', ('https://' + modal_args['_location'])); // Location href
                                $("#modal-location").attr('target', '_blank'); // In new tab
                            }

                            $("#modal-trust").text('Honor');




                            // Logic for status of contract
                            if (((modal_args['_duration'].toNumber() + modal_event[1]) * 1000) <  Date.now()) { // expired
                                if (web3.fromWei(balance, 'ether') == 0) { // Paid out winner (100%)
                                    $("#modal-deadline").text(' Passed');
                                    $("#modal-outcome").text(' Victory Claimed');
                                    $("#modal-remaining-balance").text(' ' + Math.trunc(web3.fromWei(balance, 'ether'), 3));
                                    $("#claim-victory").hide();
                                    $("#payout").hide();
                                    $("#claim-victory-grey").show();
                                    $("#payout-grey").show();


                                }
                                else if (balance == 1) { // Paid out receiver (all but 1 wei)
                                    $("#modal-deadline").text(' Passed');
                                    $("#modal-outcome").text(' Unsuccessful');
                                    $("#modal-remaining-balance").text(' ' + Math.trunc(web3.fromWei(balance, 'ether'), 3));
                                    $("#claim-victory").hide();
                                    $("#payout").hide();
                                    $("#claim-victory-grey").show();
                                    $("#payout-grey").show();

                                }
                                else {
                                    $("#modal-deadline").text(' Passed');
                                    $("#modal-outcome").text(' Unsucessful');
                                    // console.log(web3.fromWei(balance, 'ether').toNumber());
                                    $("#modal-remaining-balance").text(' ' + web3.fromWei(balance, 'ether').toNumber().toFixed(2));
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
                                    $("#modal-remaining-balance").text(' ' + Math.trunc(web3.fromWei(balance, 'ether'), 3));
                                    $("#claim-victory").hide();
                                    $("#payout").hide();
                                    $("#claim-victory-grey").show();
                                    $("#payout-grey").show();

                                }

                                else {
                                    $("#modal-deadline").text(' Active'); // Ongoing
                                    $("#modal-outcome").text(' TBD');
                                    $("#modal-remaining-balance").text(' ' + 'NA');
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

                            $("#details-load-message").hide();
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


// *** Button in Details modal to payout freeroll after loss
function payoutFreeroll() {
    var vic_freeroll_addr = $(".details-address-container").attr('id'); // get address
    var freerollInstance = freerollABI.at(vic_freeroll_addr); // Create web3 object
    var payout_data = freerollInstance.posterLost.getData(); // Get data for transaction
    web3.eth.sendTransaction({ // Send transaction
        from: web3.eth.defaultAccount,
        to: freerollInstance.address,
        gas: 40000,
        data: payout_data}, function(err, txHash) {

            if (!err) {
                console.log(txHash);
            }
            else {
                console.error(err);
            }
        }
    );
}


// *** Button in Details modal to refund poster / winner before deadline
function claimVictory() {
    var vic_freeroll_addr = $(".details-address-container").attr('id'); // get address
    var freerollInstance = freerollABI.at(vic_freeroll_addr); // Create web3 object
    var payout_data = freerollInstance.posterWon.getData(); // Get data for transaction
    web3.eth.sendTransaction({ // Send transaction
        from: web3.eth.defaultAccount,
        to: freerollInstance.address,
        gas: 40000,
        data: payout_data}, function(err, txHash) {

            if (!err) {
                console.log(txHash);
            }
            else {
                console.error(err);
            }
        }
    );
}



// *** Review before posting Modal ...................................................
function fireUponReviewClick() {

    // Note bad use of fetch (lack of understanding of promises)
    // ... could not get 'timing' right (some things were called before
    // ... relevant varible were populated)

    // Order of operations:
    inputsFilled();
    // checkFormats();
    // populateModal()
    // getEthPrice();
    // getGasInfo();
    // populateEstimates();
}


// *** Checks to see user has filled in all required inputs.
// Calls (checkFormats())
function inputsFilled() {

    // Make sure all inputs are filled
    if (($("#user-description").val() == "") ||
    ($("#user-receiver").val() == "") ||
    ($("#user-amount").val() == "") ||
    ($("#user-duration").val() == "") ||
    ($("#user-category").val() == "")) {
        // error

        alert('You missed required field(s)');
        return
    }
    else {
        checkFormats();
    }
}


// *** Checks the format of user inputs and stores them globally
// Calls populateModal()
function checkFormats() {
    // Descrition (string and less than 140)
    if (typeof($("#user-description").val()) === 'string' & $("#user-description").val().length <= 140) {
        web3_description = $("#user-description").val();
    }
    else {
        alert('Your description is too long (over 140) or is not a string');
        return
    }

    // Receiver (is valid address)
    if ($("#user-receiver").val() == '3') {
        if (web3.isAddress($("#user-input-receiver").val()) == true) {
            web3_receiver = $("#user-receiver").val();
            web3_charity_bool = false;
        }
        else {
            alert('You have entered an invalid ethereum address for Freeroll Receiver');
            return
        }
    }
    else {
        if (web3.isAddress(charity_list[parseInt($("#user-receiver").val())]) == true) {
            web3_receiver = charity_list[parseInt($("#user-receiver").val())];
            web3_charity_bool = true;
        }
        else {
            alert('The ethereum address for the Freeroll Receiver is invalid');
            return
        }
    }

    // Amount (is number without decimal)
    console.log($("#user-amount-eth").val());
    try {
        if (web3.toWei($("#user-amount-eth").val(), 'ether') % 1 == 0) {
            web3_amount_wei = web3.toWei($("#user-amount-eth").val(), 'ether');
        }
        else {
            alert('Invalid ETH amount');
            return
        }
    }
    catch (e) {
        alert('Invalid ETH amount');
        return
    }

    // Duration (is number without decimal)
    console.log($("#user-duration").val());
    var user_duration_num = parseFloat($("#user-duration").val());
    console.log((user_duration_num * 60 * 60 * 24));
    if ((user_duration_num * 60 * 60 * 24) >= 1) {
        web3_duration_sec = Math.trunc(user_duration_num * 60 * 60 * 24);
        console.log(web3_duration_sec);
    }
    else {
        alert('Invalid duration');
        return
    }

    // Results location (begining)
    console.log($("#user-location").val());
    // check the result string format
    if ($("#user-location").val() == "") {
        web3_location = "";
    } else if ($("#user-location").val().startsWith('www.')) {
        web3_location = $("#user-location").val().slice(4);
    } else if ($("#user-location").val().startsWith('https://')) {
        web3_location = $("#user-location").val().slice(8);
    } else if ($("#user-location").val().startsWith('http://')) {
        web3_location = $("#user-location").val().slice(7);
    } else {
        alert("Your result's location must start with www., http://, or https://");
        return;
    }


    web3_category = parseInt($("#user-category").val());

    populateModal();
}


// *** Appends the users inputs to the modal html
// Calls getEthPrice()
function populateModal() {

    $("#post-container").slideToggle("slow"); // Close post dropdown

    // Poster address
    $("#review-poster").text(web3.eth.defaultAccount); // Add poster address
    $("#review-poster").attr('href', ('https://etherscan.io/address/' + web3.eth.defaultAccount)); // Poster etherscan
    $("#review-poster").attr('target', '_blank'); // In new tab

    // Freeroll description
    console.log(web3_description);
    $("#review-description").text(web3_description); // Add description

    // Duration
    var delta = web3_duration_sec; // get total seconds between the times
    var days = Math.floor(delta / 86400); // calculate whole days
    delta -= days * 86400; // subtract
    var hours = Math.floor(delta / 3600) % 24; // calculate whole hours
    delta -= hours * 3600; // subtract
    var minutes = Math.floor(delta / 60) % 60; // calculate whole minutes
    delta -= minutes * 60; // subtract
    var seconds = delta % 60;  // // what's left is seconds
    $("#review-duration").text(days + ' Days, ' + hours + ' Hours, ' + minutes + ' Minutes '); // Add duration

    // Amount
    $("#review-amount").text(web3.fromWei(web3_amount_wei, 'ether') + ' ETH'); // Add amount

    // Receiver
    $("#review-receiver").text(web3_receiver); // Add receiver
    $("#review-receiver").attr('href', ("https://etherscan.io/address/" + web3_receiver)); // Add etherscan
    $("#review-receiver").attr('target', '_blank'); // In new tab

    // Location
    if ($("#user-location").val() == "") {
        $("#review-location-mess").text("You DO NOT intend to verify your results");
    }
    else {
        $("#review-location-mess").text("You agree to verifiy your results at:");
        $("#review-location").text(" " + web3_location);
    }

    // Trust system
    $("#review-trust").text("Honor");

    // Show modal body
    $("#review-body-data").show();

    // Show the modal
    $("#review-modal").show();

    getEthPrice()
}


// *** API call to etherscan to get ethereum price
// Stores globally and calls getGasInfo
function getEthPrice() {
    // Ethereum price
    fetch('https://api.etherscan.io/api?module=stats&action=ethprice&apikey=9NFYURHUKFZ46AIXCEKQRBYR727C5KFIW5')
    .then((resp) => resp.json())  // Turn into json data
    .then(function(data) { //
        ethPrice = data.result.ethusd;
        console.log('here in price api');
        getGasInfo();

    })
    .catch(function(error){
        console.log(error);
    });
}


// *** API call to ethgasstation to get gas prices and times
// Stores globally and calls populate estimates
function getGasInfo() {
    // Gas prices
    fetch(proxy_url + 'https://ethgasstation.info/json/ethgasAPI.json')
    .then((resp) => resp.json())  // Turn into json data
    .then(function(data){
        gasInfo = data;
        populateEstimates();
    })
    .catch(function(error){
        console.log(error);
    });
}


// *** Appends the APIs to the modal
// End of review modal sequence
function populateEstimates() {

    var user_gas_choice = $("#gas-price").find(':selected').val(); // Get user gas choice
    var deploy_gas = 307000;
    var claim_gas = 48200;

    // Display costs and times based upon his choice and blockchain data
    if (user_gas_choice == 'standard') {

        // Set estimated deadline
        var est_review_deadline = new Date((gasInfo.avgWait * gasInfo.block_time * 1000) + (web3_duration_sec * 1000) + Date.now());
        $("#modal-est-deadline").text(est_review_deadline.toDateString() + ' at ' + est_review_deadline.toLocaleTimeString());

        // Set estimated deploy cost
        var freeroll_deploy_estimate = deploy_gas * (gasInfo.average / 10) * 0.000000001 * ethPrice;
        $("#modal-deploy-cost").text(freeroll_deploy_estimate.toFixed(2) + ' usd');

        // Set estimated victory cost
        var freeroll_call_estimate = claim_gas * (gasInfo.average / 10) * 0.000000001 * ethPrice;
        $("#modal-claim-cost").text(freeroll_call_estimate.toFixed(2) + ' usd');
    }

    else if (user_gas_choice == 'low') {

        // Set estimated deadline
        var est_review_deadline = new Date((gasInfo.safeLowWait * gasInfo.block_time * 1000) + (web3_duration_sec * 1000) + Date.now());
        $("#modal-est-deadline").text(est_review_deadline.toDateString() + ' at ' + est_review_deadline.toLocaleTimeString());

        // Set estimated deploy cost
        var freeroll_deploy_estimate = deploy_gas * (gasInfo.safeLow / 10) * 0.000000001 * ethPrice;
        $("#modal-deploy-cost").text(freeroll_deploy_estimate.toFixed(2) + ' usd');

        // Set estimated victory cost
        var freeroll_call_estimate = claim_gas * (gasInfo.safeLow / 10) * 0.000000001 * ethPrice;
        $("#modal-claim-cost").text(freeroll_call_estimate.toFixed(2) + ' usd');
    }

    else if (user_gas_choice == 'fast') {

        // Set estimated deadline
        var est_review_deadline = new Date((gasInfo.fastWait * gasInfo.block_time * 1000) + (web3_duration_sec * 1000) + Date.now());
        $("#modal-est-deadline").text(est_review_deadline.toDateString() + ' at ' + est_review_deadline.toLocaleTimeString());

        // Set estimated deploy cost
        var freeroll_deploy_estimate = deploy_gas * (gasInfo.fast / 10) * 0.000000001 * ethPrice;
        $("#modal-deploy-cost").text(freeroll_deploy_estimate.toFixed(2) + ' usd');

        // Set estimated victory cost
        var freeroll_call_estimate = claim_gas * (gasInfo.fast / 10) * 0.000000001 * ethPrice;
        $("#modal-claim-cost").text(freeroll_call_estimate.toFixed(2) + ' usd');
    }

    else {
        $("#modal-est-deadline").text('Select a gas price');
        $("#modal-deploy-cost").text('Select a gas price');
        $("#modal-claim-cost").text('Select a gas price');
    }

    $("#review-load-message").hide();
    $("#blockchain-review-information").show();
}


// *** Forms and submits the web3 transaction
// Returns message upon freeroll submit
// Clears post freeroll inputs
function submitFreeroll() {

    // Modal loading message show
    $("#submitting-load-message").show();

    // Hide review information container
    $("#blockchain-review-information").hide();

    // Gas price level
    if ($("#gas-price").find(':selected').val() == 'standard') {
        var web3_gas_price = (gasInfo.average / 10) * 1000000000;
    }
    else if ($("#gas-price").find(':selected').val() == 'low') {
        var web3_gas_price = (gasInfo.safeLow / 10) * 1000000000;
    }
    else if ($("#gas-price").find(':selected').val() == 'fast') {
        var web3_gas_price = (gasInfo.fast / 10) * 1000000000;
    }
    else {
        alert('Sorry something has gone wrong while submitting your transaction (gas prices)');
        return
    }

    console.log();

    // Transaction data
    var freeroll_tx_data = factoryInstance.newFreeroll.getData(
        web3_description,
        web3_receiver,
        web3_charity_bool,
        web3_category,
        web3_duration_sec,
        web3_location);

    // Disclaimer to user
    var user_confirmation = confirm('By confirming this message you understand:' + '\n' +
        '1 - Your freeroll contract is final. You cannot edit it.' + '\n' +
        '2 - freerollio is not responsible for anything. Use at your own risk.' + '\n' +
        'If you have any questions please feel free contact me.');
    // Submit transaction

    if (user_confirmation == true) {
        web3.eth.sendTransaction({
            from: web3.eth.defaultAccount,
            to: factoryInstance.address,
            value: web3_amount_wei,
            // Gas - Should set a limit
            gasPrice: web3_gas_price,
            data: freeroll_tx_data}, function(err, txHash) {

                if (!err) {
                    console.log(txHash);
                    $("#submitting-load-message").hide(); // Hide loading message
                    $("#txHash").attr('href', ('https://etherscan.io/tx/' + txHash));
                    $("#txHash-submitted-message").show(); // Show message with txHash and link and instructions

                    // Clears web3 variables
                    web3_description = null;
                    web3_receiver = null;
                    web3_charity_bool = null;
                    web3_amount_wei = null;
                    web3_duration_sec = null;
                    web3_location = null;
                    web3_category = null;

                    // Clear post dropdown inputs
                    $("#user-description").val("");
                    $("#user-receiver").val("");
                    $("#user-amount-eth").val("");
                    $("#user-duration").val("");
                    $("#user-location").val("");
                    $("#user-description").val("");
                    $("#user-category").val("");


                }
                else {
                    console.error(err);
                    $("#submitting-load-message").hide(); // Hide loading message
                    $("#txHash-rejected-message").show();
                    // Hide loading message
                    // Show message with error
                }

            }
        );
    }
    else {
        closeModal();
    }
}



// *** Button click and mics functions ****************************************************************************************************************

// Watch for esc to close modal
$(document).keydown(function(event) {
      if (event.keyCode == 27) {
        closeModal();
      }
});


// Close BOTH modals (clears the html texts)
function closeModal() {
    $(".modal").css('display', 'none'); // Close modal

    // Details Modal
    $("#details-load-message").show(); // Show load message
    $("#details-body-data").hide(); // Hide body
    $("#details-sub-header").hide(); // Hide subheader
    $("#details-sub-header").text(""); // Address in title
    $(".details-address-container").attr('id', ""); // Address as id for buttons
    $("#details-sub-header").attr('href', ""); // Address etherscan
    $("#modal-poster").text("");
    $("#modal-dateposted").text("");
    $("#modal-description").text("");
    $("#modal-duration").text("");
    $("#modal-expiration").text("");
    $("#modal-value").text("");
    $("#modal-receiver").text("");
    $("#modal-location-avail").text("");
    $("#modal-location").text("");
    $("#modal-deadline").text("");
    $("#modal-outcome").text("");
    $("#modal-remaining-balance").text("");

    // Review Modal
    $("#review-load-message").show(); // Show review load message
    $("#submitting-load-message").hide();
}


// Open and close the nav menu
function navButton() {
    if ($(".hamburger").is(':visible')) {
        $(".nav-menu").slideToggle( "slow", function() {
            $( ".hamburger" ).hide();
            $( ".cross" ).show();
        });
    }
    else {
        $( ".nav-menu" ).slideToggle( "slow", function() {
            $( ".cross" ).hide();
            $( ".hamburger" ).show();
        });
    }
}
