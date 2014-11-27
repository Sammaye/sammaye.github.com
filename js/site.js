$(window).bind('scroll load', function(e){
	var offset = $('.top-bar').offset();
	
	if($(window).scrollTop() > offset.top){
		if(!Modernizr.mq('(max-width:768px)')){
			$('.main-avatar').css({display: 'none'});
		}
		$('.top-bar-inner .hidden-brand').css({display: 'block'});
		$('.top-bar-inner').addClass('navbar-fixed');
	}else{
		if(!Modernizr.mq('(max-width:768px)')){
			$('.main-avatar').css({display: 'block'});
		}
		$('.top-bar-inner .hidden-brand').css({display: 'none'});
		$('.top-bar-inner').removeClass('navbar-fixed')
	}
});

$(window).bind('resize', function(e){
	
	if(Modernizr.mq('(max-width:768px)')){
		$('.main-avatar').css({display: 'none'});
	}else{
		$('.main-avatar').css({display: 'block'});
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