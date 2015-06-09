module.exports = function(grunt) {

    // 自动分析package.json文件，自动加载所找到的grunt模块
    require('load-grunt-tasks')(grunt);

    // 项目配置
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            compass: {
                files: ['./sass/{*,*/}*.scss'],
                tasks: ['compass:main']
            }
        },
        compass: {
            main: {
                options: {
                    http_path: "/",
                    sassDir: 'sass',
                    cssDir: 'css',
                    imagesDir: 'images',
                    relativeAssets: true,
                    noLineComments: true,
                    assetCacheBuster: false
                }
            }
        }
    });

    grunt.registerTask('default', ['watch']);
};