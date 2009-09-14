require 'fileutils'

jake_hook :build_complete do |build|
  # Copy Bluff to website directory
  FileUtils.cp build.package('bluff').build_path('min'), 'site/site/javascripts/bluff.js'
  
  # Copy supporting files to build dir
  FileUtils.cp 'test/class.js', build.build_directory + '/js-class.js'
  FileUtils.cp 'test/excanvas-compressed.js', build.build_directory + '/excanvas.js'
  FileUtils.cp 'MIT-LICENSE', build.build_directory + '/MIT-LICENSE'
  FileUtils.cp 'CHANGELOG', build.build_directory + '/CHANGELOG'
  
  # Copy supporting files to website
  FileUtils.cp 'test/class.js', 'site/site/javascripts/js-class.js'
  FileUtils.cp 'test/excanvas-compressed.js', 'site/site/javascripts/excanvas.js'
end
