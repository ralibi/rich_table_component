// -------------------------------------------------------------
// Define Constant

var NOTIFICATION = 0;
var SUCCESS = 1;
var WAITING = 2;
var WARNING = 3;
var ERROR = 4;

var DATE_FORMAT = 'dd-mm-yy';

var LOCALE = "id";
var translations = {
  "id": {
    "loading": "Memuat...",
    "sorting": "Mengurutkan...",
    "searching": "Mencari...",
    "refreshing": "Mensegarkan...",

    "loading_add_form": "Memuat form penambahan...",
    "loading_edit_form": "Memuat form perubahan...",
    "loading_form": "Memuat form...",
    "click_to_hide": "Klik untuk menyembunyikan...",
    
    "processing": "Memproses...",
    "saving": "Menyimpan...",
    "updating": "Memperbarui..." ,
    "deleting": "Menghapus...",
    "redirecting": "Memindahkan alamat...",
    "update_successful": "Berhasil mengubah",
    "update_failure": "Gagal mengubah",
    
    "loading_form_failed": "Gagal memuat form",

    "sent": "Terkirim",
    "sending": "Mengirim...",
    
    "are_you_sure": "Apakah anda yakin?",
    "delete": "Hapus",
  },
};
var LOADING_IMAGE = '<img class="loading_image" src="/assets/loading_image.gif" />';


var ajaxifyTableGrid = function(){

  $('.rtc_header .btn-group-view-toggle .btn').live('ajax:beforeSend', function(event, xhr, settings){
    var $ths = $(this);
    var $elmt = $(this).parents('.rich_table_component');
    var $pagination = $elmt.find('.pagination');

    $('.rich_table_component.updating').removeClass('updating');
    $elmt.addClass('updating');
    $elmt.st_tableGrid_loading({
      message: t("loading"),
      image: LOADING_IMAGE
    });
    
    var params = {};
    if($elmt.find('input#search').val() != ''){
      params = getSerializeArray($elmt.find('input#search').serializeArray());
    }

    // $.extend(params, getSerializeArray($elmt.find('form#filter_form').serializeArray()));
    params.list_view = $(this).data("list-view");
    
    settings.url += (settings.url.indexOf('?') >= 0 ? '&' : '?') + $.param(params);
  });



  // PAGINATING
  $('.pagination a').live('ajax:beforeSend', function(event, xhr, settings){
    
    var $ths = $(this);
    var $elmt = $(this).parents('.rich_table_component');
    $('.rich_table_component.updating').removeClass('updating');
    $elmt.addClass('updating');
    $elmt.st_tableGrid_loading({
      message: t("loading"),
      image: LOADING_IMAGE
    });
    var $pagination = $elmt.find('.pagination');
    var params = {};//$('#advance_search form').serializeArray();
    var $href = this.href
    
    // check if this is a "Go" button
    if($(this).is('.gotopage')){
      params.page = $pagination.find('input').val();
      $href = $(this).parents('.pagination').find('a').eq(0).get(0).href;
    }
    params.per_page = $.cookie('unm_pp');
    if($elmt.find('input#search').val() != '') {
      params.search = $elmt.find('input#search').val(); 
    }
    else{
      params = $.extend(params, getSerializeArray($elmt.find('form.rtc_advanced_search :input').serializeArray()));
    }
    params.pgos = true;
    settings.url += (settings.url.indexOf('?') >= 0 ? '&' : '?') + $.param(params);
  });
  

  // SORTING
  $('.rtc_gh_item a').live('ajax:beforeSend', function(event, xhr, settings){
    var $ths = $(this);
    var $elmt = $(this).parents('.rich_table_component');
    var $pagination = $elmt.find('.pagination');
    $('.rich_table_component.updating').removeClass('updating');
    $elmt.addClass('updating');
    $elmt.st_tableGrid_loading({
      message: t("loading"),
      image: LOADING_IMAGE
    });
    
    var params = {};
    params.per_page = $.cookie('unm_pp');
    if($elmt.find('input#search').val() != ''){
      params = getSerializeArray($elmt.find('input#search').serializeArray());
    }
    else{
      params = $.extend(params, getSerializeArray($elmt.find('form.rtc_advanced_search :input').serializeArray()));
    }
    
    $list_view = $elmt.find('.rtc_header .btn-group-view-toggle .btn.active').data('list-view');
    if($list_view == 'th') params.list_view = 'th';

    settings.url += (settings.url.indexOf('?') >= 0 ? '&' : '?') + $.param(params);
  }).live('ajax:success', function(){
    var $ths = $(this);
    var $elmt = $(this).parents('.rich_table_component');
    
    $elmt.find('.rtc_gh_item a').removeClass('asc').removeClass('desc');
    if($ths.attr('href').indexOf("=asc") != -1){
      $ths.attr('href', $ths.attr('href').replace('=asc', '=desc')).addClass('asc');
    }
    else if($ths.attr('href').indexOf("=desc") != -1){
      $ths.attr('href', $ths.attr('href').replace('=desc', '=asc')).addClass('desc');
    }
  });





  // SEARCHING (single term)
  $('.rtc_search #search').focus(function(event){
    $(this).select();
  });

  $('.rtc_search').live('ajax:beforeSend', function(event, xhr, settings){
    clearAdvanceSearch();
  
    var $ths = $(this);
    var $elmt = $(this).parents('.rich_table_component');
    var $pagination = $elmt.find('.pagination');
    
    $('.rich_table_component.updating').removeClass('updating');
    $elmt.addClass('updating');
    $elmt.st_tableGrid_loading({
      message: t("loading"),
      image: LOADING_IMAGE
    });

    var params = {}; //getSerializeArray($elmt.find('form#filter_form').serializeArray());
    // $.extend(params, getSerializeArray($(this).serializeArray()));
    params.page = 1;
    params.per_page = $.cookie('unm_pp');
    
    var $this_button = $ths.find('input[type=submit]');
    if($this_button.is('.disabled, .pressed')){return false;}
    $this_button.addClass('pressed');
    
    settings.url += (settings.url.indexOf('?') >= 0 ? '&' : '?') + $.param(params);
  }).live('ajax:success', function(){
    var $this_button = $(this).find('input[type=submit]');
    $this_button.removeClass('pressed');
  });
  



  $(
    '.btn.btn_new'
  )
  .live("ajax:before", function(){
    showGlobalNotification('Memuat...', {show_loading: true});
    $(this).parents('.rich_table_component').addClass('showing_new_form');
  }).live("ajax:success", function(){
    removeGlobalNotification();
  });


  $(
    '.button_create_presentation, ' + 
    '.edit'
  )
  .live("ajax:before", function(){
    showGlobalNotification(translate('loading_form'), {show_loading: true});
    $(this).parents('tr').addClass('lvr_entry_edited');
  }).live("ajax:success", function(){
    removeGlobalNotification();
  }).live("ajax:error", function(xhr, status, error){
    showGlobalNotification(translate(status.responseText), {type: ERROR});
  });

  
  $(
    '.btn_approve, ' + 
    '.btn_reject'
  ).live("ajax:before", function(){
    $(this).parents('tr').addClass('lvr_entry_edited');
  });

  $(
    '.rich_table_component .rtc_grid .btn.delete'
  )
  .live("ajax:before", function(evt, data, status, xhr){
    $(this).parents('tr').addClass('lvr_entry_deleted');
  });

  $(
    'form.simple_form'
  ).live('ajax:before', function(){
    $(this).find('.form-actions .btn_submit').button('loading');
  });




  // SEARCHING (advanced)
  $(
    'form.rtc_advanced_search'
  ).live('ajax:beforeSend', function(event, xhr, settings){
    var $elmt = $(this).parents('.rich_table_component');
    $('.rich_table_component.updating').removeClass('updating');
    $elmt.addClass('updating')
    // 
    clearNormalSearch();


    $elmt.st_tableGrid_loading({
      message: t("searching"),
      image: LOADING_IMAGE
    });

    //console.log("ADVANCED SEARCH");
    //return false;

    params = {};

    $elmt.find('form#filter_form input').each(function(){
      params[$(this).attr('name')] = $(this).attr('value')
    });

    params.page = 1;
    params.per_page = $.cookie('unm_pp');
    settings.url += (settings.url.indexOf('?') >= 0 ? '&' : '?') + $.param(params);
  }).live('ajax:complete', function(event, xhr, status){
    
  }).live("ajax:error", function(xhr, status, error){
    showGlobalNotification(translate(status.responseText), {type: ERROR});
  });

  // RESETING ADVANCED SEARCH
  $('form.rtc_advanced_search .clear_advanced_search').live('click', function(){
    var $form = $(this).parents('form');
    $form.find('input').val('');
    
    $form.find(':input')
     .not(':button, :submit, :reset, :hidden')
     .val('')
     .removeAttr('checked')
     .removeAttr('selected');

  });

  // HIDING ADVANCED SEARCH
  $('form.rtc_advanced_search .hide_advanced_search').live('click', function(){
    var $elmt = $(this).parents('.rich_table_component');
    $elmt.find('.advanced_search_toggle_button').trigger('click');
  });

  // TOGGLING ADVANCED SEARCH
  $('.advanced_search_toggle_button').live('click', function(){
    var $elmt = $(this).parents('.rich_table_component');
    if($(this).hasClass('active')){
      $elmt.find('.rtc_header_expanded').slideDown('fast');
    }
    else{
      $elmt.find('.rtc_header_expanded').slideUp('fast');
    }
  });


  clearNormalSearch();
  clearAdvanceSearch();




  initExportButton();
  initManualPopover();

  initActiveTab();
  initRecapitulation();
  initMultipleSelection();

  initCookies();
};

var initCookies = function(){
  if($.cookie('unm_pp') == undefined){
    $.cookie('unm_pp', $('.per_page_part').find('select').val());
  }
  $('.per_page_part').live('change', function(){
    var $elmt = $(this).parents('.rich_table_component');
    $.cookie('unm_pp', $(this).find('select').val());
    $elmt.find('.go_to_page_part').find('input').val(1);
    $elmt.find('.gotopage').trigger('click');
  });
};


var clearAdvanceSearch = function(){
  $('form.rtc_advanced_search').find('input[type=text]').val('');
  $('form.rtc_advanced_search :input')
   .not(':button, :submit, :reset, :hidden')
   .val('')
   .removeAttr('checked')
   .removeAttr('selected');
};


// Enabling file upload using jquery-file-upload
var renderJqueryFileUpload = function(){

  $('.document').fileUploadUI({
    uploadTable: $('.upload_files'),
    downloadTable: $('.download_files'),
    buildUploadRow: function (files, index) {
      var file = files[index];
      return $('<tr><td>' + file.name + '<\/td>' +
              '<td class="file_upload_progress"><div><\/div><\/td>' +
              '<td class="file_upload_cancel">' +
              '<button class="ui-state-default ui-corner-all" title="Cancel">' +
              '<span class="ui-icon ui-icon-cancel">Cancel<\/span>' +
              '<\/button><\/td><\/tr>');
    },
    buildDownloadRow: function (file) {
      var fresh_uploaded = $('<div class="attachment_part">' + 
        '  <div class="attachment_entry">' + 
        '    <input type="hidden" name="document_ids[]" value="' + file.id + '" />' + 
        '    <div class="attachment_entry_content">' + 
        '      <div class="attachment_entry_image">' + 
        '        <a href="/documents/' + file.id + '/download">' + 
        '          <img src="' + file.pic_path + '" alt="' + file.name + '">' + 
        '        </a>' + 
        '      </div>' + 
        '      <div class="attachment_entry_description">' + 
        '        <div class="file_name_part">' + 
        '          <a href="/documents/' + file.id + '/download">' +
                     file.name + 
        '          </a>' + 
        '        </div>' + 
        '        <div class="file_size_part">' + 
                  file.size + 
        '        </div>' + 
        '      </div>' + 
        '    </div>' + 
        '    <a class="btn btn-danger remove_fresh_uploaded"><i class="icon-remove"></i> Hapus</a>' +
        '  </div>' + 
        '</div>');
      fresh_uploaded.find('.remove_fresh_uploaded').click(function(){ $(this).parent().remove(); });
      $('.controls.document_upload_result .upload_files').before(fresh_uploaded);
      
    }
  });
};

var clearNormalSearch = function(){
  $('.rtc_search #search').val('');
};

var resetAllForm = function(){  
  $('form').each(function(index){
    this.reset();
  });
};

var increasePagination = function($elmt){
  $item_from = $elmt.find('.item_from');
  $item_to = $elmt.find('.item_to');
  $item_total = $elmt.find('.item_total');
  $item_to.text(parseInt($item_to.text()) + 1);
  $item_total.text(parseInt($item_total.text()) + 1);
};
var decreasePagination = function($elmt){
  $item_from = $elmt.find('.item_from');
  $item_to = $elmt.find('.item_to');
  $item_total = $elmt.find('.item_total');
  $item_to.text(parseInt($item_to.text()) - 1);
  $item_total.text(parseInt($item_total.text()) - 1);
};


var getParameterByName = function(name){
  var name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.search);
  if(results == null)
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}

var getSerializeArray = function($serialize_array){
  var obj = {};
  for(var i=0; i<$serialize_array.length; i++){
    obj[$serialize_array[i].name] = $serialize_array[i].value;
  }
  return obj;
};








// Temporarily moved from application.js
//////////////////////////////////////////////



var renderMultipleTokensById = function(token, url, min_chars){
  token_id = "#" + token;
  $(token_id).each(function(){
    console.log('called renderMultipleTokensById(): ' + token_id);
    $(this).tokenInput(url, {
      propertyToSearch: "name",
      resultsFormatter: function(item){ 
        var code = item.code == undefined ? '' : item.code; 
        var avatar = item.avatar_resource_tiny == undefined ? '' : "<img src='" + item.avatar_resource_tiny + "' title='" + item.name + " " + code + "' height='25px' width='25px' />"; 
        return "<li>" + avatar + "<div style='display: inline-block; padding-left: 10px;'><div class='name'>" + code + " - " + item.name + "</div></div></li>";
      },
      tokenFormatter: function(item) { 
        var code = item.code == undefined ? '' : item.code; 
        return "<li><p>" + code + " - " + item.name + "</p></li>";
      },
      theme: 'bootstrap',
      minChars: (min_chars == undefined ? 2 : min_chars),
      preventDuplicates: true,
      prePopulate: $(token_id).data('load')
    });
  });
};

var renderSingleTokensById = function(token, url, min_chars){
  token_id = "#" + token;
  $(token_id).each(function(){
    console.log('called renderSingleTokensById(): ' + token_id);
    $(this).tokenInput(url, {
      propertyToSearch: "name",
      resultsFormatter: function(item){ 
        var code = item.code == undefined ? '' : item.code; 
        var avatar = item.avatar_resource_tiny == undefined ? '' : "<img src='" + item.avatar_resource_tiny + "' title='" + item.name + " " + code + "' height='25px' width='25px' />"; 
        return "<li>" + avatar + "<div style='display: inline-block; padding-left: 10px;'><div class='name'>" + code + " - " + item.name + "</div></div></li>";
      },
      tokenFormatter: function(item) { 
        var code = item.code == undefined ? '' : item.code; 
        return "<li><p>" + code + " - " + item.name + "</p></li>";
      },
      theme: 'bootstrap',
      tokenLimit: 1,
      minChars: (min_chars == undefined ? 2 : min_chars),
      preventDuplicates: true,
      prePopulate: $(token_id).data('load')
    });
  });
};



// Translations
var t = function($str, $locale){
  if($locale == null){ $locale = LOCALE; }
  return (translations[$locale][$str] == undefined ? "translations."+$str+".missing" : translations[$locale][$str]);
};



// Reset nested destroy value to false. Prevent getting its value from cache
var resetNestedFieldDestroy = function(){
  $('.nested_field input[id$=__destroy]').val(false);
  $('.controls #document_ids').val('');
};


var renderModalTableGrid = function(){
  $('.modal-body .rich_table_component .component_content').st_tableGrid();
};

var renderRemoteCkeditor = function(){
  $('.remote_ckeditor').each(function(){
    try { 
      var hEd = CKEDITOR.instances[$(this).attr('id')];
      if (hEd) {
        hEd.destroy(hEd);
      }
      $(this).ckeditor();
    } catch(e){}}
  );
};





// GLOBAL NOTIFICATION START FROM HERE

var NOTIFICATION = 0;
var SUCCESS = 1;
var WAITING = 2;
var WARNING = 3;
var ERROR = 4;
var DANGER = 5;

var showGlobalNotification = function($message, options){

  var defaults = {
    show_loading: false,
    loading_image: LOADING_IMAGE,
    type: NOTIFICATION
  };
  var opts = $.extend(defaults, options);

  $type = opts.type;
  $('.global_notification').remove();
  $gl = $('<div class="global_notification"></div>').html((opts.show_loading ? opts.loading_image : '') + '  ' + $message).appendTo('body');
  
  switch($type){
    case NOTIFICATION:
      $gl.addClass('info');
      break;
    case SUCCESS:
      $gl.addClass('success');
      removeGlobalNotification();
      break;
    case WAITING:
      $gl.addClass('warning');
      break;
    case WARNING:
      $gl.addClass('warning');
      break;
    case ERROR:
      $gl.addClass('danger');
      break;
    case DANGER:
      $gl.addClass('danger');
      break;
    default:
      break;
  }
  
  
  $gl.click(function(event){
    $(this).slideUp(function(event){
      $(this).remove();
    });
  }).css({
    'margin-left': $('.global_notification').outerWidth() / -2
  }).attr({
    'title': 'Click to hide'
  });
  
};

var removeGlobalNotification = function(options){
  var defaults = {
    delay: 3000,
    immediate: false
  };
  var opts = $.extend(defaults, options);

  if(opts.immediate == false){
    setTimeout(function(){
      $('.global_notification').fadeOut('slow', function(){
        $(this).remove();
      })
    }, opts.delay);
  }
  else{
    $('.global_notification').fadeOut('fast')
  }
};



var removeGlobalLoading = function(options){
  removeGlobalNotification();
};



var translate = function(_str, _locale){
  if(_locale == undefined){
    _locale = LOCALE;
  }
  var result = translations[LOCALE][_str];
  return result == undefined ? _str : result
}


var initExportButton = function(){

  // OPENING EXPORT MODAL
  $('.rich_table_component').delegate('.btn_export', 'click', function(evt){
    evt.preventDefault();

    $('body').append(

    '<div id="export_modal" class="modal hide fade">' +
    '  <div class="modal-header">' +
    '    <button class="close" data-dismiss="modal">' +
    '      &times;' +
    '    </button>' +
    '    <h3>' +
    '      Meng-ekspor' +
    '    </h3>' +
    '  </div>' +
    '  <div class="modal-body">' +
    '    <div class="component form_component new_form_component">' +
    '      <div class="component_content">' +
    '        <div class="part form_part">' +
    '        </div>' +
    '      </div>' +
    '    </div>' +
    '  </div>' +
    '</div>'
    );

    var $elmt = $(this).parents('.rich_table_component');
    var $the_form = $(this).parent().find('.hide .export_form').clone();
    $the_form.append('<div class="hide"></div>') 
    $elmt.find('form#filter_form input').each(function(){
      $(this).clone().appendTo($the_form.find('.hide'));
    });

    // change form action to pdf if it's pdf
    if($(this).hasClass('btn_pdf')){
      $the_form.attr('action', $the_form.attr('action').replace('.xls', '.pdf'));
    }

    // append filter form
    var $el = $elmt.find('.rtc_advanced_search');

    if($el.length > 0 && $elmt.find('.rtc_search #search').val() == ''){
      $el.find('input').each(function(){
        $(this).clone().appendTo($the_form.find('.hide'));
      });

      $el.find('select').each(function(i){
        var select = this;
        $(this).clone().appendTo($the_form.find('.hide'));
        $the_form.find('.hide').find('select').eq(i).val($(select).val());
      });
    }
    else{
      $elmt.find('.rtc_search #search').clone().appendTo($the_form.find('.hide'));
    }


    $('#export_modal').find('.part.form_part').html($the_form).end().modal('show');

  });
};

var initManualPopover = function(){
    // Live tooltip
  // $('body').tooltip({
  //   selector: '[rel=tooltip], [rel=tooltip nofollow]'
  // });

  // // Live popover
  // $('body').popover({
  //   selector: '[rel=popover], [rel=popover nofollow]'
  // });
  $("[rel=popover]").popover({ trigger: 'manual', html: 'true' }).hover(function(e){ 
    $("[rel=popover]").not(this).popover('hide');
    $(this).popover('show');
    e.preventDefault(); 
  }, function(){
    // 
  });
  // $(".tooltip").tooltip();
  // $("a[rel=tooltip]").tooltip();
  $(document).click(function(evt){
    if(!$(evt.target).hasClass('close') && ($(evt.target).hasClass('popover') || $(evt.target).parents('.popover').length > 0)){

    }
    else{
      $("[rel=popover]").popover('hide');
    }
  });
};

// initialize hash active tab for bootstrap tab
var initActiveTab = function(){

  // activate first hash for active tab
  var activeTab = $('[href=' + location.hash + ']');
  activeTab && activeTab.tab('show');

  $('#myTab a').click(function (e) {
    e.preventDefault();
    window.location.hash = $(this).attr('href').substr(1);
    $(this).tab('show');
  });

  var locationHashChanged = function(){
    var activeTab = $('[href=' + location.hash + ']');
    if(activeTab.length > 0){
      activeTab.tab('show');
    }
    else{
      $('#myTab a:first').tab('show');
    }
  }
   
  window.onhashchange = locationHashChanged;
};

// Initialize racpitulation matrix
var initRecapitulation = function(){
  // 
  $('.recapitulation_form').live('ajax:beforeSend', function(event, xhr, settings){
    $(this).parent('.well').find('.recapitulation_result').remove();
    var $recapitulation_result = $('<div>Mengkalkulasi rekapitulasi...</div>').addClass('recapitulation_result');
    $(this).parent('.well').append($recapitulation_result);
    if(settings.url.indexOf('&export_pdf=') > 0){
      settings.url += (settings.url.indexOf('?') >= 0 ? '&' : '?');
      location.href = settings.url + '&format=pdf';
    }
    else if(settings.url.indexOf('&export_xls=') > 0){
      settings.url += (settings.url.indexOf('?') >= 0 ? '&' : '?');
      location.href = settings.url + '&format=xls';
    }
  }).live('ajax:success', function(){
    if (recapitulation_error != null){
      alert(recapitulation_error.message);
    }
    else{
      $(this).parent('.well').find('.recapitulation_result').remove();
      var $recapitulation_result = $('<div></div>').addClass('recapitulation_result');
      $(this).parent('.well').append($recapitulation_result);

      $recapitulation_result.st_recapitulationMatrix({recapitulation_matrix: recapitulation_matrix});
    }
  });
};


// Initialize Multiple Selection 
var initMultipleSelection = function(){
  // 
  $('.rtc_select_all').attr({checked: false});
  $('.rtc_row_select').attr({checked: false});

  $('.rtc_select_all').live('change', function(){
    if($(this).attr('checked')){
      $(this).parents('.rtc_content').find('> .rtc_grid table').find('tr .rtc_row_select').attr({checked: true});
    }
    else{
      $(this).parents('.rtc_content').find('> .rtc_grid table').find('tr .rtc_row_select').attr({checked: false});
    }

  });


  $('.rtc_row_select').live('change', function(){
    if($(this).attr('checked')){
    }
    else{
      console.log('unchecked');
      $(this).parents('.rtc_content').find('> .rtc_grid_header').find('.rtc_select_all').attr({checked: false});
    }
  });


  $(
      'form.multiple_selection_form'
  ).live("ajax:before", function(){
    var $this_form = $(this);
    var $temp_multiple_selection_container = $('<div></div>').addClass('temp_multiple_selection_container hide');
    $this_form.find('.temp_multiple_selection_container').remove();
    $this_form.parents('.rich_table_component').find('.rtc_grid table tr .rtc_row_select').each(function(){
      if($(this).attr('checked')){
        var $cloned = $(this).clone();
        $cloned.attr({checked: true});
        $temp_multiple_selection_container.append($cloned);
      }
    });
    $this_form.append($temp_multiple_selection_container);
  });
};