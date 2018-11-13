// Variables -------------------------------------------------------------------
var num_of_freerolls = null; // Length of array in factory
var query_data = []; // Storing data_retreived from blockchain
var currently_displayed = null; // How many search results are displayed
var max_display = 5; // Maximum search results to display
var query_done = null; // Is blockchain search done (binary)
var stop_loop = null; // Signal to stop blockchain query loop (user changed search)
var queue = null;

const charity_list = ['0x730639f45726b4b847667f74abfe01e9a2ac6568']; // List of charities

// Functions -------------------------------------------------------------------

// Fires upon page loading (and no web3 errors)
// Functions:
// - Changes selected class based upon url hash
// - Then continues data processing
function newSearch() {

     if (window.location.hash == '#user-freerolls') { // If hash is user-freerolls change selected classes
         $('.main-nav a').each(function(){ // Loop through both main-nav
             if (this.className == 'selected') {$(this).removeClass('selected');} // Remove selected class from community-freerolls
             else {$(this).addClass('selected');} // Add selected class to user-freerolls
         });
     }

     // Console logging user search selections
     console.log("Users Search Selections" + "\n" + "Main Filter: " + $('.main-nav a.selected').attr('id') + "\n" + "Sub Filters: " + $('.sub-nav a.selected').attr('id'));

     // Continue data process
     if (query_done) { // No need to find length and start looping
         determineFilter(query_data); // Just pass all data into filter
     } else { // We need to search blockchain
         $('.scanning-freerolls-category').show(); // Diplay loading message
         getLength(); // Start loop process by getting length of factory array
     }
}

// Fires upon user changing sub-nav search
// Functions:
// - Clears search display resets varibles
// - Sets stop-loop true if query_done is false
function changeSearch() {

    $('.single-result-container').remove(); // Clear display
    currently_displayed = 0; // Clear display
    max_display = 5; // Add max
    queue = 0; // Clear queue
    $('.loadmore-button').hide(); // Hide show more
    $('.no-search-results-category').hide(); // Hide no results
    $('.no-more-results-category').hide(); // Hide no more results


    if (query_done) {newSearch();} // If query done filter and display
    else {stop_loop = true;} // Else kill the loop filter, display and restart loop
}

// Call factory to get length of array to query
// Functions:
// - Two different calls depending on the main-nav selected
// - Starts the dataQuery loop at the back of the index
function getLength() {

    // Community freerolls
    if ($('.main-nav a.selected').attr('id') == 'community-freerolls') {

        factoryInstance.lenCommunityFreerolls(function(err, numContracts){ // web3 call
            if(!err) { // Callback functionality
                num_of_freerolls = numContracts.toNumber(); // Store number to global varible
                console.log($('.main-nav a.selected').attr('id') + ' has: ' + numContracts.toNumber() + ' freerolls.'); // Console log
                // FUTURE *** Insert error message if length is 0 (not sure if return is 0 or undefined)
                dataQuery(numContracts.toNumber() - 1); // Start data query loop
            } else // If error
                console.error(err); // Log it
        });

    // Users freerolls
    } else {

        factoryInstance.lenUserFreerolls(web3.eth.accounts[0], function(err, numContracts){ // web3 call
            if(!err) { // Callback functionality
                num_of_freerolls = numContracts.toNumber(); // Store number to global varible
                console.log($('.main-nav a.selected').attr('id') + ' has: ' + numContracts.toNumber() + ' freerolls.'); // Console log
                // FUTURE *** Insert error message if length is 0 (not sure if return is 0 or undefined)
                dataQuery(numContracts.toNumber() - 1); // Start data query loop
            } else // If error
                console.error(err); // Log it
        });
    }
} // End getLength()

// Query the blockchain to retreive and store freerolls data
// Functions:
// - Series of nested callbacks to web3 freeroll
// - Pushes information to query_data as an object
// - Sets query_done to true if true
// - Starts filter with gathered data as argument
function dataQuery(_index) {

    if (_index < 0) {return} // Only run if index > 0

    // communtity-freeroll query
    if ($('.main-nav a.selected').attr('id') == 'community-freerolls') {
        factoryInstance.communityFreerolls(_index, function(err, freerollAddr) { // web3 call to factory
            if(!err) { // Callback
                freerollInstance = freerollABI.at(freerollAddr); // Create web3 freeroll object
                freerollInstance.poster.call(function(err, posterAddr) { // Get poster
                    if(!err) { // Callback
                        freerollInstance.descr.call(function(err, freerollDescription) { // Get descr
                            if(!err) { // Callback
                                freerollInstance.first_receiver.call(function(err, firstReceiver) { // Get first_receiver
                                    if(!err) { // Callback
                                        freerollInstance.second_receiver.call(function(err, secondReceiver) { // Get second_receiver
                                            if(!err) { // Callback
                                                freerollInstance.end_date.call(function(err, endDate) { // Get end_date
                                                    if(!err) { // Callback
                                                        web3.eth.getBalance(freerollAddr, function(err, balance) { // Get balance
                                                            if(!err) { // Callback

                                                                var temp_object = { // Create object to store information in 'vals'
                                                                    'free_addr': freerollAddr,
                                                                    'poster_addr': posterAddr,
                                                                    'freeroll_descr': freerollDescription,
                                                                    'first_receiver': firstReceiver,
                                                                    'second_receiver': secondReceiver,
                                                                    'end_date': endDate.toNumber(),
                                                                    'balance': balance.toNumber()
                                                                };

                                                                query_data.push(temp_object) // Push the object to 'vals' array

                                                                console.log('Freeroll at index: ' + _index + ' has been collected.'); // Console.log position

                                                                if (query_data.length >= num_of_freerolls) { // Turn 'query_done true' if all freerolls have been gotten
                                                                    query_done = true;
                                                                    console.log('All ' + num_of_freerolls + ' freerolls in: ' + $('.main-nav a.selected').attr('id') + ' collected.');
                                                                }

                                                                determineFilter([temp_object]) // Run through filter (and callback displayData(arrayToBeDisplayed))

                                                            } else
                                                                console.error(err);
                                                        }); // End getBalance
                                                    } else
                                                        console.error(err);
                                                }); // End endDate
                                            } else
                                                console.error(err);
                                        }); // End secondReceiver
                                    } else
                                        console.error(err);
                                }); // End firstReceiver
                            } else
                                console.error(err);
                        }); // End freerollDescription
                    } else
                        console.error(err);
                }); // End posterAddr
            } else
                console.error(err);
        }); // End freerollAddr

    // users-freerolls query
    } else {

        factoryInstance.userFreerolls(web3.eth.accounts[0], _index, function(err, freerollAddr) {
            if(!err) { // Callback
                freerollInstance = freerollABI.at(freerollAddr); // Create web3 freeroll object
                freerollInstance.poster.call(function(err, posterAddr) { // Get poster
                    if(!err) { // Callback
                        freerollInstance.descr.call(function(err, freerollDescription) { // Get descr
                            if(!err) { // Callback
                                freerollInstance.first_receiver.call(function(err, firstReceiver) { // Get first_receiver
                                    if(!err) { // Callback
                                        freerollInstance.second_receiver.call(function(err, secondReceiver) { // Get second_receiver
                                            if(!err) { // Callback
                                                freerollInstance.end_date.call(function(err, endDate) { // Get end_date
                                                    if(!err) { // Callback
                                                        web3.eth.getBalance(freerollAddr, function(err, balance) { // Get balance
                                                            if(!err) { // Callback

                                                                var temp_object = { // Create object to store information in 'vals'
                                                                    'free_addr': freerollAddr,
                                                                    'poster_addr': posterAddr,
                                                                    'freeroll_descr': freerollDescription,
                                                                    'first_receiver': firstReceiver,
                                                                    'second_receiver': secondReceiver,
                                                                    'end_date': endDate.toNumber(),
                                                                    'balance': balance.toNumber()
                                                                };

                                                                query_data.push(temp_object) // Push the object to 'vals' array

                                                                console.log('Freeroll at index: ' + _index + ' has been collected.'); // Console.log position

                                                                if (query_data.length >= num_of_freerolls) { // Turn 'query_done true' if all freerolls have been gotten
                                                                    query_done = true;
                                                                    console.log('All ' + num_of_freerolls + ' freerolls in: ' + $('.main-nav a.selected').attr('id') + ' collected.');
                                                                }

                                                                determineFilter([temp_object]) // Run through filter (and callback displayData(arrayToBeDisplayed))

                                                            } else
                                                                console.error(err);
                                                        }); // End getBalance
                                                    } else
                                                        console.error(err);
                                                }); // End endDate
                                            } else
                                                console.error(err);
                                        }); // End secondReceiver
                                    } else
                                        console.error(err);
                                }); // End firstReceiver
                            } else
                                console.error(err);
                        }); // End freerollDescription
                    } else
                        console.error(err);
                }); // End posterAddr
            } else
                console.error(err);
        }); // End freerollAddr
    } // End user-freerolls
} // End dataQuery()






// *** Filters ------------------------------------------------------------------
// Functionality: passing the filtered data to displayData()

// Determine the filter type based on user search
// Functions:
// - A switch calling the correct filter and passing the raw query data
function determineFilter(_array_to_filter) {

    switch ($('.sub-nav a.selected').attr('id')) {
        case 'latest':
            displayData(_array_to_filter); // No filtering here (just for readability)
            break;

        case 'completed':
            completedFilter(_array_to_filter);
            break;

        case 'charity':
            charityFilter(_array_to_filter);
            break;

        case 'evil-cause':
            evilCauseFilter(_array_to_filter);
            break;
    }
} // End determineFilter()

// Completed Filter (end_date < now )
function completedFilter(raw_data_array) {

    var tempArray = [];
    var d = new Date(); // Create Date object
    var current_time_secs = Math.trunc(d / 1000); // Turn to secs with decimals
    for (var i=0; i < raw_data_array.length; i++) { // Loop through 'vals'
        if (current_time_secs >= raw_data_array[i].end_date) { // if (after now)
            tempArray.push(raw_data_array[i]); // push to temp
        }
    }

    displayData(tempArray) // Pass all passing items to displayData()
} // End completedFilter


// Charity Filter (a receiver is in our charity list)
function charityFilter(raw_data_array) {

    var tempArray = [];
    displayData(tempArray) // Pass all passing items to displayData()
} // End charityFilter

// Evil Causes Function (a receiver is in our evil causes list)
function evilCauseFilter(raw_data_array) {

    var tempArray = [];
    displayData(tempArray)
} // End evilCauseFilter


// *** Display data
// Functions:
// - Displays filtered_data
// - Increments currently_displayed
// - Calls displayMessages()
function displayData(_display_array) {

    // Loop through _display_array adding html elements and content
    // Note: Length will always be 1 in the case of blockchain not done and...
    // ... 'all' in case of blockchain search done
    for (var i=0; i < _display_array.length; i++) {

        // (If not over display 'max') {create and populate html elements}
        if (currently_displayed < max_display) {

            // Variables
            var receiver_one = _display_array[i].first_receiver;
            var receiver_two = _display_array[i].second_receiver;

            jQuery('<div/>', { // Create single-result-container div
                id: _display_array[i].free_addr, // Unique id
                class: 'single-result-container'
            }).appendTo('#query_results');

            jQuery('<div/>', { // Create search-result-inner div inside single-result-container
                id: _display_array[i].free_addr + '_inner_div',
                class: 'search-result-inner'
            }).appendTo("#" + _display_array[i].free_addr);


            jQuery('<div/>', { // Create search-result-title-row to hold descr and icons
                id: _display_array[i].free_addr + '_title_row',
                class: 'search-result-title-row'
            }).appendTo('#' + _display_array[i].free_addr + '_inner_div');

            jQuery('<span/>', { // Create result-title span
                id: 'descr-span',
                class: 'result-title'
            }).appendTo('#' + _display_array[i].free_addr + '_title_row');

            // Description
            if ((_display_array[i].freeroll_descr).length > 40) // If descr is long only show first 40 characters
                $('#' + _display_array[i].free_addr + ' #descr-span').text((_display_array[i].freeroll_descr).substring(0,40) + '...');

            else  // Else display whole descr
                $('#' + _display_array[i].free_addr + ' #descr-span').text(_display_array[i].freeroll_descr);

            $('#' + _display_array[i].free_addr + ' #descr-span').append('<div class="tooltiptext">Freeroll Description: ' + // Append tooltip
            _display_array[i].freeroll_descr + '</div>')

            // *** Icons with tooltips ***

            // Victory
            jQuery('<span/>', {
                id: 'victory-span',
                class: 'icon'
            }).appendTo('#' + _display_array[i].free_addr + '_title_row');

            // if > 2 wei (Show normal trophy with 'contract funded message')
            if (_display_array[i].balance > 2) {
                $('#' + _display_array[i].free_addr + '_title_row' + ' #victory-span').append('<img id="victory-img" src="../images/no_funding.png" />'); // Image


                // if 2 wei (Show poster lost image with 'poster admitted defeat message')
            } else if (_display_array[i].balance == 2) {
                $('#' + _display_array[i].free_addr + '_title_row' + ' #victory-span').append('<img id="victory-img" src="../images/loser.png" />'); // Image
                $('#' + _display_array[i].free_addr + '_title_row' + ' #victory-span').append('<div class="tooltiptext">The poster has admitted defeat and paid his debts.</div>'); // Tool tip

                // if 1 wei (Show victory image with 'poster was victorious message')
            } else if (_display_array[i].balance == 1) {
                $('#' + _display_array[i].free_addr + '_title_row' + ' #victory-span').append('<img id="victory-img" src="../images/poster_won.png" />'); // Image
                $('#' + _display_array[i].free_addr + '_title_row' + ' #victory-span').append('<div class="tooltiptext">The poster has declared victory!</div>'); // Tool tip

                // if 0 wei (Show Contract his not funded)
            } else {
                $('#' + _display_array[i].free_addr + '_title_row' + ' #victory-span').append('<img id="victory-img" src="../images/no_funding.png" />'); // Image
                $('#' + _display_array[i].free_addr + '_title_row' + ' #victory-span').append('<div class="tooltiptext">This freeroll is not funded.</div>'); // Tool tip
            }

            // Deadline
            jQuery('<span/>', {
                id: 'deadline-span',
                class: 'icon'
            }).appendTo('#' + _display_array[i].free_addr + '_title_row');

            var ending_date = new Date(_display_array[i].end_date * 1000);
            var formattedDate = (ending_date.getUTCMonth() + 1) + '/' + ending_date.getUTCDate() + '/' + ending_date.getUTCFullYear();
            var formattedTime = ending_date.getUTCHours() + ':' + (ending_date.getUTCMinutes()<10?'0':'') + ending_date.getUTCMinutes() + ' UTC';

            // if ongoing
            $('#' + _display_array[i].free_addr + '_title_row' + ' #deadline-span').append('<img id="victory-img" src="../images/deadline.png" />'); // Image
            $('#' + _display_array[i].free_addr + '_title_row' + ' #deadline-span').append('<div class="tooltiptext">Deadline: ' + ending_date + '</div>'); // Tool tip
            // else

            // Moneybag
            jQuery('<span/>', { // Create span with class icon
                id: 'moneybag-span',
                class: 'icon'
            }).appendTo('#' + _display_array[i].free_addr + '_title_row');

            $('#' + _display_array[i].free_addr + '_title_row' + ' #charity-span').append( // Append <img> to span
                '<img id="moneybag-img" src="../images/charity.png" />');

            $('#' + _display_array[i].free_addr + '_title_row' + ' #moneybag-span').append( // Append <img> to span
                '<img id="charity-img" src="../images/moneybag.png" />');

            $('#' + _display_array[i].free_addr + '_title_row' + ' #moneybag-span').append( // Append tooltip to span
                '<div class="tooltiptext">' + 'This user has decided NOT to gift his freeroll to a charity' + '</div>');




            //
            //             $('#' + _display_array[i].free_addr + '_title_row' + ' #moneybag-span').append( // Append <a> pointing to etherscan
            //                 '<a target="_blank"></a>');
            //
            //             var charity_href_string = 'https://ropsten.etherscan.io/address/' + '0x730639f45726b4b847667f74abfe01e9a2ac6568';
            //
            //             $('#' + _display_array[i].free_addr + '_title_row' + ' #moneybag-span a').attr("href", charity_href_string);
            //
            //             $('#' + _display_array[i].free_addr + '_title_row' + ' #moneybag-span a').append( // Append <img> to the <a>
            //                 '<img id="charity-img" src="../images/no_charity.png" />');
            //
            //             $('#' + _display_array[i].free_addr + '_title_row' + ' #moneybag-span').append( // Append tooltip to span
            //                 '<div class="tooltiptext">' + 'This user has decided to gift his freeroll to a charity.' + '\n' +
            //                 '\n' +
            //                 'Read the documentation for more information.' + '\n' +
            //                 '\n' +
            //                 'Click to view activity' + '</div>');
            // }}}







            // Reddit button
            jQuery('<span/>', {
                id: 'reddit-span',
                class: 'icon'
            }).appendTo('#' + _display_array[i].free_addr + '_title_row');

            $('#' + _display_array[i].free_addr + '_title_row' + ' #reddit-span').append( // Append <a> pointing to etherscan
                '<a href="http://www.reddit.com" target="_blank"></a>');

            $('#' + _display_array[i].free_addr + '_title_row' + ' #reddit-span a').append('<img id="theImg" src="../images/reddit.png" />');

            $('#' + _display_array[i].free_addr + '_title_row' + ' #reddit-span').append(
                '<div class="tooltiptext">' + 'Click to see if poster has created a reddit thread to document his quest' + '</div>');

            // Participants
            jQuery('<span/>', {
                id: 'participants-span',
                class: 'icon'
            }).appendTo('#' + _display_array[i].free_addr + '_title_row');

            $('#' + _display_array[i].free_addr + '_title_row' + ' #participants-span ').append( // Append <img>
                '<img id="participants-img" src="../images/participants.png" />');

            var poster_href = 'https://ropsten.etherscan.io/address/' + _display_array[i].poster_addr;
            var first_receiver_href = 'https://ropsten.etherscan.io/address/' + receiver_one;
            var second_receiver_href = 'https://ropsten.etherscan.io/address/' + receiver_two;

            // One receiver
            if (receiver_two == '0x0000000000000000000000000000000000000000') {
                $('#' + _display_array[i].free_addr + '_title_row' + ' #participants-span').append(
                    '<div class="tooltiptext">' + 'Poster: ' + '\n' +
                    '<a target="_blank" href=' + poster_href + '>' + _display_array[i].poster_addr + '</a>' + '\n' +
                    '\n' +
                    'Freeroll recipient: ' + '\n' +
                    '<a target="_blank" href=' + first_receiver_href + '>' + _display_array[i].first_receiver + '</a>' + '\n' +
                    '</div>');

                    // Two receivers
                } else {
                    $('#' + _display_array[i].free_addr + '_title_row' + ' #participants-span').append(
                        '<div class="tooltiptext">' + 'Poster: ' + '\n' +
                        '<a target="_blank" href=' + poster_href + '>' + _display_array[i].poster_addr + '</a>' + '\n' +
                        '\n' +
                        'Freeroll recipient one: ' + '\n' +
                        '<a target="_blank" href=' + first_receiver_href + '>' + _display_array[i].first_receiver + '</a>' + '\n' +
                        '\n' +
                        'Freeroll recipient two: ' + '\n' +
                        '<a target="_blank" href=' + second_receiver_href + '>' + _display_array[i].second_receiver + '</a>' + '\n' +
                        '</div>');
                    }

            for (var j=0; j<2; j++) { // Search for chairity match
                var temp_list = [receiver_one, receiver_two]
                for (var h=0; h<charity_list.length; h++) {
                    if (temp_list[j] == charity_list[h]) {
                        console.log('this is a chartiy');
                        $('#' + _display_array[i].free_addr + '_title_row' + ' #participants-span').prepend(
                            '<span><img id="hearts-img" src="../images/small_heart.png"></span>');





                    }
                }
            };




            // Create search-result-footer-row div inside search-result-inner
            jQuery('<div/>', {
                id: _display_array[i].free_addr + '_footer_div',
                class: 'search-result-footer-row'
            }).appendTo('#' + _display_array[i].free_addr + '_inner_div');





            // // Create footer-poster span
            // var now_date = Math.trunc(Date.now() / 1000);
            //
            // // if end_date has passe
            // if (now_date > _display_array[i].end_date) {
            //     var status_text = 'Expired';
            //
            // // ongoing
            // } else {
            //     var status_text = 'In progress';
            // }
            //
            // jQuery('<span/>', {
            //     class: 'footer-poster',
            // }).appendTo('#' + _display_array[i].free_addr + '_footer_div');
            // $('#' + _display_array[i].free_addr + ' .footer-poster').append( // Append <img>
            //     '<img id="charity-img" src="../images/hearts.png" />');

            // Create footer-amount span
            // poster won
            if (_display_array[i].balance == 2) {
                var balance_text = 'Failed';
            } else if (_display_array[i].balance == 1) {  // else if poster lost
                var balance_text = 'Victorious';
            } else {
                var balance_text = web3.fromWei(_display_array[i].balance, 'ether') + ' ETH';
            }
            // else
            jQuery('<span/>', {
                class: 'footer-amount',
                text: balance_text
            }).appendTo('#' + _display_array[i].free_addr + '_footer_div');

            // Increment number_shown
            currently_displayed += 1;

        } else {queue += 1;} // End currently_displayed < max_display

    } // End _display_array loop

    errorsAndMessages(_display_array.length); // Call errors and messages passing length

} // End displayData()


function errorsAndMessages(_length_just_displayed) {
    // Note #spinner is on by default on page load

    if (query_done) {

        $('#spinningID').hide(); // Hide searching


        if (queue > 0) { // Show loadmore button
            $('.loadmore-button').show();
        } else { // Show no results
            if (currently_displayed == null || currently_displayed == 0) {
                $('.no-search-results-category').show(); // Show no results
            } else {
                $('.loadmore-button').hide(); // Hide show more
                $('.no-more-results-category').show(); // Show no more results
            }
        }
    } // End of query_done


    // Stop Loop due to user changing sub-nav filter
    if (stop_loop) {
        $('.single-result-container').remove(); // Clear display
        currently_displayed = 0; // Clear 'number_shown'
        max_display = 5; // Set max display
        queue = 0; // Clear queue
        stop_loop = null; // Reset stop_loop
        determineFilter(query_data); // Pass data to filter
        return null // To stop the dataQuery loop
    }

    // Continue the loop incrementing towards begining
    if (query_done != true) {
        dataQuery(num_of_freerolls - query_data.length - 1);
    }
} // End of errorsAndMessages()


// Loadmore button functionality -----------------------------------------------
// Functionality: increments max_display
function loadmoreButton() {
        $('.single-result-container').remove(); // Clear display
        currently_displayed = 0; // Clear 'number_shown'
        max_display += 3; // Incement max_display
        queue = 0; // Clear queue
        determineFilter(query_data); // Run
} // End of loadmoreButton


// Metamask Errors -------------------------------------------------------------
function throwError_noPlugin() {
    $('body').addClass('error-no-metamask-plugin').addClass('error');
}

function throwError_noAccount() {
    $('body').addClass('error-no-metamask-accounts').addClass('error');
}

function throwError_invalidNetwork() {
    $('body').addClass('error-invalid-network').addClass('error');
}

// Testing functions -----------------------------------------------------------
