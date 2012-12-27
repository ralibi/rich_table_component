module TranslationsHelper
  # Just return an empty string if the given date is null
  def ldate(dt)
    dt ? dt.strftime('%d-%m-%Y') : ''
  end
  def mdate(dt)
    dt ? l(dt.to_date) : ''
  end
end
