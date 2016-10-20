(function() {
	// This is taken from Stack Overflow, someone provided a pre-written answer to the IE8 problem
    var d = window.Date,
        regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/,
        lOff, lHrs, lMin;

    if (d.parse('2011-11-29T15:52:30.5') !== 1322599950500 ||
        d.parse('2011-11-29T15:52:30.52') !== 1322599950520 ||
        d.parse('2011-11-29T15:52:18.867') !== 1322599938867 ||
        d.parse('2011-11-29T15:52:18.867Z') !== 1322581938867 ||
        d.parse('2011-11-29T15:52:18.867-03:30') !== 1322594538867 ||
        d.parse('2011-11-29') !== 1322524800000 ||
        d.parse('2011-11') !== 1320105600000 ||
        d.parse('2011') !== 1293840000000) {

        d.__parse = d.parse;

        lOff = -(new Date().getTimezoneOffset());
        lHrs = Math.floor(lOff / 60);
        lMin = lOff % 60;

        d.parse = function(v) {

            var m = regexIso8601.exec(v);

            if (m) {
                return Date.UTC(
                    m[1],
                    (m[2] || 1) - 1,
                    m[3] || 1,
                    m[4] - (m[8] ? m[9] ? m[9] + m[10] : 0 : lHrs) || 0,
                    m[5] - (m[8] ? m[9] ? m[9] + m[11] : 0 : lMin) || 0,
                    m[6] || 0,
                    ((m[7] || 0) + '00').substr(0, 3)
                );
            }

            return d.__parse.apply(this, arguments);

        };
    }

    d.__fromString = d.fromString;

    d.fromString = function(v) {

        if (!d.__fromString || regexIso8601.test(v)) {
            return new d(d.parse(v));
        }

        return d.__fromString.apply(this, arguments);
    };

})();

Handlebars.registerHelper('formatPostDate', function(date){
	var d = Date.fromString(date);
	return d.getDate() + '/' + d.getMonth() + '/' + d.getFullYear();
});

Handlebars.registerHelper('formatRepoTagLabel', function(lang){
	switch(lang){
		case "PHP":
			return 'label-primary';
			break;
		case 'JavaScript':
			return 'label-warning';
			break;
		case 'Python':
			return 'label-info';
			break;
		default:
			return 'label-default';
			break;
	}
});

Handlebars.registerHelper('repoStarCount', function(c){
	if(c > 1){
		return c;
	}else{
		return false;
	}
});

$(function(){
	var section = '#about';
	if(window.location.hash){
		section = window.location.hash
	}
	$('.navbar-default .navbar-right .navbar-nav li').each(function(){
		var a = $(this).children('a');
		if(a.attr('href') ===  section){
			$(this).addClass('active');
		}
	});
	hideShowNavbarBrand();
	
	$.when(
		populateBlogPosts(),
		populateRepos()
	).done(function(){
		//$(window).trigger('resize');
	});
});

function populateBlogPosts(){
	return $.get(
		'https://public-api.wordpress.com/rest/v1.1/sites/8362155/posts/\
		?number=3&status=publish&order_by=date&order=DESC',
		null,
		null,
		'json'
	).done(function(data){
		var template = Handlebars.compile($("#post-template").html());
		$('.post-grid').html(template(data));
	});
}

function populateRepos(){
	return $.get('https://api.github.com/users/Sammaye/repos', null, 'json')
	.done(function(data){
		var val = [];
		$.each(data, function(){
			this.name_normalised = this.name.toLowerCase();
			if(this.language){
				this.language_normalised = this.language.toLowerCase();
			}
			val[val.length] = this;
		});
		val = filterRepos(val);
		var template = Handlebars.compile($("#repo-template").html());
		$('.repos-grid').html(template(val));
	});
}


$('#search-form').on('submit', function(e){
	e.preventDefault();
	populateRepos();
});

$('.btn-sort-asc,.btn-sort-desc').on('click', function(e){
	e.preventDefault();
	
	$(this).parent('.btn-group').children('.btn').removeClass('active');
	$(this).addClass('active');
	
	populateRepos();
});

function filterRepos(data){
	var sort = 'name_normalised';
	if($('.btn-sort-desc').hasClass('active')){
		sort = '-name_normalised';
	}
	
	data.sort(dynamicSort(sort));
	var terms = $('#repoSearchTerm').val();
	
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

$(document).on('click', '.navbar-default .navbar-right .navbar-nav li a', function(e){
	var li = $(this).parents('li');
	if(!li.hasClass('active')){
		$('.navbar-default .navbar-right .navbar-nav li').removeClass('active');
		$(this).parents('li').addClass('active');
	}
});

$(document).on('scroll resize', function(e){
	
	if($(window).scrollTop() === 0){
		$('.navbar-default .navbar-right .navbar-nav \
		li a[href="#about"]')
			.trigger('click');
	}else{
		$('.about, .posts, .projects, .repos').each(function(){
			if($(window).scrollTop() > ($(this).offset().top - 100)){
				$('.navbar-default .navbar-right .navbar-nav \
				li a[href="#' + $(this).attr('class') + '"]')
					.trigger('click');
			}
		});
	}
	
	hideShowNavbarBrand();
});

function hideShowNavbarBrand(){
	if($(window).scrollTop() > $('.profiles').offset().top){
		$('.navbar .navbar-brand').css({display: 'block'});
	}else{
		$('.navbar .navbar-brand').css({display: 'none'});
	}
}
