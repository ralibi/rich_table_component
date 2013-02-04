
var CURRENCY_ID_NUMBER = "#,##0"
var CURRENCY_ID_FORMAT = "#,##0"
var CURRENCY_ID_NUMBER_OBJECT = {format:CURRENCY_ID_NUMBER, locale:"us"};
var CURRENCY_ID_FORMAT_OBJECT = {format:CURRENCY_ID_FORMAT, locale:"us"};

var PERCENT_NUMBER = "#.0%"
var PERCENT_FORMAT = "#.0%"
var PERCENT_NUMBER_OBJECT = {format:PERCENT_NUMBER, locale:"us"};
var PERCENT_FORMAT_OBJECT = {format:PERCENT_FORMAT, locale:"us"};

// BASIC TABLE GRID

jQuery.fn.st_tableGrid = function(options){
  
  return this.each(function(){
    var defaults = {
      width: 800,
      height: "auto",
      header_label: [],
      columns: [],
      flowing: true,
      min_height: 150,
      show_advanced_search: false
    };
    var opts = jQuery.extend(defaults, options);
  
    var $elmt = jQuery(this);
    var $rtc_header = $elmt.children('.rtc_header');
    var $rtc_content = $elmt.children('.rtc_content');
    var $rtc_grid = $rtc_content.children('.rtc_grid'); 
    var $rtc_grid_header = $rtc_content.children('.rtc_grid_header');
    var $rtc_footer = $elmt.children('.rtc_footer');
    
    var table_width = opts.flowing ? $elmt.parent().width() : opts.width; 
    
    $elmt.width(table_width);
    
    for (var i = 0; i < opts.slices; i++) {
    }
    
    $rtc_grid_header.wrapInner('<div class="rtc_gh_items"></div>');
    
    var scroller_width = 0;
    
    var nearleft = false;
    var nearright = false;
    var resized_column = -9;
    var mousedown = false;
    var min_cwidth = 40;
    var rezrad = 5;
    
    var $vertical_line;
    var $rtc_gh_items = $rtc_grid_header.find('.rtc_gh_items');
    
    var grid_table_width = $rtc_grid.width() - scroller_width; // substract with scroller width
    
    var arr_cols_width = opts.columns;
    var total_prop_columns = 0;
    
    var ncolumn = $rtc_grid_header.find('.rtc_gh_item').size();

    if(arr_cols_width.length == 0){
      for(var i=0; i<ncolumn; i++){
        var data_column_width = $rtc_gh_items.find('.rtc_gh_item').eq(i).data('column-width');
        arr_cols_width[i] = data_column_width == undefined ? 1 : data_column_width;
      }
    }
    
    $rtc_grid.find('table').width(grid_table_width);
    
    $elmt.st_tableGrid_update();
    
    // adjusting table grid height
    
    if(opts.height != "auto"){
      $rtc_grid.height( opts.height 
                    - $rtc_footer.outerHeight()
                    - $rtc_grid_header.outerHeight()
                    - $rtc_header.outerHeight()
                    - 7
      );
    }
    else{
      if($rtc_grid.height() + $rtc_footer.outerHeight() + $rtc_grid_header.outerHeight() + $rtc_header.outerHeight() + 7 < opts.min_height){
        $rtc_grid.css( 'min-height', opts.min_height 
                      - $rtc_footer.outerHeight()
                      - $rtc_grid_header.outerHeight()
                      - $rtc_header.outerHeight()
                      - 7
        );
      }
    }

    // just auto height, so that we comment the line just below
    //$rtc_grid.height($rtc_grid.height());
    
    // Adjust table width
    for(var i=0; i<ncolumn; i++){
      total_prop_columns += arr_cols_width[i];
    }
    
    
    // Adjust initial column width
    for(var i=0; i<ncolumn; i++){
      var tcw = arr_cols_width[i] * grid_table_width / total_prop_columns;
      tcw = tcw < 40 ? 40 : tcw;
      $rtc_grid.find('.resizer:eq('+i+')').width(tcw);
    }
    for(var i=0; i<ncolumn; i++){
      $curr_rtc_gh_item = $rtc_grid_header.find('.rtc_gh_item:eq('+i+')');
      $curr_rtc_gh_item.width($rtc_grid.find('.resizer:eq('+i+')').width());
      if($curr_rtc_gh_item.text() == '') $curr_rtc_gh_item.html('&nbsp;')
    }
    
    $rtc_grid_header.find('.rtc_gh_item').mousemove(function(event){
      var x = event.pageX - $(this).offset().left;
      if(!mousedown){
        nearleft = false;
        nearright = false;
        resized_column = -9;
        if(x < 2*rezrad && $(this).index() > 0){
          $(this).css({cursor: 'col-resize'});
          nearleft = true;
          nearright = false;
        }
        else if(($(this).width() - x) < rezrad){
          $(this).css({cursor: 'col-resize'});
          nearright = true;
          nearleft = false;
        }
        else{
          $(this).css({cursor: 'auto'});
        }
      }
    }).mousedown(function(event){
      resized_column = $(this).index();
      mousedown = true;
      $('body').append($vertical_line = $('<div class="vertical_line"></div>'));
    });
    
    $(window).mousemove(function(event){
      if( mousedown 
        && (
          (nearleft && resized_column > 0)
          || (nearleft || nearright)
          )
        ){
        
        var rc = resized_column;
        if(nearleft) rc = resized_column - 1;
        var x = event.pageX - $elmt.offset().left;
        
        if(x > min_cwidth){
          $vertical_line.css({
            left: event.pageX,
            top: $rtc_gh_items.offset().top,
            height: $rtc_grid_header.height() + $rtc_grid.height() + 1
          });
        }
      }
    }).mouseup(function(event){
      if(mousedown){
        if(nearleft){
          resizeHeaderWidth(resized_column - 1);
        }
        else if(nearright){
          resizeHeaderWidth(resized_column);
        }
        $vertical_line.remove();
        resized_column = -9;
        nearleft = false;
        nearright = false;
        mousedown = false;
      }
    });
    
    // resize and adjust column width and table that containing it
    var resizeHeaderWidth = function($rc){
      var tch = Math.ceil($vertical_line.offset().left - $rtc_grid_header.find('.rtc_gh_item:eq('+$rc+')').offset().left);
      $rtc_grid_header.find('.rtc_gh_item:eq('+$rc+')').width(tch);
    
      var tmpwidth = 0;
      $rtc_gh_items.find('.rtc_gh_item').each(function(index){
        tmpwidth += $(this).width();
      });
      
      $rtc_gh_items.width(tmpwidth);
      $rtc_grid.children('table').width(tmpwidth)
        .find('.resizer').each(function(index){
          $(this).width($rtc_grid_header.find('.rtc_gh_item:eq('+ index +')').width());
        });
    };
    
    // Scrolling header column container
    $rtc_grid.scroll(function(){
      $rtc_gh_items.css({
        left: $(this).scrollLeft() * (-1)
      });
      
      $(this).find('.rtc_loading').css({
        top: $rtc_grid.scrollTop()
      });
    });
   

    $rtc_gh_items.find('.rtc_gh_item a').each(function(){
      if($(this).is('.asc')){
        $(this).attr('href', $(this).attr('href').replace('asc', 'desc'));
      }
    });
    
    var tmpwidth = 0;
    $rtc_gh_items.find('.rtc_gh_item').each(function(index){
      tmpwidth += $(this).width();
    });
    
    $rtc_gh_items.width(tmpwidth);
    
    
    $elmt.resizable({
      minWidth: $elmt.outerWidth(),
      maxWidth: $elmt.outerWidth(),
      alsoResize: $rtc_grid,
      distance: 3, 
      autoHide: true,
      handles: 's'
    });
    
    if(opts.show_advanced_search){
      $elmt.find('#advance_search').trigger('click');
    }

  });
};


jQuery.fn.st_formatRow = function(options){
  var defaults = {};
  var opts = jQuery.extend(defaults, options);
  return this.each(function(){
    var $elmt = jQuery(this);
    
    $elmt.find('td').wrapInner('<div class="cell"></div>');
    $elmt.find('.cell .row_utility, .cell .edit_form_row').each(function(){
      $(this).appendTo($(this).parents('td'));
    });
    
    
    // Adding numeric class for numeric cell
    $elmt.parents('.st_table_grid').find('.thcnumeric').each(function(){
      $elmt.find('td:eq('+$(this).index()+') .cell').addClass('numeric');
    });
    $elmt.parents('.st_table_grid').find('.thcprimary').each(function(){
      $elmt.find('td:eq('+$(this).index()+') .cell').addClass('primary');
    });
    
    $elmt.find('a.button.collapse').hide();
  })
};


jQuery.fn.st_tableGrid_update = function(options){
  return this.each(function(){
    var defaults = {
      width: 800,
      height: 200,
      header_label: [],
      columns: []
    };
    var opts = jQuery.extend(defaults, options);
  
    var $elmt = jQuery(this);
    var ncolumn = $elmt.find('.rtc_gh_item').size();
    var $table = $elmt.find('table').eq(0);
    
    for (var i = 0; i < opts.slices; i++) {
    }
    
    $table.children('tbody').children('tr:not(.resizers)').each(function(index){
      $(this).st_formatRow();
    });
    

    // Adding resizer cell
    var resizer = '<tr class="resizers">'
    for(var i=0; i<ncolumn; i++){
      resizer += '<th class="resizer"> </th>';
    }
    resizer += '</tr>';
    $table.prepend(resizer);
    
    var total_columns_width = 0;
    // Adjust initial column width
    for(var i=0; i<ncolumn; i++){
      $elmt.find('.resizer:eq('+i+')').width($elmt.find('.rtc_gh_item:eq('+i+')').width());
      total_columns_width += $elmt.find('.rtc_gh_item:eq('+i+')').width();
    }
    
    $table.width(total_columns_width == 0 ? '100%' : total_columns_width);

    /*
    if($elmt.find('table tr:last-child td').size() > 0 && (!($elmt.find('table tr:last-child td').size() == $elmt.find('.rtc_gh_item').size()))){
      alert("Total column mismatch, please fix this");
    }
    */
    
  });
};


// BASIC TABLE LOADING CONTENT

jQuery.fn.st_tableGrid_loading = function(options){
  return this.each(function(){
    var defaults = {
      message: 'Loading...',
      image: ''
    };
    var opts = jQuery.extend(defaults, options);

    var $elmt = jQuery(this);
    var $rtc_grid = $elmt.find('.rtc_grid');
    var scroller_width = 17;
  
    $elmt.find('.rtc_loading').remove();
    $rtc_grid.append('<div class="rtc_loading"><div class="loading_message">'+opts.image+'<span>'+opts.message+'</span></div></div>');
    $elmt.find('.rtc_loading').css({
      width: $rtc_grid.width() - scroller_width,
      height: $rtc_grid.height(),
      top: $rtc_grid.scrollTop()
    });
     
  });
};
















// POPUP

jQuery.fn.st_popup = function(options){
  var defaults = {
    title: "",
    message: "Are you sure?",
    ok_label: "Ok",
    cancel_label: "Cancel",
    ok: function(event){},
    cancel: function(event){},
    close: function(event){},
    loading: "Harap tunggu...",
    loading_image: "/gfx/load48.gif",
    close_button: "<div class='popup_close_button button small close'><div class='icon'></div></div>",
    autoclose: true,
    show_toolbar: true,
    width: "auto"
  };
  var opts = jQuery.extend(defaults, options);
  
  
  return this.each(function(){
    var $elmt = jQuery(this);
    var $popup = $('<div class="popup"></div>');
    var $popup_background = $('<div class="popup_background"></div>');
    var $popup_content = $('<div class="popup_content"></div>');
    var $popup_title = $('<div class="popup_title"></div>');
    var $popup_ok = $('<a href="#" class="popup_ok_button button">' + opts.ok_label + '</a>');
    var $popup_cancel = $('<a href="#" class="popup_cancel_button button">' + opts.cancel_label + '</a>');
    var $popup_close = $(opts.close_button);
    var $popup_toolbar = $('<div class="popup_toolbar"></div>');
     
    // Hide popup, remove all popup element
    var removePopup = function(){
      $popup.remove();
      $popup_background.remove();
    };
    
    if(opts.message == ''){
      $content = '<div class="load48"><img src="' + opts.loading_image + '" alt="' + opts.loading + '" /></div>'
    }
    // Remove before adding new popup

    removePopup();
    
    $popup_title.html('<span class="text">' + opts.title + '</span>');
    
    $popup_close.click(function(event){
      $(this).addClass('pressed');
      opts.close();
      removePopup();
      unpressedButton();
    });
    $popup_ok.click(function(event){
      $(this).addClass('pressed');
      opts.ok();
      opts.close();
      unpressedButton();
      if(opts.autoclose) removePopup();
    });
    $popup_cancel.click(function(){
      $(this).addClass('pressed');
      opts.cancel();
      opts.close();
      unpressedButton();
      removePopup();
      removeGlobalLoading();
    });
    $popup_background.click(function(event){
      opts.close();
      removePopup();
      unpressedButton();
    });
    $popup_toolbar.append($popup_ok).append($popup_cancel);
    
    $popup_content.html(opts.message);
    
    if(opts.show_toolbar){
      $popup_content.append($popup_toolbar);
    }
    $popup.append($popup_close).append($popup_title).append($popup_content);
    
    $('body').append($popup).append($popup_background);
    $('.popup, .popup_background').fadeIn('slow');
    $('.popup_background').height($(document).height());
    
    var top = ($(window).height() - $('.popup').outerHeight()) / 2.3;
    var max_height = ($(window).height() - 100);
    
    if($popup_content.height() > max_height){
      $popup_content.height(max_height);
    }
    
    $popup_content.width(opts.width - ($popup.outerWidth() - $popup_content.width()));
    if($popup_content.get(0).scrollWidth > $popup_content.width()){
      $popup_content.width($popup_content.get(0).scrollWidth);
    }
    
    $('.popup').css({
      'top': (top < 10 ? 10 : top),
      'left' : ($(window).width() - $('.popup').outerWidth()) / 2 
    });
    
    var dwidth = $popup.width() - $popup_content.width();
    var dheight = $popup.height() - $popup_content.height();
    // draggable & resizable
    $popup.draggable({
      handle: ".popup_title"
    }).resizable({
      alsoResize: $popup_content,
      minWidth: 240,
      minHeight: 126
    });
    //
    
    $popup_ok.focus();
    
    var unpressedButton = function(event){
      $elmt.removeClass('pressed');  
    };
    
  });
};





jQuery.fn.st_processMessage = function(options){
  var defaults = {
    message: t("processing"),
    show_loading: true,
    loading_image: '<img class="loading_image" src="/images/loading_image.gif" />',
    position: "after"
  };
  var opts = jQuery.extend(defaults, options);
  
  return this.each(function(){
    var $elmt = $(this);
  });
};



jQuery.fn.st_carouselWithThumbs = function(options){
  var defaults = {
    slideshow: true
  };
  var opts = jQuery.extend(defaults, options);

  return this.each(function(){
    var $elmt = jQuery(this);
    var $citem = $elmt.children();
    $citem.addClass('carousel_item');
    $elmt.append('<div class="st_oc"><div class="st_cc"></div></div><div class="st_thumbs"></div>');
    $citem.appendTo('.st_cc');
    var $st_cc = $elmt.find('.st_cc');
    var $st_oc = $elmt.find('.st_oc');
    var $size = $citem.size();
    
    var delay = 10000;
    var speed = 'slow'

    $elmt.css({
      position: 'relative'
    });
    
    $st_oc.css({
      height: $elmt.height(),
      width: $elmt.width(),
      overflow: 'hidden',
      position: 'relative'
    });
    
    $st_cc.css({
      height: $elmt.height(),
      width: $elmt.width() * $size,
      overflow: 'hidden',
      position: 'absolute'
    });
    
    $citem.css({
      position: 'relative',
      height: $elmt.height(),
      width: $elmt.width(),
      float: 'left',
      overflow: 'hidden'
    });
    
    $citem.find('.carousel_item_description').css({
      position: 'absolute',
      height: $elmt.height(),
      width: $elmt.width(),
      top: '0px',
      left: '0px',
      overflow: 'hidden'
    });
    
    
    // Setting up previous n next control
    var $cidx = 0;
    var $prev = $elmt.find('.st_prev');
    var $next = $elmt.find('.st_next');
    
    $prev.css({
      float: 'left'
    }).click(function(){
      $cidx = ($cidx == 0) ? $size - 1 : $cidx - 1;
      $st_cc.animate({
        left: $cidx * -$elmt.width()
      }, 'medium', 'easeInQuint');
    });
    
    $next.css({
      float: 'right'
    }).click(function(){
      nextPage();
    });
    
    var $next_interval = setInterval ( "nextPage()", delay );
    nextPage = function(){
      $cidx = ($cidx == $size - 1) ? 0 : $cidx + 1;
      goTo($cidx);
    }
    var goTo = function($gt_idx){
      $cidx = $gt_idx;
      $st_cc.animate({
        left: $cidx * -$elmt.width()
      }, speed, 'easeInQuint');
      $st_thumbs.find('.st_thumbs_item').removeClass('selected').parent().find('.st_thumbs_item').eq($cidx).addClass('selected');
    }

    $elmt.hover(function(){
      clearInterval($next_interval);
    }, function(){
      $next_interval = setInterval ( "nextPage()", delay );
    });
    
    
    
    var $st_thumbs = $elmt.find('.st_thumbs');
    
    $st_oc.find('.carousel_item').each(function(){
      $st_thumbs.append('<div class="st_thumbs_item"></div>');
    });
    
    $st_thumbs.css({
      position: 'absolute'
    }).find('.st_thumbs_item').css({
    });
    $st_thumbs.find('.st_thumbs_item').click(function(){
      goTo(jQuery(this).index());
    }).eq(0).addClass('selected');
    
  });
};













jQuery.fn.st_entriesCarouselServices = function(options){
  var defaults = {
  };
  var opts = jQuery.extend(defaults, options);
  
  return this.each(function(){
    var $elmt = jQuery(this);

    var $container = $(
      '<div class="component_content"></div>'
    );
    $container.appendTo($elmt);
    $elmt.addClass('component');

    var portal_address = $elmt.data('source');
    $.ajax({
      url: portal_address + '/entries.json/?callback=?',
      dataType: 'json',
      data: {
        entry_type: 'post',
        related_site: $elmt.data('categorySite')
      },
      success: function(feeds){
        console.log(feeds);

        var markup = $('<div></div>')

        var carousel = $('<div></div>').addClass('carousel');
          var carousel_image = $('<img src="http://sia.unm.ac.id/assets/favicon.png" data-src="' + portal_address + '${featured_image_url.fit}" />')
          var carousel_content = $('<div></div>').addClass('carousel_content');
        
            var title = $('<h2></h2>').html('<a href="data-href" data-href="/entries/${id}">${title}</a>');
            var content = $('<h3></h3>').html('{{html description}}');

        title.appendTo(carousel_content);
        content.appendTo(carousel_content);

        carousel_image.appendTo(carousel);
        carousel_content.appendTo(carousel);

        carousel.appendTo(markup);

        $.template( 'carousel_template', markup );
        $.tmpl( 'carousel_template', feeds ).appendTo( $elmt.find('.component_content') );

        $('a[href=data-href]').each(function(){
          $(this).attr('href', $(this).attr('data-href'));
        });

        $('[src="http://sia.unm.ac.id/assets/favicon.png"]').each(function(){
          $(this).attr('src', $(this).attr('data-src'));
        });

        $elmt.find('.component_content').st_carouselWithThumbs();
      },
      error: function(XMLHttpRequest, textStatus, errorThrown){
        console.log(XMLHttpRequest);
        console.log(textStatus);
        console.log(errorThrown);
      }
    });

  });
}



jQuery.fn.st_entriesServices = function(options){
  var defaults = {
  };
  var opts = jQuery.extend(defaults, options);
  
  return this.each(function(){
    var $elmt = jQuery(this);

    var $container = $(
      '<div class="component_content">' +
      '  <div class="rtc_header">' +
      '    <div class="rtc_title">Entries</div>' +
      '  </div>' +
      '  <div class="rtc_content">' +
      '    <div class="rtc_grid_header" style="display: none !important">' +
      '      <div class="rtc_gh_item">&nbsp;</div>' +
      '    </div>' +
      '    <div class="rtc_grid">' +
      '      <table>' +
      '      </table>' +
      '    </div>' +
      '  </div>' +
      '</div>'
    );
    $container.appendTo($elmt);
    $elmt.addClass('rich_table_component entries_services');

    var portal_address = $elmt.data('source');
    $.ajax({
      url: portal_address + '/entries.json/?callback=?',
      dataType: 'json',
      data: {
        entry_type: 'post',
        related_site: $elmt.data('categorySite')
      },
      success: function(feeds){
        console.log(feeds);

        var markup = $('<div></div>')

        var list_view_row = $('<tr></tr>').addClass('list_view_row');
          var list_td = $('<td></td>');
            var lvr_entry = $('<div></div>').addClass('lvr_entry');
              var lvr_entry_content = $('<div></div>').addClass('lvr_entry_content');
                var lvr_entry_main_content = $('<div></div>').addClass('lvr_entry_main_content');
              var lvr_entry_meta = $('<div></div>').addClass('lvr_entry_meta');
              var lvr_entry_description = $('<div></div>').addClass('lvr_entry_description').html('{{html description}}');

        var title = $('<h1></h1>').html('<a href="data-href" data-href="/entries/${id}">${title}</a>');
        title.appendTo(lvr_entry_content);

        var image_thumbnail = $('<img src="http://sia.unm.ac.id/assets/favicon.png" data-src="' + portal_address + '${featured_image_url.thumbsquare}" />')
        image_thumbnail.prependTo(lvr_entry);

        var author = $('<span></span>').html('Penulis: ${user.email}');
        var posted_date = $('<span></span>').html('Dipublikasikan pada: ${created_at}');
        author.appendTo(lvr_entry_meta);
        posted_date.appendTo(lvr_entry_meta);

        lvr_entry_content.append(lvr_entry_main_content);
        lvr_entry.append(lvr_entry_content).append(lvr_entry_meta).append(lvr_entry_description)
        list_view_row.append(list_td.append(lvr_entry));
        markup.append(list_view_row);

        $.template( 'entry_template', markup );
        $.tmpl( 'entry_template', feeds ).appendTo( $elmt.find('.rtc_content .rtc_grid > table') );

        $('.rich_table_component.entries_services > .component_content').st_tableGrid();

        $('a[href=data-href]').each(function(){
          $(this).attr('href', $(this).attr('data-href'));
        });

        $('[src="http://sia.unm.ac.id/assets/favicon.png"]').each(function(){
          $(this).attr('src', $(this).attr('data-src'));
        });
      },
      error: function(XMLHttpRequest, textStatus, errorThrown){
        console.log(XMLHttpRequest);
        console.log(textStatus);
        console.log(errorThrown);
      }
    });

  });
}


jQuery.fn.st_singleEntryServices = function(options){
  
  return this.each(function(){
    var defaults = {
    };
    var opts = jQuery.extend(defaults, options);

    var $elmt = jQuery(this);

    var $container = $(
        '  <div class="component_content">' +
        '    <div class="entry">' +
        '      <div class="entry_title">' +
        '        <h1>' +
        '        </h1>' +
        '      </div>' +
        '      <div class="entry_meta">' +
        '        <span class="publish_info">' +
        '        </span>' +
        '      </div>' +
        '      <div class="featured_image">' +
        '      </div>' +
        '      <div class="entry_content">' +
        '      </div>' +
        '    </div>' +
        '  </div>'
      );

    $container.appendTo($elmt);
    $elmt.addClass('component single_component');

    var portal_address = $elmt.data('source');
    $.ajax({
      url: portal_address + '/entries/' + $elmt.data('entryId') + '.json/?callback=?',
      dataType: 'json',
      data: {
        entry_type: 'post',
        related_site: $elmt.data('categorySite')
      },
      success: function(feed){
        $elmt.find('.entry_title h1').html(feed.title);
        $elmt.find('.entry_content').html(feed.content);
        $elmt.find('.featured_image').html('<img src="' + portal_address + feed.featured_image_url.fit + '" />');
        $elmt.find('.publish_info').html('Dibuatkan pada: ' + feed.created_at + ', oleh: ' + feed.user.email);
      },
      error: function(XMLHttpRequest, textStatus, errorThrown){
        console.log(XMLHttpRequest);
        console.log(textStatus);
        console.log(errorThrown);
      }
    });

  });
}



// Recapitulation

jQuery.fn.st_recapitulationMatrix = function(options){
  
  return this.each(function(){
    var defaults = {
    };
    var opts = jQuery.extend(defaults, options);

    var $elmt = jQuery(this);

    var columns = '';
    var copy_recapitulation_matrix = $.extend(true, [], opts.recapitulation_matrix);
    label_col = copy_recapitulation_matrix.shift();
    for(var i=0; i<label_col.length; i++){
      columns += '<div class="rtc_gh_item" title="' + label_col[i] +  '"><a>' + label_col[i] + '</a></div>';
    }

    var $container = $(
      '<div class="component_content">' +
      '  <div class="rtc_header">' +
      '    <div class="rtc_title">Entries</div>' +
      '  </div>' +
      '  <div class="rtc_content">' +
      '    <div class="rtc_grid_header">' +
              columns +
      '    </div>' +
      '    <div class="rtc_grid">' +
      '      <table>' +
      '      </table>' +
      '    </div>' +
      '  </div>' +
      '</div>'
    );
    $container.appendTo($elmt);
    $elmt.addClass('rich_table_component recapitulation_matrix');


    var markup = $('<div></div>')

    var list_view_row = $('<tr></tr>').addClass('list_view_row');

    var list_td = $('<td style="font-weight: bold" title="{{= $data['+0+']}}">{{= $data['+0+']}}</td>');
    list_view_row.append(list_td);
    for(var i=1; i<label_col.length; i++){
      var list_td = $('<td class="numeric" title="{{= $data['+i+']}}">{{= $data['+i+']}}</td>');
      list_view_row.append(list_td);
    }

    markup.append(list_view_row);

    $.template( 'entry_template', markup );
    $.tmpl( 'entry_template', copy_recapitulation_matrix ).appendTo( $elmt.find('.rtc_content .rtc_grid > table') );

    $elmt.find('.component_content').st_tableGrid();

  
  });
}




// ONLOAD

$(function(){
  $('.button.disabled, .button.pressed').live('click', function(event){
    event.preventDefault();
    return false;
  });
  $('a.button.remote, a[attr="#"]').live('click', function(event){
    event.preventDefault();
  });
  
  $('.rtc_grid input[type=text]').live('focus', function(event){
    $(this).addClass('focus');
  });

  
  $('.carousels').st_entriesCarouselServices();
  $('.entries_services').st_entriesServices();
  $('.single_entry_services').st_singleEntryServices();
});


(function($){
    var _dataFn = $.fn.data;
    $.fn.data = function(key, val){
        if (typeof val !== 'undefined'){ 
            $.expr.attrHandle[key] = function(elem){
                return $(elem).attr(key) || $(elem).data(key);
            };
        }
        return _dataFn.apply(this, arguments);
    };
})(jQuery);