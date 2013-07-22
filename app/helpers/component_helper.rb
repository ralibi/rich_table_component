module ComponentHelper


  # rendering link for sortable column that used by rich table component
  def sort_link(column = {}, options = {})
    new_params = Hash.new
    new_params.merge! params
    case column
    when Hash
      new_params.merge!(column[:params]) if column[:params].present?
      options[:title] ||= column[:title].to_s

      if column[:value].present?
        options[:title] = column[:label]
        column = column[:value]
      else
        column = column[:column]
      end
    when Array
      options[:title] = column[1].presence || column.first.to_s.split('.').last(2).join('_')
      column = column.first
    end

    options[:title] = options[:title].presence || column.to_s.split('.').last(2).join('_')

    options[:controller] ||= controller_name
    
    options[:params][:rtc_controller_name] = options[:rtc_controller_name].presence || controller_name
    options[:params][:rtc_partial] = options[:rtc_partial] if options[:rtc_partial].present?
    
    css_class = (column == sort_column) ? "current #{sort_direction}" : nil  
    direction = (column == sort_column && sort_direction == "asc") ? "desc" : "asc"  
    options[:params].stringify_keys!
    new_params.merge!(options[:params])
    if !action_name.eql? 'index'
      new_params.merge!({pgos: true})
    end
    new_params.merge!({controller: options[:controller], sort: column, direction: direction, page: params[:page]}.stringify_keys!)
    #new_params.merge!({controller: options[:controller], sort: column, direction: direction, page: params[:page]})
    
    link_to t("#{options[:title]}"), new_params, {class: css_class, remote: true, title: t("#{options[:title]}")}  
  end




  # Return part div
  def part(opts = {})
    content_tag :div, class: "part #{opts[:class]}" do
      if opts[:label].present?
        content_tag(:span, opts[:label], class: "part_label") + 
        content_tag(:span, opts[:value], class: "part_value", title: opts[:title], rel: 'tooltip')        
      else
        content_tag(:span, opts[:value], class: "part_value", title: opts[:title], rel: 'tooltip')
      end
    end
  end



  def icon(ico, text = '', pos = 'left')
    if pos.eql? 'right'
      sanitize text + ' <i class="icon-' + ico + '"></i>'
    else
      sanitize '<i class="icon-' + ico + '"></i> ' + text
    end
  end



  def button_form_actions(fobj)
    result = ''
    # result << (fobj.error :base).presence || ''
    result << '<div class="form-actions">'
    result << (fobj.button :submit, 'Simpan', class: 'btn btn-large btn-primary btn_submit')
    result << '</div>'
    result.html_safe
  end



  def button_edit(obj, opts = {})
    opts[:scope_params] ||= {}
    ( link_to icon('pencil'), {controller: obj.class.name.tableize, id: obj, action: :edit}.merge(opts[:scope_params]), remote: true, title: 'Ubah data', rel: 'tooltip', class: 'btn btn-mini edit' ).html_safe
  end

  def button_delete(obj, opts = {})
    opts[:scope_params] ||= {}
    ( link_to icon('trash'), {controller: obj.class.name.tableize, id: obj, action: :destroy}.merge(opts[:scope_params]), confirm: 'Apakah Anda yakin?', method: :delete, remote: true, title: 'Hapus data', rel: 'tooltip', class: 'btn btn-mini btn-danger delete' ).html_safe
  end

  def button_edit_delete(obj)
    [button_edit(obj), button_delete(obj)].join(' ').strip.html_safe
  end

  def button_edit_with_cancan(obj, opts = {})
    can?(:update, obj) ? button_edit(obj, opts).html_safe : ''
  end

  def button_delete_with_cancan(obj, opts = {})
    can?(:destroy, obj) ? button_delete(obj, opts).html_safe : ''
  end

  def button_edit_delete_with_cancan(obj, opts = {})
    [button_edit_with_cancan(obj, opts), button_delete_with_cancan(obj, opts)].join(' ').strip.html_safe
  end

  def code_with_name(code, name, row = 1)
    if row == 2
      "<strong>#{code}</strong><br/>#{name}".html_safe
    else
      "<strong>#{code}:</strong> #{name}".html_safe
    end
  end

  def uneditable_input_control(value, label = ' ')
    content_tag :div, class: "control-group" do
      content_tag(:label, label, class: "control-label") +
      content_tag(:div, class: "controls") do
        content_tag(:div, value, class: "uneditable-input-plain") 
      end
    end
  end


  def uneditable_textarea_control(value, label = ' ')
    content_tag :div, class: "control-group" do
      content_tag(:label, label, class: "control-label") +
      content_tag(:div, class: "controls") do
        content_tag(:div, value, class: "uneditable-textarea-plain") 
      end
    end
  end


  def lvr_row_id(item)
    "#{item.class.name.tableize.singularize}_list_view_row_#{item.id}"
  end

  def lvr_row_class(item)
    "#{controller_name}_#{item.class.name.tableize.singularize}_list_view_row"
  end

  def component_by_page slug
    comp_page = Page.find_by_slug slug
    result = ''
    if comp_page
      result =
        "<div class='component'>" +
        "  <div class='component_title'>" +
        "    <h2> #{comp_page.name}" +
        "    </h2>" +
        "  </div>" +
        "  <div class='component_content'>#{truncate_html(comp_page.description, 300)}" +
        "  </div>" +
        "</div>"
    end
    result.html_safe
  end

  def with_html_title text
    "<span title='#{text}'>#{text}</span>".html_safe if text.present?
  end

  def time_period(sdate, edate)
    strsdate = sdate.present? ? (mdate sdate) : "..."
    stredate = edate.present? ? (mdate edate) : "..."
    "#{strsdate} - #{stredate}"
  end

  # Needed for constructing dot format in recapitulation matrix
  def mapping_label(arr)
    [['mapping'] + arr].flatten.join('.')
  end

  def render_rtc(options)
    render partial: 'rich_table_component/rtc/component', locals: options
  end

  def render_rich_table_component(options)
    render partial: 'rich_table_component/rtc/component', locals: options
  end

  def render_recapitulation(options)
    render partial: 'rich_table_component/rtc/recapitulation_matrix', locals: options
  end

  def row_selection local_var_assignments, options = {}
    obj = local_var_assignments["#{local_var_assignments[:rtc_partial]}".to_sym]
    options[:visible] = true if options[:visible].nil?
    result = '<td class="numeric rtc_row_select_cell">'
    if options[:visible]
      result << (check_box_tag "#{obj.class.name.tableize}[]", obj.id, false, class: 'rtc_row_select', style: 'height: 0px; margin-top: 0px; margin-right: 7px;')
    end
    result << '</td>'

    result.html_safe
  end

  def row_number local_var_assignments
    counter = local_var_assignments["#{local_var_assignments[:rtc_partial].split('/').last}_counter".to_sym].presence || 0
    offset = local_var_assignments[:offset]
    result = '<td class="numeric rtc_row_number">'
    if offset
      result << "#{counter + offset + 1}."
    else
      result << '(baru)'
    end
    result << '</td>'

    result.html_safe
  end


  def fake_pagination(rtc_controller_name)
    per_page_options = [5, 10, 20, 50, 100, 200]
    result = '<div class="pagination">'
    result += '<span class="first_page disabled">&lt;&lt;</span>'
    result += '<span class="previous_page disabled">&lt;</span>'
    result += '<div class="current_page_part">Hal. 1 dari 1'
    result += '</div>'
    result += '<span class="previous_page disabled">&lt;</span>'
    result += '<span class="last_page disabled">&gt;&gt;</span>'
    result += '<div class="per_page_part">'
    result += (select_tag 'per_page', (per_page_options.map{|m| "<option #{(m==params[:per_page].to_i ? 'selected=selected' : '')}>#{m}</option>"}.join.html_safe))
    result += 'Per hal. </div>'
    result += '<div class="go_to_page_part">'
    result += '<input type="text" value="1" name="page">'
    result += (link_to "Go", {controller: rtc_controller_name}, remote: true, class: "gotopage btn-mini")
    result += '</div>'
    result += '</div>'
    result.html_safe
  end

  def error_message_list errors
    result = ""
    if errors.present?
      result += ' <div class="alert alert-error">'
      result += '   <ul>'
      errors.each do |k, v|
        result += '     <li>'
        result += t(k.to_s.split('.').join('_')) + ' ' + v
        result += '     </li>'
      end
      result += '   </ul>'
      result += ' </div>'
    end
    result.html_safe
  end

end


