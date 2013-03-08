require "rich_table_component/version"
require 'rubygems'

require 'sass-rails'
require 'less-rails'
require 'haml-rails'
require 'cancan'
require 'paperclip'
require 'ckeditor'
require 'ransack'
require 'squeel'
require 'redis'
require 'will_paginate'
require 'wicked_pdf'
require 'simple_form'
require 'compass-rails'
require 'twitter-bootstrap-rails'

require 'will_paginate/view_helpers/link_renderer'
require 'will_paginate/view_helpers/action_view'
require 'pagination_list_link_renderer'

require 'rich_table_component/core_extensions/string'

module RichTableComponent
  def self.ipsum
    "Lorem ipsum dolor sit amet, consectetur adipisicing vicerus luctum ...."
  end

  def self.included(base)
    base.extend(ClassMethods)
  end




  ## Define ControllerMethods
  module Controller
    ## this one manages the usual self.included, klass_eval stuff
    extend ActiveSupport::Concern

    included do
      helper_method :sort_column, :sort_direction
    end


      # get session per page for pagination
      def session_per_page
        session[:per_page] ||= DEFAULT_PER_PAGE
      end




      # Removes leading and trailing whitespace from ransack search params
      def strip_search_param
        case params[:q]
        when String
          params[:q].strip!
        when Hash
          params[:q].each_pair{|k, v| params[:q][k] = v.strip}
        else
        end
      end

      # Define default order by column
      # ralibi
      def default_sort
        @default_sort ||= "created_at"
      end

      # Set sorting direction for table grid
      # ralibi
      def sort_direction
        %w[asc desc].include?(params[:direction]) ?  params[:direction] : (@sort_direction ||= "desc")
      end

      # Set table relation for table grid
      # ralibi
      def sort_relation
        params[:relation] || nil
      end

      # Formulate order by column string. Also handling column from related table
      # ralibi
      def sort_column(mdl = nil)
        if mdl.nil?
          params[:sort] || default_sort
        else
          sort_relation ? (params[:sort] || default_sort) : (mdl.column_names.include?(params[:sort]) ? params[:sort] : default_sort)
        end
      end

      # The result from Rich Table Component manipulation
      def rich_table_component(relation = {}, _sort_column = {}, _sort_direction = nil, pagination = true)

        #puts 'RICH TABLE COMPONENT'
        case relation
        when Hash
          _sort_column = relation[:sort_column]
          _sort_direction = relation[:sort_direction]
          pagination = relation[:pagination] == false ? false : true
          relation = relation[:relation]
          _association_records_count = [relation[:association_records_count]].compact.flatten.collect(&:to_s)
        else
          _association_records_count = nil
          case _sort_column
          when Hash
            _sort_direction = _sort_column[:sort_direction]
            pagination = _sort_column[:pagination] == false ? false : true
            _association_records_count = [_sort_column[:association_records_count]].compact.flatten.collect(&:to_s)
            _sort_column = _sort_column[:sort_column]
          end
        end

        pagination = false if ['application/pdf', 'application/xls'].include? request.format.to_s

        @default_sort = _sort_column.presence || nil
        @sort_direction = _sort_direction
        sort = sort_column
        direction = sort_direction
        _relation_table_name = relation.respond_to?('klass') ? relation.klass.table_name : relation.name.tableize
        @default_sort = nil
        @sort_direction = nil

        order_table_name = _relation_table_name

        if params[:sort_relation].present?
          splitter = params[:sort_relation].index('__').present? ? params[:sort_relation].split('__') : params[:sort_relation].split('.')
          order_table_name = splitter.last.try(:tableize).presence || _relation_table_name
          relation = relation.joins{splitter.inject((splitter.present? ? self : nil), :__send__).outer}
        elsif sort.index('.').present?
          splitter = sort.split('.')
          sort = splitter.pop
          order_table_name = splitter.last.try(:tableize).presence || _relation_table_name
          relation = relation.joins{splitter.inject((splitter.present? ? self : nil), :__send__).outer}
        end
        
        if _association_records_count.present? && _association_records_count.map{|m| "number_of_" + m}.include?(sort)
          index_arc = _association_records_count.map{|m| "number_of_" + m}.index(sort)
          relation = relation.joins{[_association_records_count[index_arc]].inject(([_association_records_count[index_arc]].present? ? self : nil), :__send__).outer}.select("#{_relation_table_name}.*, COUNT(#{_association_records_count[index_arc]}.id) number_of_#{_association_records_count[index_arc]}")
          relation = relation.order("#{sort} #{direction}")      
        else
          relation = relation.order("#{order_table_name}.#{sort} #{direction}")
        end

        if pagination
          params[:page] ||= 1
          params[:per_page] ||= session_per_page
          session[:per_page] = params[:per_page]
          relation = relation.page(params[:page].to_i).per_page(params[:per_page].to_i)
        end

        relation = relation.uniq
        relation
      end

      # Saving object with document by Jquery File Upload
      # document assigned with id from att_from_obj
      def save_documents_with_attached_from(doc_ids, att_from_obj)
        if doc_ids.present?
          doc_ids.collect(&:to_i).each do |document_id|
            document = Document.find(document_id)
            document.attached_from_id = att_from_obj.id
            document.document_type = att_from_obj.class.name.tableize.singularize
            document.save
          end
        end
        @document = Document.new
      end

      # Just providing object document
      # call this method in object that has many documents
      def init_document_upload
        @document = Document.new
      end


      # Group methods for recapitulation
      # -------------------------------
      def get_group_db(splitter, splitter_attr, splitter_time, group_attr, join_model, recapitulation_model)
        group_db = [splitter.last.try('classify').try('constantize').try('table_name'), group_attr].compact.join('.')
        group_db = (group_db.split('.').length > 1) ? group_db : [recapitulation_model.table_name, group_db].join('.')

        if splitter_time.present?
          case join_model.columns_hash[group_attr].type
          when :date
            old_since = splitter_time[2].eql?('old') ? "#{splitter_time[1]}(curdate()) - " : ""

            if old_since.eql?("") && splitter_time[1].eql?('month')
              group_db = "(concat(year(#{group_attr}), '/', LPAD(month(#{group_attr}), 2, '0')  ))" 
            else
              group_db = "(#{old_since}#{splitter_time[1]}(#{group_attr}))"  
            end

            if splitter_time[3].presence
              group_db = "(floor((#{group_db}) / #{splitter_time[3].to_i}))"
            end
          when :datetime
            old_since = splitter_time[2].eql?('old') ? "{splitter_time[1]}(curdate()) - " : ""
            group_db = "(#{old_since}#{splitter_time[1]}(#{group_attr}))"
          else
          end
        end

        group_db
      end

      def get_as_group_db(group_db)
        as_group_db = "#{group_db.to_s.gsub('.', '__')}"
        as_group_db = 'datetime_calculation' if as_group_db.index('curdate').present? || as_group_db.downcase.index('year(').present? || as_group_db.downcase.index('month(').present?
        as_group_db
      end

      def on_operation?
        params[:operation_value].present? && params[:operation_type].present?
      end

      def two_dimension?
        params[:group_row].present? && params[:group_col].present?
      end

      def get_group_data(str_param, recapitulation_model)
        splitter_attr = str_param.split('__')

        splitter = splitter_attr.first.split('.')
        splitter_time = splitter_attr.find{|f| f.first(5).eql?('time.')}.try('split', '.')
        group = splitter.pop
        join_model = splitter.present? ? splitter.last.classify.constantize : recapitulation_model
        group_attr = join_model.columns_hash[group].present? ? group : group + '_id'
        #puts group_attr
        group_attr = join_model.columns_hash[group_attr].present? ? group_attr : group.classify.constantize.table_name.singularize + '_id'
        group_db = get_group_db(splitter, splitter_attr, splitter_time, group_attr, join_model, recapitulation_model)
        splitter_mapping = splitter_attr.find{|f| f.first(8).eql?('mapping.')}.try('split', '.')

        {
          splitter_attr: splitter_attr,
          splitter: splitter,
          splitter_time: splitter_time,
          group: group,
          join_model: join_model,
          group_attr: group_attr,
          group_db: group_db,
          splitter_mapping: splitter_mapping,
          is_id: group_attr.last(3).eql?('_id')
        }
      end

      def get_label_record(group_data, join_table, as_group_db)
        # puts 'GET LABEL RECORD'
        group_data[:is_id] ? group_data[:group].tableize.classify.constantize.where{id.in(join_table.select(group_data[:group_db]).order(group_data[:group_db].to_s + ' ASC').uniq.to_a.collect(&(group_data[:group_attr]).to_sym))} : join_table.select(group_data[:group_db] + ' AS ' + as_group_db).order(as_group_db + ' ASC').uniq
      end

      def get_label_range(group_data, labels)
        if group_data[:splitter_time].present? && group_data[:splitter_time].try('fourth').present?
          lri = labels.to_i
          spli = group_data[:splitter_time][3].to_i
          "#{lri * spli} - #{(lri * spli) + spli - 1}"
        else
          labels
        end
      end

      def get_label_item(group_data, record, as_group_db)
        label_item = ((group_data[:is_id] ? record.to_s : record.try(as_group_db)).to_s.presence || t('unknown'))
      
        # label row for range value like age old or date since
        label_item = get_label_range(group_data, label_item)

        # row mapping
        if group_data[:splitter_mapping].present?
          idx = group_data[:splitter_mapping].index(label_item)
          label_item = group_data[:splitter_mapping][idx + 1].presence || label_item if idx.present?
        end

        label_item
      end


      def generate_recapitulation
        #puts 'GENERATE RECAPITULATION'
        if params[:group_row].present? || params[:group_col].present?
          generate_recapitulation_start
        else
          @recapitulation_error = {message: 'Pilih baris atau kolom terlebih dahulu'}
        end
      end

      def generate_recapitulation_start
        #puts 'START RECAPITULATION'
        recapitulation_model = (params[:rtc_controller_name].presence || controller_name).classify.constantize


        # DATA FETCHING
        # ----------------------------------------------------------------------------------------------------
        # ----------------------------------------------------------------------------------------------------

        # ROW section
        gd_row = get_group_data(params[:group_row].presence || params[:group_col], recapitulation_model)


        if two_dimension?
          # COL section
          gd_col = get_group_data(params[:group_col], recapitulation_model)
        else
          gd_col = {splitter: []}
        end


        #puts 'JOIN TABLE'
        q_join_table = recapitulation_model
                      .joins{gd_row[:splitter].inject((gd_row[:splitter].present? ? self : nil), :__send__)}
                      .joins{gd_col[:splitter].inject((gd_col[:splitter].present? ? self : nil), :__send__)}


        #puts 'CONVERT PRESENT QUEUE'
        if params[:q].present?
          params[:q] = params[:q].each_with_object({}){|i, memo| i.first.to_s.end_with?('_present') && i.last.eql?('0') ? memo[(i.first.to_s[0..-9] + '_blank').to_sym] = '1' : memo[i.first] = i.last}
          @q = q_join_table.search(params[:q])
          join_table = @q.result
        else
          join_table = q_join_table
        end

        # executing query for counting record
        #puts 'COUNTING RECORD'
        recapitulations = join_table.count(group: [gd_row[:group_db], gd_col[:group_db]].compact)
        #puts 'END COUNTING RECORD'


        # executing query for value
        if on_operation?
          recapitulations_operation = nil

          # contruct operation_value
          gd_ov = get_group_data(params[:operation_value], recapitulation_model)

          recapitulations_operation = join_table.sum(gd_ov[:group_db], group: [gd_row[:group_db], gd_col[:group_db]].compact)
        end

        # END DATA FETCHING

        #puts 'END DATA FETCHING'




        # in between




        @label_col = []
        @label_row = []

        @recapitulation_matrix_data = []
        @total_each_col = []
        @total_each_row = []

        # executing query for value
        if on_operation?
          @recapitulation_matrix_data_operation = []
          @total_each_col_operation = []
          @total_each_row_operation = []
        end




        # just make sure the attribute name won't conflict
        as_group_row_db = get_as_group_db(gd_row[:group_db])
        as_group_col_db = get_as_group_db(gd_col[:group_db])

        # executing query for row label, this also let us know the total rows
        rows = get_label_record(gd_row, join_table, as_group_row_db)

        # process column if 2 dimension. (row or column position doesn't important. their order, can be transposed, what matters only 1-D or 2-D)
        if two_dimension?
          cols = get_label_record(gd_col, join_table, as_group_col_db)

          # iterate through cols and asign label only, not including value
          cols.each_with_index do |col, j|
            @total_each_col << 0
            @total_each_col_operation << 0 if on_operation?

            @label_col << get_label_item(gd_col, col, as_group_col_db)
          end
        end







        # DATA PROCESS
        # ----------------------------------------------------------------------------------------------------
        # ----------------------------------------------------------------------------------------------------
        #puts 'DATA PROCESS'

        # iterate through rows and summing up matrix value simultanously
        # rows -> label top-bottom
        rows.each_with_index do |row, i|

          # assign label for each row
          @label_row << get_label_item(gd_row, row, as_group_row_db)

          # hash key in result set, eg. [{a: 5}, {c: 8}] or [{[a, b]: 5}, {[c, d]: 9}]. hash key are a, b, c, and d
          key_row = (row.id.present? ? row.id : row.try(as_group_row_db))
          if two_dimension?
            # 2-dimension
            @recapitulation_matrix_data << []
            @total_each_row << 0
            if on_operation?
              @recapitulation_matrix_data_operation << []
              @total_each_row_operation << 0
            end
            cols.each_with_index do |col, j|
              key_col = (col.id.present? ? col.id : col.try(as_group_col_db))
              cell = recapitulations[[key_row, key_col]].presence || 0
              @recapitulation_matrix_data[i] << cell 
              @total_each_row[i] += cell 
              @total_each_col[j] += cell

              if on_operation?
                cell_operation = (recapitulations_operation[[key_row, key_col]].presence || 0).to_f
                @recapitulation_matrix_data_operation[i] << cell_operation
                @total_each_row_operation[i] += cell_operation 
                @total_each_col_operation[j] += cell_operation
              end
            end
          else
            # 1-dimension
            cell = recapitulations[key_row].presence || 0
            @recapitulation_matrix_data << [cell] 
            @total_each_row << cell 

            @total_each_col = [@total_each_row.inject(0, :+)]
            @label_col = [t('subtotal')]

            if on_operation?
              cell_operation = (recapitulations_operation[key_row].presence || 0).to_f
              @recapitulation_matrix_data_operation << [cell_operation]
              @total_each_row_operation << cell_operation 
              @total_each_col_operation = [@total_each_row_operation.inject(0, :+)]
            end
            
          end

          #  
          @recapitulation_matrix = []
          @recapitulation_matrix_data.each do |rm|
            @recapitulation_matrix << (Array.new(rm))
          end
          @recapitulation_matrix << (Array.new(@total_each_col))
          @recapitulation_matrix.each_with_index do |rmwt, index|
            rmwt << (rmwt.inject(0, :+))
            rmwt.unshift(@label_row[index].presence || t('total'))
          end
          @recapitulation_matrix.unshift([''] + Array.new(@label_col + [t('total')]))

          if on_operation?
            @recapitulation_matrix_operation = []
            @recapitulation_matrix_data_operation.each do |rm|
              @recapitulation_matrix_operation << (Array.new(rm))
            end
            @recapitulation_matrix_operation << (Array.new(@total_each_col_operation))
            @recapitulation_matrix_operation.each_with_index do |rmwt, index|
              rmwt << (rmwt.inject(0, :+))
            end


            # calculate matrix data content
            if params[:operation_type] == 'sum'
              @recapitulation_matrix_operation.each_with_index do |rmoi, i|
                rmoi.each_with_index do |rmoj, j|
                  @recapitulation_matrix[i + 1][j + 1] = @recapitulation_matrix_operation[i][j]
                end
              end
            else # 'average'
              @recapitulation_matrix_operation.each_with_index do |rmoi, i|
                rmoi.each_with_index do |rmoj, j|
                  unless @recapitulation_matrix[i + 1][j + 1] == 0
                    @recapitulation_matrix[i + 1][j + 1] = ((@recapitulation_matrix_operation[i][j].round(2).to_f / @recapitulation_matrix[i + 1][j + 1]).to_f * 100).round / 100.0
                  end
                end
              end
            end

          end


        end # end rows iteration

        # Execute if 1-dimension 
        unless two_dimension?
          @recapitulation_matrix = @recapitulation_matrix.transpose
          recap_shift = @recapitulation_matrix.shift
          @recapitulation_matrix.shift
          @recapitulation_matrix = Array.new([recap_shift] + @recapitulation_matrix)

          # Transpose if needed, depend on row coulumn position
          @recapitulation_matrix = @recapitulation_matrix.transpose if params[:group_row].present?
        end
      end

      # EOF group methods for recapitulation



      def respond_to_remote(act = action_name, obj = instance_variable_get("@#{controller_name}"))
        respond_to do |format|
          case act
          when :create
            flash[:notice] ||= "#{t(obj.class.name.tableize.singularize)} #{t('was_successfully_created')}."
            format.html { redirect_to controller: obj.class.name.tableize, action: :edit, id: obj.id }
          when :update
            flash[:notice] ||= "#{t(obj.class.name.tableize.singularize)} #{t('was_successfully_updated')}."
            format.html { redirect_to controller: obj.class.name.tableize, action: :edit, id: obj.id }
          when :destroy
            flash[:notice] ||= "#{t(obj.class.name.tableize.singularize)} #{t('was_successfully_deleted')}."
            format.html { redirect_to controller: obj.class.name.tableize, action: :index }
          else
            format.html # index.html.erb
          end
          if params[:pgos].eql?('true')
            format.js { render 'index', formats: [:js] }
            format.xls { render 'index' }
          elsif params[:recapitulation].eql?('true')
            if params[:group_row].present? || params[:group_col].present?
              generate_recapitulation
              format.pdf {
                 render pdf: "#{controller_name}",
                    template: "application/recapitulation",
                    layout: 'print/recapitulation.html',  # for pdf.html.erb
                    disposition: 'attachment'
              }
              headers["Content-Disposition"] = "attachment; filename=\"#{controller_name}.xls\"" 
              format.xls { render 'recapitulation' }
            end
            format.js { render 'recapitulation', formats: [:js] }
          else
            format.js { render act, formats: [:js] }
            format.xls
            format.pdf {
               render pdf: "#{controller_name}",
                  template: lookup_context.exists?("#{controller_path}/index") ? "#{controller_path}/index" : "application/index",
                  layout: 'print/pdf.html',  # for pdf.html.erb
                  disposition: 'attachment'
            }
          end
          format.json { render json: obj }
        end
      end

      def format_remote(format, act = action_name, obj = instance_variable_get("@#{controller_name}"), html_redirect = nil)
        case act
        when :create
          flash[:notice] ||= "#{t(obj.class.name.tableize.singularize)} #{t('was_successfully_created')}."
          format.html { redirect_to controller: obj.class.name.tableize, action: html_redirect.presence || :edit, id: obj.id }
        when :update
          flash[:notice] ||= "#{t(obj.class.name.tableize.singularize)} #{t('was_successfully_updated')}."
          format.html { redirect_to controller: obj.class.name.tableize, action: html_redirect.presence || :edit, id: obj.id }
        else
          format.html { render action: act }
        end
        format.js { render act, formats: [:js] }
        format.json { render json: obj }
      end



      def notification_meta record, opts={}
        (record.notification_meta ||= {current_user: current_user}).merge! opts if record.respond_to? :notification_meta
      end

      # Set parent resource of the current resource
      # Used in breadcrumbs
      def set_parent_resources(*args)
        args.each_with_index do |pr, i|
          pr_singular = pr.singularize
          pr_id = params["#{pr_singular}_id"]

          if pr_id.blank? && i == 0
            controller_object = controller_name.classify.constantize.where{id.eq(my{params[:id]})}.first
            if controller_object.present? && controller_object.respond_to?(pr_singular.to_sym)
              pr_id = controller_object.send("#{pr_singular}_id")
            end
          end

          if pr_id.present?
            @parent_resources ||= []
            @parent_resources << pr
            pr_object = pr.classify.constantize.find(pr_id)
            instance_variable_set("@#{pr_singular}", pr_object)
          elsif i > 0
            prev_pr = args[i - 1]
            prev_pr_singular = prev_pr.singularize
            prev_pr_id = params["#{prev_pr_singular}_id"].presence || instance_variable_get("@#{prev_pr_singular}").try(:id)
            if prev_pr_id.present?
              prev_pr_object = prev_pr.classify.constantize.find(prev_pr_id)
              if prev_pr_object.respond_to? pr_singular.to_sym
                pr_id = prev_pr_object.send("#{pr_singular}_id")
                if pr_id.present?
                  @parent_resources ||= []
                  @parent_resources << pr
                  pr_object = pr.classify.constantize.find(pr_id)
                  instance_variable_set("@#{pr_singular}", pr_object)
                end
              end
            end
          end
        end
      end






  end


  class Engine < ::Rails::Engine

    initializer 'rich_table_compoenent.setup_helpers' do |app|
      app.config.to_prepare do
        ActionController::Base.send :helper, ComponentHelper
        ActionController::Base.send :helper, ParagraphHelper
        ActionController::Base.send :helper, TranslationsHelper
        ActionController::Base.send :helper, MenusHelper
        ActionController::Base.send :helper, DocumentsHelper

        ActionController::Base.send :include, RichTableComponent::Controller


      end
    end
  end



end




