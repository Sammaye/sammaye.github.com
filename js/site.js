$(window).bind('scroll load resize', function(e){

	var offset = $('.top-bar').offset();
	
	if($(window).scrollTop() > offset.top){
		$('.main-avatar').css({display: 'none'});
		if(!Modernizr.mq('(max-width:768px)')){
			$('.navbar-header').removeClass('col-sm-9 col-md-6 col-lg-4').addClass('col-sm-13 col-md-10 col-lg-7');
		}else{
			$('.navbar-header').addClass('col-sm-9 col-md-6 col-lg-4').removeClass('col-sm-13 col-md-10 col-lg-7');
		}
		$('.top-bar-inner .hidden-brand').css({display: 'block'});
		$('.top-bar-inner').addClass('navbar-fixed');
	}else{
		
		$('.navbar-header').addClass('col-sm-9 col-md-6 col-lg-4').removeClass('col-sm-13 col-md-10 col-lg-7');
		
		if(!Modernizr.mq('(max-width:768px)')){
			$('.main-avatar').css({display: 'block'});
		}else{
			$('.main-avatar').css({display: 'none'});
		}
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
			$('<div/>', {'class' : 'col-xs-48 col-sm-14 col-md-10 col-lg-9 repo-item'}).append(
				$('<a/>', {href : repo.html_url}).append($('<h4/>').html(repo.name))
			)
			.append(
				$('<p class="repo-description"/>').html(repo.description)
			)
			.append(
				repo.language ? $('<p/>').html('Language: ' + repo.language) : ''
			)
		);
		
	});
}