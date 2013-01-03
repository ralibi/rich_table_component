module RichTableComponent
  module CoreExtensions
    module String
      def to_bool
        return true if [:true, 'true', '1', 'yes', 'on', 't'].include? self
        return false if [:false, 'false', '0', 'no', 'off', 'f'].include? self
        return nil
      end
    end
  end
end

class String
  include RichTableComponent::CoreExtensions::String
end


module Enumerable
  def clean
    dup.clean!
  end

  def clean!
    reject! do |item|
      obj = is_a?(Hash) ? self[item] : item

      if obj.respond_to?(:reject!)
        obj.clean!
        obj.blank?
      else
        obj.blank? && !obj.is_a?(FalseClass)
      end
    end
    self
  end
end