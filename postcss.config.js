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
            content: ['public/**/*.html', 'src/**/*.vue', 'src/**/*.ts', 'node_modules/portland-pattern-lab/**/*.vue'],
            defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
          })
        : false
    ]
  };
};
