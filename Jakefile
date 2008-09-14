require 'fileutils'

jake :after_build do |build|
  FileUtils.cp build.package('bluff').build_path('min'), 'site/site/javascripts/bluff.js'
  FileUtils.cp 'test/class.js', build.build_directory + '/js-class.js'
  FileUtils.cp 'test/excanvas-compressed.js', build.build_directory + '/excanvas.js'
  FileUtils.cp 'MIT-LICENSE', build.build_directory + '/MIT-LICENSE'
end
