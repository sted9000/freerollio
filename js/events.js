// logic for getting events

// ***vars***
var incial_start_block = // current block
var current_start_block = // not sure we will need this one
var events_data = {
    'raw_data': [],
    'filtered_data': [],
    'filtered_data_passed_to_query': null
}
var query_data = {

}
events_filtered_count
queue_to_be_displayed
results_displayed
how_many_results_to_display

// ***constants***
const deployment_block = // Block of deploying factory


***functs***


uponLoading()
	.show searching
	read / handle hash
	getEvents()

changeSubCat()

	.show searching

	clear no results

	clear load-more

	clear displayed results

	clear results displayed

	clear queue

	clear events_filtered_count

	call determineFilter() // Remember now we might have events already retreived

loadMore()
	increment how_many_res...

	if queue > 0
		displayData(queue_to_be_dis)

	else
		.hide loadmore
		.show searching
		increment start and end block
		getEvents

getEvents(start_block, end_block)
	if community
		Search Latest X blocks(callback({
			If > 0

				results.push(events_data['raw_data'])

				determineFilter()

			Else
				Increments search area

				if end_block < deploy_block*
					.hide load-more-button
					if no results displayed {.show no results in this cat}
					else {.show all results for this category shown}
				else
					Call getEvents()

determineFilter()
	determine the filter
	call filterItems()

filterItems()
	temp []
	for i in events_received_data[indexed from events_filtered_count:end]
		events_filtered_count +1
		if match
			push to temp []

    queryFreerolls(temp)

queryFreerolls(temp) {

}

displayData(_temp [])


	for i in temp []

		if shown < to_be_displayed

			display
			incremented displayed

		else
			push to queue (in reverse order)

	if shown < to_be displayed

		increment search block

		if not below deployment_block

			getEvents

		else

			.hide searching

			.hide load-more-button

			if results_displayed > 0 {.show no more freerolls in this category}
			else {.show all results for this category shown}

	else // shown == to_be_displayed

		.hide searching

		display load-more-button
