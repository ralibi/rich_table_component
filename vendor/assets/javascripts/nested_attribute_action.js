function remove_fields(link) {
  jQuery(link).prev("input[type=hidden]").val("1");
  jQuery(link).closest(".well").hide();
  jQuery(link).closest(".nested_field").hide();
}

function add_fields(link, association, content) {
  var new_id = new Date().getTime();
  var regexp = new RegExp("new_" + association, "g");
  var new_content = content.replace(regexp, new_id);
  jQuery(link).parent().before(new_content);

  $(new_content).find('.nested_ckeditor').each(function(){
    try { CKEDITOR.replace($(this).attr('id')); } catch(e){}  
  });
  renderSingleTokensById('opened_course_class_course_schedules_attributes_' + new_id + '_classroom_tokens', '/classrooms/autocomplete.json');
}


