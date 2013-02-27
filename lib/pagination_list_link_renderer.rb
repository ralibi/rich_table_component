class PaginationListLinkRenderer < WillPaginate::ActionView::LinkRenderer
  # << < page x of x > >> y per page

  def container_attributes
    super.except(:first_label, :last_label)
  end
  
  def to_html
    html = pagination.map do |item|
      item.is_a?(Fixnum) ?
        page_number(item) :
        send(item)
    end.join(@options[:link_separator])
    
    @options[:container] ? html_container(html) : html
  end

  protected

    def pagination
      [ :first_page, :previous_page, :current_page_info, :next_page, :last_page, :per_page_navigator, :input_page_navigator ]
    end

    def first_page
      previous_or_next_page(current_page == 1 ? nil : 1, "<<", "first_page")
    end

    def last_page
      previous_or_next_page(current_page == total_pages ? nil : total_pages, ">>", "last_page")
    end
    
    def current_page_info
      '<div class="current_page_part">' + I18n.t("will_paginate.current_page_info", {current_page: current_page, total_pages: total_pages}) + '</div>'     
    end
    
    def input_page_navigator
      '<div class="go_to_page_part"><div>' + I18n.t("will_paginate.go_to_page") + ": </div>" + tag(:input, "", :type => "text", :name => "page", :value => @options[:page].presence || 1) + tag(:a, "Go", :href => "#{url(1)}", :class => 'gotopage btn-mini', "data-remote" => 'true') + '</div>'
    end
    
    def per_page_navigator
      per_page_options = [5, 10, 20, 50, 100, 200]
      '<div class="per_page_part">' + (tag(:select, per_page_options.map{|m| "<option #{(m==@options[:per_page].to_i ? 'selected=selected' : '')}>#{m}</option>"}.join, :data_value => @options[:per_page], :name => "per_page").html_safe) + I18n.t("will_paginate.per_page") + '</div>'
    end

    def link(text, target, attributes = {})
      attributes["data-remote"] = @options[:remote].presence || false
      super
    end

end
