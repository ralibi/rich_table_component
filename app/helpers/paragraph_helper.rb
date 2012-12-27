module ParagraphHelper

  def prettify_notification str=''
    str.gsub!(/\B(##)\w*[a-zA-Z0-9_]+\w*/) do |x| 
      obj = (x.split('_')[0][2..100]).constantize.find_all_by_id(x.split('_')[1]).last
      if can? :read, obj
        link_to obj.to_s, obj
      else
        obj.to_s
      end
    end
    str.html_safe
  end

  # required for truncating html
  require 'rexml/parsers/pullparser'
  
  # Return truncating in html raw format
  def truncate_html(text, len = 30, at_end = ' ...')
    p = REXML::Parsers::PullParser.new((text.presence || '<p> </p>').gsub(/[\r\n\t]/, ''))
    tags = []
    new_len = len
    results = ''
    while p.has_next? && new_len > 0
      p_e = p.pull
      case p_e.event_type
      when :start_element
        tags.push p_e[0]
        results << "<#{tags.last}#{attrs_to_s(p_e[1])}>"
      when :end_element
        results << "</#{tags.pop}>"
      when :text
        results << p_e[0][0..new_len]
        new_len -= p_e[0].length
      else
        results << "<!-- #{p_e.inspect} -->"
      end
    end
    if at_end && (sanitize(text).try(:length).to_i) > len
      results << at_end
    end
    tags.reverse.each do |tag|
      results << "</#{tag}>"
    end
    raw(results)
  end
  
  private

    def attrs_to_s(attrs)
      if attrs.empty?
        ''
      else
        ' ' + attrs.to_a.map { |attr| %{#{attr[0]}="#{attr[1]}"} }.join(' ')
      end
    end
end
