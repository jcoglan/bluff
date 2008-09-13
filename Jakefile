require 'fileutils'

jake :after_build do |build|
  FileUtils.cp build.package('bluff').build_path('min'), 'site/site/javascripts/bluff.js'
end
