$(function () {
    $('.list_nav').hover(function (e) {
        if($(this).hasClass('active')){
            //event.stopPropagation();
            //$(this).addClass('active').siblings('li').removeClass('active').end().children('.hide_item').slideDown('slow');
            $(this).children('.hide_item').slideDown('400');
            return false;
        }

    },function(e){
    	 $(this).children('.hide_item').slideUp('400');
    	 return false;
    })

});
