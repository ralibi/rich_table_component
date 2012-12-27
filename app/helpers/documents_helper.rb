module DocumentsHelper
  
  # Return document thumbnail/icon
  def document_image_tag(document)
    if !(document.attachment.content_type =~ /^image/).nil? 
      image_tag document.attachment(:micro)
    else
      image_tag 'icons/file_extension/file_extension_' + (Document::FILE_EXTENSION_ICON[document.attachment.content_type].presence || '') + '.png'
    end
  end

  # Return document thumbnail/icon
  def document_image_path(document)
    if !(document.attachment.content_type =~ /^image/).nil? 
      document.attachment(:micro)
    else
      '/assets/icons/file_extension/file_extension_' + (Document::FILE_EXTENSION_ICON[document.attachment.content_type].presence || '') + '.png'
    end
  end

  
end
