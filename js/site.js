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
            return 'badge-primary';
            break;
        case 'JavaScript':
            return 'badge-warning';
            break;
        case 'Python':
            return 'badge-info';
            break;
        default:
            return 'badge-secondary';
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
    $.when(
        loadPosts(),
        loadRepos()
    ).done(function(){
        navbarState(window.location.hash);
    });
});

$(document).on('click', 'header .nav-link', function(e){
    e.preventDefault();

    var id = $(this).attr('href'),
        nav_height = $('header .navbar').outerHeight();

    $('html, body').animate({scrollTop: $(id).offset().top - (nav_height - 10)}, 'slow');
    window.location.hash = id;

    if(!$(this).parent().hasClass('active')){
        $(this).parents('ul').children('li').removeClass('active');
        $(this).parent().addClass('active');
    }
});

$(window).on('resize', function(e){
    navbarState();
});

$(document).on('scroll', function(e){
    navbarState();
});

function navbarState(section) {

    var above_fold = $(window).scrollTop() <= ($('.profiles').offset().top + $('.profiles').outerHeight());

    if(above_fold && !section){
        if (!$('header .navbar .navbar-toggler').hasClass('collapsed')) {
            $('header .navbar .navbar-toggler').trigger('click');
        }
        $('header .navbar').addClass('d-none');
        $('header .navbar-brand span').addClass('d-none');
        $('header .navbar').removeClass('filled');
    }else {
        $('header .navbar').removeClass('d-none');
        $('header .navbar-brand span').removeClass('d-none');
        $('header .navbar').addClass('filled');
    }

    var active = null,
        nav_height = $('header .navbar').outerHeight();

    if (typeof section !== "undefined" && section) {
        $('header .navbar-nav li').each(function () {
            var a = $(this).children('a');
            if (a.attr('href') === section) {
                a.trigger('click');
            }
        });
    } else {
        if (above_fold) {
            active = $('header .nav-link[href="#about"]');
        } else {
            $('.about, .posts, .repos').each(function () {

                var link_class = $(this).attr('class');
                if ($(this).hasClass('about')) {
                    link_class = 'about';
                }

                if ($(window).scrollTop() > ($(this).offset().top - nav_height)) {
                    active = $('header .nav-link[href="#' + link_class + '"]');
                }
            });
        }

        if (!active.parent().hasClass('active')) {
            active.parents('ul').children('li').removeClass('active');
            active.parent().addClass('active');
        }
    }
}

function loadPosts(){
    return $.get(
        'https://public-api.wordpress.com/rest/v1.1/sites/8362155/posts/?number=3&status=publish&order_by=date&order=DESC',
        null,
        null,
        'json'
    ).done(function(data){
        var template = Handlebars.compile($("#post-template").html());
        $('.posts-container').html(template(data));

        if (!$('.posts-container').is(':empty')) {
            $('.posts-spinner').remove();
            $('.posts-container').removeClass('d-none');
        }
    });
}

var repos = [];

function loadRepos(direction){

    if (typeof direction === "undefined" || !direction) {
        if ($('.btn-repos-sort-asc.active').length) {
            direction = 'asc';
        } else if ($('.btn-repos-sort-desc.active').length) {
            direction = 'desc';
        } else {
            direction = 'asc';
        }
    }

    var repos_api_url = 'https://api.github.com/users/Sammaye/repos',
        repos_api_params = {
            direction: direction,
            page: 1,
        };

    var page_deferreds = [],
        data_formatter = function(data){
            var formatted_data = [];
            $.each(data, function () {
                this.name_normalised = this.name.toLowerCase();
                if (this.language) {
                    this.language_normalised = this.language.toLowerCase();
                }
                formatted_data[formatted_data.length] = this;
            })
            return formatted_data;
        },
        process_callback = function(){
            var height_changed = false,
                formatted_repos = repos,
                terms = $('#repoSearchTerm').val();

            if(terms) {
                terms = terms.split(/\s+/);

                var filtered_repos = [];
                $.each(formatted_repos, function () {

                    var notFound = false;

                    for (var i = 0; i < terms.length; i++) {
                        var termRegex = new RegExp(terms[i]);
                        if (
                            (this.name_normalised && this.name_normalised.match(termRegex)) ||
                            (this.language_normalised && this.language_normalised.match(termRegex))
                        ) {
                        } else {
                            var notFound = true;
                        }
                    }

                    if (!notFound) {
                        filtered_repos[filtered_repos.length] = this;
                    }
                });

                formatted_repos = filtered_repos;
            }

            var sort_property = 'name_normalised',
                sort_order = direction === 'desc' ? -1 : 1;
            formatted_repos.sort(function(a, b){
                var result = (a[sort_property] < b[sort_property]) ? -1 : (a[sort_property] > b[sort_property]) ? 1 : 0;
                return result * sort_order;
            });

            if (formatted_repos.length > $('.repos-row .repo').length) {
                height_changed = true
            }

            var template = Handlebars.compile($("#repo-template").html());
            $('.repos-row').html(template(formatted_repos));

            if (direction === 'asc') {
                $('.btn-repos-sort-asc').addClass('active');
                $('.btn-repos-sort-desc').removeClass('active');
            } else {
                $('.btn-repos-sort-asc').removeClass('active');
                $('.btn-repos-sort-desc').addClass('active');
            }

            if (
                height_changed ||
                (!$('.repos-row').is(':empty') && $('.repos-spinner').length)
            ) {

                if ($('.repos-spinner').length) {
                    $('.repos-spinner').remove();
                    $('.repos-container').removeClass('d-none');
                }

                $('.repos-container').css({
                    height: $('.repos-row').outerHeight(),
                });
            }
        };

    if (repos.length <= 0) {
        $
            .get(repos_api_url, repos_api_params, 'json')
            .then(function (data, textStatus, request) {

                repos = data_formatter(data);

                var link = request.getResponseHeader('Link'),
                    regex = /<(.[^>]*)>; rel="(.[^"]*)",?/gm,
                    max_page = 1;

                var match = regex.exec(link);

                while (match != null) {
                    if (match.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }

                    if (match[2] === 'last') {
                        max_page = parseInt(match[1].match(/&page=(\d)/)[1]);
                    }
                    match = regex.exec(link);
                }

                i = 2;
                while (i <= max_page) {
                    repos_api_params.page = i;
                    page_deferreds.push(
                        $.get(repos_api_url, repos_api_params, 'json').done(function (data) {
                            repos = repos.concat(data_formatter(data));
                        })
                    );
                    i++;
                }

                return $.when(...page_deferreds);
            })
            .then(process_callback);
    } else {
        process_callback();
    }
}

$(window).on('resize', function(e){
    $('.repos-container').css({
        height: $('.repos-row').outerHeight(),
    });
});

$('#search-form').on('submit', function(e){
    e.preventDefault();
    loadRepos();
});

$('.btn-repos-sort-asc,.btn-repos-sort-desc').on('click', function(e){
    e.preventDefault();
    loadRepos($(this).data('direction'));
});
