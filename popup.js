$(function() {

	chrome.runtime.sendMessage({}, function(response){
		console.log(response.started);
		
		if (response.started){
			hideForm();
		}
	});

	var errors = $('.errors');
	var error;

   $('.pq-start-form').on('submit', function(e){
   		e.preventDefault();
   		var username = $('.pq-username-field').val();
   		var deckURL = $('.pq-deck-url-field').val();
   		var password = $('.pq-password-field').val();

   		if (!username){
   			throwError('Please enter a username');
   		} else if (!password){
   			throwError('Please enter a password');
   		} else if (!deckURL){
   			throwError('Please enter the URL of the deck you want to sync.');
   		} else {
   			$.ajax({
				method: "post",
				url: "http://localhost:3000/methods/loginFromExtension",
				data: JSON.stringify([username, password]),
				contentType: "application/json",
				success: function (data) {
					console.log(data);
					if (data === true){
						$('.errors').html('');
						chrome.runtime.sendMessage({started: true, username: username,deckURL: deckURL});
						window.close();
					} else{
						throwError(data);
					}
				},
				error: function(error){
					throwError(error)
				}
			});
   		}
   });

   $('.stop-btn').on('click', function(){
   		chrome.runtime.sendMessage({stop: true});
   		window.close();
   })
});

function throwError(error){
	$('.errors').html('<p class="error">' + error + '</p>');
	return false;
}

function hideForm(){
	$('.pq-start-form').addClass('hidden');
	$('.stop-btn').removeClass('hidden');
}
