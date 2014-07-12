$(function(){
	$.get('https://api.github.com/users/Sammaye/repos', null, 'json')
	.done(function(data){
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
				$('<a/>', {href : repo.html_url}).html(repo.name)
			)
			.append(
				$('<p/>').html(repo.description)
			)
		);
		
	});
}