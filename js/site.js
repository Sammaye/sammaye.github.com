$(window).bind('scroll load', function(e){
	var offset = $('.top-bar').offset();
	if($(window).scrollTop() > offset.top){
		$('.top-bar-inner').addClass('navbar-fixed');
		$('.top-bar-inner .hidden-brand').css({display: 'block'});
		$('.main-avatar').css({display: 'none'});
	}else{
		$('.main-avatar').css({display: 'block'});
		$('.top-bar-inner .hidden-brand').css({display: 'none'});
		$('.top-bar-inner').removeClass('navbar-fixed')
	}
});

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
			$('<div/>', {'class' : 'col-sm-11 repo-item'}).append(
				$('<a/>', {href : repo.html_url}).append($('<h4/>').html(repo.name))
			)
			.append(
				$('<p/>').html(repo.description)
			)
			.append(
				$('<p/>').html('Language: ' + repo.language)
			)
		);
		
	});
}