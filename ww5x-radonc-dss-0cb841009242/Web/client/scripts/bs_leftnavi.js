$(document).ready(function () {
    var nav = function () {
        $('.gw-nav > li > a').click(function () {
            var gw_nav = $('.gw-nav');
            gw_nav.find('li').removeClass('active');

            var checkElement = $(this).parent();
            var id = checkElement.attr('id');
            if(id == 1){
                //document.getElementById("result").innerHTML = "This is the first div.";
            }
            else if (id == 2){
                //document.getElementById("result").innerHTML = "This is the second div.";
            } 
            else if (id == 3){
                //document.getElementById("result").innerHTML = "This is the third div.";
            }
            else {
                //document.getElementById("result").innerHTML = "This is the fourth div.";
            }
            var ulDom = checkElement.find('.gw-submenu')[0];

            if (ulDom == undefined) {
                checkElement.addClass('active');
                return;
            }   
        });
        // $('.gw-nav > li > ul > li > a').click(function () {
        //     $(this).parent().parent().parent().removeClass('active');
        //     $('.gw-nav > li > ul > li').removeClass('active');
        //     $(this).parent().addClass('active')
        // });
    };
    nav();
});

