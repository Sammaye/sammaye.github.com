/**
 * 
 */
$(function(){
	$.get('https://api.github.com/users/Sammaye/repos', null, 'json')
	.done(function(data){
		console.log(data);
		populateGrid(data);
	});
});

function populateGrid(data){

	var grid = $('.repo-grid');
	grid.empty();
	
	$.each(data, function(){
		var repo = $(this)[0];
		grid.append(
			$('<div/>', {'class' : 'col-sm-10'}).append(
				$('<a/>', {href : $(this).html_url}).html($(this)[0].name)
			)
			.append(
				$('<p/>').html($(this)[0].description)
			)
		);
		
	});
}