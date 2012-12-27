module MenusHelper

  def construct_all_menu
    result = ""
      Menu.roots.each do |menu_root|
        if current_user.present?
          result << '<div class="component menu menu_component grid_3 alpha omega"><div class="component_content">'
          result << (construct_menu menu_root.sorted_tree)
          result << '</div></div>'
        end
      end
    sanitize result
  end
  

  def construct_menu_group(menu_group_id)
    result = ""
    if(Menu.exists?(menu_group_id))
      menus = Menu.find(menu_group_id).sorted_tree
      menus.keep_if{|menu| (menu.roles & current_user.roles).present?}
      if current_user.present? && menus.present?
        result << '<div class="component menu menu_component grid_3 alpha omega"><div class="component_content">'
        result << (construct_menu menus)
        result << '</div></div>'
      end
    end
    sanitize result
  end

  def construct_menu(menus)
    result = ""
    menus.keep_if{|menu| (menu.roles & current_user.roles).present?}
    
    if menus.length > 0
      root_depth = menus[0].depth
      curr_depth = root_depth - 1
      menus.each do |menu|
        if menu.depth > curr_depth
          result << '<ul class="parent_' + (menu.depth - root_depth).to_s + '">'
        elsif menu.depth < curr_depth
          result << '</ul></li>' * (curr_depth - menu.depth)
        else
          # same level
          result << '</li>'
        end
        result << '<li class="child_' + (menu.depth - root_depth).to_s + '">'
        result << menu_item(menu)
        curr_depth = menu.depth
      end
      result << '</li></ul>' * (curr_depth - menus[0].depth + 1)
    end
    sanitize result
  end
  
  def menu_item(menu)
    link_to t(menu.name), (menu.url.start_with?("'") ? eval("User.send(:sanitize_sql_array, [#{menu.url}])") : menu.url), class: ('menu_item ' + (menu.url == request.original_fullpath ? 'current_menu_item' : ''))
  end
  
    
  def breadcrumbs_component limit=20
    results = []
    results << (link_to icon('home', t('home')), '/', title: t('home'))
    @parent_object = nil
    if @parent_resources.present?
      @parent_resources.reverse!.each_with_index do |pr, i|
        begin
          if i > 0
            results << (link_to t("#{pr.singularize}"), {controller: pr, action: 'index', (@parent_resources[i - 1].singularize + '_id') => instance_variable_get("@#{@parent_resources[i - 1].singularize}").id})
          else
            results << (link_to t("#{pr.singularize}"), {controller: pr, action: 'index'})
          end
        rescue
          results << t("#{pr.singularize}")
        end
        pr_id = params[(pr.singularize + '_id').to_sym]
        parent_object = pr_id.present? ? pr.classify.constantize.find(pr_id) : instance_variable_get("@#{pr.singularize}")
        results << {parent_object: @parent_object, resource: pr, current: (link_to parent_object.to_s, {controller: pr, action: 'show', id: parent_object}) + (link_to ('&nbsp;<b class="caret"></b>').html_safe, '#', "data-toggle" => 'dropdown', class: 'dropdown-toggle')}
        @parent_object = parent_object
      end
    end
    if params[:id]

      if @parent_resources.present?
        results << (link_to t("#{controller_name.singularize}"), {controller: controller_name, action: 'index', (@parent_resources.last.singularize + '_id') => instance_variable_get("@#{@parent_resources.last.singularize}").id})
      else
        begin
          results << (link_to t("#{controller_name.singularize}"), {controller: controller_name, action: 'index'})
        rescue
          results << t("#{controller_name.singularize}")
        end
      end
      current_object = controller_name.classify.constantize.find(params[:id])
      results << {parent_object: @parent_object, resource: controller_name, current: (link_to current_object.to_s, {controller: controller_name, action: 'show', id: current_object}) + (link_to ('&nbsp;<b class="caret"></b>').html_safe, '#', "data-toggle" => 'dropdown', class: 'dropdown-toggle')}
    elsif !controller_name.eql?('home')
      results << t("#{controller_name.singularize}")
    end
    render 'rich_table_component/component/breadcrumbs', breadcrumbs: results, limit: limit
  end
  

  
  def static_menu(options = {}, title_options = {}, icon_options = {})
    case options
    when Hash
      _menus = options[:menu]
      _title = options[:title]
      _icon = options[:icon]
    else
      _menus = options
      _title = title_options
      _icon = icon_options
    end


    result = ""
    sub_result = static_menu_li(menus: _menus, title: _title)

    unless sub_result.length < 50
      # list is not empty
      #result << '<div class="grid_3 alpha omega">'
      if _title.present?
        result << ' <li class="dropdown">'
        result << '<a href="#" class="dropdown-toggle" data-toggle="dropdown">' + _title + '<b class="caret"></b></a>'
      end
      result << sub_result
      if _title.present?
        result << ' </li>'
      end
      #result << '</div>'
    end
    result.html_safe
  end

  def static_menu_li(options = {})
    menus = options[:menus]
    level = options[:level].presence || 0
    title = options[:title]
    ability = options[:ability]

    result = ""

    if menus.present? 
      result << '<ul class="dropdown-menu parent_' + level.to_s + '">' if title.present?
      menus.compact.each do |menu|
        subresult = ""
        subresult << '<li class="child_' + level.to_s + '">'

        case menu
        when Array
          subresult << (static_menu_li menus: menu, level: (level + 1)).presence || ""
        when Hash
          subresult << (link_to menu[:label], menu[:url], class: 'menu_item')
        else
          subresult << menu
        end
          
        subresult << '</li>'

        if menu.class == Hash && menu[:ability].present?
          unless can?(menu[:ability].keys.first, menu[:ability].values.first)
            subresult = ""
          end
        end


        if ability.present?
          unless can?(ability.keys.first, ability.values.first)
            subresult = ""
          end
        end

        result << subresult

      end
      result << '</ul>' if title.present?
      result
    end

  end


end
