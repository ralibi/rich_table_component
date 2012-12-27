# -*- encoding: utf-8 -*-
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'rich_table_component/version'

Gem::Specification.new do |gem|
  gem.name          = "rich_table_component"
  gem.version       = RichTableComponent::VERSION
  gem.authors       = ["ralibi"]
  gem.email         = ["ralibi@starqle.com"]
  gem.description   = %q{Rich Table Component with advanced search, export file, and generate recapitulation}
  gem.summary       = %q{Just what the description said}
  gem.homepage      = "http://starqle.com/"

  gem.files         = `git ls-files`.split($/)
  gem.executables   = gem.files.grep(%r{^bin/}).map{ |f| File.basename(f) }
  gem.test_files    = gem.files.grep(%r{^(test|spec|features)/})
  gem.require_paths = ["lib"]
  
  gem.add_dependency 'sass-rails'
  gem.add_dependency 'less-rails'
  gem.add_dependency 'haml-rails'
  gem.add_dependency 'cancan'
  gem.add_dependency 'paperclip'
  gem.add_dependency 'ckeditor'
  gem.add_dependency 'ransack'
  gem.add_dependency 'squeel'
  gem.add_dependency 'simple_form'
  gem.add_dependency 'redis'
  gem.add_dependency 'will_paginate'
  gem.add_dependency 'wicked_pdf'

  gem.add_dependency 'compass-rails'  
  gem.add_dependency 'twitter-bootstrap-rails'
end
