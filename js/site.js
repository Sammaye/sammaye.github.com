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
	getGithubRepos().done(function(data){
		populateGrid(filterDataGrid(data));
	})
});

$('#search-form').on('submit', function(e){
	e.preventDefault();
	getGithubRepos().done(function(data){
		populateGrid(filterDataGrid(data));
	});
});

$('.btn-sort-asc,.btn-sort-desc').on('click', function(e){
	e.preventDefault();
	
	$(this).parent('.btn-group').children('.btn').removeClass('active');
	$(this).addClass('active');
	
	getGithubRepos().done(function(data){
		populateGrid(filterDataGrid(data));
	});
});

var githubRepos=  [];

function getGithubRepos(){
	return $.get('https://api.github.com/users/Sammaye/repos', null, 'json')
	.done(function(data){
		$.each(data, function(){
			this.name_normalised = this.name.toLowerCase();
			
			if(this.language){
				this.language_normalised = this.language.toLowerCase();
			}
			
			githubRepos[githubRepos.length - 1] = this;
		});
	});
}

function filterDataGrid(data){
	var sort = 'name_normalised';
	if($('.btn-sort-desc').hasClass('active')){
		sort = '-name_normalised';
	}
	
	data.sort(dynamicSort(sort));
	terms = $('.github-search-terms').val();
	
	if(!terms){
		return data;
	}
	
	terms = terms.split(/\s+/);
	
	var newData = [];
	$.each(data, function(){
		
		var notFound = false;
		
		for(var i = 0; i < terms.length; i++){
			var termRegex = new RegExp(terms[i]);
			if(
				(this.name_normalised && this.name_normalised.match(termRegex)) || 
				(this.language_normalised && this.language_normalised.match(termRegex))
			){
			}else{
				var notFound = true;
			}
		}
		
		if(!notFound){
			newData[newData.length] = this;
		}
	});
	
	return newData;
}

function populateGrid(data){

	var grid = $('.repo-grid');
	grid.empty();
	
	$.each(data, function(){
		var repo = this;
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

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}