var catCheckDone = false;

$(document).ready(function() {
	top5();
	if(getQueryVariable('catNo'))
		checkStock(getQueryVariable('catNo'));
	$('#catNo').focus();
});

$(document).ajaxStart(function(){
    $('#loading').show();
 }).ajaxStop(function(){
    $('#loading').hide();
    if(catCheckDone == true) {
    	$("#divReleases").show();
    }
 });

function top5()
{
	$('.top').remove();
	$.ajax({
		url: 'https://highlycaffeinated.ca/top5',
		dataType: 'json',
		async: false,
        success: function (result) {
        	$.each(result, function(itemIndex, item) {
        		$('#top5').append('<a class="top" onclick=checkStock(\"' + item + '\")>' + item + '</a><br class="top"/>');
        	});
        },
        error: function (err, result) {
       		console.log(err);
       		console.log(result);
       }
	});
}

function checkStock(catNo)
{
	$("#divReleases").hide();

	var catNo = catNo.trim().toUpperCase();

	$('#catNo').val(catNo);
	
	var queryVar = getQueryVariable('catNo');
	var nolog = '';
	if (getQueryVariable('nolog'))
		nolog = getQueryVariable('nolog');
	else
		nolog = 'false';
	if(queryVar != catNo)
		if (history.pushState) {
    		var newurl = window.location.origin + window.location.pathname + '?catNo=' + catNo + ((nolog == 'true') ? '&nolog=' + nolog : '');
    		window.history.replaceState({path:newurl},'',newurl);
    	}

	clearTable();

	if(catNo.length == 0)
		$('#inputArea').append('<div id="error"><br/><br/><strong>Please enter catalogue number</strong></div>');
	else if($.isNumeric(catNo))
		$('#inputArea').append('<div id="error"><br/><br/><strong>Your catalogue number cannot only be digits (too broad)</strong></div>');
	else if(catNo.length < 4)
		$('#inputArea').append('<div id="error"><br/><br/><strong>Your catalogue number cannot shorter than 4 digits (too broad)</strong></div>');
	else {
		if($('#redeye').is(':checked'))
			checkRedeye(catNo);
		if($('#whitepeach').is(':checked'))
			checkWhitePeach(catNo);
		if($('#unearthed').is(':checked'))
			checkUnearthed(catNo);
		if($('#intense').is(':checked'))
			checkIntense(catNo);
		if($('#kudos').is(':checked'))
			checkKudos(catNo);
		if($('#deejay').is(':checked'))
			checkDeejay(catNo);
		if($('#boomkat').is(':checked'))
			checkBoomkat(catNo);
		if($('#triplevision').is(':checked'))
			checkTriplevision(catNo);
		if($('#rwdfwd').is(':checked'))
			checkRwdFwd(catNo);
		if($('#scotchbonnet').is(':checked'))
			checkScotchBonnet(catNo);
		if($('#juno').is(':checked'))
			checkJuno(catNo);
	}

	top5();

	catCheckDone = true;
}

function checkRedeye(catNo)
{
	$.ajax({
    	url: 'https://highlycaffeinated.ca/redeyesearch',
    	data: {catNo: catNo, nolog: getQueryVariable('nolog')},
        success: function (result) {
        	var found = false;
        	releases = $(result).find('.rel');
        	if(releases.length > 0)
        		if(releases.length > 5) {
        			found = true;
        			$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">RedEye</td><td data-label="Release"><a href="https://www.redeyerecords.co.uk/search/?keywords=' + catNo + '&searchType=CAT" target="_blank">Too Many Results (> 5)</a></td><td data-label="Image">-</td><td data-label="In Stock">-</td><td data-label="Price">-</td></tr>');
        		}
        		else {
		        	$.each(releases, function( itemIndex, item ) {
		        		var relCat = $(item).find('.relCat').text().trim();
		        		if(catNo == relCat) {
		        			found = true;
			        		var itemTitle = $(item).find('.relArtist').text() + ' - ' + $(item).find('.relTrack').text();
			        		var itemURL = $(item).find('.relInfo.relInfoMgn').find('a').attr('href');
			        		var itemImage = $(item).find('.relArt').attr('src');
			        		var itemStock = $(item).find("[id*='atb']").text();
			        		if(itemStock == 'Out Of Stock')
			        			itemStock = 'No';
			        		else {
			        			if($(item).find('.relInfoPreBtm').text().indexOf('Pre-order item') !== -1)
			        				itemStock = '<strong>Preorder</strong>';
			        			else
			        				itemStock = '<strong>Yes</strong>';
			        		}
			        		var itemPrice = '-';
			        		if(itemStock !== 'No')
			        			itemPrice = $(item).find('.relInfoPrice').text().replace('inc vat', 'incl. VAT').replace('(', ' (');

			        		$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">RedEye</td><td data-label="Release"><a href="' + itemURL + '" target="_blank">' + itemTitle + '</a></td><td data-label="Image"><img width="50" height="50" src="' + itemImage + '"/><td data-label="In Stock">' + itemStock + '</td><td data-label="Price">' + itemPrice + '</td></tr>');
		        		}
	        		});
	        	}

	        if(found == false) { // Try autocomplete
        		$.ajax({
			    	url: 'https://highlycaffeinated.ca/redeye',
				    data: {catNo: catNo},
			        dataType: 'json',
			        success: function (result) {
			        	if(result[0].data.length > 0)
			        		if(result[0].data.length > 5)
			        			$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">RedEye</td><td data-label="Release"><a href="https://www.redeyerecords.co.uk/search/?keywords=' + catNo + '&searchType=CAT" target="_blank">Too Many Results (> 5)</a></td><td data-label="Image">-</td><td data-label="In Stock">No</td><td data-label="Price">-</td></tr>');
			        		else {
			        			$.each(result, function(itemIndex, item) {
			        				var itemTitle = item.data[0].primary + ' - ' + item.data[0].secondary;
			        				var itemURL = item.data[0].url.replace('http', 'https');
			        				var itemImage = item.data[0].image.replace('http', 'https');
			        				var itemStock = '<em>Click link</em>';
			        				var itemPrice = '<em>Click link</em>';

			        				$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">RedEye</td><td data-label="Release"><a href="' + itemURL + '" target="_blank">' + itemTitle + '</a></td><td data-label="Image"><img width="50" height="50" src="' + itemImage + '"/><td data-label="In Stock">' + itemStock + '</td><td data-label="Price">' + itemPrice + '</td></tr>');
			        			});
			        		}
			        	else
			        		$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">RedEye</td><td data-label="Release">Not Found</td><td data-label="Image">-</td><td data-label="In Stock">-</td><td data-label="Price">-</td></tr>');
			        }
		        });
        	}
           },
       error: function (err, result) {
       		console.log(err);
       		console.log(result);
       }
  	});
}

function checkWhitePeach(catNo)
{
	$.ajax({
    	url: 'https://highlycaffeinated.ca/whitepeach',
	    data: {catNo: catNo},
        dataType: 'json',
        success: function (result) {
        	if(result.items.length > 0)
        		if(result.items.length > 5)
        			$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">White Peach</td><td data-label="Release"><a href="https://www.whitepeachrecords.com/search?q=' + catNo + '" target="_blank">Too Many Results (> 5)</a></td><td data-label="Image">-</td><td data-label="In Stock">No</td><td data-label="Price">-</td></tr>');
        		else
		        	$.each(result.items, function( itemIndex, item ) {
		        		var itemPrice = '-';
		        		var itemStock = '';

		        		if(item.title.indexOf('PRE-ORDER') !== -1)
		        			itemStock = '<strong>Preorder</strong>';
		        		else
		        			itemStock = '<strong>Yes</strong>';

		        		$.ajax({
		        			url: 'https://highlycaffeinated.ca/getpage?url=https://www.whitepeachrecords.com' + item.itemUrl,
		        			async: false,
		        			success: function(result) {
		        				price = $(result).find('.sqs-money-native').first().text();
		        				itemPrice = '&pound;' + price;

				        		if ($(result).find('.product-mark.sold-out').length > 0) {
		        					itemStock = 'No';
		        					itemPrice = '-';
				        		}
		        			},
		        			error: function(err, result) {
		        				console.log(err);
		        				console.log(result);
		        			}
		        		});

		        		$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">White Peach</td><td data-label="Release"><a href="https://www.whitepeachrecords.com' + item.itemUrl + '" target="_blank">' + item.title + '</a></td><td data-label="Image"><img width="50" height="50" src="' + item.imageUrl + '"/><td data-label="In Stock">' + itemStock + '</td><td data-label="Price">' + itemPrice + '</td></tr>');
		        	});
	       	else
	       		$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">White Peach</td><td data-label="Release">Not Found</td><td data-label="Image">-</td><td data-label="In Stock">-</td><td data-label="Price">-</td></tr>');
           },
       error: function (err, result) {
       		console.log(err);
       		console.log(result);
       	}
       });
}

function checkUnearthed(catNo)
{
	$.ajax({
    	url: 'https://highlycaffeinated.ca/getpage?url=https://www.unearthedsounds.co.uk/search?q=' + catNo,
        success: function (result) {
        	releases = $(result).find('.search-result');
        	if(releases.length > 0)
        		if(releases.length > 5)
        			$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Unearthed</td><td data-label="Release"><a href="https://www.unearthedsounds.co.uk/search?q=' + catNo + '" target="_blank">Too Many Results (> 5)</a></td><td data-label="Image">-</td><td data-label="In Stock">No</td><td data-label="Price">-</td></tr>');
        		else
		        	$.each(releases, function(itemIndex, item) {
		        		var itemURL = $(item).find('a').attr('href');
		        		$.ajax({
		        			url: 'https://www.unearthedsounds.co.uk' + itemURL + '.json',
		        			dataType: 'json',
		        			success: function(result) {
		        				var itemPrice = '-';
		        				var itemStock = '';
		        				var releaseDate = '';

		        				releaseString = $(result.product.body_html).first('strong').text().trim().replace('Release Date: ', '').replace('Released ','').replace('Repress shipping by ','').replace('th','').replace('rd','');
		        				var newDate = getDateFromFormat(releaseString, 'd MMM yyyy');
		        				var d = new Date(newDate);
		        				releaseDate = formatDate(d, 'dd.MM.yyyy');

								if(result.product.variants[0].inventory_quantity <= 0 && result.product.variants[0].inventory_policy != 'continue')
									itemStock = 'No';
								else
									itemStock = (result.product.variants[0].inventory_policy != 'continue' ? '<strong>Yes</strong>' : '<strong>Preorder (' + releaseDate + ')</strong>');

								if(itemStock !== 'No')
									itemPrice = '&pound;' + result.product.variants[0].price + calcVAT(result.product.variants[0].price);

		        				$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Unearthed</td><td data-label="Release"><a href="https://www.unearthedsounds.co.uk' + itemURL + '" target="_blank">' + result.product.title + '</a></td><td data-label="Image"><img width="50" height="50" src="' + result.product.image.src + '"/><td data-label="In Stock">' + itemStock + '</td><td data-label="Price">' + itemPrice + '</td></tr>');
		        			},
		        			error: function(err, result) {
		        				console.log(err);
	       						console.log(result);
		        			}
		        		});
		        	});
	        else
	        	$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Unearthed</td><td data-label="Release">Not Found</td><td data-label="Image">-</td><td data-label="In Stock">-</td><td data-label="Price">-</td></tr>');
           },
       error: function (err, result) {
       		console.log(err);
       		console.log(result);
       	}
       });
}

function checkDeejay(catNo)
{
	$.ajax({
    	url: 'https://highlycaffeinated.ca/getpage?url=https://www.deejay.de/ajaxHelper/autoCompleteSearch.php?term=' + catNo,
        success: function (result) {
        	var found = false;
        	releases = $(result).find('tr');
        	if(releases.length > 0)
        		if(releases.length > 5) {
        			found = true;
        			$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Deejay.de</td><td data-label="Release"><a href="https://www.deejay.de/' + catNo + '" target="_blank">Too Many Results (> 5)</a></td><td data-label="Image">-</td><td data-label="In Stock">No</td><td data-label="Price">-</td></tr>');
        		}
        		else
	        		$.each(releases, function(itemIndex, item) {
	        			var labelInfo = $(item).find('.label').text().split('|');
	        			if(labelInfo[0].trim().toUpperCase() == catNo.toUpperCase()) {
	        				found = true;
		        			var contentURL = $(item).attr('onClick');
		        			var startIndex = contentURL.indexOf('content.php?param=__');
		        			var endIndex = contentURL.indexOf("');$('#searchliste')");
		        			var itemURL = contentURL.substring(startIndex, endIndex);
		        			var itemTitle = $(item).attr('title');
		        			var itemImage = 'https://www.deejay.de' + $(item).find('img').attr('src');
		        			var itemStock = '';
		        			var itemPrice = '-';

		        			$.ajax({
		        				url: 'https://highlycaffeinated.ca/getpage?url=https://www.deejay.de/' + itemURL,
		        				async: false,
			        			success: function(result) {
			        				var itemStock1 = $(result).find('.first').text().trim();
			        				var itemStock2 = $(result).find('.second').text().trim();

			        				if(itemStock1.indexOf('In Stock') !== -1)
			        					itemStock = '<strong>Yes</strong>';
			        				else if(itemStock1.indexOf('pre-order now') !== -1)
			        					itemStock = '<strong>Preorder' + ((itemStock2 !== '') ? ' (' + itemStock2 + ')' : '') + '</strong>';
			        				else if(itemStock1.indexOf('stock from') !== -1)
			        					itemStock = '<strong>Stock from ' + ((itemStock2 !== '') ? ' (' + itemStock2 + ')' : '') + '</strong>';
			        				else if(itemStock1.indexOf('out of Stock') !== -1)
			        					itemStock = 'No';

			        				if(itemStock !== 'No')
			        					itemPrice = $(result).find('.price').text().trim();
		        				},
			        			error: function(err, result) {
			        				console.log(err);
			        				console.log(result);
		        				}
		        			});
							
							$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Deejay.de</td><td data-label="Release"><a href="https://www.deejay.de/' + itemURL + '" target="_blank">' + itemTitle + '</a></td><td data-label="Image"><img width="50" height="50" src="' + itemImage + '"/><td data-label="In Stock">' + itemStock + '</td><td data-label="Price">' + itemPrice + '</td></tr>');
						}
	        		});
        	if(found == false)
	        	$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Deejay.de</td><td data-label="Release">Not Found</td><td data-label="Image">-</td><td data-label="In Stock">-</td><td data-label="Price">-</td></tr>');
        },
        error: function(err, result) {
			console.log(err);
       		console.log(result);
		}
	});
}

function checkIntense(catNo)
{
	$.ajax({
    	url: 'https://highlycaffeinated.ca/getpage?url=https://www.intenserecords.com/search/' + catNo,
        success: function (result) {
        	releases = $(result).find('.product');
        	if(releases.length > 0)
        		if(releases.length > 5)
        			$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Intense</td><td data-label="Release"><a href="https://www.intenserecords.com/search/' + catNo + '" target="_blank">Too Many Results (> 5)</a></td><td data-label="Image">-</td><td data-label="In Stock">No</td><td data-label="Price">-</td></tr>');
        		else
	        		$.each(releases, function(itemIndex, item) {
		        		var itemURL = $(item).find('a').attr('href');
		        		var itemDetails  = $(item).find('.product-btn-cnt').find('a');
		        		//var itemTitle = itemDetails.attr('data-track-artist') + ' - ' + itemDetails.attr('data-track-title');
		        		var itemTitle = $(item).find('.artist').text() + ' - ' + $(item).find('.title').text();
	        			var itemStock;
	        			var itemPrice = '-';
	        			if(itemDetails.text().indexOf('Notify') !== -1)
	        				itemStock = 'No';
	        			else {
	        					var buybtn = $(item).find('.buy.btn-cms.btn')
		        				var inStock = $(buybtn).attr('title');
		        				itemPrice = $(buybtn).text();
		        				
		        				if(inStock == 'Buy')
		        					itemStock = '<strong>Yes</strong>';
		        				else
		        					itemStock = '<strong>Preorder</strong>';
	        				 }
						
						$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Intense</td><td data-label="Release"><a href="' + itemURL + '" target="_blank">' + itemTitle + '</a></td><td data-label="Image"><img width="50" height="50" src="img/intense-records.png"/><td data-label="In Stock">' + itemStock + '</td><td data-label="Price">' + itemPrice + '</td></tr>');
	        		});
        	else
	        	$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Intense</td><td data-label="Release">Not Found</td><td data-label="Image">-</td><td data-label="In Stock">-</td><td data-label="Price">-</td></tr>');
        },
        error: function(err, result) {
			console.log(err);
       		console.log(result);
		}
	});
}

function checkKudos(catNo)
{	
	$.ajax({
    	url: 'https://highlycaffeinated.ca/getpage?url=https://www.kudosrecords.co.uk/results.html?searchterm=' + catNo,
        success: function (result) {
	        if ($(result).find('.title_bar_term').length > 0) {
	        	releases = $(result).find('#home_features').find('a');
	        	if(releases.length > 0)
	        		if(releases.length > 5)
        				$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Kudos</td><td data-label="Release"><a href="https://www.kudosrecords.co.uk/results.html?searchterm=' + catNo + '" target="_blank">Too Many Results (> 5)</a></td><td data-label="Image">-</td><td data-label="In Stock">No</td><td data-label="Price">-</td></tr>');
        			else
		        		$.each(releases, function(itemIndex, item) {
			        		var itemURL = $(item).attr('href');
			        		var itemTitle  = $(item).find('.homepage_release_text_artist_div').text() + ' - ' + $(item).find('.homepage_release_text_title_div').text();
			        		var itemImage = $(item).find('img').attr('data-orig');
			        		var formats = $(item).find('.homepage_release_text_formats_div').text();
			        		var itemStock = 'No';
			        		var itemPrice = '-';

			        		if(formats.trim() !== '') {
				        		var price = formats.split('|')[0].split('-')[1].trim();
			        			//itemStock = (formats.indexOf('Vinyl') !== -1) ? '<strong>Yes</strong>' : 'No';

			        			$.ajax({
		        					url: 'https://highlycaffeinated.ca/getpage?url=https://www.kudosrecords.co.uk' + itemURL,
		        					async: false,
		        					success: function(result) {
					        			if ($(result).find('.buy_box_format_inactive').length > 0)
			        						itemStock = 'No';
			        					else
			        						itemStock = '<strong>Yes</strong>';
		        					},
		        					error: function(err, result) {
		        						console.log(err);
		        						console.log(result);
		        					}
	        					});

			        			itemPrice = '';
			        			if(itemStock !== 'No')
			        				itemPrice = price;
		        			}
							
							$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Kudos</td><td data-label="Release"><a href="https://www.kudosrecords.co.uk' + itemURL + '" target="_blank">' + itemTitle + '</a></td><td data-label="Image"><img width="50" height="50" src="' + itemImage + '"/><td data-label="In Stock">' + itemStock + '</td><td data-label="Price">' + itemPrice + '</td></tr>');
		
		        		});
	        	else
		        	$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Kudos</td><td data-label="Release">Not Found</td><td data-label="Image">-</td><td data-label="In Stock">-</td><td data-label="Price">-</td></tr>');
		        }
		    else
		        $('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Kudos</td><td data-label="Release">Not Found</td><td data-label="Image">-</td><td data-label="In Stock">-</td><td data-label="Price">-</td></tr>');
        },
        error: function(err, result) {
			console.log(err);
       		console.log(result);
		}
	});
}

function checkScotchBonnet(catNo)
{
	$.ajax({
		url: 'https://highlycaffeinated.ca/postscotch?catno=' + catNo + '&url=https://www.scotchbonnet.net/shop/search.php',
        success: function (result) {
        	releases = $(result).find('.ajax_block_product');
        	if(releases.length > 0)
        		if(releases.length > 5)
    				$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Scotch Bonnet</td><td data-label="Release"><a href="http://www.scotchbonnet.net/shop/search.php?search_query=' + catNo + '" target="_blank">Too Many Results (> 5)</a></td><td data-label="Image">-</td><td data-label="In Stock">No</td><td data-label="Price">-</td></tr>');
    			else
    				$.each(releases, function(itemIndex, item) {
    					var itemURL = $(item).find('a').attr('href');
    					var itemTitle = $(item).find('a').attr('title');
    					var itemImage = 'http://www.scotchbonnet.net' + $(item).find('img').attr('src');
    					var itemStock = $(item).find('.availability').text();
    					if(itemStock == 'Available')
    						itemStock = '<strong>Yes</strong>';
    					else
    						itemStock = 'No';
    					var itemPrice = '-';
    					if(itemStock == '<strong>Yes</strong>')
    						itemPrice = $(item).find('.price').text();

    					$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Scotch Bonnet</td><td data-label="Release"><a href="' + itemURL + '" target="_blank">' + itemTitle + '</a></td><td data-label="Image"><img width="50" height="50" src="' + itemImage + '"/><td data-label="In Stock">' + itemStock + '</td><td data-label="Price">' + itemPrice + '</td></tr>');
    				});
    		else
	        	$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Scotch Bonnet</td><td data-label="Release">Not Found</td><td data-label="Image">-</td><td data-label="In Stock">-</td><td data-label="Price">-</td></tr>');
        },
        error: function(err, result) {
			console.log(err);
       		console.log(result);
		}
	});
}

function checkBoomkat(catNo)
{
	$.ajax({
		url: 'https://highlycaffeinated.ca/getpage?url=https://boomkat.com/products?q[keywords]=' + catNo,
        success: function (result) {
        	releases = $(result).find('.listing2__product');
        	if(releases.length > 0)
        		if(releases.length > 5)
    				$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Boomkat</td><td data-label="Release"><a href="https://boomkat.com/products?q[keywords]=' + catNo + '" target="_blank">Too Many Results (> 5)</a></td><td data-label="Image">-</td><td data-label="In Stock">No</td><td data-label="Price">-</td></tr>');
    			else
    				$.each(releases, function(itemIndex, item) {
    					var itemURL = 'https://boomkat.com' + $(item).find('a').attr('href');
    					var itemTitle = $(item).find('strong').text() + ' - ' + $(item).find('.album-title').text(); 
    					var itemImage = $(item).find('img').attr('src');
    					var itemFormats = $(item).find('.btn-buy-inner');
    					var itemStock = 'No';
    					var itemPrice = '';
    					$.each(itemFormats, function(itemIndex, item) {
    						var format = $(item).find('.format').text().trim();
    						var outOfStock = $(item).find('.out-of-stock').length;
    						var price = $(item).find('.price').text().trim();
    						var found = 0;

    						if((format.indexOf('10"') !== -1 || format.indexOf('12"') !== -1 || format.indexOf('7"') !== -1 || format.indexOf('LP') !== -1) && outOfStock == 0) {
    							itemStock = '<strong>Yes</strong>';
    							itemPrice += format + ': ' + price.replace('pre-order', '<em>Click link</em>');
    							if(found > 0)
    								 itemPrice = ' | ' + itemPrice;
    							found += 1;
    						}
    					});

    					$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Boomkat</td><td data-label="Release"><a href="' + itemURL + '" target="_blank">' + itemTitle + '</a></td><td data-label="Image"><img width="50" height="50" src="' + itemImage + '"/><td data-label="In Stock">' + itemStock + '</td><td data-label="Price">' + itemPrice + '</td></tr>');
    				});
    		else
	        	$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Boomkat</td><td data-label="Release">Not Found</td><td data-label="Image">-</td><td data-label="In Stock">-</td><td data-label="Price">-</td></tr>');
        },
        error: function(err, result) {
			console.log(err);
       		console.log(result);
		}
	});
}

function checkTriplevision(catNo)
{
	$.ajax({
		url: 'https://highlycaffeinated.ca/getpage?url=https://www.triplevision.nl/suggest/r/' + catNo,
        success: function (result) {
        	releases = $(result).find('a');
        	if(releases.length > 0)
        		if(releases.length > 5)
    				$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Triplevision</td><td data-label="Release"><a href="https://www.triplevision.nl/advanced-search/?q=' + catNo + '" target="_blank">Too Many Results (> 5)</a></td><td data-label="Image">-</td><td data-label="In Stock">No</td><td data-label="Price">-</td></tr>');
    			else
    				$.each(releases, function(itemIndex, item) {
    					var href = $(item).attr('href');
    					if(href.indexOf('javascript') == -1) {
	    					var itemURL = 'https://www.triplevision.nl' + href;
	    					var itemTitle = $(item).attr('title');
	    					var itemImage = '';
	    					var itemFormats = '';
	    					var itemStock = 'No';
	    					var itemPrice = '-';
			        		$.ajax({
			        			url: 'https://highlycaffeinated.ca/getpage?url=' + itemURL,
			        			async: false,
			        			success: function(result) {
			        				itemImage = $(result).find('.cimg').find('img').attr('src');
			        				strong = $(result).find('strong');
			        				$.each(strong, function(itemIndex, item) {
			        					var itemText = item.innerText.toLowerCase();
			        					if(itemText.indexOf('€') !== -1)
			        						itemPrice = itemText;
			        					else if(itemText.indexOf('pre order') !== -1 || itemText.indexOf('available') !== -1 || itemText.indexOf('mail stock') !== -1)
			        						itemStock = item.innerText;
			        				});
			        			},
			        			error: function(err, result) {
			        				console.log(err);
			        				console.log(result);
		        				}
		        			});

			        		if(itemStock == 'No')
	        					itemPrice = '-';
	        				else {
		        			itemStock = itemStock.replace('pre order.', '<strong>Preorder</strong>');
		        			itemStock = itemStock.replace('Available.', '<strong>Yes</strong>');
		        			itemStock = itemStock.replace('Mail stock.', '<em>Unlikely</em> (Mail stock)');
		        			if(itemStock.indexOf('Unlikely') !== -1)
		        				itemPrice = '-';
		        			}

	    					$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Triplevision</td><td data-label="Release"><a href="' + itemURL + '" target="_blank">' + itemTitle + '</a></td><td data-label="Image"><img width="50" height="50" src="' + itemImage + '"/><td data-label="In Stock">' + itemStock + '</td><td data-label="Price">' + itemPrice + '</td></tr>');
	    				}
    				});
    		else
	        	$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Triplevision</td><td data-label="Release">Not Found</td><td data-label="Image">-</td><td data-label="In Stock">-</td><td data-label="Price">-</td></tr>');
        },
        error: function(err, result) {
			console.log(err);
       		console.log(result);
		}
	});
}

function checkRwdFwd(catNo)
{
	$.ajax({
		url: 'https://highlycaffeinated.ca/getpage?url=https://rwdfwd.com/?s=' + catNo,
        success: function (result) {
        	releases = $(result).find('.products');
        	if(releases.length > 0)
        		if(releases.length > 5)
    				$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">RwdFwd</td><td data-label="Release"><a href="https://rwdfwd.com/?s=' + catNo + '" target="_blank">Too Many Results (> 5)</a></td><td data-label="Image">-</td><td data-label="In Stock">No</td><td data-label="Price">-</td></tr>');
    			else
    				$.each(releases, function(itemIndex, item) {
    					var href = $(item).find('a');
    					var itemURL = $(href).attr('href');
    					var itemTitle = $(href).attr('title');
    					var itemImage = $(item).find('img').attr('data-original');
    					var itemStock = 'No';
    					var itemPrice = '-';
    					var inStock = $(item).find('.product_meta').find('.left').html().trim();
    					if(inStock !== '')
	    					if (inStock !== 'Out of stock!') {
	    						itemStock = '<strong>Yes</strong>';
	    						itemPrice = inStock;
	    					}

    					$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">RwdFwd</td><td data-label="Release"><a href="' + itemURL + '" target="_blank">' + itemTitle + '</a></td><td data-label="Image"><img width="50" height="50" src="' + itemImage + '"/><td data-label="In Stock">' + itemStock + '</td><td data-label="Price">' + itemPrice + '</td></tr>');
					});
    		else
	        	$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">RwdFwd</td><td data-label="Release">Not Found</td><td data-label="Image">-</td><td data-label="In Stock">-</td><td data-label="Price">-</td></tr>');
        },
        error: function(err, result) {
			console.log(err);
       		console.log(result);
		}
	});
}

function checkJuno(catNo)
{
	var sliceIndex = catNo.search(/\d/);
	var fixedCat = ''
	if(sliceIndex != -1)
		fixedCat = catNo.slice(0,sliceIndex) + ' ' + catNo.slice(sliceIndex);
	else
		fixedCat = catNo;

	$.ajax({
		url: 'https://highlycaffeinated.ca/getpage?url=https://www.juno.co.uk/search/?q[all][]=' + fixedCat,
        success: function (result) {
        	releases = $(result).find('.dv-item');
        	if(releases.length > 0)
        		if(releases.length > 5)
    				$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Juno</td><td data-label="Release"><a href="https://www.juno.co.uk/search/?q[all][]=' + fixedCat + '" target="_blank">Too Many Results (> 5)</a></td><td data-label="Image">-</td><td data-label="In Stock">No</td><td data-label="Price">-</td></tr>');
    			else
    				$.each(releases, function(itemIndex, item) {
    					var items = $(item).find('.vi-text')
    					var itemURL = $($($(items).get(1))).find('a').attr('href');
    					var itemTitle = $($(items).get(0)).text() + ' - ' + $($(items).get(1)).text();
    					var itemImage = $(item).find('.lazy_img').attr('src');
    					var itemStock = 'No';
    					var itemPrice = '-';
    					var inStock = $(item).find('em').text();
    					if(inStock == 'in stock')
    						{
	    						itemStock = '<strong>Yes</strong>';
	    						itemPrice = $(item).find('.price_lrg').text();
	    					}

    					$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Juno</td><td data-label="Release"><a href="https://www.juno.co.uk' + itemURL + '" target="_blank">' + itemTitle + '</a></td><td data-label="Image"><img width="50" height="50" src="' + itemImage + '"/><td data-label="In Stock">' + itemStock + '</td><td data-label="Price">' + itemPrice + '</td></tr>');
					});
    		else
	        	$('#body').append('<tr class="release"><td scope="row" data-label="Vendor">Juno</td><td data-label="Release">Not Found</td><td data-label="Image">-</td><td data-label="In Stock">-</td><td data-label="Price">-</td></tr>');
        },
        error: function(err, result) {
			console.log(err);
       		console.log(result);
		}
	});
}

function clearTable()
{
	$(".release").remove();
	$('#error').remove();
}

function calcVAT(price)
{
	return ' (&pound;' + (price * 1.20).toFixed(2) + ' incl. VAT)';
}

function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

function selectAll()
{
	$('input[name="stores"]').prop('checked', true);
}

function selectNone()
{
	$('input[name="stores"]').prop('checked', false);
}
