// *** Variables ***
var blocks_per_search = 5000; // search area
var done_search_switch = false; // flips when startblock has been reached
var start_block = 4428946; // block of factory deployment
var end_block = null; // block to search until
var num_logs_to_display = 7; // defauls of displayed logs
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
    $('.loadmore-button').hide(); // Hide show more
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

    var filtered_logs = [];

    // loop dataLogs
    for (var i=0; i<logs_array_all.length; i++) {
        // loop filters
        for (var j=0; j<_filter_array.length; j++) {
            // if not match any filter {push}

            if (_filter_array[j] == "filter-active") {
                var d = new Date(); // Create Date object
                var current_time_secs = Math.trunc(d / 1000); // Turn to secs with decimals
                if ((logs_array_all[i][1] + logs_array_all[i][0].args['_duration'].toNumber()) <= current_time_secs) {
                    if (j < (_filter_array.length - 1)) {continue;}
                    else {filtered_logs.push(logs_array_all[i]);}
                } else {break;}
            }


            else if (_filter_array[j] == "filter-expired") {
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
                onClick: 'fireUponModalClick(this)'
            }).appendTo('#query-results');

            // .tooltiptext
            $('#' + unique_id).append(
                '<div class="tooltiptext">Click to view details</div>');

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
            // var formattedDate = (ending_date.getUTCMonth() + 1) + '/' + ending_date.getUTCDate() + '/' + ending_date.getUTCFullYear();
            // var formattedTime = ending_date.getUTCHours() + ':' + (ending_date.getUTCMinutes()<10?'0':'') + ending_date.getUTCMinutes() + ' UTC';

            // .icons *******************************
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
                    '<img src="../images/gold_coin_24px.png" />'); // gold coin
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
                    '<img id="moneybag-img" src="../images/book24px.png" />');
            }

            else if (logs_to_display_now[i][0].args['_category'] == 1) { // Skill
                $('#' + unique_id + '_title_row' + ' #category-span').append(
                    '<img id="moneybag-img" src="../images/book24px.png" />');
            }

            else if (logs_to_display_now[i][0].args['_category'] == 2) { // School/work
                $('#' + unique_id + '_title_row' + ' #category-span').append(
                    '<img id="moneybag-img" src="../images/book24px.png" />');
            }

            else if (logs_to_display_now[i][0].args['_category'] == 3) { // Other
                $('#' + unique_id + '_title_row' + ' #category-span').append(
                    '<img id="moneybag-img" src="../images/book24px.png" />');
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

        $('#spinningID').hide(); // Hide searching


        if (queue > 0) { // Show loadmore button
            $('.loadmore-button').show();
        } else { // Show no results
            if (logs_displayed == null || logs_displayed == 0) {
                $('.no-search-results-category').show(); // Show no results
            } else {
                $('.loadmore-button').hide(); // Hide show more
                $('.no-more-results-category').show(); // Show no more results
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
} // End of errorsAndMessages()

/* Modal ***********************************************************************/

function fireUponModalClick(_this) {
    // Fire modal (with search message as default)

    // Open the modal
    $(".modal").css('display', 'block');

    // Get corresponding freeroll
    var modal_transactionHash = '';
    for (var i=0; i<logs_array_all.length; i++) {
        if ($(_this).attr('id').substring(0,9) == logs_array_all[i][0].transactionHash.substring(0,9)) {
            modal_transactionHash = logs_array_all[i][0].transactionHash;
        }
    }

    // Append Modal header
    $('.transHash-container a').text(modal_transactionHash);
    console.log(modal_transactionHash);
    web3.eth.getTransaction(modal_transactionHash, function(err,res) {
        if (!err) {
            console.log(res.to);
        }
    })
    // Get all information from the freeroll contract (callback hell)


    // Display

}



function closeModal() {
    $(".modal").css('display', 'none');
}




    // Populate variables for specific freeroll modal

    // Hide search message

    // Display module
        // HTML Content:
        //     - Transaction hash (or freeroll contract address?) with link in the title
        //     - Contarct address, Poster address, Date posted, Description, Category, Expiration, Receiver address,
        //         Results location, method of trust
        //     - Status of contract (active, expired and uncalled, expired and called, victorious)
        //     - Payout and Claim Victory Buttons
        //



// function myFunction(_this) {
//
//     // Open the modal
//     $(".single-result-container").click(function(){
//         console.log(this);
//         $(".modal").css('display', 'block');
//     });
//
//     // When the user clicks on <span> (x), close the modal
//     $('.modal span').click(function() {
//         $(".modal").css('display', 'none');
//     });
// }
