require 'fileutils'

jake_hook :build_complete do |build|
  # Copy Bluff to website directory
  FileUtils.mkdir_p 'site/site/javascripts'
  FileUtils.cp build.package('bluff').build_path('min'), 'site/site/javascripts/bluff.js'
  
  # Copy supporting files to build dir
  FileUtils.cp 'test/class.js', build.build_directory + '/js-class.js'
  FileUtils.cp 'test/excanvas-compressed.js', build.build_directory + '/excanvas.js'
  
  %w[GPL-LICENSE.txt MIT-LICENSE.txt CHANGELOG.txt].each do |doc|
    FileUtils.cp doc, build.build_directory + '/' + doc
  end
  
  # Copy supporting files to website
  FileUtils.cp 'test/class.js', 'site/site/javascripts/js-class.js'
  FileUtils.cp 'test/excanvas-compressed.js', 'site/site/javascripts/excanvas.js'
end
