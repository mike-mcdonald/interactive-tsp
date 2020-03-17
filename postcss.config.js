module.exports = ({ file, options, env }) => {
  return {
    plugins: [
      require('tailwindcss'),
      require('autoprefixer'),
      require('cssnano')({
        preset: 'default'
      }),
      options.mode === 'production'
        ? require('@fullhuman/postcss-purgecss')({
            // Specify the paths to all of the template files in your project
            content: [
              './src/**/*.html',
              './src/**/*.vue',
              './src/**/*.ts',
              './src/**/*.js',
              'node_modules/portland-pattern-lab/**/*.vue'
            ],

            // Include any special characters you're using in this regular expression
            defaultExtractor: content => content.match(/[\w-/:()]+(?<!:)/g) || []
          })
        : false
    ]
  };
};
