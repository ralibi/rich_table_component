// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery_ujs
//= require jquery-ui-1.8.13.custom.min
//= require jquery.tmpl.min
//= require jquery.tokeninput
//= require twitter/bootstrap
//= require jquery.fileupload
//= require jquery.fileupload-ui
//= require ckeditor/init
//= require ckeditor/adapters/jquery
//= require nested_attribute_action
//= require admin/starqle.grid
//= require admin/starqle.ui.jquery

  
$(function(){
  $.ajaxSetup({ beforeSend: function(xhr, settings){ xhr.setRequestHeader("Accept", "text/javascript"); } });
  $('.rich_table_component > .component_content').st_tableGrid();
  
  ajaxifyTableGrid();
  
  // live datepicker
  $('.datepicker').live("click", function(event){ $(this).not('.hasDatePicker').datepicker({changeMonth: true, changeYear: true, dateFormat: DATE_FORMAT}).focus(); });

  // Initialize CKEditor for nested attributes
  $('.nested_ckeditor').each(function(){
    try { CKEDITOR.replace($(this).attr('id')); } catch(e){}  
  });

  removeGlobalLoading();
  renderJqueryFileUpload();
  renderTokens();
  resetNestedFieldDestroy();
});

function renderTokens() {
  // body...
}

